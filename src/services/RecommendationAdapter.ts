import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { ElementalCharacter } from '../constants/planetaryElements';
import { 
  LunarPhaseWithSpaces,
  PlanetaryAspect,
} from '../types/alchemy';
import { transformItemsWithPlanetaryPositions } from '../utils/elementalUtils';
import { calculatePlanetaryPositions, calculateLunarPhase } from '../utils/astrologyUtils';
import { convertToLunarPhase } from '../utils/lunarUtils';
import { logger } from '@/utils/logger';

// Define PlanetData interface to replace all 'any' types
interface PlanetData {
  sign?: string;
  degree?: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
  speed?: number;
}

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
  private planetaryPositions: Record<string, PlanetData>;
  private isDaytime: boolean;
  private currentZodiac: string | null;
  private lunarPhase: LunarPhaseWithSpaces | null;
  private transformedIngredients: AlchemicalItem[] = [];
  private transformedMethods: AlchemicalItem[] = [];
  private transformedCuisines: AlchemicalItem[] = [];
  private tarotElementBoosts?: Record<ElementalCharacter, number>;
  private tarotPlanetaryBoosts?: Record<string, number>;
  private aspects: PlanetaryAspect[] = [];
  private retrogradeStatus: Record<string, boolean> = {};
  private convertedPositions: Record<string, PlanetData> = {};
  private alchemicalResult: Record<string, number>;
  
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
    this.alchemicalResult = {
      spirit: 0,
      essence: 0,
      matter: 0,
      substance: 0,
    };
  }
  
  /**
   * Initialize the adapter with planetary positions, daytime status, and other context
   */
  initialize(
    planetaryPositions: Record<string, PlanetData>,
    isDaytime = true,
    currentZodiac: string | null = null,
    lunarPhase: LunarPhaseWithSpaces | null = null,
    tarotElementBoosts?: Record<ElementalCharacter, number>,
    tarotPlanetaryBoosts?: Record<string, number>,
    aspects: PlanetaryAspect[] = []
  ): void {
    this.planetaryPositions = planetaryPositions;
    this.isDaytime = isDaytime;
    this.currentZodiac = currentZodiac;
    this.lunarPhase = lunarPhase;
    this.tarotElementBoosts = tarotElementBoosts;
    this.tarotPlanetaryBoosts = tarotPlanetaryBoosts;
    this.aspects = aspects;
    
    // Track retrograde planets
    this.retrogradeStatus = {};
    if (planetaryPositions) {
      Object.entries(planetaryPositions).forEach(([planet, data]) => {
        if (typeof data === 'object' && data !== null && 'isRetrograde' in data) {
          this.retrogradeStatus[planet] = !!data.isRetrograde;
        }
      });
    }
    
    // Convert planetary positions to the format expected by the alchemical engine
    this.convertedPositions = {};
    if (planetaryPositions) {
      Object.entries(planetaryPositions).forEach(([planet, data]) => {
        if (typeof data === 'object' && data !== null) {
          this.convertedPositions[planet] = {
            sign: data.sign || '',
            degree: data.degree || 0,
            ...(data.isRetrograde !== undefined ? { isRetrograde: data.isRetrograde } : {})
          };
        } else if (typeof data === 'number') {
          this.convertedPositions[planet] = {
            degree: data
          };
        }
      });
    }
    
    // Transform ingredients, methods, and cuisines
    this.transformItems();
  }

  /**
   * Initialize from current planetary positions
   * Uses astrologyUtils to calculate positions automatically
   */
  async initializeFromCurrentPositions(): Promise<void> {
    try {
      // Calculate real-time planetary positions
      const positions = await calculatePlanetaryPositions();
      
      // Calculate current lunar phase
      const lunarPhase = await calculateLunarPhase(new Date());
      
      // Convert to format expected by adapter
      const lunarPhaseFormatted = convertToLunarPhase(lunarPhase);
      
      // Calculate if it's currently daytime
      const now = new Date();
      const hours = now.getHours();
      const isDaytime = hours >= 6 && hours < 18;
      
      // Get current sun sign as current zodiac
      const sunPosition = positions['sun'];
      const currentZodiac = sunPosition?.sign || null;
      
      // Initialize adapter with calculated values
      this.initialize(
        positions,
        isDaytime,
        currentZodiac,
        lunarPhaseFormatted
      );
      
      logger.info('Initialized adapter with current planetary positions');
    } catch (error) {
      logger.error('Error initializing from current positions:', error);
    }
  }
  
  /**
   * Transform items using planetary positions directly
   * This uses transformItemsWithPlanetaryPositions utility directly
   */
  transformItemsWithCurrentPositions(): void {
    try {
      // Transform ingredients directly
      this.transformedIngredients = transformItemsWithPlanetaryPositions(
        this.ingredients,
        this.planetaryPositions,
        this.isDaytime,
        this.currentZodiac || undefined
      );
      
      // Transform cooking methods
      this.transformedMethods = transformItemsWithPlanetaryPositions(
        this.methods,
        this.planetaryPositions,
        this.isDaytime,
        this.currentZodiac || undefined
      );
      
      // Transform cuisines
      this.transformedCuisines = transformItemsWithPlanetaryPositions(
        this.cuisines,
        this.planetaryPositions,
        this.isDaytime,
        this.currentZodiac || undefined
      );
      
      logger.info('Items transformed using direct planetary positions');
    } catch (error) {
      logger.error('Error transforming items with planetary positions:', error);
    }
  }

  /**
   * Transform items based on alchemical properties
   */
  private transformItems(): void {
    try {
      // Get alchemical results from the positions
      const result = alchemize(
        this.convertedPositions, 
        this.isDaytime,
        this.lunarPhase || undefined,
        this.retrogradeStatus
      );
      
      this.alchemicalResult = result;
      
      // Prepare alchemical properties
      const alchemicalProperties = {
        Spirit: result.spirit,
        Essence: result.essence,
        Matter: result.matter,
        Substance: result.substance
      };
      
      // Prepare elemental properties, converting to uppercase keys
      const elementalProperties = {
        Fire: result.elementalBalance.Fire || result.elementalBalance.fire || 0,
        Earth: result.elementalBalance.Earth || result.elementalBalance.earth || 0,
        Air: result.elementalBalance.Air || result.elementalBalance.air || 0,
        Water: result.elementalBalance.Water || result.elementalBalance.water || 0
      };
      
      // Apply tarot element boosts if available
      if (this.tarotElementBoosts) {
        Object.entries(this.tarotElementBoosts).forEach(([element, boost]) => {
          if (element in elementalProperties) {
            elementalProperties[element as keyof typeof elementalProperties] += boost;
          }
        });
      }
      
      // Apply tarot planetary boosts if available
      if (this.tarotPlanetaryBoosts) {
        // Find planet information in the planetary positions
        Object.entries(this.tarotPlanetaryBoosts).forEach(([planet, boost]) => {
          // Apply boost to corresponding alchemical property based on planet
          switch (planet.toLowerCase()) {
            case 'sun':
              alchemicalProperties.Spirit += boost;
              break;
            case 'moon':
              alchemicalProperties.Essence += boost;
              break;
            case 'mercury':
              alchemicalProperties.Substance += boost * 0.6;
              alchemicalProperties.Spirit += boost * 0.4;
              break;
            case 'venus':
              alchemicalProperties.Essence += boost;
              break;
            case 'mars':
              alchemicalProperties.Matter += boost * 0.6;
              alchemicalProperties.Essence += boost * 0.4;
              break;
            case 'jupiter':
              alchemicalProperties.Spirit += boost * 0.5;
              alchemicalProperties.Essence += boost * 0.5;
              break;
            case 'saturn':
              alchemicalProperties.Matter += boost;
              break;
            case 'uranus':
              alchemicalProperties.Spirit += boost * 0.3;
              alchemicalProperties.Substance += boost * 0.7;
              break;
            case 'neptune':
              alchemicalProperties.Essence += boost * 0.6;
              alchemicalProperties.Substance += boost * 0.4;
              break;
            case 'pluto':
              alchemicalProperties.Matter += boost * 0.7;
              alchemicalProperties.Essence += boost * 0.3;
              break;
          }
        });
      }
      
      // Apply aspect influences if available
      if (this.aspects && this.aspects.length > 0) {
        this.aspects.forEach(aspect => {
          // Lookup planet data for both bodies
          const planet1 = aspect.body1?.toLowerCase();
          const planet2 = aspect.body2?.toLowerCase();
          
          if (!planet1 || !planet2) return;
          
          // Get planets data
          const planetData1 = this.getPlanetData(planet1);
          const planetData2 = this.getPlanetData(planet2);
          
          // If either planet has aspect effects for the other planet
          if (planetData1?.AspectsEffect?.[planet2]) {
            const aspectEffect = planetData1.AspectsEffect[planet2][aspect.aspectType];
            if (aspectEffect) {
              // Boost alchemical properties based on aspect effect
              const boost = aspectEffect;
              alchemicalProperties.Spirit += planetData1.Alchemy.Spirit * boost;
              alchemicalProperties.Essence += planetData1.Alchemy.Essence * boost;
              alchemicalProperties.Matter += planetData1.Alchemy.Matter * boost;
              alchemicalProperties.Substance += planetData1.Alchemy.Substance * boost;
            }
          }
          
          if (planetData2?.AspectsEffect?.[planet1]) {
            const aspectEffect = planetData2.AspectsEffect[planet1][aspect.aspectType];
            if (aspectEffect) {
              // Boost alchemical properties based on aspect effect
              const boost = aspectEffect;
              alchemicalProperties.Spirit += planetData2.Alchemy.Spirit * boost;
              alchemicalProperties.Essence += planetData2.Alchemy.Essence * boost;
              alchemicalProperties.Matter += planetData2.Alchemy.Matter * boost;
              alchemicalProperties.Substance += planetData2.Alchemy.Substance * boost;
            }
          }
        });
      }
      
      // Transform ingredients
      this.transformedIngredients = transformIngredients(
        this.ingredients, 
        elementalProperties, 
        alchemicalProperties, 
        this.currentZodiac
      );
      
      // Transform cooking methods
      this.transformedMethods = transformCookingMethods(
        this.methods, 
        elementalProperties, 
        alchemicalProperties, 
        this.currentZodiac
      );
      
      // Transform cuisines
      this.transformedCuisines = transformCuisines(
        this.cuisines, 
        elementalProperties, 
        alchemicalProperties, 
        this.currentZodiac
      );
    } catch (error) {
      logger.error('Error transforming items:', error);
      
      // Create empty transformed arrays
      this.transformedIngredients = [];
      this.transformedMethods = [];
      this.transformedCuisines = [];
    }
  }
  
  /**
   * Get planet data from the planetInfo object
   */
  private getPlanetData(planet: string): Record<string, unknown> {
    const planetKey = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
    return planetInfo[planetKey as keyof typeof planetInfo] || {};
  }
  
  /**
   * Get recommended ingredients based on current planetary alignments
   */
  getRecommendedIngredients(limit = 10): AlchemicalItem[] {
    return this.getSortedItems(this.transformedIngredients, limit);
  }
  
  /**
   * Get recommended cooking methods based on current planetary alignments
   */
  getRecommendedCookingMethods(limit = 5): AlchemicalItem[] {
    return this.getSortedItems(this.transformedMethods, limit);
  }
  
  /**
   * Get recommended cuisines based on current planetary alignments
   */
  getRecommendedCuisines(limit = 5): AlchemicalItem[] {
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

  /**
   * Get the dominant element based on alchemical results
   */
  getDominantElement(): ElementalCharacter | null {
    if (!this.alchemicalResult) return null;
    
    const elementName = this.alchemicalResult.dominantElement;
    // Normalize to proper case for ElementalCharacter
    if (elementName === 'fire') return 'Fire';
    if (elementName === 'water') return 'Water';
    if (elementName === 'earth') return 'Earth';
    if (elementName === 'air') return 'Air';
    
    return null;
  }
  
  /**
   * Get the dominant alchemical property
   */
  getDominantAlchemicalProperty(): AlchemicalProperty | null {
    if (!this.alchemicalResult) return null;
    
    // Find the dominant property based on the highest value
    const properties = {
      Spirit: this.alchemicalResult.spirit || 0,
      Essence: this.alchemicalResult.essence || 0,
      Matter: this.alchemicalResult.matter || 0,
      Substance: this.alchemicalResult.substance || 0
    };
    
    let dominant: AlchemicalProperty = 'Spirit';
    let maxValue = properties.Spirit;
    
    Object.entries(properties).forEach(([property, value]) => {
      if (value > maxValue) {
        maxValue = value;
        dominant = property as AlchemicalProperty;
      }
    });
    
    return dominant;
  }
  
  /**
   * Get the heat index from alchemical results
   */
  getHeatIndex(): number | null {
    // If heat is explicitly calculated in alchemical results, use it
    if (this.alchemicalResult && 'heat' in this.alchemicalResult) {
      return this.alchemicalResult.heat;
    }
    
    // Otherwise derive from alchemical properties
    if (this.alchemicalResult) {
      const fire = this.alchemicalResult.elementalBalance.Fire || 0;
      const spirit = this.alchemicalResult.spirit || 0;
      
      // Heat is primarily influenced by Fire element and Spirit property
      return (fire * 0.6 + spirit * 0.4) / 2;
    }
    
    return null;
  }
  
  /**
   * Get the entropy index from alchemical results
   */
  getEntropyIndex(): number | null {
    // If entropy is explicitly calculated in alchemical results, use it
    if (this.alchemicalResult && 'entropy' in this.alchemicalResult) {
      return this.alchemicalResult.entropy;
    }
    
    // Otherwise derive from alchemical properties
    if (this.alchemicalResult) {
      const air = this.alchemicalResult.elementalBalance.Air || 0;
      const substance = this.alchemicalResult.substance || 0;
      
      // Entropy is primarily influenced by Air element and Substance property
      return (air * 0.7 + substance * 0.3) / 2;
    }
    
    return null;
  }
  
  /**
   * Get the reactivity index from alchemical results
   */
  getReactivityIndex(): number | null {
    // If reactivity is explicitly calculated in alchemical results, use it
    if (this.alchemicalResult && 'reactivity' in this.alchemicalResult) {
      return this.alchemicalResult.reactivity;
    }
    
    // Otherwise derive from alchemical properties
    if (this.alchemicalResult) {
      const essence = this.alchemicalResult.essence || 0;
      const water = this.alchemicalResult.elementalBalance.Water || 0;
      
      // Reactivity is primarily influenced by Water element and Essence property
      return (water * 0.5 + essence * 0.5) / 2;
    }
    
    return null;
  }
  
  /**
   * Get the Greg's Energy index from alchemical results
   */
  getGregsEnergyIndex(): number | null {
    // If Greg's Energy is explicitly calculated in alchemical results, use it
    if (this.alchemicalResult && 'gregsEnergy' in this.alchemicalResult) {
      return this.alchemicalResult.gregsEnergy;
    }
    
    // Otherwise derive from alchemical properties - balanced formula based on all elements
    if (this.alchemicalResult) {
      const { Fire, Water, Earth, Air } = this.alchemicalResult.elementalBalance;
      const { spirit, essence, matter, substance } = this.alchemicalResult;
      
      // Weighted combination of all elements and properties
      const elementalBalance = (Fire + Water + Earth + Air) / 4;
      const propertyBalance = (spirit + essence + matter + substance) / 4;
      
      return (elementalBalance * 0.4 + propertyBalance * 0.6);
    }
    
    return null;
  }
  
  /**
   * Get all transformed ingredients
   */
  getAllTransformedIngredients(): AlchemicalItem[] {
    return this.transformedIngredients;
  }
  
  /**
   * Get all transformed cooking methods
   */
  getAllTransformedMethods(): AlchemicalItem[] {
    return this.transformedMethods;
  }
  
  /**
   * Get all transformed cuisines
   */
  getAllTransformedCuisines(): AlchemicalItem[] {
    return this.transformedCuisines;
  }

  /**
   * Get a planetary element for a given planet
   */
  getPlanetaryElement(planet: string): ElementalCharacter | undefined {
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
} 