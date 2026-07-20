# The Synthesis Model — finishing the Alchm Semantics canvas

Status: **completion in progress.** All decisions dated 2026-07-20.
Supplements [UNIFIED_PHYSICS_MODEL.md](./UNIFIED_PHYSICS_MODEL.md) (v2, PR #624).

---

## 0. What this document is

The "Alchm Semantics" workbook is a hand-authored draft from several years ago
that was never finished. Measured across all thirteen CSV tabs:

| | |
|---|---|
| Total cells | 68,284 |
| Non-empty | 18,395 (26.9%) |
| Value-bearing, not a label | 3,409 (**5.0%**) |
| …containing an unresolved wildcard | 1,018 (30% of values) |

**~3.5% of the workbook carries a resolved value.** Most non-empty cells are
enumerated combination headers — `⊙ ☌ 🌙 ☌ ☿ ☌ ♄` and thousands like it —
awaiting content never written. The author's own note appears on eleven pages:
*"maybe im missing 20 extreme placements..."*

**This document is that canvas's completion.** Three sources feed it: the canvas
supplies the skeleton and a minority of values; the shipped codebase supplies a
second set resolved over three years of implementation; the rest is authored
here. `alchemicalPillars.ts` proves the relationship — that layer was finished
in code and the canvas never caught up.

### 0a. Provenance is mandatory

| Tag | Meaning |
|---|---|
| `[CANVAS]` | Transcribed from the workbook. Cite the tab. |
| `[CODE]` | Resolved in implementation. Cite file:line. |
| `[AUTHORED]` | Decided during completion. Record the reasoning. |
| `[DERIVED]` | Computed from other values. No independent information. |
| `[OPEN]` | A hole. Listed in §9. |

**Precedence: `[AUTHORED]` > `[CODE]` > `[CANVAS]`.** The most recent deliberate
decision wins; shipped behaviour beats a 5%-filled draft.

**Confidence bar:** derivable, or twice-sourced — where "independent" excludes
templated replication. A value repeated across twelve sign pages by fill-down is
*one* source. This bar exists because that exact error was made twice (§11).

---

## 1. Synthesis — already shipped

A planet **is** the synthesis of two energy states, and the pair is its sect
pair: the day axis and the night axis are its two constituents.

| Axis pair | Yields |
|---|---|
| Spirit + Substance | Mercury |
| Spirit + Essence | Jupiter |
| Spirit + Matter | Saturn |
| Substance + Essence | Neptune |
| **Substance + Matter** | **∅ — do not interact** |
| Essence + Matter | Moon, Venus, Mars, Uranus, Pluto |
| *(pure Spirit)* | Sun |

Four axes → six pairs + one pure = **exactly ten bodies, no remainder.**
`[CODE]` `PLANETARY_ALCHEMY` (`planetaryAlchemyMapping.ts:43`) already encodes
every row. Open problem 2's inputs were in production the whole time.

**Non-injectivity is intended.** Essence+Matter yields five planets, individuated
by dignity and position rather than by the cell.

⚠️ The Substance+Matter null is an authored fact, not a derived one. Six pairs is
too small a sample to infer a mechanism — sharing an element does not predict
synthesis (Substance and Matter share Ground and yield nothing; Spirit and
Substance share Air and yield Mercury). `[AUTHORED]` Do not over-read it.

### 1a. Two authored changes to the sect table

- **Uranus inverts: day = Matter, night = Essence.** `[AUTHORED]` Uranus goes
  against the grain of the other Essence+Matter bodies. Code has it the other way
  (`planetaryAlchemyMapping.ts:99-102`).

  Blast radius: Uranus carries `alchmWeight` **0.9044** — the second-heaviest
  body, above Saturn (0.812), nearly double the Sun (0.513). This moves ~0.9 units
  between Essence and Matter on every chart.

- **The Moon carries both axes in both sects.** `[AUTHORED]` Weight 0.2843 each.
  This makes **both luminaries sect-invariant** — the Sun is Spirit in both, the
  Moon is Essence+Matter in both. Every other body swaps.

---

## 2. The Web of Planets and Elements

`[CANVAS]` Each ESMS axis is *the region between* two elements:

```
Spirit  = Fire ↔ Air        Substance = Air ↔ Ground
Essence = Fire ↔ Water      Matter    = Water ↔ Ground
```

A **cycle** — Fire–Air–Ground–Water–Fire — whose four **edges** are the axes.
Fire–Ground and Air–Water are the diagonals, assigned to no axis.

### 2a. It is a classical-seven generator, and only that

Testing whether each planet's element sits on its ESMS axis's edge:

| Scope | Score |
|---|---|
| **Traditional seven** | **14/14 — perfect** |
| Uranus, Neptune, Pluto | 3/6 |
| Total | 17/20 |

`[AUTHORED]` **The outer planets legitimately break the Web.** It is a classical
seven-planet structure; the moderns were retrofitted centuries later and are not
obliged to obey it.

📎 A configuration reaching 20/20 exists (swap Uranus and Neptune's ESMS pairs,
invert Pluto) and was rejected. Uranus's Air night element exists only on
Spirit/Substance edges; Neptune's Water/Water only on Essence/Matter — so the
geometry *wants* them swapped. But the canvas names Neptune as a Substance planet
deliberately, and adjusting three of ten bodies to hit exactly 20/20 is what
overfitting looks like. Recorded so the option is not rediscovered as new.

**Consequence:** the Web cannot derive outer-planet values. `[AUTHORED]` Those
are **authored directly** — no manufactured derivation.

### 2b. It does not collapse the two compasses

`[AUTHORED]` The Web states where the axes *sit* relative to one another; it does
not compute one compass's values from the other's. Elements come from sign
placement, ESMS from planet identity and sect — **different inputs guarantee
independence**, which is the real guard, not the absence of a shared frame.

📎 Load-bearing contrast `[CANVAS]`: Essence is composed of all four elements;
Substance **lacks Fire**. Preserve this in any element↔ESMS mapping.

---

## 3. Dignity — one unified scale

### 3a. Domicile ranks above Exaltation

`[AUTHORED]` Per the classical point systems (Ptolemy, later Lilly):
**Domicile 5, Exaltation 4.**

- **Domicile** — the planet in its own home. Structural authority, all its own
  resources, complete self-reliance. The sovereign.
- **Exaltation** — an honoured guest. High praise, visibility, peak energetic
  expression, but reliant on the host for its foundation.

`DIGNITY_ESMS_SCALE` (Domicile +10, Exaltation +7, Detriment −7, Fall −10)
already has the historically accurate order and is **retained**.

**Why the canvas drifted:** exaltation reads as the *louder*, more acutely
powerful state, so it attracted more symbols. It lacks domicile's systemic
stability. **The notation records intensity; the scale records authority.**

### 3b. The food scale is dead code — delete it

`[CODE]` verified on `origin/master`:

| Symbol | Callers |
|---|---|
| `getDignityForFoodScoring` | **zero** |
| `DIGNITY_FOOD_SCALE` | referenced only inside `dignityScales.ts` |
| `esmsScale` | `planetaryAlchemyMapping.ts:541`, `NatalTransitChart.tsx:290` |

Its `// backward compatibility` comment is aspirational. **Delete both.**
`[AUTHORED]` Ingredient and cuisine `elementalProperties` are independent authored
data and were never derived from dignity — unification does not touch them.

⚠️ This makes #624 decision 7 ("two scales, crossing forbidden") moot as a rule.
**Keep the lint rule as a ratchet** so a second scale cannot reappear.

---

## 4. Effect size

### 4a. The rule — 94%

```
effect = dignity                                       if dignified
       = (night element == sign element) ? (+ +) : (-)  otherwise
```

| Model | Score |
|---|---|
| **dignity if any, else element** | **49/52 (94%)** |
| dignity only (base −1) | 46/52 |
| element if match, else dignity | 39/52 |
| max(dignity, element) | 35/52 |
| sum(dignity, element) | 10/52 |

Clears the ≥90% bar. Components: dignity 39/42, peregrine 10/10.

All three misses are Pisces dignified cells, where the element term overrides
dignity instead of yielding. `[AUTHORED]` **Those cells are errors; fix.**

### 4b. The canvas notation encodes the wrong order

The effect-size column writes Domicile `(+)` and Exaltation `(++)` — two marks
for the weaker state. **Symbol count is not magnitude.** Transcribing faithfully
would propagate an inverted hierarchy.

Per §8: *cell wrong, not rule wrong.* The structure survives; dignified values
remap to `DIGNITY_ESMS_SCALE` order.

### 4c. Peregrine planets are no longer neutral

`[AUTHORED]` Today `dignityMultiplier` is exactly 1.00 for them. Under the rule
they take a boost or a penalty.

**Value: weaker than any dignity** — roughly ±3, so essential dignity always
dominates. This matches how tradition weights minor dignities (face = +1, whose
only job is to keep a planet from being wholly peregrine).

**Measured impact: −2.8% on chart total.** 54 of 67 generated cells are negative
(81%), which is intended — only 1 in 4 elements matches by chance, so most
placements genuinely are unremarkable. For scale, the Uranus correction moves ~9%
on two axes, so this is roughly a third the size of a change already accepted.

### 4d. The 67 generated cells — `[DERIVED-PROVISIONAL]`

Generated for every peregrine planet-sign pair lacking a value.

⚠️ **They do not yet meet the confidence bar.** The rule was fitted and scored on
the same 52 observations; its output cannot confirm it. `[AUTHORED]` **The second
source is the aspect grids** — 308 cells the rule has never seen. Predict grid
values for element-matched pairs and score. Until that passes, the 67 stay
provisional.

**Ten cells are hypothesis-dependent** — the only pairs where the DAY element
matches but night does not, so night-only says `(-)` while either-element says
`(+ +)`. Currently generated under night-only. If the day reading is adopted,
exactly these ten flip:

`Gemini/Saturn · Cancer/Venus · Cancer/Uranus · Leo/Mars · Virgo/Pluto ·
Libra/Mercury · Libra/Jupiter · Sagittarius/Mars · Capricorn/Pluto ·
Pisces/Uranus`

---

## 5. The aspect grids — the most complete layer

Three 11×11 grids. **The lower and upper triangles are different aspects** —
verified by sign: Sun→Moon reads `(-🔥 -💧)` while Moon→Sun reads `(🔥💧🔥💧)`.

| Grid | Below diagonal | Above diagonal |
|---|---|---|
| Elemental #1 | Conjunction (within 10°) | Opposition (175–185°) |
| Elemental #2 | Trine | Square (90°, within 5°) |
| ESMS | Conjunction | Opposition |

**308 populated, 21 `*`, exactly one empty** (Saturn×Jupiter trine).

### 5a. Cell semantics

- A cell is a **delta to elemental totals**, scaled by aspect strength.
- **Opposition = conjunction negated.** `[AUTHORED]` Fewer glyphs is shorthand,
  not reduced magnitude.
- **`x` is a typed runtime slot** resolving to the element of a sign placement.
  The Ascendant's row is wholly abstract because its element comes from its sign,
  which is chart-dependent.

### 5b. What is established, and what is not

✅ **The element pool holds at 42/44 (95%).** A conjunction cell draws from the
two planets' own element pairs. Both violations are probable fill-down slips —
`Uranus×Sun` is byte-identical to `Saturn×Sun` above it and carries 🜃, Saturn's
element. `[OPEN]` flagged, not corrected; the fitted rule adjudicates.

❌ **The selector is NOT recovered.** Nine hypotheses against all 44 clean cells:

| Hypothesis | Exact | Set-match |
|---|---|---|
| row both + col day | 15/44 | 25/44 |
| union deduped | 13/44 | 20/44 |
| heavier both + lighter day | 13/44 | 23/44 |
| union multiset | 1/44 | 20/44 |

**No candidate counts as an explanation without beating this baseline.**

### 5c. The impossibility markers

The 21 `*` cells encode real astronomy — Mercury's 28° max elongation, Venus's
48°, Mercury–Venus 76°, plus an outer-planet opposition claim.

`[AUTHORED]` **Astronomical constants + tests.** Store the elongation limits as
named constants with sources and assert them against real ephemeris output, where
they cost nothing and catch a real class of bug. The outer-planet claim gets an
**explicit era bound (1911–2045)** so it cannot fire falsely later.

---

## 6. The interaction matrix

`interaction(a, b) = aᵀ G b` — a bilinear form, not a dot product. A dot product
cannot express the Substance×Matter null, which is a claim about a *cross* term.

**Energy states: Spirit 3, Essence 2, Substance 2, Matter 1.** `[CANVAS]` The
prose ties Essence and Substance deliberately and twice. Matter is floored at 1
because the canvas says "minimally reactive" — minimal, not absent.

📎 The Heat/Entropy/Reactivity polarity table would rank Substance above Essence
(3/2/1/0) by counting plusses. `[AUTHORED]` The prose tie wins: those three
columns measure different physical quantities and counting across them is not a
ranking.

### 6a. Split into two matrices

`[AUTHORED]` The diagonal was overloaded with two meanings — Spirit×Spirit yields
the Sun (synthesis), and the diagonal is also shared-axis reinforcement. **Use two
matrices, each with its own values.**

This also **dissolves the rank-2 problem**: a fully-derived additive G factorises
to `(a·e) + (b·e)`, the cross term vanishes, and structurally unrelated pairs
score identically (Mercury×Saturn and Jupiter×Neptune both came out at 4.50). A
separate reinforcement matrix supplies exactly the pair-specific information the
synthesis matrix cannot.

### 6b. Composition

```
effect = cell × cosine-bell strength × dignity
```

`[AUTHORED]` Dignity modulates the aspect, not only the placement — a dignified
planet both gives and receives more.

**Measured:** the compounding is negligible in aggregate (10.000 vs 10.027,
+0.3%) because domicile's +10 and fall's −10 roughly cancel — but **~10% per
planet** (Domicile ×1.210 vs ×1.331; Fall ×0.810 vs ×0.729). It matters for
individual placements while being invisible on totals, which is precisely what a
chart-level test would miss. `[OPEN]` — confirm dignity is not applied a third
time via effect size before implementing.

**Aspect coverage: majors only.** `[AUTHORED]` Minors stay neutral until there is
evidence the extension is right.

---

## 7. The positional vessel

**Scope: every body.** `[AUTHORED]` A planet's degree modulates its own ESMS
contribution. The Ascendant is then the case with no planet identity to multiply,
not a special mechanism.

**Signed, floored at zero** — the vessel uses the processes' signed direction but
its contribution is clamped so it never drives a total negative.

**Magnitudes are free to change.** The vessel currently supplies 80% of day-chart
Matter and 97% of Substance; that is an artifact of the flat `{1,1,1,1}`
placeholder, not a target.

**Position is required.** A surface that cannot supply an Ascendant does not
render ESMS. For the location-less public `/planetary-chart`, default to **NYC**
unless the user provides a location.

### 7a. Coupled to alchemicalPillars — verified

`[CODE]` The canvas's 30-degree sequence and `alchemicalPillars.ts` are
**identical 14/14 in order.** Canvas has typos (`Seperation`, `Firmentation`);
code is corrected.

`[AUTHORED]` **Couple them — one source.** The vessel indexes as
`((degree - 1) mod 14) + 1`. The processes are the physics; cooking methods and
degree positions are both applications of the same fourteen transformations.

### 7b. Decan systems — both, different jobs

`[RESEARCH, 99% confidence]` Two coexisting traditions, both correctly
transcribed:

- **Chaldean faces** — 33/35. The two errors have a structural cause: 36 faces ÷ 7
  planets is not an integer, so Mars needs six faces while the spreadsheet grid is
  five columns wide.
- **Modern decanate** — **36/36 flawless**, Alan Leo's formulation. Generates the
  outer-planet rows 9/9.

`[AUTHORED]` **Faces score, decanate colors.** Faces feed the dignity arithmetic
as the minor +1 dignity they traditionally are; the decanate sub-sign feeds
interpretation and the vessel.

The 30/36 divergence is **mathematically inherent** — the systems agree on only 7
decans by construction.

⚠️ **Real defect:** Golden Dawn Minor Arcana attributions are Chaldean; the
"Dominant Sign/Planet" column beside them is decanate. They disagree 29/36.
**Relabel the column** as the decan sub-sign. `[AUTHORED]`

---

## 8. Method

`[AUTHORED]` Gaps are filled **by reasoning from the alchm rules** — Web geometry,
synthesis, energy states, sect, dignity — using the codebase and research as
sources. **Not by curve-fitting.**

- **Fit both grids jointly.** Derive each compass from its own inputs, then test
  they describe the same event consistently.
- **Pass bar: ≥90% exact.**
- **Below 90%: adjudicate cell by cell.** Each disagreement gets a ruling — rule
  wrong, or cell wrong. A years-old draft contains real errors and the rule may
  correct them.

### 8a. The invariant proof must be re-derived

`[OPEN]` Decision 16 requires `Σ parts + residual === total`, bit-exact. Since it
was last proven we have added peregrine multipliers, aspect × dignity, effect
size, and a positional vessel term. **The old argument does not cover these** —
rewrite the proof from scratch rather than assuming it still holds. The vessel is
the sharpest risk: it adds a term that is nobody's share, so it must land in the
residual explicitly.

---

## 9. Gap register

### Done and usable
| Layer | Source |
|---|---|
| Alchemy processes (14-cycle) | `[CODE]` verified 14/14 against canvas |
| Synthesis / sect ESMS pairs | `[CODE]` |
| Major Arcana → planet/sign | `[CANVAS]` 22/22 |
| Minor Arcana → decan | `[CANVAS]` 36/36 |
| Day/night element grid | `[DERIVED]` — zero independent information |
| Aspect grids | `[CANVAS]` 308 values, 1 gap |

### Holed
| Layer | Filled | Missing |
|---|---|---|
| Per-sign effect sizes | 56/132 | derivable; 67 generated provisionally |
| Degree → sign association | 239/360 | **Virgo, Libra, Scorpio, Sagittarius blank** |
| Degree → planet bonus | 180/360 | |
| Degree → alchemy | 330/360 | **Aquarius has no Alchemy column** |
| Terms | 56/60 | 27 of 360 degrees unruled; partition fails in 5/12 signs |

`[AUTHORED]` **All degree-layer gaps are derivable** — none were undecided, they
were dropped. Terms from Lilly's published table; sign-association from the
30-degree zodiac cycle; element `[DERIVED]` from sign association; Aquarius's
Alchemy column from the 14-cycle.

### Corrections to apply
| Item | Canvas | Correct |
|---|---|---|
| Uranus detriment | Taurus | **Leo** — definitionally opposite the domicile |
| Saturn period | 12 y | **29.46 y** — fill-right from Jupiter |
| Tarot ruler column | implies card ruler | relabel as **decan sub-sign** |
| Heat / Entropy / Reactivity | — | **wrong on a shipping surface today** (§9a) |

### 9a. The only live production bug

The canvas's formulas match **none** of the ≥3 live implementations in `src/`
(`0.6·Spirit+0.4·Substance`, `(Fire²+Air²)/4`, …). Reactivity additionally has an
unclosed parenthesis and an inferred denominator and **must be re-derived**; Heat
and Entropy are balanced and transcribable.

### Never started
- "Aspects from Astrologizer Code" — ten names, **zero populated cells**
- Aces and court cards — 0/16 beyond an element
- β, the shared-axis coefficient `[OPEN]`
- Three of four G diagonals `[OPEN]`
- **"Inertia" is quadruple-booked**, not triple as #624 states — a fourth in
  `alchm-quantities/route.ts:188`. `M/r²` keeps the name; rename the others.

### 9b. Momentum basis `[OPEN]`

The FBD's momentum vector uses `speed × alchmWeight`, where `alchmWeight` is
log-normalised orbital period. Momentum is mechanically mass × velocity, so this
is arguably a category error. `[AUTHORED]` Agreed in principle; **defer until
#624's gravitation actually exists**, then compare both with real values rather
than deciding on theory.

---

## 10. Rollout

`[AUTHORED]` **One v2 cutover.** Everything lands together behind one version bump
with one backfill: Uranus inversion, Moon both-axes, peregrine effect, dignity
unification. Stored ESMS values are backfilled; the version tag stays on stored
rows so the boundary remains legible.

**Canonical home:** data files are the single source; the spec's tables and the
TypeScript constants are both generated from them. **No table is written twice** —
a table appearing in two places is a defect.

**Success test:** reproduce the 308 grid cells. Large enough that agreement is not
coincidence, unlike the 13-cell peregrine sample.

**The Words layer** — 132 per-sign descriptors, zero duplicates, the only fully
authored layer in the workbook and currently shipping nowhere. Extract to a typed
data file and wire to the surfaces that describe placements. The aspect Adjectives
column (0.0% filled across 2,001 rows) is generated using Words as the voice
reference.

---

## 11. Errors of record

Four confident readings of this document were overturned by measurement in a
single session. They are recorded because the failure modes recur.

1. **"Thirteen unanimous locations" for Uranus's ESMS pair.** A planet's ESMS pair
   cannot vary by sign, so the twelve sign pages are one templated row filled
   down. **Replication counted as corroboration** — inflating the evidence ~13×
   and putting the burden of proof on the author for their own model.

2. **"The aspect matrices are 30% wildcards, a sketch with holes."** That figure
   was computed over the *whole workbook*, not the grids. **Wrong denominator** —
   and it understated the one finished layer, which is 308 values with a single
   gap.

3. **"Effect size is 43/43 with zero exceptions."** The script only sampled rows
   where both dignity and effect were populated, so it never saw the Pisces
   disagreements. Actual: **39/42.** A second verification attempt then produced
   six *false* misses by treating `-**` and `(+)*¹` as different from `-` and
   `(+)`. **Two bad measurements of the same claim.**

4. **"The peregrine skew is plausibly the largest behavioural change in the
   model."** Measured: **−2.8%**, roughly a third the size of the Uranus
   correction already accepted. **Asserted a magnitude without computing it.**

**The discipline that follows:** no structural claim enters this document without
a script behind it and the score recorded. Prose reasoning about this workbook has
a poor track record; arithmetic has a good one.

---

## 12. The grid versus the hand-authored pairs

`aspectESMSEffects.ts` carries four hand-authored pairs; the grids now supply
all 45. Comparing them where they overlap — the "compare first" ruling:

| Pair / aspect | Grid | Code | Axes | Sign |
|---|---|---|---|---|
| Sun–Moon conjunction | Ess+1 Mat+1 Spi+1 | Ess−0.5 Spi−0.5 | overlap | **INVERT** |
| Sun–Moon opposition | Ess−1 Mat−1 Spi−1 | Ess+0.3 Spi+0.3 | overlap | **INVERT** |
| Mars–Venus conjunction | Ess+1 Mat+1 | Ess+0.4 Mat+0.2 | **same** | **same** |
| Mars–Venus opposition | Ess−2 Mat−2 | Ess−0.2 Sub+0.2 | overlap | same |
| Jupiter–Mercury conjunction | Ess+1 Spi+1 | Spi+0.4 Sub+0.2 | overlap | same |
| Jupiter–Mercury opposition | Spi−1 Sub−1 | Spi+0.1 Sub+0.2 | **same** | **INVERT** |
| Saturn–Sun conjunction | Ess+1 Spi+2 | Mat+0.4 Spi−0.3 Sub+0.2 | overlap | **INVERT** |
| Saturn–Sun opposition | Mat−1 Spi−2 | Mat+0.2 Sub+0.3 | overlap | **INVERT** |

**Axes identical 2/8; signs agree 3/8. Axis overlap is never zero.**

### 12a. The grid cannot express depletion

`[AUTHORED]` The disagreement is systematic, not noise. Measured across the ESMS
grid:

| Triangle | Cells | Predominantly negative |
|---|---|---|
| Lower (conjunction) | 55 | **0%** |
| Upper (opposition) | 49 | **91%** |

**Sign is fully determined by aspect type and carries no pair-specific
information.** The grid's pair-specific content is entirely in *which axes move*
and *how many glyphs* — and on that it agrees with the hand-authored values far
more than it disagrees.

Every sign inversion is a case where the code says something pair-specific the
grid structurally cannot:

- Sun–Moon conjunction: code says New Moon **depletes**; grid says all
  conjunctions are positive.
- Jupiter–Mercury and Saturn–Sun oppositions: code reads them as **balancing**;
  grid reads all oppositions as negative.

So the code consistently treats opposition as illumination and balance, while the
grid treats it as tension and loss. That is a genuine difference of model, not a
transcription artifact.

**Ruling:** depletion cases are **missing from the grid**, not overridden by the
code. The four hand-authored pairs are not exceptions to a rule — they express
nuance the draft had no notation for. `[AUTHORED]`

**Consequence for wiring:** take the grid's **axis selection** (where it agrees
well) and **do not take its polarity as pair-specific** (where it carries no
information). Pair polarity needs authoring or derivation; it is not in the
canvas. `[OPEN]`

### 12b. Orientation is verified, not assumed

The triangle assignment was checked three independent ways before this
comparison was trusted: the 0%/91% polarity split, the position of the
"Opposition effect" and "Conjunction effect (within 10 degrees)" labels, and the
elemental grids showing the same pattern (`Moon→Sun` positive, `Sun→Moon`
negative). A global inversion here would have silently swapped conjunction with
opposition across all 308 cells.
