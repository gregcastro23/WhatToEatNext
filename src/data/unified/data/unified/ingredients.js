// ===== UNIFIED INGREDIENTS SYSTEM =====
// This file provides a unified interface for accessing ingredients with enhanced alchemical properties
// It acts as an adapter/enhancer for existing ingredient data rather than duplicating it

import { createElementalProperties } from '../../utils/elemental/elementalUtils.js';
// Import ingredient data from their original sources
import { fruits } from '../ingredients/fruits/index.js';
import { vegetables } from '../ingredients/vegetables/index.js';
import { herbs } from '../ingredients/herbs/index.js';
import { spices } from '../ingredients/spices/index.js';
import { grains } from '../ingredients/grains/index.js';
import { oils } from '../ingredients/oils/index.js';
import { vinegars } from '../ingredients/vinegars/vinegars.js';
import { seasonings } from '../ingredients/seasonings/index.js';
import { meats, poultry, seafood, plantBased } from '../ingredients/proteins/index.js';
// Combine all protein types
const proteins = {
    ...meats,
    ...poultry,
    ...seafood,
    ...plantBased
};
/**
 * Calculate Kalchm value based on alchemical properties
 * K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 */
function calculateKalchm(alchemical) {
    const { Spirit, Essence, Matter, Substance } = alchemical;
    // Prevent division by zero or negative values
    const safespirit = Math.max(0.001, Spirit);
    const safeessence = Math.max(0.001, Essence);
    const safematter = Math.max(0.001, Matter);
    const safesubstance = Math.max(0.001, Substance);
    return (Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence)) /
        (Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance));
}
/**
 * Calculate Monica constant based on Kalchm and thermodynamic properties
 * monica = -gregsEnergy / (reactivity * ln(kalchm))
 */
function calculateMonica(kalchm, thermodynamics) {
    if (!thermodynamics || kalchm <= 0)
        return 0;
    const { reactivity, gregsEnergy, energy } = thermodynamics;
    // Use gregsEnergy if available, otherwise use energy
    const energyValue = gregsEnergy !== undefined ? gregsEnergy : (energy || 0);
    // Safe calculation of logarithm
    const lnK = Math.log(Math.max(0.001, kalchm));
    // Calculate monica value
    if (lnK !== 0 && reactivity !== 0) {
        return -energyValue / (reactivity * lnK);
    }
    return 0;
}
/**
 * Enhance existing ingredient with unified properties
 */
function enhanceIngredient(ingredient, sourceCategory) {
    // Create alchemical properties if not present
    const _alchemicalProperties = ingredient.alchemicalProperties || {
        Spirit: 0.25,
        Essence: 0.25,
        Matter: 0.25,
        Substance: 0.25
    };
    // Calculate Kalchm value
    const kalchm = calculateKalchm(alchemicalProperties);
    // Get or create thermodynamic properties
    const thermodynamics = ingredient.thermodynamicProperties ||
        ingredient.energyValues ||
        { heat: 0.5, entropy: 0.5, reactivity: 0.5, energy: 0.5 };
    // Calculate Monica value
    const monica = calculateMonica(kalchm, thermodynamics);
    // Create enhanced unified ingredient
    return {
        // Core properties from original ingredient
        name: ingredient.name,
        category: ingredient.category || sourceCategory,
        subcategory: ingredient.subCategory,
        // Existing properties
        elementalProperties: ingredient.elementalProperties || createElementalProperties(),
        alchemicalProperties,
        // New calculated values
        kalchm,
        monica,
        // Reference to original ingredient data
        originalData: ingredient,
        // Metadata
        metadata: {
            sourceFile: `ingredients/${sourceCategory}`,
            enhancedAt: new Date().toISOString(),
            kalchmCalculated: true
        }
    };
}
/**
 * Create a unified ingredient collection from a source collection
 */
function createUnifiedCollection(sourceCollection, category) {
    return Object.entries(sourceCollection).reduce((result, [key, ingredient]) => {
        result[key] = enhanceIngredient(ingredient, category);
        return result;
    }, {});
}
// Create enhanced unified collections
export const unifiedFruits = createUnifiedCollection(fruits, 'fruits');
export const unifiedVegetables = createUnifiedCollection(vegetables, 'vegetables');
export const unifiedHerbs = createUnifiedCollection(herbs, 'herbs');
export const unifiedSpices = createUnifiedCollection(spices, 'spices');
export const unifiedGrains = createUnifiedCollection(grains, 'grains');
export const unifiedOils = createUnifiedCollection(oils, 'oils');
export const unifiedVinegars = createUnifiedCollection(vinegars, 'vinegars');
export const unifiedSeasonings = createUnifiedCollection(seasonings, 'seasonings');
export const unifiedProteins = createUnifiedCollection(proteins, 'proteins');
// Combine all unified collections
export const unifiedIngredients = {
    ...unifiedFruits,
    ...unifiedVegetables,
    ...unifiedHerbs,
    ...unifiedSpices,
    ...unifiedGrains,
    ...unifiedOils,
    ...unifiedVinegars,
    ...unifiedSeasonings,
    ...unifiedProteins
};
// Helper functions for working with unified ingredients
/**
 * Get a unified ingredient by name
 */
export function getUnifiedIngredient(name) {
    // Try direct access first
    if (unifiedIngredients[name]) {
        return unifiedIngredients[name];
    }
    // Try case-insensitive search
    const normalizedName = name.toLowerCase();
    return Object.values(unifiedIngredients).find(ingredient => ingredient.name.toLowerCase() === normalizedName);
}

/**
 * Get unified ingredients by category
 */
export function getUnifiedIngredientsByCategory(category) {
    return Object.values(unifiedIngredients).filter(ingredient => ingredient.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get unified ingredients by subcategory
 */
export function getUnifiedIngredientsBySubcategory(subcategory) {
    return Object.values(unifiedIngredients).filter(ingredient => ingredient.subcategory?.toLowerCase() === subcategory.toLowerCase());
}

/**
 * Find ingredients with high Kalchm values
 */
export function getHighKalchmIngredients(threshold = 1.5) {
    return Object.values(unifiedIngredients)
        .filter(ingredient => ingredient.kalchm > threshold)
        .sort((a, b) => b.kalchm - a.kalchm);
}

/**
 * Find ingredients within a specific Monica value range
 */
export function getIngredientsByMonicaRange(min, max) {
    return Object.values(unifiedIngredients)
        .filter(ingredient => ingredient.monica >= min && ingredient.monica <= max)
        .sort((a, b) => a.monica - b.monica);
}

/**
 * Find ingredient pairs with complementary Kalchm-Monica balance
 */
export function findComplementaryIngredients(ingredient) {
    // Define complementary relationship criteria
    const targetKalchmRatio = 1 / ingredient.kalchm;
    const targetMonicaSum = 0; // Ideal balanced sum
    return Object.values(unifiedIngredients)
        .filter(other => other.name !== ingredient.name)
        .map(other => ({
        ingredient: other,
        complementarityScore: ((1 - Math.abs(other.kalchm - targetKalchmRatio)) * 0.5 +
            (1 - Math.abs((ingredient.monica + other.monica) - targetMonicaSum)) * 0.5)
    }))
        .sort((a, b) => b.complementarityScore - a.complementarityScore)
        .slice(0, 10)
        .map(result => result.ingredient);
}

// Export default
export default unifiedIngredients;
