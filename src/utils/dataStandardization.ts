import type { ElementalAffinity } from "@/types/alchemy";
import type { Element } from "@/types/celestial";

const DEFAULT_COMPATIBILITY: Record<Element, number> = {
  Fire: 0.7,
  Water: 0.7,
  Earth: 0.7,
  Air: 0.7,
};

function toElement(val: string): Element {
  if (val === "Water" || val === "Earth" || val === "Air") return val;
  return "Fire";
}

// Utility to ensure elementalAffinity is always in object format
export function standardizeElementalAffinity(
  value: string | { base: string; decanModifiers?: Record<string, unknown> } | ElementalAffinity,
): ElementalAffinity {
  if (typeof value === "string") {
    return {
      primary: toElement(value),
      strength: 1.0,
      compatibility: DEFAULT_COMPATIBILITY,
    };
  }
  if ("primary" in value) {
    return value;
  }
  return {
    primary: toElement(value.base),
    strength: 1.0,
    compatibility: DEFAULT_COMPATIBILITY,
  };
}

// Helper function to update entire ingredient objects
export function standardizeIngredient<T>(ingredient: T): T {
  if (!ingredient || typeof ingredient !== "object") {
    return ingredient;
  }
  const ingredientData = ingredient as Record<string, unknown>;
  const { astrologicalProfile } = ingredientData;

  if (!astrologicalProfile || typeof astrologicalProfile !== "object") {
    return ingredient;
  }

  const astroRecord = astrologicalProfile as Record<string, unknown>;
  return {
    ...ingredientData,
    astrologicalProfile: {
      ...astroRecord,
      elementalAffinity: standardizeElementalAffinity(
        astroRecord.elementalAffinity as
          | string
          | { base: string; decanModifiers?: Record<string, unknown> }
          | ElementalAffinity,
      ),
    },
  } as T;
}
