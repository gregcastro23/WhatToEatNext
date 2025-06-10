// src/utils/elementalUtils.ts

import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type {
  ElementalProperties,
  Recipe,
  ElementalAffinity,
  IngredientMapping,
  ElementalCharacteristics,
  Element,
  ElementalProfile,
} from '@/types/alchemy';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { validators } from '@/types/validators';
import {
  elements,
  elementalInteractions,
  elementalFunctions,
} from './elementalMappings';
import {
  ElementalItem,
  AlchemicalItem,
} from '@/types/alchemy';
import { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
import {
  LunarPhase,
  calculatePlanetaryBoost,
} from '@/constants/planetaryFoodAssociations';
import { DEFAULT_PROPERTIES } from '@/constants/defaults';
import { 
  isElementalProperties, 
  isElementalPropertyKey, 
  logUnexpectedValue 
} from '@/utils/validation';
import { ErrorHandler } from '@/services/errorHandler';

// Define missing AlchemicalProperty type

// Missing ELEMENTAL_CHARACTERISTICS constant
const ELEMENTAL_CHARACTERISTICS = {
  Fire: {
    cookingTechniques: ['grilling', 'roasting', 'searing', 'flambéing'],
    timeOfDay: ['morning', 'noon'],
    qualities: ['energetic', 'transformative', 'intense'],
    temperature: 'hot'
  },
  Water: {
    cookingTechniques: ['boiling', 'steaming', 'poaching', 'braising'],
    timeOfDay: ['evening', 'night'],
    qualities: ['flowing', 'cooling', 'nurturing'],
    temperature: 'cool'
  },
  Earth: {
    cookingTechniques: ['baking', 'slow-cooking', 'roasting', 'smoking'],
    timeOfDay: ['afternoon', 'evening'],
    qualities: ['grounding', 'stable', 'nourishing'],
    temperature: 'moderate'
  },
  Air: {
    cookingTechniques: ['whipping', 'frying', 'sautéing', 'dehydrating'],
    timeOfDay: ['morning', 'midday'],
    qualities: ['light', 'airy', 'quick'],
    temperature: 'variable'
  }
};

type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';

/**
 * Validates that elemental properties contain valid values
 * @param properties The elemental properties to validate
 * @returns True if properties are valid, false otherwise
 */
export let validateElementalProperties = (
  properties: ElementalProperties
): boolean => {
  // If properties is null or undefined, return false immediately
  if (!properties) {
    console.warn('Warning: properties is null or undefined in validateElementalProperties');
    return false;
  }

  // Check if all required elements exist
  let requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of requiredElements) {
    if (typeof properties[element] !== 'number') {
      console.warn(`Warning: properties.${element} is not a number in validateElementalProperties`);
      return false;
    }

    // Check if values are between 0 and 1
    if (properties[element] < 0 || properties[element] > 1) {
      logUnexpectedValue('validateElementalProperties', {
        message: `Element value out of range: ${element} = ${properties[element]}`,
        element,
        value: properties[element],
      });
      return false;
    }
  }

  // Optionally check if properties sum to 1 (or close to it due to floating point)
  let sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
  let isCloseToOne = Math.abs(sum - 1) < 0.01;

  if (!isCloseToOne) {
    logUnexpectedValue('validateElementalProperties', {
      message: `Elemental properties do not sum to 1: ${sum}`,
      sum,
      properties,
    });
  }

  return true;
};

/**
 * Normalizes elemental properties to ensure they sum to 1
 * @param properties The elemental properties to normalize
 * @returns Normalized elemental properties
 */
export let normalizeProperties = (
  properties: Partial<ElementalProperties>
): ElementalProperties => {
  // Handle null or undefined
  if (!properties) {
    console.warn('Warning: properties is null or undefined in normalizeProperties');
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  // Fill in any missing properties with defaults
  const completeProperties: ElementalProperties = {
    Fire: properties.Fire ?? DEFAULT_ELEMENTAL_PROPERTIES.Fire,
    Water: properties.Water ?? DEFAULT_ELEMENTAL_PROPERTIES.Water,
    Earth: properties.Earth ?? DEFAULT_ELEMENTAL_PROPERTIES.Earth,
    Air: properties.Air ?? DEFAULT_ELEMENTAL_PROPERTIES.Air,
  };

  let sum = Object.values(completeProperties).reduce((acc, val) => acc + val, 0);

  if (sum === 0) {
    // If sum is 0, return balanced default
    console.warn('Warning: properties sum is 0 in normalizeProperties');
    return { ...DEFAULT_ELEMENTAL_PROPERTIES };
  }

  // Normalize each value
  return Object.entries(completeProperties).reduce((acc, [key, value]) => {
    if (isElementalPropertyKey(key)) {
      acc[key] = value /sum;
    } else {
      // This shouldn't happen with the type-safety above, but just in case
      console.warn(`Warning: invalid key ${key} in normalizeProperties`);
    }
    return acc;
  }, { ...DEFAULT_ELEMENTAL_PROPERTIES });
};

/**
 * Standardizes elemental properties for recipes, ensuring all recipes have
 * properly normalized elemental values
 * @param recipe The recipe to standardize
 * @returns Recipe with standardized elemental properties
 */
export let standardizeRecipeElements = <
  T extends { elementalProperties?: Partial<ElementalProperties> }
>(
  recipe: T | null | undefined
): T & { elementalProperties: ElementalProperties } => {
  // Handle null /undefined recipe
  if (!recipe) {
    console.warn('Warning: recipe is null or undefined in standardizeRecipeElements');
    return {
      elementalProperties: { ...DEFAULT_ELEMENTAL_PROPERTIES }
    } as T & { elementalProperties: ElementalProperties };
  }

  // If recipe doesn't have elemental properties, use current elemental state
  if (!recipe.elementalProperties) {
    let currentState = ElementalCalculator.getCurrentElementalState();
    return {
      ...recipe,
      elementalProperties: currentState,
    };
  }

  // Normalize properties to ensure they sum to 1
  return {
    ...recipe,
    elementalProperties: normalizeProperties(recipe.elementalProperties),
  };
};

export let validateElementalRequirements = (
  properties: unknown
): properties is ElementalProperties => {
  return isElementalProperties(properties);
};

/**
 * Gets the elements that are missing or significantly lower than ideal balance in the provided properties
 * @param properties The elemental properties to check
 * @returns Array of elements that are missing or significantly low
 */
export let getMissingElements = (
  properties: Partial<ElementalProperties> | null | undefined
): Element[] => {
  let threshold = 0.15; // Elements below this are considered "missing"
  const missingElements: Element[] = [];

  // Check for null /undefined
  if (!properties) {
    console.warn('Warning: properties is null or undefined in getMissingElements');
    return ['Fire', 'Water', 'Earth', 'Air']; // Return all elements as missing
  }

  // Check each element
  const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of elements) {
    let value = properties[element];
    if (typeof value !== 'number' || value < threshold) {
      missingElements.push(element);
    }
  }

  return missingElements;
};

