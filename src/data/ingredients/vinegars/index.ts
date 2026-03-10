import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";
import { _vinegars as consolidatedVinegars } from "./consolidated_vinegars";
import { vinegars as baseVinegars } from "./vinegars";
import { vinegars as seasoningsVinegars } from "../seasonings/vinegars";

// Combine all vinegar sources into one comprehensive collection
export const vinegars: Record<string, IngredientMapping> =
  fixIngredientMappings({
    ...(consolidatedVinegars as any),
    ...baseVinegars,
    ...(seasoningsVinegars as any), // Detailed vinegar data from seasonings folder (36 items)
  });

export default vinegars;

// Export specific vinegar categories
// Don't re-import vinegars - use the one already combined above
export const processedVinegars: Record<string, IngredientMapping> =
  fixIngredientMappings(vinegars);

export const _wineVinegars: Record<string, IngredientMapping> = Object.entries(
  processedVinegars,
)
  .filter(([_, value]) => value.subCategory === "wine")
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _fruitVinegars: Record<string, IngredientMapping> = Object.entries(
  processedVinegars,
)
  .filter(([_, value]) => value.subCategory === "fruit")
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _grainVinegars: Record<string, IngredientMapping> = Object.entries(
  processedVinegars,
)
  .filter(([_, value]) => value.subCategory === "grain")
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export const _specialtyVinegars: Record<string, IngredientMapping> =
  Object.entries(processedVinegars)
    .filter(
      ([_, value]) =>
        value.subCategory === "specialty" ||
        (value.subCategory !== "wine" &&
          value.subCategory !== "fruit" &&
          value.subCategory !== "grain"),
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
