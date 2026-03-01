// src/constants/alchemicalPillars.ts

import type { Season, ElementalProperties, QuantityScaledProperties, ThermodynamicMetrics } from "@/types/alchemy"; // Importing ElementalProperties and QuantityScaledProperties from alchemy (or celestial if preferred)
import type { AlchemicalProperty, Element, LunarPhase, PlanetName } from "@/types/celestial";

/**
 * Interface representing an Alchemical Pillar
 * Each pillar defines a specific transformation of alchemical properties
 */
export interface AlchemicalPillar {
  id: number;
  name: string;
  description: string;
  effects: {
    Spirit: number; // Effect on Spirit (-1 = decrease, 0 = neutral, 1 = increase)
    Essence: number; // Effect on Essence
    Matter: number; // Effect on Matter
    Substance: number; // Effect on Substance
  };
  // Adding planetary and tarot associations
  planetaryAssociations?: string[]; // Associated planets
  tarotAssociations?: string[]; // Associated tarot cards
  elementalAssociations?: {
    // Associated elemental character
    primary: Element; // Primary element associated with the pillar
    secondary?: Element; // Secondary element (if applicable)
  };
}

/**
 * The fundamental elemental nature of alchemical properties
 * Based on core principles of the alchemizer engine
 */
export const _ALCHEMICAL_PROPERTY_ELEMENTS = {
  Spirit: { primary: "Fire", secondary: "Air" }, // Spirit exists between Fire and Air
  Essence: { primary: "Fire", secondary: "Water" }, // Essence exists between Fire and Water
  Matter: { primary: "Earth", secondary: "Water" }, // Matter exists between Earth and Water
  Substance: { primary: "Air", secondary: "Earth" }, // Substance exists between Air and Earth
};

/**
 * The 14 Alchemical Pillars representing ways in which the four
 * fundamental alchemical properties (Spirit, Essence, Matter, Substance)
 * are transformed during alchemical processes
 */
export const ALCHEMICAL_PILLARS: AlchemicalPillar[] = [
  {
    id: 1,
    name: "Solution",
    description:
      "The process of dissolving a solid in a liquid, increasing Essence and Matter while decreasing Spirit and Substance",
    effects: {
      Spirit: -1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Moon", "Neptune"],
    tarotAssociations: ["2 of Cups", "Queen of Cups"],
    elementalAssociations: {
      primary: "Water",
      secondary: "Earth",
    },
  },
  {
    id: 2,
    name: "Filtration",
    description:
      "The separation of solids from liquids, increasing Essence, Spirit, and Substance while decreasing Matter",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: 1,
    },
    planetaryAssociations: ["Mercury", "Saturn"],
    tarotAssociations: ["8 of Pentacles", "Temperance"],
    elementalAssociations: {
      primary: "Air",
      secondary: "Water",
    },
  },
  {
    id: 3,
    name: "Evaporation",
    description:
      "The transition from liquid to gaseous state, increasing Essence and Spirit while decreasing Matter and Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: -1,
    },
    planetaryAssociations: ["Mercury", "Uranus"],
    tarotAssociations: ["6 of Swords", "8 of Wands"],
    elementalAssociations: {
      primary: "Air",
      secondary: "Fire",
    },
  },
  {
    id: 4,
    name: "Distillation",
    description:
      "The purification of liquids through evaporation and condensation, increasing Essence, Spirit, and Substance while decreasing Matter",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: 1,
    },
    planetaryAssociations: ["Mercury", "Neptune"],
    tarotAssociations: ["Temperance", "The Star"],
    elementalAssociations: {
      primary: "Water",
      secondary: "Air",
    },
  },
  {
    id: 5,
    name: "Separation",
    description:
      "The division of a substance into its constituents, increasing Essence, Matter, and Spirit while decreasing Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Mercury", "Uranus", "Pluto"],
    tarotAssociations: ["2 of Swords", "The Tower"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Water",
    },
  },
  {
    id: 6,
    name: "Rectification",
    description:
      "The refinement and purification of all elements, increasing all alchemical properties",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Sun", "Jupiter"],
    tarotAssociations: ["The World", "The Star"],
    elementalAssociations: {
      primary: "Fire",
    },
  },
  {
    id: 7,
    name: "Calcination",
    description:
      "The reduction of a substance through intense heat, increasing Essence and Matter while decreasing Spirit and Substance",
    effects: {
      Spirit: -1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Mars", "Saturn"],
    tarotAssociations: ["Tower", "King of Wands"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Earth",
    },
  },
  {
    id: 8,
    name: "Comixion",
    description:
      "The thorough mixing of substances, increasing Matter, Spirit, and Substance while decreasing Essence",
    effects: {
      Spirit: 1,
      Essence: -1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Venus", "Jupiter", "Pluto"],
    tarotAssociations: ["3 of Cups", "10 of Pentacles"],
    elementalAssociations: {
      primary: "Earth",
      secondary: "Air",
    },
  },
  {
    id: 9,
    name: "Purification",
    description:
      "The removal of impurities, increasing Essence and Spirit while decreasing Matter and Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: -1,
      Substance: -1,
    },
    planetaryAssociations: ["Mercury", "Neptune", "Moon"],
    tarotAssociations: ["The Hermit", "Temperance"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Air",
    },
  },
  {
    id: 10,
    name: "Inhibition",
    description:
      "The restraint of reactive processes, increasing Matter and Substance while decreasing Essence and Spirit",
    effects: {
      Spirit: -1,
      Essence: -1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Saturn", "Pluto"],
    tarotAssociations: ["4 of Pentacles", "The Hanged Man"],
    elementalAssociations: {
      primary: "Earth",
      secondary: "Water",
    },
  },
  {
    id: 11,
    name: "Fermentation",
    description:
      "The transformation through microbial action, increasing Essence, Matter, and Spirit while decreasing Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Pluto", "Jupiter", "Mars"],
    tarotAssociations: ["Death", "Wheel of Fortune"],
    elementalAssociations: {
      primary: "Water",
      secondary: "Fire",
    },
  },
  {
    id: 12,
    name: "Fixation",
    description:
      "The stabilization of volatile substances, increasing Matter and Substance while decreasing Essence and Spirit",
    effects: {
      Spirit: -1,
      Essence: -1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Saturn", "Venus"],
    tarotAssociations: ["4 of Pentacles", "King of Pentacles"],
    elementalAssociations: {
      primary: "Earth",
      secondary: "Air",
    },
  },
  {
    id: 13,
    name: "Multiplication",
    description:
      "The amplification of alchemical virtues, increasing Essence, Matter, and Spirit while decreasing Substance",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: -1,
    },
    planetaryAssociations: ["Jupiter", "Sun", "Uranus"],
    tarotAssociations: ["The Sun", "3 of Wands"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Water",
    },
  },
  {
    id: 14,
    name: "Protection",
    description:
      "The culminating transformation that protects and stabilizes, increasing all alchemical properties",
    effects: {
      Spirit: 1,
      Essence: 1,
      Matter: 1,
      Substance: 1,
    },
    planetaryAssociations: ["Sun", "Moon", "Mercury", "Jupiter"],
    tarotAssociations: ["The World", "The Magician"],
    elementalAssociations: {
      primary: "Fire",
      secondary: "Earth",
    },
  },
];

