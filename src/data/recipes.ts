import cuisinesMap from '@/data/cuisines/index';
import type { ZodiacSign, LunarPhase, Season, ElementalProperties, CuisineType } from '@/types/alchemy';
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
import { 
  calculateAlchemicalNumber,
  calculateAlchemicalNumberCompatibility,
  deriveAlchemicalFromElemental,
  type AlchemicalProperties
} from './unified/alchemicalCalculations';

// Recipe vector interface for compatibility calculations
interface RecipeVector {
  spicy: number;
  sweet: number;
  sour: number;
  umami: number;
  proteinDensity: number;
  mineralContent: number;
  vitaminRichness: number;
  techniqueComplexity: number;
  skillRequirement: number;
  culturalAuthenticity: number;
  modernAdaptation: number;
  fusionIndex: number;
}

// Log what was imported
// console.log("cuisinesMap keys:", Object.keys(cuisinesMap));

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
  preparation?: string;
  category?: string;
}

// Interface for dish data from cuisine files
interface DishData {
  name?: string;
  description?: string;
  ingredients?: unknown[];
  preparationSteps?: string[];
  instructions?: string[];
  planetary?: string[];
  flavorProfile?: Record<string, number>;
  substitutions?: Record<string, any>;
  zodiac?: string[];
  lunar?: string[];
  tags?: string[];
  timeToMake?: number;
  cookTime?: number;
  servingSize?: number;
  numberOfServings?: number;
  tools?: string[];
  spiceLevel?: number | string;
  nutrition?: Record<string, unknown>;
  preparationNotes?: string;
  culturalNotes?: string;
  technicalTips?: string[];
  dietaryInfo?: string[];
  regionalCuisine?: string;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  vitamins?: string[];
  minerals?: string[];
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
  
  // Standardized fields
  servingSize?: number; // Number of servings
  substitutions?: { original: string; alternatives: string[] }[];
  tools?: string[]; // Required cooking tools/equipment
  spiceLevel?: number | 'mild' | 'medium' | 'hot' | 'very hot'; // Indicator of spiciness
  nutrition?: Nutrition; // Nutritional information
  preparationNotes?: string; // Special notes about preparation
  technicalTips?: string[]; // Technical cooking tips
  
  // Additional properties accessed in the code
  elementalProperties?: Record<string, unknown>;
  season?: Season | Season[] | string; // For backward compatibility
  mealType?: string | string[]; // For meal type classification
  cookingMethod?: string; // Primary cooking method
  cookingMethods?: string[]; // Multiple cooking methods
  matchPercentage?: number; // For display purposes
}

