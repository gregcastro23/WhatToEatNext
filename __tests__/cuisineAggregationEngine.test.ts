/**
 * Cuisine Aggregation Engine Tests
 *
 * Covers the new pure utilities added for P2 #11: thermodynamic variance
 * and representativeness weighting.
 */

import { describe, expect, test } from "@jest/globals";
import type { RecipeComputedProperties } from "@/types/hierarchy";
import {
  calculateRepresentativenessWeights,
  calculateThermodynamicVariance,
  computeCuisineProperties,
} from "@/utils/cuisine/cuisineAggregationEngine";

function makeRecipe(
  elementals: { Fire: number; Water: number; Earth: number; Air: number },
  overrides: Partial<RecipeComputedProperties> = {},
): RecipeComputedProperties {
  return {
    elementalProperties: elementals,
    alchemicalProperties: { Spirit: 1, Essence: 1, Matter: 1, Substance: 1 },
    thermodynamicProperties: {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0,
      kalchm: 1,
      monica: 1,
    },
    kineticProperties: {} as RecipeComputedProperties["kineticProperties"],
    dominantElement: "Fire",
    dominantAlchemicalProperty: "Spirit",
    computationMetadata: {
      planetaryPositionsUsed: {},
      cookingMethodsApplied: [],
      computationTimestamp: new Date(),
    },
    ...overrides,
  };
}

describe("calculateRepresentativenessWeights", () => {
  test("empty array returns empty weights", () => {
    expect(calculateRepresentativenessWeights([])).toEqual([]);
  });

  test("single recipe gets weight 1", () => {
    const r = makeRecipe({ Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 });
    expect(calculateRepresentativenessWeights([r])).toEqual([1]);
  });

  test("identical recipes get equal weights near 1", () => {
    const elementals = { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 };
    const weights = calculateRepresentativenessWeights([
      makeRecipe(elementals),
      makeRecipe(elementals),
      makeRecipe(elementals),
    ]);
    expect(weights).toHaveLength(3);
    weights.forEach((w) => expect(w).toBeCloseTo(1.0, 5));
  });

  test("outlier recipe receives lower weight than centroid recipes", () => {
    // Two recipes clustered, one outlier
    const cluster = { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 };
    const outlier = { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 };
    const weights = calculateRepresentativenessWeights([
      makeRecipe(cluster),
      makeRecipe(cluster),
      makeRecipe(outlier),
    ]);
    expect(weights[0]).toBeGreaterThan(weights[2]);
    expect(weights[1]).toBeGreaterThan(weights[2]);
  });
});

describe("calculateThermodynamicVariance", () => {
  test("returns undefined when no recipes have thermo data", () => {
    expect(calculateThermodynamicVariance([], {} as never)).toBeUndefined();
  });

  test("identical thermo values produce zero variance", () => {
    const r1 = makeRecipe({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    const r2 = makeRecipe({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    const variance = calculateThermodynamicVariance([r1, r2], {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0,
      kalchm: 1,
      monica: 1,
    });
    expect(variance).toBeDefined();
    expect(variance?.heat).toBe(0);
    expect(variance?.entropy).toBe(0);
  });

  test("spread thermo values produce nonzero variance", () => {
    const r1 = makeRecipe({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, {
      thermodynamicProperties: {
        heat: 0.1,
        entropy: 0.2,
        reactivity: 0.3,
        gregsEnergy: 0,
        kalchm: 1,
        monica: 1,
      },
    });
    const r2 = makeRecipe({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, {
      thermodynamicProperties: {
        heat: 0.9,
        entropy: 0.8,
        reactivity: 0.7,
        gregsEnergy: 0,
        kalchm: 1,
        monica: 1,
      },
    });
    const variance = calculateThermodynamicVariance([r1, r2], {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0,
      kalchm: 1,
      monica: 1,
    });
    expect(variance?.heat).toBeGreaterThan(0);
    expect(variance?.entropy).toBeGreaterThan(0);
  });
});

describe("computeCuisineProperties — popularity weighting branch", () => {
  test("popularity weights flow through to averages when supplied", () => {
    // Two recipes: one Fire-heavy, one Water-heavy.
    const r1 = makeRecipe({ Fire: 1.0, Water: 0, Earth: 0, Air: 0 });
    const r2 = makeRecipe({ Fire: 0, Water: 1.0, Earth: 0, Air: 0 });

    const equalWeighted = computeCuisineProperties([r1, r2], {
      weightingStrategy: "equal",
    });

    const fireFavored = computeCuisineProperties([r1, r2], {
      weightingStrategy: "popularity",
      recipeWeights: [10, 1],
    });

    expect(equalWeighted.averageElementals.Fire).toBeCloseTo(0.5);
    expect(fireFavored.averageElementals.Fire).toBeGreaterThan(0.8);
  });

  test("popularity branch falls back to equal when weights length mismatch", () => {
    const r1 = makeRecipe({ Fire: 1.0, Water: 0, Earth: 0, Air: 0 });
    const r2 = makeRecipe({ Fire: 0, Water: 1.0, Earth: 0, Air: 0 });

    const fallback = computeCuisineProperties([r1, r2], {
      weightingStrategy: "popularity",
      recipeWeights: [10], // wrong length
    });

    expect(fallback.averageElementals.Fire).toBeCloseTo(0.5);
  });

  test("variance object now includes thermodynamic spread", () => {
    const r1 = makeRecipe({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    const r2 = makeRecipe({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    const result = computeCuisineProperties([r1, r2]);
    expect(result.variance.thermodynamics).toBeDefined();
  });
});