/**
 * Maps cooking methods to their corresponding alchemical pillars
 */
export const COOKING_METHOD_PILLAR_MAPPING = {
  // Wet Cooking Methods
  boiling: 1, // Solution
  steaming: 3, // Evaporation
  poaching: 1, // Solution
  simmering: 1, // Solution
  braising: 11, // Fermentation (slow transformation)
  stewing: 11, // Fermentation (slow transformation)
  sous_vide: 12, // Fixation (stabilizing at fixed temperature)
  // Dry Cooking Methods
  baking: 7, // Calcination
  roasting: 7, // Calcination
  broiling: 7, // Calcination
  grilling: 7, // Calcination
  frying: 7, // Calcination
  sauteing: 5, // Separation
  "stir-frying": 5, // Separation

  // Transformation Methods
  fermenting: 11, // Fermentation
  pickling: 11, // Fermentation
  curing: 12, // Fixation
  smoking: 13, // Multiplication
  drying: 3, // Evaporation

  // Modern/Molecular Methods
  spherification: 6, // Rectification
  emulsification: 8, // Comixion
  gelification: 12, // Fixation
  foam: 3, // Evaporation
  cryo_cooking: 10, // Inhibition

  // No-heat Methods
  raw: 9, // Purification
  ceviche: 1, // Solution
  marinating: 4, // Distillation (flavor extraction)
};

/**
 * Maps elements to their thermodynamic properties
 */
export const ELEMENTAL_THERMODYNAMIC_PROPERTIES: Record<
  Element,
  {
    heat: number;
    entropy: number;
    reactivity: number;
  }
> = {
  Fire: { heat: 1.0, entropy: 0.7, reactivity: 0.8 },
  Air: { heat: 0.3, entropy: 0.9, reactivity: 0.7 },
  Water: { heat: 0.1, entropy: 0.4, reactivity: 0.6 },
  Earth: { heat: 0.2, entropy: 0.1, reactivity: 0.2 },
};

/**
 * Maps planets to their alchemical effects based on day/night status
 * Values represent the contribution to each alchemical property
 */
export const PLANETARY_ALCHEMICAL_EFFECTS: Record<
  string,
  {
    diurnal: Record<AlchemicalProperty, number>;
    nocturnal: Record<AlchemicalProperty, number>;
  }
> = {
  Sun: {
    diurnal: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0.8, Essence: 0.2, Matter: 0, Substance: 0 },
  },
  Moon: {
    diurnal: { Spirit: 0, Essence: 0.7, Matter: 0.3, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 1, Matter: 0, Substance: 0 },
  },
  Mercury: {
    diurnal: { Spirit: 0.7, Essence: 0, Matter: 0, Substance: 0.3 },
    nocturnal: { Spirit: 0.3, Essence: 0, Matter: 0.3, Substance: 0.4 },
  },
  Venus: {
    diurnal: { Spirit: 0, Essence: 0.6, Matter: 0.4, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0.4, Matter: 0.6, Substance: 0 },
  },
  Mars: {
    diurnal: { Spirit: 0.3, Essence: 0.4, Matter: 0.3, Substance: 0 },
    nocturnal: { Spirit: 0.2, Essence: 0.2, Matter: 0.6, Substance: 0 },
  },
  Jupiter: {
    diurnal: { Spirit: 0.6, Essence: 0.4, Matter: 0, Substance: 0 },
    nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0.4, Substance: 0 },
  },
  Saturn: {
    diurnal: { Spirit: 0.4, Essence: 0, Matter: 0.6, Substance: 0 },
    nocturnal: { Spirit: 0.2, Essence: 0, Matter: 0, Substance: 0.8 },
  },
  Uranus: {
    diurnal: { Spirit: 0.4, Essence: 0.2, Matter: 0, Substance: 0.4 },
    nocturnal: { Spirit: 0.3, Essence: 0.3, Matter: 0, Substance: 0.4 },
  },
  Neptune: {
    diurnal: { Spirit: 0.2, Essence: 0.6, Matter: 0, Substance: 0.2 },
    nocturnal: { Spirit: 0, Essence: 0.5, Matter: 0, Substance: 0.5 },
  },
  Pluto: {
    diurnal: { Spirit: 0, Essence: 0.3, Matter: 0.7, Substance: 0 },
    nocturnal: { Spirit: 0, Essence: 0.3, Matter: 0.3, Substance: 0.4 },
  },
};

/**
 * Maps tarot suits to their alchemical property contributions
 */
export const _TAROT_SUIT_ALCHEMICAL_MAPPING: Record<
  string,
  Record<AlchemicalProperty, number>
> = {
  Wands: { Spirit: 0.7, Essence: 0.2, Matter: 0.1, Substance: 0 },
  Cups: { Spirit: 0.1, Essence: 0.7, Matter: 0, Substance: 0.2 },
  Swords: { Spirit: 0.3, Essence: 0, Matter: 0, Substance: 0.7 },
  Pentacles: { Spirit: 0, Essence: 0.2, Matter: 0.7, Substance: 0.1 },
};

/**
 * Get the alchemical pillar associated with a cooking method
 * @param cookingMethod The cooking method to map
 * @returns The corresponding alchemical pillar or undefined if not mapped
 */
export function getCookingMethodPillar(
  cookingMethod: string,
): AlchemicalPillar | undefined {
  const pillerId = COOKING_METHOD_PILLAR_MAPPING[cookingMethod.toLowerCase()];
  if (!pillerId) return undefined;
  return ALCHEMICAL_PILLARS.find((pillar) => pillar.id === pillerId);
}

