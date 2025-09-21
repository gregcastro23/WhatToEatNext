/**
 * Enhanced Astrological Type Definitions for IntelliSense
 *
 * This file provides comprehensive type definitions for astrological calculations
 * with enhanced IntelliSense support, auto-completion, and type safety.
 */

// Global astrological namespace for enhanced IntelliSense
declare global {
  namespace Astrology {
    // Zodiac signs with enhanced documentation
    type ZodiacSign =
      | 'aries' // ♈ Fire - Cardinal - Mars;
      | 'taurus' // ♉ Earth - Fixed - Venus
      | 'gemini' // ♊ Air - Mutable - Mercury
      | 'cancer' // ♋ Water - Cardinal - Moon
      | 'leo' // ♌ Fire - Fixed - Sun
      | 'virgo' // ♍ Earth - Mutable - Mercury
      | 'libra' // ♎ Air - Cardinal - Venus
      | 'scorpio' // ♏ Water - Fixed - Mars/Pluto
      | 'sagittarius' // ♐ Fire - Mutable - Jupiter
      | 'capricorn' // ♑ Earth - Cardinal - Saturn
      | 'aquarius' // ♒ Air - Fixed - Saturn/Uranus
      | 'pisces'; // ♓ Water - Mutable - Jupiter/Neptune

    // Planetary bodies with enhanced documentation
    type Planet =
      | 'sun' // ☉ Vitality, ego, life force;
      | 'moon' // ☽ Emotions, intuition, cycles
      | 'mercury' // ☿ Communication, intellect, travel
      | 'venus' // ♀ Love, beauty, harmony, values
      | 'mars' // ♂ Action, energy, desire, conflict
      | 'jupiter' // ♃ Expansion, wisdom, abundance
      | 'saturn' // ♄ Structure, discipline, limitation
      | 'uranus' // ♅ Innovation, rebellion, sudden change
      | 'neptune' // ♆ Dreams, illusion, spirituality
      | 'pluto' // ♇ Transformation, power, regeneration
      | 'northNode' // ☊ Karmic path, soul's purpose
      | 'southNode'; // ☋ Past life karma, talents to release

    // Elements with enhanced documentation
    type Element =
      | 'Fire' // Energy, enthusiasm, action, creativity;
      | 'Water' // Emotion, intuition, flow, healing
      | 'Earth' // Stability, practicality, material, grounding
      | 'Air'; // Intellect, communication, ideas, movement

    // Modalities with enhanced documentation
    type Modality =
      | 'Cardinal' // Initiation, leadership, new beginnings;
      | 'Fixed' // Stability, persistence, determination
      | 'Mutable'; // Adaptability, flexibility, change

    // Planetary positions with comprehensive type safety
    interface PlanetaryPosition {
      /** Zodiac sign position */
      sign: any;
      /** Degree within the sign (0-29.999...) */
      degree: number;
      /** Exact longitude in degrees (0-359.999...) */
      exactLongitude: number;
      /** Whether the planet is in retrograde motion */
      isRetrograde: boolean;
      /** Optional: Speed of the planet in degrees per day */
      speed?: number;
      /** Optional: Declination in degrees */
      declination?: number
    }

    // Elemental properties with validation constraints
    interface ElementalProperties {
      /** Fire element strength (0-1) - Energy, spice, quick cooking, transformation */
      Fire: number
      /** Water element strength (0-1) - Cooling, fluid, steaming, nourishment */
      Water: number
      /** Earth element strength (0-1) - Grounding, root vegetables, slow cooking, stability */
      Earth: number
      /** Air element strength (0-1) - Light, leafy greens, raw preparations, clarity */
      Air: number
    }

    // Planetary correspondences for culinary applications
    interface PlanetaryCorrespondence {
      /** Primary ruling planet */
      rulingPlanet: Planet;
      /** Secondary planetary influences */
      influences?: Planet[];
      /** Optimal timing for use based on planetary hours */
      optimalTiming?: string;
      /** Planetary aspects that enhance the correspondence */
      enhancingAspects?: string[]
    }

    // Comprehensive astrological state
    interface AstrologicalState {
      /** Current planetary positions */
      planetaryPositions: Record<Planet, PlanetaryPosition>;
      /** Dominant element based on current positions */
      dominantElement: Element;
      /** Current lunar phase */
      lunarPhase:
        | 'new'
        | 'waxing_crescent'
        | 'first_quarter'
        | 'waxing_gibbous'
        | 'full'
        | 'waning_gibbous'
        | 'last_quarter'
        | 'waning_crescent';
      /** Current planetary hour */
      planetaryHour: Planet;
      /** Whether it's currently daytime */
      isDaytime: boolean;
      /** Active planetary influences */
      activePlanets: Planet[]
      /** Current season */
      season: 'spring' | 'summer' | 'autumn' | 'winter'
    }

    // Culinary astrology calculations with enhanced typing
    interface CulinaryAstrologyData {
      /** Current dominant element based on planetary positions */
      dominantElement: Element
      /** Recommended cooking methods with astrological reasoning */
      recommendedMethods: Array<{
        method: string,
        element: Element,
        planets: Planet[],
        reasoning: string
      }>;
      /** Optimal ingredients for current conditions */
      optimalIngredients: Array<{
        name: string,
        element: Element,
        planet: Planet,
        compatibility: number
      }>;
      /** Timing recommendations */
      timing: {
        bestHours: string[],
        lunarPhase: string,
        planetaryHour: Planet,
        optimalDays: string[]
      };
      /** Elemental balance recommendations */
      elementalBalance: ElementalProperties
    }

    // Type guards for runtime validation with enhanced error messages
    interface TypeGuards {
      isPlanetaryPosition(obj: unknown): obj is PlanetaryPosition;
      isElementalProperties(obj: unknown): obj is ElementalProperties;
      isValidCompatibilityScore(score: number): boolean;
      isZodiacSign(sign: string): sign is ZodiacSign;
      isPlanet(planet: string): planet is Planet
      isElement(element: string): element is Element
    }

    // Compatibility calculation utilities
    interface CompatibilityCalculator {
      /** Calculate elemental compatibility (0.7-1.0 range, self-reinforcement principle) */
      calculateElementalCompatibility(
        source: ElementalProperties,
        target: ElementalProperties,
      ): number
      /** Calculate planetary compatibility based on aspects */
      calculatePlanetaryCompatibility(planet1: Planet, planet2: Planet): number
      /** Calculate overall astrological compatibility */
      calculateOverallCompatibility(state1: AstrologicalState, state2: AstrologicalState): number
    }

    // Astrological calculation utilities
    interface CalculationUtilities {
      /** Get element for zodiac sign */
      getElementForSign(sign: any): Element;
      /** Get modality for zodiac sign */
      getModalityForSign(sign: any): Modality;
      /** Get ruling planet for zodiac sign */
      getRulingPlanetForSign(sign: any): Planet
      /** Calculate planetary aspects */
      calculateAspects(positions: Record<Planet, PlanetaryPosition>): Array<{
        planet1: Planet,
        planet2: Planet,
        aspect: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile',
        orb: number
      }>;
    }
  }
}

