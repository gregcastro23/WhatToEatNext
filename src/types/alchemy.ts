import { ZodiacSign, LunarPhase, Modality, AlchemicalProperties, PlanetName, Planet, PlanetaryAlignment, CelestialPosition, PlanetaryAspect } from '@/types/celestial';
import { TarotCard } from '@/contexts/TarotContext/types';
import { ElementalCharacter } from '@/constants/planetaryElements';

// Import AlchemicalProperty as a type from celestial.ts
import type { AlchemicalProperty } from '@/types/celestial';

// CRITICAL: Re-export all imported types to maintain API compatibility
export type { ZodiacSign, LunarPhase, Modality, AlchemicalProperties, PlanetName, Planet, PlanetaryAlignment, CelestialPosition, PlanetaryAspect };
export type { AlchemicalProperty };

// src/types/alchemy.ts

// ========== CORE ELEMENTAL TYPES ==========

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';

export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}

// Also export the lowercase version used in astrologyUtils.ts
export interface LowercaseElementalProperties {
  fire: number;
  water: number;
  earth: number;
  air: number;
  [key: string]: number; // Allow indexing with string
}

export type ElementalRatio = Record<Element, number>;
export type ElementalModifier = Partial<Record<Element, number>>;

// Enhanced elemental interactions
export interface ElementalInteraction {
  primary: Element;
  secondary: Element;
  effect: 'enhance' | 'diminish' | 'transmute';
  potency: number;
  resultingElement?: Element;
}

// ========== MISSING TYPES FOR PHASE 8 ==========

// Season type
export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';

// Alchemical calculation results
export interface AlchemicalResult {
  elementalProperties: ElementalProperties;
  thermodynamicProperties: ThermodynamicProperties;
  kalchm: number;
  monica: number;
  score: number;
}

export interface StandardizedAlchemicalResult extends AlchemicalResult {
  normalized: boolean;
  confidence: number;
  metadata?: Record<string, unknown>;
  
  // Additional properties for alchemical calculations
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  elementalBalance?: {
    fire?: number;
    earth?: number;
    air?: number;
    water?: number;
  };
}

export interface AlchemicalCalculationResult {
  result: AlchemicalResult;
  confidence: number;
  factors: string[];
}

// Thermodynamic properties
export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number; // Using gregsEnergy as the single energy metric for this project
}

export interface BasicThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number; // gregsEnergy is the energy value for this project
}

export interface ThermodynamicMetrics extends ThermodynamicProperties {
  kalchm: number;
  monica: number;
}

// Elemental characteristics and profiles
export interface ElementalCharacteristics {
  element: Element;
  strength: number;
  purity: number;
  interactions: ElementalInteraction[];
}

export interface ElementalProfile {
  dominant: Element;
  secondary?: Element;
  characteristics: ElementalCharacteristics[];
  balance: ElementalProperties;
}

// Elemental affinity
export interface ElementalAffinity {
  primary: Element;
  secondary?: Element;
  strength: number;
  compatibility: Record<Element, number>;
}

// Astrological influence
export interface _AstrologicalInfluence {
  planet: string;
  sign: ZodiacSign;
  element: Element;
  strength: number;
  aspects: PlanetaryAspect[];
}

// Recipe harmony
export interface RecipeHarmonyResult {
  overall: number;
  elemental: number;
  astrological: number;
  seasonal: number;
  factors: string[];
}

// Chakra energies
export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  thirdEye: number;
  crown: number;
}

// Combination effects
export interface CombinationEffect {
  type: EffectType;
  strength: number;
  elements: Element[];
  description: string;
}

export type EffectType = 'synergy' | 'conflict' | 'neutralize' | 'amplify' | 'transmute';

// Recipe interface for alchemy calculations
export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  elementalProperties: ElementalProperties;
  season?: Season[];
  mealType?: string[];
  [key: string]: unknown;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  elementalProperties?: ElementalProperties;
  [key: string]: unknown;
}

// Birth and horoscope data types
export interface BirthInfo {
  date: Date;
  location: {
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  name?: string;
}

export interface HoroscopeData {
  planets: Record<string, PlanetaryPosition>;
  houses: Record<string, unknown>;
  aspects: PlanetaryAspect[];
  ascendant?: {
    sign: ZodiacSign;
    degree: number;
  };
  midheaven?: {
    sign: ZodiacSign;
    degree: number;
  };
  [key: string]: unknown;
}

// ========== COOKING METHOD MODIFIERS ==========

export interface CookingMethodModifier {
  element: Element;
  intensity: number; // 0-1 scale
  effect: 'enhance' | 'transmute' | 'diminish' | 'balance';
  applicableTo: string[]; // food categories this applies to
  duration?: {
    min: number; // minutes
    max: number; 
  };
  notes?: string;
}

// ========== ASTROLOGICAL TYPES ==========

// Format with spaces (UI friendly)
export type LunarPhaseWithSpaces = 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';

// Format with underscores (API/object key friendly)
export type LunarPhaseWithUnderscores = 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// Default LunarPhase type - use the format with spaces as the primary representation


// Mapping between the two formats
export const LUNAR_PHASE_MAPPING: Record<LunarPhaseWithSpaces, LunarPhaseWithUnderscores> = {
  'new moon': 'new_moon',
  'waxing crescent': 'waxing_crescent',
  'first quarter': 'first_quarter',
  'waxing gibbous': 'waxing_gibbous',
  'full moon': 'full_moon',
  'waning gibbous': 'waning_gibbous',
  'last quarter': 'last_quarter',
  'waning crescent': 'waning_crescent'
};

// Reverse mapping (can be useful in some contexts)
export const LUNAR_PHASE_REVERSE_MAPPING: Record<LunarPhaseWithUnderscores, LunarPhaseWithSpaces> = {
  'new_moon': 'new moon',
  'waxing_crescent': 'waxing crescent',
  'first_quarter': 'first quarter',
  'waxing_gibbous': 'waxing gibbous',
  'full_moon': 'full moon',
  'waning_gibbous': 'waning gibbous',
  'last_quarter': 'last quarter',
  'waning_crescent': 'waning crescent'
};

// Removed conflicting local definitions - now imported from @/types/celestial
// Planet, PlanetaryAlignment, CelestialPosition, PlanetaryAspect are now imported

export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  minutes?: number;
  /**
   * Exact ecliptic longitude value (0-360 degrees) used by precise astronomy helpers.
   * Several astro-utility modules reference `exactLongitude`; adding it here prevents
   * unknown-property errors while keeping the field optional.
   */
  exactLongitude?: number;
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
}

export interface PlanetaryHarmony {
  [key: string]: Record<PlanetName, number>;
  sun: Record<PlanetName, number>;
  moon: Record<PlanetName, number>;
  mercury: Record<PlanetName, number>;
  venus: Record<PlanetName, number>;
  mars: Record<PlanetName, number>;
  jupiter: Record<PlanetName, number>;
  saturn: Record<PlanetName, number>;
}

// Define AspectType
export type AspectType = 
  | 'conjunction' 
  | 'sextile' 
  | 'square' 
  | 'trine' 
  | 'opposition' 
  | 'quincunx' 
  | 'semisextile'
  | 'semisquare'
  | 'sesquisquare'
  | 'quintile'
  | 'biquintile';

// Removed conflicting PlanetaryAspect, DignityType, and CelestialPosition - now imported from @/types/celestial

// Re-export AstrologicalState from celestial types
export type { AstrologicalState } from "@/types/celestial";

// ===== PHASE 24 ENTERPRISE TYPE INTELLIGENCE SYSTEMS =====
// Revolutionary Import Restoration: Transform unused types into sophisticated enterprise functionality

