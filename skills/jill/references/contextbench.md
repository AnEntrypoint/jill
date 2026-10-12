# ContextBench: the instrument behind the strategy

`compaction.md` claims "never drop a needle" and prices the evolution loop at "needles retained
per token spent". Both come from Context Language Models (arXiv:2609.37725v1), where they are not
claims but scores: ContextBench is the diagnostic suite that produces them. This reference is what
that suite is, which of it survives the port to a Claude Code client, and what
`hooks/needle-check.js` measures in its place.

## The suite

Four synthetic tasks, generated from a seed, run against GPT-5.4 with a 32,768-token context limit
of which 2,048 are reserved for the response (30,720 usable). Context pressure — total input pushed
over an episode divided by the limit — is driven up to 24×. The tasks "need no search or inference
beyond following the instruction, so an agent that could keep everything would answer every query;
performance measures how the agent manages its context and nothing else."

| Task | Input stream | Queries | Metric |
| --- | --- | --- | --- |
| **Needle Retention** | ~4K-token chunks, each with 2–8 needle lines and 140 filler lines | none | needle lines retained verbatim in the final context |
| **Sudoku Sketchpad** | one move per turn on a 16×16 board | current board after each move | board versions reproduced exactly |
| **KV Store** | batches of 100 SET operations with random 24-word values | 24 GET queries | exact-value accuracy |
| **Log Triage** | batches of 14–54 service log lines | 24 lookup and count queries | exact-answer accuracy |

What each isolates:

- **Needle Retention** — selective verbatim retention: can the agent keep the few lines that matter
  while deleting the filler around them, over and over, without paraphrase or hallucination.
- **Sudoku Sketchpad** — surgical in-place editing: one cell changes and the other 255 must not.
  A method without in-place editing has to regenerate the whole board for every fine-grained move.
- **KV Store** — exact recall of massive values through offloading *and* retrieval.
- **Log Triage** — exact recall over noisy volume: lookups and counts against working logs.

**One line decides portability:** "All metrics are computed from the agent's context; answers held
only in files are not credited."

## What is portable

**Needle Retention, and only Needle Retention — approximately.** A Claude Code agent can keep a
file of designated facts (`~/.claude/context/needles-<session_id>.md`), and whether those lines
survive a cut is measurable after the fact from the backup pairs on disk. The approximation is
real and worth stating: the paper scores the *agent's context*, and a client never exposes its live
context, so the best available proxy is the mirror file the strategy makes the model maintain. A
needle that survives in the file but was never re-read is credited here and would not be there.

**Sudoku Sketchpad is not portable.** Its instrument is surgical in-place editing of the live
context: the board *is* the context, and the metric is whether the next version differs from the
last by exactly one cell. `c_{t+1} = f(c_t)` is unreachable from a client — the transcript is
append-only and the harness owns compaction. A client can keep a board in a file and rewrite it,
which is the same arithmetic with the instrument removed: it measures file discipline, not context
management.

**KV Store and Log Triage are not portable, and not for the obvious reason.** Offloading and
retrieval are exactly what a client is good at — write a batch to disk, read one key back. That is
the paper's own observation about coding agents: they "can offload information on KV Store and Log
Triage but cannot evict it from the live context on demand". The task's second half is the one that
carries the score, and answers held only in files are not credited. Run as a jill task it becomes
"did the agent's file discipline hold", which is a different measurement wearing the same name.

So: one task ported, one instrument approximated, two tasks declined. Say so rather than reporting
four out of four.

## What `needle-check.js` measures instead

```
node hooks/needle-check.js <session_id> [--before <n>] [--after <n>|live] [--transcript <path>]
```

- **before** — the newest backup under `~/.claude/context/compaction_backup/<session_id>/` that
  precedes the after state, i.e. the live file as it stood before the last cut.
- **after** — `~/.claude/context/LIVE_CTX_<session_id>.md` (default) or a named backup.
- **needles** — `~/.claude/context/needles-<session_id>.md`, one fact per line. With no manifest it
  falls back to identifier-bearing lines of the before state and says so in `needle_source`.
- **retention** — a needle is retained when its line occurs verbatim in the after text. Verbatim is
  the whole claim, so a paraphrase counts as lost even when the fact survived. Read `lost` as "the
  string is gone", not as "the model forgot".
