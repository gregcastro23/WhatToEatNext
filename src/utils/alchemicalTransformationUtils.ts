import { RulingPlanet } from '../constants/planets';
import { _LunarPhase, LunarPhaseWithSpaces, CookingMethod } from '../types/alchemy';
import type { CelestialPosition } from '@/types/celestial';
import { 
  transformItemWithPlanetaryPositions, 
  transformItemsWithPlanetaryPositions,
  ElementalItem,
  AlchemicalItem
} from '../calculations/alchemicalTransformation';
import { 
  getCookingMethodPillar, 
  applyPillarTransformation,
  calculateCookingMethodCompatibility,
  getHolisticCookingRecommendations
} from './alchemicalPillarUtils';

/**
 * Transforms a set of ingredients based on current planetary positions
 * 
 * @param ingredients The original ingredients with elemental data
 * @param planetPositions Current planetary positions/strengths
 * @param isDaytime Whether it's day or night
 * @param currentZodiac Current zodiac sign
 * @param lunarPhase Current lunar phase
 * @returns Ingredients transformed with alchemical properties
 */
export const transformIngredients = (
  ingredients: ElementalItem[],
  planetPositions: Record<string, number>,
  isDaytime: boolean,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhaseWithSpaces | null
): AlchemicalItem[] => {
  return transformItemsWithPlanetaryPositions(
    ingredients,
    planetPositions as unknown as Record<string, CelestialPosition>, // Pattern TTT: Record Type Conversion
    isDaytime,
    currentZodiac,
    lunarPhase
  );
};

/**
 * Transforms a set of cooking methods based on current planetary positions
 * and applies alchemical pillar transformations
 * 
 * @param methods The original cooking methods with elemental data
 * @param planetPositions Current planetary positions/strengths
 * @param isDaytime Whether it's day or night
 * @param currentZodiac Current zodiac sign
 * @param lunarPhase Current lunar phase
 * @returns Methods transformed with alchemical properties
 */
export const transformCookingMethods = (
  methods: ElementalItem[],
  planetPositions: Record<string, number>,
  isDaytime: boolean,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhaseWithSpaces | null
): AlchemicalItem[] => {
  // First, apply the standard transformations - Pattern TTT: Record Type Conversion
  const transformedItems = transformItemsWithPlanetaryPositions(
    methods,
    planetPositions as unknown as Record<string, CelestialPosition>,
    isDaytime,
    currentZodiac,
    lunarPhase
  );
  
  // Then apply alchemical pillar transformations based on method names
  return transformedItems.map(method => {
    const methodName = method.name.toLowerCase();
    // Apply pillar-based transformations to the method
    return applyPillarTransformation(method, methodName);
  });
};

/**
 * Transforms a set of cuisines based on current planetary positions
 * 
 * @param cuisines The original cuisines with elemental data
 * @param planetPositions Current planetary positions/strengths
 * @param isDaytime Whether it's day or night
 * @param currentZodiac Current zodiac sign
 * @param lunarPhase Current lunar phase
 * @returns Cuisines transformed with alchemical properties
 */
export const transformCuisines = (
  cuisines: ElementalItem[],
  planetPositions: Record<string, number>,
  isDaytime: boolean,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhaseWithSpaces | null
): AlchemicalItem[] => {
  return transformItemsWithPlanetaryPositions(
    cuisines,
    planetPositions as unknown as Record<string, CelestialPosition>, // Pattern TTT: Record Type Conversion
    isDaytime,
    currentZodiac,
    lunarPhase
  );
};

/**
 * Sort items by their alchemical compatibility with target elemental properties
 * 
 * @param items The items to sort
 * @param targetElementalProperties The target elemental properties to match against
 * @returns The sorted items with compatibilityScore added
 */
