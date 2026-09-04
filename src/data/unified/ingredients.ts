import type {
  AlchemicalProperties,
  ElementalProperties,
  IngredientMapping,
  PlanetName,
  ThermodynamicMetrics,
  ThermodynamicProperties,
} from "@/types/alchemy";
import { getAssetUrl } from "@/utils/urlUtils";
import { createElementalProperties } from "../../utils/elemental/elementalUtils";
import { beveragesIngredients } from "../ingredients/beverages/beverages";
import { dairy } from "../ingredients/dairy";
import { fruits } from "../ingredients/fruits";
import { grains } from "../ingredients/grains";
import { herbs } from "../ingredients/herbs";
import { getIngredientSummary } from "../ingredients/ingredientSummaries";
import { cookingStaples } from "../ingredients/misc/cookingStaples";
import { miscIngredients } from "../ingredients/misc/misc";
import { oils } from "../ingredients/oils";
import {
  dairy as proteinDairy,
  eggs,
  legumes,
  meats,
  plantBased,
  poultry,
  seafood,
} from "../ingredients/proteins";
import { seasonings } from "../ingredients/seasonings";
import { spices } from "../ingredients/spices";
import { vegetables } from "../ingredients/vegetables";
import { vinegars } from "../ingredients/vinegars";
import {
  calculateKalchm as canonicalCalculateKalchm,
  deriveAlchemicalFromElemental,
} from "./alchemicalCalculations";
import type { UnifiedIngredient } from "./unifiedTypes";

// ===== UNIFIED INGREDIENTS SYSTEM =====
// This file provides a unified interface for accessing ingredients with enhanced alchemical properties
// It acts as an adapter/enhancer for existing ingredient data rather than duplicating it

interface RawIngredientData {
  name?: string;
  category?: string;
  subcategory?: string;
  subCategory?: string;
  description?: string;
  flavor?: string;
  image_url?: string;
  imageUrl?: string;
  image?: string;
  alchemicalProperties?: Partial<AlchemicalProperties>;
  elementalPropertiesState?: ElementalProperties;
  elementalProperties?: ElementalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  energyValues?: ThermodynamicProperties;
  sensoryProfile?: {
    taste?: Record<string, number | undefined>;
    aroma?: Record<string, number | string | undefined>;
  };
  flavorProfile?: Record<string, number>;
  nutritionalProfile?: Record<string, unknown>;
  astrologicalProfile?: UnifiedIngredient["astrologicalProfile"];
  [key: string]: unknown;
}

// Combine all protein types
const proteins = {
  ...meats,
  ...poultry,
  ...seafood,
  ...plantBased,
  ...eggs,
  ...legumes,
  // Rich dairy-protein cards (yogurt, aged cheeses…). Spread last so they
  // upgrade the leaner same-key cards from ingredients/dairy — previously this
  // file was never consumed by the unified catalog at all.
  ...proteinDairy,
};

function createFallbackDescription(name: string, category: string): string {
  const displayName = name.replace(/_/g, " ").trim() || "This ingredient";
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("spice")) {
    return `${displayName} is a concentrated aromatic spice that adds focused heat, fragrance, and depth when used with restraint. Bloom it briefly in warm fat or add it near the end for cleaner intensity, then balance with salt, acid, or dairy as the dish requires.`;
  }
  if (normalizedCategory.includes("herb")) {
    return `${displayName} is an aromatic herb used to lift dishes with fresh volatile oils, green brightness, and a distinctive finishing note. Add it late for vivid aroma or infuse it gently when a softer, more integrated herbal character is desired.`;
  }
  if (normalizedCategory.includes("protein")) {
    return `${displayName} is a protein-forward ingredient that brings structure, satiety, and savory depth to a dish. Season in layers and choose the cooking method around texture: dry heat for browning, moist heat for tenderness, and gentle finishing for balance.`;
  }

  return `${displayName} is a culinary ingredient used to shape flavor, texture, and balance within a dish. Its impact depends on timing, preparation, and proportion, so adjust quantity and technique around the surrounding ingredients.`;
}

