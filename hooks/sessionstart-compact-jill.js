#!/usr/bin/env node
// SessionStart hook, matcher "compact": the INJECT half of the jill compaction strategy.
//
// SessionStart with matcher "compact" is the documented event whose plain stdout is added to
// the compacted context. PreCompact cannot inject - it can only observe, prepare and veto - so
// this hook is where the surviving context actually comes back after a cut.
//
// It prints, in order and under a token budget:
//   1. the jill compaction steering (so it does not depend on CLAUDE.md being re-read),
//   2. the live context file, if the model has been maintaining one,
//   3. the directive the PreCompact hook wrote (paths, measured size, inventory),
//   4. the needle manifest, if one exists.
//
// Fail open: any error prints nothing and exits 0, so a compaction with no jill state in it
// behaves exactly like a plain compaction.
//   JILL_SESSIONSTART_DEBUG=1 sends a trace to stderr.

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
if (process.env.JILL_HOOKS_DISABLED === '1') process.exit(0); // set when a plugin install already wired these
const CTX_DIR = path.join(HOME, '.claude', 'context');
const MAX_CHARS = 12000;

function debug(why, err) {
  if (!process.env.JILL_SESSIONSTART_DEBUG) return;
  process.stderr.write('sessionstart-compact-jill: ' + why + (err ? '\n' + (err.stack || err) : '') + '\n');
}

function readStdin() {
  return new Promise(resolve => {
    let d = '';
    process.stdin.on('data', c => (d += c));
    process.stdin.on('end', () => resolve(d));
  });
}

function read(p) {
  try {
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  } catch (e) {
    return '';
  }
}

const STEERING = [
  'JILL COMPACTION STEERING (re-injected after the cut)',
  '- The live context file is stated below. Rewrite it in place; never append to it.',
  '- Before every rewrite, back it up under ~/.claude/context/compaction_backup/<session>/ and',
  '  never overwrite or delete an earlier backup.',
  '- Only compress at the boundaries of subtasks. Once a subtask is done, its material goes.',
  '- Never drop a needle: an identifier, path, number or commitment the rest of the task',
  '  depends on survives verbatim.',
  '- A block whose disposition is unknown is kept. Failure always opens toward retention.'
].join('\n');

async function main() {
  let raw = '';
  try {
    raw = await readStdin();
  } catch (e) {
    /* stdin is optional here */
  }
  let input = {};
  try {
    input = JSON.parse((raw || '{}').replace(/^﻿/, ''));
  } catch (e) {
    input = {};
  }
  const sid = input.session_id || process.env.CLAUDE_SESSION_ID || 'unknown';
  debug('sid=' + sid);

  // A live context file for this session; otherwise the newest one, so a session that has not
  // yet named itself still gets its own file back.
  let live = path.join(CTX_DIR, 'LIVE_CTX_' + sid + '.md');
  if (!fs.existsSync(live)) {
    try {
      const newest = fs
        .readdirSync(CTX_DIR)
        .filter(f => /^LIVE_CTX_.*\.md$/.test(f))
        .map(f => ({ f, t: fs.statSync(path.join(CTX_DIR, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t)[0];
      if (newest) live = path.join(CTX_DIR, newest.f);
    } catch (e) {
      /* CTX_DIR may not exist yet */
    }
  }

  const parts = [STEERING, 'live: ' + live];
  const body = read(live);
  if (body) parts.push('LIVE CONTEXT (verbatim)\n' + body);

  let directive = read(path.join(CTX_DIR, 'directive-' + sid + '.md'));
  if (!directive) {
    try {
      const newest = fs
        .readdirSync(CTX_DIR)
        .filter(f => /^directive-.*\.md$/.test(f))
        .map(f => ({ f, t: fs.statSync(path.join(CTX_DIR, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t)[0];
      if (newest) directive = read(path.join(CTX_DIR, newest.f));
    } catch (e) {
      /* ignore */
    }
  }
  if (directive) parts.push(directive.trim());

  const needles = read(path.join(CTX_DIR, 'needles-' + sid + '.md'));
  if (needles) parts.push('NEEDLES (never drop)\n' + needles.trim());

  const out = parts.join('\n\n');
  process.stdout.write(out.length > MAX_CHARS ? out.slice(0, MAX_CHARS) + '\n[truncated]' : out + '\n');
}

main().catch(e => {
  debug('uncaught', e);
  process.exit(0);
});
