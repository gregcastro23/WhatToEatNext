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

// ========== ASTROLOGICAL TYPES ==========

export type LunarPhase = 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';

export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  element?: string;
  dignity?: string;
}

export interface PlanetaryAlignment {
  sun: PlanetaryPosition;
  moon: PlanetaryPosition;
  mercury: PlanetaryPosition;
  venus: PlanetaryPosition;
  mars: PlanetaryPosition;
  jupiter: PlanetaryPosition;
  saturn: PlanetaryPosition;
  uranus: PlanetaryPosition;
  neptune: PlanetaryPosition;
  pluto: PlanetaryPosition;
  [key: string]: PlanetaryPosition; // Allow indexing with string
}

export interface PlanetaryHarmony {
  [key: string]: Record<Planet, number>;
  sun: Record<Planet, number>;
  moon: Record<Planet, number>;
  mercury: Record<Planet, number>;
  venus: Record<Planet, number>;
  mars: Record<Planet, number>;
  jupiter: Record<Planet, number>;
  saturn: Record<Planet, number>;
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

// Define PlanetaryAspect
export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  strength: number;
  planets?: string[];
  influence?: number;
  additionalInfo?: Record<string, any>;
}

// Define Dignity type
export type DignityType = 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Neutral';

export interface AstrologicalState {
  currentZodiac: ZodiacSign;
  moonPhase: LunarPhase;
  currentPlanetaryAlignment: Record<string, CelestialPosition>;
  activePlanets: string[];
  planetaryPositions: Record<string, any>;
  lunarPhase: LunarPhase;
  zodiacSign: ZodiacSign;
  planetaryHours: Planet;
  astrologicalInfluences?: AstrologicalInfluence[];
  aspects?: PlanetaryAspect[];
  
  // Add these properties to support both usages
  date?: string;
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  dominantPlanets?: string[];
  planetaryAspects?: string[];
}

// ========== THERMODYNAMIC TYPES ==========

// Basic thermodynamic properties used in astrologyUtils
export interface BasicThermodynamicProperties {
  heat: number;      // 0-1: cold to hot
  entropy: number;   // 0-1: ordered to chaotic
  reactivity: number; // 0-1: stable to reactive
}

// Expanded thermodynamic properties used elsewhere
export interface ThermodynamicProperties {
  heat: number;       // Rate of thermal energy transfer to ingredients
  entropy: number;    // Degree of structural breakdown in ingredients
  reactivity: number; // Rate of chemical interactions between ingredients
  energy: number;     // Overall energy transfer efficiency
}

export interface EnergyStateProps extends BasicThermodynamicProperties {
  resonance: number; // 0-1: How well energies harmonize
  potential: number; // 0-1: Stored energetic potential
}

export interface EnergySuitability {
  morning: number;
  noon: number;
  evening: number;
  night: number;
  seasonMultipliers: Record<Season, number>;
}

// ========== COOKING & RECIPE TYPES ==========

export type CookingMethod = 
  | 'baking' 
  | 'boiling' 
  | 'roasting' 
  | 'steaming' 
  | 'frying' 
  | 'grilling' 
  | 'sauteing' 
  | 'simmering' 
  | 'poaching' 
  | 'braising' 
  | 'stir-frying'
  | 'fermenting'
  | 'pickling'
  | 'curing'
  | 'infusing'
  | 'distilling'
  | 'raw'
  | 'fermentation'
  | 'smoking'
  | 'sous_vide'
  | 'pressure_cooking'
  | 'spherification'
  | 'cryo_cooking'
  | 'emulsification'
  | 'gelification'
  | 'broiling';

export interface CookingTime {
  preparation: number; // minutes
  cooking: number; // minutes
  resting: number; // minutes
  total: number; // minutes
  planetaryWindows?: {
    optimal: Planet[];
    timing: string;
  };
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  element: Element;
  category?: string;
  elementalProperties?: ElementalProperties;
  energyValues?: ThermodynamicProperties;
  planetaryRuler?: Planet;
  swaps?: string[];
  seasonality?: Season[];
  nutritionalProfile?: NutritionalProfile;
  nutritionalScore?: number;
}

