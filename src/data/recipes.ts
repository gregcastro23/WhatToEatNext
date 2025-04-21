import cuisinesMap from './cuisines/index';
import type { Recipe } from '../types/recipe';
import { 
  planetaryFlavorProfiles, 
  calculateFlavorProfile, 
  getResonantCuisines, 
  getDominantFlavor, 
  calculatePlanetaryFlavorMatch 
} from './planetaryFlavorProfiles';
import { 
  cuisineFlavorProfiles, 
  calculateCuisineFlavorMatch, 
  getCuisineProfile,
  getRelatedCuisines 
} from './cuisineFlavorProfiles';

// Import standardized enums and normalization utilities
import {
  Element,
  ZodiacSign,
  PlanetName,
  Season,
  LunarPhase,
  CookingMethod
} from '../types/constants';

import {
  normalizeRecipe,
  normalizeRecipes,
  normalizeRecipeIngredient,
  normalizeIngredients,
  createDefaultElementalProperties,
  normalizePlanetCasing,
  normalizeZodiacCasing
} from '../utils/dataNormalization';

import {
  normalizeZodiacSign,
  normalizeSeason,
  normalizeLunarPhase,
  normalizeZodiacSigns,
  normalizeSeasons,
  normalizeLunarPhases
} from '../utils/validation';

// Log what was imported
console.log("cuisinesMap keys:", Object.keys(cuisinesMap));

export interface RecipeData {
  id: string;
  name: string;
  description: string;
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    optional?: boolean;
    preparation?: string;
    category?: string;
  }[];
  instructions: string[];
  cuisine?: string;
  energyProfile: {
    zodiac?: string[];
    lunar?: string[];
    planetary?: string[];
    season?: string[];
  };
  tags?: string[];
  timeToMake?: number;
  flavorProfile?: {
    spicy: number;
    sweet: number;
    sour: number;
    bitter: number;
    salty: number;
    umami: number;
  };
  planetaryInfluences?: Record<string, number>;
  regionalCuisine?: string; // Store specific regional variation if applicable
  matchScore?: number; // Used for sorting and displaying compatibility
  
  // Standardized fields
  servingSize?: number; // Number of servings
  substitutions?: { original: string; alternatives: string[] }[];
  tools?: string[]; // Required cooking tools/equipment
  spiceLevel?: number | 'mild' | 'medium' | 'hot' | 'very hot'; // Indicator of spiciness
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    vitamins?: string[];
    minerals?: string[];
  }; // Nutritional information
  preparationNotes?: string; // Special notes about preparation
  technicalTips?: string[]; // Technical cooking tips
}

// Create a private variable to hold all recipes
let _allRecipes: Recipe[] | null = null;

/**
 * Transform cuisine data from all cuisines into standardized recipes
 * @returns Array of standardized recipes
 */
