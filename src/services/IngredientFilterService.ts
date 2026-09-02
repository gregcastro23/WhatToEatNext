import { _logger } from "@/lib/logger";
import { fruits } from "../data/ingredients/fruits";
import { grains } from "../data/ingredients/grains";
import { herbs } from "../data/ingredients/herbs";
// import { oils } from "../data/ingredients/oils";
const oils: Record<string, IngredientMapping> = {}; // Commented out non-existent export
import { _proteins as __proteins } from "../data/ingredients/proteins";
import { spices } from "../data/ingredients/spices";
import { vegetables } from "../data/ingredients/vegetables";
import {
  classifyIngredientDiet,
  readAllergenAttestation,
} from "../utils/ingredientDietaryClassification";
import type {
  IngredientMapping,
} from "../data/ingredients/types";
import type {
  ElementalProperties,
  NutritionalProfile,
} from "../types/alchemy";
import type { ElementalFilter } from "../types/elemental";
import type { NutritionalFilter, NutritionData } from "../types/nutrition";

// Re-export types for external use
export type { NutritionalFilter } from "../types/nutrition";

/**
 * Special dietary filtering.
 *
 * How each field is answered (see `applyDietaryFilter`):
 * - `isVegan` / `isVegetarian` are *derived* from the record's name, its
 *   attestations and the catalog taxonomy.
 * - `isGlutenFree` / `isDairyFree` / `isNutFree` require a positive
 *   attestation on the record and are never derived from a name.
 * - `isLowSodium` / `isLowSugar` cannot be answered from this catalog at all
 *   and reject the whole request rather than being quietly dropped.
 */
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

/**
 * Dietary constraints this catalog carries no data for. `sugar` appears in no
 * `nutritionalProfile`, and the records that give a sodium value give it in
 * unstated units, so no threshold is defensible. Returning unconstrained
 * results for these would be answering a question we cannot answer.
 */
const unverifiableDietaryConstraints = (filter: DietaryFilter): string[] => {
  const unverifiable: string[] = [];
  if (filter.isLowSodium) unverifiable.push("isLowSodium");
  if (filter.isLowSugar) unverifiable.push("isLowSugar");
  return unverifiable;
};

// Helper class to provide ingredient filtering services
export class IngredientFilterService {
  private static instance: IngredientFilterService | undefined;
  private readonly allIngredients: Record<
    string,
    Record<string, IngredientMapping>
  >;


  private constructor() {
    // Initialize with all available ingredient data
    this.allIngredients = {
      [INGREDIENT_GROUPS.PROTEINS]: __proteins,
      [INGREDIENT_GROUPS.VEGETABLES]: vegetables,
      [INGREDIENT_GROUPS.FRUITS]: fruits,
      [INGREDIENT_GROUPS.HERBS]: herbs,
      [INGREDIENT_GROUPS.SPICES]: spices,
      [INGREDIENT_GROUPS.GRAINS]: grains,
      [INGREDIENT_GROUPS.OILS]: oils,
    };
  }

  // Singleton instance getter
  public static getInstance(): IngredientFilterService {
    IngredientFilterService.instance ??= new IngredientFilterService();
    return IngredientFilterService.instance;
  }

