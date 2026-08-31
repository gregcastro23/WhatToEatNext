import { _logger } from "@/lib/logger";
import type { ElementalProperties } from "@/types/alchemy";
import {
  // ===== BACKWARD COMPATIBILITY LAYER - PHASE 4 =====
  // Provides the same API as old fragmented systems while using unified engine
  // Ensures 100% backward compatibility during migration

  unifiedFlavorEngine,
  calculateFlavorCompatibility as newCalculateFlavorCompatibility,
  findCompatibleProfiles as newFindCompatibleProfiles,
  searchFlavorProfiles,
  getFlavorProfile as newGetFlavorProfile,
  type UnifiedFlavorProfile,
  type UnifiedFlavorCompatibility,
  type BaseFlavorNotes,
} from "./unifiedFlavorEngine";

// ===== LEGACY INTERFACES (for backward compatibility) =====

export interface LegacyFlavorProfile {
  spicy: number;
  sweet: number;
  sour: number;
  bitter: number;
  salty: number;
  umami: number;
}

export interface LegacyFlavorCompatibilityResult {
  compatibility: number;
  elementalHarmony: number;
  kalchmResonance: number;
  monicaOptimization: number;
  seasonalAlignment: number;
  recommendations: string[];
  warnings: string[];
}

export interface LegacyCuisineProfile {
  flavorProfiles: { [key: string]: number };
  elementalProperties?: ElementalProperties;
  signatureIngredients?: string[];
  signatureTechniques?: string[];
  description?: string;
}

