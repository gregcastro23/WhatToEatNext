import { Recipe, AstrologicalState, Element, ZodiacSign, PlanetName } from '../types/alchemy';
import { TimeFactors, WeekDay, Season } from '../types/time';
import { MoonPhaseWithSpaces } from '../types/shared';
import { getTimeFactors } from './timeUtils';
import { isObject, hasProperty, isArray, isString } from '../types/common';

// Use the standardized MoonPhase type from shared.ts
export type { MoonPhaseWithSpaces as MoonPhase };

// Define MealType since it's not exported from time.ts
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Anytime';

// Define dietary restrictions type
export type DietaryRestriction = 
  | 'Vegetarian' 
  | 'Vegan' 
  | 'GlutenFree' 
  | 'DairyFree' 
  | 'NutFree' 
  | 'LowCarb'
  | 'Keto'
  | 'Paleo'
  | 'Pescatarian';

// Elemental affinities - all elements work together with no opposites
// Each element has highest affinity with itself, but all combinations are harmonious
const ELEMENTAL_AFFINITIES: Record<Element, Element[]> = {
  Fire: ['Fire', 'Air', 'Water', 'Earth'],
  Earth: ['Earth', 'Fire', 'Water', 'Air'],
  Air: ['Air', 'Fire', 'Earth', 'Water'],
  Water: ['Water', 'Earth', 'Fire', 'Air']
};

// Planetary affinities for cuisines
const PLANET_CUISINE_AFFINITIES: Partial<Record<PlanetName, string[]>> = {
  sun: ['Italian', 'Greek', 'Spanish', 'Mexican', 'Lebanese'],
  moon: ['Chinese', 'Japanese', 'Korean', 'Vietnamese', 'Thai'],
  mercury: ['Thai', 'Indian', 'Moroccan', 'Lebanese', 'Fusion'],
  venus: ['French', 'Italian', 'Belgian', 'Austrian', 'Dessert'],
  mars: ['Mexican', 'Turkish', 'Spanish', 'Indian', 'Spicy'],
  jupiter: ['German', 'American', 'Greek', 'Brazilian', 'BBQ'],
  saturn: ['Russian', 'Polish', 'Jewish', 'Hungarian', 'Traditional'],
  uranus: ['Fusion', 'Molecular', 'Experimental', 'Modern', 'Unexpected'],
  neptune: ['Seafood', 'Mediterranean', 'Ethereal', 'Delicate', 'Romantic'],
  pluto: ['Fermented', 'Aged', 'Smoked', 'Preserved', 'Intense']
};

// Season to cuisine mapping
const SEASONAL_CUISINE_AFFINITIES: Record<Season, string[]> = {
  Spring: ['Mediterranean', 'Asian', 'Light', 'Fresh', 'Green', 'Bright'],
  Summer: ['Mexican', 'Greek', 'Indian', 'BBQ', 'Salads', 'Grilled', 'Cold'],
  Fall: ['American', 'German', 'Hearty', 'Spiced', 'Earthy', 'Mushroom', 'Squash'],
  Winter: ['Slow-cooked', 'Soup', 'Stew', 'Rich', 'Warming', 'Baked', 'Root vegetables']
};

// Weekday to cuisine mapping
const WEEKDAY_CUISINE_AFFINITIES: Record<WeekDay, string[]> = {
  sunday: ['Traditional', 'Roast', 'Family Style', 'Brunch', 'Slow'],
  Monday: ['Simple', 'Comfort', 'Easy', 'Quick', 'Batch cooking'],
  Tuesday: ['Spicy', 'Quick', 'Energetic', 'Vibrant', 'New'],
  Wednesday: ['Variety', 'Fusion', 'Creative', 'International', 'Midweek'],
  Thursday: ['Hearty', 'Abundant', 'Social', 'Comfort', 'Flavorful'],
  Friday: ['Festive', 'Indulgent', 'Special', 'Takeout-inspired', 'Treats'],
  Saturday: ['Complex', 'Experimental', 'Project Cooking', 'Elaborate', 'Special']
};

