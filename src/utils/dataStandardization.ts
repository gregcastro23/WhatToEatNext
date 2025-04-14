import type { ElementalAffinity } from '@/types/alchemy';

// Utility to ensure elementalAffinity is always in object format
export function standardizeElementalAffinity(value: string | { base: string; decanModifiers?: Record<string, unknown> }): ElementalAffinity {
  if (typeof value === 'string') {
    return { base: value };
  }
  return value;
}

// Helper function to update entire ingredient objects
export function standardizeIngredient(ingredient: unknown): unknown {
  if (!ingredient || !ingredient.astrologicalProfile) {
    return ingredient;
  }

  return {
    ...ingredient,
    astrologicalProfile: {
      ...ingredient.astrologicalProfile,
      elementalAffinity: standardizeElementalAffinity(ingredient.astrologicalProfile.elementalAffinity)
    }
  };
} 