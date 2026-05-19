/**
 * Recipe Building System Tests
 *
 * Covers the formerly-stub seasonal and fusion methods on
 * UnifiedRecipeBuildingSystem. Methods are private but we exercise them
 * via the singleton instance using bracket access for testability.
 */

import { describe, expect, test } from "@jest/globals";
import { unifiedRecipeBuildingSystem } from "@/data/unified/recipeBuilding";

// Bracket-style access to private methods — they're private for API surface
// reasons, not for testability.
const system = unifiedRecipeBuildingSystem as unknown as Record<string, (...args: unknown[]) => unknown>;

describe("Fusion: calculateFusionRatio", () => {
  test("empty cuisines yields empty ratios", () => {
    expect(system.calculateFusionRatio([])).toEqual({});
  });

  test("single cuisine gets full weight", () => {
    const ratios = system.calculateFusionRatio(["Italian"]) as Record<string, number>;
    expect(ratios.Italian).toBeCloseTo(1.0);
  });

  test("geometric decay: primary dominates, secondary halves", () => {
    const ratios = system.calculateFusionRatio(["Italian", "Japanese"]) as Record<string, number>;
    // raw 0.5, 0.25 → normalized 0.667, 0.333
    expect(ratios.Italian).toBeCloseTo(2 / 3, 3);
    expect(ratios.Japanese).toBeCloseTo(1 / 3, 3);
    // Ratios sum to 1
    const sum = Object.values(ratios).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0);
  });

  test("4 cuisines: primary still dominates", () => {
    const ratios = system.calculateFusionRatio([
      "Italian",
      "Japanese",
      "Mexican",
      "Indian",
    ]) as Record<string, number>;
    expect(ratios.Italian).toBeGreaterThan(ratios.Japanese);
    expect(ratios.Japanese).toBeGreaterThan(ratios.Mexican);
    expect(ratios.Mexican).toBeGreaterThan(ratios.Indian);
  });
});

describe("Fusion: calculateCulturalHarmony", () => {
  test("single cuisine yields perfect harmony", () => {
    expect(system.calculateCulturalHarmony(["Italian"])).toBe(1.0);
  });

  test("same-region cuisines yield high harmony (>= 0.9)", () => {
    const harmony = system.calculateCulturalHarmony(["Italian", "Greek"]) as number;
    expect(harmony).toBeGreaterThanOrEqual(0.9);
  });

  test("cross-region cuisines fall back to elemental similarity in [0.5, 1.0]", () => {
    const harmony = system.calculateCulturalHarmony(["Italian", "Japanese"]) as number;
    // Italian (mediterranean) + Japanese (east_asian) — no explicit pair,
    // falls through to elemental similarity. The signatures happen to be
    // close (both have balanced Water/Earth profiles), so harmony can be high.
    expect(harmony).toBeGreaterThanOrEqual(0.5);
    expect(harmony).toBeLessThanOrEqual(1.0);
  });

  test("cross-region pair with explicit harmony entry uses the matrix", () => {
    // Mediterranean + Middle Eastern is in CROSS_REGION_HARMONY at 0.85
    const harmony = system.calculateCulturalHarmony([
      "Italian",
      "Middle Eastern",
    ]) as number;
    expect(harmony).toBeCloseTo(0.85, 2);
  });

  test("unknown cuisines fall back without throwing", () => {
    const harmony = system.calculateCulturalHarmony(["UnknownCuisineA", "UnknownCuisineB"]) as number;
    expect(typeof harmony).toBe("number");
    expect(harmony).toBeGreaterThanOrEqual(0.5);
    expect(harmony).toBeLessThanOrEqual(1.0);
  });
});

describe("Fusion: generateMultiCuisineFusion", () => {
  test("single cuisine = 'classic pairing' (harmony == 1.0)", () => {
    const profile = system.generateMultiCuisineFusion(["Italian"]) as {
      fusionType: string;
      primaryCuisine: string;
      influences: string[];
      complexity: number;
    };
    expect(profile.fusionType).toBe("classic pairing");
    expect(profile.primaryCuisine).toBe("Italian");
    expect(profile.influences).toEqual([]);
  });

  test("two same-region cuisines = 'classic pairing' or 'regional fusion'", () => {
    const profile = system.generateMultiCuisineFusion(["Italian", "Greek"]) as {
      fusionType: string;
    };
    expect(["classic pairing", "regional fusion"]).toContain(profile.fusionType);
  });

  test("primary cuisine and influences populated correctly", () => {
    const profile = system.generateMultiCuisineFusion([
      "Italian",
      "Japanese",
      "Mexican",
    ]) as {
      primaryCuisine: string;
      influences: string[];
      complexity: number;
    };
    expect(profile.primaryCuisine).toBe("Italian");
    expect(profile.influences).toEqual(["Japanese", "Mexican"]);
    expect(profile.complexity).toBeGreaterThan(0);
    expect(profile.complexity).toBeLessThanOrEqual(1);
  });
});

describe("Fusion: calculateKalchmFusionBalance", () => {
  test("single cuisine returns 1.0 (perfect balance)", () => {
    const balance = system.calculateKalchmFusionBalance({} as never, ["Italian"]) as number;
    expect(balance).toBe(1.0);
  });

  test("returns 0..1 bounded value for multiple cuisines", () => {
    const balance = system.calculateKalchmFusionBalance({} as never, [
      "Italian",
      "Japanese",
    ]) as number;
    expect(balance).toBeGreaterThan(0);
    expect(balance).toBeLessThanOrEqual(1);
  });
});