export const sortByAlchemicalCompatibility = (
  items: AlchemicalItem[],
  targetElementalProperties?: Record<string, number>
): AlchemicalItem[] => {
  // If no target properties, sort by gregsEnergy
  if (!targetElementalProperties) {
    return [...items].sort((a, b) => (b.gregsEnergy || 0) - (a.gregsEnergy || 0));
  }
  
  // Calculate compatibility scores for each item based on elemental properties
  const itemsWithScores = items.map(item => {
    // Calculate cosine similarity between item's elements and target elements
    let dotProduct = 0;
    let itemNorm = 0;
    let targetNorm = 0;
    
    // Get the element names (Fire, Water, Earth, Air)
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    
    for (const element of elements) {
      const itemValue = item.elementalProperties[element] || 0;
      const targetValue = targetElementalProperties[element] || 0;
      
      dotProduct += itemValue * targetValue;
      itemNorm += itemValue * itemValue;
      targetNorm += targetValue * targetValue;
    }
    
    itemNorm = Math.sqrt(itemNorm);
    targetNorm = Math.sqrt(targetNorm);
    
    // Avoid division by zero
    if (itemNorm === 0 || targetNorm === 0) {
      return { ...item, compatibilityScore: 0.5 }; // Neutral match if either has no elemental values
    }
    
    // Calculate cosine similarity (dot product / (magnitude of A * magnitude of B))
    const similarity = dotProduct / (itemNorm * targetNorm);
    
    // Add a small bonus for items with high gregsEnergy
    const energyBonus = (item.gregsEnergy || 0.5) * 0.2;
    
    // Final compatibility score (0.0 to 1.0)
    const compatibilityScore = Math.min(1.0, similarity * 0.8 + energyBonus);
    
    return {
      ...item,
      compatibilityScore
    };
  });
  
  // Sort by compatibility score (highest first)
  return itemsWithScores.sort((a, b) => 
    (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
  );
};

/**
 * Filter a list of items by alchemical compatibility with a target element and property
 * 
 * @param items The items to filter
 * @param targetElement Optional dominant element to prioritize
 * @param targetProperty Optional alchemical property to prioritize
 * @returns Filtered items with good compatibility
 */
export const filterByAlchemicalCompatibility = (
  items: AlchemicalItem[],
  targetElement?: string,
  targetProperty?: string
): AlchemicalItem[] => {
  // If no targets are specified, return all items
  if (!targetElement && !targetProperty) {
    return items;
  }
  
  return items.filter(item => {
    // Keep items that match either target element or property
    const elementMatch = !targetElement || item.dominantElement === targetElement;
    const propertyMatch = !targetProperty || item.dominantAlchemicalProperty === targetProperty;
    
    return elementMatch || propertyMatch;
  });
};

/**
 * Get the top compatible items from a list, sorted by compatibility
 * 
 * @param items The items to sort
 * @param count The number of items to return
 * @returns Top compatible items
 */
export const getTopCompatibleItems = (
  items: AlchemicalItem[],
  count = 5
): AlchemicalItem[] => {
  // Sort by gregsEnergy for basic compatibility
  return [...items]
    .sort((a, b) => (b.gregsEnergy || 0) - (a.gregsEnergy || 0))
    .slice(0, count);
};

/**
 * Get recommended cooking methods for an ingredient
 * 
 * This algorithm evaluates compatibility between an ingredient and various cooking methods
 * based on their alchemical properties, elemental associations, and thermodynamic effects.
 * 
 * @param ingredient The ingredient to find compatible cooking methods for
 * @param cookingMethods Array of cooking methods to evaluate
 * @param count Number of recommendations to return
 * @returns Array of recommended cooking methods with compatibility scores
 */
export const getRecommendedCookingMethodsForIngredient = async (
  ingredient: AlchemicalItem,
  cookingMethods: AlchemicalItem[],
  count = 5
): Promise<Array<{ method: string, compatibility: number }>> => {
  // For each method, calculate how well it transforms the ingredient using enhanced algorithm
  // that takes into account elemental character associations
  
  // console.log('\n===========================================');
  // console.log('COOKING METHOD RECOMMENDATIONS ENGINE START');
  // console.log('===========================================');
  // console.log(`Ingredient: ${ingredient.name}`);
  // console.log(`Element: ${ingredient.element || 'Not specified'}`);
  // console.log(`Elemental Character: ${ingredient.elementalCharacter || 'Not specified'}`);
  // console.log(`Spirit: ${ingredient.spirit || 0}, Essence: ${ingredient.essence || 0}, Matter: ${ingredient.matter || 0}, Substance: ${ingredient.substance || 0}`);
  // console.log(`Available cooking methods: ${cookingMethods.length}`);
  
  // Convert cookingMethods names to method strings for holistic recommendations
  const methodNames = cookingMethods.map(method => method.name);
  // console.log('Method names to evaluate:', methodNames.join(', '));
  
  // Use our enhanced holistic recommendations that include elemental character
  // console.log('\nEvaluating methods with holistic cooking recommendations algorithm...');
  const holisticRecommendations = await getHolisticCookingRecommendations(
    ingredient,
    undefined, // No specific planet influence
    undefined, // No specific tarot card influence
    true, // Assume daytime by default
    methodNames,
    count
  );
  
  // Convert to the expected return format
  const results = holisticRecommendations.map(rec => ({
    method: rec.method,
    compatibility: rec.compatibility
  }));
  
  // console.log('\nFINAL COOKING RECOMMENDATIONS (sorted by compatibility):');
  results.forEach((rec, index) => {
    // console.log(`${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}%`);
  });
  
  // console.log('===========================================');
  // console.log('COOKING METHOD RECOMMENDATIONS ENGINE END');
  // console.log('===========================================\n');
  
  return results;
};

/**
 * Calculate a single score representing the overall alchemical quality of an item
 * 
 * @param item The AlchemicalItem to score
 * @returns Score from 0-1 representing alchemical quality
 */
function calculateAlchemicalScore(item: AlchemicalItem): number {
  let score = 0;
  let count = 0;
  
  // Add spirit, essence, matter, substance if they exist
  ['spirit', 'essence', 'matter', 'substance'].forEach(prop => {
    if (prop in item && typeof item[prop as keyof AlchemicalItem] === 'number') {
      score += item[prop as keyof AlchemicalItem] as number;
      count++;
    }
  });
  
  // Include thermodynamic properties if they exist
  ['heat', 'entropy', 'reactivity', 'gregsEnergy'].forEach(prop => {
    if (prop in item && typeof item[prop as keyof AlchemicalItem] === 'number') {
      score += item[prop as keyof AlchemicalItem] as number;
      count++;
    }
  });
  
  // Calculate average score
  return count > 0 ? score / count : 0.5;
} 