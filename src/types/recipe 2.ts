import { VALID_SEASONS } from '@/constants/seasonalConstants';
import type { RecipeIngredient } from '@/types/recipeIngredient';
import { 
  ElementalProperties as AlchemyElementalProperties
} from './alchemy';

// ElementalProperties 
export interface ElementalProperties extends AlchemyElementalProperties {}

// ValidationUtils for Recipe Types
export const validateElementalProperties = (properties: ElementalProperties): boolean => {
    if (!properties) return false;
    
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    if (!requiredElements.every(element => typeof properties[element] === 'number')) {
        return false;
    }
    
    // Check that the elements sum to 1.0 (within a small epsilon)
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 1.0) < 0.01;
};

export const validateSeason = (season: string): boolean => {
    return VALID_SEASONS.includes(season as typeof VALID_SEASONS[number]);
};

export const validateSeasonality = (seasonality: string[]): boolean => {
    return seasonality.every(season => validateSeason(season));
};

export const validateIngredient = (ingredient: any): boolean => {
    if (!ingredient || typeof ingredient !== 'object') return false;
    if (!ingredient.name || typeof ingredient.name !== 'string' || ingredient.name.trim() === '') return false;
    if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) return false;
    if (!ingredient.unit || typeof ingredient.unit !== 'string' || ingredient.unit.trim() === '') return false;
    
    if (ingredient.elementalProperties && !validateElementalProperties(ingredient.elementalProperties)) {
        return false;
    }
    
    if (ingredient.seasonality && !validateSeasonality(ingredient.seasonality)) {
        return false;
    }
    
    return true;
};

export const validateRecipe = (recipe: any): boolean => {
    if (!recipe || typeof recipe !== 'object') return false;
    if (!recipe.id || typeof recipe.id !== 'string' || recipe.id.trim() === '') return false;
    if (!recipe.name || typeof recipe.name !== 'string' || recipe.name.trim() === '') return false;
    
    if (recipe.elementalProperties && !validateElementalProperties(recipe.elementalProperties)) {
        return false;
    }
    
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        return false;
    }
    
    if (!recipe.ingredients.every(ing => validateIngredient(ing))) {
        return false;
    }
    
    if (recipe.season && !validateSeason(recipe.season) && 
        !(Array.isArray(recipe.season) && recipe.season.every(s => validateSeason(s)))) {
        return false;
    }
    
    if (recipe.seasonality && !validateSeasonality(recipe.seasonality)) {
        return false;
    }
    
    return true;
};

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  timeToMake?: string;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  elementalProperties: ElementalProperties;
  season?: string | string[];
  mealTime?: string;
  mealType?: string[];
  cuisine?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  seasonality?: string[];
  energyProfile?: Record<string, unknown>;
  [key: string]: unknown; // Allow for additional properties
}

export interface ScoredRecipe extends Recipe {
  score: number;
} 