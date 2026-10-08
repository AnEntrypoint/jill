---
name: jev-local
description: Local replacement for TypeSafe's cloud Jev decision model. Answers typed questions (choice = pick one option, score = place content on a scale, noul = yes/no with calibrated confidence) about a piece of text or state. Runs inside the calling agent and dispatches a claude-haiku-5-5 subagent to answer, so no external API or shell step is involved. Use for model routing, skill selection, triage, mailbox lanes, memory-passage filtering, turn selection, or any small structured decision where a fast typed answer beats prose.
---

# jev-local

A decision engine, not a writer. You give it one STATE and a list of typed questions;
it returns one value and one calibrated confidence per question. The answers come from a
lightweight subagent (`haiku`) that this skill dispatches through the Agent tool. Nothing
computes an answer in code, and no shell command runs in the answering path.

## Input

Three things, held in this conversation:

- `state`: the text or facts the decision is about.
- `questions`: a list of typed questions with unique ids.
- A chunk prompt template, in `references/subagent-prompt.md`.

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

Ready-made question sets for routing, skill selection, triage, mailbox lanes, memory filtering,
turn selection, injection screening and command gating are in `references/policies.md`.

## Output

```json
{"answers": [{"id": "lane", "value": "billing", "confidence": 0.97}],
 "stats": {"model": 3, "unanswered": 0}}
```

- `choice`: `value` is one of the options.
- `score`: `value` is a number inside `scale`.
- `noul`: `value` is `true` or `false`.
- Every answer has `confidence` from 0 to 1, the calibrated probability that `value` is right.

An answer that is missing or invalid comes back as `value: null`, `confidence: 0`, with an
`error` field (for example `not_an_option`). Treat it as unknown. Never guess.

## Steps

Do these steps yourself, in this conversation. Do not run a shell command for them.

1. **Chunk.** Group the questions into sets of up to 8 that share the state. For each set,
   build the chunk prompt: the full text of `references/subagent-prompt.md`, then a line
   `STATE:` and the state text, then `QUESTIONS:` and that set's question JSON array.
2. **Dispatch.** For every chunk, make one Agent-tool call with `model: "haiku"`,
   `effort: "low"`, `subagent_type: "Explore"` and `prompt` set to that chunk's prompt. Send
   all chunk calls in one message so they run in parallel. `Explore` is a read-only agent
   type, so the subagent cannot write files. Use `general-purpose` only if `Explore` is unavailable.
3. **Merge.** Parse each subagent's reply as JSON. For each question id, take its single
   answer and check it: a choice value must be one of the options, a score must lie inside
   its scale, and a noul value must be the string `"yes"` or `"no"`. Convert a valid noul
   value to the boolean output: `"yes"` becomes `true`, `"no"` becomes `false`. Set `value`
   to `null` and `confidence` to `0` on any failure, and set `error`. Return the merged answers.

## Rules

- **The model answers, not you.** Do not fill in a value from your own reasoning, a regex,
  a keyword list or a heuristic. If a chunk fails or returns unparseable text, re-dispatch that
  chunk once. If it still fails, leave those answers unknown. Do not substitute your own answer.
- **Keep the state minimal.** Send only the text the decision needs. A shorter state is a faster reply.
- **Batch by state.** Put every question about one state into one call of this skill.
- **Confidence is the signal.** Below 0.6 means the state did not settle the question; route it
  to a stronger model or a person.
- **Fail open.** When a decision is unknown, leave the caller on its default path. Never block on it.
- **Repeat decisions.** A repeated identical state and question should reuse the earlier answer
  from this conversation rather than dispatch again.

## Speed notes (measured on the Agent path)

- One 5-question chunk, `haiku`: 5.3 s. About 30k subagent tokens per call.
- Two 8-question chunks in one message: 3.9 s and 6.4 s. Cold run on a 10-question state
  (8 + 2 chunks): 5.0 s and 2.4 s in parallel, so the wall clock is about the slowest chunk.
- One 16-question chunk: 8.5 s, slower than two parallel 8-question chunks. Keep chunks at 8.
- Subagent type, same 4-question chunk, haiku, default effort: `statusline-setup` 8.4k subagent
  tokens, `Explore` 16.1k, `general-purpose` 29.7k. All three returned the same valid answers.
  `statusline-setup` has the smallest toolset but is an odd fit for decisions, so the default is `Explore`.
- Effort, same chunk and type: `general-purpose` at default effort 29.7k tokens, 4.5 s; at
  `effort: "low"` 29.5k tokens, 2.0 s. Low effort gave the speed gain; the token count did not change.
  Each figure is a single sample, so treat the timings as rough.
- The gm opener that the gm rules require on every Agent dispatch is a fixed cost in each
  subagent's context. The chunk prompt itself is about 1 to 2k characters.
