/**
 * Comprehensive Transit Database
 *
 * Provides detailed transit information for multiple years with:
 * - 12 seasons per year (monthly breakdowns)
 * - Planetary placements and aspects
 * - Seasonal themes and culinary influences
 * - Elemental dominance patterns
 */

import { ZodiacSign, CelestialPosition, PlanetaryAspect, AspectType } from '@/types/celestial';

export interface TransitSeason {
  id: string,
  name: string,
  startDate: Date,
  endDate: Date,
  sunSign: any,
  dominantElements: Record<string, number>;
  keyAspects: PlanetaryAspect[],
  planetaryPlacements: Record<string, CelestialPosition>;
  seasonalThemes: string[],
  culinaryInfluences: string[],
  alchemicalProperties: Record<string, number>;
  dominantPlanets: string[],
  retrogradePlanets: string[],
  specialEvents: string[]
}

export interface YearlyTransits {
  year: string,
  seasons: TransitSeason[],
  majorTransits: PlanetaryAspect[],
  eclipseSeasons: Date[],
  retrogradePeriods: Record<string, { start: Date, end: Date }>;
}

/**
 * Comprehensive transit database for multiple years
 */
export const COMPREHENSIVE_TRANSIT_DATABASE: Record<string, YearlyTransits> = {
  '2024': {
    year: '2024',
    seasons: [
      {
        id: '2024-aries-early',
        name: 'Early Aries (March 20 - April 19)',
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-04-19'),
        sunSign: 'aries',
        dominantElements: { Fire: 0.45, Air: 0.25, Earth: 0.2, Water: 0.1 },
        keyAspects: [
          {
            planet1: 'Sun',
            planet2: 'Mars',
            aspectType: 'conjunction' as AspectType,
            orb: 2.5,
            influence: 0.9,
            description: 'Dynamic fire energy, perfect for bold culinary experiments'
          } as PlanetaryAspect,
          {
            planet1: 'Mercury',
            planet2: 'Venus',
            aspectType: 'conjunction' as AspectType,
            orb: 1.8,
            influence: 0.8,
            description: 'Harmonious communication between air and earth elements'
          } as PlanetaryAspect
        ],
        planetaryPlacements: {
          Sun: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
          Moon: { sign: 'cancer', degree: 8, exactLongitude: 98, isRetrograde: false },
          Mercury: { sign: 'pisces', degree: 28, exactLongitude: 358, isRetrograde: true },
          Venus: { sign: 'pisces', degree: 26, exactLongitude: 356, isRetrograde: true },
          Mars: { sign: 'cancer', degree: 24, exactLongitude: 114, isRetrograde: false },
          Jupiter: { sign: 'gemini', degree: 16, exactLongitude: 76, isRetrograde: false },
          Saturn: { sign: 'pisces', degree: 24, exactLongitude: 354, isRetrograde: false },
          Uranus: { sign: 'taurus', degree: 27, exactLongitude: 57, isRetrograde: false },
          Neptune: { sign: 'aries', degree: 1, exactLongitude: 1, isRetrograde: false },
          Pluto: { sign: 'aquarius', degree: 3, exactLongitude: 303, isRetrograde: false }
        },
        seasonalThemes: [
          'New beginnings',
          'Dynamic energy',
          'Bold flavors',
          'Spicy dishes',
          'Quick preparation'
        ],
        culinaryInfluences: [
          'Fire element cooking',
          'Spicy ingredients',
          'Quick preparation methods',
          'Bold seasoning',
          'High heat cooking'
        ],
        alchemicalProperties: { Spirit: 0.4, Essence: 0.2, Matter: 0.2, Substance: 0.2 },
        dominantPlanets: ['Sun', 'Mars', 'Mercury'],
        retrogradePlanets: ['Mercury', 'Venus'],
        specialEvents: ['Spring Equinox', 'Mercury Retrograde', 'Venus Retrograde']
      },
      {
        id: '2024-taurus-early',
        name: 'Early Taurus (April 20 - May 20)',
        startDate: new Date('2024-04-20'),
        endDate: new Date('2024-05-20'),
        sunSign: 'taurus',
        dominantElements: { Earth: 0.5, Water: 0.25, Fire: 0.15, Air: 0.1 },
        keyAspects: [
          {
            planet1: 'Venus',
            planet2: 'Jupiter',
            aspectType: 'trine' as AspectType,
            orb: 1.2,
            influence: 0.8,
            description: 'Harmonious earth energy, ideal for grounding comfort foods'
          } as PlanetaryAspect,
          {
            planet1: 'Sun',
            planet2: 'Uranus',
            aspectType: 'conjunction' as AspectType,
            orb: 3.1,
            influence: 0.7,
            description: 'Innovative earth energy, perfect for experimental comfort cooking'
          } as PlanetaryAspect
        ],
        planetaryPlacements: {
          Sun: { sign: 'taurus', degree: 12, exactLongitude: 42, isRetrograde: false },
          Moon: { sign: 'leo', degree: 15, exactLongitude: 135, isRetrograde: false },
          Mercury: { sign: 'aries', degree: 8, exactLongitude: 38, isRetrograde: false },
          Venus: { sign: 'aries', degree: 22, exactLongitude: 52, isRetrograde: false },
          Mars: { sign: 'leo', degree: 18, exactLongitude: 138, isRetrograde: false },
          Jupiter: { sign: 'gemini', degree: 18, exactLongitude: 78, isRetrograde: false },
          Saturn: { sign: 'pisces', degree: 26, exactLongitude: 356, isRetrograde: false },
          Uranus: { sign: 'taurus', degree: 29, exactLongitude: 59, isRetrograde: false },
          Neptune: { sign: 'aries', degree: 2, exactLongitude: 2, isRetrograde: false },
          Pluto: { sign: 'aquarius', degree: 4, exactLongitude: 304, isRetrograde: false }
        },
        seasonalThemes: [
          'Stability',
          'Sensual pleasures',
          'Comfort foods',
          'Rich flavors',
          'Slow cooking'
        ],
        culinaryInfluences: [
          'Slow cooking',
          'Rich sauces',
          'Comfort dishes',
          'Earth element ingredients',
          'Butter and cream'
        ],
        alchemicalProperties: { Spirit: 0.2, Essence: 0.3, Matter: 0.4, Substance: 0.1 },
        dominantPlanets: ['Venus', 'Jupiter', 'Uranus'],
        retrogradePlanets: [],
        specialEvents: ['Venus Direct', 'Mercury Direct']
      },
      {
        id: '2024-gemini-early',
        name: 'Early Gemini (May 21 - June 20)',
        startDate: new Date('2024-05-21'),
        endDate: new Date('2024-06-20'),
        sunSign: 'gemini',
        dominantElements: { Air: 0.45, Fire: 0.25, Earth: 0.2, Water: 0.1 },
        keyAspects: [
          {
            planet1: 'Mercury',
            planet2: 'Jupiter',
            aspectType: 'conjunction' as AspectType,
            orb: 2.8,
            influence: 0.85,
            description: 'Intellectual air energy, perfect for experimental and varied cuisine'
          } as PlanetaryAspect,
          {
            planet1: 'Sun',
            planet2: 'Venus',
            aspectType: 'trine' as AspectType,
            orb: 1.5,
            influence: 0.75,
            description: 'Harmonious communication between fire and earth elements'
          } as PlanetaryAspect
        ],
        planetaryPlacements: {
          Sun: { sign: 'gemini', degree: 8, exactLongitude: 68, isRetrograde: false },
          Moon: { sign: 'virgo', degree: 12, exactLongitude: 162, isRetrograde: false },
          Mercury: { sign: 'gemini', degree: 15, exactLongitude: 75, isRetrograde: false },
          Venus: { sign: 'taurus', degree: 28, exactLongitude: 58, isRetrograde: false },
          Mars: { sign: 'leo', degree: 22, exactLongitude: 142, isRetrograde: false },
          Jupiter: { sign: 'gemini', degree: 20, exactLongitude: 80, isRetrograde: false },
          Saturn: { sign: 'pisces', degree: 28, exactLongitude: 358, isRetrograde: false },
          Uranus: { sign: 'taurus', degree: 1, exactLongitude: 31, isRetrograde: false },
          Neptune: { sign: 'aries', degree: 3, exactLongitude: 3, isRetrograde: false },
          Pluto: { sign: 'aquarius', degree: 5, exactLongitude: 305, isRetrograde: false }
        },
        seasonalThemes: [
          'Communication',
          'Variety',
          'Light dishes',
          'Fresh ingredients',
          'Quick meals'
        ],
        culinaryInfluences: [
          'Quick cooking methods',
          'Fresh herbs',
          'Varied textures',
          'Light sauces',
          'Finger foods'
        ],
        alchemicalProperties: { Spirit: 0.3, Essence: 0.3, Matter: 0.2, Substance: 0.2 },
        dominantPlanets: ['Mercury', 'Jupiter', 'Sun'],
        retrogradePlanets: [],
        specialEvents: ['Gemini Season', 'Jupiter-Mercury Conjunction']
      }
    ],
    majorTransits: [
      {
        planet1: 'Saturn',
        planet2: 'Neptune',
        aspectType: 'square' as AspectType,
        orb: 1.8,
        influence: 0.9,
        description: 'Major structural changes in spiritual and material realms'
      } as PlanetaryAspect
    ],
    eclipseSeasons: [
      new Date('2024-04-08'), // Solar Eclipse
      new Date('2024-10-02'), // Solar Eclipse
      new Date('2024-03-25'), // Lunar Eclipse
      new Date('2024-09-17'), // Lunar Eclipse
    ],
    retrogradePeriods: {
      Mercury: { start: new Date('2024-03-14'), end: new Date('2024-04-08') },
      Venus: { start: new Date('2024-03-23'), end: new Date('2024-04-15') },
      Mars: { start: new Date('2024-12-06'), end: new Date('2025-02-23') },
      Jupiter: { start: new Date('2024-10-09'), end: new Date('2025-02-04') },
      Saturn: { start: new Date('2024-06-29'), end: new Date('2024-11-15') },
      Uranus: { start: new Date('2024-09-01'), end: new Date('2025-01-27') },
      Neptune: { start: new Date('2024-07-02'), end: new Date('2024-12-06') },
      Pluto: { start: new Date('2024-05-02'), end: new Date('2024-10-10') }
    }
  },

  '2025': {
    year: '2025',
    seasons: [
      {
        id: '2025-gemini-early',
        name: 'Early Gemini (May 21 - June 20)',
        startDate: new Date('2025-05-21'),
        endDate: new Date('2025-06-20'),
        sunSign: 'gemini',
        dominantElements: { Air: 0.5, Fire: 0.3, Earth: 0.15, Water: 0.05 },
        keyAspects: [
          {
            planet1: 'Mercury',
            planet2: 'Jupiter',
            aspectType: 'conjunction' as AspectType,
            orb: 3.1,
            influence: 0.85,
            description: 'Intellectual air energy, perfect for experimental and varied cuisine'
          } as PlanetaryAspect,
          {
            planet1: 'Sun',
            planet2: 'Venus',
            aspectType: 'trine' as AspectType,
            orb: 2.8,
            influence: 0.75,
            description: 'Harmonious communication between fire and earth elements'
          } as PlanetaryAspect,
          {
            planet1: 'Mars',
            planet2: 'Jupiter',
            aspectType: 'conjunction' as AspectType,
            orb: 1.2,
            influence: 0.9,
            description: 'Dynamic fire expansion, ideal for bold culinary experiments'
          } as PlanetaryAspect
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
        seasonalThemes: [
          'Communication',
          'Variety',
          'Light dishes',
          'Fresh ingredients',
          'Social dining'
        ],
        culinaryInfluences: [
          'Quick cooking methods',
          'Fresh herbs',
          'Varied textures',
          'Light sauces',
          'Sharing plates'
        ],
        alchemicalProperties: { Spirit: 0.35, Essence: 0.25, Matter: 0.25, Substance: 0.15 },
        dominantPlanets: ['Mercury', 'Jupiter', 'Mars', 'Sun'],
        retrogradePlanets: ['Pluto'],
        specialEvents: ['Gemini Season', 'Mars-Jupiter Conjunction', 'Pluto Retrograde']
      },
      {
        id: '2025-cancer-early',
        name: 'Early Cancer (June 21 - July 22)',
        startDate: new Date('2025-06-21'),
        endDate: new Date('2025-07-22'),
        sunSign: 'cancer',
        dominantElements: { Water: 0.5, Earth: 0.25, Air: 0.15, Fire: 0.1 },
        keyAspects: [
          {
            planet1: 'Moon',
            planet2: 'Neptune',
            aspectType: 'trine' as AspectType,
            orb: 2.1,
            influence: 0.8,
            description: 'Intuitive water energy, perfect for nurturing comfort foods'
          } as PlanetaryAspect,
          {
            planet1: 'Sun',
            planet2: 'Saturn',
            aspectType: 'opposition' as AspectType,
            orb: 1.8,
            influence: 0.7,
            description: 'Balancing structure with emotional nourishment'
          } as PlanetaryAspect
        ],
        planetaryPlacements: {
          Sun: { sign: 'cancer', degree: 8, exactLongitude: 98, isRetrograde: false },
          Moon: { sign: 'pisces', degree: 15, exactLongitude: 345, isRetrograde: false },
          Mercury: { sign: 'cancer', degree: 12, exactLongitude: 102, isRetrograde: false },
          Venus: { sign: 'leo', degree: 25, exactLongitude: 145, isRetrograde: false },
          Mars: { sign: 'leo', degree: 28, exactLongitude: 148, isRetrograde: false },
          Jupiter: { sign: 'leo', degree: 1, exactLongitude: 121, isRetrograde: false },
          Saturn: { sign: 'pisces', degree: 2, exactLongitude: 332, isRetrograde: false },
          Uranus: { sign: 'taurus', degree: 22, exactLongitude: 52, isRetrograde: false },
          Neptune: { sign: 'aries', degree: 7, exactLongitude: 7, isRetrograde: false },
          Pluto: { sign: 'aquarius', degree: 6, exactLongitude: 306, isRetrograde: true }
        },
        seasonalThemes: [
          'Nurturing',
          'Comfort',
          'Family meals',
          'Traditional cooking',
          'Emotional nourishment'
        ],
        culinaryInfluences: [
          'Slow cooking',
          'Soups and stews',
          'Family recipes',
          'Comfort foods',
          'Water element cooking'
        ],
        alchemicalProperties: { Spirit: 0.2, Essence: 0.4, Matter: 0.3, Substance: 0.1 },
        dominantPlanets: ['Moon', 'Neptune', 'Sun'],
        retrogradePlanets: ['Pluto'],
        specialEvents: ['Summer Solstice', 'Cancer Season', 'Pluto Retrograde']
      }
    ],
    majorTransits: [
      {
        planet1: 'Jupiter',
        planet2: 'Saturn',
        aspectType: 'square',
        orb: 2.1,
        influence: 0.8,
        description: 'Expansion meets structure in food and culture'
      } as PlanetaryAspect
    ],
    eclipseSeasons: [
      new Date('2025-03-29'), // Solar Eclipse
      new Date('2025-09-21'), // Solar Eclipse
      new Date('2025-03-14'), // Lunar Eclipse
      new Date('2025-09-07'), // Lunar Eclipse
    ],
    retrogradePeriods: {
      Mercury: { start: new Date('2025-04-27'), end: new Date('2025-05-20') },
      Venus: { start: new Date('2025-07-22'), end: new Date('2025-09-03') },
      Mars: { start: new Date('2025-01-12'), end: new Date('2025-03-30') },
      Jupiter: { start: new Date('2025-10-09'), end: new Date('2026-02-04') },
      Saturn: { start: new Date('2025-06-29'), end: new Date('2025-11-15') },
      Uranus: { start: new Date('2025-09-01'), end: new Date('2026-01-27') },
      Neptune: { start: new Date('2025-07-02'), end: new Date('2025-12-06') },
      Pluto: { start: new Date('2025-05-02'), end: new Date('2025-10-10') }
    }
  }
};

/**
 * Utility functions for transit analysis
 */
export class TransitAnalysisService {
  /**
   * Get transit information for a specific date
   */
  static getTransitForDate(date: Date): TransitSeason | null {
    const year = date.getFullYear().toString();
    const yearData = COMPREHENSIVE_TRANSIT_DATABASE[year];

    if (!yearData) return null;

    return (
      yearData.seasons.find(season => date >= season.startDate && date <= season.endDate) || null;
    )
  }

  /**
   * Get all available years
   */
  static getAvailableYears(): string[] {
    return Object.keys(COMPREHENSIVE_TRANSIT_DATABASE);
  }

  /**
   * Get seasonal analysis for a date range
   */
  static getSeasonalAnalysis(
    startDate: Date,
    endDate: Date,
  ): {
    seasons: TransitSeason[],
    dominantElements: Record<string, number>,
    keyAspects: PlanetaryAspect[],
    retrogradePlanets: string[]
  } {
    const seasons: TransitSeason[] = [];
    const dominantElements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const keyAspects: PlanetaryAspect[] = [];
    const retrogradePlanets: string[] = [];

    const years = this.getAvailableYears();
    years.forEach(year => {
      const yearData = COMPREHENSIVE_TRANSIT_DATABASE[year];
      if (yearData) {
        yearData.seasons.forEach(season => {
          if (season.startDate >= startDate && season.endDate <= endDate) {
            seasons.push(season);

            // Aggregate dominant elements
            Object.entries(season.dominantElements).forEach(([element, value]) => {
              dominantElements[element] += value;
            });

            // Collect key aspects
            keyAspects.push(...season.keyAspects);

            // Collect retrograde planets
            retrogradePlanets.push(...season.retrogradePlanets);
          }
        });
      }
    });

    // Normalize dominant elements
    const total = Object.values(dominantElements).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(dominantElements).forEach(element => {
        dominantElements[element] /= total;
      });
    }

    return {
      seasons,
      dominantElements,
      keyAspects,
      retrogradePlanets: [...new Set(retrogradePlanets)], // Remove duplicates
    };
  }

  /**
   * Get retrograde periods for a specific planet
   */
  static getRetrogradePeriods(planet: string, year: string): { start: Date, end: Date } | null {
    const yearData = COMPREHENSIVE_TRANSIT_DATABASE[year];
    return yearData.retrogradePeriods[planet] || null
  }

  /**
   * Get eclipse seasons for a year
   */
  static getEclipseSeasons(year: string): Date[] {
    const yearData = COMPREHENSIVE_TRANSIT_DATABASE[year];
    return yearData.eclipseSeasons || []
  }

  /**
   * Get major transits for a year
   */
  static getMajorTransits(year: string): PlanetaryAspect[] {
    const yearData = COMPREHENSIVE_TRANSIT_DATABASE[year];
    return yearData.majorTransits || []
  }
}

// Export convenience functions
export const getTransitForDate = (date: Date) => TransitAnalysisService.getTransitForDate(date);
export const getAvailableYears = () => TransitAnalysisService.getAvailableYears();
export const getSeasonalAnalysis = (startDate: Date, endDate: Date) =>;
  TransitAnalysisService.getSeasonalAnalysis(startDate, endDate);
export const getRetrogradePeriods = (planet: string, year: string) =>;
  TransitAnalysisService.getRetrogradePeriods(planet, year);
export const getEclipseSeasons = (year: string) => TransitAnalysisService.getEclipseSeasons(year);
export const getMajorTransits = (year: string) => TransitAnalysisService.getMajorTransits(year);
