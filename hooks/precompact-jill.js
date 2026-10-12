#!/usr/bin/env node
// PreCompact hook: the PREPARE and VETO half of the jill compaction strategy.
//
// Claude Code runs this before a compaction with {trigger, custom_instructions, session_id,
// transcript_path, cwd} on stdin. A PreCompact hook cannot inject anything into the
// compaction: `systemMessage` and `continue` are discarded, plain stdout goes to the debug log
// only, and `additionalContext` is not a documented output of this event. What it can do is
// observe, prepare and veto. So this hook:
//
//   1. reads the transcript's own usage counters, so every later stage works from a MEASURED
//      context size instead of a model guess (CLM Appendix G: length estimation degrades badly
//      at long contexts; a Claude Code transcript already carries the true number),
//   2. builds a block inventory with stable ids and per-block sizes, written to disk,
//   3. backs up the live context file before anything can overwrite it,
//   4. vetoes an automatic compaction that the jill boundary pass said was badly timed.
//
// The injection half lives in hooks/sessionstart-compact-jill.js, because SessionStart with
// matcher "compact" is the documented event whose stdout is added to the compacted context.
//
// Fail open: any error prints nothing and exits 0, so the default compaction still runs.
//   JILL_PRECOMPACT_DEBUG=1 sends a trace to stderr.

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
if (process.env.JILL_HOOKS_DISABLED === '1') process.exit(0); // set when a plugin install already wired these
const CTX_DIR = path.join(HOME, '.claude', 'context');
const BACKUP_DIR = path.join(CTX_DIR, 'compaction_backup');
const TAIL_BYTES = 8 * 1024 * 1024;
const HEAD_CHARS = 90;
const VETO_FRESH_MS = 10 * 60 * 1000;

function debug(why, err) {
  if (!process.env.JILL_PRECOMPACT_DEBUG) return;
  process.stderr.write('precompact-jill: ' + why + (err ? '\n' + (err.stack || err) : '') + '\n');
}

function readStdin() {
  return new Promise(resolve => {
    let d = '';
    process.stdin.on('data', c => (d += c));
    process.stdin.on('end', () => resolve(d));
  });
}

function textLen(content) {
  if (typeof content === 'string') return content.length;
  if (Array.isArray(content)) return content.reduce((n, c) => n + ((c && c.text && c.text.length) || 0), 0);
  return 0;
}

function firstText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    for (const c of content) if (c && c.type === 'text' && c.text) return c.text;
  }
  return '';
}

function head(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, HEAD_CHARS);
}

function readTailLines(file) {
  const size = fs.statSync(file).size;
  const start = Math.max(0, size - TAIL_BYTES);
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(size - start);
  fs.readSync(fd, buf, 0, buf.length, start);
  fs.closeSync(fd);
  const lines = buf.toString('utf8').split('\n');
  if (start > 0) lines.shift(); // the tail opens mid-line
  return lines;
}

