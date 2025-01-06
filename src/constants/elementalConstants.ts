// src/constants/elementalConstants.ts

import type { Element, ZodiacSign } from '@/types/alchemy';

export const ELEMENTS: Element[] = ['Fire', 'Water', 'Air', 'Earth'];

export const DEFAULT_ELEMENTAL_PROPERTIES = {
  Fire: 0.25,
  Water: 0.25,
  Air: 0.25,
  Earth: 0.25
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