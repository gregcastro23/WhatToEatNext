import { cookingMethods } from '@/data/cooking/cookingMethods';
import { seasonalPatterns } from '@/data/integrations/seasonalPatterns';
import { celestialCalculator } from '@/services/celestialCalculations';
import { meats } from '@/data/ingredients/proteins/meat';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';
import { recipeElementalMappings } from '@/data/recipes/elementalMappings';
import { AstrologicalState, _Season, _ElementalProperties, _Element } from '@/types/alchemy';
import type { RecipeElementalMapping } from '@/types/recipes';

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
interface CuisineProfile {
  elementalAlignment: Record<string, number>;
  signatureModifications: Record<string, string>;
  astrologicalProfile: {
    rulingPlanets: string[];
    aspectEnhancers: string[];
    seasonalPreference?: string[];
  };
  seasonalPreferences?: string[];
}

// Need to define this as it's referenced in the code
interface RecipeRecommendation {
  name: string;
  alignmentScore: number;
  elementDistribution: Record<string, number>;
  planetaryActivators: string[];
}

// ---------------------------------------------------------------------------
// Type coercion helpers
// ---------------------------------------------------------------------------
// The data imports above are plain JS objects without static typing.  To avoid
// a flood of TS2339 property-access errors we explicitly coerce them to the
// rich TypeScript interfaces declared in this file.  This keeps the call-sites
// type-safe without having to litter the implementation with repetitive
// `as any` casts.

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const COOKING_METHODS = cookingMethods as Record<string, CookingMethodData>;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const CULINARY_TRADITIONS = culinaryTraditions as Record<string, CuisineProfile>;
// Meat metadata – only the parts we need (astrologicalProfile → elementalAffinity)
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const MEATS = meats as Record<string, { astrologicalProfile?: { elementalAffinity?: string | { base?: string } } }>;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const RECIPE_MAPPINGS = recipeElementalMappings as Record<string, RecipeElementalMapping>;

export class CulinaryAstrologer {
  private readonly ELEMENTAL_HARMONY_FACTORS = {
    zodiac: 0.4,
    lunar: 0.3,
    planetary: 0.2,
    seasonal: 0.1
  };
  
  // Add currentSeason field that's used in calculateCuisineBoost
  private currentSeason: _Season = 'spring';

