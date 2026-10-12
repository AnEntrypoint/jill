#!/usr/bin/env node
// UserPromptSubmit hook: the PRE-BUDGET half of the jill compaction strategy.
//
// Claude Code runs this on every user prompt with {session_id, transcript_path, cwd,
// hook_event_name, prompt} on stdin. Plain stdout on UserPromptSubmit is added to the context
// the model sees, so this is where a reminder can actually reach the agent before the wall.
//
// CLM gives its model "an editing reminder 2,048 tokens before the budget"; its base harness has
// no trigger at all. The port in references/compaction.md only fires at the cut (PreCompact) and
// after it (SessionStart compact), so the boundary question is asked too late - the veto section
// of that same file warns that "a veto written when the context is already failing is too late"
// without providing a mechanism. This is the mechanism:
//
//   1. read the real budget from ~/.claude/settings.json - autoCompactWindow, overridden by
//      modelSettings.<model>.autoCompactWindow,
//   2. measure the real context from the transcript's own message.usage counters, never from an
//      estimate (CLM Appendix G),
//   3. when the measured context is within LEAD tokens of the budget, print one short line
//      telling the agent to run the boundary pass now.
//
// The line is injected on every matching turn, so every token of it is paid repeatedly: it stays
// under ~200 tokens and carries the command to run rather than prose about why.
//
// Fail open: any error prints nothing and exits 0, so a prompt is never blocked by this hook.
//   JILL_PRESSURE_LEAD_TOKENS=<n>  fire n tokens before the budget (default 2048, CLM's number)
//   JILL_PRESSURE_DEBUG=1          send a trace to stderr

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
if (process.env.JILL_HOOKS_DISABLED === '1') process.exit(0); // set when a plugin install already wired these
const CTX_DIR = path.join(HOME, '.claude', 'context');
const SETTINGS = path.join(HOME, '.claude', 'settings.json');
const TAIL_BYTES = 8 * 1024 * 1024;
const DEFAULT_LEAD = 2048; // CLM: the editing reminder is delivered 2,048 tokens before the budget

function debug(why, err) {
  if (!process.env.JILL_PRESSURE_DEBUG) return;
  process.stderr.write('pressure-reminder: ' + why + (err ? '\n' + (err.stack || err) : '') + '\n');
}

function read(p) {
  try {
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  } catch (e) {
    return '';
  }
}

function readStdin() {
  return new Promise(resolve => {
    let d = '';
    process.stdin.on('data', c => (d += c));
    process.stdin.on('end', () => resolve(d));
  });
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

// The budget is per model: modelSettings.<model>.autoCompactWindow overrides the top level. The
// transcript carries the model the session is actually running (requestedModel is the id the
// user configured, message.model is the id the API answered with), so no payload field is needed.
function resolveWindow(settings, model) {
  const ms = settings && settings.modelSettings;
  if (model && ms) {
    for (const k of [model, 'claude-' + model]) {
      const v = ms[k] && ms[k].autoCompactWindow;
      if (typeof v === 'number' && v > 0) return v;
    }
  }
  const top = settings && settings.autoCompactWindow;
  return typeof top === 'number' && top > 0 ? top : 0;
}

function scanTranscript(transcript) {
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
  let model = '';
  let measured = 0; // most recent real context: what the API was sent, cache included
  for (const r of rows) {
    if (!model) {
      if (typeof r.requestedModel === 'string' && r.requestedModel) model = r.requestedModel;
      else if (r.message && typeof r.message.model === 'string' && r.message.model) model = r.message.model;
    }
    const u = (r.message && r.message.usage) || {};
    const t = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
    if (t) measured = t; // last non-zero wins: after a cut the transcript restarts low
  }
  return { model, measured };
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
  const transcript = input.transcript_path;
  if (!transcript || !fs.existsSync(transcript)) return debug('no transcript, nothing measured');

  let settings = null;
  try {
    settings = JSON.parse(read(SETTINGS).replace(/^﻿/, ''));
  } catch (e) {
    return debug('settings unreadable', e);
  }

  let model = '';
  let measured = 0;
  try {
    const s = scanTranscript(transcript);
    model = s.model;
    measured = s.measured;
  } catch (e) {
    return debug('transcript read failed', e);
  }
  if (!measured) return debug('no usage counters, context unknown');

  const window = resolveWindow(settings, model);
  if (!window) return debug('no autoCompactWindow configured');

  const lead = parseInt(process.env.JILL_PRESSURE_LEAD_TOKENS || '', 10);
  const leadTokens = isFinite(lead) && lead > 0 ? lead : DEFAULT_LEAD;
  const threshold = window - leadTokens;
  debug('model=' + model + ' measured=' + measured + ' window=' + window + ' threshold=' + threshold);
  if (measured < threshold) return debug('under threshold, silent');

  process.stdout.write(
    'JILL PRESSURE: context ' +
      measured +
      '/' +
      window +
      ' tokens (threshold ' +
      threshold +
      '). Run the jill boundary pass NOW, not at the cut: answer in_flight / when / confidence for this turn and write it with\n' +
      'node ' +
      path.join(HOME, '.claude', 'hooks', 'boundary-write.js') +
      ' ' +
      sid +
      ' <now|next_boundary|not_this_turn> <confidence> [boundary] [in_flight]\n' +
      'A veto written at the wall is too late - an unfinished subtask beats an oversized context. Refresh ' +
      path.join(CTX_DIR, 'needles-' + sid + '.md') +
      ' before the cut.\n'
  );
}

main().catch(e => {
  debug('uncaught', e);
  process.exit(0);
});