const transformCuisineData = async (): Promise<Recipe[]> => {
  const recipeData: RecipeData[] = [];
  
  console.log("Starting transformCuisineData");
  console.log("Available cuisines:", Object.keys(cuisinesMap));
  
  const cuisineDataPromises = Object.entries(cuisinesMap).map(async ([cuisineName, cuisineData]) => {
    try {
      console.log(`Processing cuisine: ${cuisineName}`);
      
      const primaryPlanetaryInfluences: Record<string, number> = {};
      
      // Get the cuisine flavor profile
      const cuisineProfile = getCuisineProfile(cuisineName);
      
      // Map planetary influences based on cuisine's flavor profile
      Object.entries(planetaryFlavorProfiles).forEach(([planet, profile]) => {
        if (profile.culinaryAffinity.includes(cuisineName.toLowerCase())) {
          primaryPlanetaryInfluences[planet] = 0.8;
        } else {
          const partialMatch = profile.culinaryAffinity.some(affinity => 
            affinity.includes(cuisineName.toLowerCase()) || cuisineName.toLowerCase().includes(affinity)
          );
          if (partialMatch) {
            primaryPlanetaryInfluences[planet] = 0.5;
          }
        }
      });
      
      // Get flavor profile from cuisine definitions or calculate from planetary influences
      const cuisineFlavorProfile = cuisineProfile?.flavorProfiles;
      const defaultFlavorProfile = cuisineFlavorProfile || calculateFlavorProfile(primaryPlanetaryInfluences);
      
      // Handle dishes
      if (cuisineData && cuisineData.dishes && typeof cuisineData.dishes === 'object') {
        // Log the dishes structure to debug
        console.log(`${cuisineName} dishes:`, Object.keys(cuisineData.dishes));
        
        // Process meal types (breakfast, lunch, dinner, etc.)
        Object.entries(cuisineData.dishes).forEach(([mealType, mealData]) => {
          if (!mealData) {
            console.log(`No meal data for ${cuisineName} - ${mealType}`);
            return;
          }
          
          if (typeof mealData === 'object') {
            // Log meal data structure
            console.log(`${cuisineName} - ${mealType} data:`, Object.keys(mealData));
            
            // Process season data (spring, summer, autumn, winter, all)
            Object.entries(mealData as Record<string, unknown>).forEach(([seasonStr, dishes]) => {
              // Normalize season to standardized enum
              const season = normalizeSeason(seasonStr);
              
              if (!season) {
                console.log(`Invalid season: ${seasonStr} for ${cuisineName} - ${mealType}`);
                return;
              }
              
              if (!dishes) {
                console.log(`No dishes for ${cuisineName} - ${mealType} - ${season}`);
                return;
              }
              
              // Ensure dishes is an array
              if (Array.isArray(dishes)) {
                console.log(`Found ${dishes.length} dishes for ${cuisineName} - ${mealType} - ${season}`);
                
                // Process individual dishes
                dishes.forEach((dish: unknown) => {
                  if (!dish || typeof dish !== 'object' || !dish.name) {
                    console.log('Skipping invalid dish:', dish);
                    return;
                  }
                  
                  const typedDish = dish as Record<string, unknown>;
                  
                  // Build dish-specific planetary influences
                  const dishPlanetaryInfluences = { ...primaryPlanetaryInfluences };
                  
                  if (typedDish.planetary && Array.isArray(typedDish.planetary)) {
                    // Normalize planet names
                    normalizePlanetCasing(typedDish.planetary as string[]).forEach((planet: string) => {
                      dishPlanetaryInfluences[planet] = dishPlanetaryInfluences[planet] ? 
                        Math.min(dishPlanetaryInfluences[planet] + 0.3, 1.0) : 0.7;
                    });
                  }
                  
                  // Use dish-specific flavor profile if available, otherwise use cuisine default
                  const flavorProfile = typedDish.flavorProfile || defaultFlavorProfile;
                  
                  // Transform substitutions from object to array format if they exist
                  const substitutions = typedDish.substitutions ? 
                    Object.entries(typedDish.substitutions as Record<string, unknown>).map(([original, alternatives]) => ({
                      original,
                      alternatives: Array.isArray(alternatives) ? alternatives : [alternatives]
                    })) : undefined;
                  
                  // Create the recipe entry with standardized fields
                  const recipeInfo: RecipeData = {
                    id: `${cuisineName}-${mealType}-${typedDish.name}`.replace(/\s+/g, '-').toLowerCase(),
                    name: typedDish.name as string,
                    description: typeof typedDish.description === 'string' ? typedDish.description : '',
                    ingredients: Array.isArray(typedDish.ingredients) ? typedDish.ingredients as {
                      name: string;
                      amount: number;
                      unit: string;
                      optional?: boolean;
                      preparation?: string;
                      category?: string;
                    }[] : [],
                    instructions: Array.isArray(typedDish.preparationSteps) ? 
                      typedDish.preparationSteps as string[] : 
                      Array.isArray(typedDish.instructions) ? 
                      typedDish.instructions as string[] : [],
                    cuisine: cuisineName,
                    energyProfile: {
                      zodiac: Array.isArray(typedDish.zodiac) ? 
                        normalizeZodiacCasing(typedDish.zodiac as string[]) : [],
                      lunar: Array.isArray(typedDish.lunar) ? 
                        typedDish.lunar as string[] : [],
                      planetary: Array.isArray(typedDish.planetary) ? 
                        normalizePlanetCasing(typedDish.planetary as string[]) : [],
                      season: [season]
                    },
                    tags: [
                      ...(Array.isArray(typedDish.tags) ? typedDish.tags as string[] : []),
                      mealType, // Add mealType as a tag
                      season !== Season.All ? season : '', // Add season as a tag if not 'all'
                      ...(Array.isArray(typedDish.dietaryInfo) ? typedDish.dietaryInfo as string[] : []) // Add dietary info as tags
                    ].filter(Boolean), // Remove empty tags
                    timeToMake: typeof typedDish.timeToMake === 'number' ? typedDish.timeToMake : 
                      typeof typedDish.cookingTime === 'number' ? typedDish.cookingTime : 30, // Default to 30 minutes
                    flavorProfile: flavorProfile as {
                      spicy: number;
                      sweet: number;
                      sour: number;
                      bitter: number;
                      salty: number;
                      umami: number;
                    },
                    planetaryInfluences: dishPlanetaryInfluences,
                    regionalCuisine: typeof typedDish.regionalCuisine === 'string' ? typedDish.regionalCuisine : undefined,
                    
                    // Standardized fields
                    servingSize: typeof typedDish.servingSize === 'number' ? typedDish.servingSize : 
                      typeof typedDish.servings === 'number' ? typedDish.servings : 4, // Default to 4 servings
                    substitutions: substitutions,
                    tools: Array.isArray(typedDish.tools) ? typedDish.tools as string[] : undefined,
                    spiceLevel: typedDish.spiceLevel !== undefined ? typedDish.spiceLevel as number | 'mild' | 'medium' | 'hot' | 'very hot' : undefined,
                    nutrition: typedDish.nutrition ? {
                      calories: typeof (typedDish.nutrition as any).calories === 'number' ? (typedDish.nutrition as any).calories : undefined,
                      protein: typeof (typedDish.nutrition as any).protein === 'number' ? (typedDish.nutrition as any).protein : undefined,
                      carbs: typeof (typedDish.nutrition as any).carbs === 'number' ? (typedDish.nutrition as any).carbs : undefined,
                      fat: typeof (typedDish.nutrition as any).fat === 'number' ? (typedDish.nutrition as any).fat : undefined,
                      vitamins: Array.isArray((typedDish.nutrition as any).vitamins) ? (typedDish.nutrition as any).vitamins : undefined,
                      minerals: Array.isArray((typedDish.nutrition as any).minerals) ? (typedDish.nutrition as any).minerals : undefined
                    } : undefined,
                    preparationNotes: typeof typedDish.preparationNotes === 'string' ? typedDish.preparationNotes : undefined,
                    technicalTips: Array.isArray(typedDish.technicalTips) ? typedDish.technicalTips as string[] : undefined
                  };
                  
                  // Add the recipe to our collection
                  recipeData.push(recipeInfo);
                });
              } else {
                console.log(`Dishes is not an array for ${cuisineName} - ${mealType} - ${season}:`, dishes);
              }
            });
          } else {
            console.log(`Meal data is not an object for ${cuisineName} - ${mealType}:`, mealData);
          }
        });
      } else {
        console.log(`No dishes found for ${cuisineName}`);
      }
    } catch (error) {
      console.error(`Error processing cuisine ${cuisineName}:`, error);
    }
  });
  
  // Wait for all cuisine data to be processed
  await Promise.all(cuisineDataPromises);
  
  console.log(`Finished transforming ${recipeData.length} recipes`);
  
  // Normalize recipes and return
  return recipeData.map(recipe => normalizeRecipe(recipe));
};

