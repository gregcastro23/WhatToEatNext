import type {
  AlchemicalProperties,
  ElementalProperties,
  IngredientMapping,
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
import { miscIngredients } from "../ingredients/misc/misc";
import { oils } from "../ingredients/oils";
import {
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
import { deriveAlchemicalFromElemental } from "./alchemicalCalculations";
import type { UnifiedIngredient } from "./unifiedTypes";

// ===== UNIFIED INGREDIENTS SYSTEM =====;
// This file provides a unified interface for accessing ingredients with enhanced alchemical properties
// It acts as an adapter/enhancer for existing ingredient data rather than duplicating it
// Simple alchemical properties interface for this module
// Import ingredient data from their original sources
// Combine all protein types
const proteins = {
  ...meats,
  ...poultry,
  ...seafood,
  ...plantBased,
  ...eggs,
  ...legumes,
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
  const { Spirit, Essence, Matter, Substance } = _alchemical;
  // Prevent division by zero or negative values
  const safespirit = Math.max(0.001, Spirit);
  const safeessence = Math.max(0.001, Essence);
  const safematter = Math.max(0.001, Matter);
  const safesubstance = Math.max(0.001, Substance);
  return (
    (Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence)) /
    (Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance))
  );
}
/**
 * Calculate Monica constant based on Kalchm and thermodynamic properties
 * monica = -gregsEnergy / (reactivity * ln(kalchm))
 */
