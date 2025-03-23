// src/utils/elementalUtils.ts

import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type { ElementalProperties, Recipe } from '@/types/alchemy';
import { ElementalCalculator } from '@/calculations/elementalcalculations';
import { validateElementalProperties, normalizeElementalProperties } from '@/types/validators';
import { ElementalProperties as IngredientElementalProperties } from '@/data/ingredients/types';
import { elements, elementalInteractions, elementalFunctions } from './elementalMappings';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { ElementalCharacter } from '@/constants/planetaryElements';
import { LunarPhase, calculatePlanetaryBoost } from '@/constants/planetaryFoodAssociations';

export const normalizeProperties = (properties: Partial<ElementalProperties>): ElementalProperties => {
    if (!properties || Object.keys(properties).length === 0) {
        return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }

    const sum = Object.values(properties).reduce((acc, val) => acc + (val || 0), 0);
    if (sum === 0) {
        return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }

    return {
        Fire: (properties.Fire || 0) / sum,
        Water: (properties.Water || 0) / sum,
        Earth: (properties.Earth || 0) / sum,
        Air: (properties.Air || 0) / sum
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

export const elementalUtils = {
    validateProperties: validateElementalRequirements,
    normalizeProperties: normalizeProperties,

    calculateelementalState(recipe: Recipe): ElementalProperties {
        if (!recipe?.ingredients?.length) {
            return ElementalCalculator.getCurrentelementalState();
        }

        const total = recipe.ingredients.reduce((sum, ing) => sum + (ing.amount || 1), 0);
        const balance = recipe.ingredients.reduce((props, ing) => {
            if (ing.elementalProperties) {
                Object.entries(ing.elementalProperties).forEach(([element, value]) => {
                    props[element] = (props[element] || 0) + ((value || 0) * (ing.amount || 1) / total);
                });
            }
            return props;
        }, { Fire: 0, Water: 0, Earth: 0, Air: 0 });

        return normalizeElementalProperties(balance);
    },

    getRecipeHarmony(recipe: Recipe, targetBalance: ElementalProperties): number {
        if (!recipe.elementalProperties || !targetBalance) return 0;

        // Calculate the difference between recipe and target for each element
        const differences = Object.entries(recipe.elementalProperties).map(([element, value]) => {
            const targetValue = targetBalance[element as keyof ElementalProperties] || 0;
            return Math.abs(value - targetValue);
        });

        // Average the differences and convert to a harmony score (1 - difference)
        const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
        const harmony = 1 - averageDifference;

        // Scale to ensure it's between 0 and 1
        return Math.max(0, Math.min(1, harmony));
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

    getOppositeElement(element: keyof ElementalProperties): keyof ElementalProperties {
        const opposites: Record<keyof ElementalProperties, keyof ElementalProperties> = {
            Fire: 'Water',
            Water: 'Fire',
            Earth: 'Air',
            Air: 'Earth'
        };
        return opposites[element];
    },

    DEFAULT_ELEMENTAL_PROPERTIES: DEFAULT_ELEMENTAL_PROPERTIES as const
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
        value * (1 + planetaryInfluence)
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
  const variance = Object.values(item.elementalProperties).reduce((acc, val) => 
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