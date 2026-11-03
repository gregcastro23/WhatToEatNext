import "server-only";

import { getServerRecipes } from "@/actions/recipes";
import type { Recipe } from "@/types/recipe";
import { encodeDish, type QuizCatalogResponse, type QuizDish } from "./catalogContract";
import { buildQuizCatalog } from "./dishCatalog";

/**
 * Server-side memo of the quiz catalog, built from one array of recipes and
 * rebuilt when `getServerRecipes` hands back another. That array is replaced
 * only when the set of hidden (unpublished) recipes changes, so this is one
 * build per server instance in practice.
 */
interface QuizMemo {
  source: readonly Recipe[];
  dishes: QuizDish[];
  ids: Set<string>;
}

let memo: QuizMemo | null = null;

async function catalog(): Promise<QuizMemo> {
  const source = await getServerRecipes();
  if (memo?.source === source) return memo;
  const dishes = buildQuizCatalog(source);
  memo = { source, dishes, ids: new Set(dishes.map((dish) => dish.id)) };
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
  const { source, ids } = await catalog();
  if (!ids.has(id)) return null;
  return source.find((recipe) => recipe.id === id) ?? null;
}
