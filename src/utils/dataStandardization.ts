import type { ElementalAffinity } from "@/types/alchemy";
import type { Element } from "@/types/celestial";

const DEFAULT_COMPATIBILITY: Record<Element, number> = {
  Fire: 0.7,
  Water: 0.7,
  Earth: 0.7,
  Air: 0.7,
};

function toElement(val: string): Element | undefined {
  if (val === "Fire" || val === "Water" || val === "Earth" || val === "Air") return val;
  return undefined;
}

// Utility to ensure elementalAffinity is always in object format
export function standardizeElementalAffinity(
  value:
    | string
    | { base: string; decanModifiers?: Record<string, unknown> }
    | ElementalAffinity
    | null
    | undefined,
): ElementalAffinity | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    const primary = toElement(value);
    if (!primary) return undefined;
    return {
      primary,
      strength: 1.0,
      compatibility: DEFAULT_COMPATIBILITY,
    };
  }
  if ("primary" in value) {
    return value;
  }
  if (typeof value === "object" && "base" in value && typeof value.base === "string") {
    const primary = toElement(value.base);
    if (!primary) return undefined;
    return {
      primary,
      strength: 1.0,
      compatibility: DEFAULT_COMPATIBILITY,
    };
  }
  return undefined;
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
