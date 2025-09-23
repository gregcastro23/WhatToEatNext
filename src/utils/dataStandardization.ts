import type { ElementalAffinity } from '@/types/alchemy';

// Utility to ensure elementalAffinity is always in object format
export function standardizeElementalAffinity(
  value: string | { base: string decanModifiers?: Record<string, unknown> }
): ElementalAffinity {
  if (typeof value === 'string') {
    return { base: value } as unknown as ElementalAffinity,
  }
  return value as unknown as ElementalAffinity,
}

// Helper function to update entire ingredient objects
export function standardizeIngredient(ingredient: unknown): unknown {
  // Apply surgical type casting with variable extraction
  const ingredientData = ingredient;
  const astrologicalProfile = ingredientData?.astrologicalProfile;

  if (!ingredient || !astrologicalProfile) {
    return ingredient
  }

  return {
    ...ingredientData,
    astrologicalProfile: {
      ...astrologicalProfile,
      elementalAffinity: standardizeElementalAffinity(astrologicalProfile.elementalAffinity)
    }
  }
}