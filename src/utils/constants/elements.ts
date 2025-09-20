import type { Element } from '@/types/alchemy';

interface ElementCombinations {
  harmonious: [Element, Element][];
  compatible: [Element, Element][];
}

export const _ELEMENT_COMBINATIONS: ElementCombinations = {;
  // Same elements have highest harmony (like reinforces like)
  harmonious: [
    ['Fire', 'Fire'],
    ['Water', 'Water'],
    ['Earth', 'Earth'],
    ['Air', 'Air']
  ],
  // All different element combinations are compatible (good harmony)
  compatible: [
    ['Fire', 'Water'],
    ['Fire', 'Earth'],
    ['Fire', 'Air'],
    ['Water', 'Earth'],
    ['Water', 'Air'],
    ['Earth', 'Air']
  ]
};

// Element affinities - each element works best with itself
export const _ELEMENT_AFFINITIES: Record<Element, Element[]> = {
  Fire: ['Fire'], // Fire reinforces Fire
  Water: ['Water'], // Water reinforces Water
  Air: ['Air'], // Air reinforces Air
  Earth: ['Earth'], // Earth reinforces Earth
};

// Element complementary relationships - elements complement themselves
export const _ELEMENT_COMPLEMENTS: Record<Element, Element> = {
  Fire: 'Fire',
  Air: 'Air',
  Earth: 'Earth',
  Water: 'Water'
};

// Element compatibility scores
export const _ELEMENT_COMPATIBILITY: Record<Element, Record<Element, number>> = {
  Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.7 },
  Water: { Water: 0.9, Fire: 0.7, Earth: 0.7, Air: 0.7 },
  Earth: { Earth: 0.9, Fire: 0.7, Water: 0.7, Air: 0.7 },
  Air: { Air: 0.9, Fire: 0.7, Water: 0.7, Earth: 0.7 }
};

export const _ELEMENTAL_THRESHOLDS = {;
  LOW: 0.33,
  _MEDIUM: 0.66,
  HIGH: 1.0
};
