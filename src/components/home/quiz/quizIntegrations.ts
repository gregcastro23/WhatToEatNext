import type { GroceryCartRecipeInput } from "@/contexts/GroceryCartContext";
import type { RecipeBuilderState } from "@/contexts/RecipeBuilderContext";
import type { Recipe } from "@/types/recipe";
import { elementalSignature } from "@/utils/elemental/signature";
import { resolveIngredientByName } from "@/utils/ingredientResolution";
import { contentHash } from "./quizGeneratedRecipes";
import type { ElementVector, QuizContext, QuizReading } from "./types";

export {
  parseIngredientQuantity,
  parseGeneratedQuizRecipe,
  cosmicToQuizRecipe,
  generationErrorMessage,
  validateGeneratedConstraints,
} from "./quizGeneratedRecipes";
export type { QuizCosmicRecipe } from "./quizGeneratedRecipes";

export function quizFingerprint(
  reading: QuizReading,
  context: QuizContext,
): string {
  return contentHash(JSON.stringify([reading, context]));
}

/** Keep the full answer record available to the builder and the diner. */
export function buildQuizBrief(
  reading: QuizReading,
  context: QuizContext,
): string {
  return [
    `Cook ${reading.meal.name} using ${reading.meal.method}.`,
    `Preferences: ${JSON.stringify(reading.preferences)}`,
    `Context: ${JSON.stringify(context)}`,
    `Answers: ${reading.selectedOptions.map((answer) => `${answer.questionId}=${answer.label}`).join("; ")}`,
    `Element preference percentages: ${JSON.stringify(reading.pct)}`,
    `ESMS preference points (not planetary measurements): ${JSON.stringify(reading.esmsTotals)}`,
  ].join("\n");
}

export function buildQuizGenerationRequest(
  reading: QuizReading,
  context: QuizContext,
  idempotencyKey: string,
): {
  prompt: string;
  diet: string;
  ingredients_main: string[];
  disallowed_ingredients: string[];
  preferredCuisine: string;
  idempotencyKey: string;
} {
  const instruction =
    "Create a complete measured recipe. Honor all dietary exclusions, time, equipment, servings and selected preferences. ESMS preference points describe taste, not measured sky quantities.";
  const answerRecord = reading.selectedOptions.map(
    ({ questionId, optionId, label }) => [questionId, optionId, label],
  );
  const contents = {
    meal: reading.meal.name,
    method: reading.meal.method,
    preferences: reading.preferences,
    context,
    answers: answerRecord,
    elements: reading.pct,
    esmsPreferences: reading.esmsTotals,
  };
  let prompt = `${instruction}\n${JSON.stringify(contents)}`;
  // Stable question/option IDs preserve every selected answer when human labels
  // would exceed the endpoint's budget. Never truncate away dietary constraints.
  if (prompt.length > 2000) {
    prompt = `${instruction}\n${JSON.stringify({ ...contents, answers: reading.selectedOptions.map(({ questionId, optionId }) => [questionId, optionId]) })}`;
  }
  if (prompt.length > 2000)
    throw new Error(
      "This quiz brief is too long to send. Open it in the recipe builder to refine it.",
    );
  return {
    prompt,
    diet: reading.preferences.dietaryStyle,
    ingredients_main: reading.meal.suggestedIngredients.map(({ name }) => name),
    disallowed_ingredients: [...reading.preferences.excludedAllergens],
    preferredCuisine: reading.meal.cuisine,
    idempotencyKey,
  };
}

export function quizToRecipe(
  reading: QuizReading,
  context: QuizContext,
): Recipe {
  return {
    id: `quiz-${quizFingerprint(reading, context)}`,
    name: reading.meal.name,
    description: reading.meal.blurb,
    cuisine: reading.meal.cuisine,
    ingredients: reading.meal.suggestedIngredients.map((ingredient) => ({
      ...ingredient,
    })),
    instructions: [...reading.meal.instructions],
    numberOfServings: reading.preferences.servings,
    timeToMake: `${reading.meal.prepMinutes} minutes`,
    totalTime: `${reading.meal.prepMinutes} minutes`,
    cookingMethod: [reading.meal.method],
    elementalProperties: recipeIngredientElements(reading),
    elementalProvenance:
      "Mean of resolved ingredient catalog signatures; not the quiz preference vector.",
    preparationNotes: buildQuizBrief(reading, context),
  };
}

export function recipeToCart(recipe: Recipe): GroceryCartRecipeInput {
  return {
    id: recipe.id,
    name: recipe.name,
    baseServings: recipe.numberOfServings ?? 1,
    ingredients: recipe.ingredients.map(({ name, amount, unit }) => ({
      name,
      amount,
      unit,
    })),
  };
}

export function quizToBuilder(
  reading: QuizReading,
  context: QuizContext,
): RecipeBuilderState {
  return {
    mealType:
      context.timeOfDay === "morning"
        ? "Breakfast"
        : context.timeOfDay === "afternoon"
          ? "Lunch"
          : "Dinner",
    flavors: reading.preferences.spiceLevel === "hot" ? ["spicy"] : [],
    dietaryPreferences:
      reading.preferences.dietaryStyle === "unrestricted"
        ? []
        : [reading.preferences.dietaryStyle],
    allergies: [...reading.preferences.excludedAllergens],
    selectedCuisines: [reading.meal.cuisine],
    selectedIngredients: reading.meal.suggestedIngredients.map(({ name }) => ({
      name,
    })),
    selectedCookingMethods: [reading.meal.method],
    quizBrief: buildQuizBrief(reading, context),
    maxPrepTimeMinutes: reading.preferences.maxMinutes,
  };
}

function recipeIngredientElements(reading: QuizReading): ElementVector {
  const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  for (const ingredient of reading.meal.suggestedIngredients) {
    const signature = resolveIngredientByName(
      ingredient.name,
    )?.elementalProperties;
    if (!signature) continue;
    for (const key of ["Fire", "Water", "Earth", "Air"] as const)
      totals[key] += signature[key];
  }
  return elementalSignature(totals).values;
}
