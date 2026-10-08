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
`skills/jill/references/policies.md` has ready-made question sets for model routing, skill
selection, triage, mailbox lanes, memory filtering, turn selection, injection screening, command
gating, pull-request risk, incident severity and personal-data checks.

## Layout

```
skills/jill/
  SKILL.md                      the skill (Agent Skills standard)
  references/subagent-prompt.md the instruction every subagent receives
  references/policies.md        ready-made decision question sets
.claude-plugin/                 plugin and marketplace manifests
docs/                           the GitHub Pages site (https://anentrypoint.github.io/jill/)
design/                         the DADA design log for the page
```

## Speed

Measured on the Agent path, single samples with about one second of noise:

- One 8-question set, `Explore`, low effort: 3.4 s and 4.1 s, about 16.5k subagent tokens each.
- Low effort versus default effort on the same set: 3.4 s versus 8.9 s, with the same tokens.
- Two 4-question calls in parallel are a little faster (2.8 s) but cost twice the tokens.
- `statusline-setup` halves the tokens (8.6k) but has an Edit tool, so it is not the default.
- Escalating two uncertain answers to `sonnet` at low effort: 2.4 s.

Identical decisions on the same state are reused within a conversation, so repeats cost no model call.

## License

MIT
