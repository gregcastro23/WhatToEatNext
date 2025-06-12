import type { Recipe } from './recipe';

export interface SeasonalDishes {
  all?: unknown[];
  summer?: unknown[];
  winter?: unknown[];
  spring?: unknown[];
  fall?: unknown[];
  autumn?: unknown[];
}

export interface CuisineDishes {
  breakfast?: SeasonalDishes;
  lunch?: SeasonalDishes;
  dinner?: SeasonalDishes;
  dessert?: SeasonalDishes;
  snacks?: SeasonalDishes;
}

export interface Cuisine {
  id: string;
  name: string;
  description?: string;
  alchemicalProperties?: Record<string, number>;
  astrologicalInfluences?: string[];
  dishes: CuisineDishes;
  elementalProperties: ElementalProperties;
  motherSauces?: Record<string, Sauce>;
  traditionalSauces?: Record<string, unknown>;
  sauceRecommender?: SauceRecommendations;
  cookingTechniques?: CookingTechnique[];
  regionalCuisines?: Record<string, RegionalCuisine> | RegionalCuisine[];
  regionalVarieties?: number;
}

export type CuisineType = string;

interface Sauce {
  name: string;
  description: string;
  base: string;
  thickener: string;
  keyIngredients: string[];
  culinaryUses: string[];
  derivatives: string[];
  elementalProperties: ElementalProperties;
  astrologicalInfluences: string[];
  seasonality: string;
  preparationNotes: string;
  technicalTips: string;
  difficulty: string;
  storageInstructions: string;
  yield: string;
}

interface ElementalProperties {
  Earth: number;
  Water: number;
  Fire: number;
  Air: number;
}

interface SauceRecommendations {
  forProtein: Record<string, string[]>;
  forVegetable: Record<string, string[]>;
  forCookingMethod: Record<string, string[]>;
  byAstrological: Record<string, string[]>;
  byDietary: Record<string, string[]>;
  byRegion: Record<string, string[]>;
}

interface CookingTechnique {
  name: string;
  description: string;
  elementalProperties: ElementalProperties;
  toolsRequired: string[];
  bestFor: string[];
  difficulty: string;
}

interface RegionalCuisine {
  name: string;
  description: string;
  signature?: string[];
  signatureDishes?: string[];
  keyIngredients?: string[];
  cookingTechniques?: string[];
  elementalProperties: ElementalProperties;
  astrologicalInfluences?: string[];
  culturalInfluences?: string[];
  philosophicalFoundations?: string;
  seasonality?: string;
  specialIngredients?: string[];
} 