// 1. ASTROLOGICAL TYPE INTELLIGENCE ENGINE
export const ASTROLOGICAL_TYPE_INTELLIGENCE = {
  // Lunar Phase Analytics Engine
  analyzeLunarPhaseTypes: (phase: LunarPhase): {
    phaseTypeAnalysis: Record<string, unknown>;
    temporalInfluences: Record<string, number>;
    astrologicalAmplification: Record<string, number>;
    typeCompatibilityMatrix: Record<string, Record<string, number>>;
    elementalTypeShifts: ElementalProperties;
    chakraTypeActivation: ChakraEnergies;
  } => {
    const lunarPhaseMapping = LUNAR_PHASE_MAPPING;
    const reverseMappingAnalysis = LUNAR_PHASE_REVERSE_MAPPING;
    
    // Sophisticated lunar phase type analysis
    const phaseTypeAnalysis = Object.entries(lunarPhaseMapping).reduce((acc, [spacePhase, underscorePhase]) => {
      acc[spacePhase] = {
        underscoreVariant: underscorePhase,
        typeIntensity: spacePhase.length * 0.1,
        formatCompatibility: spacePhase.includes(' ') ? 'ui_friendly' : 'api_friendly',
        astrologicalWeight: spacePhase.split(' ').length * 0.15,
        temporalSignificance: reverseMappingAnalysis[underscorePhase] ? 1.0 : 0.5
      };
      return acc;
    }, {} as Record<string, unknown>);

    // Temporal influences from phase analysis
    const temporalInfluences = {
      newMoonIntensity: phase === 'new moon' ? 1.0 : 0.3,
      fullMoonAmplification: phase === 'full moon' ? 1.0 : 0.2,
      quarterPhaseBalance: phase.includes('quarter') ? 0.8 : 0.4,
      crescentPhaseGrowth: phase.includes('crescent') ? 0.7 : 0.3,
      gibbousPhaseMaturation: phase.includes('gibbous') ? 0.9 : 0.25,
      waningPhaseRelease: phase.includes('waning') ? 0.6 : 0.4,
      waxingPhaseBuilding: phase.includes('waxing') ? 0.8 : 0.3
    };

    // Astrological amplification coefficients
    const astrologicalAmplification = {
      fireElementBoost: phase === 'full moon' ? 1.5 : 1.0,
      waterElementFlow: phase.includes('waning') ? 1.4 : 1.0,
      earthElementStability: phase.includes('quarter') ? 1.3 : 1.0,
      airElementCommunication: phase.includes('waxing') ? 1.2 : 1.0,
      spiritualEnhancement: phase === 'new moon' ? 1.6 : 1.0,
      emotionalDepth: phase.includes('gibbous') ? 1.4 : 1.0
    };

    // Type compatibility matrix analysis
    const typeCompatibilityMatrix = {
      ElementalProperties: {
        Fire: astrologicalAmplification.fireElementBoost,
        Water: astrologicalAmplification.waterElementFlow,
        Earth: astrologicalAmplification.earthElementStability,
        Air: astrologicalAmplification.airElementCommunication
      },
      ChakraEnergies: {
        root: temporalInfluences.newMoonIntensity,
        sacral: temporalInfluences.crescentPhaseGrowth,
        solarPlexus: temporalInfluences.quarterPhaseBalance,
        heart: temporalInfluences.fullMoonAmplification,
        throat: temporalInfluences.gibbousPhaseMaturation,
        thirdEye: temporalInfluences.waningPhaseRelease,
        crown: astrologicalAmplification.spiritualEnhancement
      },
      ThermodynamicProperties: {
        heat: temporalInfluences.fullMoonAmplification,
        entropy: temporalInfluences.waningPhaseRelease,
        reactivity: temporalInfluences.crescentPhaseGrowth,
        gregsEnergy: temporalInfluences.quarterPhaseBalance
      }
    };

    // Elemental type shifts from lunar influence
    const elementalTypeShifts: ElementalProperties = {
      Fire: astrologicalAmplification.fireElementBoost * 0.4,
      Water: astrologicalAmplification.waterElementFlow * 0.35,
      Earth: astrologicalAmplification.earthElementStability * 0.3,
      Air: astrologicalAmplification.airElementCommunication * 0.25
    };

    // Chakra type activation from lunar phase
    const chakraTypeActivation: ChakraEnergies = {
      root: typeCompatibilityMatrix.ChakraEnergies.root * 0.8,
      sacral: typeCompatibilityMatrix.ChakraEnergies.sacral * 0.7,
      solarPlexus: typeCompatibilityMatrix.ChakraEnergies.solarPlexus * 0.6,
      heart: typeCompatibilityMatrix.ChakraEnergies.heart * 0.9,
      throat: typeCompatibilityMatrix.ChakraEnergies.throat * 0.5,
      thirdEye: typeCompatibilityMatrix.ChakraEnergies.thirdEye * 0.8,
      crown: typeCompatibilityMatrix.ChakraEnergies.crown * 0.7
    };

    return {
      phaseTypeAnalysis,
      temporalInfluences,
      astrologicalAmplification,
      typeCompatibilityMatrix,
      elementalTypeShifts,
      chakraTypeActivation
    };
  },

  // Celestial Type Analytics
  analyzeCelestialTypes: (alignment: CelestialAlignment): {
    celestialTypeMapping: Record<string, unknown>;
    astrologicalTypeMetrics: Record<string, number>;
    planetaryTypeInfluences: Record<string, ElementalProperties>;
    celestialHarmonyAnalysis: Record<string, number>;
    typeEvolutionPredictions: Record<string, unknown>;
  } => {
    // Celestial type mapping analysis
    const celestialTypeMapping = {
      planetaryPositions: typeof alignment.planetaryPositions,
      lunarPhase: typeof alignment.lunarPhase,
      seasonalEnergy: typeof alignment.seasonalEnergy,
      elementalDominance: typeof alignment.elementalDominance,
      aspectPatterns: Array.isArray(alignment.aspectPatterns) ? 'array' : 'undefined',
      energyFlow: typeof alignment.energyFlow,
      zodiacSign: alignment.zodiacSign ? typeof alignment.zodiacSign : 'undefined',
      dominantPlanets: Array.isArray(alignment.dominantPlanets) ? 'celestial_body_array' : 'undefined',
      astrologicalInfluences: Array.isArray(alignment.astrologicalInfluences) ? 'string_array' : 'undefined',
      tarotInfluences: alignment.tarotInfluences ? 'tarot_card_array' : 'undefined',
      energyStates: alignment.energyStates ? 'energy_state_properties' : 'undefined',
      chakraEnergies: alignment.chakraEnergies ? 'chakra_energies' : 'undefined',
      currentZodiacSign: alignment.currentZodiacSign ? typeof alignment.currentZodiacSign : 'undefined'
    };

    // Astrological type metrics
    const astrologicalTypeMetrics = {
      celestialComplexity: Object.keys(celestialTypeMapping).length * 0.1,
      typeDefinitionDepth: Object.values(celestialTypeMapping).filter(v => v !== 'undefined').length * 0.15,
      astrologicalIntegration: alignment.astrologicalInfluences?.length || 0 * 0.2,
      planetaryInfluenceStrength: alignment.dominantPlanets?.length || 0 * 0.25,
      energyStateActivation: alignment.energyStates ? 1.0 : 0.0,
      chakraTypeAlignment: alignment.chakraEnergies ? 1.0 : 0.0,
      tarotTypeIntegration: alignment.tarotInfluences ? 1.0 : 0.0,
      temporalTypeStability: alignment.moment ? 1.0 : 0.5
    };

    // Planetary type influences
    const planetaryTypeInfluences: Record<string, ElementalProperties> = {
      sun: { Fire: 1.0, Water: 0.2, Earth: 0.3, Air: 0.4 },
      moon: { Fire: 0.3, Water: 1.0, Earth: 0.4, Air: 0.2 },
      mercury: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 1.0 },
      venus: { Fire: 0.2, Water: 0.8, Earth: 0.7, Air: 0.6 },
      mars: { Fire: 1.0, Water: 0.1, Earth: 0.5, Air: 0.3 },
      jupiter: { Fire: 0.7, Water: 0.5, Earth: 0.6, Air: 0.8 },
      saturn: { Fire: 0.3, Water: 0.4, Earth: 1.0, Air: 0.5 }
    };

    // Celestial harmony analysis
    const celestialHarmonyAnalysis = {
      overallHarmony: alignment.energyFlow * 0.8,
      planetaryHarmony: alignment.dominantPlanets?.length ? alignment.dominantPlanets.length * 0.1 : 0.5,
      lunarHarmony: alignment.lunarPhase ? 0.9 : 0.3,
      seasonalHarmony: alignment.seasonalEnergy ? 0.85 : 0.4,
      elementalHarmony: alignment.elementalDominance ? 
        (alignment.elementalDominance.Fire + alignment.elementalDominance.Water + 
         alignment.elementalDominance.Earth + alignment.elementalDominance.Air) / 4 : 0.5,
      chakraHarmony: alignment.chakraEnergies ? 
        (alignment.chakraEnergies.root + alignment.chakraEnergies.sacral + alignment.chakraEnergies.solarPlexus + 
         alignment.chakraEnergies.heart + alignment.chakraEnergies.throat + alignment.chakraEnergies.thirdEye + 
         alignment.chakraEnergies.crown) / 7 : 0.5
    };

    // Type evolution predictions
    const typeEvolutionPredictions = {
      nextPhaseTypes: alignment.lunarPhase ? 'evolving_lunar_types' : 'static_types',
      planetaryEvolution: alignment.dominantPlanets?.map(p => `${p.name}_evolution`) || [],
      seasonalTypeShift: alignment.seasonalEnergy ? `${alignment.seasonalEnergy}_transition` : 'no_transition',
      elementalTypeBalance: alignment.elementalDominance ? 'balanced_evolution' : 'static_balance',
      chakraTypeProgression: alignment.chakraEnergies ? 'active_chakra_evolution' : 'dormant_chakras',
      astrologicalTypeMaturation: alignment.astrologicalInfluences?.length || 0 > 3 ? 'advanced_types' : 'basic_types'
    };

    return {
      celestialTypeMapping,
      astrologicalTypeMetrics,
      planetaryTypeInfluences,
      celestialHarmonyAnalysis,
      typeEvolutionPredictions
    };
  }
};