  // Main filtering method that combines all filter types
  public filterIngredients(
    filter: IngredientFilter = {},
  ): Record<string, IngredientMapping[]> {
    // Start with all ingredients, grouped by category
    const filteredResults: Record<string, IngredientMapping[]> = {};

    // Checked once per call rather than per category, so the log fires once.
    if (filter.dietary) {
      const unverifiable = unverifiableDietaryConstraints(filter.dietary);
      if (unverifiable.length > 0) {
        // Error level so it is visible in production: silently ignoring a
        // dietary constraint someone may be relying on is the failure mode
        // this filter exists to avoid.
        _logger.error(
          `IngredientFilterService cannot verify ${unverifiable.join(", ")} - ` +
            "the ingredient catalog carries no data for these constraints. " +
            "Returning no ingredients rather than results that may violate them.",
        );
        return filteredResults;
      }
    }

    // Determine which categories to include
    const categoriesToInclude =
      filter.categories && filter.categories.length > 0
        ? filter.categories
        : Object.keys(this.allIngredients);

    // Process each category
    categoriesToInclude.forEach((category) => {
      if (!this.allIngredients[category]) return;

      // Convert object to array of ingredient copies. Each record carries
      // its own curated display name ("Butter Croissant", "Passion Fruit");
      // the object key is a slug and must not overwrite it. Spreading the key
      // last - `{ ...data, name }` - renamed every record to its slug and
      // broke name-term classification: `\bbutter\b` cannot match across the
      // underscore in `butter_croissant`, so a butter pastry classified as
      // vegan. `name` is required on `IngredientMapping` and defined on all
      // 372 records, so there is nothing to fall back to - a `?? name` here
      // is dead code the type checker can see. The invariant it used to guard
      // is pinned instead in `ingredientFilterServiceDietary.test.ts`.
      const categoryIngredients = Object.values(
        this.allIngredients[category],
      ).map((data) => ({ ...data }));

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
      const nutrition = (ingredient.nutritionalProfile ??
        ({})) as NutritionData;

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
            nutrition.vitamins?.includes(vitamin),
        );
        if (!hasAllVitamins) return false;
      }

      // Check for required minerals
      if (filter.minerals && filter.minerals.length > 0 && nutrition.minerals) {
        const hasAllMinerals = filter.minerals.every(
          (mineral) =>
            nutrition.minerals?.includes(mineral),
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
      const elementalProps = ingredient.elementalProperties;

      // Check Fire element range
      if (
        filter.minFire !== undefined &&
        elementalProps.Fire < filter.minFire
      ) {
        return false;
      }

      if (
        filter.maxFire !== undefined &&
        elementalProps.Fire > filter.maxFire
      ) {
        return false;
      }

      // Check Water element range
      if (
        filter.minWater !== undefined &&
        elementalProps.Water < filter.minWater
      ) {
        return false;
      }

      if (
        filter.maxWater !== undefined &&
        elementalProps.Water > filter.maxWater
      ) {
        return false;
      }

      // Check Earth element range
      if (
        filter.minEarth !== undefined &&
        elementalProps.Earth < filter.minEarth
      ) {
        return false;
      }

      if (
        filter.maxEarth !== undefined &&
        elementalProps.Earth > filter.maxEarth
      ) {
        return false;
      }

      // Check Air element range
      if (
        filter.minAir !== undefined &&
        elementalProps.Air < filter.minAir
      ) {
        return false;
      }

      if (
        filter.maxAir !== undefined &&
        elementalProps.Air > filter.maxAir
      ) {
        return false;
      }

      // Check for dominant element if specified
      if (filter.dominantElement) {
        const sortedEntries = (
          Object.entries(elementalProps) as Array<
            [keyof ElementalProperties, number]
          >
        )
          .filter(([key]) =>
            (["Fire", "Water", "Earth", "Air"] as Array<string | number>).includes(
              key,
            ),
          )
          .sort(([, a], [, b]) => b - a);

        const [dominantEntry] = sortedEntries;
        if (!dominantEntry) return false;
        const [dominantElement] = dominantEntry;
        if (dominantElement !== filter.dominantElement) return false;
      }

      return true;
    });
  }

