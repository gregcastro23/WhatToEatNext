import type { 
  ElementalProperties, 
  IngredientMapping,
  CookingMethodModifier 
} from '@/types/alchemy';
import { ELEMENTAL_THRESHOLDS } from '@/utils/constants/elements';
import { ingredientMappings } from '@/utils/elementalMappings/ingredients';
import { cookingMethodModifiers } from '@/utils/elementalMappings/cookingMethods';
import { SEASONAL_PROPERTIES } from '@/utils/constants/seasons';
import { LUNAR_PHASES } from '@/utils/constants/lunar';

export class ElementalCalculator {
  private static instance: ElementalCalculator;

  // Add debug mode
  private debugMode: boolean = false;
  private logs: string[] = [];

  // Enhanced Regional Modifiers
  private readonly REGIONAL_MODIFIERS: Record<string, {
    elementalModifiers: ElementalProperties;
    seasonalAdjustments: Record<string, number>;
    specialRules?: Array<{
      condition: string;
      effect: Partial<ElementalProperties>;
    }>;
  }> = {
    chinese: {
      elementalModifiers: {
        Fire: 1.2, Water: 1.0, Air: 0.9, Earth: 1.1
      },
      seasonalAdjustments: {
        spring: 1.2,
        summer: 1.3,
        fall: 1.1,
        winter: 1.0
      },
      specialRules: [
        {
          condition: 'soup_based',
          effect: { Water: 0.2, Fire: -0.1 }
        },
        {
          condition: 'stir_fried',
          effect: { Fire: 0.2, Air: 0.1 }
        }
      ]
    },
    japanese: {
      elementalModifiers: {
        Fire: 0.9, Water: 1.3, Air: 1.1, Earth: 1.0
      },
      seasonalAdjustments: {
        spring: 1.3,
        summer: 1.1,
        fall: 1.2,
        winter: 1.0
      },
      specialRules: [
        {
          condition: 'raw_fish',
          effect: { Water: 0.3, Air: 0.1 }
        }
      ]
    },
    korean: {
      elementalModifiers: {
        Fire: 1.3, Water: 0.9, Air: 1.0, Earth: 1.1
      },
      seasonalAdjustments: {
        spring: 1.1,
        summer: 1.2,
        fall: 1.1,
        winter: 1.3
      },
      specialRules: [
        {
          condition: 'fermented',
          effect: { Fire: 0.1, Earth: 0.2 }
        }
      ]
    },
    indian: {
      elementalModifiers: {
        Fire: 1.4, Water: 0.8, Air: 1.1, Earth: 1.0
      },
      seasonalAdjustments: {
        spring: 1.1,
        summer: 1.0,
        fall: 1.2,
        winter: 1.3
      },
      specialRules: [
        {
          condition: 'spiced',
          effect: { Fire: 0.3, Air: 0.1 }
        }
      ]
    },
    mediterranean: {
      elementalModifiers: {
        Fire: 1.1, Water: 1.1, Air: 1.2, Earth: 0.9
      },
      seasonalAdjustments: {
        spring: 1.3,
        summer: 1.2,
        fall: 1.1,
        winter: 0.9
      }
    },
    middleEastern: {
      elementalModifiers: {
        Fire: 1.2, Water: 0.9, Air: 1.1, Earth: 1.1
      },
      seasonalAdjustments: {
        spring: 1.1,
        summer: 0.9,
        fall: 1.2,
        winter: 1.3
      }
    },
    thai: {
      elementalModifiers: {
        Fire: 1.4, Water: 1.0, Air: 1.1, Earth: 0.8
      },
      seasonalAdjustments: {
        spring: 1.1,
        summer: 1.0,
        fall: 1.2,
        winter: 1.1
      }
    },
    vietnamese: {
      elementalModifiers: {
        Fire: 1.1, Water: 1.2, Air: 1.2, Earth: 0.9
      },
      seasonalAdjustments: {
        spring: 1.2,
        summer: 1.1,
        fall: 1.1,
        winter: 1.0
      }
    }
  };

  private constructor() {}

  public static getInstance(): ElementalCalculator {
    if (!ElementalCalculator.instance) {
      ElementalCalculator.instance = new ElementalCalculator();
    }
    return ElementalCalculator.instance;
  }

  public calculateRecipeElements(
    ingredients: { name: string; amount: number; }[],
    cookingMethod: string,
    duration: number,
    season?: string,
    lunarPhase?: string
  ): ElementalProperties {
    // Calculate base elemental properties from ingredients
    let elements = this.calculateIngredientsElements(ingredients);

    // Apply cooking method modifications
    elements = this.applyCookingMethod(elements, cookingMethod, duration);

    // Apply seasonal influences if provided
    if (season) {
      elements = this.applySeasonalInfluence(elements, season);
    }

    // Apply lunar influences if provided
    if (lunarPhase) {
      elements = this.applyLunarInfluence(elements, lunarPhase);
    }

    return this.normalizeElements(elements);
  }