// One block per assistant turn, plus one per user turn that carries text. Tool results are
// charged to the block they answer. This is the granularity jill decides over: an assistant
// turn is what a compaction can actually cut.
function buildBlocks(rows) {
  const blocks = [];
  const open = b => {
    blocks.push(b);
    return b;
  };
  let cur = null;
  for (const r of rows) {
    if (r.type !== 'user' && r.type !== 'assistant') continue;
    const m = r.message || {};
    const content = m.content;

    if (r.type === 'user') {
      const texts = [];
      let toolChars = 0;
      if (typeof content === 'string') texts.push(content);
      else if (Array.isArray(content)) {
        for (const c of content) {
          if (!c) continue;
          if (c.type === 'text') texts.push(c.text || '');
          else if (c.type === 'tool_result') toolChars += textLen(c.content);
        }
      }
      if (texts.length) {
        cur = open({
          id: 'b' + (blocks.length + 1),
          uuid: r.uuid,
          kind: 'user',
          sidechain: !!r.isSidechain,
          ts: r.timestamp,
          tokens: 0,
          chars: texts.join(' ').length + toolChars,
          head: head(texts.join(' '))
        });
      } else if (toolChars && cur) {
        cur.chars += toolChars;
      }
      continue;
    }

    const u = m.usage || {};
    const prompt =
      (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
    cur = open({
      id: 'b' + (blocks.length + 1),
      uuid: r.uuid,
      kind: 'turn',
      sidechain: !!r.isSidechain,
      ts: r.timestamp,
      tokens: prompt,
      chars: 0,
      head: head(firstText(content)) || head(toolNames(content))
    });
    if (Array.isArray(content)) {
      for (const c of content) {
        if (!c) continue;
        if (c.type === 'text') cur.chars += (c.text || '').length;
        else if (c.type === 'thinking') cur.chars += (c.thinking || '').length;
        else if (c.type === 'tool_use') cur.chars += JSON.stringify(c.input || {}).length;
      }
    }
  }
  return blocks;
}

function toolNames(content) {
  if (!Array.isArray(content)) return '';
  return content
    .filter(c => c && c.type === 'tool_use')
    .map(c => c.name)
    .join(' ');
}

function backupLive(sid) {
  const live = path.join(CTX_DIR, 'LIVE_CTX_' + sid + '.md');
  if (!fs.existsSync(live)) return { live, backup: null };
  const dir = path.join(BACKUP_DIR, sid);
  fs.mkdirSync(dir, { recursive: true });
  const n = fs.readdirSync(dir).length + 1;
  const backup = path.join(dir, n + '-' + Date.now() + '.md');
  fs.copyFileSync(live, backup);
  return { live, backup };
}

// The jill boundary pass writes this. Only an automatic compaction is ever vetoed: a manual
// /compact is the user asking, and vetoing that is refusing the request.
function shouldVeto(sid, trigger) {
  if (trigger !== 'auto') return null;
  const f = path.join(CTX_DIR, 'decision-' + sid + '.json');
  if (!fs.existsSync(f)) return null;
  let d;
  try {
    d = JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    return null;
  }
  if (d.when !== 'not_this_turn') return null;
  if (typeof d.confidence === 'number' && d.confidence < 0.6) return null;
  if (typeof d.ts === 'number' && Date.now() - d.ts > VETO_FRESH_MS) return null;
  return d;
}

async function main() {
  let raw = '';
  try {
    raw = await readStdin();
  } catch (e) {
    return debug('stdin failed', e);
  }
  let input = {};
  try {
    input = JSON.parse((raw || '{}').replace(/^﻿/, ''));
  } catch (e) {
    return debug('bad input json', e);
  }
  const sid = input.session_id || 'unknown';
  const trigger = input.trigger || 'auto';
  const transcript = input.transcript_path;
  debug('trigger=' + trigger + ' transcript=' + transcript);
  if (!transcript || !fs.existsSync(transcript)) return debug('no transcript, nothing to prepare');

  let blocks = [];
  let measured = 0;
  try {
    const rows = readTailLines(transcript)
      .filter(l => l.trim())
      .map(l => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
    blocks = buildBlocks(rows);
    for (const r of rows) {
      const u = (r.message && r.message.usage) || {};
      const t = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
      if (t) measured = Math.max(measured, t);
    }
  } catch (e) {
    return debug('read/parse failed', e);
  }
  debug('blocks=' + blocks.length + ' measured=' + measured);
  if (!blocks.length) return debug('no blocks');

  let live = path.join(CTX_DIR, 'LIVE_CTX_' + sid + '.md');
  let backup = null;
  try {
    fs.mkdirSync(CTX_DIR, { recursive: true });
    const b = backupLive(sid);
    live = b.live;
    backup = b.backup;
  } catch (e) {
    debug('backup failed (non-fatal)', e);
  }

  const blocksDir = path.join(CTX_DIR, 'blocks', sid);
  try {
    fs.mkdirSync(blocksDir, { recursive: true });
    fs.writeFileSync(path.join(blocksDir, 'blocks.jsonl'), blocks.map(b => JSON.stringify(b)).join('\n') + '\n');
    fs.writeFileSync(
      path.join(blocksDir, 'blocks.txt'),
      blocks.map(b => b.id + ' ' + b.head.replace(/\|/g, '/')).join('\n') + '\n'
    );
  } catch (e) {
    debug('inventory write failed (non-fatal)', e);
  }

  const veto = shouldVeto(sid, trigger);
  const est = blocks.reduce((n, b) => n + (b.tokens || Math.round(b.chars / 4)), 0);
  const directive = [
    'JILL COMPACTION DIRECTIVE (context size measured from the transcript, not estimated)',
    'live: ' + live,
    'backup: ' + (backup || 'none yet - the live file did not exist'),
    'blocks: ' + blocks.length + '  context tokens: ' + (measured || est),
    'inventory: ' + path.join(blocksDir, 'blocks.txt'),
    'rules: only compress at the boundaries of subtasks. A needle - an identifier, path, number',
    'or commitment the rest of the task depends on - survives verbatim. A block is evicted only',
    'when it is recoverable from a file, git or one tool call. An unknown block is kept.',
    veto ? 'veto: ' + JSON.stringify(veto) : 'veto: none'
  ].join('\n');

  try {
    fs.writeFileSync(path.join(CTX_DIR, 'directive-' + sid + '.md'), directive + '\n');
  } catch (e) {
    debug('directive write failed (non-fatal)', e);
  }
  process.stdout.write(directive + '\n'); // debug log only on this event; the file is what is read back

  if (veto) {
    // Exit 2 blocks compaction. Skipping a proactive auto-compact leaves the conversation
    // uncompacted; skipping one that was recovering from a context-limit error surfaces that
    // error, so a veto is only ever written for a boundary the pass actually measured.
    process.stderr.write(
      'jill: compaction vetoed at ' +
        (veto.boundary || 'this turn') +
        ' - unfinished reasoning is in flight (confidence ' +
        veto.confidence +
        '). The cut will happen at the next subtask boundary.'
    );
    process.exit(2);
  }
}

main().catch(e => {
  debug('uncaught', e);
  process.exit(0);
});
