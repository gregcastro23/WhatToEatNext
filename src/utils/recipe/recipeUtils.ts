import type {
  ElementalProperties,
  Recipe,
  RecipeIngredient,
  ScoredRecipe,
} from "@/types/recipe";
import { createLogger } from "../logger";

const _logger = createLogger("RecipeUtils");

/**
 * Type guard to check if an object is a Recipe
 */
export function isRecipe(obj: unknown): obj is Recipe {
  if (!obj || typeof obj !== "object") return false;

  const recipe = obj as Partial<Recipe>;
  return (
    typeof recipe.id === "string" &&
    typeof recipe.name === "string" &&
    Array.isArray(recipe.ingredients)
  );
}

/**
 * Type guard to check if an object is a ScoredRecipe
 */
export function isScoredRecipe(obj: unknown): obj is ScoredRecipe {
  if (!isRecipe(obj)) return false;

  const scoredRecipe = obj as Partial<ScoredRecipe>;
  return typeof scoredRecipe.score === "number";
}

/**
 * Type guard to check if an ingredient is a RecipeIngredient object
 */
export function isRecipeIngredient(
  ingredient: unknown,
): ingredient is RecipeIngredient {
  return (
    typeof ingredient === "object" &&
    ingredient !== null &&
    typeof (ingredient as RecipeIngredient).name === "string" &&
    typeof (ingredient as RecipeIngredient).amount === "number" &&
    typeof (ingredient as RecipeIngredient).unit === "string"
  );
}

/**
 * Gets the recipe's elemental properties safely with fallback to default values
 */
export function getRecipeElementalProperties(
  recipe: Recipe,
): ElementalProperties {
  if (!recipe) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  // Return the elemental properties if they exist and are valid
  if (
    recipe.elementalProperties &&
    typeof recipe.elementalProperties === "object" &&
    typeof recipe.elementalProperties.Fire === "number" &&
    typeof recipe.elementalProperties.Water === "number" &&
    typeof recipe.elementalProperties.Earth === "number" &&
    typeof recipe.elementalProperties.Air === "number"
  ) {
    return recipe.elementalProperties;
  }

  // Fallback to balanced elemental properties
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

/**
 * Gets the cooking method(s) of a recipe safely
 */
export function getRecipeCookingMethods(recipe: Recipe): string[] {
  if (!recipe) {
    return [];
  }

  // Check cookingMethod first (string or string[])
  if (recipe.cookingMethod) {
    if (Array.isArray(recipe.cookingMethod)) {
      return recipe.cookingMethod.filter(
        (method) => typeof method === "string",
      );
    } else if (typeof recipe.cookingMethod === "string") {
      return [recipe.cookingMethod];
    }
  }

  // Check cookingMethods if cookingMethod didn't work
  if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods)) {
    return recipe.cookingMethods.filter((method) => typeof method === "string");
  }

  return [];
}

/**
 * Gets the meal type(s) of a recipe safely
 */
export function getRecipeMealTypes(recipe: Recipe): string[] {
  if (!recipe) {
    return [];
  }

  if (recipe.mealType) {
    if (Array.isArray(recipe.mealType)) {
      return recipe.mealType.filter((type) => typeof type === "string");
    } else if (typeof recipe.mealType === "string") {
      return [recipe.mealType];
    }
  }

  return [];
}

/**
 * Gets the season(s) of a recipe safely
 */
export function getRecipeSeasons(recipe: Recipe): string[] {
  if (!recipe) {
    return [];
  }

  // Try currentSeason first
  if (recipe.currentSeason) {
    if (Array.isArray(recipe.currentSeason)) {
      return recipe.currentSeason.filter(
        (season) => typeof season === "string",
      );
    } else if (typeof recipe.currentSeason === "string") {
      return [recipe.currentSeason];
    }
  }

  // Try season if currentSeason didn't work
  if (recipe.season) {
    if (Array.isArray(recipe.season)) {
      return recipe.season.filter((season) => typeof season === "string");
    } else if (typeof recipe.season === "string") {
      return [recipe.season];
    }
  }

  return [];
}