// Moon phase cuisine affinities
const MOON_PHASE_CUISINE_AFFINITIES: Record<MoonPhaseWithSpaces, string[]> = {
  'New Moon': ['Light', 'Fresh', 'Cleansing', 'Minimal', 'Sprouted'],
  'Waxing Crescent': ['Fresh', 'Growing', 'Vibrant', 'Energetic', 'Salads'],
  'First Quarter': ['Balanced', 'Hearty', 'Protein-rich', 'Nutritious', 'Growth'],
  'Waxing Gibbous': ['Rich', 'Abundant', 'Hearty', 'Celebration', 'Feast'],
  'Full Moon': ['Culmination', 'Indulgent', 'Special', 'Luxurious', 'Festive'],
  'Waning Gibbous': ['Preserving', 'Fermented', 'Pickled', 'Probiotics', 'Healing'],
  'Last Quarter': ['Balance', 'Moderation', 'Simplicity', 'Wholesome', 'Nourishing'],
  'Waning Crescent': ['Minimal', 'Fasting', 'Cleansing', 'Light', 'Renewal']
};

// Flavor affinities for zodiac signs
const ZODIAC_FLAVOR_AFFINITIES: Record<ZodiacSign, string[]> = {
  aries: ['Spicy', 'Bold', 'Quick', 'Grilled', 'High-heat', 'Intense'],
  taurus: ['Rich', 'Indulgent', 'Traditional', 'Earthy', 'Sweet', 'Comforting'],
  gemini: ['Varied', 'Fusion', 'Surprising', 'Complex', 'Layered', 'Contrasting'],
  cancer: ['Comfort', 'Home-style', 'Nurturing', 'Nostalgic', 'Creamy', 'Soothing'],
  leo: ['Luxurious', 'Showy', 'Bold', 'Impressive', 'Bright', 'Colorful'],
  virgo: ['Healthy', 'Precise', 'Detailed', 'Pure', 'Fresh', 'Refined'],
  libra: ['Balanced', 'Beautiful', 'Elegant', 'Harmonious', 'Sweet-savory', 'Artful'],
  scorpio: ['Intense', 'Complex', 'Powerful', 'Fermented', 'Mysterious', 'Deep'],
  sagittarius: ['Adventurous', 'Exotic', 'Foreign', 'Spiced', 'Global', 'Expansive'],
  capricorn: ['Traditional', 'Classic', 'Quality', 'Aged', 'Structured', 'Reliable'],
  aquarius: ['Unusual', 'Innovative', 'Unexpected', 'Modern', 'Progressive', 'Unique'],
  pisces: ['Ethereal', 'Delicate', 'Romantic', 'Mystical', 'Seafood', 'Subtle']
};

// Cache for storing computed scores to improve performance
const scoreCache = new Map<string, number>();

/**
 * Clears the recommendation score cache
 */
export function clearScoreCache(): void {
  scoreCache.clear();
}

// Update calculateElementalScore to reflect our elemental principles
function calculateElementalScore(recipeElement: Element, userElement: Element): number {
  if (recipeElement === userElement) return 0.9; // Same element has highest compatibility
  return 0.7; // All different element combinations have good compatibility
}

// Calculate planetary affinity score
function calculatePlanetaryScore(recipe: Recipe, planetName: PlanetName): number {
  const cuisineAffinity = PLANET_CUISINE_AFFINITIES[planetName];
  
  if (!cuisineAffinity) return 0.3;
  
  if (isObject(recipe) && hasProperty(recipe, 'tags') && isArray(recipe.tags)) {
    // Count how many matching tags we have
    const matchCount = cuisineAffinity.filter(cuisine => 
      recipe.tags.includes(cuisine)
    ).length;
    
    // Graduated scoring based on number of matches
    if (matchCount > 2) return 1;
    if (matchCount > 0) return 0.7;
  }
  
  return 0.3;
}

// Calculate seasonal affinity score
function calculateSeasonalScore(recipe: Recipe, season: Season): number {
  const seasonalAffinity = SEASONAL_CUISINE_AFFINITIES[season];
  
  if (isObject(recipe) && hasProperty(recipe, 'tags') && isArray(recipe.tags)) {
    // Count how many matching tags we have
    const matchCount = seasonalAffinity.filter(tag => 
      recipe.tags.includes(tag)
    ).length;
    
    // Check if recipe explicitly mentions seasons
    if (recipe.tags.includes(season)) {
      return 1;
    }
    
    // Graduated scoring based on number of matches
    if (matchCount > 2) return 1;
    if (matchCount > 0) return 0.7;
  }
  
  return 0.4; // Slightly higher base score than before
}

