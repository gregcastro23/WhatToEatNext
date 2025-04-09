import { cuisines } from './cuisines';
import { cookingMethods } from './cooking/cookingMethods';
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

export const FoodData = {
  cuisines,
  cooking: {
    methods: cookingMethods
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
  seasonalPatterns,
  flavorProfiles,
  textureProfiles,
  temperatureEffects,
  sauces,
  allSauces,
  sauceRecommendations
};

export default FoodData;