/**
 * Gets the astrological influences of a recipe safely
 */
export function getRecipeAstrologicalInfluences(recipe: Recipe): string[] {
  if (!recipe) {
    return [];
  }

  // Try astrologicalPropertiesInfluences first
  if (
    recipe.astrologicalPropertiesInfluences &&
    Array.isArray(recipe.astrologicalPropertiesInfluences)
  ) {
    return recipe.astrologicalPropertiesInfluences.filter(
      (influence) => typeof influence === "string",
    );
  }

  // Try astrologicalInfluences if that didn't work
  if (
    recipe.astrologicalInfluences &&
    Array.isArray(recipe.astrologicalInfluences)
  ) {
    return recipe.astrologicalInfluences.filter(
      (influence) => typeof influence === "string",
    );
  }

  // Try to get from elementalMapping if available
  const elementalMapping = recipe.elementalMapping as any;
  if (
    elementalMapping &&
    elementalMapping.astrologicalInfluences &&
    Array.isArray(elementalMapping.astrologicalInfluences)
  ) {
    return elementalMapping.astrologicalInfluences.filter(
      (influence: unknown) => typeof influence === "string",
    );
  }

  return [];
}

/**
 * Gets the zodiac influences of a recipe safely
 */
export function getRecipeZodiacInfluences(recipe: Recipe): string[] {
  if (!recipe) {
    return [];
  }

  // Try zodiacInfluences first
  if (recipe.zodiacInfluences && Array.isArray(recipe.zodiacInfluences)) {
    return recipe.zodiacInfluences.filter(
      (influence) => typeof influence === "string",
    );
  }

  // Try to get from elementalMapping if available
  const elementalMapping = recipe.elementalMapping as any;
  if (
    elementalMapping &&
    elementalMapping.astrologicalProfile &&
    elementalMapping.astrologicalProfile.favorableZodiac &&
    Array.isArray(elementalMapping.astrologicalProfile.favorableZodiac)
  ) {
    return elementalMapping.astrologicalProfile.favorableZodiac.filter(
      (zodiac: unknown) => typeof zodiac === "string",
    );
  }

  return [];
}

/**
 * Gets the cooking time of a recipe safely
 */
export function getRecipeCookingTime(recipe: Recipe): number {
  if (!recipe) {
    return 0;
  }

  // Try cookingTime first
  if (typeof recipe.cookingTime === "number" && recipe.cookingTime > 0) {
    return recipe.cookingTime;
  }

  // Try totalTime if cookingTime didn't work
  if (typeof recipe.totalTime === "number" && recipe.totalTime > 0) {
    return recipe.totalTime;
  }

  // Try timeToMake if it's a number
  if (typeof recipe.timeToMake === "number" && recipe.timeToMake > 0) {
    return recipe.timeToMake;
  }

  // Try to extract number from string like '30 minutes'
  if (typeof recipe.timeToMake === "string") {
    const match = recipe.timeToMake.match(/(\d+)/);
    if (match?.[1]) {
      return parseInt(match[1], 10);
    }
  }

  return 0;
}

/**
 * Checks if a recipe has a specific tag
 */
export function recipeHasTag(recipe: Recipe, tag: string): boolean {
  if (!recipe || !tag) {
    return false;
  }

  if (!recipe.tags || !Array.isArray(recipe.tags)) {
    return false;
  }

  return recipe.tags.some((t) => String(t).toLowerCase() === tag.toLowerCase());
}

/**
 * Checks if a recipe is compatible with a dietary restriction
 */
export function isRecipeCompatibleWithDiet(
  recipe: Recipe,
  restriction: string,
): boolean {
  if (!recipe) {
    return false;
  }

  switch (restriction.toLowerCase()) {
    case "vegetarian":
      return recipe.isVegetarian === true;
    case "vegan":
      return recipe.isVegan === true;
    case "gluten-free":
      return recipe.isGlutenFree === true;
    case "dairy-free":
      return recipe.isDairyFree === true;
    case "keto":
      return recipe.isKeto === true;
    case "paleo":
      return recipe.isPaleo === true;
    default:
      return true;
  }
}

