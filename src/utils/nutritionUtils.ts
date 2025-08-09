import { NutritionalProfile, ElementalProperties } from '../types/alchemy';

// Base nutritional values for common ingredient categories (per 100g)
const nutritionReferenceValues: Record<string, unknown> = {
  // Proteins
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, sugar: 0 },
  fish: { calories: 140, protein: 24, carbs: 0, fat: 5, fiber: 0, sugar: 0 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  beans: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 7.4, sugar: 0.3 },
  lentils: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8 },
  tofu: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.5 },

  // Vegetables
  vegetable: { calories: 65, protein: 2.5, carbs: 12, fat: 0.3, fiber: 3.8, sugar: 5 },
  'leafy greens': { calories: 25, protein: 2.1, carbs: 3.8, fat: 0.4, fiber: 2.4, sugar: 0.5 },
  'root vegetables': { calories: 75, protein: 1.5, carbs: 17, fat: 0.2, fiber: 2.8, sugar: 4 },
  tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  onion: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2 },
  garlic: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1 },

  // Fruits
  fruit: { calories: 70, protein: 0.8, carbs: 18, fat: 0.3, fiber: 2.5, sugar: 12 },
  berries: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 3.5, sugar: 9 },
  citrus: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9 },

  // Grains
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
  pasta: { calories: 158, protein: 5.8, carbs: 31, fat: 0.9, fiber: 1.8, sugar: 0.6 },
  bread: { calories: 265, protein: 9.4, carbs: 49, fat: 3.3, fiber: 2.8, sugar: 5.1 },
  quinoa: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9 },

  // Dairy
  cheese: { calories: 350, protein: 21, carbs: 1.3, fat: 28, fiber: 0, sugar: 0.5 },
  milk: { calories: 61, protein: 3.3, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1 },
  yogurt: { calories: 100, protein: 5.7, carbs: 7.6, fat: 5.4, fiber: 0, sugar: 7.6 },

  // Fats & Oils
  oil: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  butter: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1 },
  nuts: { calories: 607, protein: 21, carbs: 20, fat: 54, fiber: 8.4, sugar: 4.3 },

  // Other
  herbs: { calories: 30, protein: 2, carbs: 5.5, fat: 0.5, fiber: 2, sugar: 0 },
  spices: { calories: 25, protein: 1, carbs: 4.5, fat: 1, fiber: 2.5, sugar: 0.5 },
  sauce: { calories: 75, protein: 1.8, carbs: 7, fat: 4.5, fiber: 0.5, sugar: 3 },
  broth: { calories: 15, protein: 1, carbs: 1.5, fat: 0.5, fiber: 0, sugar: 0 },
  sugar: { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100 },
  salt: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
};

// Vitamins typically found in food categories
const vitaminsByCategory: Record<string, string[]> = {
  'leafy greens': ['Vitamin A', 'Vitamin C', 'Vitamin K'],
  vegetable: ['Vitamin A', 'Vitamin C'],
  fruit: ['Vitamin C'],
  berries: ['Vitamin C'],
  citrus: ['Vitamin C'],
  fish: ['Vitamin D', 'Vitamin B12'],
  beef: ['Vitamin B12', 'Vitamin B6'],
  chicken: ['Vitamin B6'],
  egg: ['Vitamin B12', 'Vitamin D'],
  dairy: ['Vitamin D', 'Vitamin B12'],
  nuts: ['Vitamin E'],
};

// Minerals typically found in food categories
const mineralsByCategory: Record<string, string[]> = {
  'leafy greens': ['Iron', 'Calcium', 'Magnesium'],
  vegetable: ['Potassium'],
  beans: ['Iron', 'Magnesium'],
  lentils: ['Iron', 'Potassium'],
  meat: ['Iron', 'Zinc'],
  fish: ['Selenium'],
  dairy: ['Calcium'],
  nuts: ['Magnesium', 'Zinc'],
  'whole grains': ['Magnesium', 'Selenium'],
};

