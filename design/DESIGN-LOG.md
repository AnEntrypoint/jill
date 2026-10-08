# DESIGN-LOG: jill GitHub Pages landing page

Output: `docs/index.html` (single file, inline CSS and SVG, one inline copy-button script, no build step).
Brief in one sentence: a friendly landing page that says what jill is, gives the install command with a copy button, explains the three-step flow and the three question types, lists the eight policies, quotes only the measured speed figures, and links to the repository.

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

## 13. Resumed run (run 2): R0 premortem, moves M5 to M9, whole rounds W1 onward

Resumed from section 12. Tooling this run: no graph or Mermaid tool and no task-list tool were in the tool list (the deferred list had no graph, diagram or task tools), so the Frontier stays a table here. Panel: Agent tool, one general-purpose agent per literary reference (ten agents), each given only the page, its screenshots and the skill files, and each fresh (no history from run 1, so run 1 verdicts are not carried in). Render: `/usr/bin/chromium --headless --no-sandbox`, screenshots in the session scratchpad. Measurement: `measure.html` in the scratchpad, an iframe of the page read with `--allow-file-access-from-files --virtual-time-budget --dump-dom`. Figures below are from that script.

Source check before the premortem: `README.md`, `SKILL.md` and `references/policies.md` were read. `policies.md` now holds eleven policy sections (adds Pull request risk, Incident severity, Personal data, all dated after the page was last built). The page still said "Eight ready-made policies". This is a factual drift, found by the source check and then by Tufte.

### Round R0 (premortem, WHOLE, on the page as inherited, before any move)
| Critic (reference) | Verdict | Objection (short) |
|---|---|---|
| Debord | OBJECT | Speed bars and hero diagram are images the reader cannot use; the install row is the only usable object |
| Shklovsky | OBJECT | Hero is a recognised pipeline; "Eight" policies with no worked sample; bars compare disclaimed runs; JSON breaks |
| Holmes | OBJECT | Prerequisites unstated; "Noul", "state" unglossed; JSON wraps at 390 px |
| Mace | OBJECT | "Noul" and "state" unglossed; policies not linked; JSON breaks; Copy target 40 px (below 44) |
| Krug | OBJECT | Word count of speed section; "state" undefined; "Noul" unglossed; package name jill vs richard |
| Nielsen | OBJECT | "Jev" never expanded; policies not linked; bars invite comparing unlike runs; Score card wraps keys |
| Tufte | OBJECT | Heading "Eight" vs eleven in policies.md; "rough" caveat dropped; JSON keys split |
| Cairo | OBJECT | Unlike runs read as comparable; no run count or spread; "First/second chunk" reads as sequential |
| Sennett | OBJECT | Hand-broken JSON specimens; uneven card depths; closed policy list |
| Bringhurst | OBJECT | Policy list runs about 84 characters per line; code gets about 25 characters per line in cards; h3 at body size |

Premise checks made before any objection was accepted:
- Nielsen "gm opener unexplained": refuted. The page text reads "the standard setup text every subagent receives". Overruled with that text as the measurement.
- Tufte "eight policies": confirmed. `policies.md` has eleven sections. Accepted as a fact fix.
- Cairo "no run count": confirmed. The README gives no run count or spread. Accepted as a caveat fix.
- Holmes "prerequisites": the README gives no prerequisite statement, but `npx` needs Node.js. Accepted only as the plain statement "Needs Node.js for npx".

### Move M5: Policy list matches the source (KEEP-THE-RULE)
Depends on: none. Anchors: Rule ADR according to Nygard is not used; the anchor is c_feynman (Feynman Technique, plain-language check against the source) for c_adr, and c_qas (Quality Attribute Scenario) for the testable claim. Counterpoint: none used.
Intent: the printed count and list equal `references/policies.md`; each policy links to the file; one worked triage question set is shown as a card-like block.
Alternatives rejected: (a) keep "Eight" and name the eight, rejected because it stays false to the file; (b) link only, with no list, rejected because the list is the page's only description of the skill's policies (Shklovsky, Sennett, Nielsen).
Consequence: the page is longer by about 3 policy rows and the triage block (measured below).
Fence: none broken.
Frontier effect: opens the source-check procedure for every printed count (2g).
Mode field: Advanced pole: the printed count is checked against the source file. Acceptable pole: each policy keeps its one-line description.
Measured: policy items 8 to 11 (`ul.policies li` count); the link to `references/policies.md` resolves to the GitHub path.

### Move M6: Code specimens keep their lines (KEEP-THE-RULE)
Depends on: none. Anchors: Rule Gestalt Principles of Perception (grouping by line: one key, one line) and Universal Principles of Design (aesthetic-usability). Counterpoint: none used.
Intent: each specimen is pretty-printed one key per line, `white-space: pre`, with horizontal scroll inside its own box, never breaking a key from its value.
Alternatives rejected: (a) keep pre-wrap, rejected because it breaks `"question":` from its value (seven critics); (b) shorten the examples, rejected because it drops fields the skill documents.
Consequence: the three type cards stack in one column; each card is taller.
Fence: none.
Frontier effect: none.
Mode field: Advanced pole: the three specimens read as the same shape. Acceptable pole: at 390 px a key is never split; the long line scrolls inside its box.
Measured (390 px, page scroll width unchanged at 375 = 375): Choice pre scroll 488 vs client 309 (internal scroll only); Score 309 vs 309; Noul 420 vs 309 (internal scroll); example reply 343 vs 343; triage 572 vs 343 (internal scroll). At 1280 px all five fit (scroll equals client).

### Move M7: Speed bars keep their conditions and their caveat (ADAPT, not removal)
Depends on: M5 (the layout change moved the section). Anchors: Tufte Style is not used; the anchor is Cairo's conditions rule (Critic: Evidence) and c_prog is not used. Grounds: `SKILL.md` lines 82 to 91 ("treat the timings as rough"; single samples).
Changes: row labels quote the README's conditions ("one 5-question chunk"; "one of two 8-question chunks dispatched in one message"; "the other of two..."); the caption says each figure is a single sample, the README gives no run count or spread, and the skill says to treat the timings as rough; a tick mark every second is drawn on the same 640-unit scale (7 ticks, one `path`).
Alternatives rejected: (a) remove the bars (Debord, Krug, Shklovsky), overruled, see below; (b) table, rejected for hiding proportion (M3 reason stands).
Consequence: the axis is now a measured instrument, so the ticks are themselves evidence.
Fence: M3 break kept.
Mode field: Advanced pole: one scale with second ticks (a scale a reader can count). Acceptable pole: every bar has its condition in words.
Measured (390 px): bar rect widths 284.05, 209.02, 343 px at svg width 343 (530, 390, 640 of 640); ticks path present, svg width 343; at 1280 px the bars are 556.5, 409.5, 672 px at svg width 672 (same proportion).

