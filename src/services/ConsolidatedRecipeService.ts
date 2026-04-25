/**
 * Consolidated Recipe Service
 *
 * Real implementation that delegates to the authoritative recipe catalog
 * (`getServerRecipes`) and uses `calculateRecipeCompatibility` for scored
 * planetary-alignment queries. All reads are cached on the server action
 * layer, so repeated calls are cheap.
 */

import type { Recipe } from "@/types/recipe";
import type { ElementalProperties } from "@/types/alchemy";
import { calculateRecipeCompatibility } from "@/calculations/culinary/recipeMatching";
import { calculateElementalSimilarity } from "./RecipeElementalService";

interface RecipeMatchCriteria {
  cuisineTypes?: string[];
  mealType?: string;
  dietaryRestrictions?: string[];
  flavorProfile?: Record<string, number>;
  elementalPreference?: Partial<ElementalProperties>;
  includeIngredients?: string[];
  excludeIngredients?: string[];
  searchQuery?: string;
}

type RecipeList = Recipe[];

async function loadRecipes(): Promise<RecipeList> {
  try {
    const mod = await import("@/actions/recipes");
    return await mod.getServerRecipes();
  } catch {
    return [];
  }
}

function hasAnyIngredient(recipe: Recipe, names: string[] | undefined): boolean {
  if (!names || names.length === 0) return true;
  const ingredients = (recipe.ingredients ?? []).map((i: any) =>
    typeof i === "string" ? i.toLowerCase() : (i.name ?? "").toLowerCase(),
  );
  const needles = names.map((n) => n.toLowerCase());
  return needles.every((needle) => ingredients.some((ing) => ing.includes(needle)));
}

function excludesAllIngredients(
  recipe: Recipe,
  names: string[] | undefined,
): boolean {
  if (!names || names.length === 0) return true;
  const ingredients = (recipe.ingredients ?? []).map((i: any) =>
    typeof i === "string" ? i.toLowerCase() : (i.name ?? "").toLowerCase(),
  );
  const needles = names.map((n) => n.toLowerCase());
  return !needles.some((needle) => ingredients.some((ing) => ing.includes(needle)));
}

function matchesDietary(
  recipe: Recipe,
  restrictions: string[] | undefined,
): boolean {
  if (!restrictions || restrictions.length === 0) return true;
  const haystack = [
    (recipe as Recipe & { dietaryInfo?: string[] }).dietaryInfo?.join(" "),
    (recipe as Recipe & { tags?: string[] }).tags?.join(" "),
    recipe.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  // If the recipe has no dietary metadata we keep it rather than drop it.
  if (!haystack) return true;
  return restrictions.every((r) => haystack.includes(r.toLowerCase()));
}

export class ConsolidatedRecipeService {
  private static instance: ConsolidatedRecipeService;

  private constructor() {}

  public static getInstance(): ConsolidatedRecipeService {
    if (!ConsolidatedRecipeService.instance) {
      ConsolidatedRecipeService.instance = new ConsolidatedRecipeService();
    }
    return ConsolidatedRecipeService.instance;
  }

  async getRecipes(): Promise<Recipe[]> {
    return loadRecipes();
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    const recipes = await loadRecipes();
    if (!query || !query.trim()) return recipes;
    const q = query.toLowerCase().trim();
    return recipes.filter((r) => {
      if (r.name?.toLowerCase().includes(q)) return true;
      if (r.description?.toLowerCase().includes(q)) return true;
      if (r.cuisine?.toLowerCase().includes(q)) return true;
      const ingredientHit = (r.ingredients ?? []).some((i: any) => {
        const name = typeof i === "string" ? i : (i.name ?? "");
        return name.toLowerCase().includes(q);
      });
      return ingredientHit;
    });
  }

  /**
   * Rank recipes against the provided criteria. Scoring combines cuisine
   * match, dietary fit, ingredient inclusion/exclusion, and elemental
   * alignment. Returns up to `limit` recipes, highest-scoring first.
   */
  async getBestRecipeMatches(
    criteria: RecipeMatchCriteria,
    limit = 10,
  ): Promise<Recipe[]> {
    const recipes = await loadRecipes();

    const preferredCuisines = (criteria.cuisineTypes ?? []).map((c) =>
      c.toLowerCase(),
    );
    const scored = recipes
      .filter((r) => excludesAllIngredients(r, criteria.excludeIngredients))
      .filter((r) => hasAnyIngredient(r, criteria.includeIngredients))
      .filter((r) => matchesDietary(r, criteria.dietaryRestrictions))
      .filter((r) => {
        if (!criteria.mealType) return true;
        const mealTypes = (r as Recipe & { mealType?: string | string[] })
          .mealType;
        if (!mealTypes) return true; // keep unlabeled rather than drop
        const list = Array.isArray(mealTypes) ? mealTypes : [mealTypes];
        return list.some((m) => m?.toLowerCase() === criteria.mealType!.toLowerCase());
      })
      .map((r) => {
        let score = 0.5;
        const cuisine = (r.cuisine ?? "").toLowerCase();
        if (preferredCuisines.length > 0) {
          score += preferredCuisines.includes(cuisine) ? 0.25 : -0.05;
        }
        if (criteria.elementalPreference) {
          const elem = (r as Recipe & {
            elementalProperties?: ElementalProperties;
          }).elementalProperties;
          if (elem) {
            // Compress similarity into [0.7, 1.0] to honor "no opposing elements"
            const raw = calculateElementalSimilarity(
              elem,
              criteria.elementalPreference,
            );
            score += (0.7 + raw * 0.3) * 0.25;
          }
        }
        return { recipe: r, score };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.recipe);
  }

  /**
   * Score recipes against a snapshot of planetary influences. Uses the real
   * `calculateRecipeCompatibility` helper, passing the planetary-influence
   * map as `activePlanets` so the astrological signal lands.
   */
  async getRecipesForPlanetaryAlignment(
    planetaryInfluences: Record<string, number>,
    minScore = 0.5,
  ): Promise<Recipe[]> {
    const recipes = await loadRecipes();
    const activePlanets = Object.entries(planetaryInfluences)
      .filter(([, strength]) => strength >= 0.4)
      .map(([planet]) => planet);

    const scored = recipes
      .map((r) => ({
        recipe: r,
        score: calculateRecipeCompatibility(r, {
          activePlanets,
        } as any).score,
      }))
      .filter((s) => s.score >= minScore)
      .sort((a, b) => b.score - a.score);

    return scored.map((s) => s.recipe);
  }
}

export const consolidatedRecipeService =
  ConsolidatedRecipeService.getInstance();