export const calculateNutritionalScore = (nutrition: NutritionalProfile): number => {
  if (!nutrition) return 0;

  // Safe property access for macros
  const macros = (nutrition as any)?.macros || {};
  const baseScore =
    (macros.protein || 0) * 0.4 +
    (macros.fiber || 0) * 0.3 +
    (nutrition.vitamins?.vitaminC || 0) * 0.2 +
    (nutrition.minerals?.iron || 0) * 0.1;

  return Math.min(1, Math.max(0, baseScore / 100));
};

export const calculateNutritionalImpact = (
  nutrition: NutritionalProfile,
  elements: ElementalProperties,
): ElementalProperties => {
  const score = calculateNutritionalScore(nutrition);
  return {
    Fire: elements.Fire * (1 + score * 0.2),
    Water: elements.Water * (1 + score * 0.15),
    Earth: elements.Earth * (1 + score * 0.25),
    Air: elements.Air * (1 + score * 0.1),
  };
};

/**
 * Calculate estimated nutrition values from a list of ingredients
 * @param ingredients Array of ingredient objects or strings
 * @returns Nutrition object with estimated values
 */
export const calculateEstimatedNutrition = (ingredients: unknown[]): unknown => {
  // Initialize nutrition totals
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  };

  // Track which vitamins and minerals are present
  const vitaminsPresent = new Set<string>();
  const mineralsPresent = new Set<string>();

  // Process each ingredient
  ingredients.forEach(ingredient => {
    let ingredientName = '';
    let amount = 1; // Default to 1 unit if not specified

    // Extract ingredient name and amount based on type
    if (typeof ingredient === 'string') {
      ingredientName = ingredient.toLowerCase();
      // Try to extract amount from string
      const match = ingredient.match(/^([\d.]+)/);
      if (match?.[1]) {
        amount = parseFloat(match[1]) || 1;
      }
    } else if (typeof ingredient === 'object') {
      // Apply surgical type casting with variable extraction
      const ingredientData = ingredient as any;
      const name = ingredientData?.name;
      const amountValue = ingredientData?.amount;

      ingredientName = (name || '').toLowerCase();
      amount = amountValue || 1;
    }

    // Find the best matching reference value
    let referenceItem: any = null;
    let bestMatchKey = '';

    // Check for exact matches first
    Object.keys(nutritionReferenceValues).forEach(key => {
      if (ingredientName.includes(key)) {
        // If we haven't found a match yet, or this is a longer (more specific) match
        if (!referenceItem || key.length > bestMatchKey.length) {
          referenceItem = nutritionReferenceValues[key];
          bestMatchKey = key;
        }
      }
    });

    // If no specific match, use a general category
    if (!referenceItem) {
      // Default to 'vegetable' if no match found
      referenceItem = nutritionReferenceValues['vegetable'];
      bestMatchKey = 'vegetable';
    }

    // Calculate an adjustment factor based on amount
    // Assuming reference values are for 100g
    const adjustmentFactor = amount / 100;

    // Add to nutrition totals with adjustment
    totals.calories += referenceItem.calories * adjustmentFactor;
    totals.protein += referenceItem.protein * adjustmentFactor;
    totals.carbs += referenceItem.carbs * adjustmentFactor;
    totals.fat += referenceItem.fat * adjustmentFactor;
    totals.fiber += referenceItem.fiber * adjustmentFactor;
    totals.sugar += referenceItem.sugar * adjustmentFactor;

    // Add vitamins and minerals based on food category
    Object.keys(vitaminsByCategory).forEach(category => {
      if (ingredientName.includes(category) || bestMatchKey === category) {
        vitaminsByCategory[category].forEach(vitamin => vitaminsPresent.add(vitamin));
      }
    });

    Object.keys(mineralsByCategory).forEach(category => {
      if (ingredientName.includes(category) || bestMatchKey === category) {
        mineralsByCategory[category].forEach(mineral => mineralsPresent.add(mineral));
      }
    });
  });

  // Round values for readability
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
    fiber: Math.round(totals.fiber),
    sugar: Math.round(totals.sugar),
    vitamins: Array.from(vitaminsPresent),
    minerals: Array.from(mineralsPresent),
    source: 'Estimated from ingredients',
  };
};
