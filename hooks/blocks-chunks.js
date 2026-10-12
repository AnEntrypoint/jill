#!/usr/bin/env node
// Renders the block inventory as dense-protocol chunk files, so a jill-decider subagent can
// answer the compaction questions without any hook dispatching a subagent itself.
//
//   node hooks/blocks-chunks.js [session_id] [blocks_per_chunk] [disposition|boundary]
//
// Reads  ~/.claude/context/blocks/<sid>/blocks.jsonl   (written by precompact-jill.js)
// Writes ~/.claude/context/chunks/<sid>/<k>.txt         one item per line: "<n> <text>"
// Prints one JSON line per chunk: the file, the question set, the dense spec and the reply shape.
//
// The caller composes each Agent dispatch itself: references/subagent-prompt.md, then STATE as
// the chunk file path and its range, then the item file path, then the spec. Nothing here
// answers a question. Exit 0 with no output when there is no inventory.

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
const CTX_DIR = path.join(HOME, '.claude', 'context');

const SETS = {
  disposition: {
    name: 'Compaction disposition',
    spec: [
      'spec: one line per block, "<n> <D><N><R><S><C>", in order, nothing else.',
      'D disposition: k=keep, m=compress, x=evict',
      'N needle: y = the block holds an identifier, path, number or commitment the rest of the',
      '  task depends on; n = it does not',
      'R recoverable: y = the block can be recovered from a file, git or one tool call',
      'S salience: 0-9, tenths of how much later work depends on this block',
      'C confidence: 0-9, tenths of the probability the answer is right'
    ].join('\n'),
    reply: 'example: 12 my1n8'
  },
  boundary: {
    name: 'Compaction boundary',
    spec: [
      'spec: one line per block, "<n> <B><F><W><C>", in order, nothing else.',
      'B subtask_done: y = the block completed a subtask whose material is no longer needed',
      'F in_flight: y = the block opens reasoning a cut would break',
      'W when: n=cut now, b=cut at the next boundary, t=not this turn',
      'C confidence: 0-9, tenths of the probability the answer is right'
    ].join('\n'),
    reply: 'example: 12 ynn8'
  }
};

function newestSession() {
  const dir = path.join(CTX_DIR, 'blocks');
  if (!fs.existsSync(dir)) return null;
  return fs
    .readdirSync(dir)
    .map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0].f;
}

async function main() {
  const sid = process.argv[2] || process.env.CLAUDE_SESSION_ID || newestSession();
  const per = Math.max(1, parseInt(process.argv[3] || '500', 10) || 500);
  const set = SETS[process.argv[4] || 'disposition'] || SETS.disposition;
  if (!sid) return;

  const src = path.join(CTX_DIR, 'blocks', sid, 'blocks.jsonl');
  if (!fs.existsSync(src)) return;
  const blocks = fs
    .readFileSync(src, 'utf8')
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

  const outDir = path.join(CTX_DIR, 'chunks', sid);
  fs.mkdirSync(outDir, { recursive: true });
  for (const old of fs.readdirSync(outDir)) fs.rmSync(path.join(outDir, old), { force: true });

  const chunks = [];
  for (let i = 0; i < blocks.length; i += per) {
    const slice = blocks.slice(i, i + per);
    const k = chunks.length + 1;
    const items = path.join(outDir, k + '.items.txt');
    fs.writeFileSync(
      items,
      slice.map((b, j) => i + j + 1 + ' ' + String(b.head || '').replace(/\|/g, '/')).join('\n') + '\n'
    );
    const specFile = path.join(outDir, k + '.spec.txt');
    fs.writeFileSync(specFile, set.name + '\n' + set.spec + '\n' + set.reply + '\n');
    chunks.push({
      chunk: k,
      items,
      spec: specFile,
      range: [i + 1, i + slice.length],
      count: slice.length,
      set: set.name,
      replyShape: set.reply
    });
  }

  process.stdout.write(
    JSON.stringify(
      { session_id: sid, blocks: blocks.length, blocks_per_chunk: per, set: set.name, chunks },
      null,
      1
    ) + '\n'
  );
}

main().catch(() => process.exit(0));
