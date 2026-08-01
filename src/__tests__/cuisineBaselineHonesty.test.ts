/**
 * Cuisine signature baselines: absent basis → absent signatures, never invented.
 *
 * Two same-named `identifyCuisineSignatures` functions (cuisineAggregations.ts
 * and cuisine/signatureIdentificationEngine.ts) each carried an armed default
 * baseline of invented statistics — 26 and 30 numbers respectively, including
 * `Spirit: 3.5` (the §18 incident literal) and the six-value thermo composite
 * whose live twin was deleted in #679. A z-score against numbers nobody
 * measured is a fabrication with confidence attached. Both constants are
 * deleted; these pins keep the door shut.
 */
import {
  computeCuisineProperties,
  identifyCuisineSignatures,
  type GlobalPropertyAverages,
} from "@/utils/cuisineAggregations";

const RECIPES = [
  {
    _computed: {
      elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
      alchemicalProperties: { Spirit: 3, Essence: 4, Matter: 5, Substance: 2 },
    },
  },
  {
    _computed: {
      elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 },
      alchemicalProperties: { Spirit: 2, Essence: 5, Matter: 4, Substance: 3 },
    },
  },
] as unknown as Parameters<typeof computeCuisineProperties>[0];

/** FIXTURE baseline — arbitrary by design, labeled as such; non-zero std-devs. */
const FIXTURE_BASELINE: GlobalPropertyAverages = {
  elementals: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  alchemical: { Spirit: 2, Essence: 3, Matter: 3, Substance: 2 },
  thermodynamics: {},
  elementalsStdDev: { Fire: 0.05, Water: 0.05, Earth: 0.05, Air: 0.05 },
  alchemicalStdDev: { Spirit: 0.5, Essence: 0.5, Matter: 0.5, Substance: 0.5 },
  thermodynamicsStdDev: {},
} as GlobalPropertyAverages;

describe("cuisine baselines are honest", () => {
  it("computeCuisineProperties without a baseline returns NO signatures", () => {
    // The chicken-and-egg case: this function's outputs are the INPUT to
    // computeGlobalAverages, so on the first pass no real baseline exists.
    // The deleted DEFAULT_GLOBAL_AVERAGES used to fill that gap with invented
    // statistics; the honest answer is an empty signature list.
    const computed = computeCuisineProperties(RECIPES, {
      weightingStrategy: "equal",
      includeVariance: true,
      identifyPlanetaryPatterns: false,
    });
    expect(computed.signatures).toEqual([]);
    // POSITIVE CONTROL — the machinery still finds signatures when a caller
    // NAMES its baseline: Fire z-score (0.3-0.25)/0.05 = 1.0 < 1.5 threshold,
    // but Essence (4.5-3)/0.5 = 3.0 clears it.
    const withBaseline = computeCuisineProperties(RECIPES, {
      weightingStrategy: "equal",
      globalAverages: FIXTURE_BASELINE,
      identifyPlanetaryPatterns: false,
    });
    expect(withBaseline.signatures.length).toBeGreaterThan(0);
  });

  it("identifyCuisineSignatures requires its baseline at the type level", () => {
    // Compile-time pin: two arguments minimum. If someone re-adds a default,
    // this @ts-expect-error stops compiling and the pin fails loudly.
    // @ts-expect-error — the baseline parameter is required, never defaulted
    const call = () => identifyCuisineSignatures({ elementals: RECIPES[0].elementals });
    expect(typeof call).toBe("function");
  });
});
