import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import type { Recipe } from "@/types/recipe";
import type { QuizReading } from "./types";
import type { z } from "zod";

export type QuizCosmicRecipe = z.infer<typeof cosmicRecipeSchema>;

export function contentHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  }
  return (hash >>> 0).toString(36);
}

/** Accept decimal and simple fractional amounts; never invent a quantity. */
export function parseIngredientQuantity(value: string): number | null {
  const trimmed = value.trim();
  const fraction = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(trimmed);
  const amount = fraction
    ? Number(fraction[1] ?? 0) + Number(fraction[2]) / Number(fraction[3])
    : /^\d+(?:\.\d+)?$/.test(trimmed)
      ? Number(trimmed)
      : Number.NaN;
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function parseGeneratedQuizRecipe(value: unknown): QuizCosmicRecipe {
  const recipe = cosmicRecipeSchema.parse(value);
  if (
    !recipe.title.trim() ||
    !Number.isInteger(recipe.yields) ||
    !(recipe.yields > 0) ||
    recipe.total_time < 0 ||
    recipe.ingredients.length === 0 ||
    recipe.steps.length === 0 ||
    recipe.ingredients.some(
      (ingredient) =>
        !ingredient.name.trim() ||
        !ingredient.unit.trim() ||
        parseIngredientQuantity(ingredient.quantity) === null,
    ) ||
    recipe.steps.some((step) => !step.instruction.trim())
  ) {
    throw new Error(
      "The generated recipe is missing usable servings, measured ingredients, or instructions. Please try again.",
    );
  }
  return recipe;
}

export function cosmicToQuizRecipe(recipe: QuizCosmicRecipe): Recipe {
  return {
    id: `quiz-ai-${recipe.id}-${contentHash(JSON.stringify(recipe))}`,
    name: recipe.title,
    description: recipe.short_description,
    cuisine: recipe.cuisine,
    ingredients: recipe.ingredients.map((ingredient) => {
      const amount = parseIngredientQuantity(ingredient.quantity);
      if (amount === null)
        throw new Error(`Missing measured amount for ${ingredient.name}.`);
      return {
        name: ingredient.name,
        amount,
        unit: ingredient.unit,
        optional: ingredient.optional,
      };
    }),
    instructions: [...recipe.steps]
      .sort((a, b) => a.step_number - b.step_number)
      .map((step) => step.instruction),
    numberOfServings: recipe.yields,
    timeToMake: `${recipe.total_time} minutes`,
    cookingMethod: recipe.tags.cooking_methods,
    elementalProperties: {
      Fire: recipe.elementalBalance.fire / 100,
      Water: recipe.elementalBalance.water / 100,
      Earth: recipe.elementalBalance.earth / 100,
      Air: recipe.elementalBalance.air / 100,
    },
  };
}

export function generationErrorMessage(value: unknown, status: number): string {
  if (status === 401 || status === 429)
    return "Your demo limit has been reached. Sign in to generate another recipe.";
  if (status === 402)
    return "You need more ESMS tokens to generate this recipe. Your quiz meal is still ready below.";
  if (status === 504)
    return "Recipe generation timed out. Your quiz meal is still available; you can retry.";
  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  )
    return value.message;
  return "Could not generate a recipe right now. Your quiz meal is still available.";
}

/** Reject obvious conflicts in an AI response; labels/substitutions still need kitchen review. */
export function validateGeneratedConstraints(
  recipe: QuizCosmicRecipe,
  reading: QuizReading,
): void {
  const names = recipe.ingredients
    .map((item) => item.name.toLowerCase())
    .join("; ");
  const patterns: Record<string, RegExp> = {
    gluten: /\b(wheat|barley|rye|semolina|couscous|bulgur|seitan)\b/,
    dairy: /\b(milk|butter|cream|cheese|yogurt|ghee|whey)\b/,
    eggs: /\beggs?\b/,
    soy: /\b(soy|tofu|tempeh|edamame|miso|tamari)\b/,
    peanuts: /\bpeanuts?\b/,
    "tree-nuts":
      /\b(almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|macadamias?)\b/,
    sesame: /\b(sesame|tahini)\b/,
    fish: /\b(fish|salmon|tuna|cod|anchov\w*|sardines?|trout)\b/,
    shellfish:
      /\b(shrimp|prawns?|crab|lobster|clams?|mussels?|oysters?|scallops?)\b/,
  };
  const excluded = new Set(reading.preferences.excludedAllergens);
  if (reading.preferences.dietaryStyle === "vegan")
    for (const key of ["dairy", "eggs", "fish", "shellfish"]) excluded.add(key);
  if (reading.preferences.dietaryStyle === "vegetarian")
    for (const key of ["fish", "shellfish"]) excluded.add(key);
  if (
    reading.preferences.dietaryStyle !== "unrestricted" &&
    /\b(chicken|beef|pork|lamb|bacon|ham|turkey|gelatin|lard)\b/.test(names)
  )
    throw new Error(
      "The AI recipe conflicted with your dietary style. Your original meal is still available.",
    );
  for (const exclusion of excluded) {
    if (patterns[exclusion]?.test(names))
      throw new Error(
        `The AI recipe may contain ${exclusion}, which you excluded. Your original meal is still available.`,
      );
  }
  if (
    reading.preferences.maxMinutes !== null &&
    recipe.total_time > reading.preferences.maxMinutes
  )
    throw new Error(
      "The AI recipe exceeded your time limit. Your original meal is still available.",
    );
  if (recipe.yields !== reading.preferences.servings)
    throw new Error(
      "The AI recipe used a different serving count. Your original meal is still available.",
    );
  const { equipment } = reading.preferences;
  const methods = [
    ...recipe.tags.cooking_methods,
    ...recipe.steps.map((step) => step.cooking_method),
  ].join(" ");
  const requiresOven = /\b(bak\w*|roast\w*|broil\w*|oven)\b/i.test(methods);
  const requiresStove =
    /\b(saut\w*|boil\w*|simmer\w*|fry\w*|stir-fry|steam\w*|sear\w*)\b/i.test(
      methods,
    );
  if (
    equipment.length > 0 &&
    ((requiresOven && !equipment.includes("oven")) ||
      (requiresStove && !equipment.includes("stovetop")))
  )
    throw new Error(
      "The AI recipe requires equipment you did not select. Your original meal is still available.",
    );
}
