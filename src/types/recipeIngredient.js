"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIngredient = void 0;
/**
 * Validates an ingredient object against the RecipeIngredient interface
 */
function validateIngredient(ingredient) {
    if (!ingredient || typeof ingredient !== 'object') {
        return false;
    }
    // Required properties
    if (!ingredient.name || typeof ingredient.name !== 'string') {
        return false;
    }
    if (typeof ingredient.amount !== 'number') {
        return false;
    }
    if (!ingredient.unit || typeof ingredient.unit !== 'string') {
        return false;
    }
    // Optional elemental properties
    if (ingredient.elementalProperties) {
        const props_1 = ingredient.elementalProperties;
        const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
        if (!requiredElements.every(function (element) { return typeof props_1[element] === 'number'; })) {
            return false;
        }
    }
    return true;
}
exports.validateIngredient = validateIngredient;
