import { _logger } from "@/lib/logger";
import type { Ingredient } from "@/types";
import type { UnifiedIngredient } from "@/types/unified";
import { standardizeIngredient } from "@/utils/dataStandardization";
import { determineIngredientModality } from "@/utils/ingredientUtils";
import { beveragesIngredients } from "./beverages/beverages";
import { dairy as dairyCollection } from "./dairy";
import { fruits } from "./fruits";
import { allGrains } from "./grains";
import { allHerbs } from "./herbs";
import { miscIngredients } from "./misc/misc";
import { _allOils } from "./oils";
import { _meats as meatsData } from "./proteins/meat";
import { plantBased as plantBasedData } from "./proteins/plantBased";
import { poultry as poultryData } from "./proteins/poultry";
import { seafood as seafoodData } from "./proteins/seafood";
import { seasonings } from "./seasonings";
import { spices } from "./spices";
import { warmSpices } from "./spices/warmSpices";
import { _enhancedVegetables } from "./vegetables";
import { _allVinegars } from "./vinegars/vinegars";

// NOTE: calculateAlchemicalProperties and calculateThermodynamicProperties have been removed
// from ingredientUtils.ts because ingredients should NOT have ESMS properties.
// ESMS (Spirit/Essence/Matter/Substance) can only be calculated from planetary positions.
// For correct calculations, use:
// - calculateAlchemicalFromPlanets() from @/utils/planetaryAlchemyMapping
// - calculateThermodynamicMetrics() from @/utils/monicaKalchmCalculations
// Add explicit exports needed by imports elsewhere in the codebase
export { fruits } from "./fruits";
export { allGrains as grains } from "./grains";
export { herbs } from "./herbs";
export { _allOils as oils } from "./oils";
export { meats, plantBased, poultry, seafood } from "./proteins/index";
export { seasonings } from "./seasonings";
export { spices } from "./spices";
export { _enhancedVegetables as vegetables } from "./vegetables";
export { vinegars } from "./vinegars/vinegars";
// Create a combined proteins object for easier imports
export const proteins = {
  ...meatsData,
  ...poultryData,
  ...seafoodData,
  ...plantBasedData,
};
// Calculate elemental properties from astrological data
const calculateElementalProperties = (
  ingredientData: Ingredient | UnifiedIngredient,
): Record<string, number> => {
  // Use actual elemental properties if they exist
  if (
    ingredientData.elementalProperties &&
    Object.keys(ingredientData.elementalProperties).length > 0
  ) {
    const props = ingredientData.elementalProperties;
    const sum = Object.values(props).reduce(
      (acc: number, val: unknown) => acc + (Number(val) || 0),
      0,
    );
    if (sum > 0) {
      return {
        Fire: (Number(props.Fire) || 0) / sum,
        Water: (Number(props.Water) || 0) / sum,
        Earth: (Number(props.Earth) || 0) / sum,
        Air: (Number(props.Air) || 0) / sum,
      };
    }
  }
  // Calculate from astrological correspondences if available
  const ingredientDataObj = ingredientData as unknown as any;
  if (ingredientDataObj.astrologicalCorrespondence) {
    const astro = ingredientDataObj.astrologicalCorrespondence;
    const elementalProps = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    // Add elemental influence from planetary rulers
    if (astro.planetaryRulers) {
      (astro.planetaryRulers as string[]).forEach((planet: string) => {
        const planetElement = getPlanetaryElement(planet);
        if (planetElement) {
          elementalProps[planetElement] += 0.3;
        }
      });
    }
    // Add elemental influence from zodiac signs
    if (astro.zodiacSigns) {
      (astro.zodiacSigns as string[]).forEach((sign: string) => {
        const signElement = getZodiacElement(sign);
        if (signElement) {
          elementalProps[signElement] += 0.2;
        }
      });
    }
    const sum = Object.values(elementalProps).reduce(
      (acc, val) => acc + val,
      0,
    );
    if (sum > 0) {
      return {
        Fire: elementalProps.Fire / sum,
        Water: elementalProps.Water / sum,
        Earth: elementalProps.Earth / sum,
        Air: elementalProps.Air / sum,
      };
    }
  }
  // If no astrological data, calculate from ingredient category
  return calculateElementalPropertiesFromCategory(
    ingredientData.category || "culinary_herb",
  );
};
// Helper function to get planetary element
function getPlanetaryElement(planet: string): string | null {
  const planetElements: Record<string, string> = {
    Sun: "Fire",
    Mars: "Fire",
    Jupiter: "Fire",
    Moon: "Water",
    Venus: "Water",
    Neptune: "Water",
    Mercury: "Air",
    Uranus: "Air",
    Saturn: "Earth",
    Pluto: "Earth",
  };
  return planetElements[planet] || null;
}
// Helper function to get zodiac element
function getZodiacElement(sign: string): string | null {
  const signElements: Record<string, string> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
  };
  return signElements[sign.toLowerCase()] || null;
}
// Helper function to calculate elemental properties from category
function calculateElementalPropertiesFromCategory(
  category: string,
): Record<string, number> {
  const categoryElements: Record<string, Record<string, number>> = {
    spice: { Fire: 0.6, Air: 0.3, Earth: 0.1, Water: 0.0 },
    culinary_herb: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    protein: { Fire: 0.4, Earth: 0.4, Water: 0.2, Air: 0.0 },
    oil: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    grain: { Earth: 0.7, Air: 0.2, Water: 0.1, Fire: 0.0 },
    vegetable: { Earth: 0.5, Water: 0.3, Air: 0.2, Fire: 0.0 },
    fruit: { Water: 0.5, Air: 0.3, Earth: 0.2, Fire: 0.0 },
    vinegar: { Fire: 0.2, Water: 0.4, Air: 0.3, Earth: 0.1 },
    seasoning: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
  };
  // Unknown category: favour Earth as most ingredients are terrestrial/grounding
  return (
    categoryElements[category] || {
      Fire: 0.15,
      Water: 0.2,
      Earth: 0.5,
      Air: 0.15,
    }
  );
}
// Process and validate a single ingredient
const processIngredient = (ingredient: unknown, name: string): Ingredient => {
  if (!ingredient) {
    throw new Error(`Invalid ingredient data for ${name}`);
  }
  // Create default lunar phase modifiers if none exist
  const defaultLunarPhaseModifiers = {
    "new moon": {
      elementalBoost: { Earth: 0.05, Water: 0.05 },
      preparationTips: ["Best for subtle preparation methods"],
      thermodynamicEffects: { heat: -0.1, entropy: -0.05 },
    },
    "full moon": {
      elementalBoost: { Water: 0.1, Air: 0.05 },
      preparationTips: ["Enhanced flavor extraction"],
      thermodynamicEffects: { reactivity: 0.1, energy: 0.05 },
    },
  };
  // Apply uniform standardization to the ingredient
  const ingredientData = ingredient as unknown as any;
  const standardized = standardizeIngredient({
    name,
    category: ingredientData.category || "culinary_herb",
    elementalProperties: calculateElementalProperties(
      ingredientData,
    ),
    qualities: Array.isArray(ingredientData.qualities)
      ? ingredientData.qualities
      : [],
    lunarPhaseModifiers:
      ingredientData.lunarPhaseModifiers || defaultLunarPhaseModifiers,
    storage: ingredientData.storage || { duration: "unknown" },
    elementalTransformation: ingredientData.elementalTransformation || {
      whenCooked: { Fire: 0.1, Air: 0.05 },
    },
    ...ingredientData,
  });
  return standardized as Ingredient;
};
// Process a collection of ingredients with the new properties
const processIngredientCollection = (
  collection: Record<string, unknown>,
): Record<string, Ingredient> =>
  Object.entries(collection).reduce(
    (acc, [key, value]) => {
      try {
        const processedIngredient = processIngredient(value, key);
        // NOTE: Alchemical and thermodynamic properties are NOT calculated here.
        // Ingredients store ONLY elemental properties.
        // ESMS and thermodynamics are computed at the recipe/cuisine level with planetary context.
        // Determine modality
        const modality =
          determineIngredientModality(
            (processedIngredient as unknown as any).qualities as string[],
          ) || [];
        // Create elementalSignature (dominant elements in order)
        const elementalSignature = Object.entries(
          (processedIngredient as unknown as any).elementalProperties || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
          },
        )
          .sort((a, b) => {
            // Pattern KK-10: Final Arithmetic Elimination for data processing
            const numericA = Number(a[1]) || 0;
            const numericB = Number(b[1]) || 0;
            return numericB - numericA;
          })
          .map(
            ([element, value]) =>
              [element, Number(value) || 0] as [string, number],
          );
        acc[key] = {
          ...processedIngredient,
          // Alchemical and thermodynamic properties removed - computed at recipe/cuisine level
          modality,
          elementalSignature:
            elementalSignature.length > 0 ? elementalSignature : undefined,
          // Process other enhanced properties if they exist
          astrologicalCorrespondence:
            (processedIngredient as unknown as any)
              .astrologicalCorrespondence || undefined,
          pairingRecommendations:
            (processedIngredient as unknown as any).pairingRecommendations ||
            undefined,
          celestialBoost:
            (processedIngredient as unknown as any).celestialBoost || undefined,
          planetaryInfluence:
            (processedIngredient as unknown as any).planetaryInfluence ||
            undefined,
        } as unknown as Ingredient;
      } catch (error) {
        _logger.warn(`Skipping invalid ingredient ${key}:`, error);
      }
      return acc;
    },
    {} as Record<string, Ingredient>,
  );