/**
 * Calculate Kalchm value based on alchemical properties
 * K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 */
function calculateKalchm(_alchemical: AlchemicalProperties): number {
  return canonicalCalculateKalchm(_alchemical);
}

/**
 * Calculate Monica constant based on Kalchm and thermodynamic properties
 * monica = -gregsEnergy / (reactivity * ln(kalchm))
 */
function calculateMonica(
  kalchm: number,
  thermodynamics?: ThermodynamicProperties | ThermodynamicMetrics,
): number {
  if (!thermodynamics || kalchm <= 0) return 0;
  const thermo = thermodynamics as Partial<ThermodynamicProperties & ThermodynamicMetrics> & { energy?: number };
  const reactivity = Number(thermo.reactivity ?? 0);
  const gregsEnergy = thermo.gregsEnergy !== undefined ? Number(thermo.gregsEnergy) : undefined;
  const energy = Number(thermo.energy ?? 0);
  const energyValue = gregsEnergy ?? energy;
  const lnK = Math.log(Math.max(0.001, kalchm));
  if (lnK !== 0 && reactivity !== 0) {
    return -energyValue / (reactivity * lnK);
  }
  return 0;
}

/**
 * USDA-derived nutritional fallback for entries whose source files omit
 * `nutritionalProfile`. Values reflect a single typical culinary serving.
 */