/**
 * Get all available recipes
 * @returns Promise resolving to an array of all recipes
 */
export const getAllRecipes = async (): Promise<Recipe[]> => {
  if (!_allRecipes) {
    _allRecipes = await transformCuisineData();
  }
  return _allRecipes;
};

// Export allRecipes for backward compatibility
export const allRecipes = getAllRecipes();

// Various utility functions for retrieving recipes
export const getRecipesForZodiac = (zodiacStr: string): Promise<Recipe[]> => {
  const zodiac = normalizeZodiacSign(zodiacStr);
  
  if (!zodiac) {
    console.error(`Invalid zodiac sign: ${zodiacStr}`);
    return Promise.resolve([]);
  }
  
  return transformCuisineData().then(recipes => {
    return recipes.filter(recipe => 
      recipe.zodiacInfluences?.some(sign => sign === zodiac)
    );
  });
};

export const getRecipesForSeason = (seasonStr: string): Promise<Recipe[]> => {
  const season = normalizeSeason(seasonStr);
  
  if (!season) {
    console.error(`Invalid season: ${seasonStr}`);
    return Promise.resolve([]);
  }
  
  return transformCuisineData().then(recipes => {
    return recipes.filter(recipe => {
      if (Array.isArray(recipe.season)) {
        return recipe.season.includes(season);
      } else if (recipe.season) {
        return recipe.season === season;
      }
      return false;
    });
  });
};

export const getRecipesForLunarPhase = (lunarPhaseStr: string): Promise<Recipe[]> => {
  const lunarPhase = normalizeLunarPhase(lunarPhaseStr);
  
  if (!lunarPhase) {
    console.error(`Invalid lunar phase: ${lunarPhaseStr}`);
    return Promise.resolve([]);
  }
  
  return transformCuisineData().then(recipes => {
    return recipes.filter(recipe => 
      recipe.lunarPhaseInfluences?.some(phase => phase === lunarPhase)
    );
  });
};

export const getRecipesForCuisine = (cuisine: string): Promise<Recipe[]> => {
  return transformCuisineData().then(recipes => {
    const filteredRecipes = recipes.filter(recipe => 
      recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
    
    // Sort by recipe id for consistency
    return filteredRecipes.sort((a, b) => a.id.localeCompare(b.id));
  });
};

// Rest of the utility functions...