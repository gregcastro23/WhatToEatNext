// Recipe Database Connector Service
// Bridges the cuisine database with the recipe builder system

import cuisinesMap from "@/data/cuisines";
import type { Season, ElementalProperties } from "@/types/alchemy";
import type { Cuisine, SeasonalDishes } from "@/types/cuisine";
import type { Recipe } from "@/types/recipe";

export interface CuisineRecipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  ingredients: Array<{
    name: string;
    amount: string | number;
    unit: string;
    category?: string;
    swaps?: string[];
  }>;
  instructions?: string[];
  preparationSteps?: string[];
  cookingMethods?: string[];
  tools?: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    vitamins?: string[];
    minerals?: string[];
  };
  servingSize?: number;
  prepTime?: string;
  cookTime?: string;
  allergens?: string[];
  dietaryInfo?: string[];
  season?: string[];
  mealType?: string[];
  substitutions?: Record<string, string[]>;
  culturalNotes?: string;
  pairingSuggestions?: string[];
  spiceLevel?: string;
  astrologicalAffinities?: {
    planets?: string[];
    signs?: string[];
    lunarPhases?: string[];
  };
  elementalProperties?: ElementalProperties | Record<string, number>;
}

export interface RecipeSearchFilters {
  cuisine?: string;
  mealType?: string;
  season?: Season;
  dietaryRestrictions?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  allergenFree?: string[];
  ingredients?: string[];
  cookingMethods?: string[];
  spiceLevel?: string;
  maxCalories?: number;
  minProtein?: number;
}

export interface RecipeImportResult {
  success: boolean;
  recipe?: Recipe;
  warnings?: string[];
  errors?: string[];
  suggestions?: string[];
}

export class RecipeCuisineConnector {
  private readonly cuisineDatabase: Record<string, Cuisine>;
  private readonly recipeCache: Map<string, CuisineRecipe>;

  constructor() {
    this.cuisineDatabase = cuisinesMap as unknown as Record<string, Cuisine>;
    this.recipeCache = new Map();
    this.buildRecipeCache();
  }

  private buildRecipeCache(): void {
    Object.entries(this.cuisineDatabase).forEach(([_, cuisine]) => {
      this.extractRecipesFromCuisine(cuisine).forEach((recipe) => {
        const recipeId = this.generateRecipeId(recipe.name, cuisine.name);
        this.recipeCache.set(recipeId, {
          ...recipe,
          id: recipeId,
          cuisine: cuisine.name,
          elementalProperties: (
            cuisine as unknown as { elementalProperties?: ElementalProperties }
          ).elementalProperties,
        });
      });
    });
  }

  private extractRecipesFromCuisine(cuisine: Cuisine): CuisineRecipe[] {
    const recipes: CuisineRecipe[] = [];
    if (cuisine.dishes) {
      Object.entries(cuisine.dishes).forEach(([mealType, seasonalDishes]) => {
        this.extractRecipesFromSeasonalDishes(
          seasonalDishes as unknown as SeasonalDishes,
          mealType,
          recipes,
        );
      });
    }
    return recipes;
  }

  private extractRecipesFromSeasonalDishes(
    seasonalDishes: SeasonalDishes,
    mealType: string,
    recipes: CuisineRecipe[],
  ): void {
    Object.entries(seasonalDishes).forEach(([season, dishArray]) => {
      if (Array.isArray(dishArray)) {
        dishArray.forEach((dish: unknown) => {
          if (dish && typeof dish === "object") {
            const d = dish as Record<string, unknown>;
            const ing = Array.isArray(d.ingredients)
              ? this.normalizeIngredients(d.ingredients as unknown[])
              : [];
            const recipe: CuisineRecipe = {
              id: "",
              name: String(d.name || "Unnamed Recipe"),
              description: String(d.description || ""),
              cuisine: String(d.cuisine || ""),
              ingredients: ing,
              instructions:
                (d.instructions as string[]) ||
                (d.preparationSteps as string[]) ||
                [],
              preparationSteps: (d.preparationSteps as string[]) || [],
              cookingMethods: (d.cookingMethods as string[]) || [],
              tools: (d.tools as string[]) || [],
              nutrition: d.nutrition as CuisineRecipe["nutrition"],
              servingSize: Number(d.servingSize || 1),
              prepTime: d.prepTime as string | undefined,
              cookTime: d.cookTime as string | undefined,
              allergens: (d.allergens as string[]) || [],
              dietaryInfo: (d.dietaryInfo as string[]) || [],
              season: (d.season as string[]) || [season],
              mealType: (d.mealType as string[]) || [mealType],
              substitutions:
                (d.substitutions as Record<string, string[]>) || {},
              culturalNotes: d.culturalNotes as string | undefined,
              pairingSuggestions: (d.pairingSuggestions as string[]) || [],
              spiceLevel: d.spiceLevel as string | undefined,
              astrologicalAffinities:
                d.astrologicalAffinities as CuisineRecipe["astrologicalAffinities"],
              elementalProperties: d.elementalProperties as
                | ElementalProperties
                | undefined,
            };
            recipes.push(recipe);
          }
        });
      }
    });
  }

