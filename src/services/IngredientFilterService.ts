import { _logger } from "@/lib/logger";
import { fruits } from "../data/ingredients/fruits";
import { grains } from "../data/ingredients/grains";
import { herbs } from "../data/ingredients/herbs";
import { oils } from "../data/ingredients/oils";
import { __proteins } from "../data/ingredients/_proteins";
import { spices } from "../data/ingredients/spices";
import { vegetables } from "../data/ingredients/vegetables";
import type { IngredientMapping, ElementalProperties } from "../types/alchemy";
import type { ElementalFilter } from "../types/elemental";
import type { NutritionalFilter, NutritionData } from "../types/nutrition";

// Re-export types for external use
export type { NutritionalFilter } from "../types/nutrition";

// Interface to provide special dietary filtering
export interface DietaryFilter {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isNutFree?: boolean;
  isLowSodium?: boolean;
  isLowSugar?: boolean;
}

// Combined filter interface
export interface IngredientFilter {
  nutritional?: NutritionalFilter;
  elemental?: ElementalFilter;
  dietary?: DietaryFilter;
  season?: string[];
  categories?: string[];
  searchQuery?: string;
  excludeIngredients?: string[];
}

// Structure for recipe recommendations
export interface RecipeRecommendation {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  usedIngredients: string[];
}

// Groupings for ingredient types
export const INGREDIENT_GROUPS = {
  PROTEINS: "Proteins",
  VEGETABLES: "Vegetables",
  FRUITS: "Fruits",
  HERBS: "Herbs",
  SPICES: "Spices",
  GRAINS: "Grains",
  OILS: "Oils & Fats",
} as const;

// Helper class to provide ingredient filtering services
export class IngredientFilterService {
  private static instance: IngredientFilterService;
  private readonly allIngredients: Record<
    string,
    Record<string, IngredientMapping>
  >;
  // spoonacularCache removed with cleanup

  private constructor() {
    // Initialize with all available ingredient data
    this.allIngredients = {
      [INGREDIENT_GROUPS.PROTEINS]: _proteins as Record<
        string,
        IngredientMapping
      >,
      [INGREDIENT_GROUPS.VEGETABLES]: vegetables as Record<
        string,
        IngredientMapping
      >,
      [INGREDIENT_GROUPS.FRUITS]: fruits as Record<string, IngredientMapping>,
      [INGREDIENT_GROUPS.HERBS]: herbs as Record<string, IngredientMapping>,
      [INGREDIENT_GROUPS.SPICES]: spices,
      [INGREDIENT_GROUPS.GRAINS]: grains as Record<string, IngredientMapping>,
      [INGREDIENT_GROUPS.OILS]: oils as Record<string, IngredientMapping>,
    };
  }

  // Singleton instance getter
  public static getInstance(): IngredientFilterService {
    if (!IngredientFilterService.instance) {
      IngredientFilterService.instance = new IngredientFilterService();
    }
    return IngredientFilterService.instance;
  }

  // Main filtering method that combines all filter types
  public filterIngredients(
    filter: IngredientFilter = {},
  ): Record<string, IngredientMapping[]> {
    // Start with all ingredients, grouped by category
    const filteredResults: Record<string, IngredientMapping[]> = {};

    // Determine which categories to include
    const categoriesToInclude =
      filter.categories && filter.categories.length > 0
        ? filter.categories
        : Object.keys(this.allIngredients);

    // Process each category
    categoriesToInclude.forEach((category) => {
      if (!this.allIngredients[category]) return;

      // Convert object to array of ingredients with names
      const categoryIngredients = Object.entries(
        this.allIngredients[category],
      ).map(
        ([name, data]) =>
          ({
            name,
            ...(data as unknown as Record<string, unknown>),
          }) as unknown as IngredientMapping,
      );

      // Apply all filters sequentially
      let filtered = [...categoryIngredients];

      // Apply nutritional filter if specified
      if (filter.nutritional) {
        filtered = this.applyNutritionalFilter(filtered, filter.nutritional);
      }

      // Apply elemental filter if specified
      if (filter.elemental) {
        filtered = this.applyElementalFilter(filtered, filter.elemental);
      }

      // Apply dietary filter if specified
      if (filter.dietary) {
        filtered = this.applyDietaryFilter(filtered, filter.dietary);
      }

      // Apply seasonal filter if specified
      if (filter.season && filter.season.length > 0) {
        filtered = this.applySeasonalFilter(filtered, filter.season);
      }

      // Apply search query if specified
      if (filter.searchQuery) {
        filtered = this.applySearchFilter(filtered, filter.searchQuery);
      }

      // Apply exclusion filter if specified
      if (filter.excludeIngredients && filter.excludeIngredients.length > 0) {
        filtered = this.applyExclusionFilter(
          filtered,
          filter.excludeIngredients,
        );
      }

      // Only add category if it has matching ingredients
      if (filtered.length > 0) {
        filteredResults[category] = filtered;
      }
    });

    return filteredResults;
  }