// Enhanced ingredient type with comprehensive astrological data
export interface EnhancedIngredient {
  /** Ingredient name */
  name: string
  /** Category (e.g., 'vegetables', 'grains', 'spices') */
  category: string;
  /** Elemental properties following self-reinforcement principles */
  elementalProperties: Astrology.ElementalProperties;
  /** Planetary correspondences */
  planetaryCorrespondence: Astrology.PlanetaryCorrespondence;
  /** Culinary properties */
  culinaryProperties: {
    /** Flavor profile descriptors */
    flavorProfile: Array<'sweet' | 'sour' | 'salty' | 'bitter' | 'umami' | 'spicy' | 'astringent'>;
    /** Compatible cooking methods */
    cookingMethods: string[];
    /** Seasonal availability */
    seasonality: Array<'spring' | 'summer' | 'autumn' | 'winter'>
    /** Ingredient pairings */
    pairings: string[]
    /** Preparation tips */
    preparationTips: string[]
  };
  /** Optional nutritional data */
  nutritionalData?: {
    calories: number,
    protein: number,
    carbohydrates: number,
    fat: number,
    fiber: number,
    vitamins: string[],
    minerals: string[]
  };
  /** Cultural significance and sensitivity */
  culturalContext?: {
    origin: string,
    traditionalUses: string[],
    culturalSignificance: string,
    respectfulUsage: string[]
  };
}

