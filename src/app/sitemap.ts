import type { MetadataRoute } from "next";
import { createLogger } from "@/utils/logger";

const logger = createLogger("sitemap");

// Recipe URLs are canonical ids (live UUIDs, plus static ids with no live
// twin) from listCanonicalRecipeIds, which reads Postgres directly — not
// LocalRecipeService, whose no-store Upstash fetches would bail the sitemap
// out of static rendering during `next build`. Listing static-catalog slugs
// here used to point every crawler at a redirect behind a not-found head.
export const revalidate = 3600; // regenerate sitemap at most hourly

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alchm.kitchen";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "hourly", priority: 1 },
  { path: "/menu-planner", changeFrequency: "daily", priority: 0.9 },
  { path: "/recipe-builder", changeFrequency: "daily", priority: 0.9 },
  { path: "/recipes", changeFrequency: "daily", priority: 0.85 },
  { path: "/cuisines", changeFrequency: "weekly", priority: 0.85 },
  { path: "/cooking-methods", changeFrequency: "weekly", priority: 0.8 },
  { path: "/celestial-lab/alchm", changeFrequency: "daily", priority: 0.8 },
  // The two labs and their public leaves. The standing chart and current chart
  // are deliberately ABSENT: both are auth-gated, so listing them would point
  // crawlers at a login redirect.
  { path: "/kitchen-lab", changeFrequency: "weekly", priority: 0.8 },
  { path: "/kitchen-lab/physics", changeFrequency: "weekly", priority: 0.75 },
  { path: "/kitchen-lab/alchm", changeFrequency: "daily", priority: 0.7 },
  { path: "/celestial-lab", changeFrequency: "weekly", priority: 0.8 },
  { path: "/celestial-lab/mechanics", changeFrequency: "hourly", priority: 0.8 },
  { path: "/cosmic-recipe", changeFrequency: "daily", priority: 0.7 },
  { path: "/commensal", changeFrequency: "weekly", priority: 0.7 },
  { path: "/pantry", changeFrequency: "weekly", priority: 0.7 },
  { path: "/food-tracking", changeFrequency: "weekly", priority: 0.7 },
  { path: "/sauces", changeFrequency: "weekly", priority: 0.7 },
  { path: "/restaurants", changeFrequency: "weekly", priority: 0.65 },
  { path: "/vault", changeFrequency: "monthly", priority: 0.6 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const recipeEntries = await getRecipeEntries(now);

  return [...staticEntries, ...recipeEntries];
}
