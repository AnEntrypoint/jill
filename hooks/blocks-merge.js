#!/usr/bin/env node
// Merges jill's dense-protocol replies over a block inventory and applies the overrides from
// references/compaction.md. This is the half a hook must never do itself: it is the caller's
// merge, and the caller is the agent.
//
//   node hooks/blocks-merge.js [session_id] [reply files...]
//
// Reads  ~/.claude/context/blocks/<sid>/blocks.jsonl
//        ~/.claude/context/chunks/<sid>/render.json    what the last blocks-chunks render was
//        ~/.claude/context/chunks/<sid>/*.reply.txt    one line per item, in any of three shapes:
//          "<n> <D><N><R><S><B><F><W><C>"   the combined set, disposition and boundary at once
//          "<n> <D><N><R><S><C>"            the disposition set
//          "<n> <B><F><W><C>"               the boundary set (no disposition, so nothing is kept
//                                           or evicted by it)
// Writes ~/.claude/context/disposition-<sid>.md       the directive the compaction carries
// Prints a JSON summary: counts, missing ids, and every override it applied.
//
// A re-render keeps its replies, so this merge can see answers bought under an older inventory.
// render.json carries a fingerprint of the inventory the render was made from; when the current
// inventory does not match it, every reply is treated as stale and ignored. An ignored answer is
// an unknown block, and an unknown block is kept.
//
// Overrides, in order (references/compaction.md, "Apply the overrides"):
//   needle = yes        -> keep, whatever disposition said
//   confidence < 0.6    -> unknown, so keep
//   evict + not recoverable -> keep; eviction is only safe when the block can be re-derived
//   salience >= 0.8     -> never evict
//   missing id          -> unknown, so keep
// Failure always opens toward retention. Exit 0 with no output when there is no inventory.

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
if (process.env.JILL_HOOKS_DISABLED === '1') process.exit(0); // set when a plugin install already wired these
const CTX_DIR = path.join(HOME, '.claude', 'context');
const MIN_CONFIDENCE = 0.6;
const NEVER_EVICT_SALIENCE = 0.8;

// Set tags in reply order: combined, then disposition, then boundary. The combined shape is 8
// codes, so it can never be read as either single set.
const REPLY_SHAPES = [
  { set: 'both', re: /^(\d+)\s+([kmx])([yn])([yn])(\d)([yn])([yn])([nbt])(\d)$/, codes: 'DNRSBFWC' },
  { set: 'disposition', re: /^(\d+)\s+([kmx])([yn])([yn])(\d)(\d)$/, codes: 'DNRSC' },
  { set: 'boundary', re: /^(\d+)\s+([yn])([yn])([nbt])(\d)$/, codes: 'BFWC' }
];

function newestSession() {
  const dir = path.join(CTX_DIR, 'blocks');
  if (!fs.existsSync(dir)) return null;
  return fs.readdirSync(dir).map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t)[0].f;
}

