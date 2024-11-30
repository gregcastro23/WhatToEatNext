// src/data/integrations/elementalBalance.ts

import { 
  ELEMENTS,
  MINIMUM_THRESHOLD, 
  MAXIMUM_THRESHOLD,
  DEFAULT_ELEMENTAL_PROPERTIES,
  VALIDATION_THRESHOLDS
} from '@/constants/elementalConstants';
import type { ElementalProperties, Element } from '@/types/alchemy';

export const elementalBalance = {
  calculateBalance(properties: ElementalProperties): number {
    const values = ELEMENTS.map(element => properties[element] || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return 0;
    
    const deviations = values.map(val => {
      const proportion = val / total;
      return Math.abs(proportion - 0.25); // Ideal balance is 0.25 for each element
    });
    
    const totalDeviation = deviations.reduce((sum, dev) => sum + dev, 0);
    return Math.max(0, 1 - (totalDeviation * 1.5)); // Adjusted sensitivity
  },

  getRecommendedAdjustments(properties: ElementalProperties): string[] {
    const adjustments: string[] = [];
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return ['No elemental properties found'];

    // Type assertion for strict type checking
    (Object.entries(properties) as [Element, number][]).forEach(([element, value]) => {
      const proportion = value / total;
      
      if (proportion > MAXIMUM_THRESHOLD) {
        adjustments.push(`Reduce ${element} influence`);
      }
      if (proportion < MINIMUM_THRESHOLD) {
        adjustments.push(`Increase ${element} influence`);
      }
    });

    // Add recommendations for balanced elements
    if (!adjustments.some(adj => adj.includes('Increase'))) {
      const weakestElement = (Object.entries(properties) as [Element, number][])
        .reduce((min, [elem, val]) => 
          val < min.value ? { element: elem, value: val } : min,
          { element: '' as Element, value: Infinity }
        );
      
      if (weakestElement.element) {
        adjustments.push(`Increase ${weakestElement.element} influence`);
      }
    }

    return adjustments;
  },

  normalizeProperties(properties: ElementalProperties): ElementalProperties {
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
      return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }

    return ELEMENTS.reduce((acc, element) => ({
      ...acc,
      [element]: properties[element] / total
    }), {} as ElementalProperties);
  },

  validateProperties(properties: ElementalProperties): boolean {
    // Check if all elements are present
    const hasAllElements = ELEMENTS.every(element => 
      typeof properties[element] === 'number'
    );

    // Check if values are within valid range
    const hasValidValues = Object.values(properties)
      .every(value => value >= VALIDATION_THRESHOLDS.MINIMUM_ELEMENT && 
                     value <= VALIDATION_THRESHOLDS.MAXIMUM_ELEMENT);

    // Check if total is approximately 1
    const total = Object.values(properties)
      .reduce((sum, val) => sum + val, 0);
    const hasValidTotal = Math.abs(total - 1) < VALIDATION_THRESHOLDS.BALANCE_PRECISION;

    return hasAllElements && hasValidValues && hasValidTotal;
  },

  checkHarmony(properties: ElementalProperties): {
    score: number;
    suggestions: string[];
    elements: Record<Element, { value: number; status: 'low' | 'balanced' | 'high' }>;
  } {
    const normalized = this.normalizeProperties(properties);
    const score = this.calculateBalance(normalized);
    const suggestions = this.getRecommendedAdjustments(normalized);

    // Detailed element status
    const elements = ELEMENTS.reduce((acc, element) => {
      const value = normalized[element];
      let status: 'low' | 'balanced' | 'high';
      
      if (value < MINIMUM_THRESHOLD) status = 'low';
      else if (value > MAXIMUM_THRESHOLD) status = 'high';
      else status = 'balanced';

      return { ...acc, [element]: { value, status }};
    }, {} as Record<Element, { value: number; status: 'low' | 'balanced' | 'high' }>);

    return {
      score,
      suggestions,
      elements
    };
  },

  calculateDominantElement(properties: ElementalProperties): Element {
    const normalized = this.normalizeProperties(properties);
    return ELEMENTS.reduce((dominant, element) => 
      normalized[element] > normalized[dominant] ? element : dominant
    , ELEMENTS[0]);
  },

  calculateHarmonyBetween(first: ElementalProperties, second: ElementalProperties): number {
    const norm1 = this.normalizeProperties(first);
    const norm2 = this.normalizeProperties(second);

    return 1 - ELEMENTS.reduce((diff, element) => 
      diff + Math.abs(norm1[element] - norm2[element])
    , 0) / 2;
  }
};

export default elementalBalance;