const NUTRITION_FALLBACK: Record<string, Record<string, unknown>> = {
  mint:               { serving_size: "1 tbsp fresh (2g)",  calories: 1,  macros: { protein: 0.1, carbs: 0.2, fat: 0.0, fiber: 0.1 }, vitamins: { K: 0.30, A: 0.10, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "USDA" },
  rosemary:           { serving_size: "1 tsp dried (1.2g)", calories: 4,  macros: { protein: 0.1, carbs: 0.8, fat: 0.2, fiber: 0.5 }, vitamins: { A: 0.04, C: 0.02, B6: 0.02 }, minerals: { calcium: 0.04, iron: 0.04, manganese: 0.12 }, source: "USDA" },
  basil:              { serving_size: "1 tbsp fresh (3g)",  calories: 1,  macros: { protein: 0.1, carbs: 0.1, fat: 0.0, fiber: 0.05 }, vitamins: { K: 0.35, A: 0.05, C: 0.03 }, minerals: { iron: 0.04, manganese: 0.07 }, source: "USDA" },
  shiso:              { serving_size: "1 tbsp fresh (3g)",  calories: 1,  macros: { protein: 0.1, carbs: 0.2, fat: 0.0, fiber: 0.1 }, vitamins: { K: 0.30, A: 0.15, C: 0.05 }, minerals: { iron: 0.05, calcium: 0.03 }, source: "USDA approximate" },
  cinnamon:           { serving_size: "1 tsp ground (2.6g)", calories: 6,  macros: { protein: 0.1, carbs: 2.1, fat: 0.0, fiber: 1.4 }, vitamins: { K: 0.01 }, minerals: { calcium: 0.03, iron: 0.03, manganese: 0.22 }, source: "USDA" },
  paprika:            { serving_size: "1 tsp (2.3g)",        calories: 6,  macros: { protein: 0.3, carbs: 1.2, fat: 0.3, fiber: 0.8 }, vitamins: { A: 0.42, E: 0.07, B6: 0.05 }, minerals: { iron: 0.09, potassium: 0.02 }, source: "USDA" },
  turmeric:           { serving_size: "1 tsp ground (3g)",   calories: 9,  macros: { protein: 0.3, carbs: 1.9, fat: 0.3, fiber: 0.7 }, vitamins: { C: 0.01, B6: 0.04 }, minerals: { iron: 0.16, manganese: 0.26, potassium: 0.05 }, source: "USDA" },
  cumin:              { serving_size: "1 tsp ground (2.1g)", calories: 8,  macros: { protein: 0.4, carbs: 0.9, fat: 0.5, fiber: 0.2 }, vitamins: { A: 0.02, E: 0.04 }, minerals: { iron: 0.22, calcium: 0.02, magnesium: 0.02 }, source: "USDA" },
  cayenne:            { serving_size: "1 tsp (1.8g)",        calories: 6,  macros: { protein: 0.2, carbs: 1.0, fat: 0.3, fiber: 0.5 }, vitamins: { A: 0.15, C: 0.02, E: 0.05 }, minerals: { iron: 0.04, potassium: 0.02 }, source: "USDA" },
  red_wine_vinegar:   { serving_size: "1 tbsp (15ml)",       calories: 3,  macros: { protein: 0.0, carbs: 0.1, fat: 0.0, fiber: 0.0 }, vitamins: {}, minerals: { potassium: 0.01 }, source: "USDA" },
  sherry_vinegar:     { serving_size: "1 tbsp (15ml)",       calories: 3,  macros: { protein: 0.0, carbs: 0.1, fat: 0.0, fiber: 0.0 }, vitamins: {}, minerals: { potassium: 0.01 }, source: "USDA approximate" },
  champagne_vinegar:  { serving_size: "1 tbsp (15ml)",       calories: 3,  macros: { protein: 0.0, carbs: 0.0, fat: 0.0, fiber: 0.0 }, vitamins: {}, minerals: {}, source: "USDA approximate" },
  malt_vinegar:       { serving_size: "1 tbsp (15ml)",       calories: 2,  macros: { protein: 0.0, carbs: 0.4, fat: 0.0, fiber: 0.0 }, vitamins: {}, minerals: { potassium: 0.01 }, source: "USDA" },
  mirepoix:           { serving_size: "1 cup chopped (150g)", calories: 60, macros: { protein: 1.2, carbs: 14, fat: 0.2, fiber: 4.0 }, vitamins: { A: 0.55, C: 0.15, K: 0.12 }, minerals: { potassium: 0.12, manganese: 0.10 }, source: "computed: 2 onion + 1 carrot + 1 celery" },
};

/**
 * Canonical 7-axis flavor signatures per ingredient category, used as a
 * last-resort fallback when no taste data was authored. Values target a
 * representative member of the family and sum to a reasonable intensity.
 */
function pickCategoryFlavorDefault(
  category: string,
  subcategory: string,
): Record<string, number> | null {
  const c = category.toLowerCase();
  const s = subcategory.toLowerCase();

  if (c.includes("vinegar") || s.includes("vinegar")) {
    return { sweet: 0.05, salt: 0.05, salty: 0.05, sour: 0.85, bitter: 0.1, umami: 0.05, spicy: 0, aromatic: 0.4 };
  }
  if (c.includes("protein") || c === "meat" || c === "seafood" || c === "poultry") {
    return { sweet: 0.1, salt: 0.2, salty: 0.2, sour: 0, bitter: 0.05, umami: 0.7, spicy: 0, aromatic: 0.2 };
  }
  if (c.includes("aromatic")) {
    return { sweet: 0.2, salt: 0.1, salty: 0.1, sour: 0.05, bitter: 0.1, umami: 0.45, spicy: 0.05, aromatic: 0.7 };
  }
  if (c.includes("herb")) {
    return { sweet: 0.1, salt: 0, salty: 0, sour: 0, bitter: 0.3, umami: 0.05, spicy: 0.05, aromatic: 0.85 };
  }
  if (c.includes("spice")) {
    return { sweet: 0.1, salt: 0, salty: 0, sour: 0, bitter: 0.2, umami: 0.05, spicy: 0.5, aromatic: 0.85 };
  }
  if (c.includes("salt") || s.includes("salt")) {
    return { sweet: 0, salt: 0.95, salty: 0.95, sour: 0, bitter: 0.05, umami: 0.1, spicy: 0, aromatic: 0.1 };
  }
  if (c.includes("oil")) {
    return { sweet: 0.05, salt: 0, salty: 0, sour: 0, bitter: 0.1, umami: 0.1, spicy: 0.05, aromatic: 0.5 };
  }
  if (c.includes("sweet") || s.includes("sweetener")) {
    return { sweet: 0.9, salt: 0, salty: 0, sour: 0, bitter: 0, umami: 0, spicy: 0, aromatic: 0.3 };
  }
  return null;
}

/**
 * Enhance existing ingredient with unified properties
 */
function enhanceIngredient(
  ingredient: IngredientMapping,
  sourceCategory: string,
): UnifiedIngredient {
  const ingredientData = ingredient as unknown as RawIngredientData;
  const ingredientName = ingredientData.name ?? "";
  const authoredDescription =
    typeof ingredientData.description === "string" &&
    ingredientData.description.trim().length > 0
      ? ingredientData.description
      : undefined;
  const summaryDescription = getIngredientSummary(ingredientName) || undefined;
  const fallbackDescription =
    typeof ingredientData.flavor === "string" &&
    ingredientData.flavor.trim().length > 30
      ? ingredientData.flavor
      : createFallbackDescription(
          ingredientName,
          ingredientData.category ?? sourceCategory,
        );
  const imageUrl =
    ingredientData.image_url ?? ingredientData.imageUrl ?? ingredientData.image;

  const alchemicalData = ingredientData.alchemicalProperties;
  const hasAlchemicalData =
    Boolean(alchemicalData?.Spirit ??
    alchemicalData?.Essence ??
    alchemicalData?.Matter ??
    alchemicalData?.Substance);

  const elementalProps: ElementalProperties =
    ingredientData.elementalPropertiesState ??
    ingredientData.elementalProperties ?? {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };

  const alchemicalProperties: AlchemicalProperties = hasAlchemicalData && alchemicalData
    ? {
        Spirit: Number(alchemicalData.Spirit ?? 0),
        Essence: Number(alchemicalData.Essence ?? 0),
        Matter: Number(alchemicalData.Matter ?? 0),
        Substance: Number(alchemicalData.Substance ?? 0),
      }
    : deriveAlchemicalFromElemental(elementalProps);

  const kalchm = calculateKalchm(alchemicalProperties);
  const baseThermodynamics = ingredientData.thermodynamicProperties ??
    ingredientData.energyValues ?? {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5 - 0.5 * 0.2,
    };

  const monica = calculateMonica(
    kalchm,
    baseThermodynamics,
  );

  const thermodynamics = {
    ...baseThermodynamics,
    kalchm,
    monica,
  };

  const sensory = ingredientData.sensoryProfile;
  const tasteSrc = sensory?.taste;
  let projectedFlavorProfile = ingredientData.flavorProfile;
  if (!projectedFlavorProfile && tasteSrc && typeof tasteSrc === "object") {
    const sweet = Number(tasteSrc.sweet ?? 0);
    const salty = Number(tasteSrc.salty ?? tasteSrc.salt ?? 0);
    const sour = Number(tasteSrc.sour ?? 0);
    const bitter = Number(tasteSrc.bitter ?? 0);
    const umami = Number(tasteSrc.umami ?? 0);
    const spicy = Number(tasteSrc.spicy ?? 0);

    const { aroma } = sensory;
    let aromatic = 0;
    if (aroma && typeof aroma === "object") {
      for (const v of Object.values(aroma)) {
        const n = Number(v);
        if (Number.isFinite(n) && n > aromatic) aromatic = n;
      }
    }
    projectedFlavorProfile = {
      sweet,
      salt: salty,
      salty,
      sour,
      bitter,
      umami,
      spicy,
      aromatic,
    };
  }

  const cat = (ingredientData.category ?? sourceCategory).toLowerCase();
  const subcat = (ingredientData.subcategory ?? ingredientData.subCategory ?? "").toLowerCase();
  function flavorTotal(fp: Record<string, number> | undefined): number {
    if (!fp) return 0;
    return ["sweet","salty","sour","bitter","umami","spicy","aromatic"]
      .reduce((s, a) => s + (Number(fp[a] ?? 0)), 0);
  }
  if (flavorTotal(projectedFlavorProfile) === 0) {
    const fallback = pickCategoryFlavorDefault(cat, subcat);
    if (fallback) projectedFlavorProfile = fallback;
  }

  const existingNutrition = ingredientData.nutritionalProfile;
  const hasNutrition =
    existingNutrition &&
    typeof existingNutrition === "object" &&
    Object.keys(existingNutrition).length > 0;
  const nameKey = ingredientName.toLowerCase().replace(/\s+/g, "_");
  const nutritionalProfile = hasNutrition
    ? existingNutrition
    : (NUTRITION_FALLBACK[nameKey] ?? undefined);

  const existingAstro = ingredientData.astrologicalProfile;
  let astrologicalProfile = existingAstro;
  const existingPlanets: unknown[] = Array.isArray(existingAstro?.rulingPlanets)
    ? existingAstro.rulingPlanets
    : [];
  if (existingPlanets.length === 0) {
    const ep = elementalProps;
    let dom: keyof ElementalProperties = "Fire";
    let domVal = ep.Fire;
    for (const k of ["Water", "Earth", "Air"] as Array<keyof ElementalProperties>) {
      if ((ep[k] ?? 0) > domVal) { dom = k; domVal = ep[k] ?? 0; }
    }
    const planetMap: Record<string, [PlanetName, PlanetName]> = {
      Fire: ["Sun", "Mars"],
      Water: ["Moon", "Neptune"],
      Earth: ["Saturn", "Venus"],
      Air: ["Mercury", "Uranus"],
    };
    astrologicalProfile = {
      ...(existingAstro ?? {}),
      rulingPlanets: planetMap[dom],
    };
  }

  return {
    ...ingredient,
    ...(projectedFlavorProfile && { flavorProfile: projectedFlavorProfile }),
    ...(astrologicalProfile && { astrologicalProfile }),
    ...(nutritionalProfile && { nutritionalProfile }),
    name: ingredientName,
    category: ingredientData.category ?? sourceCategory,
    subcategory: ingredientData.subcategory ?? ingredientData.subCategory ?? "",
    elementalProperties:
      ingredientData.elementalPropertiesState ??
      ingredientData.elementalProperties ??
      createElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      }),
    alchemicalProperties,
    kalchm,
    monica,
    description:
      authoredDescription ?? summaryDescription ?? fallbackDescription,
    ...(imageUrl && {
      image_url: getAssetUrl(imageUrl),
      imageUrl: getAssetUrl(imageUrl),
    }),
    ...(thermodynamics && {
      energyProfile: thermodynamics,
    }),
    originalData: ingredient,
    metadata: {
      sourceFile: `ingredients/${sourceCategory}`,
      enhancedAt: new Date().toISOString(),
      kalchmCalculated: true,
    },
  };
}