// Calculate weekday affinity score
function calculateWeekdayScore(recipe: Recipe, day: WeekDay): number {
  const dayAffinity = WEEKDAY_CUISINE_AFFINITIES[day];
  
  if (isObject(recipe) && hasProperty(recipe, 'tags') && isArray(recipe.tags)) {
    // Count how many matching tags we have
    const matchCount = dayAffinity.filter(tag => 
      recipe.tags.includes(tag)
    ).length;
    
    // Graduated scoring based on number of matches
    if (matchCount > 2) return 1;
    if (matchCount > 0) return 0.7;
  }
  
  return 0.4; // Slightly higher base score than before
}

// Calculate moon phase affinity score
function calculateMoonPhaseScore(recipe: Recipe, moonPhase: MoonPhaseWithSpaces): number {
  const moonPhaseAffinity = MOON_PHASE_CUISINE_AFFINITIES[moonPhase];
  
  if (isObject(recipe) && hasProperty(recipe, 'tags') && isArray(recipe.tags)) {
    // Count how many matching tags we have
    const matchCount = moonPhaseAffinity.filter(tag => 
      recipe.tags.includes(tag)
    ).length;
    
    // Graduated scoring based on number of matches
    if (matchCount > 2) return 1;
    if (matchCount > 0) return 0.7;
  }
  
  return 0.4;
}

// Calculate meal type appropriateness with improved algorithm
function calculateMealTypeScore(recipe: Recipe, mealType: MealType): number {
  if (isObject(recipe) && hasProperty(recipe, 'mealType') && isString(recipe.mealType)) {
    if (recipe.mealType === mealType || recipe.mealType === 'Anytime') {
      return 1;
    }
    
    // Enhanced compatibility scoring - fix type safety issues
    const mealTypeCompatibility: Record<MealType, Partial<Record<MealType, number>>> = {
      'Breakfast': { 'Lunch': 0.3, 'Dinner': 0.1, 'Snack': 0.6, 'Anytime': 1 },
      'Lunch': { 'Breakfast': 0.3, 'Dinner': 0.7, 'Snack': 0.5, 'Anytime': 1 },
      'Dinner': { 'Breakfast': 0.1, 'Lunch': 0.7, 'Snack': 0.3, 'Anytime': 1 },
      'Snack': { 'Breakfast': 0.6, 'Lunch': 0.5, 'Dinner': 0.3, 'Anytime': 1 },
      'Anytime': { 'Breakfast': 1, 'Lunch': 1, 'Dinner': 1, 'Snack': 1 }
    };
    
    const recipeMealType = recipe.mealType as MealType;
    return mealTypeCompatibility[mealType][recipeMealType] || 0.2;
  }
  
  return 0.2;
}

// Calculate sun sign affinity - certain zodiac signs favor certain flavors/cuisines
function calculateZodiacScore(recipe: Recipe, sunSign: ZodiacSign): number {
  const signAffinity = ZODIAC_FLAVOR_AFFINITIES[sunSign];
  
  if (isObject(recipe) && hasProperty(recipe, 'tags') && isArray(recipe.tags)) {
    // Count how many matching tags we have
    const matchCount = signAffinity.filter(tag => 
      recipe.tags.includes(tag)
    ).length;
    
    // Graduated scoring based on number of matches
    if (matchCount > 2) return 1;
    if (matchCount > 0) return 0.7;
  }
  
  return 0.4; // Slightly higher base score than before
}