  private calculateIngredientsElements(
    ingredients: { name: string; amount: number; }[]
  ): ElementalProperties {
    const elements: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Air: 0,
      Earth: 0
    };

    ingredients.forEach(({ name, amount }) => {
      const mapping = ingredientMappings[name.toLowerCase()];
      if (mapping?.elementalProperties) {
        Object.entries(mapping.elementalProperties).forEach(([element, value]) => {
          elements[element as keyof ElementalProperties] += value * amount;
        });
      }
    });

    return elements;
  }

  private applyCookingMethod(
    elements: ElementalProperties,
    method: string,
    duration: number
  ): ElementalProperties {
    const modifier = cookingMethodModifiers[method];
    if (!modifier) return elements;

    const durationFactor = this.calculateDurationFactor(duration, modifier);

    return {
      Fire: elements.Fire * (1 + modifier.elementalModifier.Fire * durationFactor),
      Water: elements.Water * (1 + modifier.elementalModifier.Water * durationFactor),
      Air: elements.Air * (1 + modifier.elementalModifier.Air * durationFactor),
      Earth: elements.Earth * (1 + modifier.elementalModifier.Earth * durationFactor)
    };
  }

  private calculateDurationFactor(
    duration: number,
    modifier: CookingMethodModifier
  ): number {
    const { min, max } = modifier.duration;
    return Math.min(Math.max((duration - min) / (max - min), 0), 1);
  }

  private applySeasonalInfluence(
    elements: ElementalProperties,
    season: string
  ): ElementalProperties {
    const seasonalMod = SEASONAL_PROPERTIES[season.toLowerCase()];
    if (!seasonalMod) return elements;

    return {
      Fire: elements.Fire * (1 + seasonalMod.elementalModifier.Fire),
      Water: elements.Water * (1 + seasonalMod.elementalModifier.Water),
      Air: elements.Air * (1 + seasonalMod.elementalModifier.Air),
      Earth: elements.Earth * (1 + seasonalMod.elementalModifier.Earth)
    };
  }

  private applyLunarInfluence(
    elements: ElementalProperties,
    phase: string
  ): ElementalProperties {
    const lunarMod = LUNAR_PHASES[phase.toLowerCase()];
    if (!lunarMod) return elements;

    return {
      Fire: elements.Fire * (1 + lunarMod.elementalModifier.Fire),
      Water: elements.Water * (1 + lunarMod.elementalModifier.Water),
      Air: elements.Air * (1 + lunarMod.elementalModifier.Air),
      Earth: elements.Earth * (1 + lunarMod.elementalModifier.Earth)
    };
  }

  private normalizeElements(elements: ElementalProperties): ElementalProperties {
    const total = Object.values(elements).reduce((a, b) => a + b, 0);
    if (total === 0) return elements;

    return {
      Fire: elements.Fire / total,
      Water: elements.Water / total,
      Air: elements.Air / total,
      Earth: elements.Earth / total
    };
  }

  public calculateElementalBalance(
    elements: ElementalProperties,
    cuisine?: string
  ): {
    primary: string;
    secondary: string;
    balance: number;
    harmony: number;
    complexity: number;
    regionalAlignment: number;
  } {
    this.log('Starting elemental balance calculation');
    
    const sorted = Object.entries(elements)
      .sort(([, a], [, b]) => b - a);

    const primary = sorted[0][0];
    const secondary = sorted[1][0];
    
    // Calculate various balance metrics
    const balance = this.calculateBalanceScore(elements);
    const harmony = this.calculateHarmonyScore(elements);
    const complexity = this.calculateComplexityScore(elements);
    const regionalAlignment = cuisine ? 
      this.calculateRegionalAlignment(elements, cuisine) : 1;

    this.log(`Balance metrics calculated:
      Primary: ${primary} (${elements[primary as keyof ElementalProperties]})
      Secondary: ${secondary} (${elements[secondary as keyof ElementalProperties]})
      Balance Score: ${balance}
      Harmony Score: ${harmony}
      Complexity: ${complexity}
      Regional Alignment: ${regionalAlignment}`);

    return {
      primary,
      secondary,
      balance,
      harmony,
      complexity,
      regionalAlignment
    };
  }

  private calculateBalanceScore(elements: ElementalProperties): number {
    const idealBalance = 0.25;
    const deviations = Object.values(elements)
      .map(value => Math.abs(value - idealBalance));
    
    // Weighted balance calculation
    const maxDeviation = deviations.reduce((max, dev) => Math.max(max, dev), 0);
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / 4;
    
    return 1 - ((maxDeviation * 0.6 + avgDeviation * 0.4) / 0.75);
  }

  private calculateHarmonyScore(elements: ElementalProperties): number {
    let harmony = 0;
    const harmoniousPairs = [
      ['Fire', 'Air'],
      ['Water', 'Earth'],
      ['Fire', 'Earth'],
      ['Air', 'Water']
    ];

    harmoniousPairs.forEach(([e1, e2]) => {
      if (elements[e1 as keyof ElementalProperties] > 0 && elements[e2 as keyof ElementalProperties] > 0) {
        harmony += 1;
      }
    });

    return harmony / 4;
  }

  private calculateComplexityScore(elements: ElementalProperties): number {
    const total = Object.values(elements).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    const complexity = Object.values(elements)
      .map(value => Math.abs(value - 0.25))
      .reduce((sum, dev) => sum + dev, 0) / 4;

    return 1 - complexity;
  }

  private calculateRegionalAlignment(elements: ElementalProperties, cuisine: string): number {
    const regionalMod = this.REGIONAL_MODIFIERS[cuisine.toLowerCase()];
    if (!regionalMod) return 1;

    const total = Object.values(elements).reduce((a, b) => a + b, 0);
    if (total === 0) return 1;

    const alignment = Object.entries(regionalMod)
      .map(([element, mod]) => elements[element as keyof ElementalProperties] * mod)
      .reduce((sum, value) => sum + value, 0) / total;

    return alignment;
  }

  public getElementalStrength(
    value: number
  ): 'dominant' | 'significant' | 'present' | 'trace' | 'negligible' {
    if (value >= ELEMENTAL_THRESHOLDS.dominant) return 'dominant';
    if (value >= ELEMENTAL_THRESHOLDS.significant) return 'significant';
    if (value >= ELEMENTAL_THRESHOLDS.present) return 'present';
    if (value >= ELEMENTAL_THRESHOLDS.trace) return 'trace';
    return 'negligible';
  }

  public calculateCompatibility(
    elements1: ElementalProperties,
    elements2: ElementalProperties
  ): number {
    let compatibility = 0;
    const weights = { primary: 0.6, secondary: 0.3, others: 0.1 };

    const balance1 = this.calculateElementalBalance(elements1);
    const balance2 = this.calculateElementalBalance(elements2);

    // Primary element compatibility
    if (balance1.primary === balance2.primary) {
      compatibility += weights.primary;
    } else if (this.areElementsHarmonious(balance1.primary, balance2.primary)) {
      compatibility += weights.primary * 0.7;
    }

    // Secondary element compatibility
    if (balance1.secondary === balance2.secondary) {
      compatibility += weights.secondary;
    } else if (this.areElementsHarmonious(balance1.secondary, balance2.secondary)) {
      compatibility += weights.secondary * 0.7;
    }

    // Overall balance compatibility
    const balanceDiff = Math.abs(balance1.balance - balance2.balance);
    compatibility += weights.others * (1 - balanceDiff);

    return Math.min(Math.max(compatibility, 0), 1);
  }

  private areElementsHarmonious(element1: string, element2: string): boolean {
    const harmoniousPairs = [
      ['Fire', 'Air'],
      ['Water', 'Earth'],
      ['Fire', 'Earth'],
      ['Air', 'Water']
    ];

    return harmoniousPairs.some(([e1, e2]) =>
      (element1 === e1 && element2 === e2) ||
      (element1 === e2 && element2 === e1)
    );
  }

  private log(message: string): void {
    if (this.debugMode) {
      this.logs.push(message);
    }
  }

  // Enhanced Validation Rules
  private validateRecipe(recipe: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required fields validation
    const requiredFields = ['ingredients', 'cookingMethod', 'duration'];
    requiredFields.forEach(field => {
      if (!recipe[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Ingredient validation
    if (recipe.ingredients) {
      recipe.ingredients.forEach((ing: any, index: number) => {
        if (!ing.name || !ing.amount) {
          errors.push(`Invalid ingredient at index ${index}`);
        }
        if (ing.amount <= 0) {
          errors.push(`Invalid amount for ingredient: ${ing.name}`);
        }
        if (!ingredientMappings[ing.name.toLowerCase()]) {
          warnings.push(`Unknown ingredient: ${ing.name}`);
        }
      });

      // Check ingredient combinations
      this.validateIngredientCombinations(recipe.ingredients, warnings, suggestions);
    }

    // Cooking method validation
    if (recipe.cookingMethod) {
      
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private validateIngredientCombinations(
    ingredients: { name: string; amount: number; }[],
    warnings: string[],
    suggestions: string[]
  ): void {
    // Implementation to validate ingredient combinations
  }
}

// Export a singleton instance
export const elementalCalculator = ElementalCalculator.getInstance();