export interface EnhancedIngredient extends Ingredient {
  foodGroup: string;
  foodType: string;
  alchemy: {
    day: number[]; // [heat, entropy, reactivity]
    night: number[]; // [heat, entropy, reactivity]
  };
  processingEffects: Record<CookingMethod, ElementalModifier>;
  alchemicalActions: ('dissolve' | 'coagulate' | 'calcine' | 'ferment')[];
  nutritionalImpact?: {
    elementalBoost: ElementalProperties;
    energyModifier: number;
  };
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  ingredients: Ingredient[];
  cookingMethod: CookingMethod;
  timeToMake: number;
  servings: number;
  elementalProperties?: ElementalProperties;
  energyProfile?: ThermodynamicProperties;
  tags?: string[];
  season?: string[];
  nutrition?: NutritionalInfo;
  mealType?: string[];
  astrologicalAffinities?: {
    planets: Planet[];
    signs: ZodiacSign[];
    lunarPhases: LunarPhase[];
  };
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: string[];
  minerals?: string[];
}

export interface PreparationMethod {
  name: string;
  element: Element;
  planetaryRuler: Planet;
  energyEffects: ThermodynamicProperties;
  timing: {
    optimal: Planet[];
    acceptable: Planet[];
    avoid: Planet[];
  };
  cookingMethod: CookingMethod;
  techniqueTips: string[];
  seasonalModifiers: Record<Season, number>;
}

// ========== FOOD ALCHEMY TYPES ==========

export type EffectType = 'enhance' | 'balance' | 'subtle' | 'transform' | 'harmonize' | 'potentiate' | 'diminish';

export interface CombinationEffect {
  name?: string;
  description?: string;
  ingredients?: string[];
  type?: EffectType;
  effect: EffectType;
  strength?: number;
  modifier: number;
  notes?: string;
  elements?: Partial<ElementalProperties>;
  conditions?: {
    cookingMethod?: string[];
    season?: string[];
    temperature?: string[];
    lunarPhase?: LunarPhase[];
  };
}

export interface FoodCorrespondence {
  food: string;
  foodGroup: string;
  foodType: string;
  element: Element;
  planet: Planet;
  alchemy: {
    day: number[];
    night: number[];
  };
  energyValues: ThermodynamicProperties;
  affinities?: string[];
  contraindications?: string[];
}

export interface FoodCompatibility {
  score: number;
  recommendations: string[];
  warnings: string[];
  preparationMethods: PreparationMethod[];
  elementalHarmony: number;
  planetaryAlignment: number;
  seasonalAlignment: number;
}

export interface SystemState {
  elements: Record<Element, number>;
  metrics: ThermodynamicProperties;
  currentSeason: Season;
  dominantElement: Element;
  astrologicalState: AstrologicalState;
}

// ========== CALCULATION TYPES ==========

