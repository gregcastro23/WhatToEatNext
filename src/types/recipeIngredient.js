"use strict";
/**
 * Validates an ingredient object against the RecipeIngredient interface
 */
export function validateIngredient(ingredient) {
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
        const props = ingredient.elementalProperties;
        const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
        if (!requiredElements.every(element => typeof props[element] === 'number')) {
            return false;
        }
    }
    return true;
}
