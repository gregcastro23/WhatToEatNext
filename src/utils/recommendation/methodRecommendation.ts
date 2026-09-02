import { _logger } from "@/lib/logger";
import type {
  BasicThermodynamicProperties,
  Element,
  ElementalProperties,
  LunarPhase,
  MethodRecommendation,
  MethodRecommendationOptions,
  PlanetaryAspect,
  Season,
} from "@/types/alchemy";
import type { AstrologicalState } from "@/types/celestial";
import type { Ingredient, UnifiedIngredient } from "@/types/ingredient";
import {
  allCookingMethods,
  cookingMethods as detailedCookingMethods
} from "../../data/cooking";
import { getCurrentSeason } from "../../data/integrations/seasonal";
import { culturalCookingMethods, type CulturalCookingMethod } from "../culturalMethodsAggregator";
import { isElementalProperties } from "../elemental/elementalUtils";
import {
  dominantElementOf,
  isElement,
  resolveIngredientElement,
} from "../elemental/ingredientElement";

function getAstrologicalElementalProfile(
  astroState: unknown,
): ElementalProperties {
  if (
    astroState &&
    typeof astroState === "object" &&
    "elementalProperties" in astroState
  ) {
    const props = (astroState as Record<string, unknown>).elementalProperties;
    if (props && typeof props === "object") {
      return props as ElementalProperties;
    }
  }
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

function createElementalProperties(
  props: { Fire: number; Water: number; Earth: number; Air: number } = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  },
): ElementalProperties {
  return {
    Fire: props.Fire || 0,
    Water: props.Water || 0,
    Earth: props.Earth || 0,
    Air: props.Air || 0,
  };
}

// Type guard for FlavorProperties
interface FlavorProperties {
  bitter?: number;
  sweet?: number;
  sour?: number;
  salty?: number;
  umami?: number;
  [_key: string]: number | undefined;
}

function _hasFlavorProperties(obj: unknown): obj is FlavorProperties {
  if (!obj || typeof obj !== "object") return false;
  const objRecord = obj as Record<string, unknown>;
  return (
    typeof objRecord.bitter === "number" ||
    typeof objRecord.sweet === "number" ||
    typeof objRecord.sour === "number" ||
    typeof objRecord.salty === "number" ||
    typeof objRecord.umami === "number"
  );
}

// Safe access to elemental properties
function _getElementalProperty(
  obj: unknown,
  property: keyof ElementalProperties,
): number {
  if (isElementalProperties(obj) && typeof obj[property] === "number") {
    return obj[property];
  }
  return 0;
}

// ===== TYPES AND INTERFACES =====

interface CookingMethodData {
  id?: string;
  name?: string;
  category?: string;
  element?: Element;
  intensity?: number;
  description?: string;
  elementalEffect?: ElementalProperties;
  elementalProperties?: ElementalProperties;
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  astrologicalInfluences?: {
    favorableZodiac?: string[];
    unfavorableZodiac?: string[];
    dominantPlanets?: string[];
  };
  toolsRequired?: string[];
  bestFor?: string[];
  culturalOrigin?: string;
  seasonalPreference?: string[];
  score?: number;
  variations?: CookingMethodData[];
  relatedToMainMethod?: string;
}

type CookingMethodDictionary = Record<string, CookingMethodData | undefined>;

// ===== DATA AGGREGATION =====

