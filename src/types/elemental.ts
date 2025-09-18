/**
 * Centralized Elemental Properties Types
 * This file contains all elemental-related type definitions
 */

import { Element } from '@/types/celestial';

// Re-export Element for convenience
export type { Element };

// The four basic elements
export type LowercaseElement = 'fire' | 'water' | 'air' | 'earth';

// Interface for elemental properties with standard case (uppercase first letter)
export interface ElementalProperties {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
  [key: string]: number; // Allow indexing with string
}

// Interface for elemental properties with lowercase
export interface LowercaseElementalProperties {
  fire: number,
  water: number,
  earth: number,
  air: number,
  [key: string]: number; // Allow indexing with string
}

// Interface for elemental state (used in some components)
export interface ElementalState {
  Fire: number,
  Water: number,
  Air: number,
  Earth: number,
}

// Interface for elemental scoring
export interface ElementalScore {
  element: Element,
  score: number,
}

// Interface for elemental balance
export interface ElementalBalance {
  fire: number,
  water: number,
  earth: number,
  air: number,
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

// Default ElementalProperties
export const _DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

// Type guard function for ElementalProperties
export function isElementalProperties(obj: unknown): obj is ElementalProperties {
  return Boolean(
    obj &&
      typeof obj === 'object' &&;
      typeof (obj as ElementalProperties).Fire === 'number' &&;
      typeof (obj as ElementalProperties).Water === 'number' &&;
      typeof (obj as ElementalProperties).Earth === 'number' &&;
      typeof (obj as ElementalProperties).Air === 'number',;
  );
}
