// src/utils/instacart/priceEstimator.ts
/**
 * Intelligent Price Estimation System
 * 
 * Uses physical modeling (Density + Gram Conversion) and a comprehensive 
 * 2026 Price Database to provide realistic grocery cost estimates.
 * 
 * Integration:
 * 1. Physical properties from ingredientIntelligence.ts
 * 2. Market rates from priceDatabase.ts
 * 3. Confidence probing via Instacart IDP (Phase 2)
 */

import { CATEGORY_BASELINES, getPricePoint } from "../../constants/priceDatabase";
import { convertToGrams, getPriceTier } from "./ingredientIntelligence";
import type { IngredientCategory } from "./ingredientNormalizer";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  optional?: boolean;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface RecipeCostEstimate {
  totalCost: number;
  costPerServing: number;
  breakdown: Array<{ 
    ingredient: string; 
    estimatedCost: number; 
    confidence: "exact" | "fuzzy" | "fallback" 
  }>;
  confidence: "high" | "medium" | "low";
}

export interface BangForBuckScore {
  score: number;
  label: "Excellent" | "Good" | "Fair" | "Expensive";
  caloriesPerDollar: number;
  proteinPerDollar: number;
}

// ─── Logic ──────────────────────────────────────────────────────────────────

/**
 * Calculates the estimated cost of a single ingredient for one recipe
 */
export function estimateIngredientCost(
  ing: RecipeIngredient, 
  dietaryFlags: string[] = []
): { cost: number; confidence: "exact" | "fuzzy" | "fallback" } {
  const name = ing.name;
  const amount = ing.amount || 1;
  const unit = ing.unit || "each";
  
  // 1. Get Market Rate Info
  const priceMatch = getPricePoint(name);
  const tier = getPriceTier(name, dietaryFlags);
  
  // Tier Multipliers
  const TIER_MODIFIER = tier === "premium" ? 1.35 : tier === "pantry" ? 0.05 : 1.0;
  
  if (priceMatch) {
    const nLow = name.toLowerCase();
    const isExact = priceMatch.unit === unit || nLow.includes(Object.keys(getPricePoint(name) || {}).find(k => k === nLow) || "###");
    const confidence = isExact ? "exact" : ("fuzzy" as const);
    
    // Scale price based on units
    let cost = 0;
    if (priceMatch.unit === "each" || priceMatch.unit === "bulb" || priceMatch.unit === "clove" || priceMatch.unit === "bunch") {
       // Unit-based pricing
       cost = amount * priceMatch.basePrice;
    } else {
       // Gram/Weight based pricing
       const grams = convertToGrams(name, amount, unit);
       cost = grams * priceMatch.basePrice;
    }
    
    return { 
      cost: cost * TIER_MODIFIER, 
      confidence 
    };
  }

  // 2. Fallback to Category Baselines
  const category = (ing.category || "other") as IngredientCategory;
  const baselineRate = CATEGORY_BASELINES[category] || CATEGORY_BASELINES.other;
  const grams = convertToGrams(name, amount, unit);
  
  return { 
    cost: grams * baselineRate * TIER_MODIFIER, 
    confidence: "fallback" 
  };
}

/**
 * Estimate the total grocery cost of a single recipe
 */
export function calculateRecipeEstimatedCost(
  ingredients: RecipeIngredient[],
  servings: number = 4,
  dietaryFlags: string[] = []
): RecipeCostEstimate {
  const breakdown: RecipeCostEstimate["breakdown"] = [];
  let highConfidenceCount = 0;

  for (const ing of ingredients) {
    if (ing.optional) continue;
    
    const result = estimateIngredientCost(ing, dietaryFlags);
    if (result.confidence !== "fallback") highConfidenceCount++;
    
    breakdown.push({
      ingredient: ing.name,
      estimatedCost: Math.round(result.cost * 100) / 100,
      confidence: result.confidence
    });
  }

  const totalCost = breakdown.reduce((sum, b) => sum + b.estimatedCost, 0);
  const matchRatio = ingredients.length > 0 ? highConfidenceCount / ingredients.length : 0;
  
  return {
    totalCost: Math.round(totalCost * 100) / 100,
    costPerServing: Math.round((totalCost / servings) * 100) / 100,
    breakdown,
    confidence: matchRatio >= 0.7 ? "high" : matchRatio >= 0.4 ? "medium" : "low"
  };
}

