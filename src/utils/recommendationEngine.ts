import { AstrologicalState, Element, PlanetName, ZodiacSign, Planet } from '../types/alchemy';
import { Season, TimeFactors, WeekDay, getTimeFactors } from '../types/time';
import { Recipe } from '../types/recipe';

// Define MealType since it's not exported from time.ts
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Anytime';

// Elemental affinities - which elements go well together
const ELEMENTAL_AFFINITIES: Record<Element, Element[]> = {
  Fire: ['Fire', 'Air'],
  Earth: ['Earth', 'Water'],
  Air: ['Air', 'Fire'],
  Water: ['Water', 'Earth'],
  // Note: Four element system only - no Aether
};

// Planetary affinities for cuisines
const PLANET_CUISINE_AFFINITIES: Record<PlanetName, string[]> = {
  Sun: ['Mediterranean', 'Italian', 'Spanish', 'Greek'],
  Moon: ['Asian', 'Japanese', 'Seafood'],
  Mercury: ['Fusion', 'Eclectic', 'Experimental'],
  Venus: ['French', 'Desserts', 'Romantic'],
  Mars: ['Spicy', 'Mexican', 'Indian', 'Thai'],
  Jupiter: ['American', 'German', 'Hearty', 'Rich'],
  Saturn: ['Traditional', 'Fermented', 'Preserved', 'Slow-cooked'],
  // Add missing planets to complete the Record<PlanetName, string[]>
  Uranus: ['Innovative', 'Unusual', 'Future-forward', 'Molecular'],
  Neptune: ['Ethereal', 'Mystical', 'Fluid', 'Oceanic'],
  Pluto: ['Transformative', 'Intense', 'Powerful', 'Regenerative'],
  Ascendant: ['Personal', 'Identity', 'Self-expression', 'Signature']
};

// Season to cuisine mapping
const SEASONAL_CUISINE_AFFINITIES: Record<Season, string[]> = {
  Spring: ['Mediterranean', 'Asian', 'Light', 'Fresh'],
  Summer: ['Mexican', 'Greek', 'Indian', 'BBQ', 'Salads'],
  Fall: ['American', 'German', 'Hearty', 'Spiced'],
  Winter: ['Slow-cooked', 'Soup', 'Stew', 'Rich', 'Warming']
};

// Weekday to cuisine mapping
const WEEKDAY_CUISINE_AFFINITIES: Record<WeekDay, string[]> = {
  Sunday: ['Traditional', 'Roast', 'Family Style'],
  Monday: ['Simple', 'Comfort', 'Easy'],
  Tuesday: ['Spicy', 'Quick', 'Energetic'],
  Wednesday: ['Variety', 'Fusion', 'Creative'],
  Thursday: ['Hearty', 'Abundant', 'Social'],
  Friday: ['Festive', 'Indulgent', 'Special'],
  Saturday: ['Complex', 'Experimental', 'Project Cooking']
};

// Time of day to meal type mapping is already in time.ts

// Calculate elemental affinity score
function calculateElementalScore(recipeElement: Element, userElement: Element): number {
  if (recipeElement === userElement) return 1;
  // Four element system - no Aether handling needed
  if (ELEMENTAL_AFFINITIES[userElement].includes(recipeElement)) return 0.7;
  return 0.3;
}

// Calculate planetary affinity score
function calculatePlanetaryScore(recipe: Recipe, planetName: PlanetName): number {
  const cuisineAffinity = PLANET_CUISINE_AFFINITIES[planetName];
  if (cuisineAffinity.some(cuisine => recipe.tags.includes(cuisine))) {
    return 1;
  }
  return 0.3;
}

// Calculate seasonal affinity score
function calculateSeasonalScore(recipe: Recipe, season: Season): number {
  const seasonalAffinity = SEASONAL_CUISINE_AFFINITIES[season];
  if (seasonalAffinity.some(tag => recipe.tags.includes(tag))) {
    return 1;
  }
  
  // Check if recipe explicitly mentions seasons
  if (recipe.tags.includes(season)) {
    return 1;
  }
  
  return 0.5;
}

// Calculate weekday affinity score
function calculateWeekdayScore(recipe: Recipe, day: WeekDay): number {
  const dayAffinity = WEEKDAY_CUISINE_AFFINITIES[day];
  if (dayAffinity.some(tag => recipe.tags.includes(tag))) {
    return 1;
  }
  return 0.5;
}

// Calculate meal type appropriateness
function calculateMealTypeScore(recipe: Recipe, mealType: MealType): number {
  if (recipe.mealType === mealType || recipe.mealType === 'Anytime') {
    return 1;
  }
  // Some meal types can work for others
  if (mealType === 'Lunch' && recipe.mealType === 'Dinner') return 0.7;
  if (mealType === 'Dinner' && recipe.mealType === 'Lunch') return 0.7;
  
  return 0.3;
}

// Calculate sun sign affinity - certain zodiac signs favor certain flavors/cuisines
function calculateZodiacScore(recipe: Recipe, sunSign: ZodiacSign): number {
  const zodiacAffinities: Record<ZodiacSign, string[]> = {
    'aries': ['Spicy', 'Bold', 'Quick'],
    'taurus': ['Rich', 'Indulgent', 'Traditional'],
    'gemini': ['Varied', 'Fusion', 'Surprising'],
    'cancer': ['Comfort', 'Home-style', 'Nurturing'],
    'leo': ['Luxurious', 'Showy', 'Bold'],
    'virgo': ['Healthy', 'Precise', 'Detailed'],
    'libra': ['Balanced', 'Beautiful', 'Elegant'],
    'scorpio': ['Intense', 'Complex', 'Powerful'],
    'sagittarius': ['Adventurous', 'Exotic', 'Foreign'],
    'capricorn': ['Traditional', 'Classic', 'Quality'],
    'aquarius': ['Unusual', 'Innovative', 'Unexpected'],
    'pisces': ['Ethereal', 'Delicate', 'Romantic']
  };
  
  const signAffinity = zodiacAffinities[sunSign];
  if (signAffinity.some(tag => recipe.tags.includes(tag))) {
    return 1;
  }
  return 0.5;
}

