import cuisinesMap from '@/data/cuisines/index';
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

// Log what was imported
console.log("cuisinesMap keys:", Object.keys(cuisinesMap));

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
  preparation?: string;
  category?: string;
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
}

const transformCuisineData = async (): Promise<RecipeData[]> => {
  const recipes: RecipeData[] = [];
  
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
            Object.entries(mealData as Record<string, unknown>).forEach(([season, dishes]) => {
              if (!dishes) {
                console.log(`No dishes for ${cuisineName} - ${mealType} - ${season}`);
                return;
              }
              
              // Ensure dishes is an array
              if (Array.isArray(dishes)) {
                console.log(`Found ${dishes.length} dishes for ${cuisineName} - ${mealType} - ${season}`);
                
                // Process individual dishes
                dishes.forEach((dish: unknown) => {
                  if (!dish || !dish.name) {
                    console.log('Skipping invalid dish:', dish);
                    return;
                  }
                  
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
                  
                  // Transform substitutions from object to array format if they exist
                  const substitutions = dish.substitutions ? 
                    Object.entries(dish.substitutions).map(([original, alternatives]) => ({
                      original,
                      alternatives: Array.isArray(alternatives) ? alternatives : [alternatives]
                    })) : undefined;
                  
                  // Create the recipe entry
                  const recipeData: RecipeData = {
                    id: `${cuisineName}-${mealType}-${dish.name}`.replace(/\s+/g, '-').toLowerCase(),
                    name: dish.name,
                    description: dish.description || '',
                    ingredients: dish.ingredients || [],
                    instructions: dish.preparationSteps || dish.instructions || [],
                    cuisine: cuisineName,
                    energyProfile: {
                      zodiac: dish.zodiac || [],
                      lunar: dish.lunar || [],
                      planetary: dish.planetary || [],
                      season: [season as Season]
                    },
                    tags: [
                      ...(dish.tags || []),
                      mealType, // Add mealType as a tag
                      season !== 'all' ? season : '', // Add season as a tag if not 'all'
                      ...(dish.dietaryInfo || []) // Add dietary info as tags
                    ].filter(Boolean), // Remove empty strings
                    timeToMake: dish.timeToMake || dish.cookTime,
                    flavorProfile: flavorProfile,
                    planetaryInfluences: dishPlanetaryInfluences,
                    
                    // Standardized fields
                    servingSize: dish.servingSize || dish.numberOfServings,
                    substitutions: substitutions,
                    tools: dish.tools,
                    spiceLevel: dish.spiceLevel,
                    nutrition: dish.nutrition ? {
                      calories: dish.nutrition.calories,
                      protein: dish.nutrition.protein,
                      carbs: dish.nutrition.carbs,
                      fat: dish.nutrition.fat,
                      vitamins: dish.nutrition.vitamins,
                      minerals: dish.nutrition.minerals
                    } : undefined,
                    preparationNotes: dish.preparationNotes || dish.culturalNotes,
                    technicalTips: dish.technicalTips
                  };
                  
                  // Keep regionalCuisine as an unused property if specified in the dish
                  if (dish.regionalCuisine) {
                    recipeData.regionalCuisine = dish.regionalCuisine;
                  }
                  
                  recipes.push(recipeData);
                });
              } else {
                console.log(`Invalid dishes data for ${cuisineName} - ${mealType} - ${season}: not an array`, dishes);
              }
            });
          } else {
            console.log(`Invalid meal data for ${cuisineName} - ${mealType}: not an object`, mealData);
          }
        });
      } else {
        console.log(`No valid dishes found for cuisine ${cuisineName}`);
      }
    } catch (error) {
      console.error(`Error processing cuisine ${cuisineName}:`, error);
    }
  });

  await Promise.all(cuisineDataPromises);

  console.log(`Transformed ${recipes.length} recipes from cuisines data`);
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
  },
  {
    id: 'cancer-seafood-risotto',
    name: 'Cancer Seafood Risotto',
    description: 'A creamy and comforting seafood risotto perfect for water sign energy',
    ingredients: [
      { name: 'Arborio rice', amount: 1.5, unit: 'cups' },
      { name: 'Shrimp', amount: 300, unit: 'g' },
      { name: 'Mussel', amount: 200, unit: 'g' },
      { name: 'Fish stock', amount: 4, unit: 'cups' },
      { name: 'White wine', amount: 0.5, unit: 'cup' },
      { name: 'Parmesan cheese', amount: 0.5, unit: 'cup' }
    ],
    instructions: [
      'Sauté onions and garlic in butter',
      'Add rice and cook until translucent',
      'Add wine and simmer until absorbed',
      'Gradually add fish stock while stirring',
      'Add seafood in the last 5 minutes of cooking',
      'Finish with parmesan and fresh herbs'
    ],
    energyProfile: {
      zodiac: ['cancer', 'pisces', 'scorpio'],
      lunar: ['full moon', 'waning gibbous'],
      planetary: ['Moon', 'Neptune', 'Venus'],
      season: ['summer']
    },
    tags: ['seafood', 'creamy', 'comfort food'],
    timeToMake: 45,
    flavorProfile: {
      spicy: 0.1,
      sweet: 0.3,
      sour: 0.2,
      bitter: 0.1,
      salty: 0.7,
      umami: 0.9
    },
    planetaryInfluences: {
      Moon: 0.9,
      Neptune: 0.7,
      Venus: 0.6
    },
    cuisine: 'italian',
    regionalCuisine: 'venetian'
  },
  {
    id: 'virgo-harvest-salad',
    name: 'Virgo Harvest Salad',
    description: 'A meticulously balanced salad with seasonal produce and grains',
    ingredients: [
      { name: 'Mixed greens', amount: 3, unit: 'cups' },
      { name: 'Quinoa', amount: 1, unit: 'cup', preparation: 'cooked' },
      { name: 'Roasted vegetables', amount: 2, unit: 'cups' },
      { name: 'Walnuts', amount: 0.25, unit: 'cup', preparation: 'toasted' },
      { name: 'Goat cheese', amount: 60, unit: 'g', preparation: 'crumbled' },
      { name: 'Balsamic vinaigrette', amount: 3, unit: 'tbsp' }
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Roast vegetables with olive oil and herbs',
      'Toss greens with cooked quinoa and roasted vegetables',
      'Add toasted walnuts and crumbled goat cheese',
      'Drizzle with balsamic vinaigrette and serve'
    ],
    energyProfile: {
      zodiac: ['virgo', 'taurus', 'capricorn'],
      lunar: ['first quarter', 'last quarter'],
      planetary: ['Mercury', 'Saturn', 'Venus'],
      season: ['fall']
    },
    tags: ['salad', 'healthy', 'vegetarian'],
    timeToMake: 30,
    flavorProfile: {
      spicy: 0.1,
      sweet: 0.4,
      sour: 0.5,
      bitter: 0.3,
      salty: 0.4,
      umami: 0.5
    },
    planetaryInfluences: {
      Mercury: 0.8,
      Saturn: 0.6,
      Venus: 0.5
    },
    cuisine: 'mediterranean',
    regionalCuisine: 'modern'
  }
];

