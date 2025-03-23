import { Recipe, Ingredient } from './recipe';
import { VALID_SEASONS } from '@/constants/seasonalConstants';

export function validateRecipe(recipe: Recipe): boolean {
    // Validate basic recipe properties
    if (!recipe.name || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
        return false;
    }

    // Validate seasonality if present
    if (recipe.seasonality) {
        if (!Array.isArray(recipe.seasonality)) return false;
        const isValidSeasonality = recipe.seasonality.every(season => 
            VALID_SEASONS.includes(season)
        );
        if (!isValidSeasonality) return false;
    }

    // Validate season field if present (legacy field)
    if (recipe.season) {
        const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
        const isValidSeason = seasons.every(season => 
            VALID_SEASONS.includes(season as typeof VALID_SEASONS[number])
        );
        if (!isValidSeason) return false;
    }

    // Validate ingredients
    return recipe.ingredients.every(validateIngredient);
}

export function validateIngredient(ingredient: Ingredient): boolean {
    // Validate basic ingredient properties
    if (!ingredient.name || typeof ingredient.amount !== 'number') {
        return false;
    }

    // Validate seasonality if present
    if (ingredient.seasonality) {
        if (!Array.isArray(ingredient.seasonality)) return false;
        const isValidSeasonality = ingredient.seasonality.every(season => 
            VALID_SEASONS.includes(season)
        );
        if (!isValidSeasonality) return false;
    }

    // Validate elemental properties if present
    if (ingredient.elementalProperties) {
        const sum = Object.values(ingredient.elementalProperties)
            .reduce((acc, val) => acc + val, 0);
        if (Math.abs(sum - 1) > 0.000001) return false;
    }

    return true;
} 