// Check if a recipe meets dietary restrictions
function meetsRestrictions(recipe: Recipe, restrictions: DietaryRestriction[]): boolean {
  if (!restrictions || restrictions.length === 0) return true;
  
  try {
    // Check if dietaryInfo exists and is an array
    if (!isObject(recipe) || 
        !hasProperty(recipe, 'dietaryInfo') || 
        !Array.isArray(recipe.dietaryInfo)) {
      return false;
    }
    
    // Convert to string array safely
    const dietaryInfo = recipe.dietaryInfo as unknown as string[];
    
    // Check if all restrictions are met
    for (const restriction of restrictions) {
      if (!dietaryInfo.includes(restriction)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    // If any error occurs during checking, consider it as not meeting restrictions
    console.error('Error checking dietary restrictions:', error);
    return false;
  }
}

// Calculate total recommendation score with caching
export function calculateRecommendationScore(
  recipe: Recipe, 
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors,
  dietaryRestrictions: DietaryRestriction[] = []
): number {
  // Create a cache key
  const cacheKey = `${recipe.id}-${JSON.stringify(astrologicalState)}-${JSON.stringify(timeFactors)}-${dietaryRestrictions.join(',')}`;
  
  // Check cache first
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey) as number;
  }
  
  // Check dietary restrictions - if not met, return 0 immediately
  if (!meetsRestrictions(recipe, dietaryRestrictions)) {
    scoreCache.set(cacheKey, 0);
    return 0;
  }
  
  // Base score
  let score = 0;
  let factors = 0;
  
  // Elemental scores
  if (isObject(astrologicalState) && hasProperty(astrologicalState, 'dominantElement') &&
      isObject(recipe) && hasProperty(recipe, 'element')) {
    score += calculateElementalScore(recipe.element as Element, astrologicalState.dominantElement as Element) * 2;
    factors += 2;
  }
  
  // Planetary day score
  if (isObject(timeFactors) && 
      hasProperty(timeFactors, 'planetaryDay') && 
      isObject(timeFactors.planetaryDay) &&
      hasProperty(timeFactors.planetaryDay, 'planet')) {
    score += calculatePlanetaryScore(recipe, timeFactors.planetaryDay.planet as PlanetName) * 1.5;
    factors += 1.5;
  }
  
  // Planetary hour score
  if (isObject(timeFactors) && 
      hasProperty(timeFactors, 'planetaryHour') && 
      isObject(timeFactors.planetaryHour) &&
      hasProperty(timeFactors.planetaryHour, 'planet')) {
    score += calculatePlanetaryScore(recipe, timeFactors.planetaryHour.planet as PlanetName);
    factors += 1;
  }
  
  // Moon phase score
  if (isObject(astrologicalState) && 
      hasProperty(astrologicalState, 'moonPhase') &&
      isString(astrologicalState.moonPhase)) {
    score += calculateMoonPhaseScore(recipe, astrologicalState.moonPhase as MoonPhaseWithSpaces) * 1.3;
    factors += 1.3;
  }
  
  // Seasonal score
  if (isObject(timeFactors) && hasProperty(timeFactors, 'season')) {
    score += calculateSeasonalScore(recipe, timeFactors.season as Season) * 1.5;
    factors += 1.5;
  }
  
  // Weekday score
  if (isObject(timeFactors) && 
      hasProperty(timeFactors, 'planetaryDay') && 
      isObject(timeFactors.planetaryDay) &&
      hasProperty(timeFactors.planetaryDay, 'day')) {
    score += calculateWeekdayScore(recipe, timeFactors.planetaryDay.day as WeekDay);
    factors += 1;
  }
  
  // Meal type score - Check if mealType exists in timeFactors
  if (isObject(timeFactors) && hasProperty(timeFactors, 'mealType')) {
    score += calculateMealTypeScore(recipe, timeFactors.mealType as MealType) * 2;
    factors += 2;
  }
  
  // Zodiac score
  if (isObject(astrologicalState) && hasProperty(astrologicalState, 'sunSign')) {
    score += calculateZodiacScore(recipe, astrologicalState.sunSign as ZodiacSign);
    factors += 1;
  }
  
  // Normalize the score
  const finalScore = score / factors;
  
  // Store in cache
  scoreCache.set(cacheKey, finalScore);
  
  return finalScore;
}

// Get top recommended recipes with dietary restrictions support
export function getRecommendedRecipes(
  recipes: Recipe[], 
  astrologicalState: AstrologicalState,
  count = 3,
  timeFactors: TimeFactors = getTimeFactors(),
  dietaryRestrictions: DietaryRestriction[] = []
): Recipe[] {
  // Score all recipes
  const scoredRecipes = recipes.map(recipe => ({
    recipe,
    score: calculateRecommendationScore(recipe, astrologicalState, timeFactors, dietaryRestrictions)
  }));
  
  // Filter out recipes with zero score (didn't meet dietary restrictions)
  const validRecipes = scoredRecipes.filter(item => item.score > 0);
  
  // Sort by score (highest first)
  validRecipes.sort((a, b) => b.score - a.score);
  
  // Return top N recipes
  return validRecipes.slice(0, count).map(item => item.recipe);
}