// Combine traditional and cultural cooking methods
const allCookingMethodsCombined: CookingMethodDictionary = {
  // Convert allCookingMethods to our format
  ...Object.entries(allCookingMethods).reduce(
    (acc: CookingMethodDictionary, [id, method]) => {
      const elementalEffect = isElementalProperties(method.elementalEffect)
        ? method.elementalEffect
        : createElementalProperties({
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
          });
      acc[id] = {
        id,
        name: method.name,
        description: method.description,
        duration: method.duration,
        suitable_for: method.suitable_for,
        benefits: method.benefits,
        variations: method.variations ?? [],
        elementalEffect,
      };
      return acc;
    },
    {},
  ),

  // Add cultural methods with proper organization
  ...culturalCookingMethods.reduce(
    (methods: CookingMethodDictionary, method: CulturalCookingMethod) => {
      if (method.relatedToMainMethod) {
        const mainId = method.relatedToMainMethod;
        const mainMethod = methods[mainId];
        if (mainMethod) {
          const existingVariations = mainMethod.variations ?? [];
          const existingVariationsArray = Array.isArray(existingVariations)
            ? existingVariations
            : [];
          if (!existingVariationsArray.some((v) => v.id === method.id)) {
            const elementalEffect = isElementalProperties(method.elementalProperties)
              ? method.elementalProperties
              : createElementalProperties({
                  Fire: 0.25,
                  Water: 0.25,
                  Earth: 0.25,
                  Air: 0.25,
                });
            mainMethod.variations = [
              ...existingVariationsArray,
              {
                id: method.id,
                name: method.variationName ?? method.name,
                description: method.description,
                elementalEffect,
                toolsRequired: method.toolsRequired ?? [],
                bestFor: method.bestFor ?? [],
                culturalOrigin: method.culturalOrigin,
                astrologicalInfluences: method.astrologicalInfluences,
                duration: { min: 0, max: 60 },
                suitable_for: method.bestFor ?? [],
                benefits: [],
                relatedToMainMethod: mainId,
              },
            ];
          }
          return methods;
        }
      }

      const methodId = method.id;
      if (!methods[methodId] && !method.relatedToMainMethod) {
        const elementalEffect = isElementalProperties(method.elementalProperties)
          ? method.elementalProperties
          : createElementalProperties({
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25,
            });
        methods[methodId] = {
          id: methodId,
          name: method.name,
          description: method.description,
          elementalEffect,
          toolsRequired: method.toolsRequired ?? [],
          bestFor: method.bestFor ?? [],
          culturalOrigin: method.culturalOrigin,
          astrologicalInfluences: {
            favorableZodiac: method.astrologicalInfluences?.favorableZodiac ?? [],
            unfavorableZodiac: method.astrologicalInfluences?.unfavorableZodiac ?? [],
            dominantPlanets: method.astrologicalInfluences?.dominantPlanets ?? [],
          },
          duration: { min: 0, max: 60 },
          suitable_for: method.bestFor ?? [],
          benefits: [],
          variations: [],
        };
      }
      return methods;
    },
    {},
  ),
};

// ===== THERMODYNAMIC HELPERS =====

/**
 * Get thermodynamic properties for a cooking method
 */