// Create comprehensive collections that combine all available sources
export const herbsCollection = processIngredientCollection(allHerbs);
export const oilsCollection = processIngredientCollection(_allOils);
export const vinegarsCollection = processIngredientCollection(_allVinegars);
export const grainsCollection = processIngredientCollection(allGrains);
export const spicesCollection = processIngredientCollection({
  ...spices,
  ...warmSpices,
});
export const _vegetablesCollection =
  processIngredientCollection(_enhancedVegetables);
export const VALID_CATEGORIES = [
  "culinary_herb",
  "spice",
  "protein",
  "oil",
  "grain",
  "medicinal_herb",
  "vegetable",
  "fruit",
  "vinegar",
  "seasoning",
] as const;
/**
 * Crude rule-based singularizer for clustering plural/singular variants
 * (onion/onions, leeks/leek, pita_breads/pita_bread, …). Goal is consistency
 * across variants, not linguistic correctness — produced stems are cluster
 * keys, not display names.
 */
function singularizeWord(word: string): string {
  if (word.length < 4) return word;
  // Latinate / Greek endings that stay plural-looking: citrus, asparagus, basis…
  if (word.endsWith("us") || word.endsWith("ss") || word.endsWith("is")) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

/**
 * Normalized cluster key for two ingredients that should be merged into one.
 * Strips diacritics, lowercases, collapses non-alphanumerics to underscores,
 * drops the "_exotic" variant suffix, and singularizes the last word.
 */
function ingredientClusterKey(name: string): string {
  let s = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  s = s.replace(/_exotic$/, "");
  const parts = s.split("_");
  if (parts.length > 0) {
    parts[parts.length - 1] = singularizeWord(parts[parts.length - 1]);
  }
  return parts.join("_");
}

/**
 * Score how "rich" an ingredient record is so we can pick the best base
 * when merging duplicates. Image > description > culinary metadata > tags.
 */
function ingredientFieldRichness(ing: unknown): number {
  const i = ing as Record<string, unknown>;
  let score = 0;
  if (typeof i.image_url === "string" && i.image_url.length > 0) score += 5;
  if (typeof i.description === "string" && i.description.length > 60) score += 3;
  if (i.culinaryProfile && typeof i.culinaryProfile === "object") score += 2;
  if (i.culinaryApplications && typeof i.culinaryApplications === "object") score += 2;
  if (i.astrologicalProfile && typeof i.astrologicalProfile === "object") score += 2;
  if (i.nutritionalProfile && typeof i.nutritionalProfile === "object") score += 2;
  if (Array.isArray(i.qualities) && i.qualities.length > 0) score += 1;
  if (Array.isArray(i.cookingMethods) && i.cookingMethods.length > 0) score += 1;
  if (Array.isArray(i.pairings) && i.pairings.length > 0) score += 1;
  return score;
}

/** True when value is "missing enough" that we should backfill from another variant. */
function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Merge N variants of the "same" ingredient (e.g. onion + onions) into one
 * consensus record. The richest variant wins the base; emptier fields are
 * backfilled from the others in descending-richness order. Display name
 * prefers the shortest variant (usually the singular).
 */
function mergeIngredientVariants(variants: Ingredient[]): Ingredient {
  if (variants.length === 1) return variants[0];
  const sorted = [...variants].sort(
    (a, b) => ingredientFieldRichness(b) - ingredientFieldRichness(a),
  );
  const base: Record<string, unknown> = { ...(sorted[0] as unknown as Record<string, unknown>) };
  for (let i = 1; i < sorted.length; i++) {
    const other = sorted[i] as unknown as Record<string, unknown>;
    for (const key of Object.keys(other)) {
      if (isEmpty(base[key]) && !isEmpty(other[key])) {
        base[key] = other[key];
      }
    }
  }
  // Prefer the shortest variant name (typically the singular form).
  const names = variants
    .map((v) => (v as { name?: string }).name)
    .filter((n): n is string => Boolean(n));
  if (names.length > 0) {
    const canonical = [...names].sort(
      (a, b) => a.length - b.length || a.localeCompare(b),
    )[0];
    base.name = canonical;
  }
  return base as unknown as Ingredient;
}

// Compile all ingredients into a single collection with deduplication.
// Singular/plural and _exotic variants are merged into one "consensus" entry
// (e.g. onion + onions ⇒ one record with the richer set of fields).
export const allIngredients = (() => {
  const processedSeasonings = processIngredientCollection(seasonings);
  const processedVegetables = processIngredientCollection(_enhancedVegetables);
  const processedFruits = processIngredientCollection(fruits);
  const processedGrains = processIngredientCollection(grainsCollection);
  const processedVinegars = processIngredientCollection(vinegarsCollection);
  const processedOils = processIngredientCollection(oilsCollection);
  const processedPlantBased = processIngredientCollection(plantBasedData);
  const processedMeats = processIngredientCollection(meatsData);
  const processedPoultry = processIngredientCollection(poultryData);
  const processedSeafood = processIngredientCollection(seafoodData);
  const processedHerbs = processIngredientCollection(herbsCollection);
  const processedSpices = processIngredientCollection(spicesCollection);
  const processedDairy = processIngredientCollection(dairyCollection);
  const processedMisc = processIngredientCollection(miscIngredients);
  const processedBeverages = processIngredientCollection(beveragesIngredients);

  // Iteration order matters when two variants share a cluster key but were
  // loaded under different source keys — the last seen key in this list wins
  // the canonical slot. Higher-priority collections come last.
  const collectionsList = [
    processedSeasonings,
    processedVegetables,
    processedFruits,
    processedGrains,
    processedVinegars,
    processedOils,
    processedPlantBased,
    processedMeats,
    processedPoultry,
    processedSeafood,
    processedHerbs,
    processedSpices,
    processedDairy,
    processedMisc,
    processedBeverages,
  ];

  // 1) Bucket every variant under its cluster key.
  const clusters = new Map<string, Array<{ key: string; ingredient: Ingredient }>>();
  for (const source of collectionsList) {
    for (const [key, ingredient] of Object.entries(source)) {
      const cluster = ingredientClusterKey((ingredient as { name?: string }).name || key);
      if (!clusters.has(cluster)) clusters.set(cluster, []);
      clusters.get(cluster)!.push({ key, ingredient });
    }
  }

  // 2) Merge each cluster and emit one record under the singular key.
  const finalResult: Record<string, Ingredient> = {};
  for (const [, variants] of clusters) {
    const merged = mergeIngredientVariants(variants.map((v) => v.ingredient));
    // Pick the canonical key: prefer the variant whose key matches the merged
    // name (so onion+onions ⇒ key "onion"), else the shortest key (usually
    // the singular form).
    const mergedName = (merged as { name?: string }).name ?? "";
    const slug = ingredientClusterKey(mergedName);
    const matchByName = variants.find(
      (v) => v.key.toLowerCase().replace(/\s+/g, "_") === slug,
    );
    const canonicalKey =
      matchByName?.key ??
      [...variants].sort(
        (a, b) => a.key.length - b.key.length || a.key.localeCompare(b.key),
      )[0].key;
    finalResult[canonicalKey] = merged;
  }
  return finalResult;
})();
// Get a complete list of all ingredient names
export const allIngredientNames = Object.keys(allIngredients);
// Create a map of ingredients for easy lookup by name - defining AFTER allIngredients is initialized
export const ingredientsMap = { ...allIngredients };
// Function to get all ingredients of a specific category
export function getAllIngredientsByCategory(category: string): Ingredient[] {
  return Object.values(allIngredients).filter(
    (ingredient) => ingredient.category === category,
  );
}
// Function to get all vegetable ingredients
export function getAllVegetables(): Ingredient[] {
  return getAllIngredientsByCategory("vegetable");
}
// Function to get all protein ingredients
export function getAllProteins(): Ingredient[] {
  return getAllIngredientsByCategory("protein");
}
// Function to get all herb ingredients
export function getAllHerbs(): Ingredient[] {
  return getAllIngredientsByCategory("culinary_herb");
}
// Function to get all spice ingredients
export function getAllSpices(): Ingredient[] {
  return getAllIngredientsByCategory("spice");
}
// Function to get all grain ingredients
export function getAllGrains(): Ingredient[] {
  return getAllIngredientsByCategory("grain");
}
// Function to get ingredients by category (subcategory functionality removed - use category instead)
// Note: subCategory property does not exist on Ingredient type
// Export the functions to make them available
export default {
  allIngredients,
  allIngredientNames,
  VALID_CATEGORIES,
  getAllIngredientsByCategory,
  getAllVegetables,
  getAllProteins,
  getAllHerbs,
  getAllSpices,
  getAllGrains,
  ingredientsMap,
};