function calculateMonica(
  kalchm: number,
  thermodynamics: ThermodynamicProperties | ThermodynamicMetrics,
): number {
  if (!thermodynamics || kalchm <= 0) return 0;
  // ✅ Pattern MM-1: Safe type assertion for thermodynamics access
  const thermoData = thermodynamics as unknown as any;
  const reactivity = Number(thermoData.reactivity) || 0;
  const gregsEnergy = Number(thermoData.gregsEnergy);
  const energy = Number(thermoData.energy) || 0;
  // Use gregsEnergy if available, otherwise use energy
  const energyValue = gregsEnergy !== undefined ? gregsEnergy : energy || 0;
  // Safe calculation of logarithm;
  const lnK = Math.log(Math.max(0.001, kalchm));
  // Calculate monica value
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
  const ingredientData = ingredient as any;
  const ingredientName = String(ingredientData.name || "");
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
          String(ingredientData.category || sourceCategory),
        );
  const imageUrl =
    ingredientData.image_url || ingredientData.imageUrl || ingredientData.image;

  // Derive alchemical properties from elemental properties when not present
  // ✅ Pattern GG-6: Safe property access for alchemical properties
  const alchemicalData = ingredientData.alchemicalProperties as unknown as any;
  const hasAlchemicalData =
    alchemicalData?.Spirit ||
    alchemicalData?.Essence ||
    alchemicalData?.Matter ||
    alchemicalData?.Substance;
  // Get elemental properties for derivation
  const elementalProps: ElementalProperties = ((ingredient as any)
    .elementalProperties as ElementalProperties) || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };
  // Use existing alchemical data if present, otherwise derive from elemental properties
  const alchemicalProperties: AlchemicalProperties = hasAlchemicalData
    ? {
        Spirit: Number(alchemicalData?.Spirit) || 0,
        Essence: Number(alchemicalData?.Essence) || 0,
        Matter: Number(alchemicalData?.Matter) || 0,
        Substance: Number(alchemicalData?.Substance) || 0,
      }
    : deriveAlchemicalFromElemental(elementalProps);
  // Calculate Kalchm value
  const kalchm = calculateKalchm(alchemicalProperties);
  // Get or create thermodynamic properties
  const thermodynamics = ingredient.thermodynamicProperties ||
    ingredient.energyValues || {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5 - 0.5 * 0.2,
    };
  // ✅ Pattern MM-1: Safe union type casting for thermodynamics parameter compatibility
  const monica = calculateMonica(
    kalchm,
    thermodynamics as unknown as ThermodynamicProperties | ThermodynamicMetrics,
  );
  // Project sensoryProfile.taste → flavorProfile so consumers reading the
  // canonical 7-axis flavorProfile see the authored taste data (only ~1.7% of
  // entries declare a top-level flavorProfile; ~97% live under sensoryProfile).
  const sensory = (ingredient as any).sensoryProfile;
  const tasteSrc = sensory?.taste;
  let projectedFlavorProfile = (ingredient as any).flavorProfile;
  if (!projectedFlavorProfile && tasteSrc && typeof tasteSrc === "object") {
    const sweet = Number(tasteSrc.sweet) || 0;
    const salty = Number(tasteSrc.salty ?? tasteSrc.salt) || 0;
    const sour = Number(tasteSrc.sour) || 0;
    const bitter = Number(tasteSrc.bitter) || 0;
    const umami = Number(tasteSrc.umami) || 0;
    const spicy = Number(tasteSrc.spicy) || 0;
    // Derive aromatic from the aroma object's max intensity if present.
    const aroma = sensory?.aroma;
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

  // Category-default flavor profile when neither sensoryProfile.taste nor
  // flavorProfile was authored (or projected profile is all zero). Tuned to
  // match the canonical sensory signature for each ingredient family.
  const cat = String(ingredientData.category || sourceCategory).toLowerCase();
  const subcat = String(((ingredient as any).subcategory || (ingredient as any).subCategory || "")).toLowerCase();
  function flavorTotal(fp: Record<string, number> | undefined): number {
    if (!fp) return 0;
    return ["sweet","salty","sour","bitter","umami","spicy","aromatic"]
      .reduce((s, a) => s + (Number((fp as any)[a]) || 0), 0);
  }
  if (flavorTotal(projectedFlavorProfile) === 0) {
    const fallback = pickCategoryFlavorDefault(cat, subcat);
    if (fallback) projectedFlavorProfile = fallback;
  }

  // Backfill nutritionalProfile from the hand-curated fallback table when
  // the source ingredient omits it.
  const existingNutrition = (ingredient as any).nutritionalProfile;
  const hasNutrition =
    existingNutrition &&
    typeof existingNutrition === "object" &&
    Object.keys(existingNutrition).length > 0;
  const nutritionalProfile = hasNutrition
    ? existingNutrition
    : (NUTRITION_FALLBACK[ingredientName.toLowerCase().replace(/\s+/g, "_")] ||
       NUTRITION_FALLBACK[String(ingredientData.name || "").toLowerCase().replace(/\s+/g, "_")] ||
       undefined);

  // Backfill rulingPlanets from the dominant element when missing.
  // Each element maps to two canonical planets per traditional astrology.
  const existingAstro = (ingredient as any).astrologicalProfile;
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
    const planetMap: Record<string, [string, string]> = {
      Fire: ["Sun", "Mars"],
      Water: ["Moon", "Neptune"],
      Earth: ["Saturn", "Venus"],
      Air: ["Mercury", "Uranus"],
    };
    astrologicalProfile = {
      ...(existingAstro || {}),
      rulingPlanets: planetMap[dom],
    };
  }

  // Create enhanced unified ingredient by spreading all original properties
  // and then overriding with computed/normalized values
  return {
    // Spread all original properties first to preserve culinary details
    ...(ingredient as any),
    ...(projectedFlavorProfile && { flavorProfile: projectedFlavorProfile }),
    ...(astrologicalProfile && { astrologicalProfile }),
    ...(nutritionalProfile && { nutritionalProfile }),
    // Override with normalized core properties
    name: ingredientName,
    category: String(ingredientData.category || sourceCategory),
    subcategory: String(ingredientData.subCategory || ""),
    // ✅ Pattern GG-6: Safe property access for elemental properties
    elementalProperties:
      ((ingredient as any).elementalPropertiesState as ElementalProperties) ||
      ((ingredient as any).elementalProperties as ElementalProperties) ||
      createElementalProperties({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      }),
    alchemicalProperties,
    // New calculated values
    kalchm,
    monica,
    // Preserve authored ingredient copy first; summaries are only a fallback.
    description:
      authoredDescription || summaryDescription || fallbackDescription,
    ...(imageUrl && {
      image_url: getAssetUrl(imageUrl),
      imageUrl: getAssetUrl(imageUrl),
    }),
    // Add energy profile if thermodynamics exist
    ...(thermodynamics && {
      energyProfile: thermodynamics,
    }),
    // Reference to original ingredient data,
    originalData: ingredient,
    // ✅ Pattern KK-1: Safe date conversion for metadata
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
  sourceCollection: { [key: string]: IngredientMapping },
  category: string,
): { [key: string]: UnifiedIngredient } {
  // ✅ Pattern GG-6: Safe array operation for source collection
  return Object.entries(sourceCollection || {}).reduce(
    (result, [key, ingredient]) => {
      result[key] = enhanceIngredient(ingredient, category);
      return result;
    },
    {} as Record<string, UnifiedIngredient>,
  );
}
// ✅ Pattern MM-1: Safe Record type casting for createUnifiedCollection compatibility
export const unifiedDairy = createUnifiedCollection(
  dairy as { [key: string]: IngredientMapping },
  "dairy",
);
export const unifiedFruits = createUnifiedCollection(
  fruits as { [key: string]: IngredientMapping },
  "fruits",
);
export const unifiedVegetables = createUnifiedCollection(
  vegetables as { [key: string]: IngredientMapping },
  "vegetables",
);
export const unifiedHerbs = createUnifiedCollection(
  herbs as { [key: string]: IngredientMapping },
  "herbs",
);
export const unifiedSpices = createUnifiedCollection(
  spices as { [key: string]: IngredientMapping },
  "spices",
);
export const unifiedGrains = createUnifiedCollection(
  grains as { [key: string]: IngredientMapping },
  "grains",
);
export const unifiedOils = createUnifiedCollection(
  oils as { [key: string]: IngredientMapping },
  "oils",
);
export const unifiedVinegars = createUnifiedCollection(
  vinegars as { [key: string]: IngredientMapping },
  "vinegars",
);
export const unifiedSeasonings = createUnifiedCollection(
  seasonings as { [key: string]: IngredientMapping },
  "seasonings",
);
export const unifiedProteins = createUnifiedCollection(
  proteins as { [key: string]: IngredientMapping },
  "proteins",
);
export const unifiedMisc = createUnifiedCollection(
  miscIngredients as { [key: string]: IngredientMapping },
  "misc",
);
export const unifiedBeverages = createUnifiedCollection(
  beveragesIngredients as { [key: string]: IngredientMapping },
  "beverages",
);
// Combine all unified collections
const _rawUnified: { [key: string]: UnifiedIngredient } = {
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
};

