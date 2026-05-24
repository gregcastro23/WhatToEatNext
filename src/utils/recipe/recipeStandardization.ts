import type { Recipe } from "@/types/recipe";

// ============ NAME NORMALIZATION & DEDUPLICATION ============

/**
 * Normalize a recipe name for use as a deduplication key.
 * Strips "(Monica Enhanced)", trailing numbers/copy suffixes,
 * and reduces to lowercase alphanumeric + spaces.
 */
export function normalizeRecipeName(name: string): string {
  return name
    .replace(/\s*\(Monica Enhanced\)\s*/gi, "")
    .replace(/\s*[-_]?\s*(copy|duplicate)\s*\d*\s*$/gi, "")
    .replace(/\s*[-_]?\d+\s*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Count the number of populated (non-empty, non-null) fields on a recipe object.
 * Used to determine which duplicate version is more complete.
 */
export function countPopulatedFields(recipe: Record<string, unknown>): number {
  let count = 0;
  for (const value of Object.values(recipe)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    count++;
  }
  return count;
}

// ============ MONICA SCORING (COOKING-METHOD HEURISTIC) ============

// Method categories for the weighted Monica score
const HIGH_REACTIVITY_METHODS = new Set([
  "frying", "deep-frying", "searing", "grilling", "pressure-cooking",
  "stir-frying", "flash-frying", "wok-frying", "broiling", "charring",
]);
const HIGH_STABILITY_METHODS = new Set([
  "baking", "roasting", "slow-cooking", "braising", "oven-roasting",
  "smoking", "curing", "confit",
]);
const HIGH_HARMONY_METHODS = new Set([
  "steaming", "poaching", "raw", "blanching", "sous-vide",
  "fermenting", "pickling", "marinating",
]);

// Keywords for special Monica modifiers
const MOLECULAR_KEYWORDS = ["molecular", "spherification", "gelification", "foam"];
const ENTROPIC_KEYWORDS = ["microwave", "reheat", "reheating"];

/**
 * Calculate a weighted Monica heuristic score (0-100) for a recipe
 * based on its cooking methods.
 */
export function calculateMethodMonicaScore(cookingMethods: unknown[]): number {
  if (!cookingMethods || cookingMethods.length === 0) return 50;

  let score = 50;

  for (const method of cookingMethods) {
    const methodName =
      typeof method === "string"
        ? method
        : typeof method === "object" && method !== null && "name" in method
          ? String((method as Record<string, unknown>).name)
          : "";

    const normalized = methodName.toLowerCase().replace(/\s+/g, "-");

    if (HIGH_REACTIVITY_METHODS.has(normalized)) {
      score += 15;
    } else if (HIGH_STABILITY_METHODS.has(normalized)) {
      score += 10;
    } else if (HIGH_HARMONY_METHODS.has(normalized)) {
      score += 5;
    }

    if (MOLECULAR_KEYWORDS.some((kw) => normalized.includes(kw))) {
      score += 20;
    }

    if (ENTROPIC_KEYWORDS.some((kw) => normalized.includes(kw))) {
      score -= 10;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Classify a Monica score into a human-readable label.
 */
export function classifyMonicaScoreLabel(score: number): string {
  if (score >= 90) return "Alchemical Gold";
  if (score >= 75) return "Philosopher's Stone";
  if (score >= 60) return "Harmonious";
  if (score >= 45) return "Transitional";
  if (score >= 30) return "Volatile";
  return "Entropic";
}

// ============ INLINE RECIPE STANDARDIZATION ============

/**
 * Generate a standardized ID from recipe name and cuisine.
 */
export function generateRecipeId(
  name: string,
  cuisine?: string,
  mealType?: string,
  season?: string,
): string {
  const parts: string[] = [];

  if (cuisine) {
    parts.push(cuisine.toLowerCase().replace(/[^a-z0-9]/g, ""));
  }

  if (mealType) {
    parts.push(mealType.toLowerCase().replace(/[^a-z0-9]/g, ""));
  }

  if (season) {
    parts.push(season.toLowerCase().replace(/[^a-z0-9]/g, ""));
  }

  const baseName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  parts.push(baseName);

  return parts.join("-");
}

/**
 * Standardize a single recipe during load.
 */
export function standardizeRecipe(
  recipe: any,
  cuisineName: string,
  mealType: string,
  season: string,
): { standardizedRecipe: Recipe; wasOriginallyEnhanced: boolean } {
  if (!recipe || typeof recipe !== "object") {
    return { standardizedRecipe: recipe, wasOriginallyEnhanced: false };
  }

  const standardized: Record<string, unknown> = { ...recipe };
  let wasOriginallyEnhanced = false;

  let canonicalName = (standardized.name as string) || "unnamed";
  if (canonicalName.includes("(Monica Enhanced)")) {
    canonicalName = canonicalName.replace(/\s*\(Monica Enhanced\)\s*/g, "").trim();
    wasOriginallyEnhanced = true;
  }
  standardized.name = canonicalName;
  standardized.id = generateRecipeId(canonicalName, cuisineName, mealType, season);

  if (!standardized.cuisine) {
    standardized.cuisine = cuisineName.toLowerCase();
  } else {
    const rawCuisine = (standardized.cuisine as string);
    const regionMatch = rawCuisine.match(/\(([^)]+)\)/);
    if (regionMatch) {
      standardized.regionalVariant = regionMatch[1].trim();
    }
    standardized.cuisine = rawCuisine.replace(/\s*\([^)]*\)\s*/g, "").trim().toLowerCase();
  }

  if (!standardized.mealType) {
    standardized.mealType = [mealType];
  } else if (!Array.isArray(standardized.mealType)) {
    standardized.mealType = [standardized.mealType];
  }

  if (!standardized.season) {
    standardized.season =
      season === "all" ? ["spring", "summer", "autumn", "winter"] : [season];
  } else if (!Array.isArray(standardized.season)) {
    standardized.season = [standardized.season];
  }

  if (!standardized.elementalProperties) {
    standardized.elementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
  } else {
    const props = standardized.elementalProperties as Record<string, number>;
    const elements = ["Fire", "Water", "Earth", "Air"];
    let sum = 0;

    for (const elem of elements) {
      const val = typeof props[elem] === "number" ? props[elem] : 0.25;
      props[elem] = val;
      sum += val;
    }

    if (Math.abs(sum - 1) > 0.01 && sum > 0) {
      for (const elem of elements) {
        props[elem] = props[elem] / sum;
      }
    }

    standardized.elementalProperties = props;
  }

  if (
    standardized.servingSize === undefined ||
    standardized.servingSize === null
  ) {
    standardized.servingSize = standardized.numberOfServings || 4;
  } else if (typeof standardized.servingSize === "string") {
    standardized.servingSize = parseInt(standardized.servingSize, 10) || 4;
  }

  if (
    (!standardized.instructions ||
      !Array.isArray(standardized.instructions) ||
      standardized.instructions.length === 0) &&
    Array.isArray(standardized.preparationSteps) &&
    standardized.preparationSteps.length > 0
  ) {
    standardized.instructions = standardized.preparationSteps;
  }

  if (!Array.isArray(standardized.instructions)) {
    if (typeof standardized.instructions === "string") {
      standardized.instructions = [standardized.instructions];
    } else {
      standardized.instructions = ["Prepare according to traditional methods"];
    }
  }

  if (!Array.isArray(standardized.ingredients)) {
    standardized.ingredients = [];
  } else {
    standardized.ingredients = standardized.ingredients.map((ing: any) => {
      if (!ing || typeof ing !== "object") return ing;

      return {
        ...ing,
        amount:
          typeof ing.amount === "number"
            ? ing.amount
            : typeof ing.amount === "string"
              ? parseFloat(ing.amount) || 1
              : 1,
        unit: ing.unit || "piece",
        name:
          typeof ing.name === "string"
            ? ing.name.toLowerCase()
            : String(ing.name || ""),
      };
    });
  }

  if (
    standardized.cookingMethods &&
    !Array.isArray(standardized.cookingMethods)
  ) {
    standardized.cookingMethods = [standardized.cookingMethods];
  }

  if (standardized.tools && !Array.isArray(standardized.tools)) {
    standardized.tools = [standardized.tools];
  }

  if (standardized.allergens && !Array.isArray(standardized.allergens)) {
    standardized.allergens = [standardized.allergens];
  }

  // Cooking methods live under `classifications.cookingMethods` in the
  // cuisine data; the legacy top-level `cookingMethods`/`cookingMethod`
  // are also accepted. Without this lookup the Monica heuristic always
  // received an empty array and produced a flat default for every recipe.
  const classifications = (standardized.classifications ?? {}) as Record<
    string,
    unknown
  >;
  const methods = Array.isArray(standardized.cookingMethods)
    ? standardized.cookingMethods
    : Array.isArray(standardized.cookingMethod)
      ? (standardized.cookingMethod as unknown[])
      : Array.isArray(classifications.cookingMethods)
        ? (classifications.cookingMethods as unknown[])
        : [];
  const monicaScore = calculateMethodMonicaScore(methods);
  standardized.monicaScore = monicaScore;
  standardized.monicaScoreLabel = classifyMonicaScoreLabel(monicaScore);

  return { standardizedRecipe: standardized as unknown as Recipe, wasOriginallyEnhanced };
}

// ============ FLATTEN & DEDUPLICATE ============

export const PRIMARY_CUISINE_KEYS = [
  "African",
  "American",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mexican",
  "Middle Eastern",
  "Russian",
  "Thai",
  "Vietnamese",
  "HSCA",
] as const;

/**
 * Create a flattened, deduplicated list of all recipes from cuisines data.
 */
export const flattenCuisineRecipes = (cuisinesData: Record<string, any>): Recipe[] => {
  const recipeMap = new Map<string, Recipe>();
  const enhancedFlags = new Map<string, boolean>();

  PRIMARY_CUISINE_KEYS.forEach((cuisineName) => {
    const cuisine = cuisinesData[cuisineName] || cuisinesData[cuisineName.toLowerCase()] || cuisinesData[cuisineName.toUpperCase()];

    if (cuisine && cuisine.dishes) {
      Object.entries(cuisine.dishes).forEach(
        ([mealType, mealTypeData]: [string, unknown]) => {
          if (mealTypeData && typeof mealTypeData === "object") {
            Object.entries(mealTypeData as Record<string, unknown>).forEach(
              ([season, recipes]: [string, unknown]) => {
                if (Array.isArray(recipes)) {
                  recipes.forEach((recipe: any) => {
                    if (!recipe || typeof recipe !== "object" || !recipe.name) {
                      return;
                    }

                    const rawName = String(recipe.name);
                    const isEnhanced = rawName.includes("(Monica Enhanced)");
                    const normalizedKey = normalizeRecipeName(rawName);

                    const { standardizedRecipe } =
                      standardizeRecipe(
                        recipe,
                        cuisineName,
                        mealType,
                        season,
                      );

                    const existingEntry = recipeMap.get(normalizedKey);

                    if (!existingEntry) {
                      recipeMap.set(normalizedKey, standardizedRecipe);
                      enhancedFlags.set(normalizedKey, isEnhanced);
                    } else {
                      const existingIsEnhanced = enhancedFlags.get(normalizedKey) || false;

                      if (existingIsEnhanced && !isEnhanced) {
                        recipeMap.set(normalizedKey, standardizedRecipe);
                        enhancedFlags.set(normalizedKey, false);
                      } else if (!existingIsEnhanced && isEnhanced) {
                        // Skip
                      } else {
                        const existingFields = countPopulatedFields(
                          existingEntry,
                        );
                        const newFields = countPopulatedFields(
                          standardizedRecipe,
                        );
                        if (newFields > existingFields) {
                          recipeMap.set(normalizedKey, standardizedRecipe);
                          enhancedFlags.set(normalizedKey, isEnhanced);
                        }
                      }
                    }
                  });
                }
              },
            );
          }
        },
      );
    }
  });

  return Array.from(recipeMap.values());
};
