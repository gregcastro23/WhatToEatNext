import { allCookingMethods, cookingMethods } from "./cooking";
import { cuisines } from "./cuisines";
import {
  seasonalPatterns,
  flavorProfiles,
  textureProfiles,
  temperatureEffects,
} from "./integrations";
import nutritional, {
  baseNutritionalProfiles,
  calculateNutritionalBalance,
  nutritionalToElemental,
} from "./nutritional";
import { allRecipes } from "./recipes/index";
import { getBestRecipeMatches } from "./recipes";
import sauces, {
  allSauces,
  sauceRecommendations,
  italianSauces,
  mexicanSauces,
} from "./sauces";

export const FoodData = {
  cuisines,
  cooking: {
    methods: allCookingMethods,
  },
  recipes: {
    all: allRecipes,
    getAll: allRecipes, // Use allRecipes for compatibility
  },
  patterns: {
    seasonal: seasonalPatterns,
    flavors: flavorProfiles,
    textures: textureProfiles,
    temperature: temperatureEffects,
  },
  sauces: {
    all: allSauces,
    recommendations: sauceRecommendations,
    byRegion: {
      italian: italianSauces,
      mexican: mexicanSauces,
    },
  },
  nutrition: {
    profiles: baseNutritionalProfiles,
    calculateBalance: calculateNutritionalBalance,
    toElemental: nutritionalToElemental,
  },
};

export type {
  CuisineType,
  Recipe,
  Ingredient,
  CookingMethod,
  ElementalProperties,
} from "@/types/alchemy";

export {
  cuisines,
  cookingMethods,
  allCookingMethods,
  allRecipes,
  allRecipes as getAllRecipes, // Alias for compatibility
  getBestRecipeMatches,
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
  nutritionalToElemental,
};

export default FoodData;
