"use strict";
// ===== UNIFIED TYPES SYSTEM =====
// This file defines type interfaces for the unified data system
// with compatibility for existing type systems
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnifiedIngredient = exports.createUnifiedIngredient = void 0;
/**
 * Helper function to create a basic valid UnifiedIngredient with default values
 */
function createUnifiedIngredient(name, category) {
    return {
        name,
        category,
        elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        },
        alchemicalProperties: {
            Spirit: 0,
            Essence: 0,
            Matter: 0,
            Substance: 0
        }
    };
}
exports.createUnifiedIngredient = createUnifiedIngredient;
/**
 * Type guard to check if an object is a valid UnifiedIngredient
 */
function isUnifiedIngredient(obj) {
    if (!obj || typeof obj !== 'object')
        return false;
    const ingredient = obj;
    return (typeof ingredient.name === 'string' &&
        typeof ingredient.category === 'string' &&
        ingredient.elementalProperties !== undefined &&
        typeof ingredient.elementalProperties === 'object' &&
        ingredient.alchemicalProperties !== undefined &&
        typeof ingredient.alchemicalProperties === 'object');
}
exports.isUnifiedIngredient = isUnifiedIngredient;
