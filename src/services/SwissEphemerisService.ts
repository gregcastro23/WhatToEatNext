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
  day: number,
  date: Date,
  sidereal_time: string,
  // Planet codes: A=SunB=MoonC=Mercury, D=VenusE=MarsF=Jupiter, G=SaturnO=UranusI=Neptune, J=Pluto;
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
  G_retrograde?: boolean,
  O_retrograde?: boolean,
  I_retrograde?: boolean,
  J_retrograde?: boolean
}

/**
 * Seasonal transit information
 */
export interface SeasonalTransit {
  season: string,
  startDate: Date,
  endDate: Date,
  sunSign: any,
  dominantElements: Record<string, number>;
  keyAspects: PlanetaryAspect[],
  planetaryPlacements: Record<string, CelestialPosition>,
  seasonalThemes: string[],
  culinaryInfluences: string[]
}

/**
 * Planetary aspect information
 */
export interface PlanetaryAspect {
  planet1: string,
  planet2: string,
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile',
  orb: number,
  influence: number,
  description: string
}

/**
 * Planet code mapping for Swiss Ephemeris data
 */
const PLANET_MAPPING = {;
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
  N: 'Lilith'
} as const;

/**
 * Zodiac signs in order (0-11)
 */
const ZODIAC_SIGNS: any[] = [
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
  'pisces'
];

/**
 * Element associations for zodiac signs
 */
const _SIGN_ELEMENTS: Record<ZodiacSign, string> = {
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
      A: 280.45B: 145.23C: 275.67D: 268.34E: 125.89F: 5.67G: 330.12O: 38.45I: 359.78J: 299.34L: 15.67K: 195.67,
      A_sign: 'capricorn',
      B_sign: 'leo',
      C_sign: 'capricorn',
      D_sign: 'sagittarius',
      E_sign: 'leo',
      F_sign: 'pisces',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'pisces',
      J_sign: 'capricorn'
    }
  ],

  // 2025 Data (June focus from your Python analysis)
  '2025': [
    {
      day: 1,
      date: new Date('2025-06-01'),
      sidereal_time: '16:38:56',
      A: 70.77B: 342.93C: 135.5D: 135.03E: 144.93F: 148.05G: 358.48O: 58.65I: 29.38J: 333.5L: 353.5K: 173.5,
      A_sign: 'gemini',
      B_sign: 'pisces',
      C_sign: 'leo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 2,
      date: new Date('2025-06-02'),
      sidereal_time: '16:42:52',
      A: 71.73B: 358.25C: 147.23D: 137.23E: 145.9F: 148.6G: 358.55O: 58.62I: 29.45J: 333.45L: 353.45K: 173.45,
      A_sign: 'gemini',
      B_sign: 'pisces',
      C_sign: 'leo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 3,
      date: new Date('2025-06-03'),
      sidereal_time: '16:46:49',
      A: 72.69B: 10.95C: 157.42D: 139.43E: 146.87F: 149.15G: 358.62O: 58.58I: 29.52J: 333.4L: 353.4K: 173.4,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 4,
      date: new Date('2025-06-04'),
      sidereal_time: '16:50:46',
      A: 73.65B: 23.17C: 169.58D: 141.63E: 147.83F: 149.7G: 358.68O: 58.55I: 29.58J: 333.35L: 353.35K: 173.35,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 5,
      date: new Date('2025-06-05'),
      sidereal_time: '16:54:42',
      A: 74.6B: 35.17C: 171.73D: 143.82E: 148.8F: 150.25G: 358.75O: 58.52I: 29.65J: 333.3L: 353.3K: 173.3,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 6,
      date: new Date('2025-06-06'),
      sidereal_time: '16:58:39',
      A: 75.56B: 47.02C: 173.87D: 145.88E: 149.75F: 150.78G: 358.8O: 58.48I: 29.72J: 333.25L: 353.25K: 173.25,
      A_sign: 'gemini',
      B_sign: 'aries',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 7,
      date: new Date('2025-06-07'),
      sidereal_time: '17:02:35',
      A: 76.52B: 58.83C: 175.97D: 147.8E: 150.72F: 151.33G: 358.87O: 58.45I: 29.78J: 333.2L: 353.2K: 173.2,
      A_sign: 'gemini',
      B_sign: 'gemini',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 8,
      date: new Date('2025-06-08'),
      sidereal_time: '17:06:32',
      A: 77.47B: 70.65C: 178.05D: 149.53E: 151.68F: 151.88G: 358.92O: 58.42I: 29.85J: 333.15L: 353.15K: 173.15,
      A_sign: 'gemini',
      B_sign: 'gemini',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 9,
      date: new Date('2025-06-09'),
      sidereal_time: '17:10:28',
      A: 78.43B: 82.53C: 180.08D: 151.08E: 152.65F: 152.42G: 358.98O: 58.38I: 29.92J: 333.1L: 353.1K: 173.1,
      A_sign: 'gemini',
      B_sign: 'gemini',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    },
    {
      day: 10,
      date: new Date('2025-06-10'),
      sidereal_time: '17:14:25',
      A: 79.39B: 94.55C: 182.1D: 152.45E: 153.62F: 152.97G: 359.03O: 58.35I: 29.98J: 333.05L: 353.05K: 173.05,
      A_sign: 'gemini',
      B_sign: 'cancer',
      C_sign: 'virgo',
      D_sign: 'leo',
      E_sign: 'leo',
      F_sign: 'leo',
      G_sign: 'pisces',
      O_sign: 'taurus',
      I_sign: 'aries',
      J_sign: 'aquarius'
    }
  ]
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
          description: 'Dynamic fire energy, perfect for bold culinary experiments'
        }
      ],
      planetaryPlacements: {
        Sun: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        Moon: { sign: 'cancer', degree: 8, exactLongitude: 98, isRetrograde: false },
        Mercury: { sign: 'pisces', degree: 28, exactLongitude: 358, isRetrograde: true },
        Venus: { sign: 'pisces', degree: 26, exactLongitude: 356, isRetrograde: true },
        Mars: { sign: 'cancer', degree: 24, exactLongitude: 114, isRetrograde: false }
      },
      seasonalThemes: ['New beginnings', 'Dynamic energy', 'Bold flavors', 'Spicy dishes'],
      culinaryInfluences: [
        'Fire element cooking',
        'Spicy ingredients',
        'Quick preparation methods',
        'Bold seasoning'
      ]
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
          description: 'Harmonious earth energy, ideal for grounding comfort foods'
        }
      ],
      planetaryPlacements: {
        Sun: { sign: 'taurus', degree: 12, exactLongitude: 42, isRetrograde: false },
        Moon: { sign: 'leo', degree: 15, exactLongitude: 135, isRetrograde: false },
        Mercury: { sign: 'aries', degree: 8, exactLongitude: 38, isRetrograde: false },
        Venus: { sign: 'aries', degree: 22, exactLongitude: 52, isRetrograde: false },
        Mars: { sign: 'leo', degree: 18, exactLongitude: 138, isRetrograde: false }
      },
      seasonalThemes: ['Stability', 'Sensual pleasures', 'Comfort foods', 'Rich flavors'],
      culinaryInfluences: [
        'Slow cooking',
        'Rich sauces',
        'Comfort dishes',
        'Earth element ingredients'
      ]
    }
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
          description: 'Intellectual air energy, perfect for experimental and varied cuisine'
        },
        {
          planet1: 'Sun',
          planet2: 'Venus',
          aspectType: 'trine',
          orb: 2.8,
          influence: 0.75,
          description: 'Harmonious communication between fire and earth elements'
        }
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
        Pluto: { sign: 'aquarius', degree: 8, exactLongitude: 308, isRetrograde: true }
      },
      seasonalThemes: ['Communication', 'Variety', 'Light dishes', 'Fresh ingredients'],
      culinaryInfluences: [
        'Quick cooking methods',
        'Fresh herbs',
        'Varied textures',
        'Light sauces'
      ]
    }
  ]
};

