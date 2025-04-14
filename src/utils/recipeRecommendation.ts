import type { Recipe } from '@/types/recipe';
import type { AstrologicalState, Element } from '@/types/alchemy';
import { getTimeFactors } from '@/types/time';
import type { TimeFactors } from '@/types/time';
import { 
  getPlanetaryElementalInfluence, 
  getZodiacElementalInfluence, 
  calculateElementalCompatibility,
  calculateDominantElement,
  calculateElementalProfile
} from '@/utils/astrologyUtils';

// Interface for storing recommendation scores with explanation
export interface RecommendationScore {
  recipe: Recipe;
  score: number;
  reasons: string[];
}

// Interface for recommendations with human-readable explanations
export interface RecommendationExplanation {
  recipe: Recipe;
  explanation: string;
}

/**
 * Get recommended recipes based on astrological state and time factors
 * 
 * @param recipes List of all available recipes
 * @param astrologicalState Current astrological state
 * @param limit Maximum number of recommendations (default: 3)
 * @returns Array of recommended recipes with explanations
 */
export function getRecommendedRecipes(
  recipes: Recipe[],
  astrologicalState: AstrologicalState,
  limit = 3
): RecommendationExplanation[] {
  // Get current time factors to enhance recipe scoring
  const timeFactors = getTimeFactors();
  
  // Score each recipe
  const scoredRecipes: RecommendationScore[] = recipes.map(recipe => {
    const { score, reasons } = scoreRecipe(recipe, astrologicalState, timeFactors);
    return {
      recipe,
      score,
      reasons
    };
  });
  
  // Sort recipes by score (descending)
  const sortedRecipes = scoredRecipes.sort((a, b) => b.score - a.score);
  
  // Take top N recipes
  const topRecipes = sortedRecipes.slice(0, limit);
  
  // Generate human-readable explanations
  return topRecipes.map(scoredRecipe => ({
    recipe: scoredRecipe.recipe,
    explanation: generateExplanation(scoredRecipe)
  }));
}

/**
 * Score a recipe based on astrological state and time factors
 * 
 * @param recipe The recipe to score
 * @param astrologicalState Current astrological state
 * @param timeFactors Current time factors
 * @returns Score and reasons for the score
 */
