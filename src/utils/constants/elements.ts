import type { Element } from '@/types/alchemy';

interface ElementCombinations {
  harmonious: [Element, Element][];
  antagonistic: [Element, Element][];
}

export const ELEMENT_COMBINATIONS: ElementCombinations = {
  harmonious: [
    ['Fire', 'Air'],
    ['Water', 'Earth']
  ],
  antagonistic: [
    ['Fire', 'Water'],
    ['Air', 'Earth']
  ]
} as const;

// Helper constants
export const ELEMENT_AFFINITIES: Record<Element, Element[]> = {
  Fire: ['Air'],
  Water: ['Earth'],
  Air: ['Fire'],
  Earth: ['Water']
} as const;

// Element strength relationships
export const ELEMENT_STRENGTHS: Record<Element, Element> = {
  Fire: 'Air',
  Air: 'Earth',
  Earth: 'Water',
  Water: 'Fire'
} as const;

// Element weakness relationships
export const ELEMENT_WEAKNESSES: Record<Element, Element> = {
  Fire: 'Water',
  Water: 'Earth',
  Earth: 'Air',
  Air: 'Fire'
} as const;

export const ELEMENTAL_THRESHOLDS = {
  LOW: 0.33,
  MEDIUM: 0.66,
  HIGH: 1.0,
  // Add any other threshold values you need
}; 