export interface LegacyProfileObject {
  name?: string;
  sweet?: number;
  sour?: number;
  salty?: number;
  bitter?: number;
  umami?: number;
  spicy?: number;
  flavorProfiles?: Partial<Record<string, number>>;
  elementalState?: ElementalProperties;
  elementalFlavors?: ElementalProperties;
  elementalProperties?: ElementalProperties;
  intensity?: number;
  complexity?: number;
  kalchm?: number;
  monicaOptimization?: number;
  alchemicalProperties?: Record<string, number>;
  seasonalPeak?: string[];
  seasonalModifiers?: Record<string, number>;
  culturalOrigins?: string[];
  pairingRecommendations?: string[];
  signatureIngredients?: string[];
  signatureTechniques?: string[];
  preparationMethods?: string[];
  nutritionalSynergy?: number;
  temperatureOptimal?: number;
  description?: string;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * What the legacy compatibility helpers actually accept: an object carrying
 * flavor notes and/or elemental data. Deliberately NOT `{}` - that type admits
 * strings and numbers, which is how ingredient names silently reached
 * `convertLegacyToUnified` and produced all-zero profiles.
 */
export type LegacyFlavorProfileInput =
  | Partial<LegacyFlavorProfile>
  | LegacyCuisineProfile
  | LegacyProfileObject;

/** Keys that mark a value as carrying real flavor/elemental content. */
const FLAVOR_PROFILE_KEYS = [
  "sweet",
  "sour",
  "salty",
  "bitter",
  "umami",
  "spicy",
  "flavorProfiles",
  "elementalState",
  "elementalFlavors",
  "elementalProperties",
  "baseNotes",
] as const;

/**
 * True when `value` is an object carrying at least one recognised flavor or
 * elemental field. A string, number, array, null, or empty object is not a
 * profile - converting one yields an all-zero profile indistinguishable from
 * every other, which is the defect this guard exists to surface.
 */
function isFlavorProfileLike(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return FLAVOR_PROFILE_KEYS.some(
    (key) => (value as Record<string, unknown>)[key] !== undefined,
  );
}

/** Short, log-safe description of a rejected argument. */
function describeInput(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `array(length ${value.length})`;
  if (typeof value === "object") {
    return `object(keys: ${Object.keys(value).slice(0, 6).join("|") || "none"})`;
  }
  return `${typeof value}(${JSON.stringify(value)})`;
}

// ===== BACKWARD COMPATIBILITY FUNCTIONS =====;

/**
 * Legacy calculateFlavorCompatibility function
 * @deprecated Use calculateFlavorCompatibility from unifiedFlavorEngine instead
 */
export function calculateFlavorCompatibility(
  profile1: LegacyFlavorProfileInput,
  profile2: LegacyFlavorProfileInput,
): LegacyFlavorCompatibilityResult {
  // These take flavor *profiles*, never ingredient names. The parameters used
  // to be typed `{}`, which accepts strings (every non-nullish value is
  // assignable to `{}`), so `calculateFlavorCompatibility("garlic", "ginger")`
  // type-checked and then read `.sweet`/`.umami`/... off a string. Every note
  // came back undefined, so both arguments collapsed to the same all-zero
  // profile and the result was meaningless but plausible-looking. Reject that
  // input loudly instead. To score by name, resolve the profile first with
  // `getFlavorProfileForIngredient(name)`.
  const invalid = [profile1, profile2].filter((p) => !isFlavorProfileLike(p));
  if (invalid.length > 0) {
    _logger.error(
      "calculateFlavorCompatibility received input that is not a flavor profile; " +
        "expected an object with flavor notes (sweet/sour/salty/bitter/umami/spicy), " +
        "elementalState/elementalFlavors, or flavorProfiles. Received: " +
        `${describeInput(profile1)}, ${describeInput(profile2)}. ` +
        "Use getFlavorProfileForIngredient(name) to resolve an ingredient name first.",
    );
    return {
      compatibility: 0.5,
      elementalHarmony: 0.5,
      kalchmResonance: 0.5,
      monicaOptimization: 0.5,
      seasonalAlignment: 0.5,
      recommendations: [],
      warnings: [
        "Input was not a flavor profile - no compatibility was computed. " +
          "Resolve ingredient names via getFlavorProfileForIngredient() before comparing.",
      ],
    };
  }

  try {
    // Convert legacy profiles to unified format
    const unifiedProfile1 = convertLegacyToUnified(profile1, "legacy-1");
    const unifiedProfile2 = convertLegacyToUnified(profile2, "legacy-2");

    // Use new unified engine
    const result = newCalculateFlavorCompatibility(
      unifiedProfile1,
      unifiedProfile2,
    );

    // Convert back to legacy format
    return convertUnifiedToLegacy(result);
  } catch (error) {
    _logger.warn("Legacy compatibility layer error: ", error);
    // Fallback to simple calculation
    return {
      compatibility: 0.7,
      elementalHarmony: 0.7,
      kalchmResonance: 0.7,
      monicaOptimization: 0.7,
      seasonalAlignment: 0.7,
      recommendations: ["Using fallback compatibility calculation"],
      warnings: ["Could not use advanced compatibility engine"],
    };
  }
}

/**
 * Legacy calculateFlavorMatch function
 * @deprecated Use calculateFlavorCompatibility from unifiedFlavorEngine instead
 */
export function calculateFlavorMatch(
  profile1: LegacyFlavorProfileInput,
  profile2: LegacyFlavorProfileInput,
): number {
  const result = calculateFlavorCompatibility(profile1, profile2);
  return result.compatibility;
}

/**
 * Legacy calculateCuisineFlavorMatch function
 * @deprecated Use unified engine with cuisine profiles instead
 */
export function calculateCuisineFlavorMatch(
  recipeFlavorProfile: { [key: string]: number },
  cuisineName: string,
): number {
  try {
    // Find cuisine profile in unified system
    const cuisineProfile = unifiedFlavorEngine.getProfile(
      `cuisine-${cuisineName.toLowerCase().replace(/\s+/g, "-")}`,
    );

    if (!cuisineProfile) {
      _logger.warn(`Cuisine profile not found: ${cuisineName}`);
      return 0.5; // Neutral compatibility
    }

    // Convert recipe profile to unified format
    const recipeProfile = convertLegacyToUnified(
      recipeFlavorProfile,
      "recipe-temp",
    );

    // Calculate compatibility
    const compatibility = newCalculateFlavorCompatibility(
      recipeProfile,
      cuisineProfile,
    );

    return compatibility.overall;
  } catch (error) {
    _logger.warn("Legacy cuisine flavor match error: ", error);
    return 0.5;
  }
}

/**
 * Legacy calculatePlanetaryFlavorMatch function
 * @deprecated Use unified engine with planetary profiles instead
 */
export function calculatePlanetaryFlavorMatch(
  recipeFlavors: { [key: string]: number },
  planetaryInfluences: { [key: string]: number },
): number {
  try {
    // Convert recipe to unified format
    const recipeProfile = convertLegacyToUnified(
      recipeFlavors,
      "recipe-planetary",
    );

    // Find strongest planetary influence
    const entries = Object.entries(planetaryInfluences);
    if (entries.length === 0) return 0.5;

    const [strongestPlanet] = entries.sort(
      (a, b) => b[1] - a[1],
    );

    const planetProfile = unifiedFlavorEngine.getProfile(
      `planetary-${strongestPlanet[0].toLowerCase()}`,
    );

    if (!planetProfile) {
      _logger.warn(`Planetary profile not found: ${strongestPlanet[0]}`);
      return 0.5;
    }

    // Calculate compatibility
    const compatibility = newCalculateFlavorCompatibility(
      recipeProfile,
      planetProfile,
    );

    return compatibility.overall;
  } catch (error) {
    _logger.warn("Legacy planetary flavor match error: ", error);
    return 0.5;
  }
}

/**
 * Legacy getFlavorProfileForIngredient function
 * @deprecated Use unified engine ingredient profiles instead
 */
export function getFlavorProfileForIngredient(
  ingredientName: string,
): LegacyFlavorProfile {
  try {
    const ingredientProfile = unifiedFlavorEngine.getProfile(
      `ingredient-${ingredientName.toLowerCase().replace(/\s+/g, "-")}`,
    );

    if (ingredientProfile) {
      return convertUnifiedToLegacyProfile(ingredientProfile);
    }

    // Fallback to default profile
    return {
      spicy: 0.0,
      sweet: 0.2,
      sour: 0.0,
      bitter: 0.0,
      salty: 0.1,
      umami: 0.1,
    };
  } catch (error) {
    _logger.warn("Legacy ingredient profile error: ", error);
    return {
      spicy: 0.0,
      sweet: 0.2,
      sour: 0.0,
      bitter: 0.0,
      salty: 0.1,
      umami: 0.1,
    };
  }
}

/**
 * Legacy findCompatibleProfiles function
 * @deprecated Use findCompatibleProfiles from unifiedFlavorEngine instead
 */
export function findCompatibleProfiles(
  targetProfile: LegacyFlavorProfileInput,
  minCompatibility = 0.7,
): Array<{ profile: unknown; compatibility: number }> {
  try {
    const unifiedTarget = convertLegacyToUnified(
      targetProfile,
      "target-legacy",
    );
    const results = newFindCompatibleProfiles(unifiedTarget, minCompatibility);

    return results.map((result) => ({
      profile: convertUnifiedToLegacyProfile(result.profile),
      compatibility: result.compatibility.overall,
    }));
  } catch (error) {
    _logger.warn("Legacy compatible profiles error: ", error);
    return [];
  }
}

/**
 * Legacy getCuisineProfile function
 * @deprecated Use unified engine cuisine profiles instead
 */
export function getCuisineProfile(
  cuisineName: string,
): LegacyCuisineProfile | null {
  try {
    const cuisineProfile = unifiedFlavorEngine.getProfile(
      `cuisine-${cuisineName.toLowerCase().replace(/\s+/g, "-")}`,
    );

    if (!cuisineProfile) return null;

    return {
      flavorProfiles: {
        sweet: cuisineProfile.baseNotes.sweet,
        sour: cuisineProfile.baseNotes.sour,
        salty: cuisineProfile.baseNotes.salty,
        bitter: cuisineProfile.baseNotes.bitter,
        umami: cuisineProfile.baseNotes.umami,
        spicy: cuisineProfile.baseNotes.spicy,
      },
      elementalProperties: cuisineProfile.elementalFlavors,
      signatureIngredients: cuisineProfile.pairingRecommendations,
      signatureTechniques: cuisineProfile.preparationMethods,
      description: cuisineProfile.description,
    };
  } catch (error) {
    _logger.warn("Legacy cuisine profile error: ", error);
    return null;
  }
}

/**
 * Legacy calculateElementalCompatibility function
 * @deprecated Use unified engine elemental harmony calculation instead
 */
export function calculateElementalCompatibility(
  profile1: ElementalProperties,
  profile2: ElementalProperties,
): number {
  try {
    // Create minimal unified profiles for elemental comparison
    const unifiedProfile1: UnifiedFlavorProfile = createMinimalProfile(
      "elemental-1",
      profile1,
    );
    const unifiedProfile2: UnifiedFlavorProfile = createMinimalProfile(
      "elemental-2",
      profile2,
    );

    const compatibility = newCalculateFlavorCompatibility(
      unifiedProfile1,
      unifiedProfile2,
    );

    return compatibility.elemental;
  } catch (error) {
    _logger.warn("Legacy elemental compatibility error: ", error);
    return 0.7; // Default good compatibility
  }
}

// ===== CONVERSION HELPERS =====;

/**
 * Stable, order-independent fingerprint of the scoring-relevant content of a
 * synthesized profile.
 *
 * `unifiedFlavorEngine.calculateCompatibility` caches on
 * `${profile1.id}-${profile2.id}-${context}`, which assumes an id uniquely
 * determines a profile's content. That holds for profiles registered with the
 * engine, but every converter call site here passes a *constant* id
 * ("legacy-1", "recipe-temp", ...). Without a content-derived suffix the first
 * result computed in a process is cached under that constant key and returned
 * for every later pair, so unrelated inputs yield byte-identical scores.
 *
 * `lastUpdated` is deliberately excluded: it is `new Date()` per call and would
 * make every key unique, defeating the cache instead of correcting it.
 */
function fingerprintProfileContent(profile: Record<string, unknown>): string {
  const stable = (value: unknown): string => {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "lastUpdated" && key !== "id")
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${k}:${stable(v)}`).join(",")}}`;
  };

