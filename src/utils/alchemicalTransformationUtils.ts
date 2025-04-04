import { RulingPlanet } from '../constants/planets';
import { LunarPhase, LunarPhaseWithSpaces } from '../types/alchemy';
import { 
  transformItemWithPlanetaryPositions, 
  transformItemsWithPlanetaryPositions,
  ElementalItem,
  AlchemicalItem
} from '../calculations/alchemicalTransformation';

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
  return transformItemsWithPlanetaryPositions(
    methods,
    planetPositions,
    isDaytime,
    currentZodiac,
    lunarPhase
  );
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
 * Sorts ingredients, methods, or cuisines by alchemical compatibility
 * with the current planetary positions
 * 
 * @param items Transformed items with alchemical properties
 * @returns Items sorted by compatibility (highest to lowest)
 */
export const sortByAlchemicalCompatibility = (
  items: AlchemicalItem[]
): AlchemicalItem[] => {
  return [...items].sort((a, b) => {
    // Sort primarily by Greg's Energy (higher is better)
    if (b.gregsEnergy !== a.gregsEnergy) {
      return b.gregsEnergy - a.gregsEnergy;
    }
    
    // If energy is the same, sort by heat
    if (b.heat !== a.heat) {
      return b.heat - a.heat;
    }
    
    // If heat is the same, sort by planetary boost
    if (b.planetaryBoost !== a.planetaryBoost) {
      return b.planetaryBoost - a.planetaryBoost;
    }
    
    // If planetary boost is the same, sort by reactivity
    return b.reactivity - a.reactivity;
  });
};

/**
 * Filters items to find those compatible with a target element or alchemical property
 * 
 * @param items Transformed items with alchemical properties
 * @param targetElement Optional target element to filter by
 * @param targetAlchemicalProperty Optional target alchemical property to filter by
 * @param targetZodiacSign Optional target zodiac sign to filter by
 * @returns Filtered items matching the criteria
 */
export const filterByAlchemicalCompatibility = (
  items: AlchemicalItem[],
  targetElement?: string,
  targetAlchemicalProperty?: string,
  targetZodiacSign?: string
): AlchemicalItem[] => {
  return items.filter(item => {
    // If no filters are specified, include all items
    if (!targetElement && !targetAlchemicalProperty && !targetZodiacSign) {
      return true;
    }
    
    // If only element is specified, filter by dominant element
    if (targetElement && !targetAlchemicalProperty && !targetZodiacSign) {
      return item.dominantElement === targetElement;
    }
    
    // If only alchemical property is specified, filter by dominant alchemical property
    if (!targetElement && targetAlchemicalProperty && !targetZodiacSign) {
      return item.dominantAlchemicalProperty === targetAlchemicalProperty;
    }
    
    // If only zodiac sign is specified, filter by compatibility with that sign
    if (!targetElement && !targetAlchemicalProperty && targetZodiacSign) {
      // Check if the item has any planetary dignities for planets ruling this sign
      return Object.keys(item.planetaryDignities || {}).some(planet => 
        item.planetaryDignities[planet]?.favorableZodiacSigns?.includes(targetZodiacSign)
      );
    }
    
    // If multiple criteria specified, require all to match
    let matches = true;
    
    if (targetElement) {
      matches = matches && item.dominantElement === targetElement;
    }
    
    if (targetAlchemicalProperty) {
      matches = matches && item.dominantAlchemicalProperty === targetAlchemicalProperty;
    }
    
    if (targetZodiacSign) {
      matches = matches && Object.keys(item.planetaryDignities || {}).some(planet => 
        item.planetaryDignities[planet]?.favorableZodiacSigns?.includes(targetZodiacSign)
      );
    }
    
    return matches;
  });
};

/**
 * Gets the top N most compatible items based on alchemical properties
 * 
 * @param items Transformed items with alchemical properties
 * @param count Number of items to return
 * @param currentZodiacSign Optional current zodiac sign to boost relevant items
 * @returns Top N most compatible items
 */
export const getTopCompatibleItems = (
  items: AlchemicalItem[],
  count: number = 5,
  currentZodiacSign?: string
): AlchemicalItem[] => {
  // If we have a current zodiac sign, boost items that are compatible with it
  const adjustedItems = currentZodiacSign ? 
    items.map(item => {
      // Check if any of the dominant planets for this item are dignified in the current zodiac
      const zodiacBoost = Object.keys(item.planetaryDignities || {}).some(planet => 
        item.planetaryDignities[planet]?.favorableZodiacSigns?.includes(currentZodiacSign)
      ) ? 0.2 : 0;
      
      // Create a boosted copy of the item for sorting
      return {
        ...item,
        gregsEnergy: Math.min(1.0, item.gregsEnergy * (1 + zodiacBoost))
      };
    }) : 
    items;
  
  const sortedItems = sortByAlchemicalCompatibility(adjustedItems);
  return sortedItems.slice(0, count);
}; 