export interface CombinationResult {
  resultingProperties: ElementalProperties;
  energyState: ThermodynamicProperties;
  stability: number;
  potency: number;
  dominantElement: Element;
  warnings: string[];
  alchemicalRecommendations: string[];
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export interface TemperatureEffect {
  range: {
    min: number;
    max: number;
  };
  elementalEffect: ElementalProperties;
  thermodynamicEffect: ThermodynamicProperties;
}

export interface ElementalTransformation {
  initial: ElementalProperties;
  cooking: CookingMethod;
  duration: number;
  temperature: number;
  result: ElementalProperties;
  energyChange: ThermodynamicProperties;
}

export interface CookingFormula {
  baseIngredients: string[];
  method: CookingMethod;
  elementalRatios: ElementalProperties;
  timeCoefficient: number;
  planetaryBoosts: Partial<Record<Planet, number>>;
  result: {
    elementalProperties: ElementalProperties;
    energyState: ThermodynamicProperties;
  };
}

// ========== STATE MANAGEMENT ==========

export interface AlchemicalState {
  elementalState: ElementalProperties;
  energyState: ThermodynamicProperties;
  season: Season;
  astrologicalState: AstrologicalState;
  currentTime: Date;
  elementalPreference: ElementalProperties;
  planetaryHour: Planet;
}

export type AlchemicalAction = 
  | { type: 'UPDATE_ELEMENTS'; payload: ElementalProperties }
  | { type: 'UPDATE_ENERGY_STATE'; payload: ThermodynamicProperties }
  | { type: 'SET_SEASON'; payload: Season }
  | { type: 'UPDATE_LUNAR_PHASE'; payload: LunarPhase }
  | { type: 'UPDATE_SUN_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_MOON_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_PLANETARY_HOUR'; payload: Planet }
  | { type: 'UPDATE_ASTROLOGICAL_STATE'; payload: AstrologicalState };

// ========== ADDITIONAL PROPERTIES ==========

export interface ElementalInfluence {
  lunarPhaseStrength: number;
  sunSignStrength: number;
  moonSignStrength: number;
  planetaryHourStrength: number;
}

export interface CookingMethodProperties {
  elementalEffect: ElementalProperties;
  energeticEffect: ThermodynamicProperties;
  suitable_for: string[];
  benefits: string[];
  duration: {
    min: number;
    max: number;
  };
  planetaryRulers: Planet[];
}

export interface FlavorProfile {
  elementalProperties: ElementalProperties;
  taste: string[];
  intensity: number;
  pairings: string[];
  seasonalPeak?: Season[];
  description: string;
  thermodynamicProperties: ThermodynamicProperties;
  astrologicalSignature?: {
    planets: Planet[];
    signs: ZodiacSign[];
  };
}

// ========== MAPPING & HELPER TYPES ==========

export interface IngredientMapping {
  name: string;
  elementalProperties: ElementalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: ZodiacSign[];
    elementalAffinity?: string | {
      base: string;
      secondary?: string;
      decanModifiers?: {
        first?: { element: string; planet: string };
        second?: { element: string; planet: string };
        third?: { element: string; planet: string };
      };
    };
    lunarPhaseModifiers?: Record<string, any>;
  };
  qualities?: string[];
  origin?: string[];
  category?: string;
  subCategory?: string;
  varieties?: Record<string, any>;
  culinaryApplications?: Record<string, any>;
  seasonalAdjustments?: Record<string, any>;
  
  // Add missing properties
  regionalPreparations?: Record<string, any>;
  preparation?: Record<string, any>;
  storage?: Record<string, any>;
  
  // Food alchemy specific properties
  alchemicalProperties?: {
    day: ThermodynamicProperties;
    night: ThermodynamicProperties;
    transformations: Record<CookingMethod, ElementalModifier>;
  };
  
  // Allow additional properties
  [key: string]: any;
}

export interface PlanetaryFoodAssociation {
  planet: Planet;
  foods: string[];
  qualities: string[];
  cookingMethods: CookingMethod[];
  elementalAffinities: Element[];
  boostTimes: {
    dayOfWeek: number;
    hourOfDay: number[];
  };
}

export interface AlchemicalPairingMatrix {
  [ingredientA: string]: {
    [ingredientB: string]: {
      harmony: number;
      potentiation: number;
      transformation: string | null;
      notes: string;
    }
  }
}

export interface AlchemicalCalculationResult {
  score: number;
  elementalMatch: number;
  seasonalMatch: number;
  astrologicalMatch: number;
  dominantElement: keyof ElementalProperties;
  recommendations: string[];
  warnings: string[];
}

