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

A set may also be the union of two sets rather than a choice between them, which is what turns
two passes over the same items into one. The compaction sets are the case in point: disposition
`D N R S C` and boundary `B F W C` are both answerable per block, so one line carries
`D N R S B F W C` and one confidence for the whole answer. Every line carries the same set, so it
needs no tag.

Measured on the same real 500-item file, `haiku`, low effort: the disposition set alone cost
40.9k subagent tokens (and 45.0k in a second run of the same file), the combined set cost 52.8k,
500/500 ids, no unparseable line, and no line of one shape read as the other. Two passes would
have been two calls, about 82-90k, so the union saves about 30k per 500 blocks and one dispatch:
the extra three codes cost about a fifth of a call, because a call costs most of its tokens
before it reaches the first item.

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

### Chunk size is a wall-clock choice, not a token or capacity choice

Measured 2026-10-12 on one real 2,000-block item set (blocks built from two real session
transcripts with the technique in `hooks/precompact-jill.js`; `haiku`, `effort: "low"`; each
agent read its own item file and wrote its reply to a file, so the caller's context was not
charged for the answers):

| shape | calls | subagent tokens | wall, slowest call | coverage |
| --- | --- | --- | --- | --- |
| 1 call of 2,000 | 1 | 60.3k | 437 s | 2000/2000, 0 unparsed, 0 dup |
| 2 parallel calls of 1,000 | 2 | 132.5k (70.3k + 62.2k) | 401 s | 2000/2000, 0 unparsed, 0 dup |
| 4 parallel calls of 500 | 4 | 177.8k (40.9k, 39.3k, 51.0k, 46.6k) | 247 s | 2000/2000, 0 unparsed, 0 dup |

Read off that table:

- **Tokens go with the number of calls, not with the number of items.** One call of 2,000 cost
  60.3k; the same items as four calls cost 177.8k, 2.9x more. Each extra call costs about 36-40k
  whatever it holds; the items themselves add only about 10 tokens each on top (a 500-item call
  averaged 44.4k against 60.3k for 2,000). So one call is always the cheapest shape, and it stays
  the cheapest shape at every size measured. There is no token crossover to find.
- **Wall clock is the only axis where splitting wins.** 4x500 finished in 247 s against 437 s for
  one call of 2,000, and 2x1000 was in between at 401 s. The wall crossover sits between 500 and
  1,000 per call, and it is a consequence of parallelism, not of capacity.
- **Coverage did not degrade at any size tried.** All three shapes returned every requested id,
  with no unparseable line and no duplicate, so the range-boundary defect above was not
  reproduced here. One call of 2,000 did take 17 tool calls and 437 s: a huge call is slow and
  one failure loses the whole set, which is the argument against it, not correctness.
- **Capacity is on output, not input.** A dense reply line is about 8-11 output tokens, so a
  64k output ceiling is approached around 5,000-6,000 items per call; 2,000 items is nowhere near
  it, and the input side never binds at all. Nothing here justifies a chunk size of 500 as a
  limit.

So: pick a chunk size for wall clock and for blast radius (how many answers one failed call
loses). Do not pick one to save tokens, and do not pick one because the call "cannot hold" the
items. `hooks/blocks-chunks.js` defaults to 500 for wall clock and prints the arithmetic for the
render it just made, so the caller sees what a different size would cost.
