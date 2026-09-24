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

/**
 * [MEASURED 2026-09-24, production] While the database is slow, the catalog
 * query hits its read timeout after ~6 s and LocalRecipeService returns the
 * static fallback without caching it, so every search re-ran that query and
 * waited again. A degraded index is reused this long before the next retry.
 */
const DEGRADED_RETRY_MS = 60_000;

let staticRecords: Omit<SearchCatalogs, "recipes"> | null = null;
let memo: { recipes: readonly Recipe[]; index: SearchIndex; degraded: boolean } | null = null;
let degradedUntil = 0;
let inflight: Promise<SearchIndex> | null = null;

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

async function loadIndex(): Promise<SearchIndex> {
  const recipes = await LocalRecipeService.getAllRecipes();
  const degraded = LocalRecipeService.isCatalogDegraded();
  degradedUntil = degraded ? Date.now() + DEGRADED_RETRY_MS : 0;
  if (memo?.recipes === recipes) return memo.index;
  // A failed refresh keeps the last live index: its ids are live, the fallback's are static.
  if (degraded && memo && !memo.degraded) return memo.index;
  const index = buildIndexForRecipes(recipes);
  memo = { recipes, index, degraded };
  return index;
}

/**
 * The index over the current catalog. Concurrent callers share one load, and
 * a degraded (static-fallback) index is served for DEGRADED_RETRY_MS rather
 * than sending every request back to a struggling database.
 */
export async function getSearchIndex(): Promise<SearchIndex> {
  if (memo && Date.now() < degradedUntil) return memo.index;
  inflight ??= loadIndex().finally(() => {
    inflight = null;
  });
  return inflight;
}
