import { CuisineProfile } from '@/data/cuisines/culinaryTraditions';
import { ElementalProperties, ZodiacSign, AstrologicalInfluence } from '@/types/alchemy';

// Re-export Recipe from recipe.ts to fix TS2305 error in recipeCalculations.ts
export type { Recipe } from './recipe';

export interface RecipeElementalMapping {
  elementalProperties: ElementalProperties;
  astrologicalProfile: {
    rulingPlanets: string[];
    favorableZodiac: any[];
    optimalAspects: string[];
    techniqueEnhancers: AstrologicalInfluence[];
  };
  cuisine: CuisineProfile;
  ingredientBalance: {
    base: string[];
    earth?: string[];
    fire?: string[];
    water?: string[];
    air?: string[];
  };
  astrologicalInfluences?: string[];

  // Enhanced elemental characteristics
  cookingTechniques?: string[];
  flavorProfiles?: string[];
  healthBenefits?: string[];
  complementaryHerbs?: string[];
  idealTimeOfDay?: string[];
  seasonalRecommendation?: string[];
  moodEffects?: string[];
}
