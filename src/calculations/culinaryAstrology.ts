import { cookingMethods } from '../data/cooking/cookingMethods';
import { seasonalPatterns } from '../data/integrations/seasonalPatterns';
import { celestialCalculator } from '../services/celestialCalculations';
import { meats } from '../data/ingredients/proteins/meat';
import { culinaryTraditions } from '../data/cuisines/culinaryTraditions';
import { recipeElementalMappings } from '../data/recipes/elementalMappings';
import { AstrologicalState, Season, ElementalProperties, Element, PlanetName } from '../types/alchemy';
import type { RecipeElementalMapping } from '../types/recipes';

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

export class CulinaryAstrologer {
  private readonly ELEMENTAL_HARMONY_FACTORS = {
    zodiac: 0.4,
    lunar: 0.3,
    planetary: 0.2,
    seasonal: 0.1
  };
  
  private currentSeason: Season;
  
  constructor(initialSeason: Season = 'spring') {
    this.currentSeason = initialSeason;
  }
  
  // Method to update the current season
  setCurrentSeason(season: Season): void {
    if (!season || !(['spring', 'summer', 'autumn', 'winter'] as Season[]).includes(season)) {
      console.warn(`Invalid season provided: ${season}. Defaulting to spring.`);
      this.currentSeason = 'spring';
    } else {
      this.currentSeason = season;
    }
  }

  getGuidance(astroState: AstrologicalState, season?: Season): AstrologicalCulinaryGuidance {
    // Update current season if provided
    if (season) {
      this.setCurrentSeason(season);
    }
    
    // Ensure astroState is valid
    const safeAstroState = this.validateAstrologicalState(astroState);
    
    // Base recommendations directly on astrological state without elemental balance
    return {
      dominantElement: this.getDominantElementFromAstro(safeAstroState),
      technique: this.getOptimalTechnique(safeAstroState),
      ingredientFocus: this.getIngredientFocus(safeAstroState),
      cuisineRecommendation: this.getCuisineRecommendation(safeAstroState, this.currentSeason)
    };
  }
  