### Move M8: Labels a visitor can read (ADAPT)
Depends on: none. Anchors: Rule Universal Principles (aesthetic-usability), Nielsen's visibility of status is not used; the anchor is Krug's trunk test (not in graph; catalogued as the Krug node in Welcome, grounded by "usability for"). Counterpoint: none used.
Changes: lead names "TypeSafe's Jev, a cloud decision model"; "Noul" becomes "Noul (yes or no)"; "Needs Node.js for npx. jill is one skill in the jill repository."; Copy target min-height 44 px; h3 at 1.2rem (19.2 px against 17 px body); policy list capped at 66ch.
Measured: h3 font 19.2 px (was 16.8); Copy min-height 44 px (was 40); policy li box 343 px at 390 px and 642 px at 1280 px (cap is 66ch in the element's own font).

### Move M9: Speed push (BREAK escalation, for S4)
Depends on: M7. Anchors: Making and Breaking the Grid (Samara) is the breaker; Grid Systems (Müller-Brockmann) is the dotted counterpoint, applied again by the tick scale on one baseline.
Intent: the bars become a measured instrument: one 0 to 6.4 s scale with a tick per second and a shared baseline.
Measured change: M7 tick path added (zero ticks before, seven now). Bar lengths unchanged in proportion. The push changed the rendered work by seven tick marks and the caption, measured in the DOM.
Result: pending W1.

### Overruled objections (with reason)
- Debord and Shklovsky (R0), and Krug ("drop the chart"): the bars are the page's one structural break (M3). Governing criterion MAYA: the advanced pole is the shared scale, the acceptable pole is the printed figure with its condition. Both poles are kept. OVERRULED under MAYA, not a refusal to read.
- Nielsen ("gm opener unexplained"): premise refuted by page text ("the standard setup text every subagent receives"). OVERRULED on that measurement.
- Holmes ("prerequisites"): accepted as the Node.js line, so not overruled.

### Anchor Ledger additions (run 2)
| Anchor | Role | Status | Evidence | Replacement or note |
|---|---|---|---|---|
| Feynman Technique (c_feynman) | Catalog, check against source | KEEP | M5: policy list matched to file | Used for the source check |
| Gestalt Principles (grouping by line) | Rule | KEEP | M6 specimens | Pre-wrap objection survived |
| Universal Principles (aesthetic-usability) | Rule | KEEP | M6, M8 | none |
| Making and Breaking the Grid (Samara) | Breaker | KEEP | M9 push measured (7 ticks) | M3 fence kept for text |
| Grid Systems (Müller-Brockmann) | Counterpoint | KEEP | M9 ticks on one baseline | none |
| Art and Visual Perception (Arnheim) | Rule | KEEP | hero unchanged | Debord and Shklovsky diagram objection still open |
| MAYA (Loewy) | Welcome | KEEP | governs overrulings above | none |

### S5 dispositions (every dotted edge leaving an anchor used in a record)
Edges checked against the graph text (dotted, outgoing from a used anchor):
- White (Kenya Hara) -.-> Tufte Style, "emptiness counterpoint to": DECLINED (run 1, M1; no data in a hero).
- MAYA -.-> Art as Technique, "tempers strangeness of": APPLIED. Strangeness is limited to the one tick scale (M9) and each bar keeps its condition in words (M7). Shklovsky still objects; see W1.
- MAYA -.-> The End of Print, "acceptability limit on": DECLINED. The page uses no expressive typography; the limit is respected by construction (no breaker type anywhere on the page).
- Art as Technique -.-> Art (Kahneman), "making strange counters cognitive ease of": DECLINED. Cognitive ease is checked by the Perception critic path, not run here; the page keeps one strange object (the bar scale), so the counter applies to one element only.
- Chesterton's Fence -.-> Popper, "ask why the anchor was there before scrapping": APPLIED in the deletion review (2f): asked why each element predates this run; none scrapped. Why each survives: the policy list (the skill's only description of policies), the bars (the speed record), the install row (the page's purpose).
- Chesterton's Fence -.-> Weingart, "gate passed before": APPLIED. The fence for breaking the grid is recorded in M3; the gate was passed before M9.
- The End of Print -.-> Emigre, "same digital moment as": DECLINED: no digital-era type reference is used on the page.
- Grid Systems -.-> none (no dotted edge leaves it); Samara -.-> Müller-Brockmann: APPLIED (M9).
- Usability (Krug, Nielsen) and Provocateur (Debord, Shklovsky) dotted pair ("attacks smoothness", "demands clarity"): both critics sat on this round, and the pair's disagreement is the R0 bar objection; resolved by the overruling above.
- Evidence (Tufte, Cairo) -.-> Wit ("demands honesty from"): DECLINED: Wit is not on the Adaptive panel; the honesty demand is met by the 2g re-measurement.

### Frontier (after R0, before moves)
New OPEN from R0: policy count and list (M5, TAKEN); code specimens (M6, TAKEN); speed conditions and caveat (M7, TAKEN); "state" and "Noul" glossing (M8, TAKEN); prerequisites (M8, TAKEN); speed push (M9, TAKEN).
Run-1 OPEN items, each now TAKEN or DEFERRED with a reason:
- Designing Design (Hara): DEFERRED, the page has no further stance to add beyond M1.
- Occam's Razor: DEFERRED, the page is already cut; no further deletion found in 2f.
- In Praise of Shadows (Tanizaki): DEFERRED, no shadow or contrast move on a light page.
- Against Interpretation (Sontag): DEFERRED, the page does not interpret the figures; it states them.
- Art as Technique: TAKEN (S5 applied; M7 and M9).
- The Art of Looking Sideways (Fletcher), How to Use Graphic Design (Bierut): DEFERRED, wit is not a welcome move the brief asks for.
- Progressive Disclosure (c_prog): DEFERRED, the page is one scroll; disclosure would hide the policies, which the brief requires.
- ADR (c_adr): TAKEN as the decision-record form for this log; the page carries no decision record.
- Laws of UX (Yablonski), Emotional Design (Norman), Diffusion of Innovations (Rogers), Designing with the Mind in Mind (Johnson): DEFERRED, no new element to judge; the Usability and Inclusion critics covered them in R0.
- The End of Print (Carson): DECLINED under S5 (see above).
- Chesterton's Fence, Dreyfus Model: Chesterton TAKEN (S5); Dreyfus DEFERRED: the expert stage is the M9 push, which is recorded.

Status after R0 and M5 to M9: not yet closed. Next: whole round W1 on the revised page (ten agents), then S2 and S3 tests.

## 14. Whole round W1, source change, and the chart's supersession

### Round W1 (WHOLE, on the page after M5 to M9; screenshots r1/)
| Critic (reference) | Verdict | Main objection |
|---|---|---|
| Debord | OBJECT | The speed figures 5.3, 3.9, 6.4 and 30k are not in the README as it now stands (see the source change below). The hero is a picture, not a working part |
| Shklovsky | OBJECT | Hero is seen before it is named; the figcaption closes the reading; triage JSON clipped at 390 px |
| Holmes | OBJECT | Clipped examples at 390 px; undefined jargon ("Jev", "gm", "noul") in the lead and speed text |
| Mace | OBJECT | Examples clip behind a scrollbar; speed ticks have no numbers |
| Krug | OBJECT | Speed hedging is too long; "state" and "Jev" undefined; the Noul block clips |
| Nielsen | OBJECT | Clipped code (visibility); no flagged example, so a reader cannot see what an error looks like |
| Tufte | OBJECT | Speed figures not traceable to README.md or SKILL.md; "30k tokens" is not in the README (it says 16.5k); clipped code |
| Cairo | OBJECT | Ticks unlabelled; each single sample drawn as a precise bar; unlike runs side by side |
| Sennett | OBJECT | Clipped schema at 390 px; the chart closes a question the prose leaves open |
| Bringhurst | OBJECT | Five sizes within 30 percent; clipped code at 390 px; tick explanation sits where numerals belong |

### Source change found by W1 (not by the panel's taste)
`README.md` and `skills/jill/SKILL.md` were rewritten at 07:09, after this run's first read at about 07:03. The README's Speed section now reads: 3.4 s and 4.1 s for one 8-question set (low effort, about 16.5k tokens each), 3.4 s versus 8.9 s at default effort, 2.8 s for two 4-question calls, 2.4 s for a two-question escalation to `sonnet`. The SKILL's speed notes add 8.5 s for one 16-question chunk at default effort (in the brief's list). The README no longer contains 5.3 s, 3.9 s, 6.4 s, 5.0 s, 2.0 s, 4.5 s or 30k.
Checked: `grep` of the README and SKILL for each figure of the brief's list returns only 8.5 s (SKILL, 16-question chunk). The 2.4 s in the current sources is a different measurement (sonnet escalation), not the brief's cold 8+2 run. So the brief's speed list no longer matches the sources, and the page cannot print it and still cite the README.