export interface RecipeHarmonyResult extends AlchemicalCalculationResult {
  recipeSpecificBoost: number;
  optimalTimingWindows: string[];
  elementalMultipliers: Record<string, number>;
}

// ========== COMPONENT PROPS ==========

export interface RecipeCardProps {
  recipe: Recipe;
  score: number;
  elements: ElementalProperties;
  energyState: ThermodynamicProperties;
  dominantElements: [Element, number][];
  isExpanded?: boolean;
  onToggle?: () => void;
  currentSign?: ZodiacSign;
  currentSeason?: Season;
  planetaryHour?: Planet;
}

export interface RecipeCalculatorProps {
  onCalculate: (result: CombinationResult) => void;
  initialState?: ElementalProperties;
  initialEnergyState?: ThermodynamicProperties;
}

export interface RecipeRecommendationsProps {
  filters: {
    servingSize: string;
    dietaryPreference: string;
    cookingTime: string;
    elementalFocus?: Element;
    planetaryInfluence?: Planet;
  };
  astrologicalState: AstrologicalState;
}

export interface CookingTimerProps {
  method: CookingMethod;
  duration: number;
  planetaryHour: Planet;
  optimalPlanets: Planet[];
  onCompletion: () => void;
}

export interface AstrologicalFoodCalendarProps {
  month: number;
  year: number;
  onDateSelect: (date: Date, astroState: AstrologicalState) => void;
  favoredFoods: Record<string, string[]>;
}

// Define the planetary harmony matrix based on your Food Alchemy System
export const PLANETARY_HARMONY_MATRIX: PlanetaryHarmony = {
  sun: {
    sun: 1.0, moon: -0.5, mercury: 0.3, venus: 0.4, mars: 0.6,
    jupiter: 0.8, saturn: -0.3, uranus: 0.2, neptune: 0.1, pluto: 0.5
  },
  moon: {
    sun: -0.5, moon: 1.0, mercury: 0.4, venus: 0.6, mars: -0.4,
    jupiter: 0.5, saturn: -0.2, uranus: -0.3, neptune: 0.7, pluto: 0.2
  },
  mercury: {
    sun: 0.3, moon: 0.4, mercury: 1.0, venus: 0.7, mars: 0.3,
    jupiter: 0.4, saturn: 0.5, uranus: 0.6, neptune: 0.3, pluto: 0.4
  },
  venus: {
    sun: 0.4, moon: 0.6, mercury: 0.7, venus: 1.0, mars: -0.3,
    jupiter: 0.6, saturn: 0.2, uranus: 0.1, neptune: 0.5, pluto: 0.0
  },
  mars: {
    sun: 0.6, moon: -0.4, mercury: 0.3, venus: -0.3, mars: 1.0,
    jupiter: 0.4, saturn: 0.3, uranus: 0.5, neptune: -0.2, pluto: 0.7
  },
  jupiter: {
    sun: 0.8, moon: 0.5, mercury: 0.4, venus: 0.6, mars: 0.4,
    jupiter: 1.0, saturn: -0.2, uranus: 0.3, neptune: 0.4, pluto: 0.2
  },
  saturn: {
    sun: -0.3, moon: -0.2, mercury: 0.5, venus: 0.2, mars: 0.3,
    jupiter: -0.2, saturn: 1.0, uranus: 0.4, neptune: 0.3, pluto: 0.6
  }
};

// Elemental associations for planets
export const PLANET_ELEMENT_MAPPING: Record<Planet, Element> = {
  sun: 'Fire',
  moon: 'Water',
  mercury: 'Air',
  venus: 'Earth',
  mars: 'Fire',
  jupiter: 'Air',
  saturn: 'Earth',
  uranus: 'Air',
  neptune: 'Water',
  pluto: 'Earth'
};

