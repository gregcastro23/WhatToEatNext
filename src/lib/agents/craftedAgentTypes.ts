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

export interface HistoricalDiet {
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
  title?: string | undefined;
  era?: string | undefined;
  specialization?: string | undefined;
  synthesis?: string | undefined;
  monicaCreationStory?: string | undefined;
  quotes?: string[] | undefined;
  coreBeliefs?: string[] | undefined;
  appearance?: {
    symbol?: string | undefined;
    color?: string | undefined;
  } | undefined;
  consciousness?: Consciousness | undefined;
  personality?: Personality | undefined;
  abilities?: Abilities | undefined;
  historicalDiet?: HistoricalDiet | undefined;
  birthData?: BirthData | undefined;
}
