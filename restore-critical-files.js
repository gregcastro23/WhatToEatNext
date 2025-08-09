#!/usr/bin/env node

import fs from 'fs';

const ALCHEMICAL_ENGINE_TEMPLATE = `import type {
  ElementalProperties,
  LunarPhase,
  ZodiacSign,
  AstrologicalState,
  Recipe,
  Ingredient
} from '@/types/alchemy';
import { ElementalCalculator } from "@/services/ElementalCalculator";
import { getAccuratePlanetaryPositions } from "@/utils/accurateAstronomy";

// Default balanced elemental properties
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

/**
 * Validates that elemental properties are properly structured and normalized
 */
export function validateElementalProperties(properties?: ElementalProperties): boolean {
  if (!properties) return false;

  // Check if all required elements exist
  if (
    typeof properties.Fire !== 'number' ||
    typeof properties.Water !== 'number' ||
    typeof properties.Earth !== 'number' ||
    typeof properties.Air !== 'number'
  ) {
    return false;
  }

  // Check if values are in valid range (0-1)
  if (
    properties.Fire < 0 || properties.Fire > 1 ||
    properties.Water < 0 || properties.Water > 1 ||
    properties.Earth < 0 || properties.Earth > 1 ||
    properties.Air < 0 || properties.Air > 1
  ) {
    return false;
  }

  // Check if sum is approximately 1 (allowing for floating point error)
  const sum = properties.Fire + properties.Water + properties.Earth + properties.Air;
  return Math.abs(sum - 1) < 0.001;
}

export class AlchemicalEngineBase {
  private readonly elementalAffinities: Record<string, string[]> = {
    Fire: ['Air'],
    Air: ['Water'],
    Water: ['Earth'],
    Earth: ['Fire']
  };

  private readonly elementalStrengths: { [key: string]: number } = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1
  };

  private readonly zodiacElements: Record<ZodiacSign, {
    baseElement: keyof ElementalProperties;
    decans: Array<{
      degrees: [number, number];
      element: keyof ElementalProperties;
      ruler: string;
    }>;
  }> = {
    aries: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' }
      ]
    },
    taurus: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' }
      ]
    },
    gemini: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Venus' },
        { degrees: [20, 30], element: 'Air', ruler: 'Uranus' }
      ]
    },
    cancer: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Pluto' },
        { degrees: [20, 30], element: 'Water', ruler: 'Neptune' }
      ]
    },
    leo: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Sun' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Jupiter' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Mars' }
      ]
    },
    virgo: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Saturn' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Venus' }
      ]
    },
    libra: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Air', ruler: 'Uranus' },
        { degrees: [20, 30], element: 'Air', ruler: 'Mercury' }
      ]
    },
    scorpio: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Pluto' },
        { degrees: [10, 20], element: 'Water', ruler: 'Neptune' },
        { degrees: [20, 30], element: 'Water', ruler: 'Moon' }
      ]
    },
    sagittarius: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Jupiter' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Mars' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Sun' }
      ]
    },
    capricorn: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Saturn' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Venus' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Mercury' }
      ]
    },
    aquarius: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Uranus' },
        { degrees: [10, 20], element: 'Air', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Air', ruler: 'Venus' }
      ]
    },
    pisces: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Neptune' },
        { degrees: [10, 20], element: 'Water', ruler: 'Moon' },
        { degrees: [20, 30], element: 'Water', ruler: 'Pluto' }
      ]
    }
  };

  private readonly lunarPhaseModifiers: Record<LunarPhase, ElementalProperties> = {
    'new Moon': { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    'waxing crescent': { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    'first quarter': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'waxing gibbous': { Fire: 0.4, Water: 0.1, Air: 0.3, Earth: 0.2 },
    'full Moon': { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    'waning gibbous': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'last quarter': { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    'waning crescent': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
  };

  private readonly seasonalModifiers: { [key: string]: ElementalProperties } = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
  };

  private calculator: ElementalCalculator;
  private availableRecipes: Recipe[] = [];

  constructor() {
    this.calculator = new ElementalCalculator();
  }

  calculateElementalHarmony(
    recipeElements: ElementalProperties,
    userElements: ElementalProperties,
    astrologicalState: AstrologicalState,
    season: string
  ): number {
    const harmony = this.calculateHarmonyBetween(recipeElements, userElements);
    const astroModifier = this.getAstrologicalModifiers(astrologicalState);
    const seasonModifier = this.seasonalModifiers[season] || this.seasonalModifiers.spring;

    // Apply modifiers
    const modifiedHarmony = harmony * 0.6 +
      this.calculateHarmonyBetween(recipeElements, astroModifier) * 0.25 +
      this.calculateHarmonyBetween(recipeElements, seasonModifier) * 0.15;

    return Math.max(0, Math.min(1, modifiedHarmony));
  }

  private calculateHarmonyBetween(props1: ElementalProperties, props2: ElementalProperties): number {
    const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
    let totalHarmony = 0;

    for (const element of elements) {
      const diff = Math.abs(props1[element] - props2[element]);
      const harmony = 1 - diff;
      totalHarmony += harmony;
    }

    return totalHarmony / elements.length;
  }

  private getAstrologicalModifiers(astrologicalState: AstrologicalState): ElementalProperties {
    // Simplified astrological influence calculation
    const { sunSign, moonPhase } = astrologicalState;
    const sunElement = this.zodiacElements[sunSign]?.baseElement || 'Fire';
    const moonModifier = this.lunarPhaseModifiers[moonPhase] || this.lunarPhaseModifiers['new Moon'];

    // Blend Sunsun and Moonmoon influences
    const modifiers = { ...DEFAULT_ELEMENTAL_PROPERTIES };
    modifiers[sunElement] += 0.1;

    // Apply lunar phase modifiers
    for (const element of Object.keys(modifiers) as (keyof ElementalProperties)[]) {
      modifiers[element] = (modifiers[element] + moonModifier[element]) / 2;
    }

    return modifiers;
  }

  calculateRecipeHarmony(recipe: Recipe): number {
    if (!recipe.elementalProperties) {
      return 0.5; // Default neutral harmony
    }

    return this.calculateHarmonyScore(recipe.elementalProperties);
  }

  private calculateHarmonyScore(elements: ElementalProperties): number {
    const values = Object.values(elements);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    // Lower variance indicates better balance/harmony
    return Math.max(0, 1 - variance * 4);
  }

  setAvailableRecipes(recipes: Recipe[]) {
    this.availableRecipes = recipes;
  }

  calculateElementalState(recipe: Recipe): ElementalProperties {
    if (recipe.elementalProperties) {
      return recipe.elementalProperties;
    }

    // Calculate from ingredients if available
    if (recipe.ingredients?.length) {
      return this.calculator.calculateFromIngredients(recipe.ingredients);
    }

    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  async getCurrentPlanetaryPositions(): Promise<Record<string, any>> {
    try {
      return await getAccuratePlanetaryPositions();
    } catch (error) {
      console.error('Error getting planetary positions:', error);
      return {};
    }
  }
}

export default AlchemicalEngineBase;
`;

