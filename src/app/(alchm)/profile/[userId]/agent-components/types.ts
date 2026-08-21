import type { Element } from "@/lib/agents/craftedAgentTypes";

export interface Balances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface TransitActivation {
  transitPlanet: string;
  natalPoint: string;
  type: string;
  orb: number;
  exactness: number;
  natalElement: "fire" | "earth" | "air" | "water";
}

export interface TransitOverlayData {
  agentId: string;
  transitTime: string;
  activations: TransitActivation[];
  boostElement: "fire" | "earth" | "air" | "water" | null;
  boostMagnitude: number;
  stressNotes: string[];
  summary: string;
}

export interface InterchartAspect {
  planetA: string;
  planetB: string;
  type: string;
  orb: number;
  harmonic: "friction" | "harmony" | "intensification";
}

export interface SynastryData {
  meta?: {
    agentA?: { name?: string };
    agentB?: { name?: string };
  };
  dominantStance: "mirror" | "absorb" | "clash";
  scores: {
    tension: number;
    harmony: number;
    intensification: number;
    aspectCount: number;
  };
  interchartAspects: InterchartAspect[];
}

export interface ViewerProfileData {
  dominantElement?: Element | string;
  natalChart?: unknown;
  [key: string]: unknown;
}

export interface RecipeIngredient {
  amount?: number;
  unit?: string;
  name?: string;
}

export interface MonicaOptimization {
  planetaryTimingRecommendations?: string[];
  [key: string]: unknown;
}

export interface RecipeDetail {
  id?: string;
  name?: string;
  description?: string;
  cuisine?: string;
  mealType?: string[];
  prepTime?: number;
  cookTime?: number;
  ingredients?: RecipeIngredient[];
  instructions?: string[];
  elementalProperties?: Record<string, number | undefined>;
  monicaOptimization?: MonicaOptimization;
  [key: string]: unknown;
}
