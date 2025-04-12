import { cuisines } from './cuisines';
import { allCookingMethods, cookingMethods } from './cooking';
import { 
  seasonalPatterns,
  flavorProfiles,
  textureProfiles,
  temperatureEffects 
} from './integrations';
import sauces, { 
  allSauces, 
  sauceRecommendations, 
  italianSauces, 
  mexicanSauces 
} from './sauces';
import nutritional, {
  baseNutritionalProfiles,
  calculateNutritionalBalance,
  nutritionalToElemental
} from './nutritional';

export const FoodData = {
  cuisines,
  cooking: {
    methods: allCookingMethods
  },
  patterns: {
    seasonal: seasonalPatterns,
    flavors: flavorProfiles,
    textures: textureProfiles,
    temperature: temperatureEffects
  },
  sauces: {
    all: allSauces,
    recommendations: sauceRecommendations,
    byRegion: {
      italian: italianSauces,
      mexican: mexicanSauces
    }
  },
  nutrition: {
    profiles: baseNutritionalProfiles,
    calculateBalance: calculateNutritionalBalance,
    toElemental: nutritionalToElemental
  }
};

export type {
  CuisineType,
  Recipe,
  Ingredient,
  CookingMethod,
  ElementalProperties
} from '@/types/alchemy';

export {
  cuisines,
  cookingMethods,
  allCookingMethods,
  seasonalPatterns,
  flavorProfiles,
  textureProfiles,
  temperatureEffects,
  sauces,
  allSauces,
  sauceRecommendations,
  nutritional,
  baseNutritionalProfiles,
  calculateNutritionalBalance,
  nutritionalToElemental
};

export default FoodData;