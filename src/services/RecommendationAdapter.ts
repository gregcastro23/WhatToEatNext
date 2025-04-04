import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { ElementalCharacter } from '../constants/planetaryElements';
import { 
  LunarPhase, 
  LunarPhaseWithSpaces,
  PlanetaryAspect,
} from '../types/alchemy';
import { transformItemsWithPlanetaryPositions } from '../utils/elementalUtils';
import { calculatePlanetaryPositions, calculateLunarPhase } from '../utils/astrologyUtils';
import { convertToLunarPhase } from '../utils/lunarUtils';

// Define TransformedItem type
interface TransformedItem extends AlchemicalItem {
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  id: string;
}

/**
 * Recommendation adapter for getting alchemical recommendations
 * based on current planetary alignments and user preferences
 */
export class RecommendationAdapter {
  private ingredients: ElementalItem[];
  private methods: ElementalItem[];
  private cuisines: ElementalItem[];
  private planetaryPositions: Record<string, any>;
  private isDaytime: boolean;
  private currentZodiac: string | null;
  private lunarPhase: LunarPhaseWithSpaces | null;
  private transformedIngredients: AlchemicalItem[] = [];
  private transformedMethods: AlchemicalItem[] = [];
  private transformedCuisines: AlchemicalItem[] = [];
  private tarotElementBoosts?: Record<ElementalCharacter, number>;
  private tarotPlanetaryBoosts?: Record<string, number>;
  
  constructor(
    ingredients: ElementalItem[],
    methods: ElementalItem[] = [],
    cuisines: ElementalItem[] = []
  ) {
    this.ingredients = ingredients;
    this.methods = methods;
    this.cuisines = cuisines;
    this.planetaryPositions = {};
    this.isDaytime = true;
    this.currentZodiac = null;
    this.lunarPhase = null;
  }
  
  /**
   * Update the adapter with new planetary data
   * @param planetPositions Current planetary positions
   * @param isDaytime Whether it is daytime
   * @param currentZodiac Current zodiac sign
   * @param lunarPhase Current lunar phase
   * @param tarotElementBoosts Optional elemental boosts from tarot
   * @param tarotPlanetaryBoosts Optional planetary boosts from tarot
   * @param aspects Optional planetary aspects
   */
  async updatePlanetaryData(
    planetPositions: Record<string, any>,
    isDaytime: boolean = true,
    currentZodiac?: string | null,
    lunarPhase?: LunarPhaseWithSpaces,
    tarotElementBoosts?: Record<ElementalCharacter, number>,
    tarotPlanetaryBoosts?: Record<string, number>,
    aspects?: PlanetaryAspect[]
  ): Promise<void> {
    this.planetaryPositions = planetPositions;
    this.isDaytime = isDaytime;
    this.currentZodiac = currentZodiac || null;
    this.lunarPhase = lunarPhase || null;
    this.tarotElementBoosts = tarotElementBoosts;
    this.tarotPlanetaryBoosts = tarotPlanetaryBoosts;
    
    // Convert lunar phase for use with transformItemsWithPlanetaryPositions
    const convertedLunarPhase = convertToLunarPhase(this.lunarPhase);
    
    // Transform ingredients
    this.transformedIngredients = transformItemsWithPlanetaryPositions(
      this.ingredients,
      this.planetaryPositions,
      this.isDaytime,
      this.currentZodiac !== null ? this.currentZodiac : undefined,
      convertedLunarPhase,
      this.tarotElementBoosts,
      this.tarotPlanetaryBoosts
    );
    
    // Transform cooking methods
    this.transformedMethods = transformItemsWithPlanetaryPositions(
      this.methods,
      this.planetaryPositions,
      this.isDaytime,
      this.currentZodiac !== null ? this.currentZodiac : undefined,
      convertedLunarPhase,
      this.tarotElementBoosts,
      this.tarotPlanetaryBoosts
    );
    
    // Transform cuisines
    this.transformedCuisines = transformItemsWithPlanetaryPositions(
      this.cuisines,
      this.planetaryPositions,
      this.isDaytime,
      this.currentZodiac !== null ? this.currentZodiac : undefined,
      convertedLunarPhase,
      this.tarotElementBoosts,
      this.tarotPlanetaryBoosts
    );
  }
  
