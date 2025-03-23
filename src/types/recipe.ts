import type { Recipe, Ingredient, ElementalProperties } from '../recipe';
import { validateRecipe as importedValidateRecipe, validateIngredient as importedValidateIngredient, validateElementalProperties as importedValidateElementalProperties } from '../validators';
import { VALID_SEASONS } from '@/constants/seasonalConstants';
import type { Recipe as RecipeType, Ingredient as IngredientType } from '../types';
import { Season, 
  ZodiacSign,
  LunarPhase,
  ThermodynamicProperties,
  CookingMethod
} from './alchemy';
import type { RecipeIngredient as ImportedRecipeIngredient } from '@/types/recipeIngredient';

describe('Recipe Type Validation', () => {
    const validElementalProperties: ElementalProperties = {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
    };

    const validIngredient: IngredientType = {
        name: 'Test Ingredient',
        amount: 1,
        unit: 'unit',
        elementalProperties: validElementalProperties,
        seasonality: ['Spring', 'Summer']
    };

    const validRecipe: RecipeType = {
        id: 'test-recipe',
        name: 'Test Recipe',
        cuisine: 'japanese',
        description: 'A test recipe description',
        elementalProperties: validElementalProperties,
        ingredients: [validIngredient],
        season: 'Summer',
        mealTime: 'breakfast',
        seasonality: ['Spring', 'Summer'],
        instructions: [],
        energyProfile: {}
    };

    describe('validateElementalProperties', () => {
        test('validates correct properties', () => {
            expect(importedValidateElementalProperties(validElementalProperties)).toBe(true);
        });

        test('fails on invalid total', () => {
            const invalid = { ...validElementalProperties, Fire: 0.5 };
            expect(importedValidateElementalProperties(invalid)).toBe(false);
        });
    });

    describe('validateRecipe', () => {
        test('validates correct recipe', () => {
            expect(importedValidateRecipe(validRecipe)).toBe(true);
        });

        test('fails on invalid ingredients', () => {
            const invalid = {
                ...validRecipe,
                ingredients: [{ ...validIngredient, amount: -1 }]
            };
            expect(importedValidateRecipe(invalid as RecipeType)).toBe(false);
        });

        test('requires valid id', () => {
            const invalidRecipe = {
                ...validRecipe,
                id: ''
            };
            expect(importedValidateRecipe(invalidRecipe)).toBe(false);
        });

        test('requires valid name', () => {
            const invalidRecipe = {
                ...validRecipe,
                name: ''
            };
            expect(importedValidateRecipe(invalidRecipe)).toBe(false);
        });

        test('validates elemental properties', () => {
            const invalidRecipe = {
                ...validRecipe,
                elementalProperties: {
                    Fire: 0.5,
                    Water: 0.5,
                    Earth: 0.5,
                    Air: 0.5
                }
            };
            expect(importedValidateRecipe(invalidRecipe)).toBe(false);
        });

        test('validates ingredients array', () => {
            const invalidRecipe = {
                ...validRecipe,
                ingredients: []
            };
            expect(importedValidateRecipe(invalidRecipe)).toBe(false);
        });

        test('accepts multiple seasons', () => {
            const multiSeasonRecipe = {
                ...validRecipe,
                season: ['Summer', 'Spring']
            };
            expect(importedValidateRecipe(multiSeasonRecipe)).toBe(true);
        });

        test('validates meal time', () => {
            const invalidRecipe = {
                ...validRecipe,
                mealTime: 'invalid-time'
            };
            expect(importedValidateRecipe(invalidRecipe)).toBe(false);
        });

        test('validates recipe with optional fields', () => {
            const recipeWithOptionals: RecipeType = {
                ...validRecipe,
                cuisine: 'test',
                description: 'test description',
                seasonality: ['Spring', 'Summer']
            };
            expect(importedValidateRecipe(recipeWithOptionals)).toBe(true);
        });

        test('validates recipe without optional fields', () => {
            const minimalRecipe: RecipeType = {
                id: 'test-recipe',
                name: 'Test Recipe',
                ingredients: [validIngredient],
                elementalProperties: validElementalProperties
            };
            expect(importedValidateRecipe(minimalRecipe)).toBe(true);
        });

        test('validates seasonality', () => {
            const invalidRecipe: Recipe = {
                id: 'test-1',
                name: 'Test Recipe',
                ingredients: [validIngredient],
                elementalProperties: validElementalProperties,
                seasonality: ['InvalidSeason'] as any[]
            };

            const isValidSeason = invalidRecipe.seasonality!.every(season =>
                VALID_SEASONS.includes(season as typeof VALID_SEASONS[number])
            );
            expect(isValidSeason).toBe(false);
            expect(importedValidateRecipe(invalidRecipe)).toBe(false);
        });
    });

    describe('validateIngredient', () => {
        test('validates correct ingredient', () => {
            expect(importedValidateIngredient(validIngredient)).toBe(true);
        });

        test('fails on missing required fields', () => {
            const invalid = { ...validIngredient, name: undefined };
            expect(importedValidateIngredient(invalid as IngredientType)).toBe(false);
        });

        test('requires valid name', () => {
            const invalidIngredient = {
                ...validIngredient,
                name: ''
            };
            expect(importedValidateIngredient(invalidIngredient)).toBe(false);
        });

        test('requires positive amount', () => {
            const invalidIngredient = {
                ...validIngredient,
                amount: -1
            };
            expect(importedValidateIngredient(invalidIngredient)).toBe(false);
        });

        test('requires valid unit', () => {
            const invalidIngredient = {
                ...validIngredient,
                unit: ''
            };
            expect(importedValidateIngredient(invalidIngredient)).toBe(false);
        });

        test('validates elemental properties', () => {
            const invalidIngredient = {
                ...validIngredient,
                elementalProperties: {
                    Fire: 0.5,
                    Water: 0.5,
                    Earth: 0.5,
                    Air: 0.5
                }
            };
            expect(importedValidateIngredient(invalidIngredient)).toBe(false);
        });

        test('validates seasonality', () => {
            const invalidIngredient: Ingredient = {
                ...validIngredient,
                seasonality: ['InvalidSeason'] as any[]
            };

            const isValidSeason = invalidIngredient.seasonality!.every(season =>
                VALID_SEASONS.includes(season as typeof VALID_SEASONS[number])
            );
            expect(isValidSeason).toBe(false);
            expect(importedValidateIngredient(invalidIngredient)).toBe(false);
        });
    });

    describe('type compatibility', () => {
        test('allows optional fields', () => {
            const minimalRecipe: RecipeType = {
                id: 'minimal-recipe',
                name: 'Minimal Recipe',
                cuisine: 'japanese',
                description: 'A minimal recipe',
                elementalProperties: validElementalProperties,
                ingredients: [validIngredient]
            };
            expect(importedValidateRecipe(minimalRecipe)).toBe(true);
        });

        test('allows extended types', () => {
            const extendedRecipe = {
                ...validRecipe,
                additionalInfo: {
                    difficulty: 'easy',
                    prepTime: '10 minutes'
                }
            };
            expect(importedValidateRecipe(extendedRecipe)).toBe(true);
        });
    });
});

