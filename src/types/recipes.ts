import { CuisineProfile } from '@/data/cuisines/culinaryTraditions';
import {ElementalProperties, AstrologicalInfluence} from '@/types/alchemy';

// Re-export Recipe from recipe.ts to fix TS2305 error in recipeCalculations.ts
export type { Recipe } from './recipe';

export interface RecipeElementalMapping {
  _elementalProperties: ElementalProperties,
  _astrologicalProfile: {
    rulingPlanets: string[],
    _favorableZodiac: any[],
    _optimalAspects: string[],
    _techniqueEnhancers: AstrologicalInfluence[]
  },
  cuisine: CuisineProfile,
  ingredientBalance: {
    base: string[],
    earth?: string[],
    fire?: string[],
    water?: string[]
    air?: string[]
  }
  astrologicalInfluences?: string[],

  // Enhanced elemental characteristics
  cookingTechniques?: string[],
  flavorProfiles?: string[],
  healthBenefits?: string[],
  complementaryHerbs?: string[],
  idealTimeOfDay?: string[],
  seasonalRecommendation?: string[],
  moodEffects?: string[]
}