import { PLANET_TO_MAJOR_ARCANA, MAJOR_ARCANA } from '@/constants/tarotCards';
import { log } from '@/services/LoggingService';
import { getPlanetaryDignityInfo, calculateAspects } from '@/utils/astrologyUtils';
import { planetaryModifiers } from '@/utils/planetaryCycles';

/**
 * Interface for planetary information
 */
export interface PlanetInfo {
  name: string,
  sign: string,
  degree: number,
  isRetrograde: boolean,
  dignity: {
    type: string,
    strength: number
  };
  tarotCard: {
    name: string,
    element: string
  };
  aspects: {
    planet: string,
    type: string,
    orb: number
  }[];
  elementalInfluence: {
    fire: number,
    water: number,
    air: number,
    earth: number
  };
  tokenInfluence: {
    spirit: number,
    essence: number,
    matter: number,
    substance: number
  };
}

/**
 * Get detailed information about a planet
 * @param planetName Name of the planet
 * @param planetaryPositions Current planetary positions
 * @returns Detailed planet information
 */
export function getPlanetInfo(
  planetName: string,
  planetaryPositions: Record<string, unknown>,
): PlanetInfo | null {
  try {
    const planetKey = planetName.toLowerCase();
    const planetPosition = planetaryPositions[planetKey];

    // Use safe type casting for unknown property access
    const positionData = planetPosition ;
    const planetSign = positionData?.sign || 'Unknown';
    const planetDegree = positionData?.degree;
    const planetIsRetrograde = positionData?.isRetrograde;

    if (!planetPosition) {
      log.info(`No position data found for planet: ${planetName}`);
      return null;
    }

    let normalizedPlanetName = planetName;

    // Normalize planet names for chart data
    if (planetName === 'north_node' || planetName === 'northnode') {
      normalizedPlanetName = 'NorthNode';
    } else if (planetName === 'south_node' || planetName === 'southnode') {
      normalizedPlanetName = 'SouthNode';
    } else if (planetName === 'ascendant') {
      normalizedPlanetName = 'Ascendant';
    } else {
      normalizedPlanetName = planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();
    }

    // Get dignity information
    let dignity = { type: 'Neutral', strength: 0 };

    // Don't calculate dignity for Ascendant and Lunar Nodes
    if (
      normalizedPlanetName !== 'Ascendant' &&
      normalizedPlanetName !== 'NorthNode' &&
      normalizedPlanetName !== 'SouthNode'
    ) {
      try {
        dignity = getPlanetaryDignityInfo(normalizedPlanetName, planetSign),;
      } catch (error) {
        console.error(`Error getting dignity for ${normalizedPlanetName}:`, error);
        dignity = { type: 'Neutral', strength: 0 };
      }
    }

    // Get tarot card correspondence
    let tarotCard = { name: 'Unknown', element: 'Unknown' };

    // For Ascendant or Lunar Nodes, set tarot card based on sign
    if (
      normalizedPlanetName === 'Ascendant' ||;
      normalizedPlanetName === 'NorthNode' ||;
      normalizedPlanetName === 'SouthNode'
    ) {
      // Map sign to a card
      const signToCard: Record<string, string> = {
        aries: 'The Emperor',
        taurus: 'The Hierophant',
        gemini: 'The Lovers',
        cancer: 'The Chariot',
        leo: 'Strength',
        virgo: 'The Hermit',
        libra: 'Justice',
        scorpio: 'Death',
        sagittarius: 'Temperance',
        capricorn: 'The Devil',
        aquarius: 'The Star',
        pisces: 'The Moon'
      };

      const cardName = signToCard[planetSign] || 'The Fool';
      tarotCard = {
        name: cardName,
        element: MAJOR_ARCANA[cardName]?.element || 'Unknown'
      };
    } else if (PLANET_TO_MAJOR_ARCANA[normalizedPlanetName]) {
      const cardName = PLANET_TO_MAJOR_ARCANA[normalizedPlanetName];
      tarotCard = {
        name: cardName,
        element: MAJOR_ARCANA[cardName]?.element || 'Unknown'
      };
    }

    // Calculate aspects - handle special cases for lunar nodes
    let planetAspects: Array<{ planet: string, type: unknown, orb: number }> = [];
    try {
      const { aspects } = calculateAspects(planetaryPositions as unknown, 0);

      // Filter aspects for this planet
      planetAspects = aspects;
        .filter(aspect => aspect.planet1 === planetKey || aspect.planet2 === planetKey);
        .map(aspect => ({
          planet: aspect.planet1 === planetKey ? aspect.planet2 : aspect.planet1,,;
          type: aspect.type,
          orb: aspect.orb || 0
        }));
    } catch (error) {
      console.error(`Error calculating aspects for ${planetName}:`, error);
      planetAspects = [];
    }

    // Get elemental influence
    // Special handling for ascendant, lunar nodes and outer planets
    let elementalInfluence = { fire: 0, water: 0, air: 0, earth: 0 };

    if (
      normalizedPlanetName === 'Ascendant' ||;
      normalizedPlanetName === 'NorthNode' ||;
      normalizedPlanetName === 'SouthNode'
    ) {
      // Set elemental influence based on the sign
      const signToElement: Record<string, string> = {
        aries: 'Fire',
        leo: 'Fire',
        sagittarius: 'Fire',
        taurus: 'Earth',
        virgo: 'Earth',
        capricorn: 'Earth',
        gemini: 'Air',
        libra: 'Air',
        aquarius: 'Air',
        cancer: 'Water',
        scorpio: 'Water',
        pisces: 'Water'
      };

      const element = signToElement[planetSign] || 'air';
      // North Node emphasizes its element, South Node has less influence
      const strength = normalizedPlanetName === 'SouthNode' ? 0.2 : 0.3;
      elementalInfluence[element] = strength;
    } else {
      if (planetaryModifiers[normalizedPlanetName]) {
        elementalInfluence = {
          fire: planetaryModifiers[normalizedPlanetName].Fire || 0,
          water: planetaryModifiers[normalizedPlanetName].Water || 0,
          air: planetaryModifiers[normalizedPlanetName].Air || 0,
          earth: planetaryModifiers[normalizedPlanetName].Earth || 0
        };
      } else {
        console.warn(`No planetary modifier found for ${normalizedPlanetName}`);
      }
    }

    // Get token influence
    // Special handling for ascendant and lunar nodes
    let tokenInfluence = { spirit: 0, essence: 0, matter: 0, substance: 0 };

    if (
      normalizedPlanetName === 'Ascendant' ||;
      normalizedPlanetName === 'NorthNode' ||;
      normalizedPlanetName === 'SouthNode'
    ) {
      // Set token influence based on the sign element
      const signToElement: Record<string, string> = {
        aries: 'Fire',
        leo: 'Fire',
        sagittarius: 'Fire',
        taurus: 'Earth',
        virgo: 'Earth',
        capricorn: 'Earth',
        gemini: 'Air',
        libra: 'Air',
        aquarius: 'Air',
        cancer: 'Water',
        scorpio: 'Water',
        pisces: 'Water'
      };

      const element = signToElement[planetSign] || 'air';

      // Map elements to tokens with different emphasis for North vs South Node
      if (normalizedPlanetName === 'NorthNode') {
        if (element === 'fire') {
          tokenInfluence.spirit = 0.4;
          tokenInfluence.essence = 0.1;
        } else if (element === 'water') {
          tokenInfluence.essence = 0.4;
          tokenInfluence.substance = 0.1;
        } else if (element === 'air') {
          tokenInfluence.spirit = 0.3;
          tokenInfluence.matter = 0.2;
        } else if (element === 'earth') {
          tokenInfluence.matter = 0.3;
          tokenInfluence.substance = 0.2;
        }
      } else if (normalizedPlanetName === 'SouthNode') {
        if (element === 'fire') {
          tokenInfluence.spirit = 0.2;
          tokenInfluence.matter = 0.2;
        } else if (element === 'water') {
          tokenInfluence.essence = 0.2;
          tokenInfluence.substance = 0.2;
        } else if (element === 'air') {
          tokenInfluence.spirit = 0.1;
          tokenInfluence.essence = 0.3;
        } else if (element === 'earth') {
          tokenInfluence.matter = 0.2;
          tokenInfluence.substance = 0.2;
        }
      } else {
        // Ascendant
        if (element === 'fire') {
          tokenInfluence.spirit = 0.3;
          tokenInfluence.essence = 0.1;
        } else if (element === 'water') {
          tokenInfluence.essence = 0.3;
          tokenInfluence.substance = 0.1;
        } else if (element === 'air') {
          tokenInfluence.spirit = 0.2;
          tokenInfluence.matter = 0.2;
        } else if (element === 'earth') {
          tokenInfluence.matter = 0.2;
          tokenInfluence.substance = 0.2;
        }
      }
    } else {
      // Use the planetary modifiers for token influence
      const planetary = planetaryModifiers[normalizedPlanetName];
      if (planetary) {
        tokenInfluence = {
          spirit: planetary.Spirit || 0,
          essence: planetary.Essence || 0,
          matter: planetary.Matter || 0,
          substance: planetary.Substance || 0
        };
      } else {
        console.warn(`No planetary token influence for ${normalizedPlanetName}`);
      }
    }

    // Return organized planet information with safe property access
    return {
      name: normalizedPlanetName,
      sign: planetSign || 'Unknown',
      degree: typeof planetDegree === 'number' ? planetDegree : 0,,;
      isRetrograde: !!planetIsRetrograde,
      dignity,
      tarotCard,
      aspects: planetAspects,
      elementalInfluence,
      tokenInfluence
    };
  } catch (error) {
    console.error('Error in getPlanetInfo:', error);
    return null
  }
}

