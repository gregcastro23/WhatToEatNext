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

---

## 13. Impulse — and why alchmWeight already encodes it

An aspect is not an instantaneous event; it acts over the window the pair spends
within orb. So the quantity delivered is an **impulse** — force integrated over
that window — not a force.

Time in an 8° orb, from mean motions:

| Pair | Relative motion °/day | Days in orb |
|---|---|---|
| Moon–Pluto | 13.17 | **1.2** |
| Sun–Mars | 0.46 | 34.7 |
| Saturn–Uranus | 0.022 | 733.9 |
| Neptune–Pluto | 0.002 | **8000** |

A **6,586× spread**. Taken literally, Neptune–Pluto would deliver thousands of
times more total effect than any lunar aspect and dominate every chart.

### 13a. The engine already solves this

| | Pluto vs Moon |
|---|---|
| Duration-in-orb ratio | 3,294× |
| Orbital period ratio | 3,306× |
| `alchmWeight` ratio | **3.52×** |

Duration-in-orb and orbital period track to within **0.4%** — they are the same
quantity. And `alchmWeight` is the log₁₀-normalised period
(`normalizeAlchmWeight`, `src/data/planets.ts:70`), which compresses a 3,306×
raw spread into a usable 3.52×.

**`alchmWeight` is therefore already a log-compressed impulse weighting.**
`[CODE]` Multiplying an aspect by duration on top of it would double-count the
same physical fact.

### 13b. This defends period-weighting against gravitation

#624 decisions 4–6 replace weight with `M/r²`. §9b left that `[OPEN]`, deferring
until gravitation exists.

This finding is an argument for the existing scheme rather than a deferral.
Period-weighting **is** impulse-weighting: a slow planet's aspects act over a
proportionally longer window, and the log normalisation is what keeps that
tractable. `M/r²` would discard the property that makes aspect weighting
physically meaningful and replace it with one that does not describe how aspects
actually deliver their effect. `[AUTHORED]`

The mass scale keeps its separate job (§9b): mechanics, not alchemical weight.

### 13c. Consequence for magnitude

Impulse cannot supply the per-pair aspect magnitude, because the pair-varying
part of it is already applied via `alchmWeight`. What remains unset is the
**per-aspect-type constant** — conjunction versus opposition versus trine versus
square. That is a much smaller question than it looked: four numbers, not 45.
`[OPEN]`

---

## 14. The engine does not agree with itself

`[RESEARCH 2026-07-20]` A full audit of every core physics quantity. Force and
inertia were flagged earlier as double- and quadruple-booked; the real picture is
much worse, and it is **upstream of everything in this document**.

| Quantity | Live definitions | Dead | Agree? |
|---|---|---|---|
| `normalizeAlchmWeight` | 2 | 0 | **yes** — verbatim fork |
| Planetary weight tables | **12** (+3 period, +2 mass) | 2 | **no** — differ in value *and rank order* |
| Dignity multiplier | **9** | 5 | **no** — Sun-in-Leo spans ×1.10 → ×1.50 |
| Aspect strength | **12** | 2 | **no** — three incompatible ranges (0–1, 0–2, 0–10) |
| Orb budget | **12** | 1 | **no** — conjunction 8 vs 10, sextile 4 vs 6, trine 7 vs 8 |

### 14a. Two live ESMS engines give different answers

`RealAlchemizeService` and `planetaryAlchemyMapping` both compute per-planet ESMS
and are both live. They apply **different dignity scales** (±3 → ×0.15 versus
±10 → ÷100) on top of an *identical* `alchmWeight`. Same chart, two answers.
**Mercury-in-Virgo is the worst case: ×1.45 versus ×1.07.**

This is the same class of defect as the `Q 0.00` bug and the ESMS/element
collapse — two plausible paths producing different numbers with nothing
asserting they should match.

### 14b. `alchm-quantities/route.ts` is an outlier on nearly every axis

Its own inertia, its own force, its own aspect strength, and a **moiety-based orb
model** instead of a fixed table: `maxOrb = (moiety₁ + moiety₂) × aspectScale`.
A Sun–Moon conjunction gets **13.5°** there against **8°** everywhere else — so
it admits aspects no other module considers to exist. Worth checking whether it
was written against a different spec entirely.

### 14c. A third of the conflict is dead code

Unreferenced and removable before any real reconciliation: `DIGNITY_FOOD_SCALE`,
`getDignityForFoodScoring`, `getDignityESMSMultiplier`, `_getDignityMultiplier`,
`PLANETARY_ORBS`, `cookingMethodRecommender._calculateAspectMethodAffinity`,
plus unimported duplicate files (`ingredientRecommendation 2.ts`,
`PlanetaryCalculationsDemo 2.tsx` and others) carrying their own copies.

> `[AUTHORED]` **Correction.** This list originally included the whole
> `signVectors` module. **It is retained** — its intent is the missing modality
> axis and is worth realising. Only its ESMS bridge is deleted. See §15.

**Verified on deletion** (2026-07-20). Two entries were wrong as written:
`getDignityScore` is **live** (two importers, one of them the production
`planetaryAlchemyMapping`), so `dignityScales.ts` survives minus its dead
exports; and `_calculateAspectMethodAffinity` names *two* functions, of which
only the `cookingMethodRecommender` one is dead — the copy in
`recommendation/methodRecommendation.ts` is called at `:739`. A point-in-time
audit is a lead, not a warrant; re-check each caller before removing it.

**Deleting dead code first cuts the apparent conflict count by roughly a third**
before any judgement is required — the same lesson as `DIGNITY_FOOD_SCALE`, where
an apparent two-scale conflict dissolved on discovering it had zero callers.

### 14c-bis. The thermodynamic layer is worse than §9a stated

`[RESEARCH 2026-07-20]` §9a called the heat formulas "≥3 conflicting
implementations". Measured:

| Quantity | Definition sites | Distinct numeric behaviours | Live |
|---|---|---|---|
| heat | 27 | 7 | 6 |
| entropy | 25 | 7 | 6 |
| **reactivity** | 26 | **9** | 8 |
| gregsEnergy | 20 | 4 | 4 |
| kalchm | 20 | 7 | 6 |
| monica | 26 | 8 | 8 |

Evaluated on one shared input (S=4, E=4, M=4, Sub=2, Fire=.3, Water=.25,
Air=.25, Earth=.2):

- **heat** spans `0.1405` (canonical) to `9.26` (`astrologyUtils` fake-ESMS) —
  a **66× spread**. The linear form in `alchemicalEnergyMapping` returns `3.2`,
  22× canonical and unbounded above 1.
- **reactivity** — ⚠️ **the production path disagrees with everything else.**
  `RealAlchemizeService` uses the Dignity form `(Σ/M) + Earth²` → `9.09`, while
  `UnifiedScoringService`, `gregsEnergy`, `kalchmEngine`,
  `monicaKalchmCalculations` and `data/unified` all use `(Matter+Earth)²` →
  `2.05`. **4.4× apart on identical input, and the gap grows without bound as
  Earth rises**, because Earth moved from the denominator to an additive term.
  Any consumer comparing the two is comparing incommensurable numbers.
- **kalchm and monica agree on normal input and diverge in the degenerate
  regime** — the same undefined state returns `1.0`, `NaN`, `0` or `null`
  depending on the module. `1.0` is indistinguishable from a legitimate value at
  every consumer except `RealAlchemizeService`, the only site that flags it.

### 14c-ter. ⚠️ A non-thermodynamic "monica" is persisted to user profiles

`api/agents/unified/route.ts:173` and `philosophers-stone/page.tsx:199` compute
"monica" as an **average of planetary longitudes** — values in `[0,10]` with no
thermodynamic content whatsoever — and **the API route writes it to the user
profile**. `recipeBuilding.ts:202` returns an `(Air+Fire)/(Water+Earth)` ratio
under the same name.

This is stored data, not just a display defect.

**AUDIT DONE — production DB, 2026-07-20 (read-only).** The DB reality differs
from the code catalogue, which is why it needed measuring:

- **4775 user_profiles; 3672 carry a monica value, and ALL 3672 are agents
  (`is_agent=true`). Zero of the 13 human profiles have one.** No real user data
  is affected — this is entirely an agent-attribute defect.
- The stored values split into **two distinct fake populations**:
  - **71 agents with a real natal chart** → the longitude-average formula, values
    in **~4–6** (5.67, 4.82, 5.12…). These are the `:173` / `:199` code path.
  - **3600 agents with an EMPTY natal chart (`[]`)** → round values in **(0,1)**
    (`0.50 ×1330`, `0.55 ×556`, `0.80 ×260`, `0.30 ×209`…), only 71 distinct.
    The longitude formula yields 0 for an empty chart, so these did **not** come
    from `:173` — they arrive from a bulk agent-sync / `economy/sync-debit`
    (`monica_constant = COALESCE($8::numeric, …)`) path carrying an upstream
    value, most likely from AlchmAgentsETH. **The code audit caught the minority
    source (71/3671); the dominant 3600 came from elsewhere.**
- **Neither population is a real thermodynamic monica** (which would cluster near
  φ≈1.618 via kalchm/reactivity). Readers are display-only:
  `commensal/companions` (social), `admin/users`, `feed`.

`[OPEN]` decision (§17e): fix the write(s) and decide backfill. Lower stakes than
feared (agent-only, no humans), but the real fix target is the **sync/bulk**
path, not only the two code sites originally flagged.

### 14d. What this means for the work in this document

**The magnitude question is downstream of an engine that disagrees with itself.**
Calibrating a new aspect scale against a system where aspect strength has three
incompatible output ranges and orbs disagree by 25% would be fitting to noise.

`[AUTHORED]` **Revised order:**

