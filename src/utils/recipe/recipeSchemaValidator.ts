/**
 * Recipe Schema Validator
 * Comprehensive validation for recipe data standardization
 *
 * @file src/utils/recipe/recipeSchemaValidator.ts
 * @created 2026-01-28
 */

import type { Recipe, RecipeIngredient, ElementalProperties } from "@/types/recipe";

// ============ VALIDATION TYPES ============

export interface ValidationIssue {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  currentValue?: unknown;
  suggestedValue?: unknown;
  autoFixable: boolean;
}

export interface RecipeValidationResult {
  recipeId: string;
  recipeName: string;
  isValid: boolean;
  issues: ValidationIssue[];
  fieldCoverage: number; // Percentage of recommended fields present
  qualityScore: number; // 0-100 quality score
}

export interface ValidationReport {
  totalRecipes: number;
  validRecipes: number;
  invalidRecipes: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<"error" | "warning" | "info", number>;
  averageFieldCoverage: number;
  averageQualityScore: number;
  autoFixableIssues: number;
  recipeResults: RecipeValidationResult[];
}

export interface DuplicateGroup {
  recipes: Array<{
    id: string;
    name: string;
    cuisine?: string;
    similarity: number;
  }>;
  suggestedKeep: string;
  reason: string;
}

export interface DuplicateReport {
  totalDuplicateGroups: number;
  totalDuplicateRecipes: number;
  duplicateGroups: DuplicateGroup[];
}

// ============ FIELD DEFINITIONS ============

// Required fields that MUST be present
const REQUIRED_FIELDS = [
  "name",
  "ingredients",
  "instructions",
] as const;

// Recommended fields for high-quality recipes
const RECOMMENDED_FIELDS = [
  "id",
  "description",
  "cuisine",
  "cookingMethods",
  "prepTime",
  "cookTime",
  "servingSize",
  "season",
  "mealType",
  "elementalProperties",
  "nutrition",
  "dietaryInfo",
  "spiceLevel",
  "allergens",
] as const;

// Optional fields that enhance the recipe
const OPTIONAL_FIELDS = [
  "tools",
  "substitutions",
  "culturalNotes",
  "pairingSuggestions",
  "technicalTips",
  "astrologicalAffinities",
  "zodiacInfluences",
  "lunarPhaseInfluences",
  "preparationSteps",
  "preparationNotes",
] as const;

// Valid values for categorical fields
const VALID_SEASONS = ["spring", "summer", "autumn", "winter", "fall", "all"] as const;
const VALID_MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "dessert", "brunch", "appetizer"] as const;
const VALID_ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
const VALID_SPICE_LEVELS = ["none", "mild", "medium", "hot", "very hot"] as const;

// ============ VALIDATION FUNCTIONS ============

/**
 * Generate a standardized ID from recipe name and cuisine
 */
