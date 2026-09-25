import { SITEMAP_STATIC_ROUTES as STATIC_ROUTES } from "@/lib/seo/sitemapRoutes";
import { createLogger } from "@/utils/logger";
import type { MetadataRoute } from "next";

const logger = createLogger("sitemap");

// Recipe URLs are canonical ids (live UUIDs, plus static ids with no live
// twin) from listCanonicalRecipeIds, which reads Postgres directly — not
// LocalRecipeService, whose no-store Upstash fetches would bail the sitemap
// out of static rendering during `next build`. Listing static-catalog slugs
// here used to point every crawler at a redirect behind a not-found head.
export const revalidate = 3600; // regenerate sitemap at most hourly

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alchm.kitchen";

async function getRecipeEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const { listCanonicalRecipeIds } = await import("@/lib/recipes/recipeRefResolver");
    const ids = await listCanonicalRecipeIds();
    return ids
      .filter(Boolean)
      .map((id) => ({
        url: `${BASE_URL}/recipes/${encodeURIComponent(id)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (err) {
    // Sitemap generation should never crash the build/route — log and continue.
    logger.warn("Failed to enumerate recipes", {
      error: err,
    });
    return [];
  }
}

/**
 * One URL per ingredient card, at its canonical slug (omnibar Phase 2.5b).
 * The catalog is static data, so this needs no database.
 */
async function getIngredientEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const { getIngredientCatalog } = await import("@/lib/ingredients/ingredientCatalog");
    const { ingredientHref } = await import("@/lib/ingredients/ingredientSlug");
    return getIngredientCatalog().entries.map(({ slug }) => ({
      url: `${BASE_URL}${ingredientHref(slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch (err) {
    logger.warn("Failed to enumerate ingredients", { error: err });
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [recipeEntries, ingredientEntries] = await Promise.all([getRecipeEntries(now), getIngredientEntries(now)]);

  return [...staticEntries, ...recipeEntries, ...ingredientEntries];
}