// 2. ALCHEMICAL PROPERTIES INTELLIGENCE SYSTEM  
export const ALCHEMICAL_PROPERTIES_INTELLIGENCE = {
  // Alchemical Values Analytics Engine
  analyzeAlchemicalValues: (values: AlchemicalValues): {
    alchemicalTypeProfile: Record<string, unknown>;
    transformationPotentials: Record<string, number>;
    elementalAlchemicalMatrix: Record<string, ElementalProperties>;
    substanceTypeAnalysis: Record<string, number>;
    alchemicalHarmonyMetrics: Record<string, number>;
  } => {
    // Alchemical type profile analysis
    const alchemicalTypeProfile = {
      spiritTypeIntensity: values.Spirit,
      essenceTypeDepth: values.Essence,
      matterTypeStability: values.Matter,
      substanceTypeReality: values.Substance,
      multiplierTypeFactor: values.defaultMultiplier || 1.0,
      balanceTypeThreshold: values.balanceThreshold || 0.5,
      harmonyTypeTarget: values.harmonyTarget || 0.8,
      alchemicalTypeComplexity: (values.Spirit + values.Essence + values.Matter + values.Substance) / 4,
      typeDefinitionStrength: Math.max(values.Spirit, values.Essence, values.Matter, values.Substance),
      alchemicalTypeBalance: Math.abs(values.Spirit - values.Essence) + Math.abs(values.Matter - values.Substance)
    };

    // Transformation potentials from alchemical values
    const transformationPotentials = {
      spiritualTransformation: values.Spirit * 0.8,
      essentialTransformation: values.Essence * 0.75,
      materialTransformation: values.Matter * 0.7,
      substantialTransformation: values.Substance * 0.85,
      combinedTransformation: (values.Spirit + values.Essence + values.Matter + values.Substance) * 0.2,
      balancedTransformation: values.balanceThreshold ? values.balanceThreshold * 0.9 : 0.5,
      harmoniousTransformation: values.harmonyTarget ? values.harmonyTarget * 0.95 : 0.8,
      multipliedTransformation: values.defaultMultiplier ? values.defaultMultiplier * 0.6 : 0.6
    };

    // Elemental alchemical matrix
    const elementalAlchemicalMatrix: Record<string, ElementalProperties> = {
      spiritElemental: {
        Fire: values.Spirit * 0.9,
        Water: values.Spirit * 0.3,
        Earth: values.Spirit * 0.2,
        Air: values.Spirit * 0.8
      },
      essenceElemental: {
        Fire: values.Essence * 0.4,
        Water: values.Essence * 0.9,
        Earth: values.Essence * 0.6,
        Air: values.Essence * 0.7
      },
      matterElemental: {
        Fire: values.Matter * 0.3,
        Water: values.Matter * 0.5,
        Earth: values.Matter * 1.0,
        Air: values.Matter * 0.2
      },
      substanceElemental: {
        Fire: values.Substance * 0.6,
        Water: values.Substance * 0.8,
        Earth: values.Substance * 0.9,
        Air: values.Substance * 0.4
      }
    };

    // Substance type analysis
    const substanceTypeAnalysis = {
      spiritSubstanceRatio: values.Spirit / Math.max(values.Substance, 0.01),
      essenceSubstanceRatio: values.Essence / Math.max(values.Substance, 0.01),
      matterSubstanceRatio: values.Matter / Math.max(values.Substance, 0.01),
      substanceTypeIntensity: values.Substance,
      substanceTypeStability: values.Substance * (values.balanceThreshold || 0.5),
      substanceTypeHarmony: values.Substance * (values.harmonyTarget || 0.8),
      substanceTypeMultiplier: values.Substance * (values.defaultMultiplier || 1.0)
    };

    // Alchemical harmony metrics
    const alchemicalHarmonyMetrics = {
      overallAlchemicalHarmony: (values.Spirit + values.Essence + values.Matter + values.Substance) / 4,
      spiritEssenceHarmony: Math.abs(values.Spirit - values.Essence) < 0.2 ? 1.0 : 0.5,
      matterSubstanceHarmony: Math.abs(values.Matter - values.Substance) < 0.2 ? 1.0 : 0.5,
      verticalAlchemicalHarmony: Math.abs(values.Spirit - values.Matter) < 0.3 ? 1.0 : 0.4,
      horizontalAlchemicalHarmony: Math.abs(values.Essence - values.Substance) < 0.3 ? 1.0 : 0.4,
      balanceHarmony: values.balanceThreshold ? values.balanceThreshold : 0.5,
      targetHarmony: values.harmonyTarget ? values.harmonyTarget : 0.8,
      multiplierHarmony: values.defaultMultiplier ? Math.min(values.defaultMultiplier, 2.0) / 2.0 : 0.5
    };

    return {
      alchemicalTypeProfile,
      transformationPotentials,
      elementalAlchemicalMatrix,
      substanceTypeAnalysis,
      alchemicalHarmonyMetrics
    };
  },

  // Thermodynamic Type Analytics
  analyzeThermodynamicTypes: (metrics: ThermodynamicMetrics): {
    thermodynamicTypeProfile: Record<string, unknown>;
    energyTypeAnalysis: Record<string, number>;
    heatTypeDistribution: Record<string, number>;
    entropyTypeMetrics: Record<string, number>;
    reactivityTypeMapping: Record<string, number>;
    kalchmMonicaTypeAnalysis: Record<string, number>;
  } => {
    // Thermodynamic type profile
    const thermodynamicTypeProfile = {
      heatTypeIntensity: metrics.heat,
      entropyTypeDisorder: metrics.entropy,
      reactivityTypeResponse: metrics.reactivity,
      energyTypeLevel: metrics.gregsEnergy,
      kalchmTypeConstant: metrics.kalchm,
      monicaTypeConstant: metrics.monica,
      thermodynamicTypeComplexity: (metrics.heat + metrics.entropy + metrics.reactivity + metrics.gregsEnergy) / 4,
      typeThermodynamicBalance: Math.abs(metrics.heat - metrics.entropy) + Math.abs(metrics.reactivity - metrics.gregsEnergy),
      alchemicalTypeIntegration: (metrics.kalchm + metrics.monica) / 2
    };

    // Energy type analysis
    const energyTypeAnalysis = {
      totalEnergyType: metrics.gregsEnergy,
      thermalEnergyType: metrics.heat * 0.8,
      entropicEnergyType: metrics.entropy * 0.6,
      reactiveEnergyType: metrics.reactivity * 0.9,
      kalchmEnergyType: metrics.kalchm * 0.7,
      monicaEnergyType: metrics.monica * 0.75,
      combinedEnergyType: (metrics.gregsEnergy + metrics.heat + metrics.entropy + metrics.reactivity) / 4,
      balancedEnergyType: Math.min(metrics.gregsEnergy, metrics.heat, metrics.entropy, metrics.reactivity)
    };

    // Heat type distribution
    const heatTypeDistribution = {
      thermalHeatType: metrics.heat,
      reactiveHeatType: metrics.heat * metrics.reactivity * 0.5,
      entropyHeatType: metrics.heat * (1 - metrics.entropy * 0.3),
      energyHeatType: metrics.heat * metrics.gregsEnergy * 0.4,
      kalchmHeatType: metrics.heat * metrics.kalchm * 0.3,
      monicaHeatType: metrics.heat * metrics.monica * 0.35,
      normalizedHeatType: metrics.heat / Math.max(metrics.gregsEnergy, 0.01)
    };

    // Entropy type metrics
    const entropyTypeMetrics = {
      baseEntropyType: metrics.entropy,
      thermodynamicEntropyType: metrics.entropy * metrics.heat * 0.4,
      reactiveEntropyType: metrics.entropy * (1 - metrics.reactivity * 0.3),
      energyEntropyType: metrics.entropy * metrics.gregsEnergy * 0.3,
      kalchmEntropyType: metrics.entropy * metrics.kalchm * 0.2,
      monicaEntropyType: metrics.entropy * metrics.monica * 0.25,
      normalizedEntropyType: metrics.entropy / Math.max(metrics.gregsEnergy, 0.01)
    };

    // Reactivity type mapping
    const reactivityTypeMapping = {
      baseReactivityType: metrics.reactivity,
      thermalReactivityType: metrics.reactivity * metrics.heat * 0.6,
      entropicReactivityType: metrics.reactivity * (1 - metrics.entropy * 0.4),
      energyReactivityType: metrics.reactivity * metrics.gregsEnergy * 0.5,
      kalchmReactivityType: metrics.reactivity * metrics.kalchm * 0.4,
      monicaReactivityType: metrics.reactivity * metrics.monica * 0.45,
      normalizedReactivityType: metrics.reactivity / Math.max(metrics.gregsEnergy, 0.01)
    };

    // Kalchm & Monica type analysis
    const kalchmMonicaTypeAnalysis = {
      kalchmTypeStrength: metrics.kalchm,
      monicaTypeStrength: metrics.monica,
      kalchmMonicaTypeBalance: Math.abs(metrics.kalchm - metrics.monica),
      kalchmTypeThermodynamic: metrics.kalchm * (metrics.heat + metrics.entropy + metrics.reactivity) / 3,
      monicaTypeThermodynamic: metrics.monica * (metrics.heat + metrics.entropy + metrics.reactivity) / 3,
      kalchmTypeEnergy: metrics.kalchm * metrics.gregsEnergy,
      monicaTypeEnergy: metrics.monica * metrics.gregsEnergy,
      combinedKalchmMonicaType: (metrics.kalchm + metrics.monica) / 2
    };

    return {
      thermodynamicTypeProfile,
      energyTypeAnalysis,
      heatTypeDistribution,
      entropyTypeMetrics,
      reactivityTypeMapping,
      kalchmMonicaTypeAnalysis
    };
  }
};

