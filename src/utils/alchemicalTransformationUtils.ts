import { RulingPlanet } from '../constants/planets';
import { LunarPhase, LunarPhaseWithSpaces, CookingMethod } from '../types/alchemy';
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
    planetPositions,
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
  // First, apply the standard transformations
  const transformedItems = transformItemsWithPlanetaryPositions(
    methods,
    planetPositions,
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
    planetPositions,
    isDaytime,
    currentZodiac,
    lunarPhase
  );
};

/**
 * Sort items by their alchemical compatibility with a target element and property
 * 
 * @param items The items to sort
 * @param targetElement Optional dominant element to prioritize
 * @param targetProperty Optional alchemical property to prioritize
 * @returns The sorted items
 */
export const sortByAlchemicalCompatibility = (
  items: AlchemicalItem[],
  targetElement?: string,
  targetProperty?: string
): AlchemicalItem[] => {
  return [...items].sort((a, b) => {
    // If target element is specified, prioritize items with that dominant element
    if (targetElement) {
      const aElementMatch = a.dominantElement === targetElement ? 1 : 0;
      const bElementMatch = b.dominantElement === targetElement ? 1 : 0;
      
      if (aElementMatch !== bElementMatch) {
        return bElementMatch - aElementMatch;
      }
    }
    
    // If target property is specified, prioritize items with that property
    if (targetProperty) {
      const aPropertyMatch = a.dominantAlchemicalProperty === targetProperty ? 1 : 0;
      const bPropertyMatch = b.dominantAlchemicalProperty === targetProperty ? 1 : 0;
      
      if (aPropertyMatch !== bPropertyMatch) {
        return bPropertyMatch - aPropertyMatch;
      }
    }
    
    // Fall back to gregsEnergy score for final sorting
    return (b.gregsEnergy || 0) - (a.gregsEnergy || 0);
  });
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
  count: number = 5
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
export const getRecommendedCookingMethodsForIngredient = (
  ingredient: AlchemicalItem,
  cookingMethods: AlchemicalItem[],
  count: number = 5
): Array<{ method: string, compatibility: number }> => {
  // For each method, calculate how well it transforms the ingredient using enhanced algorithm
  // that takes into account elemental character associations
  
  console.log('\n===========================================');
  console.log('COOKING METHOD RECOMMENDATIONS ENGINE START');
  console.log('===========================================');
  console.log(`Ingredient: ${ingredient.name}`);
  console.log(`Element: ${ingredient.element || 'Not specified'}`);
  console.log(`Elemental Character: ${ingredient.elementalCharacter || 'Not specified'}`);
  console.log(`Spirit: ${ingredient.spirit || 0}, Essence: ${ingredient.essence || 0}, Matter: ${ingredient.matter || 0}, Substance: ${ingredient.substance || 0}`);
  console.log(`Available cooking methods: ${cookingMethods.length}`);
  
  // Convert cookingMethods names to method strings for holistic recommendations
  const methodNames = cookingMethods.map(method => method.name);
  console.log('Method names to evaluate:', methodNames.join(', '));
  
  // Use our enhanced holistic recommendations that include elemental character
  console.log('\nEvaluating methods with holistic cooking recommendations algorithm...');
  const holisticRecommendations = getHolisticCookingRecommendations(
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
  
  console.log('\nFINAL COOKING RECOMMENDATIONS (sorted by compatibility):');
  results.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.method} - Compatibility: ${Math.round(rec.compatibility)}%`);
  });
  
  console.log('===========================================');
  console.log('COOKING METHOD RECOMMENDATIONS ENGINE END');
  console.log('===========================================\n');
  
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