describe("Fusion: calculateInnovationScore", () => {
  test("single cuisine = 0 innovation", () => {
    expect(
      system.calculateInnovationScore({} as never, ["Italian"]),
    ).toBe(0);
  });

  test("multiple cuisines yield positive innovation", () => {
    const score = system.calculateInnovationScore({} as never, [
      "Italian",
      "Japanese",
      "Mexican",
    ]) as number;
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe("Seasonal: generateSeasonalTimingAdjustments", () => {
  test("winter (Saturn) yields longer cooking time than summer (Sun)", () => {
    const recipe = { cookingTime: "30 minutes" } as never;
    const winter = system.generateSeasonalTimingAdjustments(recipe, "winter") as {
      cookingTime: number;
    };
    const summer = system.generateSeasonalTimingAdjustments(recipe, "summer") as {
      cookingTime: number;
    };
    expect(winter.cookingTime).toBeGreaterThan(summer.cookingTime);
  });

  test("rest time scales with cooking time", () => {
    const recipe = { cookingTime: "60 minutes" } as never;
    const result = system.generateSeasonalTimingAdjustments(recipe, "spring") as {
      cookingTime: number;
      restTime: number;
    };
    expect(result.restTime).toBeGreaterThan(0);
    expect(result.restTime).toBeLessThan(result.cookingTime);
  });

  test("reason references the ruling planet", () => {
    const recipe = { cookingTime: "30 minutes" } as never;
    const winter = system.generateSeasonalTimingAdjustments(recipe, "winter") as {
      reason: string;
    };
    expect(winter.reason).toContain("Saturn");
  });
});

describe("Seasonal: generateSeasonalTemperatureAdjustments", () => {
  test("winter runs hotter, summer runs cooler", () => {
    const recipe = {} as never;
    const winter = system.generateSeasonalTemperatureAdjustments(recipe, "winter") as {
      temperature: number;
    };
    const summer = system.generateSeasonalTemperatureAdjustments(recipe, "summer") as {
      temperature: number;
    };
    expect(winter.temperature).toBeGreaterThan(summer.temperature);
  });

  test("recipe's own cookingTemperature is honored as base", () => {
    const recipe = { cookingTemperature: 400 } as never;
    const winter = system.generateSeasonalTemperatureAdjustments(recipe, "winter") as {
      temperature: number;
    };
    expect(winter.temperature).toBe(425); // 400 + 25
  });

  test("spring offset is 0 — no temperature change", () => {
    const recipe = { cookingTemperature: 375 } as never;
    const spring = system.generateSeasonalTemperatureAdjustments(recipe, "spring") as {
      temperature: number;
    };
    expect(spring.temperature).toBe(375);
  });
});

describe("Seasonal: ingredient & method substitutions", () => {
  test("ingredient substitutions match seasonal table", () => {
    const recipe = {
      ingredients: [{ name: "butter" }, { name: "tomato" }],
    } as never;
    const subs = system.generateDetailedIngredientSubstitutions(
      recipe,
      "summer",
      {} as never,
    ) as Array<{ original: string; substitute: string }>;
    // Summer table substitutes butter → olive oil
    const butterSub = subs.find((s) => s.original.includes("butter"));
    expect(butterSub).toBeDefined();
    expect(butterSub?.substitute).toContain("olive");
  });

  test("empty ingredient list yields no substitutions", () => {
    const recipe = { ingredients: [] } as never;
    const subs = system.generateDetailedIngredientSubstitutions(
      recipe,
      "winter",
      {} as never,
    ) as unknown[];
    expect(subs).toEqual([]);
  });

  test("cooking method adjustments suggest seasonal alternatives", () => {
    const recipe = { cookingMethod: ["grill"] } as never;
    // Winter prefers braise/stew/slow-cook, not grill
    const adjustments = system.generateDetailedCookingMethodAdjustments(
      recipe,
      "winter",
      {} as never,
    ) as Array<{ method: string; adjustment: string }>;
    expect(adjustments.length).toBeGreaterThan(0);
    expect(adjustments[0].method).toBe("grill");
  });
});

describe("Improvement metrics: Kalchm & Monica", () => {
  test("identical recipes yield 0 improvement", () => {
    const original = { alchemicalProperties: { kalchm: 1.5, monicaConstant: 0.8 } } as never;
    const adapted = { alchemicalProperties: { kalchm: 1.5, monicaConstant: 0.8 } } as never;
    const k = system.calculateKalchmImprovement(original, adapted) as number;
    const m = system.calculateMonicaImprovement(original, adapted) as number;
    expect(k).toBe(0);
    expect(m).toBe(0);
  });

  test("symmetric delta: positive change yields positive score", () => {
    const original = { alchemicalProperties: { kalchm: 1.0, monicaConstant: 1.0 } } as never;
    const adapted = { alchemicalProperties: { kalchm: 1.5, monicaConstant: 1.5 } } as never;
    const k = system.calculateKalchmImprovement(original, adapted) as number;
    const m = system.calculateMonicaImprovement(original, adapted) as number;
    expect(k).toBeGreaterThan(0);
    expect(k).toBeLessThan(1);
    expect(m).toBeGreaterThan(0);
  });

  test("missing alchemical properties yield 0 (no NaN)", () => {
    const original = {} as never;
    const adapted = {} as never;
    expect(system.calculateKalchmImprovement(original, adapted)).toBe(0);
    expect(system.calculateMonicaImprovement(original, adapted)).toBe(0);
  });
});
