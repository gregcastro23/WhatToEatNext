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
import { executeQuery } from "@/lib/database";
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
import {
  buildRecipeIdentityIndex,
  type RecipeIdentityIndex,
  type RecipeIdentityRecord,
} from "./recipeIdentity";

export type ResolvedRecipeRef =
  | { kind: "twin"; recipe: Recipe; canonicalId: string }
  | { kind: "static-only"; recipe: Recipe; canonicalId: string };

function toIdentity(recipe: {
  id?: unknown;
  name?: unknown;
  cuisine?: unknown;
}): RecipeIdentityRecord | null {
  const { id, name, cuisine } = recipe;
  if ((typeof id !== "string" && typeof id !== "number") || typeof name !== "string") return null;
  return { id: String(id), name, ...(typeof cuisine === "string" ? { cuisine } : {}) };
}

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
  if (LocalRecipeService.isCatalogDegraded()) return null;
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
  const live = LocalRecipeService.isCatalogDegraded() ? NO_LIVE_RECIPES : liveRecipes;
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
 * Live recipe identities straight from Postgres, mirroring
 * LocalRecipeService's read_model-first mapping. The sitemap reads this
 * instead of LocalRecipeService.getAllRecipes(): that path can issue Upstash
 * no-store fetches, which bail the sitemap out of static rendering.
 */
async function loadLiveIdentities(): Promise<RecipeIdentityRecord[]> {
  const result = await executeQuery<{ id: string; name: string | null; cuisine: string | null }>(
    `SELECT COALESCE(r.read_model->>'id', r.id::text) AS id,
            COALESCE(r.read_model->>'name', r.name) AS name,
            COALESCE(r.read_model->>'cuisine', r.cuisine::text) AS cuisine
       FROM recipes r
      WHERE r.is_public = true`,
  );
  return result.rows.flatMap((row) => {
    const identity = toIdentity(row);
    return identity ? [identity] : [];
  });
}

/**
 * One canonical id per recipe: every live UUID, plus the static ids that have
 * no live twin. Falls back to the static ids alone when the database is
 * unreachable — those still resolve, through resolveRecipeRef, at render time.
 */
export async function listCanonicalRecipeIds(): Promise<string[]> {
  const staticIdentities = toIdentities(await getServerRecipes());
  const staticIds = [...new Set(staticIdentities.map((r) => r.id))];
  let live: RecipeIdentityRecord[];
  try {
    live = await loadLiveIdentities();
  } catch (err) {
    _logger.error("[recipeRefResolver] live identities unavailable; sitemap falls back to static ids:", err);
    return staticIds;
  }
  if (live.length === 0) return staticIds;
  const index = buildRecipeIdentityIndex(staticIdentities, live);
  return [...new Set([...live.map((r) => r.id), ...index.staticOnlyIds])];
}
