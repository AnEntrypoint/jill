# DESIGN-LOG: jev-local GitHub Pages landing page

Output: `docs/index.html` (single file, inline CSS and SVG, one inline copy-button script, no build step).
Brief in one sentence: a friendly landing page that says what jev-local is, gives the install command with a copy button, explains the three-step flow and the three question types, lists the eight policies, quotes only the measured speed figures, and links to the repository.

## 1. Traversal Plan

**Mode: Adaptive.** Reason: the page serves a developer audience and the brief names approachability.
Governing criterion: MAYA (Loewy). Advanced pole: a restrained, typographically exact page with one deliberate structural break (the speed figures drawn at true proportion). Acceptable pole: a developer can read the sentence and the install command on a 375 px phone screen without scrolling.
Required critics (Adaptive): Provocateur (Debord, Shklovsky), Inclusion (Holmes, Mace), plus three chosen for maximum difference: Usability (Krug, Nielsen), Evidence (Tufte, Cairo), Craft (Sennett, Bringhurst).

**Tooling inventory (Step 0).**
- Graph rendering or graph query: none available. No Mermaid, graph or knowledge-graph tool is in the tool list. The Frontier is kept as a table in this log.
- Workflow or task tracking: none available. No todo or plan-creation tool is loaded (only task-stop appears in the deferred list). State lives in this log.
- Panel: Agent tool, one agent per literary reference (Step 2c).
- Persist: `Write` to this file and to `CARRY-FORWARD.md`.
- Render: headless Chromium at `/usr/bin/chromium`, screenshots written to the session scratchpad (outside the project).

**Seed (exact labels from the graph).**
```
Stance  White (Kenya Hara)
  --[emptiness as invitation for]--> Welcome  MAYA: Most Advanced Yet Acceptable (Raymond Loewy)
Rule    Universal Principles of Design (Lidwell, Holden, Butler)
  --[aesthetic-usability effect for]--> Welcome  MAYA: Most Advanced Yet Acceptable (Raymond Loewy)
Rule    Universal Principles of Design (Lidwell, Holden, Butler)
  --[catalogues]--> Rule  Gestalt Principles of Perception (Wertheimer, Koffka, Köhler)
Welcome MAYA: Most Advanced Yet Acceptable (Raymond Loewy)
  --[bounds the break of]--> Breaker  Making and Breaking the Grid (Timothy Samara)
Breaker Making and Breaking the Grid (Timothy Samara)
  --[loosens]-.-> Rule  Grid Systems in Graphic Design (Josef Müller-Brockmann)   (dotted counterpoint)
```
Keep-the-rule first: M1, M2, M4. Break: M3.

**Round R0 (premortem): not run.** No artifact existed at the start of this run; Step 1.5 applies only when one does.

## 2. Frontier

Updated after each round. Status: OPEN, DEFERRED (reason), TAKEN (Mn).