  /**
   * Apply dietary filtering criteria.
   *
   * This used to read seven boolean flags (`isVegan`, `isVegetarian`,
   * `isGlutenFree`, ...) straight off each record and drop the record when the
   * flag was falsy. Not one of the 390 ingredients in this catalog defines any
   * of those seven flags, so every dietary constraint excluded everything:
   * `{ dietary: { isVegan: true } }` returned an empty object where the
   * unfiltered call returns 6 categories and 390 ingredients.
   *
   * The fix reuses `ingredientDietaryClassification`, the module written for
   * the same defect in `UnifiedIngredientService` (where the identical missing
   * field failed the other way, passing the whole catalog through). Both
   * services now answer from one classifier, so they cannot drift apart.
   * Constraints split by what it costs to be wrong:
   *
   * - **Preferences** (vegan, vegetarian) are derived by
   *   `classifyIngredientDiet` from a curated animal-product term list, the
   *   record's own attestations, and the catalog's taxonomy. Being wrong means
   *   a surprising suggestion, so best-effort coverage beats an empty result.
   * - **Allergen claims** (gluten-free, dairy-free, nut-free) are never
   *   derived. They require a positive attestation on the record; `unknown`
   *   fails. Inferring "nut-free" from a name not mentioning nuts is how
   *   someone gets hurt.
   *
   * `isLowSodium` / `isLowSugar` are unverifiable against this catalog and are
   * rejected up front in `filterIngredients`, not here.
   */
  private applyDietaryFilter(
    ingredients: IngredientMapping[],
    filter: DietaryFilter,
  ): IngredientMapping[] {
    // Records are passed to the classifier as-is: `ClassifiableIngredient`
    // declares only optional fields, so no conversion is needed, and the seven
    // per-flag casts this predicate used to carry are gone with it. What each
    // record actually holds is `name`, `category`, `subCategory` and
    // `qualities` (see the mapping in `filterIngredients`) - exactly what the
    // classifier reads.
    return ingredients.filter((ingredient) => {
      // Preferences: derived, exclusion-list semantics.
      if (filter.isVegan || filter.isVegetarian) {
        const classification = classifyIngredientDiet(ingredient);
        if (filter.isVegan && classification.isVegan !== "compliant") {
          return false;
        }
        if (
          filter.isVegetarian &&
          classification.isVegetarian !== "compliant"
        ) {
          return false;
        }
      }

      // Allergen claims: attestation required, never derived. `unknown` fails.
      if (
        filter.isGlutenFree &&
        readAllergenAttestation(ingredient, "isGlutenFree") !== "compliant"
      ) {
        return false;
      }
      if (
        filter.isDairyFree &&
        readAllergenAttestation(ingredient, "isDairyFree") !== "compliant"
      ) {
        return false;
      }
      if (
        filter.isNutFree &&
        readAllergenAttestation(ingredient, "isNutFree") !== "compliant"
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
      // Safe access to seasonality property
      const seasonality = Array.isArray(ingredient.seasonality)
        ? ingredient.seasonality
        : [];

      // If no seasonality data, assume available year-round
      if (seasonality.length === 0) {
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
      // Safe access to ingredient name
      const ingredientName = ingredient.name;

      // Check if ingredient name matches query
      if (
        typeof ingredientName === "string" &&
        ingredientName.toLowerCase().includes(lowerCaseQuery)
      ) {
        return true;
      }

      // Check if any preparation notes match (if available)
      const preparationNotes =
        (ingredient as { preparationNotes?: string })
          .preparationNotes ?? "";
      if (typeof preparationNotes === "string" && preparationNotes.length > 0) {
        if (preparationNotes.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
      }

      // Check if any affinities match (if available)
      const affinities =
        (ingredient as { affinities?: unknown[] }).affinities ?? [];
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
    if (excludedIngredients.length === 0)
      return ingredients;
    return ingredients.filter((ingredient) => {
      const ingredientName = ingredient.name;

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
        // Note: nutritionalProfile is typed NutritionalProfile (protein, fiber, carbohydrates)
        // but calculateNutritionalScore expects NutritionData (protein_g, fiber_g, carbs).
        // This mismatch pre-exists (same pattern at applyNutritionalFilter above) and is
        // preserved as-is; fixing field names would change scoring behavior.
        const aNutrition = (a.nutritionalProfile ?? {}) as NutritionData;
        const bNutrition = (b.nutritionalProfile ?? {}) as NutritionData;

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
    const vitaminDensity = nutrition.vitamin_density;
    if (vitaminDensity) {
      score += vitaminDensity * 2;
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
        const ingrName = ingredient.name;
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

  public async getEnhancedNutritionData(
    ingredientName: string,
  ): Promise<{
    name: string;
    nutrition: NutritionalProfile;
    source: string;
  } | null> {
    try {
      // Use local nutritional profiles
      const ingredient = this.findIngredientByName(ingredientName);
      if (ingredient?.nutritionalProfile) {
        return {
          name: ingredientName,
          // Note: findIngredientByName is declared to return IngredientMapping
          // (Record<string, Ingredient>) though at runtime it returns a single
          // ingredient object; this pre-existing type/shape mismatch means
          // `.nutritionalProfile` resolves to `Ingredient` via the index
          // signature rather than `NutritionalProfile`. Cast preserves the
          // existing runtime behavior without widening to `any`.
          nutrition: ingredient.nutritionalProfile as NutritionalProfile,
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
        if (!mainIngredient) continue;
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
