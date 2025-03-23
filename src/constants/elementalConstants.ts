// src/constants/elementalConstants.ts

import type { Element, ZodiacSign, Decan } from '@/types/alchemy';

export const ELEMENTS = ['Fire', 'Water', 'Earth', 'Air'] as const;

export const DEFAULT_ELEMENTAL_PROPERTIES = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

export const VALIDATION_THRESHOLDS = {
  MINIMUM_TOTAL: 0.99,
  MAXIMUM_TOTAL: 1.01,
  MINIMUM_ELEMENT: 0,
  MAXIMUM_ELEMENT: 1,
  BALANCE_PRECISION: 0.000001
};

export const ELEMENT_AFFINITIES: Record<Element, Element[]> = {
  Fire: ['Air'],
  Water: ['Earth'],
  Air: ['Fire'],
  Earth: ['Water']
};

export const ZODIAC_ELEMENTS: Record<ZodiacSign, Element> = {
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
} as const;

export const MINIMUM_THRESHOLD = 0.2;
export const MAXIMUM_THRESHOLD = 0.3;
export const IDEAL_PROPORTION = 0.25;

export const DECANS: Record<ZodiacSign, Decan[]> = {
  aries: [
    { ruler: 'Mars', element: 'Fire', degree: 0 },
    { ruler: 'Sun', element: 'Fire', degree: 10 },
    { ruler: 'Jupiter', element: 'Fire', degree: 20 }
  ],
  taurus: [
    { ruler: 'Venus', element: 'Earth', degree: 0 },
    { ruler: 'Mercury', element: 'Earth', degree: 10 },
    { ruler: 'Saturn', element: 'Earth', degree: 20 }
  ],
  gemini: [
    { ruler: 'Mercury', element: 'Air', degree: 0 },
    { ruler: 'Venus', element: 'Air', degree: 10 },
    { ruler: 'Uranus', element: 'Air', degree: 20 }
  ],
  cancer: [
    { ruler: 'Moon', element: 'Water', degree: 0 },
    { ruler: 'Pluto', element: 'Water', degree: 10 },
    { ruler: 'Neptune', element: 'Water', degree: 20 }
  ],
  leo: [
    { ruler: 'Sun', element: 'Fire', degree: 0 },
    { ruler: 'Jupiter', element: 'Fire', degree: 10 },
    { ruler: 'Mars', element: 'Fire', degree: 20 }
  ],
  virgo: [
    { ruler: 'Mercury', element: 'Earth', degree: 0 },
    { ruler: 'Saturn', element: 'Earth', degree: 10 },
    { ruler: 'Venus', element: 'Earth', degree: 20 }
  ],
  libra: [
    { ruler: 'Venus', element: 'Air', degree: 0 },
    { ruler: 'Uranus', element: 'Air', degree: 10 },
    { ruler: 'Mercury', element: 'Air', degree: 20 }
  ],
  scorpio: [
    { ruler: 'Pluto', element: 'Water', degree: 0 },
    { ruler: 'Neptune', element: 'Water', degree: 10 },
    { ruler: 'Moon', element: 'Water', degree: 20 }
  ],
  sagittarius: [
    { ruler: 'Jupiter', element: 'Fire', degree: 0 },
    { ruler: 'Mars', element: 'Fire', degree: 10 },
    { ruler: 'Sun', element: 'Fire', degree: 20 }
  ],
  capricorn: [
    { ruler: 'Saturn', element: 'Earth', degree: 0 },
    { ruler: 'Venus', element: 'Earth', degree: 10 },
    { ruler: 'Mercury', element: 'Earth', degree: 20 }
  ],
  aquarius: [
    { ruler: 'Uranus', element: 'Air', degree: 0 },
    { ruler: 'Mercury', element: 'Air', degree: 10 },
    { ruler: 'Venus', element: 'Air', degree: 20 }
  ],
  pisces: [
    { ruler: 'Neptune', element: 'Water', degree: 0 },
    { ruler: 'Moon', element: 'Water', degree: 10 },
    { ruler: 'Pluto', element: 'Water', degree: 20 }
  ]
};

export const ELEMENTAL_WEIGHTS = {
  Fire: 1,
  Water: 1,
  Earth: 1,
  Air: 1
};