// Cooking method elemental associations
export const COOKING_METHOD_ELEMENTS: Record<CookingMethod, Element> = {
  'roasting': 'Fire',
  'grilling': 'Fire',
  'baking': 'Earth',
  'boiling': 'Water',
  'fermenting': 'Water',
  'pickling': 'Water',
  'curing': 'Air',
  'infusing': 'Water',
  'distilling': 'Fire',
  'steaming': 'Water',
  'frying': 'Fire',
  'raw': 'Air',
  'braising': 'Water',
  'fermentation': 'Water',
  'smoking': 'Air',
  'sous_vide': 'Water',
  'pressure_cooking': 'Water',
  'spherification': 'Water',
  'cryo_cooking': 'Air',
  'emulsification': 'Water',
  'gelification': 'Earth',
  'broiling': 'Fire',
  'stir-frying': 'Fire',
  'sauteing': 'Fire',
  'simmering': 'Water',
  'poaching': 'Water'
};

// Add the thermodynamic effects for cooking methods
export const COOKING_METHOD_THERMODYNAMICS: Record<CookingMethod, BasicThermodynamicProperties> = {
  'roasting': { heat: 0.8, entropy: 0.4, reactivity: 0.6 },
  'grilling': { heat: 0.9, entropy: 0.5, reactivity: 0.7 },
  'baking': { heat: 0.6, entropy: 0.3, reactivity: 0.4 },
  'boiling': { heat: 0.7, entropy: 0.6, reactivity: 0.5 },
  'fermenting': { heat: 0.2, entropy: 0.8, reactivity: 0.7 },
  'pickling': { heat: 0.3, entropy: 0.7, reactivity: 0.6 },
  'curing': { heat: 0.4, entropy: 0.6, reactivity: 0.5 },
  'infusing': { heat: 0.3, entropy: 0.5, reactivity: 0.4 },
  'distilling': { heat: 0.8, entropy: 0.7, reactivity: 0.6 },
  'steaming': { heat: 0.3, entropy: 0.5, reactivity: 0.4 },
  'frying': { heat: 0.9, entropy: 0.7, reactivity: 0.8 },
  'raw': { heat: 0.1, entropy: 0.2, reactivity: 0.3 },
  'braising': { heat: 0.5, entropy: 0.6, reactivity: 0.4 },
  'fermentation': { heat: 0.2, entropy: 0.8, reactivity: 0.7 },
  'smoking': { heat: 0.4, entropy: 0.7, reactivity: 0.5 },
  'sous_vide': { heat: 0.3, entropy: 0.2, reactivity: 0.3 },
  'pressure_cooking': { heat: 0.7, entropy: 0.5, reactivity: 0.6 },
  'spherification': { heat: 0.2, entropy: 0.4, reactivity: 0.5 },
  'cryo_cooking': { heat: 0.1, entropy: 0.3, reactivity: 0.4 },
  'emulsification': { heat: 0.3, entropy: 0.6, reactivity: 0.5 },
  'gelification': { heat: 0.2, entropy: 0.5, reactivity: 0.3 },
  'broiling': { heat: 0.8, entropy: 0.6, reactivity: 0.7 },
  'stir-frying': { heat: 0.9, entropy: 0.6, reactivity: 0.8 },
  'sauteing': { heat: 0.9, entropy: 0.6, reactivity: 0.8 },
  'simmering': { heat: 0.3, entropy: 0.5, reactivity: 0.4 },
  'poaching': { heat: 0.3, entropy: 0.5, reactivity: 0.4 }
};

// Lunar phase effect multipliers
export const LUNAR_PHASE_MULTIPLIERS: Record<LunarPhase, BasicThermodynamicProperties> = {
  'new moon': { heat: 0.7, entropy: 0.5, reactivity: 0.6 },
  'waxing crescent': { heat: 0.8, entropy: 0.6, reactivity: 0.7 },
  'first quarter': { heat: 0.9, entropy: 0.7, reactivity: 0.8 },
  'waxing gibbous': { heat: 1.0, entropy: 0.8, reactivity: 0.9 },
  'full moon': { heat: 1.1, entropy: 1.0, reactivity: 1.0 },
  'waning gibbous': { heat: 0.9, entropy: 0.9, reactivity: 0.8 },
  'last quarter': { heat: 0.8, entropy: 0.8, reactivity: 0.7 },
  'waning crescent': { heat: 0.7, entropy: 0.6, reactivity: 0.6 }
};

