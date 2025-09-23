import { baseNutritionalProfiles, fetchNutritionalData } from '@/data/nutritional';
import { NutritionalProfile } from '@/types/alchemy';

/**
 * Normalizes an ingredient name for lookup in the nutritional data
 * (handles spaces, special characters, etc.)
 *
 * @param name The ingredient name to normalize
 * @returns Normalized name for data lookup
 */
export function normalizeIngredientName(name: string): string {
  if (!name) return ''

  // Convert to lowercase, trim whitespace
  return (
    name
      .toLowerCase()
      .trim()
      // Replace spaces and special chars with underscores
      .replace(/[\s-/]+/g, '_')
      // Remove any remaining special characters
      .replace(/[^\w_]/g, '')
  )
}

/**
 * Get nutritional data for an ingredient by name
 * Uses local nutritional database instead of external USDA API
 *
 * @param ingredientName The name of the ingredient
 * @returns Nutritional profile or null if not found
 */
export async function getNutritionalData(
  ingredientName: string,
): Promise<NutritionalProfile | null> {
  // Use the fetchNutritionalData function from nutritional.ts
  const profile = await fetchNutritionalData(ingredientName)

  if (!profile) return null;

  // Convert profile to match alchemy types
  const alchemyProfile: unknown = {
    ...profile
    // Convert phytonutrients from Record<string, number> to string[]
    phytonutrients: profile.phytonutrients &&,
      typeof profile.phytonutrients === 'object' &&
      !Array.isArray(profile.phytonutrients)
        ? Object.keys(profile.phytonutrients)
        : profile.phytonutrients
  }

  return alchemyProfile,
}

/**
 * Get a list of all available ingredient categories with nutritional data
 *
 * @returns Array of ingredient category names
 */
export function getAvailableNutritionalIngredients(): string[] {
  return Object.keys(baseNutritionalProfiles)
}

/**
 * Compare nutritional values between two ingredients
 *
 * @param ingredient1 First ingredient name
 * @param ingredient2 Second ingredient name
 * @returns Comparison result with percentage differences
 */
export async function compareNutritionalValues(
  ingredient1: string,
  ingredient2: string,
): Promise<{
  ingredient1: NutritionalProfile | null,
  ingredient2: NutritionalProfile | null,
  differences: Record<string, number>,
}> {
  const profile1 = await getNutritionalData(ingredient1)
  const profile2 = await getNutritionalData(ingredient2)

  // Return early if either ingredient not found
  if (!profile1 || !profile2) {
    return {
      ingredient1: profile1,
      ingredient2: profile2,
      differences: {}
    }
  }

  // Calculate differences in key metrics (percentage difference) - safe property access
  const profile1Data = profile1 as { macros?: Record<string, number> }
  const profile2Data = profile2 as { macros?: Record<string, number> }
  const profile1Macros = profile1Data?.macros || {}
  const profile2Macros = profile2Data?.macros || {}

  const differences: Record<string, number> = {
    calories: (((profile2.calories || 0) - (profile1.calories || 0)) / (profile1.calories || 1)) * 100,
    protein: profile1Macros.protein,
      ? ((profile2Macros.protein - profile1Macros.protein) / profile1Macros.protein) * 100
      : 0,
    carbs: profile1Macros.carbs,
      ? ((profile2Macros.carbs - profile1Macros.carbs) / profile1Macros.carbs) * 100
      : 0,
    fat: profile1Macros.fat,
      ? ((profile2Macros.fat - profile1Macros.fat) / profile1Macros.fat) * 100
      : 0,
    fiber: profile1Macros.fiber,
      ? ((profile2Macros.fiber - profile1Macros.fiber) / profile1Macros.fiber) * 100
      : 0
  }

  return {
    ingredient1: profile1,
    ingredient2: profile2,
    differences
  }
}