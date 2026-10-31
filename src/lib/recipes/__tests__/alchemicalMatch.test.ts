/**
 * Matching recipes to a chart by alchemical proportions.
 *
 * [MEASURED 2026-10-31] /api/adept-table scored every recipe identically.
 * It read `alchemical_properties`, a field no recipe has (the catalog carries
 * `spirit`, `essence`, `matter`, `substance`), so each recipe took the
 * {25,25,25,25} default and the "top 3" was the first three recipes in the
 * catalog, whoever was asking. Real data: recipe totals run 1 to 41 and grow
 * with ingredient count, a natal chart's total is about 5, so profiles are
 * compared as proportions. 1,101 of 1,113 recipes have a distinct profile.
 */
import { getServerRecipes } from "@/actions/recipes";
import {
  chartQuantities,
  esmsAffinity,
  rankByAffinity,
  recipeQuantities,
  type EsmsQuantities,
} from "@/lib/recipes/alchemicalMatch";
import type { Recipe } from "@/types/recipe";

const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

function recipe(id: string, quantities: Partial<EsmsQuantities>): Recipe {
  return { id, name: id, ingredients: [], instructions: [], elementalProperties: ELEMENTS, ...quantities };
}

function q(spirit: number, essence: number, matter: number, substance: number): EsmsQuantities {
  return { spirit, essence, matter, substance };
}