export const validateElementalProperties = (properties: ElementalProperties): boolean => {
    if (!properties) return false;
    
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    if (!requiredElements.every(element => typeof properties[element] === 'number')) {
        return false;
    }
    
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    return Math.abs(total - 1) < 0.01;
};

export const validateSeason = (season: string): boolean => {
    const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
    return validSeasons.includes(season.toLowerCase());
};

export const validateSeasonality = (seasonality: string[]): boolean => {
    if (!Array.isArray(seasonality)) return false;
    return seasonality.every(season => validateSeason(season));
};

export const validateIngredient = (ingredient: Partial<RecipeIngredient>): boolean => {
    if (!ingredient) return false;

    // Required properties
    if (!ingredient.name || typeof ingredient.name !== 'string') return false;
    if (typeof ingredient.amount !== 'number') return false;
    if (!ingredient.unit || typeof ingredient.unit !== 'string') return false;
    
    // Validate elemental properties
    if (!validateElementalProperties(ingredient.elementalProperties)) return false;
    
    // Validate seasonality if present
    if (ingredient.seasonality && !validateSeasonality(ingredient.seasonality)) return false;

    return true;
};

export const validateRecipe = (recipe: Partial<Recipe>): boolean => {
    if (!recipe) return false;

    // Required properties
    if (!recipe.name || typeof recipe.name !== 'string') return false;
    if (!recipe.cuisine || typeof recipe.cuisine !== 'string') return false;
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) return false;
    
    // Validate elemental properties
    if (!validateElementalProperties(recipe.elementalProperties)) return false;
    
    // Validate ingredients
    if (!recipe.ingredients.every(validateIngredient)) return false;
    
    return true;
};

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  category?: string;
  id?: string;
  optional?: boolean;
  preparation?: string;
}

export interface ScoredRecipe extends Recipe {
  score: number;
}

export { 
  validateElementalProperties,
  validateSeason,
  validateSeasonality,
  validateIngredient,
  validateRecipe,
  Recipe
};

// Re-export the imported validators with new names to avoid redeclaration
export const validateElementalPropertiesExt = importedValidateElementalProperties;
export const validateIngredientExt = importedValidateIngredient;
export const validateRecipeExt = importedValidateRecipe;

// Export existing interfaces with new names
export interface RecipeIngredientExt {
  name: string;
  amount: number;
  unit: string;
  category?: string;
  id?: string;
  optional?: boolean;
  preparation?: string;
}

