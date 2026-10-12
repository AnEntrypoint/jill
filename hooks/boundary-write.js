#!/usr/bin/env node
// Writes the boundary decision that the PreCompact veto reads, so the pass has a producer and
// the caller never hand-crafts JSON under a timestamp convention it has to remember.
//
//   node hooks/boundary-write.js <session_id> <when> <confidence> [boundary] [in_flight]
//
//   session_id  the Claude Code session id. Required, and never guessed from the newest
//               blocks/ directory: a veto written to the wrong session silently blocks a
//               different session's compaction, so refusing to guess is the safe direction.
//   when        now | next_boundary | not_this_turn. Anything else is refused. The W digit of
//               a boundary-set reply is the same value abbreviated: n=now, b=next_boundary,
//               t=not_this_turn.
//   confidence  0..1. A dense-protocol C digit is tenths, so divide it by 10.
//   boundary    where the next cut should land. Kept from the existing file when omitted.
//   in_flight   yes | no. Defaults to true for not_this_turn and false otherwise.
//
// The decision may also arrive on stdin as JSON, because that is how the other hooks receive a
// Claude Code payload: {"session_id","when","confidence","boundary","in_flight","note"}. A
// stdin field fills in only what the positional args did not give. Args win, then stdin, then
// the file already on disk.
//
// Reads  stdin                                   the same decision as JSON, optional
// Writes ~/.claude/context/decision-<sid>.json   {"when","in_flight","boundary","confidence","ts"}
// Prints one JSON line: what was written.
//
// when=now removes the file instead of writing it. A stale not_this_turn silently blocks an
// automatic compaction, so clearing has to be total: no file, no veto, nothing left to misread.
//
// Existing keys merge, never clobber: a note already in the file survives the rewrite, and any
// stdin key that is neither a decision field nor a Claude Code payload field is carried the
// same way. The five decision fields are always rewritten, so no stale veto can hide in them.
// Nothing here answers a question. Exit 0 with no output when there is nothing to write.
// Fail open: any error prints nothing and exits 0, so a decision that could not be written is
//   a missing veto, never a wrong one.   JILL_BOUNDARY_DEBUG=1 sends a trace to stderr.

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
if (process.env.JILL_HOOKS_DISABLED === '1') process.exit(0); // set when a plugin install already wired these
const CTX_DIR = path.join(HOME, '.claude', 'context');

const WHEN = { now: true, next_boundary: true, not_this_turn: true };
// Fields this script owns, and fields a Claude Code hook payload carries. Neither is copied
// through as a free-form extra key.
const DECIDED = { when: true, confidence: true, boundary: true, in_flight: true };
const PAYLOAD = {
  session_id: true,
  trigger: true,
  custom_instructions: true,
  transcript_path: true,
  cwd: true,
  hook_event_name: true,
  matcher: true
};

function debug(why, err) {
  if (!process.env.JILL_BOUNDARY_DEBUG) return;
  process.stderr.write('boundary-write: ' + why + (err ? '\n' + (err.stack || err) : '') + '\n');
}

function readStdin() {
  return new Promise(resolve => {
    let d = '';
    process.stdin.on('data', c => (d += c));
    process.stdin.on('end', () => resolve(d));
  });
}

// A UTF-8 BOM makes JSON.parse throw, and PowerShell 5.1's Set-Content -Encoding utf8 writes one.
function parseJson(raw) {
  let s = String(raw == null ? '' : raw);
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch (e) {
    return null;
  }
}

function parseConfidence(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!isFinite(n) || n < 0 || n > 1) return null;
  return n;
}

function parseBool(v, dflt) {
  if (v === undefined || v === null || v === '') return dflt;
  if (typeof v === 'boolean') return v;
  const s = String(v).trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'yes' || s === 'y') return true;
  if (s === '0' || s === 'false' || s === 'no' || s === 'n') return false;
  return dflt;
}

async function main() {
  const a = process.argv.slice(2);
  let raw = '';
  try {
    if (!process.stdin.isTTY) raw = await readStdin();
  } catch (e) {
    raw = '';
  }
  const sent = parseJson(raw) || {};

  const sid = a[0] || sent.session_id || process.env.CLAUDE_SESSION_ID || '';
  const when = a[1] || sent.when || '';
  if (!sid || !WHEN[when]) return debug('nothing to write: session=' + (sid || 'none') + ' when=' + (when || 'none'));

  const file = path.join(CTX_DIR, 'decision-' + sid + '.json');

  // Clearing: remove, do not write when=now. An absent file cannot veto, whatever a later
  // reader does with the keys, so this is the direction that fails safe.
  if (when === 'now') {
    try {
      fs.rmSync(file, { force: true });
    } catch (e) {
      return debug('remove failed', e);
    }
    process.stdout.write(JSON.stringify({ session_id: sid, when: 'now', file: file, removed: true }) + '\n');
    return;
  }

  const conf = parseConfidence(a[2] !== undefined ? a[2] : sent.confidence);
  if (conf === null) return debug('bad confidence: ' + String(a[2] !== undefined ? a[2] : sent.confidence));

  let existing = {};
  try {
    if (fs.existsSync(file)) existing = parseJson(fs.readFileSync(file, 'utf8')) || {};
  } catch (e) {
    existing = {};
  }

  const boundary = a[3] || sent.boundary || existing.boundary || '';
  const inFlight = parseBool(a[4] !== undefined ? a[4] : sent.in_flight, when === 'not_this_turn');

  const extras = {};
  for (const k of Object.keys(sent)) if (!DECIDED[k] && !PAYLOAD[k]) extras[k] = sent[k];

  const out = Object.assign({}, existing);
  for (const k of Object.keys(extras)) out[k] = extras[k];
  out.when = when;
  if (boundary) out.boundary = boundary;
  out.in_flight = inFlight;
  out.confidence = conf;
  out.ts = Date.now();

  try {
    fs.mkdirSync(CTX_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(out) + '\n');
  } catch (e) {
    return debug('write failed', e);
  }

  process.stdout.write(
    JSON.stringify({
      session_id: sid,
      when: when,
      confidence: conf,
      in_flight: inFlight,
      boundary: boundary || null,
      ts: out.ts,
      file: file
    }) + '\n'
  );
}

main().catch(e => {
  debug('uncaught', e);
  process.exit(0);
});
