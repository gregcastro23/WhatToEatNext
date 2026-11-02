/**
 * Which bundled (static) recipes the site serves, and which it must not.
 *
 * A recipe set `is_public = false` (scripts/depublishFabricatedRecipes.ts) is
 * "removed from every user-facing surface", but its bundled copy has no live
 * twin, so the identity index calls it static-only and every surface that
 * reads the bundled catalog served it. [MEASURED 2026-11-02] 8 of the 14
 * unpublished rows have such a copy, and Haemul Pajeon, whose every ingredient
 * is a stub, ranked first on a default chart.
 *
 * The rule: a bundled recipe is hidden when it has no public live twin and
 * does have an unpublished one. A copy with a public twin is never hidden: the
 * live row serves it, and it supplies that row's authored times and its legacy
 * URL. A bundled recipe the database has never held is never hidden.
 *
 * `readPublication` is the one read of the recipes table every consumer shares.
 * `hiddenStaticIds` feeds `getServerRecipes`, so every reader of the bundled
 * catalog gets the rule; `servedStaticOnlyIds` and `dropUnpublishedTwins` are
 * the catalog list's and the sitemap's own guard.
 *
 * @file src/lib/recipes/unpublishedCopies.ts
 */
import { executeQuery } from "@/lib/database";
import { databaseConfig } from "@/lib/database/config";
import { _logger } from "@/lib/logger";
import { CATALOG_TTL_MS } from "./catalogTtl";
import { buildRecipeIdentityIndex, toIdentity, type RecipeIdentityRecord } from "./recipeIdentity";

/**
 * The recipes table, split the way the live catalog splits it. `published` is
 * exactly the rows LocalRecipeService reads (`is_public = true`); `unpublished`
 * is every other row, a NULL flag included.
 */
export interface RecipePublication {
  published: readonly RecipeIdentityRecord[];
  unpublished: readonly RecipeIdentityRecord[];
}

/**
 * Recipe identities straight from Postgres, mirroring LocalRecipeService's
 * read_model-first mapping. The sitemap reads this instead of
 * LocalRecipeService.getAllRecipes(): that path can issue Upstash no-store
 * fetches, which bail the sitemap out of static rendering.
 */
async function loadPublication(): Promise<RecipePublication> {
  const result = await executeQuery<{ id: string; name: string | null; cuisine: string | null; published: boolean }>(
    `SELECT COALESCE(r.read_model->>'id', r.id::text) AS id,
            COALESCE(r.read_model->>'name', r.name) AS name,
            COALESCE(r.read_model->>'cuisine', r.cuisine::text) AS cuisine,
            (r.is_public IS TRUE) AS published
       FROM recipes r`,
  );
  const published: RecipeIdentityRecord[] = [];
  const unpublished: RecipeIdentityRecord[] = [];
  for (const row of result.rows) {
    const identity = toIdentity(row);
    if (identity) (row.published === true ? published : unpublished).push(identity);
  }
  return { published, unpublished };
}

let known: { at: number; value: RecipePublication } | null = null;
let loading: Promise<RecipePublication> | null = null;
let failure: { at: number; error: unknown } | null = null;

async function refresh(): Promise<RecipePublication> {
  try {
    const value = await loadPublication();
    known = { at: Date.now(), value };
    failure = null;
    return value;
  } catch (error) {
    failure = { at: Date.now(), error };
    _logger.error(
      known
        ? "[recipes] cannot read which recipes are unpublished; using the set last read:"
        : "[recipes] cannot read which recipes are unpublished; no set has been read:",
      error,
    );
    if (!known) throw error;
    return known.value;
  }
}

/**
 * Which recipes the database holds, published and not. Read once per live
 * catalog refresh (CATALOG_TTL_MS) and shared by concurrent callers. After a
 * failed read, no new read is made for one connection timeout, and the set
 * last read is served, however old; only a process that has never read one
 * rejects.
 */
export function readPublication(): Promise<RecipePublication> {
  const now = Date.now();
  if (known && now - known.at < CATALOG_TTL_MS) return Promise.resolve(known.value);
  if (loading) return loading;
  if (failure && now - failure.at < databaseConfig.connectionTimeout) {
    return known ? Promise.resolve(known.value) : Promise.reject(failure.error);
  }
  const load = refresh().finally(() => {
    if (loading === load) loading = null;
  });
  loading = load;
  return load;
}

/** The static-only ids that are not the copy of an unpublished recipe. Pure. */
export function dropUnpublishedTwins(
  staticOnlyIds: readonly string[],
  staticIdentities: readonly RecipeIdentityRecord[],
  unpublished: readonly RecipeIdentityRecord[],
): string[] {
  if (unpublished.length === 0) return [...staticOnlyIds];
  const index = buildRecipeIdentityIndex(staticIdentities, unpublished);
  return staticOnlyIds.filter((id) => index.resolve(id)?.kind !== "twin");
}

/**
 * The bundled recipes to hide: no public live twin, an unpublished one. Pure.
 * Each unpublished row is claimed by at most one bundled recipe, so this never
 * hides more recipes than there are unpublished rows.
 */
export function hiddenStaticIds(
  staticIdentities: readonly RecipeIdentityRecord[],
  { published, unpublished }: RecipePublication,
): ReadonlySet<string> {
  if (unpublished.length === 0) return new Set();
  const staticOnly = buildRecipeIdentityIndex(staticIdentities, published).staticOnlyIds;
  const shown = new Set(dropUnpublishedTwins(staticOnly, staticIdentities, unpublished));
  return new Set(staticOnly.filter((id) => !shown.has(id)));
}

const servedFor = new WeakMap<readonly string[], { publication: RecipePublication; ids: readonly string[] }>();

/**
 * The static-only ids the catalog list serves. Lists none when the database
 * has never been able to say which recipes are unpublished: better a gap until
 * the next read than a hollow recipe ranked first.
 */
export async function servedStaticOnlyIds(
  staticOnlyIds: readonly string[],
  staticIdentities: readonly RecipeIdentityRecord[],
): Promise<readonly string[]> {
  try {
    const publication = await readPublication();
    const memo = servedFor.get(staticOnlyIds);
    if (memo?.publication === publication) return memo.ids;
    const ids = dropUnpublishedTwins(staticOnlyIds, staticIdentities, publication.unpublished);
    servedFor.set(staticOnlyIds, { publication, ids });
    return ids;
  } catch {
    return [];
  }
}
