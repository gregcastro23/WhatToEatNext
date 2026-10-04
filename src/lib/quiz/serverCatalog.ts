import "server-only";

import { getServerRecipes } from "@/actions/recipes";
import type { Recipe } from "@/types/recipe";
import { encodeDish, type QuizCatalogResponse, type QuizDish } from "./catalogContract";
import { buildQuizCatalog } from "./dishCatalog";

/**
 * Server-side memo of the quiz catalog. The static recipe catalog only changes
 * on deploy, so one build per server instance is enough.
 */
let memo: { dishes: QuizDish[]; ids: Set<string> } | null = null;

async function catalog(): Promise<{ dishes: QuizDish[]; ids: Set<string> }> {
  if (memo) return memo;
  const dishes = buildQuizCatalog(await getServerRecipes());
  memo = { dishes, ids: new Set(dishes.map((dish) => dish.id)) };
  return memo;
}

export async function quizCatalogResponse(): Promise<QuizCatalogResponse> {
  const { dishes } = await catalog();
  return {
    success: true,
    version: 1,
    generatedFrom: "static recipe catalog (src/data/cuisines)",
    dishes: dishes.map(encodeDish),
  };
}

/** The full static recipe behind a quiz dish, or null when it is not one. */
export async function quizDishRecipe(id: string): Promise<Recipe | null> {
  const { ids } = await catalog();
  if (!ids.has(id)) return null;
  const recipes = await getServerRecipes();
  return recipes.find((recipe) => recipe.id === id) ?? null;
}
