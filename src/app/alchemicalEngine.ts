import type { Element, ElementalProperties, CombinationResult } from '@/types/alchemy';
import { elementalUtils } from '@/utils/elementalUtils';

export class AlchemicalEngine {
  private readonly validElements: Element[] = ['Fire', 'Water', 'Air', 'Earth'];

  calculateElementalBalance(ingredients: ElementalProperties[]): ElementalProperties {
    // Validate ingredients first
    if (!ingredients.every(ing => elementalUtils.validateProperties(ing))) {
      throw new Error('Invalid elemental properties detected');
    }

    // Combine all ingredient properties
    const combined = ingredients.reduce((acc, curr) => {
      Object.entries(curr).forEach(([element, value]) => {
        acc[element as Element] = (acc[element as Element] || 0) + value;
      });
      return acc;
    }, {} as ElementalProperties);

    // Normalize values
    return elementalUtils.normalizeProperties(combined);
  }

  calculateHarmony(props1: ElementalProperties, props2: ElementalProperties): number {
    const harmonies: Record<Element, Record<Element, number>> = {
      'Fire': {
        'Fire': 1.0,
        'Air': 0.8,   // Fire and Air strengthen each other
        'Earth': 0.3, // Moderate interaction
        'Water': -0.8 // Opposing elements
      },
      'Water': {
        'Water': 1.0,
        'Earth': 0.6, // Water shapes Earth
        'Air': 0.3,   // Weak interaction
        'Fire': -0.8  // Opposing elements
      },
      'Air': {
        'Air': 1.0,
        'Fire': 0.8,  // Air feeds Fire
        'Water': 0.3, // Weak interaction
        'Earth': -0.6 // Opposing elements
      },
      'Earth': {
        'Earth': 1.0,
        'Water': 0.6, // Earth contains Water
        'Fire': 0.3,  // Moderate interaction
        'Air': -0.6   // Opposing elements
      }
    };

    let totalHarmony = 0;
    let interactions = 0;

    Object.entries(props1).forEach(([el1, val1]) => {
      Object.entries(props2).forEach(([el2, val2]) => {
        if (harmonies[el1 as Element]?.[el2 as Element] !== undefined) {
          totalHarmony += val1 * val2 * harmonies[el1 as Element][el2 as Element];
          interactions++;
        }
      });
    });

    return interactions > 0 ? totalHarmony / interactions : 0;
  }

  calculateReaction(
    ingredients: ElementalProperties[],
    temperature: number,
    time: number
  ): CombinationResult {
    const baseProperties = this.calculateElementalBalance(ingredients);
    const energyFactor = Math.log(temperature + 1) * Math.sqrt(time) / 100;
    
    // Temperature affects Fire and Air elements
    const modifiedProperties = { ...baseProperties };
    modifiedProperties.Fire = (modifiedProperties.Fire || 0) + (energyFactor * 0.2);
    modifiedProperties.Air = (modifiedProperties.Air || 0) + (energyFactor * 0.1);

    const normalizedProperties = elementalUtils.normalizeProperties(modifiedProperties);
    
    return {
      resultingProperties: normalizedProperties,
      stability: this.calculateStability(normalizedProperties, energyFactor),
      potency: this.calculatePotency(ingredients.length, energyFactor),
      dominantElement: elementalUtils.getDominantElement(normalizedProperties),
      warnings: this.checkForVolatileInteractions(ingredients)
    };
  }

  private calculateStability(properties: ElementalProperties, energyFactor: number): number {
    const opposingPairs = [
      ['Fire', 'Water'],
      ['Air', 'Earth']
    ];

    let stability = 1;
    opposingPairs.forEach(([el1, el2]) => {
      const diff = Math.abs((properties[el1 as Element] || 0) - (properties[el2 as Element] || 0));
      stability -= diff * 0.5;
    });

    return Math.max(0, stability - (energyFactor * 0.3));
  }

  private calculatePotency(ingredientCount: number, energyFactor: number): number {
    return Math.min(1, (ingredientCount * 0.2) * (1 + energyFactor));
  }

  private checkForVolatileInteractions(ingredients: ElementalProperties[]): string[] {
    const warnings: string[] = [];
    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const harmony = this.calculateHarmony(ingredients[i], ingredients[j]);
        if (harmony < -0.5) {
          warnings.push(`Volatile interaction detected between ingredients ${i + 1} and ${j + 1}`);
        }
      }
    }
    return warnings;
  }
}

export default AlchemicalEngine;