1. **Delete the dead definitions.** No judgement needed, removes ~⅓ of the
   conflict, and it is the cheapest possible win.
2. **Reconcile the two ESMS engines** (§14a). Two live answers for one chart is
   the most serious defect found.
3. **Unify orb and aspect strength.** Both are inputs to any aspect magnitude, so
   neither the grids nor G can be calibrated until they are single-valued.
4. *Then* settle the per-aspect magnitude constant and wire the grids.

The three live production bugs (§9a heat formulas, Uranus detriment, Saturn
period) remain independent of all of this and are still unfixed.

---

## 15. Modality is the missing axis — the sign-vector programme

`[RESEARCH 2026-07-20]` §14c listed the `signVectors` module family among the
dead definitions to delete. **That recommendation is withdrawn.** `[AUTHORED]`
The module is unreferenced, but its *intent* is the one genuinely missing
dimension in the engine, and the right move is to realise it rather than remove
it. What must go is only its ESMS bridge.

### 15a. What the engine actually lacks

The engine has two established axes and a rule joining them: **quantities come
from the planets, elements from the signs** (§1, CONTEXT.md). Modality —
cardinal, fixed, mutable — is the third classical axis, and it is the one the
engine never derives from the sky.

It is not absent from the codebase. 28 files mention it. But measured, every
live path derives modality from something other than planetary position:

| Site | Modality comes from | Weight |
|---|---|---|
| `recommendation/ingredientRecommendation.ts:723` | **user preference** (`modalityPreference`) | 0.08 |
| `ingredientRecommender.ts:539` | user preference, as a filter | — |
| `cuisineUtils.determineModalityFromElements` | **elements** | — |
| `foodRecommendation.getModalityElementAffinity` | elements | — |

Deriving modality *from elements* is the same forbidden direction as
`elementalToESMS` (§15c). Modality is a property of the sign, sitting orthogonal
to its element — the twelve signs are exactly 4 elements × 3 modalities, a
bijection. Inferring one from the other discards the independent half.

And the element→modality function does not survive measurement:

```
determineModalityFromElements, over the normalised elemental simplex (12,341 samples)
    Cardinal   7186   58.2%
    Fixed      2879   23.3%
    Mutable    2276   18.4%
```

The reason is in the arithmetic. `cardinalScore = Fire×0.8 + Earth×0.8 +
Water×0.8 + Air×0.8` — four identical coefficients, so on a normalised profile it
is **identically 0.8 for every input**, a constant wearing the shape of a
weighted sum. `mutableScore` and `fixedScore` each range only [0.5, 0.9], so
Cardinal wins by default across most of the space. This is the `Q 0.00` defect
class again: a quantity that reads as computed and is not.

### 15b. What the sign vector was reaching for

`calculateSignVectors` builds, per sign, an 8-component vector — three modality
axes, four elemental axes, one seasonal — together with a **magnitude**: how
strongly that sign is expressed *right now*, given which planets occupy it, at
what degree, under what aspects, retrograde or not.

That magnitude is the valuable idea, and it is not expressible in the current
model. "The Sun is in Aries" is a fact the engine already has. "Aries is running
at 0.82 and Pisces at 0.11" is a different statement, and a strictly richer one.

Modality also maps onto cooking method in a way elements do not, which is where
the payoff is: cardinal is initiating (searing, blanching, a hot start), fixed is
sustained (braising, roasting, fermentation), mutable is adaptive (stir-fry,
sauté, improvisation). Because modality is orthogonal to element, it adds
discriminating power to method recommendation instead of restating what the
elemental profile already says.

### 15c. The half that must go

Lines 267–485 of `utils/signVectors.ts` — `VECTOR_CONFIG.elementalToESMS`,
`signVectorToESMS`, `blendESMS`, `getAlchemicalStateWithVectors` — derive ESMS
quantities from elements, which the engine forbids. The file's own header says
so. `getAlchemicalStateWithVectors` then blends that fabricated ESMS into
correct planet-derived ESMS at `alpha = 0.15` and runs the full thermodynamic
stack on the contaminated result.

`[AUTHORED]` Delete this half. It is the exact defect the rest of this document
exists to eliminate, and keeping it next to the salvageable half is what made the
module look deletable in the first place.

### 15d. Four measured defects in the half worth keeping

**1. The comparison is 2-valued, and carries no planetary information at all.**
`calculateSignVectors` unit-normalises the modality sub-vector and the elemental
sub-vector *independently*, and each sign contributes to exactly one slot of
each. So after normalisation every sign vector is one-hot in modality and one-hot
in element, and the entire planetary computation — degree, aspects, retrograde,
planet weights — is divided back out before `compareSignVectors` ever sees it.

Measured, randomising the planetary weight per sign, season held fixed:

```
planetary weight 0.01  -> aries~leo raw cosine = 0.5555555556
planetary weight    1  -> aries~leo raw cosine = 0.5555555556
planetary weight    6  -> aries~leo raw cosine = 0.5555555556
planetary weight  250  -> aries~leo raw cosine = 0.5555555556

across all 66 sign pairs, similarity takes 2 distinct values: 0.5556, 0.7778
```

`_magnitude` survives on the returned object, but `compareSignVectors` ignores
it. The function is a disguised categorical: *shares an axis* or *does not*.

**2. Similarity cannot fall below 0.550.** `compareSignVectors` maps cosine from
`[-1,1]` to `[0,1]`, but all components are non-negative after normalisation, so
cosine is never negative and the output occupies only the top **45%** of its
nominal range. Any consumer reading it as a 0–1 score reads every pair as at
least half-compatible.

**3. Seven of ten planetary weights never apply.** The inline `planetWeightMap`
keys all but Sun and Moon with a leading underscore — `_Mercury`, `_Mars`,
`_Saturn` — while the lookup uses the bare planet name, so they fall through to
the `?? 1.0` default:

```
Sun 1.5 ok   Moon 1.3 ok   Jupiter 1.0 ok (coincides with the default)
Mercury/Venus/Mars/Saturn/Uranus/Neptune/Pluto  ->  all silently 1.0
```

Mars's 1.2 and Saturn's 0.95 have never once been applied. This is the same
underscore rot as `_getDignityMultiplier` and `_calculateAspectMethodAffinity`
(§14c) — a repo-wide defect class worth its own sweep.

**4. `signVectorConfig.ts` is the un-rotted twin, and is never imported.** It
carries the same tables with **correct** planet keys, plus more bodies
(Ascendant, nodes, Chiron). The two have since diverged — `sextile` is 1.5 in the
config and 1.05 inline; `cardinal.Essence` is 1.5 against 1.05. Someone extracted
the config and never wired it up.

### 15e. Plan

`[AUTHORED]` Ordered, and gated behind §14d — the module currently introduces a
**13th** planetary weight table and a **13th** aspect-strength scale, so wiring it
before those are single-valued would add to the problem it is meant to help with.

1. **Delete §15c's ESMS bridge.** Independent of everything else; do it now.
2. **Fix the four defects.** Carry `_magnitude` into `compareSignVectors`; stop
   independently unit-normalising the sub-vectors; rename `_magnitude` to
   `magnitude` and `SignVector.sign: any` to `ZodiacSignType`; delete the inline
   tables and import `signVectorConfig`.
3. **Replace its private tables with the canonical ones** — `alchmWeight` for
   planetary weight, and the unified orb and aspect-strength definitions once
   §14d step 3 lands. The vector should own *modality and seasonality only*; it
   has no business holding its own opinion about how strong a trine is.
4. **Then wire modality into method recommendation**, where it is orthogonal to
   the elemental signal and can be shown to add something. Not into ESMS.

`[OPEN]` The cardinal/fixed/mutable → cooking-method mapping in §15b is
archetypal and unmeasured. It needs the same treatment as the pair-polarity
question (§12a): author it, derive it, compare, take the parsimonious consensus.

---

## 16. Cross-repo: the character-vector stack (AAE / PA / WTEN)

`[RESEARCH 2026-07-20]` A 17-agent workflow mapped the sign-vector / modality
code across all three repos, adversarially verified, and this section records
what survived plus the twenty rulings taken on it. WTEN's `signVectors.ts` (§15)
and AlchmAgentsETH's "character vector" are **independent implementations of the
same idea**, not one lineage — no shared identifiers, incompatible scale families
(WTEN multiplicative ~1.5, AAE additive share-of-100), disjoint feature sets
(WTEN carries aspect/degree/retrograde/season terms; AAE carries none).

### 16a. Lineage — two different copy directions

| Module | Direction | Evidence |
|---|---|---|
| Character-vector / sign-vector-rune stack (6 files) | **PA → AAE**, ~9 months later | PA oldest touch `2025-09-08`, AAE `2026-06-12`; all 6 shared files diff to **0 lines** |
| `lib/alchm-fbd/*` (dignityScales, astrologyUtils, planetaryAlchemyMapping) | **WTEN → AAE** | AAE `lib/alchm-fbd/astrologyUtils.ts:2` states the extraction; AAE holds the **pre-cleanup** WTEN file, dead trio still present |
| WTEN `signVectors.ts` ↔ AAE character-vectors | **INDEPENDENT** | disjoint identifiers, constants, scale families |

**Consequence:** AAE's `lib/alchm-fbd/dignityScales.ts` `+10/+7` scale is **not a
second witness** to WTEN's — it is a verbatim copy of the pre-cleanup file.
Replication, not corroboration. The only cross-repo agreement on the ESMS dignity
scale is one source counted twice.

