// src/lib/elementalSystem.ts

import { 
    ELEMENTS, 
    IDEAL_PROPORTION, 
    MINIMUM_THRESHOLD, 
    MAXIMUM_THRESHOLD,
    ELEMENT_AFFINITIES,
    ZODIAC_ELEMENTS
  } from '@/constants/elementalConstants';
  import type { 
    ElementalProperties, 
    Element, 
    ZodiacSign,
    AstrologicalState,
    Season
  } from '@/types/alchemy';
  
  class ElementalSystem {
    calculateBalance(properties: ElementalProperties): number {
      const values = ELEMENTS.map(element => properties[element] || 0);
      const total = values.reduce((sum, val) => sum + val, 0);
      
      if (total === 0) return 0;
      
      const deviations = values.map(val => 
        Math.abs((val / total) - IDEAL_PROPORTION)
      );
      
      return 1 - (deviations.reduce((sum, dev) => sum + dev, 0) / 2);
    }
  
    getRecommendedAdjustments(properties: ElementalProperties): string[] {
      const adjustments: string[] = [];
      const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
      
      if (total === 0) return ['No elemental properties found'];
  
      ELEMENTS.forEach(element => {
        const value = properties[element] || 0;
        const proportion = value / total;
  
        if (proportion < MINIMUM_THRESHOLD) {
          adjustments.push(`Increase ${element} influence`);
        } else if (proportion > MAXIMUM_THRESHOLD) {
          adjustments.push(`Reduce ${element} influence`);
        }
      });
  
      return adjustments;
    }
  
    normalizeProperties(properties: Partial<ElementalProperties>): ElementalProperties {
      const total = Object.values(properties).reduce((sum, val) => sum + (val || 0), 0);
      
      if (total === 0) {
        return ELEMENTS.reduce((acc, element) => ({
          ...acc,
          [element]: IDEAL_PROPORTION
        }), {} as ElementalProperties);
      }
  
      return ELEMENTS.reduce((acc, element) => ({
        ...acc,
        [element]: (properties[element] || 0) / total
      }), {} as ElementalProperties);
    }
  
    calculateElementalDominance(properties: ElementalProperties): Element {
      let dominantElement: Element = 'Fire';
      let maxValue = -Infinity;
  
      ELEMENTS.forEach(element => {
        const value = properties[element] || 0;
        if (value > maxValue) {
          maxValue = value;
          dominantElement = element;
        }
      });
  
      return dominantElement;
    }
  
    calculateAstrologicalInfluence(state: AstrologicalState): ElementalProperties {
      const zodiacElement = ZODIAC_ELEMENTS[state.currentZodiac?.toLowerCase()];
      const moonSign = state.currentPlanetaryAlignment?.moon?.toLowerCase();
      const moonElement = moonSign ? ZODIAC_ELEMENTS[moonSign] : 'Water';
      
      const baseProperties: ElementalProperties = {
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25
      };
  
      if (zodiacElement) {
        baseProperties[zodiacElement] += 0.2;
      }
      
      if (moonElement) {
        baseProperties[moonElement] += 0.1;
      }
  
      return this.normalizeProperties(baseProperties);
    }
  
    calculateSeasonalInfluence(season: Season): ElementalProperties {
      const seasonalElements: Record<Season, Element[]> = {
        spring: ['Air', 'Water'],
        summer: ['Fire', 'Air'],
        autumn: ['Earth', 'Air'],
        winter: ['Water', 'Earth']
      };
  
      const elements = seasonalElements[season];
      const baseValue = 1 / ELEMENTS.length;
      const boost = 0.1;
  
      const properties = ELEMENTS.reduce((acc, element) => ({
        ...acc,
        [element]: elements.includes(element) ? baseValue + boost : baseValue
      }), {} as ElementalProperties);
  
      return this.normalizeProperties(properties);
    }
  
    validateProperties(properties: Partial<ElementalProperties>): boolean {
      const hasAllProperties = ELEMENTS
        .every(key => typeof properties[key] === 'number');
  
      const hasValidValues = Object.values(properties)
        .every(value => typeof value === 'number' && value >= 0 && value <= 1);
  
      const sum = Object.values(properties).reduce((acc, val) => acc + (val || 0), 0);
      const hasValidSum = Math.abs(sum - 1) < 0.000001;
  
      return hasAllProperties && hasValidValues && hasValidSum;
    }
  
    calculateHarmony(first: ElementalProperties, second: ElementalProperties): number {
      const firstNormalized = this.normalizeProperties(first);
      const secondNormalized = this.normalizeProperties(second);
  
      return 1 - ELEMENTS.reduce((diff, element) => {
        const delta = Math.abs(
          (firstNormalized[element] || 0) - (secondNormalized[element] || 0)
        );
        return diff + delta;
      }, 0) / 2;
    }
  }
  
  export const elementalSystem = new ElementalSystem();
  export default elementalSystem;