  // FNV-1a (32-bit) — deterministic across runs, no crypto dependency.
  let hash = 0x811c9dc5;
  const serialized = stable(profile);
  for (let i = 0; i < serialized.length; i++) {
    hash ^= serialized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

function convertLegacyToUnified(
  legacyProfileInput: LegacyFlavorProfileInput,
  id: string,
): UnifiedFlavorProfile {
  const legacyProfile = legacyProfileInput as LegacyProfileObject;
  // Extract base notes from various legacy formats
  const baseNotes: BaseFlavorNotes = {
    sweet: Number(legacyProfile.sweet ?? legacyProfile.flavorProfiles?.sweet ?? 0),
    sour: Number(legacyProfile.sour ?? legacyProfile.flavorProfiles?.sour ?? 0),
    salty: Number(legacyProfile.salty ?? legacyProfile.flavorProfiles?.salty ?? 0),
    bitter: Number(legacyProfile.bitter ?? legacyProfile.flavorProfiles?.bitter ?? 0),
    umami: Number(legacyProfile.umami ?? legacyProfile.flavorProfiles?.umami ?? 0),
    spicy: Number(legacyProfile.spicy ?? legacyProfile.flavorProfiles?.spicy ?? 0),
  };

  // Extract or estimate elemental properties
  const elementalFlavors: ElementalProperties =
    legacyProfile.elementalState ??
    legacyProfile.elementalFlavors ??
    legacyProfile.elementalProperties ??
    estimateElementalFromFlavors(baseNotes);

  const profile = {
    id,
    name: legacyProfile.name ?? id,
    category: "elemental" as const,

    baseNotes,
    elementalFlavors,
    intensity: legacyProfile.intensity ?? calculateIntensity(baseNotes),
    complexity: legacyProfile.complexity ?? calculateComplexity(baseNotes),

    kalchm: legacyProfile.kalchm ?? 1.0,
    monicaOptimization: legacyProfile.monicaOptimization ?? 1.0,
    alchemicalProperties: legacyProfile.alchemicalProperties ?? {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25,
    },

    seasonalPeak: legacyProfile.seasonalPeak ?? [
      "spring",
      "summer",
      "autumn",
      "winter",
    ],
    seasonalModifiers: legacyProfile.seasonalModifiers ?? {
      spring: 0.5,
      summer: 0.5,
      autumn: 0.5,
      winter: 0.5,
    },
    culturalOrigins: legacyProfile.culturalOrigins ?? ["Universal"],
    pairingRecommendations:
      legacyProfile.pairingRecommendations ??
      legacyProfile.signatureIngredients ??
      [],

    preparationMethods:
      legacyProfile.preparationMethods ??
      legacyProfile.signatureTechniques ??
      [],
    nutritionalSynergy: legacyProfile.nutritionalSynergy ?? 0.7,
    temperatureOptimal: legacyProfile.temperatureOptimal ?? 20,

    description: legacyProfile.description ?? "Legacy profile",
    tags: legacyProfile.tags ?? ["legacy"],
    lastUpdated: new Date(),
  };

  // Suffix the caller-supplied constant id with a content fingerprint so the
  // engine's id-keyed compatibility cache distinguishes different inputs.
  return {
    ...profile,
    id: `${id}-${fingerprintProfileContent(profile)}`,
  } as unknown as UnifiedFlavorProfile;
}

function convertUnifiedToLegacy(
  unifiedResult: UnifiedFlavorCompatibility,
): LegacyFlavorCompatibilityResult {
  return {
    compatibility: unifiedResult.overall,
    elementalHarmony: unifiedResult.elemental,
    kalchmResonance: unifiedResult.kalchm,
    monicaOptimization: unifiedResult.monica,
    seasonalAlignment: unifiedResult.seasonal,
    recommendations: unifiedResult.recommendations,
    warnings: unifiedResult.warnings,
  };
}

function convertUnifiedToLegacyProfile(
  unifiedProfile: UnifiedFlavorProfile,
): LegacyFlavorProfile {
  return {
    spicy: unifiedProfile.baseNotes.spicy,
    sweet: unifiedProfile.baseNotes.sweet,
    sour: unifiedProfile.baseNotes.sour,
    bitter: unifiedProfile.baseNotes.bitter,
    salty: unifiedProfile.baseNotes.salty,
    umami: unifiedProfile.baseNotes.umami,
  };
}

function createMinimalProfile(
  id: string,
  elementalProperties: ElementalProperties,
): UnifiedFlavorProfile {
  return {
    id,
    name: id,
    category: "elemental",

    baseNotes: {
      sweet: 0.25,
      sour: 0.25,
      salty: 0.25,
      bitter: 0.25,
      umami: 0.25,
      spicy: 0.25,
    },
    elementalFlavors: elementalProperties,
    intensity: 0.5,
    complexity: 0.5,

    kalchm: 1.0,
    monicaOptimization: 1.0,
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25,
    },
    seasonalPeak: ["spring", "summer", "autumn", "winter"],
    seasonalModifiers: {
      spring: 0.5,
      summer: 0.5,
      autumn: 0.5,
      fall: 0.5,
      winter: 0.5,
      all: 0.5,
    },
    culturalOrigins: ["Universal"],
    pairingRecommendations: [],

    preparationMethods: [],
    nutritionalSynergy: 0.7,
    temperatureOptimal: 20,

    description: "Minimal profile for compatibility",
    tags: ["minimal"],
    lastUpdated: new Date(),
  };
}

function estimateElementalFromFlavors(
  baseNotes: BaseFlavorNotes,
): ElementalProperties {
  return {
    Fire: (baseNotes.spicy + baseNotes.bitter) / 2,
    Water: (baseNotes.sour + baseNotes.umami) / 2,
    Earth: (baseNotes.sweet + baseNotes.umami) / 2,
    Air: (baseNotes.bitter + baseNotes.sour) / 2,
  };
}

function calculateIntensity(baseNotes: BaseFlavorNotes): number {
  const values = Object.values(baseNotes);
  return values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
}

function calculateComplexity(baseNotes: BaseFlavorNotes): number {
  const nonZeroFlavors = Object.values(baseNotes).filter(
    (val: number) => val > 0.1,
  ).length;
  return Math.min(1, nonZeroFlavors / 6);
}

// ===== LEGACY EXPORTS (for backward compatibility) =====

// Export unified engine functions with new names for migration
export {
  newCalculateFlavorCompatibility as unifiedCalculateFlavorCompatibility,
  newFindCompatibleProfiles as unifiedFindCompatibleProfiles,
  searchFlavorProfiles as unifiedSearchFlavorProfiles,
  newGetFlavorProfile as unifiedGetFlavorProfile,
};

export default {
  // Legacy API
  calculateFlavorCompatibility,
  calculateFlavorMatch: calculateFlavorCompatibility,
  calculateCuisineFlavorMatch,
  calculatePlanetaryFlavorMatch,
  getFlavorProfileForIngredient,
  findCompatibleProfiles,
  getCuisineProfile,
  calculateElementalCompatibility,

  // New unified API
  unifiedCalculateFlavorCompatibility: newCalculateFlavorCompatibility,
  unifiedFindCompatibleProfiles: newFindCompatibleProfiles,
  unifiedSearchFlavorProfiles: searchFlavorProfiles,
  unifiedGetFlavorProfile: newGetFlavorProfile,

  // Engine access
  engine: unifiedFlavorEngine,
};
