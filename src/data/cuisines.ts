// src/data/cuisines.ts
import type {
  Cuisine as AlchemyCuisine,
  CuisineType,
  ElementalProperties,
} from "@/types/alchemy";
import type { NutritionalSummaryBase } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";
import { african } from "./cuisines/african";
import { american } from "./cuisines/american";
import { greek } from "./cuisines/greek";
import { CUISINES, cuisinesMap as importedCuisinesMap } from "./cuisines/index";
import { indian } from "./cuisines/indian";
import { italian } from "./cuisines/italian";
import { middleEastern } from "./cuisines/middle-eastern";
import { russian } from "./cuisines/russian";
import { thai } from "./cuisines/thai";
import { vietnamese } from "./cuisines/vietnamese";

// Import types

// Example recipe type for reference
const _: Recipe = {
  id: "example-recipe-001",
  name: "Example Recipe",
  description: "Template for recipe structure",
  cuisine: "Any",
  ingredients: [
    {
      name: "ingredient",
      amount: 100,
      unit: "g",
      category: "category",
      element: "Earth",
    },
  ],
  cookingMethod: ["baking"],
  timeToMake: "30", // minutes,
  numberOfServings: 4,
  elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, // ← Pattern GG-4: Added missing elementalProperties
  instructions: ["Prepare ingredients", "Follow cooking method"], // ← Pattern GG-4: Added missing instructions,
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  } as NutritionalSummaryBase,
  season: ["all"],
  mealType: ["any"],
};

// Helper function to adapt ElementalProperties from cuisine.ts to alchemy.ts format
function adaptElementalProperties(props: unknown): ElementalProperties {
  const propsData = props as any;
  // If it already has the index signature, return as is
  if (
    propsData &&
    typeof propsData === "object" &&
    Object.prototype.hasOwnProperty.call(propsData, "Fire")
  ) {
    return propsData as ElementalProperties;
  }

  // Convert to the format expected by alchemy.ts
  return {
    Fire: propsData?.Fire || 0,
    Water: propsData?.Water || 0,
    Earth: propsData?.Earth || 0,
    Air: propsData?.Air || 0,
  };
}

// Helper function to adapt cuisines to the Cuisine interface format
function adaptCuisine(cuisine: unknown, alchemicalSignature: { targetKAlchm: number, tolerance: number }): AlchemyCuisine {
  const cuisineData = cuisine as any;
  return {
    ...cuisineData,
    alchemicalSignature,
    // Convert elementalProperties if present,
    elementalProperties: cuisineData.elementalProperties
      ? adaptElementalProperties(cuisineData.elementalProperties)
      : undefined,

    // Convert elementalState if present,
    elementalState: cuisineData.elementalState
      ? adaptElementalProperties(cuisineData.elementalState)
      : undefined,
  };
}

// Combine all cuisines
export const cuisines: Record<string, AlchemyCuisine> = {
  american: adaptCuisine(american, { targetKAlchm: 1.2, tolerance: 0.3 }),
  greek: adaptCuisine(greek, { targetKAlchm: 1.5, tolerance: 0.4 }),
  indian: adaptCuisine(indian, { targetKAlchm: 2.5, tolerance: 0.6 }),
  italian: adaptCuisine(italian, { targetKAlchm: 1.8, tolerance: 0.5 }),
  middleEastern: adaptCuisine(middleEastern, { targetKAlchm: 2.0, tolerance: 0.5 }),
  thai: adaptCuisine(thai, { targetKAlchm: 2.8, tolerance: 0.7 }),
  vietnamese: adaptCuisine(vietnamese, { targetKAlchm: 2.2, tolerance: 0.6 }),
  african: adaptCuisine(african, { targetKAlchm: 2.3, tolerance: 0.6 }),
  russian: adaptCuisine(russian, { targetKAlchm: 0.9, tolerance: 0.3 }),
};

/**
 * Returns the target KAlchm for a given cuisine.
 * @param cuisineName - The name of the cuisine.
 * @returns The target KAlchm value or a default of 1.0.
 */
export function getCuisineKAlchm(cuisineName: string): { targetKAlchm: number, tolerance: number } {
    const cuisine = cuisines[cuisineName.toLowerCase()];
    if (cuisine && cuisine.alchemicalSignature) {
        return cuisine.alchemicalSignature;
    }
    // Return a neutral default if not found
    return { targetKAlchm: 1.0, tolerance: 0.5 };
}


// Type exports
export type { CuisineType };
export type Cuisine = (typeof cuisines)[keyof typeof cuisines];

// Helper functions for accessing cuisine properties
export const _getCuisineByName = (name: string): AlchemyCuisine | undefined =>
  cuisines[name.toLowerCase()];

export const _getCuisinesByElement = (
  element: keyof ElementalProperties,
): AlchemyCuisine[] =>
  Object.values(cuisines).filter(
    (cuisine) =>
      (cuisine.elementalState?.[element] ?? 0) >= 0.3 ||
      (cuisine.elementalProperties?.[element] ?? 0) >= 0.3,
  );

// Re-export the cuisinesMap from the imported one
export const cuisinesMap = importedCuisinesMap;

// Re-export CUISINES constant;
export { CUISINES };

export default cuisines;
