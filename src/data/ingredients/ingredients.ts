import { herbs } from './herbs';
import { spices } from './spices';
import { oils } from './oils';
import { seafood } from './proteins/seafood';
import { poultry } from './proteins/poultry';
import { plantBased } from './proteins/plantBased';
import { wholeGrains } from './grains/wholeGrains';
import { refinedGrains } from './grains/refinedGrains';
import { medicinalHerbs } from './herbs/medicinalHerbs';
import type { Ingredient, ElementalProperties, IngredientMapping } from './types';

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

// Keep this as the single declaration
export const allIngredients: Record<string, Ingredient[]> = {
    'Herbs': herbs,
    'Spices': spices,
    'Oils & Fats': oils,
    'Seafood': seafood,
    'Poultry': poultry,
    'Plant-Based': plantBased,
    'Whole Grains': wholeGrains,
    'Refined Grains': refinedGrains,
    'Medicinal Herbs': medicinalHerbs
};

// Default elemental properties referenced in multiple tests
export const defaultElementalProps: ElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
};

// Normalize elemental properties to ensure they sum to 1
export const normalizeElementalProperties = (properties: ElementalProperties): ElementalProperties => {
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    return Object.entries(properties).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value / sum
    }), {} as ElementalProperties);
};

// Validate ingredient categories based on test requirements
export const validCategories = ['culinary_herb', 'spice', 'protein', 'oil'];

// Export types
export type { Ingredient, ElementalProperties, IngredientMapping }; 