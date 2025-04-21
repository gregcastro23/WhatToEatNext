/**
 * Centralized Elemental Properties Types
 * This file contains all elemental-related type definitions
 */

// The four basic elements
export type Element = 'Fire' | 'Water' | 'Air' | 'Earth';
export type LowercaseElement = 'fire' | 'water' | 'air' | 'earth';

/**
 * Centralized definition of ElementalProperties
 * This is the canonical interface to be used throughout the codebase
 */
export interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}

/**
 * Lowercase version for compatibility with certain components
 */
export interface LowercaseElementalProperties {
  fire: number;
  water: number;
  earth: number;
  air: number;
  [key: string]: number; // Allow indexing with string
}

// Interface for elemental state (used in some components)
export interface ElementalState {
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

// Interface for elemental scoring
export interface ElementalScore {
  element: Element;
  score: number;
}

// Interface for elemental balance
export interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

// Interface for elemental filter
export interface ElementalFilter {
  minFire?: number;
  maxFire?: number;
  minWater?: number;
  maxWater?: number;
  minEarth?: number;
  maxEarth?: number;
  minAir?: number;
  maxAir?: number;
  dominantElement?: Element;
}

/**
 * Interface for elemental transformation (used for ingredients)
 */
export interface ElementalTransformation {
  whenCooked?: Partial<ElementalProperties>;
  whenFermented?: Partial<ElementalProperties>;
  whenDried?: Partial<ElementalProperties>;
  whenRoasted?: Partial<ElementalProperties>;
  whenPickled?: Partial<ElementalProperties>;
  whenRaw?: Partial<ElementalProperties>;
}

/**
 * Default elemental properties with equal distribution
 */
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

/**
 * Convert between capitalized and lowercase elemental properties
 */
export function toLowercaseElementalProperties(props: ElementalProperties): LowercaseElementalProperties {
  return {
    fire: props.Fire,
    water: props.Water,
    earth: props.Earth,
    air: props.Air
  };
}

/**
 * Convert from lowercase to capitalized elemental properties
 */
export function toCapitalizedElementalProperties(props: LowercaseElementalProperties): ElementalProperties {
  return {
    Fire: props.fire,
    Water: props.water,
    Earth: props.earth,
    Air: props.air
  };
}

/**
 * Type guard to check if an object is an ElementalProperties object
 */
export function isElementalProperties(obj: unknown): obj is ElementalProperties {
  if (!obj || typeof obj !== 'object') return false;
  
  const keys = ['Fire', 'Water', 'Earth', 'Air'];
  return keys.every(key => 
    key in obj && 
    typeof (obj as Record<string, unknown>)[key] === 'number');
}

/**
 * Normalize elemental properties to ensure they sum to 1
 */
export function normalizeElementalProperties(properties: ElementalProperties): ElementalProperties {
  const { Fire, Water, Earth, Air } = properties;
  const sum = Fire + Water + Earth + Air;
  
  if (sum === 0) {
    // If all values are 0, return an evenly balanced set
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }
  
  return {
    Fire: Fire / sum,
    Water: Water / sum,
    Earth: Earth / sum,
    Air: Air / sum
  };
}

/**
 * Get the dominant element from a set of elemental properties
 */
export function getDominantElement(properties: ElementalProperties): keyof ElementalProperties {
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
  let dominant = elements[0];
  let highestValue = properties[dominant];
  
  for (const element of elements) {
    if (properties[element] > highestValue) {
      dominant = element;
      highestValue = properties[element];
    }
  }
  
  return dominant;
}
