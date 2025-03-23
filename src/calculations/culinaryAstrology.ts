import { cookingMethods } from '@/data/cooking/cookingMethods';
import { seasonalPatterns } from '@/data/integrations/seasonalPatterns';
import { celestialCalculator } from '@/services/celestialCalculations';
import { meats } from '@/data/ingredients/proteins/meat';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';
import { recipeElementalMappings } from '@/data/recipes/elementalMappings';
import { AstrologicalState, Season, ElementalProperties, Element } from '@/types/alchemy';

// Define the missing interface
interface AstrologicalCulinaryGuidance {
  dominantElement: string;
  technique: {
    name: string;
    rationale: string;
    optimalTiming: string;
  };
  ingredientFocus: {
    element: string;
    examples: string[];
    pairingTip: string;
  };
  cuisineRecommendation: CuisineRecommendation;
}

interface CuisineRecommendation {
  style: string;
  modification: string;
  astrologicalBoost: number;
}

// Need to define this as it's referenced in the code
interface CookingMethodData {
  name: string;
  elementalEffect: Record<string, number>;
  benefits: string[];
  astrologicalInfluences?: {
    dominantPlanets?: string[];
    lunarPhaseEffect?: Record<string, number>;
  };
}

// Need to define this as it's referenced in the code
interface RecipeElementalMapping {
  elementalProperties: Record<string, number>;
  astrologicalProfile: {
    rulingPlanets: string[];
    optimalAspects: string[];
  };
  cuisine?: string;
}

// Need to define this as it's referenced in the code
interface CuisineProfile {
  elementalAlignment: Record<string, number>;
  signatureModifications: Record<string, string>;
  astrologicalProfile: {
    rulingPlanets: string[];
    aspectEnhancers: string[];
  };
}

// Need to define this as it's referenced in the code
interface RecipeRecommendation {
  name: string;
  alignmentScore: number;
  elementDistribution: Record<string, number>;
  planetaryActivators: string[];
}

export class CulinaryAstrologer {
  private readonly ELEMENTAL_HARMONY_FACTORS = {
    zodiac: 0.4,
    lunar: 0.3,
    planetary: 0.2,
    seasonal: 0.1
  };
  
  // Add currentSeason field that's used in calculateCuisineBoost
  private currentSeason: Season = 'spring';

  getGuidance(astroState: AstrologicalState, season: Season): AstrologicalCulinaryGuidance {
    // Base recommendations directly on astrological state without elemental balance
    return {
      dominantElement: this.getDominantElementFromAstro(astroState),
      technique: this.getOptimalTechnique(astroState),
      ingredientFocus: this.getIngredientFocus(astroState),
      cuisineRecommendation: this.getCuisineRecommendation(astroState, season)
    };
  }

  private getDominantElementFromAstro(astroState: AstrologicalState): string {
    // Simple implementation based on zodiac sign
    const zodiacElementMap: Record<string, string> = {
      'aries': 'Fire', 'leo': 'Fire', 'sagittarius': 'Fire',
      'taurus': 'Earth', 'virgo': 'Earth', 'capricorn': 'Earth',
      'gemini': 'Air', 'libra': 'Air', 'aquarius': 'Air',
      'cancer': 'Water', 'scorpio': 'Water', 'pisces': 'Water'
    };
    
    return zodiacElementMap[astroState.zodiacSign?.toLowerCase() || ''] || 'Fire';
  }

  private getOptimalTechnique(astroState: AstrologicalState) {
    const viableMethods = Object.values(cookingMethods).filter(method => {
      const element = this.getDominantElementFromAstro(astroState);
      return method.elementalEffect[element] > 0.3;
    });

    const bestMethod = viableMethods.sort((a, b) => 
      this.getAstrologicalAffinity(b, astroState) - 
      this.getAstrologicalAffinity(a, astroState)
    )[0];

    return {
      name: bestMethod.name,
      rationale: `Aligns with ${this.getDominantElementFromAstro(astroState)} dominance through ${bestMethod.benefits.join(' and ')}`,
      optimalTiming: this.calculateOptimalTiming(bestMethod, astroState)
    };
  }

  private getAstrologicalAffinity(method: CookingMethodData, astroState: AstrologicalState): number {
    const planetScore = method.astrologicalInfluences?.dominantPlanets?.reduce((sum, planet) => 
      sum + (astroState.activePlanets.includes(planet) ? 0.2 : 0), 0) || 0;
    
    return planetScore;
  }

