import type { Recipe, ElementalProperties } from "@/types/recipe";
import cuisinesMap from "@/data/cuisines/index";

// Primary cuisines to use for recipe extraction (14 cuisines, avoids duplicates)
// We use the capitalized keys from the cuisines map to avoid counting aliases
const PRIMARY_CUISINE_KEYS = [
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
] as const;

// Re-export for backward compatibility
export const Recipes = cuisinesMap;

// ============ NAME NORMALIZATION & DEDUPLICATION ============

/**
 * Normalize a recipe name for use as a deduplication key.
 * Strips "(Monica Enhanced)", trailing numbers/copy suffixes,
 * and reduces to lowercase alphanumeric + spaces.
 */
function normalizeRecipeName(name: string): string {
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
function countPopulatedFields(recipe: Record<string, unknown>): number {
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
 *
 * Algorithm:
 *   Base score: 50
 *   High Reactivity methods: +15 each
 *   High Stability methods: +10 each
 *   High Harmony methods: +5 each
 *   Molecular/Spherification modifier: +20
 *   Microwave/Reheat modifier: -10
 *   Result clamped to [0, 100]
 */
function calculateMethodMonicaScore(cookingMethods: unknown[]): number {
  if (!cookingMethods || cookingMethods.length === 0) return 50;

  let score = 50;

  for (const method of cookingMethods) {
    // Cooking methods can be strings or objects with a .name property
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

    // Molecular / Spherification bonus
    if (MOLECULAR_KEYWORDS.some((kw) => normalized.includes(kw))) {
      score += 20;
    }

    // Entropic loss for microwave / reheat
    if (ENTROPIC_KEYWORDS.some((kw) => normalized.includes(kw))) {
      score -= 10;
    }
  }

  // Clamp to [0, 100]
  return Math.max(0, Math.min(100, score));
}

/**
 * Classify a Monica score into a human-readable label.
 */
function classifyMonicaScoreLabel(score: number): string {
  if (score >= 90) return "Alchemical Gold";
  if (score >= 75) return "Philosopher's Stone";
  if (score >= 60) return "Harmonious";
  if (score >= 45) return "Transitional";
  if (score >= 30) return "Volatile";
  return "Entropic";
}

// ============ INLINE RECIPE STANDARDIZATION ============
// Apply standardization fixes at load time for consistent data

/**
 * Generate a standardized ID from recipe name and cuisine.
 * Season is included to ensure uniqueness across seasonal variants.
 */
function generateRecipeId(
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

  if (season) { // Include season in the ID to ensure uniqueness
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
 * Also computes and attaches the monicaScore field.
 */
function standardizeRecipe(
  recipe: any,
  cuisineName: string,
  mealType: string,
  season: string,
): { standardizedRecipe: Recipe; wasOriginallyEnhanced: boolean } {
  // Ensure the recipe is an object
  if (!recipe || typeof recipe !== "object") {
    return { standardizedRecipe: recipe, wasOriginallyEnhanced: false };
  }

  const standardized: Record<string, unknown> = { ...recipe };
  let wasOriginallyEnhanced = false;

  // 1. Strip "(Monica Enhanced)" from name; canonical name drives the ID
  let canonicalName = (standardized.name as string) || "unnamed";
  if (canonicalName.includes("(Monica Enhanced)")) {
    canonicalName = canonicalName.replace(/\s*\(Monica Enhanced\)\s*/g, "").trim();
    wasOriginallyEnhanced = true;
  }
  standardized.name = canonicalName;
  standardized.id = generateRecipeId(canonicalName, cuisineName, mealType, season);

  // 2. Ensure cuisine is set and consistent casing
  // Strip regional sub-tags like "Indian (South)" → "indian", "Mexican (Yucatan)" → "mexican"
  if (!standardized.cuisine) {
    standardized.cuisine = cuisineName.toLowerCase();
  } else {
    const rawCuisine = (standardized.cuisine as string);
    // Preserve regional info as a separate field before normalizing
    const regionMatch = rawCuisine.match(/\(([^)]+)\)/);
    if (regionMatch) {
      standardized.regionalVariant = regionMatch[1].trim();
    }
    // Strip parenthetical regional tags and normalize to base cuisine name
    standardized.cuisine = rawCuisine.replace(/\s*\([^)]*\)\s*/g, "").trim().toLowerCase();
  }

  // 3. Ensure mealType is an array
  if (!standardized.mealType) {
    standardized.mealType = [mealType];
  } else if (!Array.isArray(standardized.mealType)) {
    standardized.mealType = [standardized.mealType];
  }

  // 4. Ensure season is an array
  if (!standardized.season) {
    standardized.season =
      season === "all" ? ["spring", "summer", "autumn", "winter"] : [season];
  } else if (!Array.isArray(standardized.season)) {
    standardized.season = [standardized.season];
  }

  // 5. Add default elemental properties if missing
  if (!standardized.elementalProperties) {
    standardized.elementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    } as ElementalProperties;
  } else {
    // Normalize existing elemental properties
    const props = standardized.elementalProperties as Record<string, number>;
    const elements = ["Fire", "Water", "Earth", "Air"];
    let sum = 0;

    for (const elem of elements) {
      const val = typeof props[elem] === "number" ? props[elem] : 0.25;
      props[elem] = val;
      sum += val;
    }

    // Normalize to sum to 1.0 if needed
    if (Math.abs(sum - 1) > 0.01 && sum > 0) {
      for (const elem of elements) {
        props[elem] = props[elem] / sum;
      }
    }

    standardized.elementalProperties = props as unknown as ElementalProperties;
  }

  // 6. Ensure servingSize is a number
  if (
    standardized.servingSize === undefined ||
    standardized.servingSize === null
  ) {
    standardized.servingSize = standardized.numberOfServings || 4;
  } else if (typeof standardized.servingSize === "string") {
    standardized.servingSize = parseInt(standardized.servingSize, 10) || 4;
  }

  // 7. Copy instructions from preparationSteps if missing
  if (
    (!standardized.instructions ||
      !Array.isArray(standardized.instructions) ||
      standardized.instructions.length === 0) &&
    Array.isArray(standardized.preparationSteps) &&
    standardized.preparationSteps.length > 0
  ) {
    standardized.instructions = standardized.preparationSteps;
  }

  // 8. Ensure instructions is an array
  if (!Array.isArray(standardized.instructions)) {
    if (typeof standardized.instructions === "string") {
      standardized.instructions = [standardized.instructions];
    } else {
      standardized.instructions = ["Prepare according to traditional methods"];
    }
  }

  // 9. Ensure ingredients array exists and has proper structure
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

  // 10. Ensure cookingMethods is an array
  if (
    standardized.cookingMethods &&
    !Array.isArray(standardized.cookingMethods)
  ) {
    standardized.cookingMethods = [standardized.cookingMethods];
  }

  // 11. Ensure tools is an array
  if (standardized.tools && !Array.isArray(standardized.tools)) {
    standardized.tools = [standardized.tools];
  }

  // 12. Ensure allergens is an array
  if (standardized.allergens && !Array.isArray(standardized.allergens)) {
    standardized.allergens = [standardized.allergens];
  }

  // 13. Compute monicaScore from cooking methods (deterministic heuristic)
  const methods = Array.isArray(standardized.cookingMethods)
    ? standardized.cookingMethods
    : [];
  const monicaScore = calculateMethodMonicaScore(methods);
  standardized.monicaScore = monicaScore;
  standardized.monicaScoreLabel = classifyMonicaScoreLabel(monicaScore);

  return { standardizedRecipe: standardized as unknown as Recipe, wasOriginallyEnhanced };
}

// ============ FLATTEN & DEDUPLICATE ============

/**
 * Create a flattened, deduplicated list of all recipes from all 14 primary cuisines.
 *
 * Deduplication strategy:
 *   - Uses normalized recipe name as the Map key (not the raw ID).
 *   - If a name collision occurs, keeps the version with more populated fields.
 *   - "(Monica Enhanced)" versions are stripped to their base name;
 *     the non-enhanced (original) version is preferred unless
 *     the enhanced version has strictly more data.
 */
const flattenCuisineRecipes = (): Recipe[] => {
  // Map from normalized name → Recipe (single source of truth)
  const recipeMap = new Map<string, Recipe>();
  // Track whether the stored recipe was a "Monica Enhanced" variant
  const enhancedFlags = new Map<string, boolean>();
  const cuisines = cuisinesMap as Record<string, any>;

  PRIMARY_CUISINE_KEYS.forEach((cuisineName) => {
    const cuisine = cuisines[cuisineName];

    if (cuisine && cuisine.dishes) {
      // Iterate through meal types (breakfast, lunch, dinner, dessert, snacks)
      Object.entries(cuisine.dishes).forEach(
        ([mealType, mealTypeData]: [string, unknown]) => {
          if (mealTypeData && typeof mealTypeData === "object") {
            // Iterate through seasons
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

                    // Standardize the recipe
                    const { standardizedRecipe } =
                      standardizeRecipe(
                        recipe,
                        cuisineName,
                        mealType,
                        season,
                      );

                    const existingEntry = recipeMap.get(normalizedKey);

                    if (!existingEntry) {
                      // First time seeing this recipe name — store it
                      recipeMap.set(normalizedKey, standardizedRecipe);
                      enhancedFlags.set(normalizedKey, isEnhanced);
                    } else {
                      // Collision: decide which version to keep
                      const existingIsEnhanced = enhancedFlags.get(normalizedKey) || false;

                      if (existingIsEnhanced && !isEnhanced) {
                        // Current is the original (non-enhanced); prefer it
                        recipeMap.set(normalizedKey, standardizedRecipe);
                        enhancedFlags.set(normalizedKey, false);
                      } else if (!existingIsEnhanced && isEnhanced) {
                        // Existing is original, incoming is enhanced; keep existing
                        // (original takes precedence)
                      } else {
                        // Same enhanced status — keep the more complete version
                        const existingFields = countPopulatedFields(
                          existingEntry as unknown as Record<string, unknown>,
                        );
                        const newFields = countPopulatedFields(
                          standardizedRecipe as unknown as Record<string, unknown>,
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
    } else {
      console.warn(
        `Cuisine ${cuisineName} not found or has no dishes in cuisinesMap.`,
      );
    }
  });

  return Array.from(recipeMap.values());
};

// Export flattened recipes from all 14 primary cuisines
export const allRecipes = flattenCuisineRecipes();

// Export recipe count for debugging
export const recipeCount = allRecipes.length;

// Note: getBestRecipeMatches moved to @/data/recipes to avoid circular dependency
