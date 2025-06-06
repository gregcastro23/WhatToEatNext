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
  aries: 'Fire',
  leo: 'Fire',
  sagittarius: 'Fire',
  
  taurus: 'Earth',
  virgo: 'Earth',
  capricorn: 'Earth',
  
  gemini: 'Air',
  libra: 'Air',
  aquarius: 'Air',
  
  cancer: 'Water',
  scorpio: 'Water',
  pisces: 'Water'
}; 