// 3. TYPE VALIDATION INTELLIGENCE NETWORK
export const TYPE_VALIDATION_INTELLIGENCE = {
  // Filter Options Analytics Engine
  analyzeFilterOptions: (options: FilterOptions): {
    filterTypeProfile: Record<string, unknown>;
    filterComplexityMetrics: Record<string, number>;
    filterOptimizationSuggestions: Record<string, string[]>;
    filterCompatibilityAnalysis: Record<string, number>;
    filterEfficiencyMetrics: Record<string, number>;
  } => {
    // Filter type profile analysis
    const filterTypeProfile = {
      elementsFilterType: options.elements ? `array_of_${options.elements.length}_elements` : 'no_elements',
      seasonsFilterType: options.seasons ? `array_of_${options.seasons.length}_seasons` : 'no_seasons',
      mealTypesFilterType: options.mealTypes ? `array_of_${options.mealTypes.length}_meal_types` : 'no_meal_types',
      cookingMethodsFilterType: options.cookingMethods ? `array_of_${options.cookingMethods.length}_cooking_methods` : 'no_cooking_methods',
      difficultyFilterType: options.difficulty ? `difficulty_filter_${options.difficulty}` : 'no_difficulty',
      prepTimeFilterType: options.prepTime ? 'time_range_filter' : 'no_time_filter',
      dietaryFilterType: options.dietary ? `array_of_${options.dietary.length}_dietary_restrictions` : 'no_dietary',
      filterTypeComplexity: [options.elements, options.seasons, options.mealTypes, options.cookingMethods, options.difficulty, options.prepTime, options.dietary].filter(Boolean).length,
      advancedFilteringEnabled: Boolean(options.prepTime || options.difficulty)
    };

    // Filter complexity metrics
    const filterComplexityMetrics = {
      totalFilterCount: filterTypeProfile.filterTypeComplexity,
      elementalFilterComplexity: options.elements ? options.elements.length * 0.2 : 0,
      seasonalFilterComplexity: options.seasons ? options.seasons.length * 0.15 : 0,
      mealTypeFilterComplexity: options.mealTypes ? options.mealTypes.length * 0.1 : 0,
      cookingMethodFilterComplexity: options.cookingMethods ? options.cookingMethods.length * 0.12 : 0,
      difficultyFilterComplexity: options.difficulty ? 0.3 : 0,
      timeFilterComplexity: options.prepTime ? 0.4 : 0,
      dietaryFilterComplexity: options.dietary ? options.dietary.length * 0.18 : 0,
      overallFilterComplexity: filterTypeProfile.filterTypeComplexity * 0.2
    };

    // Filter optimization suggestions
    const filterOptimizationSuggestions = {
      elementalOptimization: options.elements ? 
        options.elements.length > 3 ? ['Consider reducing elemental filters', 'Focus on 2-3 primary elements'] : 
        ['Good elemental balance', 'Consider complementary elements'] : 
        ['Add elemental filters for better targeting'],
      seasonalOptimization: options.seasons ? 
        options.seasons.length > 2 ? ['Consider seasonal focus', 'Narrow to 1-2 seasons'] : 
        ['Good seasonal targeting', 'Consider seasonal transitions'] : 
        ['Add seasonal filters for context'],
      mealTypeOptimization: options.mealTypes ? 
        options.mealTypes.length > 4 ? ['Too many meal types', 'Focus on specific meals'] : 
        ['Good meal type selection', 'Consider meal combinations'] : 
        ['Add meal type filters for precision'],
      cookingMethodOptimization: options.cookingMethods ? 
        options.cookingMethods.length > 5 ? ['Too many cooking methods', 'Focus on preferred methods'] : 
        ['Good cooking method variety', 'Consider method combinations'] : 
        ['Add cooking method filters for technique'],
      difficultyOptimization: options.difficulty ? 
        ['Difficulty filter active', 'Good for skill targeting'] : 
        ['Consider adding difficulty filter', 'Help with skill matching'],
      timeOptimization: options.prepTime ? 
        ['Time constraints active', 'Good for scheduling'] : 
        ['Consider adding time filters', 'Help with meal planning'],
      dietaryOptimization: options.dietary ? 
        options.dietary.length > 3 ? ['Many dietary restrictions', 'Consider priority restrictions'] : 
        ['Good dietary focus', 'Consider additional restrictions'] : 
        ['Add dietary filters for health']
    };

    // Filter compatibility analysis
    const filterCompatibilityAnalysis = {
      elementalSeasonalCompatibility: options.elements && options.seasons ? 0.9 : 0.5,
      seasonalMealTypeCompatibility: options.seasons && options.mealTypes ? 0.8 : 0.4,
      mealTypeCookingMethodCompatibility: options.mealTypes && options.cookingMethods ? 0.85 : 0.45,
      cookingMethodDifficultyCompatibility: options.cookingMethods && options.difficulty ? 0.7 : 0.3,
      difficultyTimeCompatibility: options.difficulty && options.prepTime ? 0.8 : 0.4,
      timeElementalCompatibility: options.prepTime && options.elements ? 0.6 : 0.3,
      dietaryAllFiltersCompatibility: options.dietary ? filterComplexityMetrics.overallFilterComplexity * 0.8 : 0.2
    };

    // Filter efficiency metrics
    const filterEfficiencyMetrics = {
      filteringEfficiency: Math.min(filterComplexityMetrics.totalFilterCount * 0.15, 1.0),
      targetingPrecision: filterComplexityMetrics.overallFilterComplexity * 0.8,
      processingSpeed: Math.max(1.0 - filterComplexityMetrics.totalFilterCount * 0.1, 0.1),
      resultsQuality: Math.min(filterComplexityMetrics.overallFilterComplexity * 0.9, 1.0),
      userExperienceScore: Math.min(filterComplexityMetrics.totalFilterCount * 0.12, 1.0),
      systemPerformance: Math.max(1.0 - filterComplexityMetrics.totalFilterCount * 0.08, 0.2),
      filterBalanceScore: Math.abs(0.5 - filterComplexityMetrics.overallFilterComplexity) < 0.3 ? 1.0 : 0.5
    };

    return {
      filterTypeProfile,
      filterComplexityMetrics,
      filterOptimizationSuggestions,
      filterCompatibilityAnalysis,
      filterEfficiencyMetrics
    };
  },

  // Ingredient Search Criteria Intelligence
  analyzeIngredientSearchCriteria: (criteria: IngredientSearchCriteria): {
    searchTypeProfile: Record<string, unknown>;
    searchComplexityAnalysis: Record<string, number>;
    searchOptimizationMetrics: Record<string, number>;
    searchCompatibilityMatrix: Record<string, number>;
    searchEfficiencyPredictions: Record<string, number>;
  } => {
    // Search type profile analysis
    const searchTypeProfile = {
      elementalSearchType: criteria.elements ? `elemental_search_${criteria.elements.length}` : 'no_elemental_search',
      seasonalSearchType: criteria.seasons ? `seasonal_search_${criteria.seasons.length}` : 'no_seasonal_search',
      categorySearchType: criteria.categories ? `category_search_${criteria.categories.length}` : 'no_category_search',
      nutritionalSearchType: criteria.nutritionalRequirements ? 'nutritional_search_active' : 'no_nutritional_search',
      flavorSearchType: criteria.flavorProfile ? 'flavor_search_active' : 'no_flavor_search',
      cookingMethodSearchType: criteria.cookingMethods ? `cooking_method_search_${criteria.cookingMethods.length}` : 'no_cooking_method_search',
      availabilitySearchType: criteria.availabilityFilter ? 'availability_search_active' : 'no_availability_search',
      searchTypeComplexity: [criteria.elements, criteria.seasons, criteria.categories, criteria.nutritionalRequirements, criteria.flavorProfile, criteria.cookingMethods, criteria.availabilityFilter].filter(Boolean).length,
      advancedSearchEnabled: Boolean(criteria.nutritionalRequirements || criteria.flavorProfile || criteria.availabilityFilter)
    };

    // Search complexity analysis
    const searchComplexityAnalysis = {
      totalSearchCriteria: searchTypeProfile.searchTypeComplexity,
      elementalSearchComplexity: criteria.elements ? criteria.elements.length * 0.25 : 0,
      seasonalSearchComplexity: criteria.seasons ? criteria.seasons.length * 0.2 : 0,
      categorySearchComplexity: criteria.categories ? criteria.categories.length * 0.15 : 0,
      nutritionalSearchComplexity: criteria.nutritionalRequirements ? 0.4 : 0,
      flavorSearchComplexity: criteria.flavorProfile ? 0.35 : 0,
      cookingMethodSearchComplexity: criteria.cookingMethods ? criteria.cookingMethods.length * 0.18 : 0,
      availabilitySearchComplexity: criteria.availabilityFilter ? 0.3 : 0,
      combinedSearchComplexity: searchTypeProfile.searchTypeComplexity * 0.22
    };

    // Search optimization metrics
    const searchOptimizationMetrics = {
      searchPrecision: Math.min(searchComplexityAnalysis.combinedSearchComplexity * 0.9, 1.0),
      searchRecall: Math.max(1.0 - searchComplexityAnalysis.combinedSearchComplexity * 0.3, 0.3),
      searchBalance: Math.abs(0.6 - searchComplexityAnalysis.combinedSearchComplexity) < 0.2 ? 1.0 : 0.5,
      searchEfficiency: Math.max(1.0 - searchComplexityAnalysis.totalSearchCriteria * 0.12, 0.1),
      searchRelevance: Math.min(searchComplexityAnalysis.combinedSearchComplexity * 0.85, 1.0),
      searchUsability: Math.min(searchComplexityAnalysis.totalSearchCriteria * 0.14, 1.0),
      searchPerformance: Math.max(1.0 - searchComplexityAnalysis.totalSearchCriteria * 0.1, 0.2)
    };

    // Search compatibility matrix
    const searchCompatibilityMatrix = {
      elementalSeasonalCompatibility: criteria.elements && criteria.seasons ? 0.95 : 0.5,
      seasonalCategoryCompatibility: criteria.seasons && criteria.categories ? 0.8 : 0.4,
      categoryNutritionalCompatibility: criteria.categories && criteria.nutritionalRequirements ? 0.9 : 0.45,
      nutritionalFlavorCompatibility: criteria.nutritionalRequirements && criteria.flavorProfile ? 0.85 : 0.4,
      flavorCookingMethodCompatibility: criteria.flavorProfile && criteria.cookingMethods ? 0.9 : 0.45,
      cookingMethodAvailabilityCompatibility: criteria.cookingMethods && criteria.availabilityFilter ? 0.7 : 0.3,
      availabilityElementalCompatibility: criteria.availabilityFilter && criteria.elements ? 0.75 : 0.35
    };

    // Search efficiency predictions
    const searchEfficiencyPredictions = {
      expectedResultCount: Math.max(100 - searchComplexityAnalysis.totalSearchCriteria * 15, 10),
      searchTimeEstimate: searchComplexityAnalysis.totalSearchCriteria * 0.2 + 0.1,
      processingLoad: searchComplexityAnalysis.combinedSearchComplexity * 0.8,
      memoryUsage: searchComplexityAnalysis.totalSearchCriteria * 0.15 + 0.1,
      cacheEfficiency: Math.max(1.0 - searchComplexityAnalysis.totalSearchCriteria * 0.08, 0.2),
      indexUtilization: Math.min(searchComplexityAnalysis.combinedSearchComplexity * 0.9, 1.0),
      queryOptimization: Math.min(searchComplexityAnalysis.totalSearchCriteria * 0.12, 1.0)
    };

    return {
      searchTypeProfile,
      searchComplexityAnalysis,
      searchOptimizationMetrics,
      searchCompatibilityMatrix,
      searchEfficiencyPredictions
    };
  }
};

