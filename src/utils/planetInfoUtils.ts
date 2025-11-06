import { __MAJOR_ARCANA, __PLANET_TO_MAJOR_ARCANA } from '@/constants/tarotCards';
import { log } from '@/services/LoggingService';
import {
  calculateAspects,
  getCurrentAstrologicalState,
  getPlanetaryDignityInfo
} from '@/utils/astrologyUtils';
import { planetaryModifiers } from '@/utils/planetaryCycles';

export interface PlanetInfo {
  name: string;
  sign: string;
  degree: number;
  isRetrograde: boolean;
  dignity: {
    type: string;
    strength: number
  };
  tarotCard: {
    name: string,
    element: string
  };
  aspects: Array<{
    planet: string,
    type: string,
    orb: number
  }>;
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

export async function getPlanetInfo(
  planetName: string,
  planetaryPositions?: Record<string, unknown>
): Promise<PlanetInfo | null> {
  try {
    const state = planetaryPositions
      ? { currentPlanetaryAlignment: planetaryPositions }
      : await getCurrentAstrologicalState();

    const positions = state.currentPlanetaryAlignment as Record<string, unknown>;
    const planetKey = planetName.toLowerCase();
    const planetPosition = positions[planetKey];

    if (!planetPosition) {
      log.info(`No position data found for planet ${planetName}`);
      return null;
    }

    const positionData = planetPosition as Record<string, unknown>;
    const planetSign = String(positionData.sign || 'Unknown').toLowerCase();
    const planetDegree = Number(positionData.degree ?? 0);
    const planetIsRetrograde = Boolean(positionData.isRetrograde);

    let normalizedPlanetName: string;
    if (planetName === 'north_node' || planetName === 'northnode') {
      normalizedPlanetName = 'NorthNode';
    } else if (planetName === 'south_node' || planetName === 'southnode') {
      normalizedPlanetName = 'SouthNode';
    } else if (planetName === 'ascendant') {
      normalizedPlanetName = 'Ascendant';
    } else {
      normalizedPlanetName = planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();
    }

    let dignity = { type: 'Neutral', strength: 0 };
    if (!['Ascendant', 'NorthNode', 'SouthNode'].includes(normalizedPlanetName)) {
      try {
        dignity = getPlanetaryDignityInfo(normalizedPlanetName, planetSign);
      } catch (error) {
        log.warn(`Error getting dignity for ${normalizedPlanetName}`, { error });
      }
    }

    let tarotCard = { name: 'Unknown', element: 'Unknown' };
    if (['Ascendant', 'NorthNode', 'SouthNode'].includes(normalizedPlanetName)) {
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
        element: _MAJOR_ARCANA[cardName]?.element || 'Unknown'
      };
    } else if (_PLANET_TO_MAJOR_ARCANA[normalizedPlanetName]) {
      const cardName = _PLANET_TO_MAJOR_ARCANA[normalizedPlanetName];
      tarotCard = {
        name: cardName,
        element: _MAJOR_ARCANA[cardName]?.element || 'Unknown'
      };
    }

    let planetAspects: Array<{ planet: string; type: string; orb: number }> = [];
    try {
      const { aspects } = calculateAspects(positions , 0);
      planetAspects = aspects
        .filter(aspect => aspect.planet1 === planetKey || aspect.planet2 === planetKey)
        .map(aspect => ({
          planet: aspect.planet1 === planetKey ? aspect.planet2 : aspect.planet1,
          type: aspect.type,
          orb: aspect.orb || 0
        }));
    } catch (error) {
      log.warn(`Error calculating aspects for ${planetName}`, { error });
    }

    let elementalInfluence = { fire: 0, water: 0, air: 0, earth: 0 };
    if (['Ascendant', 'NorthNode', 'SouthNode'].includes(normalizedPlanetName)) {
      const signToElement: Record<string, keyof typeof elementalInfluence> = {
        aries: 'fire',
        leo: 'fire',
        sagittarius: 'fire',
        taurus: 'earth',
        virgo: 'earth',
        capricorn: 'earth',
        gemini: 'air',
        libra: 'air',
        aquarius: 'air',
        cancer: 'water',
        scorpio: 'water',
        pisces: 'water'
};
      const element = signToElement[planetSign];
      const strength = normalizedPlanetName === 'SouthNode' ? 0.2 : 0.3;
      if (element) elementalInfluence[element] = strength;
    } else {
      const modifiers = planetaryModifiers[normalizedPlanetName];
      if (modifiers) {
        elementalInfluence = {
          fire: modifiers.Fire ?? 0,
          water: modifiers.Water ?? 0,
          air: modifiers.Air ?? 0,
          earth: modifiers.Earth ?? 0
};
      } else {
        log.debug(`No planetary modifier found for ${normalizedPlanetName}`);
      }
    }

    let tokenInfluence = { spirit: 0, essence: 0, matter: 0, substance: 0 };
    if (['Ascendant', 'NorthNode', 'SouthNode'].includes(normalizedPlanetName)) {
      const signToToken: Record<string, keyof typeof tokenInfluence> = {
        aries: 'spirit',
        leo: 'spirit',
        sagittarius: 'spirit',
        taurus: 'matter',
        virgo: 'matter',
        capricorn: 'matter',
        gemini: 'essence',
        libra: 'essence',
        aquarius: 'essence',
        cancer: 'substance',
        scorpio: 'substance',
        pisces: 'substance'
};
      const token = signToToken[planetSign];
      const strength = normalizedPlanetName === 'SouthNode' ? 0.15 : 0.25;
      if (token) tokenInfluence[token] = strength;
    } else {
      const modifiers = planetaryModifiers[normalizedPlanetName];
      if (modifiers) {
        tokenInfluence = {
          spirit: modifiers.Spirit ?? 0,
          essence: modifiers.Essence ?? 0,
          matter: modifiers.Matter ?? 0,
          substance: modifiers.Substance ?? 0
};
      }
    }

    return {
      name: normalizedPlanetName,
      sign: planetSign,
      degree: planetDegree,
      isRetrograde: planetIsRetrograde,
      dignity,
      tarotCard,
      aspects: planetAspects,
      elementalInfluence,
      tokenInfluence
    };
  } catch (error) {
    log.error(`Error getting planet info for ${planetName}`, { error });
    return null;
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
    case 'Neutral': return 'The planet is neither strengthened nor weakened by its sign placement.';
    default:
      return 'Unknown dignity type';
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
      return 'This aspect creates a specific relationship between the planetary energies.';
  }
}
