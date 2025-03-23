import { RulingPlanet } from '../constants/planets';
import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { 
  ElementalItem, 
  AlchemicalItem 
} from '../calculations/alchemicalTransformation';
import {
  transformIngredients,
  transformCookingMethods,
  transformCuisines,
  sortByAlchemicalCompatibility,
  filterByAlchemicalCompatibility,
  getTopCompatibleItems
} from '../utils/alchemicalTransformationUtils';

/**
 * Interface for alchemical recommendations
 */
export interface AlchemicalRecommendations {
  topIngredients: AlchemicalItem[];
  topMethods: AlchemicalItem[];
  topCuisines: AlchemicalItem[];
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
}

/**
 * Service for handling alchemical transformations and recommendations
 */
export class AlchemicalTransformationService {
  private ingredients: ElementalItem[] = [];
  private cookingMethods: ElementalItem[] = [];
  private cuisines: ElementalItem[] = [];
  private planetPositions: Record<RulingPlanet, number> = {};
  private isDaytime: boolean = true;
  
  /**
   * Initialize the service with data
   */
  constructor(
    ingredients: ElementalItem[] = [],
    cookingMethods: ElementalItem[] = [],
    cuisines: ElementalItem[] = []
  ) {
    this.ingredients = ingredients;
    this.cookingMethods = cookingMethods;
    this.cuisines = cuisines;
  }
  
  /**
   * Set planetary positions
   */
  setPlanetaryPositions(positions: Record<RulingPlanet, number>): void {
    this.planetPositions = positions;
  }
  
  /**
   * Set whether it's currently day or night
   */
  setDaytime(isDaytime: boolean): void {
    this.isDaytime = isDaytime;
  }
  
  /**
   * Update ingredients data
   */
  setIngredients(ingredients: ElementalItem[]): void {
    this.ingredients = ingredients;
  }
  
  /**
   * Update cooking methods data
   */
  setCookingMethods(methods: ElementalItem[]): void {
    this.cookingMethods = methods;
  }
  
  /**
   * Update cuisines data
   */
  setCuisines(cuisines: ElementalItem[]): void {
    this.cuisines = cuisines;
  }
  
  /**
   * Get transformed ingredients based on current settings
   */
  getTransformedIngredients(): AlchemicalItem[] {
    return transformIngredients(
      this.ingredients,
      this.planetPositions,
      this.isDaytime
    );
  }
  
  /**
   * Get transformed cooking methods based on current settings
   */
  getTransformedCookingMethods(): AlchemicalItem[] {
    return transformCookingMethods(
      this.cookingMethods,
      this.planetPositions,
      this.isDaytime
    );
  }
  
  /**
   * Get transformed cuisines based on current settings
   */
  getTransformedCuisines(): AlchemicalItem[] {
    return transformCuisines(
      this.cuisines,
      this.planetPositions,
      this.isDaytime
    );
  }
  
  /**
   * Get alchemical recommendations based on current planetary positions
   */
  getRecommendations(count: number = 5): AlchemicalRecommendations {
    const transformedIngredients = this.getTransformedIngredients();
    const transformedMethods = this.getTransformedCookingMethods();
    const transformedCuisines = this.getTransformedCuisines();
    
    const topIngredients = getTopCompatibleItems(transformedIngredients, count);
    const topMethods = getTopCompatibleItems(transformedMethods, count);
    const topCuisines = getTopCompatibleItems(transformedCuisines, count);
    
    // Determine overall dominant element and alchemical property
    // This is based on the first ingredients as they typically have the strongest influence
    const dominantElement = topIngredients.length > 0 
      ? topIngredients[0].dominantElement 
      : 'Fire';
    
    const dominantAlchemicalProperty = topIngredients.length > 0 
      ? topIngredients[0].dominantAlchemicalProperty 
      : 'Spirit';
    
    // Calculate average energy values across top ingredients
    const calculateAverage = (items: AlchemicalItem[], property: keyof AlchemicalItem): number => {
      if (items.length === 0) return 0;
      const sum = items.reduce((acc, item) => acc + (item[property] as number), 0);
      return parseFloat((sum / items.length).toFixed(2));
    };
    
    return {
      topIngredients,
      topMethods,
      topCuisines,
      dominantElement,
      dominantAlchemicalProperty,
      heat: calculateAverage(topIngredients, 'heat'),
      entropy: calculateAverage(topIngredients, 'entropy'),
      reactivity: calculateAverage(topIngredients, 'reactivity'),
      gregsEnergy: calculateAverage(topIngredients, 'gregsEnergy')
    };
  }
  
  /**
   * Get recipes optimized for current planetary positions
   * Note: This is a placeholder for future expansion
   */
  getOptimizedRecipes(count: number = 3): any[] {
    // TODO: Implement recipe optimization based on alchemical properties
    return [];
  }
  
  /**
   * Get recommendation for a specific alchemical goal
   * @param targetElement Target element to emphasize
   * @param targetProperty Target alchemical property to emphasize
   */
  getTargetedRecommendations(
    targetElement?: ElementalCharacter, 
    targetAlchemicalProperty?: AlchemicalProperty,
    count: number = 5
  ): AlchemicalRecommendations {
    const transformedIngredients = this.getTransformedIngredients();
    const transformedMethods = this.getTransformedCookingMethods();
    const transformedCuisines = this.getTransformedCuisines();
    
    const filteredIngredients = filterByAlchemicalCompatibility(
      transformedIngredients, 
      targetElement, 
      targetAlchemicalProperty
    );
    
    const filteredMethods = filterByAlchemicalCompatibility(
      transformedMethods, 
      targetElement, 
      targetAlchemicalProperty
    );
    
    const filteredCuisines = filterByAlchemicalCompatibility(
      transformedCuisines, 
      targetElement, 
      targetAlchemicalProperty
    );
    
    const topIngredients = getTopCompatibleItems(filteredIngredients, count);
    const topMethods = getTopCompatibleItems(filteredMethods, count);
    const topCuisines = getTopCompatibleItems(filteredCuisines, count);
    
    // Use provided targets or default to first ingredient
    const dominantElement = targetElement || (topIngredients.length > 0 
      ? topIngredients[0].dominantElement 
      : 'Fire');
    
    const dominantAlchemicalProperty = targetAlchemicalProperty || (topIngredients.length > 0 
      ? topIngredients[0].dominantAlchemicalProperty 
      : 'Spirit');
    
    // Calculate average energy values
    const calculateAverage = (items: AlchemicalItem[], property: keyof AlchemicalItem): number => {
      if (items.length === 0) return 0;
      const sum = items.reduce((acc, item) => acc + (item[property] as number), 0);
      return parseFloat((sum / items.length).toFixed(2));
    };
    
    return {
      topIngredients,
      topMethods,
      topCuisines,
      dominantElement,
      dominantAlchemicalProperty,
      heat: calculateAverage(topIngredients, 'heat'),
      entropy: calculateAverage(topIngredients, 'entropy'),
      reactivity: calculateAverage(topIngredients, 'reactivity'),
      gregsEnergy: calculateAverage(topIngredients, 'gregsEnergy')
    };
  }
} 