// Add new type definitions for elemental state
export interface TemporalInfluence {
  timestamp: Date;
  planetaryAlignment: PlanetaryAlignment;
  lunarPhase: LunarPhase;
  seasonalModifier: number;
}

export interface AstrologicalInfluence {
  name: string;
  description: string;
  favorableZodiac: ZodiacSign[];
  unfavorableZodiac: ZodiacSign[];
  rulingPlanets: string[];
  astrologicalInfluences?: string[];
}

// Define the missing ElementalAffinity interface
export interface ElementalAffinity {
  primaryElement: Element;
  secondaryElement?: Element;
  elementalBalance: ElementalProperties;
  transformationPotential: Record<Element, number>;
}

// Update ElementalState interface
export interface ElementalState {
  fire: number;
  water: number;
  air: number;
  earth: number;
  timestamp: Date;
  currentStability: number;
  planetaryAlignment: PlanetaryAlignment;
  astrologicalInfluences?: AstrologicalInfluence[];
  temporalInfluences?: TemporalInfluence[];
}

// Add CelestialPosition type
export interface CelestialPosition {
  sign: ZodiacSign;
  degree: number;
  minutes?: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
  speed?: number;
  dignity?: DignityType;
}

// Add energy state mapping for cooking methods
export const COOKING_METHOD_ENERGY_STATES: Record<CookingMethod, EnergyStateProperties> = {
  'roasting': { Spirit: 0.7, Substance: 0.4, Essence: 0.6, Matter: 0.5 },
  'grilling': { Spirit: 0.8, Substance: 0.3, Essence: 0.7, Matter: 0.4 },
  'baking': { Spirit: 0.5, Substance: 0.7, Essence: 0.4, Matter: 0.8 },
  'boiling': { Spirit: 0.3, Substance: 0.8, Essence: 0.5, Matter: 0.7 },
  'fermenting': { Spirit: 0.6, Substance: 0.5, Essence: 0.8, Matter: 0.3 },
  'pickling': { Spirit: 0.4, Substance: 0.6, Essence: 0.7, Matter: 0.5 },
  'curing': { Spirit: 0.5, Substance: 0.7, Essence: 0.4, Matter: 0.8 },
  'infusing': { Spirit: 0.8, Substance: 0.4, Essence: 0.7, Matter: 0.3 },
  'distilling': { Spirit: 0.9, Substance: 0.2, Essence: 0.8, Matter: 0.1 },
  'steaming': { Spirit: 0.6, Substance: 0.5, Essence: 0.7, Matter: 0.4 },
  'frying': { Spirit: 0.4, Substance: 0.6, Essence: 0.5, Matter: 0.8 },
  'raw': { Spirit: 0.9, Substance: 0.3, Essence: 0.8, Matter: 0.2 },
  'braising': { Spirit: 0.4, Substance: 0.7, Essence: 0.6, Matter: 0.6 },
  'fermentation': { Spirit: 0.6, Substance: 0.5, Essence: 0.8, Matter: 0.3 },
  'smoking': { Spirit: 0.7, Substance: 0.3, Essence: 0.6, Matter: 0.5 },
  'sous_vide': { Spirit: 0.5, Substance: 0.6, Essence: 0.7, Matter: 0.4 },
  'pressure_cooking': { Spirit: 0.3, Substance: 0.7, Essence: 0.5, Matter: 0.8 },
  'spherification': { Spirit: 0.7, Substance: 0.4, Essence: 0.8, Matter: 0.2 },
  'cryo_cooking': { Spirit: 0.8, Substance: 0.3, Essence: 0.6, Matter: 0.5 },
  'emulsification': { Spirit: 0.6, Substance: 0.5, Essence: 0.7, Matter: 0.4 },
  'gelification': { Spirit: 0.5, Substance: 0.7, Essence: 0.6, Matter: 0.5 },
  'broiling': { Spirit: 0.7, Substance: 0.4, Essence: 0.6, Matter: 0.5 },
  'stir-frying': { Spirit: 0.6, Substance: 0.5, Essence: 0.7, Matter: 0.4 },
  'sauteing': { Spirit: 0.6, Substance: 0.5, Essence: 0.6, Matter: 0.5 },
  'simmering': { Spirit: 0.4, Substance: 0.7, Essence: 0.6, Matter: 0.5 },
  'poaching': { Spirit: 0.5, Substance: 0.6, Essence: 0.7, Matter: 0.4 }
};

