/**
 * Grocery List Generator
 * Enhanced grocery list generation with category detection and unit conversion
 *
 * @file src/utils/groceryListGenerator.ts
 * @created 2026-01-10 (Phase 2)
 */

import type {
  GroceryItem,
  GroceryCategory,
  MealSlot,
} from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";

const logger = createLogger("GroceryListGenerator");

/**
 * Ingredient category mappings
 */
const CATEGORY_PATTERNS: Record<GroceryCategory, RegExp> = {
  produce:
    /tomato|onion|garlic|lettuce|carrot|celery|pepper|potato|spinach|kale|arugula|cabbage|broccoli|cauliflower|cucumber|zucchini|squash|mushroom|eggplant|avocado|lemon|lime|orange|apple|banana|berry|strawberry|blueberry|raspberry|grape|melon|peach|pear|plum|mango|pineapple|herb|parsley|cilantro|basil|mint|thyme|rosemary|oregano|sage|dill|chive|scallion|shallot|leek/i,
  proteins:
    /chicken|beef|pork|lamb|turkey|duck|fish|salmon|tuna|cod|tilapia|shrimp|prawn|lobster|crab|scallop|mussel|oyster|clam|tofu|tempeh|seitan|egg|beans|lentil|chickpea|pea|edamame/i,
  dairy:
    /milk|cream|cheese|yogurt|butter|ghee|sour cream|cottage cheese|ricotta|mozzarella|cheddar|parmesan|feta|brie|goat cheese|whey|buttermilk/i,
  grains:
    /rice|pasta|noodle|bread|flour|oat|quinoa|barley|bulgur|couscous|farro|millet|wheat|rye|spelt|cornmeal|polenta|tortilla|pita|bagel|roll|bun|cracker/i,
  spices:
    /salt|pepper|cumin|coriander|paprika|chili|cayenne|turmeric|ginger|garlic powder|onion powder|cinnamon|nutmeg|clove|cardamom|fennel|mustard|curry|saffron|vanilla|bay leaf|oregano|basil|thyme|rosemary|sage|dill|parsley|cilantro/i,
  condiments:
    /sauce|ketchup|mustard|mayonnaise|vinegar|oil|olive oil|vegetable oil|sesame oil|soy sauce|tamari|worcestershire|hot sauce|salsa|pesto|tahini|honey|maple syrup|molasses|jam|jelly|preserve|pickle|relish/i,
  canned:
    /canned|can of|tomato paste|tomato sauce|coconut milk|stock|broth|soup/i,
  frozen: /frozen/i,
  bakery: /cake|cookie|pastry|croissant|muffin|donut|pie|tart/i,
  beverages: /water|juice|soda|tea|coffee|wine|beer|liquor|milk/i,
  other: /.*/,
};

/**
 * Unit conversion mappings (convert to base units)
 */
const UNIT_CONVERSIONS: Record<string, { baseUnit: string; factor: number }> = {
  // Volume
  tsp: { baseUnit: "ml", factor: 4.929 },
  teaspoon: { baseUnit: "ml", factor: 4.929 },
  tbsp: { baseUnit: "ml", factor: 14.787 },
  tablespoon: { baseUnit: "ml", factor: 14.787 },
  "fl oz": { baseUnit: "ml", factor: 29.574 },
  cup: { baseUnit: "ml", factor: 236.588 },
  pint: { baseUnit: "ml", factor: 473.176 },
  quart: { baseUnit: "ml", factor: 946.353 },
  gallon: { baseUnit: "ml", factor: 3785.41 },
  ml: { baseUnit: "ml", factor: 1 },
  l: { baseUnit: "ml", factor: 1000 },
  liter: { baseUnit: "ml", factor: 1000 },

  // Weight
  oz: { baseUnit: "g", factor: 28.35 },
  ounce: { baseUnit: "g", factor: 28.35 },
  lb: { baseUnit: "g", factor: 453.592 },
  pound: { baseUnit: "g", factor: 453.592 },
  g: { baseUnit: "g", factor: 1 },
  gram: { baseUnit: "g", factor: 1 },
  kg: { baseUnit: "g", factor: 1000 },
  kilogram: { baseUnit: "g", factor: 1000 },

  // Small amounts
  pinch: { baseUnit: "tsp", factor: 0.0625 },
  dash: { baseUnit: "tsp", factor: 0.125 },

  // Count
  piece: { baseUnit: "count", factor: 1 },
  whole: { baseUnit: "count", factor: 1 },
  count: { baseUnit: "count", factor: 1 },
  unit: { baseUnit: "count", factor: 1 },
};