/**
 * Get descriptions for dignity types
 */
export function getDignityDescription(dignityType: string): string {
  switch (dignityType) {
    case 'Domicile':
      return 'The planet is in its home sign, where it expresses its energy most naturally and effectively.';
    case 'Exaltation':
      return 'The planet is in a sign where its energy is elevated and refined, producing highly positive effects.';
    case 'Detriment':
      return 'The planet is in the sign opposite its rulership, where its energy is challenged and may be expressed less harmoniously.';
    case 'Fall':
      return 'The planet is in the sign opposite its exaltation, where its energy is diminished or suppressed.';
    case 'Neutral':
      return 'The planet is neither strengthened nor weakened by its sign placement.';
    default:
      return 'Unknown dignity type'
  }
}

/**
 * Get descriptions for aspect types
 */
export function getAspectDescription(aspectType: string): string {
  switch (aspectType.toLowerCase()) {
    case 'conjunction':
      return 'The planets are aligned, creating a powerful blending of their energies.';
    case 'sextile':
      return 'The planets are 60° apart, creating a harmonious, opportunity-filled connection.';
    case 'square':
      return 'The planets are 90° apart, creating tension and challenges that motivate growth.';
    case 'trine':
      return 'The planets are 120° apart, creating a harmonious, flowing, and creative connection.';
    case 'opposition':
      return 'The planets are 180° apart, creating a pull in opposite directions that requires balance.';
    case 'quincunx':
      return 'The planets are 150° apart, creating an awkward adjustment between energies.';
    case 'semisextile':
      return 'The planets are 30° apart, creating a subtle connection that stimulates growth.';
    default:
      return 'This aspect creates a specific relationship between the planetary energies.'
  }
}