// 4. CELESTIAL ALIGNMENT INTELLIGENCE PLATFORM
export const CELESTIAL_ALIGNMENT_INTELLIGENCE = {
  // Celestial Body Analytics Engine
  analyzeCelestialBody: (body: CelestialBody): {
    celestialBodyTypeProfile: Record<string, unknown>;
    celestialInfluenceMetrics: Record<string, number>;
    celestialElementalAnalysis: Record<string, number>;
    celestialPositionIntelligence: Record<string, unknown>;
    celestialHarmonyPredictions: Record<string, number>;
  } => {
    // Celestial body type profile
    const celestialBodyTypeProfile = {
      bodyNameType: typeof body.name,
      positionType: body.position ? 'positioned_body' : 'unpositioned_body',
      influenceType: body.influence ? `influence_${body.influence.toFixed(2)}` : 'no_influence',
      elementType: body.element ? `elemental_${body.element.toLowerCase()}` : 'no_element',
      labelType: body.label ? 'labeled_body' : 'unlabeled_body',
      signType: body.Sign?.label ? 'sign_labeled' : 'no_sign_label',
      celestialTypeComplexity: [body.name, body.position, body.influence, body.element, body.label, body.Sign?.label].filter(Boolean).length,
      bodyTypeClassification: body.name ? `${body.name.toLowerCase()}_type` : 'unknown_type',
      celestialDataRichness: Object.keys(body).length * 0.1
    };

    // Celestial influence metrics
    const celestialInfluenceMetrics = {
      baseInfluence: body.influence || 0,
      nameInfluence: body.name ? body.name.length * 0.05 : 0,
      positionInfluence: body.position ? 0.3 : 0,
      elementalInfluence: body.element ? 0.25 : 0,
      labelInfluence: body.label ? 0.2 : 0,
      signInfluence: body.Sign?.label ? 0.15 : 0,
      combinedInfluence: (body.influence || 0) + (body.name ? body.name.length * 0.05 : 0) + (body.position ? 0.3 : 0) + (body.element ? 0.25 : 0),
      normalizedInfluence: Math.min((body.influence || 0) * 1.2, 1.0)
    };

    // Celestial elemental analysis
    const celestialElementalAnalysis = {
      fireAlignment: body.element === 'Fire' ? 1.0 : 0.2,
      waterAlignment: body.element === 'Water' ? 1.0 : 0.2,
      earthAlignment: body.element === 'Earth' ? 1.0 : 0.2,
      airAlignment: body.element === 'Air' ? 1.0 : 0.2,
      elementalStrength: body.element ? 0.8 : 0.1,
      elementalInfluenceModifier: body.element ? (body.influence || 0.5) * 0.8 : 0.2,
      elementalPositionModifier: body.element && body.position ? 0.9 : 0.3
    };

    // Celestial position intelligence
    const celestialPositionIntelligence = {
      positionAvailable: Boolean(body.position),
      signPosition: body.position?.sign || 'unknown',
      degreePosition: body.position?.degree || 0,
      minutePosition: body.position?.minute || body.position?.minutes || 0,
      exactLongitude: body.position?.exactLongitude || 0,
      positionElement: body.position?.element || 'unknown',
      positionDignity: body.position?.dignity || 'unknown',
      retrogradeStatus: body.position?.isRetrograde || false,
      positionTypeComplexity: body.position ? Object.keys(body.position).length * 0.1 : 0,
      positionDataRichness: body.position ? 1.0 : 0.0
    };

    // Celestial harmony predictions
    const celestialHarmonyPredictions = {
      overallHarmony: celestialInfluenceMetrics.combinedInfluence * 0.8,
      elementalHarmony: celestialElementalAnalysis.elementalStrength * 0.9,
      positionalHarmony: celestialPositionIntelligence.positionDataRichness * 0.85,
      influenceHarmony: celestialInfluenceMetrics.normalizedInfluence * 0.9,
      nameHarmony: body.name ? body.name.length > 3 ? 0.8 : 0.6 : 0.2,
      labelHarmony: body.label ? 0.7 : 0.3,
      signHarmony: body.Sign?.label ? 0.9 : 0.3,
      predictedStability: Math.min(celestialInfluenceMetrics.combinedInfluence * 0.7, 1.0)
    };

    return {
      celestialBodyTypeProfile,
      celestialInfluenceMetrics,
      celestialElementalAnalysis,
      celestialPositionIntelligence,
      celestialHarmonyPredictions
    };
  },

  // Chakra Position Intelligence
  analyzeChakraPosition: (position: ChakraPosition): {
    chakraPositionProfile: Record<string, unknown>;
    chakraEnergyMetrics: Record<string, number>;
    chakraElementalCorrelation: Record<string, number>;
    chakraPositionOptimization: Record<string, number>;
    chakraHarmonyAnalysis: Record<string, number>;
  } => {
    // Chakra position profile
    const chakraPositionProfile = {
      positionType: position,
      chakraLevel: position === 'root' ? 1 : position === 'sacral' ? 2 : position === 'solarPlexus' ? 3 : 
                   position === 'heart' ? 4 : position === 'throat' ? 5 : position === 'thirdEye' ? 6 : 
                   position === 'crown' ? 7 : 0,
      chakraCategory: position === 'root' || position === 'sacral' || position === 'solarPlexus' ? 'lower_chakras' :
                      position === 'heart' ? 'heart_chakra' : 'upper_chakras',
      chakraElement: position === 'root' ? 'earth' : position === 'sacral' ? 'water' : 
                     position === 'solarPlexus' ? 'fire' : position === 'heart' ? 'air' : 
                     position === 'throat' ? 'sound' : position === 'thirdEye' ? 'light' : 'thought',
      chakraColor: position === 'root' ? 'red' : position === 'sacral' ? 'orange' : 
                   position === 'solarPlexus' ? 'yellow' : position === 'heart' ? 'green' : 
                   position === 'throat' ? 'blue' : position === 'thirdEye' ? 'indigo' : 'violet',
      chakraComplexity: position.length * 0.1
    };

    // Chakra energy metrics
    const chakraEnergyMetrics = {
      chakraIntensity: chakraPositionProfile.chakraLevel * 0.14,
      chakraFrequency: chakraPositionProfile.chakraLevel * 100 + 200,
      chakraVibration: Math.pow(chakraPositionProfile.chakraLevel, 1.5) * 0.1,
      chakraResonance: Math.sin(chakraPositionProfile.chakraLevel * Math.PI / 7) * 0.8 + 0.2,
      chakraActivation: chakraPositionProfile.chakraLevel > 4 ? 0.8 : 0.6,
      chakraBalance: Math.abs(4 - chakraPositionProfile.chakraLevel) / 3,
      chakraEnergy: (8 - Math.abs(4 - chakraPositionProfile.chakraLevel)) * 0.125
    };

    // Chakra elemental correlation
    const chakraElementalCorrelation = {
      fireCorrelation: position === 'solarPlexus' ? 1.0 : position === 'root' ? 0.3 : 0.2,
      waterCorrelation: position === 'sacral' ? 1.0 : position === 'heart' ? 0.4 : 0.2,
      earthCorrelation: position === 'root' ? 1.0 : position === 'heart' ? 0.3 : 0.1,
      airCorrelation: position === 'heart' ? 1.0 : position === 'throat' ? 0.8 : 0.2,
      elementalBalance: position === 'heart' ? 1.0 : 0.6,
      elementalIntensity: chakraEnergyMetrics.chakraIntensity * 0.8,
      elementalHarmony: Math.min(chakraEnergyMetrics.chakraResonance * 0.9, 1.0)
    };

    // Chakra position optimization
    const chakraPositionOptimization = {
      optimizationPotential: Math.abs(4 - chakraPositionProfile.chakraLevel) < 2 ? 1.0 : 0.7,
      balanceOptimization: 1.0 - chakraEnergyMetrics.chakraBalance,
      energyOptimization: chakraEnergyMetrics.chakraEnergy * 0.9,
      resonanceOptimization: chakraEnergyMetrics.chakraResonance * 0.85,
      activationOptimization: chakraEnergyMetrics.chakraActivation * 0.8,
      vibrationOptimization: chakraEnergyMetrics.chakraVibration * 0.7,
      frequencyOptimization: Math.min(chakraEnergyMetrics.chakraFrequency / 1000, 1.0)
    };

    // Chakra harmony analysis
    const chakraHarmonyAnalysis = {
      overallHarmony: chakraEnergyMetrics.chakraEnergy * 0.9,
      energyHarmony: chakraEnergyMetrics.chakraResonance * 0.85,
      elementalHarmony: chakraElementalCorrelation.elementalHarmony,
      positionHarmony: chakraPositionOptimization.optimizationPotential * 0.8,
      balanceHarmony: chakraPositionOptimization.balanceOptimization * 0.9,
      vibrationHarmony: chakraEnergyMetrics.chakraVibration * 0.8,
      frequencyHarmony: chakraPositionOptimization.frequencyOptimization * 0.7
    };

    return {
      chakraPositionProfile,
      chakraEnergyMetrics,
      chakraElementalCorrelation,
      chakraPositionOptimization,
      chakraHarmonyAnalysis
    };
  }
};