describe("esmsAffinity", () => {
  it("is 100 for identical proportions, whatever the totals", () => {
    expect(esmsAffinity(q(1, 2, 3, 4), q(1, 2, 3, 4))).toBeCloseTo(100, 9);
    expect(esmsAffinity(q(1, 2, 3, 4), q(3, 6, 9, 12))).toBeCloseTo(100, 9);
  });

  it("is 0 when the profiles share nothing", () => {
    expect(esmsAffinity(q(1, 0, 0, 0), q(0, 0, 0, 1))).toBeCloseTo(0, 9);
  });

  it("is symmetric, and unchanged when either side is scaled", () => {
    const a = q(3, 1, 4, 1);
    const b = q(2, 7, 1, 8);
    expect(esmsAffinity(a, b)).toBeCloseTo(esmsAffinity(b, a), 9);
    expect(esmsAffinity(a, q(20, 70, 10, 80))).toBeCloseTo(esmsAffinity(a, b), 9);
    expect(esmsAffinity(q(30, 10, 40, 10), b)).toBeCloseTo(esmsAffinity(a, b), 9);
  });

  it("prefers the closer profile, and does not just prefer small recipes", () => {
    const chart = q(2.7, 2.2, 0.1, 0.1);
    const closeButBig = q(27, 22, 1, 1);
    const farButSmall = q(0.1, 0.1, 0.5, 0.4);
    expect(esmsAffinity(chart, closeButBig)).toBeGreaterThan(esmsAffinity(chart, farButSmall));
  });

  it("stays within 0 to 100", () => {
    for (const [a, b] of [
      [q(1, 1, 1, 1), q(5, 0, 0, 0)],
      [q(0.2, 9, 3, 0), q(4, 4, 4, 4)],
    ] as const) {
      const score = esmsAffinity(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe("recipeQuantities and chartQuantities", () => {
  it("reads a recipe's own ESMS totals", () => {
    expect(recipeQuantities(recipe("a", q(1, 2, 3, 4)))).toEqual(q(1, 2, 3, 4));
  });

  it("returns null, not a neutral profile, when a recipe has none to compare", () => {
    expect(recipeQuantities(recipe("none", {}))).toBeNull();
    expect(recipeQuantities(recipe("partial", { spirit: 1, essence: 1 }))).toBeNull();
    expect(recipeQuantities(recipe("zero", q(0, 0, 0, 0)))).toBeNull();
    expect(recipeQuantities(recipe("negative", q(-1, 1, 1, 1)))).toBeNull();
    expect(recipeQuantities(recipe("nan", q(Number.NaN, 1, 1, 1)))).toBeNull();
    expect(recipeQuantities(null)).toBeNull();
    expect(recipeQuantities(undefined)).toBeNull();
  });

  it("reads a chart's capitalized ESMS, and refuses one with nothing to match", () => {
    expect(chartQuantities({ Spirit: 1, Essence: 2, Matter: 3, Substance: 4 })).toEqual(q(1, 2, 3, 4));
    expect(chartQuantities({ Spirit: 0, Essence: 0, Matter: 0, Substance: 0 })).toBeNull();
    expect(chartQuantities({ Spirit: Number.NaN, Essence: 1, Matter: 1, Substance: 1 })).toBeNull();
  });
});

describe("rankByAffinity", () => {
  it("leaves out recipes with no quantities, and orders the rest best first", () => {
    const pool = [recipe("far", q(0, 0, 1, 1)), recipe("none", {}), recipe("near", q(1, 1, 0, 0))];
    const ranked = rankByAffinity(pool, q(1, 1, 0, 0), recipeQuantities);
    expect(ranked.map((r) => r.recipe.id)).toEqual(["near", "far"]);
    expect(ranked[0]?.score).toBeCloseTo(100, 9);
  });

  it("keeps catalog order among equal scores", () => {
    const pool = [recipe("first", q(1, 1, 1, 1)), recipe("second", q(2, 2, 2, 2)), recipe("third", q(3, 3, 3, 3))];
    expect(rankByAffinity(pool, q(1, 1, 1, 1), recipeQuantities).map((r) => r.recipe.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });
});

describe("over the real catalog", () => {
  let catalog: Recipe[];
  beforeAll(async () => {
    catalog = await getServerRecipes();
  }, 60_000);

  const spiritual = q(5, 1, 0.5, 0.5);
  const material = q(0.5, 1, 5, 1);

  it("ranks every recipe: the catalog carries quantities for all of them", () => {
    expect(rankByAffinity(catalog, spiritual, recipeQuantities)).toHaveLength(catalog.length);
  });

  it("does not score every recipe the same (the regression)", () => {
    const scores = rankByAffinity(catalog, spiritual, recipeQuantities).map((r) => r.score);
    expect(new Set(scores).size).toBeGreaterThan(1000);
    expect(Math.max(...scores) - Math.min(...scores)).toBeGreaterThan(30);
  });

  it("is not catalog order: the best matches are not the first recipes", () => {
    const top = rankByAffinity(catalog, spiritual, recipeQuantities)
      .slice(0, 3)
      .map((r) => r.recipe.id);
    expect(top).not.toEqual(catalog.slice(0, 3).map((r) => r.id));
  });

  it("depends on the chart: a spiritual chart and a material one want different recipes", () => {
    const idsFor = (target: EsmsQuantities): string[] =>
      rankByAffinity(catalog, target, recipeQuantities)
        .slice(0, 10)
        .map((r) => r.recipe.id);
    const forSpirit = idsFor(spiritual);
    const forMatter = idsFor(material);
    expect(forSpirit.filter((id) => forMatter.includes(id))).toEqual([]);
  });

  it("puts the recipes whose proportions match the chart at the top", () => {
    const share = (r: Recipe, pick: (x: EsmsQuantities) => number): number => {
      const own = recipeQuantities(r);
      if (!own) return 0;
      return pick(own) / (own.spirit + own.essence + own.matter + own.substance);
    };
    const ranked = rankByAffinity(catalog, spiritual, recipeQuantities);
    const meanSpiritShare = (rows: typeof ranked): number =>
      rows.reduce((sum, r) => sum + share(r.recipe, (x) => x.spirit), 0) / rows.length;
    expect(meanSpiritShare(ranked.slice(0, 20))).toBeGreaterThan(meanSpiritShare(ranked.slice(-20)));
  });
});