- **tokens** — from the transcript's own `message.usage` counters, never an estimate (CLM Appendix
  G): `tokens_before` is the largest context measured at or before the cut, `tokens_after` the first
  measured at or after it. `context_before`/`context_after` carry the cache-inclusive sums.
- **reward** — `retained / tokens_after`.

The script answers no question and makes no decision. It is instrumentation; the disposition and
boundary policies still own the decisions.

Measured on this machine, session `84c86752-cc7a-4848-9905-a24080f38549`: `needles_total 6`,
`needles_before 4`, `needles_after 4`, `retained 4`, `lost []`, `tokens_before 47895`,
`tokens_after 1418`, `reward 0.00282`. Two manifest lines (`SessionStart matcher "compact"` and
`~/.claude/settings.json modelSettings.*.autoCompactWindow`) appear in neither state verbatim —
they are in `never_present`, which is the measurement catching the manifest and the live file
drifting out of sync, not a cut dropping anything.

## How the reward feeds the evolution loop

CLM evolves the steering document itself: `s* = argmax_s E_{x~D}[R(τ(x;s))]`, rollouts on a
training split, a proposer generating candidate skills from traces, candidates evaluated on dev,
best selected, one held-out evaluation — 35.9 points held-out gain on KV Store. `compaction.md`
records the same loop with the same shape: candidate = the steering sentence set, trace =
`(directive, blocks kept, needles lost, tokens after)`, reward = needles retained per token spent.

`needle-check.js` is what makes `R` computable at all. Without it the loop has a reward nothing can
calculate, and "the best steering sentence" is whichever one sounds best. With it, two candidate
steerings run on comparable cuts of the same session can be compared on `(retained, tokens_after)`.

Two honesty caveats, because a reward that is cheap to game is worse than no reward:

- The reward is a comparator, not a score. One session, one cut, six needles is a sample size that
  supports "A kept more than B here" and nothing stronger.
- It is gameable by inflating the manifest. A manifest of 200 needles with `tokens_after` unchanged
  raises `retained` and therefore `reward`. Keep the manifest to facts the rest of the task
  actually depends on; the number is only as honest as that file.

## `pressure-reminder.js`: the pre-budget half

CLM's harness gives the model "its editing reminder 2,048 tokens before the budget", and the paper
notes of the base harness that it "has no trigger". The port fires at the cut (`PreCompact`) and
after it (`SessionStart` `compact`) and nowhere in between, so the boundary question gets asked at
the wall — the failure `compaction.md`'s veto section already names.

`hooks/pressure-reminder.js` is the missing trigger: it reads the real budget from
`~/.claude/settings.json` (`autoCompactWindow`, overridden by `modelSettings.<model>.autoCompactWindow`,
model taken from the transcript's own `requestedModel`/`message.model`), measures the real context
from `message.usage`, and when the measured context is within `JILL_PRESSURE_LEAD_TOKENS` (default
2048) of the budget it prints one line telling the agent to run the boundary pass now.

**Bound to `UserPromptSubmit`, not `PostToolUse`.**

1. Plain stdout on `UserPromptSubmit` is added to the context the model sees. `PostToolUse` needs a
   JSON `additionalContext` to do the same; its plain stdout goes to the transcript instead.
2. It fires once per turn, so the ~90-token line and the transcript read are paid once per turn.
   `PostToolUse` fires after every tool call — on a tool-heavy turn the same reminder is injected
   a dozen times, and every token of it is paid on every firing.
3. It fires *before* the agent acts. A reminder that lands mid-turn asks for a boundary pass while
   work is in flight, and `in_flight=yes` beats every other answer in the boundary policy — the
   reminder would be correctly ignored exactly when it is most expensive.
4. User turns are the granularity the boundary policy decides over (`subtask_done`, `when`).

Wire it in `~/.claude/settings.json` (no matcher on this event):

```json
"UserPromptSubmit": [
  { "hooks": [ { "type": "command", "command": "node C:/Users/user/.claude/hooks/pressure-reminder.js", "timeout": 10 } ] }
]
```

**Scale the lead to the budget.** 2,048 tokens is 6.25% of ContextBench's 32,768-token limit. The
same absolute number against a 400,000-token `autoCompactWindow` is 0.5% — narrower than one turn's
growth, so a hair-trigger that `UserPromptSubmit` can step straight over. The default is kept at
2048 because that is the paper's number; set `JILL_PRESSURE_LEAD_TOKENS` to a few turns' worth
(order of 8,000–20,000 at a 400k window) when wiring it for real.
