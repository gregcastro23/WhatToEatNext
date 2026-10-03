/**
 * The sitemap's static routes, in a module of their own so the canonical test
 * (src/app/__tests__/canonicals.test.ts) walks exactly the list crawlers get:
 * a route added here without a self-canonical fails that test.
 */
import type { MetadataRoute } from "next";

export const SITEMAP_STATIC_ROUTES: ReadonlyArray<{
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
  { path: "/ingredients", changeFrequency: "weekly", priority: 0.7 },
  { path: "/restaurants", changeFrequency: "weekly", priority: 0.65 },
  { path: "/vault", changeFrequency: "monthly", priority: 0.6 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];