const ELEMENTAL_UTILS_TEMPLATE = `import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type {
  ElementalProperties,
  Recipe,
  Element,
  ElementalProfile,
  ElementalCharacteristics
} from '@/types/alchemy';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ErrorHandler } from '@/services/errorHandler';

/**
 * Validates that elemental properties contain valid values
 */
export const validateElementalProperties = (properties: ElementalProperties): boolean => {
  if (!properties) {
    ErrorHandler.warnNullValue('properties', 'validateElementalProperties');
    return false;
  }

  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of requiredElements) {
    if (typeof properties[element] !== 'number') {
      ErrorHandler.warnNullValue(\`properties.\${element}\`, 'validateElementalProperties');
      return false;
    }

    if (properties[element] < 0 || properties[element] > 1) {
      return false;
    }
  }

  return true;
};

/**
 * Normalizes elemental properties to ensure they sum to 1
 */
export const normalizeProperties = (properties: Partial<ElementalProperties>): ElementalProperties => {
  if (!properties) {
    ErrorHandler.warnNullValue('properties', 'normalizeProperties');
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  const completeProperties: ElementalProperties = {
    Fire: properties?.Fire ?? DEFAULT_ELEMENTAL_PROPERTIES.Fire,
    Water: properties?.Water ?? DEFAULT_ELEMENTAL_PROPERTIES.Water,
    Earth: properties?.Earth ?? DEFAULT_ELEMENTAL_PROPERTIES.Earth,
    Air: properties?.Air ?? DEFAULT_ELEMENTAL_PROPERTIES.Air
  };

  const sum = Object.values(completeProperties).reduce((acc, val) => acc + val, 0);

  if (sum === 0) {
    ErrorHandler.warnNullValue('properties (sum is 0)', 'normalizeProperties');
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  // Normalize each value
  const normalized: ElementalProperties = {
    Fire: completeProperties.Fire / sum,
    Water: completeProperties.Water / sum,
    Earth: completeProperties.Earth / sum,
    Air: completeProperties.Air / sum
  };

  return normalized;
};

/**
 * Standardizes elemental properties for recipes
 */
export function standardizeRecipeElements<T extends { elementalProperties?: Partial<ElementalProperties> }>(
  recipe: T | null | undefined
): T & { elementalProperties: ElementalProperties } {
  if (!recipe) {
    ErrorHandler.warnNullValue('recipe', 'standardizeRecipeElements');
    return {
      elementalProperties: { ...DEFAULT_ELEMENTAL_PROPERTIES }
    } as T & { elementalProperties: ElementalProperties };
  }

  if (!recipe.elementalProperties) {
    const currentState = ElementalCalculator.getCurrentElementalState();
    return {
      ...recipe,
      elementalProperties: currentState
    };
  }

  return {
    ...recipe,
    elementalProperties: normalizeProperties(recipe.elementalProperties)
  };
}

/**
 * Gets elements that are missing or significantly lower than ideal balance
 */
export function getMissingElements(properties: Partial<ElementalProperties> | null | undefined): Element[] {
  const threshold = 0.15;
  const missingElements: Element[] = [];

  if (!properties) {
    ErrorHandler.warnNullValue('properties', 'getMissingElements');
    return ['Fire', 'Water', 'Earth', 'Air'];
  }

  const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of elements) {
    const value = properties[element];
    if (typeof value !== 'number' || value < threshold) {
      missingElements.push(element);
    }
  }

  return missingElements;
}

export const elementalUtils = {
  validateProperties: validateElementalProperties,
  normalizeProperties,
  standardizeRecipeElements,
  getMissingElements,

  calculateElementalState(recipe: Recipe | null | undefined): ElementalProperties {
    if (!recipe?.ingredients?.length) {
      return ElementalCalculator.getCurrentElementalState();
    }

    return ElementalCalculator.calculateFromIngredients(recipe.ingredients);
  },

  combineProperties(a: ElementalProperties, b: ElementalProperties, bWeight = 0.5): ElementalProperties {
    const aWeight = 1 - bWeight;
    return {
      Fire: a.Fire * aWeight + b.Fire * bWeight,
      Water: a.Water * aWeight + b.Water * bWeight,
      Earth: a.Earth * aWeight + b.Earth * bWeight,
      Air: a.Air * aWeight + b.Air * bWeight
    };
  },

  getElementalState(recipe: Recipe): ElementalProperties {
    if (recipe.elementalProperties) {
      return recipe.elementalProperties;
    }

    if (recipe.ingredients?.length) {
      return ElementalCalculator.calculateFromIngredients(recipe.ingredients);
    }

    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  },

  getComplementaryElement(element: keyof ElementalProperties): keyof ElementalProperties {
    // Each element complements itself most strongly (as per workspace rules)
    return element;
  },

  getElementalCharacteristics(element: Element): ElementalCharacteristics {
    const characteristics: Record<Element, ElementalCharacteristics> = {
      Fire: {
        energy: 'dynamic',
        temperature: 'hot',
        moisture: 'dry',
        season: 'summer',
        direction: 'south',
        qualities: ['active', 'masculine', 'creative', 'transformative']
      },
      Water: {
        energy: 'receptive',
        temperature: 'cold',
        moisture: 'wet',
        season: 'winter',
        direction: 'west',
        qualities: ['passive', 'feminine', 'emotional', 'healing']
      },
      Earth: {
        energy: 'stable',
        temperature: 'cold',
        moisture: 'dry',
        season: 'autumn',
        direction: 'north',
        qualities: ['grounding', 'practical', 'nurturing', 'material']
      },
      Air: {
        energy: 'mobile',
        temperature: 'hot',
        moisture: 'wet',
        season: 'spring',
        direction: 'east',
        qualities: ['mental', 'communicative', 'flexible', 'intellectual']
      }
    };

    return characteristics[element];
  },

  getElementalProfile(properties: ElementalProperties): Partial<ElementalProfile> {
    const dominant = Object.entries(properties)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([element]) => element as Element);

    return {
      dominantElements: dominant,
      balance: this.calculateBalance(properties),
      harmony: this.calculateHarmony(properties)
    };
  },

  calculateBalance(properties: ElementalProperties): number {
    const values = Object.values(properties);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.max(0, 1 - variance * 4);
  },

  calculateHarmony(properties: ElementalProperties): number {
    // Calculate harmony based on elemental relationships
    const fireAir = Math.min(properties.Fire, properties.Air);
    const waterEarth = Math.min(properties.Water, properties.Earth);
    return (fireAir + waterEarth) / 2;
  },

  getSuggestedCookingTechniques(properties: ElementalProperties): string[] {
    const techniques: string[] = [];

    if (properties.Fire > 0.3) {
      techniques.push('grilling', 'roasting', 'searing');
    }
    if (properties.Water > 0.3) {
      techniques.push('steaming', 'poaching', 'braising');
    }
    if (properties.Earth > 0.3) {
      techniques.push('slow cooking', 'baking', 'clay pot cooking');
    }
    if (properties.Air > 0.3) {
      techniques.push('smoking', 'dehydrating', 'whipping');
    }

    return techniques;
  },

  getRecommendedTimeOfDay(properties: ElementalProperties): string[] {
    const times: string[] = [];

    if (properties.Fire > 0.3) {
      times.push('noon', 'afternoon');
    }
    if (properties.Water > 0.3) {
      times.push('evening', 'night');
    }
    if (properties.Earth > 0.3) {
      times.push('early morning', 'late evening');
    }
    if (properties.Air > 0.3) {
      times.push('morning', 'dawn');
    }

    return times;
  },

  getDefaultElementalProperties(): ElementalProperties {
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }
};

export default elementalUtils;
`;

