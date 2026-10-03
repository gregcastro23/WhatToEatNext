import { z } from "zod";
import { readJson } from "@/lib/api/json";
import { decodeDish, quizCatalogSchema, type QuizDish } from "@/lib/quiz/catalogContract";
import type { Recipe, RecipeIngredient } from "@/types/recipe";

/** One catalog fetch per page view; a failure clears the cache so retry works. */
let pending: Promise<QuizDish[]> | null = null;

export function loadQuizCatalog(): Promise<QuizDish[]> {
  pending ??= fetch("/api/quiz/catalog")
    .then(async (response) => {
      if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
      const catalog = await readJson(response, quizCatalogSchema.parse);
      return catalog.dishes.map(decodeDish);
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}

const dishRecipeSchema = z.object({
  success: z.literal(true),
  recipe: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    cuisine: z.string().optional(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.number().finite(),
        unit: z.string(),
        optional: z.boolean().optional(),
      }),
    ),
    instructions: z.array(z.string()),
    numberOfServings: z.number().positive().optional(),
    totalTime: z.string().optional(),
    cookingMethod: z.array(z.string()).optional(),
    elementalProperties: z.object({
      Fire: z.number(),
      Water: z.number(),
      Earth: z.number(),
      Air: z.number(),
    }),
  }),
});

type ParsedRecipe = z.infer<typeof dishRecipeSchema>["recipe"];

function toIngredient(item: ParsedRecipe["ingredients"][number]): RecipeIngredient {
  const ingredient: RecipeIngredient = { name: item.name, amount: item.amount, unit: item.unit };
  if (item.optional !== undefined) ingredient.optional = item.optional;
  return ingredient;
}

function toRecipe(parsed: ParsedRecipe): Recipe {
  const { Fire, Water, Earth, Air } = parsed.elementalProperties;
  const recipe: Recipe = {
    id: parsed.id,
    name: parsed.name,
    ingredients: parsed.ingredients.map(toIngredient),
    instructions: parsed.instructions,
    elementalProperties: { Fire, Water, Earth, Air },
  };
  if (parsed.description !== undefined) recipe.description = parsed.description;
  if (parsed.cuisine !== undefined) recipe.cuisine = parsed.cuisine;
  if (parsed.numberOfServings !== undefined) recipe.numberOfServings = parsed.numberOfServings;
  if (parsed.totalTime !== undefined) {
    recipe.totalTime = parsed.totalTime;
    recipe.timeToMake = `${parsed.totalTime} minutes`;
  }
  if (parsed.cookingMethod !== undefined) recipe.cookingMethod = parsed.cookingMethod;
  return recipe;
}

const recipes = new Map<string, Promise<Recipe>>();

/** The full recipe behind a quiz dish (ingredients with amounts, steps). */
export function loadQuizDishRecipe(id: string): Promise<Recipe> {
  const cached = recipes.get(id);
  if (cached) return cached;
  const request = fetch(`/api/quiz/dish/${encodeURIComponent(id)}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Recipe request failed (${response.status})`);
      return toRecipe((await readJson(response, dishRecipeSchema.parse)).recipe);
    })
    .catch((error: unknown) => {
      recipes.delete(id);
      throw error;
    });
  recipes.set(id, request);
  return request;
}
