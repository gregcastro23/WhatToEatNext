import { wholeGrains } from './grains/wholeGrains';
import { refinedGrains } from './grains/refinedGrains';
import { allGrains, grainNames } from './grains';
import { medicinalHerbs } from './herbs/medicinalHerbs';
import type { Ingredient } from '@/types/alchemy';
import { seafood } from './proteins/seafood';
import { poultry } from './proteins/poultry';
import { plantBased } from './proteins/plantBased';
import { meats } from './proteins/meat';
import { herbs, allHerbs } from './herbs';
import { processedOils, allOils } from './oils';
import { spices } from './spices';
import { warmSpices } from './spices/warmSpices';
import { vinegars, allVinegars, artisanalVinegars } from './vinegars/vinegars';
import { french } from '@/data/cuisines/french';
import { italian } from '@/data/cuisines/italian';
import { middleEastern } from '@/data/cuisines/middle-eastern';
import { thai } from '@/data/cuisines/thai';
import { calculateAlchemicalProperties, calculateThermodynamicProperties, determineIngredientModality } from '@/utils/ingredientUtils';
import { fruits } from './fruits/index';
import { enhancedVegetables, standardizedVegetables } from './vegetables';
import { seasonings } from './seasonings';
import { standardizeIngredient } from '@/utils/dataStandardization';
import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Create comprehensive collections that combine all available sources
export const herbsCollection = allHerbs;
export const oilsCollection = allOils;
export const vinegarsCollection = allVinegars;
export const grainsCollection = allGrains;
export const spicesCollection = {
  ...spices,
  ...warmSpices
};
export const vegetablesCollection = enhancedVegetables;