  private normalizeIngredients(
    ingredients: unknown[],
  ): CuisineRecipe["ingredients"] {
    return ingredients.map((ingredient: unknown) => {
      const i = (ingredient || {}) as Record<string, unknown>;
      return {
        name: String(i.name || ""),
        amount:
          typeof i.amount === "number" || typeof i.amount === "string"
            ? i.amount
            : 1,
        unit: String(i.unit || ""),
        category: typeof i.category === "string" ? i.category : undefined,
        swaps: Array.isArray(i.swaps) ? (i.swaps as string[]) : [],
      };
    });
  }

  private generateRecipeId(recipeName: string, cuisineName: string): string {
    const clean = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${clean(cuisineName)}-${clean(recipeName)}`;
  }

  getCuisineList(): string[] {
    return Object.values(this.cuisineDatabase).map((c) => c.name);
  }

  getTotalRecipeCount(): number {
    return this.recipeCache.size;
  }

  getRecipeCountByCuisine(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.recipeCache.forEach((recipe) => {
      counts[recipe.cuisine] = (counts[recipe.cuisine] || 0) + 1;
    });
    return counts;
  }

  searchRecipes(filters: RecipeSearchFilters = {}): CuisineRecipe[] {
    let results = Array.from(this.recipeCache.values());

    if (filters.cuisine) {
      const q = filters.cuisine.toLowerCase();
      results = results.filter((r) => r.cuisine.toLowerCase().includes(q));
    }

    if (filters.mealType) {
      const q = filters.mealType.toLowerCase();
      results = results.filter((r) =>
        r.mealType?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (filters.season) {
      results = results.filter(
        (r) =>
          r.season?.includes(filters.season as string) ||
          r.season?.includes("all"),
      );
    }

    if (filters.dietaryRestrictions?.length) {
      results = results.filter((r) =>
        (filters.dietaryRestrictions || []).every((d) =>
          r.dietaryInfo?.includes(d),
        ),
      );
    }

    if (filters.allergenFree?.length) {
      results = results.filter(
        (r) =>
          !(filters.allergenFree || []).some((a) => r.allergens?.includes(a)),
      );
    }

    if (filters.ingredients?.length) {
      const q = (filters.ingredients || []).map((i) => i.toLowerCase());
      results = results.filter((r) =>
        r.ingredients.some((ing) =>
          q.some((term) => ing.name.toLowerCase().includes(term)),
        ),
      );
    }

    if (filters.cookingMethods?.length) {
      results = results.filter((r) =>
        (filters.cookingMethods || []).some((m) =>
          r.cookingMethods?.includes(m),
        ),
      );
    }

    if (filters.spiceLevel) {
      results = results.filter((r) => r.spiceLevel === filters.spiceLevel);
    }

    if (typeof filters.maxCalories === "number") {
      results = results.filter(
        (r) =>
          !r.nutrition?.calories ||
          r.nutrition.calories <= filters.maxCalories!,
      );
    }

    if (typeof filters.minProtein === "number") {
      results = results.filter(
        (r) => (r.nutrition?.protein ?? 0) >= filters.minProtein!,
      );
    }

    return results;
  }

  getRecipeById(id: string): CuisineRecipe | undefined {
    return this.recipeCache.get(id);
  }

  getRandomRecipes(
    count = 5,
    filters: RecipeSearchFilters = {},
  ): CuisineRecipe[] {
    const filtered = this.searchRecipes(filters);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  convertToBuilderFormat(cuisineRecipe: CuisineRecipe): Recipe {
    const id = `cuisine-${cuisineRecipe.cuisine}-${cuisineRecipe.name}`
      .toLowerCase()
      .replace(/\s+/g, "-");
    const defaultElements: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
    return {
      id,
      name: cuisineRecipe.name,
      description: cuisineRecipe.description,
      cuisine: cuisineRecipe.cuisine,
      elementalProperties: defaultElements,
      ingredients: cuisineRecipe.ingredients.map((i) => ({
        name: i.name,
        amount: typeof i.amount === "number" ? i.amount : Number(i.amount) || 1,
        unit: i.unit,
        swaps: i.swaps || [],
      })),
      instructions:
        cuisineRecipe.instructions || cuisineRecipe.preparationSteps || [],
      nutrition: cuisineRecipe.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        vitamins: [],
        minerals: [],
      },
      timeToMake: this.formatTimeToMake(
        cuisineRecipe.prepTime,
        cuisineRecipe.cookTime,
      ),
      season: cuisineRecipe.season || ["all"],
      mealType: cuisineRecipe.mealType || ["lunch"],
      elementalBalance:
        (cuisineRecipe.elementalProperties as ElementalProperties) ||
        defaultElements,
    } as Recipe;
  }

  importRecipeForBuilder(recipeId: string): RecipeImportResult {
    const cuisineRecipe = this.getRecipeById(recipeId);
    if (!cuisineRecipe) {
      return {
        success: false,
        errors: [`Recipe with ID ${recipeId} not found`],
      };
    }
    try {
      const builderRecipe = this.convertToBuilderFormat(cuisineRecipe);
      const warnings: string[] = [];
      const suggestions: string[] = [];

      if (!cuisineRecipe.nutrition)
        warnings.push(
          "Nutritional information not available - will need to be calculated",
        );
      if (
        !cuisineRecipe.instructions?.length &&
        !cuisineRecipe.preparationSteps?.length
      ) {
        warnings.push(
          "No cooking instructions available - will need to be added",
        );
      }
      if (
        cuisineRecipe.substitutions &&
        Object.keys(cuisineRecipe.substitutions).length > 0
      ) {
        suggestions.push(
          "Recipe has suggested ingredient substitutions available",
        );
      }
      if (cuisineRecipe.culturalNotes)
        suggestions.push(
          "Cultural notes available for authentic preparation guidance",
        );

      return {
        success: true,
        recipe: builderRecipe,
        warnings: warnings.length ? warnings : undefined,
        suggestions: suggestions.length ? suggestions : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Failed to convert recipe: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  getRecipeSuggestionsByIngredients(ingredients: string[]): CuisineRecipe[] {
    return this.searchRecipes({ ingredients }).slice(0, 10);
  }

  getFusionSuggestions(
    primaryCuisine: string,
    secondaryCuisine: string,
  ): CuisineRecipe[] {
    const primary = this.searchRecipes({ cuisine: primaryCuisine });
    const secondary = this.searchRecipes({ cuisine: secondaryCuisine });
    return [...primary.slice(0, 3), ...secondary.slice(0, 3)];
  }

  private formatTimeToMake(prepTime?: string, cookTime?: string): string {
    const prep = prepTime || "0 minutes";
    const cook = cookTime || "0 minutes";
    if (cook === "0 minutes" || cook === "0") return prep;
    if (prep === "0 minutes" || prep === "0") return cook;
    return `${prep} prep + ${cook} cook`;
  }

  getRecipeStatistics() {
    const stats = {
      totalRecipes: this.getTotalRecipeCount(),
      byCuisine: this.getRecipeCountByCuisine(),
      byMealType: {} as Record<string, number>,
      bySeason: {} as Record<string, number>,
      byDietaryInfo: {} as Record<string, number>,
    };

    this.recipeCache.forEach((r) => {
      r.mealType?.forEach((t) => {
        stats.byMealType[t] = (stats.byMealType[t] || 0) + 1;
      });
    });
    this.recipeCache.forEach((r) => {
      r.season?.forEach((s) => {
        stats.bySeason[s] = (stats.bySeason[s] || 0) + 1;
      });
    });
    this.recipeCache.forEach((r) => {
      r.dietaryInfo?.forEach((d) => {
        stats.byDietaryInfo[d] = (stats.byDietaryInfo[d] || 0) + 1;
      });
    });

    return stats;
  }
}

// Singleton instance
export const recipeCuisineConnector = new RecipeCuisineConnector();

// Convenience exports
export const _searchCuisineRecipes = (filters: RecipeSearchFilters = {}) =>
  recipeCuisineConnector.searchRecipes(filters);

export const _importCuisineRecipe = (recipeId: string) =>
  recipeCuisineConnector.importRecipeForBuilder(recipeId);

export const _getRandomCuisineRecipes = (
  count = 5,
  filters: RecipeSearchFilters = {},
) => recipeCuisineConnector.getRandomRecipes(count, filters);

export const _getCuisineRecipeStats = () =>
  recipeCuisineConnector.getRecipeStatistics();
