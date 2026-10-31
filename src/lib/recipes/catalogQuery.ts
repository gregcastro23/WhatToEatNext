/**
 * Pure query semantics for the recipe catalog API: which recipes a cuisine,
 * search or element filter selects, how a recipe leaves the server, and how a
 * page window is read. No I/O, so every consumer (the Next route, the Hono
 * gateway, the audit script) selects the same recipes the same way.
 *
 * The catalog is never capped. A caller that gives no `limit` gets every
 * recipe; one that gives a `limit` gets exactly the page it asked for.
 */
import type { Recipe } from "@/types/recipe";
import { isInternalCuisineCode } from "@/utils/internalCuisineCodes";

export interface CatalogFilter {
  element?: string | null;
  cuisine?: string | null;
  search?: string | null;
}

/**
 * A cuisine reduced to letters and digits, so the three spellings in
 * circulation compare equal: the display name "Middle Eastern", the URL slug
 * "middle-eastern" and the metadata key "MiddleEastern".
 */
export function cuisineKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** `all` (or no term) means every cuisine, not a cuisine called "all". */
function cuisineTermKey(term: string | null | undefined): string | null {
  const key = cuisineKey(term ?? "");
  return key === "" || key === "all" || key === "allcuisines" ? null : key;
}

function matchesCuisine(recipe: Recipe, termKey: string): boolean {
  return cuisineKey(recipe.cuisine ?? "").includes(termKey);
}

function haystackOf(recipe: Recipe): string {
  return [
    recipe.name,
    recipe.description,
    recipe.cuisine,
    ...(recipe.ingredients?.map((ingredient) => ingredient.name) ?? []),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function dominantElementOf(recipe: Recipe): string | null {
  const ep = recipe.elementalProperties;
  if (!ep) return null;
  let dominant: string | null = null;
  let maxValue = -1;
  for (const key of ["Fire", "Water", "Earth", "Air"] as const) {
    if (typeof ep[key] === "number" && ep[key] > maxValue) {
      maxValue = ep[key];
      dominant = key.toLowerCase();
    }
  }
  return dominant;
}

export function filterRecipes(
  recipes: readonly Recipe[],
  options: CatalogFilter,
): Recipe[] {
  const searchTerm = options.search?.toLowerCase().trim();
  const cuisineTerm = cuisineTermKey(options.cuisine);
  const elementTerm = options.element?.toLowerCase().trim();

  return recipes.filter((recipe) => {
    if (cuisineTerm && !matchesCuisine(recipe, cuisineTerm)) return false;
    if (searchTerm && !haystackOf(recipe).includes(searchTerm)) return false;
    if (elementTerm && !(dominantElementOf(recipe) ?? "").includes(elementTerm))
      return false;
    return true;
  });
}

/**
 * The recipe as it leaves the server. Internal archive codes ("hsca") are not
 * cuisines and never surface (see internalCuisineCodes); the live catalog
 * already omits them, and the static catalog still carries them.
 */
export function toPublicRecipe(recipe: Recipe): Recipe {
  if (!isInternalCuisineCode(recipe.cuisine)) return recipe;
  const { cuisine: _internal, ...rest } = recipe;
  return rest;
}

export interface CatalogWindow {
  /** Null: no limit, every recipe from `offset` on. */
  limit: number | null;
  offset: number;
}

function positiveInteger(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Read `limit`/`offset` query values. An absent or invalid `limit` is no limit. */
export function parseCatalogWindow(
  limit: string | null | undefined,
  offset: string | null | undefined,
): CatalogWindow {
  const start = Number(offset);
  return {
    limit: positiveInteger(limit),
    offset: Number.isInteger(start) && start > 0 ? start : 0,
  };
}

export function pageOf<T>(items: readonly T[], window: CatalogWindow): T[] {
  return window.limit === null
    ? items.slice(window.offset)
    : items.slice(window.offset, window.offset + window.limit);
}
