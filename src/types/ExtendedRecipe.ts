import { VALID_SEASONS, type Season } from "@/constants/seasons";
import type { ElementalProperties } from "@/types/alchemy";
import { LUNAR_PHASES, type LunarPhase } from "./constants";
import type { Recipe, RecipeIngredient } from "./recipe";

/**
 * 🚀 Phase, 10: ExtendedRecipe Interface - Complete Property Access Support
 *
 * This interface extends the base Recipe with all properties that are accessed
 * across the codebase, preventing TS2339 property access errors.
 */
/**
 * Extended Recipe Ingredient with all accessed properties
 */
export interface ExtendedRecipeIngredient extends RecipeIngredient {
  id?: string;
  preparation?: string;
  optional?: boolean;
  notes?: string;
  function?: string;
  cookingPoint?: string;
  substitutes?: string[];
}
/**
 * Extended Recipe Interface with all accessed properties
 */
export interface ExtendedRecipe extends Recipe {
  // Ensure core properties exist
  id: string;
  tags?: string[];
  notes?: string;
  preparation?: string;
  preparationNotes?: string;
  preparationSteps?: string[];
  procedure?: string | string[];
  prepTime?: string;
  preparation_time?: string;
  prep_time?: string;
  idealTimeOfDay?: string;
  // Enhanced ingredient support
  ingredients: ExtendedRecipeIngredient[];
  // Additional instruction variations
  instructions: string[];
  // Elemental properties with proper casing (Fire, Water, Earth, Air)
  elementalProperties: ElementalProperties;
  // Enhanced properties commonly accessed
  course?: string[];
  dishType?: string[];
  cookingMethod?: string[];
  cookingTechniques?: string[];
  equipmentNeeded?: string[];
  skillsRequired?: string[];
  // Flavor and texture
  flavorProfile?: {
    primary?: string[];
    accent?: string[];
    base?: string[];
    tasteBalance?: {
      sweet: number;
      salty: number;
      sour: number;
      bitter: number;
      umami: number;
    };
  };
  texturalElements?: string[];
  aromatics?: string[];
  colorProfile?: string[];
  origin?: string;
  history?: string;
  traditionalOccasion?: string[];
  regionalVariations?: string[];
  pairingRecommendations?: {
    wines?: string[];
    beverages?: string[];
    sides?: string[];
    condiments?: string[];
  };
  seasonalIngredients?: string[];
  chefNotes?: string[];
  commonMistakes?: string[];
  tips?: string[];
  variations?: string[];
  presentationTips?: string[];
  sensoryIndicators?: {
    visual: string[];
    aroma: string[];
    texture: string[];
    sound: string[];
  };
  keywords?: string[];
  // Allow additional dynamic properties - this ensures compatibility
  [key: string]: unknown;
}
/**
 * Extended Scored Recipe
 */
export interface ExtendedScoredRecipe extends Omit<ExtendedRecipe, never> {
  score: number;
  alchemicalScores?: {
    elementalScore: number;
    zodiacalScore: number;
    lunarScore: number;
    planetaryScore: number;
    seasonalScore: number;
  };
}
/**
 * Type guard to check if a recipe is an ExtendedRecipe
 */
export function isExtendedRecipe(recipe: unknown): recipe is ExtendedRecipe {
  return (
    typeof recipe === "object" &&
    recipe !== null &&
    typeof (recipe as ExtendedRecipe).id === "string" &&
    typeof (recipe as ExtendedRecipe).name === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface RecipeIngredientBoundary extends Record<string, unknown> {
  name: string;
  amount: number;
  unit: string;
}

function isRecipeIngredientBoundary(
  value: unknown,
): value is RecipeIngredientBoundary {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    typeof value.unit === "string"
  );
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readOptionalStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) &&
    value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function readElementalProperties(
  value: unknown,
): RecipeIngredient["elementalProperties"] {
  if (!isRecord(value)) return undefined;
  const readElement = (element: unknown): number | undefined =>
    typeof element === "number" && Number.isFinite(element)
      ? element
      : undefined;
  const Fire = readElement(value.Fire);
  const Water = readElement(value.Water);
  const Earth = readElement(value.Earth);
  const Air = readElement(value.Air);
  if (
    Fire === undefined ||
    Water === undefined ||
    Earth === undefined ||
    Air === undefined
  ) {
    return undefined;
  }

  return { Fire, Water, Earth, Air };
}

function isSeason(value: unknown): value is Season {
  return (
    typeof value === "string" &&
    VALID_SEASONS.some((season) => season === value)
  );
}

function readSeasonality(
  value: unknown,
): RecipeIngredient["seasonality"] {
  if (isSeason(value)) return value;
  return Array.isArray(value) && value.every(isSeason) ? value : undefined;
}

function isLunarPhase(value: unknown): value is LunarPhase {
  return (
    typeof value === "string" &&
    LUNAR_PHASES.some((phase) => phase === value)
  );
}

function readLunarPhases(
  value: unknown,
): RecipeIngredient["lunarPhaseInfluences"] {
  return Array.isArray(value) && value.every(isLunarPhase) ? value : undefined;
}

/**
 * Convert a basic Recipe to ExtendedRecipe
 */
export function toExtendedRecipe(recipe: Recipe): ExtendedRecipe {
  // Keep the boundary defensive even though typed callers normally provide Recipe.
  const runtimeRecipe: unknown = recipe;
  const recipeData = isRecord(runtimeRecipe) ? runtimeRecipe : {};
  const rawId = recipeData.id;
  const recipeId =
    typeof rawId === "string" && rawId.trim().length > 0
      ? rawId
      : `recipe-${Date.now()}`;
  const ingredients = Array.isArray(recipeData.ingredients)
    ? recipeData.ingredients.filter(isRecipeIngredientBoundary)
    : [];

  return {
    ...recipe,
    id: recipeId,
    tags: Array.isArray(recipeData.tags)
      ? recipeData.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    notes: typeof recipeData.notes === "string" ? recipeData.notes : "",
    preparation:
      typeof recipeData.preparation === "string" ? recipeData.preparation : "",
    preparationNotes:
      typeof recipeData.preparationNotes === "string"
        ? recipeData.preparationNotes
        : "",
    ingredients: ingredients.map((ingredient, index) => ({
      ...ingredient,
      id:
        typeof ingredient.id === "string"
          ? ingredient.id
          : `${recipeId}-ingredient-${index + 1}`,
      preparation:
        typeof ingredient.preparation === "string"
          ? ingredient.preparation
          : "",
      optional:
        typeof ingredient.optional === "boolean" ? ingredient.optional : false,
      notes: typeof ingredient.notes === "string" ? ingredient.notes : "",
      category: readOptionalString(ingredient.category),
      function: readOptionalString(ingredient.function),
      asin: readOptionalString(ingredient.asin),
      cookingPoint: readOptionalString(ingredient.cookingPoint),
      substitutes: readOptionalStringArray(ingredient.substitutes),
      elementalProperties: readElementalProperties(
        ingredient.elementalProperties,
      ),
      seasonality: readSeasonality(ingredient.seasonality),
      zodiacInfluences: Array.isArray(ingredient.zodiacInfluences)
        ? ingredient.zodiacInfluences
        : undefined,
      planetaryInfluences: readOptionalStringArray(
        ingredient.planetaryInfluences,
      ),
      lunarPhaseInfluences: readLunarPhases(ingredient.lunarPhaseInfluences),
    })),
  };
}
export default ExtendedRecipe;
