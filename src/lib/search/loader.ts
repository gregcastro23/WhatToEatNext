/**
 * Server-side search index over the LIVE recipe catalog (D1: every recipe
 * href is an id /recipes/[recipeId] resolves). Rebuilt only when
 * LocalRecipeService hands back a new catalog array (its 5-minute refresh).
 *
 * While the DB is down the catalog degrades to the static list; those static
 * ids still resolve (Phase 0 bridges them to live UUIDs or renders them).
 */
import { CUISINES_METADATA } from "@/data/cuisines/index";
import { resolveIngredientSlug } from "@/data/ingredientRecipeIndex";
import { allSauces } from "@/data/sauces";
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import type { Recipe } from "@/types/recipe";
import {
  cuisineRecords,
  ingredientRecords,
  methodRecords,
  recipeRecords,
  sauceRecords,
} from "./catalogRecords";
import { buildIngredientKeyResolver } from "./ingredientKeys";
import { buildSearchIndex, type SearchIndex } from "./searchIndex";
import type { SearchCatalogs } from "./types";

let staticRecords: Omit<SearchCatalogs, "recipes"> | null = null;
let memo: { recipes: readonly Recipe[]; index: SearchIndex } | null = null;

function catalogsWithout(): Omit<SearchCatalogs, "recipes"> {
  staticRecords ??= {
    ingredients: ingredientRecords(getIngredientCatalog().entries),
    cuisines: cuisineRecords(CUISINES_METADATA),
    methods: methodRecords(),
    sauces: sauceRecords(allSauces),
  };
  return staticRecords;
}

/** Build an index from any recipe list; the loader passes the live catalog. */
export function buildIndexForRecipes(recipes: readonly Recipe[]): SearchIndex {
  const base = catalogsWithout();
  const { ingredients } = base;
  const keyOf = buildIngredientKeyResolver(ingredients, resolveIngredientSlug);
  return buildSearchIndex({ ...base, recipes: recipeRecords(recipes) }, keyOf);
}

export async function getSearchIndex(): Promise<SearchIndex> {
  const recipes = await LocalRecipeService.getAllRecipes();
  if (memo?.recipes === recipes) return memo.index;
  const index = buildIndexForRecipes(recipes);
  memo = { recipes, index };
  return index;
}
