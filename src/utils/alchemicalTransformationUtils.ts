import { RulingPlanet } from '../constants/planets';
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
 * @returns Ingredients transformed with alchemical properties
 */
export const transformIngredients = (
  ingredients: ElementalItem[],
  planetPositions: Record<RulingPlanet, number>,
  isDaytime: boolean
): AlchemicalItem[] => {
  return transformItemsWithPlanetaryPositions(
    ingredients,
    planetPositions,
    isDaytime
  );
};

/**
 * Transforms a set of cooking methods based on current planetary positions
 * 
 * @param methods The original cooking methods with elemental data
 * @param planetPositions Current planetary positions/strengths
 * @param isDaytime Whether it's day or night
 * @returns Methods transformed with alchemical properties
 */
export const transformCookingMethods = (
  methods: ElementalItem[],
  planetPositions: Record<RulingPlanet, number>,
  isDaytime: boolean
): AlchemicalItem[] => {
  return transformItemsWithPlanetaryPositions(
    methods,
    planetPositions,
    isDaytime
  );
};

/**
 * Transforms a set of cuisines based on current planetary positions
 * 
 * @param cuisines The original cuisines with elemental data
 * @param planetPositions Current planetary positions/strengths
 * @param isDaytime Whether it's day or night
 * @returns Cuisines transformed with alchemical properties
 */
export const transformCuisines = (
  cuisines: ElementalItem[],
  planetPositions: Record<RulingPlanet, number>,
  isDaytime: boolean
): AlchemicalItem[] => {
  return transformItemsWithPlanetaryPositions(
    cuisines,
    planetPositions,
    isDaytime
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
    
    // If heat is the same, sort by reactivity
    return b.reactivity - a.reactivity;
  });
};

/**
 * Filters items to find those compatible with a target element or alchemical property
 * 
 * @param items Transformed items with alchemical properties
 * @param targetElement Optional target element to filter by
 * @param targetAlchemicalProperty Optional target alchemical property to filter by
 * @returns Filtered items matching the criteria
 */
export const filterByAlchemicalCompatibility = (
  items: AlchemicalItem[],
  targetElement?: string,
  targetAlchemicalProperty?: string
): AlchemicalItem[] => {
  return items.filter(item => {
    // If no filters are specified, include all items
    if (!targetElement && !targetAlchemicalProperty) {
      return true;
    }
    
    // If only element is specified, filter by dominant element
    if (targetElement && !targetAlchemicalProperty) {
      return item.dominantElement === targetElement;
    }
    
    // If only alchemical property is specified, filter by dominant alchemical property
    if (!targetElement && targetAlchemicalProperty) {
      return item.dominantAlchemicalProperty === targetAlchemicalProperty;
    }
    
    // If both are specified, require both to match
    return item.dominantElement === targetElement && 
           item.dominantAlchemicalProperty === targetAlchemicalProperty;
  });
};

/**
 * Gets the top N most compatible items based on alchemical properties
 * 
 * @param items Transformed items with alchemical properties
 * @param count Number of items to return
 * @returns Top N most compatible items
 */
export const getTopCompatibleItems = (
  items: AlchemicalItem[],
  count: number = 5
): AlchemicalItem[] => {
  const sortedItems = sortByAlchemicalCompatibility(items);
  return sortedItems.slice(0, count);
}; 