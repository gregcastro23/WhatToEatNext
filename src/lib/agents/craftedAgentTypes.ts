import type { AlchemicalProperty } from "@/types/constants";

export type Element = "Fire" | "Water" | "Air" | "Earth";

/** The wire key `alchemicalElements` holds the ESMS QUANTITIES: a pre-existing misnomer kept for the wire (CONTEXT.md reserves "elements" for Fire, Water, Earth, Air). */
interface AlchemicalElements {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

interface Consciousness {
  /**
   * The classical element (Fire, Water, Earth, Air). "Spirit" is a QUANTITY and never an element (consciousnessAxes.ts).
   * `parseCraftedAgentProfile` guarantees this; the route forwards the service's own consciousness as it came
   * (route.ts:246, :413), so unparsed wire data may still hold something else.
   */
  dominantElement: Element;
  /** The ESMS reading, independent of the element. No in-repo producer names it (ASOL payloads were not inspected); the profile parser defaults it to Spirit. */
  dominantAlchemicalQuantity?: AlchemicalProperty;
  dominantModality?: string;
  level?: string;
  strength?: string;
  emotion?: string;
  signature?: string;
  natalChart?: unknown;
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
  title?: string ;
  era?: string ;
  specialization?: string ;
  synthesis?: string ;
  monicaCreationStory?: string ;
  quotes?: string[] ;
  coreBeliefs?: string[] ;
  appearance?: {
    symbol?: string ;
    color?: string ;
  };
  consciousness?: Consciousness ;
  personality?: Personality ;
  abilities?: Abilities ;
  historicalDiet?: HistoricalDiet ;
  birthData?: BirthData ;
}
