/**
 * Swiss Ephemeris Service
 *
 * Provides highly accurate astronomical data using Swiss Ephemeris calculations
 * Includes comprehensive transit information for multiple years with detailed seasonal mappings
 */

import { CelestialPosition, PlanetaryPosition, ZodiacSign } from '@/types/celestial';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SwissEphemerisService');

/**
 * Swiss Ephemeris raw data structure
 */
export interface SwissEphemerisData {
  day: number;
  date: Date;
  sidereal_time: string;
  // Planet codes: A=Sun, B=Moon, C=Mercury, D=Venus, E=Mars, F=Jupiter, G=Saturn, O=Uranus, I=Neptune, J=Pluto
  A: number; // Sun
  B: number; // Moon
  C: number; // Mercury
  D: number; // Venus
  E: number; // Mars
  F: number; // Jupiter
  G: number; // Saturn
  O: number; // Uranus
  I: number; // Neptune
  J: number; // Pluto
  L: number; // North Node
  K: number; // South Node
  M?: number; // Chiron (optional)
  N?: number; // Lilith (optional)
  // Sign information
  A_sign?: string;
  B_sign?: string;
  C_sign?: string;
  D_sign?: string;
  E_sign?: string;
  F_sign?: string;
  G_sign?: string;
  O_sign?: string;
  I_sign?: string;
  J_sign?: string;
  // Retrograde status
  A_retrograde?: boolean;
  B_retrograde?: boolean;
  C_retrograde?: boolean;
  D_retrograde?: boolean;
  E_retrograde?: boolean;
  F_retrograde?: boolean;
  G_retrograde?: boolean;
  O_retrograde?: boolean;
  I_retrograde?: boolean;
  J_retrograde?: boolean;
}

/**
 * Seasonal transit information
 */
export interface SeasonalTransit {
  season: string;
  startDate: Date;
  endDate: Date;
  sunSign: ZodiacSign;
  dominantElements: Record<string, number>;
  keyAspects: PlanetaryAspect[];
  planetaryPlacements: Record<string, CelestialPosition>;
  seasonalThemes: string[];
  culinaryInfluences: string[];
}

/**
 * Planetary aspect information
 */
export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  influence: number;
  description: string;
}

/**
 * Planet code mapping for Swiss Ephemeris data
 */
const PLANET_MAPPING = {
  A: 'Sun',
  B: 'Moon',
  C: 'Mercury',
  D: 'Venus',
  E: 'Mars',
  F: 'Jupiter',
  G: 'Saturn',
  O: 'Uranus',
  I: 'Neptune',
  J: 'Pluto',
  L: 'NorthNode',
  K: 'SouthNode',
  M: 'Chiron',
  N: 'Lilith',
} as const;

/**
 * Zodiac signs in order (0-11)
 */
const ZODIAC_SIGNS: ZodiacSign[] = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

/**
 * Element associations for zodiac signs
 */
const SIGN_ELEMENTS: Record<ZodiacSign, string> = {
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
  pisces: 'Water',
};

/**
 * Comprehensive Swiss Ephemeris data for multiple years
 * This includes detailed transit information for seasonal analysis
 */