  // Apply nutritional filtering criteria
  private applyNutritionalFilter(
    ingredients: IngredientMapping[],
    filter: NutritionalFilter,
  ): IngredientMapping[] {
    return ingredients.filter((ingredient) => {
      const nutrition = (ingredient.nutritionalProfile ||
        ({} as NutritionData)) as NutritionData;

      // Check protein requirements
      if (
        filter.minProtein !== undefined &&
        (!nutrition.protein_g || nutrition.protein_g < filter.minProtein)
      ) {
        return false;
      }

      if (
        filter.maxProtein !== undefined &&
        nutrition.protein_g !== undefined &&
        nutrition.protein_g > filter.maxProtein
      ) {
        return false;
      }

      // Check fiber requirements
      if (
        filter.minFiber !== undefined &&
        (!nutrition.fiber_g || nutrition.fiber_g < filter.minFiber)
      ) {
        return false;
      }

      if (
        filter.maxFiber !== undefined &&
        nutrition.fiber_g !== undefined &&
        nutrition.fiber_g > filter.maxFiber
      ) {
        return false;
      }

      // Check calorie requirements
      if (
        filter.minCalories !== undefined &&
        (!nutrition.calories || nutrition.calories < filter.minCalories)
      ) {
        return false;
      }

      if (
        filter.maxCalories !== undefined &&
        nutrition.calories !== undefined &&
        nutrition.calories > filter.maxCalories
      ) {
        return false;
      }

      // Check for required vitamins
      if (filter.vitamins && filter.vitamins.length > 0 && nutrition.vitamins) {
        const hasAllVitamins = filter.vitamins.every(
          (vitamin) =>
            nutrition.vitamins && nutrition.vitamins.includes(vitamin),
        );
        if (!hasAllVitamins) return false;
      }

      // Check for required minerals
      if (filter.minerals && filter.minerals.length > 0 && nutrition.minerals) {
        const hasAllMinerals = filter.minerals.every(
          (mineral) =>
            nutrition.minerals && nutrition.minerals.includes(mineral),
        );
        if (!hasAllMinerals) return false;
      }

      // Check high protein requirement
      if (
        filter.highProtein &&
        (!nutrition.protein_g || nutrition.protein_g < 10)
      ) {
        return false;
      }

      // Check low carb requirement
      if (
        filter.lowCarb &&
        nutrition.carbs !== undefined &&
        nutrition.carbs > 20
      ) {
        return false;
      }

      // Check low fat requirement
      if (filter.lowFat && nutrition.fats !== undefined && nutrition.fats > 5) {
        return false;
      }

      return true;
    });
  }

