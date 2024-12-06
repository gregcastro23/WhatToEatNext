// src/utils/elementalUtils.ts

import type { Element, ElementalProperties } from '@/types/alchemy';

export const elementalUtils = {
  validateProperties: (props: ElementalProperties): boolean => {
    // Check if all properties are valid elements
    const validElements: Element[] = ['Fire', 'Water', 'Air', 'Earth'];
    return Object.keys(props).every(el => validElements.includes(el as Element));
  },

  normalizeProperties: (props: ElementalProperties): ElementalProperties => {
    const total = Object.values(props).reduce((acc, val) => acc + (val || 0), 0);
    if (total === 0) return props; // Avoid division by zero

    return Object.fromEntries(
      Object.entries(props).map(([el, val]) => [el, (val || 0) / total])
    ) as ElementalProperties;
  },

  getDominantElement: (props: ElementalProperties): string => {
    return Object.entries(props).reduce((maxEl, [el, val]) => {
      return val > (props[maxEl] || 0) ? el : maxEl;
    }, 'Fire'); // Default to 'Fire' if no elements are present
  }
};

export default elementalUtils;