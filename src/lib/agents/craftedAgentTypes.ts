export type Element = "Fire" | "Water" | "Air" | "Earth";

interface NatalPlanet {
  sign: string;
  degree: number;
  house?: number | string;
  retrograde?: boolean;
}

interface NatalAspect {
  planet1: string;
  type: string;
  planet2: string;
  exact?: boolean;
  orb: number;
}

interface AlchemicalElements {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface Consciousness {
  dominantElement: Element;
  dominantModality?: string;
  level?: string;
  strength?: string;
  emotion?: string;
  signature?: string;
  natalChart?: {
    planets: Record<string, NatalPlanet>;
    aspects: NatalAspect[];
  };
  alchemicalElements?: AlchemicalElements;
}

interface Gift {
  type: string;
  description: string;
  expression?: string;
}

interface Shadow {
  type: string;
  description: string;
  transformationPath?: string;
}

interface Challenge {
  type: string;
  description: string;
  growthOpportunity?: string;
}

interface Personality {
  core?: {
    essence: string;
    expression: string;
    emotion: string;
  };
  traits?: string[];
  currentMood?: string;
  gifts?: Gift[];
  shadows?: Shadow[];
  challenges?: Challenge[];
}

interface Abilities {
  specialty?: string;
  teachingStyle?: string;
  resonanceType?: string;
  uniquePower?: string;
  wisdomDomains?: string[];
}

interface HistoricalDiet {
  culturalCuisine?: string;
  dietaryPhilosophy?: string;
  staples?: string[];
  favoriteFoods?: string[];
  avoidedFoods?: string[];
  beverages?: string[];
  foodLore?: string;
}

interface BirthData {
  date?: string;
  time?: string;
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface CraftedAgentProfile {
  name: string;
  title?: string;
  era?: string;
  specialization?: string;
  synthesis?: string;
  monicaCreationStory?: string;
  quotes?: string[];
  coreBeliefs?: string[];
  appearance?: {
    symbol?: string;
    color?: string;
  };
  consciousness?: Consciousness;
  personality?: Personality;
  abilities?: Abilities;
  historicalDiet?: HistoricalDiet;
  birthData?: BirthData;
}
