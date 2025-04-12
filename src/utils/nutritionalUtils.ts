import { NutritionalProfile } from '@/types/alchemy';
import { usdaNutritionalData } from '@/data/usdaNutritionalData';

/**
 * Normalizes an ingredient name for lookup in the nutritional data
 * (handles spaces, special characters, etc.)
 * 
 * @param name The ingredient name to normalize
 * @returns Normalized name for data lookup
 */
export function normalizeIngredientName(name: string): string {
  if (!name) return '';
  
  // Convert to lowercase, trim whitespace
  return name.toLowerCase()
    .trim()
    // Replace spaces and special chars with underscores
    .replace(/[\s-/]+/g, '_')
    // Remove any remaining special characters 
    .replace(/[^\w_]/g, '');
}

/**
 * Get nutritional data for an ingredient by name
 * 
 * @param ingredientName The name of the ingredient
 * @returns Nutritional profile or null if not found
 */
export function getNutritionalData(ingredientName: string): NutritionalProfile | null {
  // Normalize the name for lookup
  const normalizedName = normalizeIngredientName(ingredientName);
  
  // Try exact match first
  if (usdaNutritionalData[normalizedName]) {
    return usdaNutritionalData[normalizedName];
  }
  
  // If no exact match, try fuzzy matching by checking if the normalized name
  // contains our search term or vice versa
  const keys = Object.keys(usdaNutritionalData);
  
  // Try to find a key that contains our search term or vice versa
  const matchedKey = keys.find(key => 
    key.includes(normalizedName) || normalizedName.includes(key)
  );
  
  if (matchedKey) {
    return usdaNutritionalData[matchedKey];
  }
  
  return null;
}

/**
 * Get a list of all available ingredient names with nutritional data
 * 
 * @returns Array of ingredient names
 */
export function getAvailableNutritionalIngredients(): string[] {
  return Object.keys(usdaNutritionalData).map(key => 
    usdaNutritionalData[key].name
  );
}

/**
 * Compare nutritional values between two ingredients
 * 
 * @param ingredient1 First ingredient name
 * @param ingredient2 Second ingredient name
 * @returns Comparison result with percentage differences
 */
export function compareNutritionalValues(
  ingredient1: string, 
  ingredient2: string
): { 
  ingredient1: NutritionalProfile | null, 
  ingredient2: NutritionalProfile | null,
  differences: Record<string, number> 
} {
  const profile1 = getNutritionalData(ingredient1);
  const profile2 = getNutritionalData(ingredient2);
  
  // Return early if either ingredient not found
  if (!profile1 || !profile2) {
    return { 
      ingredient1: profile1, 
      ingredient2: profile2, 
      differences: {}
    };
  }
  
  // Calculate differences in key metrics (percentage difference)
  const differences: Record<string, number> = {
    calories: ((profile2.calories - profile1.calories) / profile1.calories) * 100,
    protein: ((profile2.macros.protein - profile1.macros.protein) / profile1.macros.protein) * 100,
    carbs: ((profile2.macros.carbs - profile1.macros.carbs) / profile1.macros.carbs) * 100,
    fat: ((profile2.macros.fat - profile1.macros.fat) / profile1.macros.fat) * 100,
    fiber: ((profile2.macros.fiber - profile1.macros.fiber) / profile1.macros.fiber) * 100
  };
  
  return { 
    ingredient1: profile1, 
    ingredient2: profile2, 
    differences 
  };
} 