const transformCuisineData = async (): Promise<RecipeData[]> => {
  const recipes: RecipeData[] = [];
  
  // console.log("Starting transformCuisineData");
  // console.log("Available cuisines:", Object.keys(cuisinesMap));
  
  const cuisineDataPromises = Object.entries(cuisinesMap).map(async ([cuisineName, cuisineData]) => {
    try {
      // console.log(`Processing cuisine: ${cuisineName}`);
      
      const primaryPlanetaryInfluences: Record<string, number> = {};
      
      // Get the cuisine flavor profile
      const cuisineProfile = getCuisineProfile(cuisineName);
      
      // Map planetary influences based on cuisine's flavor profile
      Object.entries(planetaryFlavorProfiles).forEach(([planet, profile]) => {
        const profileData = profile as any;
        const culinaryAffinity = profileData?.culinaryAffinity || [];
        
        if (culinaryAffinity.includes(cuisineName.toLowerCase())) {
          primaryPlanetaryInfluences[planet] = 0.8;
        } else {
          const partialMatch = culinaryAffinity.some((affinity: string) => 
            affinity.includes(cuisineName.toLowerCase()) || cuisineName.toLowerCase().includes(affinity)
          );
          if (partialMatch) {
            primaryPlanetaryInfluences[planet] = 0.5;
          }
        }
      });
      
      // Get flavor profile from cuisine definitions or calculate from planetary influences
      const cuisineProfileData = cuisineProfile as any;
      const cuisineFlavorProfile = cuisineProfileData?.flavorProfiles;
      const defaultFlavorProfile = cuisineFlavorProfile || calculateFlavorProfile(primaryPlanetaryInfluences);
      
      // Handle dishes
      const cuisineDataObj = cuisineData as any;
      if (cuisineDataObj && cuisineDataObj.dishes && typeof cuisineDataObj.dishes === 'object') {
        // Log the dishes structure to debug
        // console.log(`${cuisineName} dishes:`, Object.keys(cuisineDataObj.dishes));
        
        // Process meal types (breakfast, lunch, dinner, etc.)
        Object.entries(cuisineDataObj.dishes).forEach(([mealType, mealData]) => {
          if (!mealData) {
            // console.log(`No meal data for ${cuisineName} - ${mealType}`);
            return;
          }
          
          if (typeof mealData === 'object') {
            // Log meal data structure
            // console.log(`${cuisineName} - ${mealType} data:`, Object.keys(mealData as Record<string, unknown>));
            
            // Process season data (spring, summer, autumn, winter, all)
            Object.entries(mealData as Record<string, unknown>).forEach(([season, dishes]) => {
              if (!dishes) {
                // console.log(`No dishes for ${cuisineName} - ${mealType} - ${season}`);
                return;
              }
              
              // Ensure dishes is an array
              if (Array.isArray(dishes)) {
                // console.log(`Found ${dishes.length} dishes for ${cuisineName} - ${mealType} - ${season}`);
                
                // Process individual dishes
                dishes.forEach((dish: Record<string, unknown>) => {
                  const dishData = dish as DishData;
                  
                  if (!dishData || !dishData?.name) {
                    // console.log('Skipping invalid dish:', dish);
                    return;
                  }
                  
                  // Build dish-specific planetary influences
                  const dishPlanetaryInfluences = { ...primaryPlanetaryInfluences };
                  
                  const dishPlanetary = dishData?.planetary;
                  if (dishPlanetary && Array.isArray(dishPlanetary)) {
                    dishPlanetary.forEach((planet: string) => {
                      dishPlanetaryInfluences[planet] = dishPlanetaryInfluences[planet] ? 
                        Math.min(dishPlanetaryInfluences[planet] + 0.3, 1.0) : 0.7;
                    });
                  }
                  
                  // Use dish-specific flavor profile if available, otherwise use cuisine default
                  const flavorProfile = dishData?.flavorProfile || defaultFlavorProfile;
                  
                  // Transform substitutions from object to array format if they exist
                  const dishSubstitutions = dishData?.substitutions;
                  const substitutions = dishSubstitutions ? 
                    Object.entries(dishSubstitutions).map(([original, alternatives]) => ({
                      original,
                      alternatives: Array.isArray(alternatives) ? alternatives : [alternatives]
                    })) : undefined;
                  
                  // Create the recipe entry
                  const recipeData: RecipeData = {
                    id: `${cuisineName}-${mealType}-${dishData?.name}`.replace(/\s+/g, '-').toLowerCase(),
                    name: dishData?.name || '',
                    description: dishData?.description || `A traditional ${cuisineName} dish`,
                    ingredients: Array.isArray(dishData?.ingredients) ? 
                      dishData.ingredients.map((ingredient: Record<string, unknown>) => {
                        const ingredientData = ingredient as any;
                        return {
                          name: ingredientData?.name || ingredientData?.ingredient || 'Unknown ingredient',
                          amount: ingredientData?.amount || ingredientData?.quantity || 1,
                          unit: ingredientData?.unit || 'piece',
                          optional: ingredientData?.optional || false,
                          preparation: ingredientData?.preparation || '',
                          category: ingredientData?.category || ''
                        };
                      }) : [],
                    instructions: Array.isArray(dishData?.instructions) ? dishData.instructions :
                                 Array.isArray(dishData?.preparationSteps) ? dishData.preparationSteps :
                                 ['Prepare according to traditional methods'],
                    cuisine: cuisineName,
                    energyProfile: {
                      zodiac: Array.isArray(dishData?.zodiac) ? dishData.zodiac as ZodiacSign[] : undefined,
                      lunar: Array.isArray(dishData?.lunar) ? dishData.lunar as LunarPhase[] : undefined,
                      planetary: Array.isArray(dishData?.planetary) ? dishData.planetary : undefined,
                      season: season !== 'all' ? [season as Season] : ['spring', 'summer', 'autumn', 'winter'] as Season[]
                    },
                    tags: Array.isArray(dishData?.tags) ? dishData.tags : [],
                    timeToMake: dishData?.timeToMake || dishData?.cookTime || 30,
                    flavorProfile: flavorProfile ? {
                      spicy: flavorProfile.spicy || 0,
                      sweet: flavorProfile.sweet || 0,
                      sour: flavorProfile.sour || 0,
                      bitter: flavorProfile.bitter || 0,
                      salty: flavorProfile.salty || 0,
                      umami: flavorProfile.umami || 0
                    } : undefined,
                    planetaryInfluences: dishPlanetaryInfluences,
                    regionalCuisine: dishData?.regionalCuisine || cuisineName,
                    
                    // Standardized fields
                    servingSize: dishData?.servingSize || dishData?.numberOfServings || 4,
                    substitutions,
                    tools: Array.isArray(dishData?.tools) ? dishData.tools : [],
                    spiceLevel: (typeof dishData?.spiceLevel === 'string' && 
                      ['mild', 'medium', 'hot', 'very hot'].includes(dishData.spiceLevel)) 
                      ? dishData.spiceLevel as 'mild' | 'medium' | 'hot' | 'very hot'
                      : (typeof dishData?.spiceLevel === 'number' ? dishData.spiceLevel : 1),
                    nutrition: dishData?.nutrition,
                    preparationNotes: dishData?.preparationNotes,
                    technicalTips: Array.isArray(dishData?.technicalTips) ? dishData.technicalTips : [],
                    
                    // Additional properties for compatibility
                    elementalProperties: undefined, // To be calculated later if needed
                    season: season !== 'all' ? season as Season : undefined,
                    mealType: mealType,
                    cookingMethod: undefined, // Could be derived from instructions
                    cookingMethods: undefined,
                    matchPercentage: 0
                  };
                  
                  recipes.push(recipeData);
                });
              }
            });
          }
        });
      }
    } catch (error) {
      // console.error(`Error processing cuisine ${cuisineName}:`, error);
    }
  });
  
  await Promise.all(cuisineDataPromises);
  
  // console.log(`Transformed ${recipes.length} recipes`);
  return recipes;
};