Decision (recorded as the Frontier item "speed figures"): the page prints only figures that are on the brief's list and are in the current sources, which is 8.5 s. Everything else is attributed to the README and SKILL in words. This is a conflict between the brief and the sources, and it is reported to the user rather than resolved by printing old numbers under a current citation.

### Supersession of the chart (M3, M7, M9)
- M3 (speed bars at true proportion, the run's BREAK) and M7 (bars with conditions) are SCRAPPED. Reason: the figures they drew are no longer in the cited source; a chart cannot cite a figure its source lacks. Retained-value ledger: the two facts the bars carried (the shared scale and the conditions of each run) are kept in words, and the single-column fence returns.
- M9 (ticks, the S4 push) is SCRAPPED with M3, for the same reason.
- Chesterton's Fence applied to M3: why the bars existed (print the speed figures at true proportion so the claim is seen) is no longer a reason, because the claim is gone. The fence is removed.

### Move M5 to M8 revised; M6 specimens (KEEP-THE-RULE, revised)
- M6 (revised): each specimen is pretty-printed one key per line, and the long lists are broken per item, so that at 390 px no line is longer than the box. The triage example is a shortened copy (labelled as shortened, with the full set in policies.md). Measured at 390 px: `pre` scrollWidth equals clientWidth for all five blocks (313/313, 313/313, 313/313, 343/343, 343/343). At 1280 px the same holds (638/638, 672/672). The earlier internal scroll is gone, which answers the Nielsen and Mace clipping objections without a key split.
- M5 holds: eleven policy items (`ul.policies li` count 11), the link to `references/policies.md` resolves to the GitHub path, the triage example sits under the list.
- M8 holds: the lead names TypeSafe's Jev; "Noul (yes or no)"; "Needs Node.js for npx"; Copy min-height 44 px (measured 44); h3 19.2 px.

### Move M10 (S4 push): full-bleed install band (escalated, measured, then SCRAPPED)
Intent: the install row leaves the 44rem column at 640 px and up, so the only action is the widest object on the page.
Measured change, at 1280 px: `.install` width 672 to 1280 (the full viewport), cmd left 309.5 to the band edge.
Finding: the band uses `calc(50% - 50vw)`, and 50vw counts the vertical scrollbar. Measured `scrollWidth` 1273 against `clientWidth` 1265: an 8 px horizontal overflow in the page. `body { overflow-x: hidden }` hides it on screen, but the page is not clean by its own measure. Reverted; the push left a measured delta and an overflow finding, so it is SCRAPPED. The intended lever (width of the band) moved; the lever that cost was the viewport unit, recorded for the carry-forward.

### Overruled objections (this round)
- Debord, Krug, Shklovsky (R0 and W1), against the bars: superseded by the source change; no longer an overrule question.
- Nielsen (R0): "gm opener unexplained". Overruled earlier on the page text; the text does gloss it ("the standard setup text every subagent receives").
- Holmes and Krug (W1): "Jev" and "noul" undefined. Partly ADAPT (the lead names Jev; "Noul (yes or no)"). Shklovsky (W1): hero seen before named. OVERRULED under MAYA: the hero diagram is kept (Arnheim mechanism anchor); the figcaption is kept because it is the only text that says the state is the reader's text.

### Status
W1 objections resolved by the moves above: clipping (M6), jargon (M8), speed figures (scrapped), triage example shortened. Open: Shklovsky hero objection (overruled, not PASS); Debord hero objection (overruled). S4 push is recorded as SCRAPPED with its measured delta. Next: whole round W2 on the current page (ten agents), then judge S2 and S3.

## 15. Whole rounds W2 to W5, the stop test, and the close

### Rounds (ten fresh reference agents each; no critic saw another's verdict)
| Round | Required critics PASS | Objections raised (all OBJECT unless noted) | Action |
|---|---|---|---|
| W2 | 0 of 10 | Hero is a pipeline (Debord, Shklovsky); triage is reworded but captioned "shortened" (Holmes, Mace, Nielsen, Tufte, Sennett, Bringhurst, Shklovsky); the state is "split" in the caption where SKILL step 1 copies it (Cairo); Explore read-only rule missing (Shklovsky, Sennett, Bringhurst); 0.6 rule missing (Mace, Sennett, Nielsen); a 2x8 "slower" claim with no 8-question basis (Cairo, Tufte) | ADAPT: caption fixed to "copied into each chunk"; Explore rule and 0.6 rule added; error-recovery sentence added; triage caption kept honest. OVERRULED: hero pipeline (MAYA: the acceptable pole is the mechanism; the advanced pole is the example reply and the failed answer, both on the page) |
| W3 | 0 of 10 | Triage caption still wrong for some (Tufte, Bringhurst); speed comparison unsupported (Tufte, Cairo, Sennett); "ready to paste" but only triage on page (Sennett, Holmes, Mace); hero generic (Shklovsky); the speed section cites a figure the README now lacks (Debord) | ADAPT: caption "Reworded from policies.md to fit a phone. The exact triage set is in that file." Speed prose trimmed. OVERRULED: a full run in the hero (the example and the failed answer already show outputs; a second run doubles the page) |
| W4 | 0 of 10 | Hero still generic (Shklovsky); install path needs Claude Code named (Holmes, Mace); "batch" and "noul" terms (Holmes, Krug, Mace); `.types` one column at 1280 (Mace, Sennett); the 8-question timing not shown (Nielsen, Cairo) | ADAPT: hero reduced to two chunk boxes labelled "8 questions" and "2 questions" (rule: chunks of up to eight; README cold 8+2 run); "In Claude Code you can add it as a plugin"; "question list" replaces "batch". OVERRULED: `.types` single column (measured: at 3 columns the code would scroll inside each card, rule 11 in CARRY-FORWARD); "Jev" and "noul" are glossed in the text (premise false) |
| W5 | 0 of 10 | Speed section lacks the 8-question timings and tokens (Tufte, Cairo, Nielsen, Holmes); "Noul" heading (Krug); page length (Krug, Nielsen); copy controls for each policy (Mace); plugin line at 15px (Bringhurst); calibration not measured (Cairo) | Not actioned in this run (see Frontier, deferred with reasons). Premise tests: `subagent-prompt.md` says "Reply with JSON only" and "calibrated confidence", so that claim stands; the calibration claim is the source's instruction, not a measurement, so the page must not claim a measured calibration (the page does not) |

Andon (the critic's stop-the-line flag) was pulled by none of the ten critics in W5. The factual drifts found earlier were the triage caption (fixed to "Reworded") and the unsupported 2x8 comparison (removed in W3 and W4).

### Final-state measurement (step 2g), after the last edit (W5 measurement file, run after the last page edit)
| Printed figure | Source | Procedure | Final value | Result |
|---|---|---|---|---|
| 8.5 s, one 16-question chunk | SKILL.md speed notes | DOM text match (`8.5 s`) | present once | reproducible |
| eleven policies | `references/policies.md` | `ul.policies li` count | 11 | reproducible |
| three question types | page | `.types article` count | 3 | reproducible |
| "Ten questions split into a chunk of eight and a chunk of two" | SKILL.md step 1 (chunks of up to eight) and README cold 8+2 | text match; hero SVG text "8 questions" and "2 questions" | 8 and 2 | reproducible |
| 0.6 threshold | SKILL.md Rules ("Below 0.6") | text match | 0.6 | reproducible (source rule, not measured) |
| 0.97 in example | page example, labelled "not a measured result" | text match | 0.97 | reproducible (example) |
| "about one second" noise | README speed section | text match | about one second | reproducible |
| "not_an_option" | SKILL.md Output | text match | present | reproducible |
| "MIT" | README License | text match | MIT | reproducible |
| install command | README Install | `#cmd` text | `npx skills add AnEntrypoint/jill` | reproducible |
| no horizontal page scroll | `scrollWidth` vs `clientWidth` | 390 px: 375 / 375; 1280 px: 1265 / 1265 | equal | reproducible |
| every `pre` fits its box | `scrollWidth` vs `clientWidth` | 390 px: 313/313, 313/313, 313/313, 343/343, 343/343, 343/343; 1280 px all equal | equal | reproducible |
| hero label, rendered | computed font x svg width / 540 | 390 px: 16.51 px; 1280 px: 23.11 px (below the 24 px h2) | 16.5 and 23.1 | reproducible |
| copy target height | `getBoundingClientRect` | 44 px | 44 | reproducible |
| header GitHub target | `getBoundingClientRect` | 44 px | 44 | reproducible |

Re-measured after the last edit: yes. The final page edit came before the W5 measurement, and no page edit has been made since.

### Stop test (Step 4)
- S1 (Frontier has no OPEN item; each TAKEN or DEFERRED with a reason): MET, with the deferrals below.
  - Speed beyond 8.5 s (dot plot, 8-question timings, tokens): DEFERRED. Reason: the brief's list no longer matches the README or SKILL (rewritten 07:09), and printing the README's current 3.4, 4.1, 8.9 or 16.5k figures breaks the brief's "only these speed figures". Needs a user decision on which figures are authoritative.
  - Three-column type cards: DEFERRED. Reason: measured code overflow inside each card at 3 columns (CARRY-FORWARD 11).
  - Copy control or inline set for each policy: DEFERRED. Reason: the question sets live in `references/policies.md`, which the page links. Printing eleven sets makes the page a copy of the file.
  - Calibration evidence for the 0.6 line: DEFERRED. Reason: no accuracy measurement exists in the three sources; the page states the rule as the skill's rule and does not claim it was measured.
  - "Replies with JSON only": TAKEN, verified against `references/subagent-prompt.md`.
  - Hero as a full real run: OVERRULED (W3), as above.
- S2 (a WHOLE round with PASS from every required critic and no Andon): NOT MET. Round W5: 0 of 10 required critics PASS. The objections are small and fixable, but the rounds did not converge.
- S3 (two consecutive clean WHOLE rounds): NOT MET. W2 to W5 each produced ADAPT-able items. No two consecutive clean rounds.
- S4 (ambition push, measured, logged): MET as logged. Push: M10, full-bleed install band. Measured change at 1280 px: `.install` width 672 to 1280 px. The push also measured an 8 px overflow (scrollWidth 1273 vs 1265). It was reverted (SCRAPPED). The skill counts a logged measured delta; the push did not survive, so S2 and S3 do not need re-running for it. The Breaker that the run started with, M3 (speed bars at true proportion), was SCRAPPED for a source reason, not by the panel.
- S5 (every dotted edge from a used anchor applied or declined with reason): MET. The section 13 list holds. Update: Samara -.-> Müller-Brockmann ("loosens"): the tick scale (M9) that applied it was SCRAPPED with M3 for a source reason, so the edge is now DECLINED for the page. Reason: no bar chart remains to loosen the grid.

### Double loop
The criterion did not fail the work: MAYA separated the hero objection (the mechanism is the acceptable pole, the decision shown in the example is the advanced pole) and it held through W5. The panel failed the run in one way: the rounds did not converge, because each round asked for more evidence than the sources contain (speed comparisons, calibration), and the sources changed under the run. The graph amendment: add a step before any WHOLE round, in which every printed figure is checked against the current source, so that a source change is caught before the panel sees the page. Graph amendment (one concrete node): add "source freshness check" to Step 2g, run before each whole round, not only before the stop test.

### Compliance Check (run 2)
- [x] Tooling inventory: no graph, diagram or task-list tool in the tool list; panel via Agent tool; render via `/usr/bin/chromium --headless` (section 13)
- [x] Mode stated with reason: Adaptive (section 1, unchanged)
- [x] Seed with exact labels, dotted counterpoint, living Frontier (sections 1, 2, 13, 15)
- [x] BREAK taken (M3, then M9 and M10); no quota used as stop rule
- [x] Decision Record before each move (M5 to M10, section 13 and 14)
- [x] Panel Report per round from ten reference agents (R0 in section 13; W1 in 14; W2 to W5 in 15)
- [ ] Every OBJECT resolved as ADAPT, SCRAP or OVERRULE with dependents reopened: resolved in each round; dependents of M3 REOPENED and SCRAPPED (M7, M9); M5 to M8 remain open for W5 items (see Frontier)
- [ ] WHOLE rounds run and S1 to S5 met: rounds run; S2 and S3 NOT MET
- [x] Figures re-measured at final state (table above)
- [x] Anchor Ledger: rows in sections 7 and 13; live graph not updated (no graph tooling)
- [x] Double-loop paragraph written (above)
- [x] Final reply states the mode, tools, stop conditions, skipped steps (final reply)

### Status
Run INCOMPLETE. S1, S4 and S5 are met as logged. S2 and S3 are not met. Open frontier at close: the speed-figure question (needs the user to say which README figures are authoritative, since the brief's list no longer matches the sources); the three-column type cards and per-policy copy controls (deferred, reasons above); the W5 items deferred above. Resume point: decide the speed figures; then run a source freshness check and WHOLE rounds W6 onward until two consecutive rounds are clean.

## 16. Run 3: W5 objects resolved, source check, rounds W6 onward

Mode Adaptive (unchanged). Tools: Agent (ten general-purpose agents, one per reference, fresh each round); headless `/usr/bin/chromium --headless --no-sandbox`; `measure.html` and screenshots in the session scratchpad (outside the project). `gm` dispatch via the spool: phase SPECIFY; the response reported `config-source` unresolved (builtin defaults) and a gate `browser-witness-coverage` not in the compiled registry. Surfaced here, not worked around.

### Source freshness check (before W5 is judged; the graph amendment from section 15)
- README Speed section: 3.4 s, 4.1 s, 8.9 s, 2.8 s, 2.4 s, 16.5k tokens, about one second of noise. All present. `8.5 s` is NOT in README (it is SKILL.md's 16-question chunk). The page printed 8.5 s, so it broke the brief's rule that README is the only speed source. Corrected by M11.
- `references/policies.md`: 16 `##` headings, 15 of them carry a JSON question set (the 16th, "Acting on answers", has none). The page said "Eleven". Corrected by M12.
- No "calibrat" in the page's visible text (0 before and after). SKILL.md and README use the word; the page does not claim it.

### Premise checks (DADA 2d) for each W5 object
| W5 object | Premise measured | Premise | Resolution |
|---|---|---|---|
| Tufte, Cairo, Nielsen, Holmes: speed lacks the 8-question timings and tokens | Page text before the edit: `3.4 s` absent, `8.5 s` present | TRUE | ADAPT (M11) |
| Krug: "Noul" heading is jargon | The card beneath it holds `"type": "noul"`; SKILL.md uses the same word | FALSE for the heading (it names the value the reader writes) | OVERRULE |
| Krug, Nielsen: page length | `bodyScrollHeight` 5765 px at 390 px, 5147 px at 1280 px (before M11 to M14) | TRUE as measured; the length is the policy sets and the three question types the brief asks for | OVERRULE (MAYA: the acceptable pole is the page's content, not its height) |
| Mace: a copy control for each policy | One copy control, 44 px high; every set is in `policies.md`, which the page links | TRUE | DEFERRED (reason in section 15 stands; S1) |
| Bringhurst: plugin line at 15 px; five sizes within 30 percent | Computed sizes before the edit: 13, 14, 15, 16, 17 px (code, caption, body) | Sizes TRUE; 15 px is the shared caption size (figcaption, status, footer, plugin line) | ADAPT for the code sizes (M14); OVERRULE for the caption |
| Cairo: calibration not measured | `calibrat` count in innerText: 0 | FALSE for the page | OVERRULE |

### Move M11: speed figures from README only (ADAPT)
Depends on: none. Anchors: Rule Quality Attribute Scenario (c_qas, a testable claim), Rule Feynman Technique (c_feynman, plain-language check against the source). Counterpoint: none used.
Change: the speed section prints the README's figures with their conditions as a four-item list (3.4 s and 4.1 s at low effort with about 16.5k tokens; 8.9 s at default effort; 2.8 s for two parallel 4-question calls at twice the tokens; 2.4 s for a sonnet escalation). The 8.5 s line is removed.
Measured (text match against README.md): all six figures found; `8.5 s` on the page: false.
Residual diff: intended (speed text and list). Inert: none. Regression: none found.

### Move M12: policy count and list from the file (ADAPT, source drift)
Depends on: none. Anchors: Feynman (c_feynman). Counterpoint: none used.
Change: heading "Eleven ready-made policies" becomes "Fifteen ready-made question sets". Four sets are added (search result selection, evidence sufficiency, next browser action, handoff worthiness). The memory filter line now names its second question (instructions aimed at an agent).
Measured: `ul.policies li` count 11 before, 15 after; JSON question sets in policies.md: 15.

### Move M13: triage caption matches the copy (ADAPT)
Depends on: none. Anchors: Feynman (c_feynman).
Compared character by character with policies.md: ids `kind`, `urgency`, `human` identical; types and options identical; question `How urgent is it?` identical; `What kind of message is this?` shortened to `What kind is it?`; `A person must see this now.` shortened to `Needs a person now.`. The caption now says so: "Same ids, types and options as policies.md. Two questions are shortened so each line fits a phone's width."
Measured: triage `pre` scrollWidth equals clientWidth at 390 px (343/343) after the edit. Without the shortening, the longest line (48 characters) would scroll.

### Move M14: one code size (ADAPT, Bringhurst's scale premise)
Depends on: M13 (the triage block is a code block). Anchors: Rule Universal Principles (aesthetic-usability). Counterpoint: none used.
Change: `pre` is 13 px at every width (it was 14 px on desktop and in the triage block on phones).
Measured after the edit: all six `pre` blocks 13 px at 390 and 1280 px; scrollWidth equals clientWidth for every block (390: 313/313 x3, 343/343 x3; 1280: 638/638 x3, 672/672 x3). Sizes now on the page: 13 code, 15 caption, 16 and 17 body, 18.4 lead, 19.2 h3, 24 h2, 26 hero label, 36 and 56 h1.

### S5 correction (dotted edges from used anchors)
Section 13 recorded two edges as APPLIED through moves since scrapped. Re-decided:
- MAYA -.-> Art as Technique ("tempers strangeness of"): was APPLIED through M9, which is SCRAPPED. The page now has no strange element to temper. Now DECLINED for this run, with that reason.
- Chesterton's Fence -.-> Weingart ("gate passed before"): was APPLIED through the M3 fence, which is SCRAPPED. No grid break remains, so no gate. Now DECLINED for this run.
- Other dotted edges: as section 15 recorded (Tufte Style declined; Samara -.-> Müller-Brockmann declined; Popper applied in 2f; Provocateur and Usability pair recorded in section 13; Evidence -.-> Wit declined, no Wit critic).

### Rounds

#### Round W6 (WHOLE, ten fresh agents, page after M11 to M14; screenshots at true 390 px and 1280 px)
| Critic (reference) | Verdict | Main objection | Premise check | Resolution |
|---|---|---|---|---|
| Debord | OBJECT | Hero figure is a picture; labels shrink to about 17 px at phone width; 704 px column leaves empty sides | Hero label 16.5 px at 390 px (measured in run 2, true) | Hero region: FRAME SWAP (below). Empty sides: OVERRULE (White stance, M1) |
| Shklovsky | OBJECT | Replace the 15-item list and the triage block with one real run | The example reply is labelled "not a measured result" (true) | Hero region: FRAME SWAP. List and worked block: OVERRULE (the list is the brief's policy content; a single run is one sample of 15 sets) |
| Holmes | OBJECT | `pre` at 13 px is 81% of body; add tabindex to every `pre` | At true 390 px, the three type-card `pre` blocks fit at 14 px (scrollWidth 328 = clientWidth 328); no `pre` overflows at 13 px, so no focus stop is needed | 14 px: ADAPT deferred under the 3-round rule (see below). tabindex: OVERRULE (no overflow to scroll) |
| Mace | OBJECT | `pre` at 15 px; stop shortening the triage questions | 15 px is not measured here; verbatim triage text at 13 px is 400 px in a 358 px box (overflow, measured) | Shortened wording kept: OVERRULE (overflow measured). 15 px: OVERRULE (the 14 px fit is the ceiling for the type-card width, see Holmes) |
| Krug | OBJECT | Lead names Jev before saying what jill does | The lead's first clause says what jill does ("answers small typed questions ... using a claude-haiku-5-5 subagent"); Jev follows and is glossed as "a cloud decision model" (text, true) | OVERRULE on that text |
| Nielsen | OBJECT | Wrap the policy list and worked block in `details`; page is about 16 screens | Page height 6404 px at 390 px before the frame swap (measured); policy list is the content the brief requires; c_prog is DEFERRED with this reason in section 15 | OVERRULE (MAYA; c_prog reason stands) |
| Tufte | OBJECT | Hero 8 and 2 boxes are equal size (1:1 for 4:1); speed list ranks differences inside the noise | Boxes both 160x48 (true). Speed: 2.8 s vs 3.4 s is 0.6 s, inside the README's one-second noise (true) | Hero: FRAME SWAP. Speed: ADAPT, the wording now says the gain is not firm against the noise (correction, applied) |
| Cairo | OBJECT | Same hero boxes; speed comparison | As Tufte | As Tufte |
| Sennett | OBJECT | `model: "haiku"` breaks across lines; raise `.types pre` to 14 px | Token: 2 client rects before the edit (true, a real break). 14 px: fits (premise true at true 390 px) | Token: ADAPT, applied as a correction (nowrap). 14 px: held under the 3-round rule |
| Bringhurst | OBJECT | Phone measure about 42 characters per line; body 15 px; hero caption 50ch | Measured at true 390 px: body paragraphs 44 to 49 characters per line; the numbered steps (48 px hanging indent) run about 35 | Steps: OVERRULE (short list items with a hanging indent; the rest of the body is 44 to 49). Hero caption: moot (frame swap) |

Andon: none pulled. PASS: 0 of 10.

**3-round rule.** W4, W5 and W6 each produced new OBJECT verdicts. The brief says: do not make another move; perform a frame swap or a double-loop revision instead. Done below. The two accuracy corrections (the token wrap, the speed wording) are wording fixes, applied and logged as corrections; the 14 px code size is a design move and is held.

#### Frame swap (hero region, W6)
- Region: the hero mechanism diagram. Objectors: Debord, Tufte, Cairo (3 critics, the threshold in 2d), and Shklovsky earlier (rounds R1 to W5).
- Anchor replaced: Art and Visual Perception (Arnheim), which carried the diagram. Sibling reached by an existing edge: Visual Hierarchy (Arnheim, Dondis), via `arnheim -->|basis of| vh`.
- Change: the figure and its SVG are removed, with their CSS. The hero is now the heading, the lead and the one filled object, the install row, in that order.
- Retained value: the decisions the diagram carried are kept in the text of "How it works". Step 1 now says the state is copied into each chunk and that ten questions make one chunk of eight and one of two. Step 2 already says all subagents go out in one message. Step 3 is unchanged.
- Residual diff: intended: hero figure removed (svg 540 by 200 units), figcaption removed, step 1 sentence added. Inert: none. Regression: none found. Measured after the swap (true 390 px): page height 6116 px (was 6282), no horizontal overflow, `svg` count 0.

#### Double loop (after W6)
- Criterion (MAYA): the acceptable pole was used five times to overrule the same hero objection. That repetition is the signal: the criterion was defending a frame the panel rejected. Amendment: an advanced-pole overruling must name a measured object that the frame keeps, or the frame is swapped.
- Panel: the critics now ask for opposite things. Provocateur asks for a live run and less catalogue; Usability asks for less text and hidden policies; Inclusion asks for bigger code; Craft asks for a shorter measure. The Provocateur and Usability dotted pair (section 13) is producing an oscillation the panel cannot resolve. Amendment: the Provocateur critic's objections to a region are answered by removal of that region's competing system, not by addition.
- Graph: the hero's frame came from run 1 and was judged as a figure, not as a frame. The premortem of run 2 tested the figure's content and not its frame. Amendment: a premortem must name the frame (the anchor that governs a region) and test it against its sibling.
- Measurement: three runs measured "390 px" in an iframe with a vertical scrollbar, so the layout was 375 px (CARRY-FORWARD 1). The phone-width claims of runs 1 to 2 (the `pre` and triage fits) were measured at the wrong width. Corrected here at a true 390 px layout (iframe taller than the document). Amendment: every phone measurement uses an iframe at least as tall as the document, and says so.


#### Round W7 (WHOLE, ten fresh agents, page after the frame swap and the sonnet disclosure)
| Critic (reference) | Verdict | Main objection | Premise check (true 390 px and 1280 px layouts) | Resolution |
|---|---|---|---|---|
| Debord | OBJECT | The three type cards are identical stacked forms; show one shared state with its answers | Cards stack at all widths (`grid-template-columns: 1fr`, true). Each card is a different type shape (true) | Type-card region: frame swap to Tufte Style (sibling via the dotted edge `crit_evid -->|checks density with| c_tufte`) considered and REFUSED by measurement: three columns at 1280 px put the code inside cards 179 px wide, with pre scrollWidth 243 and 290 px. Shared-state run: OVERRULE by medium (a static page cannot dispatch a subagent; the example reply and failed answer show the output) |
| Shklovsky | OBJECT | Replace the three cards with one worked question | As Debord | As Debord |
| Holmes | OBJECT | `pre` to 15 px; phone reader; "Press Ctrl+C or Cmd+C" assumes a keyboard | 15 px at true 390 px FITS (pre 328/328 and 358/358, scrollWidth equals clientWidth): the overflow premise is false, so the request is feasible. The copy line is the no-clipboard path only | 15 px: HELD by the 3-round rule (OPEN, DEFERRED with this measurement). Copy line: HELD (wording of the fallback path) |
| Mace | OBJECT | `pre` to 15 px, keep wrapping or scrolling | As Holmes | HELD (as Holmes) |
| Krug | OBJECT | Plain lead; gloss "noul"; rename heading | Lead: first clause says what jill does (text, true). "noul" first appears in Merge step 3 before its card (true) | Lead: OVERRULE (as W6). Noul gloss: HELD (clarity move) |
| Nielsen | OBJECT | Gloss "noul" on first use (five uses, first in Merge) | As Krug | HELD |
| Tufte | OBJECT | `.types` to three columns at 640 px and up | Measured REFUSED (see Debord) | OVERRULE by measurement |
| Cairo | OBJECT | Speed table with each figure's model, effort, tokens and sample count; sonnet row has no tokens or question set | Sonnet row: TRUE, the README gives neither (the page now says so). Table: a restructure; the list keeps each README condition beside its figure | Sonnet row: ADAPT as a disclosure (applied). Table: OVERRULE (MAYA) |
| Sennett | OBJECT | Wrap triage in `details`; wrap the model token; `pre` to 14 px | Token: wrap fixed in W6 (one client rect now). `details`: as Nielsen (W6). 14 px: fits (premise false for overflow) | Token: done. `details`: OVERRULE. 14 px: HELD (as Holmes) |
| Bringhurst | OBJECT | Vertical rhythm: 16 px body at 24 px leading, paragraph gap 24 px, section 48 px | Body line pitch 16 x 1.6 = 25.6 px, paragraph gap 14 px, section 40 px: none is a multiple of 25.6 (true) | HELD (a rhythm move, held by the rule; logged as a Frontier item) |

Andon: none pulled. PASS: 0 of 10.

**3-round rule, still in force.** W4 to W7 each produced new OBJECT verdicts. This round the only actions are the double loop below, the refused frame swap, and the measured sonnet disclosure. Every design move is HELD and logged as DEFERRED with its measurement, so S1 is met on paper and no move was made to chase the verdicts.

#### Double loop (after W7)
- Criterion (MAYA). The advanced pole has been asked for a live run in W6 and W7 (Debord, Shklovsky). The artifact is a static page with no runtime; a live run needs the page to dispatch a claude-haiku-5-5 subagent, which the medium cannot do. The demand is outside the medium, not a defect in the work. Amendment: the advanced pole is a static, captioned example, and a demand for a live run is recorded as OVERRULE by medium.
- Panel. The ten references now ask for four different genres at once: more worked examples (Provocateur), less text and hidden policies (Usability), bigger code (Inclusion), tables (Evidence), a finer rhythm (Craft). Each is correct in its own doctrine and they do not converge on one artifact. Amendment: genre objections (a table, a live run, a worked run in place of a list) are recorded as genre objections and answered by the criterion. Only a measured defect moves the page.
- Graph. The type-card region drew 3 objectors in W7 (Debord, Shklovsky, Tufte). The frame swap to Tufte Style is measured and refused, so the region keeps its frame. The code-size region has no sibling frame; 14 and 15 px both fit, so it is a move, held by the 3-round rule.

#### Frontier after W7 (state for the report)
- TAKEN this run: speed figures from README (M11); policy count from the file (M12); triage caption (M13); hero frame swap (Arnheim to Visual Hierarchy); token wrap; speed wording; sonnet disclosure; `noul` not yet.
- DEFERRED, reason: code size 15 px (held by the rule; fits at 390 px, measured); `noul` gloss on first use (held by the rule); the Copy fallback wording (held); vertical rhythm on a 24 px baseline (held; premise true); per-policy copy controls (medium; a copy of policies.md); three type columns (refused by measurement, 179 px cards); Tufte Style frame for the type cards (refused by measurement); live or worked run (outside the medium).
- OVERRULED: lead names Jev (the lead says what jill does first); `details` wrappers (MAYA, c_prog reason stands); speed table (MAYA); page length (MAYA); empty side columns (White stance); Mace's "do not shorten" (verbatim overflows at 13 px, 400 px in a 358 px box).

#### Round W8 (WHOLE, ten fresh agents, the final page: after the sonnet disclosure)
| Critic (reference) | Verdict | Main objection | Resolution this run |
|---|---|---|---|
| Debord | OBJECT | Three columns at 640 px and up; install command sits about 350 px down | 3 columns refused by measurement (see W7). Install position: OVERRULE (the install block is the page's first action on the first screen) |
| Shklovsky | OBJECT | Replace the type cards and duplicate triage example with one worked question | OVERRULE by medium (no runtime); triage example kept (policies.md is linked, the example is the one set shown in full) |
| Holmes | OBJECT | `pre` to 15 px with pre-wrap; who lacks Claude Code | 15 px fits (measured W7). HELD by the 3-round rule. Reader question: the requirement is stated in the paragraph after the command (true) — HELD |
| Mace | OBJECT | `pre` to 15 px | HELD (as Holmes) |
| Krug | OBJECT | Lead names Jev first; move the Jev clause to How it works | OVERRULE (as W6: the lead says what jill does first, measured by text order) |
| Nielsen | OBJECT | Type cards take about 28% of the phone page; cut to one example | OVERRULE (the three types are the brief's content; measured height 6141 px at 390) |
| Tufte | OBJECT | Speed as a dot plot with one-second band and token labels | OVERRULE (the README gives one sample per row with no spread; a plot would draw a spread the README does not measure) |
| Cairo | OBJECT | Give each speed row n and spread; match "single sample" to it | OVERRULE on the figure: the README records the runs as single samples (text match: "single samples"). The "3.4 s and 4.1 s" row is two single samples of the same set, stated as such in the page's own intro |
| Sennett | OBJECT | Let the triage `pre` wrap; enforce the fit in CSS | OVERRULE: pre-wrap would split `"question":` from its value (CARRY-FORWARD 11); the shortened text fits at 358 px (measured) |
| Bringhurst | OBJECT | Restore the full triage strings and let the `pre` scroll | OVERRULE by measurement: the full strings overflow at 13 px (400 px in a 358 px box, W6) |

Andon: none pulled. PASS: 0 of 10.

#### Stop test (Step 4), final state
- S1 (Frontier: no OPEN item; each TAKEN, DEFERRED with a reason, or OVERRULED): MET. Items held by the 3-round rule are DEFERRED with their measurements: code size 15 px (fits at 390 px), `noul` gloss on first use, the Copy fallback wording, vertical rhythm on a 24 px baseline, the Holmes reader question. Log: sections 16 (W6, W7 and W8 tables and Frontier after W7).
- S2 (a WHOLE round with every required critic PASS, no Andon): NOT MET. W6 0 of 10; W7 0 of 10; W8 0 of 10. No Andon in any round.
- S3 (two consecutive clean WHOLE rounds with no ADAPT, SCRAP, REOPEN or new OPEN item): NOT MET. W6, W7 and W8 each produced OBJECTs and new Frontier items.
- S4 (ambition push, measured and logged): MET AS LOGGED IN RUN 2 (M10: `.install` width 672 to 1280 px at 1280; 8 px overflow found; push reverted). This run made no new push. The Breaker it started from (M3, the speed bars) was scrapped in run 2, so S4's breaker condition is weak; flagged.
- S5 (every dotted edge from a used anchor applied or declined with reason): MET, with two corrections this run. MAYA -.-> Art as Technique: DECLINED (the APPLIED claim relied on M9, scrapped; the page has no strange element to temper). Chesterton's Fence -.-> Weingart: DECLINED (the APPLIED claim relied on M3, scrapped; no grid break remains). Others as section 15, including Provocateur -.-> Usability (recorded in section 13) and Evidence -.-> Wit (declined, no Wit critic).

#### Why the run stops at three WHOLE rounds this run
The brief caps this run at six. Three consecutive rounds (W6, W7, W8) each produced new OBJECTs, so the brief forbids further moves and requires a frame swap or a double loop instead. A frame swap was performed and refused by measurement (type cards, three columns), and a double loop was logged (W6, W7). Further rounds would re-judge an unchanged page, so they would produce no new information. The run stops here and reports the open frontier, instead of spending rounds the rule does not let the page answer.

Total WHOLE rounds across the log: 12 (R1 to R4 in run 1; W1 to W5 in run 2; W6 to W8 in run 3).

#### Step 2g: final-state measurements (after the last edit, the sonnet disclosure; measured with iframes at least as tall as the document, so the layout is the true width)
| Printed figure | Source | Procedure | Final value | Result |
|---|---|---|---|---|
| 3.4 s, 4.1 s, 16.5k, 8.9 s, 2.8 s, 2.4 s, "about one second" | README Speed | text match in README and page | all present in both | reproducible |
| 8.5 s | (SKILL only, not README) | text match on page | absent | corrected (M11) |
| fifteen question sets | policies.md, 15 JSON blocks | `ul` `li` count | 15 | reproducible |
| triage caption | policies.md | character comparison of ids, types, options, questions | ids, types, options identical; two questions shortened | reproducible |
| calibrated | README and SKILL use the word | `calibrat` count in page text | 0 | reproducible |
| install command | README Install | `#cmd` text | `npx skills add AnEntrypoint/jill` | reproducible |
| 0.6, eight, 0.97 (example, labelled) | SKILL rules and example | text match | present | reproducible |
| no horizontal page scroll | `scrollWidth` vs `clientWidth` | 390 px: 390/390; 1280 px: 1280/1280 | equal | reproducible |
| every `pre` fits its box | `scrollWidth` vs `clientWidth` | 390 px: 328/328 x3, 358/358 x3; 1280 px: 638/638 x3, 672/672 x3 | equal | reproducible |
| copy target | `getBoundingClientRect` | 44 px | 44 | reproducible |
| policy list rows | `ul.policies li` | 15 | 15 | reproducible |
| model token line | client rects of the `code` | 1 | one line | reproducible |
| page height | `bodyScrollHeight` | 390 px: 6141; 1280 px: 5364 | — | reproducible |

## 17. Run 4: capped final attempt (W9 to W11), S2 and S3 target

Mode Adaptive (unchanged). Tools: Agent, ten fresh general-purpose agents per round, one per reference (Debord, Shklovsky, Holmes, Mace, Krug, Nielsen, Tufte, Cairo, Sennett, Bringhurst), each given only the page, two renders and the sources. Measurement: `/usr/bin/chromium --headless`, iframe harness in the scratchpad. One harness was overwritten by a critic's probe during W10, so the figures below come from harnesses rebuilt under new names (`w11-harness.html`, `w12-harness.html`). Every figure was re-measured after the last edit (`w12-measure.txt`). gm: loaded; spool not dispatched (its `.gm/` writes fall inside the repo, which the brief forbids).

### Premise checks (DADA 2d), item by item
| Item | Premise measured | Result | Resolution |
|---|---|---|---|
| 15 px code | `pre` was 13 px at 390 and 1280 | TRUE | ADAPT: `pre` 15 px, 24 px line. All six blocks fit (390: 328/328, 358/358; 1280: 638/638, 672/672) |
| Copy fallback text | "Copy failed, text selected" in `#copy` at 390 | FALSE as overflow: one line, button 232 x 44 px, one text rect | Text kept. Status line wording ("Press Ctrl+C or Cmd+C") assumes a keyboard: ADAPT to "Copy it with Ctrl+C or Cmd+C, or from your device's copy menu." (2 lines at 390) |
| `noul` gloss | first use "A noul answer must be yes or no" precedes the card (Merge step 3) | TRUE | ADAPT: inline gloss at first use, Merge reworked as a list (W10 Krug, Holmes) |
| 24 px baseline | body line-height 25.6 px (390) and 27.2 px (1280); paragraph gap 14 px | TRUE | ADAPT: body 16/24 at all widths; paragraph gap 12; section padding 48/72; `pre` 24 px line |
| Lead against h3 size | lead 18.4 px, h3 19.2 px | TRUE (W9 Bringhurst) | ADAPT: lead 1.2rem, so lead and h3 share 19.2 px |
| Triage verbatim | source wording "What kind of message is this?" / "A person must see this now." | TRUE that the page text differs. Verbatim at 15 px overflows: `pre` scrollWidth 457 against 358 (390) | Tufte's "quote verbatim" OVERRULED by measurement. Caption ADAPT: "reworded", not "shortened" |
| Policy list orphan | last line of the intro at 1280 is 38 px ("noul.") | TRUE | ADAPT: "score&nbsp;or&nbsp;noul." (last line 103 px) |
| Lead orphan at 1280 (W11) | last line "model." (Bringhurst scratch test) | TRUE | ADAPT: `text-wrap: pretty` on `.lead` (3 lines, last line 142 px) |
| Step numbering (W11, 7 of 10) | `ol.steps li` matched the nested `ul.checks li`; counters 4 to 7 | TRUE, a regression from W10's Merge list | ADAPT: `ol.steps > li` for counter, padding and `::before`. Measured after: `ol.steps > li` pseudo content `counter(step)` x3; `ul.checks li` `none` x4 |
| List semantics (Holmes, Mace) | `list-style: none` on `ol.steps` and `ul.policies` | Argued (Safari drops list role); not tested with assistive technology | ADAPT: `role="list"` on both; sr-only "Step N:" in each step heading |
| Shklovsky W10, example state | no state sample beside the example reply | TRUE | ADAPT: one line naming the state the reply answers |
| Shklovsky W10, type cards | Noul card has no options or scale, and nothing says so | PARTLY TRUE | ADAPT: one sentence in the Noul card. Accent colour request OVERRULED (decoration, not in the brief) |
| Krug W6 and W9, Jev in the lead | "in place of TypeSafe's Jev, a cloud decision model" in one clause | FALSE: the term is glossed in its own clause | OVERRULE (text measurement) |
| Krug W10, "six sentences" in Step 3 | the paragraph has four sentences | FALSE on the count; the density itself is TRUE | ADAPT: Step 3 as a four-item list (also Holmes W10) |
| Debord W9, W10, copy control on a triage or example block | none; the brief asks for explanation, a list and a link | — | OVERRULE by MAYA (Adaptive): the page's job is explanation; the sets are in the linked `policies.md`; per-block copy controls were already deferred (section 15) |
| Live-run objections (W6, W7) | the static medium has no runtime | TRUE | OVERRULE by medium under MAYA. The objection stays in the log |
| Debord W10, example prompt as copyable | none | — | OVERRULE, same reason as above |

### Rounds
| Round | PASS | OBJECT | Andon pulled | Action |
|---|---|---|---|---|
| W9 (fresh ten) | Nielsen, Cairo, Sennett (3 of 10) | Debord, Shklovsky, Holmes, Mace, Krug, Tufte, Bringhurst (7) | none | ADAPTs and OVERRULEs above |
| W10 (fresh ten) | Mace, Nielsen, Tufte, Cairo, Sennett (5 of 10) | Debord, Shklovsky, Holmes, Krug, Bringhurst (5) | none | ADAPTs and OVERRULEs above; Step 3 list, sample state, type-card sentence, nbsp, lead size |
| W11 (fresh ten) | none (0 of 10) | all ten. Common finding (7 of 10): the nested Merge checks show counters 4 to 7 | Krug, Debord, Sennett, Tufte | ADAPT: selector scope (`ol.steps > li`); lead `text-wrap: pretty`. Fixed after the round, so not re-judged by a panel (cap reached: W9, W10, W11 are the three WHOLE rounds of this run) |

### Stop test (run 4)
- S1 (Frontier, no OPEN item): MET on paper. Every item above is ADAPT (measured after the edit), OVERRULE (reason and measurement stated) or DEFERRED. The W11 fixes were not re-judged by a panel.
- S2 (WHOLE round, every required critic PASS, no Andon): NOT MET. W9 3 of 10; W10 5 of 10; W11 0 of 10.
- S3 (two consecutive clean WHOLE rounds): NOT MET. No round was clean.
- S4 (ambition push, measured): NOT MET this run. No Breaker was pushed in run 4; the run 2 push (M10) was SCRAPPED.
- S5 (dotted edges from used anchors): carried from section 16, not re-audited in run 4.

### Final-state measurements (after the last edit; `w12-measure.txt`, `final3.html` identical to the docs page)
| Printed figure | Procedure | 390 px | 1280 px | Result |
|---|---|---|---|---|
| no horizontal scroll | `scrollWidth` vs `clientWidth` | 390 / 390 | 1280 / 1280 | reproducible |
| every `pre` fits | `scrollWidth` vs `clientWidth` | 328, 328, 328, 358, 358, 358 (all equal) | 638, 638, 638, 672, 672, 672 (all equal) | reproducible |
| step counters | `::before` content of `ol.steps > li` | `counter(step)` x3 | same | reproducible |
| nested checks | `::before` content of `ul.checks li` | `none` x4 | same | reproducible |
| lead line box | computed font / line-height | 19.2 px / 24 px | same | reproducible |
| lead last line | line rects of `.lead` | 346 px, 4 lines | 142 px, 3 lines | reproducible |
| footer bottom (page height) | `getBoundingClientRect` | 6424 px | 5561 px | reproducible |
| speed figures | text match to README Speed | 3.4 s, 4.1 s, 16.5k, 8.9 s, 2.8 s, 2.4 s all present; page height and figures unchanged | | reproducible |
| policy sets | `ul.policies li` count (final2) | 15 | 15 | reproducible |
| "calibrat" on page | text count | 0 | 0 | reproducible |

### Status
Run 4 INCOMPLETE against S2 and S3. Three WHOLE rounds run (W9, W10, W11); the cap was reached. Open at close: the W11 critics' verdicts on the post-round fixes (step numbering, lead orphan) are unjudged; the W10 and W11 objections that were OVERRULED (copy controls, live run, Jev, verbatim triage) stay in this log; S4 and S5 were not re-audited this run.