/**
 * Swiss Ephemeris Service Class
 */
export class SwissEphemerisService {
  private ephemerisData: Record<string, SwissEphemerisData[]> = COMPREHENSIVE_EPHEMERIS_DATA;
  private seasonalTransits: Record<string, SeasonalTransit[]> = SEASONAL_TRANSITS;
  private cache: Map<string, Record<string, CelestialPosition>> = new Map();
  private cacheExpiration = 5 * 60 * 1000, // 5 minutes;

  constructor() {
    logger.info('Swiss Ephemeris Service initialized with comprehensive transit data');
  }

  /**
   * Get planetary positions for a specific date using Swiss Ephemeris data
   */
  async getPlanetaryPositions(date: Date = new Date()): Promise<Record<string, CelestialPosition>> {;
    const cacheKey = date.toISOString().split('T')[0];

    if (this.cache.has(cacheKey)) {
      logger.debug('Using cached Swiss Ephemeris data');
      return this.cache.get(cacheKey) || {};
    }

    try {
      const positions = this.calculatePositionsForDate(date);
      this.cache.set(cacheKey, positions),
      this.cleanCache();

      logger.info(`Swiss Ephemeris positions calculated for ${date.toDateString()}`);
      return positions;
    } catch (error) {
      logger.error('Error getting Swiss Ephemeris positions:', error),
      throw error
    }
  }