// Add type guard for element keys
export type ElementKey = keyof ElementalProperties;

// Add helper type for element access
export type ElementalValues = {
  [K in ElementKey]: number;
};

interface ElementalItem {
  id: string;
  name: string;
  elementalProperties: ElementalProperties;
  nutritionalProfile?: NutritionalProfile;
  category?: string;
  astrologicalProfile?: AstrologicalProfile;
  // ... other existing properties
}

export interface CuisineType {
  name: string;
  description: string;
  elementalState: ElementalProperties;
  // Add other properties based on your data model
}

// Add missing type definitions
export interface NutritionalProfile {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins: string[];
  minerals: string[];
}

// Define the missing AstrologicalProfile interface
export interface AstrologicalProfile {
  zodiacSign?: ZodiacSign;
  planetaryRuler?: string;
  elementalAffinities?: ElementalAffinity[];
}

// Replace traditional season with zodiac-based seasons
export type ZodiacSeason = ZodiacSign;

// Tarot-related types
export interface TarotCard {
  name: string;
  suit: string;
  value: number;
  description: string;
  meaning: {
    upright: string[];
    reversed: string[];
  };
  elementalAssociation?: Element;
  zodiacAssociation?: ZodiacSign;
  planetaryAssociation?: string;
}

export interface TarotCards {
  minor: TarotCard;
  major: TarotCard;
  planetaryCards?: Record<string, TarotCard>;
}

export type ChakraPosition = 'root' | 'sacral' | 'solar plexus' | 'heart' | 'throat' | 'brow' | 'crown';
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles' | 'major';
export type EnergyState = 'Spirit' | 'Substance' | 'Essence' | 'Matter';

export interface EnergyStateProperties {
  Spirit: number;
  Substance: number;
  Essence: number;
  Matter: number;
  [key: string]: number;
}

export interface ChakraEnergies {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  brow: number;
  crown: number;
  [key: string]: number;
}

export interface FreeEnergyComponents {
  entropy: number;
  enthalpy: number;
  heat: number;
  reactivity: number;
}

export interface CelestialBody {
  name: string;
  influence: number;
}

export interface CelestialAlignment {
  date: string;
  zodiacSign: ZodiacSign;
  dominantPlanets: CelestialBody[];
  lunarPhase: string;
  elementalBalance: ElementalProperties;
  aspectInfluences: PlanetaryAspect[];
  astrologicalInfluences: string[];
  energyStateBalance?: EnergyStateProperties;
  chakraEmphasis?: ChakraEnergies;
}

export interface ElementalProfile {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

// ========== ASTROLOGY CALCULATION TYPES ==========

export interface AstrologicalEffects {
  dignity: LowercaseElementalProperties;
  aspect: LowercaseElementalProperties;
  stellium: LowercaseElementalProperties;
  house: Record<string, number>;
  joy: LowercaseElementalProperties;
}

export interface ZodiacPosition {
  sign: ZodiacSign;
  degree: number;
}