/**
 * Create a unified ingredient collection from a source collection
 */
function createUnifiedCollection(
  sourceCollection: Record<string, IngredientMapping>,
  category: string,
): Record<string, UnifiedIngredient> {
  return Object.entries(sourceCollection).reduce(
    (result, [key, ingredient]) => {
      result[key] = enhanceIngredient(ingredient, category);
      return result;
    },
    {} as Record<string, UnifiedIngredient>,
  );
}

export const unifiedDairy = createUnifiedCollection(
  dairy as Record<string, IngredientMapping>,
  "dairy",
);
export const unifiedFruits = createUnifiedCollection(
  fruits as Record<string, IngredientMapping>,
  "fruits",
);
export const unifiedVegetables = createUnifiedCollection(
  vegetables as Record<string, IngredientMapping>,
  "vegetables",
);
export const unifiedHerbs = createUnifiedCollection(
  herbs as Record<string, IngredientMapping>,
  "herbs",
);
export const unifiedSpices = createUnifiedCollection(
  spices as Record<string, IngredientMapping>,
  "spices",
);
export const unifiedGrains = createUnifiedCollection(
  grains as Record<string, IngredientMapping>,
  "grains",
);
export const unifiedOils = createUnifiedCollection(
  oils as Record<string, IngredientMapping>,
  "oils",
);
export const unifiedVinegars = createUnifiedCollection(
  vinegars as Record<string, IngredientMapping>,
  "vinegars",
);
export const unifiedSeasonings = createUnifiedCollection(
  seasonings as Record<string, IngredientMapping>,
  "seasonings",
);
export const unifiedProteins = createUnifiedCollection(
  proteins as Record<string, IngredientMapping>,
  "proteins",
);
export const unifiedMisc = createUnifiedCollection(
  miscIngredients as Record<string, IngredientMapping>,
  "misc",
);
export const unifiedBeverages = createUnifiedCollection(
  beveragesIngredients as Record<string, IngredientMapping>,
  "beverages",
);
export const unifiedCookingStaples = createUnifiedCollection(
  cookingStaples as Record<string, IngredientMapping>,
  "seasonings",
);