// Change the recipes from a constant to a function that initializes the data
let recipesCache: RecipeData[] | null = null;

export const getRecipes = async (): Promise<RecipeData[]> => {
  if (recipesCache) {
    return recipesCache;
  }
  
  const transformedRecipes = await transformCuisineData();
  recipesCache = [...staticRecipes, ...transformedRecipes];
  return recipesCache;
};

/**
 * Get recipes based on zodiac sign
 */
export const getRecipesForZodiac = async (zodiac: ZodiacSign): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes.filter(recipe => 
    recipe.energyProfile.zodiac?.includes(zodiac)
  );
};

/**
 * Get recipes appropriate for a specific season
 */
export const getRecipesForSeason = async (season: Season): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes.filter(recipe => 
    recipe.energyProfile.season?.includes(season)
  );
};

/**
 * Get recipes appropriate for a specific lunar phase
 */
export const getRecipesForLunarPhase = async (lunarPhase: LunarPhase): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
  return recipes.filter(recipe => 
    recipe.energyProfile.lunar?.includes(lunarPhase)
  );
};

/**
 * Get recipes for a specific cuisine, including parent-child relationships
 * Will return recipes from both the parent cuisine and its regional variants
 */
export const getRecipesForCuisine = async (cuisine: string): Promise<RecipeData[]> => {
  const recipes = await getRecipes();
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
  criteria: {
    cuisine?: string;
    flavorProfile?: Record<string, number>;
    season?: Season;
    mealType?: string;
    ingredients?: string[];
    dietaryPreferences?: string[];
  },
  limit = 10
): Promise<RecipeData[]> => {
  console.log("getBestRecipeMatches called with criteria:", criteria);
  
  // Start with all recipes
  let candidateRecipes = [...await getRecipes()];
  console.log(`Starting with ${candidateRecipes.length} total recipes`);
  
  // Apply cuisine filter if specified
  if (criteria.cuisine) {
    console.log(`Filtering by cuisine: ${criteria.cuisine}`);
    
    // First try to use getRecipesForCuisineMatch from cuisineFlavorProfiles
    // which has enhanced functionality including LocalRecipeService integration
    try {
      const { getRecipesForCuisineMatch } = await import('./cuisineFlavorProfiles');
      const matchedCuisineRecipes = getRecipesForCuisineMatch(
        criteria.cuisine,
        [], // Empty array triggers direct LocalRecipeService use
        Math.max(limit * 2, 20) // Get more recipes for better filtering
      );
      
      console.log(`getRecipesForCuisineMatch returned ${matchedCuisineRecipes.length} recipes`);
      
      if (matchedCuisineRecipes && matchedCuisineRecipes.length > 0) {
        // Convert the recipes to ensure they match RecipeData format
        const formattedRecipes = matchedCuisineRecipes.map(recipe => ({
          id: recipe.id || `${recipe.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: recipe.name,
          description: recipe.description || `A ${criteria.cuisine} recipe`,
          ingredients: Array.isArray(recipe.ingredients) ? 
            recipe.ingredients.map(ing => ({
              name: ing.name || '',
              amount: typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount) || 1,
              unit: ing.unit || '',
              optional: ing.optional || false
            })) : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : 
            typeof recipe.instructions === 'string' ? [recipe.instructions] : [],
          cuisine: recipe.cuisine || criteria.cuisine,
          regionalCuisine: recipe.regionalCuisine,
          cookingMethod: recipe.cookingMethod || recipe.cookingMethods?.[0],
          flavorProfile: recipe.flavorProfile || {
            spicy: 0.5,
            sweet: 0.5,
            sour: 0.5,
            bitter: 0.5,
            salty: 0.5,
            umami: 0.5
          },
          elementalProperties: recipe.elementalProperties,
          energyProfile: {
            season: Array.isArray(recipe.season) ? recipe.season as Season[] : 
              typeof recipe.season === 'string' ? [recipe.season as Season] : ['all'],
            zodiac: [],
            lunar: [],
            planetary: []
          },
          tags: [
            ...(Array.isArray(recipe.mealType) ? recipe.mealType : (typeof recipe.mealType === 'string' ? [recipe.mealType] : [])).map(type => type.toLowerCase()),
            ...(Array.isArray(recipe.season) ? recipe.season : (typeof recipe.season === 'string' ? [recipe.season] : [])).map(s => s.toLowerCase())
          ],
          timeToMake: recipe.timeToMake,
          // Use the matchScore or matchPercentage if provided, otherwise use a default score
          matchScore: recipe.matchScore || (recipe.matchPercentage ? recipe.matchPercentage / 100 : 0.85)
        }));
        
        candidateRecipes = formattedRecipes;
        
        // If we got recipes directly and they already have match scores,
        // we can just return them after additional filtering
        if (formattedRecipes.length > 0 && formattedRecipes[0].matchScore !== undefined) {
          // Apply additional filters if needed
          return applyAdditionalFilters(formattedRecipes, criteria, limit);
        }
      }
    } catch (error) {
      console.error("Error using enhanced getRecipesForCuisineMatch:", error);
    }
    
    // Fallback to LocalRecipeService if getRecipesForCuisineMatch failed
    if (candidateRecipes.length === 0 || candidateRecipes === await getRecipes()) {
      try {
        // Import and use LocalRecipeService directly
        const { LocalRecipeService } = await import('../services/LocalRecipeService');
        
        // Get local recipes directly
        const localRecipes = LocalRecipeService.getRecipesByCuisine(criteria.cuisine || '');
        console.log(`Found ${localRecipes.length} recipes from LocalRecipeService for ${criteria.cuisine}`);
        
        if (localRecipes.length > 0) {
          // Convert the recipes to RecipeData format
          candidateRecipes = localRecipes.map(recipe => ({
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            ingredients: recipe.ingredients.map(ing => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              optional: ing.optional
            })),
            instructions: recipe.instructions,
            cuisine: recipe.cuisine,
            energyProfile: {
              season: recipe.season as Season[],
              zodiac: [],
              lunar: [],
              planetary: []
            },
            tags: [
              ...(Array.isArray(recipe.mealType) ? recipe.mealType : (typeof recipe.mealType === 'string' ? [recipe.mealType] : [])).map(type => type.toLowerCase()),
              ...(Array.isArray(recipe.season) ? recipe.season : (typeof recipe.season === 'string' ? [recipe.season] : [])).map(s => s.toLowerCase())
            ],
            timeToMake: recipe.timeToMake,
            matchScore: 0.85, // Default high score for local recipes
            matchPercentage: 85 // For display purposes
          }));
          
          // Apply additional filters if needed
          return applyAdditionalFilters(candidateRecipes, criteria, limit);
        }
      } catch (error) {
        console.error("Error using LocalRecipeService directly:", error);
      }
    }
  }
  
  console.log(`After cuisine filtering: ${candidateRecipes.length} recipes`);
  
  // Apply additional filters and scoring
  return applyAdditionalFilters(candidateRecipes, criteria, limit);
};

// Helper function to apply additional filters and calculate scores
async function applyAdditionalFilters(
  candidateRecipes: RecipeData[], 
  criteria: unknown,
  limit: number
): Promise<RecipeData[]> {
  // Preload modules we'll need
  let cuisineModule;
  if (criteria.cuisine) {
    try {
      cuisineModule = await import('./cuisineFlavorProfiles');
    } catch (error) {
      console.error("Error importing cuisineFlavorProfiles:", error);
    }
  }
  
  // Apply season filter if specified
  if (criteria.season) {
    console.log(`Filtering by season: ${criteria.season}`);
    const seasonRecipes = candidateRecipes.filter(recipe => 
      recipe.energyProfile.season?.includes(criteria.season ?? '') ||
      (Array.isArray(recipe.season) && recipe.season.includes(criteria.season))
    );
    
    console.log(`Found ${seasonRecipes.length} recipes for season ${criteria.season}`);
    
    // If we have enough seasonal recipes, use only those
    if (seasonRecipes.length >= limit) {
      candidateRecipes = seasonRecipes;
    }
  }
  
  // Apply meal type filter if specified
  if (criteria.mealType) {
    console.log(`Filtering by meal type: ${criteria.mealType}`);
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
    
    console.log(`Found ${mealTypeRecipes.length} recipes for meal type ${criteria.mealType}`);
    
    // If we have enough meal type specific recipes, use only those
    if (mealTypeRecipes.length >= limit) {
      candidateRecipes = mealTypeRecipes;
    }
  }
  
  if (candidateRecipes.length === 0) {
    console.log("No matching recipes found after all filtering");
    // Return some static recipes as fallback
    return staticRecipes.slice(0, limit).map(recipe => ({
      ...recipe,
      matchScore: 0.5, // Lower score to indicate these are fallbacks
      matchPercentage: 50 // For display
    }));
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
              console.warn(`Invalid ${flavor} value in recipe ${recipe.name}: ${value}`);
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
        console.error("Error calculating cuisine match score:", error);
      }
    }
    
    // Season match - enhanced with better scoring
    if (criteria.season) {
      const seasonMatch = (
        (recipe.energyProfile.season && recipe.energyProfile.season.includes(criteria.season)) ||
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
  
  console.log(`Returning ${Math.min(scoredRecipes.length, limit)} recipes after scoring`);
  
  // Sort by match score and return top results
  return scoredRecipes
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, limit);
}

// Export additional utility functions
export { calculateCuisineFlavorMatch } from '@/data/cuisineFlavorProfiles';

// Re-export these functions with proper implementations
export const getRecommendedCuisines = (profile: unknown) => {
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
  const recipes = await getRecipes();
  return recipes.map(recipe => ({
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
};