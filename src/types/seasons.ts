export type { Season } from "@/constants/seasons";
export interface SeasonalProfile {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
  [_key: string]: number; // Allow indexing with string
}

export interface SeasonalAdjustment {
  season: Season;
  _effectStrength: number;
  _recommendations: string[];
}

// ========== MISSING TYPES FOR TS2305 FIXES ==========

// SeasonalRecommendations (causing error in recipeBuilding.ts)
export interface SeasonalRecommendations {
  spring: {
    ingredients: string[];
    recipes: string[];
    techniques: string[];
    energies: string[];
  };
  summer: {
    ingredients: string[];
    recipes: string[];
    techniques: string[];
    energies: string[];
  };
  autumn: {
    ingredients: string[];
    recipes: string[];
    techniques: string[];
    energies: string[];
  };
  winter: {
    ingredients: string[];
    recipes: string[];
    techniques: string[];
    energies: string[];
  };
  general: {
    transitions: string[];
    _balancing: string[];
  };
}

// getCurrentSeason function type (causing error in AlchemicalRecommendationService.ts)
export function getCurrentSeason(): Season {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  if (month >= 2 && month <= 4) return "spring"; // March-May
  if (month >= 5 && month <= 7) return "summer"; // June-August
  if (month >= 8 && month <= 10) return "autumn"; // September-November
  return "winter"; // December-February
}

// recipe type (simple type, causing error in AlchemicalRecommendationService.ts)
export interface recipe {
  _id: string;
  _name: string;
  season?: Season | Season[];
  ingredients?: string[];
  elementalProperties?: {
    _Fire: number;
    _Water: number;
    _Earth: number;
    Air: number;
  };
}
