/**
 * Server-side loader for the recipe identity index (see `./recipeIdentity`).
 *
 * `resolveRecipeRef` serves `/recipes/[recipeId]`: it bridges a static-catalog
 * or ingredient-index id to the live recipe the page can render.
 * `listCanonicalRecipeIds` serves the sitemap: one canonical id per recipe.
 * `loadAuthoredFacts` serves the page the other way: a live recipe's authored
 * time and meal, from its static twin. `withAuthoredFactsAll` does the same
 * for the recipe lists the API routes and the page's recommendations serve.
 * `loadStaticTwinBridge` serves /discover: a live id's static twin, and the
 * canonical id of each static recipe it links to.
 */
import { getServerRecipes } from "@/actions/recipes";
import { _logger } from "@/lib/logger";
import {
  buildAuthoredLookup,
  NOT_AUTHORED,
  withAuthoredFacts,
  type AuthoredFacts,
  type AuthoredLookup,
} from "@/lib/search/authoredFacts";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import type { Recipe } from "@/types/recipe";
import { toPublicRecipe } from "./catalogQuery";
import {
  buildRecipeIdentityIndex,
  toIdentity,
  type RecipeIdentityIndex,
  type RecipeIdentityRecord,
} from "./recipeIdentity";
import { loadIdentities, servedStaticOnlyIds } from "./unpublishedCopies";

export type ResolvedRecipeRef =
  | { kind: "twin"; recipe: Recipe; canonicalId: string }
  | { kind: "static-only"; recipe: Recipe; canonicalId: string };

function toIdentities(recipes: readonly Recipe[]): RecipeIdentityRecord[] {
  return recipes.flatMap((r) => {
    const identity = toIdentity(r);
    return identity ? [identity] : [];
  });
}

function byId(recipes: readonly Recipe[]): Map<string, Recipe> {
  const map = new Map<string, Recipe>();
  for (const recipe of recipes) {
    const id = String(recipe.id);
    if (!map.has(id)) map.set(id, recipe);
  }
  return map;
}

interface ResolverMemo {
  staticRecipes: readonly Recipe[];
  liveRecipes: readonly Recipe[];
  index: RecipeIdentityIndex;
  staticById: Map<string, Recipe>;
  liveById: Map<string, Recipe>;
  /** Each live id's static twin; the first twin wins, as in buildAuthoredLookup. */
  staticIdByLiveId: Map<string, string>;
}

let memo: ResolverMemo | null = null;

function staticIdsByLiveId(staticRecipes: readonly Recipe[], index: RecipeIdentityIndex): Map<string, string> {
  const map = new Map<string, string>();
  for (const recipe of staticRecipes) {
    const hit = index.resolve(String(recipe.id));
    if (hit?.kind === "twin" && !map.has(hit.liveId)) map.set(hit.liveId, hit.staticId);
  }
  return map;
}

/** Rebuilt only when either catalog array is replaced (catalog TTL refresh). */
function resolverFor(staticRecipes: readonly Recipe[], liveRecipes: readonly Recipe[]): ResolverMemo {
  if (memo?.staticRecipes === staticRecipes && memo.liveRecipes === liveRecipes) return memo;
  const index = buildRecipeIdentityIndex(toIdentities(staticRecipes), toIdentities(liveRecipes));
  memo = {
    staticRecipes,
    liveRecipes,
    index,
    staticById: byId(staticRecipes),
    liveById: byId(liveRecipes),
    staticIdByLiveId: staticIdsByLiveId(staticRecipes, index),
  };
  return memo;
}

function safeDecode(ref: string): string {
  try {
    return decodeURIComponent(ref);
  } catch {
    return ref;
  }
}

/**
 * True when the "live" catalog is the static list: LocalRecipeService's
 * fallback returns the cached static array itself, and getServerRecipes hands
 * every caller that one array. Identity is race-free; isCatalogDegraded() is
 * not, because it is one shared flag that any later load resets, so after an
 * await it can describe another request's list.
 */
export function servesStaticFallback(
  liveRecipes: readonly Recipe[],
  staticRecipes: readonly Recipe[],
): boolean {
  return liveRecipes === staticRecipes;
}

/**
 * Bridge a non-live recipe id to something `/recipes/[recipeId]` can render.
 * Returns null for unknown ids, and while the live catalog is degraded (DB
 * unreachable): then the "live" list IS the static list, and pointing a
 * canonical at a static id would be wrong once the DB recovers.
 */
export async function resolveRecipeRef(ref: string): Promise<ResolvedRecipeRef | null> {
  const [staticRecipes, liveRecipes] = await Promise.all([
    getServerRecipes(),
    LocalRecipeService.getAllRecipes(),
  ]);
  if (servesStaticFallback(liveRecipes, staticRecipes)) return null;
  const resolver = resolverFor(staticRecipes, liveRecipes);
  const hit = resolver.index.resolve(safeDecode(ref));
  if (!hit) return null;
  if (hit.kind === "twin") {
    const recipe = resolver.liveById.get(hit.liveId);
    return recipe ? { kind: "twin", recipe, canonicalId: hit.liveId } : null;
  }
  const recipe = resolver.staticById.get(hit.staticId);
  return recipe ? { kind: "static-only", recipe, canonicalId: hit.staticId } : null;
}

/**
 * For routes that compute over the static catalog (it carries the ESMS and
 * Monica scores the live rows lack) but serve pages keyed by live ids.
 */
export interface StaticTwinBridge {
  staticRecipes: readonly Recipe[];
  /** The static recipe a page id stands for: a static id or index alias, or a live id's twin. */
  staticRecipeFor(ref: string): Recipe | null;
  /** The id a link to a static recipe should use: its live twin's, else its own. */
  canonicalIdOf(staticId: string): string;
}