  private calculateOptimalTiming(method: CookingMethodData, astroState: AstrologicalState): string {
    const idealMoonPhase = Object.entries(method.astrologicalInfluences?.lunarPhaseEffect || {})
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Use the planetaryHours property from AstrologicalState
    const currentPlanetaryHour = astroState.planetaryHours || 'Sun';
    const dominantPlanet = method.astrologicalInfluences?.dominantPlanets?.[0] || "the planets";

    return `Best during ${idealMoonPhase.replace('_', ' ')} moon when ${currentPlanetaryHour} or ${dominantPlanet} is dominant`;
  }

  private getIngredientFocus(astroState: AstrologicalState): {
    element: string;
    examples: string[];
    pairingTip: string;
  } {
    const dominantElement = this.getDominantElementFromAstro(astroState);
    
    const matchingIngredients = Object.entries(meats).filter(([_, data]) => {
      const elementalAffinity = data.astrologicalProfile?.elementalAffinity;
      // Handle cases where elementalAffinity might be a string or an object with a base property
      if (typeof elementalAffinity === 'string') {
        return elementalAffinity === dominantElement;
      } else if (elementalAffinity && typeof elementalAffinity === 'object') {
        return elementalAffinity.base === dominantElement;
      }
      return false;
    });
    
    return {
      element: dominantElement,
      examples: matchingIngredients.slice(0, 3).map(([name]) => name),
      pairingTip: `Combine with ${this.getComplementaryElement(dominantElement)}-dominant preparations`,
    };
  }

  private getComplementaryElement(element: string): string {
    const complements: Record<string, string> = {
      'Fire': 'Air',
      'Air': 'Water', 
      'Water': 'Earth',
      'Earth': 'Fire'
    };
    return complements[element] || 'Earth';
  }

  private getCuisineRecommendation(
    astroState: AstrologicalState,
    season: Season
  ): CuisineRecommendation {
    const dominantElement = this.getDominantElementFromAstro(astroState);
    
    const viableCuisines = Object.entries(culinaryTraditions)
      .filter(([_, profile]) => 
        profile.elementalAlignment[dominantElement] > 0.3
      );

    const bestCuisine = viableCuisines.sort((a, b) => 
      b[1].elementalAlignment[dominantElement] - 
      a[1].elementalAlignment[dominantElement]
    )[0];

    return {
      style: bestCuisine[0],
      modification: bestCuisine[1].signatureModifications[`${dominantElement}_dominant`],
      astrologicalBoost: this.calculateCuisineBoost(bestCuisine[1])
    };
  }

  private calculateCuisineBoost(cuisine: CuisineProfile): number {
    // Since we're not using actual astrological state here, simplify to avoid type issues
    // Return a fixed boost value instead
    return 1.0; // No boost
  }

  getRecipeRecommendations(
    astroState: AstrologicalState,
    cuisineFilter?: string
  ): RecipeRecommendation[] {
    return Object.entries(recipeElementalMappings)
      .filter(([_, recipe]) => 
        !cuisineFilter || recipe.cuisine === culinaryTraditions[cuisineFilter]
      )
      .map(([name, recipe]) => ({
        name,
        alignmentScore: this.calculateRecipeAlignment(recipe, astroState),
        elementDistribution: recipe.elementalProperties,
        planetaryActivators: recipe.astrologicalProfile.rulingPlanets
      }))
      .sort((a, b) => b.alignmentScore - a.alignmentScore);
  }

  private calculateRecipeAlignment(recipe: RecipeElementalMapping, astroState: AstrologicalState): number {
    const planetMatch = recipe.astrologicalProfile.rulingPlanets
      .filter(p => astroState.activePlanets.includes(p)).length;
    
    // Remove aspectMatch calculation since activeAspects doesn't exist
    // Just use the planetMatch and zodiacMatch
    return (planetMatch * 0.7) + 
      (this.zodiacMatch(recipe, astroState) * 0.3);
  }

  private zodiacMatch(recipe: RecipeElementalMapping, astroState: AstrologicalState): number {
    // Simple implementation - could be enhanced with more complex astrological logic
    const dominantElement = this.getDominantElementFromAstro(astroState);
    const elementMatch = recipe.elementalProperties[dominantElement] || 0;
    return elementMatch > 0.6 ? 1 : elementMatch > 0.3 ? 0.5 : 0.1;
  }
}