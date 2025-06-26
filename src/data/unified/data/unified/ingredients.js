"use strict";
// ===== UNIFIED INGREDIENTS SYSTEM =====
// This file provides a unified interface for accessing ingredients with enhanced alchemical properties
// It acts as an adapter/enhancer for existing ingredient data rather than duplicating it
Object.defineProperty(exports, "__esModule", { value: true });
exports.findComplementaryIngredients = exports.getIngredientsByMonicaRange = exports.getHighKalchmIngredients = exports.getUnifiedIngredientsBySubcategory = exports.getUnifiedIngredientsByCategory = exports.getUnifiedIngredient = exports.unifiedIngredients = exports.unifiedProteins = exports.unifiedSeasonings = exports.unifiedVinegars = exports.unifiedOils = exports.unifiedGrains = exports.unifiedSpices = exports.unifiedHerbs = exports.unifiedVegetables = exports.unifiedFruits = void 0;
const elementalUtils_1 = require("../../utils/elemental/elementalUtils");
// Import ingredient data from their original sources
const fruits_1 = require("../ingredients/fruits");
const vegetables_1 = require("../ingredients/vegetables");
const herbs_1 = require("../ingredients/herbs");
const spices_1 = require("../ingredients/spices");
const grains_1 = require("../ingredients/grains");
const oils_1 = require("../ingredients/oils");
const vinegars_1 = require("../ingredients/vinegars/vinegars");
const seasonings_1 = require("../ingredients/seasonings");
const proteins_1 = require("../ingredients/proteins");
// Combine all protein types
const proteins = {
    ...proteins_1.meats,
    ...proteins_1.poultry,
    ...proteins_1.seafood,
    ...proteins_1.plantBased
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
        elementalProperties: ingredient.elementalProperties || (0, elementalUtils_1.createElementalProperties)(),
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
exports.unifiedFruits = createUnifiedCollection(fruits_1.fruits, 'fruits');
exports.unifiedVegetables = createUnifiedCollection(vegetables_1.vegetables, 'vegetables');
exports.unifiedHerbs = createUnifiedCollection(herbs_1.herbs, 'herbs');
exports.unifiedSpices = createUnifiedCollection(spices_1.spices, 'spices');
exports.unifiedGrains = createUnifiedCollection(grains_1.allGrains, 'grains');
exports.unifiedOils = createUnifiedCollection(oils_1.allOils, 'oils');
exports.unifiedVinegars = createUnifiedCollection(vinegars_1.vinegars, 'vinegars');
exports.unifiedSeasonings = createUnifiedCollection(seasonings_1.seasonings, 'seasonings');
exports.unifiedProteins = createUnifiedCollection(proteins, 'proteins');
// Combine all unified collections
exports.unifiedIngredients = {
    ...exports.unifiedFruits,
    ...exports.unifiedVegetables,
    ...exports.unifiedHerbs,
    ...exports.unifiedSpices,
    ...exports.unifiedGrains,
    ...exports.unifiedOils,
    ...exports.unifiedVinegars,
    ...exports.unifiedSeasonings,
    ...exports.unifiedProteins
};
// Helper functions for working with unified ingredients
/**
 * Get a unified ingredient by name
 */
function getUnifiedIngredient(name) {
    // Try direct access first
    if (exports.unifiedIngredients[name]) {
        return exports.unifiedIngredients[name];
    }
    // Try case-insensitive search
    const normalizedName = name.toLowerCase();
    return Object.values(exports.unifiedIngredients).find(ingredient => ingredient.name.toLowerCase() === normalizedName);
}
exports.getUnifiedIngredient = getUnifiedIngredient;
/**
 * Get unified ingredients by category
 */
function getUnifiedIngredientsByCategory(category) {
    return Object.values(exports.unifiedIngredients).filter(ingredient => ingredient.category.toLowerCase() === category.toLowerCase());
}
exports.getUnifiedIngredientsByCategory = getUnifiedIngredientsByCategory;
/**
 * Get unified ingredients by subcategory
 */
function getUnifiedIngredientsBySubcategory(subcategory) {
    return Object.values(exports.unifiedIngredients).filter(ingredient => ingredient.subcategory?.toLowerCase() === subcategory.toLowerCase());
}
exports.getUnifiedIngredientsBySubcategory = getUnifiedIngredientsBySubcategory;
/**
 * Find ingredients with high Kalchm values
 */
function getHighKalchmIngredients(threshold = 1.5) {
    return Object.values(exports.unifiedIngredients)
        .filter(ingredient => ingredient.kalchm > threshold)
        .sort((a, b) => b.kalchm - a.kalchm);
}
exports.getHighKalchmIngredients = getHighKalchmIngredients;
/**
 * Find ingredients within a specific Monica value range
 */
function getIngredientsByMonicaRange(min, max) {
    return Object.values(exports.unifiedIngredients)
        .filter(ingredient => ingredient.monica >= min && ingredient.monica <= max)
        .sort((a, b) => a.monica - b.monica);
}
exports.getIngredientsByMonicaRange = getIngredientsByMonicaRange;
/**
 * Find ingredient pAirs with complementary Kalchm-Monica balance
 */
function findComplementaryIngredients(ingredient) {
    // Define complementary relationship criteria
    const targetKalchmRatio = 1 / ingredient.kalchm;
    const targetMonicaSum = 0; // Ideal balanced sum
    return Object.values(exports.unifiedIngredients)
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
exports.findComplementaryIngredients = findComplementaryIngredients;
// Export default
exports.default = exports.unifiedIngredients;