export const VALID_CATEGORIES = [
    'culinary_herb',
    'spice',
    'protein',
    'oil',
    'grain',
    'medicinal_herb',
    'vegetable',
    'fruit',
    'vinegar',
    'seasoning'
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
const processIngredient = (ingredient: unknown, name: string): Ingredient => {
    if (!ingredient) {
        throw new Error(`Invalid ingredient data for ${name}`);
    }

    // Create default lunar phase modifiers if none exist
    const defaultLunarPhaseModifiers = {
        newMoon: {
            elementalBoost: { Earth: 0.05, Water: 0.05 },
            preparationTips: ['Best for subtle preparation methods'],
            thermodynamicEffects: { heat: -0.1, entropy: -0.05 }
        },
        fullMoon: {
            elementalBoost: { Water: 0.1, Air: 0.05 },
            preparationTips: ['Enhanced flavor extraction'],
            thermodynamicEffects: { reactivity: 0.1, energy: 0.05 }
        }
    };

    // Create default sensory profile if none exists
    const defaultSensoryProfile = {
        taste: {
            sweet: 0.25,
            salty: 0.25,
            sour: 0.25,
            bitter: 0.25,
            umami: 0.25,
            spicy: 0.25
        },
        aroma: {
            floral: 0.25,
            fruity: 0.25,
            herbal: 0.25,
            spicy: 0.25,
            earthy: 0.25,
            woody: 0.25
        },
        texture: {
            crisp: 0.25,
            tender: 0.25,
            creamy: 0.25,
            chewy: 0.25,
            crunchy: 0.25,
            silky: 0.25
        }
    };

    return {
        name: name,
        category: ingredient.category || 'culinary_herb',
        elementalProperties: normalizeElementalProperties(ingredient.elementalProperties),
        qualities: Array.isArray(ingredient.qualities) ? ingredient.qualities : [],
        lunarPhaseModifiers: ingredient.lunarPhaseModifiers || defaultLunarPhaseModifiers,
        sensoryProfile: ingredient.sensoryProfile || defaultSensoryProfile,
        storage: ingredient.storage || { duration: 'unknown' },
        elementalTransformation: ingredient.elementalTransformation || {
            whenCooked: { Fire: 0.1, Air: 0.05 }
        },
        ...ingredient
    };
};

// Process a collection of ingredients with the new properties
const processIngredientCollection = (collection: Record<string, unknown>): Record<string, Ingredient> => {
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

            // Create elementalSignature (dominant elements in order)
            const elementalSignature = Object.entries(processedIngredient.elementalProperties)
                .sort((a, b) => b[1] - a[1])
                .map(([element, value]) => [element, value] as [string, number]);
            
            acc[key] = {
                ...processedIngredient,
                alchemicalProperties: alchemicalProps,
                thermodynamicProperties: thermodynamicProps,
                modality,
                elementalSignature: elementalSignature.length > 0 ? elementalSignature : undefined,
                // Process other enhanced properties if they exist
                astrologicalCorrespondence: processedIngredient.astrologicalCorrespondence || undefined,
                pairingRecommendations: processedIngredient.pairingRecommendations || undefined,
                celestialBoost: processedIngredient.celestialBoost || undefined,
                planetaryInfluence: processedIngredient.planetaryInfluence || undefined
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
                heat: (ingredient as any).thermodynamicProperties?.heat ?? calculateHeatFromElements(ingredient.elementalProperties),
                moisture: (ingredient as any).thermodynamicProperties?.moisture ?? calculateMoistureFromElements(ingredient.elementalProperties),
                entropy: (ingredient as any).thermodynamicProperties?.entropy ?? calculateEntropyFromElements(ingredient.elementalProperties),
                reactivity: (ingredient as any).thermodynamicProperties?.reactivity ?? calculateReactivityFromElements(ingredient.elementalProperties),
                energy: (ingredient as any).thermodynamicProperties?.energy ?? calculateEnergyFromElements(ingredient.elementalProperties)
            },
            alchemicalProperties: {
                ...((ingredient as any).alchemicalProperties || {}),
                spirit: (ingredient as any).alchemicalProperties?.spirit ?? calculateSpiritFromElements(ingredient.elementalProperties),
                essence: (ingredient as any).alchemicalProperties?.essence ?? calculateEssenceFromElements(ingredient.elementalProperties),
                matter: (ingredient as any).alchemicalProperties?.matter ?? calculateMatterFromElements(ingredient.elementalProperties),
                substance: (ingredient as any).alchemicalProperties?.substance ?? calculateSubstanceFromElements(ingredient.elementalProperties)
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

// Calculate entropy from elemental properties
function calculateEntropyFromElements(elementalProperties: Record<string, number> = {}): number {
    const fire = elementalProperties.Fire || 0;
    const air = elementalProperties.Air || 0;
    const spirit = (fire * 0.7) + (air * 0.3);
    const substance = (elementalProperties.Earth || 0) * 0.5 + (elementalProperties.Water || 0) * 0.3 + (air * 0.2);
    
    const numerator = (spirit**2 + substance**2 + fire**2 + air**2);
    const denominator = ((calculateEssenceFromElements(elementalProperties) + 
                        calculateMatterFromElements(elementalProperties) + 
                        (elementalProperties.Earth || 0) + 
                        (elementalProperties.Water || 0))**2) || 1;
    
    return numerator / denominator;
}

// Calculate reactivity from elemental properties
function calculateReactivityFromElements(elementalProperties: Record<string, number> = {}): number {
    const fire = elementalProperties.Fire || 0;
    const air = elementalProperties.Air || 0;
    const water = elementalProperties.Water || 0;
    const earth = elementalProperties.Earth || 0;
    
    const spirit = (fire * 0.7) + (air * 0.3);
    const substance = (earth * 0.5) + (water * 0.3) + (air * 0.2);
    const essence = (water * 0.6) + (fire * 0.2) + (air * 0.2);
    
    const numerator = (spirit**2 + substance**2 + essence**2 + fire**2 + air**2 + water**2);
    const denominator = ((calculateMatterFromElements(elementalProperties) + earth)**2) || 1;
    
    return numerator / denominator;
}

// Calculate energy from elemental properties
function calculateEnergyFromElements(elementalProperties: Record<string, number> = {}): number {
    const heat = calculateHeatFromElements(elementalProperties);
    const reactivity = calculateReactivityFromElements(elementalProperties);
    const entropy = calculateEntropyFromElements(elementalProperties);
    
    return heat - (reactivity * entropy);
}

// Calculate spirit from elemental properties
function calculateSpiritFromElements(elementalProperties: Record<string, number> = {}): number {
    const fire = elementalProperties.Fire || 0;
    const air = elementalProperties.Air || 0;
    return (fire * 0.7) + (air * 0.3);
}

// Calculate essence from elemental properties
function calculateEssenceFromElements(elementalProperties: Record<string, number> = {}): number {
    const water = elementalProperties.Water || 0;
    const fire = elementalProperties.Fire || 0;
    const air = elementalProperties.Air || 0;
    return (water * 0.6) + (fire * 0.2) + (air * 0.2);
}

// Calculate matter from elemental properties
function calculateMatterFromElements(elementalProperties: Record<string, number> = {}): number {
    const earth = elementalProperties.Earth || 0;
    const water = elementalProperties.Water || 0;
    return (earth * 0.7) + (water * 0.3);
}

// Calculate substance from elemental properties
function calculateSubstanceFromElements(elementalProperties: Record<string, number> = {}): number {
    const earth = elementalProperties.Earth || 0;
    const water = elementalProperties.Water || 0;
    const air = elementalProperties.Air || 0;
    return (earth * 0.5) + (water * 0.3) + (air * 0.2);
}

// Process and combine all ingredients - using our comprehensive collections
export const allIngredients = {
    ...processIngredientCollection(seafood),
    ...processIngredientCollection(poultry),
    ...processIngredientCollection(plantBased),
    ...processIngredientCollection(herbsCollection),  // Use complete herbs collection
    ...processIngredientCollection(oilsCollection),   // Use complete oils collection
    ...processIngredientCollection(spicesCollection), // Use complete spices collection
    ...processIngredientCollection(vinegarsCollection), // Use complete vinegars collection
    ...enhancedVegetables // Use enhanced vegetables with all properties
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
        },
        vegetables: enhancedVegetables
    }
};

// Export individual categories
export {
    herbs,
    spices,
    warmSpices,
    processedOils as oils,
    vinegars,
    artisanalVinegars,
    seafood,
    poultry,
    plantBased,
    wholeGrains,
    refinedGrains,
    medicinalHerbs,
    enhancedVegetables as vegetables
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

// Create a comprehensive ingredients map with all collections
export const ingredientsMap: Record<string, Ingredient | IngredientMapping> = {
    ...fruits,
    ...enhancedVegetables, // Use enhanced vegetables
    ...seafood,
    ...poultry,
    ...plantBased,
    ...meats,
    ...wholeGrains,
    ...herbs,
    ...spices,
    ...processedOils,
    ...vinegars,
    ...seasonings,
    ...herbsCollection,  // Add comprehensive collections
    ...oilsCollection,
    ...vinegarsCollection
};

// Array format (for iteration)
export const ingredients: (Ingredient | IngredientMapping)[] = Object.values(ingredientsMap);

// Standardize all ingredients on export
export const standardizedIngredients = Object.values(ingredientsMap).map(ingredient => 
  typeof standardizeIngredient === 'function' ? standardizeIngredient(ingredient) : ingredient
);