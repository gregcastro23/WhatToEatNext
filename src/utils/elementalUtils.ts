// src/utils/elementalUtils.ts

import { DEFAULT_ELEMENTAL_PROPERTIES, ELEMENTAL_CHARACTERISTICS } from '@/constants/elementalConstants';
import type { 
  ElementalProperties, 
  Recipe, 
  ElementalAffinity, 
  IngredientMapping, 
  ElementalCharacteristics, 
  Element, 
  ElementalProfile
} from '@/types/alchemy';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { normalizeElementalProperties } from '@/types/validators';
import { elements, elementalInteractions, elementalFunctions } from './elementalMappings';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { ElementalCharacter } from '@/constants/planetaryElements';
import { LunarPhase, calculatePlanetaryBoost } from '@/constants/planetaryFoodAssociations';

// Define missing AlchemicalProperty type
type AlchemicalProperty = 'Spirit' | 'Essence' | 'Matter' | 'Substance';

/**
 * Validates that elemental properties contain valid values
 * @param properties The elemental properties to validate
 * @returns True if properties are valid, false otherwise
 */
export const validateElementalProperties = (properties: ElementalProperties): boolean => {
  // Check if all required elements exist
  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of requiredElements) {
    if (typeof properties[element] !== 'number') {
      console.warn(`Missing or invalid element: ${element}`);
      return false;
    }
    
    // Check if values are between 0 and 1
    if (properties[element] < 0 || properties[element] > 1) {
      console.warn(`Element value out of range: ${element} = ${properties[element]}`);
      return false;
    }
  }
  
  // Optionally check if properties sum to 1 (or close to it due to floating point)
  const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
  const isCloseToOne = Math.abs(sum - 1) < 0.01;
  
  if (!isCloseToOne) {
    console.warn(`Elemental properties do not sum to 1: ${sum}`);
  }
  
  return true;
};

/**
 * Normalizes elemental properties to ensure they sum to 1
 * @param properties The elemental properties to normalize
 * @returns Normalized elemental properties
 */
export const normalizeProperties = (properties: ElementalProperties): ElementalProperties => {
  const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
  
  if (sum === 0) {
    // If sum is 0, distribute equally
    const equalValue = 1 / Object.keys(properties).length;
    return Object.keys(properties).reduce((acc, key) => {
      acc[key as keyof ElementalProperties] = equalValue;
      return acc;
    }, {} as ElementalProperties);
  }
  
  // Normalize each value
  return Object.entries(properties).reduce((acc, [key, value]) => {
    acc[key as keyof ElementalProperties] = value / sum;
    return acc;
  }, {} as ElementalProperties);
};

/**
 * Standardizes elemental properties for recipes, ensuring all recipes have
 * properly normalized elemental values
 * @param recipe The recipe to standardize
 * @returns Recipe with standardized elemental properties
 */
export const standardizeRecipeElements = <T extends { elementalProperties?: ElementalProperties }>(
  recipe: T
): T & { elementalProperties: ElementalProperties } => {
  // If recipe doesn't have elemental properties, use default
  if (!recipe.elementalProperties) {
    return {
      ...recipe,
      elementalProperties: DEFAULT_ELEMENTAL_PROPERTIES
    };
  }
  
  // Ensure all required elements exist
  const standardizedProps: ElementalProperties = {
    Fire: recipe.elementalProperties.Fire ?? 0.25,
    Water: recipe.elementalProperties.Water ?? 0.25,
    Earth: recipe.elementalProperties.Earth ?? 0.25,
    Air: recipe.elementalProperties.Air ?? 0.25
  };
  
  // Normalize properties to ensure they sum to 1
  return {
    ...recipe,
    elementalProperties: normalizeProperties(standardizedProps)
  };
};

export const validateElementalRequirements = (properties: ElementalProperties): boolean => {
    if (!properties) return false;
    
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    const hasAllElements = requiredElements.every(element => 
        typeof properties[element as keyof ElementalProperties] === 'number'
    );
    
    if (!hasAllElements) return false;
    
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 1) < 0.01;
};

/**
 * Gets the elements that are missing or significantly lower than ideal balance in the provided properties
 * @param properties The elemental properties to check
 * @returns Array of elements that are missing or significantly low
 */
