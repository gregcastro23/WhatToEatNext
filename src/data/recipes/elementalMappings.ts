import type { RecipeElementalMapping } from '@/types/recipes';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';

// Helper function to safely access astrologicalInfluences
const safeGetAstrologicalInfluences = (method: any) => {
  if (!method) return ["all"];
  if (!method.astrologicalInfluences) return ["all"];
  return Array.isArray(method.astrologicalInfluences) 
    ? method.astrologicalInfluences 
    : [method.astrologicalInfluences];
};

export const recipeElementalMappings: Record<string, RecipeElementalMapping> = {
  // French Cuisine
  'coq_au_vin': {
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.15, Air: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mars'],
      favorableZodiac: ['taurus', 'capricorn'],
      optimalAspects: ['Venus trine Mars'],
      techniqueEnhancers: cookingMethods?.braising?.astrologicalInfluences 
        ? (Array.isArray(cookingMethods.braising.astrologicalInfluences) 
            ? cookingMethods.braising.astrologicalInfluences 
            : [cookingMethods.braising.astrologicalInfluences]) 
        : ["all"]
    },
    cuisine: culinaryTraditions.french,
    ingredientBalance: {
      base: ['chicken', 'red_wine'],
      earth: ['mushroom', 'bacon'],
      fire: ['brandy', 'pearl_onion'],
      water: ['stock', 'garlic']
    }
  },

  // Japanese Cuisine
  'kaiseki_ryori': {
    elementalProperties: { Water: 0.6, Earth: 0.3, Air: 0.05, Fire: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['pisces', 'virgo'],
      optimalAspects: ['Moon conjunct Mercury'],
      techniqueEnhancers: cookingMethods?.steaming?.astrologicalInfluences
        ? (Array.isArray(cookingMethods.steaming.astrologicalInfluences)
            ? cookingMethods.steaming.astrologicalInfluences
            : [cookingMethods.steaming.astrologicalInfluences])
        : ["all"]
    },
    cuisine: culinaryTraditions.japanese,
    ingredientBalance: {
      base: ['dashi', 'seasonal_fish'],
      water: ['seaweed', 'tofu'],
      earth: ['mushroom', 'rice'],
      air: ['grated_daikon', 'shiso']
    }
  },

  // Mexican Cuisine
  'mole_poblano': {
    elementalProperties: { Fire: 0.5, Earth: 0.4, Air: 0.05, Water: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'sagittarius'],
      optimalAspects: ['Sun trine Jupiter'],
      techniqueEnhancers: cookingMethods?.simmering?.astrologicalInfluences
        ? (Array.isArray(cookingMethods.simmering.astrologicalInfluences)
            ? cookingMethods.simmering.astrologicalInfluences
            : [cookingMethods.simmering.astrologicalInfluences])
        : ["all"]
    },
    cuisine: culinaryTraditions.mexican,
    ingredientBalance: {
      base: ['chocolate', 'chiles'],
      fire: ['cinnamon', 'cloves'],
      earth: ['sesame_seeds', 'tortilla'],
      air: ['achiote', 'herbs']
    }
  }
}; 