export function generateRecipeId(name: string, cuisine?: string): string {
  const baseName = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  if (cuisine) {
    const cuisinePart = cuisine.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${cuisinePart}-${baseName}`;
  }

  return baseName;
}

/**
 * Validate time format (e.g., "30 minutes", "1 hour", "1.5 hours")
 */
export function isValidTimeFormat(time: unknown): boolean {
  if (typeof time === "number") return time > 0;
  if (typeof time !== "string") return false;

  const timePatterns = [
    /^\d+\s*(min|mins|minute|minutes)$/i,
    /^\d+\s*(hr|hrs|hour|hours)$/i,
    /^\d+\.?\d*\s*(hr|hrs|hour|hours)$/i,
    /^\d+\s*h\s*\d*\s*m?$/i,
    /^\d+:\d{2}$/,
  ];

  return timePatterns.some(pattern => pattern.test(time.trim()));
}

/**
 * Normalize time to minutes
 */
export function normalizeTimeToMinutes(time: unknown): number | null {
  if (typeof time === "number") return time;
  if (typeof time !== "string") return null;

  const str = time.toLowerCase().trim();

  // Handle "X minutes" format
  const minMatch = str.match(/^(\d+\.?\d*)\s*(min|mins|minute|minutes)$/i);
  if (minMatch) return parseFloat(minMatch[1]);

  // Handle "X hours" format
  const hrMatch = str.match(/^(\d+\.?\d*)\s*(hr|hrs|hour|hours)$/i);
  if (hrMatch) return parseFloat(hrMatch[1]) * 60;

  // Handle "X h Y m" format
  const hhmMatch = str.match(/^(\d+)\s*h\s*(\d*)\s*m?$/i);
  if (hhmMatch) {
    const hours = parseInt(hhmMatch[1], 10);
    const mins = hhmMatch[2] ? parseInt(hhmMatch[2], 10) : 0;
    return hours * 60 + mins;
  }

  return null;
}

/**
 * Validate elemental properties sum to ~1.0
 */
export function validateElementalProperties(props: unknown): {
  isValid: boolean;
  issues: string[];
  normalized?: ElementalProperties;
} {
  if (!props || typeof props !== "object") {
    return { isValid: false, issues: ["Elemental properties missing or invalid"] };
  }

  const elemental = props as Record<string, unknown>;
  const issues: string[] = [];
  const values: Record<string, number> = {};

  // Check all required elements exist and are numbers
  for (const element of VALID_ELEMENTS) {
    const val = elemental[element];
    if (typeof val !== "number") {
      issues.push(`${element} is not a number`);
      values[element] = 0.25; // Default
    } else if (val < 0 || val > 1) {
      issues.push(`${element} value ${val} is out of range [0, 1]`);
      values[element] = Math.max(0, Math.min(1, val));
    } else {
      values[element] = val;
    }
  }

  // Check sum is approximately 1.0
  const sum = Object.values(values).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.01) {
    issues.push(`Elemental properties sum to ${sum.toFixed(3)}, should be 1.0`);
  }

  // Normalize if needed
  const normalized: ElementalProperties = {
    Fire: values.Fire / sum,
    Water: values.Water / sum,
    Earth: values.Earth / sum,
    Air: values.Air / sum,
  };

  return {
    isValid: issues.length === 0,
    issues,
    normalized,
  };
}

/**
 * Validate a single ingredient
 */
export function validateIngredient(ingredient: unknown, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!ingredient || typeof ingredient !== "object") {
    issues.push({
      field: `ingredients[${index}]`,
      severity: "error",
      message: "Ingredient is not a valid object",
      currentValue: ingredient,
      autoFixable: false,
    });
    return issues;
  }

  const ing = ingredient as Record<string, unknown>;

  // Check name
  if (!ing.name || typeof ing.name !== "string" || ing.name.trim() === "") {
    issues.push({
      field: `ingredients[${index}].name`,
      severity: "error",
      message: "Ingredient name is required",
      currentValue: ing.name,
      autoFixable: false,
    });
  }

  // Check amount
  if (ing.amount === undefined || ing.amount === null) {
    issues.push({
      field: `ingredients[${index}].amount`,
      severity: "warning",
      message: "Ingredient amount is missing",
      currentValue: ing.amount,
      suggestedValue: 1,
      autoFixable: true,
    });
  } else if (typeof ing.amount !== "number" && typeof ing.amount !== "string") {
    issues.push({
      field: `ingredients[${index}].amount`,
      severity: "warning",
      message: "Ingredient amount should be a number or string",
      currentValue: ing.amount,
      autoFixable: true,
    });
  }

  // Check unit
  if (!ing.unit || typeof ing.unit !== "string") {
    issues.push({
      field: `ingredients[${index}].unit`,
      severity: "warning",
      message: "Ingredient unit is missing",
      currentValue: ing.unit,
      suggestedValue: "piece",
      autoFixable: true,
    });
  }

  return issues;
}

/**
 * Validate a single recipe
 */
export function validateRecipe(recipe: unknown, index?: number): RecipeValidationResult {
  const issues: ValidationIssue[] = [];
  const prefix = index !== undefined ? `recipes[${index}]` : "";

  if (!recipe || typeof recipe !== "object") {
    return {
      recipeId: "unknown",
      recipeName: "unknown",
      isValid: false,
      issues: [{
        field: prefix || "recipe",
        severity: "error",
        message: "Recipe is not a valid object",
        currentValue: recipe,
        autoFixable: false,
      }],
      fieldCoverage: 0,
      qualityScore: 0,
    };
  }

  const r = recipe as Record<string, unknown>;
  const recipeName = typeof r.name === "string" ? r.name : "unnamed";
  const recipeId = typeof r.id === "string" ? r.id : generateRecipeId(recipeName, r.cuisine as string | undefined);

  // ============ REQUIRED FIELD VALIDATION ============

  // Name
  if (!r.name || typeof r.name !== "string" || r.name.trim() === "") {
    issues.push({
      field: "name",
      severity: "error",
      message: "Recipe name is required",
      currentValue: r.name,
      autoFixable: false,
    });
  }

  // Ingredients
  if (!r.ingredients || !Array.isArray(r.ingredients)) {
    issues.push({
      field: "ingredients",
      severity: "error",
      message: "Recipe ingredients array is required",
      currentValue: r.ingredients,
      autoFixable: false,
    });
  } else if (r.ingredients.length === 0) {
    issues.push({
      field: "ingredients",
      severity: "error",
      message: "Recipe must have at least one ingredient",
      currentValue: r.ingredients,
      autoFixable: false,
    });
  } else {
    // Validate each ingredient
    r.ingredients.forEach((ing, idx) => {
      issues.push(...validateIngredient(ing, idx));
    });
  }

  // Instructions
  if (!r.instructions && !r.preparationSteps) {
    issues.push({
      field: "instructions",
      severity: "error",
      message: "Recipe instructions are required",
      currentValue: r.instructions,
      autoFixable: false,
    });
  } else {
    const instructions = r.instructions || r.preparationSteps;
    if (!Array.isArray(instructions)) {
      issues.push({
        field: "instructions",
        severity: "warning",
        message: "Instructions should be an array of strings",
        currentValue: instructions,
        autoFixable: true,
      });
    } else if (instructions.length === 0) {
      issues.push({
        field: "instructions",
        severity: "warning",
        message: "Recipe should have at least one instruction",
        currentValue: instructions,
        autoFixable: false,
      });
    }
  }

  // ============ RECOMMENDED FIELD VALIDATION ============

  // ID
  if (!r.id || typeof r.id !== "string") {
    issues.push({
      field: "id",
      severity: "warning",
      message: "Recipe ID is recommended",
      currentValue: r.id,
      suggestedValue: recipeId,
      autoFixable: true,
    });
  }

  // Description
  if (!r.description || typeof r.description !== "string") {
    issues.push({
      field: "description",
      severity: "info",
      message: "Recipe description is recommended",
      currentValue: r.description,
      autoFixable: false,
    });
  }

  // Cuisine
  if (!r.cuisine || typeof r.cuisine !== "string") {
    issues.push({
      field: "cuisine",
      severity: "warning",
      message: "Cuisine type is recommended",
      currentValue: r.cuisine,
      autoFixable: false,
    });
  }

  // Prep Time
  if (!r.prepTime) {
    issues.push({
      field: "prepTime",
      severity: "info",
      message: "Prep time is recommended",
      currentValue: r.prepTime,
      autoFixable: false,
    });
  } else if (!isValidTimeFormat(r.prepTime)) {
    issues.push({
      field: "prepTime",
      severity: "warning",
      message: "Prep time format is invalid",
      currentValue: r.prepTime,
      suggestedValue: `${normalizeTimeToMinutes(r.prepTime) || 30} minutes`,
      autoFixable: true,
    });
  }

  // Cook Time
  if (!r.cookTime) {
    issues.push({
      field: "cookTime",
      severity: "info",
      message: "Cook time is recommended",
      currentValue: r.cookTime,
      autoFixable: false,
    });
  } else if (!isValidTimeFormat(r.cookTime)) {
    issues.push({
      field: "cookTime",
      severity: "warning",
      message: "Cook time format is invalid",
      currentValue: r.cookTime,
      suggestedValue: `${normalizeTimeToMinutes(r.cookTime) || 30} minutes`,
      autoFixable: true,
    });
  }

  // Serving Size
  if (r.servingSize === undefined || r.servingSize === null) {
    issues.push({
      field: "servingSize",
      severity: "info",
      message: "Serving size is recommended",
      currentValue: r.servingSize,
      suggestedValue: 4,
      autoFixable: true,
    });
  } else if (typeof r.servingSize !== "number" || r.servingSize < 1) {
    issues.push({
      field: "servingSize",
      severity: "warning",
      message: "Serving size should be a positive number",
      currentValue: r.servingSize,
      suggestedValue: 4,
      autoFixable: true,
    });
  }

  // Season
  if (!r.season) {
    issues.push({
      field: "season",
      severity: "info",
      message: "Season is recommended",
      currentValue: r.season,
      suggestedValue: ["all"],
      autoFixable: true,
    });
  } else {
    const seasons = Array.isArray(r.season) ? r.season : [r.season];
    const invalidSeasons = seasons.filter(
      s => typeof s !== "string" || !VALID_SEASONS.includes(s.toLowerCase() as any)
    );
    if (invalidSeasons.length > 0) {
      issues.push({
        field: "season",
        severity: "warning",
        message: `Invalid season values: ${invalidSeasons.join(", ")}`,
        currentValue: r.season,
        autoFixable: true,
      });
    }
  }

  // Meal Type
  if (!r.mealType) {
    issues.push({
      field: "mealType",
      severity: "info",
      message: "Meal type is recommended",
      currentValue: r.mealType,
      suggestedValue: ["dinner"],
      autoFixable: true,
    });
  } else {
    const mealTypes = Array.isArray(r.mealType) ? r.mealType : [r.mealType];
    const invalidTypes = mealTypes.filter(
      t => typeof t !== "string" || !VALID_MEAL_TYPES.includes(t.toLowerCase() as any)
    );
    if (invalidTypes.length > 0) {
      issues.push({
        field: "mealType",
        severity: "warning",
        message: `Invalid meal type values: ${invalidTypes.join(", ")}`,
        currentValue: r.mealType,
        autoFixable: true,
      });
    }
  }

  // Elemental Properties
  if (!r.elementalProperties) {
    issues.push({
      field: "elementalProperties",
      severity: "warning",
      message: "Elemental properties are recommended for astrological features",
      currentValue: r.elementalProperties,
      suggestedValue: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      autoFixable: true,
    });
  } else {
    const elemResult = validateElementalProperties(r.elementalProperties);
    if (!elemResult.isValid) {
      issues.push({
        field: "elementalProperties",
        severity: "warning",
        message: elemResult.issues.join("; "),
        currentValue: r.elementalProperties,
        suggestedValue: elemResult.normalized,
        autoFixable: true,
      });
    }
  }

  // Nutrition
  if (!r.nutrition) {
    issues.push({
      field: "nutrition",
      severity: "info",
      message: "Nutritional information is recommended",
      currentValue: r.nutrition,
      autoFixable: false,
    });
  }

  // Spice Level
  if (r.spiceLevel !== undefined && r.spiceLevel !== null) {
    if (typeof r.spiceLevel === "string") {
      if (!VALID_SPICE_LEVELS.includes(r.spiceLevel.toLowerCase() as any)) {
        issues.push({
          field: "spiceLevel",
          severity: "warning",
          message: `Invalid spice level: ${r.spiceLevel}`,
          currentValue: r.spiceLevel,
          suggestedValue: "mild",
          autoFixable: true,
        });
      }
    } else if (typeof r.spiceLevel === "number") {
      if (r.spiceLevel < 0 || r.spiceLevel > 5) {
        issues.push({
          field: "spiceLevel",
          severity: "warning",
          message: "Spice level should be 0-5 or a valid string",
          currentValue: r.spiceLevel,
          autoFixable: true,
        });
      }
    }
  }

  // Cooking Methods
  if (!r.cookingMethods || !Array.isArray(r.cookingMethods)) {
    issues.push({
      field: "cookingMethods",
      severity: "info",
      message: "Cooking methods are recommended",
      currentValue: r.cookingMethods,
      autoFixable: false,
    });
  }

  // ============ CALCULATE METRICS ============

  // Calculate field coverage
  const allRecommendedFields = [...REQUIRED_FIELDS, ...RECOMMENDED_FIELDS];
  const presentFields = allRecommendedFields.filter(field => {
    const value = r[field];
    if (value === undefined || value === null) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  });
  const fieldCoverage = (presentFields.length / allRecommendedFields.length) * 100;

  // Calculate quality score
  const errorCount = issues.filter(i => i.severity === "error").length;
  const warningCount = issues.filter(i => i.severity === "warning").length;
  const infoCount = issues.filter(i => i.severity === "info").length;

  let qualityScore = 100;
  qualityScore -= errorCount * 20;
  qualityScore -= warningCount * 5;
  qualityScore -= infoCount * 1;
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // Boost for good field coverage
  qualityScore = (qualityScore * 0.6) + (fieldCoverage * 0.4);

  return {
    recipeId,
    recipeName,
    isValid: errorCount === 0,
    issues,
    fieldCoverage: Math.round(fieldCoverage * 100) / 100,
    qualityScore: Math.round(qualityScore * 100) / 100,
  };
}

/**
 * Validate all recipes and generate a comprehensive report
 */
export function validateAllRecipes(recipes: unknown[]): ValidationReport {
  if (!Array.isArray(recipes)) {
    return {
      totalRecipes: 0,
      validRecipes: 0,
      invalidRecipes: 0,
      issuesByType: {},
      issuesBySeverity: { error: 0, warning: 0, info: 0 },
      averageFieldCoverage: 0,
      averageQualityScore: 0,
      autoFixableIssues: 0,
      recipeResults: [],
    };
  }

  const recipeResults = recipes.map((recipe, index) => validateRecipe(recipe, index));

  // Aggregate statistics
  const issuesByType: Record<string, number> = {};
  const issuesBySeverity: Record<"error" | "warning" | "info", number> = {
    error: 0,
    warning: 0,
    info: 0,
  };
  let autoFixableIssues = 0;

  recipeResults.forEach(result => {
    result.issues.forEach(issue => {
      issuesByType[issue.field] = (issuesByType[issue.field] || 0) + 1;
      issuesBySeverity[issue.severity]++;
      if (issue.autoFixable) autoFixableIssues++;
    });
  });

  const validRecipes = recipeResults.filter(r => r.isValid).length;
  const totalFieldCoverage = recipeResults.reduce((sum, r) => sum + r.fieldCoverage, 0);
  const totalQualityScore = recipeResults.reduce((sum, r) => sum + r.qualityScore, 0);

  return {
    totalRecipes: recipes.length,
    validRecipes,
    invalidRecipes: recipes.length - validRecipes,
    issuesByType,
    issuesBySeverity,
    averageFieldCoverage: recipes.length > 0 ? Math.round((totalFieldCoverage / recipes.length) * 100) / 100 : 0,
    averageQualityScore: recipes.length > 0 ? Math.round((totalQualityScore / recipes.length) * 100) / 100 : 0,
    autoFixableIssues,
    recipeResults,
  };
}

// ============ DUPLICATE DETECTION ============

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity between two recipe names (0-1)
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const s1 = name1.toLowerCase().trim();
  const s2 = name2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(s1, s2);
  return 1 - (distance / maxLen);
}

/**
 * Calculate similarity between two recipes
 */
function calculateRecipeSimilarity(recipe1: Record<string, unknown>, recipe2: Record<string, unknown>): number {
  let totalWeight = 0;
  let weightedSimilarity = 0;

  // Name similarity (weight: 0.4)
  const name1 = String(recipe1.name || "").toLowerCase();
  const name2 = String(recipe2.name || "").toLowerCase();
  if (name1 && name2) {
    weightedSimilarity += calculateNameSimilarity(name1, name2) * 0.4;
    totalWeight += 0.4;
  }

  // Cuisine match (weight: 0.2)
  const cuisine1 = String(recipe1.cuisine || "").toLowerCase();
  const cuisine2 = String(recipe2.cuisine || "").toLowerCase();
  if (cuisine1 && cuisine2) {
    weightedSimilarity += (cuisine1 === cuisine2 ? 1 : 0) * 0.2;
    totalWeight += 0.2;
  }

  // Ingredient overlap (weight: 0.3)
  const ingredients1 = Array.isArray(recipe1.ingredients)
    ? recipe1.ingredients.map((i: any) => String(i.name || i).toLowerCase())
    : [];
  const ingredients2 = Array.isArray(recipe2.ingredients)
    ? recipe2.ingredients.map((i: any) => String(i.name || i).toLowerCase())
    : [];

  if (ingredients1.length > 0 && ingredients2.length > 0) {
    const set1 = new Set(ingredients1);
    const set2 = new Set(ingredients2);
    const intersection = ingredients1.filter(i => set2.has(i)).length;
    const union = new Set([...ingredients1, ...ingredients2]).size;
    const ingredientSimilarity = union > 0 ? intersection / union : 0;
    weightedSimilarity += ingredientSimilarity * 0.3;
    totalWeight += 0.3;
  }

  // Cooking method match (weight: 0.1)
  const methods1 = Array.isArray(recipe1.cookingMethods)
    ? recipe1.cookingMethods.map(m => String(m).toLowerCase())
    : [];
  const methods2 = Array.isArray(recipe2.cookingMethods)
    ? recipe2.cookingMethods.map(m => String(m).toLowerCase())
    : [];

  if (methods1.length > 0 && methods2.length > 0) {
    const methodSet1 = new Set(methods1);
    const methodSet2 = new Set(methods2);
    const methodIntersection = methods1.filter(m => methodSet2.has(m)).length;
    const methodUnion = new Set([...methods1, ...methods2]).size;
    const methodSimilarity = methodUnion > 0 ? methodIntersection / methodUnion : 0;
    weightedSimilarity += methodSimilarity * 0.1;
    totalWeight += 0.1;
  }

  return totalWeight > 0 ? weightedSimilarity / totalWeight : 0;
}

/**
 * Detect duplicate recipes
 */
export function detectDuplicates(recipes: unknown[], similarityThreshold = 0.8): DuplicateReport {
  if (!Array.isArray(recipes) || recipes.length < 2) {
    return {
      totalDuplicateGroups: 0,
      totalDuplicateRecipes: 0,
      duplicateGroups: [],
    };
  }

  const duplicateGroups: DuplicateGroup[] = [];
  const processedIndices = new Set<number>();

  for (let i = 0; i < recipes.length; i++) {
    if (processedIndices.has(i)) continue;

    const recipe1 = recipes[i] as Record<string, unknown>;
    const group: DuplicateGroup["recipes"] = [{
      id: String(recipe1.id || `recipe-${i}`),
      name: String(recipe1.name || "unknown"),
      cuisine: recipe1.cuisine as string | undefined,
      similarity: 1,
    }];

    for (let j = i + 1; j < recipes.length; j++) {
      if (processedIndices.has(j)) continue;

      const recipe2 = recipes[j] as Record<string, unknown>;
      const similarity = calculateRecipeSimilarity(recipe1, recipe2);

      if (similarity >= similarityThreshold) {
        group.push({
          id: String(recipe2.id || `recipe-${j}`),
          name: String(recipe2.name || "unknown"),
          cuisine: recipe2.cuisine as string | undefined,
          similarity: Math.round(similarity * 100) / 100,
        });
        processedIndices.add(j);
      }
    }

    if (group.length > 1) {
      processedIndices.add(i);

      // Determine which recipe to keep
      const recipeObjects = group.map((g, idx) => ({
        ...g,
        originalIndex: idx === 0 ? i : -1,
        recipe: recipes[idx === 0 ? i : -1] as Record<string, unknown>,
      }));

      // Score recipes by completeness
      const scores = recipeObjects.map(r => {
        let score = 0;
        if (r.recipe) {
          if (r.recipe.id) score += 10;
          if (r.recipe.description) score += 5;
          if (Array.isArray(r.recipe.ingredients) && r.recipe.ingredients.length > 0) {
            score += r.recipe.ingredients.length;
          }
          if (Array.isArray(r.recipe.instructions) && r.recipe.instructions.length > 0) {
            score += r.recipe.instructions.length;
          }
          if (r.recipe.nutrition) score += 5;
          if (r.recipe.elementalProperties) score += 5;
        }
        return score;
      });

      const bestIndex = scores.indexOf(Math.max(...scores));

      duplicateGroups.push({
        recipes: group,
        suggestedKeep: group[bestIndex]?.id || group[0].id,
        reason: "Based on recipe completeness and data quality",
      });
    }
  }

  const totalDuplicateRecipes = duplicateGroups.reduce(
    (sum, group) => sum + group.recipes.length - 1, // -1 because we keep one
    0
  );

  return {
    totalDuplicateGroups: duplicateGroups.length,
    totalDuplicateRecipes,
    duplicateGroups,
  };
}

// ============ EXPORTS ============

export default {
  validateRecipe,
  validateAllRecipes,
  detectDuplicates,
  generateRecipeId,
  isValidTimeFormat,
  normalizeTimeToMinutes,
  validateElementalProperties,
  validateIngredient,
};