export const getMissingElements = (properties: ElementalProperties): Element[] => {
  const threshold = 0.15; // Elements below this are considered "missing"
  const missingElements: Element[] = [];
  
  // Check each element
  const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of elements) {
    if ((properties[element] || 0) < threshold) {
      missingElements.push(element);
    }
  }
  
  return missingElements;
};

export const elementalUtils = {
    validateProperties: validateElementalRequirements,
    normalizeProperties: normalizeProperties,
    standardizeRecipeElements: standardizeRecipeElements,
    getMissingElements,

    calculateelementalState(recipe: Recipe): ElementalProperties {
        if (!recipe?.ingredients?.length) {
            return ElementalCalculator.getCurrentElementalState();
        }

        const total = recipe.ingredients.reduce((sum, ing) => sum + (ing.amount || 1), 0);
        const balance: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
        
        recipe.ingredients.forEach(ing => {
            if (ing.elementalProperties) {
                Object.entries(ing.elementalProperties).forEach(([element, value]) => {
                    if (element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air') {
                        balance[element] += ((value || 0) * (ing.amount || 1) / total);
                    }
                });
            }
        });

        return normalizeElementalProperties(balance);
    },

    combineProperties(a: ElementalProperties, b: ElementalProperties, bWeight = 0.5): ElementalProperties {
        const combinedProps = {} as ElementalProperties;
        const aWeight = 1 - bWeight;
        
        Object.keys(a).forEach(key => {
            const element = key as keyof ElementalProperties;
            combinedProps[element] = (a[element] * aWeight) + ((b[element] || 0) * bWeight);
        });
        
        return combinedProps;
    },

    getelementalState(recipe: Recipe): ElementalProperties {
        if (!recipe.ingredients?.length) {
            return DEFAULT_ELEMENTAL_PROPERTIES;
        }

        const combinedProperties = recipe.ingredients.reduce((acc, ingredient) => {
            const props = ingredient.elementalProperties || DEFAULT_ELEMENTAL_PROPERTIES;
            return {
                Fire: acc.Fire + props.Fire,
                Water: acc.Water + props.Water,
                Earth: acc.Earth + props.Earth,
                Air: acc.Air + props.Air
            };
        }, { Fire: 0, Water: 0, Earth: 0, Air: 0 });

        return normalizeElementalProperties(combinedProperties);
    },

    /**
     * Gets a complementary element that works well with the given element
     * All elements work well together in their own way
     * @param element The element to find a complement for
     * @returns The complementary element
     */
    getComplementaryElement(element: keyof ElementalProperties): keyof ElementalProperties {
        // Each element complements all others, but we return one suggestion
        // based on traditional culinary pairings
        const complementary: Record<keyof ElementalProperties, keyof ElementalProperties> = {
            Fire: 'Fire', // Fire reinforces itself
            Water: 'Water', // Water reinforces itself
            Earth: 'Earth', // Earth reinforces itself
            Air: 'Air' // Air reinforces itself
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
    getElementalProfile(properties: ElementalProperties): Partial<ElementalProfile> {
        // Find the dominant element
        const entries = Object.entries(properties) as [Element, number][];
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
            characteristics: this.getElementalCharacteristics(dominantElement)
        };
    },

    /**
     * Gets the suggested cooking techniques based on elemental properties
     * @param properties The elemental properties
     * @returns Array of recommended cooking techniques
     */
    getSuggestedCookingTechniques(properties: ElementalProperties): string[] {
        const techniques: string[] = [];
        const threshold = 0.3; // Only consider elements above this threshold for recommendations
        
        if (properties.Fire > threshold) {
            techniques.push(...ELEMENTAL_CHARACTERISTICS.Fire.cookingTechniques.slice(0, 2));
        }
        
        if (properties.Water > threshold) {
            techniques.push(...ELEMENTAL_CHARACTERISTICS.Water.cookingTechniques.slice(0, 2));
        }
        
        if (properties.Earth > threshold) {
            techniques.push(...ELEMENTAL_CHARACTERISTICS.Earth.cookingTechniques.slice(0, 2));
        }
        
        if (properties.Air > threshold) {
            techniques.push(...ELEMENTAL_CHARACTERISTICS.Air.cookingTechniques.slice(0, 2));
        }
        
        // Return unique techniques or a default if none meet the threshold
        return techniques.length > 0 ? Array.from(new Set(techniques)) : ['Balanced cooking'];
    },

    /**
     * Gets the complementary ingredients based on elemental properties
     * @param properties The elemental properties
     * @returns Array of recommended complementary ingredients
     */
    getRecommendedTimeOfDay(properties: ElementalProperties): string[] {
        const times: string[] = [];
        const threshold = 0.3; // Only consider elements above this threshold for recommendations
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
        return weightedTimes.length > 0 ? Array.from(new Set(weightedTimes)) : ['Any time'];
    },

    // Get the default elemental properties
    getDefaultElementalProperties(): ElementalProperties {
        return DEFAULT_ELEMENTAL_PROPERTIES;
    }
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
const ELEMENT_WEIGHTS = {
  Fire: 1.8,
  Water: 1.2,
  Earth: 0.9,
  Air: 1.5
};

// Add this function if uniqueness score is needed
function calculateUniqueness(
  elements: Record<ElementalCharacter, number>,
  planetaryInfluence: number
): number {
  // Calculate variance of elemental properties
  const values = Object.values(elements);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  // Combine with planetary influence
  return Math.min(1, variance * (1 + planetaryInfluence));
}

// Or modify the transformation to remove uniqueness score if not needed
export function transformItemsWithPlanetaryPositions(
  items: ElementalItem[],
  planetaryPositions: Record<string, any>,
  isDaytime: boolean = true,
  currentZodiac?: string,
  lunarPhase?: LunarPhase,
  tarotElementBoosts?: Record<ElementalCharacter, number>,
  tarotPlanetaryBoosts?: Record<string, number>
): AlchemicalItem[] {
  return items.map(item => {
    const { boost: planetaryInfluence } = calculatePlanetaryBoost(
      item,
      planetaryPositions,
      currentZodiac,
      lunarPhase
    );

    // Scale elemental properties
    const scaledElements = Object.fromEntries(
      Object.entries(item.elementalProperties).map(([element, value]) => [
        element,
        value * (1 + (planetaryInfluence || 0))
      ])
    ) as Record<ElementalCharacter, number>;
    
    // Calculate alchemical properties from elemental properties
    // This follows the same relationships as in the alchemical system:
    // - Spirit is related to Fire (transformation) and Air (connection)
    // - Essence is related to Water (fluidity) and Fire (vitality)
    // - Matter is related to Earth (stability) and Water (cohesion)
    // - Substance is related to Air (structure) and Earth (form)
    const spirit = scaledElements.Fire * 0.6 + scaledElements.Air * 0.4;
    const essence = scaledElements.Water * 0.6 + scaledElements.Fire * 0.4;
    const matter = scaledElements.Earth * 0.7 + scaledElements.Water * 0.3;
    const substance = scaledElements.Air * 0.6 + scaledElements.Earth * 0.4;
    
    // Apply tarot boosts if available
    const boostedSpirit = spirit * (tarotPlanetaryBoosts?.Spirit || 1.0);
    const boostedEssence = essence * (tarotPlanetaryBoosts?.Essence || 1.0);
    const boostedMatter = matter * (tarotPlanetaryBoosts?.Matter || 1.0);
    const boostedSubstance = substance * (tarotPlanetaryBoosts?.Substance || 1.0);
    
    // Calculate energy metrics using the formulas from alchemicalCalculations.ts
    const fire = scaledElements.Fire;
    const water = scaledElements.Water;
    const air = scaledElements.Air;
    const earth = scaledElements.Earth;
    
    // Ensure we have non-zero values for denominator
    const safeValue = (val: number) => Math.max(val, 0.01);
    
    // Heat formula: (spirit^2 + fire^2) / (substance + essence + matter + water + air + earth)^2
    const heat = (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(fire), 2)) / 
                Math.pow(safeValue(boostedSubstance + boostedEssence + boostedMatter + water + air + earth), 2);
    
    // Entropy formula: (spirit^2 + substance^2 + fire^2 + air^2) / (essence + matter + earth + water)^2
    const entropy = (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(boostedSubstance), 2) + 
                    Math.pow(safeValue(fire), 2) + Math.pow(safeValue(air), 2)) / 
                    Math.pow(safeValue(boostedEssence + boostedMatter + earth + water), 2);
    
    // Reactivity formula: (spirit^2 + substance^2 + essence^2 + fire^2 + air^2 + water^2) / (matter + earth)^2
    const reactivity = (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(boostedSubstance), 2) + 
                       Math.pow(safeValue(boostedEssence), 2) + Math.pow(safeValue(fire), 2) + 
                       Math.pow(safeValue(air), 2) + Math.pow(safeValue(water), 2)) / 
                       Math.pow(safeValue(boostedMatter + earth), 2);
    
    // Greg's Energy formula with consistent scaling
    const rawGregsEnergy = heat - (reactivity * entropy);
    const scaledGregsEnergy = (rawGregsEnergy + 1) / 2; // Convert from range (-1,1) to (0,1)
    const gregsEnergy = Math.max(0.1, Math.min(1.0, scaledGregsEnergy));
    
    // Normalize all energy values to ensure they're in the 0-1 range
    const normalizedHeat = Math.max(0.1, Math.min(1.0, heat));
    const normalizedEntropy = Math.max(0.1, Math.min(1.0, entropy));
    const normalizedReactivity = Math.max(0.1, Math.min(1.0, reactivity));
    
    // Calculate dominant element based on scaled elements
    const dominantElement = Object.entries(scaledElements)
      .sort(([_keyA, valueA], [_keyB, valueB]) => valueB - valueA)[0][0] as ElementalCharacter;
    
    // Calculate dominant alchemical property
    const alchemicalProperties = {
      Spirit: boostedSpirit,
      Essence: boostedEssence,
      Matter: boostedMatter,
      Substance: boostedSubstance
    };
    const dominantAlchemicalProperty = Object.entries(alchemicalProperties)
      .sort(([_keyA, valueA], [_keyB, valueB]) => valueB - valueA)[0][0] as AlchemicalProperty;
    
    // Extract dominant planets based on planetary positions if available
    let dominantPlanets: string[] = [];
    if (planetaryPositions) {
      // Get top 3 planets with highest values or dignity
      const planetEntries = Object.entries(planetaryPositions)
        .filter(([planet, _]) => planet !== 'isDaytime' && planet !== 'currentZodiac');
      
      // Handle different position data formats
      dominantPlanets = planetEntries
        .sort(([_, valA], [__, valB]) => {
          // Sort by strength/dignity if available
          if (typeof valA === 'object' && typeof valB === 'object') {
            const strengthA = valA.strength || 0;
            const strengthB = valB.strength || 0;
            return strengthB - strengthA;
          }
          // Default sort for simple numeric values
          return Number(valB) - Number(valA);
        })
        .slice(0, 3)
        .map(([planet, _]) => planet);
    }
    
    // Ensure we have planetary dignities data
    const planetaryDignities = {};
    
    // Handle NaN values or infinity for all properties
    const ensureSafeNumber = (val: number): number => {
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
        Substance: boostedSubstance
      },
      heat: normalizedHeat,
      entropy: normalizedEntropy,
      reactivity: normalizedReactivity,
      gregsEnergy: gregsEnergy,
      dominantElement,
      dominantAlchemicalProperty,
      planetaryBoost: planetaryInfluence,
      dominantPlanets,
      planetaryDignities
    };
  });
}