// Combine all unified collections
const _rawUnified: Record<string, UnifiedIngredient> = {
  ...unifiedDairy,
  ...unifiedFruits,
  ...unifiedVegetables,
  ...unifiedHerbs,
  ...unifiedSpices,
  ...unifiedGrains,
  ...unifiedOils,
  ...unifiedVinegars,
  ...unifiedSeasonings,
  ...unifiedProteins,
  ...unifiedMisc,
  ...unifiedBeverages,
  ...unifiedCookingStaples,
};

function _singularKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/_exotic$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/ies$/, "y")
    .replace(/sses$/, "ss")
    .replace(/oes$/, "o")
    .replace(/ves$/, "f")
    .replace(/s$/, "")
    .replace(/\s+/g, "_");
}

const _pluralAliasMap: Record<string, string> = {};

(() => {
  const groups: Record<string, string[]> = {};
  for (const k of Object.keys(_rawUnified)) {
    const ingredientName = _rawUnified[k]?.name ?? "";
    const canon = ingredientName ? _singularKey(ingredientName) : _singularKey(k);
    (groups[canon] ??= []).push(k);
  }
  for (const [_canon, keys] of Object.entries(groups)) {
    if (keys.length < 2) continue;
    const ranked = [...keys].sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      const aLen = Object.keys(_rawUnified[a] ?? {}).length;
      const bLen = Object.keys(_rawUnified[b] ?? {}).length;
      if (aLen !== bLen) return bLen - aLen;
      return a.localeCompare(b);
    });
    const [primaryKey] = ranked;
    if (!primaryKey) continue;
    const primary = _rawUnified[primaryKey];
    if (!primary) continue;

    for (const sib of ranked.slice(1)) {
      const s = _rawUnified[sib] as Record<string, unknown> | undefined;
      if (s) {
        for (const [field, value] of Object.entries(s)) {
          if ((primary as Record<string, unknown>)[field] == null && value != null) {
            (primary as Record<string, unknown>)[field] = value;
          }
        }
      }
      _pluralAliasMap[sib] = primaryKey;
      delete _rawUnified[sib];
    }
  }
})();

