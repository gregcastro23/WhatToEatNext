// src/types/alchemy.ts

// Base Elemental Types
export type Element = 'Fire' | 'Water' | 'Air' | 'Earth';

export interface ElementalProperties {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

// Astrological Types
export type LunarPhase = 
  | 'new_moon' 
  | 'waxing_crescent' 
  | 'first_quarter' 
  | 'waxing_gibbous'
  | 'full_moon' 
  | 'waning_gibbous' 
  | 'last_quarter' 
  | 'waning_crescent';

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface AstrologicalState {
  lunarPhase: LunarPhase;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
}

// Cooking and Recipe Types
export type CookingMethod = 
  | 'baking' 
  | 'boiling' 
  | 'frying' 
  | 'steaming' 
  | 'raw'
  | 'roasting'
  | 'braising'
  | 'grilling';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  element: Element;
  category?: string;
  elementalProperties?: ElementalProperties;
  swaps?: string[];
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
  tags?: string[];
  season?: string[];
  nutrition?: NutritionalInfo;
  mealType?: string[];
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: string[];
  minerals?: string[];
}

// Calculation Types
export interface CombinationResult {
  resultingProperties: ElementalProperties;
  stability: number;
  potency: number;
  dominantElement: Element;
  warnings: string[];
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface TemperatureEffect {
  range: {
    min: number;
    max: number;
  };
  elementalEffect: ElementalProperties;
}

// Component Props
export interface RecipeCardProps {
  recipe: Recipe;
  score: number;
  elements: ElementalProperties;
  dominantElements: [Element, number][];
  isExpanded?: boolean;
  onToggle?: () => void;
  currentSign?: ZodiacSign;
  currentSeason?: Season;
}

export interface RecipeCalculatorProps {
  onCalculate: (result: ElementalProperties) => void;
  initialBalance?: ElementalProperties;
}

export interface RecipeRecommendationsProps {
  filters: {
    servingSize: string;
    dietaryPreference: string;
    cookingTime: string;
  };
}

// State Management
export interface AlchemicalState {
  elementalBalance: ElementalProperties;
  season: Season;
  astrologicalState: AstrologicalState;
  currentTime: Date;
  elementalPreference: ElementalProperties;
}

export type AlchemicalAction = 
  | { type: 'UPDATE_ELEMENTS'; payload: ElementalProperties }
  | { type: 'SET_SEASON'; payload: Season }
  | { type: 'UPDATE_LUNAR_PHASE'; payload: LunarPhase }
  | { type: 'UPDATE_SUN_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_MOON_SIGN'; payload: ZodiacSign }
  | { type: 'UPDATE_ASTROLOGICAL_STATE'; payload: AstrologicalState };

// Additional Properties
export interface ElementalInfluence {
  lunarPhaseStrength: number;
  sunSignStrength: number;
  moonSignStrength: number;
}

export interface CookingMethodProperties {
  elementalEffect: ElementalProperties;
  suitable_for: string[];
  benefits: string[];
  duration: {
    min: number;
    max: number;
  };
}

export interface FlavorProfile {
  elementalProperties: ElementalProperties;
  taste: string[];
  intensity: number;
  pairings: string[];
  seasonalPeak?: Season[];
  description: string;
}

// Filter Types
export interface FilterOptions {
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  time: {
    quick: boolean;
    medium: boolean;
    long: boolean;
  };
  spice: {
    mild: boolean;
    medium: boolean;
    spicy: boolean;
  };
  temperature: {
    hot: boolean;
    cold: boolean;
  };
}

export interface NutritionPreferences {
  lowCalorie: boolean;
  highProtein: boolean;
  lowCarb: boolean;
}

// Helper Types
export type ElementalRatio = Record<Element, number>;
export type ElementalModifier = Partial<Record<Element, number>>;
export type CookingDuration = 'quick' | 'medium' | 'long';
export type SpiceLevel = 'mild' | 'medium' | 'spicy';
export type Temperature = 'hot' | 'cold';