// Cache recipes to avoid re-processing
let cachedRecipes: RecipeData[] | null = null;

export const getRecipes = async (): Promise<RecipeData[]> => {
  if (!cachedRecipes) {
    cachedRecipes = await transformCuisineData();
  }
  return cachedRecipes;
};

export const getRecipesForZodiac = async (zodiac: ZodiacSign): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes.filter(recipe => {
    const recipeData = recipe as any;
    const energyProfile = recipeData?.energyProfile;
    return energyProfile?.zodiac?.includes(zodiac);
  });
};

export const getRecipesForSeason = async (season: Season): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes.filter(recipe => {
    const recipeData = recipe as any;
    const energyProfile = recipeData?.energyProfile;
    return energyProfile?.season?.includes(season) || recipeData?.season === season;
  });
};

export const getRecipesForLunarPhase = async (lunarPhase: LunarPhase): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes.filter(recipe => {
    const recipeData = recipe as any;
    const energyProfile = recipeData?.energyProfile;
    return energyProfile?.lunar?.includes(lunarPhase);
  });
};

export const getRecipesForCuisine = async (cuisine: string): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes.filter(recipe => {
    const recipeData = recipe as any;
    return recipeData?.cuisine?.toLowerCase() === cuisine.toLowerCase() ||
           recipeData?.regionalCuisine?.toLowerCase() === cuisine.toLowerCase();
  });
};

/**
 * Get recipes compatible with certain planetary alignments
 */