export function getMethodThermodynamics(
  method: CookingMethodData,
): BasicThermodynamicProperties {
  const methodNameLower =
    String(method.name ?? "").toLowerCase();

  const detailedMethodData = (
    detailedCookingMethods as Record<
      string,
      | {
          thermodynamicProperties?: {
            heat?: number;
            _entropy?: number;
            _reactivity?: number;
            gregsEnergy?: number;
          };
        }
      | undefined
    >
  )[methodNameLower];
  if (detailedMethodData?.thermodynamicProperties) {
    const tp = detailedMethodData.thermodynamicProperties;
    return {
      heat: tp.heat ?? 0.5,
      entropy: tp._entropy ?? 0.5,
      reactivity: tp._reactivity ?? 0.5,
      gregsEnergy: tp.gregsEnergy ?? 0.5,
    };
  }

  // 2. Check if the method object itself has thermodynamic properties
  const methodData = method as {
    thermodynamicProperties?: {
      heat?: number;
      _entropy?: number;
      _reactivity?: number;
      gregsEnergy?: number;
    };
  };
  const { thermodynamicProperties } = methodData;
  if (thermodynamicProperties) {
    return {
      heat: Number(thermodynamicProperties.heat) || 0.5,
      entropy: Number(thermodynamicProperties._entropy) || 0.5,
      reactivity: Number(thermodynamicProperties._reactivity) || 0.5,
      gregsEnergy: Number(thermodynamicProperties.gregsEnergy) || 0.5,
    };
  }


  // 3. Fallback logic based on method name characteristics - Safe string access
  //
  // A tier reading `_COOKING_METHOD_THERMODYNAMICS` used to sit above this one.
  // That constant was `{}`, so its `if` guard was never true and this heuristic
  // has been the real tier 3 all along. See src/types/alchemy.ts for why it was
  // removed rather than populated.
  if (
    methodNameLower.includes("grill") ||
    methodNameLower.includes("roast") ||
    methodNameLower.includes("fry") ||
    methodNameLower.includes("sear") ||
    methodNameLower.includes("broil") ||
    methodNameLower.includes("char")
  ) {
    return { heat: 0.8, entropy: 0.6, reactivity: 0.7, gregsEnergy: 0.7 };
  } else if (methodNameLower.includes("bake")) {
    return { heat: 0.7, entropy: 0.5, reactivity: 0.6, gregsEnergy: 0.6 };
  } else if (
    methodNameLower.includes("steam") ||
    methodNameLower.includes("simmer") ||
    methodNameLower.includes("poach") ||
    methodNameLower.includes("boil")
  ) {
    return { heat: 0.4, entropy: 0.3, reactivity: 0.5, gregsEnergy: 0.4 };
  } else if (
    methodNameLower.includes("sous vide") ||
    methodNameLower.includes("sous_vide")
  ) {
    return { heat: 0.3, entropy: 0.35, reactivity: 0.2, gregsEnergy: 0.3 };
  } else if (
    methodNameLower.includes("raw") ||
    methodNameLower.includes("ceviche") ||
    methodNameLower.includes("ferment") ||
    methodNameLower.includes("pickle") ||
    methodNameLower.includes("cure") ||
    methodNameLower.includes("marinate")
  ) {
    return { heat: 0.1, entropy: 0.5, reactivity: 0.4, gregsEnergy: 0.3 };
  } else if (
    methodNameLower.includes("braise") ||
    methodNameLower.includes("stew")
  ) {
    return { heat: 0.55, entropy: 0.75, reactivity: 0.6, gregsEnergy: 0.6 };
  } else if (methodNameLower.includes("pressure")) {
    return { heat: 0.7, entropy: 0.8, reactivity: 0.65, gregsEnergy: 0.7 };
  } else if (
    methodNameLower.includes("smoke") ||
    methodNameLower.includes("smok")
  ) {
    return { heat: 0.6, entropy: 0.4, reactivity: 0.75, gregsEnergy: 0.6 };
  } else if (
    methodNameLower.includes("confit") ||
    methodNameLower.includes("slow cook")
  ) {
    return { heat: 0.4, entropy: 0.6, reactivity: 0.45, gregsEnergy: 0.5 };
  } else if (
    methodNameLower.includes("dehydrat") ||
    methodNameLower.includes("dry")
  ) {
    return { heat: 0.3, entropy: 0.2, reactivity: 0.3, gregsEnergy: 0.25 };
  } else if (
    methodNameLower.includes("toast") ||
    methodNameLower.includes("brulee")
  ) {
    return { heat: 0.75, entropy: 0.5, reactivity: 0.8, gregsEnergy: 0.7 };
  }

  // Default values if no match found
  return { heat: 0.5, entropy: 0.5, reactivity: 0.5, gregsEnergy: 0.5 };
}

/**
 * Calculate thermodynamic base score for a method
 */
export function calculateThermodynamicBaseScore(
  thermodynamics: BasicThermodynamicProperties,
): number {
  const { heat, entropy, reactivity } = thermodynamics;

  // Balanced thermodynamic properties generally score higher
  const balance =
    1 -
    Math.abs(heat - 0.5) -
    Math.abs(entropy - 0.5) -
    Math.abs(reactivity - 0.5);
  const intensity = (heat + entropy + reactivity) / 3;

  return balance * 0.6 + intensity * 0.4;
}

