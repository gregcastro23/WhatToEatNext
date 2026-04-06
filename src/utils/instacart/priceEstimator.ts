// src/utils/instacart/priceEstimator.ts
/**
 * Price Estimation Heuristic for Budget-Aware Meal Planning
 *
 * Since Instacart's Connect API does not expose pre-checkout pricing,
 * we use a locally-maintained cost dictionary based on average US grocery
 * prices (2025-2026 BLS data) to estimate recipe costs and derive a
 * "bang-for-the-buck" score that correlates nutritional density with cost.
 *
 * @file src/utils/instacart/priceEstimator.ts
 * @created 2026-04-03
 */

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
  sodium?: number;
  sugar?: number;
}

export interface RecipeCostEstimate {
  /** Total estimated cost for all servings */
  totalCost: number;
  /** Cost per single serving */
  costPerServing: number;
  /** Individual ingredient cost breakdown */
  breakdown: Array<{ ingredient: string; estimatedCost: number }>;
  /** Confidence level: how many ingredients had a direct price match */
  confidence: "high" | "medium" | "low";
}

export interface BangForBuckScore {
  /** 0-100 score. Higher = more nutritional value per dollar */
  score: number;
  /** Human-readable label */
  label: "Excellent" | "Good" | "Fair" | "Expensive";
  /** Calories per dollar */
  caloriesPerDollar: number;
  /** Protein grams per dollar */
  proteinPerDollar: number;
}

// ─── Price Dictionary ───────────────────────────────────────────────────────
// Average US grocery prices in USD, keyed by normalised ingredient name.
// Amounts represent a typical grocery-store purchase unit.
// When a specific ingredient isn't found, we fall back to category averages.