| Candidate | Reached via (edge label, direction) | From anchor | Status |
|---|---|---|---|
| Designing Design (Kenya Hara) | stance of (out) | White (Kenya Hara) | OPEN |
| Occam's Razor (c_occam) | restraint shared with (out) | White (Kenya Hara) | OPEN |
| Tufte Style (c_tufte) | emptiness counterpoint to (dotted, out) | White (Kenya Hara) | DEFERRED: density counterpoint; decline recorded in M1 |
| In Praise of Shadows (Tanizaki) | aesthetic of shadow for (in) | White (Kenya Hara) | OPEN |
| Against Interpretation (Sontag) | resonates with emptiness of (dotted, in) | White (Kenya Hara) | OPEN |
| The Art of Looking Sideways (Alan Fletcher) | humor as welcome for (in) | MAYA | OPEN |
| How to Use Graphic Design to Sell Things, Explain Things, Make Things Look Better (Michael Bierut) | wit as welcome for (in) | MAYA | OPEN |
| Progressive Disclosure (c_prog) | approachable surface and ambitious depth for (in) | MAYA | OPEN |
| ADR according to Nygard (c_adr) | dual criterion for (out) | MAYA | OPEN |
| Laws of UX (Yablonski) | Jakob's Law familiarity for (in) | MAYA | OPEN |
| Emotional Design (Norman) | visceral behavioral reflective levels for (in) | MAYA | OPEN |
| Art as Technique (Shklovsky) | tempers strangeness of (dotted, out) | MAYA | OPEN (S5: apply or decline) |
| The End of Print (Carson) | acceptability limit on (dotted, out) | MAYA | OPEN (S5: apply or decline) |
| Diffusion of Innovations (Rogers) | compatibility and trialability for (in) | MAYA | OPEN |
| Crap Principles (Williams) | operationalized as (out) | Gestalt Principles | TAKEN (M2) |
| Art and Visual Perception (Arnheim) | grounds (out) | Gestalt Principles | TAKEN (M4) |
| Designing with the Mind in Mind (Jeff Johnson) | perception limits for (in) | Gestalt Principles | OPEN |
| Chesterton's Fence (c_chest) | know why the rule exists (in) | Making and Breaking the Grid | OPEN |
| Dreyfus Model (c_dreyfus) | expert stage breaks (in) | Making and Breaking the Grid | OPEN |
| Art as Technique (Shklovsky) | making strange for (in) | Making and Breaking the Grid | OPEN |
| Grid Systems (Müller-Brockmann) | loosens (dotted, out) | Making and Breaking the Grid | TAKEN (M3, counterpoint applied) |
| Gestalt Principles of Perception (Wertheimer, Koffka, Köhler) | catalogues (out) | Universal Principles of Design (Lidwell, Holden, Butler) | TAKEN (seed edge, M2 grounding) |

## 3. Decision Records

### Move M1: Restraint first screen  (KEEP-THE-RULE)
Depends on: none.
Anchors: Stance White (Kenya Hara) | Rule Universal Principles of Design (Lidwell, Holden, Butler) | Welcome MAYA: Most Advanced Yet Acceptable (Raymond Loewy) | Counterpoint Tufte Style (dotted edge from White, emptiness counterpoint to): declined, see below.
Intent: the first screen carries one headline, one sentence, and the install command as the only filled block. Everything else waits below.
Formal argument: Claim: the install command is the page's primary action, so it must be the only object with a filled background above the fold. Grounds: the page exists so a developer installs the skill. Warrant: emptiness as invitation (White) makes restraint itself the invitation, and the aesthetic-usability effect (Universal Principles) says an orderly first screen reads as more usable. Both serve the two poles at once.
Alternatives rejected: (a) hero with a feature grid and stock imagery, rejected because it adds claims and imagery the repo does not support; (b) three equal buttons (install, GitHub, docs), rejected because it splits the one action.
Consequence: less is visible at first glance; policies and speed sit below the fold.
Fence: none broken. The tufte density counterpoint is declined for the hero (it argues for data density, and a hero carries no data), and is applied only as a fence for the speed figures in M3.
Frontier effect: opens Progressive Disclosure (c_prog) and ADR (c_adr).
Mode field: Advanced pole: the install command is the single filled block on the page. Acceptable pole: the sentence and command fit a 375 px viewport without horizontal scroll. Measure after build: the command block's bottom edge must sit inside a 390 x 844 viewport.

### Move M2: Proximity sections  (KEEP-THE-RULE)
Depends on: M1.
Anchors: Rule Gestalt Principles of Perception (Wertheimer, Koffka, Köhler) | Rule CRAP Principles: Contrast, Repetition, Alignment, Proximity (Robin Williams) (operationalized from gestalt). No dotted edge leaves either anchor that is used here.
Intent: each section heading sits closer to its own content than to the section above, so the page groups by proximity alone, with no cards.
Formal argument: Claim: proximity is the sole grouping device. Grounds: gestalt grouping; CRAP proximity. Warrant: cards add weight without adding grouping information on a single column.
Alternatives rejected: (a) a card per section, rejected for visual weight; (b) numbered headings for every section, rejected because only the three steps are a sequence.
Consequence: the page relies on spacing discipline; any later margin change must be re-measured.
Fence: none.
Frontier effect: opens Arnheim (taken M4) and Johnson (perception limits).
Mode field: Advanced pole: spacing ratios carry the hierarchy. Acceptable pole: section headings are plain words a developer scans for. Measure: computed gap above each h2 must exceed the gap below it.

