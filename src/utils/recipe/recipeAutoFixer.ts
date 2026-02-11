/**
 * Recipe Auto-Fixer
 * Automatically fixes common recipe data issues
 *
 * @file src/utils/recipe/recipeAutoFixer.ts
 * @created 2026-01-28
 */

import type {
  Recipe,
  RecipeIngredient,
  ElementalProperties,
} from "@/types/recipe";
import {
  generateRecipeId,
  normalizeTimeToMinutes,
  validateRecipe,
  type ValidationIssue,
} from "./recipeSchemaValidator";

// ============ FIX TYPES ============

export interface FixResult {
  field: string;
  originalValue: unknown;
  fixedValue: unknown;
  description: string;
}

export interface RecipeFixResult {
  recipeId: string;
  recipeName: string;
  fixes: FixResult[];
  fixedRecipe: Record<string, unknown>;
  remainingIssues: ValidationIssue[];
}

export interface BatchFixResult {
  totalRecipes: number;
  recipesFixed: number;
  recipesUnchanged: number;
  totalFixes: number;
  fixesByType: Record<string, number>;
  fixedRecipes: RecipeFixResult[];
  unfixedRecipes: Array<{
    id: string;
    name: string;
    issues: ValidationIssue[];
  }>;
}

export interface FixOptions {
  generateIds?: boolean;
  normalizeTimeFOrmat?: boolean;
  addDefaultElemental?: boolean;
  addDefaultServingSize?: boolean;
  normalizeArrayFields?: boolean;
  normalizeSeasons?: boolean;
  normalizeMealTypes?: boolean;
  normalizeSpiceLevel?: boolean;
  normalizeIngredients?: boolean;
  copyInstructionsFromSteps?: boolean;
}

const DEFAULT_FIX_OPTIONS: FixOptions = {
  generateIds: true,
  normalizeTimeFOrmat: true,
  addDefaultElemental: true,
  addDefaultServingSize: true,
  normalizeArrayFields: true,
  normalizeSeasons: true,
  normalizeMealTypes: true,
  normalizeSpiceLevel: true,
  normalizeIngredients: true,
  copyInstructionsFromSteps: true,
};

// ============ FIX FUNCTIONS ============

/**
 * Fix recipe ID
 */
function fixId(recipe: Record<string, unknown>): FixResult | null {
  if (recipe.id && typeof recipe.id === "string" && recipe.id.trim()) {
    return null;
  }

  const name = String(recipe.name || "unnamed");
  const cuisine = recipe.cuisine as string | undefined;
  const newId = generateRecipeId(name, cuisine);

  return {
    field: "id",
    originalValue: recipe.id,
    fixedValue: newId,
    description: `Generated ID from name and cuisine`,
  };
}

/**
 * Normalize time format to "X minutes" or "X hours"
 */
function fixTimeFormat(value: unknown, field: string): FixResult | null {
  if (!value) return null;

  const minutes = normalizeTimeToMinutes(value);
  if (minutes === null) return null;

  let newValue: string;
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    newValue = hours === 1 ? "1 hour" : `${hours} hours`;
  } else if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    newValue = `${hours} hour${hours > 1 ? "s" : ""} ${mins} minutes`;
  } else {
    newValue = `${minutes} minutes`;
  }

  if (newValue === value) return null;

  return {
    field,
    originalValue: value,
    fixedValue: newValue,
    description: `Normalized time format`,
  };
}

/**
 * Add default elemental properties
 */
function fixElementalProperties(
  recipe: Record<string, unknown>,
): FixResult | null {
  if (recipe.elementalProperties) {
    // Validate and potentially normalize existing properties
    const props = recipe.elementalProperties as Record<string, unknown>;
    const elements = ["Fire", "Water", "Earth", "Air"];

    let needsFix = false;
    const values: Record<string, number> = {};

    for (const elem of elements) {
      const val = props[elem];
      if (typeof val !== "number" || val < 0 || val > 1) {
        needsFix = true;
        values[elem] = 0.25;
      } else {
        values[elem] = val;
      }
    }

    const sum = Object.values(values).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.01) {
      needsFix = true;
      // Normalize
      for (const elem of elements) {
        values[elem] = values[elem] / sum;
      }
    }

    if (!needsFix) return null;

    return {
      field: "elementalProperties",
      originalValue: recipe.elementalProperties,
      fixedValue: values,
      description: "Normalized elemental properties to sum to 1.0",
    };
  }

  // Generate default balanced elemental properties
  return {
    field: "elementalProperties",
    originalValue: undefined,
    fixedValue: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    description: "Added default balanced elemental properties",
  };
}