// A UTF-8 BOM makes JSON.parse throw, and PowerShell 5.1's Set-Content -Encoding utf8 writes one.
function parseJsonLine(line) {
  let s = String(line == null ? '' : line);
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

async function main() {
  const sid = process.argv[2] || process.env.CLAUDE_SESSION_ID || newestSession();
  if (!sid) return;
  const inv = path.join(CTX_DIR, 'blocks', sid, 'blocks.jsonl');
  if (!fs.existsSync(inv)) return;

  const raw = fs.readFileSync(inv, 'utf8');
  const blocks = raw
    .split('\n')
    .filter(l => l.trim())
    .map(parseJsonLine)
    .filter(Boolean);
  if (!blocks.length) return;

  const dir = path.join(CTX_DIR, 'chunks', sid);
  const listed = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => /\.reply\.txt$/.test(f)).sort().map(f => path.join(dir, f))
    : [];
  const replied = process.argv.slice(3).length ? process.argv.slice(3) : listed;

  // Replies survive a re-render, so a reply can predate the inventory it is being merged over.
  // render.json carries the moment the inventory last changed: an answer written before it may be
  // numbered against blocks that have since moved, and a shifted id would answer for a block
  // other than the one asked. Those are dropped rather than merged, and dropping is the safe
  // side, because an unanswered block is unknown and an unknown block is kept.
  const stale = [];
  let files = replied;
  const renderPath = path.join(dir, 'render.json');
  if (fs.existsSync(renderPath) && !process.argv.slice(3).length) {
    let render = null;
    try {
      render = JSON.parse(fs.readFileSync(renderPath, 'utf8').replace(/^﻿/, ''));
    } catch (e) {
      render = null;
    }
    const changedAt = render && render.inventory_changed_at;
    if (changedAt) {
      files = replied.filter(f => {
        let mtime = 0;
        try {
          mtime = fs.statSync(f).mtimeMs;
        } catch (e) {
          mtime = 0;
        }
        if (mtime >= changedAt) return true;
        stale.push(f);
        return false;
      });
    }
  }

  const byId = new Map();
  const boundaryById = new Map();
  let unparsed = 0;
  for (const f of files) {
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t) continue;
      let hit = null;
      for (const shape of REPLY_SHAPES) {
        const m = t.match(shape.re);
        if (m) {
          hit = { shape: shape, m: m };
          break;
        }
      }
      if (!hit) {
        unparsed++;
        continue;
      }
      const id = parseInt(hit.m[1], 10);
      const codes = hit.shape.codes;
      const at = c => hit.m[codes.indexOf(c) + 2];
      if (codes.indexOf('B') !== -1 && !boundaryById.has(id)) {
        // The boundary half of a combined answer: it says when to cut, never what to keep.
        boundaryById.set(id, {
          subtask_done: at('B') === 'y',
          in_flight: at('F') === 'y',
          when: { n: 'now', b: 'next_boundary', t: 'not_this_turn' }[at('W')],
          confidence: parseInt(at('C'), 10) / 10
        });
      }
      if (codes.indexOf('D') === -1) continue; // boundary only: the disposition stays unknown, which keeps the block
      if (byId.has(id)) continue; // a duplicated id keeps the first answer
      byId.set(id, {
        disposition: at('D'),
        needle: at('N') === 'y',
        recoverable: at('R') === 'y',
        salience: parseInt(at('S'), 10) / 10,
        confidence: parseInt(at('C'), 10) / 10
      });
    }
  }

  const missing = [];
  const overrides = [];
  const rows = blocks.map((b, i) => {
    const id = i + 1;
    const a = byId.get(id);
    if (!a) {
      missing.push(id);
      return { id, block: b.id, final: 'keep', why: 'no answer: unknown is kept', head: b.head };
    }
    let final = a.disposition === 'k' ? 'keep' : a.disposition === 'm' ? 'compress' : 'evict';
    let why = 'disposition';
    if (a.confidence < MIN_CONFIDENCE) {
      final = 'keep';
      why = 'confidence ' + a.confidence + ' < ' + MIN_CONFIDENCE + ': unknown is kept';
    } else if (a.needle) {
      final = 'keep';
      why = 'needle: survives verbatim';
    } else if (final === 'evict' && !a.recoverable) {
      final = 'keep';
      why = 'evict asked for a block that is not recoverable';
    } else if (final === 'evict' && a.salience >= NEVER_EVICT_SALIENCE) {
      final = 'keep';
      why = 'salience ' + a.salience + ' >= ' + NEVER_EVICT_SALIENCE;
    }
    if (final !== (a.disposition === 'k' ? 'keep' : a.disposition === 'm' ? 'compress' : 'evict')) {
      overrides.push({ id, asked: a.disposition, final, why });
    }
    return { id, block: b.id, final, why, head: b.head, salience: a.salience, confidence: a.confidence };
  });

  const count = f => rows.filter(r => r.final === f).length;
  const group = f =>
    rows
      .filter(r => r.final === f)
      .map(r => r.block + ' (' + r.head.slice(0, 60) + ')')
      .join('\n');

  const directive = [
    'JILL DISPOSITION (merged, overrides applied)',
    'keep: ' + count('keep') + '  compress: ' + count('compress') + '  evict: ' + count('evict') +
      '  of ' + rows.length,
    missing.length ? 'UNANSWERED (kept): ' + missing.join(', ') : 'UNANSWERED: none',
    '',
    'KEEP',
    group('keep') || '-',
    '',
    'COMPRESS',
    group('compress') || '-',
    '',
    'EVICT (recoverable, no needle)',
    group('evict') || '-'
  ].join('\n');

  fs.writeFileSync(path.join(CTX_DIR, 'disposition-' + sid + '.md'), directive + '\n');

  process.stdout.write(
    JSON.stringify(
      {
        session_id: sid,
        blocks: rows.length,
        answered: byId.size,
        boundary_answers: boundaryById.size,
        stale_replies: stale,
        unparsed_lines: unparsed,
        missing_ids: missing,
        keep: count('keep'),
        compress: count('compress'),
        evict: count('evict'),
        overrides,
        directive: path.join(CTX_DIR, 'disposition-' + sid + '.md')
      },
      null,
      1
    ) + '\n'
  );
}

main().catch(() => process.exit(0));
