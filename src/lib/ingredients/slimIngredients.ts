import "server-only";

import { allIngredients } from "@/data/ingredients";
import type { Ingredient } from "@/types";

/**
 * Slim projection of the ingredient catalog for the `/ingredients` page.
 *
 * The full `allIngredients` collection is ~2.6 MB of serialized data (1021
 * ingredients × heavy alchemical / astrological / nutritional / lunar fields).
 * The discovery page only reads a small slice of that — list search/filter,
 * the Amazon Fresh mapping, and `getCulinaryDetails()` for expanded cards.
 *
 * Importing the full catalog into the `"use client"` page shipped the entire
 * 2.6 MB to the browser (and baked it into the static prerender). This module
 * is `server-only`, so it stays out of the client bundle; the server component
 * passes the slim array (~1.1 MB, ~43% of full) to the client island as props
 * instead. Everything dropped here (lunarPhaseModifiers, nutritional / sensory
 * / astrological profiles, storage, etc.) is unused by the page.
 *
 * Keep this field list in sync with the reads in
 * `src/app/ingredients/IngredientsExplorer.tsx` — adding a new field access
 * there means adding it here. NOTE: that file reads several fields through type
 * casts (`(ingredient as {...}).image_url`, `getCulinaryDetails`'s `root.*`),
 * which a plain `ingredient.field` grep misses — audit casts too.
 */
const SLIM_FIELDS = [
  // list / search / card render + Amazon Fresh mapping
  "id",
  "name",
  "category",
  "description",
  "elementalProperties",
  "seasonality",
  // card hero image — read via cast in IngredientsExplorer (image_url/imageUrl)
  "image_url",
  "imageUrl",
  // getCulinaryDetails() — only read when a card is expanded
  "culinaryProfile",
  "culinaryApplications",
  "flavorProfile",
  "culinaryUses",
  "uses",
  "cookingMethods",
  "cuisineAffinity",
  "pairings",
  "pairingRecommendations",
  "affinities",
  "preparationTips",
  "notes",
] as const;

let cachedSlim: Ingredient[] | null = null;

/**
 * Returns the catalog projected down to {@link SLIM_FIELDS}. Typed as
 * `Ingredient[]` (the slim objects are a structural subset) so the client
 * island can keep using the `Ingredient` type unchanged — it only ever reads
 * the fields preserved above.
 *
 * Memoized: the 1021-item projection runs once per server process and is reused
 * across renders, so the cost stays pinned even if `/ingredients` later opts
 * into dynamic rendering (where the page would otherwise re-project per request).
 */
export function getSlimIngredients(): Ingredient[] {
  if (cachedSlim) return cachedSlim;
  cachedSlim = Object.values(allIngredients).map((ing) => {
    const src = ing as unknown as Record<string, unknown>;
    const slim: Record<string, unknown> = {};
    for (const field of SLIM_FIELDS) {
      const value = src[field];
      if (value !== undefined) slim[field] = value;
    }
    return slim as unknown as Ingredient;
  });
  return cachedSlim;
}