// ===== UTILITY FUNCTIONS =====

export function normalizeMethodName(methodName: string): string {
  return methodName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function areSimilarMethods(method1: string, method2: string): boolean {
  const normalized1 = normalizeMethodName(method1);
  const normalized2 = normalizeMethodName(method2);

  // Check for exact match
  if (normalized1 === normalized2) return true;
  // Check for partial matches
  const similarityThreshold = 0.7;
  const longer =
    (normalized1 || []).length > (normalized2 || []).length
      ? normalized1
      : normalized2;
  const shorter =
    (normalized1 || []).length <= (normalized2 || []).length
      ? normalized1
      : normalized2;

  let matches = 0;
  for (let i = 0; i < (shorter || []).length; i++) {
    const token = shorter?.[i];
    if (token !== undefined && longer.includes(token)) matches++;
  }

  return matches / (shorter || []).length >= similarityThreshold;
}

// ===== COMPATIBILITY FUNCTIONS =====

/**
 * Calculate enhanced elemental compatibility between method and target properties
 */
export function calculateEnhancedElementalCompatibility(
  methodProps: ElementalProperties,
  targetProps: ElementalProperties,
): number {
  let totalCompatibility = 0;
  let elementCount = 0;
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  for (const element of elements) {
    const methodValue = methodProps[element];
    const targetValue = targetProps[element];

    // Following elemental principles: higher compatibility for similar values
    const compatibility = 1 - Math.abs(methodValue - targetValue);

    // Weight by the target element's importance
    const weight = targetValue + 0.1; // Ensure minimum weight

    totalCompatibility += compatibility * weight;
    elementCount += weight;
  }

  return elementCount > 0 ? totalCompatibility / elementCount : 0.5;
}

/**
 * Calculate planetary day influence on cooking method
 */
export function calculatePlanetaryDayInfluence(
  method: CookingMethodData,
  planetaryDay: string,
): number {
  const planetaryMethodAffinities: Record<string, string[] | undefined> = {
    Sun: ["grill", "roast", "bake", "sear", "broil"],
    Moon: ["steam", "poach", "simmer", "braise", "slow cook"],
    Mars: ["fry", "sauté", "stir fry", "char", "blacken"],
    Mercury: ["julienne", "dice", "mince", "chop", "slice"],
    Jupiter: ["feast", "banquet", "abundance", "large batch"],
    Venus: ["garnish", "plate", "present", "decorate"],
    Saturn: ["preserve", "cure", "age", "ferment", "pickle"],
  };

  const methodName = String(method.name ?? "").toLowerCase();
  const affinities = planetaryMethodAffinities[planetaryDay] ?? [];

  const hasAffinity = affinities.some((affinity) =>
    methodName.includes(affinity.toLowerCase()),
  );

  return hasAffinity ? 0.8 : 0.5;
}

/**
 * Calculate planetary hour influence on cooking method
 */
export function calculatePlanetaryHourInfluence(
  method: CookingMethodData,
  planetaryHour: string,
  isDaytime: boolean,
): number {
  const hourMethodAffinities: Record<string, string[] | undefined> = {
    Sun: isDaytime ? ["grill", "roast", "bake"] : ["warm", "heat"],
    Moon: isDaytime ? ["steam", "poach"] : ["simmer", "braise"],
    Mars: isDaytime ? ["fry", "sear"] : ["char", "blacken"],
    Mercury: isDaytime ? ["chop", "dice"] : ["mince", "julienne"],
    Jupiter: isDaytime ? ["feast", "abundance"] : ["comfort", "hearty"],
    Venus: isDaytime ? ["garnish", "present"] : ["delicate", "refined"],
    Saturn: isDaytime ? ["preserve", "cure"] : ["age", "ferment"],
  };

  const methodName = String(method.name ?? "").toLowerCase();
  const affinities = hourMethodAffinities[planetaryHour] ?? [];

  const hasAffinity = affinities.some((affinity) =>
    methodName.includes(affinity.toLowerCase()),
  );

  return hasAffinity ? 0.7 : 0.5;
}

/**
 * Get recommended cooking methods based on elemental composition and preferences
 */
export function getRecommendedCookingMethods(
  elementalComposition: ElementalProperties,
  currentZodiac?: string,
  planets?: string[],
  season = getCurrentSeason(),
  culturalPreference?: string,
  _dietaryPreferences?: string[],
  availableTools?: string[],
): Array<{
  name: string;
  score: number;
  description: string;
  reasons: string[];
  elementalEffect: ElementalProperties;
  duration: { min: number; max: number };
  thermodynamics: BasicThermodynamicProperties;
  variations: CookingMethodData[];
}> {
  const recommendations: Array<{
    method: CookingMethodData;
    score: number;
    reasons: string[];
    thermodynamics: BasicThermodynamicProperties;
  }> = [];

  // Score each cooking method
  for (const method of Object.values(allCookingMethodsCombined)) {
    if (!method) continue;
    let score = 0.5; // Base score
    const reasons: string[] = [];
    // Elemental compatibility (40% weight)
    const elementalEffect = method.elementalEffect ?? createElementalProperties();
    const elementalScore = calculateEnhancedElementalCompatibility(
      elementalEffect,
      elementalComposition,
    );
    score += elementalScore * 0.4;
    if (elementalScore > 0.7) {
      reasons.push("Strong elemental alignment");
    }

    // Zodiac compatibility (20% weight)
    const { astrologicalInfluences } = method;
    const favorableZodiac = astrologicalInfluences?.favorableZodiac ?? [];
    if (currentZodiac && favorableZodiac.length > 0) {
      const zodiacMatch = favorableZodiac.includes(currentZodiac);
      if (zodiacMatch) {
        score += 0.2;
        reasons.push(`Favorable for ${currentZodiac}`);
      }
    }

    // Planetary compatibility (15% weight)
    const dominantPlanets = astrologicalInfluences?.dominantPlanets ?? [];
    if (planets && dominantPlanets.length > 0) {
      const planetMatch = planets.some((planet) =>
        dominantPlanets.includes(planet),
      );
      if (planetMatch) {
        score += 0.15;
        reasons.push("Planetary alignment");
      }
    }

    // Seasonal compatibility (10% weight)
    const seasonalPreference = method.seasonalPreference ?? [];
    if (seasonalPreference.includes(season)) {
      score += 0.1;
      reasons.push(`Perfect for ${season}`);
    }

    // Cultural preference (10% weight)
    const culturalOrigin = String(method.culturalOrigin ?? "");
    if (culturalPreference && culturalOrigin === culturalPreference) {
      score += 0.1;
      reasons.push(`${culturalPreference} tradition`);
    }

    // Tool availability (5% weight)
    const { toolsRequired } = method;
    if (availableTools && toolsRequired && toolsRequired.length > 0) {
      const toolsAvailable = toolsRequired.every((tool) =>
        availableTools.some((available) =>
          available.toLowerCase().includes(tool.toLowerCase()),
        ),
      );
      if (toolsAvailable) {
        score += 0.05;
        reasons.push("Tools available");
      }
    }

    // Get thermodynamic properties
    const thermodynamics = getMethodThermodynamics(
      method,
    );

    recommendations.push({
      method,
      score: Math.min(1, score),
      reasons,
      thermodynamics,
    });
  }

  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((rec) => ({
      name: rec.method.name ?? rec.method.id ?? "unknown",
      score: rec.score,
      description: rec.method.description ?? "",
      reasons: rec.reasons,
      elementalEffect: rec.method.elementalEffect ?? createElementalProperties(),
      duration: rec.method.duration ?? { min: 0, max: 60 },
      thermodynamics: rec.thermodynamics,
      variations: rec.method.variations ?? [],
    }));
}

// ===== LUNAR AND ASPECT CALCULATIONS =====

export function calculateLunarMethodAffinity(
  method: CookingMethodData,
  phase: LunarPhase,
): number {
  const lunarAffinities: Record<LunarPhase, string[] | undefined> = {
    "new moon": ["ferment", "pickle", "cure", "preserve"],
    "waxing crescent": ["steam", "poach", "simmer"],
    "first quarter": ["sauté", "stir fry", "quick cook"],
    "waxing gibbous": ["bake", "roast", "grill"],
    "full moon": ["feast", "celebration", "abundance"],
    "waning gibbous": ["braise", "slow cook", "stew"],
    "last quarter": ["reduce", "concentrate", "intensify"],
    "waning crescent": ["rest", "minimal cooking", "raw"],
  };

  const methodName = String(method.name).toLowerCase();
  const phaseAffinities = lunarAffinities[phase] ?? [];

  const hasAffinity = phaseAffinities.some((affinity) =>
    methodName.includes(affinity),
  );

  return hasAffinity ? 0.8 : 0.5;
}

function _calculateAspectMethodAffinity(
  aspects: PlanetaryAspect[],
  method: CookingMethodData,
): number {
  if (aspects.length === 0) return 0.5;

  let totalAffinity = 0;
  let aspectCount = 0;

  aspects.forEach((aspect) => {
    // Different aspects favor different cooking approaches
    let affinity = 0.5;

    const methodName = String(method.name).toLowerCase();

    // Scale intensity based on the exactness of the aspect
    // Peak strength = 1.0 at 0º orb, trails off to 0.0 at 8º orb
    const strength = aspect.strength ?? Math.max(0, 1 - (Math.abs(aspect.orb) / 8));

    if (aspect.type === "conjunction" || aspect.type === "trine") {
      // Harmonious aspects favor gentle, harmonious cooking methods
      if (
        methodName.includes("steam") ||
        methodName.includes("poach") ||
        methodName.includes("simmer")
      ) {
        affinity = 0.5 + (0.45 * strength); // Scales up to 0.95 at peak accuracy
      }
    } else if (aspect.type === "square" || aspect.type === "opposition") {
      // Challenging aspects favor more intense cooking methods
      if (
        methodName.includes("grill") ||
        methodName.includes("fry") ||
        methodName.includes("sear")
      ) {
        affinity = 0.5 + (0.45 * strength); // Scales up to 0.95 at peak accuracy
      }
    }

    totalAffinity += affinity;
    aspectCount++;
  });

  return aspectCount > 0
    ? totalAffinity / aspectCount
    : 0.5;
}

// ===== ENHANCED SCORING FUNCTIONS =====

export function calculateMethodScore(
  method: CookingMethodData,
  astroState: AstrologicalState,
): number {
  let score = 0.5; // Base score

  // Elemental compatibility
  const methodElemental = getMethodElementalProfile(method);
  const astroElemental = getAstrologicalElementalProfile(astroState);
  const elementalCompatibility = calculateElementalCompatibility(
    methodElemental,
    astroElemental,
  );
  score += elementalCompatibility * 0.4;

  // Lunar phase compatibility
  if (astroState.lunarPhase) {
    const lunarAffinity = calculateLunarMethodAffinity(
      method,
      astroState.lunarPhase,
    );
    score += lunarAffinity * 0.3;
  }


  // Planetary aspects compatibility
  if (astroState.aspects) {
    // ✅ Pattern MM-1: Type assertion to resolve PlanetaryAspect[] import mismatch
    const aspectAffinity = _calculateAspectMethodAffinity(
      astroState.aspects,
      method,
    );
    score += aspectAffinity * 0.3;
  }

  return Math.min(1, score);
}

export function getMethodElementalProfile(
  method: CookingMethodData,
): ElementalProperties {
  const { elementalEffect, elementalProperties: elementalState } = method;
  if (isElementalProperties(elementalEffect)) return elementalEffect;
  if (isElementalProperties(elementalState)) return elementalState;
  return createElementalProperties({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  });
}

/**
 * Create elemental profile from astrological state
 */
export function createElementalProfileFromAstroState(
  astroState: AstrologicalState,
): ElementalProperties | null {
  if (!astroState.dominantElement) return null;

  // Create elemental profile based on dominant element
  const profile = createElementalProperties({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  });

  // Enhance the dominant element
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  for (const element of elements) {
    if (element === astroState.dominantElement) {
      profile[element] = 0.4;
    } else {
      profile[element] = 0.2;
    }
  }

  return profile;
}

/**
 * Calculate compatibility between two elemental properties
 */
export function calculateElementalCompatibility(
  elementalA: ElementalProperties,
  elementalB: ElementalProperties,
): number {
  let totalCompatibility = 0;
  let elementCount = 0;
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  for (const element of elements) {
    const valueA = elementalA[element];
    const valueB = elementalB[element];

    // Higher compatibility for similar values (following elemental principles)
    const compatibility = 1 - Math.abs(valueA - valueB);
    totalCompatibility += compatibility;
    elementCount++;
  }

  return elementCount > 0
    ? totalCompatibility / elementCount
    : 0.5;
}

/**
 * Get cooking method recommendations based on astrological state
 */
export function getCookingMethodRecommendations(
  astroState: AstrologicalState,
  options: MethodRecommendationOptions = {},
): MethodRecommendation[] {
  const methods = Object.values(allCookingMethodsCombined);
  const scoredMethods = methods.filter((m): m is CookingMethodData => m !== undefined).map((method) => {
    const score = calculateMethodScore(
      method,
      astroState,
    );

    const methodId = String(method.id ?? method.name ?? "unknown");
    const methodName = String(method.name ?? "Unknown Method");
    const description = String(
      method.description ?? "Recommended cooking method",
    );

    return {
      method: {
        id: methodId,
        name: methodName,
        category: method.category ?? "General",
        element: isElement(method.element) ? method.element : "Fire",
        intensity: typeof method.intensity === "number" ? method.intensity : 0.5,
        description,
      },
      compatibility: score,
      score,
      reasoning: [description],
      elementalAlignment: [],
      estimatedTime: {
        prepTime: 0,
        cookTime: method.duration?.max ?? 30,
        restTime: 0,
        totalTime: method.duration?.max ?? 30,
      },
      requiredSkills: [],
    };
  });

  const limit =
    (options as { limit?: number }).limit ?? options.maxRecommendations ?? 5;
  return scoredMethods
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, limit);
}