/**
 * Normalize ingredient name for consolidation
 */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/,.*$/, "") // Remove preparation notes after comma
    .replace(/\(.*\)/, "") // Remove parenthetical notes
    .trim();
}

/**
 * Detect category for an ingredient
 */
function detectCategory(ingredientName: string): GroceryCategory {
  const nameLower = ingredientName.toLowerCase();

  // Check each category pattern
  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(nameLower)) {
      return category as GroceryCategory;
    }
  }

  return "other";
}

/**
 * Convert unit to base unit
 */
function convertToBaseUnit(
  amount: number,
  unit: string,
): { amount: number; unit: string } {
  const unitLower = unit.toLowerCase().trim();

  // Check if unit can be converted
  if (UNIT_CONVERSIONS[unitLower]) {
    const conversion = UNIT_CONVERSIONS[unitLower];
    return {
      amount: amount * conversion.factor,
      unit: conversion.baseUnit,
    };
  }

  // Return as-is if no conversion available
  return { amount, unit };
}

/**
 * Convert from base unit to display unit
 */
function convertToDisplayUnit(
  amount: number,
  baseUnit: string,
): { amount: number; unit: string } {
  // Volume conversions (ml base)
  if (baseUnit === "ml") {
    if (amount >= 3785) {
      return { amount: amount / 3785.41, unit: "gallon" };
    }
    if (amount >= 946) {
      return { amount: amount / 946.353, unit: "quart" };
    }
    if (amount >= 473) {
      return { amount: amount / 473.176, unit: "pint" };
    }
    if (amount >= 237) {
      return { amount: amount / 236.588, unit: "cup" };
    }
    if (amount >= 30) {
      return { amount: amount / 29.574, unit: "fl oz" };
    }
    if (amount >= 15) {
      return { amount: amount / 14.787, unit: "tbsp" };
    }
    return { amount: amount / 4.929, unit: "tsp" };
  }

  // Weight conversions (g base)
  if (baseUnit === "g") {
    if (amount >= 454) {
      return { amount: amount / 453.592, unit: "lb" };
    }
    if (amount >= 28) {
      return { amount: amount / 28.35, unit: "oz" };
    }
    return { amount, unit: "g" };
  }

  // Count
  if (baseUnit === "count") {
    return { amount, unit: amount === 1 ? "piece" : "pieces" };
  }

  // Return as-is
  return { amount, unit: baseUnit };
}

/**
 * Round amount to reasonable precision
 */
function roundAmount(amount: number): number {
  if (amount < 1) {
    return Math.round(amount * 100) / 100; // 2 decimal places
  }
  if (amount < 10) {
    return Math.round(amount * 10) / 10; // 1 decimal place
  }
  return Math.round(amount); // Whole number
}

/**
 * Generation options
 */
export interface GroceryGenerationOptions {
  consolidateBy?: "ingredient" | "recipe";
  groupBy?: "category" | "store-section" | "recipe";
  excludePantryItems?: boolean;
  convertUnits?: boolean;
}

/**
 * Generate consolidated grocery list from meal slots
 */
