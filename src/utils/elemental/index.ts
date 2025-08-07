// Removed unused type imports

/**
 * Elemental Utils Index
 *
 * Consolidated exports from the elemental module system.
 * Provides a single entry point for all elemental calculations and transformations.
 */

// Core elemental functions
export * from './core';

// Elemental transformations and alchemical functions
export * from './transformations';

// Re-export commonly used functions for backward compatibility
export {
    ELEMENTAL_COLORS, ELEMENTAL_DESCRIPTIONS, ELEMENTAL_SYMBOLS, calculateDetailedElementalCompatibility, calculateDominantElement, calculateElementalCompatibility, calculateElementalState, combineElementalProperties, getComplementaryElement, getElementalCharacteristics, getElementalColor, getElementalCompatibility, getElementalDescription, getElementalSymbol, getStrengtheningElement, normalizeProperties, standardizeRecipeElements, validateElementalProperties
} from './core';

export {
    applyPlanetaryInfluence, filterByAlchemicalCompatibility,
    getTopCompatibleItems, sortByAlchemicalCompatibility, transformCookingMethods,
    transformCuisines, transformIngredients, transformSingleItem
} from './transformations';

// Type exports
export type {
    ElementalCharacteristics, ElementalColor,
    ElementalCompatibility, ElementalProfile
} from './core';

export type {
    AlchemicalTransformation, PlanetaryInfluence, TransformationContext
} from './transformations';
