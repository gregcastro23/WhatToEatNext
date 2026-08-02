// Planetary data

/**
 * Planetary mass relative to Earth (Earth = 1.0).
 *
 * Source: NASA planetary fact sheets.
 * These are the **actual** physical mass ratios — not pre-computed scoring
 * coefficients.  Scoring code normalizes them internally (log₁₀ scale).
 *
 * NOTE: PLANET_WEIGHTS is used by the WhatToEatNext FOOD-recommendation layer
 * (ingredient scoring, recipe matching). It correctly privileges massive bodies
 * (Sun, Jupiter) because physical presence matters for culinary archetypes.
 *
 * For the ALCHM thermodynamic engine, use `inertialMassWeight` from
 * `@/utils/planetaryAlchemyMapping` — it takes a body NAME and derives its
 * weight from THIS table. (This line used to point at PLANET_ALCHM_PERIODS,
 * deleted in ADR-009 decision 5b; see the note below.)
 */
export const PLANET_WEIGHTS: Record<string, number> = {
  Sun:     333054.2532,  // 1.989 × 10³⁰ kg
  Jupiter:    317.8165,  // 1.898 × 10²⁷ kg
  Saturn:      95.1608,  // 5.683 × 10²⁶ kg
  Neptune:     17.1467,  // 1.024 × 10²⁶ kg
  Uranus:      14.5362,  // 8.681 × 10²⁵ kg
  Earth:        1.0000,  // 5.972 × 10²⁴ kg  (reference)
  Venus:        0.8150,  // 4.867 × 10²⁴ kg
  Mars:         0.1070,  // 6.390 × 10²³ kg
  Mercury:      0.0550,  // 3.285 × 10²³ kg
  Moon:         0.0123,  // 7.342 × 10²² kg
  Pluto:        0.0022,  // 1.309 × 10²² kg
};

/**
 * REMOVED (ADR-009): `normalizePlanetWeight`, the Pluto-anchored mass scale.
 *
 * It log-normalized with its minimum anchored AT Pluto, so Pluto's weight was
 * identically 0 — a body in the chart contributing nothing — and the Ascendant,
 * having no entry here, fell through a `?? 1.0` to EARTH's mass (0.3249) rather
 * than the ruled vessel weight. Both are extremum-annihilation, the same defect
 * PR #683 fixed for the Ascendant on the period scale.
 *
 * Every caller now uses `inertialMassWeight` from
 * `@/utils/planetaryAlchemyMapping`, which takes a body NAME, pins the Ascendant
 * to 1.0, and anchors its zero one decade BELOW the lightest charted body so no
 * member can be annihilated. Do not reintroduce a mass normalizer anchored at a
 * member of the set it normalizes.
 */

/**
 * REMOVED (ADR-009 decision 5b): `PLANET_ALCHM_PERIODS`, `_PERIOD_LOG_MIN`,
 * `_PERIOD_LOG_MAX` and `normalizeAlchmWeight` — the orbital-period weight scale,
 * and with it the LAST of the five scales ADR-009 set out to unify. Everything in
 * both runtimes now uses `inertialMassWeight`.
 *
 * It was RANK-INVERTED against physical mass: Pluto normalized to exactly 1.0,
 * the heaviest weight in the system, and the Sun to 0.5131, because a longer
 * orbital period was read as greater "alchemical volume". The served Python
 * endpoints ran on it until #712, so production really did hand Pluto nearly
 * twice the Sun's weight in every chart it returned.
 *
 * It also ANNIHILATED whatever sat at its lower anchor. The Ascendant's 0.003
 * entry IS the log-scale minimum, so `normalizeAlchmWeight(0.003)` returned
 * exactly 0.0, and every caller had to special-case the Ascendant back to 1.0 by
 * hand. One port forgot, and 11/20 golden conformance charts collapsed to
 * Matter = Substance = 0. `inertialMassWeight` anchors one decade BELOW the
 * lightest charted body precisely so no member can be zeroed this way.
 *
 * Deleted rather than deprecated, because the cheapest way to undo a migration is
 * to re-add the table. `src/__tests__/data/planets.test.ts` asserts its absence;
 * `realAlchemizeMomentumScale.test.ts` keeps a frozen private copy for the sole
 * purpose of asserting that momentum does NOT land on it.
 */


export const planetaryData = {
  Sun: {
    element: "Fire",
    foodCorrespondences: ["sunflower seeds", "oranges", "cinnamon"],
    cookingMethods: ["grilling", "roasting"],
    governs: ["vitality", "ego", "expression"],
    physicalWeight: PLANET_WEIGHTS.Sun,
  },
  Moon: {
    element: "Water",
    foodCorrespondences: ["milk", "cucumber", "melon"],
    cookingMethods: ["steaming", "poaching"],
    governs: ["emotions", "intuition", "nurturing"],
    physicalWeight: PLANET_WEIGHTS.Moon,
  },
  Mercury: {
    element: "Air",
    foodCorrespondences: ["nuts", "beans", "herbs"],
    cookingMethods: ["quick sautéing", "stir-frying"],
    governs: ["communication", "intellect", "perception"],
    physicalWeight: PLANET_WEIGHTS.Mercury,
  },
  Venus: {
    element: "Earth",
    foodCorrespondences: ["apples", "berries", "chocolate"],
    cookingMethods: ["baking", "confectionery"],
    governs: ["love", "beauty", "harmony"],
    physicalWeight: PLANET_WEIGHTS.Venus,
  },
  Mars: {
    element: "Fire",
    foodCorrespondences: ["red meat", "spicy foods", "garlic"],
    cookingMethods: ["grilling", "high-heat cooking"],
    governs: ["energy", "passion", "action"],
    physicalWeight: PLANET_WEIGHTS.Mars,
  },
  Jupiter: {
    element: "Fire",
    foodCorrespondences: ["fruits", "honey", "nutmeg"],
    cookingMethods: ["roasting", "slow cooking"],
    governs: ["expansion", "abundance", "optimism"],
    physicalWeight: PLANET_WEIGHTS.Jupiter,
  },
  Saturn: {
    element: "Earth",
    foodCorrespondences: ["root vegetables", "grains", "bitter foods"],
    cookingMethods: ["slow cooking", "fermenting"],
    governs: ["discipline", "structure", "time"],
    physicalWeight: PLANET_WEIGHTS.Saturn,
  },
};

export default planetaryData;