**PA liveness — measured 2026-07-20, PARTIALLY LIVE (unlike AAE, which was
wholly dead):** PA's presentation surfaces are dead exactly as AAE's are
(`/api/sign-vectors` 0 callers; `sign-vector-graphic.tsx` imported but never
rendered; `character-vector-dashboard.tsx` only in the nav-pruned demo page —
PA's own `docs/SITE_AUDIT_2026-06-11.md:161` lists it under "Demo-ware pruned
from nav"). **But `lib/astrological-character-vectors.ts` is LIVE** — a
build-time dependency of the globally-mounted Monica chat:
`app/layout.tsx:91` → `providers.tsx:24` `<MonicaChatBubble>` →
`fetch('/api/monica-agent')` → `monica-response-handler.ts:14` imports
`SignCharacterVector` (used 4×, e.g. `compareCharacterVectors:128`).
**Runtime nuance:** the *calculator never executes* on the Monica path — only the
**type** is exercised as a data shape (`CharacterVectorCalculator.` grep in the
handler is empty). So the defects (§16c) do not reach Monica output, but **a
file-delete or type-rename in AAE would break PA's Monica build.** Fix must treat
the core file's public type as a cross-repo contract. Persistence: none in PA
either.

### 16b. Is AAE shipping element-derived ESMS? No — but the derivation exists

`lib/runes/sign-vector-runes.ts:364-377` maps dominant element → ESMS multipliers
(`fire: {spirit 1.2, essence 0.8, …}`) — the forbidden direction. Its only call
path is `/api/alchm-quantities`, which has **one** in-repo reference: its own log
string. The hits that looked like callers are absolute URLs to
`https://alchm.kitchen` — WTEN's route, not AAE's. A second element→ESMS
derivation at `lib/astrological-dignities-engine.ts:304-308` is fully dead (2
refs, one an unused import). **UNKNOWN residual:** both routes are `force-dynamic`
and were never checked for external traffic — Galileo logs would settle it (§16f Q).

### 16c. The four WTEN defects (§15d), retested against AAE

| Defect | WTEN | AAE |
|---|---|---|
| Comparison carries no planetary info | yes — 2 distinct similarity values | INAPPLICABLE — AAE has no pairwise compare; but its denominator is a constant **80 for 52/52 agents** (Ascendant weight 20 never fires; outers dropped) |
| Compressed score range | floor 0.550 (top 45%) | axes documented 0-100 reach **−50** |
| Underscore-key rot | two tables (`signVectors.ts`; `safeAstrology.ts:449` — see correction below) | **clean** — 8 bare keys, verified codepoint-by-codepoint |
| Constant-in-disguise | `cardinalScore` ≡ 0.8 on any normalised profile | `chart_signature` hash is the constant **100000** for every chart; 3 of 16 interaction axes are one formula |

The `safeAstrology.ts:449` table arithmetically flips the dominant element (5
personals in Fire vs Sun+Moon in Water reads **Water as written, Fire as
intended**), **but it is dead code** — verified 2026-07-20, correcting the audit
which called `safeAstrology` "not a dead file". The file has live exports
(`calculateLunarPhase`, `calculatePlanetaryAspects`, …), but the table lives
inside `countElements` (module-private, not exported), which is called only by
`safeAstrology.getCurrentAstrologicalState`, which nothing imports — the
`getCurrentAstrologicalState` callers all resolve to `astrologyUtils`/`astrology
/core`/`astrology/validation`, and the one property access
(`astrologyDataProvider.ts:177` `safeAstrology.countElements`) reads `undefined`
because the function is unexported, so its `typeof === "function"` guard fails.
**Disposition: delete as dead code**, do not fix in place.

### 16d. Internal-consistency scorecard (files independently defining a constant class; lower is better)

| Category | AAE | PA | WTEN |
|---|---|---|---|
| Planet-weight tables | 14 | 14 | **32** (five different Sun weights: 1.5, 1.5, 3, 1.0, 0.25) |
| Aspect-strength tables | 9 | 9 | 10 |
| Orb literals | **71** | 71 | 22 |
| Dignity-multiplier defs | 6 | 6 | 10 |
| Thermodynamic defs | 12 | ? | **32** |

Neither repo is a clean reference: WTEN is worse everywhere except orbs; AAE is
3.2× worse on orbs.

### 16e. Persistence — zero, all three repos

No `sign_vector` / `chart_signature` / `character_vector` / `modal_distribution`
column in any `.sql`/`.prisma`/migration (controls: 42 schema files in AAE/PA,
1855 in WTEN). No runtime persistence either. **Deletion or repair needs no
backfill and no migration.** This materially lowers the cost of every option below.

### 16f. Rulings (2026-07-20, twenty MC questions)

`[AUTHORED]` unless noted. These are decisions; the code has not yet been changed
except where a commit is cited.

**Modality — the shape of the axis**
- **Modality is intrinsic to the sign**, a deterministic lookup on any placement
  with a sign — not derived from the sky, not from elements. `[USER]`
- **Capacitance = alchmWeight per body.** Sum each placement's modality weighted
  by the body's orbital-period `alchmWeight`, so a cardinal Sun outweighs a
  cardinal Pluto and the cardinal/fixed/mutable totals actually vary with the
  chart.
- **Modality feeds method recommendation only** — orthogonal to the elemental
  signal (cardinal=high-heat start, fixed=long braise, mutable=stir-fry). Never
  into ESMS, never into elements.
- **The sign vector's purpose is a recommendation input** first; a readable
  portrait can reuse it later once the numbers are trustworthy.
- **Sequence: finish §14d before building/wiring modality.** The vector must
  import canonical orb, aspect-strength and planetary weights (`alchmWeight`);
  wiring it first would add a 13th competing table. Modality's pure-lookup part
  has no such dependency and may be prototyped in parallel.

**Weights and aspects**
- **`alchmWeight` (orbital-period scale) is canonical** for planetary weight —
  the only physics-grounded table, already canonical elsewhere. The other six
  WTEN tables collapse into it.
- **`sextile: 1.5` is deferred**, not fixed in isolation — §14d step 3 settles
  every aspect constant at once.

**Dignity**
- **Drop AAE's accidental-dignity (house) branch** — it reads a bare `house`
  integer with no house system named, operating on fiction for agent charts that
  have no real houses.
- **`getPlanetaryDignityInfo` strength inversion (Domicile 1.0 < Exaltation
  2.0): the premise was wrong.** The ruling was taken as "harmless, the field is
  discarded". It is **not discarded** — `strength` is read live in
  `PlanetInfoModal.tsx:136-140` (bar width `|strength|×25%`),
  `celestialCalculations.ts:575` (`jupiterInfluence = 0.5 + strength`) and
  `astrologyUtils.ts:1149`, reached via `planetInfoUtils.ts:96`. Fixing 1.0/2.0 →
  2.0/1.0 **changes the UI and a computed influence**. `[OPEN]` — re-decide with
  the real consequence in view before touching it. This is a §11-class correction:
  a decision made on an unmeasured premise, caught at execution.

**Cleanup — dispositions**
- **`signVectorConfig.ts`: forbidden keys deleted** (`elementalToESMS`,
  `modalityBoosts`, and `blendWeightAlpha` which only parameterised the deleted
  blend). `planetaryWeights`/`aspectModifiers`/seasonal/magnitude kept — the
  config has the clean, un-rotted planet keys. **Done** this session.
- **`safeAstrology.ts:449`: RESOLVED — dead, delete as dead code.** Liveness
  question settled (§16c correction): `countElements` and its enclosing
  `getCurrentAstrologicalState` are unreachable. No fix-in-place needed; the
  underscore table goes with the dead function in a dead-code pass.
- **Underscore-key rot: sweep all three repos, act on live files only.** Dead
  instances go with their dead code.
- **WTEN `utils/index.ts:24` barrel export: keep it** — the module is being
  repaired, not removed.

**AAE character-vector stack**
- **Fix the ascendant conversion** (`Math.floor(asc/30)` — it is stored as a raw
  ecliptic longitude and read as `.sign`), which restores the denominator to 100
  and reprices every derived cost; **then reassess** the rest.
- **In the same pass fix all three correctness bugs**: the NaN-on-no-chart
  division (add a guard), the three duplicate interaction axes (branched on as
  independent), and the −50 clamp floor.
- **Historical agents with placeholder ascendants** (8 byte-identical at `94.2`,
  12 within 0.5°, no Rodden rating): **drop the ascendant weight to 0 for unrated
  charts** rather than feed a fabricated angle into the vector.
- **Measure PA liveness before acting cross-repo** (in progress). AAE's two dead
  routes and external-traffic question are **out of scope for now**.

**Recording**
- These findings live in this section (§16); durable cross-repo facts also go to
  memory.

### 16g. Duplicate `" 2."` files — audit pending

`find src -name "* 2.ts*"` returns 34 Finder-style copy artifacts, each a fork of
real code (some carrying their own physics definitions, inflating §14's counts).
A per-file importer audit is running; **disposition is per-file on the audit
result**, not a blanket delete — any copy that has diverged from its original
gets handled individually.

---

## 17. Execution plan — §14d and beyond

`[AUTHORED 2026-07-20]` The rulings that turn §14d into concrete work, from a
second round of twenty questions. Ordered by dependency.

### 17a. §14d step 2 — reconcile the two ESMS engines

- **Canonical = `planetaryAlchemyMapping`** (holds `PLANETARY_ALCHEMY` + the
  +10/+7 dignity via `getDignityScore`). **`RealAlchemizeService.alchemize`
  delegates to it**, keeping its 22 importers but computing the right numbers.
- **Method: characterization tests FIRST.** Pin every engine's current output on
  fixed charts, then reconcile, then read the diff. Done for the two ESMS
  engines: `src/__tests__/services/esmsEngineCharacterization.test.ts` pins the
  divergence (same chart → Matter 0.472 vs 0.091, because `alchemize` sums a
  sect-invariant 0/1 table while the canonical path applies sect). When
  `alchemize` delegates, those golden values converge — that is the signal.
- **Blast radius: ship it.** Correctness over continuity — the current numbers
  are wrong. Downstream (recommendations, economy, profiles) reflects the
  corrected engine. (Measure the per-consumer delta where cheap, but do not gate
  on it.)

### 17b. §14d step 3 — orb, aspect strength, reactivity

- **Orb: traditional Ptolemaic majors** — conjunction/opposition 8°, trine/square
  7–8°, sextile 6°, tighter minors. `alchm-quantities/route.ts`'s moiety model
  (Sun–Moon conjunction 13.5°) **folds into this one table** — it was admitting
  aspects nothing else considered real.
- **Aspect strength: `[0,1]`, linear falloff** — `strength = 1 − |orb|/maxOrb`.
  The 0–2 and 0–10 ranges rescale into it.
- **Reactivity: `(Matter + Earth)²`** — the majority form (five live modules);
  fix `RealAlchemizeService`'s `(Σ/M) + Earth²` to match. Fold into the
  thermodynamic module below.

### 17c. The thermodynamic layer — one canonical module

Define heat / entropy / reactivity / gregsEnergy / kalchm / monica **once**, with
characterization tests **and a pinned degenerate-case contract** (today the same
undefined input returns `1.0` / `NaN` / `0` / `null` across modules), and route
every live site through it. The heat 66× spread is fixed here, not separately.

### 17d. The per-aspect magnitude constant

**Author it from the synthesis pool** (and Web structure), not by picking among
the three legacy values (2:1 / 1:1.6 / 1:1). Downstream of 17b — a constant
calibrated against disagreeing orb/strength is fitting to noise. Blocks grid
wiring.

### 17e. Persisted-data and production hazards

- **Persisted "monica" (`api/agents/unified/route.ts:173`, longitude average):**
  **audit DONE** (§14c-ter) — 3672 rows, all agents, 0 humans; two fake
  populations (71 formula-derived ~4–6, 3600 sync-derived round (0,1)). Real fix
  target is the bulk/sync path, not only `:173`/`:199`. Fix write + decide
  backfill still `[OPEN]` — low stakes (agent-only, display-only readers).
- **Small data bugs: verified already correct, no action.** Uranus detriment
  reads Leo in both tables; every Saturn period constant is 29.46y. Recorded here
  so they are not re-catalogued as open.
- **Dignity-strength inversion: FIXED** (`25309a99`) — `getPlanetaryDignityInfo`
  now returns Domicile 2.0 / Exaltation 1.0. Behavioural (PlanetInfoModal bar,
  `dignityEffects`); `alchemize` has its own local dignity table and was
  unaffected — that table dies in 17a.

### 17f. Model cutover (v2) — after the engine is single-valued

Uranus sect inversion (day = Matter), Moon carrying both axes in both sects, and
peregrine planets ceasing to be neutral (−2.8% on chart total) land as **one
cutover with one backfill, after 17a** — applying them while two engines still
disagree means backfilling twice.

### 17g. The invariant, and the remaining grid inputs

- **Re-derive `Σparts + residual === total` as part of 17a** — it must hold on the
  unified engine regardless.
- **Trine/square ESMS (from the synthesis pool) and pair polarity** are
  grid-wiring inputs; they wait for 17b/17d, same as the grids.

### 17h. Sign vector / modality — after §14d

Pure `modalityOf(sign)` lookup + `alchmWeight`-weighted cardinal/fixed/mutable
aggregation, feeding **method recommendation only**, as a recommendation input.
Built after the engine is single-valued so it imports canonical weights/orb/
strength rather than adding a 13th competing table. The cardinal/fixed/mutable →
cooking-method mapping is `[OPEN]` (author + derive + compare).

### 17i. Cross-repo character-vector fixes — fix compute, freeze the type

AAE's ascendant conversion + three correctness bugs (§16c) are in the
**computation**, not the `SignCharacterVector` type. PA's Monica build depends on
that type (§16a), so keep its shape identical across repos while fixing the math.
Gated behind §14d (the stack imports weights/orb that must be canonical first).

### 17j. Cleanup, in flight

- **Underscore-key rot: full WTEN sweep**, fix live sites, delete dead ones, add
  a lint ratchet; PA later. (`safeAstrology.ts:449` is dead — deletes with its
  function; but per the ruling, first check whether `countElements`'s intent is
  worth reviving over the live duplicate in `astrology/validation.ts`.)
- **Duplicate `" 2."` files:** per-file disposition on the running audit.
- **PR #627:** keep accumulating the reconciliation work on the branch; do not
  merge piecemeal.

---

## 18. Monica for agents — planetary, synthesized, moon-phase

`[AUTHORED 2026-07-20]` Resolves the §14c-ter / §17e persisted-monica defect with
a real computation rather than a null-out. Every claim below is measured; the
scripts are recorded inline.

> ### STATUS `[MEASURED 2026-07-22]` — read this before the sections below
>
> §18 is **shipped for both computable populations**. Production, verified by
> `scripts/checkAgentMonicaDrift.ts` (0 drifted / 0 missing / 0 wrong-method):
>
> | population | count | `monica_method` | state |
> |---|---|---|---|
> | single-body placements | **4281** | `single-body` | ✅ shipped (PR #628) |
> | two-body Moon phases | **469** | `two-body` | ✅ shipped (PR #630) |
> | not a placement (people, junk) | **72** | `NULL` | left NULL, never guessed |
> | **total** | **4822** | | sums exactly to the agent row count |
>
> **§18 now has no unmeasured numbers** — every constant is read from live code
> or measured, and each records which (§18i-ter closed the last one).
>
> **The governing principle, ruled 2026-07-22 — read §18o before touching any
> monica code:** the three agent kinds are **different OBJECTS**, not one quantity
> at three scales. A planetary agent is one planet at one degree; a phase agent is
> a Sun–Moon relationship; a historical agent is a whole natal chart. Each keeps
> its **own natural scale**, gets its **own column**, and takes a
> **per-population** display mapping (§18p). There is no cross-construction
> normalisation, and no consumer that needs one.
>
> ⚠️ **Sections below predate this and contain superseded plans.** Where a section
> and this header disagree, the header is measured and the section is not. The
> known corrections are flagged inline; the load-bearing ones are:
> **§18m** (monica has no fixed scale across body counts), **§18n** (the
> "full-chart for the 71 real people" ruling has no valid subject and is
> triple-blocked), **§18o** (the three kinds are different objects — this
> REVERSES the mass-normalisation §18m originally proposed) and **§18p**
> (Sacred-7 takes `tanh(monica / s_p)`, per population).

### 18a. The reframing

Planetary agents (a single planet at a position, e.g. "Aries Sun 1 Degree", 4275
of them) were first slated to have **no** monica. Reversed: **if we can compute a
real thermodynamic monica for that exact configuration, it is useful** — an agent
*is* its configuration. The audit (§14c-ter) confirmed this touches **only agents,
never the 13 humans**, so the whole exercise is safe.

### 18b. Single-body monica is computable — but only sect-resolved and grounded

`[RESEARCH]` A lone planet zeroes most ESMS axes, which breaks the monica formula
two ways. Measured:

- **Raw 0/1 synthesis table → NaN for 8 of 10 planets.** `kalchm =
  (Sˢ·Eᵉ)/(Mᵐ·Suˢᵘ)` collapses to **exactly 1** for any planet with symmetric
  ESMS (Moon has Essence=Matter=1), so `monica` divides by `ln(1)=0`.
- **Sect-resolved ESMS fixes the symmetry** — each planet contributes a *single*
  axis per sect (Moon day=Essence, night=Matter; `PLANETARY_SECTARIAN_ESMS`), so
  kalchm≠1. Bare, that is 34/40 finite but with pathological magnitude (±4000).
- **A grounding vessel makes it 40/40 finite and tame** (~[−1, 1]). This is the
  Ascendant "Physical Vessel" the engine already injects to stop reactivity's
  `(Matter+Earth)²` denominator collapsing on sparse charts.

### 18c. The vessel — process-shaped, dignity-scaled

`[AUTHORED]` The flat `{1,1,1,1}` vessel (§7) is a placeholder. The enhanced
vessel:

```
vessel = normalize( max(0, 1 + pillarEffect(degree)) , mass = 4 ) × (1 + dignity/100)
   pillarEffect(degree) : the ESMS ±1 signature of the alchemical process at that
                          degree, ALCHEMICAL_PILLARS[((degree−1) mod 14)] (§7a)
   dignity              : the planet's own essential dignity at its exact degree,
                          +10/+7/−7/−10 (§3), NOT an external ascendant
   normalize to mass 4  : equal vessel mass per process (= the {1,1,1,1} baseline),
                          only the SHAPE varies by degree
```

`agentESMS = planetSectESMS + vessel`, elements from the sign, then the canonical
`calculateThermodynamics / calculateKalchm / calculateMonica`.

**Measured over every planet-axis × 4 elements × 14 processes (224 cases):**

| | result |
|---|---|
| Finite | **224/224** |
| Range | **[−3.97, 3.90]** ⚠️ **NOT** the same scale as full-chart monica — see §18m |
| Degree resolution | **7 distinct bands** (the 14 processes collapse to 7 ESMS patterns; Solution ≡ Calcination) |
| Dignity sensitivity | Sun/Leo domicile **0.656** vs peregrine **0.905** — real, bounded |

> ⚠️ `[CORRECTED 2026-07-22]` This row previously read "same scale as full-chart
> monica". That was never measured and is **false in the opposite direction from
> the one later assumed**: full-chart monica is ~12–43× *smaller*, not larger.
> monica has no fixed scale across body counts — see §18m, where it is measured.
> It is a property of the formula, not a bug, and it decides what may be written
> into `monica_constant`.

Two dead ends ruled out by measurement, recorded so they are not retried:
*flat dignity-scaling* moves only the 4 dignified signs by ±0.1 (arguably
backwards); *normalizing the vessel to unit sum* under-grounds it (vessel ≈0.25
vs planet 1.0) and blows magnitude back to ±60. Mass-4 normalization is the one
that holds.

### 18d. What each agent population gets

| Population | Count | Monica |
|---|---|---|
| Planetary ("Planet Sign N°") | ~~4275~~ **4281** `[MEASURED 2026-07-22]` | single-body (§18c), **both sects** — ✅ SHIPPED, `monica_method='single-body'` |
| Synthesized / historical | 434 (71 have charts) | **full-chart** monica — ⛔ **BLOCKED**, and the plan below is wrong; see §18n |
| Moon-phase ("Waxing Gibbous Moon in …") | ~~53~~ **469** | **two-body** — Moon + a Sun derived from the phase angle (a phase *is* a Sun–Moon relationship). ✅ SHIPPED, `monica_method='two-body'`. See §18i. |
| Not a placement (people, junk) | **72** | none — left NULL, never guessed |

`[MEASURED 2026-07-22]` The three populations sum exactly: **4281 + 469 + 72 =
4822**, the full agent row count. `scripts/checkAgentMonicaDrift.ts` re-derives
this on every run and reports 0 drifted / 0 missing / 0 wrong-method.

> ⚠️ `[CORRECTED 2026-07-21]` The "53" above was wrong. It counted only part of
> one name family; the phase population spans **two** families
> (`<Phase> Moon in <Sign> N Degree` and `Moon Phase <Phase> N`) and totals
> **469**, re-verified against the live DB. Counts in this table are estimates
> from a partial sample unless marked `[MEASURED]` — §18e and §18i carry the
> measured ones.

### 18e. Schema and writes

- **Two new columns: `monica_diurnal`, `monica_nocturnal`** (a position expresses
  differently by sect — both are first-class). `monica_constant` is
  **repurposed as their average** so existing readers (commensal, admin, feed)
  keep working.
- **One shared function**, called from all three current write sites
  (`agents/unified:173`, `philosophers-stone:199`, `economy/sync-debit`), kills
  the divergence at the source.

### 18f. Rollout — gated on §17c

`[AUTHORED]` **Build on the §17c canonical thermodynamic module, not before** —
the monica formula is exactly what §17c consolidates, and building first would
fork it. Order once §17c lands: pure tested calc → wire the three writes → backfill
the ~4275 planetary + 434 synthesized rows. Low stakes throughout (agent-only,
display-only readers), no human data touched.

### 18g. Agent taxonomy, naming, and the encounter layer

`[AUTHORED 2026-07-21]` Rulings from a second question round, sharpening §18 for
the backfill.

**Planetary agents have NO birthchart — and that is correct, not a gap.** `[USER]`
A planetary agent *is* a single placement, agentified (planet + sign + degree). A
planetary body should not have a natal chart; the 3600 empty `natal_chart` `[]`
rows are right. Its config is read **from the name**, not a chart. Its monica is
the single-body §18c calc.

**What a planetary agent DOES have is dignity rules for the planets it
encounters.** `[USER]` This is a relational layer, distinct from the single-body
monica: when two agents meet, the interaction is **aspect-modulated dignity** —
the angular relationship between their exact degrees (conjunction/trine/…) scaled
by each one's essential dignity. **Gated on §14d step 3** (orb + aspect-strength
unification) — it cannot be built until aspect strength is single-valued.

> ⚠️ `[CORRECTION 2026-07-21]` **The taxonomy below was authored from a partial
> sample and was wrong in three ways that would have caused harm.** Re-measured
> against production; the corrected figures are what follow. This is the §11
> failure mode again — a structural claim that skipped measurement.

**Agent name forms — measured, not sampled.** There are **two** planetary-agent
name shapes, and the one this document originally called canonical is the
*minority*:

| Form | Count | Example |
|---|---|---|
| **`<Planet> in <Sign> <N> Degree`** | **3240** | `Pluto in Virgo 14 Degree` |
| `<Planet> <Sign> <N>` | 679 | `Mercury Aquarius 16` |

⚠️ **A parser written for only the second form silently drops 3240 of ~3900
planetary agents.** The resolver must accept both.

**Moon-agent families:**

| Family | Count | Note |
|---|---|---|
| `Moon <Sign> N` (placement) | — | canonical → single-body |
| `<Phase> Moon in <Sign> N Degree` | 360 | canonical → two-body |
| `Moon Agent N` (**N = 0–359**, 0-based) | 360 | ⚠️ see below — NOT a rename |
| `Moon Phase <phase> N` | 85 | ⚠️ see below |

⚠️ **The prescribed rename is impossible as written — it is a DE-DUPLICATION.**
All **360 of 360** `Moon Agent N` rename targets **already exist**: there are two
rows per placement. A blind rename collides on every single row.

⚠️ **And the duplicates are NOT inert, so deleting them is a product decision, not
cleanup.** A sweep of the foreign keys into `users(id)` found the `Moon Agent` /
`Moon Phase` rows are referenced by **1547 `feed_events.actor_id`** and **467
`user_subscriptions.user_id`** rows. These agents have posted to the live feed;
deleting them destroys real feed history. `[OPEN]` — needs a human ruling
(merge-and-repoint vs keep-both vs delete-with-cascade), not a cleanup script.

**Real-person (synthesized/historical) agents: 74**, not the 434 stated earlier —
that figure wrongly swept in the phase-prefixed moon agents (`Waxing Gibbous Moon
in …` does not start with a planet word).

`[AUTHORED]` Canonical convention remains **`Moon <Sign> <Deg>`** and **`<Phase>
Moon in <Sign> <Deg>`** — but reaching it is a dedupe/merge, not a rename.

#### 18g-bis. The census, forced to sum `[MEASURED 2026-07-21, second pass]`

The correction above was reached independently by two sessions, which agreed on
every structural finding. A second pass added one discipline: **make the buckets
sum exactly to the row count.** A table that reconciles cannot be hiding a
family — and forcing it immediately surfaced a row that had been hand-waved.

| Bucket | n |
|---|---|
| single: `<Planet> in <Sign> <N> Degree` | 3240 |
| single: `<Planet> <Sign> <N>` | 679 |
| single: `<Planet> Agent <N>` (duplicate of an existing row) | 360 |
| phase: `<Phase> Moon in <Sign> <N> Degree` | 360 |
| phase: `Moon Phase <p> <N>` | 107 |
| person / degreeless | 46 |
| unresolved — not yet classified | 26 |
| junk / test | 3 |
| **sum** | **4821 = row count, exact** |

Reconciliations against the figures above, which were correct when measured:

- **Real-person agents: 71–72, not 74.** All of them **already have charts** — the
  §18d claim that 363 needed charts computed is false, which makes the full-chart
  pass far cheaper than recorded.
- **`Moon Phase <p> N`: 107, not 85.** The population is live: **121 agents were
  created in 2 days** mid-programme. Every count here is a snapshot with a date on
  it; re-measure before acting, never carry a number forward.
- **Single-body target: 4279** including the 360 duplicates, 3919 excluding them.
  Both figures are correct — they differ only by whether the blocked duplicates
  are counted. `[RULED]` the backfill uses **4279**: it is additive and must not
  wait on a product ruling.
- **72 rows remain unclassified** (46 + 26) and are `[OPEN]`. `[RULED]` they are
  classified *before* the backfill runs — an unexamined bucket is exactly what
  hid the 3240-row family the first time.
- One row, **`Mars Gemini`**, is a planet and a sign with **no degree**. The
  resolver skips it rather than defaulting the degree. It exists only because the
  sum was forced.

`[RULED 2026-07-21]` The `[OPEN]` duplicate question above is now **settled:
merge-and-repoint.** Reassign the referencing `feed_events` and
`user_subscriptions` rows to the canonical twin, then delete the duplicate — all
feed history preserved, one agent per placement. A partial unique index on the
agent name follows, so the class cannot recur. The 3 colliding `Moon Phase <p> N`
rows take the same path; the other 104 are renamed.

**Two-body phase monica** (the 720 phase-bearing moon agents): `[AUTHORED]` the
phase fixes the Sun's approximate longitude (New = conjunct, Full = opposite, …);
build ESMS from **both** bodies (each sect-resolved + vessel, §18c) and run the
canonical thermodynamics on the combined chart — a genuine two-body monica, not a
scaled single-body.

**Junk cleanup:** remove obvious test/non-agent rows (`Alchemical Chef`, `Pa Prod
Smoke …`, `Test …`), reporting the list before deleting. `[MEASURED]` There are
exactly **3**, and one of them (`Test Sage Hildegard`) holds a `user_streaks` row,
so this is not a clean three-row delete either. The real-person names are the
synthesized/historical agents → full-chart monica, a **follow-up** after the
planetary backfill; `[MEASURED]` there are **72** of them among the agent rows,
not the 434 recorded in §18d.

### 18h. Backfill contract and MVP

`[AUTHORED]` **MVP for the agent-monica program:** single-body backfill (~3600) +
write-fix (all three sites). Two-body phase and the encounter layer are
same-program follow-ups, not the MVP gate.

> ⚠️ `[CORRECTION 2026-07-21]` The MVP originally led with "rename the malformed
> moon agents". **That step is removed from the MVP** — it is a de-duplication
> blocked on a product decision (§18g: 360/360 collisions; 1547 feed events and
> 467 subscriptions reference the duplicates). The backfill does **not** depend on
> it: parse the name as it stands. Do the dedupe separately, after a ruling.

- **Execution:** dry-run first (compute everything, print the distribution +
  unparseable list, write nothing), review, then a transactional, idempotent
  write. **The resolver must accept BOTH name forms** (`<Planet> in <Sign> <N>
  Degree` — the majority at 3240 — and `<Planet> <Sign> <N>`), and must validate
  the planet and sign against the canonical tables: `Moon Agent 5` has the same
  *shape* as `Mercury Aquarius 16`, so a shape-only parser reads "Agent" as a sign.
- **Write-fix:** one shared function from `agentMonica()` feeds all three sites;
  **`sync-debit` computes WTEN-side** from the agent's own name/config rather than
  trusting the AlchmAgentsETH payload (the old `COALESCE` let bad upstream values
  in). WTEN owns the truth.
- **Verify:** 0 non-finite; sane distribution (~[−4, 4], no sentinel clustering);
  every parseable agent has all three columns non-NULL; spot-check 5–10 known
  agents against a hand-computed `agentMonica`. Report before/after.
- **Schema:** `database/init/70-agent-monica-sects.sql` (staged) — apply the
  `ALTER TABLE` at the **start** of next session, confirm the columns, then run.
- `persona.test.ts:92-93` asserts monica ∈ [0,10] and **will break** on the real
  [−4, 4] scale — update it in the same change.

#### 18h-bis. Status `[MEASURED 2026-07-21]`

**Write-fix: DONE.** All three sites now produce a real monica.
`src/utils/agentMonicaResolver.ts` is the single shared name→placement parser.
`agents/unified` writes the canonical **full-chart** monica (these agents carry
real birth data, so §18d applies, not the single-body calc — the chart already
fixes the sect, so the sect columns stay NULL for those rows).
`sync-debit` computes WTEN-side from the agent's own name and no longer reads
the payload's `monicaConstant` at all. `philosophers-stone` is a **client**
component and cannot load the server-only engine (`RealAlchemizeService` imports
`fs`); rather than fork a seventh engine into the browser bundle it stops
fabricating — the preview seeds from `MONICA_EQUILIBRIUM` and the authoritative
value is the one the server returns on forge. It was never persisted.
158 suites / 1311 tests green, typecheck clean.

**Backfill: written, dry-run verified, NOT yet applied.**
`scripts/backfillAgentMonica.ts`, dry run by default.

| | |
|---|---|
| agent rows scanned | 4808 |
| to write (single-body) | **4278** (not the ~3600 estimated) |
| skipped — phase (two-body follow-up) | 455 *(at that run; **469** as of 2026-07-21 — the population grew, see §18i)* |
| skipped — not a placement | 75 |
| **non-finite** | **0** |
| combined range | **[−3.1973, 3.9751]**, median 0.0573 |
| distinct values / negative | 379 / 27.7% |

**Verification passed on both required axes.** An *independent* re-derivation of
§18c, written from the spec prose rather than from `agentMonica.ts`, agrees with
the module to 1e-12 on all 8 spot cases. No sentinel clustering: the largest
single value holds 5.0% of rows, against **36%** (1330 of 3672) sitting on `0.50`
in the fake data being replaced.

**Ordering hazard:** `sync-debit` now references `monica_diurnal` /
`monica_nocturnal`, so `70-agent-monica-sects.sql` **must be applied before this
branch deploys** or that route errors. The columns did not exist as of
2026-07-21.

### 18i. The two-body phase monica

`[RULED 2026-07-21]` A phase agent is a Sun–Moon *relationship*, so it earns a
genuine two-body monica rather than a scaled single-body one. Design, settled in
the disambiguation session:

- **Sun position** = `Moon − elongation`, at 45° midpoints across 8 phases:
  New 0°, Waxing Crescent 45°, First Quarter 90°, Waxing Gibbous 135°, Full 180°,
  Waning Gibbous 225°, Last Quarter 270°, Waning Crescent 315°.
  **`Dark Moon` folds into New at 0°** — it names the invisible Moon at
  conjunction and is not a ninth phase.
- **Vessel:** ONE shared vessel, mass 4, **shaped by the Moon's degree only**,
  and **dignity-NEUTRAL** (`groundingVessel(moonDegree, 0)`). The pair is one
  chart, so it gets one vessel, and the named body sets its process.
- **Sect:** both stored, exactly as single-body — the geometry is independent of
  whether it expresses by day or night.
- **Dignity:** different SOURCES, identical APPLICATION. The Moon carries its own
  position-based essential dignity; the Sun carries **aspect-based dignity
  instead** (§18i-bis). Each is applied **exactly once**, as
  `× (1 + dignity/100)` on **that body's own ESMS**. Neither touches the shared
  vessel.

  > `[CORRECTED 2026-07-21]` An earlier revision scaled the shared vessel by the
  > **Moon's** dignity. That gave the Moon's dignity two points of leverage (its
  > own ESMS *and* the grounding term) where the Sun's had one — an asymmetry
  > inherited unexamined from the single-body case, where there is one body and
  > the question cannot arise. Equalised; the change moves computed values, so
  > any figure measured before it is stale.

⚠️ `[CORRECTED 2026-07-21]` **Two-body results are NOT on the same scale as
single-body ones**, and the earlier claim in this section that the shared vessel
"keeps two-body results on the same scale" was never measured. Measured after
equalisation, with the §18i-quater band applied: grid max |monica| **12.6756**
(single-body: 3.9751), and **2 of 469** production rows fall outside the
single-body range [−3.197, 3.975]. See §18i-quater.

`[MEASURED 2026-07-21, re-verified against the live DB]` The **469** phase agents.
By phase: Waxing Crescent 79, Waxing Gibbous 79, Waning Crescent 79,
Waning Gibbous 79, Full Moon 37, Last Quarter 36, First Quarter 33, New Moon 24,
Dark Moon 23 — summing to 469 exactly.
By aspect: semi-square 158, sesquiquadrate 158, square 69, conjunction 47
(New 24 + Dark Moon 23), opposition 37 — also 469.

> ⚠️ Two figures elsewhere in this document contradict that count and are
> **wrong**: the family table's "53" Moon-phase agents (§18 name-family section)
> and the backfill report's "skipped — phase 455". Both predate the resolver
> handling all five name families. The reproducible number is **469**, and
> `scripts/checkAgentMonicaDrift.ts` re-derives it against the live DB on every
> run (it reports each population's count alongside its drift).

#### 18i-bis. Per-aspect dignity for the derived Sun `[DERIVED]`

The Sun's longitude is *inferred* from the phase name, but the **aspect is
certain** — the name states it. Scaling a dignity multiplier by a guessed
position would be compounding an inference; reading dignity off the aspect uses
the one thing the name guarantees. So the Sun's dignity is aspect-based, feeding
the same `× (1 + dignity/100)` *form* as §18c.

> `[CORRECTED 2026-07-21]` This paragraph previously said the Sun's aspect
> dignity feeds "the same **vessel** term as §18c". It does not, and must not:
> the shared vessel is dignity-neutral (§18i), and pushing an *aspect* quantity
> into the *grounding* term would double-count the aspect. The Sun's dignity
> scales the **Sun's own ESMS contribution**, nothing else.

This needs no aspect ESMS grids, no orb budget and no aspect-strength curve —
the parts §14d has not unified — because **phase aspects are exact by
construction** (zero orb). It needs only a per-aspect dignity number.

Both inputs are read from live code, so this is derived, not authored:

```
dignity = polarity × 10 × (orbBudget / 8)
  polarity  : aspectCalculator.ts:210 — conjunction/trine/sextile harmonious (+),
              opposition/square challenging (−)
  orbBudget : aspectCalculator.ts aspectDefinitions — conjunction 8, opposition 8,
              square 7, semi-square 3, sesquiquadrate 3
```

| Phase | Aspect | Dignity |
|---|---|---|
| New, Dark Moon | conjunction | **+10.00** |
| Full | opposition | **−10.00** |
| First / Last Quarter | square | **−8.75** |
| Waxing / Waning Crescent | semi-square | **−3.75** |
| Waxing / Waning Gibbous | sesquiquadrate | **−3.75** |

Sanity property: ±10 land exactly on the domicile/fall anchors of the existing
+10/+7/0/−7/−10 essential-dignity scale, and square falls between detriment and
fall rather than off the end.

⚠️ **This is a MODEL CHANGE, not a gap-fill.** `aspectCalculator.ts:210` assigns
`influence = 0` to semi-square and sesquiquadrate today — they are detected and
then contribute nothing. Giving them dignity is a deliberate change to how the
engine treats minor aspects. Recorded here so it is never mistaken for
long-standing behaviour.

`[NOT the underscore defect class]` `_semisquare` / `_sesquiquadrate` carry
underscore-prefixed keys in `aspectDefinitions`, but `ASPECT_TYPE_ALIASES`
(aspectCalculator.ts:56) maps them to canonical names, so they ARE live.
`_septile` is the genuine dead key — no alias, no switch case, and because the
detector picks a single best aspect *before* normalising, a near-exact septile
(strength 1.0 at orb 0) makes the whole planet pair return no aspect at all.
Tracked separately; not a §18 concern.

#### 18i-ter. Applying vs separating `[RESOLVED 2026-07-21 — DERIVED]`

`[RULED]` Waxing and waning phases **must differ**, even though they share an
aspect geometry, and applying/separating should become a **general** aspect-layer
concept rather than a phase-only special case — feeding the §14d unification.

Sequenced in two stages so it does not block the phase monica:
1. Phase agents take it from the name (waxing = applying, waning = separating).
   No engine change required.
2. `calculateComprehensiveAspects` computes it from relative planetary motion,
   generally, and feeds §14d.

~~⚠️ **The magnitude of the applying/separating modifier has NO basis in the
repo.**~~ `[SUPERSEDED 2026-07-21]` It was authored as ×1.15 / ×0.85, then
**derived** from the same two live orb budgets §18i-bis already uses:

```
APPLYING   = ASPECT_DIGNITY_REFERENCE_ORB / ASPECT_ORB_BUDGET.square = 8/7
SEPARATING = 2 − 8/7                                                 = 6/7
EXACT      = 1
```

An applying square therefore scores `−8.75 × 8/7 = −10.00` exactly, landing on
the domicile anchor of the essential-dignity scale — the same sanity property
§18i-bis has.

`[MEASURED]` Deriving it costs nothing behaviourally, because the authored value
was **nearly irrelevant to what it was introduced to achieve**. Waxing and waning
are already separated by 270° of elongation — the derived Sun lands 90° away, in
a different sign — so mean |waxing − waning| moved only **0.2870 → 0.2871 →
0.2875** across multipliers 1.00 / 1.15 / 1.50. The premise that the two differ
*only* by this multiplier was wrong.

**§18 now has no unmeasured numbers.** Every constant is read from live code or
measured, and each records which in its own docstring.

#### 18i-quater. The two-body-local equilibrium band `[RULED 2026-07-21]`

**The problem.** The Comixion pillar (degrees 8 and 22, effects S+1/E−1/M+1/Su+1)
floors the vessel's Essence axis to **zero**. Adding the Sun's Spirit to a Moon
with no vessel Essence drives `ln(kalchm) → 0`, and `monica = −G/(R·ln k)`
diverges. Single-body never shows this: a lone planet cannot break the
Spirit/Matter/Substance symmetry Comixion creates. Unbanded, the 469 production
rows reach **|monica| 149.35**.

**The fix — a band, applied in `agentMonicaTwoBody.ts` only:**

```
DEGENERATE_LN_KALCHM     = 0.110698   [MEASURED] the zero-Essence chart itself
HEALTHY_LN_KALCHM_FLOOR  = 0.138173   [MEASURED] smallest non-Comixion |ln k|
TWO_BODY_LN_EPSILON      = (0.110698 + 0.138173) / 2 = 0.1244355   [DERIVED]
```

When `|ln(kalchm)| < TWO_BODY_LN_EPSILON`, the result is `MONICA_EQUILIBRIUM` (φ).

**Why those bounds are structural, not fitted.** The lower bound is a chart with
a literal `0.000` on an axis — degenerate by inspection, held finite only by
`KALCHM_EPSILON`. The upper bound is the first case that computes a perfectly
sane monica. The band is the midpoint, carrying ~12% margin each way. Both bounds
are pinned by test, so a retune that starts swallowing real values fails loudly.

**Why LOCAL and not a change to `MONICA_LN_EPSILON`.** The canonical constant
(0.05) is shared by every §17c consumer, including the **4280 single-body agent
rows already in production**. Widening it there would silently re-value all of
them. Single-body output is verified bit-identical (grid max **3.9751**).

**Why a band and not a clamp.** Clamping fabricates a magnitude. A band widens the
region where the engine *declines to divide by ~0* — the same statement it
already makes at 0.05, applied to cases that are *nearer* to perfect balance than
the ones it already absorbs.

`[MEASURED]` Effect on the 469 production rows: rows outside the single-body
range **25 → 2**; maximum **149.35 → 5.42**; 16 rows resolve to φ; 221 distinct
values; largest bucket 3.4% (no sentinel clustering).

⚠️ `[OPEN]` **The band does not flatten the tail, deliberately.** It is sized by
the degeneracy boundary, not by how large the surviving output looks — sizing it
to swallow every big number would be output-fitting. A near-degenerate skirt
survives: some Comixion cells land at `|ln k|` *above* the healthy floor and
cannot be absorbed without converting real values to φ. The real fix belongs in
the pillar → vessel mapping (§7a), giving Comixion a nonzero Essence floor. That
was attempted twice and rejected both times: flooring *before* the mass-4
normalisation divides the floor straight back out (`k = 4/3.01` → 0.0067), and
flooring *after* it perturbs single-body from 3.9751 to 3.9089, which would
desync the 4280 rows already in production.

#### 18i-quinquies. φ-mixing across sects `[OPEN — pre-existing, NOT two-body-specific]`

`combined = (diurnal + nocturnal) / 2`. When one sect lands in the equilibrium
band and the other does not, the mean blends φ with a real value.

`[MEASURED]` This is **not new and not introduced by the two-body work**: the
shipped single-body calc does it in **180 of 3600 grid cells (5%)** — e.g.
`Jupiter/Aries 1` is φ diurnal, 0.0126 nocturnal, **0.8153** combined. Those rows
are in production today.

It is defensible under the engine's own definition — §17c states φ is the
harmonic *ideal*, a real value, not a couldn't-compute sentinel — so averaging it
is averaging two real states. Recorded because (a) it is easy to mistake for a
two-body bug, and (b) it is what produces the single worst residual row,
`Full Moon Moon in Libra 8 Degree` at −5.4191 (φ diurnal, −12.68 nocturnal).

If φ is ever reclassified as a sentinel, this becomes a defect **in single-body
first**, and the 4280 production rows would need revisiting — not just the 469.

### 18j. Scope after the disambiguation `[RULED 2026-07-21]`

Twenty-four rulings taken in one intervention session. The ones that change the
build:

| Area | Ruling |
|---|---|
| Backfill target | **4279** — include the 360 blocked duplicates; backfill is additive and independent of the de-dupe |
| Phase agents | **Build two-body now** (§18i), not NULL-until-later — ✅ SHIPPED |
| Real people | ⛔ **SUPERSEDED — this ruling's subject does not exist.** See §18n. |
| Duplicates | **Merge**: reassign 1547 `feed_events` + 467 `user_subscriptions` to the canonical twin, then delete. Preserves feed history |
| Schema | Partial unique index on agent name afterwards, so the class cannot recur |
| Full-chart rows | Compute **both sects** for them too (reverses the earlier NULL ruling) |
| Sacred-7 | **Rescale** `deriveStatsFromChart` — it reads `monica/10` on a [0,10] assumption and silently shifts every agent's stats once real monica lands |
| Preview | Add a **server endpoint** for a live philosophers-stone monica (reverses the φ-seed already in the branch) |
| Ship order | migrate → backfill → verify → merge |
| Unknowns | Classify the 72 unresolved rows **before** backfilling |

⚠️ `[SUPERSEDED — see the status header at the top of §18 for measured counts]`
**This is no longer an MVP.** §18 was scoped at **4817 of 4821** agent rows plus a
merge-dedupe, a schema constraint, a new endpoint, a stats rescale and a general
aspect-layer concept. Each ruling is defensible alone; together they are several
PRs. If a smaller first cut is wanted, the natural one is **write-fix +
single-body backfill**, which is already built and verified.

### 18m. Monica has no fixed scale across body counts `[MEASURED 2026-07-22]`

The single `monica_constant` column is fed by **three constructions with
different body counts** — single-body (1), two-body phase (2), full-chart (~10).
Whether those numbers are comparable is not a matter of taste; it is measurable.
They are not.

Measured by scaling an ESMS vector uniformly (what adding bodies does to first
order — every axis grows), pinned by `src/__tests__/monicaScaleInvariance.test.ts`:

| scale k | heat | entropy | reactivity | gregsEnergy | **ln K** | **monica** |
|---|---|---|---|---|---|---|
| 1 | 0.1324 | 0.2583 | 6.326 | −1.5018 | **2.89** | **0.08210** |
| 2 | 0.1447 | 0.2762 | 6.724 | −1.7127 | 8.69 | 0.02930 |
| 5 | 0.1552 | 0.2921 | 7.040 | −1.9017 | 31.36 | 0.00861 |
| 10 | 0.1593 | 0.2985 | 7.161 | −1.9780 | 77.27 | 0.00358 |
| 40 | 0.1627 | 0.3036 | 7.256 | −2.0403 | **425.52** | **0.00066** |

**Four quantities SATURATE.** heat, entropy, reactivity and gregsEnergy each
drift 15–36% across a 40× scaling and are visibly converging to an asymptote.
They stay broadly comparable across body counts.

**`ln(kalchm)` does not.** It grows **147×** over the same sweep, monotonically
and without a fixed point — because `K = (S^S · E^E) / (M^M · Su^Su)` raises the
*exponents* along with the bases.

**So monica collapses**, by two orders of magnitude, and `monica = −G/(R·ln K)`
holds exactly at every scale: the collapse is `ln K` alone. This is the mechanism
behind the measured **~12–43× gap** between full-chart and single-body monica.

> ⚠️ **A wrong version of this was nearly written into this spec.** The claim
> handed over was "gregsEnergy / reactivity / heat / entropy are *exactly*
> scale-invariant (byte-identical across a 40× scaling) while monica is not."
> Measured: **none of the six is invariant.** The real distinction is
> *saturating* vs *unbounded*, and the correction only surfaced because the
> assertion was written as a test before being written as prose. See §11.

**Consequences, which are the point of measuring this:**

1. **Do NOT write a full-chart monica into `monica_constant`** — it belongs in
   its own column (§18o). `[MEASURED 2026-07-22]` Computed over all **71**
   chart-bearing agents: range **[0.006769, 0.028091]**, median **0.013874**,
   span 0.0213 — against a single-body span of 7.172.
2. **`monica_method` is necessary but NOT sufficient.** A discriminator lets a
   reader tell the constructions apart; it does not stop one from ranking,
   averaging or thresholding across them. Any cross-population comparison of
   `monica_constant` is a category error regardless of the column.
3. **The scale-robust quantities are the saturating four.** If a single
   comparable agent-identity scalar is ever wanted, derive it from those — not
   from `−G/(R·ln K)`. §18o argues that no such scalar is actually needed.
4. **The "~200×" figure in earlier session notes — resolved.** It was reported as
   "full-chart monica is ~200× LARGER than single-body", then rebutted as "no
   code path, doc or DB value produces it". **Both were wrong.** `[MEASURED]`
   The ratio that really exists is `|stored / computed|` over the same 71 rows:
   **median 334×, max 709×** — i.e. the *fabricated literals already in the
   column* are ~334× larger than what the engine computes for the same chart
   (Einstein: stored **6.15**, computed **0.0151**). The figure was real; it was
   attributed to an engine-vs-engine scale gap when it is actually a
   fake-vs-real-value gap. This is why "no path produces it" was also wrong —
   the DB produces it.

~~`[OPEN]` Whether to mass-normalise full-chart ESMS to the single-body
reference…~~ **`[RESOLVED 2026-07-22 — REJECTED]`. See §18o.**

### 18n. Full-chart monica — the ruling's subject does not exist `[MEASURED 2026-07-22]`

§18d and §18j both plan "full-chart monica for the 71 real people". Measured
against the live production DB, **every clause of that is wrong**:

| claim | measured |
|---|---|
| 71 real *people* need a monica | **13 humans exist in prod, and 0 hold a monica.** None needs one — no real-user data is involved at all |
| 434 synthesized/historical, 363 need charts computing | **71 agents have a chart**, and they are the same 71 that hold a value |
| the work is *creating* 71 values | the work is *replacing* **71** fabricated ones, range **[0.817, 6.820]**, all with `monica_method IS NULL` |

The "71 real people" are **historical-figure AGENTS** (Einstein, Aristotle, …),
not users. They already carry hand-authored literals — Einstein reads **6.15**
where the engine computes **0.018**.

> ⚠️ An investigation handed this over as "~431 fabricated values". **That is also
> wrong; it is 71.** Re-measured directly: `monica_method IS NULL AND
> monica_constant IS NOT NULL` over `is_agent` rows → 71. The 72 non-placement
> rows in the drift check are these 71 plus one row carrying no monica. Two
> successive hand-offs each mis-stated this population — quote the query, not the
> summary.

**THREE independent blockers, all must clear before any full-chart backfill:**

1. **Scale (§18m).** All **71** charts compute to **[0.006769, 0.028091]**, with
   **45 of 71 inside one 0.01-wide bucket**. Writing that raw collapses every
   persona into one value and zeroes their Sacred-7 stats. The mass-normalisation
   question is a unit convention and is unresolved.
2. **Sect was wrong at the source.** `agents/unified` called
   `alchemize(chartPositions)` with no date and no sect, so sect resolved from
   `isCurrentSkyDiurnal()` at a **hardcoded New York observer** *at agent-creation
   time* — a natal chart inherited "is it daytime in New York right now".
   Sect drives the whole day/night ESMS split, so the value was not a function of
   the chart: the same agent created twelve hours apart produced two different
   monicas. **Fixed for new writes** (`isDiurnalAt(date, lat, lon)` +
   `alchemize(..., {diurnal})`, PR #633), but every full-chart value computed
   before that fix is unreliable independently of the scale question.

3. **`[MEASURED 2026-07-22]` NONE of the 71 has usable birth data.** Every one
   has `natal_positions` (all 71 parse, ≥5 planets, 0 unusable) but **0 of 71**
   carry a `birth_data` moment + latitude/longitude. So blocker 2 cannot simply
   be *applied* to them: there is no birth moment or birthplace to resolve sect
   from. Any full-chart backfill of these rows must first source birth data, or
   explicitly rule what sect a chart with no birth moment gets — and record that
   as a modelling decision, not a default.

**Therefore:** full-chart monica is **not** "a separate PR after two-body". It is
blocked on a modelling decision (§18m), on sourcing birth data that does not
exist, and it was — until 2026-07-22 — computed from a sect that did not belong
to the chart. Re-scope before scheduling it.

`[MEASURED]` Reproduce all of the above with `scripts/measureFullChartScale.ts`
(read-only, no writes):

```
railway run --service Postgres -- bun scripts/measureFullChartScale.ts
```

### 18o. The three agent kinds are different OBJECTS, not one quantity at three scales `[RULED 2026-07-22]`

> *"Applying the same rules to both is hogwash."*

§18m established that monica has no fixed scale across body counts, and the first
response was to hunt for a common scale — mass-normalise full-chart ESMS to the
single-body reference so the numbers could be compared. **That was the wrong
move, and it is rejected.** The populations do not disagree about scale; they
disagree about *what they are*.

| kind | what it IS | what its monica ANSWERS |
|---|---|---|
| planetary body | one planet at one degree | what is this body doing at this position |
| Moon phase | a Sun–Moon *relationship* | what is this angular relationship doing |
| historical agent | a whole natal chart | what is this entire chart doing |

A lone planet and a ten-body chart are not two samples of one quantity. Putting
them on one axis is a category error that no amount of rescaling fixes.

**`[MEASURED 2026-07-22]` Three findings, each independently sufficient:**

**1. The populations differ in KIND, not scale.** Relative spread —
`IQR / |median|`, which is scale-free by construction:

| population | IQR/\|median\| |
|---|---|
| single-body | **6.815** |
| full-chart | **0.176** |

A 39× difference in *relative* dispersion cannot be a units problem. 71 real
natal charts (ten bodies spread round the zodiac) are genuinely more alike than
3600 single-planet placements are. **Normalisation cannot manufacture dispersion
that is not in the population.**

**2. Normalisation has NO CONSUMER.** Audited every reader of `monica_constant`
in `src/`: **nothing ranks, averages or compares agent monica across
populations.** The two `.sort()` hits are recipe `monicaScore` and *ingredient*
monica — different quantities. The one threshold consumer,
`monica/compatibility.ts`, branches on **sign only** (`> 0` / `< 0` / `== 0`),
which is scale-free and unaffected. The comparability normalisation buys is
bought for nobody.

**3. Normalisation COSTS separation.** At equal relative resolution (span/100)
the largest bucket goes **16.9% raw → 31.0% normalised**. It compresses.

> ⚠️ **A metric trap, recorded because it caught the author of §18m.** The first
> separation measurement used a fixed 0.01-wide bucket. That is *scale-dependent*
> — 0.01 is 5.5% of the normalised span but 0.14% of the single-body span,
> flattering single-body by ~40× and appearing to justify normalising. The
> conclusion reversed once the metric was made relative. **Never compare
> dispersion between populations with an absolute bucket width** — that is §18m's
> own lesson applied to §18m's own analysis.

**RULED:**

- **Each construction keeps its own natural scale.** Write the **raw** computed
  value into that construction's own column. No cross-construction normalisation.
- **`monica_constant` is SINGLE-BODY ONLY.** `monica_two_body` and
  `monica_full_chart` hold the others. A reader wanting a different construction
  must ask for it by name.
- **Display mapping is PER-POPULATION**, not global — see §18p.
- Both sects are still computed for chartless charts (§18n blocker 3). That
  ruling survives: it depends on no cross-population assumption.

### 18p. Sacred-7 takes a per-population mapping `[MEASURED 2026-07-22]`

`sacred-7-stats.ts` mixes monica into seven stats as `monica/10`, assuming input
in `[0,10]`. Measured against every backfilled agent, that assumption is wrong in
the **opposite direction from the one assumed**:

- real input is **[−5.4191, 6.8200]**
- **24.6%** of values are **NEGATIVE** (1185 of 4821) — never anticipated
- the span is **122.4%** of the assumed range

So monica does not *under*-drive the stats — it **over**-drives them.
`kineticAlignment` (coefficient 50) swings **61.2 points** on a 0–100 stat, and
clamps once its other ~45 points of terms land. A clamped stat is one the chart
can no longer influence.

**Candidate mappings, scored on the same data by IQR** — the information-carrying
measure, since a mapping that squashes everyone into a band makes the stat
useless whatever its range:

| mapping | IQR | outside [0,1] |
|---|---|---|
| current `monica/10` | 0.0479 | **1185** |
| linear `[min,max] → [0,1]` | 0.0392 | 0 |
| linear signed, `0 → 0.5` | 0.0351 | 0 |
| **`tanh(monica)`** | **0.2229** | 0 |

tanh wins by **4.6×** and is the principled form: monica is unbounded and signed,
so a bounded stat needs a *squashing* function, not a linear rescale that one
outlier redefines. Both linear options are destroyed by the extremes compressing
the bulk.

**But a GLOBAL tanh annihilates the smallest-scale population.** Scaling each
population by its own spread `s_p` (its `|p75|`) instead:

| population | n | own `s_p` | global tanh IQR | **per-population IQR** | gain |
|---|---|---|---|---|---|
| single-body | 4281 | 0.528 | 0.2891 | 0.3272 | 1.1× |
| two-body | 469 | 0.814 | 0.3826 | 0.3304 | 0.9× |
| full-chart | 71 | 5.230 | **0.0001** | **0.1253** | **1550×** |

Under one global mapping **all 71 historical agents collapse to the same stat
value** (IQR 0.0001). Single-body and two-body barely notice, because they happen
to sit on similar scales — it is specifically the chart-bearing agents that a
shared mapping destroys. With the *real* computed full-chart values (~0.014
rather than the fabricated ~5.2) it is worse still: every one maps to
`tanh(0.014 / 0.626) ≈ 0.022`, identical to four decimals.

**RULED: `tanh(monica / s_p)`**, where `s_p` is the population's own
characteristic spread. Bounded, signed, clamp-free, and each population resolved
against itself — which is the only comparison anything in the codebase makes.

`[MEASURED]` Reproduce with `scripts/measureSacred7Distributions.ts` (read-only).
