import type { ElementalProperties, Recipe, Ingredient, Season } from './alchemy';
import { VALID_SEASONS } from '@/constants/seasonalConstants';
import { ELEMENTS } from '@/constants/elementalConstants';
import { VALID_UNITS } from '@/constants/unitConstants';

const VALID_MEAL_TIMES = ['breakfast', 'lunch', 'dinner'];

export const validateElementalProperties = (properties: ElementalProperties | null | undefined): boolean => {
    if (!properties) return false;
    
    // Check all elements exist and are non-negative
    if (!ELEMENTS.every(element => 
        typeof properties[element] === 'number' && 
        properties[element] >= 0
    )) {
        return false;
    }
    
    // Check total is approximately 1
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    return Math.abs(total - 1) < 0.01;
};

export const normalizeElementalProperties = (properties: ElementalProperties): ElementalProperties => {
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 1) < 0.01) return properties;
    
    return ELEMENTS.reduce((normalized, element) => ({
        ...normalized,
        [element]: properties[element] / total
    }), {} as ElementalProperties);
};

export const validateIngredient = (ingredient: Ingredient | null | undefined): boolean => {
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
    if (!ingredient.category || typeof ingredient.category !== 'string') {
        return false;
    }
    
    // Elemental properties validation
    if (!validateElementalProperties(ingredient.elementalProperties)) {
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
    
    // Validate elemental properties
    if (!validateElementalProperties(recipe.elementalProperties)) {
        return false;
    }
    
    // Validate seasonality (optional)
    if (recipe.seasonality) {
        if (!Array.isArray(recipe.seasonality)) return false;
        const normalizedSeasons = recipe.seasonality.map(s => s.toLowerCase());
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