const INGREDIENT_PRICES: Record<string, { price: number; unit: string; amount: number }> = {
  // ── Proteins ──
  "chicken breast": { price: 3.99, unit: "lb", amount: 1 },
  "chicken thigh": { price: 2.99, unit: "lb", amount: 1 },
  chicken: { price: 3.49, unit: "lb", amount: 1 },
  "ground beef": { price: 5.49, unit: "lb", amount: 1 },
  beef: { price: 6.99, unit: "lb", amount: 1 },
  "beef stew meat": { price: 6.49, unit: "lb", amount: 1 },
  lamb: { price: 8.99, unit: "lb", amount: 1 },
  pork: { price: 3.99, unit: "lb", amount: 1 },
  "pork loin": { price: 4.49, unit: "lb", amount: 1 },
  bacon: { price: 6.99, unit: "lb", amount: 1 },
  turkey: { price: 4.99, unit: "lb", amount: 1 },
  salmon: { price: 9.99, unit: "lb", amount: 1 },
  shrimp: { price: 8.99, unit: "lb", amount: 1 },
  fish: { price: 7.99, unit: "lb", amount: 1 },
  cod: { price: 8.49, unit: "lb", amount: 1 },
  tuna: { price: 9.49, unit: "lb", amount: 1 },
  scallops: { price: 14.99, unit: "lb", amount: 1 },
  crab: { price: 12.99, unit: "lb", amount: 1 },
  duck: { price: 7.99, unit: "lb", amount: 1 },
  tofu: { price: 2.49, unit: "block", amount: 1 },
  tempeh: { price: 3.49, unit: "block", amount: 1 },

  // ── Dairy & Eggs ──
  eggs: { price: 3.99, unit: "dozen", amount: 12 },
  egg: { price: 0.35, unit: "each", amount: 1 },
  milk: { price: 4.29, unit: "gallon", amount: 1 },
  "whole milk": { price: 4.29, unit: "gallon", amount: 1 },
  butter: { price: 4.99, unit: "lb", amount: 1 },
  "unsalted butter": { price: 4.99, unit: "lb", amount: 1 },
  cheese: { price: 4.99, unit: "lb", amount: 1 },
  "parmesan cheese": { price: 6.99, unit: "lb", amount: 1 },
  "mozzarella cheese": { price: 4.49, unit: "lb", amount: 1 },
  cream: { price: 3.99, unit: "pint", amount: 1 },
  "heavy cream": { price: 4.49, unit: "pint", amount: 1 },
  "heavy whipping cream": { price: 4.49, unit: "pint", amount: 1 },
  "sour cream": { price: 2.49, unit: "cup", amount: 1 },
  yogurt: { price: 1.49, unit: "cup", amount: 1 },
  "greek yogurt": { price: 1.79, unit: "cup", amount: 1 },
  ricotta: { price: 3.99, unit: "lb", amount: 1 },
  "fresh sheep's milk ricotta": { price: 5.99, unit: "lb", amount: 1 },

  // ── Grains & Starches ──
  rice: { price: 2.99, unit: "lb", amount: 1 },
  pasta: { price: 1.49, unit: "lb", amount: 1 },
  bread: { price: 3.49, unit: "loaf", amount: 1 },
  flour: { price: 3.49, unit: "5lb", amount: 5 },
  "00 flour": { price: 4.99, unit: "2lb", amount: 2 },
  "all-purpose flour": { price: 3.49, unit: "5lb", amount: 5 },
  "bread flour": { price: 4.49, unit: "5lb", amount: 5 },
  oats: { price: 3.99, unit: "lb", amount: 1 },
  quinoa: { price: 5.99, unit: "lb", amount: 1 },
  couscous: { price: 2.99, unit: "lb", amount: 1 },
  tortillas: { price: 3.49, unit: "pack", amount: 10 },
  noodles: { price: 2.49, unit: "lb", amount: 1 },
  cornstarch: { price: 2.49, unit: "lb", amount: 1 },

  // ── Produce ──
  onion: { price: 1.29, unit: "lb", amount: 1 },
  garlic: { price: 0.50, unit: "head", amount: 1 },
  tomato: { price: 1.99, unit: "lb", amount: 1 },
  potato: { price: 1.29, unit: "lb", amount: 1 },
  carrot: { price: 1.49, unit: "lb", amount: 1 },
  celery: { price: 1.99, unit: "bunch", amount: 1 },
  spinach: { price: 2.99, unit: "bunch", amount: 1 },
  kale: { price: 2.99, unit: "bunch", amount: 1 },
  broccoli: { price: 1.99, unit: "lb", amount: 1 },
  lettuce: { price: 1.99, unit: "head", amount: 1 },
  mushroom: { price: 3.49, unit: "lb", amount: 1 },
  mushrooms: { price: 3.49, unit: "lb", amount: 1 },
  avocado: { price: 1.49, unit: "each", amount: 1 },
  lemon: { price: 0.69, unit: "each", amount: 1 },
  lime: { price: 0.49, unit: "each", amount: 1 },
  orange: { price: 0.79, unit: "each", amount: 1 },
  apple: { price: 1.49, unit: "lb", amount: 1 },
  banana: { price: 0.59, unit: "lb", amount: 1 },
  "bell pepper": { price: 1.29, unit: "each", amount: 1 },
  cucumber: { price: 0.99, unit: "each", amount: 1 },
  ginger: { price: 3.99, unit: "lb", amount: 1 },
  "fresh lemon juice": { price: 0.69, unit: "each", amount: 1 },
  figs: { price: 4.99, unit: "lb", amount: 1 },

  // ── Legumes & Beans ──
  lentils: { price: 1.99, unit: "lb", amount: 1 },
  "black beans": { price: 1.29, unit: "can", amount: 1 },
  chickpeas: { price: 1.29, unit: "can", amount: 1 },
  "kidney beans": { price: 1.29, unit: "can", amount: 1 },

  // ── Oils & Condiments ──
  "olive oil": { price: 7.99, unit: "bottle", amount: 1 },
  "vegetable oil": { price: 4.99, unit: "bottle", amount: 1 },
  "sesame oil": { price: 5.99, unit: "bottle", amount: 1 },
  "soy sauce": { price: 3.49, unit: "bottle", amount: 1 },
  vinegar: { price: 2.99, unit: "bottle", amount: 1 },
  honey: { price: 6.99, unit: "bottle", amount: 1 },

  // ── Spices & Herbs ──
  salt: { price: 1.49, unit: "canister", amount: 1 },
  "kosher salt": { price: 2.99, unit: "box", amount: 1 },
  pepper: { price: 3.99, unit: "jar", amount: 1 },
  cumin: { price: 3.49, unit: "jar", amount: 1 },
  paprika: { price: 3.49, unit: "jar", amount: 1 },
  "chili powder": { price: 3.49, unit: "jar", amount: 1 },
  cinnamon: { price: 3.49, unit: "jar", amount: 1 },
  turmeric: { price: 4.49, unit: "jar", amount: 1 },
  oregano: { price: 2.99, unit: "jar", amount: 1 },
  basil: { price: 2.49, unit: "bunch", amount: 1 },
  thyme: { price: 2.49, unit: "bunch", amount: 1 },
  rosemary: { price: 2.49, unit: "bunch", amount: 1 },
  parsley: { price: 1.99, unit: "bunch", amount: 1 },
  cilantro: { price: 1.49, unit: "bunch", amount: 1 },
  "vanilla extract": { price: 6.99, unit: "bottle", amount: 1 },

  // ── Canned & Pantry ──
  "canned tomatoes": { price: 1.49, unit: "can", amount: 1 },
  "tomato paste": { price: 1.29, unit: "can", amount: 1 },
  "coconut milk": { price: 2.49, unit: "can", amount: 1 },
  broth: { price: 2.99, unit: "carton", amount: 1 },
  "chicken broth": { price: 2.99, unit: "carton", amount: 1 },
  sugar: { price: 3.49, unit: "4lb", amount: 4 },
  "granulated sugar": { price: 3.49, unit: "4lb", amount: 4 },
  "powdered sugar": { price: 2.99, unit: "lb", amount: 1 },
  "brown sugar": { price: 3.49, unit: "2lb", amount: 2 },

  // ── Nuts & Seeds ──
  almonds: { price: 7.99, unit: "lb", amount: 1 },
  walnuts: { price: 7.99, unit: "lb", amount: 1 },
  pistachios: { price: 9.99, unit: "lb", amount: 1 },
  "pine nuts": { price: 12.99, unit: "lb", amount: 1 },
  peanuts: { price: 3.99, unit: "lb", amount: 1 },

  // ── Beverages ──
  espresso: { price: 0.75, unit: "shot", amount: 1 },
  coffee: { price: 8.99, unit: "bag", amount: 1 },
  tea: { price: 4.99, unit: "box", amount: 1 },

  // ── Baking ──
  "active dry yeast": { price: 0.99, unit: "packet", amount: 1 },
  "baking powder": { price: 2.99, unit: "can", amount: 1 },
  "baking soda": { price: 1.49, unit: "box", amount: 1 },
  "cocoa powder": { price: 4.99, unit: "can", amount: 1 },
  "dark chocolate": { price: 3.99, unit: "bar", amount: 1 },
  raisins: { price: 3.49, unit: "bag", amount: 1 },
};