/**
 * Calculate "Bang for the Buck"
 */
export function calculateBangForBuck(
  nutrition: RecipeNutrition | undefined | null,
  costPerServing: number
): BangForBuckScore {
  if (!nutrition || !nutrition.calories || costPerServing <= 0) {
    return { score: 50, label: "Fair", caloriesPerDollar: 0, proteinPerDollar: 0 };
  }

  const calPerDollar = nutrition.calories / costPerServing;
  const proPerDollar = (nutrition.protein ?? 0) / costPerServing;

  // Normalized score logic (Benchmark: 400 cal/$1, 10g pro/$1)
  const calScore = Math.min(100, (calPerDollar / 500) * 100);
  const proScore = Math.min(100, (proPerDollar / 15) * 100);
  const score = Math.round(calScore * 0.5 + proScore * 0.5);

  return {
    score,
    label: score >= 75 ? "Excellent" : score >= 55 ? "Good" : score >= 35 ? "Fair" : "Expensive",
    caloriesPerDollar: Math.round(calPerDollar),
    proteinPerDollar: Math.round(proPerDollar * 10) / 10
  };
}

/**
 * Estimate Weekly Grocery Cost
 * 
 * Accounts for bulk purchasing:
 * - If 3 recipes use onion, we estimate the cost of buy-one-bulk-pack
 * - Leftover quantities are tracked and subtracted from subsequent meals
 */
export function estimateWeeklyGroceryCost(
  recipes: Array<{ ingredients: RecipeIngredient[]; servings?: number; dietaryFlags?: string[] }>,
  _userInventory: string[] = []
): { totalCost: number; perMealAverage: number; recipeBreakdown: RecipeCostEstimate[] } {
  const recipeBreakdown: RecipeCostEstimate[] = [];
  
  // Track how much of each ingredient we've already "purchased" this week (in grams/units)
  const purchasedStock: Record<string, number> = {};
  let totalShoppedCost = 0;

  for (const recipe of recipes) {
    const ingredients = recipe.ingredients || [];
    const breakdown: RecipeCostEstimate["breakdown"] = [];
    let highConfidence = 0;

    for (const ing of ingredients) {
      if (ing.optional) continue;
      
      const name = ing.name.toLowerCase();
      const amount = ing.amount || 1;
      const unit = ing.unit || "each";
      const actualQuantity = convertToGrams(name, amount, unit);
      
      // Check if we have enough "purchasedStock" from previous meals
      const currentStock = purchasedStock[name] || 0;
      
      if (currentStock >= actualQuantity) {
        // We already bought enough, this meal is "free" for this item
        purchasedStock[name] = currentStock - actualQuantity;
        breakdown.push({ ingredient: ing.name, estimatedCost: 0, confidence: "exact" });
      } else {
        // Need to "buy" more.
        const result = estimateIngredientCost(ing, recipe.dietaryFlags || []);
        if (result.confidence !== "fallback") highConfidence++;
        
        // Cost simulation: assume we buy slightly more than needed (surplus for leftovers)
        const costToBuy = result.cost;
        totalShoppedCost += costToBuy;
        
        // Add to stock (assume we bought a surplus that covers 2-3 more uses)
        purchasedStock[name] = actualQuantity * 2; 
        
        breakdown.push({
          ingredient: ing.name,
          estimatedCost: Math.round(costToBuy * 100) / 100,
          confidence: result.confidence
        });
      }
    }
    
    const recipeTotal = breakdown.reduce((sum, b) => sum + b.estimatedCost, 0);
    const matchRatio = ingredients.length > 0 ? highConfidence / ingredients.length : 0;

    recipeBreakdown.push({
      totalCost: Math.round(recipeTotal * 100) / 100,
      costPerServing: Math.round((recipeTotal / (recipe.servings || 4)) * 100) / 100,
      breakdown,
      confidence: matchRatio >= 0.7 ? "high" : matchRatio >= 0.4 ? "medium" : "low"
    });
  }

  // Final Smoothing: apply a small discount for bulk staples
  const totalCost = Math.round(totalShoppedCost * 0.9 * 100) / 100;

  return {
    totalCost,
    perMealAverage: recipes.length > 0 ? Math.round((totalCost / recipes.length) * 100) / 100 : 0,
    recipeBreakdown
  };
}
