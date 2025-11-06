import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";
import { dairy } from "./dairy";
import { eggs } from "./eggs";
import { legumes } from "./legumes";
import { _meats } from "./meat";
import { plantBased } from "./plantBased";
import { poultry } from "./poultry";
import { seafood } from "./seafood";

// Combine all protein categories and ensure type safety
export const _proteins: Record<string, IngredientMapping> =
  fixIngredientMappings({
    ...seafood,
    ...poultry,
    ...plantBased,
    ..._meats,
    ...legumes,
    ...eggs,
    ...dairy,
  });

// Export individual categories
export { seafood, poultry, plantBased, _meats as meats, legumes, eggs, dairy };

// Types
export type ProteinCategory =
  | "meat"
  | "seafood"
  | "poultry"
  | "egg"
  | "legume"
  | "dairy"
  | "plant_based";

export type CookingMethod =
  | "grill"
  | "roast"
  | "braise"
  | "fry"
  | "poach"
  | "steam"
  | "raw"
  | "cure"
  | "smoke";

export type ProteinCut =
  | "whole"
  | "fillet"
  | "ground"
  | "diced"
  | "sliced"
  | "portioned";

export type Doneness =
  | "rare"
  | "medium_rare"
  | "medium"
  | "medium_well"
  | "well_done";

// Helper functions
export const _getProteinsByCategory = (
  category: ProteinCategory,
): IngredientMapping =>
  Object.entries(_proteins)
    .filter(([_, value]) => value.category === category)
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as IngredientMapping,
    );

export const _getProteinsByCookingMethod = (
  _method: string,
): IngredientMapping =>
  Object.entries(_proteins)
    .filter(
      ([_, value]) =>
        Array.isArray(value.cookingMethods) &&
        value.cookingMethods.includes(_method),
    )
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as IngredientMapping,
    );

export const _getProteinsByNutrition = (
  minProtein = 0,
  maxFat?: number,
): IngredientMapping =>
  Object.entries(_proteins)
    .filter(([_, value]) => {
      const meetsProtein =
        (value.nutritionalContent as { protein?: number }).protein ??
        minProtein <= 0;
      const meetsFat = maxFat
        ? ((value.nutritionalContent as { fat?: number }).fat ?? 0) <= maxFat
        : true;
      return meetsProtein && meetsFat;
    })
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as IngredientMapping,
    );

export const _getProteinsBySeasonality = (season: string): IngredientMapping =>
  Object.entries(_proteins)
    .filter(
      ([_, value]) =>
        Array.isArray(value.season) && value.season.includes(season),
    )
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as IngredientMapping,
    );

export const _getProteinsBySustainability = (
  minScore: number,
): IngredientMapping =>
  Object.entries(_proteins)
    .filter(
      ([_, value]) =>
        Number(value.sustainabilityScore ?? 0) >= Number(minScore),
    )
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as IngredientMapping,
    );

export const _getProteinsByRegionalCuisine = (
  region: string,
): IngredientMapping =>
  Object.entries(_proteins)
    .filter(
      ([_, value]) =>
        Array.isArray(value.regionalOrigins) &&
        value.regionalOrigins.includes(region),
    )
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as IngredientMapping,
    );

export const _getCompatibleProteins = (_proteinName: string): string[] => {
  const protein = _proteins[_proteinName];
  if (!protein) return [];

  return Object.entries(_proteins)
    .filter(
      ([key, value]) =>
        key !== _proteinName &&
        value.category === protein.category &&
        value.cookingMethods?.some((method) =>
          protein.cookingMethods?.includes(method),
        ),
    )
    .map(([key]) => key);
};
