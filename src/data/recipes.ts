import { cuisines } from '@/data/cuisines';
import type { ZodiacSign, LunarPhase, Season, ElementalProperties } from '@/types/alchemy';
import { 
  planetaryFlavorProfiles, 
  calculateFlavorProfile, 
  getResonantCuisines, 
  getDominantFlavor, 
  calculatePlanetaryFlavorMatch 
} from '@/data/planetaryFlavorProfiles';
import { 
  cuisineFlavorProfiles, 
  calculateCuisineFlavorMatch, 
  getCuisineProfile,
  getRelatedCuisines 
} from '@/data/cuisineFlavorProfiles';
import type { Recipe } from '@/types/recipe';

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
  preparation?: string;
}

export interface RecipeData {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cuisine?: string;
  energyProfile: {
    zodiac?: ZodiacSign[];
    lunar?: LunarPhase[];
    planetary?: string[];
    season?: Season[];
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
  // ... other fields ...
}

const transformCuisineData = (): RecipeData[] => {
  const recipes: RecipeData[] = [];
  
  Object.entries(cuisines).forEach(([cuisineName, cuisineData]) => {
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
    
    if (cuisineData && cuisineData.dishes && typeof cuisineData.dishes === 'object') {
      Object.entries(cuisineData.dishes).forEach(([mealType, mealData]) => {
        if (mealData && typeof mealData === 'object') {
          Object.entries(mealData as Record<string, any>).forEach(([season, dishes]) => {
            if (dishes && Array.isArray(dishes)) {
              dishes.forEach((dish: any) => {
                // Build dish-specific planetary influences
                const dishPlanetaryInfluences = { ...primaryPlanetaryInfluences };
                
                if (dish.planetary && Array.isArray(dish.planetary)) {
                  dish.planetary.forEach((planet: string) => {
                    dishPlanetaryInfluences[planet] = dishPlanetaryInfluences[planet] ? 
                      Math.min(dishPlanetaryInfluences[planet] + 0.3, 1.0) : 0.7;
                  });
                }
                
                // Use dish-specific flavor profile if available, otherwise use cuisine default
                const flavorProfile = dish.flavorProfile || defaultFlavorProfile;
                
                // Create the recipe entry
                const recipeData: RecipeData = {
                  id: `${cuisineName}-${mealType}-${dish.name}`.replace(/\s+/g, '-').toLowerCase(),
                  name: dish.name,
                  description: dish.description || '',
                  ingredients: dish.ingredients || [],
                  instructions: dish.instructions || [],
                  cuisine: cuisineName,
                  energyProfile: {
                    zodiac: dish.zodiac || [],
                    lunar: dish.lunar || [],
                    planetary: dish.planetary || [],
                    season: [season as Season]
                  },
                  tags: dish.tags || [],
                  timeToMake: dish.timeToMake,
                  flavorProfile: flavorProfile,
                  planetaryInfluences: dishPlanetaryInfluences
                };
                
                // Keep regionalCuisine as an unused property if specified in the dish
                if (dish.regionalCuisine) {
                  recipeData.regionalCuisine = dish.regionalCuisine;
                }
                
                recipes.push(recipeData);
              });
            }
          });
        }
      });
    }
  });

  return recipes;
};

// Example static recipe
const staticRecipes: RecipeData[] = [
  {
    id: 'aries-stir-fry',
    name: 'Fiery Aries Stir Fry',
    description: 'A bold and spicy dish for aries energy',
    ingredients: [
      { name: 'Bell pepper', amount: 1, unit: 'whole' },
      { name: 'Chili', amount: 2, unit: 'tsp' },
      { name: 'Garlic', amount: 3, unit: 'cloves' }
    ],
    instructions: [
      'Heat oil in wok',
      'Add garlic and stir',
      'Add vegetables and spices'
    ],
    energyProfile: {
      zodiac: ['aries', 'leo', 'sagittarius'],
      lunar: ['new moon', 'waxing crescent'],
      planetary: ['Mars', 'Sun'],
      season: ['spring']
    },
    tags: ['spicy', 'quick', 'stir-fry'],
    timeToMake: 20,
    flavorProfile: {
      spicy: 0.9,
      sweet: 0.1,
      sour: 0.2,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.4
    },
    planetaryInfluences: {
      Mars: 0.7,
      Sun: 0.5
    },
    cuisine: 'chinese',
    regionalCuisine: 'sichuanese'
  }
];

// Combine static and transformed recipes
export const recipes: RecipeData[] = [
  ...staticRecipes,
  ...transformCuisineData()
];

/**
 * Get recipes based on zodiac sign
 */
export const getRecipesForZodiac = (zodiac: ZodiacSign): RecipeData[] => {
  return recipes.filter(recipe => 
    recipe.energyProfile.zodiac?.includes(zodiac)
  );
};

/**
 * Get recipes appropriate for a specific season
 */
export const getRecipesForSeason = (season: Season): RecipeData[] => {
  return recipes.filter(recipe => 
    recipe.energyProfile.season?.includes(season)
  );
};

/**
 * Get recipes appropriate for a specific lunar phase
 */
export const getRecipesForLunarPhase = (lunarPhase: LunarPhase): RecipeData[] => {
  return recipes.filter(recipe => 
    recipe.energyProfile.lunar?.includes(lunarPhase)
  );
};

/**
 * Get recipes for a specific cuisine, including parent-child relationships
 * Will return recipes from both the parent cuisine and its regional variants
 */
export const getRecipesForCuisine = (cuisine: string): RecipeData[] => {
  const cuisineLower = cuisine.toLowerCase();
  const relatedCuisines = getRelatedCuisines(cuisineLower);
  
  // Check if main cuisine and related cuisines
  return recipes.filter(recipe => {
    // Direct match with cuisine
    if (recipe.cuisine?.toLowerCase() === cuisineLower) return true;
    
    // Match with regionalCuisine
    if (recipe.regionalCuisine?.toLowerCase() === cuisineLower) return true;
    
    // Match with parent or sibling cuisines
    if (relatedCuisines.includes(recipe.cuisine?.toLowerCase() || '')) return true;
    
    // Match with regional variant 
    if (relatedCuisines.includes(recipe.regionalCuisine?.toLowerCase() || '')) return true;
    
    return false;
  });
};

/**
 * Get recipes compatible with certain planetary alignments
 */
export const getRecipesForPlanetaryAlignment = (
  planetaryInfluences: Record<string, number>,
  minMatchScore: number = 0.6
): RecipeData[] => {
  return recipes
    .filter(recipe => recipe.flavorProfile)
    .map(recipe => ({
      ...recipe,
      matchScore: calculatePlanetaryFlavorMatch(recipe.flavorProfile!, planetaryInfluences)
    }))
    .filter(recipe => (recipe.matchScore || 0) >= minMatchScore)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

/**
 * Get the dominant planetary influence for a recipe
 */
export const getDominantPlanetaryInfluence = (recipe: RecipeData): string | null => {
  if (!recipe.planetaryInfluences) return null;
  
  const entries = Object.entries(recipe.planetaryInfluences);
  if (!entries.length) return null;
  
  return entries.sort(([, valueA], [, valueB]) => (valueB as number) - (valueA as number))[0][0];
};

/**
 * Get cooking techniques that complement the recipe
 */
export const getRecommendedCookingTechniques = (recipe: RecipeData): string[] => {
  // First try to get techniques from cuisine profile
  const cuisineProfile = recipe.cuisine ? getCuisineProfile(recipe.cuisine) : null;
  if (cuisineProfile && cuisineProfile.signatureTechniques) {
    return [...cuisineProfile.signatureTechniques];
  }

  // Fallback to planetary-based techniques
  if (!recipe.planetaryInfluences) return [];
  
  const techniques: Record<string, number> = {};
  
  Object.entries(recipe.planetaryInfluences).forEach(([planet, weight]) => {
    if (planetaryFlavorProfiles[planet]) {
      planetaryFlavorProfiles[planet].cookingTechniques.forEach(technique => {
        if (!techniques[technique]) techniques[technique] = 0;
        techniques[technique] += weight as number;
      });
    }
  });
  
  return Object.entries(techniques)
    .sort(([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number))
    .slice(0, 3)
    .map(([technique]) => technique);
};

export {
  calculateFlavorProfile,
  getResonantCuisines,
  getDominantFlavor,
  calculatePlanetaryFlavorMatch
};

/**
 * Get recipes that match a given flavor profile, sorted by match score
 */
export const getRecipesForFlavorProfile = (
  flavorProfile: Record<string, number>,
  minMatchScore: number = 0.7
): RecipeData[] => {
  return recipes
    .filter(recipe => recipe.flavorProfile)
    .map(recipe => {
      // Calculate similarity between flavor profiles
      let similarity = 0;
      let totalWeight = 0;
      
      Object.entries(flavorProfile).forEach(([flavor, value]) => {
        const recipeValue = recipe.flavorProfile?.[flavor as keyof typeof recipe.flavorProfile] || 0;
        const flavorSimilarity = 1 - Math.abs(value - recipeValue);
        
        // Weight by the importance of the flavor in input profile
        const weight = value > 0.5 ? 2 : 1;
        similarity += flavorSimilarity * weight;
        totalWeight += weight;
      });
      
      const matchScore = totalWeight > 0 ? similarity / totalWeight : 0;
      
      return {
        ...recipe,
        matchScore
      };
    })
    .filter(recipe => (recipe.matchScore || 0) >= minMatchScore)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

/**
 * Get recipes that match a specific cuisine's flavor profile
 */
export const getRecipesForCuisineMatch = (
  cuisineName: string,
  minMatchScore: number = 0.7
): RecipeData[] => {
  // Get the cuisine's flavor profile
  const cuisineProfile = getCuisineProfile(cuisineName);
  if (!cuisineProfile) return [];
  
  // Get related cuisines
  const relatedCuisines = [cuisineName, ...getRelatedCuisines(cuisineName)];
  
  return recipes
    .map(recipe => {
      // Direct cuisine match gets a boost
      const directMatch = relatedCuisines.includes(recipe.cuisine?.toLowerCase() || '');
      const regionMatch = relatedCuisines.includes(recipe.regionalCuisine?.toLowerCase() || '');
      
      // Calculate match score
      let matchScore = 0;
      
      if (recipe.flavorProfile) {
        // Calculate flavor profile match
        matchScore = calculateCuisineFlavorMatch(
          recipe.flavorProfile, 
          cuisineName
        );
        
        // Boost for direct cuisine matches
        if (directMatch) matchScore = Math.min(1.0, matchScore + 0.15);
        if (regionMatch) matchScore = Math.min(1.0, matchScore + 0.1);
      } else if (directMatch) {
        // If no flavor profile but direct cuisine match, assign a default score
        matchScore = 0.8;
      } else if (regionMatch) {
        // If regional match, assign a slightly lower score
        matchScore = 0.75;
      }
      
      return {
        ...recipe,
        matchScore
      };
    })
    .filter(recipe => (recipe.matchScore || 0) >= minMatchScore)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

/**
 * Get best matched recipes based on multiple criteria
 */
export const getBestRecipeMatches = (
  criteria: {
    cuisine?: string;
    flavorProfile?: Record<string, number>;
    season?: Season;
    mealType?: string;
    ingredients?: string[];
    dietaryPreferences?: string[];
  },
  limit: number = 10
): RecipeData[] => {
  // Start with all recipes
  let candidateRecipes = [...recipes];
  
  // Apply cuisine filter if specified
  if (criteria.cuisine) {
    candidateRecipes = getRecipesForCuisine(criteria.cuisine);
    
    // Add flavor-matched recipes from other cuisines
    const cuisineProfile = getCuisineProfile(criteria.cuisine);
    if (cuisineProfile) {
      const flavorMatchedRecipes = getRecipesForFlavorProfile(cuisineProfile.flavorProfiles, 0.75)
        .filter(recipe => recipe.cuisine?.toLowerCase() !== criteria.cuisine?.toLowerCase());
      
      // Combine without duplicates
      const existingIds = new Set(candidateRecipes.map(r => r.id));
      flavorMatchedRecipes.forEach(recipe => {
        if (!existingIds.has(recipe.id)) {
          candidateRecipes.push(recipe);
        }
      });
    }
  }
  
  // Apply season filter if specified
  if (criteria.season) {
    const seasonRecipes = candidateRecipes.filter(recipe => 
      recipe.energyProfile.season?.includes(criteria.season!)
    );
    
    // If we have enough seasonal recipes, use only those
    if (seasonRecipes.length >= limit) {
      candidateRecipes = seasonRecipes;
    }
  }
  
  // Apply meal type filter if specified
  if (criteria.mealType) {
    const mealTypeRecipes = candidateRecipes.filter(recipe => {
      // Check if recipe has a mealType tag
      return recipe.tags?.some(tag => 
        tag.toLowerCase() === criteria.mealType?.toLowerCase()
      );
    });
    
    // If we have enough meal type specific recipes, use only those
    if (mealTypeRecipes.length >= limit) {
      candidateRecipes = mealTypeRecipes;
    }
  }
  
  // Calculate match scores for all candidate recipes
  const scoredRecipes = candidateRecipes.map(recipe => {
    let totalScore = 0;
    let factorsConsidered = 0;
    
    // Base score from cuisine match
    if (criteria.cuisine) {
      const cuisineProfile = getCuisineProfile(criteria.cuisine);
      if (cuisineProfile && recipe.flavorProfile) {
        const cuisineScore = calculateCuisineFlavorMatch(
          recipe.flavorProfile, 
          criteria.cuisine
        );
        totalScore += cuisineScore * 2.5; // Increased weight for cuisine match
        factorsConsidered += 2.5;
        
        // Direct cuisine match bonus
        if (recipe.cuisine?.toLowerCase() === criteria.cuisine.toLowerCase()) {
          totalScore += 1.5; // Increased from 1.0 for stronger direct match
          factorsConsidered += 1.5;
        }
        
        // Regional match bonus
        if (recipe.regionalCuisine?.toLowerCase() === criteria.cuisine.toLowerCase()) {
          totalScore += 1.0; // Increased from 0.7 for stronger regional match
          factorsConsidered += 1.0;
        }
      }
    }
    
    // Season match
    if (criteria.season && recipe.energyProfile.season) {
      const seasonMatch = recipe.energyProfile.season.includes(criteria.season);
      if (seasonMatch) {
        totalScore += 1.2; 
        factorsConsidered += 1.0;
      } else {
        // Penalty for incorrect season
        totalScore -= 0.2;
        factorsConsidered += 0.5;
      }
    }
    
    // Meal type match
    if (criteria.mealType && recipe.tags) {
      const mealTypeMatch = recipe.tags.some(tag => 
        tag.toLowerCase() === criteria.mealType?.toLowerCase()
      );
      if (mealTypeMatch) {
        totalScore += 1.2;
        factorsConsidered += 1.0;
      } else {
        // Penalty for incorrect meal type
        totalScore -= 0.2;
        factorsConsidered += 0.5;
      }
    }
    
    // Calculate final score - ensure we're creating a wider distribution
    let matchScore = factorsConsidered > 0 ? totalScore / factorsConsidered : 0.3;
    
    // Apply non-linear scaling to improve match score distribution
    // Use sigmoid-like function to spread scores more distinctly
    matchScore = matchScore < 0.5 
      ? matchScore * 0.8
      : 0.4 + (matchScore - 0.5) * 1.4;
    
    // Add a small random variation to prevent identical scores (±3%)
    const jitter = (Math.random() * 0.06) - 0.03;
    matchScore = Math.min(Math.max(matchScore + jitter, 0.2), 1.0);
    
    return {
      ...recipe,
      matchScore
    };
  });
  
  // Sort by match score and return top results
  return scoredRecipes
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, limit);
};

// Export additional utility functions
export { calculateCuisineFlavorMatch } from '@/data/cuisineFlavorProfiles';

// Re-export these functions with proper implementations
export const getRecommendedCuisines = (profile: any) => {
  // Implementation based on cuisine flavor profiles
  if (!profile || typeof profile !== 'object') return [];
  
  return Object.entries(cuisineFlavorProfiles)
    .map(([cuisineName, cuisineProfile]) => {
      // Skip regional variants with a parent cuisine
      if (cuisineProfile.parentCuisine) return null;
      
      // Calculate match score based on flavor profile
      let matchScore = 0;
      let totalFactors = 0;
      
      // Flavor profile matching
      if (profile.flavorProfile) {
        const flavorMatch = calculateCuisineFlavorMatch(
          profile.flavorProfile, 
          cuisineName
        );
        matchScore += flavorMatch * 2;
        totalFactors += 2;
      }
      
      // Season matching
      if (profile.season && cuisineProfile.seasonalPreference) {
        const seasonMatch = cuisineProfile.seasonalPreference.includes(profile.season);
        if (seasonMatch) {
          matchScore += 1;
          totalFactors += 1;
        }
      }
      
      // Dietary preference matching
      if (profile.dietaryPreference && cuisineProfile.dietarySuitability) {
        const dietaryScore = cuisineProfile.dietarySuitability[profile.dietaryPreference] || 0;
        matchScore += dietaryScore;
        totalFactors += 1;
      }
      
      // Calculate final score
      const finalScore = totalFactors > 0 ? matchScore / totalFactors : 0;
      
      return {
        id: cuisineName,
        name: cuisineProfile.name,
        score: finalScore
      };
    })
    .filter(result => result !== null && result.score > 0.6)
    .sort((a, b) => b!.score - a!.score) as { id: string, name: string, score: number }[];
};

export const getFusionSuggestions = (cuisine1: string, cuisine2: string) => {
  // Get cuisine profiles
  const profile1 = getCuisineProfile(cuisine1);
  const profile2 = getCuisineProfile(cuisine2);
  
  if (!profile1 || !profile2) {
    return { compatibility: 0, techniques: [], ingredients: [] };
  }
  
  // Calculate flavor profile compatibility
  let flavorSimilarity = 0;
  Object.entries(profile1.flavorProfiles).forEach(([flavor, value1]) => {
    const value2 = profile2.flavorProfiles[flavor as keyof typeof profile2.flavorProfiles];
    flavorSimilarity += 1 - Math.abs(value1 - value2);
  });
  flavorSimilarity /= 6; // Normalize
  
  // Calculate overall compatibility
  const compatibility = flavorSimilarity;
  
  // Fusion suggestions
  const techniques = [...new Set([
    ...profile1.signatureTechniques.slice(0, 2),
    ...profile2.signatureTechniques.slice(0, 2)
  ])];
  
  const ingredients = [...new Set([
    ...profile1.signatureIngredients.slice(0, 3),
    ...profile2.signatureIngredients.slice(0, 3)
  ])];
  
  return {
    compatibility,
    techniques,
    ingredients
  };
};

// Create a mapped array of recipes with proper Recipe type
export const allRecipes: Recipe[] = recipes.map(recipe => ({
  id: recipe.id,
  name: recipe.name,
  description: recipe.description,
  cuisine: recipe.cuisine || '',
  regionalCuisine: recipe.regionalCuisine,
  ingredients: recipe.ingredients.map(ing => ({
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    optional: ing.optional || false,
    preparation: ing.preparation,
    // Add other ingredient properties with defaults
    category: '',
    notes: '',
    elementalProperties: {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    seasonality: []
  })),
  instructions: recipe.instructions, 
  timeToMake: typeof recipe.timeToMake === 'number' 
    ? `${recipe.timeToMake} minutes` 
    : recipe.timeToMake?.toString() || '30 minutes',
  numberOfServings: 4, // Default
  elementalProperties: recipe.flavorProfile 
    ? {
        Fire: recipe.flavorProfile.spicy || 0,
        Water: recipe.flavorProfile.sweet || 0,
        Earth: recipe.flavorProfile.umami || 0,
        Air: recipe.flavorProfile.sour || 0
      }
    : { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  season: recipe.energyProfile.season || ['all'],
  mealType: recipe.tags?.filter(tag => 
    ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'].includes(tag)
  ) || ['any'],
  
  // UI-specific properties
  isVegetarian: recipe.tags?.includes('vegetarian') || false,
  isVegan: recipe.tags?.includes('vegan') || false,
  isGlutenFree: recipe.tags?.includes('gluten-free') || false,
  isDairyFree: recipe.tags?.includes('dairy-free') || false,
  
  // Enhanced astrological properties
  astrologicalInfluences: recipe.energyProfile.planetary || [],
  zodiacInfluences: recipe.energyProfile.zodiac || [],
  lunarPhaseInfluences: recipe.energyProfile.lunar || [],
  planetaryInfluences: {
    favorable: recipe.planetaryInfluences ? 
      Object.entries(recipe.planetaryInfluences)
        .filter(([_, value]) => value >= 0.6)
        .map(([planet]) => planet) : 
      [],
    unfavorable: recipe.planetaryInfluences ? 
      Object.entries(recipe.planetaryInfluences)
        .filter(([_, value]) => value <= 0.3)
        .map(([planet]) => planet) : 
      []
  },
  
  // Nutrition data
  nutrition: {
    calories: recipe.nutrition?.calories || 0,
    protein: recipe.nutrition?.protein || 0,
    carbs: recipe.nutrition?.carbs || 0,
    fat: recipe.nutrition?.fat || 0,
    vitamins: recipe.nutrition?.vitamins || [],
    minerals: recipe.nutrition?.minerals || []
  },
  
  // Additional recipe properties
  cookingMethod: recipe.cookingMethod || 'bake',
  cookingTechniques: recipe.cookingTechniques || [],
  equipmentNeeded: recipe.equipmentNeeded || [],
  dishType: recipe.dishType || [],
  course: recipe.tags?.filter(tag => 
    ['appetizer', 'main course', 'dessert', 'side dish', 'soup', 'salad'].includes(tag)
  ) || [],
  
  // Timestamps
  createdAt: recipe.createdAt || new Date().toISOString(),
  updatedAt: recipe.updatedAt || new Date().toISOString(),
  
  // Add tags
  tags: recipe.tags || [],
  
  // Match score
  matchScore: recipe.matchScore || 0,
  
  // Alchemical scores
  alchemicalScores: {
    elementalScore: 0.5,
    zodiacalScore: recipe.energyProfile.zodiac ? 0.7 : 0.3,
    lunarScore: recipe.energyProfile.lunar ? 0.7 : 0.3,
    planetaryScore: recipe.planetaryInfluences ? 0.7 : 0.3,
    seasonalScore: recipe.energyProfile.season ? 0.7 : 0.3
  },
  
  // Additional fields
  notes: recipe.notes || '',
  preparation: recipe.preparation || '',
  seasonalIngredients: recipe.seasonalIngredients || []
}));