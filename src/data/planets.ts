// Planetary data

/**
 * Planetary mass relative to Earth (Earth = 1.0).
 *
 * Source: NASA planetary fact sheets.
 * These are the **actual** physical mass ratios — not pre-computed scoring
 * coefficients.  Scoring code normalizes them internally (log₁₀ scale).
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
 * Normalizes a relative-mass value to [0, 1] via log₁₀.
 * Pluto → 0.0, Sun → 1.0.
 * Used by scoring utilities; not needed for display.
 */
const _MASS_LOG_MIN = Math.log10(0.0022);      // Pluto
const _MASS_LOG_MAX = Math.log10(333054.2532); // Sun
export function normalizePlanetWeight(relMass: number): number {
  return (Math.log10(Math.max(relMass, 1e-9)) - _MASS_LOG_MIN) / (_MASS_LOG_MAX - _MASS_LOG_MIN);
}


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
