import { cuisines } from './cuisines';
import { cookingMethods } from './cooking/cookingMethods';
import { 
  seasonalPatterns,
  flavorProfiles,
  textureProfiles,
  temperatureEffects 
} from './integrations';

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
  temperatureEffects
};

export default FoodData;