/**
 * Fix serving size
 */
function fixServingSize(recipe: Record<string, unknown>): FixResult | null {
  if (typeof recipe.servingSize === "number" && recipe.servingSize > 0) {
    return null;
  }

  // Try to get from numberOfServings
  if (
    typeof recipe.numberOfServings === "number" &&
    recipe.numberOfServings > 0
  ) {
    return {
      field: "servingSize",
      originalValue: recipe.servingSize,
      fixedValue: recipe.numberOfServings,
      description: "Copied from numberOfServings field",
    };
  }

  // Parse string value
  if (typeof recipe.servingSize === "string") {
    const parsed = parseInt(recipe.servingSize, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return {
        field: "servingSize",
        originalValue: recipe.servingSize,
        fixedValue: parsed,
        description: "Converted string to number",
      };
    }
  }

  return {
    field: "servingSize",
    originalValue: recipe.servingSize,
    fixedValue: 4,
    description: "Added default serving size of 4",
  };
}

/**
 * Ensure array field is actually an array
 */
function fixArrayField(value: unknown, field: string): FixResult | null {
  if (Array.isArray(value)) {
    // Filter out empty strings and nulls
    const cleaned = value.filter(
      (v) => v !== null && v !== undefined && v !== "",
    );
    if (cleaned.length === value.length) return null;

    return {
      field,
      originalValue: value,
      fixedValue: cleaned,
      description: "Removed empty values from array",
    };
  }

  if (typeof value === "string" && value.trim()) {
    return {
      field,
      originalValue: value,
      fixedValue: [value],
      description: "Converted string to array",
    };
  }

  return null;
}

/**
 * Normalize season values
 */
function fixSeasons(recipe: Record<string, unknown>): FixResult | null {
  if (!recipe.season) {
    return {
      field: "season",
      originalValue: undefined,
      fixedValue: ["all"],
      description: "Added default season",
    };
  }

  const validSeasons = ["spring", "summer", "autumn", "winter", "fall", "all"];
  const seasons = Array.isArray(recipe.season)
    ? recipe.season
    : [recipe.season];

  const normalized = seasons
    .map((s) => {
      if (typeof s !== "string") return "all";
      const lower = s.toLowerCase().trim();
      // Map "fall" to "autumn"
      if (lower === "fall") return "autumn";
      if (validSeasons.includes(lower)) return lower;
      return null;
    })
    .filter((s): s is string => s !== null);

  if (normalized.length === 0) {
    normalized.push("all");
  }

  // Check if changed
  const original = Array.isArray(recipe.season)
    ? recipe.season
    : [recipe.season];
  if (JSON.stringify(normalized) === JSON.stringify(original)) return null;

  return {
    field: "season",
    originalValue: recipe.season,
    fixedValue: normalized,
    description: "Normalized season values",
  };
}

/**
 * Normalize meal type values
 */
function fixMealTypes(recipe: Record<string, unknown>): FixResult | null {
  if (!recipe.mealType) {
    return {
      field: "mealType",
      originalValue: undefined,
      fixedValue: ["dinner"],
      description: "Added default meal type",
    };
  }

  const validMealTypes = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "dessert",
    "brunch",
    "appetizer",
  ];
  const mealTypes = Array.isArray(recipe.mealType)
    ? recipe.mealType
    : [recipe.mealType];

  const normalized = mealTypes
    .map((m) => {
      if (typeof m !== "string") return "dinner";
      const lower = m.toLowerCase().trim();
      if (validMealTypes.includes(lower)) return lower;
      // Try to map common variations
      if (lower === "main" || lower === "entree") return "dinner";
      if (lower === "starter") return "appetizer";
      if (lower === "sweet") return "dessert";
      return null;
    })
    .filter((m): m is string => m !== null);

  if (normalized.length === 0) {
    normalized.push("dinner");
  }

  const original = Array.isArray(recipe.mealType)
    ? recipe.mealType
    : [recipe.mealType];
  if (JSON.stringify(normalized) === JSON.stringify(original)) return null;

  return {
    field: "mealType",
    originalValue: recipe.mealType,
    fixedValue: normalized,
    description: "Normalized meal type values",
  };
}

/**
 * Normalize spice level
 */
