/**
 * Planetary Influences Module
 * 
 * Handles the mapping of planetary positions to alchemical properties
 * and calculates planetary influences on culinary recommendations.
 */

import type { PlanetaryPosition, ElementalProperties } from "@/types/alchemy";
import { getCachedCalculation } from '../../utils/calculationCache';

import { Element } from "@/types/alchemy";
/**
 * Planetary alchemical property mappings
 * Based on traditional alchemical correspondences
 */
export const PLANETARY_ALCHEMICAL_MAPPINGS = {
  Sun: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
  moon: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
  Venus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mars: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
  Saturn: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
  Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
  Pluto: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
};

/**
 * Planetary elemental correspondences (day/night variations)
 */
export const PLANETARY_ELEMENTAL_MAPPINGS = {
  diurnal: {
    Sun: 'Fire',
    moon: 'Water',
    Mercury: 'Air',
    Venus: 'Water',
    Mars: 'Fire',
    Jupiter: 'Air',
    Saturn: 'Air',
    Uranus: 'Water',
    Neptune: 'Water',
    Pluto: 'Earth'
  },
  nocturnal: {
    Sun: 'Fire',
    moon: 'Water',
    Mercury: 'Earth',
    Venus: 'Earth',
    Mars: 'Water',
    Jupiter: 'Fire',
    Saturn: 'Earth',
    Uranus: 'Air',
    Neptune: 'Water',
    Pluto: 'Water'
  }
} as const;

/**
 * Planetary dignity effects
 */
export const PLANETARY_DIGNITIES = {
  Sun: { 
    rulership: ['leo'], 
    exaltation: ['aries'], 
    detriment: ['aquarius'], 
    fall: ['libra'] 
  },
  moon: { 
    rulership: ['cancer'], 
    exaltation: ['taurus'], 
    detriment: ['capricorn'], 
    fall: ['scorpio'] 
  },
  Mercury: { 
    rulership: ['gemini', 'virgo'], 
    exaltation: ['virgo'], 
    detriment: ['sagittarius', 'pisces'], 
    fall: ['pisces'] 
  },
  Venus: { 
    rulership: ['taurus', 'libra'], 
    exaltation: ['pisces'], 
    detriment: ['aries', 'scorpio'], 
    fall: ['virgo'] 
  },
  Mars: { 
    rulership: ['aries', 'scorpio'], 
    exaltation: ['capricorn'], 
    detriment: ['taurus', 'libra'], 
    fall: ['cancer'] 
  },
  Jupiter: { 
    rulership: ['sagittarius', 'pisces'], 
    exaltation: ['cancer'], 
    detriment: ['gemini', 'virgo'], 
    fall: ['capricorn'] 
  },
  Saturn: { 
    rulership: ['capricorn', 'aquarius'], 
    exaltation: ['libra'], 
    detriment: ['cancer', 'leo'], 
    fall: ['aries'] 
  },
  Uranus: { 
    rulership: ['aquarius'], 
    exaltation: ['scorpio'], 
    detriment: ['leo'], 
    fall: ['taurus'] 
  },
  Neptune: { 
    rulership: ['pisces'], 
    exaltation: ['cancer'], 
    detriment: ['virgo'], 
    fall: ['capricorn'] 
  },
  Pluto: { 
    rulership: ['scorpio'], 
    exaltation: ['leo'], 
    detriment: ['taurus'], 
    fall: ['aquarius'] 
  }
};

/**
 * Calculate planetary dignity modifier
 */
export function calculatePlanetaryDignity(planet: string, sign: string): {
  type: 'rulership' | 'exaltation' | 'detriment' | 'fall' | 'neutral';
  modifier: number;
} {
  const planetKey = planet?.toLowerCase();
  const signKey = sign?.toLowerCase();
  const dignities = PLANETARY_DIGNITIES[planetKey as keyof typeof PLANETARY_DIGNITIES];
  
  if (!dignities) {
    return { type: 'neutral', modifier: 1.0 };
  }

  if ((Array.isArray(dignities.rulership) ? dignities.rulership.includes(signKey) : dignities.rulership === signKey)) {
    return { type: 'rulership', modifier: 1.5 };
  }
  if ((Array.isArray(dignities.exaltation) ? dignities.exaltation.includes(signKey) : dignities.exaltation === signKey)) {
    return { type: 'exaltation', modifier: 1.3 };
  }
  if ((Array.isArray(dignities.detriment) ? dignities.detriment.includes(signKey) : dignities.detriment === signKey)) {
    return { type: 'detriment', modifier: 0.7 };
  }
  if ((Array.isArray(dignities.fall) ? dignities.fall.includes(signKey) : dignities.fall === signKey)) {
    return { type: 'fall', modifier: 0.5 };
  }

  return { type: 'neutral', modifier: 1.0 };
}

