import { ELEMENTS } from '@/constants/elementalConstants';
import { VALID_SEASONS } from '@/constants/seasonalConstants';
import { VALID_UNITS } from '@/constants/unitConstants';

import type { ElementalProperties, Recipe as AlchemyRecipe, Ingredient, Season } from './alchemy';
import type { Recipe, RecipeIngredient } from './recipe';

const VALID_MEAL_TIMES = ['breakfast', 'lunch', 'dinner'];

/**
 * Normalizes elemental properties to ensure they sum to 1
 * @param properties The elemental properties to normalize
 * @returns Normalized elemental properties
 */
export const normalizeElementalProperties = (properties: ElementalProperties): ElementalProperties => {
    const sum = Object.values(properties).reduce((acc: number, val: number) => acc + val, 0);
    
    if (sum === 0) {
        // If sum is 0, distribute equally
        return {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
        };
    }
    
    // Normalize each value
    return Object.entries(properties).reduce((acc, [key, value]) => {
        acc[key as keyof ElementalProperties] = value / sum;
        return acc;
    }, {} as ElementalProperties);
};

/**
 * Validates elemental properties
 * @param properties The elemental properties to validate
 * @returns True if valid, false otherwise
 */
export const validateElementalProperties = (properties: ElementalProperties): boolean => {
    if (!properties) return false;
    
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    const hasAllElements = requiredElements.every(element => 
        typeof properties[element as keyof ElementalProperties] === 'number'
    );
    
    if (!hasAllElements) return false;
    
    const sum = Object.values(properties).reduce((acc: number, val: number) => acc + val, 0);
    return Math.abs(sum - 1) < 0.01;
};

export const validateIngredient = (ingredient: RecipeIngredient | null | undefined): boolean => {
    if (!ingredient) return false;
    
    // Basic property validation
    if (!ingredient.name || typeof ingredient.name !== 'string' || ingredient.name.trim() === '') {
        return false;
    }
    
    if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
        return false;
    }
    
    if (!ingredient.unit || !VALID_UNITS.includes(ingredient.unit.toLowerCase())) {
        return false;
    }
    
    // Category validation
    if (ingredient.category && typeof ingredient.category !== 'string') {
        return false;
    }
    
    // Elemental properties validation
    if (ingredient.elementalProperties && !validateElementalProperties(ingredient.elementalProperties)) {
        return false;
    }
    
    // Seasonality validation (optional)
    if (ingredient.seasonality) {
        if (!Array.isArray(ingredient.seasonality)) return false;
        const normalizedSeasons = ingredient.seasonality.map(s => s.toLowerCase());
        const validSeasons = VALID_SEASONS.map(s => s.toLowerCase());
        if (!normalizedSeasons.every(s => validSeasons.includes(s))) {
            return false;
        }
    }
    
    return true;
};

export const validateRecipe = (recipe: Recipe | null | undefined): boolean => {
    if (!recipe) return false;
    
    // Basic property validation
    if (!recipe.name || typeof recipe.name !== 'string' || recipe.name.trim() === '') {
        return false;
    }
    
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        return false;
    }
    
    // Validate all ingredients
    if (!recipe.ingredients.every(validateIngredient)) {
        return false;
    }
    
    // Validate elemental properties if they exist
    if (recipe.elementalProperties && !validateElementalProperties(recipe.elementalProperties)) {
        return false;
    }
    
    // Validate seasonality (optional)
    if (recipe.season) {
        if (!Array.isArray(recipe.season)) return false;
        const normalizedSeasons = recipe.season.map(s => s.toLowerCase());
        const validSeasons = VALID_SEASONS.map(s => s.toLowerCase());
        if (!normalizedSeasons.every(s => validSeasons.includes(s))) {
            return false;
        }
    }
    
    // Validate cuisine (optional)
    if (recipe.cuisine && typeof recipe.cuisine !== 'string') {
        return false;
    }
    
    return true;
}; 