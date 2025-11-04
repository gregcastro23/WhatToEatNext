import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { ElementalCharacter } from '../constants/planetaryElements';
import { planetInfo } from '../data/planets/planetaryInfo';
import {
  LunarPhaseWithSpaces,
  PlanetaryAspect,
  AlchemicalProperties,
  LunarPhase,
  PlanetaryPosition
} from '../types/alchemy';

// Type alias for backward compatibility
type AlchemicalProperty = keyof AlchemicalProperties;
import {
  transformIngredients,
  transformCookingMethods,
  transformCuisines
} from '../utils/alchemicalTransformationUtils';
import { calculatePlanetaryPositions, calculateLunarPhase } from '../utils/astrologyUtils';
import { transformItemsWithPlanetaryPositions } from '../utils/elementalUtils';
import { convertToLunarPhase } from '../utils/lunarUtils';

import { logger } from '@/utils/logger';

import { alchemize } from '../calculations/core/alchemicalCalculations';

import type { RecommendationResult } from './interfaces/RecommendationServiceInterface';

// Define PlanetData interface to replace all 'any' types
interface PlanetData {
  sign?: string;
  degree?: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
  speed?: number
}

// Define TransformedItem type
interface TransformedItem extends AlchemicalItem {
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number
  };
  id: string
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
    cuisines: ElementalItem[] = []) {
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
      substance: 0
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
    aspects: PlanetaryAspect[] = []): void {
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
      const lunarPhaseFormatted = convertToLunarPhase(lunarPhase as unknown as LunarPhase);

      // Calculate if it's currently daytime
      const now = new Date();
      const hours = now.getHours();
      const isDaytime = hours >= 6 && hours < 18;

      // Get current sun sign as current zodiac
      const sunPosition = positions['sun'];
      const currentZodiac = sunPosition.sign || null;

      // Initialize adapter with calculated values - safe type conversion
      this.initialize(
        positions,
        isDaytime,
        currentZodiac,
        lunarPhaseFormatted as LunarPhaseWithSpaces
      );

      logger.info('Initialized adapter with current planetary positions');
    } catch (error) {
      logger.error('Error initializing from current positions: ', error);
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
      logger.error('Error transforming items with planetary positions: ', error);
    }
  }

  /**
   * Transform items based on alchemical properties
   */
  private transformItems(): void {
    try {
      // Get alchemical results from the positions
      const result = alchemize();
        this.convertedPositions as unknown as Record<string, PlanetaryPosition>,
        this.isDaytime,
        this.lunarPhase || undefined,
        this.retrogradeStatus
      );

      this.alchemicalResult = result as unknown as Record<string, number>;

      // Safe type casting for result properties
      const resultData = result as unknown as any;

      // Prepare alchemical properties
      const alchemicalProperties = {
        Spirit: this.safeGetNumber(resultData.spirit),
        Essence: this.safeGetNumber(resultData.essence),
        Matter: this.safeGetNumber(resultData.matter),
        Substance: this.safeGetNumber(resultData.substance)
      };

      // Prepare elemental properties, converting to uppercase keys - safe property access
      const elementalBalance = this.safeExtractElementalBalance(resultData.elementalBalance);
      const elementalProperties = {
        Fire: elementalBalance.Fire || 0,
        Earth: elementalBalance.Earth || 0,
        Air: elementalBalance.Air || 0,
        Water: elementalBalance.Water || 0
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
              alchemicalProperties.Spirit = alchemicalProperties.Spirit + boost;
              break;
            case 'moon':
              alchemicalProperties.Essence = alchemicalProperties.Essence + boost;
              break;
            case 'mercury':
              alchemicalProperties.Substance = alchemicalProperties.Substance + boost * 0.6;
              alchemicalProperties.Spirit = alchemicalProperties.Spirit + boost * 0.4;
              break;
            case 'venus':
              alchemicalProperties.Essence = alchemicalProperties.Essence + boost;
              break;
            case 'mars':
              alchemicalProperties.Matter = alchemicalProperties.Matter + boost * 0.6;
              alchemicalProperties.Essence = alchemicalProperties.Essence + boost * 0.4;
              break;
            case 'jupiter':
              alchemicalProperties.Spirit = alchemicalProperties.Spirit + boost * 0.5;
              alchemicalProperties.Essence = alchemicalProperties.Essence + boost * 0.5;
              break;
            case 'saturn':
              alchemicalProperties.Matter = alchemicalProperties.Matter + boost;
              break;
            case 'uranus':
              alchemicalProperties.Spirit = alchemicalProperties.Spirit + boost * 0.3;
              alchemicalProperties.Substance = alchemicalProperties.Substance + boost * 0.7;
              break;
            case 'neptune':
              alchemicalProperties.Essence = alchemicalProperties.Essence + boost * 0.6;
              alchemicalProperties.Substance = alchemicalProperties.Substance + boost * 0.4;
              break;
            case 'pluto':
              alchemicalProperties.Matter = alchemicalProperties.Matter + boost * 0.7;
              alchemicalProperties.Essence = alchemicalProperties.Essence + boost * 0.3;
              break;
          }
        });
      }

      // Apply aspect influences if available
      if (this.aspects && this.aspects.length > 0) {
        this.aspects.forEach(aspect => {
          // Extract aspect data with safe property access
          const aspectData = aspect as unknown as any;
          const body1 = aspectData.body1;
          const body2 = aspectData.body2;
          const aspectType = aspectData.aspectType;

          // Lookup planet data for both bodies with safe string conversion
          const planet1 = typeof body1 === 'string' ? body1.toLowerCase() : undefined;
          const planet2 = typeof body2 === 'string' ? body2.toLowerCase() : undefined;

          if (!planet1 || !planet2 || !aspectType) return;

          // Get planets data
          const planetData1 = this.getPlanetData(planet1);
          const planetData2 = this.getPlanetData(planet2);

          // If either planet has aspect effects for the other planet
          if (planetData1.AspectsEffect?.[planet2]) {
            const aspectEffect = planetData1.AspectsEffect[planet2][aspectType];
            if (aspectEffect) {
              // Boost alchemical properties based on aspect effect
              const boost = aspectEffect;
              // Extract alchemy data with safe property access
              const alchemyData1 = planetData1.Alchemy as any;
              const spirit1 = this.safeGetNumber(alchemyData1.Spirit);
              const essence1 = this.safeGetNumber(alchemyData1.Essence);
              const matter1 = this.safeGetNumber(alchemyData1.Matter);
              const substance1 = this.safeGetNumber(alchemyData1.Substance);

              alchemicalProperties.Spirit = alchemicalProperties.Spirit + spirit1 * boost;
              alchemicalProperties.Essence = alchemicalProperties.Essence + essence1 * boost;
              alchemicalProperties.Matter = alchemicalProperties.Matter + matter1 * boost;
              alchemicalProperties.Substance = alchemicalProperties.Substance + substance1 * boost;
            }
          }

          if (planetData2.AspectsEffect?.[planet1]) {
            const aspectEffect = planetData2.AspectsEffect[planet1][aspectType];
            if (aspectEffect) {
              // Boost alchemical properties based on aspect effect
              const boost = aspectEffect;
              // Extract alchemy data with safe property access
              const alchemyData2 = planetData2.Alchemy as any;
              const spirit2 = this.safeGetNumber(alchemyData2.Spirit);
              const essence2 = this.safeGetNumber(alchemyData2.Essence);
              const matter2 = this.safeGetNumber(alchemyData2.Matter);
              const substance2 = this.safeGetNumber(alchemyData2.Substance);

              alchemicalProperties.Spirit = alchemicalProperties.Spirit + spirit2 * boost;
              alchemicalProperties.Essence = alchemicalProperties.Essence + essence2 * boost;
              alchemicalProperties.Matter = alchemicalProperties.Matter + matter2 * boost;
              alchemicalProperties.Substance = alchemicalProperties.Substance + substance2 * boost;
            }
          }
        });
      }

      // Transform ingredients
      this.transformedIngredients = transformIngredients(
        this.ingredients,
        elementalProperties,
        this.isDaytime,
        this.currentZodiac,
        this.lunarPhase
      );

      // Transform cooking methods
      this.transformedMethods = transformCookingMethods(
        this.methods,
        elementalProperties,
        this.isDaytime,
        this.currentZodiac,
        this.lunarPhase
      );

      // Transform cuisines
      this.transformedCuisines = transformCuisines(
        this.cuisines,
        elementalProperties,
        this.isDaytime,
        this.currentZodiac,
        this.lunarPhase
      );
    } catch (error) {
      logger.error('Error transforming items: ', error);

      // Create empty transformed arrays
      this.transformedIngredients = [];
      this.transformedMethods = [];
      this.transformedCuisines = [];
    }
  }

  /**
   * Safe extraction of elemental balance properties
   */
  private safeExtractElementalBalance(balance: unknown): Record<string, number> {
    if (!balance || typeof balance !== 'object') {
      return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    }

    const balanceRecord = balance as any;
    return {
      Fire: this.safeGetNumber(balanceRecord.Fire || balanceRecord.fire),
      Water: this.safeGetNumber(balanceRecord.Water || balanceRecord.water),
      Earth: this.safeGetNumber(balanceRecord.Earth || balanceRecord.earth),
      Air: this.safeGetNumber(balanceRecord.Air || balanceRecord.air)
    };
  }

  /**
   * Safe number extraction with fallback
   */
  private safeGetNumber(value: unknown): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    return 0;
  }

  /**
   * Get planet data from the planetInfo object
   */
  private getPlanetData(planet: string): Record<string, unknown> {
    const planetKey = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
    return (planetInfo[planetKey] || {}) as unknown as any;
  }

  /**
   * Get recommended ingredients based on current planetary alignments
   */
  getRecommendedIngredients(limit = 10): RecommendationResult<AlchemicalItem> {
    const items = this.getSortedItems(this.transformedIngredients, limit);
    // Compatibility scores: use gregsEnergy or 1.0 as fallback
    const scores = Object.fromEntries(
      items.map(item => [item.id, this.safeGetNumber((item as any).gregsEnergy) || 1.0])
    );
    return { items, scores, context: { source: 'RecommendationAdapter' } };
  }

  /**
   * Get recommended cooking methods based on current planetary alignments
   */
  getRecommendedCookingMethods(limit = 5): RecommendationResult<AlchemicalItem> {
    const items = this.getSortedItems(this.transformedMethods, limit);
    const scores = Object.fromEntries(
      items.map(item => [item.id, this.safeGetNumber((item as any).gregsEnergy) || 1.0])
    );
    return { items, scores, context: { source: 'RecommendationAdapter' } };
  }

  /**
   * Get recommended cuisines based on current planetary alignments
   */
  getRecommendedCuisines(limit = 5): RecommendationResult<AlchemicalItem> {
    const items = this.getSortedItems(this.transformedCuisines, limit);
    const scores = Object.fromEntries(
      items.map(item => [item.id, this.safeGetNumber((item as any).gregsEnergy) || 1.0])
    );
    return { items, scores, context: { source: 'RecommendationAdapter' } };
  }

  /**
   * Get items sorted by their alchemical energy and limited to the specified count
   */
  private getSortedItems(items: AlchemicalItem[], limit: number): AlchemicalItem[] {
    return items
      .sort((a, b) => {
        // Use gregsEnergy as primary sort field, defaulting to 0 if undefined
        const energyA = this.safeGetNumber((a as any).gregsEnergy);
        const energyB = this.safeGetNumber((b as any).gregsEnergy);
        return energyB - energyA; // Descending sort (highest energy first)
      })
      .slice(0, limit);
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
        if (nutrition) {
          // Extract nutrition data with safe property access
          const nutritionData = nutrition as any;
          const macros = nutritionData.macros;
          const vitamins = nutritionData.vitamins;
          const minerals = nutritionData.minerals;

          if (macros && vitamins && minerals) {
            const macrosData = macros as unknown;
            const vitaminsData = vitamins as unknown;
            const mineralsData = minerals;

            acc[ingredient.id] = Math.sqrt(
              this.safeGetNumber(macrosData.protein) * 0.4 +
                this.safeGetNumber(vitaminsData.vitaminC) * 0.3 +
                this.safeGetNumber(mineralsData.iron) * 0.3
            );
          } else {
            acc[ingredient.id] = 1; // Default multiplier if no nutrition data
          }
        } else {
          acc[ingredient.id] = 1; // Default multiplier if no nutrition data
        }
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private applyNutritionalBoost(
    item: TransformedItem,
    boosts: Record<string, number>
  ): TransformedItem {
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

  applyTarotEnergyBoosts(
    ingredient: AlchemicalItem,
    tarotEnergyBoosts: Record<string, number>
  ): AlchemicalItem {
    // Calculate alchemical properties from elemental properties if they don't exist
    const elementalProps = ingredient.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };

    // Calculate spirit, essence, matter, substance based on elemental properties if not already present
    // This follows the same relationships as in the alchemical system:
    // - Spirit is related to Fire (transformation)
    // - Essence is related to Water (fluidity)
    // - Matter is related to Earth (stability)
    // - Substance is related to Air (connection)
    const ingredientData = ingredient as any;
    const calculatedSpirit = this.safeGetNumber(ingredientData.spirit) ||
      ((elementalProps as any)?.Fire || 0) * 0.2 + ((elementalProps as any)?.Air || 0) * 0.2;
    const calculatedEssence = this.safeGetNumber(ingredientData.essence) ||
      ((elementalProps as any)?.Water || 0) * 0.2 + ((elementalProps as any)?.Fire || 0) * 0.2;
    const calculatedMatter = this.safeGetNumber(ingredientData.matter) ||
      ((elementalProps as any)?.Earth || 0) * 0.2 + ((elementalProps as any)?.Water || 0) * 0.2;
    const calculatedSubstance = this.safeGetNumber(ingredientData.substance) ||
      ((elementalProps as any)?.Air || 0) * 0.2 + ((elementalProps as any)?.Earth || 0) * 0.2;

    // Apply tarot boosts to calculated values
    const boostedSpirit = Math.min(
      Math.max(calculatedSpirit * (tarotEnergyBoosts.Spirit || 1.0), 0.1),
      1.0
    );
    const boostedEssence = Math.min(
      Math.max(calculatedEssence * (tarotEnergyBoosts.Essence || 1.0), 0.1),
      1.0
    );
    const boostedMatter = Math.min(
      Math.max(calculatedMatter * (tarotEnergyBoosts.Matter || 1.0), 0.1),
      1.0
    );
    const boostedSubstance = Math.min(
      Math.max(calculatedSubstance * (tarotEnergyBoosts.Substance || 1.0), 0.1),
      1.0
    );

    // Calculate energy metrics using the formulas with safety checks
    const fire = Math.max(elementalProps.Fire, 0.1);
    const water = Math.max(elementalProps.Water, 0.1);
    const air = Math.max(elementalProps.Air, 0.1);
    const earth = Math.max(elementalProps.Earth, 0.1);

    // Heat formula: (spirit^2 + fire^2) / (substance + essence + matter + water + air + earth)^2
    // Add safety checks to prevent division by zero and ensure positive results
    const denominatorHeat = Math.max(
      boostedSubstance + boostedEssence + boostedMatter + water + air + earth,
      0.1
    );
    let heat = (Math.pow(boostedSpirit, 2) + Math.pow(fire, 2)) / Math.pow(denominatorHeat, 2);

    // Entropy formula
    const denominatorEntropy = Math.max(boostedEssence + boostedMatter + earth + water, 0.1);
    let entropy = (Math.pow(boostedSpirit, 2) +
        Math.pow(boostedSubstance, 2) +
        Math.pow(fire, 2) +
        Math.pow(air, 2)) /
      Math.pow(denominatorEntropy, 2);

    // Reactivity formula
    const denominatorReactivity = Math.max(boostedMatter + earth, 0.1);
    let reactivity = (Math.pow(boostedSpirit, 2) +
        Math.pow(boostedSubstance, 2) +
        Math.pow(boostedEssence, 2) +
        Math.pow(fire, 2) +
        Math.pow(air, 2) +
        Math.pow(water, 2)) /
      Math.pow(denominatorReactivity, 2);

    // Normalize values to 0.0-1.0 range
    heat = Math.min(Math.max(heat, 0.1), 1.0);
    entropy = Math.min(Math.max(entropy, 0.1), 1.0);
    reactivity = Math.min(Math.max(reactivity, 0.1), 1.0);

    // Calculate gregsEnergy using the original formula: heat - (reactivity * entropy)
    // Then scale to the 0-1 range for UI friendliness
    const rawGregsEnergy = heat - reactivity * entropy;
    const scaledGregsEnergy = (rawGregsEnergy + 1) / 2; // Convert from range (-1,1) to (0,1)
    const gregsEnergy = Math.min(Math.max(scaledGregsEnergy, 0.1), 1.0);

    // Create updated properties with type assertion for AlchemicalItem compatibility
    return {
      ...ingredient,
      alchemicalProperties: {
        spirit: boostedSpirit,
        essence: boostedEssence,
        matter: boostedMatter,
        substance: boostedSubstance,
        heat,
        entropy,
        reactivity,
        gregsEnergy
      }
    } as unknown as AlchemicalItem;
  }

  /**
   * Get the dominant element based on alchemical results
   */
  getDominantElement(): ElementalCharacter | null {
    if (!this.alchemicalResult) return null;

    const elementName = (this.alchemicalResult as any).dominantElement;
    // Normalize to proper case for ElementalCharacter - ensure we're comparing strings
    if (String(elementName) === 'fire') return 'Fire';
    if (String(elementName) === 'water') return 'Water';
    if (String(elementName) === 'earth') return 'Earth';
    if (String(elementName) === 'air') return 'Air';

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
      // Extract elemental balance with safe property access
      const alchemicalData = this.alchemicalResult as any;
       
      const elementalBalance = (alchemicalData.elementalBalance ) || {};
      const fire = Number(elementalBalance?.Fire) || 0;
      const spirit = alchemicalData.spirit || 0;

      // Heat is primarily influenced by Fire element and Spirit property
      return (Number(fire) * 0.6 + Number(spirit) * 0.4) / 2;
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
      // Extract elemental balance with safe property access
      const alchemicalData = this.alchemicalResult as any;
       
      const elementalBalance = (alchemicalData.elementalBalance ) || {};
      const air = Number(elementalBalance?.Air) || 0;
      const substance = alchemicalData.substance || 0;

      // Entropy is primarily influenced by Air element and Substance property
      return (Number(air) * 0.7 + Number(substance) * 0.3) / 2;
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
      // Extract elemental balance with safe property access
      const alchemicalData = this.alchemicalResult as any;
       
      const elementalBalance = (alchemicalData.elementalBalance ) || {};
      const essence = Number(alchemicalData.essence) || 0;
      const water = Number(elementalBalance?.Water) || 0;

      // Reactivity is primarily influenced by Water element and Essence property
      return (Number(water) * 0.5 + Number(essence) * 0.5) / 2;
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
      // Extract data with safe property access
      const alchemicalData = this.alchemicalResult as any;

      const elementalBalanceData = (alchemicalData.elementalBalance) || {};

      const Fire = Number(elementalBalanceData?.Fire) || 0;
      const Water = Number(elementalBalanceData?.Water) || 0;
      const Earth = Number(elementalBalanceData?.Earth) || 0;
      const Air = Number(elementalBalanceData?.Air) || 0;

      const spirit = Number(alchemicalData.spirit) || 0;
      const essence = Number(alchemicalData.essence) || 0;
      const matter = Number(alchemicalData.matter) || 0;
      const substance = Number(alchemicalData.substance) || 0;

      // Weighted combination of all elements and properties
      const elementalBalance = (Number(Fire) + Number(Water) + Number(Earth) + Number(Air)) / 4;
      const propertyBalance =
        (Number(spirit) + Number(essence) + Number(matter) + Number(substance)) / 4;

      return elementalBalance * 0.4 + propertyBalance * 0.6;
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
      Sun: 'Fire',
      Moon: 'Water',
      Mercury: 'Air',
      Venus: 'Earth',
      Mars: 'Fire',
      Jupiter: 'Air',
      Saturn: 'Earth',
      Uranus: 'Air',
      Neptune: 'Water',
      Pluto: 'Water'
    };
    return planetMap[planet];
  }
}