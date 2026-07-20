# The Synthesis Model — closing open problems 2 and 3

Status: **design settled, unimplemented.** Decisions taken 2026-07-20.
Supplements [UNIFIED_PHYSICS_MODEL.md](./UNIFIED_PHYSICS_MODEL.md) (v2, PR #624).

This document exists because #624 was written **without the foundational
"Alchm Semantics" canvas in view**. That canvas already contains material #624
declares missing. Two of its seven open problems are therefore misframed rather
than unsolved:

- **Open problem 2** ("the pair-interaction rule does not exist") — it does.
  Synthesis is the operation, and the canvas carries four hand-authored 45-pair
  aspect matrices as an oracle.
- **Open problem 3** ("the positional vessel function is unspecified") — the
  canvas carries four positional layers, one of which is already a
  degree → signed-four-axis function.

Provenance: every "current code" claim below was verified by opening the cited
file on `origin/master` at `e1b37aa8`.

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

- **Uranus is inverted.** Code has day = Essence, night = Matter. It should be
  **day = Matter, night = Essence** (`planetaryAlchemyMapping.ts:99-102`).
  Uranus carries `alchmWeight` **0.9044** — the second-heaviest body, above
  Saturn (0.812) and nearly double the Sun (0.513). Every chart currently
  misplaces ~0.9 units between Essence and Matter, more than the Sun's entire
  contribution on any axis.
- **The Moon under-contributes.** Code gives it one axis per sect. It should
  carry **both Essence and Matter in both sects** (weight 0.2843 each),
  reflecting the Moon's importance.

This makes **both luminaries sect-invariant** — the Sun is Spirit in both sects,
the Moon is Essence+Matter in both. Every other body swaps. That is a coherent
claim about what a luminary is, not an exception bolted on.

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

## 6. Still open

1. **β** — the shared-axis diagonal coefficient is uncalibrated.
2. **Diagonal synthesis for Essence, Substance and Matter.** Spirit×Spirit
   yields the Sun. The other three diagonals name no planet, so their values
   are the shared-axis term alone.
3. **The invariant proof** (§5).
4. **Heat / Entropy / Reactivity.** The canvas's formulas match **none** of the
   ≥3 live implementations in `src/`
   (`0.6·Spirit+0.4·Substance`, `(Fire²+Air²)/4`, …). The canvas is "primal
   truth, adaptable" — but its **Reactivity formula has an unclosed
   parenthesis** and its denominator pairing is inferred, not stated, so it
   cannot be transcribed as written. Heat and Entropy are balanced and
   transcribable. **This is the only item here that is wrong on a shipping
   surface today.**
5. **"Inertia" is quadruple-booked**, not triple as #624 states — there is a
   fourth in `src/app/api/alchm-quantities/route.ts:188`. Resolution:
   gravitational `M/r²` keeps the name; the others are renamed.
6. **Visual transcription.** The four aspect matrices, decan tables, terms and
   the 30-degree alchemy table cannot be recovered from the PDF's text layer —
   cell attribution scrambles and the four aspect grids overlap. Re-reading the
   PDF visually is its own scoped task, and everything in §4 that depends on
   cell-level data is blocked on it.
