"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KALCHM_RANGES = exports.DEFAULT_KALCHM = exports.getDefaultAlchemicalProperties = exports.normalizeAlchemicalProperties = exports.validateAlchemicalProperties = exports.findKalchmSimilarIngredients = exports.calculateCuisineKalchm = exports.calculateKalchmCompatibility = exports.enhanceIngredientWithAlchemy = exports.deriveAlchemicalFromElemental = exports.performAlchemicalAnalysis = exports.calculateMonica = exports.calculateThermodynamics = exports.calculateKalchm = void 0;
// ===== CORE CALCULATION FUNCTIONS =====
/**
 * Calculate Kalchm (K_alchm) - Baseline alchemical equilibrium
 * Formula: K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 */
function calculateKalchm(alchemicalProps) {
    const { Spirit, Essence, Matter, Substance } = alchemicalProps;
    // Handle edge cases where values might be 0
    const safespirit = Math.max(Spirit, 0.01);
    const safeessence = Math.max(Essence, 0.01);
    const safematter = Math.max(Matter, 0.01);
    const safesubstance = Math.max(Substance, 0.01);
    const numerator = Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence);
    const denominator = Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance);
    return numerator / denominator;
}
exports.calculateKalchm = calculateKalchm;
/**
 * Calculate thermodynamic metrics including heat, entropy, reactivity, and Greg's Energy
 */
function calculateThermodynamics(alchemicalProps, elementalProps) {
    const { Spirit, Essence, Matter, Substance } = alchemicalProps;
    const { Fire, Water, Air, Earth } = elementalProps;
    // Heat calculation
    const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
    const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
    const heat = heatNum / Math.max(heatDen, 0.01);
    // Entropy calculation
    const entropyNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2);
    const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
    const entropy = entropyNum / Math.max(entropyDen, 0.01);
    // Reactivity calculation
    const reactivityNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Essence, 2)
        + Math.pow(Fire, 2) + Math.pow(Air, 2) + Math.pow(Water, 2);
    const reactivityDen = Math.pow(Matter + Earth, 2);
    const reactivity = reactivityNum / Math.max(reactivityDen, 0.01);
    // Greg's Energy
    const gregsEnergy = heat - (entropy * reactivity);
    return { heat, entropy, reactivity, gregsEnergy };
}
exports.calculateThermodynamics = calculateThermodynamics;
/**
 * Calculate Monica constant (M) - Dynamic scaling factor
 * Formula: M = -Greg's Energy / (Reactivity * ln(Kalchm))
 */
function calculateMonica(gregsEnergy, reactivity, kalchm) {
    if (kalchm <= 0)
        return NaN;
    const lnKalchm = Math.log(kalchm);
    if (lnKalchm === 0)
        return NaN;
    return -gregsEnergy / (reactivity * lnKalchm);
}
exports.calculateMonica = calculateMonica;
/**
 * Complete alchemical analysis for an ingredient or cuisine
 */
function performAlchemicalAnalysis(alchemicalProps, elementalProps) {
    // Calculate Kalchm
    const kalchm = calculateKalchm(alchemicalProps);
    // Calculate thermodynamic metrics
    const thermodynamics = calculateThermodynamics(alchemicalProps, elementalProps);
    // Calculate Monica constant
    const monica = calculateMonica(thermodynamics.gregsEnergy, thermodynamics.reactivity, kalchm);
    return {
        ...thermodynamics,
        kalchm,
        monica
    };
}
exports.performAlchemicalAnalysis = performAlchemicalAnalysis;
// ===== INGREDIENT ENHANCEMENT FUNCTIONS =====
/**
 * Derive alchemical properties from elemental properties
 * This is used when we only have elemental data and need to estimate alchemical properties
 */
function deriveAlchemicalFromElemental(elementalProps) {
    const { Fire, Water, Earth, Air } = elementalProps;
    // Mapping based on alchemical principles:
    // Spirit: Volatile, transformative (Fire + Air dominant)
    // Essence: Active principles (Water + Fire)
    // Matter: Physical structure (Earth dominant)
    // Substance: Stable components (Earth + Water)
    return {
        Spirit: (Fire * 0.6 + Air * 0.4),
        Essence: (Water * 0.5 + Fire * 0.3 + Air * 0.2),
        Matter: (Earth * 0.7 + Water * 0.3),
        Substance: (Earth * 0.5 + Water * 0.4 + Fire * 0.1)
    };
}
exports.deriveAlchemicalFromElemental = deriveAlchemicalFromElemental;
/**
 * Enhance an ingredient with alchemical properties and Kalchm calculation
 */
