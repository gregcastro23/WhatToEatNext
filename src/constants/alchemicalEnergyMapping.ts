import type { ElementalProperties } from '@/types/alchemy';
import {
  CelestialPosition,
  AlchemicalProperties,
  ThermodynamicProperties
} from '@/types/celestial';
import { createLogger } from '@/utils/logger';

export interface AlchemicalEnergyState {
  name: 'Spirit' | 'Substance' | 'Essence' | 'Matter';
  level: 'Highest' | 'Middle' | 'Lowest';
  description: string;
  chakra: string;
  planets: {
    daytime: string[];
    nighttime: string[];
  };
  elements: string[];
  properties: {
    heat: '+' | '-';
    entropy: '+' | '-';
    reactivity: '+' | '-';
  };
}

// Alchemical energy states based on the provided table
export const _ALCHEMICAL_ENERGY_STATES: AlchemicalEnergyState[] = [
  {
    name: 'Spirit',
    level: 'Highest',
    description: 'Energy that exists beyond Matter; Mind',
    chakra: 'Crown Chakra',
    planets: {
      daytime: ['Sun', 'Jupiter', 'Saturn', 'Mercury'],
      nighttime: []
    },
    elements: ['Fire', 'Air'],
    properties: {
      heat: '+',
      entropy: '+',
      reactivity: '+'
    }
  },
  {
    name: 'Substance',
    level: 'Middle',
    description: 'That which is of reactive, mutable matter',
    chakra: 'Throat Chakra',
    planets: {
      daytime: [],
      nighttime: ['Mercury', 'Neptune']
    },
    elements: ['Air', 'Earth'],
    properties: {
      heat: '-',
      entropy: '+',
      reactivity: '+'
    }
  },
  {
    name: 'Essence',
    level: 'Middle',
    description: 'That which an object cannot exist without',
    chakra: 'Brow, Solar Plexus, Sacral Chakras',
    planets: {
      daytime: ['Venus', 'Mars'],
      nighttime: ['Jupiter', 'Neptune']
    },
    elements: ['Fire', 'Water'],
    properties: {
      heat: '-',
      entropy: '-',
      reactivity: '+'
    }
  },
  {
    name: 'Matter',
    level: 'Lowest',
    description: 'That which is minimally reactive',
    chakra: 'Root Chakra',
    planets: {
      daytime: [],
      nighttime: ['Venus', 'Saturn', 'Mars', 'Uranus']
    },
    elements: ['Water', 'Earth'],
    properties: {
      heat: '-',
      entropy: '-',
      reactivity: '-'
    }
  }
];

// The Moon appears in both Essence and Matter states
export const _SHARED_PLANETS = {
  Moon: ['Essence', 'Matter']
};

// Create a component-specific logger
const logger = createLogger('alchemicalEnergyMapping');

// Define day/night element maps for all planets
export const _planetElementMap = (isDaytime: boolean): Record<string, string> => ({
  sun: 'Fire', // Sun is always Fire
  moon: 'Water', // Moon is always Water
  mercury: isDaytime ? 'Air' : 'Earth',
  venus: isDaytime ? 'Water' : 'Earth',
  mars: isDaytime ? 'Fire' : 'Water',
  jupiter: isDaytime ? 'Air' : 'Fire',
  saturn: isDaytime ? 'Air' : 'Earth',
  uranus: isDaytime ? 'Water' : 'Air',
  neptune: 'Water', // Neptune is always Water
  pluto: isDaytime ? 'Earth' : 'Water',
  northnode: 'Fire',
  southnode: 'Earth',
  chiron: 'Water',
  ascendant: 'Earth'
});

// Define day/night alchemical property maps
export const planetPropertyMap = (isDaytime: boolean): Record<string, string> => ({
  sun: 'Spirit', // Always Spirit
  moon: 'Essence', // Always Essence
  mercury: isDaytime ? 'Spirit' : 'Matter',
  venus: isDaytime ? 'Essence' : 'Matter',
  mars: isDaytime ? 'Essence' : 'Essence',
  jupiter: isDaytime ? 'Spirit' : 'Spirit',
  saturn: isDaytime ? 'Spirit' : 'Matter',
  uranus: isDaytime ? 'Essence' : 'Substance',
  neptune: 'Essence', // Always Essence
  pluto: isDaytime ? 'Matter' : 'Essence',
  northnode: 'Spirit',
  southnode: 'Matter',
  chiron: 'Essence',
  ascendant: 'Matter'
});