export const unifiedIngredients: Record<string, UnifiedIngredient> = _rawUnified;

/** Resolve a plural-form key to its canonical singular entry, if one exists. */
export function resolveUnifiedIngredientKey(key: string): string {
  return _pluralAliasMap[key] ?? key;
}

/**
 * Get a unified ingredient by name
 */
export function getUnifiedIngredient(
  name: string,
): UnifiedIngredient | undefined {
  if (unifiedIngredients[name]) {
    return unifiedIngredients[name];
  }
  const canonical = resolveUnifiedIngredientKey(name);
  if (canonical !== name && unifiedIngredients[canonical]) {
    return unifiedIngredients[canonical];
  }
  const normalizedName = name.toLowerCase();
  return Object.values(unifiedIngredients).find(
    (ingredient) =>
      ingredient.name.toLowerCase() === normalizedName,
  );
}

/**
 * Get a unified ingredient by ID
 */
export function getIngredientById(id: string): UnifiedIngredient | undefined {
  return getUnifiedIngredient(id);
}

/**
 * Get unified ingredients by category
 */
export function getUnifiedIngredientsByCategory(
  category: string,
): UnifiedIngredient[] {
  const categoryLower = category.toLowerCase();
  return Object.values(unifiedIngredients).filter(
    (ingredient) =>
      ingredient.category.toLowerCase() === categoryLower,
  );
}

