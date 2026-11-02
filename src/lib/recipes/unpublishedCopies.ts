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
 * `servedStaticOnlyIds` drops the static-only ids whose twin is an
 * unpublished row. The catalog list and the sitemap both ask it, so they
 * cannot disagree about which static-only recipes exist. A static recipe the
 * database has never held stays listed: only an unpublished row hides one.
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

async function withoutUnpublishedTwins(
  staticOnlyIds: readonly string[],
  staticIdentities: readonly RecipeIdentityRecord[],
): Promise<string[]> {
  try {
    const unpublished = await loadIdentities("unpublished");
    if (unpublished.length === 0) return [...staticOnlyIds];
    const index = buildRecipeIdentityIndex(staticIdentities, unpublished);
    return staticOnlyIds.filter((id) => index.resolve(id)?.kind !== "twin");
  } catch (err) {
    // Which static recipes were taken down is unknown, so list none of them:
    // a gap until the next catalog refresh beats re-serving a hollow recipe.
    _logger.error("[recipes] unpublished recipes unreadable; listing no static-only recipe:", err);
    return [];
  }
}

/** One answer per catalog refresh: `staticOnlyIds` is rebuilt whenever either catalog array is. */
const served = new WeakMap<readonly string[], Promise<string[]>>();

export function servedStaticOnlyIds(
  staticOnlyIds: readonly string[],
  staticIdentities: readonly RecipeIdentityRecord[],
): Promise<string[]> {
  const known = served.get(staticOnlyIds);
  if (known) return known;
  const answer = withoutUnpublishedTwins(staticOnlyIds, staticIdentities);
  served.set(staticOnlyIds, answer);
  return answer;
}