export function generateGroceryList(
  meals: MealSlot[],
  options: GroceryGenerationOptions = {},
): GroceryItem[] {
  try {
    const {
      consolidateBy = "ingredient",
      convertUnits = true,
      excludePantryItems = false,
    } = options;

    logger.debug("Generating grocery list", {
      mealsCount: meals.length,
      options,
    });

    // Extract all ingredients from recipes
    const ingredientMap = new Map<
      string,
      {
        ingredient: string;
        baseAmount: number;
        baseUnit: string;
        originalUnits: string[];
        category: GroceryCategory;
        usedInRecipes: string[];
      }
    >();

    meals.forEach((meal) => {
      if (!meal.recipe || !meal.recipe.ingredients) return;

      meal.recipe.ingredients.forEach((rawIngredient: any) => {
        // Handle both string ingredients and object ingredients
        const ingredient = typeof rawIngredient === 'string'
          ? { name: rawIngredient, amount: 1, unit: 'unit' }
          : rawIngredient;

        const normalizedName = normalizeIngredientName(ingredient.name || String(rawIngredient));
        const key =
          consolidateBy === "ingredient"
            ? normalizedName
            : `${normalizedName}-${meal.recipe!.id}`;

        // Convert to base unit if requested
        let amount = Number(ingredient.amount || 1) * meal.servings;
        let unit = ingredient.unit || 'unit';

        if (convertUnits) {
          const converted = convertToBaseUnit(amount, unit);
          amount = converted.amount;
          unit = converted.unit;
        }

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          // Only consolidate if units match
          if (existing.baseUnit === unit) {
            existing.baseAmount += amount;
            existing.usedInRecipes.push(meal.recipe!.id);
            if (!existing.originalUnits.includes(ingredient.unit)) {
              existing.originalUnits.push(ingredient.unit);
            }
          } else {
            // Different units, create separate entry
            const newKey = `${key}-${unit}`;
            ingredientMap.set(newKey, {
              ingredient: normalizedName,
              baseAmount: amount,
              baseUnit: unit,
              originalUnits: [ingredient.unit],
              category: detectCategory(normalizedName),
              usedInRecipes: [meal.recipe!.id],
            });
          }
        } else {
          ingredientMap.set(key, {
            ingredient: normalizedName,
            baseAmount: amount,
            baseUnit: unit,
            originalUnits: [ingredient.unit],
            category: detectCategory(normalizedName),
            usedInRecipes: [meal.recipe!.id],
          });
        }
      });
    });

    // Convert to grocery items
    const groceryItems: GroceryItem[] = Array.from(ingredientMap.entries()).map(
      ([key, data], index) => {
        // Convert back to display units if requested
        let displayAmount = data.baseAmount;
        let displayUnit = data.baseUnit;

        if (convertUnits) {
          const display = convertToDisplayUnit(data.baseAmount, data.baseUnit);
          displayAmount = display.amount;
          displayUnit = display.unit;
        }

        return {
          id: `grocery-${index}`,
          ingredient: data.ingredient,
          quantity: roundAmount(displayAmount),
          unit: displayUnit,
          category: data.category,
          inPantry: false, // User can mark manually
          purchased: false,
          usedInRecipes: data.usedInRecipes,
        };
      },
    );

    // Sort by category
    const categoryOrder: GroceryCategory[] = [
      "produce",
      "proteins",
      "dairy",
      "grains",
      "spices",
      "condiments",
      "canned",
      "frozen",
      "bakery",
      "beverages",
      "other",
    ];

    groceryItems.sort((a, b) => {
      const catA = categoryOrder.indexOf(a.category as GroceryCategory);
      const catB = categoryOrder.indexOf(b.category as GroceryCategory);
      if (catA !== catB) {
        return catA - catB;
      }
      return a.ingredient.localeCompare(b.ingredient);
    });

    logger.info(`Generated grocery list with ${groceryItems.length} items`);

    return groceryItems;
  } catch (error) {
    logger.error("Failed to generate grocery list:", error);
    return [];
  }
}

/**
 * Get grocery items grouped by category
 */
export function getGroupedGroceryList(
  items: GroceryItem[],
): Record<GroceryCategory, GroceryItem[]> {
  const grouped: Record<GroceryCategory, GroceryItem[]> = {
    produce: [],
    proteins: [],
    dairy: [],
    grains: [],
    spices: [],
    condiments: [],
    canned: [],
    frozen: [],
    bakery: [],
    beverages: [],
    other: [],
  };

  items.forEach((item) => {
    grouped[item.category].push(item);
  });

  return grouped;
}

/**
 * Calculate total cost estimate (if prices available)
 */
export function estimateTotalCost(
  items: GroceryItem[],
  priceMap?: Record<string, number>,
): number {
  if (!priceMap) return 0;

  return items.reduce((total, item) => {
    const price = priceMap[item.ingredient] || 0;
    return total + price * item.quantity;
  }, 0);
}
