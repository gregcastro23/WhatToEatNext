// src/utils/elementalUtils.ts

import { DEFAULT_ELEMENTAL_PROPERTIES } from "@/constants/elementalConstants";
import type { IngredientMapping } from "@/data/ingredients/types";
import { _logger } from "@/lib/logger";
import type {
  Element,
  ElementalAffinity,
  ElementalCharacteristics,
  ElementalProfile,
  ElementalProperties,
  Recipe,
} from "@/types/alchemy";
import { isElementalProperties, logUnexpectedValue } from "@/utils/validation";

// Re-export elemental mappings for callers that rely on these utilities
export {
  elementalFunctions,
  elementalInteractions,
  elements,
} from "./elementalMappings";

/**
 * Validate that elemental properties contain valid numeric values in [0, 1].
 */
export const validateElementalProperties = (
  properties: ElementalProperties,
): boolean => {
  if (!properties) {
    _logger.warn("validateElementalProperties: properties is null/undefined");
    return false;
  }

  const required: Element[] = ["Fire", "Water", "Earth", "Air"];
  for (const key of required) {
    const value = properties[key];
    if (typeof value !== "number") {
      _logger.warn(
        `validateElementalProperties: properties.${key} is not a number`,
      );
      return false;
    }
    if (value < 0 || value > 1) {
      logUnexpectedValue("validateElementalProperties", {
        message: `Element value out of range: ${key}=${value}`,
        element: key,
        value,
      });
      return false;
    }
  }

  // Optional: warn if not approximately normalized
  const sum = required.reduce((acc, k) => acc + properties[k], 0);
  if (Math.abs(sum - 1) >= 0.01) {
    logUnexpectedValue("validateElementalProperties", {
      message: `Elemental properties do not sum to ~1 (sum=${sum.toFixed(4)})`,
      sum,
      properties,
    });
  }
  return true;
};

/**
 * Normalize partial elemental properties to a complete, normalized distribution.
 */
