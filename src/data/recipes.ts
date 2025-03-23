import { cuisines } from '@/data/cuisines';
import type { ZodiacSign, LunarPhase, Season, ElementalProperties } from '@/types/alchemy';
import { 
  planetaryFlavorProfiles, 
  calculateFlavorProfile, 
  getResonantCuisines, 
  getDominantFlavor, 
  calculatePlanetaryFlavorMatch 
} from '@/data/planetaryFlavorProfiles';
import { cuisineFlavorProfiles, calculateCuisineFlavorMatch } from '@/data/cuisineFlavorProfiles';

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
  difficulty?: 'easy' | 'medium' | 'hard';
  flavorProfile?: {
    spicy: number;
    sweet: number;
    sour: number;
    bitter: number;
    salty: number;
    umami: number;
  };
  planetaryInfluences?: Record<string, number>;
  // ... other fields ...
}

const transformCuisineData = (): RecipeData[] => {
  const recipes: RecipeData[] = [];
  
  Object.entries(cuisines).forEach(([cuisineName, cuisineData]) => {
    const primaryPlanetaryInfluences: Record<string, number> = {};
    
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
    
    const cuisineFlavorProfile = cuisineFlavorProfiles[cuisineName.toLowerCase()]?.flavorProfiles;
    
    const defaultFlavorProfile = cuisineFlavorProfile || calculateFlavorProfile(primaryPlanetaryInfluences);
    
    if (cuisineData && cuisineData.dishes && typeof cuisineData.dishes === 'object') {
      Object.entries(cuisineData.dishes).forEach(([mealType, mealData]) => {
        if (mealData && typeof mealData === 'object') {
          Object.entries(mealData as Record<string, any>).forEach(([season, dishes]) => {
            if (dishes && Array.isArray(dishes)) {
              dishes.forEach((dish: any) => {
                const dishPlanetaryInfluences = { ...primaryPlanetaryInfluences };
                
                if (dish.planetary && Array.isArray(dish.planetary)) {
                  dish.planetary.forEach((planet: string) => {
                    dishPlanetaryInfluences[planet] = dishPlanetaryInfluences[planet] ? 
                      Math.min(dishPlanetaryInfluences[planet] + 0.3, 1.0) : 0.7;
                  });
                }
                
                const flavorProfile = dish.flavorProfile || calculateFlavorProfile(dishPlanetaryInfluences);
                
                recipes.push({
                  id: `${cuisineName}-${mealType}-${dish.name}`,
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
                  difficulty: dish.difficulty,
                  flavorProfile: flavorProfile,
                  planetaryInfluences: dishPlanetaryInfluences
                });
              });
            }
          });
        }
      });
    }
  });

  return recipes;
};

export const recipes: RecipeData[] = [
  {
    id: '1',
    name: 'Fiery Aries Stir Fry',
    description: 'A bold and spicy dish for Aries energy',
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
      lunar: ['new_moon', 'waxing_crescent'] as LunarPhase[],
      planetary: ['Mars', 'Sun'],
      season: ['spring']
    },
    tags: ['spicy', 'quick', 'stir-fry'],
    timeToMake: 20,
    difficulty: 'easy',
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
    }
  },
  ...transformCuisineData()
];

export const getRecipesForZodiac = (zodiac: ZodiacSign): RecipeData[] => {
  return recipes.filter(recipe => 
    recipe.energyProfile.zodiac?.includes(zodiac)
  );
};

export const getRecipesForSeason = (season: Season): RecipeData[] => {
  return recipes.filter(recipe => 
    recipe.energyProfile.season?.includes(season)
  );
};

export const getRecipesForLunarPhase = (lunarPhase: LunarPhase): RecipeData[] => {
  return recipes.filter(recipe => 
    recipe.energyProfile.lunar?.includes(lunarPhase)
  );
};

export const getRecipesForCuisine = (cuisine: string): RecipeData[] => {
  return recipes.filter(recipe => 
    recipe.cuisine?.toLowerCase() === cuisine.toLowerCase()
  );
};

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
    .filter(recipe => (recipe as any).matchScore >= minMatchScore)
    .sort((a, b) => (b as any).matchScore - (a as any).matchScore);
};

export const getDominantPlanetaryInfluence = (recipe: RecipeData): string | null => {
  if (!recipe.planetaryInfluences) return null;
  
  const entries = Object.entries(recipe.planetaryInfluences);
  if (!entries.length) return null;
  
  return entries.sort(([, valueA], [, valueB]) => (valueB as number) - (valueA as number))[0][0];
};

export const getRecommendedCookingTechniques = (recipe: RecipeData): string[] => {
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

export const getRecipesForCuisineMatch = (
  recipeFlavorProfile: Record<string, number>,
  minMatchScore: number = 0.7
): {recipe: RecipeData, matchScore: number}[] => {
  return recipes
    .map(recipe => ({
      recipe,
      matchScore: recipe.cuisine ? 
        calculateCuisineFlavorMatch(recipeFlavorProfile, recipe.cuisine) : 0
    }))
    .filter(result => result.matchScore >= minMatchScore)
    .sort((a, b) => b.matchScore - a.matchScore);
};

export { calculateCuisineFlavorMatch } from '@/data/cuisineFlavorProfiles';

export const getRecommendedCuisines = (profile: any) => {};
export const getFusionSuggestions = (profile: any) => {};