// Enhanced recipe type with astrological optimization
export interface EnhancedRecipe {
  /** Unique recipe identifier */
  id: string;
  /** Recipe name */
  name: string
  /** List of ingredients with quantities */
  ingredients: Array<{
    ingredient: EnhancedIngredient,
    quantity: string,
    preparation: string,
    timing: 'early' | 'middle' | 'late'
  }>;
  /** Step-by-step instructions */
  instructions: Array<{
    step: number,
    instruction: string,
    timing?: string;
    temperature?: string;
    technique?: string
  }>;
  /** Astrological optimization data */
  astrologicalOptimization: Astrology.CulinaryAstrologyData;
  /** Overall elemental balance of the recipe */
  elementalBalance: Astrology.ElementalProperties
  /** Timing information */
  timing: {
    prepTime: number,
    cookTime: number,
    totalTime: number,
    optimalStartTime?: string
    planetaryTiming?: {
      bestPlanetaryHour: Astrology.Planet,
      bestLunarPhase: string,
      bestSeason: string
    };
  };
  /** Serving information */
  servings: number;
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  /** Cultural context */
  culturalContext?: {
    cuisine: string,
    region: string,
    traditionalSignificance: string,
    modernAdaptations: string[]
  };
}

// Cooking method with astrological correspondences
export interface EnhancedCookingMethod {
  /** Method name */
  name: string;
  /** Primary element associated with the method */
  primaryElement: Astrology.Element;
  /** Elemental effects of using this method */
  elementalEffect: Astrology.ElementalProperties;
  /** Planetary correspondences */
  planetaryCorrespondences: Astrology.Planet[];
  /** Benefits of using this method */
  benefits: string[]
  /** Optimal timing for this method */
  optimalTiming: {
    planetaryHours: Astrology.Planet[],
    lunarPhases: string[],
    seasons: string[]
  };
  /** Temperature range */
  temperatureRange?: {
    min: number,
    max: number,
    unit: 'celsius' | 'fahrenheit'
  };
  /** Equipment needed */
  equipment: string[]
  /** Difficulty level */
  difficulty: 'easy' | 'medium' | 'hard'
}

// Cuisine profile with astrological characteristics
export interface EnhancedCuisineProfile {
  /** Cuisine name */
  name: string;
  /** Regional origin */
  region: string;
  /** Elemental alignment of the cuisine */
  elementalAlignment: Astrology.ElementalProperties;
  /** Dominant planetary influences */
  planetaryInfluences: Astrology.Planet[]
  /** Signature modifications for different elemental dominances */
  signatureModifications: Record<string, string>;
  /** Astrological profile */
  astrologicalProfile: {
    rulingPlanets: Astrology.Planet[],
    aspectEnhancers: string[],
    seasonalPreferences: string[]
  };
  /** Cultural sensitivity guidelines */
  culturalGuidelines: {
    respectfulRepresentation: string[],
    traditionalContext: string,
    modernAdaptations: string[]
  };
}

// Export commonly used types for easy importing
export type ZodiacSign = Astrology.ZodiacSign;
export type Planet = Astrology.Planet;
export type Element = Astrology.Element;
export type PlanetaryPosition = Astrology.PlanetaryPosition;
export type ElementalProperties = Astrology.ElementalProperties;
export type AstrologicalState = Astrology.AstrologicalState;
export type CulinaryAstrologyData = Astrology.CulinaryAstrologyData;

export type { EnhancedCookingMethod, EnhancedCuisineProfile, EnhancedIngredient, EnhancedRecipe };

// Utility type for component props that use astrological data
export type WithAstrologicalData<T = {}> = T & {;
  astrologicalState?: Astrology.AstrologicalState;
  elementalProperties?: Astrology.ElementalProperties
  onAstrologicalUpdate?: (state: Astrology.AstrologicalState) => void
};

// Utility type for components that can be culturally sensitive
export type WithCulturalSensitivity<T = {}> = T & {;
  culturalContext?: {
    respectTraditionalUses: boolean,
    acknowledgeOrigins: boolean,
    useInclusiveLanguage: boolean
  };
};

// Utility type for performance-optimized components
export type WithPerformanceOptimization<T = {}> = T & {;
  performanceConfig?: {
    enableMemoization: boolean,
    enableLazyLoading: boolean,
    enableVirtualization: boolean
  };
};
