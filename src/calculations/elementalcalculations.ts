import { ElementalEnergy, ElementType, signElementMap } from '../types/elements';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '../constants/elementalConstants';
import type { ZodiacSign, Planet } from '../types/shared';
import type { ElementalProperties } from '../types';

// Define the types needed for ElementalCalculator
interface RecipeWithElements {
  elementalProperties: ElementalProperties;
  season?: string | string[];
}

// Define a type for planetary position
interface PlanetaryPosition {
  sign?: string;
  degree?: number;
  [key: string]: unknown;
}

/**
 * ElementalCalculator class for managing and calculating elemental state
 */
export class ElementalCalculator {
  private static instance: ElementalCalculator;
  private currentBalance: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES;
  private initialized = false;

  private constructor() {}

  /**
   * Get the singleton instance of ElementalCalculator
   */
  public static getInstance(): ElementalCalculator {
    if (!this.instance) {
      this.instance = new ElementalCalculator();
    }
    return this.instance;
  }

  /**
   * Initialize the calculator with default values
   */
  public initialize(): void {
    if (!this.initialized) {
      this.currentBalance = { ...DEFAULT_ELEMENTAL_PROPERTIES };
      this.initialized = true;
    }
  }

  /**
   * Get the current elemental state
   */
  public getCurrentState(): ElementalProperties {
    return { ...this.currentBalance };
  }

  /**
   * Set a new elemental state
   */
  public setState(newState: Partial<ElementalProperties>): void {
    this.currentBalance = {
      ...this.currentBalance,
      ...newState
    };
    
    // Normalize the values
    this.normalizeElementalProperties();
  }

  /**
   * Normalize the elemental properties to ensure they sum to 1
   */
  private normalizeElementalProperties(): void {
    const total = Object.values(this.currentBalance).reduce((sum, val) => sum + val, 0);
    
    if (total > 0) {
      Object.keys(this.currentBalance).forEach(key => {
        this.currentBalance[key] = this.currentBalance[key] / total;
      });
    }
  }

  /**
   * Calculate elemental compatibility between two elements
   * Following the elemental principles, each element works best with itself
   * and all elements have good compatibility with each other (no opposites)
   */
  public calculateElementalCompatibility(element1: string, element2: string): number {
    // Same element has highest compatibility
    if (element1 === element2) {
      return 0.9; // High compatibility for same element
    }
    
    // All different element combinations have good compatibility
    return 0.7; // Good compatibility for different elements
  }

  /**
   * Calculate compatibility between planet and zodiac sign
   */
  public calculatePlanetSignCompatibility(planet: Planet, sign: ZodiacSign): number {
    // Implementation based on astrological rulerships and exaltations
    // This is a simplified version, would need expansion with actual rulership data
    return 0.75; // Default reasonable compatibility
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
    phase = 'default',
    time = 'neutral'
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
      Air: 0.25
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
      seasonalInfluence
    };
  }
}

/**
 * Export the singleton instance for use throughout the application
 */
export const elementalCalculator = ElementalCalculator.getInstance();

/**
 * Default export for the ElementalCalculator class for module consistency
 */
export default ElementalCalculator;

/**
 * Gets the planetary influencers for a specific element
 * @param planetaryPositions The current planetary positions
 * @param elementType The element type to get influencers for
 * @returns Array of planetary influencers
 */
function getPlanetaryInfluencers(
  planetaryPositions: Record<string, PlanetaryPosition>,
  elementType: ElementType
): string[] {
  // Define which planets influence which elements
  const elementInfluencers: Record<ElementType, string[]> = {
    fire: ['sun', 'mars', 'jupiter'],
    water: ['moon', 'venus', 'neptune'],
    earth: ['venus', 'saturn', 'pluto'],
    air: ['mercury', 'uranus', 'jupiter'],
    metal: ['venus', 'mercury'],
    wood: ['jupiter', 'neptune'],
    void: ['pluto', 'uranus']
  };

  // Get the potential influencers for this element
  const potentialInfluencers = elementInfluencers[elementType] || [];
  
  // Return only the planets that are actually present in the positions data
  return potentialInfluencers.filter(planet => 
    planetaryPositions[planet] && 
    planetaryPositions[planet].sign
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
  planetaryPositions: Record<string, PlanetaryPosition>, 
  isDaytime = true
): ElementalEnergy[] {
  if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
    console.warn('No planetary positions provided for elemental calculation');
    return getDefaultElementalEnergies();
  }

  // Initialize energy values for each element
  const energyValues: Record<ElementType, number> = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    metal: 0,
    wood: 0,
    void: 0
  };

  // Go through each planet in the positions data
  for (const [planet, position] of Object.entries(planetaryPositions)) {
    // Skip if position is invalid
    if (!position) continue;
    
    // Skip if position doesn't have a sign
    if (!position.sign) continue;
    
    // Convert the sign to lowercase to ensure matching
    const sign = position.sign.toLowerCase();
    
    // Get the element of the sign
    const element = signElementMap[sign];
    
    if (!element) continue;
    
    // Determine the weight of influence for this planet
    let weight = 1.0;
    
    // Luminaries have stronger influence
    if (planet === 'sun' || planet === 'moon') {
      weight = 2.0;
    }
    
    // Add the weighted energy to the appropriate element
    energyValues[element] += weight;
  }

  // Transform the energy values into the ElementalEnergy array
  return Object.entries(energyValues).map(([element, value]) => ({
    type: element as ElementType,
    strength: normalizeEnergyValue(value),
    influence: getPlanetaryInfluencers(planetaryPositions, element as ElementType)
  }));
}

/**
 * Returns default elemental energies when no data is available
 */
function getDefaultElementalEnergies(): ElementalEnergy[] {
  return [
    { type: 'fire', strength: 0.25, influence: [] },
    { type: 'water', strength: 0.25, influence: [] },
    { type: 'earth', strength: 0.25, influence: [] },
    { type: 'air', strength: 0.25, influence: [] }
  ];
}

/**
 * Normalizes an energy value to a range of 0-1
 * @param value Raw energy value
 * @returns Normalized value between 0 and 1
 */
function normalizeEnergyValue(value: number): number {
  // Cap at a maximum of 10 for scaling purposes
  const cappedValue = Math.min(value, 10);
  
  // Scale to 0-1 range
  return cappedValue / 10;
} 