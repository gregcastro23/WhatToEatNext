/**
 * Every ingredient profile whose `macros.sodium` was a Daily Value fraction or a
 * gram amount (a value between 0 and 1 that is not mg) states mg from a named
 * USDA FoodData Central record, or is listed as unresolved.
 *
 * Real catalog rows: the 1,002 unified ingredient profiles. Salt, table (FDC
 * 173468) is 38,758 mg/100 g, so 1.5 g is 581.4 mg; the card said 0.25.
 *
 * The red proof restores the old card values under the new basis table.
 */
import { SODIUM_FDC_BASIS, SODIUM_UNRESOLVED } from "@/data/ingredients/sodiumFdcBasis";
import { unifiedIngredients } from "@/data/unified/ingredients";

/** The profile's `macros.sodium` (or flat `sodium`), or undefined when it states none. */
function sodiumOf(key: string): number | undefined {
  const ing: unknown = Reflect.get(unifiedIngredients, key);
  const profile: unknown = typeof ing === "object" && ing !== null ? Reflect.get(ing, "nutritionalProfile") : undefined;
  if (typeof profile !== "object" || profile === null) return undefined;
  const macros: unknown = Reflect.get(profile, "macros") ?? profile;
  const na: unknown = typeof macros === "object" && macros !== null ? Reflect.get(macros, "sodium") : undefined;
  return typeof na === "number" ? na : undefined;
}

describe("sodium corrected from USDA FoodData Central", () => {
  it("each card states the mg its basis derives, to the rounding it prints", () => {
    const off = SODIUM_FDC_BASIS.flatMap((b) => {
      const exact = (b.mgPer100g * b.servingGrams) / 100;
      const stated = sodiumOf(b.key);
      const tolerance = exact < 1 ? 0.005 : 0.05;
      return stated !== undefined && Math.abs(stated - exact) <= tolerance ? [] : [{ key: b.key, exact, stated }];
    });
    expect(off).toEqual([]);
  });

  it("salt is 581.4 mg in its 1.5 g serving, from Salt, table", () => {
    const salt = SODIUM_FDC_BASIS.find((b) => b.key === "salt");
    expect(salt).toMatchObject({ fdcId: 173468, fdcDescription: "Salt, table", mgPer100g: 38758, servingGrams: 1.5 });
    expect(sodiumOf("salt")).toBeCloseTo(581.4, 10);
  });

  it("no basis entry is listed as unresolved too", () => {
    const keys = new Set(SODIUM_FDC_BASIS.map((b) => b.key));
    expect(SODIUM_UNRESOLVED.filter((k) => keys.has(k))).toEqual([]);
  });
});

describe("a sodium between 0 and 1 is not mg unless a serving is that small", () => {
  it("only the unresolved profiles, and three servings under 10 g, remain", () => {
    const small = SODIUM_FDC_BASIS.filter((b) => (b.mgPer100g * b.servingGrams) / 100 < 1).map((b) => b.key);
    const sub1 = Object.keys(unifiedIngredients).filter((k) => {
      const na = sodiumOf(k);
      return na !== undefined && na > 0 && na < 1;
    });
    expect(small.sort()).toEqual(["arrowroot_powder", "chives", "maple_crystals"]);
    expect(sub1.sort()).toEqual([...SODIUM_UNRESOLVED, ...small].sort());
  });
});
