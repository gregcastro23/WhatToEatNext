import type { RecipeData } from "@/data/recipes";
import type { LunarPhase, ZodiacSign } from "@/types/alchemy";
import type {
  ElementalProperties,
  Recipe,
  RecipeIdentifier,
  RecipeIngredient,
  RecipeNutrition,
  RecipePlanetaryInfluences,
  ScoredRecipe,
  // Season,
} from "@/types/recipe";
import { createEmptyNutritionalSummary, type NutritionalSummary } from "@/types/nutrition";
import { createElementalProperties } from "../elemental/elementalUtils";
// import { isNonEmptyArray } from "../typeGuards";
const isNonEmptyArray = (arr: any): boolean =>
  Array.isArray(arr) && arr.length > 0; // Fallback function

export function adaptRecipeData(recipeData: RecipeData): Recipe {
  const ingredients = adaptIngredients(recipeData.ingredients ?? []);

  const recipe: Recipe = {
    id: ensureRecipeId(recipeData.id),
    name: recipeData.name ?? "Unnamed Recipe",
    ingredients,
    instructions: Array.isArray(recipeData.instructions)
      ? recipeData.instructions
      : ["Combine ingredients and cook as desired."],
    elementalProperties: normalizeElementalProperties(
      recipeData.elementalProperties,
    ),
  };

  if (recipeData.description) {
    recipe.description = recipeData.description;
  }
  if (recipeData.cuisine) {
    recipe.cuisine = recipeData.cuisine;
  }
  if (recipeData.timeToMake !== undefined) {
    recipe.timeToMake = String(recipeData.timeToMake);
  }
  if (recipeData.servingSize !== undefined) {
    recipe.servings = recipeData.servingSize;
  }

  applyEnergyProfile(recipe, recipeData.energyProfile);
  applyTags(recipe, recipeData.tags ?? []);
  applyNutrition(recipe, recipeData.nutrition);

  if (isNonEmptyArray(recipeData.substitutions)) {
    recipe.substitutions = recipeData.substitutions;
  }
  if (isNonEmptyArray(recipeData.tools)) {
    recipe.tools = recipeData.tools;
  }
  if (recipeData.spiceLevel !== undefined) {
    recipe.spiceLevel = recipeData.spiceLevel as Recipe["spiceLevel"];
  }
  if (recipeData.preparationNotes) {
    recipe.preparationNotes = recipeData.preparationNotes;
  }
  if (isNonEmptyArray(recipeData.technicalTips)) {
    recipe.technicalTips = recipeData.technicalTips;
  }
  if (recipeData.flavorProfile) {
    recipe.flavorProfile = recipeData.flavorProfile as Recipe["flavorProfile"];
  }

  return recipe;
}

function adaptIngredients(
  ingredients: RecipeData["ingredients"],
): RecipeIngredient[] {
  return ingredients.map((ingredient) => {
    const ingredientData = ingredient as any;
    const recipeIngredient: RecipeIngredient = {
      name: ingredientData.name ?? "Unknown Ingredient",
      amount: Number(ingredientData.amount ?? 0),
      unit: ingredientData.unit ?? "",
    };

    if (ingredientData.optional !== undefined) {
      recipeIngredient.optional = Boolean(ingredientData.optional);
    }
    if (ingredientData.preparation) {
      recipeIngredient.preparation = ingredientData.preparation;
    }
    if (ingredientData.category) {
      recipeIngredient.category = ingredientData.category;
    }
    if (ingredientData.notes) {
      recipeIngredient.notes = ingredientData.notes;
    }

    return recipeIngredient;
  });
}

export function createScoredRecipe(
  recipe: Recipe | RecipeData,
  matchScore: number,
): ScoredRecipe {
  const adaptedRecipe = isRecipeData(recipe) ? adaptRecipeData(recipe) : recipe;
  const score = Math.round(matchScore * 100);

  return {
    ...adaptedRecipe,
    score,
    _alchemicalScores: {
      elementalScore: 0,
      _zodiacalScore: 0,
      _lunarScore: 0,
      _planetaryScore: 0,
      _seasonalScore: 0,
    },
  };
}

export function isRecipeData(obj: unknown): obj is RecipeData {
  if (!obj || typeof obj !== "object") return false;
  const recipeData = obj as Partial<RecipeData>;

  return (
    typeof recipeData.id === "string" &&
    typeof recipeData.name === "string" &&
    Array.isArray(recipeData.ingredients)
  );
}

export function adaptAllRecipes(recipeDataArray: RecipeData[]): Recipe[] {
  return recipeDataArray.map(adaptRecipeData);
}

export function extractElementalProperties(
  recipeData: RecipeData,
): ElementalProperties {
  return normalizeElementalProperties(recipeData.elementalProperties);
}