// Calculate total recommendation score
export function calculateRecommendationScore(
  recipe: Recipe, 
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors
): number {
  // Base score
  let score = 0;
  let factors = 0;
  
  // Elemental scores
  if (astrologicalState.dominantElement && recipe.element) {
    score += calculateElementalScore(recipe.element as any, astrologicalState.dominantElement as any) * 2;
    factors += 2;
  }
  
  // Planetary day score
  score += calculatePlanetaryScore(recipe, timeFactors.planetaryDay.planet) * 1.5;
  factors += 1.5;
  
  // Planetary hour score
  score += calculatePlanetaryScore(recipe, timeFactors.planetaryHour.planet);
  factors += 1;
  
  // Seasonal score
  score += calculateSeasonalScore(recipe, timeFactors.season) * 1.5;
  factors += 1.5;
  
  // Weekday score
  score += calculateWeekdayScore(recipe, timeFactors.planetaryDay.day);
  factors += 1;
  
  // Meal type score - Check if mealType exists in timeFactors
  if (timeFactors.mealType) {
    score += calculateMealTypeScore(recipe, timeFactors.mealType) * 2;
    factors += 2;
  }
  
  // Zodiac score
  if (astrologicalState.sunSign) {
    score += calculateZodiacScore(recipe, astrologicalState.sunSign);
    factors += 1;
  }
  
  // Normalize the score
  return score / factors;
}

// Get top recommended recipes
export function getRecommendedRecipes(
  recipes: Recipe[], 
  astrologicalState: AstrologicalState,
  count = 3,
  timeFactors: TimeFactors = getTimeFactors()
): Recipe[] {
  // Score all recipes
  const scoredRecipes = recipes.map(recipe => ({
    recipe,
    score: calculateRecommendationScore(recipe, astrologicalState, timeFactors)
  }));
  
  // Sort by score (highest first)
  scoredRecipes.sort((a, b) => b.score - a.score);
  
  // Return top N recipes
  return scoredRecipes.slice(0, count).map(item => item.recipe);
}

// Explain why a recipe was recommended
export function explainRecommendation(
  recipe: Recipe,
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors = getTimeFactors()
): string {
  const reasons: string[] = [];
  
  // Check elemental affinity
  if (astrologicalState.dominantElement && recipe.element) {
    const elementalScore = calculateElementalScore(recipe.element as any, astrologicalState.dominantElement as any);
    if (elementalScore > 0.6) {
      reasons.push(`The ${recipe.element} energy of this dish harmonizes with your ${astrologicalState.dominantElement} elemental influence.`);
    }
  }
  
  // Check planetary day connection
  const dayPlanetScore = calculatePlanetaryScore(recipe, timeFactors.planetaryDay.planet);
  if (dayPlanetScore > 0.6) {
    reasons.push(`This recipe resonates with ${timeFactors.planetaryDay.planet}, the ruling planet of ${timeFactors.planetaryDay.day}.`);
  }
  
  // Check meal type appropriateness
  if (timeFactors.mealType) {
    const mealScore = calculateMealTypeScore(recipe, timeFactors.mealType);
    if (mealScore > 0.6) {
      // Apply surgical type casting with variable extraction
      const mealTypeData = timeFactors.mealType as any;
      const timeOfDayData = timeFactors.timeOfDay as any;
      const mealTypeLower = mealTypeData?.toLowerCase?.() || timeFactors.mealType;
      const timeOfDayLower = timeOfDayData?.toLowerCase?.() || timeFactors.timeOfDay;
      
      reasons.push(`This is an ideal choice for ${mealTypeLower} during the ${timeOfDayLower}.`);
    }
  }
  
  // Check seasonal harmony
  const seasonScore = calculateSeasonalScore(recipe, timeFactors.season);
  if (seasonScore > 0.6) {
    reasons.push(`The ingredients and flavors are perfectly in tune with ${timeFactors.season}.`);
  }
  
  // Check zodiac connection
  if (astrologicalState.sunSign) {
    const zodiacScore = calculateZodiacScore(recipe, astrologicalState.sunSign);
    if (zodiacScore > 0.6) {
      reasons.push(`This dish appeals to your ${astrologicalState.sunSign} nature.`);
    }
  }
  
  // If we have dominant planets - safe property access
  if (astrologicalState.dominantPlanets && astrologicalState.dominantPlanets.length > 0) {
    for (const dominantPlanet of astrologicalState.dominantPlanets) {
      const planetName = (dominantPlanet as any)?.name || dominantPlanet;
      const planetScore = calculatePlanetaryScore(recipe, planetName);
      if (planetScore > 0.6) {
        reasons.push(`The influence of ${planetName} in your chart is complemented by this recipe.`);
        break; // Just mention one planet to avoid repetition
      }
    }
  }
  
  if (reasons.length === 0) {
    return "This recipe was selected based on a combination of factors including the current time, astrological influences, and seasonal considerations.";
  }
  
  return reasons.join(' ');
} 