/**
 * Get ingredients by category (alias for backward compatibility)
 */
export function getIngredientsByCategory(
  category: string,
): UnifiedIngredient[] {
  return getUnifiedIngredientsByCategory(category);
}

/**
 * Get unified ingredients by subcategory
 */
export function getUnifiedIngredientsBySubcategory(
  subcategory: string,
): UnifiedIngredient[] {
  const subcategoryLower = subcategory.toLowerCase();
  return Object.values(unifiedIngredients).filter(
    (ingredient) =>
      (ingredient.subcategory ?? "").toLowerCase() === subcategoryLower,
  );
}

/**
 * Get ingredients by subcategory
 */
export function getIngredientsBySubcategory(
  subcategory: string,
): UnifiedIngredient[] {
  return getUnifiedIngredientsBySubcategory(subcategory);
}

/**
 * Find ingredients with high Kalchm values
 */
export function getHighKalchmIngredients(threshold = 1.5): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter((ingredient) => (ingredient.kalchm ?? 0) > threshold)
    .sort((a, b) => (b.kalchm ?? 0) - (a.kalchm ?? 0));
}

/**
 * Get ingredients by Kalchm range (alias for backward compatibility)
 */
export function getIngredientsByKalchmRange(
  min = 1.5,
  max = Infinity,
): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter((ingredient) => {
      const kalchm = ingredient.kalchm ?? 0;
      return kalchm >= min && kalchm <= max;
    })
    .sort((a, b) => (b.kalchm ?? 0) - (a.kalchm ?? 0));
}

/**
 * Find ingredients within a specific Monica value range
 */
export function getIngredientsByMonicaRange(
  _min: number,
  _max: number,
): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter((ingredient) => {
      const monica = ingredient.monica ?? 0;
      return monica >= _min && monica <= _max;
    })
    .sort((a, b) => (a.monica ?? 0) - (b.monica ?? 0));
}

/**
 * Find ingredients by elemental properties
 */
export function getIngredientsByElement(
  element: keyof ElementalProperties,
  threshold = 0.6,
): UnifiedIngredient[] {
  return Object.values(unifiedIngredients)
    .filter((ingredient) => {
      const props = ingredient.elementalProperties;
      return (props[element] ?? 0) >= threshold;
    })
    .sort((a, b) => {
      const valueA = a.elementalProperties[element] ?? 0;
      const valueB = b.elementalProperties[element] ?? 0;
      return valueB - valueA;
    });
}

/**
 * Find ingredient pAirs with complementary Kalchm-Monica balance
 */
export function findComplementaryIngredients(
  ingredient: UnifiedIngredient | string,
  maxResults = 10,
): UnifiedIngredient[] {
  const targetIngredient =
    typeof ingredient === "string"
      ? getUnifiedIngredient(ingredient)
      : ingredient;
  if (!targetIngredient) {
    return [];
  }
  const targetKalchmRatio =
    1 / Math.max(0.001, targetIngredient.kalchm ?? 0.001);
  const targetMonicaSum = 0;
  return Object.values(unifiedIngredients)
    .filter(
      (other) =>
        other.name !== targetIngredient.name,
    )
    .map((other) => ({
      ingredient: other,
      complementarityScore:
        (1 - Math.abs((other.kalchm ?? 0) - targetKalchmRatio)) * 0.5 +
        (1 -
          Math.abs(
            (targetIngredient.monica ?? 0) +
              (other.monica ?? 0) -
              targetMonicaSum,
          )) *
          0.5,
    }))
    .sort(
      (a, b) =>
        (b.complementarityScore ?? 0) -
        (a.complementarityScore ?? 0),
    )
    .slice(0, maxResults)
    .map((result) => result.ingredient);
}

// Re-export UnifiedIngredient type for direct imports
export type { UnifiedIngredient } from "./unifiedTypes";
// Export default
export default unifiedIngredients;