// Explain why a recipe was recommended with enhanced detail
export function explainRecommendation(
  recipe: Recipe,
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors = getTimeFactors(),
  dietaryRestrictions: DietaryRestriction[] = []
): string {
  const reasons: string[] = [];
  
  // Check dietary compatibility
  if (dietaryRestrictions.length > 0 && isObject(recipe) && 
      hasProperty(recipe, 'dietaryInfo') && isArray(recipe.dietaryInfo)) {
    // Type assertion to ensure TypeScript knows dietaryInfo is an array of strings
    const dietaryInfo = recipe.dietaryInfo as string[];
    const metRestrictions = dietaryRestrictions.filter(r => dietaryInfo.includes(r));
    if (metRestrictions.length > 0) {
      reasons.push(`This recipe satisfies your ${metRestrictions.join(', ')} dietary preferences.`);
    }
  }
  
  // Check elemental affinity
  if (isObject(astrologicalState) && hasProperty(astrologicalState, 'dominantElement') &&
      isObject(recipe) && hasProperty(recipe, 'element')) {
    const elementalScore = calculateElementalScore(recipe.element as Element, astrologicalState.dominantElement as Element);
    if (elementalScore > 0.6) {
      reasons.push(`The ${recipe.element} energy of this dish harmonizes with your ${astrologicalState.dominantElement} elemental influence.`);
    }
  }
  
  // Check planetary day connection
  if (isObject(timeFactors) && 
      hasProperty(timeFactors, 'planetaryDay') && 
      isObject(timeFactors.planetaryDay) &&
      hasProperty(timeFactors.planetaryDay, 'planet')) {
    const dayPlanetScore = calculatePlanetaryScore(recipe, timeFactors.planetaryDay.planet as PlanetName);
    if (dayPlanetScore > 0.6) {
      reasons.push(`This recipe resonates with ${timeFactors.planetaryDay.planet}, the ruling planet of ${timeFactors.planetaryDay.day}.`);
    }
  }
  
  // Check moon phase connection
  if (isObject(astrologicalState) && 
      hasProperty(astrologicalState, 'moonPhase') &&
      isString(astrologicalState.moonPhase)) {
    const moonPhaseScore = calculateMoonPhaseScore(recipe, astrologicalState.moonPhase as MoonPhaseWithSpaces);
    if (moonPhaseScore > 0.6) {
      reasons.push(`The flavors align perfectly with the current ${astrologicalState.moonPhase} energy.`);
    }
  }
  
  // Check meal type appropriateness
  if (isObject(timeFactors) && hasProperty(timeFactors, 'mealType')) {
    const mealScore = calculateMealTypeScore(recipe, timeFactors.mealType as MealType);
    if (mealScore > 0.6) {
      reasons.push(`This is an ideal choice for ${(timeFactors.mealType as string).toLowerCase()} during the ${(timeFactors.timeOfDay as string).toLowerCase()}.`);
    }
  }
  
  // Check seasonal harmony
  if (isObject(timeFactors) && hasProperty(timeFactors, 'season')) {
    const seasonScore = calculateSeasonalScore(recipe, timeFactors.season as Season);
    if (seasonScore > 0.6) {
      reasons.push(`The ingredients and flavors are perfectly in tune with ${timeFactors.season}.`);
    }
  }
  
  // Check zodiac connection
  if (isObject(astrologicalState) && hasProperty(astrologicalState, 'sunSign')) {
    const zodiacScore = calculateZodiacScore(recipe, astrologicalState.sunSign as ZodiacSign);
    if (zodiacScore > 0.6) {
      reasons.push(`This dish appeals to your ${astrologicalState.sunSign} nature with its ${ZODIAC_FLAVOR_AFFINITIES[astrologicalState.sunSign as ZodiacSign][0].toLowerCase()} flavors.`);
    }
  }
  
  // If we have dominant planets
  if (isObject(astrologicalState) && hasProperty(astrologicalState, 'dominantPlanets') &&
      isArray(astrologicalState.dominantPlanets) && astrologicalState.dominantPlanets.length > 0) {
    for (const dominantPlanet of astrologicalState.dominantPlanets) {
      const planetScore = calculatePlanetaryScore(recipe, (dominantPlanet as { name: PlanetName }).name);
      if (planetScore > 0.6) {
        reasons.push(`The influence of ${(dominantPlanet as { name: string }).name} in your chart is complemented by this recipe.`);
        break; // Just mention one planet to avoid repetition
      }
    }
  }
  
  if (reasons.length === 0) {
    return "This recipe was selected based on a combination of factors including the current time, astrological influences, and seasonal considerations.";
  }
  
  return reasons.join(' ');
} 