// Export the extended version only, not the base Recipe interface 
// which is already imported from '../recipe'
export interface RecipeExtended extends RecipeIngredientExt {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredientExt[];
  instructions: string[];
  timeToMake: string;
  servings: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  elementalProperties: ElementalProperties;
  season?: string[];
  mealType?: string[];
  cuisine?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  astrologicalInfluences?: string[];
  [key: string]: any; // Allow for additional properties
}

export interface ScoredRecipeExtended extends RecipeExtended {
  score: number;
}

export interface ElementProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night';

// Enhanced Recipe interface with culinary details
interface Recipe {
  // Basic Information (existing)
  id: string;
  name: string;
  description: string;
  cuisine: string;
  
  // Time & Serving (expanded)
  prepTime: string;        // e.g., "20 minutes"
  cookTime: string;        // e.g., "45 minutes"
  totalTime?: string;      // Optional calculated total
  restTime?: string;       // For recipes that need resting/marinating
  servingSize: number;
  yield?: string;          // For recipes that produce specific amounts
  
  // Culinary Classifications
  course: string[];        // e.g., ["appetizer", "main", "dessert"]
  mealType: string[];      // e.g., ["breakfast", "lunch", "dinner"]
  dishType: string[];      // e.g., ["soup", "stew", "salad", "sandwich"]
  
  // Technique Details
  cookingMethod: string[]; // Primary cooking methods used
  cookingTechniques: string[]; // Specific techniques employed
  equipmentNeeded: string[]; // Required kitchen equipment
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  skillsRequired: string[]; // e.g., "knife skills", "sauce making"
  
  // Ingredients (enhanced)
  ingredients: {
    name: string;
    amount: string;
    unit: string;
    preparation: string;   // e.g., "finely diced", "julienned"
    optional: boolean;
    substitutes?: string[]; // Possible substitutions
    notes?: string;        // Special notes about the ingredient
    category: string;      // e.g., "protein", "vegetable", "spice"
    function?: string;     // Culinary function: "base", "seasoning", "garnish"
    cookingPoint?: string; // When to add this ingredient
  }[];
  
  // Recipe Structure
  componentParts?: {       // For complex recipes with multiple elements
    name: string;          // e.g., "sauce", "filling", "dough"
    ingredients: any[];    // Ingredients specific to this component
    instructions: string[]; // Instructions specific to this component
  }[];
  
  instructions: string[];  // Main instructions
  instructionSections?: { // For recipes with distinct preparation phases
    title: string;
    steps: string[];
  }[];
  
  // Flavor Profile & Culinary Theory
  flavorProfile: {
    primary: string[];     // Primary flavors
    accent: string[];      // Accent flavors
    base: string[];        // Base notes
    tasteBalance: {        // Assessed proportions of five basic tastes
      sweet: number;       // 0-10 scale
      salty: number;
      sour: number;
      bitter: number;
      umami: number;
    }
  };
  
  texturalElements: string[]; // e.g., "crispy", "creamy", "chewy"
  aromatics: string[];     // Key aromatic components
  colorProfile: string[];  // Dominant colors
  
  // Cultural & Historical Context
  origin: string;          // Specific region of origin
  history?: string;        // Brief history of the dish
  traditionalOccasion?: string[]; // Traditional occasions for serving
  regionalVariations?: string[]; // Notable regional variations
  
  // Pairing Suggestions
  pairingRecommendations?: {
    wines?: string[];
    beverages?: string[];
    sides?: string[];
    condiments?: string[];
  };
  
  // Technical Culinary Details
  cookingTemperature?: {
    value: number;
    unit: 'C' | 'F';
    technique: string;     // e.g., "roast", "simmer"
  }[];
  
  internalTemperature?: {  // For proteins
    value: number;
    unit: 'C' | 'F';
    doneness: string;      // e.g., "rare", "medium", "well-done"
  };
  
  // Nutrition (expanded)
  nutrition: {
    calories: number;
    servingSize: string;   // Defined serving
    macronutrients: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    micronutrients?: {
      vitamins: Record<string, number>;
      minerals: Record<string, number>;
    };
  };
  
  // Dietary Considerations
  dietaryClassifications: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
    isLowCarb: boolean;
    isKeto: boolean;
    isPaleo: boolean;
    containsAlcohol: boolean;
    allergens: string[];
  };
  
  // Seasonal & Astrological Information
  season: string[];        // Seasons when optimal
  seasonalIngredients: string[]; // Ingredients that are seasonal
  
  // Enhanced astrological properties
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  
  astrologicalInfluences: string[];
  
  // Chef's Notes
  chefNotes?: string[];    // Special notes from the chef
  commonMistakes?: string[]; // Mistakes to avoid
  tips?: string[];         // Professional tips
  variations?: string[];   // Possible variations
  
  // Visual & Sensory
  presentationTips?: string[]; // How to plate or present
  sensoryIndicators?: {    // How to know when done
    visual: string[];
    aroma: string[];
    texture: string[];
    sound: string[];
  };
  
  // Tags & Metadata
  tags: string[];          // Searchable tags
  keywords: string[];      // SEO keywords
} 