// Direct mapping from alchemical properties to elements
const _: Record<string, string> = {
  Spirit: 'Fire',
  Essence: 'Water',
  Matter: 'Earth',
  Substance: 'Air'
};

/**
 * Calculate the distribution of alchemical properties based on planetary positions
 */
export function calculateAlchemicalDistribution(
  planetaryPositions: Record<string, CelestialPosition>,
  isDaytime: boolean,
): AlchemicalProperties {
  try {
    // Initialize with balanced values
    const distribution: AlchemicalProperties = {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25
    };

    // Skip calculation if no positions provided
    if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
      return distribution;
    }

    // Get the property map based on day/night
    const propertyMap = planetPropertyMap(isDaytime);

    // Track the total influence to normalize later
    let totalInfluence = 0;
    const influences: Record<string, number> = {
      Spirit: 0,
      Essence: 0,
      Matter: 0,
      Substance: 0
    };

    // Calculate the influence of each planet
    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      // Skip invalid data
      if (!position || typeof position !== 'object') {
        return;
      }

      // Get the alchemical property for this planet
      const planetLower = planet.toLowerCase();
      const property = propertyMap[planetLower];

      if (!property) {
        return;
      }

      // Base influence - importance of planet
      let influence = 1.0;

      // Adjust based on planet importance
      if (['sun', 'moon'].includes(planetLower)) {
        influence = 2.0; // Luminaries have more influence
      } else if (['jupiter', 'saturn'].includes(planetLower)) {
        influence = 1.5; // Major planets
      } else if (['uranus', 'neptune', 'pluto'].includes(planetLower)) {
        influence = 0.8; // Outer planets less influence
      }

      // Add to the appropriate property
      if (property in influences) {
        influences[property] += influence;
        totalInfluence += influence;
      }
    });

    // Normalize the influences to sum to 1
    if (totalInfluence > 0) {
      Object.keys(influences).forEach(property => {
        distribution[property as keyof AlchemicalProperties] =
          influences[property] / totalInfluence;
      });
    }

    return distribution;
  } catch (error) {
    logger.error('Error calculating alchemical distribution:', error);
    return {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25
    };
  }
}

/**
 * Convert alchemical properties to elemental properties
 */
export function convertToElementalProperties(
  alchemicalProps: AlchemicalProperties,
): ElementalProperties {
  try {
    const elementalProps: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };

    // Map alchemical properties to elemental properties
    elementalProps.Fire = alchemicalProps.Spirit;
    elementalProps.Water = alchemicalProps.Essence;
    elementalProps.Earth = alchemicalProps.Matter;
    elementalProps.Air = alchemicalProps.Substance;

    return elementalProps;
  } catch (error) {
    logger.error('Error converting to elemental properties:', error);
    return {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
  }
}

/**
 * Calculate thermodynamic properties based on alchemical distribution
 */
export function calculateThermodynamicProperties(
  alchemicalProps: AlchemicalProperties,
): ThermodynamicProperties {
  try {
    // Heat is related to Fire/Spirit and Air/Substance
    // High Spirit and Substance values increase heat
    const heat = 0.6 * alchemicalProps.Spirit + 0.4 * alchemicalProps.Substance;

    // Entropy is related to Air/Substance and Water/Essence
    // High Substance and Essence values increase entropy
    const entropy = 0.6 * alchemicalProps.Substance + 0.4 * alchemicalProps.Essence;

    // Reactivity is related to Fire/Spirit and Water/Essence
    // High Spirit and Essence values increase reactivity
    const reactivity = 0.5 * alchemicalProps.Spirit + 0.5 * alchemicalProps.Essence;

    // Calculate Greg's Energy using the standard formula
    const gregsEnergy = heat - entropy * reactivity;

    return {
      heat,
      entropy,
      reactivity,
      gregsEnergy
    };
  } catch (error) {
    logger.error('Error calculating thermodynamic properties:', error);
    return {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: -0.35, // Calculated using heat - (entropy * reactivity), // Default Greg's Energy calculation
    };
  }
}
