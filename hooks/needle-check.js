#!/usr/bin/env node
// Needle retention check (ContextBench task 1, ported): MEASURE, never decide.
//
//   node hooks/needle-check.js <session_id> [--before <n>] [--after <n>|live] [--transcript <path>]
//
// Context Language Models (arXiv:2609.37725v1) are scored on ContextBench, whose first task is
// Needle Retention: does a fact the rest of the task depends on survive a context edit verbatim?
// references/compaction.md makes that claim ("never drop a needle") and defines the evolution
// reward as needles retained per token spent. Neither is computable without a measurement, so
// this script is the measurement, taken from state a real session already left on disk:
//
//   before  = ~/.claude/context/compaction_backup/<session_id>/<n>-<ts>.md   (default: newest n)
//   after   = ~/.claude/context/LIVE_CTX_<session_id>.md                     (default), or <n>
//   needles = ~/.claude/context/needles-<session_id>.md                      (one fact per line)
//
// A needle counts as retained when its line occurs verbatim in the after text. Verbatim is the
// whole claim, so a paraphrase is counted as lost even when the underlying fact survived. That
// is strict on purpose: read `lost` as "the string is gone", not as "the model forgot".
//
// Tokens come from the transcript's own message.usage counters, never from an estimate (CLM
// Appendix G). tokens_before is the largest context measured at or before the cut;
// tokens_after is the first context measured at or after it, which is the context the cut left.
//
// This script answers no question and makes no decision. It is instrumentation.
//
// Fail open: nothing on stdout and exit 0 on any error, so a caller that pipes this into a
// decision never sees a half-written report.
//   JILL_NEEDLE_DEBUG=1 sends a trace to stderr.  JILL_TRANSCRIPT_PATH overrides the lookup.

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
if (process.env.JILL_HOOKS_DISABLED === '1') process.exit(0); // set when a plugin install already wired these
const CTX_DIR = path.join(HOME, '.claude', 'context');
const BACKUP_DIR = path.join(CTX_DIR, 'compaction_backup');
const PROJECTS_DIR = path.join(HOME, '.claude', 'projects');
const TAIL_BYTES = 8 * 1024 * 1024;
const MAX_DIRS = 4000;
const MAX_NEEDLE_CHARS = 200;
const MAX_DERIVED_NEEDLES = 40;

function debug(why, err) {
  if (!process.env.JILL_NEEDLE_DEBUG) return;
  process.stderr.write('needle-check: ' + why + (err ? '\n' + (err.stack || err) : '') + '\n');
}

function read(p) {
  try {
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  } catch (e) {
    return '';
  }
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

// Backups are <n>-<ts>.md. n orders the cuts; ts is what aligns a backup with the transcript.
// Some ts values were written as seconds, so anything below 1e12 is promoted to milliseconds.
function backupTs(name) {
  const m = /^\d+-([0-9.]+)\.md$/.exec(name);
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (!isFinite(v)) return null;
  return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
}

function listBackups(sid) {
  const dir = path.join(BACKUP_DIR, sid);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .map(f => {
      const m = /^(\d+)-/.exec(f);
      return m ? { n: parseInt(m[1], 10), file: path.join(dir, f), ts: backupTs(f) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.n - b.n);
}

// One fact per line. Bullets, numbering and comment markers are structure, not fact.
function parseNeedles(text) {
  const out = [];
  for (const raw of String(text || '').split('\n')) {
    const line = raw.replace(/^\s*[-*+]\s*/, '').replace(/^\s*\d+[.)]\s*/, '').trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    if (line.length > MAX_NEEDLE_CHARS) continue;
    if (!out.includes(line)) out.push(line);
  }
  return out;
}

// No manifest: fall back to the identifier-bearing lines of the before state, and say so in the
// report. Derived needles are a weaker instrument - they are whatever the file happened to
// carry, not what the caller declared must survive.
function deriveNeedles(text) {
  const out = [];
  for (const raw of String(text || '').split('\n')) {
    const line = raw.replace(/^\s*[-*+]\s*/, '').replace(/^\s*\d+[.)]\s*/, '').trim();
    if (!line || line.startsWith('#') || line.length > MAX_NEEDLE_CHARS) continue;
    if (!/[A-Za-z_]:[\\/]|[~.]?\/|\b[A-Za-z0-9_-]+\.(js|json|md|ts|rs|py)\b|\b[A-Za-z0-9]{6,}-[A-Za-z0-9-]{4,}|\b\d{4,}\b/.test(line)) continue;
    if (!out.includes(line)) out.push(line);
    if (out.length >= MAX_DERIVED_NEEDLES) break;
  }
  return out;
}

function findTranscript(sid) {
  if (process.env.JILL_TRANSCRIPT_PATH) return process.env.JILL_TRANSCRIPT_PATH;
  if (!fs.existsSync(PROJECTS_DIR)) return null;
  const target = sid + '.jsonl';
  const stack = [PROJECTS_DIR];
  let seen = 0;
  while (stack.length && seen < MAX_DIRS) {
    const dir = stack.pop();
    seen++;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!e.name.startsWith('.')) stack.push(p);
      } else if (e.name === target) {
        return p;
      }
    }
  }
  return null;
}

// The measured context of one row: what the API was actually sent, cache included.
function usageOf(row) {
  const u = (row.message && row.message.usage) || {};
  return {
    t: Date.parse(row.timestamp),
    input: u.input_tokens || 0,
    sum: (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)
  };
}