  // Apply elemental filtering criteria
  private applyElementalFilter(
    ingredients: IngredientMapping[],
    filter: ElementalFilter,
  ): IngredientMapping[] {
    return ingredients.filter((ingredient) => {
      const elementalProps = ingredient.elementalProperties as unknown as
        | ElementalProperties
        | undefined;

      // Check Fire element range
      if (
        filter.minFire !== undefined &&
        (!elementalProps ||
          elementalProps.Fire === undefined ||
          elementalProps.Fire < filter.minFire)
      ) {
        return false;
      }

      if (
        filter.maxFire !== undefined &&
        (!elementalProps ||
          elementalProps.Fire === undefined ||
          elementalProps.Fire > filter.maxFire)
      ) {
        return false;
      }

      // Check Water element range
      if (
        filter.minWater !== undefined &&
        (!elementalProps ||
          elementalProps.Water === undefined ||
          elementalProps.Water < filter.minWater)
      ) {
        return false;
      }

      if (
        filter.maxWater !== undefined &&
        (!elementalProps ||
          elementalProps.Water === undefined ||
          elementalProps.Water > filter.maxWater)
      ) {
        return false;
      }

      // Check Earth element range
      if (
        filter.minEarth !== undefined &&
        (!elementalProps ||
          elementalProps.Earth === undefined ||
          elementalProps.Earth < filter.minEarth)
      ) {
        return false;
      }

      if (
        filter.maxEarth !== undefined &&
        (!elementalProps ||
          elementalProps.Earth === undefined ||
          elementalProps.Earth > filter.maxEarth)
      ) {
        return false;
      }

      // Check Air element range
      if (
        filter.minAir !== undefined &&
        (!elementalProps ||
          elementalProps.Air === undefined ||
          elementalProps.Air < filter.minAir)
      ) {
        return false;
      }

      if (
        filter.maxAir !== undefined &&
        (!elementalProps ||
          elementalProps.Air === undefined ||
          elementalProps.Air > filter.maxAir)
      ) {
        return false;
      }

      // Check for dominant element if specified
      if (filter.dominantElement) {
        if (!elementalProps) return false;
        const dominantEntry = (
          Object.entries(elementalProps) as Array<
            [keyof ElementalProperties, number]
          >
        )
          .filter(([key]) => ["Fire", "Water", "Earth", "Air"].includes(key))
          .sort(([, a], [, b]) => b - a)[0];

        const dominantElement = dominantEntry[0];
        if (dominantElement !== filter.dominantElement) return false;
      }

      return true;
    });
  }

  // Apply dietary filtering criteria
  private applyDietaryFilter(
    ingredients: IngredientMapping[],
    filter: DietaryFilter,
  ): IngredientMapping[] {
    return ingredients.filter((ingredient) => {
      // Check for vegetarian
      if (
        filter.isVegetarian &&
        !(ingredient as unknown as { isVegetarian?: boolean }).isVegetarian
      ) {
        return false;
      }

      // Check for vegan
      if (
        filter.isVegan &&
        !(ingredient as unknown as { isVegan?: boolean }).isVegan
      ) {
        return false;
      }

      // Check for gluten-free
      if (
        filter.isGlutenFree &&
        !(ingredient as unknown as { isGlutenFree?: boolean }).isGlutenFree
      ) {
        return false;
      }

      // Check for dairy-free
      if (
        filter.isDairyFree &&
        !(ingredient as unknown as { isDairyFree?: boolean }).isDairyFree
      ) {
        return false;
      }

      // Check for nut-free
      if (
        filter.isNutFree &&
        !(ingredient as unknown as { isNutFree?: boolean }).isNutFree
      ) {
        return false;
      }

      // Check for low sodium
      if (
        filter.isLowSodium &&
        !(ingredient as unknown as { isLowSodium?: boolean }).isLowSodium
      ) {
        return false;
      }

      // Check for low sugar
      if (
        filter.isLowSugar &&
        !(ingredient as unknown as { isLowSugar?: boolean }).isLowSugar
      ) {
        return false;
      }

      return true;
    });
  }

  // Apply seasonal filtering criteria
  private applySeasonalFilter(
    ingredients: IngredientMapping[],
    seasons: string[],
  ): IngredientMapping[] {
    return ingredients.filter((ingredient) => {
      // Safe access to seasonality property with type assertion
      const seasonality =
        (ingredient as unknown as { seasonality?: string[] }).seasonality || [];

      // If no seasonality data, assume available year-round
      if (
        !seasonality ||
        (Array.isArray(seasonality) && seasonality.length === 0)
      ) {
        return true;
      }

      // Check if any of the specified seasons match
      return seasons.some(
        (season) =>
          Array.isArray(seasonality) &&
          seasonality.includes(season.toLowerCase()),
      );
    });
  }

