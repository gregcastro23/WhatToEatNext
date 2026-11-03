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
 * does have an unpublished one. "Twin" is the identity index's: the recipe's
 * name (accent-folded as a fallback), with cuisine only breaking a tie, so
 * one unpublished row can hide every spelling of its name. A copy with a
 * public twin is never hidden: the live row serves it, and it supplies that
 * row's authored times and its legacy URL. A bundled recipe whose name no
 * unpublished row carries is never hidden.
 *
 * `publicationNow` and `readPublication` are the one read of the recipes table every
 * consumer shares; the first never waits on it, the second waits only for the first read.
 * `hiddenStaticIds` feeds `getServerRecipes`, so every reader of the bundled
 * catalog gets the rule; `withoutHiddenRecipes` applies it to lists derived
 * from the bundled catalog; `servedStaticOnlyIds` and `dropUnpublishedTwins`
 * are the catalog list's and the sitemap's own guard.
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
/** The last read begun: when it began, and why it failed if it did. */
let attempt: { at: number; error?: unknown } | null = null;

/**
 * Whether `span` has not yet passed since `since`. A clock stepped backwards
 * makes the age negative, which counts as passed: the answer is then read
 * again, never trusted until the clock catches up.
 */
function within(since: number, now: number, span: number): boolean {
  return now >= since && now - since < span;
}

async function refresh(startedAt: number): Promise<RecipePublication> {
  try {
    const value = await loadPublication();
    known = { at: Date.now(), value };
    attempt = { at: startedAt };
    return value;
  } catch (error) {
    attempt = { at: startedAt, error };
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
 * Begin a read when the set last read is older than CATALOG_TTL_MS (or there is
 * none), unless one is under way or the last began less than a connection
 * timeout ago: one read at a time, and a database that is down is asked about
 * once per timeout, not once per caller. Never waits.
 */
function ensureFresh(): void {
  const now = Date.now();
  if (loading) return;
  if (known && within(known.at, now, CATALOG_TTL_MS)) return;
  if (attempt && within(attempt.at, now, databaseConfig.connectionTimeout)) return;
  const load = refresh(now).finally(() => {
    if (loading === load) loading = null;
  });
  // Callers that wait have their own handle on `load`; this one is for the read nobody waits for.
  load.catch(() => undefined);
  loading = load;
}

/**
 * The set of unpublished recipes last read, however old, or null before the
 * first read. It never waits: it starts a read when one is due and answers
 * from what is known, so that no caller is slowed by a database that is slow
 * or down. A set older than CATALOG_TTL_MS is served until the read behind it
 * lands, which is one request.
 */
export function publicationNow(): RecipePublication | null {
  ensureFresh();
  return known ? known.value : null;
}

/**
 * Which recipes the database holds, published and not, for a caller that cannot
 * answer without it: the first read in a process is waited for, and rejects if
 * it fails (and while the next attempt is held back). Once a set is known this
 * is `publicationNow` and does not wait.
 */
export function readPublication(): Promise<RecipePublication> {
  ensureFresh();
  if (known) return Promise.resolve(known.value);
  if (loading) return loading;
  return Promise.reject(attempt?.error ?? new Error("the recipes table has not been read"));
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

/** The bundled recipes to hide: no public live twin, an unpublished one. Pure. */
export function hiddenStaticIds(
  staticIdentities: readonly RecipeIdentityRecord[],
  { published, unpublished }: RecipePublication,
): ReadonlySet<string> {
  if (unpublished.length === 0) return new Set();
  const staticOnly = buildRecipeIdentityIndex(staticIdentities, published).staticOnlyIds;
  const shown = new Set(dropUnpublishedTwins(staticOnly, staticIdentities, unpublished));
  return new Set(staticOnly.filter((id) => !shown.has(id)));
}

/**
 * Whether there is a database to ask. Without one (a preview, a test) nothing
 * can be unpublished, so nothing is asked and nothing is hidden.
 */
export function databaseIsConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL ?? process.env.DATABASE_PUBLIC_URL);
}

/**
 * The entries of a list derived from the bundled catalog (the ingredient →
 * recipe index) minus those of a hidden recipe. Fails open, as
 * `getServerRecipes` does: a list is not worth an error.
 */
export async function withoutHiddenRecipes<T extends { recipeId: string; recipeName: string; cuisine: string }>(
  entries: readonly T[],
): Promise<T[]> {
  if (!databaseIsConfigured()) return [...entries];
  try {
    const identities = entries.map((e) => ({ id: e.recipeId, name: e.recipeName, cuisine: e.cuisine }));
    const hidden = hiddenStaticIds(identities, await readPublication());
    return hidden.size === 0 ? [...entries] : entries.filter((e) => !hidden.has(e.recipeId));
  } catch {
    return [...entries];
  }
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
