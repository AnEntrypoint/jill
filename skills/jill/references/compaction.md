# Compaction strategy (jill, after Context Language Models)

Context Language Models (arXiv:2609.37725v1) replace the append-only context transition
`c_{t+1} = c_t ⊕ f(c_t)` with an arbitrary edit `c_{t+1} = f(c_t)`: the live context is
mirrored to a file the model may edit, and the edit is synced back for the next turn. Fixed
strategies fail their ContextBench diagnostic — summarization loses or hallucinates needles,
and any method without surgical editing has to regenerate whole states.

Claude Code does not expose its live context as an editable file. It does expose five surfaces
that together cover the same decision space. This reference is the procedure that drives them
with jill decisions instead of a fixed rule.

## The five surfaces

| Surface | Where | What it decides |
| --- | --- | --- |
| `modelSettings.autoCompactWindow` | `~/.claude/settings.json`, per model | when the cut is forced |
| `/compact [instructions]` | slash command | what the summarizer is told to preserve |
| `PreCompact` hook | `~/.claude/settings.json` | observe, prepare, **veto** |
| `SessionStart` hook, matcher `compact` | same file | **what is injected into the compacted context** |
| `CLAUDE.md` | project root, or `~/.claude/CLAUDE.md` | the steering that survives the cut |

**The injection point is the `SessionStart` `compact` matcher, not `PreCompact`.** A PreCompact
hook runs before the cut but cannot put anything into it: Claude Code discards its
`systemMessage` and `continue`, sends its stdout to the debug log only, and does not document
`additionalContext` for the event. Anything a hook added earlier is summarized with the rest of
the conversation. What PreCompact *can* do is read the transcript, prepare state, and veto with
exit code 2. So the split is:

- **`hooks/precompact-jill.js`** (PreCompact, `manual|auto`) — measures the context from the
  transcript's own usage counters, writes the block inventory, backs up the live context file,
  and vetoes an *automatic* compaction the jill boundary pass said was badly timed.
- **`hooks/sessionstart-compact-jill.js`** (SessionStart, `compact`) — prints the steering, the
  live context file, the directive and the needle manifest. Plain stdout on this event *is*
  added to the compacted context.

A manual `/compact` is never vetoed: that is the user asking. Only `trigger=auto` is.

CLAUDE.md is the belt to that hook's braces. It is re-injected from disk after a compaction, so
a steering sentence placed there survives even if no hook runs.

## The live context file

CLM's context-as-a-file has no client-side equivalent, so the counterpart is a file the model
owns and rewrites in place:

- Path: `~/.claude/context/LIVE_CTX_<session_id>.md`, stated in `CLAUDE.md` so every turn knows it.
- Contents: key findings, the current plan, needle manifest, open rows. A few thousand tokens, not a log.
- Edit rule: rewrite the whole file, never append to it. An append-only live file is the failure
  mode this strategy exists to remove.
- Sync rule: the file is the source of truth for what survives; the conversation is scratch.

## Backup rule (CLM, verbatim in intent)

> Before every edit to your context, you must back up the current context file into a new file
> inside a new folder named `compaction_backup`; never overwrite or delete earlier backups.

Applied here: `~/.claude/context/compaction_backup/<session_id>/<n>-<ts>.md`. Never overwrite,
never delete. A compaction that cannot be undone is not admitted.

## The decision pass

Two policies in `references/policies.md` carry the decisions:

- **Compaction disposition** — one state per block: `disposition` (keep/compress/evict),
  `needle`, `recoverable`, `salience`.
- **Compaction boundary** — one state per candidate cut point: `subtask_done`, `in_flight`,
  `when`.

### Steps

1. **Pressure.** Read the reported context size. If it is within one turn of the budget, the
   boundary question is asked; otherwise the pass stops here.
2. **Ask the boundary set first.** `in_flight=yes` beats every other answer: a cut that breaks
   unfinished reasoning is worse than an oversized context. `when=next_boundary` defers the cut
   and records where the boundary is. `hooks/boundary-write.js <session_id> <when> <confidence>
   [boundary] [in_flight]` writes the answer; `when=now` clears it.
3. **Chunk the transcript into blocks.** One block per assistant turn plus its tool results, or
   one per subtask when the transcript is large. Give every block a stable id.
4. **Ask the disposition set per block.** `hooks/blocks-chunks.js` renders the inventory as
   dense-protocol chunk files (`<n> <text>`, one item per line, with a spec file per chunk);
   dispatch one jill decider per chunk, all in one message. ≤8 blocks: one chunk each.
   Hundreds to thousands of blocks: several parallel calls of 500.
5. **Merge and check ids.** `hooks/blocks-merge.js` merges the replies, checks that every
   requested id came back, and applies the overrides. Re-dispatch the missing ones once. A
   missing id is unknown, never `keep` and never `evict`.