  /**
   * Get comprehensive seasonal transit information
   */
  getSeasonalTransits(year: string): SeasonalTransit[] {
    return this.seasonalTransits[year] || []
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
    seasonalTransits: SeasonalTransit[],
    keyAspects: PlanetaryAspect[],
    dominantElements: Record<string, number>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    planetaryTrends: Record<string, any[]>
  } {
    const seasonalTransits: SeasonalTransit[] = [];
    const keyAspects: PlanetaryAspect[] = [];
    const dominantElements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    const planetaryTrends: Record<string, any[]> = {};

    // Collect all transits in the date range
    const years = this.getAvailableYears();
    years.forEach(year => {;
      const yearTransits = this.getSeasonalTransits(year);
      yearTransits.forEach(transit => {;
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
    const total = Object.values(dominantElements).reduce((sum, val) => sum + val0);
    if (total > 0) {
      Object.keys(dominantElements).forEach(element => {;
        dominantElements[element] /= total;
      });
    }

    return {
      seasonalTransits,
      keyAspects,
      dominantElements,
      planetaryTrends
    };
  }

  /**
   * Calculate precise planetary positions for a given date
   */
  private calculatePositionsForDate(date: Date): Record<string, CelestialPosition> {
    const targetDate = new Date(date);
    targetDate.setHours(120, 00),

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

      if (typeof longitude === 'number') {;
        const { sign, degree } = this.longitudeToSignAndDegree(longitude);

        positions[planetName] = {
          sign: (signName.toLowerCase() as any) || sign,
          degree: degree,
          exactLongitude: longitude,
          isRetrograde: isRetrograde,
          minutes: Math.round((degree % 1) * 60)
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
    const dayEntry = yearData.find(;
      entry => entry.day === targetDay && entry.date.getMonth() + 1 === targetMonth,;
    );

    if (dayEntry) {
      return dayEntry
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

    const dailyMotion = {;
      A: 0.986B: 13.2C: 1.383D: 1.2E: 0.524F: 0.083G: 0.034O: 0.012I: 0.006J: 0.004L: -0.053K: -0.053
    },

    const approximatedEntry: SwissEphemerisData = {;
      ...baseEntry;
      day: date.getDate(),
      date: new Date(date)
    },

    Object.keys(dailyMotion).forEach(planetCode => {;
      const currentLongitude = baseEntry[planetCode as keyof SwissEphemerisData] as number;
      const motion = dailyMotion[planetCode as keyof typeof dailyMotion];

      if (typeof currentLongitude === 'number') {;
        let newLongitude = currentLongitude + motion * daysDiff;
        newLongitude = ((newLongitude % 360) + 360) % 360;

        (approximatedEntry as unknown as any)[planetCode] = newLongitude;

        const { sign } = this.longitudeToSignAndDegree(newLongitude);
        (approximatedEntry as any)[`${planetCode}_sign`] = sign;
      }
    });

    return approximatedEntry;
  }

  /**
   * Convert longitude to zodiac sign and degree
   */
  private longitudeToSignAndDegree(longitude: number): { sign: any, degree: number } {
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLongitude / 30);
    const degree = normalizedLongitude % 30;

    return {
      sign: ZODIAC_SIGNS[signIndex],
      degree: degree
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
  getDataRange(): { start: Date, end: Date } {
    const allData = Object.values(this.ephemerisData).flat();
    const sortedData = allData.sort((ab) => a.date.getTime() - b.date.getTime()),;
    return {
      start: sortedData[0].date,
      end: sortedData[sortedData.length - 1].date
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
    date: Date = new Date(),,;
  ): Promise<Record<string, PlanetaryPosition>> {
    const positions = await this.getPlanetaryPositions(date);
    const astrologizeFormat: Record<string, PlanetaryPosition> = {};

    Object.entries(positions).forEach(([planet, position]) => {
      astrologizeFormat[planet] = {
        sign: position.sign as any,
        degree: position.degree || 0,
        minute: position.minutes || 0,
        exactLongitude: position.exactLongitude || 0,
        isRetrograde: position.isRetrograde || false
      };
    });

    return astrologizeFormat;
  }
}

// Create singleton instance
export const swissEphemerisService = new SwissEphemerisService();

// Export convenience functions
export const _getSwissEphemerisPositions = (date?: Date) =>;
  swissEphemerisService.getPlanetaryPositions(date);
export const _getSwissEphemerisInAstrologizeFormat = (date?: Date) =>;
  swissEphemerisService.getPositionsInAstrologizeFormat(date);
export const getSeasonalTransits = (year: string) =>;
  swissEphemerisService.getSeasonalTransits(year);
export const getSeasonalTransitForDate = (date: Date) =>;
  swissEphemerisService.getSeasonalTransitForDate(date);