  /**
   * Get recommended ingredients based on current planetary alignments
   */
  getRecommendedIngredients(limit: number = 10): AlchemicalItem[] {
    return this.getSortedItems(this.transformedIngredients, limit);
  }
  
  /**
   * Get recommended cooking methods based on current planetary alignments
   */
  getRecommendedMethods(limit: number = 5): AlchemicalItem[] {
    return this.getSortedItems(this.transformedMethods, limit);
  }
  
  /**
   * Get recommended cuisines based on current planetary alignments
   */
  getRecommendedCuisines(limit: number = 5): AlchemicalItem[] {
    return this.getSortedItems(this.transformedCuisines, limit);
  }
  
  /**
   * Get items sorted by their alchemical energy and limited to the specified count
   */
  private getSortedItems(items: AlchemicalItem[], limit: number): AlchemicalItem[] {
    return items.sort((a, b) => {
      // Use gregsEnergy as primary sort field, defaulting to 0 if undefined
      const energyA = a.gregsEnergy || 0;
      const energyB = b.gregsEnergy || 0;
      return energyB - energyA; // Descending sort (highest energy first)
    }).slice(0, limit);
  }

  // Get a specific ingredient by ID
  getIngredientById(id: string): ElementalItem | undefined {
    return this.ingredients.find(ingredient => ingredient.id === id);
  }

  // Get all ingredients
  getAllIngredients(): ElementalItem[] {
    return this.ingredients;
  }

  // Get a specific cooking method by ID
  getMethodById(id: string): ElementalItem | undefined {
    return this.methods.find(method => method.id === id);
  }

  // Get a specific cuisine by ID
  getCuisineById(id: string): ElementalItem | undefined {
    return this.cuisines.find(cuisine => cuisine.id === id);
  }

  private calculateNutritionalBoosts(): Record<string, number> {
    return this.ingredients.reduce((acc, ingredient) => {
      const nutrition = ingredient.nutritionalProfile;
      if (nutrition && nutrition.macros && nutrition.vitamins && nutrition.minerals) {
        acc[ingredient.id] = Math.sqrt(
          (nutrition.macros.protein || 0) * 0.4 +
          (nutrition.vitamins.vitaminC || 0) * 0.3 +
          (nutrition.minerals.iron || 0) * 0.3
        );
      } else {
        acc[ingredient.id] = 1; // Default multiplier if no nutrition data
      }
      return acc;
    }, {} as Record<string, number>);
  }

  private applyNutritionalBoost(item: TransformedItem, boosts: Record<string, number>): TransformedItem {
    const boost = boosts[item.id] || 1;
    return {
      ...item,
      elementalProperties: {
        Fire: item.elementalProperties.Fire * boost,
        Water: item.elementalProperties.Water * boost,
        Earth: item.elementalProperties.Earth * boost,
        Air: item.elementalProperties.Air * boost
      }
    };
  }

