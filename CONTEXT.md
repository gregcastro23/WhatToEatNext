# Context: Alchm Kitchen

Turns the sky — a user's birth chart and the current transits — into culinary
recommendations, and prices the resulting actions in an on-chain token economy.

This file is the glossary. When naming a domain concept in code, copy, an issue
title or a test name, use the term as defined here and avoid the listed
synonyms. If a concept you need isn't here, that's a signal: either the project
doesn't use that language, or there's a real gap worth recording.

## The two readings

The single most important distinction in this codebase, and the one most often
gotten wrong. **Quantities and elements are orthogonal readings of the same
chart.** They are not two names for the same four things.

### Quantities (ESMS)

**Spirit, Essence, Matter, Substance.** Derived from **which planets** a chart
contains, modified by sect, dignity and aspects. Never from elements.

Authoritative source: the header of `src/utils/planetaryAlchemyMapping.ts` and
its `PLANETARY_ALCHEMY` table. Deriving ESMS from Fire/Water/Earth/Air is called
"fundamentally incorrect" in `docs/HIERARCHICAL_SYSTEM_IMPLEMENTATION.md:25`.

Which planets feed which quantity:

| Quantity | Contributing planets |
|---|---|
| Spirit | Sun, Mercury, Jupiter, Saturn |
| Essence | Moon, Venus, Mars, Jupiter, Uranus, Neptune, Pluto |
| Matter | Moon, Venus, Mars, Saturn, Uranus, Pluto |
| Substance | Mercury, Neptune |

Consequences worth knowing before designing anything on top of ESMS:

- Every chart holds the same ten planets, so ESMS is **dominated by sect**, not
  by the individual. Day charts average ~32/46/13/9; night charts ~16/17/46/21.
- Essence draws on 7 planets and Matter on 6, but Spirit on 4 and Substance on
  2, so **Spirit and Substance can never win on raw share**. Any "dominant
  quantity" logic must score against a per-sect baseline
  (`src/utils/alchemicalConstitution.ts`), or two of four outcomes are
  unreachable.
- ESMS is the unit of account for the token economy: generating a recipe or a
  recommendation is priced in ESMS.

**Say** "quantities", or "ESMS". **Never** "elements", "alchemical elements", or
"the four elements" — those name the other reading.

### Elements

**Fire, Water, Earth, Air.** Derived from the **signs** the planets occupy (and,
separately, carried as data on ingredients and recipes).

Elements are a real, valid, first-class reading — the bug is only ever
conflating them with quantities. An elemental balance chart, an ingredient's
element badge, or elemental compatibility scoring are all correct uses.

Note the asymmetry: **ingredients and recipes have elements, not quantities.** An
ingredient is not a chart and has no planets. Some catalog entries carry curated
`alchemicalProperties`; where they don't, the honest answer is that they have
none — not a number synthesized from their elements.

## Chart and sky

- **The live sky** — the current transits; the planets overhead right now. Use
  this phrase in user-facing copy, not "current transits".
- **Natal chart** — the sky at a user's birth moment. `calculateNatalChart` in
  `src/services/natalChartService.ts` is the source; it returns both readings
  (`alchemicalProperties` and `elementalBalance`) plus `planets[]` with absolute
  ecliptic longitudes.
- **Sect** — whether a chart is diurnal (day) or nocturnal (night). It swings
  the entire ESMS profile, so it is load-bearing, not a detail. Use
  `isSectDiurnalForBirth` for birth moments: birth times arrive as
  timezone-less wall-clock strings, and plain `isSectDiurnal` reads UTC hours,
  which disagrees with the chart on any non-UTC host.
- **Dignity** — a planet's strength in the sign it occupies. Scales a planet's
  ESMS contribution by ±10% (`src/utils/dignityScales.ts`).
- **Aspects** — angular separations between planets. The engine's **Layer 3**,
  and the main source of chart-to-chart variation in ESMS, precisely because
  Layers 1–2 (sect + dignity) land nearly every chart in the same place. Aspects
  need **absolute ecliptic longitudes** (0–360); `degree` is sign-relative
  (0–29.999) and is not a longitude.
- **Archetype** — a user's label (Solar Forager, Lunar Adept, Root Alchemist,
  Wind Whisperer), assigned from the quantity standing furthest above its sect
  baseline. The names are elemental metaphors inherited from an older, incorrect
  quantity↔element mapping; they are not an assertion that a quantity is an
  element.

## Economy

- **ESMS** — the four quantities, doubling as the token denominations. New
  accounts receive a 60-ESMS welcome grant (15 of each).
- **A#** (Alchemical Number) — the sum of the live sky's four quantities.
- **Kalchm / Monica** — thermodynamic derivations that take quantities **and**
  elements as separate inputs. Combining the two axes in a formula is correct;
  deriving one from the other is not.

## Related

- `docs/HIERARCHICAL_SYSTEM_IMPLEMENTATION.md` — tiering of what data holds what.
- `docs/adr/` — architectural decisions.
- `src/components/home/QuantitiesExplainer.tsx` — the user-facing framing of the
  two readings; the terminology anchor for copy.