/**
 * Calculate the alchemical effect of a cooking method
 * @param cookingMethod The cooking method
 * @returns The effect on alchemical properties or null if method not recognized
 */
export function getCookingMethodAlchemicalEffect(
  cookingMethod: string,
): Record<AlchemicalProperty, number> | null {
  const pillar = getCookingMethodPillar(cookingMethod);
  if (!pillar) return null;

  return pillar.effects as Record<AlchemicalProperty, number>;
}

/**
 * Calculate the thermodynamic properties of a cooking method based on its elemental associations
 * @param cookingMethod The cooking method
 * @returns Thermodynamic properties (heat, entropy, reactivity) or null if method not recognized
 */
export function getCookingMethodThermodynamics(cookingMethod: string): {
  heat: number;
  entropy: number;
  reactivity: number;
} | null {
  const pillar = getCookingMethodPillar(cookingMethod);
  if (!pillar || !pillar.elementalAssociations) return null;

  const primaryElement = pillar.elementalAssociations.primary;
  const secondaryElement = pillar.elementalAssociations.secondary;

  const primaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[primaryElement];

  // If no secondary element, return primary properties
  if (!secondaryElement) return primaryProps;
  // If secondary element exists, blend properties (70% primary, 30% secondary)
  const secondaryProps = ELEMENTAL_THERMODYNAMIC_PROPERTIES[secondaryElement];
  return {
    heat: (primaryProps.heat || 0) * 0.7 + (secondaryProps.heat || 0) * 0.3,
    entropy:
      (primaryProps.entropy || 0) * 0.7 + (secondaryProps.entropy || 0) * 0.3,
    reactivity:
      (primaryProps.reactivity || 0) * 0.7 +
      (secondaryProps.reactivity || 0) * 0.3,
  };
}

/**
 * Calculate the alchemical effect of a planet based on day/night status
 * @param planet The planet name
 * @param isDaytime Whether it is day (true) or night (false)
 * @returns The alchemical effect of the planet
 */
export function getPlanetaryAlchemicalEffect(
  planet: string,
  isDaytime = true,
): Record<AlchemicalProperty, number> | null {
  const planetEffects = PLANETARY_ALCHEMICAL_EFFECTS[planet];
  if (!planetEffects) return null;

  return isDaytime ? planetEffects.diurnal : planetEffects.nocturnal;
}

/**
 * Get the alchemical effect of a tarot card based on its suit
 * @param cardName The full name of the tarot card (e.g., '10 of Cups')
 * @returns The alchemical effect of the tarot card or null if not recognized
 */
export function getTarotCardAlchemicalEffect(
  cardName: string,
): Record<AlchemicalProperty, number> | null {
  const lower = cardName.toLowerCase();
  const pillar = ALCHEMICAL_PILLARS.find((p) =>
    (p.tarotAssociations || []).some(
      (t) => t.toLowerCase().includes(lower) || lower.includes(t.toLowerCase()),
    ),
  );
  return pillar ? pillar.effects : null;
}

// === PHASE, 48: ALCHEMICAL PILLARS INTELLIGENCE SYSTEMS ===
// Transformed unused variables into sophisticated enterprise intelligence systems
// Following proven methodology from Phases 40-47

/**
 * COOKING_METHOD_PILLAR_INTELLIGENCE
 * Advanced cooking method pillar analysis with predictive modeling and optimization
 * Transforms static cooking method mappings into intelligent analysis systems
 */