function scoreRecipe(
  recipe: Recipe, 
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors
): { score: number; reasons: string[] } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Time of day suitability
  const timeOfDay = timeFactors.timeOfDay;
  if (recipe.mealType) {
    const mealTypes = Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];
    
    if (timeOfDay === 'Morning' && mealTypes.some(type => type.toLowerCase().includes('breakfast'))) {
      score += 15;
      reasons.push(`Perfect for breakfast time`);
    } else if (timeOfDay === 'Afternoon' && mealTypes.some(type => type.toLowerCase().includes('lunch'))) {
      score += 15;
      reasons.push(`Ideal for lunch time`);
    } else if (timeOfDay === 'Evening' && mealTypes.some(type => type.toLowerCase().includes('dinner'))) {
      score += 15;
      reasons.push(`Great for dinner time`);
    }
  }

  // Season appropriateness
  const currentSeason = timeFactors.season;
  if (recipe.season) {
    const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
    
    if (seasons.some(season => season.toLowerCase() === currentSeason.toLowerCase())) {
      score += 15;
      reasons.push(`Perfect for ${currentSeason}`);
    }
  }

  // Planetary Day influence - NEW FEATURE
  const planetaryDay = timeFactors.planetaryDay;
  if (recipe.planetaryInfluences && recipe.planetaryInfluences.favorable) {
    const favorablePlanets = recipe.planetaryInfluences.favorable;
    
    if (favorablePlanets.includes(planetaryDay.planet)) {
      score += 10;
      reasons.push(`Enhanced by today's planetary ruler (${planetaryDay.planet})`);
    }
  }

  // Planetary Hour influence - NEW FEATURE
  const planetaryHour = timeFactors.planetaryHour;
  if (recipe.planetaryInfluences && recipe.planetaryInfluences.favorable) {
    const favorablePlanets = recipe.planetaryInfluences.favorable;
    
    if (favorablePlanets.includes(planetaryHour.planet)) {
      score += 8;
      reasons.push(`Boosted by current planetary hour (${planetaryHour.planet})`);
    }
  }
  
  // Unfavorable planetary influences - NEW FEATURE
  if (recipe.planetaryInfluences && recipe.planetaryInfluences.unfavorable) {
    const unfavorablePlanets = recipe.planetaryInfluences.unfavorable;
    
    if (unfavorablePlanets.includes(planetaryDay.planet)) {
      score -= 10;
      reasons.push(`Challenged by today's planetary ruler (${planetaryDay.planet})`);
    }
    
    if (unfavorablePlanets.includes(planetaryHour.planet)) {
      score -= 8;
      reasons.push(`Hindered by current planetary hour (${planetaryHour.planet})`);
    }
  }

  // Zodiac sign alignment
  if (recipe.zodiacInfluences && recipe.zodiacInfluences.includes(astrologicalState.sunSign)) {
    score += 12;
    reasons.push(`Aligned with your sun sign (${astrologicalState.sunSign})`);
    
    // Add zodiac elemental influence check
    const sunSignElement = getZodiacElementalInfluence(astrologicalState.sunSign);
    if (recipe.elementalProperties && recipe.elementalProperties[sunSignElement] > 0.5) {
      score += 8;
      reasons.push(`Strong in ${sunSignElement} energy from your sun sign`);
    }
  }
  
  if (astrologicalState.moonSign && recipe.zodiacInfluences && recipe.zodiacInfluences.includes(astrologicalState.moonSign)) {
    score += 10;
    reasons.push(`Harmonious with your moon sign (${astrologicalState.moonSign})`);
    
    // Add zodiac elemental influence check for moon sign
    const moonSignElement = getZodiacElementalInfluence(astrologicalState.moonSign);
    if (recipe.elementalProperties && recipe.elementalProperties[moonSignElement] > 0.5) {
      score += 6;
      reasons.push(`Resonates with ${moonSignElement} energy from your moon sign`);
    }
  }

  // Lunar phase alignment
  if (recipe.lunarPhaseInfluences && recipe.lunarPhaseInfluences.includes(astrologicalState.lunarPhase)) {
    score += 10;
    reasons.push(`In sync with the current lunar phase (${astrologicalState.lunarPhase})`);
  }

  // Elemental affinities with recipe's properties
  if (recipe.elementalProperties && astrologicalState.dominantElement) {
    const dominantElement = astrologicalState.dominantElement;
    const elementalValue = recipe.elementalProperties[dominantElement] || 0;
    
    if (elementalValue > 0.4) {
      const points = Math.floor(elementalValue * 20);
      score += points;
      reasons.push(`Strong in ${dominantElement} energy (${points} points)`);
    }
  }
  
  // Enhanced elemental compatibility calculation using new utilities
  if (recipe.elementalProperties) {
    // Calculate dominant element based on current time factors
    const calculatedDominantElement = calculateDominantElement(astrologicalState, timeFactors);
    
    // Get recipe's dominant element
    const recipeElements = Object.entries(recipe.elementalProperties)
      .sort((a, b) => b[1] - a[1])
      .map(([element]) => element as Element);
    
    const recipeDominantElement = recipeElements[0];
    
    // Calculate compatibility between recipe's element and current dominant element
    const compatibilityScore = calculateElementalCompatibility(
      recipeDominantElement, 
      calculatedDominantElement
    );
    
    const points = Math.floor(compatibilityScore * 15);
    score += points;
    
    if (compatibilityScore > 0.7) {
      reasons.push(`Excellent elemental compatibility between recipe (${recipeDominantElement}) and current influences (${calculatedDominantElement})`);
    } else if (compatibilityScore > 0.4) {
      reasons.push(`Good elemental compatibility between recipe and current influences`);
    }
  }
  
  // Preparation time consideration - adjust score based on time available in planetary hour
  if (recipe.timeToMake) {
    let prepTime = 0;
    
    // Extract preparation time in minutes from the recipe
    const timeMatch = recipe.timeToMake.match(/(\d+)\s*min/);
    if (timeMatch) {
      prepTime = parseInt(timeMatch[1], 10);
    } else {
      // If there's no explicit "min" pattern, try to parse just a number
      const justNumberMatch = recipe.timeToMake.match(/(\d+)/);
      if (justNumberMatch) {
        prepTime = parseInt(justNumberMatch[1], 10);
      }
    }
    
    // Calculate time remaining in current planetary hour (approximation)
    const now = new Date();
    const minutes = now.getMinutes();
    const minutesRemaining = 60 - minutes;
    
    // Adjust score based on whether recipe can be completed in current planetary hour
    if (prepTime <= minutesRemaining) {
      score += 5;
      reasons.push(`Can be prepared within the current planetary hour`);
    } else if (prepTime > 120) {
      score -= 5;
      reasons.push(`Lengthy preparation time`);
    }
  }

  // Get elemental influences from planetary day and hour
  const planetaryDayElement = getPlanetaryElementalInfluence(planetaryDay.planet);
  const planetaryHourElement = getPlanetaryElementalInfluence(planetaryHour.planet);
  
  // Calculate current elemental profile based on astrological state and time factors
  const currentElementalProfile = calculateElementalProfile(astrologicalState, timeFactors);
  
  if (recipe.elementalProperties) {
    // Calculate overall elemental resonance score
    let resonanceScore = 0;
    let totalWeight = 0;
    
    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as Element[]) {
      const recipeValue = recipe.elementalProperties[element] || 0;
      const profileValue = currentElementalProfile[element];
      const weight = profileValue; // Weight by the strength of the element in current profile
      
      // Higher score for matching strong elements
      if (recipeValue > 0.3 && profileValue > 0.3) {
        resonanceScore += weight * 2;
      } else {
        resonanceScore += weight * (1 - Math.abs(recipeValue - profileValue));
      }
      
      totalWeight += weight;
    }
    
    // Normalize resonance score (0-1)
    const normalizedResonance = totalWeight > 0 ? resonanceScore / totalWeight : 0;
    
    // Add points based on resonance
    const resonancePoints = Math.floor(normalizedResonance * 15);
    score += resonancePoints;
    
    if (normalizedResonance > 0.7) {
      reasons.push(`Exceptional elemental resonance with current cosmic conditions (${resonancePoints} points)`);
    } else if (normalizedResonance > 0.5) {
      reasons.push(`Good elemental harmony with current cosmic conditions`);
    }
    
    // Bonus for recipe's dominant element matching planetary influences
    const recipeElements = Object.entries(recipe.elementalProperties)
      .sort((a, b) => b[1] - a[1])
      .map(([element]) => element);
    
    if (recipeElements[0] === planetaryDayElement) {
      score += 8;
      reasons.push(`Recipe's dominant element (${planetaryDayElement}) matches today's planetary influence`);
    }
    
    if (recipeElements[0] === planetaryHourElement) {
      score += 6;
      reasons.push(`Recipe's dominant element (${planetaryHourElement}) resonates with current planetary hour`);
    }
  }

  return { score, reasons };
}

/**
 * Generate a human-readable explanation for why a recipe is recommended
 * 
 * @param scoredRecipe The scored recipe with reasons
 * @returns A human-readable explanation
 */
function generateExplanation(scoredRecipe: RecommendationScore): string {
  const { recipe, score, reasons } = scoredRecipe;
  
  // Start with a positive introduction based on the score
  let explanation = '';
  
  if (score >= 90) {
    explanation = `${recipe.name} is a perfect choice right now! `;
  } else if (score >= 75) {
    explanation = `${recipe.name} is highly recommended at this time. `;
  } else if (score >= 60) {
    explanation = `${recipe.name} would be a good option now. `;
  } else {
    explanation = `${recipe.name} is worth considering. `;
  }
  
  // Add the top 3 reasons (or all if less than 3)
  const topReasons = reasons.slice(0, 3);
  
  if (topReasons.length > 0) {
    explanation += topReasons.join('. ') + '.';
  }
  
  return explanation;
} 