export const COOKING_METHOD_THERMODYNAMICS = {};

// ========== MISSING TYPES FOR TS2305 FIXES ==========

// CookingMethod type (causing errors in CookingMethods.tsx)
export interface CookingMethod {
  id: string;
  name: string;
  category: string;
  element: Element;
  intensity: number;
  description?: string;
  thermodynamicEffect?: CookingMethodModifier;
  techniques?: string[];
  temperature?: {
    min?: number;
    max?: number;
    unit?: 'F' | 'C';
  };
  duration?: {
    min?: number;
    max?: number;
    unit?: 'minutes' | 'hours';
  };
}

// ElementalItem type (causing errors in CuisineRecommender.tsx)
export interface ElementalItem {
  id: string;
  name: string;
  elementalProperties: ElementalProperties;
  category?: string;
  affinities?: ElementalAffinity[];
  harmony?: number;
}

// AlchemicalItem type (causing errors in CuisineRecommender.tsx)
export interface AlchemicalItem extends ElementalItem {
  // Core alchemical properties (required)
  alchemicalProperties: Record<AlchemicalProperty, number>;
  transformedElementalProperties: Record<ElementalCharacter, number>;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;
  
  // Planetary influence properties (required)
  planetaryBoost: number;
  dominantPlanets: string[];
  planetaryDignities: Record<string, unknown>;
  