const NO_LIVE_RECIPES: readonly Recipe[] = [];

/**
 * While the live catalog is degraded its list IS the static list, so the
 * bridge pairs nothing and every id stays static (as resolveRecipeRef does).
 */
export async function loadStaticTwinBridge(): Promise<StaticTwinBridge> {
  const [staticRecipes, liveRecipes] = await Promise.all([getServerRecipes(), LocalRecipeService.getAllRecipes()]);
  const live = servesStaticFallback(liveRecipes, staticRecipes) ? NO_LIVE_RECIPES : liveRecipes;
  const { index, staticById, staticIdByLiveId } = resolverFor(staticRecipes, live);
  return {
    staticRecipes,
    staticRecipeFor: (ref): Recipe | null => {
      const id = safeDecode(ref);
      const staticId = staticIdByLiveId.get(id) ?? index.resolve(id)?.staticId;
      return staticId === undefined ? null : (staticById.get(staticId) ?? null);
    },
    canonicalIdOf: (staticId): string => {
      const hit = index.resolve(staticId);
      return hit?.kind === "twin" ? hit.liveId : staticId;
    },
  };
}

interface AuthoredMemo {
  staticRecipes: readonly Recipe[];
  liveRecipes: readonly Recipe[];
  lookup: AuthoredLookup;
}

let authoredMemo: AuthoredMemo | null = null;

const nothingAuthored: AuthoredLookup = () => NOT_AUTHORED;

/**
 * The authored-facts lookup over the current catalogs, rebuilt only when
 * either catalog array is replaced. Non-essential, like a page's other
 * enrichment: a failure yields a lookup that finds nothing, so recipes show
 * no time and no meal, never the placeholders.
 */
export async function loadAuthoredLookup(): Promise<AuthoredLookup> {
  try {
    const [staticRecipes, liveRecipes] = await Promise.all([getServerRecipes(), LocalRecipeService.getAllRecipes()]);
    if (authoredMemo?.staticRecipes !== staticRecipes || authoredMemo.liveRecipes !== liveRecipes) {
      authoredMemo = { staticRecipes, liveRecipes, lookup: buildAuthoredLookup(staticRecipes, liveRecipes) };
    }
    return authoredMemo.lookup;
  } catch (err) {
    _logger.error("[recipeRefResolver] authored facts unavailable:", err);
    return nothingAuthored;
  }
}

/**
 * The authored times and meal of the recipe a page renders, read from its
 * static twin (the live catalog's own are placeholders; see authoredFacts).
 */
export async function loadAuthoredFacts(recipe: Recipe): Promise<AuthoredFacts> {
  return (await loadAuthoredLookup())(recipe);
}

/**
 * Recipes as the UI shows them: each with its authored times and meal, or
 * none. Apply it where recipes leave for display, after any scoring, so the
 * recommenders keep reading the fields they have always read.
 */
export async function withAuthoredFactsAll(recipes: readonly Recipe[]): Promise<Recipe[]> {
  const lookup = await loadAuthoredLookup();
  return recipes.map((recipe) => withAuthoredFacts(recipe, lookup(recipe)));
}

/**
 * One canonical id per recipe: every live UUID, plus the static ids that have
 * no live twin and are not the copy of an unpublished recipe (see
 * ./unpublishedCopies). Falls back to the static ids alone when the database is
 * unreachable — those still resolve, through resolveRecipeRef, at render time.
 */
export async function listCanonicalRecipeIds(): Promise<string[]> {
  const staticIdentities = toIdentities(await getServerRecipes());
  const staticIds = [...new Set(staticIdentities.map((r) => r.id))];
  let live: RecipeIdentityRecord[];
  try {
    live = await loadIdentities("public");
  } catch (err) {
    _logger.error("[recipeRefResolver] live identities unavailable; sitemap falls back to static ids:", err);
    return staticIds;
  }
  if (live.length === 0) return staticIds;
  const index = buildRecipeIdentityIndex(staticIdentities, live);
  const staticOnly = await servedStaticOnlyIds(index.staticOnlyIds, staticIdentities);
  return [...new Set([...live.map((r) => r.id), ...staticOnly])];
}

/**
 * Every recipe the site serves, once: each live recipe plus the static
 * recipes with no live twin. This is `listCanonicalRecipeIds` as full recipes,
 * so the catalog list and the sitemap cannot disagree about what "every
 * recipe" is, and a static-only recipe (the Fusion dishes, say) is listed
 * even when the database holds none of its cuisine. A static copy of a recipe
 * the operator unpublished is not listed, here or in the sitemap. While the
 * live catalog is degraded its list IS the static list, so nothing is paired
 * with itself.
 * Internal archive codes are removed from every cuisine.
 */
export async function loadCanonicalCatalog(): Promise<Recipe[]> {
  const [staticRecipes, liveRecipes] = await Promise.all([getServerRecipes(), LocalRecipeService.getAllRecipes()]);
  if (liveRecipes.length === 0 || servesStaticFallback(liveRecipes, staticRecipes)) {
    return staticRecipes.map(toPublicRecipe);
  }
  const { index, staticById } = resolverFor(staticRecipes, liveRecipes);
  const servedIds = await servedStaticOnlyIds(index.staticOnlyIds, toIdentities(staticRecipes));
  const staticOnly = servedIds.flatMap((id) => {
    const recipe = staticById.get(id);
    return recipe ? [recipe] : [];
  });
  return [...liveRecipes, ...staticOnly].map(toPublicRecipe);
}