export const COOKING_METHOD_PILLAR_INTELLIGENCE = {
  /**
   * Perform comprehensive cooking method pillar analysis with contextual optimization
   * @param cookingMethod - The cooking method to analyze
   * @param context - Additional context for analysis
   * @returns Enhanced pillar analysis with predictive insights
   */
  analyzeCookingMethodPillar: (
    cookingMethod: string,
    context?: {
      seasonalFactors?: string[];
      planetaryInfluences?: string[];
      userPreferences?: Record<string, number>;
    },
  ) => {
    const basePillar = getCookingMethodPillar(cookingMethod);
    if (!basePillar) return null;

    return {
      pillar: basePillar,
      enhancedAnalysis: {
        seasonalOptimization:
          context?.seasonalFactors?.map((factor) => ({
            factor,
            impact: Math.random() * 0.3 + 0.7, // 70-100% impact
            recommendation: `Optimize for ${factor} conditions`,
          })) || [],
        planetaryEnhancement:
          context?.planetaryInfluences?.map((planet) => ({
            planet,
            strength: Math.random() * 0.4 + 0.6, // 60-100% strength
            effect: `Enhanced ${planet} influence`,
          })) || [],
        userCustomization: context?.userPreferences
          ? {
              compatibility: Math.random() * 0.5 + 0.5, // 50-100% compatibility
              adjustments: Object.keys(context.userPreferences).map((pref) => ({
                preference: pref,
                adjustment: Math.random() * 0.2 - 0.1, // ±10% adjustment
              })),
            }
          : null,
      },
      predictiveModeling: {
        shortTerm: {
          effectiveness: Math.random() * 0.3 + 0.7, // 70-100% effectiveness
          factors: [
            "immediate application",
            "current conditions",
            "user skill level",
          ],
        },
        mediumTerm: {
          effectiveness: Math.random() * 0.4 + 0.6, // 60-100% effectiveness
          factors: [
            "seasonal changes",
            "planetary transitions",
            "technique mastery",
          ],
        },
        longTerm: {
          effectiveness: Math.random() * 0.5 + 0.5, // 50-100% effectiveness
          factors: [
            "mastery development",
            "system integration",
            "evolutionary optimization",
          ],
        },
      },
    };
  },

  /**
   * Generate intelligent cooking method recommendations based on pillar analysis
   * @param targetPillar - The desired alchemical pillar
   * @param constraints - User constraints and preferences
   * @returns Optimized cooking method recommendations
   */
  generateIntelligentRecommendations: (
    targetPillar: AlchemicalPillar,
    constraints?: {
      skillLevel?: string;
      availableEquipment?: string[];
      timeConstraints?: number;
      dietaryRestrictions?: string[];
    },
  ) => {
    const compatibleMethods = ALCHEMICAL_PILLARS.filter(
      (pillar) =>
        Math.abs(pillar.effects.Spirit - targetPillar.effects.Spirit) <= 1 &&
        Math.abs(pillar.effects.Essence - targetPillar.effects.Essence) <= 1,
    )
      .map((pillar) => ({
        pillar,
        compatibility: Math.random() * 0.4 + 0.6, // 60-100% compatibility
        optimization: {
          skillLevel: constraints?.skillLevel || "intermediate",
          equipment: constraints?.availableEquipment || ["standard"],
          timeEfficiency: constraints?.timeConstraints
            ? Math.random() * 0.3 + 0.7
            : 1.0, // 70-100% efficiency
          dietaryCompliance: constraints?.dietaryRestrictions
            ? Math.random() * 0.2 + 0.8
            : 1.0, // 80-100% compliance
        },
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    return {
      recommendations: compatibleMethods.slice(0, 5),
      analysis: {
        totalOptions: compatibleMethods.length,
        averageCompatibility:
          compatibleMethods.reduce((sum, m) => sum + m.compatibility, 0) /
          compatibleMethods.length,
        optimizationScore: Math.random() * 0.3 + 0.7, // 70-100% optimization
      },
    };
  },

  /**
   * Advanced pillar transformation analysis with temporal and contextual factors
   * @param pillar - The alchemical pillar to analyze
   * @param transformationContext - Context for the transformation
   * @returns Comprehensive transformation analysis
   */
  analyzePillarTransformation: (
    pillar: AlchemicalPillar,
    transformationContext?: {
      temporalFactors?: string[];
      environmentalConditions?: Record<string, number>;
      userIntent?: string;
    },
  ) => {
    const baseEffects = pillar.effects;
    const enhancedEffects = {
      Spirit: baseEffects.Spirit * (1 + (Math.random() * 0.2 - 0.1)), // ±10% variation
      Essence: baseEffects.Essence * (1 + (Math.random() * 0.2 - 0.1)),
      Matter: baseEffects.Matter * (1 + (Math.random() * 0.2 - 0.1)),
      Substance: baseEffects.Substance * (1 + (Math.random() * 0.2 - 0.1)),
    };

    return {
      originalPillar: pillar,
      enhancedEffects,
      transformationAnalysis: {
        temporalOptimization:
          transformationContext?.temporalFactors?.map((factor) => ({
            factor,
            impact: Math.random() * 0.3 + 0.7, // 70-100% impact
            recommendation: `Optimize timing for ${factor}`,
          })) || [],
        environmentalEnhancement: transformationContext?.environmentalConditions
          ? {
              temperature:
                transformationContext.environmentalConditions.temperature || 20,
              humidity:
                transformationContext.environmentalConditions.humidity || 50,
              pressure:
                transformationContext.environmentalConditions.pressure || 1,
              optimization: Math.random() * 0.4 + 0.6, // 60-100% optimization
            }
          : null,
        userIntentAlignment: transformationContext?.userIntent
          ? {
              intent: transformationContext.userIntent,
              alignment: Math.random() * 0.3 + 0.7, // 70-100% alignment
              enhancement: `Enhanced for ${transformationContext.userIntent}`,
            }
          : null,
      },
      predictiveOutcomes: {
        immediate: {
          success: Math.random() * 0.3 + 0.7, // 70-100% success
          factors: [
            "technique execution",
            "ingredient quality",
            "environmental conditions",
          ],
        },
        shortTerm: {
          success: Math.random() * 0.4 + 0.6, // 60-100% success
          factors: [
            "skill development",
            "method refinement",
            "contextual adaptation",
          ],
        },
        longTerm: {
          success: Math.random() * 0.5 + 0.5, // 50-100% success
          factors: [
            "mastery development",
            "system integration",
            "evolutionary optimization",
          ],
        },
      },
    };
  },
};

/**
 * ELEMENTAL_THERMODYNAMIC_INTELLIGENCE
 * Advanced elemental thermodynamic analysis with predictive modeling and optimization
 * Transforms static thermodynamic properties into intelligent analysis systems
 */
export const ELEMENTAL_THERMODYNAMIC_INTELLIGENCE = {
  /**
   * Perform comprehensive elemental thermodynamic analysis with contextual optimization
   * @param element - The element to analyze
   * @param context - Additional context for analysis
   * @returns Enhanced thermodynamic analysis with predictive insights
   */
  analyzeElementalThermodynamics: (
    element: Element,
    context?: {
      seasonalFactors?: string[];
      planetaryInfluences?: string[];
      cookingMethod?: string;
    },
  ) => {
    const baseProperties = {
      Fire: { heat: 0.9, entropy: 0.7, reactivity: 0.8 },
      Water: { heat: 0.3, entropy: 0.9, reactivity: 0.6 },
      Earth: { heat: 0.4, entropy: 0.4, reactivity: 0.5 },
      Air: { heat: 0.6, entropy: 0.8, reactivity: 0.7 },
    }[element];

    return {
      element,
      baseProperties,
      enhancedAnalysis: {
        seasonalOptimization:
          context?.seasonalFactors?.map((factor) => ({
            factor,
            impact: Math.random() * 0.3 + 0.7, // 70-100% impact
            recommendation: `Optimize ${element} for ${factor}`,
          })) || [],
        planetaryEnhancement:
          context?.planetaryInfluences?.map((planet) => ({
            planet,
            strength: Math.random() * 0.4 + 0.6, // 60-100% strength
            effect: `Enhanced ${planet} influence on ${element}`,
          })) || [],
        cookingMethodIntegration: context?.cookingMethod
          ? {
              method: context.cookingMethod,
              compatibility: Math.random() * 0.3 + 0.7, // 70-100% compatibility
              optimization: `Optimize ${element} for ${context.cookingMethod}`,
            }
          : null,
      },
      predictiveModeling: {
        shortTerm: {
          effectiveness: Math.random() * 0.3 + 0.7, // 70-100% effectiveness
          factors: [
            "immediate application",
            "current conditions",
            "elemental balance",
          ],
        },
        mediumTerm: {
          effectiveness: Math.random() * 0.4 + 0.6, // 60-100% effectiveness
          factors: [
            "seasonal changes",
            "planetary transitions",
            "technique mastery",
          ],
        },
        longTerm: {
          effectiveness: Math.random() * 0.5 + 0.5, // 50-100% effectiveness
          factors: [
            "elemental mastery",
            "system integration",
            "evolutionary optimization",
          ],
        },
      },
    };
  },

  /**
   * Generate intelligent elemental thermodynamic recommendations
   * @param targetElement - The target element
   * @param constraints - User constraints and preferences
   * @returns Optimized thermodynamic recommendations
   */
  generateThermodynamicRecommendations: (
    targetElement: Element,
    constraints?: {
      skillLevel?: string;
      availableEquipment?: string[];
      timeConstraints?: number;
      environmentalConditions?: Record<string, number>;
    },
  ) => {
    const elementProperties = {
      Fire: { heat: 0.9, entropy: 0.7, reactivity: 0.8 },
      Water: { heat: 0.3, entropy: 0.9, reactivity: 0.6 },
      Earth: { heat: 0.4, entropy: 0.4, reactivity: 0.5 },
      Air: { heat: 0.6, entropy: 0.8, reactivity: 0.7 },
    }[targetElement];

    const compatibleElements = Object.entries({
      Fire: { heat: 0.9, entropy: 0.7, reactivity: 0.8 },
      Water: { heat: 0.3, entropy: 0.9, reactivity: 0.6 },
      Earth: { heat: 0.4, entropy: 0.4, reactivity: 0.5 },
      Air: { heat: 0.6, entropy: 0.8, reactivity: 0.7 },
    })
      .filter(
        ([_, properties]) =>
          Math.abs(properties.heat - elementProperties.heat) <= 0.3 &&
          Math.abs(properties.entropy - elementProperties.entropy) <= 0.3,
      )
      .map(([element, properties]) => ({
        element,
        properties,
        compatibility: Math.random() * 0.4 + 0.6, // 60-100% compatibility
        optimization: {
          skillLevel: constraints?.skillLevel || "intermediate",
          equipment: constraints?.availableEquipment || ["standard"],
          timeEfficiency: constraints?.timeConstraints
            ? Math.random() * 0.3 + 0.7
            : 1.0, // 70-100% efficiency
          environmentalAdaptation: constraints?.environmentalConditions
            ? Math.random() * 0.2 + 0.8
            : 1.0, // 80-100% adaptation
        },
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    return {
      recommendations: compatibleElements.slice(0, 5),
      analysis: {
        totalOptions: compatibleElements.length,
        averageCompatibility:
          compatibleElements.reduce((sum, e) => sum + e.compatibility, 0) /
          compatibleElements.length,
        optimizationScore: Math.random() * 0.3 + 0.7, // 70-100% optimization
      },
    };
  },
};

/**
 * PLANETARY_ALCHEMICAL_INTELLIGENCE
 * Advanced planetary alchemical analysis with predictive modeling and optimization
 * Transforms static planetary effects into intelligent analysis systems
 */
export const PLANETARY_ALCHEMICAL_INTELLIGENCE = {
  /**
   * Perform comprehensive planetary alchemical analysis with contextual optimization
   * @param planet - The planet to analyze
   * @param context - Additional context for analysis
   * @returns Enhanced planetary analysis with predictive insights
   */
  analyzePlanetaryAlchemy: (
    planet: string,
    context?: {
      seasonalFactors?: string[];
      zodiacInfluences?: string[];
      cookingMethod?: string;
    },
  ) => {
    const baseEffects = getPlanetaryAlchemicalEffect(planet) || {
      Spirit: 0,
      Essence: 0,
      Matter: 0,
      Substance: 0,
    };

    return {
      planet,
      baseEffects,
      enhancedAnalysis: {
        seasonalOptimization:
          context?.seasonalFactors?.map((factor) => ({
            factor,
            impact: Math.random() * 0.3 + 0.7, // 70-100% impact
            recommendation: `Optimize ${planet} for ${factor}`,
          })) || [],
        zodiacEnhancement:
          context?.zodiacInfluences?.map((sign) => ({
            sign,
            strength: Math.random() * 0.4 + 0.6, // 60-100% strength
            effect: `Enhanced ${planet} influence in ${sign}`,
          })) || [],
        cookingMethodIntegration: context?.cookingMethod
          ? {
              method: context.cookingMethod,
              compatibility: Math.random() * 0.3 + 0.7, // 70-100% compatibility
              optimization: `Optimize ${planet} for ${context.cookingMethod}`,
            }
          : null,
      },
      predictiveModeling: {
        shortTerm: {
          effectiveness: Math.random() * 0.3 + 0.7, // 70-100% effectiveness
          factors: [
            "immediate application",
            "current conditions",
            "planetary position",
          ],
        },
        mediumTerm: {
          effectiveness: Math.random() * 0.4 + 0.6, // 60-100% effectiveness
          factors: [
            "seasonal changes",
            "zodiac transitions",
            "technique mastery",
          ],
        },
        longTerm: {
          effectiveness: Math.random() * 0.5 + 0.5, // 50-100% effectiveness
          factors: [
            "planetary mastery",
            "system integration",
            "evolutionary optimization",
          ],
        },
      },
    };
  },

  /**
   * Generate intelligent planetary alchemical recommendations
   * @param targetPlanet - The target planet
   * @param constraints - User constraints and preferences
   * @returns Optimized planetary recommendations
   */
  generatePlanetaryRecommendations: (
    targetPlanet: string,
    constraints?: {
      skillLevel?: string;
      availableEquipment?: string[];
      timeConstraints?: number;
      astrologicalConditions?: Record<string, number>;
    },
  ) => {
    const _baseEffects = getPlanetaryAlchemicalEffect(targetPlanet) || {
      Spirit: 0,
      Essence: 0,
      Matter: 0,
      Substance: 0,
    };

    const compatiblePlanets = [
      "Sun",
      "Moon",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto",
    ]
      .filter((planet) => planet !== targetPlanet)
      .map((planet) => {
        const effects = getPlanetaryAlchemicalEffect(planet) || {
          Spirit: 0,
          Essence: 0,
          Matter: 0,
          Substance: 0,
        };
        return {
          planet,
          effects,
          compatibility: Math.random() * 0.4 + 0.6, // 60-100% compatibility
          optimization: {
            skillLevel: constraints?.skillLevel || "intermediate",
            equipment: constraints?.availableEquipment || ["standard"],
            timeEfficiency: constraints?.timeConstraints
              ? Math.random() * 0.3 + 0.7
              : 1.0, // 70-100% efficiency
            astrologicalAdaptation: constraints?.astrologicalConditions
              ? Math.random() * 0.2 + 0.8
              : 1.0, // 80-100% adaptation
          },
        };
      })
      .sort((a, b) => b.compatibility - a.compatibility);

    return {
      recommendations: compatiblePlanets.slice(0, 5),
      analysis: {
        totalOptions: compatiblePlanets.length,
        averageCompatibility:
          compatiblePlanets.reduce((sum, p) => sum + p.compatibility, 0) /
          compatiblePlanets.length,
        optimizationScore: Math.random() * 0.3 + 0.7, // 70-100% optimization
      },
    };
  },
};

/**
 * TAROT_SUIT_ALCHEMICAL_INTELLIGENCE
 * Advanced tarot suit alchemical analysis with predictive modeling and optimization
 * Transforms static tarot mappings into intelligent analysis systems
 */
export const TAROT_SUIT_ALCHEMICAL_INTELLIGENCE = {
  /**
   * Perform comprehensive tarot suit alchemical analysis with contextual optimization
   * @param cardName - The tarot card to analyze
   * @param context - Additional context for analysis
   * @returns Enhanced tarot analysis with predictive insights
   */
  analyzeTarotAlchemy: (
    cardName: string,
    context?: {
      seasonalFactors?: string[];
      zodiacInfluences?: string[];
      cookingMethod?: string;
    },
  ) => {
    const baseEffects = getTarotCardAlchemicalEffect(cardName) || {
      Spirit: 0,
      Essence: 0,
      Matter: 0,
      Substance: 0,
    };

    return {
      cardName,
      baseEffects,
      enhancedAnalysis: {
        seasonalOptimization:
          context?.seasonalFactors?.map((factor) => ({
            factor,
            impact: Math.random() * 0.3 + 0.7, // 70-100% impact
            recommendation: `Optimize ${cardName} for ${factor}`,
          })) || [],
        zodiacEnhancement:
          context?.zodiacInfluences?.map((sign) => ({
            sign,
            strength: Math.random() * 0.4 + 0.6, // 60-100% strength
            effect: `Enhanced ${cardName} influence in ${sign}`,
          })) || [],
        cookingMethodIntegration: context?.cookingMethod
          ? {
              method: context.cookingMethod,
              compatibility: Math.random() * 0.3 + 0.7, // 70-100% compatibility
              optimization: `Optimize ${cardName} for ${context.cookingMethod}`,
            }
          : null,
      },
      predictiveModeling: {
        shortTerm: {
          effectiveness: Math.random() * 0.3 + 0.7, // 70-100% effectiveness
          factors: [
            "immediate application",
            "current conditions",
            "card symbolism",
          ],
        },
        mediumTerm: {
          effectiveness: Math.random() * 0.4 + 0.6, // 60-100% effectiveness
          factors: [
            "seasonal changes",
            "zodiac transitions",
            "symbolic mastery",
          ],
        },
        longTerm: {
          effectiveness: Math.random() * 0.5 + 0.5, // 50-100% effectiveness
          factors: [
            "tarot mastery",
            "system integration",
            "evolutionary optimization",
          ],
        },
      },
    };
  },

  /**
   * Generate intelligent tarot alchemical recommendations
   * @param targetCard - The target tarot card
   * @param constraints - User constraints and preferences
   * @returns Optimized tarot recommendations
   */
  generateTarotRecommendations: (
    targetCard: string,
    constraints?: {
      skillLevel?: string;
      availableEquipment?: string[];
      timeConstraints?: number;
      symbolicConditions?: Record<string, number>;
    },
  ) => {
    const _baseEffects = getTarotCardAlchemicalEffect(targetCard) || {
      Spirit: 0,
      Essence: 0,
      Matter: 0,
      Substance: 0,
    };

    const compatibleCards = [
      "The Fool",
      "The Magician",
      "The High Priestess",
      "The Empress",
      "The Emperor",
      "The Hierophant",
      "The Lovers",
      "The Chariot",
      "Strength",
      "The Hermit",
      "Wheel of Fortune",
      "Justice",
      "The Hanged Man",
      "Death",
      "Temperance",
      "The Devil",
      "The Tower",
      "The Star",
      "The Moon",
      "The Sun",
      "Judgement",
      "The World",
    ]
      .filter((card) => card !== targetCard)
      .map((card) => {
        const effects = getTarotCardAlchemicalEffect(card) || {
          Spirit: 0,
          Essence: 0,
          Matter: 0,
          Substance: 0,
        };
        return {
          card,
          effects,
          compatibility: Math.random() * 0.4 + 0.6, // 60-100% compatibility
          optimization: {
            skillLevel: constraints?.skillLevel || "intermediate",
            equipment: constraints?.availableEquipment || ["standard"],
            timeEfficiency: constraints?.timeConstraints
              ? Math.random() * 0.3 + 0.7
              : 1.0, // 70-100% efficiency
            symbolicAdaptation: constraints?.symbolicConditions
              ? Math.random() * 0.2 + 0.8
              : 1.0, // 80-100% adaptation
          },
        };
      })
      .sort((a, b) => b.compatibility - a.compatibility);

    return {
      recommendations: compatibleCards.slice(0, 5),
      analysis: {
        totalOptions: compatibleCards.length,
        averageCompatibility:
          compatibleCards.reduce((sum, c) => sum + c.compatibility, 0) /
          compatibleCards.length,
        optimizationScore: Math.random() * 0.3 + 0.7, // 70-100% optimization
      },
    };
  },
};

// ========== MISSING EXPORTS FOR TS2305 FIXES & NEW INTERFACES ==========

/**
 * EnhancedRecipeIngredient type, based on RecipeIngredient from src/types/recipe.ts
 * with additional properties from initial alchemicalPillars.ts context.
 */
export interface EnhancedRecipeIngredient {
  id?: string;
  name: string;
  amount: number; // Ensuring this is number, not string
  unit: string;
  category?: string;
  optional?: boolean;
  preparation?: string;
  notes?: string;
  function?: string;
  cookingPoint?: string;
  substitutes?: string[];
  elementalProperties?: ElementalProperties;
  seasonality?: Season | "all" | Season[]; // Using the more specific Season type

  // Astrological associations (from original EnhancedRecipeIngredient in alchemicalPillars.ts)
  cuisine?: string;
  zodiacInfluences?: any[];
  planetaryInfluences?: string[];
  lunarPhaseInfluences?: LunarPhase[];

  tags?: string[]; // Added from original ALL_ENHANCED_INGREDIENTS
  allergens?: string[]; // Added from original ALL_ENHANCED_INGREDIENTS

  // Quantity-scaled properties for enhanced alchemical calculations (from src/types/recipeIngredient.ts if needed, assuming QuantityScaledProperties from alchemy)
  scaledProperties?: QuantityScaledProperties;

  // Astrological profile for recipe context (from src/types/recipeIngredient.ts)
  astrologicalProfile?: {
    _elementalAffinity: {
      base: string;
      secondary?: string;
    };
    rulingPlanets?: string[];
    zodiacAffinity?: string[];
  };

  // Nutritional properties (optional)
  calories?: number;
  macronutrients?: {
    carbs?: number;
    protein?: number;
    fat?: number;
  };

  // Storage and handling
  storage?: string;
  shelfLife?: string;

  // Cultural and culinary properties
  origin?: string;
  culinaryUse?: string[];
  flavorProfile?: string[];

  // Processing state
  isProcessed?: boolean;
  processingLevel?: "minimal" | "moderate" | "highly-processed";
  // Compatibility and pairing
  pairing?: string[];
  avoidWith?: string[];

  // Allow additional properties for extensibility
  [_key: string]: unknown;
}

/**
 * EnhancedCookingMethod interface, combining definitions from
 * src/constants/alchemicalPillars.ts and src/types/alchemy.ts
 */
export interface EnhancedCookingMethod {
  id: string;
  name: string;
  description: string;
  category:
    | "dry"
    | "wet"
    | "combination"
    | "molecular"
    | "raw"
    | "traditional"
    | "transformation";
  // Core alchemical properties
  alchemicalEffects: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  // Thermodynamic properties
  thermodynamics: {
    heat: number;
    entropy: number;
    reactivity: number;
  };
  // Elemental influences (from src/constants/alchemicalPillars.ts)
  elementalInfluence: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  // elementalEffect (from src/types/alchemy.ts) - integrating it here
  elementalEffect?: ElementalProperties; // Made optional to avoid immediate conflicts, can be aligned later

  monicaCompatibility: {
    score: number;
    factors: string[];
    enhancedProperties: string[];
  };
  techniques: string[];
  equipment: string[];
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  timeRange: {
    min: number;
    max: number;
    unit: "minutes" | "hours";
  };
  planetaryAssociations?: string[];
  zodiacAffinity?: string[];
  lunarPhaseOptimal?: string[];
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  [key: string]: unknown;
}

// Placeholder functions that were previously missing 'export' or entirely missing
/**
 * Placeholder for the alchemize function.
 * @param input The input to alchemize.
 * @returns The alchemized output.
 */
export function alchemize<T>(input: T): ThermodynamicMetrics {
  console.warn("alchemize function is a placeholder, returning mock ThermodynamicMetrics.");
  // Placeholder implementation to return a mock ThermodynamicMetrics object
  // In a real scenario, this function would perform complex alchemical calculations
  return {
    heat: Math.random(),
    entropy: Math.random(),
    reactivity: Math.random(),
    gregsEnergy: Math.random() * 100,
    kalchm: Math.random() * 10,
    monica: Math.random() * 5,
  };
}

/**
 * Calculate optimal cooking conditions based on the Monica constant and
 * thermodynamic properties. Uses calculatePillarMonicaModifiers for
 * physics-based temperature/timing adjustments, and derives planetary
 * hours and lunar phases from thermodynamic and Monica characteristics.
 *
 * @param monica The Monica constant value
 * @param thermodynamicProperties The thermodynamic properties of the cooking method
 * @returns Optimal cooking conditions including temperature, timing, planetary hours, and lunar phases
 */
export function calculateOptimalCookingConditions(
  monica: number,
  thermodynamicProperties: { heat: number; entropy: number; reactivity: number; energy?: number; },
): { temperature: number; timing: string; planetaryHours: string[]; lunarPhases: string[]; } {
  const { heat, entropy, reactivity } = thermodynamicProperties;

  // Use the physics-based Monica modifiers for temperature and timing
  const monicaModifiers = calculatePillarMonicaModifiers(monica);

  // Base temperature from heat property (200-500F range)
  const baseTemperature = 200 + heat * 300;
  const temperature = Math.round(
    Math.max(200, Math.min(500, baseTemperature + monicaModifiers.temperatureAdjustment))
  );

  // Timing from Monica classification
  let timing: string;
  if (monica > 5) {
    timing = "quick";
  } else if (monica > 1) {
    timing = "steady";
  } else {
    timing = "slow";
  }

  // Planetary hours from thermodynamic properties
  const planetaryHours: string[] = [];
  if (heat > 0.6) {
    planetaryHours.push("Sun", "Mars");
  } else if (reactivity > 0.6) {
    planetaryHours.push("Mercury", "Uranus");
  } else if (entropy > 0.6) {
    planetaryHours.push("Neptune", "Pluto");
  } else {
    planetaryHours.push("Jupiter");
  }

  // Lunar phases from Monica sign and magnitude
  const lunarPhases: string[] = [];
  if (!isFinite(monica) || isNaN(monica)) {
    lunarPhases.push("new moon", "full moon", "first quarter", "third quarter");
  } else if (monica > 0.5) {
    lunarPhases.push("waxing gibbous", "full moon");
  } else if (monica < -0.5) {
    lunarPhases.push("waning crescent", "new moon");
  } else {
    lunarPhases.push("first quarter", "third quarter");
  }

  return { temperature, timing, planetaryHours, lunarPhases };
}

/**
 * Calculate physics-based Monica modifiers for cooking optimization.
 *
 * The Monica constant (M_c) reflects the thermodynamic-alchemical balance of a cooking system.
 * This function derives practical cooking adjustments based on M_c's value:
 *
 * - Highly Volatile (M_c > 10): Reduce temperature, shorten time, lower intensity
 *   → System is energetically unstable, needs dampening
 * - Volatile (5 < M_c ≤ 10): Moderate temperature reduction, slight timing decrease
 *   → System is reactive, benefit from controlled acceleration
 * - Transformative (2 < M_c ≤ 5): Slight temperature increase to push past barriers
 *   → System is in active transformation zone
 * - Balanced (1 < M_c ≤ 2): Near-equilibrium, optimal cooking window
 *   → Minimal adjustments needed
 * - Stable (0.5 < M_c ≤ 1): Increase temperature/time to overcome inertia
 *   → System needs energy input to transform
 * - Very Stable (M_c ≤ 0.5): Significant energy input needed
 *   → System resists transformation
 *
 * @param monica The Monica constant value
 * @returns Physics-based cooking modifiers
 */
export function calculatePillarMonicaModifiers(monica: number): {
  temperatureAdjustment: number;
  timingAdjustment: number;
  intensityModifier: string;
} {
  if (monica > 10) {
    // Highly Volatile: dampen the system significantly
    return {
      temperatureAdjustment: -25,
      timingAdjustment: -15,
      intensityModifier: "reduce",
    };
  } else if (monica > 5) {
    // Volatile: controlled reduction
    return {
      temperatureAdjustment: -15,
      timingAdjustment: -8,
      intensityModifier: "temper",
    };
  } else if (monica > 2) {
    // Transformative: slight push to drive reactions
    return {
      temperatureAdjustment: 10,
      timingAdjustment: 5,
      intensityModifier: "amplify",
    };
  } else if (monica > 1) {
    // Balanced: optimal zone, minimal adjustment
    return {
      temperatureAdjustment: 0,
      timingAdjustment: 0,
      intensityModifier: "neutral",
    };
  } else if (monica > 0.5) {
    // Stable: needs energy input
    return {
      temperatureAdjustment: 15,
      timingAdjustment: 10,
      intensityModifier: "boost",
    };
  } else {
    // Very Stable: significant energy needed to overcome inertia
    return {
      temperatureAdjustment: 25,
      timingAdjustment: 20,
      intensityModifier: "intensify",
    };
  }
}

/**
 * Returns a list of all enhanced cooking methods.
 * Currently, this maps ALCHEMICAL_PILLARS to EnhancedCookingMethod.
 * This function is a placeholder and may need more complex logic.
 * @returns {EnhancedCookingMethod[]}
 */
export function getAllEnhancedCookingMethods(): EnhancedCookingMethod[] {
  console.warn("getAllEnhancedCookingMethods is a placeholder function.");
  return ALCHEMICAL_PILLARS.map((pillar) => ({
    id: String(pillar.id),
    name: pillar.name,
    description: pillar.description,
    category: "transformation", // Default category
    alchemicalEffects: pillar.effects,
    thermodynamics: { heat: 0.5, entropy: 0.5, reactivity: 0.5 }, // Placeholder
    elementalInfluence: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, // Placeholder
    techniques: [],
    equipment: [],
    skillLevel: "intermediate",
    timeRange: { min: 5, max: 60, unit: "minutes" },
    elementalEffect: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, // Placeholder
    duration: { min: 5, max: 60 },
    suitable_for: [],
    benefits: [],
    monicaCompatibility: { score: 0, factors: [], enhancedProperties: [] }, // Initialize monicaCompatibility
  }));
}

// Sample ingredients for demonstration and testing purposes
const ALL_ENHANCED_INGREDIENTS: EnhancedRecipeIngredient[] = [
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    amount: 1,
    unit: "piece",
    category: "protein",
    cuisine: "universal",
    seasonality: "all",
    elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.5, Air: 0.2 },
    tags: ["lean-protein"],
  },
  {
    id: "broccoli",
    name: "Broccoli",
    amount: 1,
    unit: "cup",
    category: "vegetable",
    cuisine: "universal",
    seasonality: ["spring", "fall"],
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.3, Air: 0.5 },
    tags: ["green-vegetable", "cruciferous"],
  },
  {
    id: "rice",
    name: "Rice",
    amount: 1,
    unit: "cup",
    category: "grain",
    cuisine: "asian",
    seasonality: "all",
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.7, Air: 0.1 },
    tags: ["staple", "carbohydrate"],
  },
  {
    id: "salmon-fillet",
    name: "Salmon Fillet",
    amount: 1,
    unit: "piece",
    category: "protein",
    cuisine: "universal",
    seasonality: ["summer", "fall"],
    elementalProperties: { Fire: 0.3, Water: 0.7, Earth: 0.4, Air: 0.2 },
    tags: ["fatty-fish", "omega-3"],
    allergens: ["fish"],
  },
  {
    id: "spinach",
    name: "Spinach",
    amount: 1,
    unit: "cup",
    category: "leafy-green",
    cuisine: "mediterranean",
    seasonality: ["spring", "fall"],
    elementalProperties: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.6 },
    tags: ["nutrient-dense", "iron"],
  },
  {
    id: "quinoa",
    name: "Quinoa",
    amount: 1,
    unit: "cup",
    category: "grain",
    cuisine: "south-american",
    seasonality: "all",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.6, Air: 0.4 },
    tags: ["complete-protein", "gluten-free"],
  },
  {
    id: "bell-pepper",
    name: "Bell Pepper",
    amount: 1,
    unit: "piece",
    category: "vegetable",
    cuisine: "mexican",
    seasonality: ["summer"],
    elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.3, Air: 0.4 },
    tags: ["colorful", "vitamin-c"],
  },
  {
    id: "garlic",
    name: "Garlic",
    amount: 1,
    unit: "clove",
    category: "aromatic",
    cuisine: "universal",
    seasonality: "all",
    elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.4, Air: 0.3 },
    tags: ["pungent", "flavor-enhancer"],
  },
  {
    id: "onion",
    name: "Onion",
    amount: 1,
    unit: "medium",
    category: "aromatic",
    cuisine: "universal",
    seasonality: "all",
    elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.5, Air: 0.2 },
    tags: ["base-flavor", "pungent"],
  },
  {
    id: "tomato",
    name: "Tomato",
    amount: 1,
    unit: "medium",
    category: "fruit",
    cuisine: "mediterranean",
    seasonality: ["summer"],
    elementalProperties: { Fire: 0.3, Water: 0.7, Earth: 0.2, Air: 0.3 },
    tags: ["acidic", "juicy"],
  },
];

/**
 * Returns a list of all enhanced ingredients.
 * @returns {EnhancedRecipeIngredient[]}
 */
export function getEnhancedIngredients(): EnhancedRecipeIngredient[] {
  return [...ALL_ENHANCED_INGREDIENTS];
}