function fixSpiceLevel(recipe: Record<string, unknown>): FixResult | null {
  const spiceLevel = recipe.spiceLevel;

  if (spiceLevel === undefined || spiceLevel === null) {
    return null; // Spice level is optional
  }

  if (typeof spiceLevel === "number") {
    if (spiceLevel >= 0 && spiceLevel <= 5) return null;
    return {
      field: "spiceLevel",
      originalValue: spiceLevel,
      fixedValue: Math.max(0, Math.min(5, spiceLevel)),
      description: "Clamped spice level to valid range 0-5",
    };
  }

  if (typeof spiceLevel === "string") {
    const lower = spiceLevel.toLowerCase().trim();
    const validLevels: Record<string, string | number> = {
      none: 0,
      mild: 1,
      medium: 2,
      hot: 3,
      "very hot": 4,
      extreme: 5,
    };

    if (validLevels[lower] !== undefined) {
      // Keep string format for valid strings
      if (["none", "mild", "medium", "hot", "very hot"].includes(lower)) {
        if (lower === spiceLevel) return null;
        return {
          field: "spiceLevel",
          originalValue: spiceLevel,
          fixedValue: lower,
          description: "Normalized spice level string",
        };
      }
    }

    // Try to convert to number
    const num = parseInt(lower, 10);
    if (!isNaN(num)) {
      return {
        field: "spiceLevel",
        originalValue: spiceLevel,
        fixedValue: Math.max(0, Math.min(5, num)),
        description: "Converted spice level string to number",
      };
    }
  }

  return {
    field: "spiceLevel",
    originalValue: spiceLevel,
    fixedValue: "mild",
    description: "Replaced invalid spice level with default",
  };
}

/**
 * Fix ingredient data
 */
function fixIngredients(recipe: Record<string, unknown>): FixResult | null {
  if (!Array.isArray(recipe.ingredients)) return null;

  let hasChanges = false;
  const fixedIngredients = recipe.ingredients.map((ing: unknown) => {
    if (!ing || typeof ing !== "object") return ing;

    const ingredient = { ...(ing as Record<string, unknown>) };

    // Ensure amount is a number
    if (ingredient.amount !== undefined) {
      if (typeof ingredient.amount === "string") {
        const parsed = parseFloat(ingredient.amount);
        if (!isNaN(parsed)) {
          ingredient.amount = parsed;
          hasChanges = true;
        }
      }
    } else {
      ingredient.amount = 1;
      hasChanges = true;
    }

    // Ensure unit exists
    if (!ingredient.unit || typeof ingredient.unit !== "string") {
      ingredient.unit = "piece";
      hasChanges = true;
    }

    // Ensure name is lowercase
    if (typeof ingredient.name === "string") {
      const lowerName = ingredient.name.toLowerCase();
      if (lowerName !== ingredient.name) {
        ingredient.name = lowerName;
        hasChanges = true;
      }
    }

    return ingredient;
  });

  if (!hasChanges) return null;

  return {
    field: "ingredients",
    originalValue: recipe.ingredients,
    fixedValue: fixedIngredients,
    description: "Normalized ingredient data (amounts, units, names)",
  };
}

/**
 * Copy instructions from preparationSteps if missing
 */
function fixInstructions(recipe: Record<string, unknown>): FixResult | null {
  if (Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
    return null;
  }

  if (
    Array.isArray(recipe.preparationSteps) &&
    recipe.preparationSteps.length > 0
  ) {
    return {
      field: "instructions",
      originalValue: recipe.instructions,
      fixedValue: recipe.preparationSteps,
      description: "Copied from preparationSteps field",
    };
  }

  return null;
}

// ============ MAIN FIX FUNCTION ============

/**
 * Apply all available fixes to a single recipe
 */
