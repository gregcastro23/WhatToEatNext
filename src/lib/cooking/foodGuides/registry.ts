/**
 * The food guides, validated once. Server-side only: the guides are served by
 * the search and card routes, not bundled into pages.
 */
import { RAW_FOOD_GUIDES } from "@/data/cooking/foodGuides";
import { FoodGuideSchema, type FoodGuide } from "./schema";

let guides: readonly FoodGuide[] | null = null;

export function getFoodGuides(): readonly FoodGuide[] {
  guides ??= RAW_FOOD_GUIDES.map((raw) => FoodGuideSchema.parse(raw));
  return guides;
}

/** Guides whose food is a given ingredient card ("chicken" → three cuts). */
export function guidesForCatalogKey(key: string, all: readonly FoodGuide[] = getFoodGuides()): FoodGuide[] {
  return all.filter((guide) => guide.catalogKeys.includes(key));
}