/**
 * Checks if a recipe contains a specific ingredient
 */
export function recipeHasIngredient(
  recipe: Recipe,
  ingredientName: string,
): boolean {
  if (!recipe || !ingredientName) {
    return false;
  }

  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    return false;
  }

  const searchName = ingredientName.toLowerCase();

  return recipe.ingredients.some((ingredient) => {
    // Handle both string and object ingredients
    if (typeof ingredient === "string") {
      return String(ingredient).toLowerCase().includes(searchName);
    }

    if (typeof ingredient === "object" && ingredient && ingredient.name) {
      return String(ingredient.name).toLowerCase().includes(searchName);
    }

    return false;
  });
}

/**
 * Gets the dominant element of a recipe
 */
export function getRecipeDominantElement(recipe: Recipe): string {
  if (!recipe) {
    return "Earth"; // Default element
  }

  const elementalProperties = getRecipeElementalProperties(recipe);

  // Find the element with the highest value
  let maxElement = "Earth";
  let maxValue = 0;

  (["Fire", "Water", "Earth", "Air"] as const).forEach((element) => {
    const value = Number(elementalProperties[element]) || 0;
    if (value > maxValue) {
      maxValue = value;
      maxElement = element;
    }
  });

  return maxElement;
}

/**
 * Gets a safe recipe name with fallback
 */
export function getSafeRecipeName(recipe: Recipe): string {
  if (!recipe) {
    return "Unknown Recipe";
  }

  return String(recipe.name || "Unknown Recipe");
}

/**
 * Gets a safe recipe description with fallback
 */
export function getSafeRecipeDescription(recipe: Recipe): string {
  if (!recipe) {
    return "No description available";
  }

  return String(recipe.description || "No description available");
}

/**
 * Converts a Recipe to a ScoredRecipe with optional score
 */
export function toScoredRecipe(recipe: Recipe, _score?: number): ScoredRecipe {
  if (!recipe) {
    throw new Error("Cannot convert null or undefined recipe to ScoredRecipe");
  }

  const defaultScore = _score !== undefined ? _score : 0.5;

  return {
    ...recipe,
    score: defaultScore,
  } as ScoredRecipe;
}

/**
 * Checks if a recipe is compatible with dietary restrictions
 */
export function isRecipeDietaryCompatible(
  recipe: Recipe,
  dietaryRestrictions: string[] = [],
): boolean {
  if (
    !recipe ||
    !Array.isArray(dietaryRestrictions) ||
    dietaryRestrictions.length === 0
  ) {
    return true;
  }

  return dietaryRestrictions.every((restriction) => {
    switch (restriction.toLowerCase()) {
      case "vegetarian":
        return recipe.isVegetarian === true;
      case "vegan":
        return recipe.isVegan === true;
      case "gluten-free":
        return recipe.isGlutenFree === true;
      case "dairy-free":
        return recipe.isDairyFree === true;
      case "nut-free":
        return recipe.isNutFree === true;
      case "keto":
        return recipe.isKeto === true;
      case "paleo":
        return recipe.isPaleo === true;
      default:
        return true; // Unknown restrictions are ignored
    }
  });
}

/**
 * Gets safe ingredient list from recipe
 */
export function getRecipeIngredients(recipe: Recipe): RecipeIngredient[] {
  if (!recipe) {
    return [];
  }

  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    return [];
  }

  return recipe.ingredients
    .map((ingredient) => {
      // Handle both string and object ingredients
      if (typeof ingredient === "string") {
        return {
          name: ingredient,
          amount: 1,
          unit: "piece",
        } as RecipeIngredient;
      }

      if (typeof ingredient === "object" && ingredient) {
        return {
          name: ingredient.name || "Unknown ingredient",
          amount: ingredient.amount || 1,
          unit: ingredient.unit || "piece",
          optional: ingredient.optional || false,
          preparation: ingredient.preparation || undefined,
        } as RecipeIngredient;
      }

      return {
        name: "Unknown ingredient",
        amount: 1,
        unit: "piece",
      } as RecipeIngredient;
    })
    .filter((ingredient) => ingredient.name !== "Unknown ingredient");
}
