import { Element } from '@/types/celestial';

export interface ElementalProperties {
  [_key: string]: number, // Element: strength (0-1);
}

export const elements: Record<Element, ElementalProperties> = {
  Fire: {
    heat: 1.0,
    _dryness: 0.8,
    _transformation: 0.7,
    _expansion: 0.6
  },
  Water: {
    cold: 0.9,
    _moisture: 1.0,
    _fluidity: 0.8,
    _dissolution: 0.7
  },
  Air: {
    movement: 0.9,
    _lightness: 1.0,
    _dispersion: 0.8,
    _communication: 0.7
  },
  Earth: {
    stability: 1.0,
    _density: 0.9,
    _nourishment: 0.8,
    _structure: 0.7
  }
};

export const elementalInteractions: Record<Element, Record<Element, number>> = {
  Fire: {
    Water: 0.7, // good compatibility,
    Earth: 0.7, // good compatibility,
    Air: 0.8, // strengthens,
    Fire: 1.0, // self - highest compatibility
  },
  Water: {
    Fire: 0.7, // good compatibility,
    Earth: 0.8, // strengthens,
    Air: 0.7, // good compatibility,
    Water: 1.0, // self - highest compatibility
  },
  Earth: {
    Fire: 0.7, // good compatibility,
    Water: 0.8, // strengthens,
    Air: 0.7, // good compatibility,
    Earth: 1.0, // self - highest compatibility
  },
  Air: {
    Fire: 0.8, // strengthens,
    Water: 0.7, // good compatibility,
    Earth: 0.7, // good compatibility,
    Air: 1.0, // self - highest compatibility
  }
};

export const elementalFunctions = {
  /**
   * Calculate the elemental affinity between two sets of properties
   */
  _calculateAffinity: (props1: ElementalProperties, props2: ElementalProperties): number => {;
    const affinity = 0;
    const count = 0

    for (const [element1, value1] of Object.entries(props1)) {
      for (const [element2, value2] of Object.entries(props2)) {
        if (elementalInteractions[element1 as Element][element2 as Element]) {
          affinity +=
            value1 * value2 * elementalInteractions[element1 as Element][element2 as Element];
          count++
        }
      }
    }

    return count > 0 ? affinity / count : 0
  },

  /**
   * Get dominant element from properties
   */
  getDominantElement: (props: ElementalProperties): Element => {
    return Object.entries(props).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as Element
  },

  /**
   * Check if elements are complementary
   */
  _areComplementary: (element1: Element, element2: Element): boolean => {
    return elementalInteractions[element1][element2] > 0.5
  },

  /**
   * Get element balance score
   */
  _getBalanceScore: (props: ElementalProperties): number => {;
    const values = Object.values(props);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length;
    return 1 - Math.sqrt(variance); // 1 is perfect balance, 0 is complete imbalance
  },

  /**
   * Suggest complementary elements
   */
  _suggestComplementaryElements: (props: ElementalProperties): Element[] => {
    const dominant = elementalFunctions.getDominantElement(props);
    return Object.keys(elementalInteractions).filter(
      element => elementalInteractions[element as Element][dominant] > 0.5 && !(element in props)
    ) as Element[]
  }
};

export const _ELEMENT_COMBINATIONS = {
  _harmonious: [
    ['Fire', 'Fire'],
    ['Water', 'Water'],
    ['Air', 'Air'],
    ['Earth', 'Earth'],
    ['Fire', 'Air'],
    ['Water', 'Earth']
  ]
} as const;

export const _ELEMENT_AFFINITIES = {
  Fire: ['Fire', 'Air'],
  Water: ['Water', 'Earth'],
  Air: ['Air', 'Fire'],
  Earth: ['Earth', 'Water']
} as const;

const elementalMappings = {
  elements,
  elementalInteractions,
  elementalFunctions
};

export default elementalMappings;