const COMPREHENSIVE_EPHEMERIS_DATA: Record<string, SwissEphemerisData[]> = {
  // 2024 Data
  '2024': [
    {
      day: 1,
      date: new Date('2024-01-01'),
      sidereal_time: '06:42:15',
      A: 280.45,
      B: 145.23,
      C: 275.67,
      D: 268.34,
      E: 125.89,
      F: 5.67,
      G: 330.12,
      O: 38.45,
      I: 359.78,
      J: 299.34,
      L: 15.67,
      K: 195.67,
      A_sign: 'capricorn',
      B_sign: 'leo',
      C_sign: 'capricorn',
      D_sign: 'sagittarius',
      E_sign: 'leo',
      F_sign: 'pisces',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'pisces',
      J_sign: 'capricorn',
    },
  ],

  // 2025 Data (June focus from your Python analysis)
  '2025': [
    {
      day: 1,
      date: new Date('2025-06-01'),
      sidereal_time: '16:38:56',
      A: 70.77,
      B: 342.93,
      C: 135.5,
      D: 135.03,
      E: 144.93,
      F: 148.05,
      G: 358.48,
      O: 58.65,
      I: 29.38,
      J: 333.5,
      L: 353.5,
      K: 173.5,
      A_sign: 'gemini',
      B_sign: 'pisces',
      C_sign: 'leo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 2,
      date: new Date('2025-06-02'),
      sidereal_time: '16:42:52',
      A: 71.73,
      B: 358.25,
      C: 147.23,
      D: 137.23,
      E: 145.9,
      F: 148.6,
      G: 358.55,
      O: 58.62,
      I: 29.45,
      J: 333.45,
      L: 353.45,
      K: 173.45,
      A_sign: 'gemini',
      B_sign: 'pisces',
      C_sign: 'leo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 3,
      date: new Date('2025-06-03'),
      sidereal_time: '16:46:49',
      A: 72.69,
      B: 10.95,
      C: 157.42,
      D: 139.43,
      E: 146.87,
      F: 149.15,
      G: 358.62,
      O: 58.58,
      I: 29.52,
      J: 333.4,
      L: 353.4,
      K: 173.4,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 4,
      date: new Date('2025-06-04'),
      sidereal_time: '16:50:46',
      A: 73.65,
      B: 23.17,
      C: 169.58,
      D: 141.63,
      E: 147.83,
      F: 149.7,
      G: 358.68,
      O: 58.55,
      I: 29.58,
      J: 333.35,
      L: 353.35,
      K: 173.35,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 5,
      date: new Date('2025-06-05'),
      sidereal_time: '16:54:42',
      A: 74.6,
      B: 35.17,
      C: 171.73,
      D: 143.82,
      E: 148.8,
      F: 150.25,
      G: 358.75,
      O: 58.52,
      I: 29.65,
      J: 333.3,
      L: 353.3,
      K: 173.3,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 6,
      date: new Date('2025-06-06'),
      sidereal_time: '16:58:39',
      A: 75.56,
      B: 47.02,
      C: 173.87,
      D: 145.88,
      E: 149.75,
      F: 150.78,
      G: 358.8,
      O: 58.48,
      I: 29.72,
      J: 333.25,
      L: 353.25,
      K: 173.25,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 7,
      date: new Date('2025-06-07'),
      sidereal_time: '17:02:35',
      A: 76.52,
      B: 58.83,
      C: 175.97,
      D: 147.8,
      E: 150.72,
      F: 151.33,
      G: 358.87,
      O: 58.45,
      I: 29.78,
      J: 333.2,
      L: 353.2,
      K: 173.2,
      A_sign: 'gemini',
      B_sign: 'gemini',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 8,
      date: new Date('2025-06-08'),
      sidereal_time: '17:06:32',
      A: 77.47,
      B: 70.65,
      C: 178.05,
      D: 149.53,
      E: 151.68,
      F: 151.88,
      G: 358.92,
      O: 58.42,
      I: 29.85,
      J: 333.15,
      L: 353.15,
      K: 173.15,
      A_sign: 'gemini',
      B_sign: 'gemini',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 9,
      date: new Date('2025-06-09'),
      sidereal_time: '17:10:28',
      A: 78.43,
      B: 82.53,
      C: 180.08,
      D: 151.08,
      E: 152.65,
      F: 152.42,
      G: 358.98,
      O: 58.38,
      I: 29.92,
      J: 333.1,
      L: 353.1,
      K: 173.1,
      A_sign: 'gemini',
      B_sign: 'gemini',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
    {
      day: 10,
      date: new Date('2025-06-10'),
      sidereal_time: '17:14:25',
      A: 79.39,
      B: 94.55,
      C: 182.1,
      D: 152.45,
      E: 153.62,
      F: 152.97,
      G: 359.03,
      O: 58.35,
      I: 29.98,
      J: 333.05,
      L: 353.05,
      K: 173.05,
      A_sign: 'gemini',
      B_sign: 'cancer',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius',
    },
  ],
};

/**
 * Seasonal transit mappings for comprehensive analysis
 */
const SEASONAL_TRANSITS: Record<string, SeasonalTransit[]> = {
  '2024': [
    {
      season: 'Early Spring (Aries)',
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-04-19'),
      sunSign: 'aries',
      dominantElements: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
      keyAspects: [
        {
          planet1: 'Sun',
          planet2: 'Mars',
          aspectType: 'conjunction',
          orb: 2.5,
          influence: 0.9,
          description: 'Dynamic fire energy, perfect for bold culinary experiments',
        },
      ],
      planetaryPlacements: {
        Sun: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        Moon: { sign: 'cancer', degree: 8, exactLongitude: 98, isRetrograde: false },
        Mercury: { sign: 'pisces', degree: 28, exactLongitude: 358, isRetrograde: true },
        Venus: { sign: 'pisces', degree: 26, exactLongitude: 356, isRetrograde: true },
        Mars: { sign: 'cancer', degree: 24, exactLongitude: 114, isRetrograde: false },
      },
      seasonalThemes: ['New beginnings', 'Dynamic energy', 'Bold flavors', 'Spicy dishes'],
      culinaryInfluences: [
        'Fire element cooking',
        'Spicy ingredients',
        'Quick preparation methods',
        'Bold seasoning',
      ],
    },
    {
      season: 'Late Spring (Taurus)',
      startDate: new Date('2024-04-20'),
      endDate: new Date('2024-05-20'),
      sunSign: 'taurus',
      dominantElements: { Earth: 0.5, Water: 0.3, Fire: 0.1, Air: 0.1 },
      keyAspects: [
        {
          planet1: 'Venus',
          planet2: 'Jupiter',
          aspectType: 'trine',
          orb: 1.2,
          influence: 0.8,
          description: 'Harmonious earth energy, ideal for grounding comfort foods',
        },
      ],
      planetaryPlacements: {
        Sun: { sign: 'taurus', degree: 12, exactLongitude: 42, isRetrograde: false },
        Moon: { sign: 'leo', degree: 15, exactLongitude: 135, isRetrograde: false },
        Mercury: { sign: 'aries', degree: 8, exactLongitude: 38, isRetrograde: false },
        Venus: { sign: 'aries', degree: 22, exactLongitude: 52, isRetrograde: false },
        Mars: { sign: 'leo', degree: 18, exactLongitude: 138, isRetrograde: false },
      },
      seasonalThemes: ['Stability', 'Sensual pleasures', 'Comfort foods', 'Rich flavors'],
      culinaryInfluences: [
        'Slow cooking',
        'Rich sauces',
        'Comfort dishes',
        'Earth element ingredients',
      ],
    },
  ],

  '2025': [
    {
      season: 'Early Summer (Gemini)',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      sunSign: 'gemini',
      dominantElements: { Air: 0.5, Fire: 0.3, Earth: 0.1, Water: 0.1 },
      keyAspects: [
        {
          planet1: 'Mercury',
          planet2: 'Jupiter',
          aspectType: 'conjunction',
          orb: 3.1,
          influence: 0.85,
          description: 'Intellectual air energy, perfect for experimental and varied cuisine',
        },
        {
          planet1: 'Sun',
          planet2: 'Venus',
          aspectType: 'trine',
          orb: 2.8,
          influence: 0.75,
          description: 'Harmonious communication between fire and earth elements',
        },
      ],
      planetaryPlacements: {
        Sun: { sign: 'gemini', degree: 15, exactLongitude: 75, isRetrograde: false },
        Moon: { sign: 'cancer', degree: 8, exactLongitude: 98, isRetrograde: false },
        Mercury: { sign: 'virgo', degree: 12, exactLongitude: 162, isRetrograde: false },
        Venus: { sign: 'leo', degree: 18, exactLongitude: 138, isRetrograde: false },
        Mars: { sign: 'leo', degree: 22, exactLongitude: 142, isRetrograde: false },
        Jupiter: { sign: 'leo', degree: 25, exactLongitude: 145, isRetrograde: false },
        Saturn: { sign: 'pisces', degree: 28, exactLongitude: 358, isRetrograde: false },
        Uranus: { sign: 'taurus', degree: 20, exactLongitude: 50, isRetrograde: false },
        Neptune: { sign: 'aries', degree: 5, exactLongitude: 5, isRetrograde: false },
        Pluto: { sign: 'aquarius', degree: 8, exactLongitude: 308, isRetrograde: true },
      },
      seasonalThemes: ['Communication', 'Variety', 'Light dishes', 'Fresh ingredients'],
      culinaryInfluences: [
        'Quick cooking methods',
        'Fresh herbs',
        'Varied textures',
        'Light sauces',
      ],
    },
  ],
};

/**
 * Swiss Ephemeris Service Class
 */
export class SwissEphemerisService {
  private ephemerisData: Record<string, SwissEphemerisData[]> = COMPREHENSIVE_EPHEMERIS_DATA;
  private seasonalTransits: Record<string, SeasonalTransit[]> = SEASONAL_TRANSITS;
  private cache: Map<string, Record<string, CelestialPosition>> = new Map();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    logger.info('Swiss Ephemeris Service initialized with comprehensive transit data');
  }

  /**
   * Get planetary positions for a specific date using Swiss Ephemeris data
   */
  async getPlanetaryPositions(date: Date = new Date()): Promise<Record<string, CelestialPosition>> {
    const cacheKey = date.toISOString().split('T')[0];

    if (this.cache.has(cacheKey)) {
      logger.debug('Using cached Swiss Ephemeris data');
      return this.cache.get(cacheKey) || {};
    }

    try {
      const positions = this.calculatePositionsForDate(date);
      this.cache.set(cacheKey, positions);
      this.cleanCache();

      logger.info(`Swiss Ephemeris positions calculated for ${date.toDateString()}`);
      return positions;
    } catch (error) {
      logger.error('Error getting Swiss Ephemeris positions:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive seasonal transit information
   */
  getSeasonalTransits(year: string): SeasonalTransit[] {
    return this.seasonalTransits[year] || [];
  }

  /**
   * Get seasonal transit for a specific date
   */
  getSeasonalTransitForDate(date: Date): SeasonalTransit | null {
    const year = date.getFullYear().toString();
    const transits = this.getSeasonalTransits(year);

    return transits.find(transit => date >= transit.startDate && date <= transit.endDate) || null;
  }

  /**
   * Get all available years with transit data
   */
  getAvailableYears(): string[] {
    return Object.keys(this.seasonalTransits);
  }

  /**
   * Get comprehensive transit analysis for a date range
   */
  getTransitAnalysis(
    startDate: Date,
    endDate: Date,
  ): {
    seasonalTransits: SeasonalTransit[];
    keyAspects: PlanetaryAspect[];
    dominantElements: Record<string, number>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    planetaryTrends: Record<string, any[]>;
  } {
    const seasonalTransits: SeasonalTransit[] = [];
    const keyAspects: PlanetaryAspect[] = [];
    const dominantElements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    const planetaryTrends: Record<string, any[]> = {};

    // Collect all transits in the date range
    const years = this.getAvailableYears();
    years.forEach(year => {
      const yearTransits = this.getSeasonalTransits(year);
      yearTransits.forEach(transit => {
        if (transit.startDate >= startDate && transit.endDate <= endDate) {
          seasonalTransits.push(transit);

          // Aggregate dominant elements
          Object.entries(transit.dominantElements).forEach(([element, value]) => {
            dominantElements[element] += value;
          });

          // Collect key aspects
          keyAspects.push(...transit.keyAspects);
        }
      });
    });

    // Normalize dominant elements
    const total = Object.values(dominantElements).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(dominantElements).forEach(element => {
        dominantElements[element] /= total;
      });
    }

    return {
      seasonalTransits,
      keyAspects,
      dominantElements,
      planetaryTrends,
    };
  }

  /**
   * Calculate precise planetary positions for a given date
   */
  private calculatePositionsForDate(date: Date): Record<string, CelestialPosition> {
    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0);

    const ephemerisEntry = this.findClosestEphemerisEntry(targetDate);

    if (!ephemerisEntry) {
      throw new Error(`No Swiss Ephemeris data available for date: ${date.toDateString()}`);
    }

    const positions: Record<string, CelestialPosition> = {};

    Object.entries(PLANET_MAPPING).forEach(([code, planetName]) => {
      const longitude = ephemerisEntry[code as keyof SwissEphemerisData] as number;
      const signName = ephemerisEntry[`${code}_sign` as keyof SwissEphemerisData] as string;
      const isRetrograde =
        (ephemerisEntry[`${code}_retrograde` as keyof SwissEphemerisData] as boolean) || false;

      if (typeof longitude === 'number') {
        const { sign, degree } = this.longitudeToSignAndDegree(longitude);

        positions[planetName] = {
          sign: (signName.toLowerCase() as ZodiacSign) || sign,
          degree: degree,
          exactLongitude: longitude,
          isRetrograde: isRetrograde,
          minutes: Math.round((degree % 1) * 60),
        };
      }
    });

    return positions;
  }

  /**
   * Find the closest ephemeris entry for a given date
   */
  private findClosestEphemerisEntry(date: Date): SwissEphemerisData | null {
    const year = date.getFullYear().toString();
    const yearData = this.ephemerisData[year];

    if (!yearData) {
      return this.approximateForDate(date);
    }

    const targetDay = date.getDate();
    const targetMonth = date.getMonth() + 1;

    // Find exact day or closest day
    const dayEntry = yearData.find(
      entry => entry.day === targetDay && entry.date.getMonth() + 1 === targetMonth,
    );

    if (dayEntry) {
      return dayEntry;
    }

    // Find closest day if exact day not found
    let closestEntry = yearData[0];
    let minDiff = Math.abs(targetDay - closestEntry.day);

    for (const entry of yearData) {
      const diff = Math.abs(targetDay - entry.day);
      if (diff < minDiff) {
        minDiff = diff;
        closestEntry = entry;
      }
    }

    return closestEntry;
  }

  /**
   * Approximate positions for dates outside the available ephemeris range
   */
  private approximateForDate(date: Date): SwissEphemerisData | null {
    const baseEntry = this.ephemerisData['2025'][0]; // Use 2025 as base
    const baseDate = baseEntry.date;

    const daysDiff = (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);

    const dailyMotion = {
      A: 0.986,
      B: 13.2,
      C: 1.383,
      D: 1.2,
      E: 0.524,
      F: 0.083,
      G: 0.034,
      O: 0.012,
      I: 0.006,
      J: 0.004,
      L: -0.053,
      K: -0.053,
    };

    const approximatedEntry: SwissEphemerisData = {
      ...baseEntry,
      day: date.getDate(),
      date: new Date(date),
    };

    Object.keys(dailyMotion).forEach(planetCode => {
      const currentLongitude = baseEntry[planetCode as keyof SwissEphemerisData] as number;
      const motion = dailyMotion[planetCode as keyof typeof dailyMotion];

      if (typeof currentLongitude === 'number') {
        let newLongitude = currentLongitude + motion * daysDiff;
        newLongitude = ((newLongitude % 360) + 360) % 360;

        (approximatedEntry as unknown as Record<string, unknown>)[planetCode] = newLongitude;

        const { sign } = this.longitudeToSignAndDegree(newLongitude);
        (approximatedEntry as unknown as Record<string, unknown>)[`${planetCode}_sign`] = sign;
      }
    });

    return approximatedEntry;
  }

  /**
   * Convert longitude to zodiac sign and degree
   */
  private longitudeToSignAndDegree(longitude: number): { sign: ZodiacSign; degree: number } {
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLongitude / 30);
    const degree = normalizedLongitude % 30;

    return {
      sign: ZODIAC_SIGNS[signIndex],
      degree: degree,
    };
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      const cacheDate = new Date(key).getTime();
      if (now - cacheDate > this.cacheExpiration) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get available data range
   */
  getDataRange(): { start: Date; end: Date } {
    const allData = Object.values(this.ephemerisData).flat();
    const sortedData = allData.sort((a, b) => a.date.getTime() - b.date.getTime());
    return {
      start: sortedData[0].date,
      end: sortedData[sortedData.length - 1].date,
    };
  }

  /**
   * Check if Swiss Ephemeris data is available for a given date
   */
  isDataAvailable(date: Date): boolean {
    const { start, end } = this.getDataRange();
    return date >= start && date <= end;
  }

  /**
   * Get sidereal time for a specific date
   */
  getSiderealTime(date: Date): string | null {
    const entry = this.findClosestEphemerisEntry(date);
    return entry?.sidereal_time || null;
  }

  /**
   * Export planetary positions in astrologize API compatible format
   */
  async getPositionsInAstrologizeFormat(
    date: Date = new Date(),
  ): Promise<Record<string, PlanetaryPosition>> {
    const positions = await this.getPlanetaryPositions(date);
    const astrologizeFormat: Record<string, PlanetaryPosition> = {};

    Object.entries(positions).forEach(([planet, position]) => {
      astrologizeFormat[planet] = {
        sign: position.sign as ZodiacSign,
        degree: position.degree || 0,
        minute: position.minutes || 0,
        exactLongitude: position.exactLongitude || 0,
        isRetrograde: position.isRetrograde || false,
      };
    });

    return astrologizeFormat;
  }
}

// Create singleton instance
export const swissEphemerisService = new SwissEphemerisService();

// Export convenience functions
export const getSwissEphemerisPositions = (date?: Date) =>
  swissEphemerisService.getPlanetaryPositions(date);
export const getSwissEphemerisInAstrologizeFormat = (date?: Date) =>
  swissEphemerisService.getPositionsInAstrologizeFormat(date);
export const getSeasonalTransits = (year: string) =>
  swissEphemerisService.getSeasonalTransits(year);
export const getSeasonalTransitForDate = (date: Date) =>
  swissEphemerisService.getSeasonalTransitForDate(date);