// Collapse singular/plural collisions. The plural alias gets dropped from the
// exported map so `Object.values(unifiedIngredients).map(i => i.name)` doesn't
// emit the same name twice (which crashes React lists keyed by name). Lookups
// like `unifiedIngredients.onions` are handled by `getUnifiedIngredient()`
// below, which falls back to the canonical singular form.
function _singularKey(key: string): string {
  // Strip variant tags first so e.g. "passion_fruit_exotic" clusters with
  // "passion_fruit", then normalize. Lowercase and collapse non-alphanumerics
  // so encoding-corrupted twins (e.g. "cr_me_fra_che" vs "creme_fraiche") fold
  // together too.
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
  // Group keys by the singular form of the ingredient's display name when
  // available — names survive key-encoding bugs ("cr_me_fra_che" vs
  // "creme_fraiche" both have name "crème fraîche"). Fall back to the key
  // when the entry has no name.
  const groups: Record<string, string[]> = {};
  for (const k of Object.keys(_rawUnified)) {
    const ingredientName = (_rawUnified[k] as { name?: string }).name ?? "";
    const canon = ingredientName ? _singularKey(ingredientName) : _singularKey(k);
    (groups[canon] ||= []).push(k);
  }
  for (const [_canon, keys] of Object.entries(groups)) {
    if (keys.length < 2) continue;
    // Prefer the shortest key (typically the singular form); break ties by
    // data-completeness, then by lexicographic order for determinism.
    const ranked = [...keys].sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      const aLen = Object.keys(_rawUnified[a]).length;
      const bLen = Object.keys(_rawUnified[b]).length;
      if (aLen !== bLen) return bLen - aLen;
      return a.localeCompare(b);
    });
    const primaryKey = ranked[0];
    const primary = _rawUnified[primaryKey];
    // Shallow-merge sibling fields into the primary so unique data from
    // plural variants isn't lost, then drop the alias from the exported map.
    for (const sib of ranked.slice(1)) {
      const s = _rawUnified[sib] as Record<string, unknown>;
      for (const [field, value] of Object.entries(s)) {
        if ((primary as Record<string, unknown>)[field] == null && value != null) {
          (primary as Record<string, unknown>)[field] = value;
        }
      }
      _pluralAliasMap[sib] = primaryKey;
      delete _rawUnified[sib];
    }
  }
})();

export const unifiedIngredients: { [key: string]: UnifiedIngredient } = _rawUnified;

/** Resolve a plural-form key to its canonical singular entry, if one exists. */
export function resolveUnifiedIngredientKey(key: string): string {
  return _pluralAliasMap[key] ?? key;
}
// Helper functions for working with unified ingredients
/**
 * Get a unified ingredient by name
 */
