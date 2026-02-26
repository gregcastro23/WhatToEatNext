import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";
import { alliums } from "./alliums";
import { cruciferous } from "./cruciferous";
import { enhancedVegetablesIngredients } from "./enhancedVegetables";
import { leafyGreens } from "./leafyGreens";
import { legumes } from "./legumes";
import { nightshades } from "./nightshades";
import { roots } from "./roots";
import { squash } from "./squash";
import { starchyVegetables } from "./starchy";

// Combine all vegetable categories
// Enhanced vegetables with comprehensive data take precedence
export const vegetables: Record<string, IngredientMapping> =
  fixIngredientMappings({
    ...leafyGreens,
    ...roots,
    ...cruciferous,
    ...nightshades,
    ...alliums,
    ...squash,
    ...starchyVegetables,
    ...legumes,
    ...enhancedVegetablesIngredients, // Add our enhanced vegetables with full data
  });

// Create enhanced vegetables with additional properties
export const _enhancedVegetables = vegetables;

// For standardization - both exports refer to the same object
export const _standardizedVegetables = vegetables;

// Export individual categories
export {
  alliums,
  cruciferous,
  leafyGreens,
  legumes,
  nightshades,
  roots,
  squash,
  starchyVegetables,
};

// Helper functions
export const _getVegetablesBySubCategory = (
  subCategory: string,
): Record<string, IngredientMapping> =>
  Object.entries(vegetables)
    .filter(([_, value]) => value.subCategory === subCategory)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _getSeasonalVegetables = (
  season: string,
): Record<string, IngredientMapping> =>
  Object.entries(vegetables)
    .filter(
      ([_, value]) =>
        Array.isArray(value.season) && value.season.includes(season),
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _getVegetablesByCookingMethod = (
  method: string,
): Record<string, IngredientMapping> =>
  Object.entries(vegetables)
    .filter(
      ([_, value]) =>
        Array.isArray(value.cookingMethods) &&
        value.cookingMethods.includes(method),
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export default roots;