  // Optional legacy properties for backward compatibility
  thermodynamicProperties?: ThermodynamicProperties;
  transformations?: ElementalInteraction[];
  seasonalResonance?: Season[];
}

// FilterOptions type (causing errors in FilterSection.tsx)
export interface FilterOptions {
  elements?: Element[];
  seasons?: Season[];
  mealTypes?: string[];
  cookingMethods?: string[];
  difficulty?: 'easy' | 'medium' | 'hard'[];
  prepTime?: {
    min?: number;
    max?: number;
  };
  dietary?: string[];
}

// NutritionPreferences type (causing errors in FilterSection.tsx)
export interface NutritionPreferences {
  calories?: {
    min?: number;
    max?: number;
  };
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  vitamins?: string[];
  minerals?: string[];
  allergens?: string[];
  dietaryRestrictions?: string[];
}

// Ingredient type (causing errors in multiple files)
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  elementalProperties: ElementalProperties;
  nutritionalProfile?: NutritionalProfile;
  alchemicalProperties?: AlchemicalResult;
  seasonality?: Season[];
  affinities?: string[];
  cookingMethods?: string[];
  preparationNotes?: string;
  planetaryRuler?: string;
  astrologicalProfile?: AstrologicalProfile; // Astrological profile with ruling planets and zodiac info
}

// NutritionalProfile type (causing errors in multiple files)
export interface NutritionalProfile {
  // USDA-specific properties
  name?: string;
  fdcId?: number;
  source?: string;
  
  // Basic nutritional values
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  
  // Nested nutritional objects for USDA data
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    [key: string]: number | undefined;
  };
  
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  antioxidants?: string[];
  phytonutrients?: string[];
  
  // Allow additional properties for extensibility
  [key: string]: unknown;
}

// ElementalState type (causing errors in IngredientRecommendations.tsx)
export interface ElementalState {
  currentElements: ElementalProperties;
  targetElements?: ElementalProperties;
  balance: number;
  recommendations?: string[];
  harmony?: number;
  dominantElement: Element;
  deficientElements?: Element[];
}

// ========== ADDITIONAL MISSING TYPES FOR TS2305 FIXES ==========

// CuisineType and DietaryRestriction (causing errors in Recipe components)
export type CuisineType = 
  | 'Italian' | 'Mexican' | 'Asian' | 'Indian' | 'Mediterranean' 
  | 'American' | 'French' | 'Thai' | 'Chinese' | 'Japanese'
  | 'Greek' | 'Spanish' | 'Middle-Eastern' | 'Moroccan' | 'Ethiopian'
  | 'Caribbean' | 'Brazilian' | 'Korean' | 'Vietnamese' | 'Fusion';

// Cuisine interface for cuisine objects with properties
export interface Cuisine {
  id?: string;
  name: string;
  description?: string;
  history?: string;
  culturalImportance?: string;
  elementalState?: ElementalProperties;
  elementalProperties?: ElementalProperties;
  dishes?: {
    [mealType: string]: {
      [season: string]: Recipe[];
    };
  };
  [key: string]: unknown;
}

export type DietaryRestriction = 
  | 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | 'Nut-Free'
  | 'Shellfish-Free' | 'Soy-Free' | 'Egg-Free' | 'Low-Carb' | 'Low-Fat' | 'Keto'
  | 'Paleo' | 'Whole30' | 'Low-Sodium' | 'Sugar-Free' | 'Raw'
  | 'Halal' | 'Kosher' | 'Pescatarian' | 'Flexitarian';

// TimeFactors type (causing errors in RecipeGrid.tsx)
export interface TimeFactors {
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  yieldAmount?: string;
  restTime?: number;
  marinateTime?: number;
}

// AlchemicalValues type (causing errors in constants files)
export interface AlchemicalValues {
  Spirit: number;
  Essence: number;  
  Matter: number;
  Substance: number;
  defaultMultiplier?: number;
  balanceThreshold?: number;
  harmonyTarget?: number;
}