function createRestoreScript() {
  console.log('🔧 Creating restoration script for critical files...');

  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    console.log('📋 DRY RUN MODE - No files will be modified');
    console.log('Files to restore:');
    console.log('  - src/lib/alchemicalEngine.ts (192 errors)');
    console.log('  - src/utils/elementalUtils.ts (74 errors)');
    return;
  }

  try {
    // Backup existing files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Restore alchemicalEngine.ts
    const alchemicalEnginePath = 'src/lib/alchemicalEngine.ts';
    if (fs.existsSync(alchemicalEnginePath)) {
      fs.copyFileSync(alchemicalEnginePath, `${alchemicalEnginePath}.backup-${timestamp}`);
    }
    fs.writeFileSync(alchemicalEnginePath, ALCHEMICAL_ENGINE_TEMPLATE);
    console.log('✅ Restored src/lib/alchemicalEngine.ts');

    // Restore elementalUtils.ts
    const elementalUtilsPath = 'src/utils/elementalUtils.ts';
    if (fs.existsSync(elementalUtilsPath)) {
      fs.copyFileSync(elementalUtilsPath, `${elementalUtilsPath}.backup-${timestamp}`);
    }
    fs.writeFileSync(elementalUtilsPath, ELEMENTAL_UTILS_TEMPLATE);
    console.log('✅ Restored src/utils/elementalUtils.ts');

    console.log('🎉 Critical file restoration complete!');
    console.log('📊 Expected error reduction: ~266 errors');
    console.log('🔨 Run "yarn build" to verify fixes');
  } catch (error) {
    console.error('❌ Error during restoration:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createRestoreScript();
}