  // Apply search query filtering
  private applySearchFilter(
    ingredients: IngredientMapping[],
    query: string,
  ): IngredientMapping[] {
    if (!query || typeof query !== "string") return ingredients;
    const lowerCaseQuery = query.toLowerCase();

    return ingredients.filter((ingredient) => {
      // Safe access to ingredient name with type assertion
      const ingredientName =
        (ingredient as unknown as { name?: string; id?: string }).name ||
        (ingredient as unknown as { id?: string }).id ||
        "";

      // Check if ingredient name matches query
      if (
        typeof ingredientName === "string" &&
        ingredientName.toLowerCase().includes(lowerCaseQuery)
      ) {
        return true;
      }

      // Check if any preparation notes match (if available)
      const preparationNotes =
        (ingredient as unknown as { preparationNotes?: string })
          .preparationNotes || "";
      if (typeof preparationNotes === "string" && preparationNotes.length > 0) {
        if (preparationNotes.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
      }

      // Check if any affinities match (if available)
      const affinities =
        (ingredient as unknown as { affinities?: unknown[] }).affinities || [];
      if (Array.isArray(affinities) && affinities.length > 0) {
        return affinities.some(
          (affinity: unknown) =>
            typeof affinity === "string" &&
            affinity.toLowerCase().includes(lowerCaseQuery),
        );
      }

      return false;
    });
  }

  // Apply exclusion filtering
  private applyExclusionFilter(
    ingredients: IngredientMapping[],
    excludedIngredients: string[],
  ): IngredientMapping[] {
    if (!excludedIngredients || excludedIngredients.length === 0)
      return ingredients;
    return ingredients.filter((ingredient) => {
      // Safe access to ingredient name with type assertion
      const ingredientName =
        (ingredient as unknown as { name?: string; id?: string }).name ||
        (ingredient as unknown as { id?: string }).id ||
        "";

      return !excludedIngredients.some(
        (excluded) =>
          typeof ingredientName === "string" &&
          typeof excluded === "string" &&
          ingredientName.toLowerCase().includes(excluded.toLowerCase()),
      );
    });
  }

  // Get recommended ingredients with balanced nutrition from each group
  public getBalancedRecommendations(
    count = 3,
    filter: IngredientFilter = {},
  ): Record<string, IngredientMapping[]> {
    // Apply basic filtering first
    const filteredByCategory = this.filterIngredients(filter);
    const result: Record<string, IngredientMapping[]> = {};

    // For each category, select a limited number of most nutritionally balanced items
    Object.entries(filteredByCategory).forEach(([category, ingredients]) => {
      // Sort ingredients by nutritional completeness (if data available)
      const sorted = [...ingredients].sort((a, b) => {
        const aNutrition = a.nutritionalProfile || ({} as NutritionData);
        const bNutrition = b.nutritionalProfile || ({} as NutritionData);

        const aScore = this.calculateNutritionalScore(aNutrition);
        const bScore = this.calculateNutritionalScore(bNutrition);

        return bScore - aScore; // Higher score first
      });

      // Take the top N items
      result[category] = sorted.slice(0, count);
    });

    return result;
  }

  // Calculate a nutrient density score
  private calculateNutritionalScore(nutrition: NutritionData): number {
    if (!nutrition) return 0;
    let score = 0;

    // Award points for protein content
    if (nutrition.protein_g) {
      score += nutrition.protein_g * 2;
    }

    // Award points for fiber content
    if (nutrition.fiber_g) {
      score += nutrition.fiber_g * 3;
    }

    // Award points for vitamin variety
    if (nutrition.vitamins && Array.isArray(nutrition.vitamins)) {
      score += nutrition.vitamins.length * 5;
    }

    // Award points for mineral variety
    if (nutrition.minerals && Array.isArray(nutrition.minerals)) {
      score += nutrition.minerals.length * 5;
    }

    // Award points for vitamin density
    if (
      (nutrition as unknown as { vitamin_density?: number }).vitamin_density
    ) {
      score +=
        ((nutrition as unknown as { vitamin_density?: number })
          .vitamin_density || 0) * 2;
    }

    // Penalize for very high calories
    if (nutrition.calories && nutrition.calories > 300) {
      score -= (nutrition.calories - 300) / 10;
    }

    return score;
  }

  // Find ingredient by name across all categories
  private findIngredientByName(
    ingredientName: string,
  ): IngredientMapping | null {
    const normalizedName = ingredientName.toLowerCase().trim();
    for (const category of Object.values(this.allIngredients)) {
      for (const [key, ingredient] of Object.entries(category)) {
        const ingrName = (ingredient as unknown as { name?: string }).name;
        if (
          key.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(key.toLowerCase()) ||
          (typeof ingrName === "string" &&
            ingrName.toLowerCase().includes(normalizedName))
        ) {
          return ingredient;
        }
      }
    }

    return null;
  }

  // Get enhanced nutrition data for an ingredient from local database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  public async getEnhancedNutritionData(
    ingredientName: string,
  ): Promise<any | null> {
    try {
      // Use local nutritional profiles instead of Spoonacular API
      const ingredient = this.findIngredientByName(ingredientName);
      if (ingredient && ingredient.nutritionalProfile) {
        return {
          name: ingredientName,
          nutrition: ingredient.nutritionalProfile,
          source: "local",
        };
      }

      return null;
    } catch (error) {
      _logger.error("Error fetching local nutrition data: ", error);
      return null;
    }
  }

