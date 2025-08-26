import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type { Season } from '@/types/alchemy';
import { ElementalEnergy, ElementType, signElementMap } from '@/types/elements';

// Define the types needed for ElementalCalculator
interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number; // Allow indexing with string
}

/**
 * ElementalCalculator class for managing and calculating elemental state
 */
export class ElementalCalculator {
  private static instance: ElementalCalculator;
  private currentBalance: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES;
  private initialized = false;

  private constructor() {}

  static getInstance(): ElementalCalculator {
    if (!ElementalCalculator.instance) {
      ElementalCalculator.instance = new ElementalCalculator();
    }
    return ElementalCalculator.instance;
  }

  static initialize(): void {
    const instance = ElementalCalculator.getInstance();
    instance.currentBalance = { ...DEFAULT_ELEMENTAL_PROPERTIES };
    instance.initialized = true;
  }

  static getCurrentElementalState(): ElementalProperties {
    const instance = ElementalCalculator.getInstance();
    if (!instance.initialized) {
      ElementalCalculator.initialize();
    }
    return instance.currentBalance;
  }

  /**
   * Calculate the seasonal effectiveness of a recipe
   * @param recipe The recipe to evaluate
   * @param season The current season
   * @returns A score from 0-100 representing the effectiveness
   */
  static calculateSeasonalEffectiveness(recipe: unknown, season: string): number {
    const recipeData = recipe as unknown;
    if (!recipeData?.elementalProperties) return 0;

    const seasonalModifiers = this.getSeasonalModifiers(season as Season);
    let score = 0;

    // Calculate base seasonal alignment
    Object.entries((recipeData as any)?.elementalProperties).forEach(([element, value]) => {
      const modifier = seasonalModifiers[element as any] || 0;
      score += (value as number) * modifier * 100;
    });

    // Apply seasonal bonuses/penalties
    if ((recipeData as any)?.season) {
      const seasons = Array.isArray((recipeData as any)?.season) ? (recipeData as any)?.season : [(recipeData as any)?.season];
      if (seasons.map((s: string) => s.toLowerCase()).includes(season.toLowerCase())) {
        score += 20;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get elemental modifiers for a specific season
   */
  static getSeasonalModifiers(season: Season): ElementalProperties {
    const baseModifiers = { ...DEFAULT_ELEMENTAL_PROPERTIES };

    // Normalize season to lowercase for consistency with type definition
    const seasonLower = season.toLowerCase() as Season;

    switch (seasonLower) {
      case 'spring':
        baseModifiers.Air = 0.4;
        baseModifiers.Fire = 0.3;
        baseModifiers.Water = 0.2;
        baseModifiers.Earth = 0.1;
        break;
      case 'summer':
        baseModifiers.Fire = 0.4;
        baseModifiers.Air = 0.3;
        baseModifiers.Earth = 0.2;
        baseModifiers.Water = 0.1;
        break;
      case 'autumn':
      case 'fall':
        baseModifiers.Earth = 0.4;
        baseModifiers.Air = 0.3;
        baseModifiers.Water = 0.2;
        baseModifiers.Fire = 0.1;
        break;
      case 'winter':
        baseModifiers.Water = 0.4;
        baseModifiers.Earth = 0.3;
        baseModifiers.Fire = 0.2;
        baseModifiers.Air = 0.1;
        break;
      case 'all':
        // Balanced for 'all' season
        baseModifiers.Fire = 0.25;
        baseModifiers.Water = 0.25;
        baseModifiers.Earth = 0.25;
        baseModifiers.Air = 0.25;
        break;
      default:
        // Balanced for unknown seasons
        baseModifiers.Fire = 0.25;
        baseModifiers.Water = 0.25;
        baseModifiers.Earth = 0.25;
        baseModifiers.Air = 0.25;
    }

    return baseModifiers;
  }

  /**
   * Calculate harmony score for given elemental properties
   * @param properties Elemental properties to evaluate
   * @returns Harmony score between 0 and 1
   */
  static calculateHarmony(properties: ElementalProperties): number {
    if (!properties) return 0;

    // Check if properties are balanced
    const values = Object.values(properties);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Calculate variance from the ideal (perfect balance would be 0 variance)
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;

    // Convert variance to harmony score (0-1)
    return Math.max(0, Math.min(1, 1 - Math.sqrt(variance)));
  }

  /**
   * Calculate elemental state based on provided properties and conditions
   * @param baseProperties Base elemental properties
   * @param phase Optional phase/condition
   * @param time Optional time factor
   * @returns Enhanced elemental properties with additional information
   */
  calculateElementalState(
    baseProperties: ElementalProperties,
    _phase = 'default',
    time = 'neutral',
  ): {
    properties: ElementalProperties;
    seasonalInfluence: ElementalProperties;
  } {
    // Start with the base properties
    const properties = { ...baseProperties };

    // Create default seasonal influence
    const seasonalInfluence: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };

    // Apply time-based modifiers
    if (time === 'day') {
      properties.Fire = properties.Fire * 1.1;
      properties.Air = properties.Air * 1.05;
    } else if (time === 'night') {
      properties.Water = properties.Water * 1.1;
      properties.Earth = properties.Earth * 1.05;
    }

    // Normalize the properties to ensure they still sum to 1
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);

    if (total > 0) {
      Object.keys(properties).forEach(key => {
        properties[key] = properties[key] / total;

        // Update seasonal influence based on the normalized properties
        seasonalInfluence[key] = properties[key] * 1.5;
      });
    }

    return {
      properties,
      seasonalInfluence,
    };
  }
}

/**
 * Gets the planetary influencers for a specific element
 * @param planetaryPositions The current planetary positions
 * @param elementType The element type to get influencers for
 * @returns Array of planetary influencers
 */
function getPlanetaryInfluencers(
  planetaryPositions: Record<string, unknown>,
  elementType: ElementType,
): string[] {
  // Define which planets influence which elements - Pattern JJ-1: ElementType System Unification
  const elementInfluencers: Record<ElementType, string[]> = {
    Fire: ['sun', 'mars', 'jupiter'],
    Water: ['moon', 'venus', 'neptune'],
    Earth: ['venus', 'saturn', 'pluto'],
    Air: ['mercury', 'uranus', 'jupiter'],
    // Added extended elements mapped to core planetary influences
    Metal: ['venus', 'saturn', 'mercury'], // Structure, clarity, precision - maps to Earth/Air qualities
    Wood: ['sun', 'mars', 'jupiter'], // Growth, flexibility, expansion - maps to Fire qualities
    Void: ['mercury', 'uranus', 'neptune'], // Space, potential, emptiness - maps to Air/Water qualities
  };

  // Get the potential influencers for this element
  const potentialInfluencers = elementInfluencers[elementType] || [];

  // Return only the planets that are actually present in the positions data
  return potentialInfluencers.filter(
    planet => planetaryPositions[planet] && typeof planetaryPositions[planet] === 'object',
  );
}

/**
 * Calculates the elemental energies based on planetary positions
 *
 * @param planetaryPositions The current positions of planets
 * @param isDaytime Whether it's daytime or nighttime
 * @returns Array of elemental energies
 */
export function calculateElementalEnergies(
  planetaryPositions: Record<string, unknown>,
  isDaytime = true,
): ElementalEnergy[] {
  if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
    // console.warn('No planetary positions provided for elemental calculation');
    return getDefaultElementalEnergies();
  }

