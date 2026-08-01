/**
 * Guards for the three silent holes in cooking-method thermodynamics resolution.
 *
 * All three shared one shape: a lookup that could not fail loudly.
 *
 *   1. Tier 1 dereferenced `detailedCookingMethods[key].thermodynamicProperties`
 *      with no guard, so a key miss threw TypeError instead of falling through.
 *   2. `_COOKING_METHOD_THERMODYNAMICS` was `{}`, so its tier could never resolve
 *      while its `if` guard made it read as a working priority tier.
 *   3. The only caller wrapped the whole thing in
 *      `catch { thermodynamicScore = 0.5 }`, converting the TypeError into a
 *      fabricated mid-value that is indistinguishable from a computed 0.5.
 *
 * @file src/__tests__/cookingMethodThermodynamicsFallback.test.ts
 */

import { getMethodThermodynamics as getFromRecommender } from "@/utils/cookingMethodRecommender";
import { getMethodThermodynamics as getFromRecommendation } from "@/utils/recommendation/methodRecommendation";

/** Names whose `.toLowerCase()` does not match any `allCookingMethods` record key. */
const UNMAPPED_NAMES = [
  "Pressure Cooking", // -> "pressure cooking" (space), key is pressure_cooking
  "Cryo-Cooking", // -> "cryo-cooking" (hyphen), key is cryo_cooking
  "Tilt-Skillet",
  "a method that does not exist at all",
];

const RESOLVERS: Array<[string, (m: unknown) => unknown]> = [
  ["cookingMethodRecommender", getFromRecommender as (m: unknown) => unknown],
  ["recommendation/methodRecommendation", getFromRecommendation as (m: unknown) => unknown],
];

describe.each(RESOLVERS)("%s.getMethodThermodynamics", (_label, resolve) => {
  it("does not throw on a name that misses the detailed catalog", () => {
    // This is the defect: the dereference was unguarded, so a miss threw.
    for (const name of UNMAPPED_NAMES) {
      expect(() => resolve({ name })).not.toThrow();
    }
  });

  it("returns finite numbers for every unmapped name", () => {
    for (const name of UNMAPPED_NAMES) {
      const result = resolve({ name }) as Record<string, number>;
      for (const key of ["heat", "entropy", "reactivity"]) {
        expect(Number.isFinite(result[key])).toBe(true);
      }
    }
  });

  it("survives a method with no name at all", () => {
    expect(() => resolve({})).not.toThrow();
  });

  it("routes an unmapped high-heat name to the heuristic tier, not a flat 0.5", () => {
    // With the empty-registry tier removed, the keyword heuristic is the real
    // last tier. A name containing "grill" must reach it and produce the
    // documented high-heat profile — if this comes back 0.5 across the board,
    // something is silently defaulting again.
    const result = resolve({ name: "charcoal grilling technique" }) as Record<string, number>;
    expect(result.heat).toBeGreaterThan(0.5);
  });

  it("differentiates high-heat from wet methods", () => {
    // The whole point of the ladder is differentiation. A swallowed error or a
    // universal default collapses these to the same value.
    const hot = resolve({ name: "open flame grilling" }) as Record<string, number>;
    const wet = resolve({ name: "gentle poaching" }) as Record<string, number>;
    expect(hot.heat).toBeGreaterThan(wet.heat);
  });
});

describe("the empty thermodynamics registry is gone", () => {
  it("no longer exports _COOKING_METHOD_THERMODYNAMICS", async () => {
    const alchemy = (await import("@/types/alchemy")) as Record<string, unknown>;
    expect(alchemy).not.toHaveProperty("_COOKING_METHOD_THERMODYNAMICS");
  });
});