  // Get recipe recommendations using ingredients from local data
  public async getRecipeRecommendations(
    ingredients: string[],
    dietaryFilter?: DietaryFilter,
  ): Promise<RecipeRecommendation[]> {
    try {
      // Generate simple recipe recommendations based on available ingredients
      const recommendations: RecipeRecommendation[] = [];

      // Create basic recipes based on the ingredients provided
      for (let i = 0; i < Math.min(ingredients.length, 3); i++) {
        const mainIngredient = ingredients[i];
        const otherIngredients = ingredients
          .filter((ing) => ing !== mainIngredient)
          .slice(0, 2);

        const recipe: RecipeRecommendation = {
          id: `local_${i + 1}`,
          title: `${mainIngredient} Recipe with ${otherIngredients.join(" and ")}`,
          image: "/placeholder-recipe.jpg",
          readyInMinutes: 30 + i * 10,
          healthScore: 70 + i * 5,
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 250 + i * 50, unit: "kcal" },
              { name: "Protein", amount: 15 + i * 5, unit: "g" },
              { name: "Carbs", amount: 30 + i * 10, unit: "g" },
            ],
          },
          usedIngredients: [mainIngredient, ...otherIngredients],
        };

        // Apply dietary filters
        if (dietaryFilter) {
          if (
            dietaryFilter.isVegetarian &&
            this.isVegetarianFriendly(mainIngredient)
          ) {
            recommendations.push(recipe);
          } else if (
            dietaryFilter.isVegan &&
            this.isVeganFriendly(mainIngredient)
          ) {
            recommendations.push(recipe);
          } else if (!dietaryFilter.isVegetarian && !dietaryFilter.isVegan) {
            recommendations.push(recipe);
          }
        } else {
          recommendations.push(recipe);
        }
      }

      return recommendations;
    } catch (error) {
      _logger.error("Error generating recipe recommendations: ", error);
      return [];
    }
  }

  // Check if ingredient is vegetarian-friendly
  private isVegetarianFriendly(ingredient: string): boolean {
    const vegetarianIngredients = [
      "vegetables",
      "fruits",
      "grains",
      "herbs",
      "spices",
    ];
    return vegetarianIngredients.some((cat) =>
      ingredient.toLowerCase().includes(cat),
    );
  }

  // Check if ingredient is vegan-friendly
  private isVeganFriendly(ingredient: string): boolean {
    const nonVeganIngredients = [
      "dairy",
      "milk",
      "cheese",
      "butter",
      "eggs",
      "meat",
      "fish",
    ];
    return !nonVeganIngredients.some((cat) =>
      ingredient.toLowerCase().includes(cat),
    );
  }
}

// Export singleton instance
export const _ingredientFilterService = IngredientFilterService.getInstance();