/**
 * Calculate planetary strength based on position and aspects
 */
export function calculatePlanetaryStrength(
  planet: string,
  position: PlanetaryPosition,
  aspects?: Array<{ planet1: string; planet2: string; type: string; orb: number }>
): number {
  let strength = 1.0;

  // Base strength from dignity
  if (position.sign) {
    const dignity = calculatePlanetaryDignity(planet, position.sign);
    strength *= dignity.modifier;
  }

  // Adjust for retrograde motion
  if (position.isRetrograde) {
    strength *= 0.8;
  }

  // Adjust for aspects (if provided)
  if (aspects) {
    const planetAspects = (aspects || []).filter(aspect => aspect.planet1?.toLowerCase() === planet?.toLowerCase() || 
                aspect.planet2?.toLowerCase() === planet?.toLowerCase()
    );

    (planetAspects || []).forEach(aspect => {
      switch (aspect.type) {
        case 'conjunction':
          strength *= 1.2;
          break;
        case 'trine':
          strength *= 1.15;
          break;
        case 'sextile':
          strength *= 1.1;
          break;
        case 'square':
          strength *= 0.9;
          break;
        case 'opposition':
          strength *= 0.85;
          break;
      }
    });
  }

  return Math.max(0.3, Math.min(2.0, strength));
}

/**
 * Get planetary elemental influence
 */
export function getPlanetaryElementalInfluence(
  planet: string,
  isDaytime: boolean = true
): keyof ElementalProperties {
  const planetKey = planet?.toLowerCase();
  const timeKey = isDaytime ? 'diurnal' : 'nocturnal';
  
  return PLANETARY_ELEMENTAL_MAPPINGS[timeKey][planetKey as keyof typeof PLANETARY_ELEMENTAL_MAPPINGS.diurnal] as keyof ElementalProperties || 'Fire';
}

/**
 * Calculate planetary hours influence
 */
export function calculatePlanetaryHoursInfluence(date: Date): {
  dayRuler: string;
  hourRuler: string;
  influence: number;
} {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  const dayRulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const hourRulers = [
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
    'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
    'Sun', 'Venus', 'Mercury'
  ];

  const dayRuler = dayRulers[dayOfWeek];
  const hourRuler = hourRulers[hour];

  // Calculate combined influence
  let influence = 1.0;
  if (dayRuler === hourRuler) {
    influence = 1.5; // Same planet rules both day and hour
  } else {
    influence = 1.2; // Different planets
  }

  return { dayRuler, hourRuler, influence };
}

/**
 * Calculate comprehensive planetary influences
 */
export function calculatePlanetaryInfluences(
  planetaryPositions: { [key: string]: PlanetaryPosition },
  isDaytime: boolean = true,
  currentDate?: Date
): {
  alchemicalInfluences: { [key: string]: number };
  elementalInfluences: { [key: string]: number };
  dominantPlanets: Array<{ planet: string; strength: number; element: Element }>;
  planetaryHours?: { dayRuler: string; hourRuler: string; influence: number };
} {
  const cacheKey = `planetary_influences_${JSON.stringify(planetaryPositions)}_${isDaytime}_${currentDate?.getTime()}`;
  
  return getCachedCalculation(
    cacheKey,
    { positions: planetaryPositions, isDaytime, date: currentDate?.getTime() },
    () => {
      const alchemicalInfluences: { [key: string]: number } = {
        Spirit: 0,
        Essence: 0,
        Matter: 0,
        Substance: 0
      };

      const elementalInfluences: { [key: string]: number } = { Fire: 0, Water: 0, Air: 0, Earth: 0
       };

      const dominantPlanets: Array<{ planet: string; strength: number; element: Element }> = [];

      // Process each planet
      Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
        const planetKey = planet?.toLowerCase();
        const mapping = PLANETARY_ALCHEMICAL_MAPPINGS[planetKey as keyof typeof PLANETARY_ALCHEMICAL_MAPPINGS];
        
        if (mapping) {
          // Calculate planetary strength
          const strength = calculatePlanetaryStrength(planet, position);
          
          // Add to alchemical influences
          alchemicalInfluences.Spirit += mapping.Spirit * strength;
          alchemicalInfluences.Essence += mapping.Essence * strength;
          alchemicalInfluences.Matter += mapping.Matter * strength;
          alchemicalInfluences.Substance += mapping.Substance * strength;

          // Get elemental influence
          const element = getPlanetaryElementalInfluence(planet, isDaytime);
          elementalInfluences[element] += strength;

          // Add to dominant planets list
          dominantPlanets?.push({
            planet,
            strength,
            element: element as Element
          });
        }
      });

      // Sort dominant planets by strength
      dominantPlanets.sort((a, b) => b.strength - a.strength);

      // Calculate planetary hours if date provided
      let planetaryHours;
      if (currentDate) {
        planetaryHours = calculatePlanetaryHoursInfluence(currentDate);
      }

      return {
        alchemicalInfluences,
        elementalInfluences,
        dominantPlanets,
        planetaryHours
      };
    },
    300000 // 5 minute cache
  ) as {
    alchemicalInfluences: { [key: string]: number };
    elementalInfluences: { [key: string]: number };
    dominantPlanets: Array<{ planet: string; strength: number; element: Element }>;
    planetaryHours?: { dayRuler: string; hourRuler: string; influence: number };
  };
}