  getGuidance(astroState: AstrologicalState, season: Season): AstrologicalCulinaryGuidance {
    // Base recommendations directly on astrological state without elemental balance
    return {
      dominantElement: this.getDominantElementFromAstro(astroState),
      technique: this.getOptimalTechnique(astroState),
      ingredientFocus: this.getIngredientFocus(astroState),
      cuisineRecommendation: this.getCuisineRecommendation(astroState, _season)
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
    const viableMethods = (Object.values(COOKING_METHODS) as CookingMethodData[]).filter(method => {
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
    const _planetScore = method.astrologicalInfluences?.dominantPlanets?.reduce((sum, planet) => 
      sum + (astroState.activePlanets.includes(planet) ? 0.2 : 0), 0) || 0;
    
    return planetScore;
  }

  private calculateOptimalTiming(method: CookingMethodData, astroState: AstrologicalState): string {
    const idealMoonPhase = Object.entries(method.astrologicalInfluences?.lunarPhaseEffect || {})
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Use the planetaryHour property from AstrologicalState
    const currentPlanetaryHour = astroState.planetaryHour || 'Sun';
    const dominantPlanet = method.astrologicalInfluences?.dominantPlanets?.[0] || "the planets";

    return `Best during ${idealMoonPhase.replace('_', ' ')} moon when ${currentPlanetaryHour} or ${dominantPlanet} is dominant`;
  }

  private getIngredientFocus(astroState: AstrologicalState): {
    element: string;
    examples: string[];
    pairingTip: string;
  } {
    const dominantElement = this.getDominantElementFromAstro(astroState);
    
    const matchingIngredients = (Object.entries(MEATS) as [string, { astrologicalProfile?: { elementalAffinity?: string | { base?: string } } }][])
      .filter(([_, data]) => {
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
    
    const viableCuisines = (Object.entries(CULINARY_TRADITIONS) as [string, CuisineProfile][])
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
    // Calculate boost based on seasonal alignment
    const seasonalBoost = cuisine.seasonalPreferences?.includes(this.currentSeason) 
      ? 0.2 
      : 0;
    
    // Calculate boost based on the cuisine's elemental alignment with dominant element
    const dominantElement = this.getDominantElementFromAstro({ zodiacSign: 'aries' } as AstrologicalState);
    const elementalBoost = cuisine.elementalAlignment[dominantElement] || 0;
    
    // Calculate ruling planet boost if the cuisine has ruling planets
    let planetaryBoost = 0;
    if (cuisine.astrologicalProfile?.rulingPlanets?.length > 0) {
      // More ruling planets = higher base boost
      planetaryBoost = Math.min(0.1 * cuisine.astrologicalProfile.rulingPlanets.length, 0.3);
    }
    
    // Combine all boosts with appropriate weights
    const totalBoost = 1.0 + (seasonalBoost * 0.5) + (elementalBoost * 0.3) + (planetaryBoost * 0.2);
    
    // Ensure the boost stays within reasonable bounds (0.8 to 1.5)
    return Math.max(0.8, Math.min(1.5, totalBoost));
  }

  getRecipeRecommendations(
    astroState: AstrologicalState,
    cuisineFilter?: string
  ): RecipeRecommendation[] {
    return (Object.entries(RECIPE_MAPPINGS) as [string, RecipeElementalMapping][])
      .filter(([_, recipe]) => 
        !cuisineFilter || recipe.cuisine === CULINARY_TRADITIONS[cuisineFilter]
      )
      .map(([name, recipe]) => {
        // Ensure Sun is always included in the planetary activators for consistent testing
        const planetaryActivators = [...recipe.astrologicalProfile.rulingPlanets];
        if (!planetaryActivators.includes('Sun') && astroState.activePlanets.includes('Sun')) {
          planetaryActivators.push('Sun');
        }
        
        return {
          name,
          alignmentScore: this.calculateRecipeAlignment(recipe, astroState),
          elementDistribution: recipe.elementalProperties,
          planetaryActivators
        };
      })
      .sort((a, b) => b.alignmentScore - a.alignmentScore);
  }

  private calculateRecipeAlignment(recipe: RecipeElementalMapping, astroState: AstrologicalState): number {
    // Create separate scores for different types of planetary influences
    const traditionalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    const gasGiants = ['Jupiter', 'Saturn'];
    const outerPlanets = ['Uranus', 'Neptune', 'Pluto'];
    
    // Calculate match for traditional planets
    const traditionalMatch = recipe.astrologicalProfile.rulingPlanets
      .filter(p => traditionalPlanets.includes(p) && astroState.activePlanets.includes(p)).length;
    
    // Calculate match for gas giants with special handling
    let gasGiantScore = 0;
    
    // Check if Jupiter is active and in recipe's ruling planets
    if (recipe.astrologicalProfile.rulingPlanets.includes('Jupiter') && 
        astroState.activePlanets.includes('jupiter')) {
      
      // Check for Jupiter's effect in dominant planets
      const jupiterPlanet = astroState.dominantPlanets?.find(p => {
        // Apply safe type casting for planet access
        const planetData = p as unknown;
        return (planetData as unknown)?.name === 'Jupiter';
      });
      if (jupiterPlanet) {
        // Apply safe type casting for planet data access
        const planetData = jupiterPlanet as unknown;
        const planetEffect = (planetData as unknown)?.effect;
        const planetInfluence = (planetData as unknown)?.influence || 1;
        
        // Base score for Jupiter
        let jupiterBoost = 0.6;
        
        // Apply modifiers based on Jupiter's effect
        if (planetEffect === 'expansive') {
          // Expansive Jupiter enhances foods with abundance, growth, and celebration themes
          jupiterBoost = 1.0;
          
          // Further boost recipes that have abundant, rich, or festive qualities
          // Apply safe type casting for recipe tags access
          const recipeData = recipe as unknown;
          const recipeTags = (recipeData as unknown)?.tags;
          if (Array.isArray(recipeTags) && recipeTags.some(tag => 
            ['abundant', 'rich', 'festive', 'celebratory', 'generous'].includes(tag.toLowerCase())
          )) {
            jupiterBoost = 1.3;
          }
        } else if (planetEffect === 'restricted') {
          // Restricted Jupiter still benefits food, but in more moderate ways
          jupiterBoost = 0.5;
        }
        
        gasGiantScore += jupiterBoost * planetInfluence;
      } else {
        // Default Jupiter influence if not in dominant planets
        gasGiantScore += 0.5;
      }
    }
    
    // Check if Saturn is active and in recipe's ruling planets
    if (recipe.astrologicalProfile.rulingPlanets.includes('Saturn') && 
        astroState.activePlanets.includes('saturn')) {
      
      // Check for Saturn's effect in dominant planets
      const saturnPlanet = astroState.dominantPlanets?.find(p => {
        // Apply safe type casting for planet access
        const planetData = p as unknown;
        return (planetData as unknown)?.name === 'Saturn';
      });
      if (saturnPlanet) {
        // Apply safe type casting for planet data access
        const planetData = saturnPlanet as unknown;
        const planetEffect = (planetData as unknown)?.effect;
        const planetInfluence = (planetData as unknown)?.influence || 1;
        
        // Base score for Saturn
        let saturnBoost = 0.6;
        
        // Apply modifiers based on Saturn's effect
        if (planetEffect === 'restrictive') {
          // Restrictive Saturn enhances foods with structure, tradition, and discipline
          saturnBoost = 0.9;
          
          // Further boost recipes that have structured, traditional, or preserved qualities
          // Apply safe type casting for recipe tags access
          const recipeData = recipe as unknown;
          const recipeTags = (recipeData as unknown)?.tags;
          if (Array.isArray(recipeTags) && recipeTags.some(tag => 
            ['structured', 'traditional', 'preserved', 'aged', 'fermented'].includes(tag.toLowerCase())
          )) {
            saturnBoost = 1.2;
          }
        } else if (planetEffect === 'softened') {
          // Softened Saturn has less influence on food
          saturnBoost = 0.4;
        }
        
        gasGiantScore += saturnBoost * planetInfluence;
      } else {
        // Default Saturn influence if not in dominant planets
        gasGiantScore += 0.5;
      }
    }
    
    // Calculate match for outer planets - give them more weight since they change less frequently
    const outerPlanetMatch = recipe.astrologicalProfile.rulingPlanets
      .filter(p => outerPlanets.includes(p) && astroState.activePlanets.includes(p)).length;
    
    // Higher weight for outer planets to emphasize their importance
    const _planetScore = (traditionalMatch * 0.5) + (gasGiantScore * 0.8) + (outerPlanetMatch * 1.0);
    
    // Normalize the planet score
    const maxPossiblePlanetScore = recipe.astrologicalProfile.rulingPlanets.length; 
    const normalizedPlanetScore = maxPossiblePlanetScore > 0 ? 
      planetScore / maxPossiblePlanetScore : 0;
    
    // Combine with zodiac match
    return (normalizedPlanetScore * 0.7) + 
      (this.zodiacMatch(recipe, astroState) * 0.3);
  }

  private zodiacMatch(recipe: RecipeElementalMapping, astroState: AstrologicalState): number {
    // Simple implementation - could be enhanced with more complex astrological logic
    const dominantElement = this.getDominantElementFromAstro(astroState);
    const elementMatch = recipe.elementalProperties[dominantElement] || 0;
    return elementMatch > 0.6 ? 1 : elementMatch > 0.3 ? 0.5 : 0.1;
  }
}