import type { KineticMetrics } from "@/types/kinetics";
import type { Recipe } from "@/types/recipe";
import {
  calculateKineticsCompatibility,
  validateRecipeCircuit,
} from "../recipeCircuit";

function makeKinetics(
  overrides: Partial<KineticMetrics> = {},
): KineticMetrics {
  return {
    velocity: { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.2 },
    momentum: { Fire: 0.4, Water: 0.4, Earth: 0.4, Air: 0.4 },
    charge: 2.5,
    potentialDifference: 1.5,
    currentFlow: 0.5,
    power: 10,
    inertia: 2,
    force: { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.2 },
    forceMagnitude: 1.0,
    forceClassification: "balanced",
    aspectPhase: null,
    thermalDirection: "stable",
    ...overrides,
  };
}

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r1",
    name: "Standard Dish",
    ingredients: [{ name: "Salt", amount: 1, unit: "tsp" }],
    instructions: ["Cook."],
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    ...overrides,
  };
}

describe("recipeCircuit", () => {
  describe("validateRecipeCircuit", () => {
    it("computes losses, output power, and efficiency when entropy is provided", () => {
      const result = validateRecipeCircuit(
        { ...makeKinetics({ power: 10, currentFlow: 2 }), entropy: 0.5 },
        makeRecipe(),
      );

      expect(result.isValid).toBe(true);
      expect(result.losses).toBeCloseTo(2, 6);
      expect(result.outputPower).toBeCloseTo(8, 6);
      expect(result.efficiency).toBeCloseTo(0.8, 6);
      expect(result.error).toBeUndefined();
    });

    it("preserves NaN resistance and invalid state when entropy is omitted", () => {
      const result = validateRecipeCircuit(makeKinetics(), makeRecipe());

      expect(result.isValid).toBe(false);
      expect(result.losses).toBeNaN();
      expect(result.outputPower).toBeNaN();
      expect(result.error).toBe("Power conservation violated");
    });
  });

  describe("calculateKineticsCompatibility", () => {
    it("adds grilling boost for high forceMagnitude with array or string cookingMethods", () => {
      const highForce = makeKinetics({ forceMagnitude: 4.0 });
      const baseRecipe = makeRecipe();

      expect(calculateKineticsCompatibility(highForce, baseRecipe)).toBeCloseTo(
        0.5,
        6,
      );
      expect(
        calculateKineticsCompatibility(highForce, {
          ...baseRecipe,
          cookingMethods: ["roasting", "grilling"],
        }),
      ).toBeCloseTo(0.65, 6);
      expect(
        calculateKineticsCompatibility(highForce, {
          ...baseRecipe,
          cookingMethods: "grilling",
        }),
      ).toBeCloseTo(0.65, 6);
    });
  });
});
