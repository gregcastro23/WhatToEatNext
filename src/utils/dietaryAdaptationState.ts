import type { ElementalProperties, Recipe, RecipeIngredient } from "@/types/recipe";
import type { RecipeAlchemicalSummary } from "@/utils/recipeAlchemicalQuantities";
import {
  normalizeRecipeNutrition,
  type NormalizedRecipeNutrition,
} from "@/utils/recipeNutrition";

export type DietaryMode =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "dairy-free"
  | "keto"
  | "low-carb";

export interface IngredientSwap {
  index: number;
  from: RecipeIngredient;
  to: RecipeIngredient;
  reason: string;
}

export interface InstructionEdit {
  index: number;
  from: string;
  to: string;
  swappedTerms: Array<{ from: string; to: string }>;
}

export interface NutritionalDelta {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface ElementalDelta {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export interface AdaptationResult {
  mode: DietaryMode;
  compatible: boolean;
  swaps: IngredientSwap[];
  nutritionalDelta: NutritionalDelta;
  elementalDelta: ElementalDelta;
  adaptedIngredients: RecipeIngredient[];
  adaptedInstructions: string[];
  instructionEdits: InstructionEdit[];
  recomputedElemental: ElementalProperties | null;
  recomputedNutrition: NormalizedRecipeNutrition | null;
  recomputedAlchemical: RecipeAlchemicalSummary | null;
  /** Complete elemental coverage and usable per-serving nutrition; not cooking-method validation. */
  readingsComplete: boolean;
}

export interface SavedVersionRecomputedReadings {
  elementalProperties: ElementalProperties | null;
  nutritionPerServing: NormalizedRecipeNutrition | null;
  alchemicalSummary: RecipeAlchemicalSummary | null;
  isComplete: boolean;
}

export interface AdaptedRecipeDisplayState {
  hasSwaps: boolean;
  activeIngredients: Recipe["ingredients"];
  activeInstructions: string[];
  activeTitle: string;
  activeCartId: string;
  activeElementalProperties: Recipe["elementalProperties"];
  activeNutrition: {
    calories: number | undefined;
    protein: number | undefined;
    carbs: number | undefined;
    fat: number | undefined;
    fiber: number | undefined;
    sodium: number | undefined;
    sugar: number | undefined;
    vitamins: string[] | undefined;
    minerals: string[] | undefined;
  } | null;
  elementalRecomputed: boolean;
  nutritionRecomputed: boolean;
  instructionsRecomputed: boolean;
}

function getRecipeNutrition(recipe: Recipe): AdaptedRecipeDisplayState["activeNutrition"] {
  const norm = normalizeRecipeNutrition({ nutrition: recipe.nutrition });
  if (!norm) return null;
  return {
    calories: norm.calories,
    protein: norm.protein,
    carbs: norm.carbs,
    fat: norm.fat,
    fiber: norm.fiber,
    sodium: norm.sodium ?? undefined,
    sugar: norm.sugar ?? undefined,
    vitamins: norm.vitamins ?? undefined,
    minerals: norm.minerals ?? undefined,
  };
}

export function resolveAdaptedRecipeState(
  recipe: Recipe,
  adaptation: AdaptationResult | null,
): AdaptedRecipeDisplayState {
  const baseNutrition = getRecipeNutrition(recipe);
  if (adaptation && adaptation.swaps.length > 0) {
    const elementalRecomputed = adaptation.recomputedElemental !== null;
    const nutritionRecomputed = adaptation.recomputedNutrition !== null;
    const instructionsRecomputed = adaptation.instructionEdits.length > 0;
    const activeNutrition: AdaptedRecipeDisplayState["activeNutrition"] = adaptation.recomputedNutrition
      ? {
          calories: Math.round(adaptation.recomputedNutrition.calories),
          protein: Math.round(adaptation.recomputedNutrition.protein * 10) / 10,
          carbs: Math.round(adaptation.recomputedNutrition.carbs * 10) / 10,
          fat: Math.round(adaptation.recomputedNutrition.fat * 10) / 10,
          fiber: Math.round(adaptation.recomputedNutrition.fiber * 10) / 10,
          sodium:
            adaptation.recomputedNutrition.sodium !== undefined
              ? Math.round(adaptation.recomputedNutrition.sodium)
              : undefined,
          sugar:
            adaptation.recomputedNutrition.sugar !== undefined
              ? Math.round(adaptation.recomputedNutrition.sugar * 10) / 10
              : undefined,
          vitamins: adaptation.recomputedNutrition.vitamins,
          minerals: adaptation.recomputedNutrition.minerals,
        }
      : baseNutrition;

    return {
      hasSwaps: true,
      activeIngredients: adaptation.adaptedIngredients,
      activeInstructions: adaptation.adaptedInstructions,
      activeTitle: `${recipe.name} (${adaptation.mode})`,
      activeCartId: `${String(recipe.id)}:${adaptation.mode}`,
      activeElementalProperties:
        adaptation.recomputedElemental ?? recipe.elementalProperties,
      activeNutrition,
      elementalRecomputed,
      nutritionRecomputed,
      instructionsRecomputed,
    };
  }
  return {
    hasSwaps: false,
    activeIngredients: recipe.ingredients,
    activeInstructions: recipe.instructions,
    activeTitle: recipe.name,
    activeCartId: String(recipe.id),
    activeElementalProperties: recipe.elementalProperties,
    activeNutrition: baseNutrition,
    elementalRecomputed: false,
    nutritionRecomputed: false,
    instructionsRecomputed: false,
  };
}