### Move M3: Speed figures drawn at true proportion  (BREAK)
Depends on: M1 (the single column is the grid being broken), M2.
Anchors: Breaker Making and Breaking the Grid (Timothy Samara) | Welcome MAYA (bounds the break of) | Counterpoint Grid Systems in Graphic Design (Josef Müller-Brockmann), dotted edge from Making and Breaking the Grid, label "loosens".
Intent: the three measured times are three horizontal bars on one shared scale, each labelled with its figure, so the speed claim is seen as well as read.
Formal argument: Claim: the single-column text convention is broken only for the figures. Grounds: Samara breaks the grid where the content has its own order; the speed figures do have one (a scale of seconds). Warrant: the counterpoint (Müller-Brockmann) is applied, not declined: one scale, one baseline, so the grid is loosened, not abandoned.
Alternatives rejected: (a) a table, rejected because it hides proportion; (b) a charting library, rejected because no framework and no build step are allowed, and three numbers need no library.
Consequence: three bars only; no extra claim is made.
Fence: the single column exists so reading stays linear. The rule is kept for the text, and every bar also carries its figure in words, so linear reading survives. Chesterton: the fence is recorded here.
Frontier effect: opens Chesterton's Fence (c_chest), Dreyfus Model (c_dreyfus), Art as Technique (Shklovsky) as a making-strange candidate.
Mode field: Advanced pole: bar lengths at true proportion on one scale (100 units per second). Acceptable pole: each bar has its label, figure and question count in text. Measure after build: rendered rect widths must stand in the ratio 5.3 : 3.9 : 6.4.

### Move M4: Mechanism diagram in the hero  (KEEP-THE-RULE)
Depends on: M1 (hero layout).
Anchors: Rule Art and Visual Perception (Rudolf Arnheim), reached from Gestalt Principles (grounds). No dotted edge used.
Intent: one inline SVG shows the mechanism: one state fans out into chunks and merges back to answers.
Formal argument: Claim: a process with a shape is understood faster as a shape than as a sentence. Grounds: Arnheim, perceptual form of a process. Warrant: the three steps in the page are fan-out and merge, so the diagram shows the real structure, not decoration.
Alternatives rejected: (a) a stock illustration of an agent, rejected because it asserts nothing the repo supports; (b) no diagram, rejected because the flow is the one thing a developer needs to see.
Consequence: one SVG of a few hundred bytes; its text must stay at least 16 px rendered on a phone.
Fence: none.
Frontier effect: none new beyond M2.
Mode field: Advanced pole: the fan-out and merge are drawn as shape. Acceptable pole: labels are plain words: state, chunk 1, chunk 2, chunk 3, merge. Measure after build: rendered label font size at 390 px width.

## 4. Build and Panel Round R1 (pending)
Next: write `docs/index.html` with M1 to M4, render at 390 and 1280 px, measure, then convene the panel (Round R1, WHOLE).

## 4. Build (done before any panel round)
- `docs/index.html` built with M1 to M4 as recorded above. `docs/.nojekyll` created empty.
- Final-state measurements (Step 2g) are in section 9.

