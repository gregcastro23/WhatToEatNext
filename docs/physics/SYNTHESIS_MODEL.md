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
  the operation. The canvas's aspect matrices sketch it, though 30% of their
  cells are wildcards, so they are an oracle to fit against rather than a table
  to transcribe.
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