export function getCookingMethodsFromRecipe(recipeData: RecipeData): string[] {
  if (!isNonEmptyArray(recipeData.tags)) return [];

  const cookingMethodKeywords = [
    "baking",
    "roasting",
    "grilling",
    "frying",
    "sautéing",
    "boiling",
    "steaming",
    "poaching",
    "simmering",
    "braising",
    "stewing",
    "broiling",
    "smoking",
    "sous-vide",
    "pressure-cooking",
    "slow-cooking",
    "stir-frying",
    "deep-frying",
    "blanching",
    "curing",
    "pickling",
    "fermenting",
    "dehydrating",
  ];

  const matches = (recipeData.tags || []).filter((tag) =>
    cookingMethodKeywords.some((method) => tag.toLowerCase().includes(method)),
  );

  return matches;
}

export function createMinimalRecipe(name: string): Recipe {
  return {
    id: `minimal-recipe-${crypto.randomUUID()}`,
    name,
    ingredients: [],
    elementalProperties: createElementalProperties({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    instructions: [],
  };
}

function ensureRecipeId(id?: RecipeIdentifier): RecipeIdentifier {
  if (typeof id === "string" && id.trim().length > 0) {
    return id;
  }

  return `recipe-${crypto.randomUUID()}`;
}

function normalizeElementalProperties(
  value: RecipeData["elementalProperties"],
): ElementalProperties {
  if (value && typeof value === "object") {
    return createElementalProperties(value as Partial<ElementalProperties>);
  }

  return createElementalProperties({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  });
}

function applyEnergyProfile(
  recipe: Recipe,
  energyProfile: RecipeData["energyProfile"] | undefined,
): void {
  if (!energyProfile) {
    return;
  }

  if (energyProfile.season) {
    recipe.currentSeason = extractSeason(energyProfile.season);
  }

  if (energyProfile.zodiac) {
    const zodiacValues = Array.isArray(energyProfile.zodiac)
      ? energyProfile.zodiac
      : [energyProfile.zodiac];
    recipe.zodiacInfluences = zodiacValues
      .map((value) => String(value).toLowerCase())
      .filter(Boolean) as ZodiacSign[];
  }

  if (energyProfile.lunar) {
    const lunarValues = Array.isArray(energyProfile.lunar)
      ? energyProfile.lunar
      : [energyProfile.lunar];
    recipe.lunarPhaseInfluences = lunarValues
      .map((value) => String(value).toLowerCase())
      .filter(Boolean) as LunarPhase[];
  }

  if (energyProfile.planetary) {
    recipe.planetaryInfluences = normalizePlanetaryInfluences(
      energyProfile.planetary,
    );
  }
}

function extractSeason(value: Season | Season[] | string): Season | string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "").toLowerCase();
  }
  return String(value ?? "").toLowerCase();
}

function normalizePlanetaryInfluences(
  source: string[] | Record<string, number>,
): RecipePlanetaryInfluences {
  if (Array.isArray(source)) {
    return {
      favorable: source,
      unfavorable: [],
    };
  }

  const entries = Object.entries(source ?? {});
  const favorable: string[] = [];
  const unfavorable: string[] = [];

  entries.forEach(([planet, weight]) => {
    if (typeof weight !== "number") {
      return;
    }
    if (weight >= 0) {
      favorable.push(planet);
    } else {
      unfavorable.push(planet);
    }
  });

  return {
    favorable,
    unfavorable,
  };
}

function applyTags(recipe: Recipe, tags: string[]): void {
  if (!isNonEmptyArray(tags)) {
    return;
  }

  recipe.tags = tags;

  const dietaryTags = tags.filter((tag) =>
    [
      "vegetarian",
      "vegan",
      "gluten-free",
      "dairy-free",
      "nut-free",
      "low-carb",
      "keto",
      "paleo",
    ].includes(tag.toLowerCase()),
  );

  if (dietaryTags.includes("vegetarian")) {
    recipe.isVegetarian = true;
  }
  if (dietaryTags.includes("vegan")) {
    recipe.isVegan = true;
  }
  if (dietaryTags.includes("gluten-free")) {
    recipe.isGlutenFree = true;
  }
  if (dietaryTags.includes("dairy-free")) {
    recipe.isDairyFree = true;
  }

  const mealTypeValues = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "dessert",
    "appetizer",
  ];
  const mealTypes = tags.filter((tag) =>
    mealTypeValues.includes(tag.toLowerCase()),
  );

  if (mealTypes.length > 0) {
    recipe.mealType = mealTypes;
  }
}

function applyNutrition(recipe: Recipe, inputNutrition?: RecipeNutrition): void {
  if (!inputNutrition) {
    return;
  }

  const newNutrition = createEmptyNutritionalSummary();

  newNutrition.calories = Number(inputNutrition.calories ?? 0);
  newNutrition.protein = Number(inputNutrition.protein ?? 0);
  newNutrition.carbs = Number(inputNutrition.carbs ?? 0);
  newNutrition.fat = Number(inputNutrition.fat ?? 0);
  newNutrition.fiber = Number(inputNutrition.macronutrients?.fiber ?? 0);

  // Other specific fields from NutritionalSummary (e.g., sodium, specific vitamins/minerals)
  // are not directly available in the current RecipeNutrition.
  // If RecipeNutrition had these, they would be mapped here.

  recipe.nutrition = newNutrition;
}
