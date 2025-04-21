import { ElementalProperties, MoonPhase } from './shared';
import { Element, ZodiacSign, PlanetName, Season } from './constants';

/**
 * Standardized Ingredient interface representing a food ingredient
 * with all its properties
 */
export interface Ingredient {
  id?: string;
  name: string;
  amount: number;
  unit: string;
  category?: string;
  optional?: boolean;
  preparation?: string;
  notes?: string;
  qualities?: string[];
  storage?: {
    duration: string;
    method: string;
  };
  
  // Elemental properties
  elementalProperties?: ElementalProperties;
  element?: Element;
  
  // Astrological associations
  seasonality?: Season[];
  zodiacInfluences?: ZodiacSign[];
  planetaryInfluences?: PlanetName[];
  lunarPhaseInfluences?: MoonPhase[];
  
  // Additional properties that might be present in various parts of the codebase
  astrologicalProfile?: {
    elementalAffinity?: {
      base: string;
      [key: string]: string | number;
    };
    rulingPlanets?: string[];
    signAffinities?: string[];
    affinities?: Record<string, number>;
  };
  
  // Nutritional information
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  };
  
  // Flavor profile
  flavor?: {
    sweet?: number;
    salty?: number;
    sour?: number;
    bitter?: number;
    umami?: number;
    spicy?: number;
  };
  
  // Extended properties
  alternateNames?: string[];
  description?: string;
  culinaryUses?: string[];
  substitutes?: string[];
  pairsWith?: string[];
  imageUrl?: string;
  
  // To support indexing with any string key
  [key: string]: unknown;
}

/**
 * Ingredient Mapping interface representing how an ingredient maps to 
 * astrological and elemental properties
 */
export interface IngredientMapping {
  id: string;
  name: string;
  category?: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    signAffinities?: string[];
    affinities?: Record<string, number>;
    elementalAffinity?: {
      base: string;
      [key: string]: string | number;
    };
  };
  seasonality?: Season[];
  description?: string;
  culinaryUses?: string[];
  substitutes?: string[];
  pairsWith?: string[];
  [key: string]: unknown;
}

/**
 * Standardized ingredient recommendation interface
 */
export interface IngredientRecommendation {
  ingredient: Ingredient | IngredientMapping;
  score: number;
  reasons?: string[];
  scoreDetails?: Record<string, number>;
}

/**
 * Ingredient Category enum for standardizing categories
 */
export enum IngredientCategory {
  Herb = 'herb',
  CulinaryHerb = 'culinary_herb',
  Spice = 'spice',
  Vegetable = 'vegetable',
  Fruit = 'fruit',
  Protein = 'protein',
  Grain = 'grain',
  Dairy = 'dairy',
  Oil = 'oil',
  Vinegar = 'vinegar',
  Condiment = 'condiment',
  Sweetener = 'sweetener',
  Beverage = 'beverage',
  Alcohol = 'alcohol',
  Nut = 'nut',
  Seed = 'seed',
  Legume = 'legume',
  Fungi = 'fungi',
  SeaVegetable = 'sea_vegetable',
  Other = 'other'
}

// Utility function to check if an object is an Ingredient
export function isIngredient(obj: unknown): obj is Ingredient {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as Ingredient).name === 'string' &&
    'amount' in obj &&
    typeof (obj as Ingredient).amount === 'number' &&
    'unit' in obj &&
    typeof (obj as Ingredient).unit === 'string'
  );
}

// Utility function to check if an object is an IngredientMapping
export function isIngredientMapping(obj: unknown): obj is IngredientMapping {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as IngredientMapping).id === 'string' &&
    'name' in obj &&
    typeof (obj as IngredientMapping).name === 'string' &&
    'elementalProperties' in obj &&
    typeof (obj as IngredientMapping).elementalProperties === 'object'
  );
} 