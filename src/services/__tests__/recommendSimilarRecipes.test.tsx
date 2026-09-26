/**
 * "Also Recommended" on /recipes/[recipeId] printed "NaN%" on every card
 * (prod, 2026-09-25). The cooking-method term divided 0 by 0 whenever neither
 * recipe listed methods, and no live row lists any, so every score was NaN.
 * A NaN comparator leaves sort a no-op, so all 50 live pages sampled on
 * 2026-09-26 recommended the same three popularity-first rows.
 *
 * Fixtures are real rows: see ./helpers/liveRecipeRows.ts.
 */
import { render, screen } from "@testing-library/react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { _recipeRecommender } from "@/services/recipeRecommendations";
import {
  AKARA,
  BEEF_BULGOGI,
  CAPONATA,
  JAPANESE_CURRY_RICE,
  LEMON_DILL_MAYO,
  MANDAZI,
  OYAKODON,
  POLENTA_CAKES,
  SAUTEED_MUSHROOMS,
  WHITE_WINE_MARINADE,
} from "./helpers/liveRecipeRows";
import type { Recipe } from "@/types/recipe";

// Catalog order as LocalRecipeService serves it (popularity first), so the
// three rows every page recommended lead.
const LIVE_CATALOG: Recipe[] = [
  POLENTA_CAKES,
  LEMON_DILL_MAYO,
  WHITE_WINE_MARINADE,
  JAPANESE_CURRY_RICE,
  BEEF_BULGOGI,
  SAUTEED_MUSHROOMS,
  CAPONATA,
  OYAKODON,
];

interface Ranked {
  id: string;
  score: number | undefined;
}

async function rank(anchor: Recipe, catalog: Recipe[]): Promise<Ranked[]> {
  const recommended = await _recipeRecommender.recommendSimilarRecipes(anchor, catalog);
  return recommended.map(({ id, score }) => ({ id, score }));
}

describe("recommendSimilarRecipes on live catalog rows", () => {
  it("scores every recommendation as a whole percent", async () => {
    const rankings = await Promise.all(LIVE_CATALOG.map(async (anchor) => rank(anchor, LIVE_CATALOG)));
    const scores = rankings.flat().map(({ score }) => score);

    expect(scores).toHaveLength(LIVE_CATALOG.length * 3);
    for (const score of scores) {
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("ranks by similarity, not catalog order", async () => {
    // Oyakodon shares its cuisine with the curry, onion + sugar with the
    // caponata, onion + soy sauce with the bulgogi, and nothing (no cuisine,
    // no ingredient) with the three popularity-first rows. Those three have
    // no cuisine to compare, and missing data must not outrank a real
    // ingredient overlap.
    expect(await rank(OYAKODON, LIVE_CATALOG)).toEqual([
      { id: JAPANESE_CURRY_RICE.id, score: 62 },
      { id: CAPONATA.id, score: 16 },
      { id: BEEF_BULGOGI.id, score: 16 },
    ]);
  });

  it("does not count two missing cuisines as a match", async () => {
    // The mushrooms carry no cuisine. Under `undefined === undefined` every
    // cuisine-less row earned the full 0.4 cuisine weight for free, which put
    // the polenta cakes (no shared ingredient) above the caponata (olive oil
    // + salt). With no cuisine on the anchor, ingredients and elements decide.
    expect(await rank(SAUTEED_MUSHROOMS, LIVE_CATALOG)).toEqual([
      { id: WHITE_WINE_MARINADE.id, score: 33 },
      { id: CAPONATA.id, score: 32 },
      { id: BEEF_BULGOGI.id, score: 28 },
    ]);
  });

  it("scores an identical recipe 100 on the card's percent scale", async () => {
    const twin: Recipe = { ...OYAKODON, id: "oyakodon-twin" };
    const [top] = await rank(OYAKODON, [...LIVE_CATALOG, twin]);
    expect(top).toEqual({ id: "oyakodon-twin", score: 100 });
  });
});

describe("recommendSimilarRecipes on static catalog rows", () => {
  it("reads the singular cookingMethod and weighs all four terms", async () => {
    // Cuisine: both "african" → 1. Ingredients: kosher salt + water of 15
    // distinct → 2/15. Methods: deep-frying of 6 distinct → 1/6. Elements:
    // 1 − mean|Δ| = 0.970357. 0.4 + 0.3·2/15 + 0.2·1/6 + 0.1·0.970357 =
    // 0.570369. Dropping the method term would give 0.671 → 67.
    expect(await rank(MANDAZI, [MANDAZI, AKARA])).toEqual([{ id: AKARA.id, score: 57 }]);
  });
});

describe("Also Recommended card", () => {
  it("prints the similarity as a percent, not NaN%", async () => {
    const [top] = await _recipeRecommender.recommendSimilarRecipes(OYAKODON, LIVE_CATALOG);
    if (top === undefined) throw new Error("expected a recommendation");

    render(<RecipeCard recipe={top} />);

    expect(screen.getByText("62%")).toBeTruthy();
    expect(screen.queryByText("NaN%")).toBeNull();
  });
});