function measure(transcript) {
  let rows;
  try {
    rows = readTailLines(transcript)
      .filter(l => l.trim())
      .map(l => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    return debug('transcript read failed', e), [];
  }
  const pts = rows
    .filter(r => r.type === 'assistant' && r.timestamp && r.message && r.message.usage)
    .map(usageOf)
    .filter(p => isFinite(p.t))
    .sort((a, b) => a.t - b.t);
  return pts;
}

// Largest context reached at or before ts: what the cut was taken against.
function peakAtOrBefore(pts, ts) {
  let input = 0;
  let sum = 0;
  for (const p of pts) {
    if (p.t > ts) break;
    if (p.input > input) input = p.input;
    if (p.sum > sum) sum = p.sum;
  }
  return { input, sum };
}

// First context measured at or after ts: what the cut left behind.
function firstAtOrAfter(pts, ts) {
  for (const p of pts) if (p.t >= ts && p.input > 0) return { input: p.input, sum: p.sum };
  return peakAtOrBefore(pts, ts);
}

function main() {
  const argv = process.argv.slice(2);
  let sid = null;
  let beforeArg = null;
  let afterArg = null;
  let transcriptArg = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--before') beforeArg = argv[++i];
    else if (a === '--after') afterArg = argv[++i];
    else if (a === '--transcript') transcriptArg = argv[++i];
    else if (!a.startsWith('-')) sid = a;
  }
  if (!sid) {
    if (process.env.JILL_NEEDLE_DEBUG) {
      process.stderr.write('usage: needle-check.js <session_id> [--before <n>] [--after <n>|live] [--transcript <path>]\n');
    }
    return;
  }

  const backups = listBackups(sid);
  if (!backups.length) return debug('no backups for ' + sid);

  const pick = arg => {
    if (arg === null || arg === undefined) return backups[backups.length - 1];
    if (arg === 'last' || arg === 'newest') return backups[backups.length - 1];
    const n = parseInt(arg, 10);
    return backups.find(b => b.n === n) || backups[backups.length - 1];
  };

  const liveFile = path.join(CTX_DIR, 'LIVE_CTX_' + sid + '.md');

  // `after` first: the before/after pair is only a pair when the backup really precedes the
  // after state, and a PreCompact run that changed nothing still writes a backup newer than it.
  let after;
  if (afterArg === 'live' || afterArg === null || afterArg === undefined) {
    after = { n: 'live', file: liveFile, ts: fs.existsSync(liveFile) ? fs.statSync(liveFile).mtimeMs : Date.now() };
  } else {
    after = pick(afterArg);
  }
  const afterTs = after.ts || Date.now();

  let before;
  if (beforeArg === null || beforeArg === undefined) {
    const prior = backups.filter(b => (b.ts || 0) <= afterTs);
    before = prior.length ? prior[prior.length - 1] : backups[backups.length - 1];
  } else {
    before = pick(beforeArg);
  }

  const beforeText = read(before.file);
  const afterText = read(after.file);
  if (!beforeText && !afterText) return debug('both states empty');

  const manifest = read(path.join(CTX_DIR, 'needles-' + sid + '.md'));
  let needles = parseNeedles(manifest);
  const needleSource = needles.length ? 'needles-' + sid + '.md' : 'derived-from-before';
  if (!needles.length) needles = deriveNeedles(beforeText);
  debug('needles=' + needles.length + ' source=' + needleSource);

  const inBefore = needles.filter(n => beforeText.includes(n));
  const inAfter = needles.filter(n => afterText.includes(n));
  const retained = needles.filter(n => beforeText.includes(n) && afterText.includes(n));
  const lost = inBefore.filter(n => !afterText.includes(n));
  const never = needles.filter(n => !beforeText.includes(n) && !afterText.includes(n));

  const beforeTs = before.ts || (fs.existsSync(before.file) ? fs.statSync(before.file).mtimeMs : afterTs);
  const afterTsResolved = afterTs;

  const transcript = transcriptArg || findTranscript(sid);
  let tokensBefore = 0;
  let tokensAfter = 0;
  let contextBefore = 0;
  let contextAfter = 0;
  if (transcript && fs.existsSync(transcript)) {
    const pts = measure(transcript);
    const b = peakAtOrBefore(pts, beforeTs);
    const a = firstAtOrAfter(pts, afterTsResolved);
    tokensBefore = b.input;
    tokensAfter = a.input;
    contextBefore = b.sum;
    contextAfter = a.sum;
    debug('pts=' + pts.length + ' tokens ' + tokensBefore + ' -> ' + tokensAfter);
  } else {
    debug('no transcript; token fields are 0');
  }

  const report = {
    session_id: sid,
    needle_source: needleSource,
    before: { file: before.file, n: before.n, ts: beforeTs },
    after: { file: after.file, n: after.n, ts: afterTsResolved },
    needles_total: needles.length,
    needles_before: inBefore.length,
    needles_after: inAfter.length,
    retained: retained.length,
    lost: lost,
    never_present: never,
    tokens_before: tokensBefore,
    tokens_after: tokensAfter,
    context_before: contextBefore,
    context_after: contextAfter,
    reward: tokensAfter ? retained.length / tokensAfter : 0,
    note: 'verbatim substring match; a restated needle counts as lost. measurement, not decision.'
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

try {
  main();
} catch (e) {
  debug('uncaught', e);
}
process.exit(0);
