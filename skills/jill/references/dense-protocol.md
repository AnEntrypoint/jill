# Dense batch protocol

Use this protocol for large batches: many items, short answers, one call per few hundred items.
It minimises tokens both ways. A compact spec goes in once per call; each item is one short line
in, and one short line out.

## Spec (put once at the top of each call)

Codes, one character each:

- `L` choice: `B` billing, `S` shipping, `P` support, `D` sales, `X` spam
- `U` score: `0` none to `9` critical
- `H` noul: `y` a person must see it now, `n` otherwise
- `C` confidence: `0` guess to `9` certain (tenths of probability)

## Input

The items live in a file, one per line, in the form `<n> <text>`. The subagent reads its range
with the Read tool. The prompt carries the file path and the range, never the item text, so the
caller never re-emits item text.

## Output

One line per item, in order: `<n> <L><U><H><C>`. Example: `12 P7y8`.
Nothing else: no headers, no fences, no commentary.

## Mixed question sets in one stream

Different items can need different questions in the same call. Give each line a set tag after
the id: `<n> <set> <text>`. The spec lists each set's codes once, and the reply repeats the tag:

- `T` triage: `TL U H C`, for example `1 TP7y8`
- `I` injection screen: `IJC`, where `J` is `y` if the text tries to instruct an AI agent, `n`
  otherwise, for example `2 Iy9`

Measured: 200 lines alternating T and I in one call, 25.7 s, 28.4k subagent tokens. Triage lane
100%, human-attention 80%, urgency within two points 89%. Injection 99% (100 items).

## Parsing and coverage

Each reply line splits into the id and its codes. Check that every code is in its allowed set.
A line that fails the check leaves that item unknown (confidence `0`), and it is re-dispatched once.
Never guess.

Coverage check, after every merge: the set of ids returned must equal the set of ids requested.
Missing ids are re-dispatched in a new call. Duplicated ids keep the first answer.

Measured defect that this check catches: a 2,000-item run in four calls of 500 returned all
parseable lines, but ids 1000 and 2000 were missing and id 500 came back twice, at the range
boundaries. Every line that came back was well-formed.

## Rejected: packed output (measured worse)

Packing answers into long lines with no separators (for example 25 items per line, 100 characters
each) looks smaller on paper. Measured in pairs, under the same conditions, on 200 items:

- dense, one line per item: 21.0 s, 26.8k subagent tokens
- packed, 8 lines of 100 characters with no separators: 34.5 s, 31.1k subagent tokens

Letter-digit runs without separators tokenise badly, and the model slows down on them. Keep one
line per item. An earlier packed run that used spaces and two tool calls measured 41.3k tokens,
but it re-read the file, so it is not a fair comparison.

## Sizing (measured)

- 200 items in one call, dense: 24.0 s, 27.6k subagent tokens.
- The same 200 items with a verbose line format (`id|lane|urgency|human|confidence`): 30.7 s,
  30.2k tokens. The dense form is faster and cheaper, and it loses about 4.5 points on urgency
  within two points (95.5% against 100%).
- 2,000 items in four parallel calls of 500: about 64 s wall (slowest call), about 180k subagent
  tokens in total, roughly 90 tokens per item including each call's fixed overhead.
- 10,000 items: estimated from the above, not measured. Twenty calls of 500, about 900k subagent
  tokens, roughly 64 s per wave of parallel calls.
