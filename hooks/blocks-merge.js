#!/usr/bin/env node
// Merges jill's dense-protocol replies over a block inventory and applies the overrides from
// references/compaction.md. This is the half a hook must never do itself: it is the caller's
// merge, and the caller is the agent.
//
//   node hooks/blocks-merge.js [session_id] [reply files...]
//
// Reads  ~/.claude/context/blocks/<sid>/blocks.jsonl
//        ~/.claude/context/chunks/<sid>/*.reply.txt   (one "<n> <D><N><R><S><C>" line per item)
// Writes ~/.claude/context/disposition-<sid>.md       the directive the compaction carries
// Prints a JSON summary: counts, missing ids, and every override it applied.
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
const CTX_DIR = path.join(HOME, '.claude', 'context');
const MIN_CONFIDENCE = 0.6;
const NEVER_EVICT_SALIENCE = 0.8;

function newestSession() {
  const dir = path.join(CTX_DIR, 'blocks');
  if (!fs.existsSync(dir)) return null;
  return fs.readdirSync(dir).map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t)[0].f;
}

async function main() {
  const sid = process.argv[2] || process.env.CLAUDE_SESSION_ID || newestSession();
  if (!sid) return;
  const inv = path.join(CTX_DIR, 'blocks', sid, 'blocks.jsonl');
  if (!fs.existsSync(inv)) return;

  const blocks = fs
    .readFileSync(inv, 'utf8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      try {
        return JSON.parse(l);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
  if (!blocks.length) return;

  const dir = path.join(CTX_DIR, 'chunks', sid);
  const files = process.argv.slice(3).length
    ? process.argv.slice(3)
    : fs.existsSync(dir)
      ? fs.readdirSync(dir).filter(f => /\.reply\.txt$/.test(f)).sort().map(f => path.join(dir, f))
      : [];

  const byId = new Map();
  let unparsed = 0;
  for (const f of files) {
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = line.trim().match(/^(\d+)\s+([kmx])([yn])([yn])(\d)(\d)$/);
      if (!m) {
        if (line.trim()) unparsed++;
        continue;
      }
      const id = parseInt(m[1], 10);
      if (byId.has(id)) continue; // a duplicated id keeps the first answer
      byId.set(id, {
        disposition: m[2],
        needle: m[3] === 'y',
        recoverable: m[4] === 'y',
        salience: parseInt(m[5], 10) / 10,
        confidence: parseInt(m[6], 10) / 10
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
