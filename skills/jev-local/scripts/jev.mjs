#!/usr/bin/env node
// jev-local helper. It prepares decision batches and merges subagent answers.
// It never answers a question: the LLM call is the Agent-tool dispatch (model: haiku)
// that the agent running this skill makes with each prepared chunk prompt.
//
//   node jev.mjs prepare < batch.json   -> {cached, chunks, missing}
//   node jev.mjs finish  < merge.json   -> {answers, stats}
//
// batch.json : {"state": "<text>", "questions": [{"id","type","question",...}]}
// merge.json : {"questions": [...], "cached": [...], "results": ["<subagent text>", ...]}

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const POLICY_VERSION = 'v1';
const CHUNK = Math.max(1, Number(process.env.JEV_CHUNK || 8));
const CACHE_DIR = process.env.JEV_CACHE || join(homedir(), '.cache', 'jev-local');
const PROMPT = readFileSync(new URL('../references/subagent-prompt.md', import.meta.url), 'utf8');
const TYPES = new Set(['choice', 'score', 'noul']);

const readStdin = () => JSON.parse(readFileSync(0, 'utf8'));
const out = (obj) => process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const clamp01 = (n) => Math.min(1, Math.max(0, Number(n)));

function validate(q) {
  if (!q || typeof q.id !== 'string' || !q.id) throw new Error('question needs a string id');
  if (!TYPES.has(q.type)) throw new Error(`question ${q.id}: type must be choice|score|noul`);
  if (typeof q.question !== 'string' || !q.question) throw new Error(`question ${q.id}: needs question text`);
  if (q.type === 'choice' && (!Array.isArray(q.options) || q.options.length < 2))
    throw new Error(`question ${q.id}: choice needs at least 2 options`);
  if (q.type === 'score') {
    const [lo, hi] = q.scale || [0, 1];
    if (!(Number(hi) > Number(lo))) throw new Error(`question ${q.id}: scale must be [min,max] with max>min`);
  }
}

// Cache key covers the state and the question's meaning, never its id, so a repeated
// decision on the same state is answered without any LLM call.
function cacheKey(state, q) {
  const { id, ...rest } = q;
  return sha(POLICY_VERSION + '\n' + state + '\n' + JSON.stringify(rest));
}

function prepare({ state, questions }) {
  if (typeof state !== 'string') throw new Error('batch needs a string state');
  if (!Array.isArray(questions) || !questions.length) throw new Error('batch needs questions');
  questions.forEach(validate);
  mkdirSync(CACHE_DIR, { recursive: true });
  const cached = [];
  const pending = [];
  for (const q of questions) {
    const file = join(CACHE_DIR, cacheKey(state, q) + '.json');
    if (existsSync(file)) cached.push({ id: q.id, ...JSON.parse(readFileSync(file, 'utf8')), source: 'cache' });
    else pending.push(q);
  }
  const chunks = [];
  for (let i = 0; i < pending.length; i += CHUNK) {
    const part = pending.slice(i, i + CHUNK);
    chunks.push({
      index: chunks.length,
      ids: part.map((q) => q.id),
      prompt: PROMPT + '\n\nSTATE:\n' + state + '\n\nQUESTIONS:\n' + JSON.stringify(part),
    });
  }
  out({ cached, chunks, missing: pending.length, policy_version: POLICY_VERSION });
}

// Pulls the first JSON object out of a subagent reply, tolerating code fences around it.
function parseReply(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

// Normalises one raw answer against its question. Invalid answers are flagged, not guessed.
function normalise(q, raw) {
  const conf = clamp01(raw?.confidence);
  if (raw?.value === undefined || raw?.value === null || Number.isNaN(conf))
    return { id: q.id, value: null, confidence: 0, error: 'missing_or_malformed' };
  if (q.type === 'choice') {
    if (!q.options.includes(raw.value)) return { id: q.id, value: null, confidence: 0, error: 'not_an_option' };
    return { id: q.id, value: raw.value, confidence: conf };
  }
  if (q.type === 'score') {
    const [lo, hi] = q.scale || [0, 1];
    const v = Number(raw.value);
    if (Number.isNaN(v)) return { id: q.id, value: null, confidence: 0, error: 'not_a_number' };
    return { id: q.id, value: Math.min(Number(hi), Math.max(Number(lo), v)), confidence: conf };
  }
  const v = String(raw.value).toLowerCase();
  if (!['yes', 'no', 'true', 'false'].includes(v)) return { id: q.id, value: null, confidence: 0, error: 'not_yes_no' };
  return { id: q.id, value: v === 'yes' || v === 'true', confidence: conf };
}

function finish({ state, questions, cached = [], results = [] }) {
  if (!Array.isArray(questions)) throw new Error('merge needs the original questions');
  const byId = new Map(questions.map((q) => [q.id, q]));
  const answers = new Map(cached.map((a) => [a.id, { ...a, source: 'cache' }]));
  for (const text of results) {
    const parsed = parseReply(String(text));
    for (const raw of parsed?.answers || []) {
      const q = byId.get(raw?.id);
      if (!q || answers.has(q.id)) continue;
      const a = normalise(q, raw);
      answers.set(q.id, { ...a, source: 'model' });
      if (!a.error && state !== undefined) {
        mkdirSync(CACHE_DIR, { recursive: true });
        const { value, confidence } = a;
        writeFileSync(join(CACHE_DIR, cacheKey(state, q) + '.json'), JSON.stringify({ value, confidence }));
      }
    }
  }
  const final = questions.map((q) => answers.get(q.id) || { id: q.id, value: null, confidence: 0, error: 'no_answer' });
  const count = (src) => final.filter((a) => a.source === src).length;
  out({
    answers: final,
    stats: { cached: count('cache'), model: count('model'), unanswered: final.filter((a) => a.error).length },
  });
}

const cmd = process.argv[2];
try {
  if (cmd === 'prepare') prepare(readStdin());
  else if (cmd === 'finish') finish(readStdin());
  else throw new Error('usage: jev.mjs prepare|finish  (JSON on stdin)');
} catch (e) {
  process.stderr.write(`jev-local: ${e.message}\n`);
  process.exit(1);
}
