/**
 * Pages that decide their own HTTP status (notFound / permanentRedirect) must
 * have no loading.tsx at or above their segment.
 *
 * A loading.tsx wraps its segment and every child in Suspense, so headers
 * flush before the page runs and the decision can only travel in the RSC
 * payload: a 404 becomes a 200 with NEXT_HTTP_ERROR_FALLBACK, a 308 becomes a
 * 200 with NEXT_REDIRECT. The root loading.tsx did exactly that site-wide.
 */
import { existsSync } from "fs";
import path from "path";

const APP_DIR = path.join(__dirname, "..");

const STATUS_DECIDING_SEGMENTS = [
  "recipes/[recipeId]",
  "cuisines/[slug]",
  "cooking-methods/[method]",
  "restaurants/[id]/menu",
];

/** "", "recipes", "recipes/[recipeId]" for "recipes/[recipeId]". */
function segmentAndAncestors(segment: string): string[] {
  const parts = segment.split("/");
  return ["", ...parts.map((_, i) => parts.slice(0, i + 1).join("/"))];
}

describe("HTTP status boundaries", () => {
  it.each(STATUS_DECIDING_SEGMENTS)("%s still exists", (segment) => {
    expect(existsSync(path.join(APP_DIR, segment, "page.tsx"))).toBe(true);
  });

  it.each(STATUS_DECIDING_SEGMENTS)("%s has no loading.tsx at or above it", (segment) => {
    const offenders = segmentAndAncestors(segment)
      .map((dir) => path.join("src/app", dir, "loading.tsx"))
      .filter((rel) => existsSync(path.join(APP_DIR, "..", "..", rel)));
    expect(offenders).toEqual([]);
  });
});