export let elementalUtils = {
  validateProperties: validateElementalRequirements,
  normalizeProperties: normalizeProperties,
  standardizeRecipeElements: standardizeRecipeElements,
  getMissingElements,

  calculateelementalState(recipe: Recipe | null | undefined): ElementalProperties {
    if (!recipe?.ingredients?.length) {
      return ElementalCalculator.getCurrentElementalState();
    }

    // Create a safe default balance to start
    const balance: ElementalProperties = { ...DEFAULT_ELEMENTAL_PROPERTIES };
    
    // Get total amount for percentage calculations
    let totalAmount = recipe.ingredients.reduce((sum, ing) => {
      let amount = ing.amount ?? 1; // Default to 1 if amount is missing
      return sum + amount;
    }, 0);

    // Handle the special case where there are no ingredients with amount
    if (totalAmount === 0) {
      return balance;
    }

    // Initialize balance with 0 values
    Object.keys(balance).forEach(el => {
      if (isElementalPropertyKey(el)) {
        balance[el] = 0;
      }
    });

    // Process each ingredient
    recipe.ingredients.forEach(ing => {
      const amount = ing.amount ?? 1; // Default to 1 if amount is missing
      
      if (ing.elementalProperties) {
        // For each element in the ingredient
        Object.entries(ing.elementalProperties).forEach(([element, value]) => {
          if (isElementalPropertyKey(element)) {
            balance[element] += (value * amount) /totalAmount;
          }
        });
      }
    });

    // Normalize to ensure they sum to 1
    return normalizeProperties(balance);
  },

  combineProperties(
    a: ElementalProperties,
    b: ElementalProperties,
    bWeight = 0.5
  ): ElementalProperties {
    let combinedProps = {} as ElementalProperties;
    let aWeight = 1 - bWeight;

    Object.keys(a).forEach((key) => {
      let element = key as keyof ElementalProperties;
      combinedProps[element] =
        a[element] * aWeight + (b[element] || 0) * bWeight;
    });

    return combinedProps;
  },

  getelementalState(recipe: Recipe): ElementalProperties {
    if (!recipe.ingredients?.length) {
      return ElementalCalculator.getCurrentElementalState();
    }

    let combinedProperties = recipe.ingredients.reduce(
      (acc, ingredient) => {
        const props =
          ingredient.elementalProperties ||
          ElementalCalculator.getCurrentElementalState();
        return {
          Fire: acc.Fire + props.Fire,
          Water: acc.Water + props.Water,
          Earth: acc.Earth + props.Earth,
          Air: acc.Air + props.Air,
        };
      },
      { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    );

    return normalizeProperties(combinedProperties);
  },

  /**
   * Gets a complementary element that works well with the given element
   * All elements work well together in their own way
   * @param element The element to find a complement for
   * @returns The complementary element
   */
  getComplementaryElement(
    element: keyof ElementalProperties
  ): keyof ElementalProperties {
    // Each element complements all others, but we return one suggestion
    // based on traditional culinary pairings
    const complementary: Record<
      keyof ElementalProperties,
      keyof ElementalProperties
    > = {
      Fire: 'Fire', // Fire reinforces itself
      Water: 'Water', // Water reinforces itself
      Earth: 'Earth', // Earth reinforces itself
      Air: 'Air', // Air reinforces itself
    };
    return complementary[element];
  },

  /**
   * Gets the elemental characteristics for a specific element
   * @param element The element to get characteristics for
   * @returns The elemental characteristics
   */
  getElementalCharacteristics(element: Element): ElementalCharacteristics {
    return ELEMENTAL_CHARACTERISTICS[element] as ElementalCharacteristics;
  },

  /**
   * Gets a complete elemental profile that includes properties and characteristics
   * @param properties The elemental properties
   * @returns A complete elemental profile
   */
  getElementalProfile(
    properties: ElementalProperties
  ): Partial<ElementalProfile> {
    // Find the dominant element
    let entries = Object.entries(properties) as [Element, number][];
    let dominantElement: Element = 'Fire';
    let maxValue = 0;

    for (const [element, value] of entries) {
      if (value > maxValue) {
        dominantElement = element;
        maxValue = value;
      }
    }

    return {
      properties,
      characteristics: this.getElementalCharacteristics(dominantElement),
    };
  },

  /**
   * Gets the suggested cooking techniques based on elemental properties
   * @param properties The elemental properties
   * @returns Array of recommended cooking techniques
   */
  getSuggestedCookingTechniques(properties: ElementalProperties): string[] {
    const techniques: string[] = [];
    let threshold = 0.3; // Only consider elements above this threshold for recommendations

    if (properties.Fire > threshold) {
      techniques.push(
        ...ELEMENTAL_CHARACTERISTICS.Fire.cookingTechniques.slice(0, 2)
      );
    }

    if (properties.Water > threshold) {
      techniques.push(
        ...ELEMENTAL_CHARACTERISTICS.Water.cookingTechniques.slice(0, 2)
      );
    }

    if (properties.Earth > threshold) {
      techniques.push(
        ...ELEMENTAL_CHARACTERISTICS.Earth.cookingTechniques.slice(0, 2)
      );
    }

    if (properties.Air > threshold) {
      techniques.push(
        ...ELEMENTAL_CHARACTERISTICS.Air.cookingTechniques.slice(0, 2)
      );
    }

    // Return unique techniques or a default if none meet the threshold
    return techniques.length > 0
      ? Array.from(new Set(techniques))
      : ['Balanced cooking'];
  },

  /**
   * Gets the complementary ingredients based on elemental properties
   * @param properties The elemental properties
   * @returns Array of recommended complementary ingredients
   */
  getRecommendedTimeOfDay(properties: ElementalProperties): string[] {
    const times: string[] = [];
    let threshold = 0.3; // Only consider elements above this threshold for recommendations
    const weightedTimes: string[] = [];

    // Add times based on the elemental balance, weighted by their values
    if (properties.Fire > threshold) {
      for (let i = 0; i < Math.ceil(properties.Fire * 10); i++) {
        weightedTimes.push(...ELEMENTAL_CHARACTERISTICS.Fire.timeOfDay);
      }
    }

    if (properties.Water > threshold) {
      for (let i = 0; i < Math.ceil(properties.Water * 10); i++) {
        weightedTimes.push(...ELEMENTAL_CHARACTERISTICS.Water.timeOfDay);
      }
    }

    if (properties.Earth > threshold) {
      for (let i = 0; i < Math.ceil(properties.Earth * 10); i++) {
        weightedTimes.push(...ELEMENTAL_CHARACTERISTICS.Earth.timeOfDay);
      }
    }

    if (properties.Air > threshold) {
      for (let i = 0; i < Math.ceil(properties.Air * 10); i++) {
        weightedTimes.push(...ELEMENTAL_CHARACTERISTICS.Air.timeOfDay);
      }
    }

    // Return unique times or a default if none meet the threshold
    return weightedTimes.length > 0
      ? Array.from(new Set(weightedTimes))
      : ['Any time'];
  },

  // Get the default elemental properties
  getDefaultElementalProperties(): ElementalProperties {
    return DEFAULT_ELEMENTAL_PROPERTIES;
  },
};

export default elementalUtils;

export { elements, elementalInteractions, elementalFunctions };

/**
 * Transform a list of elemental items based on planetary positions
 *
 * @param items Items to transform
 * @param planetaryPositions Current planetary positions
 * @param isDaytime Whether it is currently day
 * @param currentZodiac Current zodiac sign
 * @param lunarPhase Current lunar phase
 * @param elementalBoosts Optional elemental boosts to apply
 * @param planetaryBoosts Optional planetary boosts to apply
 * @returns Transformed alchemical items
 */
let ELEMENT_WEIGHTS = {
  Fire: 1.8,
  Water: 1.2,
  Earth: 0.9,
  Air: 1.5,
};

// Add this function if uniqueness score is needed
function calculateUniqueness(
  elements: Record<ElementalCharacter, number>,
  planetaryInfluence: number
): number {
  // Calculate variance of elemental properties
  let values = Object.values(elements);
  let mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  let variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;

  // Combine with planetary influence
  return Math.min(1, variance * (1 + planetaryInfluence));
}

// Or modify the transformation to remove uniqueness score if not needed
export function transformItemsWithPlanetaryPositions(
  items: ElementalItem[],
  planetaryPositions: Record<string, unknown>,
  isDaytime = true,
  currentZodiac?: string,
  lunarPhase?: LunarPhase,
  tarotElementBoosts?: Record<ElementalCharacter, number>,
  tarotPlanetaryBoosts?: Record<string, number>
): AlchemicalItem[] {
  return items.map((item) => {
    const { boost: planetaryInfluence } = calculatePlanetaryBoost(
      item,
      planetaryPositions,
      currentZodiac,
      lunarPhase
    );

    // Scale elemental properties
    let scaledElements = Object.fromEntries(
      Object.entries(item.elementalProperties).map(([element, value]) => [
        element,
        value * (1 + (planetaryInfluence || 0)),
      ])
    ) as Record<ElementalCharacter, number>;

    // Calculate alchemical properties from elemental properties
    // This follows the same relationships as in the alchemical system:
    // - Spirit is related to Fire (transformation) and Air (connection)
    // - Essence is related to Water (fluidity) and Fire (vitality)
    // - Matter is related to Earth (stability) and Water (cohesion)
    // - Substance is related to Air (structure) and Earth (form)
    let spirit = scaledElements.Fire * 0.6 + scaledElements.Air * 0.4;
    let essence = scaledElements.Water * 0.6 + scaledElements.Fire * 0.4;
    let matter = scaledElements.Earth * 0.7 + scaledElements.Water * 0.3;
    let substance = scaledElements.Air * 0.6 + scaledElements.Earth * 0.4;

    // Apply tarot boosts if available
    let boostedSpirit = spirit * (tarotPlanetaryBoosts?.Spirit || 1.0);
    let boostedEssence = essence * (tarotPlanetaryBoosts?.Essence || 1.0);
    let boostedMatter = matter * (tarotPlanetaryBoosts?.Matter || 1.0);
    let boostedSubstance =
      substance * (tarotPlanetaryBoosts?.Substance || 1.0);

    // Calculate energy metrics using the formulas from alchemicalCalculations.ts
    let fire = scaledElements.Fire;
    let water = scaledElements.Water;
    let air = scaledElements.Air;
    let earth = scaledElements.Earth;

    // Ensure we have non-zero values for denominator
    let safeValue = (val: number) => Math.max(val, 0.01);

    // Heat formula: (spirit^2 + fire^2) / ((substance || 1) + essence + matter + water + air + earth)^2
    let heat =
      (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(fire), 2)) / 
      Math.pow(safeValue(boostedSubstance + boostedEssence + boostedMatter + water + air + earth), 2);

    // Entropy formula: (spirit^2 + substance^2 + fire^2 + air^2) / ((essence || 1) + matter + earth + water)^2
    let entropy =
      (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(boostedSubstance), 2) + 
      Math.pow(safeValue(fire), 2) + Math.pow(safeValue(air), 2)) / 
      Math.pow(safeValue(boostedEssence + boostedMatter + earth + water), 2);

    // Reactivity formula: (spirit^2 + substance^2 + essence^2 + fire^2 + air^2 + water^2) / ((matter || 1) + earth)^2
    let reactivity =
      (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(boostedSubstance), 2) + 
      Math.pow(safeValue(boostedEssence), 2) + Math.pow(safeValue(fire), 2) + 
      Math.pow(safeValue(air), 2) + Math.pow(safeValue(water), 2)) / 
      Math.pow(safeValue(boostedMatter + earth), 2);

    // Greg's Energy formula with consistent scaling
    let rawGregsEnergy = heat - reactivity * entropy;
    let scaledGregsEnergy = (rawGregsEnergy + 1) / 2; // Convert from range (-1,1) to (0,1)
    let gregsEnergy = Math.max(0.1, Math.min(1.0, scaledGregsEnergy));

    // Normalize all energy values to ensure they're in the 0-1 range
    let normalizedHeat = Math.max(0.1, Math.min(1.0, heat));
    let normalizedEntropy = Math.max(0.1, Math.min(1.0, entropy));
    let normalizedReactivity = Math.max(0.1, Math.min(1.0, reactivity));

    // Calculate dominant element based on scaled elements
    let dominantElement = Object.entries(scaledElements).sort(
      ([_keyA, valueA], [_keyB, valueB]) => valueB - valueA
    )[0][0] as ElementalCharacter;

    // Calculate dominant alchemical property
    let alchemicalProperties = {
      Spirit: boostedSpirit,
      Essence: boostedEssence,
      Matter: boostedMatter,
      Substance: boostedSubstance,
    };
    let dominantAlchemicalProperty = Object.entries(
      alchemicalProperties
    ).sort(
      ([_keyA, valueA], [_keyB, valueB]) => valueB - valueA
    )[0][0] as AlchemicalProperty;

    // Extract dominant planets based on planetary positions if available
    let dominantPlanets: string[] = [];
    if (planetaryPositions) {
      // Get top 3 planets with highest values or dignity
      let planetEntries = Object.entries(planetaryPositions).filter(
        ([planet, _]) => planet !== 'isDaytime' && planet !== 'currentZodiac'
      );

      // Handle different position data formats
      dominantPlanets = planetEntries
        .sort(([_, valA], [__, valB]) => {
          // Sort by strength /dignity if available
          if (typeof valA === 'object' && typeof valB === 'object') {
            const dataA = valA as any;
            const dataB = valB as any;
            let strengthA = dataA?.strength || 0;
            let strengthB = dataB?.strength || 0;
            return strengthB - strengthA;
          }
          // Default sort for simple numeric values
          return Number(valB) - Number(valA);
        })
        .slice(0, 3)
        .map(([planet, _]) => planet);
    }

    // Ensure we have planetary dignities data
    let planetaryDignities = {};

    // Handle NaN values or infinity for all properties
    let ensureSafeNumber = (val: number): number => {
      if (isNaN(val) || !isFinite(val)) return 0.2;
      return val;
    };

    return {
      id: item.id,
      name: item.name,
      elementalProperties: item.elementalProperties,
      transformedElementalProperties: scaledElements,
      alchemicalProperties: {
        Spirit: boostedSpirit,
        Essence: boostedEssence,
        Matter: boostedMatter,
        Substance: boostedSubstance,
      },
      heat: normalizedHeat,
      entropy: normalizedEntropy,
      reactivity: normalizedReactivity,
      gregsEnergy: gregsEnergy,
      dominantElement,
      dominantAlchemicalProperty,
      planetaryBoost: planetaryInfluence,
      dominantPlanets,
      planetaryDignities,
    };
  });
}

