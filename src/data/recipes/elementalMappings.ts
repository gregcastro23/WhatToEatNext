import { _ELEMENTAL_CHARACTERISTICS } from "@/constants/elementalConstants";
import { cookingMethods } from "@/data/cooking";
import { culinaryTraditions } from "@/data/cuisines/culinaryTraditions";
import { ElementalRecommendationService } from "@/services/ElementalRecommendationService";
import type { AstrologicalInfluence } from "@/types/alchemy";
import { ZodiacSign, _ } from "@/types/alchemy";
import type { RecipeElementalMapping } from "@/types/recipes";

export { ELEMENTAL_CHARACTERISTICS };

// Default astrologicalInfluence for when none is specified
const defaultAstrologicalInfluence: AstrologicalInfluence = {
  planet: "Universal",
  sign: "aries",
  element: "Fire",
  strength: 1.0,
  aspects: [],
};

// Helper function to safely access astrologicalInfluences
const safeGetAstrologicalInfluences = (
  method: unknown,
): AstrologicalInfluence[] => {
  if (!method) return [defaultAstrologicalInfluence];
  const methodData = method as {
    astrologicalInfluences?: AstrologicalInfluence | AstrologicalInfluence[];
  };
  if (!methodData.astrologicalInfluences) return [defaultAstrologicalInfluence];
  if (Array.isArray(methodData.astrologicalInfluences)) {
    return methodData.astrologicalInfluences;
  }
  return [methodData.astrologicalInfluences];
};

/**
 * Enhanced recipe mappings with comprehensive elemental properties
 */
export const recipeElementalMappings: Record<string, RecipeElementalMapping> = {
  // French Cuisine
  coq_au_vin: {
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.15, Air: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mars"],
      favorableZodiac: ["taurus", "capricorn"],
      optimalAspects: ["Venus trine Mars"],
      techniqueEnhancers: safeGetAstrologicalInfluences(
        cookingMethods.braising,
      ),
    },
    cuisine: culinaryTraditions.french,
    ingredientBalance: {
      base: ["chicken", "red_wine"],
      earth: ["mushroom", "bacon"],
      fire: ["brandy", "pearl_onion"],
      water: ["stock", "garlic"],
    },
    // Enhanced properties from expanded elemental characteristics
    cookingTechniques: ["Slow cooking", "Braising", "Simmering"],
    flavorProfiles: ["Rich", "Complex", "Umami", "Earthy"],
    healthBenefits: ["Nutritional density", "Sustained energy"],
    complementaryHerbs: ["Thyme", "Bay leaf", "Rosemary"],
    idealTimeOfDay: ["Evening", "Dinner"],
    seasonalRecommendation: ["Autumn", "Winter"],
  } as any,
  // Japanese Cuisine
  kaiseki_ryori: {
    elementalProperties: { Water: 0.6, Earth: 0.3, Air: 0.05, Fire: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["pisces", "virgo"],
      optimalAspects: ["Moon conjunct Mercury"],
      techniqueEnhancers: safeGetAstrologicalInfluences(
        cookingMethods.steaming,
      ),
    },
    cuisine: culinaryTraditions.japanese,
    ingredientBalance: {
      base: ["dashi", "seasonal_fish"],
      water: ["seaweed", "tofu"],
      earth: ["mushroom", "rice"],
      air: ["grated_daikon", "shiso"],
    },
    // Enhanced properties from expanded elemental characteristics
    cookingTechniques: ["Steaming", "Poaching", "Simmering"],
    flavorProfiles: ["Subtle", "Umami", "Light", "Fresh"],
    healthBenefits: ["Hydration", "Detoxification", "Emotional balance"],
    complementaryHerbs: ["Shiso", "Ginger", "Wasabi"],
    idealTimeOfDay: ["Evening", "Night"],
    seasonalRecommendation: ["Winter", "Spring"],
  } as any,
  // Mexican Cuisine
  mole_poblano: {
    elementalProperties: { Fire: 0.5, Earth: 0.4, Air: 0.05, Water: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["leo", "sagittarius"],
      optimalAspects: ["Sun trine Jupiter"],
      techniqueEnhancers: safeGetAstrologicalInfluences(
        cookingMethods.simmering,
      ),
    },
    cuisine: culinaryTraditions.mexican,
    ingredientBalance: {
      base: ["chocolate", "chiles"],
      fire: ["cinnamon", "cloves"],
      earth: ["sesame_seeds", "tortilla"],
      air: ["achiote", "herbs"],
    },
    // Enhanced properties from expanded elemental characteristics
    cookingTechniques: ["Roasting", "Simmering", "Grinding", "Blending"],
    flavorProfiles: ["Spicy", "Complex", "Rich", "Bitter", "Sweet"],
    healthBenefits: ["Metabolism boost", "Circulation improvement"],
    complementaryHerbs: ["Epazote", "Mexican oregano", "Cilantro"],
    idealTimeOfDay: ["Noon", "Early afternoon"],
    seasonalRecommendation: ["Summer", "Early autumn"],
  } as any,
};

/**
 * Get enhanced elemental recommendations for a recipe
 * @param recipeId The recipe ID to get recommendations for
 * @returns Enhanced elemental recommendations
 */
export function getRecipeEnhancedRecommendations(recipeId: string) {
  const recipe = recipeElementalMappings[recipeId];
  if (!recipe) return null;

  // Get base recommendations from the ElementalRecommendationService
  const baseRecommendation =
    ElementalRecommendationService.generateRecommendation(
      recipe.elementalProperties,
    );

  // Merge with any recipe-specific overrides
  return {
    ...baseRecommendation,
    cookingTechniques:
      recipe.cookingTechniques || baseRecommendation.cookingTechniques,
    flavorProfiles: recipe.flavorProfiles || baseRecommendation.flavorProfiles,
    healthBenefits: recipe.healthBenefits || baseRecommendation.healthBenefits,
    culinaryHerbs:
      recipe.complementaryHerbs || baseRecommendation.culinaryHerbs,
    timeOfDay: recipe.idealTimeOfDay || baseRecommendation.timeOfDay,
    seasonalBest:
      recipe.seasonalRecommendation || baseRecommendation.seasonalBest,
  };
}
