/**
 * Types for elemental energy calculations
 */

export type ElementType = 
  | 'fire' 
  | 'water' 
  | 'air' 
  | 'earth' 
  | 'metal' 
  | 'wood' 
  | 'void';

export interface ElementalEnergy {
  type: ElementType;
  strength: number;
  influence: string[];
  description?: string;
}

export interface ElementalBalance {
  dominant: ElementType;
  energies: ElementalEnergy[];
  timestamp: number;
}

// Mapping between zodiac signs and their elements
export const signElementMap: Record<string, ElementType> = {
  aries: 'fire',
  leo: 'fire',
  sagittarius: 'fire',
  
  taurus: 'earth',
  virgo: 'earth',
  capricorn: 'earth',
  
  gemini: 'air',
  libra: 'air',
  aquarius: 'air',
  
  cancer: 'water',
  scorpio: 'water',
  pisces: 'water'
}; 