import { _ELEMENTAL_CHARACTERISTICS } from "@/constants/elementalConstants";
import { cookingMethods } from "@/data/cooking";
import { culinaryTraditions } from "@/data/cuisines/culinaryTraditions";
import type { AstrologicalInfluence } from "@/types/alchemy";
import type { RecipeElementalMapping } from "@/types/recipes";

export { _ELEMENTAL_CHARACTERISTICS as ELEMENTAL_CHARACTERISTICS };

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
  if (!method || typeof method !== "object") {
    return [defaultAstrologicalInfluence];
  }
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
    _elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.15, Air: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mars"],
      favorableZodiac: ["taurus", "capricorn"],
      optimalAspects: ["Venus trine Mars"],
      techniqueEnhancers: safeGetAstrologicalInfluences(
        cookingMethods.braising,
      ),
    },
    _astrologicalProfile: {
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
  },
  // Japanese Cuisine
  kaiseki_ryori: {
    elementalProperties: { Water: 0.6, Earth: 0.3, Air: 0.05, Fire: 0.05 },
    _elementalProperties: { Water: 0.6, Earth: 0.3, Air: 0.05, Fire: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["pisces", "virgo"],
      optimalAspects: ["Moon conjunct Mercury"],
      techniqueEnhancers: safeGetAstrologicalInfluences(
        cookingMethods.steaming,
      ),
    },
    _astrologicalProfile: {
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
  },
  // Mexican Cuisine
  mole_poblano: {
    elementalProperties: { Fire: 0.5, Earth: 0.4, Air: 0.05, Water: 0.05 },
    _elementalProperties: { Fire: 0.5, Earth: 0.4, Air: 0.05, Water: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["leo", "sagittarius"],
      optimalAspects: ["Sun trine Jupiter"],
      techniqueEnhancers: safeGetAstrologicalInfluences(
        cookingMethods.simmering,
      ),
    },
    _astrologicalProfile: {
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
  },
};