// New differentiation functions
let applyNonLinearScaling = (
  props: ElementalProperties
): ElementalProperties => ({
  Fire: Math.tanh(props.Fire * 2),
  Water: 1 - Math.exp(-props.Water * 3),
  Earth: props.Earth ** 1.5,
  Air: Math.sin((props.Air * Math.PI) / 2),
});

let calculateUniquenessScore = (item: ElementalItem): number => {
  const variance = Object.values(item.elementalProperties).reduce(
    (acc: number, val: number) => acc + Math.abs(val - 0.5),
    0
  );
  return Math.min(1, variance * 2);
};

// Add or update the normalizeElementalValues function
export function normalizeElementalValues(
  values: Record<ElementalCharacter, number>
): Record<ElementalCharacter, number> {
  let total = Object.values(values).reduce((sum, val) => sum + val, 0);

  // If total is zero or close to zero, return default distribution
  if (total < 0.01) {
    return {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
  }

  // Normalize values to sum to 1.0
  return {
    Fire: values.Fire /total,
    Water: values.Water /total,
    Earth: values.Earth /total,
    Air: values.Air /total,
  };
}

// Get the primary element regardless of format
export function getPrimaryElement(
  elementalAffinity: ElementalAffinity
): string {
  const affinityData = elementalAffinity as any;
  return (
    affinityData?.base || affinityData?.element || 'Fire'
  );
}

// Get element strength if available
export function getElementStrength(
  elementalAffinity: ElementalAffinity
): number {
  const affinityData = elementalAffinity as any;
  return affinityData?.strength || 1;
}

/**
 * Ensures all required elemental properties are present
 * @param properties The elemental properties to validate and complete
 * @returns Complete elemental properties
 */
export let ensureCompleteElementalProperties = (
  properties: Partial<ElementalProperties>
): ElementalProperties => {
  return {
    Fire: properties.Fire ?? 0.25,
    Water: properties.Water ?? 0.25,
    Earth: properties.Earth ?? 0.25,
    Air: properties.Air ?? 0.25,
  };
};

/**
 * Ensures the IngredientMapping has a name property (derived from its key if needed)
 * @param mapping The ingredient mapping to fix
 * @param key The object key (ingredient ID)
 * @returns Complete IngredientMapping with name
 */
export let fixIngredientMapping = (
  mapping: Partial<IngredientMapping>,
  key: string
): IngredientMapping => {
  // Format key into a readable name if no name is provided
  const formattedName = key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Ensure all required elements exist in elementalProperties
  let elementalProperties = mapping.elementalProperties
    ? ensureCompleteElementalProperties(mapping.elementalProperties)
    : DEFAULT_ELEMENTAL_PROPERTIES;

  return {
    ...mapping,
    name: mapping.name || formattedName,
    elementalProperties,
  } as IngredientMapping;
};

/**
 * Fix all ingredients in a collection
 * @param ingredients Record of ingredient mappings
 * @returns Fixed ingredient mappings
 */
export let fixIngredientMappings = <
  T extends Record<string, Partial<IngredientMapping>>
>(
  ingredients: T
): Record<string, IngredientMapping> => {
  const result: Record<string, IngredientMapping> = {};

  Object.entries(ingredients).forEach(([key, mapping]) => {
    result[key] = fixIngredientMapping(mapping, key);
  });

  return result;
};

/**
 * Fixes ingredient mappings by ensuring all required properties are present
 * @param ingredients Raw ingredient mappings
 * @returns Fixed ingredient mappings
 */
export function fixRawIngredientMappings(
  ingredients: Record<string, unknown>
): Record<string, unknown> {
  return Object.entries(ingredients).reduce((acc, [key, value]) => {
    // Skip null or undefined values
    if (!value) return acc;

    const valueData = value as any;
    // Ensure elemental properties are normalized
    let elementalProperties = normalizeProperties(
      valueData?.elementalProperties || {}
    );

    // Create a standardized astrological profile if one doesn't exist
    let astroProfile = valueData?.astrologicalProfile || {};

    // Determine base elemental affinity if not provided
    if (!astroProfile.elementalAffinity) {
      let strongestElement = Object.entries(elementalProperties)
        .sort(([, a], [, b]) => b - a)[0][0]
        .toLowerCase();

      astroProfile.elementalAffinity = {
        base: strongestElement,
      };
    }

    acc[key] = {
      ...value,
      name: valueData?.name || key.replace(/_/g, ' '),
      category: valueData?.category || 'ingredient',
      elementalProperties,
      astrologicalProfile: astroProfile,
    };

    return acc;
  }, {});
}

type ElementalRelationship =
  | 'generating'
  | 'controlling'
  | 'same'
  | 'controlled-by'
  | 'weakened-by'
  | 'neutral';

/**
 * Calculate the affinity between two elements based on the Five Elements theory
 * Returns a value between 0 and 1, where:
 * - 1.0: Same element (perfect affinity)
 * - 0.8: Element is generated by (child of) the other
 * - 0.6: Element generates (parent of) the other
 * - 0.4: Neutral relationship
 * - 0.2: Element is controlled by the other
 * - 0.0: Element controls the other (weakest affinity)
 */
export function calculateElementalAffinity(
  element1: Element,
  element2: Element
): number {
  let relationship = getElementalRelationship(element1, element2);

  switch (relationship) {
    case 'same':
      return 1.0;
    case 'generating':
      return 0.8;
    case 'controlled-by':
      return 0.6;
    case 'neutral':
      return 0.4;
    case 'weakened-by':
      return 0.2;
    case 'controlling':
      return 0.0;
    default:
      return 0.4;
  }
}

/**
 * Determines the relationship between two elements according to the Five Elements theory
 */
export function getElementalRelationship(
  element1: Element,
  element2: Element
): ElementalRelationship {
  if (element1 === element2) {
    return 'same';
  }

  // The generating /creative cycle: Wood → Fire → Earth → Metal → Water → Wood
  const generatingCycle: { [key in Element]: Element } = {
    Wood: 'Fire',
    Fire: 'Earth',
    Earth: 'Metal',
    Metal: 'Water',
    Water: 'Wood',
  };

  // The controlling /destructive cycle: Wood → Earth → Water → Fire → Metal → Wood
  const controllingCycle: { [key in Element]: Element } = {
    Wood: 'Earth',
    Earth: 'Water',
    Water: 'Fire',
    Fire: 'Metal',
    Metal: 'Wood',
  };

  if (generatingCycle[element1] === element2) {
    return 'generating'; // element1 generates element2
  } else if (generatingCycle[element2] === element1) {
    return 'weakened-by'; // element2 generates element1
  } else if (controllingCycle[element1] === element2) {
    return 'controlling'; // element1 controls element2
  } else if (controllingCycle[element2] === element1) {
    return 'controlled-by'; // element2 controls element1
  } else {
    return 'neutral';
  }
}

/**
 * Determine the complementary element for a given element
 *
 * @param element The primary element to consider
 * @returns The same element, as elements work best with themselves
 */
export function getBalancingElement(element) {
  // Elements work best with themselves - reinforcing the current energy
  return element;
}

/**
 * Gets the element that strengthens the provided element
 */
export function getStrengtheningElement(element: Element): Element {
  // The element that generates the provided element will strengthen it
  const strengthMap: { [key in Element]: Element } = {
    Wood: 'Water', // Water strengthens Wood
    Fire: 'Wood', // Wood strengthens Fire
    Earth: 'Fire', // Fire strengthens Earth
    Metal: 'Earth', // Earth strengthens Metal
    Water: 'Metal', // Metal strengthens Water
  };

  return strengthMap[element];
}

/**
 * Enhance vegetable transformations by adding thermodynamic effects to different cooking methods
 * @param vegetables The collection of vegetables to enhance
 * @returns Enhanced vegetables with complete transformation properties
 */
export function enhanceVegetableTransformations(
  vegetables: Record<string, any>
): Record<string, any> {
  return Object.entries(vegetables).reduce((acc, [key, vegetable]) => {
    // Skip if not an object
    if (typeof vegetable !== 'object' || vegetable === null) {
      acc[key] = vegetable;
      return acc;
    }

    let enhanced = { ...vegetable };

    // Create transformation if it doesn't exist
    if (!enhanced.elementalTransformation) {
      // Get the dominant element
      let elementalProps = enhanced.elementalProperties || {
        Earth: 0.3,
        Water: 0.3,
        Air: 0.2,
        Fire: 0.2,
      };
      let dominantElement = 'Earth';
      let highestValue = 0;

      for (const [element, value] of Object.entries(elementalProps)) {
        if (value > highestValue) {
          dominantElement = element;
          highestValue = value;
        }
      }

      // Set default transformations based on dominant element
      enhanced.elementalTransformation = {
        whenCooked: { [dominantElement]: 0.1, Fire: 0.05 },
        whenDried: { Earth: 0.1, Air: 0.05 },
        whenFermented: { Water: 0.1, Air: 0.05 },
      };
    }

    // Add thermodynamic changes if they don't exist
    if (
      enhanced.elementalTransformation &&
      !enhanced.elementalTransformation.thermodynamicChanges
    ) {
      enhanced.elementalTransformation.thermodynamicChanges = {
        cooked: {
          heat: 0.1,
          entropy: 0.05,
          reactivity: 0.05,
        },
        dried: {
          heat: -0.05,
          entropy: -0.1,
          reactivity: -0.05,
        },
        fermented: {
          entropy: 0.2,
          reactivity: 0.15,
          stabilityIndex: -0.1,
        },
        roasted: {
          heat: 0.2,
          entropy: 0.1,
          energy: 0.15,
        },
        steamed: {
          heat: 0.05,
          moisture: 0.2,
          reactivity: 0.05,
        },
      };
    }

    // Add elementalSignature if it doesn't exist
    if (!enhanced.elementalSignature && enhanced.elementalProperties) {
      enhanced.elementalSignature = Object.entries(enhanced.elementalProperties)
        .sort((a, b) => b[1] - a[1])
        .map(([element, value]) => [element, Number(value)]);
    }

    // Add sensory profiles if they don't exist
    if (!enhanced.sensoryProfile) {
      // Default sensory profile based on vegetable subCategory
      let subCategory = enhanced.subCategory || 'vegetable';

      let profiles = {
        'leafy green': {
          taste: {
            bitter: 0.6,
            sweet: 0.2,
            umami: 0.1,
            salty: 0.05,
            sour: 0.05,
            spicy: 0,
          },
          aroma: {
            herbal: 0.5,
            earthy: 0.3,
            floral: 0.1,
            fruity: 0.05,
            woody: 0.05,
            spicy: 0,
          },
          texture: {
            crisp: 0.7,
            tender: 0.2,
            silky: 0.1,
            chewy: 0,
            creamy: 0,
            crunchy: 0,
          },
        },
        root: {
          taste: {
            sweet: 0.5,
            earthy: 0.3,
            bitter: 0.1,
            umami: 0.1,
            salty: 0,
            spicy: 0,
          },
          aroma: {
            earthy: 0.6,
            woody: 0.2,
            herbal: 0.1,
            fruity: 0.1,
            floral: 0,
            spicy: 0,
          },
          texture: {
            crunchy: 0.6,
            chewy: 0.2,
            tender: 0.2,
            crisp: 0,
            silky: 0,
            creamy: 0,
          },
        },
        allium: {
          taste: {
            pungent: 0.6,
            sweet: 0.2,
            umami: 0.2,
            bitter: 0,
            salty: 0,
            sour: 0,
          },
          aroma: {
            spicy: 0.7,
            earthy: 0.2,
            herbal: 0.1,
            floral: 0,
            fruity: 0,
            woody: 0,
          },
          texture: {
            crunchy: 0.5,
            chewy: 0.3,
            tender: 0.2,
            crisp: 0,
            silky: 0,
            creamy: 0,
          },
        },
        cruciferous: {
          taste: {
            bitter: 0.5,
            sweet: 0.2,
            spicy: 0.2,
            umami: 0.1,
            salty: 0,
            sour: 0,
          },
          aroma: {
            earthy: 0.4,
            sulfurous: 0.3,
            woody: 0.2,
            herbal: 0.1,
            floral: 0,
            fruity: 0,
          },
          texture: {
            crunchy: 0.7,
            crisp: 0.2,
            tender: 0.1,
            chewy: 0,
            silky: 0,
            creamy: 0,
          },
        },
        nightshade: {
          taste: {
            umami: 0.5,
            sweet: 0.3,
            sour: 0.1,
            bitter: 0.1,
            salty: 0,
            spicy: 0,
          },
          aroma: {
            fruity: 0.5,
            earthy: 0.3,
            herbal: 0.2,
            floral: 0,
            woody: 0,
            spicy: 0,
          },
          texture: {
            tender: 0.5,
            juicy: 0.3,
            chewy: 0.2,
            crisp: 0,
            crunchy: 0,
            silky: 0,
          },
        },
        squash: {
          taste: {
            sweet: 0.6,
            earthy: 0.2,
            nutty: 0.2,
            bitter: 0,
            salty: 0,
            sour: 0,
          },
          aroma: {
            earthy: 0.4,
            sweet: 0.4,
            woody: 0.1,
            herbal: 0.1,
            floral: 0,
            spicy: 0,
          },
          texture: {
            tender: 0.4,
            creamy: 0.3,
            chewy: 0.2,
            crisp: 0.1,
            crunchy: 0,
            silky: 0,
          },
        },
        legume: {
          taste: {
            earthy: 0.5,
            sweet: 0.3,
            umami: 0.2,
            bitter: 0,
            salty: 0,
            sour: 0,
          },
          aroma: {
            earthy: 0.6,
            nutty: 0.3,
            herbal: 0.1,
            floral: 0,
            fruity: 0,
            spicy: 0,
          },
          texture: {
            tender: 0.4,
            creamy: 0.3,
            chewy: 0.3,
            crisp: 0,
            crunchy: 0,
            silky: 0,
          },
        },
        starchy: {
          taste: {
            sweet: 0.5,
            earthy: 0.3,
            umami: 0.2,
            bitter: 0,
            salty: 0,
            sour: 0,
          },
          aroma: {
            earthy: 0.7,
            nutty: 0.2,
            herbal: 0.1,
            floral: 0,
            fruity: 0,
            spicy: 0,
          },
          texture: {
            starchy: 0.6,
            tender: 0.2,
            creamy: 0.2,
            crisp: 0,
            crunchy: 0,
            silky: 0,
          },
        },
      };

      // Select appropriate profile or use default
      let profile = profiles[subCategory] || {
        taste: {
          sweet: 0.25,
          bitter: 0.25,
          umami: 0.25,
          salty: 0.15,
          sour: 0.1,
          spicy: 0,
        },
        aroma: {
          earthy: 0.3,
          herbal: 0.3,
          woody: 0.2,
          fruity: 0.1,
          floral: 0.1,
          spicy: 0,
        },
        texture: {
          tender: 0.3,
          crunchy: 0.3,
          crisp: 0.2,
          chewy: 0.1,
          creamy: 0.1,
          silky: 0,
        },
      };

      enhanced.sensoryProfile = profile;
    }

    acc[key] = enhanced;
    return acc;
  }, {});
}

/**
 * Enhances oil properties with additional culinary, sensory, and transformation details
 * @param oils Record of oil ingredients
 * @returns Enhanced oil ingredients with complete properties
 */
export function enhanceOilProperties(
  oils: Record<string, any>
): Record<string, any> {
  return Object.entries(oils).reduce((acc, [key, oil]) => {
    // Start with the original oil
    let enhancedOil = { ...oil };

    // Ensure basic properties exist
    enhancedOil.category = enhancedOil.category || 'oil';
    enhancedOil.elementalProperties = enhancedOil.elementalProperties || {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.2,
    };
    enhancedOil.qualities = Array.isArray(enhancedOil.qualities)
      ? enhancedOil.qualities
      : [];

    // Create default sensory profile if none exists
    if (!enhancedOil.sensoryProfile) {
      let oilType = key.toLowerCase();
      let isFruity = oilType.includes('olive') || oilType.includes('avocado');
      let isNutty =
        oilType.includes('nut') ||
        oilType.includes('sesame') ||
        oilType.includes('walnut') ||
        oilType.includes('almond') ||
        oilType.includes('peanut');
      let isFloral =
        oilType.includes('sunflower') || oilType.includes('safflower');
      let isNeutral =
        oilType.includes('vegetable') ||
        oilType.includes('canola') ||
        oilType.includes('grapeseed');
      let isTropical =
        oilType.includes('coconut') || oilType.includes('palm');

      enhancedOil.sensoryProfile = {
        taste: {
          sweet: isFruity || isTropical ? 0.6 : 0.2,
          bitter: isNutty ? 0.4 : 0.1,
          umami: isNutty ? 0.5 : 0.2,
          rich: isNutty || isFruity ? 0.7 : 0.4,
        },
        aroma: {
          fruity: isFruity ? 0.8 : 0.1,
          nutty: isNutty ? 0.8 : 0.1,
          floral: isFloral ? 0.7 : 0.1,
          neutral: isNeutral ? 0.9 : 0.2,
          tropical: isTropical ? 0.8 : 0.1,
        },
        texture: {
          viscosity: isTropical || oilType.includes('olive') ? 0.7 : 0.5,
          mouthfeel: isFruity || isNutty ? 0.8 : 0.5,
          richness: isFruity || isNutty || isTropical ? 0.7 : 0.4,
        },
      };
    }

    // Enhance culinary applications if present
    if (enhancedOil.culinaryApplications) {
      // Ensure all application types are properly structured
      Object.entries(enhancedOil.culinaryApplications).forEach(
        ([appType, application]) => {
          if (application && typeof application === 'object') {
            const appData = application as any;
            enhancedOil.culinaryApplications[appType] = {
              ...application,
              elementalEffect: appData?.elementalEffect || {
                Fire:
                  appType === 'frying' ||
                  appType === 'cooking' ||
                  appType === 'highHeat'
                    ? 0.2
                    : 0.1,
                Water:
                  appType === 'dressing' || appType === 'marinade' ? 0.2 : 0.1,
                Earth:
                  appType === 'baking' || appType === 'roasting' ? 0.2 : 0.1,
                Air:
                  appType === 'emulsion' || appType === 'whipping' ? 0.2 : 0.1,
              },
              alchemicalEffect: appData?.alchemicalEffect || {
                spirit:
                  appType === 'finishing' || appType === 'infusion' ? 0.2 : 0.1,
                essence:
                  appType === 'dressing' || appType === 'marinade' ? 0.2 : 0.1,
                matter:
                  appType === 'baking' || appType === 'cooking' ? 0.2 : 0.1,
                substance:
                  appType === 'frying' || appType === 'highHeat' ? 0.2 : 0.1,
              },
            };
          }
        }
      );
    } else {
      // Create default culinary applications based on smoke point and oil type
      let smokePoint = enhancedOil.smokePoint?.fahrenheit || 0;
      let isHighHeat = smokePoint > 400;
      let isMediumHeat = smokePoint > 325 && smokePoint <= 400;
      let isLowHeat = smokePoint <= 325;
      let isFinishing =
        key.toLowerCase().includes('olive') ||
        key.toLowerCase().includes('walnut') ||
        key.toLowerCase().includes('sesame') ||
        key.toLowerCase().includes('pumpkin');

      enhancedOil.culinaryApplications = {
        ...(isHighHeat
          ? {
              frying: {
                notes: ['Excellent for high-heat cooking'],
                techniques: ['Deep frying', 'Stir-frying', 'Sautéing'],
                elementalEffect: { Fire: 0.3, Earth: 0.1 },
                alchemicalEffect: { substance: 0.3, matter: 0.2 },
              },
            }
          : {}),
        ...(isMediumHeat
          ? {
              cooking: {
                notes: ['Good for medium-heat cooking'],
                techniques: ['Sautéing', 'Pan frying', 'Roasting'],
                elementalEffect: { Fire: 0.2, Earth: 0.2 },
                alchemicalEffect: { matter: 0.3, essence: 0.1 },
              },
            }
          : {}),
        ...(isLowHeat || isFinishing
          ? {
              finishing: {
                notes: ['Best used unheated or low heat'],
                techniques: ['Drizzling', 'Dressings', 'Dips'],
                elementalEffect: { Water: 0.3, Air: 0.2 },
                alchemicalEffect: { spirit: 0.3, essence: 0.2 },
              },
            }
          : {}),
        ...(enhancedOil.subCategory === 'baking' ||
        key.toLowerCase().includes('coconut')
          ? {
              baking: {
                notes: ['Suitable for baked goods'],
                techniques: ['Cakes', 'Cookies', 'Breads'],
                elementalEffect: { Earth: 0.3, Fire: 0.1 },
                alchemicalEffect: { matter: 0.3, substance: 0.1 },
              },
            }
          : {}),
      };
    }

    // Add cooking transformations if they don't exist
    if (!enhancedOil.elementalTransformation) {
      enhancedOil.elementalTransformation = {
        whenHeated: {
          Fire: 0.2,
          Air: 0.1,
          Water: -0.1,
          Earth: -0.05,
        },
        whenCooled: {
          Water: 0.1,
          Earth: 0.2,
          Fire: -0.1,
          Air: -0.05,
        },
        whenMixed: {
          Air: 0.15,
          Water: 0.1,
          Fire: -0.05,
          Earth: -0.05,
        },
        whenInfused: {
          Air: 0.2,
          Fire: 0.1,
          Earth: -0.05,
          Water: -0.05,
        },
      };
    }

    // Add thermodynamic properties if they don't exist
    if (!enhancedOil.thermodynamicProperties) {
      // Base on smoke point if available
      let smokePoint = enhancedOil.smokePoint?.fahrenheit || 350;
      let normalizedSmokePoint = (smokePoint - 300) / 250; // Normalize between 300-550°F
      let heatValue = 0.5 + normalizedSmokePoint * 0.4; // Scale 0.5-0.9

      enhancedOil.thermodynamicProperties = {
        heat: Math.min(Math.max(heatValue, 0.3), 0.9),
        entropy: 0.4,
        reactivity: 0.6,
        energy: 0.7,
      };
    }

    // Add recommended cooking methods if they don't exist
    if (!enhancedOil.recommendedCookingMethods) {
      let smokePoint = enhancedOil.smokePoint?.fahrenheit || 0;
      let methods = [];

      if (smokePoint > 400) {
        methods.push({ name: 'deepFrying', potency: 0.9 });
        methods.push({ name: 'stirFrying', potency: 0.9 });
        methods.push({ name: 'sautéing', potency: 0.8 });
      }

      if (smokePoint > 350) {
        methods.push({ name: 'roasting', potency: 0.7 });
        methods.push({ name: 'baking', potency: 0.7 });
      }

      if (enhancedOil.subCategory === 'finishing' || smokePoint < 350) {
        methods.push({ name: 'dressing', potency: 0.9 });
        methods.push({ name: 'marinating', potency: 0.8 });
        methods.push({ name: 'drizzling', potency: 1.0 });
      }

      enhancedOil.recommendedCookingMethods = methods;
    }

    acc[key] = enhancedOil;
    return acc;
  }, {});
}