export const getRecipesForPlanetaryAlignment = async (
  planetaryInfluences: Record<string, number>,
  minMatchScore = 0.6
): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes
    .filter(recipe => recipe.flavorProfile)
    .map(recipe => ({
      ...recipe,
      matchScore: recipe.flavorProfile 
        ? calculatePlanetaryFlavorMatch(recipe.flavorProfile, planetaryInfluences)
        : 0
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
export const getRecipesForFlavorProfile = async (
  flavorProfile: Record<string, number>,
  minMatchScore = 0.7
): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
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
export const getRecipesForCuisineMatch = async (
  cuisineName: string,
  minMatchScore = 0.7
): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
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
export const getBestRecipeMatches = async (
  criteria: MatchCriteria,
  limit = 10
): Promise<RecipeData[]> => {
  // console.log("getBestRecipeMatches called with criteria:", criteria);
  
  // Start with all recipes
  let candidateRecipes = [...await getRecipes()];
  // console.log(`Starting with ${candidateRecipes.length} total recipes`);
  
  // Apply cuisine filter if specified
  if (criteria.cuisine) {
    // console.log(`Filtering by cuisine: ${criteria.cuisine}`);
    
    // First try to use getRecipesForCuisineMatch from cuisineFlavorProfiles
    // which has enhanced functionality including LocalRecipeService integration
    try {
      const { getRecipesForCuisineMatch } = await import('./cuisineFlavorProfiles');
      const matchedCuisineRecipes = getRecipesForCuisineMatch(
        criteria.cuisine,
        [], // Empty array triggers direct LocalRecipeService use
        Math.max(limit * 2, 20) // Get more recipes for better filtering
      );
      
      // console.log(`getRecipesForCuisineMatch returned ${matchedCuisineRecipes.length} recipes`);
      
      if (matchedCuisineRecipes && matchedCuisineRecipes.length > 0) {
        // Convert the recipes to ensure they match RecipeData format
        const formattedRecipes = matchedCuisineRecipes.map(recipe => {
          const recipeData = recipe as any;
          const name = recipeData?.name || '';
          const description = recipeData?.description || `A ${criteria.cuisine} recipe`;
          const ingredients = Array.isArray(recipeData?.ingredients) ? recipeData.ingredients : [];
          const instructions = Array.isArray(recipeData?.instructions) ? recipeData.instructions : 
            typeof recipeData?.instructions === 'string' ? [recipeData.instructions] : [];
          const cuisine = recipeData?.cuisine || criteria.cuisine;
          const regionalCuisine = recipeData?.regionalCuisine;
          const cookingMethod = recipeData?.cookingMethod || recipeData?.cookingMethods?.[0];
          const flavorProfile = recipeData?.flavorProfile || {
            spicy: 0.5,
            sweet: 0.5,
            sour: 0.5,
            bitter: 0.5,
            salty: 0.5,
            umami: 0.5
          };
          
          return {
          id: recipeData?.id || `${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          description,
          ingredients: ingredients.map((ing: Record<string, unknown>) => ({
              name: ing?.name || '',
              amount: typeof ing?.amount === 'number' ? ing.amount : parseFloat(ing?.amount) || 1,
              unit: ing?.unit || '',
              optional: ing?.optional || false
            })),
          instructions,
          cuisine,
          regionalCuisine,
          cookingMethod,
          flavorProfile,
          elementalProperties: recipeData?.elementalProperties,
          energyProfile: {
            season: Array.isArray(recipeData?.season) ? recipeData.season as Season[] : 
              typeof recipeData?.season === 'string' ? [recipeData.season as Season] : ['spring'],
            zodiac: [],
            lunar: [],
            planetary: []
          },
          tags: [
            ...(Array.isArray(recipeData?.mealType) ? recipeData.mealType : (typeof recipeData?.mealType === 'string' ? [recipeData.mealType] : [])).map(type => type.toLowerCase()),
            ...(Array.isArray(recipeData?.season) ? recipeData.season : (typeof recipeData?.season === 'string' ? [recipeData.season] : [])).map(s => s.toLowerCase())
          ],
          timeToMake: recipeData?.timeToMake,
          // Use the matchScore or matchPercentage if provided, otherwise use a default score
          matchScore: recipeData?.matchScore || (recipeData?.matchPercentage ? recipeData.matchPercentage / 100 : 0.85)
        } as RecipeData;
        });
        
        candidateRecipes = formattedRecipes;
        
        // If we got recipes directly and they already have match scores,
        // we can just return them after additional filtering
        if (formattedRecipes.length > 0 && formattedRecipes[0].matchScore !== undefined) {
          // Apply additional filters if needed
          return applyAdditionalFilters(formattedRecipes, criteria, limit);
        }
      }
    } catch (error) {
      // console.error("Error using enhanced getRecipesForCuisineMatch:", error);
    }
    
    // Fallback to LocalRecipeService if getRecipesForCuisineMatch failed
    const allRecipes = await getRecipes();
    if (candidateRecipes.length === 0 || candidateRecipes === allRecipes) {
      try {
        // Import and use LocalRecipeService directly
        const { LocalRecipeService } = await import('../services/LocalRecipeService');
        
        // Get local recipes directly
        const localRecipeResults = LocalRecipeService.getRecipesByCuisine(criteria.cuisine || '');
        const localRecipes = await Promise.resolve(localRecipeResults);
        // console.log(`Found ${localRecipes.length} recipes from LocalRecipeService for ${criteria.cuisine}`);
        
        if (localRecipes.length > 0) {
          // Convert the recipes to RecipeData format
          candidateRecipes = localRecipes.map(recipe => {
            const recipeData = recipe as any;
            const name = recipeData?.name || '';
            const description = recipeData?.description || '';
            const ingredients = Array.isArray(recipeData?.ingredients) ? recipeData.ingredients : [];
            const instructions = Array.isArray(recipeData?.instructions) ? recipeData.instructions : [];
            const cuisine = recipeData?.cuisine || '';
            const season = recipeData?.season;
            const mealType = recipeData?.mealType;
            const timeToMake = recipeData?.timeToMake;
            
            return {
            id: recipeData?.id || `${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            description,
            ingredients: ingredients.map((ing: Record<string, unknown>) => ({
              name: ing?.name || '',
              amount: typeof ing?.amount === 'number' ? ing.amount : parseFloat(ing?.amount) || 1,
              unit: ing?.unit || '',
              optional: ing?.optional || false
            })),
            instructions,
            cuisine,
            energyProfile: {
              season: Array.isArray(season) ? season as Season[] : 
                typeof season === 'string' ? [season as Season] : ['spring'],
              zodiac: [],
              lunar: [],
              planetary: []
            },
            tags: [
              ...(Array.isArray(mealType) ? mealType : (typeof mealType === 'string' ? [mealType] : [])).map(type => type.toLowerCase()),
              ...(Array.isArray(season) ? season : (typeof season === 'string' ? [season] : [])).map(s => s.toLowerCase())
            ],
            timeToMake,
            matchScore: 0.85, // Default high score for local recipes
            matchPercentage: 85 // For display purposes
          } as RecipeData;
          });
          
          // Apply additional filters if needed
          return applyAdditionalFilters(candidateRecipes, criteria, limit);
        }
      } catch (error) {
        // console.error("Error using LocalRecipeService directly:", error);
      }
    }
  }
  
  // console.log(`After cuisine filtering: ${candidateRecipes.length} recipes`);
  
  // Apply additional filters and scoring
  return applyAdditionalFilters(candidateRecipes, criteria, limit);
};

// Define the criteria interface
interface MatchCriteria {
  cuisine?: string;
  flavorProfile?: Record<string, number>;
  season?: Season;
  mealType?: string;
  ingredients?: string[];
  dietaryPreferences?: string[];
}

// Helper function to apply additional filters and calculate scores
async function applyAdditionalFilters(
  candidateRecipes: RecipeData[], 
  criteria: MatchCriteria,
  limit: number
): Promise<RecipeData[]> {
  // Preload modules we'll need
  let cuisineModule;
  if (criteria.cuisine) {
    try {
      cuisineModule = await import('./cuisineFlavorProfiles');
    } catch (error) {
      // console.error("Error importing cuisineFlavorProfiles:", error);
    }
  }
  
  // Apply season filter if specified
  if (criteria.season) {
    // console.log(`Filtering by season: ${criteria.season}`);
    const seasonRecipes = candidateRecipes.filter(recipe => 
      recipe.energyProfile?.season?.includes(criteria.season!) ||
      (Array.isArray(recipe.season) && recipe.season.includes(criteria.season)) ||
      (typeof recipe.season === 'string' && recipe.season === criteria.season)
    );
    
    // console.log(`Found ${seasonRecipes.length} recipes for season ${criteria.season}`);
    
    // If we have enough seasonal recipes, use only those
    if (seasonRecipes.length >= limit) {
      candidateRecipes = seasonRecipes;
    }
  }
  
  // Apply meal type filter if specified
  if (criteria.mealType) {
    // console.log(`Filtering by meal type: ${criteria.mealType}`);
    const normalizedMealType = criteria.mealType.toLowerCase();
    
    const mealTypeRecipes = candidateRecipes.filter(recipe => {
      // Check if recipe has a mealType tag
      if (recipe.tags?.some(tag => tag.toLowerCase() === normalizedMealType)) {
        return true;
      }
      
      // Also check mealType field directly
      if (Array.isArray(recipe.mealType) && 
          recipe.mealType.some(mt => mt.toLowerCase() === normalizedMealType)) {
        return true;
      }
      
      if (typeof recipe.mealType === 'string' && 
          recipe.mealType.toLowerCase() === normalizedMealType) {
        return true;
      }
      
      return false;
    });
    
    // console.log(`Found ${mealTypeRecipes.length} recipes for meal type ${criteria.mealType}`);
    
    // If we have enough meal type specific recipes, use only those
    if (mealTypeRecipes.length >= limit) {
      candidateRecipes = mealTypeRecipes;
    }
  }
  
  if (candidateRecipes.length === 0) {
    // console.log("No matching recipes found after all filtering");
    // Return empty array as fallback when no recipes match
    return [];
  }
  
  // Calculate match scores for all candidate recipes if they don't already have scores
  const scoredRecipes = candidateRecipes.map(recipe => {
    // If recipe already has a matchScore, use it
    if (recipe.matchScore !== undefined) {
      return {
        ...recipe,
        // Add matchPercentage if it doesn't exist
        matchPercentage: recipe.matchPercentage || Math.round(recipe.matchScore * 100)
      };
    }
    
    // Otherwise calculate a new score
    let totalScore = 0;
    let factorsConsidered = 0;
    
    // Base score from cuisine match
    if (criteria.cuisine && cuisineModule) {
      try {
        const { getCuisineProfile, calculateCuisineFlavorMatch } = cuisineModule;
        const cuisineProfile = getCuisineProfile(criteria.cuisine);
        if (cuisineProfile && recipe.flavorProfile) {
          // Validate flavor profile properties
          const validFlavorProfile: Record<string, number> = {};
          for (const [flavor, value] of Object.entries(recipe.flavorProfile)) {
            if (typeof value === 'number' && !isNaN(value)) {
              validFlavorProfile[flavor] = value;
            } else {
              // console.warn(`Invalid ${flavor} value in recipe ${recipe.name}: ${value}`);
              validFlavorProfile[flavor] = 0; // Default to none
            }
          }
          
          const cuisineScore = calculateCuisineFlavorMatch(
            validFlavorProfile, 
            criteria.cuisine
          );
          totalScore += cuisineScore * 6.0;
          factorsConsidered += 6.0;
          
          // Direct cuisine match bonus
          if (recipe.cuisine?.toLowerCase() === criteria.cuisine.toLowerCase()) {
            totalScore += 4.0;
            factorsConsidered += 4.0;
          }
          
          // Regional match bonus
          if (recipe.regionalCuisine?.toLowerCase() === criteria.cuisine.toLowerCase()) {
            totalScore += 3.0;
            factorsConsidered += 3.0;
          }
        }
      } catch (error) {
        // console.error("Error calculating cuisine match score:", error);
      }
    }
    
    // Season match - enhanced with better scoring
    if (criteria.season) {
      const seasonMatch = (
        (recipe.energyProfile?.season && recipe.energyProfile.season.includes(criteria.season)) ||
        (Array.isArray(recipe.season) && recipe.season.includes(criteria.season)) ||
        (typeof recipe.season === 'string' && recipe.season === criteria.season)
      );
      
      if (seasonMatch) {
        totalScore += 3.0;
        factorsConsidered += 3.0;
      } else {
        // More significant penalty for incorrect season
        totalScore -= 1.0;
        factorsConsidered += 2.0;
      }
    }
    
    // Meal type match - enhanced with better scoring
    if (criteria.mealType) {
      const normalizedMealType = criteria.mealType.toLowerCase();
      
      const mealTypeMatch = (
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase() === normalizedMealType)) ||
        (Array.isArray(recipe.mealType) && recipe.mealType.some(mt => mt.toLowerCase() === normalizedMealType)) ||
        (typeof recipe.mealType === 'string' && recipe.mealType.toLowerCase() === normalizedMealType)
      );
      
      if (mealTypeMatch) {
        totalScore += 3.0;
        factorsConsidered += 3.0;
      } else {
        // More significant penalty for incorrect meal type
        totalScore -= 1.0;
        factorsConsidered += 2.0;
      }
    }
    
    // Calculate final score with normalization
    const matchScore = factorsConsidered > 0 
      ? Math.min(1, Math.max(0, totalScore / factorsConsidered))
      : 0.5; // Default score if no factors were considered
    
    // Apply non-linear scaling to create more distinctions between recipes
    let adjustedScore;
    if (matchScore < 0.4) {
      adjustedScore = matchScore * 0.7; // Lower scores get reduced further
    } else if (matchScore < 0.7) {
      adjustedScore = 0.28 + (matchScore - 0.4) * 1.4; // Mid-range scores get a balanced adjustment
    } else {
      adjustedScore = 0.7 + (matchScore - 0.7) * 1.5; // High scores get boosted
    }
    
    // Add a small random variation for natural-feeling results
    const jitter = (Math.random() * 0.04) - 0.02;
    const finalScore = Math.min(Math.max(adjustedScore + jitter, 0.1), 1.0);
    const percentage = Math.round(finalScore * 100);
    
    return {
      ...recipe,
      matchScore: finalScore,
      matchPercentage: percentage
    };
  });
  
  // console.log(`Returning ${Math.min(scoredRecipes.length, limit)} recipes after scoring`);
  
  // Sort by match score and return top results
  return scoredRecipes
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, limit);
}