  // Initialize energy values for each element
  const energyValues: Record<ElementType, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
    // Pattern JJ-1: ElementType System Unification - Add extended elements with base element mapping
    Metal: 0, // Maps to Earth-like properties
    Wood: 0, // Maps to Fire-like properties
    Void: 0, // Maps to Air-like properties
  };

  // Define planetary influences (weights)
  const planetWeights: Record<string, number> = {
    sun: 0.25,
    moon: 0.2,
    mercury: 0.1,
    venus: 0.1,
    mars: 0.1,
    jupiter: 0.1,
    saturn: 0.1,
    uranus: 0.05,
    neptune: 0.05,
    pluto: 0.05,
  };

  // Calculate element values based on planetary positions
  let totalWeight = 0;

  for (const [planet, position] of Object.entries(planetaryPositions)) {
    const weight = planetWeights[planet.toLowerCase()] || 0.05;

    // Skip if position doesn't have a sign
    const positionData = position as unknown;
    if (!positionData?.sign) continue;

    // Convert the sign to lowercase to ensure matching
    const sign = (positionData as any)?.sign.toLowerCase();
    const element = signElementMap[sign];

    if (element) {
      energyValues[element] += weight;
      totalWeight += weight;
    }
  }

  // Apply day/night modifiers
  if (isDaytime) {
    energyValues.Fire *= 1.2;
    energyValues.Air *= 1.1;
  } else {
    energyValues.Water *= 1.2;
    energyValues.Earth *= 1.1;
  }

  // Normalize values to ensure they sum to 1
  if (totalWeight > 0) {
    const sum = Object.values(energyValues).reduce((acc, value) => acc + value, 0);

    for (const element of Object.keys(energyValues) as ElementType[]) {
      energyValues[element] = sum > 0 ? energyValues[element] / sum : 0;
    }
  }

  // Create ElementalEnergy objects
  const energies: ElementalEnergy[] = Object.entries(energyValues)
    .filter(([_, strength]) => strength > 0)
    .map(([type, strength]) => ({
      type: type as ElementType,
      strength,
      influence: getPlanetaryInfluencers(planetaryPositions, type as ElementType),
    }));

  return energies;
}

/**
 * Returns default elemental energies when no data is available
 */
function getDefaultElementalEnergies(): ElementalEnergy[] {
  return [
    { type: 'Fire', strength: 0.25, influence: [] },
    { type: 'Water', strength: 0.25, influence: [] },
    { type: 'Earth', strength: 0.25, influence: [] },
    { type: 'Air', strength: 0.25, influence: [] },
  ];
}

// Process a zodiac sign and its relevant position to update energy values
function _processZodiacInfluence(
  sign: string,
  weight: number,
  energyValues: ElementalProperties,
): void {
  const element = signElementMap[sign];

  if (element) {
    energyValues[element] += weight;
  }
}