  // Validate and provide defaults for astrological state
  private validateAstrologicalState(astroState?: AstrologicalState): AstrologicalState {
    const defaultState: AstrologicalState = {
      sunSign: 'aries',
      lunarPhase: 'new moon',
      activePlanets: ['sun'],
      dominantElement: 'Fire',
      dominantPlanets: [{ name: 'sun', influence: 1.0 }]
    };
    
    if (!astroState) return defaultState;
    
    return {
      sunSign: astroState.sunSign || defaultState.sunSign,
      moonSign: astroState.moonSign,
      lunarPhase: astroState.lunarPhase || defaultState.lunarPhase,
      activePlanets: Array.isArray(astroState.activePlanets) ? astroState.activePlanets : defaultState.activePlanets,
      dominantElement: astroState.dominantElement || defaultState.dominantElement,
      dominantPlanets: Array.isArray(astroState.dominantPlanets) ? astroState.dominantPlanets : defaultState.dominantPlanets
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
    
    const sign = astroState.sunSign?.toLowerCase();
    if (!sign || !zodiacElementMap[sign]) {
      console.warn(`Invalid zodiac sign: ${astroState.sunSign}. Defaulting to Fire.`);
      return 'Fire';
    }
    
    return zodiacElementMap[sign];
  }

  private getOptimalTechnique(astroState: AstrologicalState) {
    if (!cookingMethods || Object.keys(cookingMethods).length === 0) {
      console.warn('Cooking methods data is not available. Returning default technique.');
      return {
        name: 'Roasting',
        rationale: 'Default technique when data is unavailable',
        optimalTiming: 'Best during daylight hours'
      };
    }
    
    const dominantElement = this.getDominantElementFromAstro(astroState);
    
    const viableMethods = Object.values(cookingMethods).filter(method => {
      return method.elementalEffect && 
        typeof method.elementalEffect[dominantElement] === 'number' && 
        method.elementalEffect[dominantElement] > 0.3;
    });

    if (viableMethods.length === 0) {
      // Fallback to any method if no viable methods found
      const fallbackMethod = Object.values(cookingMethods)[0];
      return {
        name: fallbackMethod?.name || 'Basic Cooking',
        rationale: `Default technique when no elemental alignment is found`,
        optimalTiming: 'Anytime is suitable'
      };
    }

    const bestMethod = viableMethods.sort((a, b) => 
      this.getAstrologicalAffinity(b, astroState) - 
      this.getAstrologicalAffinity(a, astroState)
    )[0];

    return {
      name: bestMethod.name,
      rationale: `Aligns with ${dominantElement} dominance through ${bestMethod.benefits?.join(' and ') || 'various benefits'}`,
      optimalTiming: this.calculateOptimalTiming(bestMethod, astroState)
    };
  }

  private getAstrologicalAffinity(method: CookingMethodData, astroState: AstrologicalState): number {
    if (!method?.astrologicalInfluences?.dominantPlanets || !Array.isArray(astroState.activePlanets)) {
      return 0;
    }
    
    const planetScore = method.astrologicalInfluences.dominantPlanets.reduce((sum, planet) => 
      sum + (astroState.activePlanets.includes(planet as PlanetName) ? 0.2 : 0), 0);
    
    return planetScore;
  }

  private calculateOptimalTiming(method: CookingMethodData, astroState: AstrologicalState): string {
    if (!method?.astrologicalInfluences?.lunarPhaseEffect || 
        Object.keys(method.astrologicalInfluences.lunarPhaseEffect).length === 0) {
      return 'Timing is flexible';
    }
    
    const idealMoonPhase = Object.entries(method.astrologicalInfluences.lunarPhaseEffect)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Get the dominant planet from the state
    const dominantPlanet = astroState.dominantPlanets?.[0]?.name || 'sun';
    const methodPlanet = method.astrologicalInfluences?.dominantPlanets?.[0] || "the planets";

    return `Best during ${idealMoonPhase.replace('_', ' ')} moon when ${dominantPlanet} or ${methodPlanet} is dominant`;
  }

  private getIngredientFocus(astroState: AstrologicalState): {
    element: string;
    examples: string[];
    pairingTip: string;
  } {
    const dominantElement = this.getDominantElementFromAstro(astroState);
    
    // Safely check if meats data is available
    if (!meats || Object.keys(meats).length === 0) {
      return {
        element: dominantElement,
        examples: ['chicken', 'beef', 'fish'],
        pairingTip: `Combine with complementary preparations`,
      };
    }
    
    const matchingIngredients = Object.entries(meats).filter(([_, data]) => {
      if (!data?.astrologicalProfile?.elementalAffinity) return false;
      
      const elementalAffinity = data.astrologicalProfile.elementalAffinity;
      // Handle cases where elementalAffinity might be a string or an object with a base property
      if (typeof elementalAffinity === 'string') {
        return elementalAffinity === dominantElement;
      } else if (elementalAffinity && typeof elementalAffinity === 'object') {
        return elementalAffinity.base === dominantElement;
      }
      return false;
    });
    
    // Provide fallback if no matching ingredients
    const examples = matchingIngredients.length > 0 
      ? matchingIngredients.slice(0, 3).map(([name]) => name)
      : this.getFallbackIngredientsForElement(dominantElement);
    
    return {
      element: dominantElement,
      examples,
      pairingTip: `Combine with ${this.getComplementaryElement(dominantElement)}-dominant preparations`,
    };
  }
  
  // Fallback ingredients when no matches are found
  private getFallbackIngredientsForElement(element: string): string[] {
    const fallbacks: Record<string, string[]> = {
      'Fire': ['lamb', 'venison', 'spicy sausage'],
      'Earth': ['beef', 'pork', 'game meat'],
      'Air': ['chicken', 'turkey', 'pheasant'],
      'Water': ['fish', 'shellfish', 'squid']
    };
    
    return fallbacks[element] || ['chicken', 'beef', 'fish'];
  }

  private getComplementaryElement(element: string): string {
    // Based on cursor_rules_context elementalprinciples.mdc:
    // Elements reinforce themselves, not oppose each other
    return element;
  }

  private getCuisineRecommendation(
    astroState: AstrologicalState,
    season: Season
  ): CuisineRecommendation {
    const dominantElement = this.getDominantElementFromAstro(astroState);
    
    // Check if culinaryTraditions data is available
    if (!culinaryTraditions || Object.keys(culinaryTraditions).length === 0) {
      return {
        style: 'Mediterranean',
        modification: 'With seasonal herbs and spices',
        astrologicalBoost: 1.0
      };
    }
    
    const viableCuisines = Object.entries(culinaryTraditions)
      .filter(([_, profile]) => 
        profile.elementalAlignment && 
        typeof profile.elementalAlignment[dominantElement] === 'number' &&
        profile.elementalAlignment[dominantElement] > 0.3
      );

    // Fallback if no viable cuisines
    if (viableCuisines.length === 0) {
      console.warn('No viable cuisines found for the current astrological state.');
      const fallbackCuisine = Object.entries(culinaryTraditions)[0];
      
      if (!fallbackCuisine) {
        return {
          style: 'Mediterranean',
          modification: 'With seasonal herbs and spices',
          astrologicalBoost: 1.0
        };
      }
      
      return {
        style: fallbackCuisine[0],
        modification: fallbackCuisine[1].signatureModifications?.[`${dominantElement}_dominant`] || 'Standard preparation',
        astrologicalBoost: 1.0
      };
    }

    const bestCuisine = viableCuisines.sort((a, b) => 
      (b[1].elementalAlignment[dominantElement] || 0) - 
      (a[1].elementalAlignment[dominantElement] || 0)
    )[0];

    return {
      style: bestCuisine[0],
      modification: bestCuisine[1].signatureModifications?.[`${dominantElement}_dominant`] || 'Standard preparation',
      astrologicalBoost: this.calculateCuisineBoost(bestCuisine[1], season, astroState)
    };
  }

  private calculateCuisineBoost(cuisine: CuisineProfile, season: Season, astroState: AstrologicalState): number {
    if (!cuisine?.astrologicalProfile) return 0;
    
    let seasonalBoost = 0;
    let planetaryBoost = 0;
    
    // Calculate seasonal boost
    if (cuisine.seasonalPreferences && Array.isArray(cuisine.seasonalPreferences)) {
      seasonalBoost = cuisine.seasonalPreferences.includes(season) ? 0.2 : 0;
    }
    
    // Calculate planetary boost
    if (cuisine.astrologicalProfile.rulingPlanets && 
        Array.isArray(cuisine.astrologicalProfile.rulingPlanets) &&
        Array.isArray(astroState.activePlanets)) {
      // Count matching planets for a more nuanced boost
      const matchingPlanets = cuisine.astrologicalProfile.rulingPlanets
        .filter(planet => astroState.activePlanets.includes(planet as PlanetName));
      
      planetaryBoost = Math.min(0.1 * matchingPlanets.length, 0.3);
    }
    
    // Total boost capped at 0.5
    return Math.min(seasonalBoost + planetaryBoost, 0.5);
  }

  getRecipeRecommendations(
    astroState: AstrologicalState,
    cuisineFilter?: string
  ): RecipeRecommendation[] {
    if (!recipeElementalMappings || Object.keys(recipeElementalMappings).length === 0) {
      console.warn('Recipe data is not available. Returning empty recommendations.');
      return [];
    }
    
    // Validate astrological state
    const safeAstroState = this.validateAstrologicalState(astroState);
    
    return Object.entries(recipeElementalMappings)
      .filter(([_, recipe]) => {
        if (!recipe) return false;
        // Check if cuisine filter applies
        if (cuisineFilter && culinaryTraditions) {
          return recipe.cuisine === culinaryTraditions[cuisineFilter];
        }
        return true;
      })
      .map(([name, recipe]) => {
        if (!recipe?.astrologicalProfile?.rulingPlanets) {
          return {
            name,
            alignmentScore: 0.5, // Default middle score
            elementDistribution: recipe?.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
            planetaryActivators: ['sun'] // Default to sun
          };
        }
        
        // Ensure sun is always included in the planetary activators for consistent testing
        const planetaryActivators = [...recipe.astrologicalProfile.rulingPlanets];
        if (Array.isArray(safeAstroState.activePlanets) && 
            !planetaryActivators.includes('sun') && 
            safeAstroState.activePlanets.includes('sun')) {
          planetaryActivators.push('sun');
        }
        
        return {
          name,
          alignmentScore: this.calculateRecipeAlignment(recipe, safeAstroState),
          elementDistribution: recipe.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          planetaryActivators
        };
      })
      .sort((a, b) => b.alignmentScore - a.alignmentScore);
  }

  private calculateRecipeAlignment(recipe: RecipeElementalMapping, astroState: AstrologicalState): number {
    if (!recipe?.astrologicalProfile || !astroState) return 0.5;
    
    // Calculate element-to-zodiac match score (30% of total)
    const elementZodiacMatch = this.zodiacMatch(recipe, astroState);
    
    // Calculate lunar phase influence (20% of total)
    let lunarMatch = 0.5; // Start with neutral value
    if (astroState.lunarPhase) {
      // Convert lunarPhase to match the format in recipe data
      const lunarPhaseName = this.normalizeLunarPhaseName(astroState.lunarPhase);
      
      // Check if recipe has lunar phase influences - need to check astrologicalProfile has this field
      const recipeLunarInfluences = (recipe.astrologicalProfile as any)?.lunarPhaseInfluences;
      
      if (recipeLunarInfluences && Array.isArray(recipeLunarInfluences) && 
          recipeLunarInfluences.includes(lunarPhaseName)) {
        lunarMatch = 0.9; // Strong match
      } else {
        // Check elemental compatibility between lunar phase and recipe
        const lunarElement = this.getLunarPhaseElement(astroState.lunarPhase);
        if (lunarElement && recipe.elementalProperties) {
          // Get recipe's strongest element
          const recipeElements = Object.entries(recipe.elementalProperties);
          recipeElements.sort((a, b) => b[1] - a[1]);
          const dominantElement = recipeElements[0]?.[0];
          
          // If dominant element matches lunar phase element, it's a good match
          if (dominantElement === lunarElement) {
            lunarMatch = 0.8;
          } else {
            // All elements have good compatibility still
            lunarMatch = 0.7;
          }
        }
      }
    }
    
    // Calculate planetary influence match (30% of total)
    let planetaryMatch = 0.5; // Start with neutral value
    if (recipe.astrologicalProfile.rulingPlanets && Array.isArray(astroState.activePlanets)) {
      // Find matching planets between recipe and current active planets
      const matchingPlanets = recipe.astrologicalProfile.rulingPlanets.filter(
        planet => astroState.activePlanets?.includes(planet.toLowerCase() as PlanetName)
      );
      
      if (matchingPlanets.length > 0) {
        // Calculate percentage of matching planets
        const matchPercentage = matchingPlanets.length / recipe.astrologicalProfile.rulingPlanets.length;
        
        // Calculate planetary match score based on percentage
        planetaryMatch = 0.5 + (matchPercentage * 0.5);
        
        // Bonus if the sun is active and matches one of the ruling planets
        if (astroState.activePlanets.includes('sun') && 
            recipe.astrologicalProfile.rulingPlanets.includes('sun')) {
          planetaryMatch = Math.min(1.0, planetaryMatch + 0.1);
        }
      }
    }
    
    // Calculate modality match (15% of total)
    let modalityMatch = 0.5; // Start with neutral value
    // Check for dominantModality as optional property
    const dominantModality = (astroState as any).dominantModality;
    const recipeModality = (recipe.astrologicalProfile as any).modality;
    if (dominantModality && recipeModality) {
      if (recipeModality === dominantModality) {
        modalityMatch = 0.9; // Strong match
      } else {
        // Different modalities aren't incompatible, just less harmonious
        modalityMatch = 0.6;
      }
    }
    
    // Calculate seasonal alignment (5% of total)
    let seasonalMatch = 0.5; // Start with neutral value
    const currentSeason = (astroState as any).currentSeason;
    if (currentSeason && recipe.seasonalRecommendation) {
      // Check if recipe is recommended for current season
      const recipeSeasons = recipe.seasonalRecommendation || [];
      if (recipeSeasons.includes(currentSeason)) {
        seasonalMatch = 1.0; // Perfect seasonal match
      } else {
        seasonalMatch = 0.3; // Not ideal for this season
      }
    }
    
    // Weight each component appropriately
    const weights = {
      elementZodiac: 0.30,
      lunar: 0.20,
      planetary: 0.30,
      modality: 0.15,
      seasonal: 0.05
    };
    
    // Calculate final weighted score
    const finalScore = (
      elementZodiacMatch * weights.elementZodiac +
      lunarMatch * weights.lunar +
      planetaryMatch * weights.planetary +
      modalityMatch * weights.modality +
      seasonalMatch * weights.seasonal
    );
    
    // Ensure score is within 0-1 range
    return Math.min(1.0, Math.max(0.0, finalScore));
  }
  
  private normalizeLunarPhaseName(lunarPhase: string): string {
    // Convert lunar phase names to match the format in recipe data
    const phaseMap: Record<string, string> = {
      'newMoon': 'New Moon',
      'waxingCrescent': 'Waxing Crescent',
      'firstQuarter': 'First Quarter',
      'waxingGibbous': 'Waxing Gibbous',
      'fullMoon': 'Full Moon',
      'waningGibbous': 'Waning Gibbous',
      'lastQuarter': 'Last Quarter',
      'waningCrescent': 'Waning Crescent'
    };
    
    return phaseMap[lunarPhase] || lunarPhase;
  }
  
  private getLunarPhaseElement(lunarPhase: string): string | null {
    // Map lunar phases to elemental energies
    const phaseElementMap: Record<string, string> = {
      'newMoon': 'Earth',
      'waxingCrescent': 'Water',
      'firstQuarter': 'Air',
      'waxingGibbous': 'Fire',
      'fullMoon': 'Fire',
      'waningGibbous': 'Air',
      'lastQuarter': 'Water',
      'waningCrescent': 'Earth'
    };
    
    return phaseElementMap[lunarPhase] || null;
  }

  private zodiacMatch(recipe: RecipeElementalMapping, astroState: AstrologicalState): number {
    if (!recipe?.astrologicalProfile?.favorableZodiac || !astroState.sunSign) {
      return 0.5; // Default middle score
    }
    
    const recipeZodiac = recipe.astrologicalProfile.favorableZodiac.map(sign => sign.toLowerCase());
    const userZodiac = astroState.sunSign.toLowerCase();
    
    // Direct match
    if (recipeZodiac.includes(userZodiac)) {
      return 0.9;
    }
    
    // Element-based partial match
    const zodiacElementMap: Record<string, string> = {
      'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
      'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
      'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
      'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
    };
    
    const userElement = zodiacElementMap[userZodiac];
    
    // Check if any of the recipe's favorable zodiac signs share the same element
    const elementMatch = recipeZodiac.some(sign => zodiacElementMap[sign] === userElement);
    
    return elementMatch ? 0.7 : 0.4;
  }
}