// Export additional utility functions
export { calculateCuisineFlavorMatch } from '@/data/cuisineFlavorProfiles';

// Profile interface for cuisine recommendations
interface CuisineRecommendationProfile {
  flavorProfile?: Record<string, number>;
  season?: string;
  dietaryPreference?: string;
}

// Re-export these functions with proper implementations
export const getRecommendedCuisines = (profile: CuisineRecommendationProfile) => {
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
      if (profile.season && (cuisineProfile as any)?.seasonalPreference) {
        const seasonMatch = (cuisineProfile as any)?.seasonalPreference.includes(profile.season);
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
        name: (cuisineProfile as any)?.name,
        score: finalScore
      };
    })
    .filter(result => result !== null && result.score > 0.6)
    .sort((a, b) => (b?.score || 0) - (a?.score || 0)) as { id: string, name: string, score: number }[];
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
export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const recipeData = await transformCuisineData();
    
    // Transform RecipeData to Recipe format with interface compliance
    return recipeData.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      cuisine: recipe.cuisine || 'unknown',
      elementalProperties: recipe.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      season: Array.isArray(recipe.season) ? recipe.season : [recipe.season as Season] || ['all'],
      mealType: Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType] || ['dinner'],
      matchPercentage: recipe.matchPercentage || 0,
      timeToMake: recipe.timeToMake || 30,
      nutrition: recipe.nutrition,
      flavorProfile: recipe.flavorProfile,
      currentSeason: recipe.season,
      regionalCuisine: recipe.regionalCuisine
    } as any as Recipe));
  } catch (error) {
    // console.error('Error in getAllRecipes:', error);
    return [];
  }
};

