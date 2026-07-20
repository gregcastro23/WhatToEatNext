# The Synthesis Model — finishing the Alchm Semantics canvas

Status: **completion in progress.** Decisions taken 2026-07-20.
Supplements [UNIFIED_PHYSICS_MODEL.md](./UNIFIED_PHYSICS_MODEL.md) (v2, PR #624).

## What this document is

The "Alchm Semantics" workbook is a **hand-authored draft from several years
ago that was never finished.** Measured across all thirteen CSV tabs:

| | |
|---|---|
| Total cells | 68,284 |
| Non-empty | 18,395 (26.9%) |
| Value-bearing (not a label or header) | 3,409 (**5.0% of the workbook**) |
| …containing an unresolved wildcard `x`/`y` | 1,018 (30% of values) |

So roughly **3.5% of the workbook carries a resolved value.** Most non-empty
cells are enumerated combination headers — `⊙ ☌ 🌙 ☌ ☿ ☌ ♄` and thousands like
it — waiting for content that was never written. The author's own note appears
on eleven pages: *"maybe im missing 20 extreme placements..."*

**This document is not a description of that canvas, and not a replacement for
it. It is its completion.** The canvas supplies the skeleton and a minority of
the values; the shipped codebase supplies a second set, resolved over three
years of implementation; the rest is authored here. `alchemicalPillars.ts` is
the proof that this is the real relationship — that layer was finished in code
and the canvas never caught up.

### Provenance is mandatory

Because three sources feed this model, **every value carries a tag.** Without
it, a future reader cannot tell an inherited value from a decided one — and
that confusion has already caused a real error (see §1a, Uranus).

| Tag | Meaning |
|---|---|
| `[CANVAS]` | Transcribed from the workbook. Cite the tab. |
| `[CODE]` | Resolved in implementation; promoted to spec here. Cite file:line. |
| `[AUTHORED]` | Decided during completion. Record the date and the reasoning. |
| `[DERIVED]` | Computed from other values. Carries no independent information. |
| `[OPEN]` | Still a hole. Listed in the gap register, §6. |

**A canvas value is not privileged over a code value or an authored one.** At
5% fill it is a draft, and where it disagrees with a deliberate decision, the
decision wins. What the tag buys is that the disagreement stays visible.

### Why #624 needed this

#624 was written without the canvas in view and declared two problems unsolved
that the canvas had already partially answered:

- **Open problem 2** ("the pair-interaction rule does not exist") — synthesis is
  the operation, and the canvas's aspect grids are the **most complete layer in
  the workbook**: three 11×11 grids, **308 populated cells, exactly one empty**
  (Saturn×Jupiter trine). They are a genuine 308-value oracle to fit G against.

  ⚠️ An earlier revision called them "30% wildcards, a sketch with holes." That
  figure was computed over the *whole workbook*, not the grids — wrong
  denominator, and it understated the one finished layer. Recorded so the error
  is not repeated.
- **Open problem 3** ("the positional vessel function is unspecified") — the
  canvas has four positional layers, one already a degree → signed-four-axis
  function.

Every "current code" claim below was verified by opening the cited file on
`origin/master` at `e1b37aa8`.

---

## 1. Synthesis — and it is already shipped

A planet **is** the synthesis of two energy states. The pair is its sect pair:
the day axis and the night axis are the two constituents.

| Axis pair | Yields | Code (day → night) |
|---|---|---|
| Spirit + Substance | Mercury | Spirit → Substance |
| Spirit + Essence | Jupiter | Spirit → Essence |
| Spirit + Matter | Saturn | Spirit → Matter |
| Substance + Essence | Neptune | Essence → Substance |
| **Substance + Matter** | **∅ — do not interact** | *no planet* |
| Essence + Matter | Moon, Venus, Mars, Uranus, Pluto | Essence → Matter |
| *(pure Spirit)* | Sun | Spirit → Spirit |

Four axes → six pairs + one pure = **exactly ten bodies, no remainder.**

`PLANETARY_ALCHEMY` (`src/utils/planetaryAlchemyMapping.ts:43`) already encodes
every row. The rule open problem 2 calls missing has been in production as the
base ESMS lookup the whole time.

**Non-injectivity is intended.** Essence+Matter yields five planets. They share
an ESMS signature and are individuated by **dignity and position**, not by the
cell. This is the two-compass premise working, not an under-specification.

### 1a. Two shipped errors in the sect table

Both are wrong against the model as stated. Neither is implemented yet.

- **Uranus inverts: day = Matter, night = Essence.** `[AUTHORED 2026-07-20]` —
  Uranus goes against the grain of the other Essence+Matter bodies. Code
  currently has it the other way (`planetaryAlchemyMapping.ts:99-102`) and
  changes here.

  Blast radius: Uranus carries `alchmWeight` **0.9044** — the second-heaviest
  body, above Saturn (0.812) and nearly double the Sun (0.513). This moves ~0.9
  units between Essence and Matter on every chart, more than the Sun's entire
  contribution on any axis.

  📎 *Canvas note, for provenance only:* the workbook shows `🝑 / 🝙`
  (Essence/Matter) for Uranus, same as Venus/Mars/Moon/Pluto. **This is not
  evidence against the decision.** The pair appears on twelve sign pages, but a
  planet's ESMS pair cannot vary by sign, so those twelve are one templated row
  filled down — a single unelaborated draft entry, not twelve attestations. An
  earlier revision of this document cited them as "thirteen unanimous locations"
  and treated the decision as a departure requiring justification. That
  reasoning was circular and is recorded here so it is not repeated.

- **The Moon carries both axes in both sects.** `[AUTHORED 2026-07-20]` — code
  gives it one per sect; it becomes Essence **and** Matter in both (weight
  0.2843 each), reflecting the Moon's importance. The canvas's `🝑 / 🝙` is
  silent on sect ordering, so nothing is being overridden here.

The Moon change makes **both luminaries sect-invariant** — the Sun is Spirit in
both sects, the Moon is Essence+Matter in both. Every other body swaps. That is
a coherent claim about what a luminary is, not an exception bolted on.

### 1b. The sign pages decode

Each sign page's `Day/night` column reads
`(planetDayElement + signElement / planetNightElement + signElement)`.

Uranus in Aries is `(💧🔥/💨🔥)`: Aries is Fire, and Uranus's own day/night
elements from the Dignity tab are 💧/💨. Consistent across all twelve signs —
an independent confirmation of the day/night **element** table (distinct from
the ESMS table above).

---

## 2. The interaction matrix G

Pair interaction is a **bilinear form**, not a dot product:

```
interaction(a, b) = aᵀ G b
```

where `a` and `b` are four-axis signatures. A plain dot product is the special
case `G = I`; it is insufficient because it cannot express the Substance×Matter
null, which is a statement about a *cross* term.

### 2a. Derivation

Two layers, multiplied:

```
G[a][b] = synthesis(a, b) × (energy(a) + energy(b))
```

- **synthesis(a,b)** = 1 where the pair yields a planet, **0** at
  Substance×Matter. Supplies the structure.
- **energy(a)** = the axis's energy state. Supplies the magnitude.
- The **diagonal** carries a shared-axis term, not a synthesis claim — two
  planets sharing an axis reinforce it.

**Energy states: Spirit 3, Essence 2, Substance 2, Matter 1.**

Essence and Substance are tied per the canvas's prose. Matter is floored at
**1, not 0** — the canvas says "minimally reactive" with "minimal heat and
entropy." Minimal, not absent. Matter is the lowest energy state, but it *is*
a state. (A plus-count over the canvas's Heat/Entropy/Reactivity polarity table
would give 3/2/1/0 and rank Substance above Essence; the prose tie wins.)

Values are **ordinal**. Magnitudes come from a separate calibrated function, not
from these integers directly.

### 2b. The matrix

|  | Spirit | Essence | Substance | Matter |
|---|---|---|---|---|
| **Spirit** | 6 | 5 *(Jupiter)* | 5 *(Mercury)* | 4 *(Saturn)* |
| **Essence** | 5 | 4 | 4 *(Neptune)* | 3 *(Moon/Ven/Mars/Ura/Plu)* |
| **Substance** | 5 | 4 | 4 | **0** *(null)* |
| **Matter** | 4 | 3 | **0** | 2 |

Symmetric. Ten independent values.

### 2c. Why the null is load-bearing — do not "clean it up"

A **fully-derived additive G is rank 2 and cannot express interaction at all.**

```
G = e·1ᵀ + 1·eᵀ    ⟹    aᵀGb = (a·e)(Σb) + (Σa)(b·e) = (a·e) + (b·e)
```

The cross term vanishes. Every pairing reduces to adding two per-planet energy
numbers, and structurally unrelated pairs score identically — verified:
Mercury×Saturn and Jupiter×Neptune both scored **4.50** under that design.

That is the same failure class as the ESMS/element collapse and the `Q 0.00`
bug: it computes, it renders, it means nothing. The Substance×Matter exception
is the only cell carrying information about a *relationship* rather than about
two planets separately. **Removing it removes all pair-specific information.**

A plain identity bonus (`+β·I`) is also insufficient: it counts *how many* axes
two planets share, not *which*, so Mercury–Saturn (sharing Spirit) and
Jupiter–Neptune (sharing Essence) still collapse.

### 2d. Verification

Three checks that broke earlier designs, computed against the matrix above:

| Check | Result | Why it matters |
|---|---|---|
| Mercury–Saturn vs Jupiter–Neptune | **3.75** vs **4.50** | 20% apart. Pair structure survives. |
| Mars–Venus at night (both Matter) | **2.80** | Non-zero. The archetypal override modulates rather than carrying the whole effect. |
| Mercury–Saturn at night (hits the null) | **3.12** | One zero cell does not zero a pair. |

The third depends on the sect-weighted blend (§2e): with both axes present,
`aᵀGb` sums four cross-terms, so the null is a correction, not an annihilator.

### 2e. Inputs

G operates on a **sect-weighted blend**, not a sect-selected single axis. Both
axes stay present; the sect-active one is weighted higher (0.6 / 0.4, mirroring
the existing sign/sect element spine). Sect-*selection* would collapse `aᵀGb`
to a single cell lookup and make every zero individually fatal — which is how
Mars–Venus broke.

### 2f. Aspect type and polarity

- **All axes participate**; aspect type sets polarity and magnitude rather than
  masking axes.
- **Polarity depends on the pair, not only the aspect.** A conjunction of
  incompatible signatures can deplete — which is what the New Moon depletion
  override encodes.
- **Minor aspects derive from the four majors** — same G-form treatment with
  weaker orbs and scaled magnitude. No additional authoring.
- G **replaces** the general case in `src/utils/aspectESMSEffects.ts`; the
  existing hand-authored pairs become the ~10 archetypal overrides decision 19
  always planned for.

---

## 3. The positional vessel (open problem 3)

**Scope: every body**, not only the Ascendant. A planet's degree modulates its
own ESMS contribution. The Ascendant is then the case with no planet identity to
multiply, not a special mechanism.

**All four canvas positional layers bake into the alchemizer:**

1. **The 30-degree alchemy table** — the most direct candidate: every degree maps
   to a process carrying signed Essence/Matter/Spirit/Substance. Already a
   `degree → four-axis` function. **This table is faithfully implemented in
   `src/constants/alchemicalPillars.ts`** (verified: Solution, Filtration,
   Evaporation, Distillation, Separation all match sign-for-sign on all four
   axes) and drives cooking-method recommendations today.
2. **Decan → dominant sign/planet per ESMS axis.**
3. **The "Terms of" degree ranges** (Lilly recension — see §4).
4. **Per-sign "Degree specific bonus" / "Planet bonus".**

**Source, and it is no longer blocked.** Each of the twelve sign tabs carries a
complete 30-row table: `Degree → Sign association → Element → Planet bonus →
Alchemy process`. Twelve signs × 30 degrees = **360 fully-attributable rows**.
Exported as CSV these are machine-readable — the visual-transcription blocker in
§6 does not apply to this layer.

Spot-check, Aries: degrees 1-10 → Mars, 11-20 → Sun, 21-30 → Jupiter and Venus.
The Chaldean decan rulers for Aries are Mars, Sun, Venus — it matches, with the
sign's own ruler appended to the third decan.

Known transcription defects in the sign tabs: Aries reads `Prime: Pisces`
(copy-paste; should be Aries), Leo's element reads `Fie`, and Taurus's decan
bonus reads `Moon 11° - 10°` (descending/degenerate).

**Signed, floored at zero.** The alchemy processes are signed, and the vessel
uses that direction — but its contribution is clamped so it never drives a
total negative.

**Magnitudes are free to change.** The vessel currently supplies 80% of
day-chart Matter and 97% of Substance; that is an artifact of the flat
`{1,1,1,1}` placeholder, not a target to reproduce. Versioning makes the shift
survivable.

**Position is required.** A surface that cannot supply an Ascendant does not
render ESMS. For the location-less public `/planetary-chart`, default to **NYC**
unless the user provides a location.

---

## 4. Adjudicated canvas data

The canvas contains real errors. Verified against primary sources
(Ptolemy, Lilly, Houlding/Skyscript, Astrotheme) on 2026-07-20.

| Item | Ruling |
|---|---|
| **Uranus detriment** | Canvas says Taurus (duplicating its Fall). **Must be Leo** — detriment is *definitionally* opposite the domicile, so Taurus is impossible under any scheme. Fall = Taurus is correct. |
| **Neptune exaltation/fall** | Canvas says Cancer/Capricorn. **Adopt Leo/Aquarius**, overriding the canvas. Three schemes circulate and contradict; this is an editorial pick, recorded so it is not re-litigated. |
| **Outer-planet dignities** | Kept, **unmarked** — all ten planets treated uniformly. The system is its own tradition. |
| **"Prime"** | Not a term of art in any tradition. Drop it; use Domicile / Exaltation / Detriment / Fall. |
| **Terms** | **Lilly recension** — name the constant `LILLY_TERMS` so a future reader does not "correct" it into Robbins (they differ in ≥6 signs). Mars/Scorpio recovered as **1-6** (two independent ways: Lilly's table, and arithmetic — surviving cells tile 7–30). Mars/Libra should be **25-30**, not 1-6. **Sagittarius–Pisces unaudited** — the Mars/Libra defect is a sideways cell displacement, so the transcription demonstrably shifts cells. Audit before trusting. |
| **Decans** | Multi-ruler decans **split the weight** (preserves the invariant automatically). Fill the zero-ruler gap: **Capricorn 10-20 → Mars**. Outer-planet rows kept as a deliberate extension. |
| **Planetary joys** | Missing pair is **Mercury → 1st** and **Sun → 9th**. |
| **Orbital periods** | Code is already correct (`PLANET_ALCHM_PERIODS`: Saturn 29.46, Moon 0.075). Canvas's "Saturn 12y", missing Moon, and unitless "P=85" are canvas-side only. **Annotate the canvas; change no code.** |
| **"Outer planets never oppose"** | **False.** Uranus–Neptune opposed 1906–10; Uranus–Pluto 1901–02 (next 2046–48); Neptune–Pluto c.1645 (next c.2140). True only for the bounded era 1911–2045. |
| **Tarot "Dominant Sign/Planet"** | **Correct in 10 of 10 rows — do not regenerate.** It is the modern decanate (sub-sign / *drekkana*) system; the "120° trine advance" that looks like a fill-down bug *is* the system. An initial research pass graded this column 0/10 and recommended deleting it; an adversarial verification pass overturned that. |

Canvas errors not yet ruled on: Gemini's Neptune row contradicts page 1 and all
eleven other sign pages, on both the ESMS pair and the day element. The author's
own note appears on eleven pages: *"maybe im missing 20 extreme placements..."*

---

## 5. Rollout

**PR 1 — the sect corrections.** Uranus inverted, Moon both-axes. Versioned
**v2**; **backfill** all stored ESMS values; golden fixture cut against the
**corrected** model, not current behavior (pinning known-wrong behavior would
enshrine the bug). Independent of G.

**PR 2 — G, wired end to end.** Matrix as versioned data, the invariant proof,
and integration into the aspect path in one change, so the model shift is
visible on real charts rather than sitting inert.

**The invariant proof is owed and not written.** Decision 16 requires
`Σ parts + residual === total` on all four axes in both sects. Under synthesis
the pair split must be shown to preserve it — ruled "prove it, don't assume it."
Today each card carries half of each pair's delta; whether that halving survives
the move to inverse-inertia splitting (decision 13) is exactly what the proof
must establish.

---

## 6. The gap register

This is the work list. Measured across all thirteen CSV tabs on 2026-07-20 —
counts are from the files, not estimates.

### 6a. Layers that are done and can be used directly

| Layer | State | Source |
|---|---|---|
| Alchemy processes (14-cycle, signed ESMS) | Complete and shipped | `[CODE]` `alchemicalPillars.ts` — canvas agrees |
| Synthesis / sect ESMS pairs | Complete | `[CODE]` `planetaryAlchemyMapping.ts:43` |
| Major Arcana → planet/sign | 22/22 | `[CANVAS]` stored twice, agreeing |
| Minor Arcana → decan | 36/36 decans covered | `[CANVAS]` ⚠️ but see 6c |
| Day/night **element** grid | 132/132 | `[DERIVED]` — zero independent information (§1b) |

### 6b. Layers with holes — usable, but the holes are real

| Layer | Filled | Missing |
|---|---|---|
| Per-sign **effect sizes** | **56/132 (42%)** | Aquarius 11/11 and Pisces 10/11 are worked; every other sign is 18–45%. Those two are the pattern; the rest is template. |
| Degree → **sign association** | 239/360 (66%) | **Virgo, Libra, Scorpio, Sagittarius are entirely blank** |
| Degree → **element** | 239/360 (66%) | `[DERIVED]` from sign association — same four signs |
| Degree → **planet bonus** | 180/360 (50%) | |
| Degree → **alchemy process** | 330/360 (92%) | **Aquarius has no Alchemy column at all** — dropped in a template revision |
| Terms table | 56/60 (+4 deliberate dashes) | **27 of 360 degrees unruled**; partition fails in 5/12 signs |
| Per-sign adjectives / Tarot-words | Near zero | Scaffolding only |

### 6c. Contradictions — more dangerous than the empty cells

Empty cells announce themselves. Two populated tables that disagree do not, and
nothing in the workbook designates a winner.

1. **Decan rulers disagree with the Minor Arcana decan assignments in 30 of 36
   decans.** Both tables are 100% populated. This needs a ruling, not a
   transcription.
2. **Uranus: detriment and fall both read Taurus.** Detriment is definitionally
   opposite the domicile, so it must be Leo. `[OPEN]`
3. **Saturn's orbital period reads 12 y** — a fill-right from the Jupiter cell.
   True value ~29.46 y. `[CODE]` already correct in `PLANET_ALCHM_PERIODS`; the
   canvas cell is wrong and would silently corrupt any transit math keyed off it.
4. **Heat / Entropy / Reactivity** — the canvas's formulas match **none** of the
   ≥3 live implementations in `src/` (`0.6·Spirit+0.4·Substance`,
   `(Fire²+Air²)/4`, …). Reactivity additionally has an unclosed parenthesis and
   an inferred denominator, so it cannot be transcribed as written; it must be
   re-derived. Heat and Entropy are balanced and transcribable.
   **This is the only item in this register that is wrong on a shipping surface
   today.**
5. **"Inertia" is quadruple-booked**, not triple as #624 states — there is a
   fourth in `src/app/api/alchm-quantities/route.ts:188`. Resolution:
   gravitational `M/r²` keeps the name; the others are renamed. `[OPEN]`

### 6d. Never started

- **"Aspects from Astrologizer Code"** (Dignity tab, rows 71–81) — ten aspect
  names, **zero populated cells in any column.** An index of intended work.
- **Aces and court cards** — 0/16 assigned anything beyond an element.
- **β**, the shared-axis diagonal coefficient — uncalibrated. `[OPEN]`
- **Diagonal synthesis for Essence, Substance, Matter** — Spirit×Spirit yields
  the Sun; the other three name no planet, so their cells are the shared-axis
  term alone. `[OPEN]`
- **The invariant proof** (§5). `[OPEN]`
6. **Transcription — mostly unblocked as of the CSV export.**

   The PDF's *text layer* scrambles cell attribution, but the Google Sheets
   **CSV export is fully attributable**. Thirteen tabs exported 2026-07-20:
   `Dignity Tables`, `Tarot Descriptions`, and one per sign. Extract with
   `pdftotext` only as a last resort; prefer the CSVs.

   Now recoverable: the dignity table, decan rulerships (Saturn/Uranus/Neptune
   separate cleanly), the full terms table including Sagittarius–Pisces, the
   planetary joys, the tarot mappings, and all 360 rows of the positional layer.

   **Still needs the visual PDF:** the four aspect matrices. In the CSV they sit
   as an 11×11 grid where **the lower triangle and upper triangle are different
   aspects** — verified by sign: row Sun→Moon is `(-🔥 -💧)` while row Moon→Sun
   is `(🔥💧🔥💧)`, and this holds throughout. Three grids therefore hold six
   matrices:

   | Grid | Below diagonal | Above diagonal |
   |---|---|---|
   | Elemental #1 | Conjunction (within 10°) | Opposition (175–185°) |
   | Elemental #2 | Trine | Square (90°, within 5°) |
   | ESMS | Conjunction | Opposition |

   This is why the transposes are not symmetric, and it independently supports
   the "polarity depends on the pair" ruling — the canvas encodes harmonious and
   hard as transposes of one relation, not as independent tables.

---

## 7. The completion plan

Decisions taken 2026-07-20. This section governs how the remaining gaps close.

### 7a. Reconciliation policy

**Precedence: `[AUTHORED]` > `[CODE]` > `[CANVAS]`.** The most recent deliberate
decision wins; shipped behaviour beats a 5%-filled draft. The canvas is
consulted for intent, never used to override a decision.

**Confidence bar to leave `[OPEN]`: derivable, or twice-sourced** — where
"independent" explicitly excludes templated replication. A value repeated across
twelve sign pages by fill-down is *one* source, not twelve. This bar exists
because that exact mistake was made twice in this document's history (§1a
Uranus; §"Open problem 2" above).

### 7b. Canonical home

**Data files are the single source; the spec's tables and the TypeScript
constants are both generated from them.** No table is ever written twice. A
table appearing in two places is a defect, not redundancy.

### 7c. The success test

**Reproduce the 308 grid cells.** If the derived rules regenerate the aspect
grids, the effect-size column and the dignity mapping from first principles,
the model is complete enough to generate everything else. Score it as a
percentage; a rule that cannot reproduce authored data is wrong.

This is the strongest check available — 308 values is large enough that
agreement is not coincidence, unlike the 13-cell peregrine sample.

### 7d. Effect size is derivable — `[CODE]` + `[CANVAS]`, twice-sourced

Verified 43/43 across all twelve signs, zero exceptions:

```
Domicile → (+)    Exaltation → (+ +)    Detriment → (-)    Fall → (- -)
```

This is exactly `DIGNITY_FOOD_SCALE` in `src/utils/dignityScales.ts`
(`{Domicile: 1, Exaltation: 2, Detriment: -1, Fall: -2}`). So the effect-size
column is **not 42% complete — it is a derived column**, and the 89 "blank"
cells are peregrine planets that correctly have no dignity term.

**Structure: `effect = sign baseline + dignity modifier`.** `[AUTHORED]` The
two worked signs show per-sign baselines, not per-planet rules — Pisces reads
`(++)` across its peregrine planets, Aquarius `(-)`. This explains why element
matching fails as a generator (Mercury's day element is Air, Aquarius is Air,
yet the cell reads `(-)`): the sign's baseline dominates.

Pisces reading `(++)` for Domicile and `(+++)` for Exaltation is therefore
**not a different dignity scale** — it is baseline `(+)` plus the standard
dignity term. Aquarius, the other worked sign, uses the standard scale, so it
is eleven-plus-Aquarius against Pisces, and the baseline reading reconciles
them without either being wrong.

The ~70 remaining peregrine cells are **generated from the rule and accepted**,
not hand-authored.

### 7e. Rulings on the aspect layer

- **`*` cells are dropped**, not encoded. `[AUTHORED]` They mark genuinely
  impossible aspects (Mercury never opposes the Sun); the geometry means the
  engine never produces them, so encoding the impossibility is dead weight.
- **The per-sign aspect blocks carry no information.** `[AUTHORED]` Four of
  twelve signs have them, and Pisces and Scorpio are 26–27 of 27 identical to
  Cancer. That is copy-paste from a template, not evidence that aspect effects
  are sign-independent. Ignore the layer.
- **Footnote markers (`*`, `**`, `*¹`, `*²`, `*³`) are dropped.** `[AUTHORED]`
  No legend exists anywhere in the workbook; the referent was never written.

### 7f. The language layer

The per-sign **Words** column is 132/132 with **zero duplicates** — the only
fully-authored layer in the workbook, and it currently ships nowhere. Extract to
its own typed data file and wire it to the surfaces that describe placements, so
real authored language replaces model-invented text.

The aspect **Adjectives** column is 0.0% filled across all 2,001 rows — headered
249 times, never once populated. Generate it, using the Words column as the
voice reference.

### 7g. Build order

1. **Transcribe the three aspect grids** into versioned data (308 values), fill
   the single gap, then **fit G against them.** Largest block of real data, and
   it tests the whole rule-based approach immediately.
2. The dignity / effect-size layer (fully specified by §7d today).
3. PR 1 — the Moon and Uranus sect corrections.
4. The heat-formula fix (§6c.4) — independent of all of the above.

---

## 8. Rule-formation decisions

Taken 2026-07-20. These govern how the aspect grids become a rule.

### 8a. The Web of Planets and Elements — the generator

`[CANVAS]` Each ESMS axis is defined as *the region between* two elements:

```
Spirit  = Fire ↔ Air        Substance = Air ↔ Ground
Essence = Fire ↔ Water      Matter    = Water ↔ Ground
```

That is a **cycle** — Fire–Air–Ground–Water–Fire — and the four axes are its
four **edges**. `[AUTHORED]` This is the model's actual geometry, not a
mnemonic: ESMS and elements are two readings of one square, which is what makes
a single structure able to relate both grids.

Fire–Ground and Air–Water are the two diagonals, assigned to no axis.

⚠️ Do not over-read the null. Substance and Matter share Ground and yield
nothing, while Spirit and Substance share Air and yield Mercury — so "shares an
element" does not predict synthesis. Six pairs is too small a sample to infer a
mechanism. `[AUTHORED]` The null stays an authored fact.

**Load-bearing contrast** `[CANVAS]`: Essence is composed of all four elements;
Substance **lacks Fire**. That asymmetry explains their energy-state tie
despite differing composition, and must survive into any element↔ESMS mapping.

### 8b. Grid cell semantics

- A cell is a **delta to elemental totals**, scaled by aspect strength.
  `[AUTHORED]`
- **Opposition = conjunction negated.** The upper triangle writes fewer glyphs
  as shorthand, not as reduced magnitude. Fit one triangle, derive the other.
  `[AUTHORED]`
- **`x` is a typed runtime slot**, not missing data — it resolves to the element
  of a sign placement at computation time. The Ascendant's row is entirely
  abstract for this reason: its element comes from its sign, which is
  chart-dependent and cannot be written statically. `[AUTHORED]` This raises the
  grids' true fill rate above the measured figure.

### 8c. What is established about the cells, and what is not

✅ **The element pool holds at 42/44 (95%).** A conjunction cell draws from the
two planets' own element pairs. Both violations are probable fill-down slips:
`Uranus×Sun` is byte-identical to `Saturn×Sun` directly above it and contains
🜃, which is Saturn's element and not Uranus's; `Mars×Moon` likewise carries an
alien 🜃. `[OPEN]` — flagged, not corrected. The fitted rule adjudicates: if it
predicts them, they are real; if it predicts the pool value, they were slips.

❌ **The selector is NOT recovered.** Nine hypotheses scored against all 44
clean cells; the best (row's both elements + column's day element) reaches
15/44 exact and 25/44 set-match. Nothing here is a rule.

| Hypothesis | Exact | Set-match |
|---|---|---|
| row both + col day | 15/44 | 25/44 |
| union deduped | 13/44 | 20/44 |
| heavier both + lighter day | 13/44 | 23/44 |
| union multiset | 1/44 | 20/44 |

**No rule may be asserted from this.** Any candidate must clear the naive
baseline above before it counts as an explanation.

### 8d. Method: derive, then validate

`[AUTHORED]` Gaps are filled **by reasoning from the alchm rules** — the Web
geometry, synthesis, energy states, sect, dignity — using the codebase and
research as sources. **Not by curve-fitting.** The grids are the validation
target, not the training data.

- **Fit both grids jointly.** Derive each compass from its own inputs, then
  test that they describe the same event consistently. The Web supplies the
  mapping used to check agreement; it is not used to derive one from the other,
  which would be the collapse #624 warns against.
- **Pass bar: ≥90% exact.**
- **Below 90%: adjudicate cell by cell.** Each disagreement gets a ruling —
  rule wrong, or cell wrong. A years-old draft contains real errors and the
  rule is permitted to correct them. That is what completion means.

### 8e. Composition order

```
effect = cell × cosine-bell strength × dignity
```

`[AUTHORED]` Dignity modulates the aspect itself, not only the placement — a
dignified planet both gives and receives more. The result then splits between
the two planets by inverse inertia (decision 13).

⚠️ Implementation must confirm dignity is not already applied inside each
planet's base ESMS term, or it double-counts. `[OPEN]`

### 8f. Aspect coverage

**Majors only for now.** `[AUTHORED]` The canvas authored conjunction,
opposition, trine and square. Sextile, quincunx, semi-square, septile,
semi-sextile and quintile stay neutral until there is evidence the extension is
right. They carry a small share of total aspect weight.

### 8g. Decan systems — both, with different jobs

`[RESEARCH 2026-07-20, 99% confidence]` The workbook's two decan tables are two
coexisting traditions, both correctly transcribed:

- **Chaldean faces** (Table A) — 33/35 correct. The two errors have a
  structural cause: 36 faces ÷ 7 planets is not an integer, so Mars gets six
  faces and every other planet five, but the spreadsheet grid is five columns
  wide. Mars's sixth face was unrepresentable and the row cascaded.
- **Modern decanate** (Table B) — **36/36 flawless**, Alan Leo's formulation.
  Its outer-planet assignments generate Table A's outer rows 9/9.

**Ruling** `[AUTHORED]`: **faces score, decanate colors.** Chaldean faces feed
the dignity arithmetic as the minor +1 dignity they traditionally are; the
decanate sub-sign feeds interpretation and the positional vessel.

The 30/36 divergence is **mathematically inherent** — the two systems agree on
only 7 decans by construction. It is not a transcription failure.

⚠️ **Real defect:** the Golden Dawn Minor Arcana attributions are Chaldean, but
the "Dominant Sign/Planet" column beside them is decanate. They disagree on
29/36. Reading a card's ruler through that adjacency returns the wrong planet
~80% of the time. **Relabel the column** as the decan's sub-sign so the
adjacency stops implying a relationship. `[AUTHORED]`

### 8h. First artifact

**Transcribe the three grids into versioned data files** — all 308 values, `x`
encoded as typed slots, the two flagged outliers marked `[OPEN]`. Nothing can
be fitted or validated until the target exists in version control rather than a
spreadsheet.

---

## 9. The unified dignity scale, and the effect-size layer

### 9a. Ruling: Domicile ranks above Exaltation

`[AUTHORED 2026-07-20]` Per the classical essential-dignity point systems
(Ptolemy, later Lilly): **Domicile 5 points, Exaltation 4.**

- **Domicile (rulership)** — the planet in its own home. Ultimate structural
  authority, access to all its own resources, complete self-reliance. The
  sovereign.
- **Exaltation** — the planet as an honoured guest. High praise, visibility,
  peak energetic expression, but it relies on the host (the domicile ruler) for
  its underlying foundation.

**`DIGNITY_ESMS_SCALE` (Domicile +10, Exaltation +7) already has the
historically accurate order and is retained.**

**Why the canvas drifted:** exaltation reads as the *louder*, more exaggerated,
more acutely powerful state in practice, so it attracted more symbols. It lacks
domicile's systemic stability and absolute control. The notation records
intensity; the scale must record authority.

### 9b. There is no scale collision — the food scale is dead code

Verified on `origin/master`:

| Symbol | Callers |
|---|---|
| `getDignityForFoodScoring` | **zero** |
| `DIGNITY_FOOD_SCALE` | referenced only inside `dignityScales.ts` |
| `esmsScale` | `planetaryAlchemyMapping.ts:541`, `NatalTransitChart.tsx:290` |

The `// backward compatibility` comment on the food scale is aspirational —
there is no caller to be compatible with. **Delete `DIGNITY_FOOD_SCALE` and
`getDignityForFoodScoring`.** `[AUTHORED]`

Ingredient and cuisine `elementalProperties` are independently authored data and
were never derived from the dignity scale, so unification does not touch them.

⚠️ This means #624 decision 7 ("two scales, crossing them forbidden") is
guarding a crossing the code no longer makes. After deletion there is **one
scale** and the rule is moot — but keep the lint rule as a ratchet so a second
scale cannot reappear.

### 9c. Consequence: the canvas's effect-size symbols encode the wrong order

The effect-size column writes **Domicile `(+)` and Exaltation `(++)`** — two
marks for the weaker state. Symbol count is therefore **not** magnitude, and
transcribing it faithfully would propagate an inverted hierarchy.

Under §8d this is the *cell wrong, not rule wrong* case:

- The rule's **structure survives** — dignity-first, element-fallback, 94%.
- The rule's **dignified values are remapped** to `DIGNITY_ESMS_SCALE` order.
  Domicile outranks Exaltation regardless of how many marks the canvas drew.

### 9d. Generated peregrine cells — 67, `[DERIVED]`

Rule: `night element == sign element → (+ +), else (-)`. 10/10 on the observed
cells. Generated for every peregrine planet-sign pair lacking a value.

**Two warnings on this output:**

1. **54 of 67 are negative (81%).** Since most planets in most charts are
   peregrine, this makes the average placement materially worse than today,
   where peregrine is exactly neutral (×1.00). **Measure this on a reference
   chart before the v2 cutover** — it is plausibly the largest single behavioral
   change in the model, larger than the Uranus correction. `[OPEN]`
2. **10 cells are hypothesis-dependent** — flagged `discriminating` in the data.
   These are pairs where the DAY element matches but the night element does not,
   so night-only says `(-)` while either-element says `(+ +)`. They are the only
   cells that can distinguish the two readings, and they are currently generated
   under night-only. If the day hypothesis is later adopted, exactly these ten
   flip.

   `Gemini/Saturn · Cancer/Venus · Cancer/Uranus · Leo/Mars · Virgo/Pluto ·
   Libra/Mercury · Libra/Jupiter · Sagittarius/Mars · Capricorn/Pluto ·
   Pisces/Uranus`

These 67 are `[DERIVED]`, not evidence. They were generated from a rule fitted
on 52 observations and cannot independently confirm it. If the rule is revised
they all regenerate.

### 9e. Canvas corrections to apply

`[AUTHORED]` All three are unambiguous:

| Item | Canvas | Correct |
|---|---|---|
| Uranus detriment | Taurus | **Leo** — detriment is definitionally opposite the domicile (Aquarius) |
| Saturn orbital period | 12 y | **29.46 y** — fill-right from the Jupiter cell |
| Tarot "Dominant Sign/Planet" | implies card ruler | relabel as **decan sub-sign**; the Golden Dawn cards are Chaldean and disagree 29/36 |

### 9f. Degree-layer gaps are all derivable

`[AUTHORED]` None of these were undecided — they were dropped:

- **Terms**, 27 of 360 degrees unruled → Lilly's published table.
- **Sign-association**, blank in Virgo/Libra/Scorpio/Sagittarius → the 30-degree
  zodiac cycle.
- **Element column** → `[DERIVED]` from sign association, zero independent
  information.
- **Aquarius's missing Alchemy column** → the 14-name cycle, identical across
  all twelve signs.