export const normalizeProperties = (
  properties: Partial<ElementalProperties> | null | undefined,
): ElementalProperties => {
  if (!properties) {
    _logger.warn(
      "normalizeProperties: properties is null/undefined; returning defaults",
    );
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  const complete: ElementalProperties = {
    Fire: properties.Fire ?? DEFAULT_ELEMENTAL_PROPERTIES.Fire,
    Water: properties.Water ?? DEFAULT_ELEMENTAL_PROPERTIES.Water,
    Earth: properties.Earth ?? DEFAULT_ELEMENTAL_PROPERTIES.Earth,
    Air: properties.Air ?? DEFAULT_ELEMENTAL_PROPERTIES.Air,
  };

  const sum = Object.values(complete).reduce((acc, v) => acc + v, 0);
  if (sum === 0) {
    _logger.warn("normalizeProperties: sum is 0; returning defaults");
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  return {
    Fire: complete.Fire / sum,
    Water: complete.Water / sum,
    Earth: complete.Earth / sum,
    Air: complete.Air / sum,
  };
};

/**
 * Ensure a recipe has normalized `elementalProperties`.
 */
export function standardizeRecipeElements<
  T extends { elementalProperties?: Partial<ElementalProperties> },
>(
  recipe: T | null | undefined,
): T & { elementalProperties: ElementalProperties } {
  if (!recipe) {
    _logger.warn("standardizeRecipeElements: recipe is null/undefined");
    return { elementalProperties: { ...DEFAULT_ELEMENTAL_PROPERTIES } } as T & {
      elementalProperties: ElementalProperties;
    };
  }

  if (!recipe.elementalProperties) {
    return {
      ...recipe,
      elementalProperties: { ...DEFAULT_ELEMENTAL_PROPERTIES },
    };
  }

  return {
    ...recipe,
    elementalProperties: normalizeProperties(recipe.elementalProperties),
  };
}

/**
 * Type guard wrapper for external callers.
 */
export const validateElementalRequirements = (
  properties: unknown,
): properties is ElementalProperties => isElementalProperties(properties);

/**
 * Get elements below a threshold (defaults aligned with project standards).
 */
export function getMissingElements(
  properties: Partial<ElementalProperties> | null | undefined,
): Element[] {
  if (!properties) {
    return ["Fire", "Water", "Earth", "Air"];
  }

  const threshold = 0.15;
  const missing: Element[] = [];
  (["Fire", "Water", "Earth", "Air"] as Element[]).forEach((el) => {
    const value = properties[el];
    if (typeof value !== "number" || value < threshold) {
      missing.push(el);
    }
  });
  return missing;
}

/**
 * Calculate a recipe's elemental state from its ingredients if needed.
 */
function calculateElementalStateFromIngredients(
  recipe: Recipe,
): ElementalProperties {
  const ingredients = recipe.ingredients || [];
  if (!ingredients.length) return { ...DEFAULT_ELEMENTAL_PROPERTIES };

  const totals: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let totalAmount = 0;

  for (const ing of ingredients) {
    const amount =
      typeof ing.amount === "number" && ing.amount > 0 ? ing.amount : 1;
    totalAmount += amount;
    const props = ing.elementalProperties ?? DEFAULT_ELEMENTAL_PROPERTIES;
    totals.Fire += props.Fire * amount;
    totals.Water += props.Water * amount;
    totals.Earth += props.Earth * amount;
    totals.Air += props.Air * amount;
  }

  if (totalAmount === 0) {
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  return normalizeProperties({
    Fire: totals.Fire / totalAmount,
    Water: totals.Water / totalAmount,
    Earth: totals.Earth / totalAmount,
    Air: totals.Air / totalAmount,
  });
}

/**
 * Utility collection (kept for backward compatibility with existing imports).
 */
export const elementalUtils = {
  validateProperties: validateElementalProperties,
  _validateProperties: validateElementalRequirements,
  normalizeProperties,
  standardizeRecipeElements,
  getMissingElements,

  calculateElementalState(
    recipe: Recipe | null | undefined,
  ): ElementalProperties {
    if (!recipe?.ingredients.length) {
      return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }
    return calculateElementalStateFromIngredients(recipe);
  },

  combineProperties(
    a: ElementalProperties,
    b: ElementalProperties,
    bWeight = 0.5,
  ): ElementalProperties {
    const aWeight = 1 - bWeight;
    return {
      Fire: a.Fire * aWeight + b.Fire * bWeight,
      Water: a.Water * aWeight + b.Water * bWeight,
      Earth: a.Earth * aWeight + b.Earth * bWeight,
      Air: a.Air * aWeight + b.Air * bWeight,
    };
  },

  getElementalState(recipe: Recipe): ElementalProperties {
    if (recipe.elementalProperties) return recipe.elementalProperties;
    return calculateElementalStateFromIngredients(recipe);
  },

  getComplementaryElement(
    element: keyof ElementalProperties,
  ): keyof ElementalProperties {
    // Per workspace rules, elements reinforce themselves (no opposing/balancing)
    return element;
  },

  getElementalCharacteristics(element: Element): ElementalCharacteristics {
    const characteristics: Record<Element, ElementalCharacteristics> = {
      Fire: { element: "Fire", strength: 0.8, purity: 0.8, interactions: [] },
      Water: {
        element: "Water",
        strength: 0.7,
        purity: 0.85,
        interactions: [],
      },
      Earth: {
        element: "Earth",
        strength: 0.75,
        purity: 0.8,
        interactions: [],
      },
      Air: { element: "Air", strength: 0.7, purity: 0.8, interactions: [] },
    };
    return characteristics[element];
  },

  getElementalProfile(
    properties: ElementalProperties,
  ): Partial<ElementalProfile> {
    const entries = Object.entries(properties) as Array<[Element, number]>;
    const dominant = entries.sort((a, b) => b[1] - a[1])[0][0];
    return {
      dominant,
      balance: properties,
      characteristics: [this.getElementalCharacteristics(dominant)],
    } as Partial<ElementalProfile>;
  },

  calculateBalance(properties: ElementalProperties): number {
    const values = Object.values(properties);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    return Math.max(0, 1 - variance * 4);
  },

  calculateHarmony(properties: ElementalProperties): number {
    // Harmony without oppositional logic: use balance-based metric
    const values = Object.values(properties);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    return Math.max(0, 1 - variance * 4);
  },

  getSuggestedCookingTechniques(properties: ElementalProperties): string[] {
    const techniques: string[] = [];
    const threshold = 0.3;

    const map: Record<Element, string[]> = {
      Fire: ["grilling", "roasting", "searing"],
      Water: ["steaming", "poaching", "braising"],
      Earth: ["slow cooking", "baking", "clay pot cooking"],
      Air: ["smoking", "dehydrating", "whipping"],
    };

    (Object.keys(map) as Element[]).forEach((el) => {
      if (properties[el] > threshold) techniques.push(...map[el]);
    });

    return techniques.length > 0
      ? Array.from(new Set(techniques))
      : ["Balanced cooking"];
  },

  getRecommendedTimeOfDay(properties: ElementalProperties): string[] {
    const times: string[] = [];
    const threshold = 0.3;

    const map: Record<Element, string[]> = {
      Fire: ["noon", "afternoon"],
      Water: ["evening", "night"],
      Earth: ["early morning", "late evening"],
      Air: ["morning", "dawn"],
    };

    (Object.keys(map) as Element[]).forEach((el) => {
      if (properties[el] > threshold) times.push(...map[el]);
    });

    return times.length > 0 ? Array.from(new Set(times)) : ["Any time"];
  },

  getDefaultElementalProperties(): ElementalProperties {
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  },
};

/**
 * Normalize values (sum to 1.0) – element-only helper.
 */
export function normalizeElementalValues(
  values: ElementalProperties,
): ElementalProperties {
  const total = Object.values(values).reduce((s, v) => s + v, 0);
  if (total <= 0.0001) return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  return {
    Fire: values.Fire / total,
    Water: values.Water / total,
    Earth: values.Earth / total,
    Air: values.Air / total,
  };
}

export function getPrimaryElement(
  elementalAffinity: ElementalAffinity,
): string {
  return elementalAffinity.primary;
}

export function getElementStrength(
  elementalAffinity: ElementalAffinity,
): number {
  return typeof elementalAffinity.strength === "number"
    ? elementalAffinity.strength
    : 1;
}

export const ensureCompleteElementalProperties = (
  properties: Partial<ElementalProperties>,
): ElementalProperties => ({
  Fire: properties.Fire ?? 0.25,
  Water: properties.Water ?? 0.25,
  Earth: properties.Earth ?? 0.25,
  Air: properties.Air ?? 0.25,
});

// Legacy-safe helpers (aligned with current elemental principles)
export function getBalancingElement(element: Element): Element {
  // Elements reinforce themselves
  return element;
}

type ElementalRelationship =
  | "same"
  | "neutral"
  | "generating"
  | "controlling"
  | "controlled-by"
  | "weakened-by";

export function getElementalRelationship(
  element1: Element,
  element2: Element,
): ElementalRelationship {
  return element1 === element2 ? "same" : "neutral";
}

export function calculateElementalAffinity(
  element1: Element,
  element2: Element,
): number {
  // Per rules: same has highest affinity; all others are good
  return element1 === element2 ? 0.9 : 0.7;
}

/**
 * Ensure a single ingredient mapping has required fields and normalized elementals.
 */
export function fixIngredientMapping(
  mapping: Partial<IngredientMapping>,
  key: string,
): IngredientMapping {
  const name =
    mapping.name || key.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  const elementalProperties = mapping.elementalProperties
    ? ensureCompleteElementalProperties(mapping.elementalProperties)
    : { ...DEFAULT_ELEMENTAL_PROPERTIES };

  // Minimal runtime checks for presence of critical fields
  const requiredKeys: Array<keyof IngredientMapping> = [
    "name",
    "elementalProperties",
  ];
  for (const k of requiredKeys) {
    if (
      !(k in ({ ...mapping, name, elementalProperties } as IngredientMapping))
    ) {
      throw new Error(
        `fixIngredientMapping: Missing required key '${String(k)}' for '${key}'`,
      );
    }
  }

  return {
    ...(mapping as IngredientMapping),
    name,
    elementalProperties,
  } as IngredientMapping;
}

/**
 * Normalize a record of ingredient mappings.
 */
export function fixIngredientMappings<
  T extends Record<string, Partial<IngredientMapping>>,
>(ingredients: T): Record<string, IngredientMapping> {
  const result: Record<string, IngredientMapping> = {};
  Object.entries(ingredients).forEach(([k, v]) => {
    result[k] = fixIngredientMapping(v, k);
  });
  return result;
}

/**
 * Safe normalization for unknown ingredient mapping shapes (non-generic).
 */
export function fixRawIngredientMappings(
  ingredients: Record<string, unknown>,
): Record<string, unknown> {
  return Object.entries(ingredients).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (!value || typeof value !== "object") return acc;
      const v = value as Record<string, unknown>;

      const rawProps =
        (v.elementalProperties as Partial<ElementalProperties> | undefined) ??
        undefined;
      const elementalProperties = normalizeProperties(rawProps);

      const astroProfile =
        (v.astrologicalProfile as Record<string, unknown> | undefined) ?? {};
      if (!("elementalAffinity" in astroProfile)) {
        // Determine dominant element for affinity base
        const entries = Object.entries(elementalProperties) as Array<
          [Element, number]
        >;
        const dominant = entries.sort((a, b) => b[1] - a[1])[0][0];
        astroProfile.elementalAffinity = { base: dominant };
      }

      acc[key] = {
        ...v,
        name: (v.name as string) || key.replace(/_/g, " "),
        category: (v.category as string) || "ingredient",
        elementalProperties,
        astrologicalProfile: astroProfile,
      };
      return acc;
    },
    {},
  );
}

export default elementalUtils;