// Export recipes array for backward compatibility
export const recipes = transformCuisineData() as Promise<RecipeData[]>;

// At the end of the file, add the re-exports
export { allRecipes } from './recipes/index';

// Add placeholder function stubs
function calculateFlavorCompatibility(vector1: RecipeVector, vector2: RecipeVector): number {
  return 0.5;
}

function calculateNutritionalCompatibility(vector1: RecipeVector, vector2: RecipeVector): number {
  return 0.5;
}

function calculateComplexityCompatibility(vector1: RecipeVector, vector2: RecipeVector): number {
  return 0.5;
}

/**
 * Enhanced compatibility score calculation with A# integration
 */
function calculateCompatibilityScore(vector1: RecipeVector, vector2: RecipeVector): number {
  const flavorCompatibility = calculateFlavorCompatibility(vector1, vector2);
  const nutritionalCompatibility = calculateNutritionalCompatibility(vector1, vector2);
  const complexityCompatibility = calculateComplexityCompatibility(vector1, vector2);
  const culturalCompatibility = calculateCulturalCompatibility(vector1, vector2);
  const alchemicalCompatibility = calculateRecipeAlchemicalAlignment(vector1, vector2);
  
  // Weighted average with A# as significant factor
  return (
    flavorCompatibility * 0.25 +
    nutritionalCompatibility * 0.2 +
    complexityCompatibility * 0.15 +
    culturalCompatibility * 0.15 +
    alchemicalCompatibility * 0.25  // A# gets significant weight
  );
}