/**
 * Fallback average costs by ingredient category (per-ingredient contribution).
 * Used when a specific ingredient is not found in the dictionary.
 */
const CATEGORY_FALLBACK_COST: Record<IngredientCategory | string, number> = {
  meat_seafood: 4.50,
  dairy_eggs: 1.50,
  produce: 1.00,
  grains: 0.80,
  pantry: 0.75,
  herbs_spices: 0.40,
  oils_condiments: 0.50,
  beverages: 0.75,
  protein: 4.50,
  other: 0.75,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function detectCategoryFromName(name: string): string {
  const n = name.toLowerCase();
  if (/beef|chicken|lamb|fish|shrimp|goat|pork|salmon|tuna|scallop|turkey|duck|crab|tofu|tempeh/.test(n)) return "meat_seafood";
  if (/milk|egg|butter|cream|cheese|yogurt|ricotta/.test(n)) return "dairy_eggs";
  if (/rice|quinoa|couscous|bread|flour|pasta|noodle|oat|cornmeal|tortilla/.test(n)) return "grains";
  if (/oil|vinegar|soy sauce|paste|ketchup|mustard|mayo|salsa|honey/.test(n)) return "oils_condiments";
  if (/can|canned|broth|stock|bean|lentil|chickpea|sugar/.test(n)) return "pantry";
  if (/water|juice|soda|tea|coffee|wine|beer|espresso/.test(n)) return "beverages";
  if (/salt|pepper|cumin|paprika|chili|cayenne|turmeric|cinnamon|nutmeg|oregano|thyme|rosemary|sage|dill|vanilla/.test(n)) return "herbs_spices";
  if (/tomato|onion|garlic|lettuce|carrot|celery|potato|spinach|kale|cabbage|broccoli|cucumber|mushroom|avocado|lemon|lime|orange|apple|banana|ginger|fig|bell pepper/.test(n)) return "produce";
  return "other";
}

/**
 * Find best match in the dictionary for the ingredient
 */
export function findIngredientDictMatch(ingredientName: string) {
  const name = ingredientName.toLowerCase().trim();

  // 1. Exact match
  if (INGREDIENT_PRICES[name]) {
    return { key: name, info: INGREDIENT_PRICES[name] };
  }

  // 2. Partial match — find the longest key that appears in the ingredient name
  let bestMatch: { key: string; info: typeof INGREDIENT_PRICES[string] } | null = null;
  for (const [key, info] of Object.entries(INGREDIENT_PRICES)) {
    if (name.includes(key) && (!bestMatch || key.length > bestMatch.key.length)) {
      bestMatch = { key, info };
    }
  }

  return bestMatch;
}

/**
 * Look up the estimated cost of a single ingredient.
 * Tries exact match first, then partial matches, then category fallback.
 */
function lookupIngredientCost(ingredient: RecipeIngredient): number {
  const name = ingredient.name.toLowerCase().trim();

  // 1. Exact match
  if (INGREDIENT_PRICES[name]) {
    return INGREDIENT_PRICES[name].price;
  }

  // 2. Partial match — find the longest key that appears in the ingredient name
  let bestMatch: { key: string; price: number } | null = null;
  for (const [key, info] of Object.entries(INGREDIENT_PRICES)) {
    if (name.includes(key) && (!bestMatch || key.length > bestMatch.key.length)) {
      bestMatch = { key, price: info.price };
    }
  }
  if (bestMatch) {
    return bestMatch.price;
  }

  // 3. Category fallback
  const category = ingredient.category || detectCategoryFromName(name);
  return CATEGORY_FALLBACK_COST[category] ?? CATEGORY_FALLBACK_COST.other;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Estimate the total grocery cost of a recipe.
 *
 * @param ingredients - The recipe's ingredient list
 * @param servings - Number of servings the recipe makes (default 4)
 * @param userInventory - List of ingredients the user already has (cost will be 0)
 * @returns Cost estimate with breakdown and per-serving cost
 */
export function calculateRecipeEstimatedCost(
  ingredients: RecipeIngredient[],
  servings: number = 4,
  userInventory: string[] = [],
): RecipeCostEstimate {
  let directMatches = 0;
  const breakdown: Array<{ ingredient: string; estimatedCost: number }> = [];

  const inventoryLower = userInventory.map(item => item.toLowerCase().trim());

  for (const ing of ingredients) {
    if (ing.optional) continue; // skip optional ingredients

    const name = ing.name.toLowerCase().trim();
    
    // Check if user already has this ingredient in their pantry/inventory
    const inInventory = inventoryLower.some(invItem => 
      name.includes(invItem) || invItem.includes(name)
    );

    const cost = inInventory ? 0 : lookupIngredientCost(ing);

    // Track confidence
    if (INGREDIENT_PRICES[name]) {
      directMatches++;
    } else {
      // Check for partial match
      const hasPartial = Object.keys(INGREDIENT_PRICES).some((k) => name.includes(k));
      if (hasPartial) directMatches += 0.5;
    }

    breakdown.push({ ingredient: ing.name, estimatedCost: Math.round(cost * 100) / 100 });
  }

  const totalCost = breakdown.reduce((sum, b) => sum + b.estimatedCost, 0);
  const costPerServing = servings > 0 ? totalCost / servings : totalCost;

  // Confidence based on how many ingredients had direct matches
  const matchRatio = ingredients.length > 0 ? directMatches / ingredients.length : 0;
  const confidence: RecipeCostEstimate["confidence"] =
    matchRatio >= 0.7 ? "high" : matchRatio >= 0.4 ? "medium" : "low";

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    costPerServing: Math.round(costPerServing * 100) / 100,
    breakdown,
    confidence,
  };
}

/**
 * Calculate the "Bang for the Buck" score for a recipe.
 *
 * The score combines:
 * - Calories per dollar (40% weight)
 * - Protein per dollar (40% weight)
 * - Fiber per dollar (20% weight)
 *
 * Normalises to a 0-100 scale based on empirically-set benchmarks.
 *
 * @param nutrition - Recipe nutritional data (per serving)
 * @param costPerServing - Estimated cost per serving
 * @returns Score object with numeric score, label, and per-dollar metrics
 */
export function calculateBangForBuck(
  nutrition: RecipeNutrition | undefined | null,
  costPerServing: number,
): BangForBuckScore {
  // Guard: if no nutrition or no cost, return a neutral score
  if (!nutrition || !nutrition.calories || costPerServing <= 0) {
    // If cost per serving is 0 (due to inventory!), bang for buck is infinity essentially
    if (costPerServing === 0 && nutrition?.calories) {
       return { score: 100, label: "Excellent", caloriesPerDollar: 9999, proteinPerDollar: 999 };
    }
    return { score: 50, label: "Fair", caloriesPerDollar: 0, proteinPerDollar: 0 };
  }

  const caloriesPerDollar = nutrition.calories / costPerServing;
  const proteinPerDollar = (nutrition.protein ?? 0) / costPerServing;
  const fiberPerDollar = (nutrition.fiber ?? 0) / costPerServing;

  // Benchmarks (derived from average US meal costs):
  // - Budget meal: ~400 cal/$1, ~10g protein/$1
  // - Expensive meal: ~100 cal/$1, ~3g protein/$1
  const calScore = Math.min(100, (caloriesPerDollar / 500) * 100);
  const proteinScore = Math.min(100, (proteinPerDollar / 15) * 100);
  const fiberScore = Math.min(100, (fiberPerDollar / 5) * 100);

  const rawScore = calScore * 0.4 + proteinScore * 0.4 + fiberScore * 0.2;
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  let label: BangForBuckScore["label"];
  if (score >= 75) label = "Excellent";
  else if (score >= 55) label = "Good";
  else if (score >= 35) label = "Fair";
  else label = "Expensive";

  return {
    score,
    label,
    caloriesPerDollar: Math.round(caloriesPerDollar),
    proteinPerDollar: Math.round(proteinPerDollar * 10) / 10,
  };
}

/**
 * Estimate total weekly grocery cost from a set of recipes.
 * Accounts for ingredient bundle sizes (e.g. buying a dozen eggs) and
 * uses leftovers from purchased bundles to cover ingredients in subsequent meals.
 */
export function estimateWeeklyGroceryCost(
  recipes: Array<{ ingredients: RecipeIngredient[]; servings?: number }>,
  userInventory: string[] = [],
): { totalCost: number; perMealAverage: number; recipeBreakdown: RecipeCostEstimate[] } {
  const recipeBreakdown: RecipeCostEstimate[] = [];
  let rawTotal = 0;
  
  // Track leftovers from purchasing bundles across the week
  // Key is the internal dictionary key (e.g. "eggs", "chicken breast")
  const weeklyCartLeftovers: Record<string, number> = {};
  const inventoryLower = userInventory.map(item => item.toLowerCase().trim());

  for (const recipe of recipes) {
    let directMatches = 0;
    const breakdown: Array<{ ingredient: string; estimatedCost: number }> = [];
    const ingredients = recipe.ingredients || [];
    
    for (const ing of ingredients) {
      if (ing.optional) continue;
      
      const name = ing.name.toLowerCase().trim();
      const inInventory = inventoryLower.some(invItem => 
        name.includes(invItem) || invItem.includes(name)
      );

      if (inInventory) {
        breakdown.push({ ingredient: ing.name, estimatedCost: 0 });
        continue;
      }
      
      // Amount needed for this specific recipe
      // Use the stated ingredient amount, default to 1 if missing.
      const neededAmount = ing.amount || 1;

      const match = findIngredientDictMatch(ing.name);
      if (match) {
        directMatches++;
        const dictKey = match.key;
        const bundleSize = match.info.amount; // e.g. 12 for "dozen", 5 for "5lb flour"
        const bundlePrice = match.info.price;

        // Check if we have enough left over from previous bundles
        const currentLeftover = weeklyCartLeftovers[dictKey] || 0;
        
        if (currentLeftover >= neededAmount) {
          // We can use leftovers, no additional cost for this recipe
          weeklyCartLeftovers[dictKey] = currentLeftover - neededAmount;
          breakdown.push({ ingredient: ing.name, estimatedCost: 0 });
        } else {
          // We need more than what's left over
          const deficit = neededAmount - currentLeftover;
          // Calculate how many bundles we must buy to cover the deficit
          const bundlesNeeded = Math.ceil(deficit / bundleSize);
          const cost = bundlesNeeded * bundlePrice;
          
          // Update leftovers: Add new bundles capacity, subtract the needed deficit
          weeklyCartLeftovers[dictKey] = (currentLeftover + (bundlesNeeded * bundleSize)) - neededAmount;
          
          breakdown.push({ ingredient: ing.name, estimatedCost: cost });
          rawTotal += cost;
        }
      } else {
        // Fallback pricing if no bundle size available
        const hasPartial = Object.keys(INGREDIENT_PRICES).some((k) => name.includes(k));
        if (hasPartial) directMatches += 0.5;

        const category = ing.category || detectCategoryFromName(name);
        const fallbackCost = CATEGORY_FALLBACK_COST[category] ?? CATEGORY_FALLBACK_COST.other;
        
        // Assume fallback cost scales directly with required amount
        const cost = fallbackCost * neededAmount;
        breakdown.push({ ingredient: ing.name, estimatedCost: cost });
        rawTotal += cost;
      }
    }
    
    const recipeTotalCost = breakdown.reduce((sum, b) => sum + b.estimatedCost, 0);
    const servings = recipe.servings ?? 4;
    const costPerServing = servings > 0 ? recipeTotalCost / servings : recipeTotalCost;
    const matchRatio = ingredients.length > 0 ? directMatches / ingredients.length : 0;
    const confidence: RecipeCostEstimate["confidence"] =
      matchRatio >= 0.7 ? "high" : matchRatio >= 0.4 ? "medium" : "low";
      
    recipeBreakdown.push({
      totalCost: Math.round(recipeTotalCost * 100) / 100,
      costPerServing: Math.round(costPerServing * 100) / 100,
      breakdown,
      confidence
    });
  }

  // We can still apply a small deduplication discount for extremely common un-modeled pantry items
  const deduplicationFactor = 0.95; 
  const totalCost = Math.round(rawTotal * deduplicationFactor * 100) / 100;
  const perMealAverage = recipes.length > 0 ? Math.round((totalCost / recipes.length) * 100) / 100 : 0;

  return { totalCost, perMealAverage, recipeBreakdown };
}
