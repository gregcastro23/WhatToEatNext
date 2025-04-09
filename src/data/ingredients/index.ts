import { wholeGrains } from './grains/wholeGrains';
import { refinedGrains } from './grains/refinedGrains';
import { medicinalHerbs } from './herbs/medicinalHerbs';
import type { Ingredient } from '@/types/alchemy';
import { seafood } from './proteins/seafood';
import { poultry } from './proteins/poultry';
import { plantBased } from './proteins/plantBased';
import { meats } from './proteins/meat';
import { herbs } from './herbs';
import { oils } from './seasonings/oils';
import { spices } from './spices';
import { french } from '@/data/cuisines/french';
import { italian } from '@/data/cuisines/italian';
import { middleEastern } from '@/data/cuisines/middle-eastern';
import { thai } from '@/data/cuisines/thai';
import { calculateAlchemicalProperties, calculateThermodynamicProperties, determineIngredientModality } from '@/utils/ingredientUtils';
import { fruits } from './fruits/index';
import { vegetables } from './vegetables';
import { seasonings } from './seasonings';
import { standardizeIngredient } from '@/utils/dataStandardization';
import type { Ingredient, IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

export const VALID_CATEGORIES = [
    'culinary_herb',
    'spice',
    'protein',
    'oil',
    'grain',
    'medicinal_herb'
] as const;

// Default elemental properties
export const DEFAULT_ELEMENTAL_PROPERTIES = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
};

// Normalize elemental properties to sum to 1
const normalizeElementalProperties = (properties: Record<string, number>): Record<string, number> => {
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

// Process and validate a single ingredient
const processIngredient = (ingredient: any, name: string): Ingredient => {
    if (!ingredient) {
        throw new Error(`Invalid ingredient data for ${name}`);
    }

    // Create default lunar phase modifiers if none exist
    const defaultLunarPhaseModifiers = {
        newMoon: {
            elementalBoost: { Earth: 0.05, Water: 0.05 },
            preparationTips: ['Best for subtle preparation methods']
        },
        fullMoon: {
            elementalBoost: { Water: 0.1, Air: 0.05 },
            preparationTips: ['Enhanced flavor extraction']
        }
    };

    return {
        name: name,
        category: ingredient.category || 'culinary_herb',
        elementalProperties: normalizeElementalProperties(ingredient.elementalProperties),
        qualities: Array.isArray(ingredient.qualities) ? ingredient.qualities : [],
        lunarPhaseModifiers: ingredient.lunarPhaseModifiers || defaultLunarPhaseModifiers,
        ...ingredient
    };
};

// Process a collection of ingredients with the new properties
const processIngredientCollection = (collection: Record<string, any>): Record<string, Ingredient> => {
    return Object.entries(collection).reduce((acc, [key, value]) => {
        try {
            const processedIngredient = processIngredient(value, key);
            
            // Add alchemical and thermodynamic properties
            const alchemicalProps = calculateAlchemicalProperties(processedIngredient);
            const thermodynamicProps = calculateThermodynamicProperties(alchemicalProps, processedIngredient.elementalProperties);
            
            // Determine modality
            const modality = determineIngredientModality(
                processedIngredient.qualities || [],
                processedIngredient.elementalProperties
            );
            
            acc[key] = {
                ...processedIngredient,
                alchemicalProperties: alchemicalProps,
                thermodynamicProperties: thermodynamicProps,
                modality
                // Note: We're keeping celestialBoost and planetaryInfluence in the data
                // but not displaying them in the UI
            };
        } catch (error) {
            console.warn(`Skipping invalid ingredient ${key}:`, error);
        }
        return acc;
    }, {} as Record<string, Ingredient>);
};

// Function to ensure all ingredients have required properties
export function normalizeIngredients(ingredients: Ingredient[]): Ingredient[] {
    return ingredients.map(ingredient => ({
        ...ingredient,
        ...(typeof ingredient === 'object' ? {
            thermodynamicProperties: {
                ...((ingredient as any).thermodynamicProperties || {}),
                heat: (ingredient as any).heat ?? calculateHeatFromElements(ingredient.elementalProperties),
                moisture: (ingredient as any).moisture ?? calculateMoistureFromElements(ingredient.elementalProperties)
            }
        } : {})
    } as Ingredient));
}

// Calculate heat from elemental properties if not defined
function calculateHeatFromElements(elementalProperties: Record<string, number> = {}): number {
    const fire = elementalProperties.Fire || 0;
    const air = elementalProperties.Air || 0;
    return (fire * 0.7 + air * 0.3);
}

// Calculate moisture from elemental properties if not defined
function calculateMoistureFromElements(elementalProperties: Record<string, number> = {}): number {
    const water = elementalProperties.Water || 0;
    const earth = elementalProperties.Earth || 0;
    return (water * 0.7 + earth * 0.3);
}

// Process and combine all ingredients
export const allIngredients = {
    ...processIngredientCollection(seafood),
    ...processIngredientCollection(poultry),
    ...processIngredientCollection(plantBased),
    ...processIngredientCollection(herbs),
    ...processIngredientCollection(oils),
    ...processIngredientCollection(spices)
};

export const AlchemyData = {
    cuisines: {
        french,
        italian,
        middleEastern,
        thai
    },
    ingredients: {
        grains: {
            whole: processIngredientCollection(wholeGrains),
            refined: processIngredientCollection(refinedGrains)
        },
        herbs: {
            medicinal: processIngredientCollection(medicinalHerbs)
        }
    }
};

// Export individual categories
export {
    herbs,
    spices,
    oils,
    seafood,
    poultry,
    plantBased,
    wholeGrains,
    refinedGrains,
    medicinalHerbs
};

export * from './types';
export default allIngredients;

// Fix: Replace duplicate proteins exports with a single one using fixIngredientMappings
export const proteins = fixIngredientMappings({
    ...seafood,
    ...poultry,
    ...plantBased,
    ...meats
}) as Record<string, IngredientMapping>;

export const ingredientsMap: Record<string, Ingredient | IngredientMapping> = {
    ...fruits,
    ...vegetables,
    ...seafood,
    ...poultry,
    ...plantBased,
    ...meats,
    ...wholeGrains,
    ...herbs,
    ...spices,
    ...oils,
    ...seasonings,
};

// Array format (for iteration)
export const ingredients: (Ingredient | IngredientMapping)[] = Object.values(ingredientsMap);

// Standardize all ingredients on export
export const standardizedIngredients = Object.values(ingredientsMap).map(ingredient => 
  typeof standardizeIngredient === 'function' ? standardizeIngredient(ingredient) : ingredient
);