/**
 * Calculate A# (Alchemical Number) alignment between recipes
 */
function calculateRecipeAlchemicalAlignment(vector1: RecipeVector, vector2: RecipeVector): number {
  try {
    // Derive elemental properties from recipe vectors
    const elemental1 = vectorToElementalProperties(vector1);
    const elemental2 = vectorToElementalProperties(vector2);
    
    // Derive alchemical properties from elemental properties
    const alchemical1 = deriveAlchemicalFromElemental(elemental1);
    const alchemical2 = deriveAlchemicalFromElemental(elemental2);
    
    // Calculate A# for both recipes
    const a1 = calculateAlchemicalNumber(alchemical1);
    const a2 = calculateAlchemicalNumber(alchemical2);
    
    // Calculate compatibility score
    const compatibility = calculateAlchemicalNumberCompatibility(alchemical1, alchemical2);
    
    // Bonus for similar complexity levels (A# values within 3 points for recipes)
    const complexityBonus = Math.abs(a1 - a2) <= 3 ? 0.15 : 0;
    
    return Math.max(0, Math.min(1, compatibility + complexityBonus));
  } catch (error) {
    console.warn('Recipe A# alignment calculation failed:', error);
    return 0.5; // Default neutral score
  }
}

/**
 * Convert recipe vector to elemental properties
 */
