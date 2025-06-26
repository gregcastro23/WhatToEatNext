import type { 
  IngredientCategory, 
  SensoryProfile, 
  CookingMethod, 
  AlchemicalProperties, 
  ThermodynamicProperties,
  Modality 
} from '@/data/ingredients/types';
import type { ElementalProperties } from './alchemy';
import type { ZodiacSign, LunarPhase, PlanetaryAlignment } from './astrology';

// Re-export commonly used types for convenience
export type { ElementalProperties } from './alchemy';
export type { ZodiacSign, LunarPhase, PlanetaryAlignment } from './astrology';

export interface Ingredient {
  id?: string;
  name: string;
  description?: string;
  category: IngredientCategory;
  
  // Missing properties extensively used in data files
  qualities: string[];
  storage?: string | {
    container?: string;
    duration: string;
    temperature?: string | {
      fahrenheit: number;
      celsius: number;
    };
    notes?: string;
  };
  
  // Astrological profile
  energyProfile?: {
    zodiac?: ZodiacSign[];
    lunar?: LunarPhase[];
    planetary?: PlanetaryAlignment[];
  };
  
  // Alternative astrological profile format (for compatibility)
  astrologicalProfile?: {
    elementalAffinity?: {
      base: string;
      secondary?: string;
    };
    rulingPlanets?: string[];
    zodiacAffinity?: string[];
  };
  
  // Core properties
  elementalProperties: ElementalProperties;
  modality?: Modality;
  sensoryProfile?: SensoryProfile;
  alchemicalProperties?: AlchemicalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  recommendedCookingMethods?: CookingMethod[];
  
  // Pairing recommendations
  pairingRecommendations?: {
    complementary: string[];
    contrasting: string[];
    toAvoid: string[];
  };
  
  // Nutritional information
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    vitamins?: { [key: string]: number };
    minerals?: { [key: string]: number };
  };
  
  // Additional properties for compatibility
  origin?: string[];
  subCategory?: string;
  seasonality?: string[];
  varieties?: Record<string, any>;
  
  // Allow additional properties for extensibility
  [key: string]: Record<string, unknown>;
} 

// ========== MISSING TYPE FOR TS2305 FIXES ==========

// UnifiedIngredient (causing errors in recipeBuilding.ts and LegacyRecommendationAdapter.ts)
export interface UnifiedIngredient extends Ingredient {
  // Unified format combining all ingredient data sources
  source: 'legacy' | 'unified' | 'external';
  version: string;
  compatibility: {
    legacy: boolean;
    modern: boolean;
    enhanced: boolean;
  };
  
  // Enhanced metadata
  metadata: {
    lastUpdated: string;
    dataSource: string[];
    quality: 'high' | 'medium' | 'low';
    verified: boolean;
  };
  
  // Unified pairing system
  unifiedPairings?: {
    ingredients: string[];
    techniques: string[];
    seasons: string[];
    cuisines: string[];
  };
  
  // Consolidated nutritional data
  consolidatedNutrition?: {
    macronutrients: {
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
    };
    micronutrients: {
      vitamins: Record<string, number>;
      minerals: Record<string, number>;
    };
    calories: number;
    servingSize: string;
  };
} 