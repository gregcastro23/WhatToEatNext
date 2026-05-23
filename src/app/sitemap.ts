import type { MetadataRoute } from "next";

// The sitemap enumerates recipes from the local server payload (no Redis,
// no DB). Going through LocalRecipeService would hit a no-store Upstash
// fetch, which forces Next.js to bail out of static rendering and logs a
// [Redis] GET failed / Dynamic server usage error during `next build`.
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
  { path: "/quantities", changeFrequency: "daily", priority: 0.8 },
  { path: "/cosmic-recipe", changeFrequency: "daily", priority: 0.7 },
  { path: "/commensal", changeFrequency: "weekly", priority: 0.7 },
  { path: "/pantry", changeFrequency: "weekly", priority: 0.7 },
  { path: "/food-tracking", changeFrequency: "weekly", priority: 0.7 },
  { path: "/sauces", changeFrequency: "weekly", priority: 0.7 },
  { path: "/restaurants", changeFrequency: "weekly", priority: 0.65 },
  { path: "/premium", changeFrequency: "monthly", priority: 0.6 },
  { path: "/upgrade", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

async function getRecipeEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const { getServerRecipes } = await import("@/actions/recipes");
    const recipes = await getServerRecipes();
    return recipes
      .map((recipe) => (recipe?.id ? String(recipe.id) : ""))
      .filter(Boolean)
      .map((id) => ({
        url: `${BASE_URL}/recipes/${id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (err) {
    // Sitemap generation should never crash the build/route — log and continue.
    console.warn("[sitemap] Failed to enumerate recipes:", err);
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