export function fixRecipe(
  recipe: unknown,
  options: FixOptions = DEFAULT_FIX_OPTIONS,
): RecipeFixResult {
  if (!recipe || typeof recipe !== "object") {
    return {
      recipeId: "unknown",
      recipeName: "unknown",
      fixes: [],
      fixedRecipe: recipe as Record<string, unknown>,
      remainingIssues: [
        {
          field: "recipe",
          severity: "error",
          message: "Recipe is not a valid object",
          currentValue: recipe,
          autoFixable: false,
        },
      ],
    };
  }

  const recipeObj = { ...(recipe as Record<string, unknown>) };
  const fixes: FixResult[] = [];

  // Apply fixes in order
  if (options.generateIds) {
    const fix = fixId(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.id = fix.fixedValue;
    }
  }

  if (options.normalizeTimeFOrmat) {
    const prepFix = fixTimeFormat(recipeObj.prepTime, "prepTime");
    if (prepFix) {
      fixes.push(prepFix);
      recipeObj.prepTime = prepFix.fixedValue;
    }

    const cookFix = fixTimeFormat(recipeObj.cookTime, "cookTime");
    if (cookFix) {
      fixes.push(cookFix);
      recipeObj.cookTime = cookFix.fixedValue;
    }
  }

  if (options.addDefaultServingSize) {
    const fix = fixServingSize(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.servingSize = fix.fixedValue;
    }
  }

  if (options.addDefaultElemental) {
    const fix = fixElementalProperties(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.elementalProperties = fix.fixedValue;
    }
  }

  if (options.normalizeSeasons) {
    const fix = fixSeasons(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.season = fix.fixedValue;
    }
  }

  if (options.normalizeMealTypes) {
    const fix = fixMealTypes(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.mealType = fix.fixedValue;
    }
  }

  if (options.normalizeSpiceLevel) {
    const fix = fixSpiceLevel(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.spiceLevel = fix.fixedValue;
    }
  }

  if (options.normalizeIngredients) {
    const fix = fixIngredients(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.ingredients = fix.fixedValue;
    }
  }

  if (options.copyInstructionsFromSteps) {
    const fix = fixInstructions(recipeObj);
    if (fix) {
      fixes.push(fix);
      recipeObj.instructions = fix.fixedValue;
    }
  }

  if (options.normalizeArrayFields) {
    const arrayFields = [
      "cookingMethods",
      "tools",
      "allergens",
      "dietaryInfo",
      "tags",
    ];
    for (const field of arrayFields) {
      if (recipeObj[field]) {
        const fix = fixArrayField(recipeObj[field], field);
        if (fix) {
          fixes.push(fix);
          recipeObj[field] = fix.fixedValue;
        }
      }
    }
  }

  // Validate remaining issues
  const validationResult = validateRecipe(recipeObj);
  const remainingIssues = validationResult.issues.filter((i) => !i.autoFixable);

  return {
    recipeId: String(recipeObj.id || "unknown"),
    recipeName: String(recipeObj.name || "unknown"),
    fixes,
    fixedRecipe: recipeObj,
    remainingIssues,
  };
}

/**
 * Apply fixes to all recipes in a batch
 */
export function fixAllRecipes(
  recipes: unknown[],
  options: FixOptions = DEFAULT_FIX_OPTIONS,
): BatchFixResult {
  if (!Array.isArray(recipes)) {
    return {
      totalRecipes: 0,
      recipesFixed: 0,
      recipesUnchanged: 0,
      totalFixes: 0,
      fixesByType: {},
      fixedRecipes: [],
      unfixedRecipes: [],
    };
  }

  const fixedRecipes: RecipeFixResult[] = [];
  const unfixedRecipes: Array<{
    id: string;
    name: string;
    issues: ValidationIssue[];
  }> = [];
  const fixesByType: Record<string, number> = {};
  let totalFixes = 0;
  let recipesFixed = 0;

  for (const recipe of recipes) {
    const result = fixRecipe(recipe, options);

    if (result.fixes.length > 0) {
      recipesFixed++;
      fixedRecipes.push(result);
      totalFixes += result.fixes.length;

      for (const fix of result.fixes) {
        fixesByType[fix.field] = (fixesByType[fix.field] || 0) + 1;
      }
    }

    if (result.remainingIssues.length > 0) {
      unfixedRecipes.push({
        id: result.recipeId,
        name: result.recipeName,
        issues: result.remainingIssues,
      });
    }
  }

  return {
    totalRecipes: recipes.length,
    recipesFixed,
    recipesUnchanged: recipes.length - recipesFixed,
    totalFixes,
    fixesByType,
    fixedRecipes,
    unfixedRecipes,
  };
}

/**
 * Get the fixed recipe data from a batch result
 */
export function extractFixedRecipes(
  batchResult: BatchFixResult,
): Record<string, unknown>[] {
  return batchResult.fixedRecipes.map((r) => r.fixedRecipe);
}

// ============ EXPORTS ============

export default {
  fixRecipe,
  fixAllRecipes,
  extractFixedRecipes,
};
