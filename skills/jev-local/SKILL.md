---
name: jev-local
description: Local replacement for TypeSafe's cloud Jev decision model. Answers typed questions (choice = pick one option, score = place content on a scale, noul = yes/no with calibrated confidence) about a piece of text or state. The agent running this skill dispatches a claude-haiku-5-5 subagent to answer, so no external API is called. Use for model routing, skill selection, triage, mailbox lanes, memory-passage filtering, turn selection, or any small structured decision where a fast typed answer beats prose.
---

# jev-local

A decision engine, not a writer. You give it one STATE and a list of typed questions;
it returns one value and one calibrated confidence per question. The answers come from a
lightweight subagent (`haiku`) that this skill dispatches through your own Agent tool.
Nothing computes an answer in code.

## Input

```json
{
  "state": "the text or facts the decision is about",
  "questions": [
    {"id": "lane", "type": "choice", "question": "Which lane?", "options": ["billing", "shipping", "support", "spam"]},
    {"id": "urgency", "type": "score", "question": "How urgent?", "scale": [0, 1]},
    {"id": "refund", "type": "noul", "question": "The customer asks for a refund."}
  ]
}
```

Question ids must be unique in a batch. Use `references/policies.md` for ready-made question sets.

## Output

```json
{"answers": [{"id": "lane", "value": "billing", "confidence": 0.97, "source": "model"}],
 "stats": {"cached": 0, "model": 3, "unanswered": 0}}
```

`value` is `null` with `confidence: 0` and an `error` field when an answer is missing or
invalid (for example, a choice outside its options). Treat those as unknown; never guess.

## Steps

The whole decision runs inside this agent. The only model call is an Agent-tool subagent,
and no external process or API is involved.

1. **Chunk.** Split the questions into groups of 8 that share the state. For each group,
   build the chunk prompt: the full contents of `references/subagent-prompt.md`, then
   `STATE:` and the state text, then `QUESTIONS:` and that group's question JSON.
   Optional: `node skills/jev-local/scripts/jev.mjs prepare < batch.json` builds the same
   prompts and also returns answers already in the cache, so those questions skip the model.
2. **Dispatch.** For every chunk, make one Agent-tool call with `model: "haiku"` and
   `prompt` set to that chunk's prompt. Send all chunk calls in one message so they run in
   parallel. Skip this step when no chunk is left.
3. **Merge.** Read each subagent's reply text. Check every question id has exactly one answer,
   that choice values are among the options, and that scores sit inside their scale.
   Optional: write the replies to `merge.json` as
   `{"state", "questions", "cached", "results": [...]}` and run
   `node skills/jev-local/scripts/jev.mjs finish < merge.json` to do the same checks and
   cache the valid answers. Invalid answers come back flagged, not guessed.

## Rules

- **The model answers, not you.** Do not fill in a value yourself, from a regex, a keyword
  list or a heuristic. If a chunk fails, re-dispatch that chunk. Do not substitute your own answer.
- **Keep the state minimal.** Send only the text the decision needs. Fewer tokens per
  subagent means a faster reply.
- **Batch.** Put every question about one state into one batch. The helper splits big
  batches into chunks of 8 (`JEV_CHUNK` overrides this) that run in parallel.
- **Cache is on by default.** Identical state plus identical question returns the cached
  answer with no model call. Set `JEV_CACHE` to move the cache directory.
- **Confidence is the signal.** Low confidence (below 0.6) means the state did not settle the
  question. Route those to a stronger model or a person.
- **Fail open.** A decision the model cannot make should leave the caller on its default
  path, never blocked.

## Speed notes (measured)

- Agent-tool subagent, 5 questions, `haiku`: 5.3 s wall clock, about 30k subagent tokens.
  Most of those tokens come from the gm opener on the subagent prompt, which the gm rules require.
- Batch and parallelise. One chunk of 8 questions answers in one round trip; separate
  calls per question cost one round trip each.
