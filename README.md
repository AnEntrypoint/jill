# jill

A local replacement for [Jev](https://docs.typesafe.ai), TypeSafe's decision model. You give
it one state and a list of typed questions. It returns one value and one calibrated confidence
per question, and it never writes prose.

- **Choice**: pick one option.
- **Score**: place the state on a scale.
- **Noul**: is a yes/no statement true, with confidence.

The answers come from a `haiku` subagent that the agent running the skill dispatches through
its Agent tool, with `effort: "low"` and the read-only `Explore` type. There is no cloud Jev
call, no API key, no shell step, and no answer computed in code.

## Install

```bash
npx skills add AnEntrypoint/jill
```

Or, in Claude Code:

```
/plugin marketplace add AnEntrypoint/jill
/plugin install jill@jill
```

## Use

Ask your agent to use the `jill` skill, or name the decision you need:

> Use jill: which lane should this message go in, and does a person need to see it now?

`skills/jill/SKILL.md` has the steps. In short: build the questions for each state, dispatch
one Haiku subagent per set of up to eight questions, all in one message, and merge the replies.
`skills/jill/references/policies.md` has seventeen ready-made question sets: model routing,
skill selection, triage, mailbox lanes, memory filtering, turn selection, compaction
disposition, compaction boundary, injection screening, command gating, pull-request risk,
incident severity, personal data, search-result selection, evidence sufficiency, next browser
action, handoff worthiness. `skills/jill/references/compaction.md` turns the two compaction
sets into a context-management strategy for Claude Code.

## Layout

```
skills/jill/
  SKILL.md                      the skill (Agent Skills standard)
  references/subagent-prompt.md the instruction every subagent receives
  references/policies.md        ready-made decision question sets
  references/compaction.md      context-management strategy for Claude Code
hooks/                          PreCompact (prepare + veto) and SessionStart compact (inject)
.claude-plugin/                 plugin and marketplace manifests, and hooks/hooks.json
docs/                           the GitHub Pages site (https://anentrypoint.github.io/jill/)
design/                         the DADA design log for the page
```

## Compaction

`references/compaction.md` applies Context Language Models (arXiv:2609.37725v1) to Claude Code:
the context stops being append-only, and keep / compress / evict is a jill decision instead of a
fixed rule. Two hooks carry it.

- `hooks/precompact-jill.js` — PreCompact, `manual|auto`. Measures the context from the
  transcript's own usage counters, writes a block inventory, backs up the live context file, and
  vetoes an automatic compaction the boundary pass says is badly timed.
- `hooks/sessionstart-compact-jill.js` — SessionStart, `compact`. Prints the steering, the live
  context file and the needle manifest. This is the injection point: PreCompact cannot add
  anything to a compaction, and SessionStart with the `compact` matcher can.

Three scripts carry the decision pass itself. None of them answers a question; the calling agent
does that by dispatching jill deciders.

- `hooks/boundary-write.js` — writes `~/.claude/context/decision-<session_id>.json` from the
  boundary answers: the file the `PreCompact` veto reads, so the pass has a producer and the caller
  never hand-crafts it. `when=now` removes the file, so a stale decision cannot block a compaction.
- `hooks/blocks-chunks.js` — renders the inventory as dense-protocol chunk files, one item per
  line, with a spec file per chunk.
- `hooks/blocks-merge.js` — merges the replies, checks that every id came back, and applies the
  overrides: a needle is kept, an answer below 0.6 confidence is kept, and an eviction is refused
  unless the block is recoverable.

The plugin ships both in `.claude-plugin/hooks/hooks.json`. To wire the checkout you already
have instead, add the same two entries to `~/.claude/settings.json` and set the commands to the
paths under `hooks/`. Running both would double them, so set `JILL_HOOKS_DISABLED=1` to silence
the checkout copy once the plugin is installed.

## Speed

Measured on the Agent path, single samples with about one second of noise:

- One 8-question set, `Explore`, low effort: 3.4 s and 4.1 s, about 16.5k subagent tokens each.
- Low effort versus default effort on the same set: 3.4 s versus 8.9 s, with the same tokens.
- Two 4-question calls in parallel are a little faster (2.8 s) but cost twice the tokens.
- `statusline-setup` halves the tokens (8.6k) but has an Edit tool, so it is not the default.
- Escalating two uncertain answers to `sonnet` at low effort: 2.4 s.
- `Plan` and `Explore` cost the same (4.3 s and 16.7k tokens).
- Large batches, dense protocol (`skills/jill/references/dense-protocol.md`): 200 items in one
  call took 24 s and 27.6k tokens, against 31 s and 30.2k for a verbose line format. 2,000 items
  in four parallel calls of 500 took about 64 s and about 180k tokens in total. Ids are checked
  after each merge: two ids went missing at range boundaries in that run.
- Mixed question sets in one stream (triage and injection screening alternating): lane 100%,
  injection 99% on 100 items each.
- Two frontiers. Speed mode, the default: parallel 8-question calls, about 3.4 to 4.1 s and about
  33k tokens for 16 questions. Token mode: one 16-question call, 6.5 s and 17.6k tokens.

Identical decisions on the same state are reused within a conversation, so repeats cost no model call.

## License

MIT