/**
 * Get culinary recommendations based on planetary influences
 */
export function getPlanetaryCulinaryRecommendations(
  dominantPlanets: Array<{ planet: string; strength: number; element: Element }>
): {
  ingredients: string[];
  cookingMethods: string[];
  flavors: string[];
  timing: string[];
} {
  const recommendations = {
    ingredients: [] as string[],
    cookingMethods: [] as string[],
    flavors: [] as string[],
    timing: [] as string[]
  };

  // Get top 3 dominant planets
  const topPlanets = dominantPlanets?.slice(0, 3);

  (topPlanets || []).forEach(({ planet, element }) => {
    const planetKey = planet?.toLowerCase();

    // Planetary ingredient associations
    switch (planetKey) {
      case 'Sun':
        recommendations.ingredients?.push('citrus fruits', 'golden grains', 'sunflower oil');
        recommendations.cookingMethods?.push('grilling', 'roasting');
        recommendations.flavors?.push('bright', 'warming', 'energizing');
        recommendations.timing?.push('midday', 'solar hours');
        break;
      case 'Moon':
        recommendations.ingredients?.push('dAiry products', 'seafood', 'white vegetables');
        recommendations.cookingMethods?.push('steaming', 'poaching');
        recommendations.flavors?.push('cooling', 'soothing', 'nurturing');
        recommendations.timing?.push('evening', 'lunar hours');
        break;
      case 'Mercury':
        recommendations.ingredients?.push('nuts', 'seeds', 'leafy greens');
        recommendations.cookingMethods?.push('quick sautéing', 'stir-frying');
        recommendations.flavors?.push('light', 'crisp', 'stimulating');
        recommendations.timing?.push('morning', 'communication hours');
        break;
      case 'Venus':
        recommendations.ingredients?.push('fruits', 'herbs', 'sweet vegetables');
        recommendations.cookingMethods?.push('gentle cooking', 'raw preparation');
        recommendations.flavors?.push('sweet', 'harmonious', 'pleasant');
        recommendations.timing?.push('afternoon', 'social hours');
        break;
      case 'Mars':
        recommendations.ingredients?.push('spicy peppers', 'red meat', 'garlic');
        recommendations.cookingMethods?.push('high-heat cooking', 'grilling');
        recommendations.flavors?.push('spicy', 'intense', 'energizing');
        recommendations.timing?.push('early morning', 'action hours');
        break;
      case 'Jupiter':
        recommendations.ingredients?.push('legumes', 'rich foods', 'exotic spices');
        recommendations.cookingMethods?.push('slow cooking', 'braising');
        recommendations.flavors?.push('rich', 'abundant', 'satisfying');
        recommendations.timing?.push('feast times', 'expansion hours');
        break;
      case 'Saturn':
        recommendations.ingredients?.push('root vegetables', 'aged foods', 'grains');
        recommendations.cookingMethods?.push('slow roasting', 'preservation');
        recommendations.flavors?.push('earthy', 'structured', 'grounding');
        recommendations.timing?.push('late evening', 'discipline hours');
        break;
    }
  });

  return recommendations;
}

export default {
  calculatePlanetaryInfluences,
  calculatePlanetaryDignity,
  calculatePlanetaryStrength,
  getPlanetaryElementalInfluence,
  calculatePlanetaryHoursInfluence,
  getPlanetaryCulinaryRecommendations,
  PLANETARY_ALCHEMICAL_MAPPINGS,
  PLANETARY_ELEMENTAL_MAPPINGS,
  PLANETARY_DIGNITIES
}; 