export function getElementForSign(sign: string): Element {
  const fireSigns = ["aries", "leo", "sagittarius"];
  const earthSigns = ["taurus", "virgo", "capricorn"];
  const airSigns = ["gemini", "libra", "aquarius"]; // Fixed casing
  const waterSigns = ["cancer", "scorpio", "pisces"];

  const signLower = sign.toLowerCase();
  if (fireSigns.includes(signLower)) return "Fire";
  if (earthSigns.includes(signLower)) return "Earth";
  if (airSigns.includes(signLower)) return "Air";
  if (waterSigns.includes(signLower)) return "Water";

  return "Fire"; // Default
}

// ===== EXPORTS =====

export type { CookingMethodData, CookingMethodDictionary };
// Export the cooking method data
export { allCookingMethodsCombined as getAllCookingMethods };


// Add the missing functions needed by testRecommendations.ts

/**
 * Get holistic cooking recommendations based on ingredient properties
 * This function combines various factors for a more comprehensive recommendation
 */
export function getHolisticCookingRecommendations(
  ingredient: Ingredient | UnifiedIngredient,
  _astroState?: Record<string, unknown>,
  season?: string,
  includeReasons = false,
  availableMethods: string[] = [],
  limit = 5,
): Array<{ method: string; compatibility: number; reason?: string }> {
  try {
    // Default to empty elementalProperties if not provided
    const elementalProperties = (ingredient.transformedElementalProperties ?? {
      Fire: (ingredient.Fire as number) || 0.25,
      Water: (ingredient.Water as number) || 0.25,
      Earth: (ingredient.Earth as number) || 0.25,
      Air: (ingredient.Air as number) || 0.25,
    }) as ElementalProperties;

    // Get recommended methods
    const recommendations = getRecommendedCookingMethods(
      elementalProperties,
      undefined, // zodiac sign
      undefined, // planets
      (season as Season | undefined) ?? getCurrentSeason(),
    );


    // Filter by available methods if provided
    const filteredRecs =
      availableMethods.length > 0
        ? recommendations.filter((rec) =>
            availableMethods.some((method) =>
              areSimilarMethods(rec.name, method),
            ),
          )
        : recommendations;

    // Format the results with safe property access
    return filteredRecs.slice(0, limit || 5).map((rec) => ({
      method: rec.name,
      compatibility: (Number(rec.score) || 0) * 100,
      reason: includeReasons
        ? String(rec.reasons[0]) || `Good match for ${ingredient.name}`
        : undefined,
    }));
  } catch (error) {
    _logger.error("Error in getHolisticCookingRecommendations: ", error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get recommended cooking methods specifically for an ingredient
 * This function focuses on elemental compatibility
 */
export function getRecommendedCookingMethodsForIngredient(
  ingredient: Ingredient | UnifiedIngredient,
  cookingMethods: Ingredient | UnifiedIngredient[],
  limit = 5,
): Array<{ method: string; compatibility: number }> {
  try {
    const realProps = isElementalProperties(ingredient.elementalProperties)
      ? ingredient.elementalProperties
      : undefined;
    const elementalProps: {
      Fire: number;
      Water: number;
      Earth: number;
      Air: number;
    } = {
      Fire: realProps ? realProps.Fire : ((ingredient.Fire as number | undefined) ?? 0.25),
      Water: realProps ? realProps.Water : ((ingredient.Water as number | undefined) ?? 0.25),
      Earth: realProps ? realProps.Earth : ((ingredient.Earth as number | undefined) ?? 0.25),
      Air: realProps ? realProps.Air : ((ingredient.Air as number | undefined) ?? 0.25),
    };

    const ingredientElement = resolveIngredientElement(
      ingredient,
      "getRecommendedCookingMethodsForIngredient",
    );

    // Calculate compatibility for each method
    const scoredMethods = (cookingMethods as unknown[]).map((method) => {
      const methodData = method as Record<string, unknown>;

      const resolvedMethodElement = isElement(methodData.element)
        ? methodData.element
        : dominantElementOf(methodData.elementalEffect);

      // Simple compatibility based on elemental harmony
      let compatibility = 0.5; // Base score

      // Boost score for matching element
      if (ingredientElement && resolvedMethodElement === ingredientElement) {
        compatibility += 0.3;
      }

      if (resolvedMethodElement === "Fire")
        compatibility += elementalProps.Fire * 0.2;
      if (resolvedMethodElement === "Water")
        compatibility += elementalProps.Water * 0.2;
      if (resolvedMethodElement === "Earth")
        compatibility += elementalProps.Earth * 0.2;
      if (resolvedMethodElement === "Air")
        compatibility += elementalProps.Air * 0.2;

      return {
        method: String(methodData.name ?? "Unknown Method"),
        compatibility: Math.min(compatibility * 100, 100), // Cap at 100%
      };
    });

    // Sort by compatibility and limit results
    return scoredMethods
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, limit);
  } catch (error) {
    _logger.error(
      "Error in getRecommendedCookingMethodsForIngredient: ",
      error,
    );
    // Return empty array as fallback
    return [];
  }
}
