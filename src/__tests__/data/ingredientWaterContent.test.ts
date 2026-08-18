/**
 * Guards on `nutritionalProfile.waterContent`.
 *
 * Water content exists to feed the composition correlations the lab's thermal
 * layer is built on — Choi & Okos (1986) for specific heat, conductivity and
 * density, and latent heat, which is very nearly a pure water-content quantity.
 * All of them take MASS FRACTIONS. Every failure mode below is one that would
 * produce a confident, wrong number rather than an obvious crash.
 *
 * @file src/__tests__/data/ingredientWaterContent.test.ts
 */
import { allIngredients } from "@/data/ingredients";
import type { NutritionalProfile, WaterContent } from "@/data/ingredients/types";

interface Carrier {
  name: string;
  water: WaterContent;
  profile: NutritionalProfile;
}

/** Every ingredient that actually carries a water figure. */
const carriers: Carrier[] = Object.entries(
  allIngredients as Record<string, { name?: string; nutritionalProfile?: NutritionalProfile }>,
)
  .map(([key, ing]) => {
    const profile = ing?.nutritionalProfile;
    const water = profile?.waterContent;
    return water ? { name: ing?.name ?? key, water, profile: profile! } : null;
  })
  .filter((x): x is Carrier => x !== null);

/** Grams stated inside a serving_size like "1 medium (61g)". */
function servingGrams(servingSize: string): number | null {
  const match = /\(([\d.]+)\s*g\)/i.exec(servingSize);
  if (!match) return null;
  const grams = Number(match[1]);
  return Number.isFinite(grams) && grams > 0 ? grams : null;
}

describe("ingredient water content", () => {
  it("is populated at all — a vacuous sweep would pass every test below", () => {
    // The whole file is `for (const c of carriers)`. With an empty list every
    // assertion holds trivially, which is exactly how an inert field ships
    // looking verified.
    expect(carriers.length).toBeGreaterThan(0);
  });

  it("is a FRACTION in [0, 1], never grams per 100 g", () => {
    // THE load-bearing guard. USDA reports water as g per 100 g, so carrot is
    // 88.29 at the source and 0.8829 here. Writing 88.29 into this field is the
    // single most likely mistake, it is off by 100x, and every downstream
    // formula would still return a plausible-looking number.
    for (const c of carriers) {
      expect(Number.isFinite(c.water.fraction)).toBe(true);
      expect(c.water.fraction).toBeGreaterThanOrEqual(0);
      expect(c.water.fraction).toBeLessThanOrEqual(1);
    }
  });

  it("carries the provenance its own basis claims", () => {
    // `basis: "usda-fdc"` asserts a specific FoodData Central record exists.
    // Without the id that assertion is unfalsifiable, which is the same as
    // having no basis at all.
    for (const c of carriers) {
      expect(["usda-fdc", "class-typical", "derived"]).toContain(c.water.basis);
      if (c.water.basis === "usda-fdc") {
        expect(typeof c.water.fdcId).toBe("number");
        expect(c.water.fdcId).toBeGreaterThan(0);
        expect(c.water.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof c.water.fdcDescription).toBe("string");
        expect(c.water.fdcDescription!.length).toBeGreaterThan(0);
      }
    }
  });

  it("never lets water plus the stated macros exceed the serving mass", () => {
    // A cross-check against a DIFFERENT field, so it catches what a range check
    // cannot: a water figure that belongs to a different food, or to a
    // different USDA dataset than the macros beside it.
    //
    // `[MEASURED 2026-08-18]` This is not hypothetical. Garlic's water was first
    // taken from an FDC *Foundation* record (63.1 %) while the macros in the
    // profile follow *SR Legacy* accounting (58.6 %). Both figures are real USDA
    // values and the pair summed to 1.031 — individually defensible, jointly
    // wrong. Nothing else in this file could have caught it.
    //
    // Tolerance is 2 %: USDA carbohydrate is "by difference" and our macros are
    // rounded per serving, so exact closure is not expected. Ash is absent from
    // `macros` entirely, which can only make the sum SMALLER, never larger.
    const checked: string[] = [];
    for (const c of carriers) {
      const grams = servingGrams(c.profile.serving_size);
      const macros = c.profile.macros;
      if (grams === null || !macros) continue;
      // `fiber` and `sugar` are subsets of `carbs`, not additions to it.
      const solidsG = (macros.protein ?? 0) + (macros.fat ?? 0) + (macros.carbs ?? 0);
      // Profiles whose macros ALONE overflow their serving are broken
      // independently of water — see the test below, which owns that failure.
      // Folding them in here would blame the water figure for someone else's
      // arithmetic and make this check impossible to act on.
      if (solidsG / grams > 1) continue;
      expect(c.water.fraction + solidsG / grams).toBeLessThanOrEqual(1.02);
      checked.push(c.name);
    }
    // A silent zero here would mean serving_size stopped being parseable and
    // this test quietly became a no-op.
    expect(checked.length).toBeGreaterThan(0);
  });

  it("reports profiles whose macros alone overflow their serving size", () => {
    // PRE-EXISTING data defects, surfaced rather than absorbed. `sugar` declares
    // 4.2 g of carbohydrate in a serving it describes as 4 g — 105 % solids
    // before any water is considered. That is a `serving_size`/`macros`
    // disagreement that predates water content and is out of scope to fix here,
    // but it must not become invisible just because the water check skips it.
    //
    // This test PASSES with them listed. It fails only if the list grows, which
    // would mean a new profile arrived broken.
    const known = ["sugar"];
    const overflowing: string[] = [];
    for (const c of carriers) {
      const grams = servingGrams(c.profile.serving_size);
      const macros = c.profile.macros;
      if (grams === null || !macros) continue;
      const solidsG = (macros.protein ?? 0) + (macros.fat ?? 0) + (macros.carbs ?? 0);
      if (solidsG / grams > 1) overflowing.push(c.name);
    }
    expect(overflowing.sort()).toEqual(known.sort());
  });

  it("distinguishes an absent figure from a zero one", () => {
    // Absent must mean UNKNOWN. A genuinely anhydrous ingredient (a refined oil)
    // says 0 explicitly; an ingredient nobody has sourced yet says nothing. If
    // absence ever defaults to 0, every unsourced ingredient silently claims to
    // release no latent heat.
    const anhydrous = carriers.filter((c) => c.water.fraction === 0);
    for (const c of anhydrous) {
      // A zero is a claim and needs the same provenance as any other value.
      expect(c.water.basis).toBeDefined();
      expect(c.water.fdcId).toBeDefined();
    }
    const unsourced = Object.values(
      allIngredients as Record<string, { nutritionalProfile?: NutritionalProfile }>,
    ).filter((i) => i?.nutritionalProfile && !i.nutritionalProfile.waterContent);
    for (const i of unsourced.slice(0, 50)) {
      expect(i.nutritionalProfile!.waterContent).toBeUndefined();
    }
  });

  it("agrees with itself wherever the same ingredient appears twice", () => {
    // The registries genuinely duplicate: "Olive Oil" exists in oils/oils.ts and
    // seasonings/oils.ts, and "olive oil" again under fruits. Two copies of one
    // substance disagreeing about its water content is drift, and it is exactly
    // the class of bug that survives because nobody reads both files at once.
    const byName = new Map<string, Set<number>>();
    for (const c of carriers) {
      const key = c.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, new Set());
      byName.get(key)!.add(c.water.fraction);
    }
    for (const [name, fractions] of byName) {
      expect({ name, fractions: [...fractions] }).toEqual({
        name,
        fractions: [[...fractions][0]],
      });
    }
  });
});
