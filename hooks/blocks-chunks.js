#!/usr/bin/env node
// Renders the block inventory as dense-protocol chunk files, so a jill-decider subagent can
// answer the compaction questions without any hook dispatching a subagent itself.
//
//   node hooks/blocks-chunks.js [session_id] [blocks_per_chunk] [disposition|boundary|both]
//
// Reads  ~/.claude/context/blocks/<sid>/blocks.jsonl   (written by precompact-jill.js)
// Writes ~/.claude/context/chunks/<sid>/<k>.items.txt   one item per line: "<n> <text>"
//        ~/.claude/context/chunks/<sid>/<k>.spec.txt    the set's spec, once per chunk
//        ~/.claude/context/chunks/<sid>/render.json     what this render is, read by blocks-merge.js
// Prints one JSON line: the chunks, the question set, the dense spec and the sizing arithmetic.
//
// blocks_per_chunk defaults to 500. That is a wall-clock and blast-radius choice, not a token or
// capacity one. Measured (references/dense-protocol.md, "Chunk size is a wall-clock choice"): one
// call of 2,000 cost 60.3k subagent tokens and 437 s; four parallel calls of 500 cost 177.8k and
// 247 s. So a call costs CALL_OVERHEAD_TOKENS whatever it holds plus TOKENS_PER_ITEM per item,
// and splitting never saves tokens — it only buys wall clock through parallelism, and a smaller
// blast radius when one call fails. The printed `sizing` says what this render costs against one
// call of everything, so the caller is never guessing.
//
// `both` answers disposition and boundary on one line, so the two sets are one pass, not two.
// Every line of a `both` render carries the same set, so it needs no per-line set tag.
//
// A re-render replaces the rendered files and keeps every *.reply.txt: answered work is paid
// for and is never clobbered. render.json carries the inventory fingerprint, so blocks-merge.js
// can tell a reply that still matches this inventory from one that belongs to an older one.
//
// The caller composes each Agent dispatch itself: references/subagent-prompt.md, then STATE as
// the chunk file path and its range, then the item file path, then the spec. Nothing here
// answers a question. Exit 0 with no output when there is no inventory.

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const HOME = os.homedir() || process.env.USERPROFILE || '.';
if (process.env.JILL_HOOKS_DISABLED === '1') process.exit(0); // set when a plugin install already wired these
const CTX_DIR = path.join(HOME, '.claude', 'context');

const DEFAULT_PER = 500;
// Measured in references/dense-protocol.md, "Chunk size is a wall-clock choice": 1 call of 2,000
// cost 60.3k subagent tokens, 4 parallel calls of 500 cost 177.8k, so a call costs about this
// much whatever it holds plus about this much per item.
const CALL_OVERHEAD_TOKENS = 39000;
const TOKENS_PER_ITEM = 11;

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
    reply: 'example: 12 myn88'
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
  },
  both: {
    name: 'Compaction disposition and boundary',
    spec: [
      'spec: one line per block, "<n> <D><N><R><S><B><F><W><C>", in order, nothing else.',
      'D disposition: k=keep, m=compress, x=evict',
      'N needle: y = the block holds an identifier, path, number or commitment the rest of the',
      '  task depends on; n = it does not',
      'R recoverable: y = the block can be recovered from a file, git or one tool call',
      'S salience: 0-9, tenths of how much later work depends on this block',
      'B subtask_done: y = the block completed a subtask whose material is no longer needed',
      'F in_flight: y = the block opens reasoning a cut would break',
      'W when: n=cut now, b=cut at the next boundary, t=not this turn',
      'C confidence: 0-9, tenths of the probability the answer is right',
      'one confidence for both sets: the answer is one state, so it is one probability'
    ].join('\n'),
    reply: 'example: 12 myn8ynn8'
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
  const per = Math.max(1, parseInt(process.argv[3] || String(DEFAULT_PER), 10) || DEFAULT_PER);
  const set = SETS[process.argv[4] || 'disposition'] || SETS.disposition;
  if (!sid) return;

  const src = path.join(CTX_DIR, 'blocks', sid, 'blocks.jsonl');
  if (!fs.existsSync(src)) return;
  const raw = fs.readFileSync(src, 'utf8');
  const blocks = raw
    .split('\n')
    .filter(l => l.trim())
    .map(parseJsonLine)
    .filter(Boolean);
  if (!blocks.length) return;

  const outDir = path.join(CTX_DIR, 'chunks', sid);
  fs.mkdirSync(outDir, { recursive: true });
  // Rendered files are replaced; replies are the caller's paid work and are kept, so a
  // re-render at a different chunk size does not throw away answers already bought.
  let kept = 0;
  for (const old of fs.readdirSync(outDir)) {
    if (!/\.(items|spec)\.txt$/.test(old)) {
      if (/\.reply\.txt$/.test(old)) kept++;
      continue;
    }
    fs.rmSync(path.join(outDir, old), { force: true });
  }

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

  const callsAt = n => Math.max(1, Math.ceil(blocks.length / n));
  const estTokens = n => callsAt(n) * CALL_OVERHEAD_TOKENS + blocks.length * TOKENS_PER_ITEM;
  const sha = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
  const renderedAt = Date.now();
  // Replies survive a re-render, so blocks-merge.js has to be able to tell an answer that was
  // bought over this inventory from one bought over an older one whose ids have since shifted.
  // The moment the inventory last changed is that line: anything answered before it is suspect.
  let prev = null;
  try {
    prev = JSON.parse(fs.readFileSync(path.join(outDir, 'render.json'), 'utf8').replace(/^﻿/, ''));
  } catch (e) {
    prev = null;
  }
  const render = {
    session_id: sid,
    blocks: blocks.length,
    blocks_per_chunk: per,
    set: set.name,
    calls: chunks.length,
    inventory_sha: sha,
    inventory_changed_at: !prev || prev.inventory_sha !== sha ? renderedAt : prev.inventory_changed_at || prev.rendered_at || renderedAt,
    rendered_at: renderedAt
  };
  fs.writeFileSync(path.join(outDir, 'render.json'), JSON.stringify(render, null, 1) + '\n');

  process.stdout.write(
    JSON.stringify(
      {
        session_id: sid,
        blocks: blocks.length,
        blocks_per_chunk: per,
        blocks_per_chunk_default: DEFAULT_PER,
        set: set.name,
        calls: chunks.length,
        est_subagent_tokens: estTokens(per),
        est_subagent_tokens_one_call: estTokens(blocks.length),
        reply_files_kept: kept,
        sizing:
          blocks.length +
          ' blocks: ' + chunks.length + ' call(s) of ' + per + ' est ' + Math.round(estTokens(per) / 1000) +
          'k subagent tokens, one call of ' + blocks.length + ' est ' +
          Math.round(estTokens(blocks.length) / 1000) + 'k. Chunk size is a wall-clock and ' +
          'blast-radius choice, not a token or capacity one: a call costs about ' +
          Math.round(CALL_OVERHEAD_TOKENS / 1000) + 'k whatever it holds plus about ' +
          TOKENS_PER_ITEM + ' tokens per item, so splitting never saves tokens. Parallel calls ' +
          'finish sooner in wall clock; one failed call loses its whole chunk.',
        chunks
      },
      null,
      1
    ) + '\n'
  );
}

main().catch(() => process.exit(0));