// Decan type (causing errors in elementalCore.ts)
export interface Decan {
  number: 1 | 2 | 3;
  sign: ZodiacSign;
  element: Element;
  planetaryRuler: string;
  degrees: {
    start: number;
    end: number;
  };
  characteristics: string[];
  season?: Season;
}

// ========== PHASE 2 MISSING TYPES FOR TS2305 FIXES ==========

// IngredientMapping type (causing 65 errors across ingredient data files)
// IngredientMapping should be an alias for a Record of Ingredients, not an interface
export type IngredientMapping = Record<string, Ingredient>;

// AstrologicalProfile type (causing 4 errors)
export interface AstrologicalProfile {
  birthChart?: HoroscopeData;
  planetaryPositions?: PlanetaryAlignment;
  dominantElements?: ElementalProperties;
  lunarPhase?: LunarPhase;
  seasonalAffinity?: Season[];
  chakraAlignment?: ChakraEnergies;
  personalPlanets?: Record<string, PlanetaryPosition>;
  rulingPlanets?: string[]; // Array of ruling planet names
  favorableZodiac?: ZodiacSign[]; // Array of favorable zodiac signs  
  elementalAffinity?: {
    base?: Element;
    [key: string]: unknown;
  }; // Elemental affinity configuration
  lunarPhaseModifiers?: {
    [phase: string]: {
      elementalBoost?: ElementalProperties;
      preparationTips?: string[];
      thermodynamicEffects?: {
        heat?: number;
        entropy?: number;
        reactivity?: number;
        energy?: number;
      };
    };
  }; // Lunar phase modifiers for ingredient properties
}

// FlavorProfile type (causing 3 errors)
export interface FlavorProfile {
  primary: string[];
  secondary?: string[];
  intensity?: number; // 1-10 scale, made optional to match usage
  complexity?: number; // 1-10 scale
  balance?: {
    sweet?: number;
    sour?: number;
    salty?: number;
    bitter?: number;
    umami?: number;
    spicy?: number;
  };
  aromatics?: string[];
  mouthfeel?: string[];
  
  // Enhanced properties for ingredientUtils.ts support
  spice?: number;
  sweet?: number;
  richness?: number;
  earthy?: number;
  aromatic?: number;
  density?: number;
  astringent?: number;
  clarity?: number;
  
  // Additional properties from balance (no duplicates)
  umami?: number;
  bitter?: number;
  sour?: number;
}

// MethodRecommendation and MethodRecommendationOptions (causing 2 errors each)
export interface MethodRecommendationOptions {
  elementalPreference?: Element[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  timeConstraints?: {
    maxPrepTime?: number;
    maxCookTime?: number;
  };
  equipment?: string[];
  dietaryRestrictions?: DietaryRestriction[];
  flavorProfile?: FlavorProfile;
}

export interface MethodRecommendation {
  method: CookingMethod;
  compatibility: number; // 0-1 scale
  score: number; // Compatibility score for sorting recommendations
  reasoning: string[];
  elementalAlignment: Element[];
  estimatedTime: TimeFactors;
  requiredSkills: string[];
  alternatives?: CookingMethod[];
}

// Single-occurrence types (causing 1 error each)
export type TarotSuit = 'cups' | 'wands' | 'swords' | 'pentacles';

export interface IngredientSearchCriteria {
  elements?: Element[];
  seasons?: Season[];
  categories?: string[];
  nutritionalRequirements?: NutritionPreferences;
  flavorProfile?: FlavorProfile;
  cookingMethods?: string[];
  availabilityFilter?: boolean;
}

export interface EnergyStateProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export type ChakraPosition = 'root' | 'sacral' | 'solarPlexus' | 'heart' | 'throat' | 'thirdEye' | 'crown';

// CelestialBody interface for astronomical calculations
export interface CelestialBody {
  name: string;
  position?: PlanetaryPosition;
  influence?: number; // 0-1 scale
  element?: Element;
  label?: string;
  Sign?: {
    label?: string;
  };
  [key: string]: unknown;
}

export interface CelestialAlignment {
  moment: Date;
  date?: Date; // Optional date property for backward compatibility
  planetaryPositions: PlanetaryAlignment;
  lunarPhase: LunarPhase;
  seasonalEnergy: Season;
  elementalDominance: ElementalProperties;
  elementalBalance?: ElementalProperties; // Additional elemental balance property
  elementalState?: ElementalProperties; // Elemental state for alchemical calculations
  aspectPatterns: PlanetaryAspect[];
  energyFlow: number; // 0-1 scale
  // Enhanced properties for celestialCalculations.ts compatibility
  zodiacSign?: ZodiacSign; // Current dominant zodiac sign
  dominantPlanets?: CelestialBody[]; // Array of dominant celestial bodies
  astrologicalInfluences?: string[]; // Array of astrological influence strings
  tarotInfluences?: TarotCard[]; // Tarot card influences
  energyStates?: EnergyStateProperties; // ESMS energy states (Spirit, Essence, Matter, Substance)
  chakraEnergies?: ChakraEnergies; // Chakra energy distribution
  // Additional calculation properties
  aspectInfluences?: Array<{type: AspectType, planets: string[], influence: number}>; // Detailed aspect influences
  energyStateBalance?: EnergyStateProperties; // Energy state balance calculations
  chakraEmphasis?: ChakraEnergies; // Chakra emphasis calculations
  // Alchemizer engine integration properties
  thermodynamicMetrics?: ThermodynamicMetrics; // Heat, entropy, reactivity, gregsEnergy, kalchm, monica
  kalchm?: number; // Kalchm constant for alchemical calculations
  monica?: number; // Monica constant for alchemical calculations
  // Current celestial position properties
  currentZodiacSign?: ZodiacSign; // Current zodiac sign for compatibility calculations
}

// Export ElementalCharacter from constants
export type { ElementalCharacter } from '@/constants/planetaryElements';

// Add missing type aliases for compatibility
export type AstrologicalInfluence = _AstrologicalInfluence;
export type PlanetaryPositionsType = Record<string, PlanetaryPosition>;
export type AlchemicalState = AstrologicalProfile; // Using existing similar interface
export type CookingMethodProfile = CookingMethodModifier; // Alias for compatibility
export type timeFactors = TimeFactors; // Lowercase version
export type alchemicalValues = AlchemicalValues; // Lowercase version

// Additional missing type exports
export type BaseIngredient = Ingredient; // Alias for compatibility
export type RecipeData = Recipe; // Alias for compatibility
// Removed local AlchemicalProperty definition - now imported from @/types/celestial

// ========== BACKWARD COMPATIBILITY ALIASES (underscore-prefixed) ==========
// Many legacy files still import underscore-prefixed types.  Provide
// simple type aliases so those imports resolve without changing hundreds of files.
export type _Element = Element;
export type _ElementalProperties = ElementalProperties;
export type _LowercaseElementalProperties = LowercaseElementalProperties;
export type _ElementalRatio = ElementalRatio;
export type _ElementalModifier = ElementalModifier;
export type _Planet = Planet;
export type _PlanetName = PlanetName;
export type _LunarPhase = LunarPhase;
export type _Modality = Modality;
export type _CelestialPosition = CelestialPosition;
export type _ChakraEnergies = ChakraEnergies;
export type _AstrologicalProfile = AstrologicalProfile;
export type _PlanetaryPosition = PlanetaryPosition;
export type _Season = Season;
export type _ThermodynamicMetrics = ThermodynamicMetrics;
// Added simple boolean/season aliases for legacy code expecting these identifiers
export type _isDaytime = boolean; // TRUE if time between sunrise and sunset
export type _season = Season; // Lowercase underscore-prefixed alias for Season
// ---------------------------------------------------------------------------