export function getUnifiedIngredient(
  name: string,
): UnifiedIngredient | undefined {
  // Try direct access first
  if (unifiedIngredients[name]) {
    return unifiedIngredients[name];
  }
  // Plural-alias fallback: legacy callers may still pass "onions" etc.
  const canonical = resolveUnifiedIngredientKey(name);
  if (canonical !== name && unifiedIngredients[canonical]) {
    return unifiedIngredients[canonical];
  }
  // ✅ Pattern KK-1: Safe string conversion for case-insensitive search
  const normalizedName = String(name || "").toLowerCase();
  return Object.values(unifiedIngredients || {}).find(
    (ingredient) =>
      String(ingredient.name || "").toLowerCase() === normalizedName,
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
  // ✅ Pattern KK-1: Safe string conversion for category comparison
  const categoryLower = String(category || "").toLowerCase();
  return Object.values(unifiedIngredients || {}).filter(
    (ingredient) =>
      String(ingredient.category || "").toLowerCase() === categoryLower,
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
  // ✅ Pattern KK-1: Safe string conversion for subcategory comparison
  const subcategoryLower = String(subcategory || "").toLowerCase();
  return Object.values(unifiedIngredients || {}).filter(
    (ingredient) =>
      String(ingredient.subcategory || "").toLowerCase() === subcategoryLower,
  );
}
/**
 * Get ingredients by subcategory
 */
export function getIngredientsBySubcategory(
  subcategory: string,
): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe string conversion for subcategory comparison
  const subcategoryLower = String(subcategory || "").toLowerCase();
  return Object.values(unifiedIngredients || {}).filter(
    (ingredient) =>
      String(ingredient.subcategory || "").toLowerCase() === subcategoryLower,
  );
}
/**
 * Find ingredients with high Kalchm values
 */
export function getHighKalchmIngredients(threshold = 1.5): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe number conversion for kalchm comparison,
  return Object.values(unifiedIngredients || {})
    .filter((ingredient) => Number(ingredient.kalchm || 0) > threshold)
    .sort((a, b) => Number(b.kalchm || 0) - Number(a.kalchm || 0));
}
/**
 * Get ingredients by Kalchm range (alias for backward compatibility)
 */
export function getIngredientsByKalchmRange(
  min = 1.5,
  max = Infinity,
): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe number conversion for kalchm range comparison,
  return Object.values(unifiedIngredients || {})
    .filter((ingredient) => {
      const kalchm = Number(ingredient.kalchm || 0);
      return kalchm >= min && kalchm <= max;
    })
    .sort((a, b) => Number(b.kalchm || 0) - Number(a.kalchm || 0));
}
/**
 * Find ingredients within a specific Monica value range
 */
export function getIngredientsByMonicaRange(
  _min: number,
  _max: number,
): UnifiedIngredient[] {
  // ✅ Pattern KK-1: Safe number conversion for monica range comparison
  return Object.values(unifiedIngredients || {})
    .filter((ingredient) => {
      const monica = Number(ingredient.monica || 0);
      return monica >= _min && monica <= _max;
    })
    .sort((a, b) => Number(a.monica || 0) - Number(b.monica || 0));
}
/**
 * Find ingredients by elemental properties
 */
export function getIngredientsByElement(
  element: keyof ElementalProperties,
  threshold = 0.6,
): UnifiedIngredient[] {
  // ✅ Pattern GG-6: Safe property access for elemental properties,
  return Object.values(unifiedIngredients || {})
    .filter((ingredient) => {
      const props = ingredient.elementalProperties;
      return props && Number(props[element] || 0) >= threshold;
    })
    .sort((a, b) => {
      const valueA = Number(a.elementalProperties[element] || 0);
      const valueB = Number(b.elementalProperties[element] || 0);
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
  // If string is provided, convert to ingredient
  const targetIngredient =
    typeof ingredient === "string"
      ? getUnifiedIngredient(ingredient)
      : ingredient;
  if (!targetIngredient) {
    return [];
  }
  // ✅ Pattern KK-1: Safe division for complementary relationship criteria
  const targetKalchmRatio =
    1 / Math.max(0.001, Number(targetIngredient.kalchm || 0.001));
  const targetMonicaSum = 0; // Ideal balanced sum
  // ✅ Pattern KK-1: Safe number conversion for complementarity calculations
  return Object.values(unifiedIngredients || {})
    .filter(
      (other) =>
        String(other.name || "") !== String(targetIngredient.name || ""),
    )
    .map((other) => ({
      ingredient: other,
      complementarityScore:
        (1 - Math.abs(Number(other.kalchm || 0) - targetKalchmRatio)) * 0.5 +
        (1 -
          Math.abs(
            Number(targetIngredient.monica || 0) +
              Number(other.monica || 0) -
              targetMonicaSum,
          )) *
          0.5,
    }))
    .sort(
      (a, b) =>
        Number(b.complementarityScore || 0) -
        Number(a.complementarityScore || 0),
    )
    .slice(0, maxResults)
    .map((result) => result.ingredient);
}
// Re-export UnifiedIngredient type for direct imports
export type { UnifiedIngredient } from "./unifiedTypes";
// Export default
export default unifiedIngredients;
