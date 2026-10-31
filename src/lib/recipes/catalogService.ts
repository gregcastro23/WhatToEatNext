/**
 * The recipe catalog as the API serves it: load, filter, enrich, page. The
 * Next route, the Hono gateway and the catalog audit all call this, so what
 * the audit proves is what a visitor is sent.
 */
import { getServerRecipes } from "@/actions/recipes";
import { _logger } from "@/lib/logger";
import type { Recipe } from "@/types/recipe";
import {
  filterRecipes,
  pageOf,
  toPublicRecipe,
  type CatalogFilter,
  type CatalogWindow,
} from "./catalogQuery";
import { loadCanonicalCatalog, withAuthoredFactsAll } from "./recipeRefResolver";

export interface CatalogPage {
  success: true;
  recipes: Recipe[];
  /** Every recipe the filter selects, whatever the page holds. */
  total: number;
  /** Null when the caller set none: the page then holds all `total`. */
  limit: number | null;
  offset: number;
  note?: string;
}

async function pageFor(
  recipes: readonly Recipe[],
  window: CatalogWindow,
  note?: string,
): Promise<CatalogPage> {
  return {
    success: true,
    // The live catalog's times and meal are placeholders (prep 30, cook
    // 30, "main" on every row); serve the authored ones, or none.
    recipes: await withAuthoredFactsAll(pageOf(recipes, window)),
    total: recipes.length,
    limit: window.limit,
    offset: window.offset,
    ...(note ? { note } : {}),
  };
}

export async function loadCatalogPage(
  filter: CatalogFilter,
  window: CatalogWindow,
): Promise<CatalogPage> {
  try {
    return await pageFor(filterRecipes(await loadCanonicalCatalog(), filter), window);
  } catch (err) {
    _logger.warn("[recipes] backend service unavailable:", err);
    const fallback = filterRecipes((await getServerRecipes()).map(toPublicRecipe), filter);
    return pageFor(
      fallback,
      window,
      "Recipe database temporarily unavailable; using static cuisine fallback",
    );
  }
}
