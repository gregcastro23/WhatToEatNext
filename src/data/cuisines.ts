// src/data/cuisines.ts
import type {
  Cuisine as AlchemyCuisine,
  CuisineType,
  ElementalProperties,
} from "@/types/alchemy";
import { CUISINES_METADATA, getCuisineData } from "./cuisines/index";

// Helper function to adapt ElementalProperties from cuisine.ts to alchemy.ts format
function adaptElementalProperties(props: unknown): ElementalProperties {
  const propsData = props as any;
  if (
    propsData &&
    typeof propsData === "object" &&
    Object.prototype.hasOwnProperty.call(propsData, "Fire")
  ) {
    return propsData as ElementalProperties;
  }
  return {
    Fire: propsData?.Fire || 0,
    Water: propsData?.Water || 0,
    Earth: propsData?.Earth || 0,
    Air: propsData?.Air || 0,
  };
}

function adaptCuisine(cuisine: unknown, alchemicalSignature: { targetKAlchm: number, tolerance: number }): AlchemyCuisine {
  const cuisineData = cuisine as any;
  return {
    ...cuisineData,
    alchemicalSignature,
    elementalProperties: cuisineData.elementalProperties
      ? adaptElementalProperties(cuisineData.elementalProperties)
      : undefined,
    elementalState: cuisineData.elementalState
      ? adaptElementalProperties(cuisineData.elementalState)
      : undefined,
  };
}

// Map metadata to AlchemyCuisine objects asynchronously or use a function
// For backward compatibility with synchronous access, we use the metadata
export const cuisines: Record<string, AlchemyCuisine> = {
  american: adaptCuisine(CUISINES_METADATA.American, { targetKAlchm: 1.2, tolerance: 0.3 }),
  greek: adaptCuisine(CUISINES_METADATA.Greek, { targetKAlchm: 1.5, tolerance: 0.4 }),
  indian: adaptCuisine(CUISINES_METADATA.Indian, { targetKAlchm: 2.5, tolerance: 0.6 }),
  italian: adaptCuisine(CUISINES_METADATA.Italian, { targetKAlchm: 1.8, tolerance: 0.5 }),
  middleEastern: adaptCuisine(CUISINES_METADATA.MiddleEastern, { targetKAlchm: 2.0, tolerance: 0.5 }),
  thai: adaptCuisine(CUISINES_METADATA.Thai, { targetKAlchm: 2.8, tolerance: 0.7 }),
  vietnamese: adaptCuisine(CUISINES_METADATA.Vietnamese, { targetKAlchm: 2.2, tolerance: 0.6 }),
  african: adaptCuisine(CUISINES_METADATA.African, { targetKAlchm: 2.3, tolerance: 0.6 }),
  russian: adaptCuisine(CUISINES_METADATA.Russian, { targetKAlchm: 0.9, tolerance: 0.3 }),
};

export async function getFullCuisine(name: string): Promise<AlchemyCuisine | null> {
    const raw = await getCuisineData(name);
    if (!raw) return null;
    const signatures: Record<string, any> = {
        american: { targetKAlchm: 1.2, tolerance: 0.3 },
        greek: { targetKAlchm: 1.5, tolerance: 0.4 },
        indian: { targetKAlchm: 2.5, tolerance: 0.6 },
        italian: { targetKAlchm: 1.8, tolerance: 0.5 },
        middleEastern: { targetKAlchm: 2.0, tolerance: 0.5 },
        thai: { targetKAlchm: 2.8, tolerance: 0.7 },
        vietnamese: { targetKAlchm: 2.2, tolerance: 0.6 },
        african: { targetKAlchm: 2.3, tolerance: 0.6 },
        russian: { targetKAlchm: 0.9, tolerance: 0.3 },
    };
    const key = name.toLowerCase().replace(/\s+/g, "");
    const sig = signatures[key] || { targetKAlchm: 1.0, tolerance: 0.5 };
    return adaptCuisine(raw, sig);
}

export function getCuisineKAlchm(cuisineName: string): { targetKAlchm: number, tolerance: number } {
    const cuisine = cuisines[cuisineName.toLowerCase()];
    if (cuisine && cuisine.alchemicalSignature) {
        return cuisine.alchemicalSignature;
    }
    return { targetKAlchm: 1.0, tolerance: 0.5 };
}

export type { CuisineType };
export type Cuisine = (typeof cuisines)[keyof typeof cuisines];

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

export { cuisinesMap } from "./cuisines/index";
export { CUISINES_METADATA as CUISINES };
export default cuisines;