6. **Apply the overrides.** `needle=yes` forces `keep` regardless of `disposition`.
   `recoverable=yes` makes `evict` safe regardless of `salience`. `disposition=evict` with
   `needle=yes` is a contradiction: keep the block and record the conflict.
7. **Rewrite the live context file.** Keep blocks verbatim, compress blocks to one line each,
   evict blocks to their id and a one-line reason. Back up first.
8. **Write the needle manifest.** `~/.claude/context/needles-<session_id>.md`, one fact per line.
   The `SessionStart` `compact` hook re-emits it, so a needle cannot be lost by a cut.
9. **Cut.** `/compact [instructions]` carrying the merged directive, or let `autoCompactWindow`
   fire — the prepared directive and the veto decision are read by the `PreCompact` hook either
   way.

## Measured, not estimated

CLM's Appendix G found that an LM's own estimate of its context length degrades badly at long
contexts — models answer in bucketed guesses like "6.2K, 9.8K, or 10.4K tokens" — and had to add
token-count hints to the environment as a "temporary augmentation". A Claude Code transcript
already carries the true number: every assistant row has `message.usage.input_tokens`,
`cache_read_input_tokens` and `cache_creation_input_tokens`. `hooks/precompact-jill.js` reads
those and reports the real context size, so no stage of this strategy asks a model to guess how
big its own context is.

## The veto

CLM's boundary result is that *when* the cut happens matters as much as what survives it. jill
answers the boundary set and `hooks/boundary-write.js` writes the result:

```
~/.claude/context/decision-<session_id>.json
{"when": "not_this_turn", "in_flight": true, "boundary": "<where>", "confidence": 0.9, "ts": 1791813000000}
```

The `PreCompact` hook vetoes an automatic compaction when `when=not_this_turn`,
`confidence >= 0.6` and the decision is under ten minutes old. A vetoed proactive compact leaves
the conversation uncompacted and the work continues; the cut happens at the next boundary. A
veto written when the context is already failing is too late, so the pass asks the boundary set
early, not at the limit.

### Disposition table

| Answers | Action |
| --- | --- |
| `disposition=keep` | carry the block verbatim into the live context file |
| `disposition=compress` | one line per block; needles inside it stay verbatim |
| `disposition=evict` | drop the block, record id and reason in the backup |
| `needle=yes` (any disposition) | force keep; needles are the failures ContextBench catches |
| `recoverable=yes` | eviction is safe; the block is reachable from disk or one tool call |
| `salience` ≥ 0.8 | never evict below this, whatever `disposition` says |
| unknown / `confidence` < 0.6 | keep. Fail open toward retention, never toward deletion |

## The directive the compaction receives

Text, not prose about the work. Assembled from the merge:

```
LIVE CONTEXT: <path>
BACKUP: <path>
KEEP VERBATIM: <block ids>
COMPRESS: <block ids>
EVICT: <block ids>
NEEDLES: <one line per needle fact>
PLAN: <current plan, one line>
OPEN ROWS: <ids>
```

Keep it under ~200 tokens. It is injected, not read, so every token of it costs on every
compaction.

## Steering sentences

CLM's three, kept as data so the caller can select rather than paraphrase. `YY` is the budget
the model is running under.

- **Threshold** — "Monitor your context size: every tool result reports your current size.
  Whenever it exceeds YY tokens, immediately compact your context down to about 4000 tokens."
- **Boundary** — "Please only compress at the boundaries of subtasks. Once a subtask is
  accomplished, throw out all the context for that subtask."
- **Backup** — "Before every edit to your context, you must back up the current context file
  into a new folder named `compaction_backup`; never overwrite or delete earlier backups."

## Fail open

- No decision file, no block ids, or a hook that did not run: the default append-only
  compaction. jill never blocks a compaction.
- A block whose answers are unknown is kept.
- A cut is never forced by this strategy; `autoCompactWindow` forces it, and this strategy only
  decides what survives it.

## Not ported

**Suffix Cache Reuse** (CLM §5) is server-side KV relocation inside the inference stack —
relocating up to `K` surviving spans, re-rotating RoPE, splicing after the edit. It is worth
35% server-side compute in their measurement and is unreachable from a Claude Code client. The
client-side counterpart is behavioural: keep the edit tail-stable. Append the directive, never
rewrite earlier context, so the prefix the server already cached still matches.

## Evolution

CLM optimizes the steering doc itself: rollouts on a training split, a proposer model
generating candidate skills from traces, candidates evaluated on dev, best selected, one held-out
evaluation. Held-out gain reached 35.9 points on their KV Store task. The same loop applies
here — the candidate is the steering sentence set, the trace is `(directive, blocks kept,
needles lost, tokens after)`, and the reward is needles retained per token spent. Recorded as a
procedure, not as a scheduler: nothing runs it until a caller asks.