// New differentiation functions
const applyNonLinearScaling = (props: ElementalProperties): ElementalProperties => ({
  Fire: Math.tanh(props.Fire * 2),
  Water: 1 - Math.exp(-props.Water * 3),
  Earth: props.Earth ** 1.5,
  Air: Math.sin(props.Air * Math.PI/2)
});

const calculateUniquenessScore = (item: ElementalItem): number => {
  const variance = Object.values(item.elementalProperties).reduce((acc: number, val: number) => 
    acc + Math.abs(val - 0.5), 0);
  return Math.min(1, variance * 2);
};

// Add or update the normalizeElementalValues function
export function normalizeElementalValues(
  values: Record<ElementalCharacter, number>
): Record<ElementalCharacter, number> {
  const total = Object.values(values).reduce((sum, val) => sum + val, 0);
  
  // If total is zero or close to zero, return default distribution
  if (total < 0.01) {
    return {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
  }
  
  // Normalize values to sum to 1.0
  return {
    Fire: values.Fire / total,
    Water: values.Water / total, 
    Earth: values.Earth / total,
    Air: values.Air / total
  };
}

// Get the primary element regardless of format
export function getPrimaryElement(elementalAffinity: ElementalAffinity): string {
  return elementalAffinity.base || elementalAffinity.element as string || 'Fire';
}

// Get element strength if available
export function getElementStrength(elementalAffinity: ElementalAffinity): number {
  return elementalAffinity.strength || 1;
}

/**
 * Ensures all required elemental properties are present
 * @param properties The elemental properties to validate and complete
 * @returns Complete elemental properties
 */
export const ensureCompleteElementalProperties = (properties: Partial<ElementalProperties>): ElementalProperties => {
  return {
    Fire: properties.Fire ?? 0.25,
    Water: properties.Water ?? 0.25,
    Earth: properties.Earth ?? 0.25,
    Air: properties.Air ?? 0.25
  };
};

/**
 * Ensures the IngredientMapping has a name property (derived from its key if needed)
 * @param mapping The ingredient mapping to fix
 * @param key The object key (ingredient ID)
 * @returns Complete IngredientMapping with name
 */
export const fixIngredientMapping = (mapping: Partial<IngredientMapping>, key: string): IngredientMapping => {
  // Format key into a readable name if no name is provided
  const formattedName = key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Ensure all required elements exist in elementalProperties
  const elementalProperties = mapping.elementalProperties 
    ? ensureCompleteElementalProperties(mapping.elementalProperties)
    : DEFAULT_ELEMENTAL_PROPERTIES;

  return {
    ...mapping,
    name: mapping.name || formattedName,
    elementalProperties
  } as IngredientMapping;
};

/**
 * Fix all ingredients in a collection
 * @param ingredients Record of ingredient mappings
 * @returns Fixed ingredient mappings
 */
export const fixIngredientMappings = <T extends Record<string, Partial<IngredientMapping>>>(
  ingredients: T
): Record<string, IngredientMapping> => {
  const result: Record<string, IngredientMapping> = {};
  
  Object.entries(ingredients).forEach(([key, mapping]) => {
    result[key] = fixIngredientMapping(mapping, key);
  });
  
  return result;
};

// Default elemental properties
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

/**
 * Fixes ingredient mappings by ensuring all required properties are present
 * @param ingredients Raw ingredient mappings
 * @returns Fixed ingredient mappings
 */
export function fixRawIngredientMappings(ingredients: Record<string, any>): Record<string, any> {
  return Object.entries(ingredients).reduce((acc, [key, value]) => {
    // Skip null or undefined values
    if (!value) return acc;
    
    // Ensure elemental properties are normalized
    const elementalProperties = normalizeElementalProperties(value.elementalProperties || {});
    
    // Create a standardized astrological profile if one doesn't exist
    const astroProfile = value.astrologicalProfile || {};
    
    // Determine base elemental affinity if not provided
    if (!astroProfile.elementalAffinity) {
      const strongestElement = Object.entries(elementalProperties)
        .sort(([, a], [, b]) => b - a)[0][0].toLowerCase();
      
      astroProfile.elementalAffinity = {
        base: strongestElement
      };
    }
    
    // Convert string elemental affinity to object format
    if (typeof astroProfile.elementalAffinity === 'string') {
      astroProfile.elementalAffinity = {
        base: astroProfile.elementalAffinity
      };
    }
    
    // Ensure ruling planets is an array
    if (!astroProfile.rulingPlanets) {
      astroProfile.rulingPlanets = [];
    }
    
    acc[key] = {
      ...value,
      elementalProperties,
      astrologicalProfile: astroProfile,
      name: value.name || key,
      category: value.category || 'unknown'
    };
    
    return acc;
  }, {});
}