function vectorToElementalProperties(vector: RecipeVector): ElementalProperties {
  // Map recipe characteristics to elemental properties
  const fire = Math.min(1, (vector.spicy * 0.4) + (vector.techniqueComplexity * 0.3) + (vector.skillRequirement * 0.3));
  const water = Math.min(1, (vector.sour * 0.3) + (vector.umami * 0.3) + (vector.vitaminRichness * 0.4));
  const earth = Math.min(1, (vector.proteinDensity * 0.3) + (vector.mineralContent * 0.3) + (vector.culturalAuthenticity * 0.4));
  const air = Math.min(1, (vector.sweet * 0.3) + (vector.modernAdaptation * 0.4) + (vector.fusionIndex * 0.3));
  
  // Normalize to total of 1.0
  const total = fire + water + earth + air;
  return {
    Fire: total > 0 ? fire / total : 0.25,
    Water: total > 0 ? water / total : 0.25,
    Earth: total > 0 ? earth / total : 0.25,
    Air: total > 0 ? air / total : 0.25
  };
}

/**
 * Enhanced cultural compatibility calculation
 */
function calculateCulturalCompatibility(vector1: RecipeVector, vector2: RecipeVector): number {
  // Cultural authenticity alignment
  const authenticityAlignment = 1 - Math.abs(vector1.culturalAuthenticity - vector2.culturalAuthenticity);
  
  // Modern adaptation compatibility
  const modernAlignment = 1 - Math.abs(vector1.modernAdaptation - vector2.modernAdaptation);
  
  // Fusion compatibility
  const fusionAlignment = Math.min(vector1.fusionIndex, vector2.fusionIndex) * 0.5 + 0.5;
  
  return (authenticityAlignment * 0.4) + (modernAlignment * 0.3) + (fusionAlignment * 0.3);
}