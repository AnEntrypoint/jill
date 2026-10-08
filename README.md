# jev-local

A local replacement for [Jev](https://docs.typesafe.ai), TypeSafe's decision model. You give
it one state and a list of typed questions. It returns one value and one calibrated confidence
per question, and it never writes prose.

- **Choice**: pick one option.
- **Score**: place the state on a scale.
- **Noul**: is a yes/no statement true, with confidence.

The answers come from a `haiku` subagent that the agent running the skill dispatches itself
through its Agent tool. No cloud Jev call, no API key, and no answer computed in code.

## Install

```bash
npx skills add AnEntrypoint/richard
```

Or, in Claude Code:

```
/plugin marketplace add AnEntrypoint/richard
/plugin install jev-local@richard
```

## Use

Ask your agent to use the `jev-local` skill, or name the decision you need:

> Use jev-local: which lane should this message go in, and does a person need to see it now?

The skill's `SKILL.md` has the steps. In short: build the questions, dispatch one Haiku
subagent per chunk of up to eight questions in parallel, and merge the replies.
`references/policies.md` has ready-made question sets for model routing, skill selection,
triage, mailbox lanes, memory filtering, turn selection, injection screening and command gating.

## Layout

```
skills/jev-local/
  SKILL.md                      the skill (Agent Skills standard)
  references/subagent-prompt.md the instruction every subagent receives
  references/policies.md        ready-made decision question sets
  scripts/jev.mjs               optional: chunking, cache and validation (no LLM calls)
.claude-plugin/                 plugin and marketplace manifests
docs/                           the GitHub Pages site
```

## Speed

Measured on the in-session Agent path with `haiku`: a 5-question chunk took 5.3 s; two
8-question chunks dispatched in one message took 3.9 s and 6.4 s. Each subagent used about 30k
tokens, mostly the gm opener. Identical decisions on the same state are cached, so repeats cost
no model call.

## License

MIT
