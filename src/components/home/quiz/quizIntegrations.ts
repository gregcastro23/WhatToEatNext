import type { GroceryCartRecipeInput } from "@/contexts/GroceryCartContext";
import type {
  FlavorPreference,
  MealType,
  RecipeBuilderState,
} from "@/contexts/RecipeBuilderContext";
import type { Recipe } from "@/types/recipe";
import type { QuizOutcome } from "./engine/result";
import type { FeatureKey, QuizDish, QuizRules } from "./engine/types";
import type { QuizContext } from "./types";

export {
  cosmicToQuizRecipe,
  generationErrorMessage,
  parseGeneratedQuizRecipe,
  validateGeneratedConstraints,
} from "./quizGeneratedRecipes";
export type { GenerationConstraints, QuizCosmicRecipe } from "./quizGeneratedRecipes";

export function recipeToCart(recipe: Recipe): GroceryCartRecipeInput {
  return {
    id: recipe.id,
    name: recipe.name,
    baseServings: recipe.numberOfServings ?? 1,
    ingredients: recipe.ingredients.map(({ name, amount, unit }) => ({ name, amount, unit })),
  };
}

/** Servings to shop for: the diner's answer, else the table size, else the recipe's yield. */
export function servingsFor(outcome: QuizOutcome, context: QuizContext, recipe: Recipe | null): number {
  if (outcome.servings !== null) return outcome.servings;
  if (context.tableSize > 1) return Math.min(12, context.tableSize);
  return recipe?.numberOfServings ?? 2;
}

const FLAVORS: ReadonlyArray<[FeatureKey, FlavorPreference]> = [
  ["spice", "spicy"],
  ["sweet", "sweet"],
  ["umami", "umami"],
  ["fresh", "sour"],
];

function mealTypeFor(dish: QuizDish, context: QuizContext): MealType {
  if (dish.courses.includes("breakfast") && context.timeOfDay === "morning") return "Breakfast";
  if (dish.features.handheld > 0.6 && dish.features.hearty < 0.4) return "Snack";
  return context.timeOfDay === "afternoon" ? "Lunch" : "Dinner";
}

/** A short, human brief of what the quiz learned. Kept for the builder and AI. */
export function quizBrief(dish: QuizDish, outcome: QuizOutcome, rules: QuizRules): string {
  const lines = [
    `Matched dish: ${dish.name} (${dish.cuisine}).`,
    `Craving: ${outcome.profile.map(({ label }) => label).join(", ") || "balanced"}.`,
    ...outcome.reasons.map(({ question, answer }) => `${question} → ${answer}`),
  ];
  if (rules.diet) lines.push(`Diet: ${rules.diet}.`);
  if (rules.allergens.length) lines.push(`Exclude: ${rules.allergens.join(", ")}.`);
  if (outcome.skyNote) lines.push(outcome.skyNote);
  return lines.join("\n");
}

export function quizToBuilder(
  dish: QuizDish,
  recipe: Recipe | null,
  outcome: QuizOutcome,
  rules: QuizRules,
  context: QuizContext,
  maxMinutes: number | null,
): RecipeBuilderState {
  const profileKeys = new Set(outcome.profile.map(({ key }) => key));
  return {
    mealType: mealTypeFor(dish, context),
    flavors: FLAVORS.filter(([key]) => profileKeys.has(key)).map(([, flavor]) => flavor),
    dietaryPreferences: rules.diet ? [rules.diet] : [],
    allergies: [...rules.allergens],
    selectedCuisines: [dish.cuisine],
    selectedIngredients: (recipe?.ingredients ?? []).slice(0, 12).map(({ name }) => ({ name })),
    selectedCookingMethods: recipe?.cookingMethod ? [...recipe.cookingMethod] : [],
    quizBrief: quizBrief(dish, outcome, rules),
    maxPrepTimeMinutes: maxMinutes,
  };
}

export interface QuizGenerationRequest {
  prompt: string;
  diet: string;
  ingredients_main: string[];
  disallowed_ingredients: string[];
  preferredCuisine: string;
  idempotencyKey: string;
}

/** The AI request: the matched dish as the starting point, every rule intact. */
export function buildQuizGenerationRequest(
  dish: QuizDish,
  recipe: Recipe | null,
  outcome: QuizOutcome,
  rules: QuizRules,
  constraints: { servings: number; maxMinutes: number | null },
  idempotencyKey: string,
): QuizGenerationRequest {
  const instruction = `Create a complete measured recipe for ${constraints.servings} servings, inspired by ${dish.name} but tailored to this diner. Honor every dietary rule and exclusion${constraints.maxMinutes ? ` and a ${constraints.maxMinutes}-minute limit` : ""}.`;
  let prompt = `${instruction}\n${quizBrief(dish, outcome, rules)}`;
  // Reasons are the only trimmable part; dietary rules are never dropped.
  if (prompt.length > 2000) prompt = `${instruction}\n${quizBrief(dish, { ...outcome, reasons: [] }, rules)}`;
  if (prompt.length > 2000) throw new Error("This brief is too long to send. Open it in the recipe builder instead.");
  return {
    prompt,
    diet: rules.diet ?? "unrestricted",
    ingredients_main: (recipe?.ingredients ?? []).slice(0, 6).map(({ name }) => name),
    disallowed_ingredients: [...rules.allergens],
    preferredCuisine: dish.cuisine,
    idempotencyKey,
  };
}