## 5. Panel rounds (WHOLE; one agent per literary reference, ten agents)
Panel: Provocateur (Debord, Shklovsky), Inclusion (Holmes, Mace), Usability (Krug, Nielsen), Evidence (Tufte, Cairo), Craft (Sennett, Bringhurst). Dotted pair: Provocateur ↔ Usability ("attacks smoothness favored by"). Deviation: per-move panels were folded into cluster rounds, so each WHOLE round covers M1 to M4 together. R0 (premortem) was not run because no artifact existed at the start.
R2 to R4 re-used the same ten agents (resumed, each judging only its own author's doctrine), so each critic kept its own history and no critic saw another's verdict.

| Critic (reference) | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Debord | OBJECT | PASS | PASS | PASS |
| Shklovsky | OBJECT | OBJECT | OBJECT | OBJECT (overruled, see 6) |
| Krug | OBJECT | PASS | OBJECT | PASS |
| Mace | OBJECT | PASS | OBJECT | PASS |
| Holmes | OBJECT | PASS | PASS | PASS |
| Nielsen | OBJECT | PASS | PASS | PASS |
| Tufte | PASS | PASS | PASS | PASS |
| Cairo | OBJECT | OBJECT | PASS | PASS |
| Sennett | OBJECT | PASS | OBJECT | PASS |
| Bringhurst | OBJECT | OBJECT | OBJECT | OBJECT (adapted after report, not re-judged) |

### Round R1 (rendered M1 to M4, screenshots at 390 px and 1280 px)
Objections and resolutions:
- Debord: no returned answer shown. ADAPT: example reply block added under the three question types (`{"id": "lane", "value": "billing", "confidence": 0.97}`, shape as the skill documents, labelled as an example).
- Shklovsky: hero is a familiar pipeline; show the decision instead. Partly ADAPT (example reply added, figure captioned). The request to replace the hero fan-out with the Noul example is OVERRULED (see 6).
- Krug: "gm opener" unexplained. ADAPT: glossed as the standard setup text every subagent receives. The phrase is kept because the brief asks for it.
- Mace, Nielsen, Sennett: copy outcome silent on failure. ADAPT: live status line (`role="status"`, `aria-live="polite"`) with success and failure text; failure selects the command.
- Holmes: build-context terms and "state" unglossed. ADAPT: "in-session" wording replaced; "state" glossed; types lead added.
- Cairo: single unlike runs read as settled speed. ADAPT: "one value, not an average; runs differ in chunk size and parallelism" stated.
- Tufte: PASS. Optional shared-scale label added as ADAPT.
- Bringhurst: model name split across lines. ADAPT: `.nb` nowrap span.

### Round R2 (revised page, screenshots r2/)
Objections:
- Shklovsky: hero still the pipeline (repeat, see 6).
- Cairo: no run count or date; 30k and caching claims read as measured. ADAPT: 30k attributed to the README; caching marked "documented behaviour, not timed here"; example reply marked "not a measured result"; "The README records no run count or date" added.
- Bringhurst: empty status line reserves 24 px and pushes the plugin note away from the install card. ADAPT: `.status:empty` hides the empty line.

### Round R3
Objections:
- Shklovsky: repeat (see 6).
- Krug: Speed intro too wordy. ADAPT (R4 wording below).
- Mace: `display: none` removes the live region from the accessibility tree. ADAPT: `.status:empty { margin: 0; height: 0; }`.
- Sennett: "Measured inside an agent session" claims a measurement the README cannot date. ADAPT: "Recorded in the project README, with Haiku", with a link to the README's Speed section.
- Bringhurst: paragraphs and captions run past the measure. ADAPT: `p, figcaption { max-width: 66ch; }`.

### Round R4
Objections:
- Shklovsky: repeat (see 6), overruled.
- Bringhurst: figcaption still about 96 characters per line on desktop (measured 566 px at 1280 px). ADAPT after the report: `.hero-art figcaption { max-width: 50ch; }`. Measured after the change: 429 px at 1280 px, 343 px at 390 px. NOT re-judged by Bringhurst.
Round R4 was otherwise all PASS: Debord, Krug, Mace, Holmes, Nielsen, Tufte, Cairo, Sennett.

## 6. Overruled objections (with reason)
- **Shklovsky, hero diagram (R1, R2, R3, R4):** asked to replace the state, chunk, merge diagram with the Noul example and delete the figcaption. OVERRULED under the MAYA criterion of the Adaptive mode. Acceptable pole: a developer must recognise at once that the process fans out in parallel and merges, and the diagram carries the Arnheim mechanism anchor (M4). Advanced pole: the decision is now shown as an outcome in the example reply under the three question types, so the premise "the decision is never shown" no longer holds. Objection stays in the log and remains OPEN against S2.

## 7. Anchor Ledger
| Anchor | Role | Status | Evidence | Replacement or note |
|---|---|---|---|---|
| White (Kenya Hara) | Stance | KEEP | Hero restraint, M1; Mace and Holmes passes | Strongest objection survived: Shklovsky on the hero (overruled) |
| Universal Principles of Design (Lidwell, Holden, Butler) | Rule | KEEP | M1 hierarchy; Krug and Nielsen passes | none |
| Gestalt Principles of Perception (Wertheimer, Koffka, Köhler) | Rule | KEEP | M2 proximity; Tufte pass | none |
| CRAP Principles (Robin Williams) | Rule | KEEP | M2 spacing, section gaps | none |
| Art and Visual Perception (Rudolf Arnheim) | Rule | KEEP | M4 hero mechanism | Shklovsky overruled on this anchor's use |
| MAYA: Most Advanced Yet Acceptable (Raymond Loewy) | Welcome, dual criterion | KEEP | Governs the overruling in 6 | Shklovsky's objection is the live test of the advanced pole |
| Making and Breaking the Grid (Timothy Samara) | Breaker | KEEP | M3 bars at proportion; Tufte pass | Fence (single column) kept for text |
| Grid Systems in Graphic Design (Josef Müller-Brockmann) | Rule, counterpoint | KEEP | M3 dotted "loosens" applied: one scale, one baseline | none |
| Tufte Style | Catalog, counterpoint | DECLINED for M1 | Density counterpoint does not apply to a hero with no data | Applied only as the M3 fence |
| Chesterton's Fence (c_chest) | Catalog | KEEP | Fence recorded in M3 | none |
| Progressive Disclosure (c_prog) | Catalog, Frontier | OPEN | Named in M1 frontier effect; not taken | Resume point |
| ADR according to Nygard (c_adr) | Catalog | KEEP | Decision records follow the ADR form; named in M1 frontier effect | none |
| Dreyfus Model (c_dreyfus) | Catalog, Frontier | OPEN | Named in M3 frontier effect; not taken | Resume point |
| Art as Technique (Shklovsky) | Welcome, dotted from MAYA | OPEN | Critic voice in every round; dotted edge from MAYA not applied or declined | S5 unmet; resume point |
| The End of Print (Carson) | Breaker, dotted from MAYA ("acceptability limit on") | OPEN | Not addressed | S5 unmet; resume point |
| Debord, Shklovsky, Holmes, Mace, Krug, Nielsen, Tufte, Cairo, Sennett, Bringhurst (critic voices) | Panel | KEEP | Ten reports across R1 to R4 | Reference agents survived all four rounds |

Frontier entries not named above remain OPEN; see section 8.

## 8. Frontier (state at close)
OPEN: Designing Design (Kenya Hara); Occam's Razor (c_occam); In Praise of Shadows (Tanizaki); Against Interpretation (Sontag); The Art of Looking Sideways (Alan Fletcher); How to Use Graphic Design to Sell Things, Explain Things, Make Things Look Better (Michael Bierut); Progressive Disclosure (c_prog); ADR (c_adr); Laws of UX (Yablonski); Emotional Design (Norman); Art as Technique (Shklovsky); The End of Print (Carson); Diffusion of Innovations (Rogers); Designing with the Mind in Mind (Jeff Johnson); Chesterton's Fence (c_chest); Dreyfus Model (c_dreyfus); Art as Technique via making strange (Shklovsky).
TAKEN: Crap Principles (M2); Art and Visual Perception (M4); Grid Systems (M3, counterpoint applied); Gestalt Principles of Perception (seed edge).
DEFERRED: Tufte Style (reason: density counterpoint declined for the hero, M1).

## 9. Stop test and final-state measurements
Stop test (Step 4):
- S1 Frontier has no OPEN items: NOT MET. The OPEN list in section 8 remains.
- S2 WHOLE round with PASS from every required critic: NOT MET. R4 has Shklovsky OBJECT (overruled, not a PASS), and Bringhurst's figcaption change came after his R4 report.
- S3 Two consecutive clean WHOLE rounds: NOT MET. R2, R3 and R4 each produced ADAPT or OPEN items.
- S4 Ambition push on the boldest move, measured: NOT DONE. The BREAK move (M3) was not escalated.
- S5 Every dotted edge leaving a used anchor applied or declined: NOT MET. Applied: Müller-Brockmann (M3). Declined: Tufte Style (M1). Open: MAYA dotted to Art as Technique and to The End of Print.

Step 2g final-state measurements (procedure: headless Chromium, `docs/index.html` in an iframe, measured after the last edit, 1280 px and 390 px):
| Printed figure | Source | Procedure | Final value | Result |
|---|---|---|---|---|
| 5.3 s (5-question chunk) | README Speed line | rect width 530 / 100 | 5.3 | reproducible |
| 3.9 s (8-question chunk, parallel) | README Speed line | rect width 390 / 100 | 3.9 | reproducible |
| 6.4 s (8-question chunk, parallel) | README Speed line | rect width 640 / 100 | 6.4 | reproducible |
| bar proportion at 390 px | rendered SVG | svg width 343; rect width 530/640 x 343 = 284 px | proportional | reproducible |
| about 30k tokens per subagent | README Speed line | text match | 30k | reproducible (sourced) |
| "up to eight" per chunk | SKILL.md, README | text match | eight | reproducible |
| eight policies | `ul.policies li` count | DOM count | 8 | reproducible |
| three question types | `.types article` count | DOM count | 3 | reproducible |
| 0 to 1 confidence | SKILL.md output | text match | 0 to 1 | reproducible |
| no horizontal scroll | scrollWidth vs clientWidth | 390 px: 375 / 375; 1280 px: 1265 / 1265 | equal | reproducible |
| figcaption width (carry-forward fact) | getBoundingClientRect | 1280 px: 429 px; 390 px: 343 px | within 50ch | reproducible |
| status line empty height | getBoundingClientRect | 0 px | 0 | reproducible |
Dark palette: verified by a scratch copy with the media query replaced (the blink preferredColorScheme flag did not switch the media query in this build).

## 10. Double loop
The criterion did not fail the work: MAYA separated the Shklovsky objection (pipeline recognition) from the decision display, and the example reply addressed the substance. The panel did not fail either: the ten references produced concrete, checkable objections, and the measurements confirmed the claims they raised. The graph did partly fail: the Frontier (sections 2 and 8) grew faster than it closed, and the Frontier had no tool-backed query, so OPEN items accumulated. Graph amendment: add a pre-close step that moves each OPEN frontier item to TAKEN or DEFERRED with a reason before the stop test is run.

## 11. Compliance Check
- [x] Tooling inventory done; tool used for each job or "none available" (section 1)
- [x] Mode stated with the reason (section 1)
- [x] Seed with exact labels, including one dotted-edge counterpoint, and a living Frontier (section 1 and 2)
- [x] At least one BREAK move taken; no quota used as a stopping rule (M3)
- [x] Decision Record written before each move, with all fields filled (section 3, before the build in section 4)
- [x] Panel Report per round from a panel meeting the mode's composition rule, each critic citing something observable (section 5; ten reference agents; composition: Provocateur, Inclusion, Usability, Evidence, Craft)
- [ ] Every OBJECT resolved as ADAPT, SCRAP or OVERRULE, with dependents reopened: Shklovsky resolved as OVERRULE, Bringhurst R4 ADAPTed but not re-judged; dependent-move REOPEN not formally recorded
- [ ] WHOLE rounds run; S1 to S5 each shown as met: rounds R1 to R4 run; S1 to S5 NOT MET (section 9)
- [x] Every figure the artifact displays re-measured at the final state, with the procedure (section 9)
- [ ] Anchor Ledger complete and the live graph updated: ledger written (section 7); no graph tooling, so the live graph is not updated
- [x] Double-loop paragraph written (section 10)
- [x] Final reply states the mode, the tools used, the stop conditions and everything skipped (final reply)

## 12. Status
Run INCOMPLETE. Stop conditions S1 to S5 are not met. Resume point: resolve the Shklovsky hero objection (adopt or keep the overruling), re-judge Bringhurst on the 50ch figcaption, close the Frontier (section 8), apply or decline MAYA's dotted edges to Art as Technique and The End of Print, then run WHOLE rounds until two consecutive are clean.