  applyTarotEnergyBoosts(ingredient: AlchemicalItem, tarotEnergyBoosts: Record<string, number>): AlchemicalItem {
    // Calculate alchemical properties from elemental properties if they don't exist
    const elementalProps = ingredient.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    
    // Calculate spirit, essence, matter, substance based on elemental properties if not already present
    // This follows the same relationships as in the alchemical system:
    // - Spirit is related to Fire (transformation)
    // - Essence is related to Water (fluidity)
    // - Matter is related to Earth (stability)
    // - Substance is related to Air (connection)
    const calculatedSpirit = ingredient.spirit || (elementalProps.Fire * 0.6 + elementalProps.Air * 0.4);
    const calculatedEssence = ingredient.essence || (elementalProps.Water * 0.6 + elementalProps.Fire * 0.4);
    const calculatedMatter = ingredient.matter || (elementalProps.Earth * 0.7 + elementalProps.Water * 0.3);
    const calculatedSubstance = ingredient.substance || (elementalProps.Air * 0.6 + elementalProps.Earth * 0.4);
    
    // Apply tarot boosts to calculated values
    const boostedSpirit = Math.min(Math.max(calculatedSpirit * (tarotEnergyBoosts.Spirit || 1.0), 0.1), 1.0);
    const boostedEssence = Math.min(Math.max(calculatedEssence * (tarotEnergyBoosts.Essence || 1.0), 0.1), 1.0);
    const boostedMatter = Math.min(Math.max(calculatedMatter * (tarotEnergyBoosts.Matter || 1.0), 0.1), 1.0);
    const boostedSubstance = Math.min(Math.max(calculatedSubstance * (tarotEnergyBoosts.Substance || 1.0), 0.1), 1.0);
    
    // Calculate energy metrics using the formulas with safety checks
    const fire = Math.max(elementalProps.Fire, 0.1);
    const water = Math.max(elementalProps.Water, 0.1);
    const air = Math.max(elementalProps.Air, 0.1);
    const earth = Math.max(elementalProps.Earth, 0.1);
    
    // Heat formula: (spirit^2 + fire^2) / (substance + essence + matter + water + air + earth)^2
    // Add safety checks to prevent division by zero and ensure positive results
    const denominatorHeat = Math.max(boostedSubstance + boostedEssence + boostedMatter + water + air + earth, 0.1);
    let heat = (Math.pow(boostedSpirit, 2) + Math.pow(fire, 2)) / Math.pow(denominatorHeat, 2);
    
    // Entropy formula
    const denominatorEntropy = Math.max(boostedEssence + boostedMatter + earth + water, 0.1);
    let entropy = (Math.pow(boostedSpirit, 2) + Math.pow(boostedSubstance, 2) + 
                 Math.pow(fire, 2) + Math.pow(air, 2)) / Math.pow(denominatorEntropy, 2);
    
    // Reactivity formula
    const denominatorReactivity = Math.max(boostedMatter + earth, 0.1);
    let reactivity = (Math.pow(boostedSpirit, 2) + Math.pow(boostedSubstance, 2) + Math.pow(boostedEssence, 2) + 
                   Math.pow(fire, 2) + Math.pow(air, 2) + Math.pow(water, 2)) / Math.pow(denominatorReactivity, 2);
    
    // Normalize values to 0.0-1.0 range
    heat = Math.min(Math.max(heat, 0.1), 1.0);
    entropy = Math.min(Math.max(entropy, 0.1), 1.0);
    reactivity = Math.min(Math.max(reactivity, 0.1), 1.0);
    
    // Calculate gregsEnergy using the original formula: heat - (reactivity * entropy)
    // Then scale to the 0-1 range for UI friendliness
    const rawGregsEnergy = heat - (reactivity * entropy);
    const scaledGregsEnergy = (rawGregsEnergy + 1) / 2; // Convert from range (-1,1) to (0,1)
    const gregsEnergy = Math.min(Math.max(scaledGregsEnergy, 0.1), 1.0);
    
    // Create updated properties
    return {
        ...ingredient,
        spirit: boostedSpirit,
        essence: boostedEssence,
        matter: boostedMatter,
        substance: boostedSubstance,
        heat,
        entropy,
        reactivity,
        gregsEnergy
    };
  }
}

/**
 * Helper function to get the elemental character associated with a planet
 * @param planet The planet name
 * @returns The associated elemental character or undefined
 */
function getPlanetaryElement(planet: string): ElementalCharacter | undefined {
  const planetMap: Record<string, ElementalCharacter> = {
    'Sun': 'Fire',
    'Moon': 'Water',
    'Mercury': 'Air',
    'Venus': 'Earth',
    'Mars': 'Fire',
    'Jupiter': 'Air',
    'Saturn': 'Earth',
    'Uranus': 'Air',
    'Neptune': 'Water',
    'Pluto': 'Water'
  };
  
  return planetMap[planet];
} 