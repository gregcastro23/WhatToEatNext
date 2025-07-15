"use strict";
/**
 * Validates an ingredient object against the RecipeIngredient interface
 */
export function validateIngredient(ingredient) {
    if (!ingredient || typeof ingredient !== 'object') {
        return false;
    }
    // Use type assertion for proper property access
    const typedIngredient = ingredient;
    // Required properties
    if (!typedIngredient.name || typeof typedIngredient.name !== 'string') {
        return false;
    }
    if (typeof typedIngredient.amount !== 'number') {
        return false;
    }
    if (!typedIngredient.unit || typeof typedIngredient.unit !== 'string') {
        return false;
    }
    // Optional elemental properties
    if (typedIngredient.elementalProperties) {
        const props = typedIngredient.elementalProperties;
        const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
        if (!requiredElements.every(element => typeof props[element] === 'number')) {
            return false;
        }
    }
    return true;
}