function enhanceIngredientWithAlchemy(ingredient) {
    // Derive alchemical properties from elemental properties
    const alchemicalProperties = deriveAlchemicalFromElemental(ingredient.elementalProperties);
    // Calculate Kalchm
    const kalchm = calculateKalchm(alchemicalProperties);
    return {
        ...ingredient,
        alchemicalProperties,
        kalchm
    };
}
exports.enhanceIngredientWithAlchemy = enhanceIngredientWithAlchemy;
/**
 * Calculate compatibility between two ingredients based on their Kalchm values
 * Uses self-reinforcement principles: similar Kalchm = higher compatibility
 */
function calculateKalchmCompatibility(kalchm1, kalchm2) {
    // Calculate the ratio between the two Kalchm values
    const ratio = Math.min(kalchm1, kalchm2) / Math.max(kalchm1, kalchm2);
    // Convert ratio to compatibility score (0.7 minimum for good compatibility)
    return 0.7 + (ratio * 0.3);
}
exports.calculateKalchmCompatibility = calculateKalchmCompatibility;
// ===== CUISINE ENHANCEMENT FUNCTIONS =====
/**
 * Calculate aggregate Kalchm for a cuisine based on its typical ingredients
 */
function calculateCuisineKalchm(ingredients, weights) {
    if (ingredients.length === 0)
        return 1.0;
    const effectiveWeights = weights || ingredients.map(() => 1 / ingredients.length);
    let weightedKalchmSum = 0;
    let totalWeight = 0;
    for (let i = 0; i < ingredients.length; i++) {
        const weight = effectiveWeights[i] || 0;
        weightedKalchmSum += ingredients[i].kalchm * weight;
        totalWeight += weight;
    }
    return totalWeight > 0 ? weightedKalchmSum / totalWeight : 1.0;
}
exports.calculateCuisineKalchm = calculateCuisineKalchm;
/**
 * Find ingredients with similar Kalchm values for substitution recommendations
 */
function findKalchmSimilarIngredients(targetKalchm, ingredientPool, tolerance = 0.2) {
    return ingredientPool.filter(ingredient => {
        const compatibility = calculateKalchmCompatibility(targetKalchm, ingredient.kalchm);
        return compatibility >= (0.9 - tolerance); // High compatibility threshold
    });
}
exports.findKalchmSimilarIngredients = findKalchmSimilarIngredients;
// ===== VALIDATION AND UTILITY FUNCTIONS =====
/**
 * Validate alchemical properties to ensure they're within reasonable bounds
 */
function validateAlchemicalProperties(props) {
    const { Spirit, Essence, Matter, Substance } = props;
    // Check if all values are positive numbers
    if (Spirit <= 0 || Essence <= 0 || Matter <= 0 || Substance <= 0) {
        return false;
    }
    // Check if values are within reasonable bounds (0-2 scale)
    if (Spirit > 2 || Essence > 2 || Matter > 2 || Substance > 2) {
        return false;
    }
    return true;
}
exports.validateAlchemicalProperties = validateAlchemicalProperties;
/**
 * Normalize alchemical properties to ensure they sum to 1
 */
function normalizeAlchemicalProperties(props) {
    const { Spirit, Essence, Matter, Substance } = props;
    const sum = Spirit + Essence + Matter + Substance;
    if (sum === 0) {
        // Return balanced default if sum is 0
        return { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 };
    }
    return {
        Spirit: Spirit / sum,
        Essence: Essence / sum,
        Matter: Matter / sum,
        Substance: Substance / sum
    };
}
exports.normalizeAlchemicalProperties = normalizeAlchemicalProperties;
/**
 * Get default alchemical properties for unknown ingredients
 */
function getDefaultAlchemicalProperties() {
    return {
        Spirit: 0.25,
        Essence: 0.25,
        Matter: 0.25,
        Substance: 0.25
    };
}
exports.getDefaultAlchemicalProperties = getDefaultAlchemicalProperties;
// Default Kalchm value for unknown ingredients
exports.DEFAULT_KALCHM = 1.0;
// Kalchm ranges for different ingredient categories
exports.KALCHM_RANGES = {
    spices: {},
    herbs: {},
    vegetables: {},
    fruits: {},
    grains: {},
    proteins: {},
    dAiry: { min: 0.8, max: 1.6 }
};
