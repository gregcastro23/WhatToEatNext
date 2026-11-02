/**
 * Which static-only recipes the site lists, and which it must not.
 *
 * A recipe set `is_public = false` (scripts/depublishFabricatedRecipes.ts)
 * leaves the live catalog, so its static copy has no live twin and the
 * identity index calls it static-only: canonical, and listed. Listing it
 * serves what was just taken down. [MEASURED 2026-11-02] 8 of the 14
 * unpublished rows have such a copy, and Haemul Pajeon, whose every
 * ingredient is a stub, ranked first on a default chart.
 *
 * `dropUnpublishedTwins` is the rule: drop the static-only ids whose twin is
 * an unpublished row. The catalog list and the sitemap both apply it, so under
 * healthy reads they list the same recipes; they differ only in what each
 * does when the unpublished rows cannot be read. A static recipe the database
 * has never held stays listed: only an unpublished row hides one.
 *
 * Scope: this governs the lists. A hidden copy still opens by its URL and is
 * still offered by /discover, as on `master` (resolveRecipeRef and
 * loadStaticTwinBridge read the identity index, not these lists).
 *
 * @file src/lib/recipes/unpublishedCopies.ts
 */
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { buildRecipeIdentityIndex, toIdentity, type RecipeIdentityRecord } from "./recipeIdentity";

/**
 * The two halves of the recipes table the live catalog splits: its own rows
 * (`public`), and every row it excludes (`unpublished`, which includes a NULL
 * flag, because the live read is `= true`).
 */
type Publication = "public" | "unpublished";

const PUBLICATION_PREDICATE: Record<Publication, string> = {
  public: "r.is_public = true",
  unpublished: "r.is_public IS NOT TRUE",
};

/**
 * Recipe identities straight from Postgres, mirroring LocalRecipeService's
 * read_model-first mapping. The sitemap reads this instead of
 * LocalRecipeService.getAllRecipes(): that path can issue Upstash no-store
 * fetches, which bail the sitemap out of static rendering.
 */
export async function loadIdentities(publication: Publication): Promise<RecipeIdentityRecord[]> {
  const result = await executeQuery<{ id: string; name: string | null; cuisine: string | null }>(
    `SELECT COALESCE(r.read_model->>'id', r.id::text) AS id,
            COALESCE(r.read_model->>'name', r.name) AS name,
            COALESCE(r.read_model->>'cuisine', r.cuisine::text) AS cuisine
       FROM recipes r
      WHERE ${PUBLICATION_PREDICATE[publication]}`,
  );
  return result.rows.flatMap((row) => {
    const identity = toIdentity(row);
    return identity ? [identity] : [];
  });
}

/** The unpublished rows as last read in this process: the answer to fall back on when a read fails. */
let lastKnownUnpublished: readonly RecipeIdentityRecord[] | null = null;

/** The unpublished rows now. Throws when they cannot be read; remembers what it read. */
export async function loadUnpublishedIdentities(): Promise<readonly RecipeIdentityRecord[]> {
  const unpublished = await loadIdentities("unpublished");
  lastKnownUnpublished = unpublished;
  return unpublished;
}

/** The static-only ids that are not the copy of an unpublished row. Pure. */
export function dropUnpublishedTwins(
  staticOnlyIds: readonly string[],
  staticIdentities: readonly RecipeIdentityRecord[],
  unpublished: readonly RecipeIdentityRecord[],
): string[] {
  if (unpublished.length === 0) return [...staticOnlyIds];
  const index = buildRecipeIdentityIndex(staticIdentities, unpublished);
  return staticOnlyIds.filter((id) => index.resolve(id)?.kind !== "twin");
}

async function servedWithoutUnpublished(
  staticOnlyIds: readonly string[],
  staticIdentities: readonly RecipeIdentityRecord[],
): Promise<readonly string[]> {
  try {
    return dropUnpublishedTwins(staticOnlyIds, staticIdentities, await loadUnpublishedIdentities());
  } catch (err) {
    if (lastKnownUnpublished) {
      _logger.error("[recipes] unpublished recipes unreadable; using the set last read:", err);
      return dropUnpublishedTwins(staticOnlyIds, staticIdentities, lastKnownUnpublished);
    }
    // Never read in this process, so which static recipes were taken down is
    // unknown: list none of them until the next catalog refresh.
    _logger.error("[recipes] unpublished recipes unreadable; listing no static-only recipe:", err);
    return [];
  }
}

/** One answer per catalog refresh: `staticOnlyIds` is rebuilt whenever either catalog array is. */
const served = new WeakMap<readonly string[], Promise<readonly string[]>>();

/**
 * The static-only ids the catalog list serves. Asks the database once per
 * catalog refresh; if it cannot, uses the unpublished set this process last
 * read, and only a process that has never read it lists no static-only recipe.
 */
export function servedStaticOnlyIds(
  staticOnlyIds: readonly string[],
  staticIdentities: readonly RecipeIdentityRecord[],
): Promise<readonly string[]> {
  const known = served.get(staticOnlyIds);
  if (known) return known;
  const answer = servedWithoutUnpublished(staticOnlyIds, staticIdentities);
  served.set(staticOnlyIds, answer);
  return answer;
}
