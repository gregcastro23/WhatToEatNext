/**
 * Core result → wire shape. Recipe rows are trimmed to text (name, cuisine,
 * destination) per the 2026-09-23 decision; the core keeps richer facts for
 * callers that want them.
 */
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";
import type { OmnibarResult, RecipeRow } from "./types";

type WireRecipeRow = OmnibarResponse["recipes"][number];

function textRow({ id, name, href, cuisine }: RecipeRow): WireRecipeRow {
  return { id, name, href, cuisine };
}

export function toOmnibarResponse(result: OmnibarResult): OmnibarResponse {
  return {
    success: true,
    query: result.query,
    top: result.top,
    corrected: result.corrected,
    hero: result.hero
      ? {
          ...result.hero,
          seasons: [...result.hero.seasons],
          qualities: [...result.hero.qualities],
          rulingPlanets: [...result.hero.rulingPlanets],
        }
      : null,
    recipesContaining: result.recipesContaining.map((row) => ({ ...textRow(row), alternative: row.alternative })),
    recipes: result.recipes.map(textRow),
    ingredients: [...result.ingredients],
    cuisines: [...result.cuisines],
    methods: [...result.methods],
    sauces: [...result.sauces],
    total: result.total,
  };
}
