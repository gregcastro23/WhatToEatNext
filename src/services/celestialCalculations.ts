// import { celestialBodies } from '../data/celestial/bodies';
import type { TarotCard } from '../contexts/TarotContext/types';
import type {
  CelestialAlignment,
  ElementalProperties,
  EnergyStateProperties,
  ChakraEnergies,
  ZodiacSign,
  AspectType,
  PlanetaryAspect,
  CelestialBody,
} from '../types/alchemy';
import type { LunarPhase } from '../types/shared';
// astronomia calculator removed - using direct calculations
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';
import { celestialNumerology } from '../utils/numerology';

// Tarot elemental correspondences
const TAROT_ELEMENTAL_MAPPING: Record<
  string,
  { Element: string; Spirit: number; Essence: number; Matter: number; Substance: number }
> = {
  wands: { Element: 'Fire', Spirit: 0.9, Essence: 0.3, Matter: 0.2, Substance: 0.4 },
  cups: { Element: 'Water', Essence: 0.8, Spirit: 0.4, Matter: 0.3, Substance: 0.5 },
  swords: { Element: 'Air', Substance: 0.8, Spirit: 0.5, Matter: 0.3, Essence: 0.4 },
  pentacles: { Element: 'Earth', Matter: 0.9, Spirit: 0.2, Substance: 0.4, Essence: 0.3 },
};

// Tarot zodiac associations
const TAROT_ZODIAC_MAPPING: Record<string, string[]> = {
  aries: ['Emperor', 'Tower'],
  taurus: ['Hierophant', 'Empress'],
  gemini: ['Lovers', 'Magician'],
  cancer: ['Chariot', 'High Priestess'],
  leo: ['Strength', 'Sun'],
  virgo: ['Hermit', 'Magician'],
  libra: ['Justice', 'Empress'],
  scorpio: ['Death', 'Judgment'],
  sagittarius: ['Temperance', 'Wheel of Fortune'],
  capricorn: ['Devil', 'World'],
  aquarius: ['Star', 'Fool'],
  pisces: ['Moon', 'Hanged Man'],
};

// Planetary tarot associations
const TAROT_PLANETARY_MAPPING: Record<string, string[]> = {
  Sun: ['Sun', 'Emperor'],
  Moon: ['High Priestess', 'Moon'],
  Mercury: ['Magician', 'Lovers'],
  Venus: ['Empress', 'Hierophant'],
  Mars: ['Tower', 'Chariot'],
  Jupiter: ['Wheel of Fortune', 'Temperance'],
  Saturn: ['World', 'Hermit'],
  Uranus: ['Fool', 'Star'],
  Neptune: ['Hanged Man', 'Moon'],
  Pluto: ['Death', 'Judgment'],
};

// Add minor arcana mappings after the existing major arcana mappings
// Minor arcana cards mapped to dates in the year - 36 decans of 10 days each
const MINOR_ARCANA_DATE_MAPPING = {
  // Wands (Fire) - Spring
  ace_of_wands: { startMonth: 2, startDay: 21, endMonth: 2, endDay: 30 }, // aries decan 1
  two_of_wands: { startMonth: 3, startDay: 1, endMonth: 3, endDay: 10 }, // aries decan 2
  three_of_wands: { startMonth: 3, startDay: 11, endMonth: 3, endDay: 19 }, // aries decan 3
  four_of_wands: { startMonth: 3, startDay: 20, endMonth: 3, endDay: 29 }, // taurus decan 1
  five_of_wands: { startMonth: 3, startDay: 30, endMonth: 4, endDay: 9 }, // taurus decan 2
  six_of_wands: { startMonth: 4, startDay: 10, endMonth: 4, endDay: 20 }, // taurus decan 3
  seven_of_wands: { startMonth: 4, startDay: 21, endMonth: 4, endDay: 31 }, // gemini decan 1
  eight_of_wands: { startMonth: 5, startDay: 1, endMonth: 5, endDay: 10 }, // gemini decan 2
  nine_of_wands: { startMonth: 5, startDay: 11, endMonth: 5, endDay: 20 }, // gemini decan 3

  // Cups (Water) - Summer
  ace_of_cups: { startMonth: 5, startDay: 21, endMonth: 5, endDay: 30 }, // cancer decan 1
  two_of_cups: { startMonth: 6, startDay: 1, endMonth: 6, endDay: 11 }, // cancer decan 2
  three_of_cups: { startMonth: 6, startDay: 12, endMonth: 6, endDay: 22 }, // cancer decan 3
  four_of_cups: { startMonth: 6, startDay: 23, endMonth: 7, endDay: 2 }, // leo decan 1
  five_of_cups: { startMonth: 7, startDay: 3, endMonth: 7, endDay: 12 }, // leo decan 2
  six_of_cups: { startMonth: 7, startDay: 13, endMonth: 7, endDay: 22 }, // leo decan 3
  seven_of_cups: { startMonth: 7, startDay: 23, endMonth: 8, endDay: 2 }, // virgo decan 1
  eight_of_cups: { startMonth: 8, startDay: 3, endMonth: 8, endDay: 12 }, // virgo decan 2
  nine_of_cups: { startMonth: 8, startDay: 13, endMonth: 8, endDay: 22 }, // virgo decan 3

  // Swords (Air) - Fall
  ace_of_swords: { startMonth: 8, startDay: 23, endMonth: 9, endDay: 2 }, // Libra decan 1
  two_of_swords: { startMonth: 9, startDay: 3, endMonth: 9, endDay: 12 }, // Libra decan 2
  three_of_swords: { startMonth: 9, startDay: 13, endMonth: 9, endDay: 22 }, // Libra decan 3
  four_of_swords: { startMonth: 9, startDay: 23, endMonth: 10, endDay: 2 }, // Scorpio decan 1
  five_of_swords: { startMonth: 10, startDay: 3, endMonth: 10, endDay: 12 }, // Scorpio decan 2
  six_of_swords: { startMonth: 10, startDay: 13, endMonth: 10, endDay: 21 }, // Scorpio decan 3
  seven_of_swords: { startMonth: 10, startDay: 22, endMonth: 11, endDay: 1 }, // sagittarius decan 1
  eight_of_swords: { startMonth: 11, startDay: 2, endMonth: 11, endDay: 11 }, // sagittarius decan 2
  nine_of_swords: { startMonth: 11, startDay: 12, endMonth: 11, endDay: 21 }, // sagittarius decan 3

  // Pentacles (Earth) - Winter
  ace_of_pentacles: { startMonth: 11, startDay: 22, endMonth: 0, endDay: 1 }, // capricorn decan 1
  two_of_pentacles: { startMonth: 0, startDay: 2, endMonth: 0, endDay: 11 }, // capricorn decan 2
  three_of_pentacles: { startMonth: 0, startDay: 12, endMonth: 0, endDay: 19 }, // capricorn decan 3
  four_of_pentacles: { startMonth: 0, startDay: 20, endMonth: 0, endDay: 29 }, // aquarius decan 1
  five_of_pentacles: { startMonth: 0, startDay: 30, endMonth: 1, endDay: 8 }, // aquarius decan 2
  six_of_pentacles: { startMonth: 1, startDay: 9, endMonth: 1, endDay: 18 }, // aquarius decan 3
  seven_of_pentacles: { startMonth: 1, startDay: 19, endMonth: 1, endDay: 28 }, // pisces decan 1
  eight_of_pentacles: { startMonth: 1, startDay: 29, endMonth: 2, endDay: 10 }, // pisces decan 2
  nine_of_pentacles: { startMonth: 2, startDay: 11, endMonth: 2, endDay: 20 }, // pisces decan 3
};

// Minor arcana elemental affinities
const MINOR_ARCANA_ELEMENTAL_AFFINITIES = {
  wands: { element: 'Fire', energyState: 'Spirit' },
  cups: { element: 'Water', energyState: 'Essence' },
  swords: { element: 'Air', energyState: 'Substance' },
  pentacles: { element: 'Earth', energyState: 'Matter' },
};

interface CelestialPosition {
  sign: string;
  degree: number;
}

// Define the PlanetaryPosition interface to replace any types
interface PlanetaryPosition {
  sign: string;
  degree: number;
  retrograde?: boolean;
  house?: number;
  minute?: number;
  speed?: number;
}

// Define a record type for planetary positions
type PlanetaryPositionRecord = Record<string, PlanetaryPosition>;

interface CelestialData {
  sun: CelestialPosition;
  moon: CelestialPosition;
  elementalState: ElementalProperties;
  season: string;
  moonPhase: string;
}

class CelestialCalculator {
  private static instance: CelestialCalculator;
  private readonly CACHE_KEY = 'current_celestial_influences';
  private readonly TAROT_CACHE_KEY = 'current_tarot_influences';
  private readonly UPDATE_INTERVAL = 1000 * 60 * 5; // 5 minutes
  private lastCalculation = 0;

  private constructor() {
    this.initializeCalculations();
  }

  static getInstance(): CelestialCalculator {
    if (!CelestialCalculator.instance) {
      CelestialCalculator.instance = new CelestialCalculator();
    }
    return CelestialCalculator.instance;
  }

  private initializeCalculations(): void {
    setInterval(() => {
      this.calculateCurrentInfluences();
    }, this.UPDATE_INTERVAL);
  }

  calculateCurrentInfluences(): CelestialAlignment {
    try {
      // Try to get from cache first
      const cached = cache.get(this.CACHE_KEY) as Partial<CelestialAlignment> | undefined;
      if (cached) {
        // Ensure cached data has astrologicalInfluences
        if (
          !cached.astrologicalInfluences ||
          !Array.isArray(cached.astrologicalInfluences) ||
          cached.astrologicalInfluences.length === 0
        ) {
          const influences = cached.dominantPlanets
            ? [...cached.dominantPlanets.map(p => p.name), cached.zodiacSign || 'libra', 'all']
            : ['Sun', 'Moon', cached.zodiacSign || 'libra', 'all'];

          cached.astrologicalInfluences = influences;
        }

        // Apply safeguards to cached results
        return this.ensureCompleteAlignment(cached);
      }

      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      const hour = now.getHours();

      // Determine current zodiac sign
      const zodiacSign = this.determineZodiacSign(month, day);

      // Get current planetary positions
      let planetaryPositions: PlanetaryPositionRecord = {};
      try {
        // Use fallback positions since astronomia has been removed
        throw new Error('Astronomy calculator removed - using fallback positions');
      } catch (error) {
        // Fallback to default positions if we can't calculate them
        planetaryPositions = {
          sun: { sign: zodiacSign.toLowerCase(), degree: 15 },
          moon: { sign: this.calculateMoonSign(now), degree: 10 },
          uranus: { sign: 'taurus', degree: 24 }, // Current positions as of 2025
          neptune: { sign: 'aries', degree: 0 },
          pluto: { sign: 'aquarius', degree: 3 },
        };
      }

      // Determine planetary influences based on day of week, hour, and actual positions
      const dominantPlanets = this.determineDominantPlanets(now.getDay(), hour, planetaryPositions);

      // Calculate lunar phase
      const lunarPhase = this.calculateLunarPhase(now);

      // Calculate elemental balance
      const elementalBalance = this.calculateElementalBalance(
        zodiacSign,
        dominantPlanets,
        lunarPhase,
      );

      // Calculate tarot influences
      const tarotInfluences = this.calculateTarotInfluences(zodiacSign, dominantPlanets);
      cache.set(this.TAROT_CACHE_KEY, tarotInfluences, 60 * 60);

      // Generate astrological influences from planets, zodiac, and tarot
      const astroInfluences = [
        ...dominantPlanets.map(p => p.name),
        zodiacSign,
        ...tarotInfluences.map(t => t.name),
        'all', // Always include 'all' for universal matching
      ];

      // Build complete celestial alignment (using type assertion due to interface mismatch)
      const alignment = {
        date: now.toISOString(),
        zodiacSign,
        dominantPlanets,
        lunarPhase,
        elementalBalance,
        aspectInfluences: this.calculatePlanetaryAspects(now).map(
          aspect =>
            ({
              planet1: aspect.planets[0],
              planet2: aspect.planets[1],
              type: aspect.type,
              orb: aspect.orb || 0,
              strength: aspect.influence,
            }) as PlanetaryAspect,
        ),
        astrologicalInfluences: astroInfluences, // Ensure this is always present and includes tarot influences and 'all'
      } as unknown as CelestialAlignment;

      // Cache for 1 hour (alignments don't change that quickly)
      cache.set(this.CACHE_KEY, alignment, 60 * 60);

      // Return with safeguards
      return this.ensureCompleteAlignment(alignment);
    } catch (error) {
      logger.error('Error calculating celestial influences', error);

      // Return fallback alignment to avoid breaking the application
      return this.getFallbackAlignment();
    }
  }

  /**
   * Calculate moon sign for a given date
   */
  private calculateMoonSign(date: Date): string {
    try {
      // Astronomy calculator removed - use fallback calculation

      // Fallback to simplified calculation
      const msPerDay = 1000 * 60 * 60 * 24;
      const lunarCycle = 27.3; // sidereal lunar cycle in days (time to return to same position)

      // Using a reference date when the moon was in a known position
      const referenceDate = new Date('2025-04-02');
      const referenceSign = 'gemini'; // Moon was in Gemini on the reference date

      const daysSinceReference = (date.getTime() - referenceDate.getTime()) / msPerDay;

      // Each sign takes approximately 2.28 days (27.3 / 12)
      const signsPassed = Math.floor((daysSinceReference % lunarCycle) / 2.28);

      // Define zodiac signs in order
      const signs = [
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

      // Find the reference sign index
      const refIndex = signs.indexOf(referenceSign);
      if (refIndex === -1) return 'cancer'; // Fallback

      // Calculate the current sign index
      const currentIndex = (refIndex + signsPassed) % 12;

      // Return the current moon sign
      return signs[currentIndex];
    } catch (error) {
      // If all else fails, default to Cancer (traditionally ruled by the Moon)
      return 'cancer';
    }
  }

  /**
   * Calculate tarot influences based on current zodiac, planets, and date
   */
  private calculateTarotInfluences(zodiacSign: any, dominantPlanets: CelestialBody[]): TarotCard[] {
    const tarotCards: TarotCard[] = [];
    const now = new Date();

    // Add minor arcana card for current date period
    const minorArcanaCard = this.calculateMinorArcanaForDate(now);
    if (minorArcanaCard) {
      tarotCards.push(minorArcanaCard);
    }

    // Add zodiac-related major arcana cards
    const zodiacCards = TAROT_ZODIAC_MAPPING[zodiacSign] || [];
    zodiacCards.forEach(cardName => {
      tarotCards.push(this.createTarotCard(cardName, zodiacSign));
    });

    // Add planet-related major arcana cards
    dominantPlanets.forEach(planet => {
      const planetCards = TAROT_PLANETARY_MAPPING[planet.name] || [];
      planetCards.forEach(cardName => {
        tarotCards.push(this.createTarotCard(cardName, undefined, planet.name));
      });
    });

    return tarotCards;
  }

  /**
   * Create a tarot card with basic info
   */
  private createTarotCard(
    name: string,
    zodiacAssociation?: string,
    planetaryAssociation?: string,
  ): TarotCard {
    // Determine suit based on name (simplified approach)
    let suit: 'wands' | 'cups' | 'swords' | 'pentacles' | 'major' = 'major'; // Default to major arcana

    if (name.toLowerCase().includes('cup')) suit = 'cups';
    if (name.toLowerCase().includes('wand')) suit = 'wands';
    if (name.toLowerCase().includes('sword')) suit = 'swords';
    if (name.toLowerCase().includes('pentacle')) suit = 'pentacles';

    // Determine elemental association based on suit
    let elementalAssociation: 'Fire' | 'Water' | 'Earth' | 'Air' | undefined = undefined;

    if (suit !== 'major') {
      const element = TAROT_ELEMENTAL_MAPPING[suit].Element as 'Fire' | 'Water' | 'Earth' | 'Air';
      elementalAssociation = element;
    }

    return {
      name,
      suit,
      description: `Tarot card associated with ${zodiacAssociation || planetaryAssociation || 'universal forces'}`,
      planetaryInfluences: planetaryAssociation ? { [planetaryAssociation]: 1.0 } : undefined,
    };
  }

  /**
   * Ensure a celestial alignment has all required properties
   */
  private ensureCompleteAlignment(alignment: Partial<CelestialAlignment>): CelestialAlignment {
    if (!alignment) {
      return this.getFallbackAlignment();
    }

    // Start with complete defaults (using type assertion due to interface mismatch)
    const safeAlignment = {
      date: new Date().toISOString(),
      zodiacSign: 'libra' as any,
      dominantPlanets: [
        { name: 'Sun', influence: 0.5 },
        { name: 'Moon', influence: 0.5 },
      ],
      lunarPhase: 'full moon' as LunarPhase,
      elementalBalance: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      aspectInfluences: [],
      astrologicalInfluences: ['Sun', 'Moon', 'libra', 'all'],
    } as unknown as CelestialAlignment;

    // Override with any valid properties from the input
    if (typeof alignment.date === 'string') {
      safeAlignment.date = alignment.date;
    }

    if (typeof alignment.zodiacSign === 'string') {
      safeAlignment.zodiacSign = alignment.zodiacSign;
    }

    if (alignment.dominantPlanets && Array.isArray(alignment.dominantPlanets)) {
      safeAlignment.dominantPlanets = alignment.dominantPlanets;
    }

    if (typeof alignment.lunarPhase === 'string') {
      safeAlignment.lunarPhase = alignment.lunarPhase;
    }

    if (alignment.elementalBalance && typeof alignment.elementalBalance === 'object') {
      safeAlignment.elementalBalance = alignment.elementalBalance;
    }

    if (alignment.aspectInfluences && Array.isArray(alignment.aspectInfluences)) {
      safeAlignment.aspectInfluences = alignment.aspectInfluences;
    }

    // Copy energy state balance and chakra emphasis if available
    if (alignment.energyStateBalance) {
      safeAlignment.energyStateBalance = alignment.energyStateBalance;
    }

    if (alignment.chakraEmphasis) {
      safeAlignment.chakraEmphasis = alignment.chakraEmphasis;
    }

    // Critical field: always ensure astrologicalInfluences is set correctly
    if (
      alignment.astrologicalInfluences &&
      Array.isArray(alignment.astrologicalInfluences) &&
      alignment.astrologicalInfluences.length > 0
    ) {
      safeAlignment.astrologicalInfluences = alignment.astrologicalInfluences;
    } else {
      // Generate from dominant planets and zodiac sign
      safeAlignment.astrologicalInfluences = [
        ...(safeAlignment.dominantPlanets?.map(p => p.name) || []),
        safeAlignment.zodiacSign || 'libra',
        'all', // Add 'all' as a fallback to ensure matches with recipes
      ];
    }

    return safeAlignment;
  }

  /**
   * Get a fallback celestial alignment when calculations fail
   */
  private getFallbackAlignment(): CelestialAlignment {
    return {
      date: new Date().toISOString(),
      zodiacSign: 'libra' as any, // Balance
      dominantPlanets: [
        { name: 'Sun', influence: 0.5 },
        { name: 'Moon', influence: 0.5 },
      ],
      lunarPhase: 'full moon' as LunarPhase,
      elementalBalance: {
        Fire: 0.25,
        Earth: 0.25,
        Air: 0.25,
        Water: 0.25,
      },
      aspectInfluences: [],
      astrologicalInfluences: ['Sun', 'Moon', 'libra', 'all'], // Ensure this is always present and has values
    } as unknown as CelestialAlignment;
  }

  /**
   * Determine zodiac sign based on month and day
   */
  private determineZodiacSign(month: number, day: number): any {
    // Zodiac date ranges
    if ((month === 2 && day >= 21) || (month === 3 && day <= 19)) return 'aries';
    if ((month === 3 && day >= 20) || (month === 4 && day <= 20)) return 'taurus';
    if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) return 'gemini';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 22)) return 'cancer';
    if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) return 'leo';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'virgo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'libra';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 21)) return 'scorpio';
    if ((month === 10 && day >= 22) || (month === 11 && day <= 21)) return 'sagittarius';
    if ((month === 11 && day >= 22) || (month === 0 && day <= 19)) return 'capricorn';
    if ((month === 0 && day >= 20) || (month === 1 && day <= 18)) return 'aquarius';
    if ((month === 1 && day >= 19) || (month === 2 && day <= 20)) return 'pisces';

    // Fallback to libra (balance) if something goes wrong
    return 'libra';
  }

  /**
   * Calculate the specific influences of Jupiter and Saturn based on their dignities and aspects
   * Jupiter expands while Saturn restricts - they have opposing but complementary effects
   */
  private calculateGasGiantInfluences(
    planetaryPositions: PlanetaryPositionRecord = {},
    aspectInfluences: Array<{ type: AspectType; planets: string[]; influence: number }> = [],
  ): {
    jupiterInfluence: number;
    saturnInfluence: number;
    jupiterEffect: 'expansive' | 'balanced' | 'restricted';
    saturnEffect: 'restrictive' | 'balanced' | 'softened';
  } {
    // Default values
    let jupiterInfluence = 0.5;
    let saturnInfluence = 0.5;
    let jupiterEffect: 'expansive' | 'balanced' | 'restricted' = 'balanced';
    let saturnEffect: 'restrictive' | 'balanced' | 'softened' = 'balanced';

    // Get positions of Jupiter and Saturn
    const jupiterPos = planetaryPositions['jupiter'] || planetaryPositions['Jupiter'];
    const saturnPos = planetaryPositions['saturn'] || planetaryPositions['Saturn'];

    // Define dignity tables for Jupiter and Saturn
    const jupiterDignities: Record<string, { type: string; strength: number }> = {
      sagittarius: { type: 'Domicile', strength: 0.9 }, // Traditional rulership
      pisces: { type: 'Domicile', strength: 0.8 }, // Traditional rulership
      cancer: { type: 'Exaltation', strength: 0.7 }, // Exaltation
      capricorn: { type: 'Detriment', strength: -0.5 }, // Detriment
      virgo: { type: 'Fall', strength: -0.6 }, // Fall
    };

    const saturnDignities: Record<string, { type: string; strength: number }> = {
      capricorn: { type: 'Domicile', strength: 0.9 }, // Traditional rulership
      aquarius: { type: 'Domicile', strength: 0.8 }, // Traditional rulership (before Uranus)
      libra: { type: 'Exaltation', strength: 0.7 }, // Exaltation
      cancer: { type: 'Detriment', strength: -0.5 }, // Detriment
      aries: { type: 'Fall', strength: -0.6 }, // Fall
    };

    // Calculate base influences based on dignities
    let jupiterDignityName = '';
    if (jupiterPos?.sign) {
      const jupiterSign = jupiterPos.sign.toLowerCase();
      const dignity = jupiterDignities[jupiterSign];
      if (dignity) {
        jupiterInfluence = 0.5 + dignity.strength;
        jupiterDignityName = dignity.type;

        // Determine effect based on dignity
        if (dignity.type === 'Domicile' || dignity.type === 'Exaltation') {
          jupiterEffect = 'expansive';
        } else if (dignity.type === 'Detriment' || dignity.type === 'Fall') {
          jupiterEffect = 'restricted';
        }
      }
    }

    let saturnDignityName = '';
    if (saturnPos?.sign) {
      const saturnSign = saturnPos.sign.toLowerCase();
      const dignity = saturnDignities[saturnSign];
      if (dignity) {
        saturnInfluence = 0.5 + dignity.strength;
        saturnDignityName = dignity.type;

        // Determine effect based on dignity
        if (dignity.type === 'Domicile' || dignity.type === 'Exaltation') {
          saturnEffect = 'restrictive';
        } else if (dignity.type === 'Detriment' || dignity.type === 'Fall') {
          saturnEffect = 'softened';
        }
      }
    }

    // Check if Jupiter and Saturn are making aspects to each other
    // This is critical as their interaction dramatically affects their expression
    const jupiterSaturnAspect = aspectInfluences.find(
      aspect => aspect.planets.includes('Jupiter') && aspect.planets.includes('Saturn'),
    );

    let aspectType = '';
    if (jupiterSaturnAspect) {
      aspectType = jupiterSaturnAspect.type;

      // Modify influences based on aspect type
      switch (jupiterSaturnAspect.type) {
        case 'conjunction':
          // Conjunction of Jupiter and Saturn is a major astrological event (Great Conjunction)
          // Average their influences while preserving their identities
          jupiterInfluence = Math.min(0.7, (jupiterInfluence + saturnInfluence) / 2);
          saturnInfluence = jupiterInfluence;
          // Don't set to 'balanced' - we'll handle this in the detailed description below
          break;
        case 'opposition':
          // Opposition emphasizes their contrasting natures
          jupiterInfluence = Math.min(0.8, jupiterInfluence * 1.2);
          saturnInfluence = Math.min(0.8, saturnInfluence * 1.2);
          // Effects remain as they were, but stronger
          break;
        case 'trine':
          // Harmonious aspect makes their energies work together more beneficially
          jupiterEffect = 'expansive';
          saturnEffect = 'balanced';
          break;
        case 'square':
          // Challenging aspect can increase tension between expansion and restriction
          jupiterInfluence = Math.min(0.7, jupiterInfluence * 1.1);
          saturnInfluence = Math.min(0.7, saturnInfluence * 1.1);
          break;
        case 'sextile':
          // Opportune aspect softens their opposition
          jupiterEffect = 'balanced';
          saturnEffect = 'balanced';
          break;
      }
    }

    // Create more descriptive effects
    if (jupiterEffect === 'expansive') {
      jupiterEffect = 'expansive';
      // Keep the base effect as union type compliant - don't modify with template strings
    } else if (jupiterEffect === 'restricted') {
      jupiterEffect = 'restricted';
      // Keep the base effect as union type compliant - don't modify with template strings
    } else {
      // Use valid union type value instead of 'moderate growth'
      jupiterEffect = 'balanced';
    }

    if (saturnEffect === 'restrictive') {
      saturnEffect = 'restrictive';
      // Keep the base effect as union type compliant - don't modify with template strings
    } else if (saturnEffect === 'softened') {
      saturnEffect = 'softened';
      // Keep the base effect as union type compliant - don't modify with template strings
    } else {
      // Use valid union type value instead of 'structured'
      saturnEffect = 'balanced';
    }

    // Additional adjustments for conjunction - keep union type compliance
    if (aspectType === 'conjunction') {
      jupiterEffect = 'balanced'; // Instead of template string
      saturnEffect = 'balanced'; // Instead of template string
    }

    // Normalize influence values to be between 0.1 and 0.9
    jupiterInfluence = Math.max(0.1, Math.min(0.9, jupiterInfluence));
    saturnInfluence = Math.max(0.1, Math.min(0.9, saturnInfluence));

    return { jupiterInfluence, saturnInfluence, jupiterEffect, saturnEffect };
  }

  /**
   * Determine dominant planets based on day of week and hour
   */
  private determineDominantPlanets(
    dayOfWeek: number,
    hour: number,
    planetaryPositions: PlanetaryPositionRecord = {},
  ): CelestialBody[] {
    // Simplified planetary rulers based on day of week
    const dayRulers = [
      'Sun', // Sunday
      'Moon', // Monday
      'Mars', // Tuesday
      'Mercury', // Wednesday
      'Jupiter', // Thursday
      'Venus', // Friday
      'Saturn', // Saturday
    ];

    // Hour rulers (simplified)
    const hourRulers = [
      'Sun',
      'Venus',
      'Mercury',
      'Moon',
      'Saturn',
      'Jupiter',
      'Mars',
      'Sun',
      'Venus',
      'Mercury',
      'Moon',
      'Saturn',
      'Jupiter',
      'Mars',
      'Sun',
      'Venus',
      'Mercury',
      'Moon',
      'Saturn',
      'Jupiter',
      'Mars',
      'Sun',
      'Venus',
      'Mercury',
    ];

    const dayRuler = dayRulers[dayOfWeek];
    const hourRuler = hourRulers[hour];

    // Create dominant planets array with weights
    const dominantPlanets: CelestialBody[] = [
      { name: dayRuler, influence: 0.7 },
      { name: hourRuler, influence: 0.5 },
    ];

    // Add Sun sign placement if it exists in planetary positions
    const sunPos = planetaryPositions['sun'] || planetaryPositions['Sun'];
    if (sunPos?.sign) {
      // Add the Sun with its sign placement if not already included
      if (!dominantPlanets.some(p => p.name === 'Sun')) {
        dominantPlanets.push({
          name: 'Sun',
          influence: 0.65,
          effect: `in ${sunPos.sign}`,
        });
      } else {
        // Update existing Sun with sign placement effect
        const sunIndex = dominantPlanets.findIndex(p => p.name === 'Sun');
        if (sunIndex >= 0) {
          dominantPlanets[sunIndex] = {
            ...dominantPlanets[sunIndex],
            effect: `in ${sunPos.sign}`,
          };
        }
      }
    }

    // If it's a full moon, add lunar influence
    const now = new Date();
    const lunarPhase = this.calculateLunarPhase(now);
    if (lunarPhase === 'full') {
      dominantPlanets.push({ name: 'Moon', influence: 0.6 });
    }

    // Calculate aspects for gas giant calculations
    const aspectInfluences = this.calculatePlanetaryAspects(now);

    // Calculate specialized influences for Jupiter and Saturn
    const { jupiterInfluence, saturnInfluence, jupiterEffect, saturnEffect } =
      this.calculateGasGiantInfluences(planetaryPositions, aspectInfluences);

    // Add Jupiter and Saturn with their calculated influences
    // Only add them if they're not already included from day/hour rulers
    if (!dominantPlanets.some(p => p.name === 'Jupiter')) {
      dominantPlanets.push({
        name: 'Jupiter',
        influence: jupiterInfluence,
        effect: jupiterEffect,
      });
    } else {
      // Update the existing Jupiter with the new influence value
      const jupiterIndex = dominantPlanets.findIndex(p => p.name === 'Jupiter');
      if (jupiterIndex >= 0) {
        dominantPlanets[jupiterIndex] = {
          ...dominantPlanets[jupiterIndex],
          influence: Math.max(dominantPlanets[jupiterIndex].influence || 0, jupiterInfluence),
          effect: jupiterEffect,
        };
      }
    }

    if (!dominantPlanets.some(p => p.name === 'Saturn')) {
      dominantPlanets.push({
        name: 'Saturn',
        influence: saturnInfluence,
        effect: saturnEffect,
      });
    } else {
      // Update the existing Saturn with the new influence value
      const saturnIndex = dominantPlanets.findIndex(p => p.name === 'Saturn');
      if (saturnIndex >= 0) {
        dominantPlanets[saturnIndex] = {
          ...dominantPlanets[saturnIndex],
          influence: Math.max(dominantPlanets[saturnIndex].influence || 0, saturnInfluence),
          effect: saturnEffect,
        };
      }
    }

    // Add outer planets based on their actual positions and dignities
    const outerPlanets = ['Uranus', 'Neptune', 'Pluto'];
    const outerPlanetDignities = {
      Uranus: {
        aquarius: 0.8, // Modern rulership
        scorpio: 0.5, // Exaltation
        leo: 0.3, // Detriment
      },
      Neptune: {
        pisces: 0.8, // Modern rulership
        cancer: 0.5, // Exaltation
        virgo: 0.3, // Detriment
      },
      Pluto: {
        scorpio: 0.8, // Modern rulership
        aquarius: 0.5, // Currently in Aquarius long-term
        taurus: 0.3, // Detriment
      },
    };

    outerPlanets.forEach(planet => {
      // Get the planet's current position from the passed positions or default values
      const position = planetaryPositions[planet.toLowerCase()] || { sign: '', degree: 0 };
      const sign = position.sign.toLowerCase() || '';

      // Base influence for outer planets
      let influence = 0.2;

      // Increase influence if planet is in a sign it has dignity in
      if (sign && outerPlanetDignities[planet] && outerPlanetDignities[planet][sign]) {
        influence = outerPlanetDignities[planet][sign];
      }

      dominantPlanets.push({ name: planet, influence });
    });

    return dominantPlanets;
  }

  /**
   * Calculate lunar phase using more accurate astronomy model
   */
  private calculateLunarPhase(date: Date): string {
    // Astronomy calculator removed - use direct calculation

    // More accurate calculation using precise synodic period and reference date
    const synodicPeriod = 29.530588853; // days - precise synodic period (new moon to new moon)
    const msPerDay = 1000 * 60 * 60 * 24;

    // Reference date for a known new moon (January 21, 2023 at 20:53 UTC)
    const knownNewMoon = new Date('2023-01-21T20:53:00Z');

    // Calculate days since known new moon
    const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / msPerDay;

    // Calculate current phase (0 to 1, where 0 and 1 are new moon, 0.5 is full moon)
    const normalizedPhase = (daysSinceNewMoon % synodicPeriod) / synodicPeriod;

    // More precise phase boundaries - using proper LunarPhase format
    if (normalizedPhase < 0.025 || normalizedPhase > 0.975) return 'new moon';
    if (normalizedPhase < 0.235) return 'waxing crescent';
    if (normalizedPhase < 0.265) return 'first quarter';
    if (normalizedPhase < 0.485) return 'waxing gibbous';
    if (normalizedPhase < 0.515) return 'full moon';
    if (normalizedPhase < 0.735) return 'waning gibbous';
    if (normalizedPhase < 0.765) return 'last quarter';
    return 'waning crescent';
  }

  /**
   * Calculate elemental balance based on zodiac sign, planets, and lunar phase
   */
  private calculateElementalBalance(
    zodiacSign: any,
    dominantPlanets: CelestialBody[],
    lunarPhase: string,
  ): ElementalProperties {
    // Initialize elemental balance
    const balance: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };

    // Apply zodiac influence
    const zodiacElements: Record<string, keyof ElementalProperties> = {
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

    const zodiacElement = zodiacElements[zodiacSign.toLowerCase()];
    if (zodiacElement) {
      balance[zodiacElement] += 0.2;
    }

    // Apply planetary influences
    const planetElements: Record<string, keyof ElementalProperties> = {
      Sun: 'Fire',
      Mars: 'Fire',
      Jupiter: 'Fire',
      Moon: 'Water',
      Neptune: 'Water',
      Venus: 'Earth',
      Saturn: 'Earth',
      Pluto: 'Earth',
      Mercury: 'Air',
      Uranus: 'Air',
    };

    dominantPlanets.forEach(planet => {
      const element = planetElements[planet.name];
      if (element) {
        balance[element] += 0.1 * (planet.influence || 0);
      }
    });

    // Apply lunar phase influence
    if (lunarPhase === 'full moon') {
      balance.Water += 0.15;
    } else if (lunarPhase === 'new moon') {
      balance.Air += 0.15;
    } else if (lunarPhase.includes('waxing')) {
      balance.Fire += 0.1;
    } else if (lunarPhase.includes('waning')) {
      balance.Earth += 0.1;
    }

    // Normalize values
    const sum = Object.values(balance).reduce((a, b) => a + b, 0);
    Object.keys(balance).forEach(key => {
      balance[key as unknown] /= sum;
    });

    return balance;
  }

  /**
   * Calculate planetary aspects
   */
  private calculatePlanetaryAspects(
    date: Date,
  ): Array<{ type: AspectType; planets: string[]; influence: number; orb?: number }> {
    // Base aspects
    const aspects: Array<{ type: AspectType; planets: string[]; influence: number; orb?: number }> =
      [];

    // Add a conjunction aspect based on day of week
    const weekday = date.getDay();
    if (weekday === 0) {
      aspects.push({
        type: 'conjunction' as AspectType,
        planets: ['Sun', 'Mercury'],
        influence: 0.7,
        orb: 2.1,
      });
    } else if (weekday === 1) {
      aspects.push({
        type: 'trine' as AspectType,
        planets: ['Moon', 'Venus'],
        influence: 0.6,
        orb: 3.2,
      });
    } else if (weekday === 2) {
      aspects.push({
        type: 'square' as AspectType,
        planets: ['Mars', 'Saturn'],
        influence: 0.5,
        orb: 2.5,
      });
    } else if (weekday === 3) {
      aspects.push({
        type: 'sextile' as AspectType,
        planets: ['Mercury', 'Jupiter'],
        influence: 0.6,
        orb: 1.8,
      });
    } else if (weekday === 4) {
      aspects.push({
        type: 'opposition' as AspectType,
        planets: ['Jupiter', 'Saturn'],
        influence: 0.5,
        orb: 4.0,
      });
    } else if (weekday === 5) {
      aspects.push({
        type: 'trine' as AspectType,
        planets: ['Venus', 'Neptune'],
        influence: 0.6,
        orb: 2.7,
      });
    } else {
      aspects.push({
        type: 'square' as AspectType,
        planets: ['Saturn', 'Uranus'],
        influence: 0.5,
        orb: 3.3,
      });
    }

    // Add additional aspects regardless of day

    // Add Sun-Jupiter aspect (optimism, growth)
    aspects.push({
      type: 'sextile' as AspectType,
      planets: ['Sun', 'Jupiter'],
      influence: 0.55,
      orb: 2.4,
    });

    // Add Moon-Neptune aspect (intuition, imagination)
    aspects.push({
      type: 'trine' as AspectType,
      planets: ['Moon', 'Neptune'],
      influence: 0.5,
      orb: 3.1,
    });

    // Add Mars-Pluto aspect (intensity, determination)
    aspects.push({
      type: 'square' as AspectType,
      planets: ['Mars', 'Pluto'],
      influence: 0.6,
      orb: 2.2,
    });

    // Add Mercury-Uranus aspect (creativity, unexpected insights)
    aspects.push({
      type: 'trine' as AspectType,
      planets: ['Mercury', 'Uranus'],
      influence: 0.45,
      orb: 2.9,
    });

    // Add Venus-Saturn aspect (lasting relationships, stability in values)
    aspects.push({
      type: 'sextile' as AspectType,
      planets: ['Venus', 'Saturn'],
      influence: 0.4,
      orb: 1.5,
    });

    return aspects;
  }

  /**
   * Get current celestial alignment
   */
  getCurrentAlignment(): CelestialAlignment {
    const now = Date.now();
    const timeSinceLastCalculation = now - this.lastCalculation;

    // Only recalculate if needed
    if (timeSinceLastCalculation > this.UPDATE_INTERVAL) {
      this.calculateCurrentInfluences();
      this.lastCalculation = now;
    }

    // Get from cache
    const cached = cache.get(this.CACHE_KEY) as CelestialAlignment | undefined;

    // Return cached value with safeguards or calculate new
    return cached ? this.ensureCompleteAlignment(cached) : this.calculateCurrentInfluences();
  }

  /**
   * Get tarot influences from cache or calculate new ones
   */
  private getTarotInfluences(): TarotCard[] {
    let tarotCards = cache.get(this.TAROT_CACHE_KEY) as TarotCard[] | undefined;

    if (!tarotCards || !Array.isArray(tarotCards) || tarotCards.length === 0) {
      const alignment = this.getCurrentAlignment();
      tarotCards = this.calculateTarotInfluences(
        alignment.zodiacSign || 'libra',
        alignment.dominantPlanets || [],
      );
      cache.set(this.TAROT_CACHE_KEY, tarotCards, 60 * 60);
    }

    return tarotCards;
  }

  /**
   * Get recommended recipe elemental balance based on current celestial alignment
   */
  getRecommendedRecipeElementalBalance(): ElementalProperties {
    try {
      const alignment = this.getCurrentAlignment();

      // Adjust balance for food context
      const balance: ElementalProperties = { ...alignment.elementalBalance } as ElementalProperties;

      // Generate energy state balance
      const energyStateBalance = this.calculateEnergyStateBalance(alignment);

      // Apply numerological adjustment based on current date
      const numerologicalFactor = celestialNumerology.calculateDailyNumber();

      // Apply small adjustment based on numerology
      const adjustment = 0.05;
      switch (numerologicalFactor) {
        case 1:
        case 9:
          // Increase Fire for creativity and endings
          balance.Fire = Math.min(0.6, balance.Fire + adjustment);
          energyStateBalance.Spirit += 0.05;
          break;
        case 2:
        case 7:
          // Increase Water for intuition and spirituality
          balance.Water = Math.min(0.6, balance.Water + adjustment);
          energyStateBalance.Essence += 0.05;
          break;
        case 4:
        case 8:
          // Increase Earth for stability and abundance
          balance.Earth = Math.min(0.6, balance.Earth + adjustment);
          energyStateBalance.Matter += 0.05;
          break;
        case 3:
        case 5:
        case 6:
          // Increase Air for communication and change
          balance.Air = Math.min(0.6, balance.Air + adjustment);
          energyStateBalance.Substance += 0.05;
          break;
      }

      // Apply tarot influences with priority on minor arcana
      const tarotCards = this.getTarotInfluences();
      tarotCards.forEach(card => {
        // For each card suit, adjust elements and energy states
        let suitAdjustment = 0.02;

        // Give more weight to minor arcana cards
        if (!card.majorArcana) {
          suitAdjustment = 0.04; // Double the influence for minor arcana
        }

        if (card.suit === 'wands') {
          balance.Fire += suitAdjustment;
          energyStateBalance.Spirit += 0.03 * (!card.majorArcana ? 1.5 : 1);
        }
        if (card.suit === 'cups') {
          balance.Water += suitAdjustment;
          energyStateBalance.Essence += 0.03 * (!card.majorArcana ? 1.5 : 1);
        }
        if (card.suit === 'swords') {
          balance.Air += suitAdjustment;
          energyStateBalance.Substance += 0.03 * (!card.majorArcana ? 1.5 : 1);
        }
        if (card.suit === 'pentacles') {
          balance.Earth += suitAdjustment;
          energyStateBalance.Matter += 0.03 * (!card.majorArcana ? 1.5 : 1);
        }
      });

      // Map chakra energy distribution based on current zodiac sign and planets
      const chakraEnergies = this.calculateChakraEnergies(alignment, energyStateBalance);

      // Store the calculated energy states and chakra energies in the cache
      if (alignment && typeof alignment === 'object') {
        alignment.energyStateBalance = energyStateBalance;
        alignment.chakraEmphasis = chakraEnergies;
        cache.set(this.CACHE_KEY, alignment, 60 * 60);
      }

      // Normalize values again
      const sum = Object.values(balance).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        Object.keys(balance).forEach(key => {
          balance[key as unknown] /= sum;
        });
      }

      return balance;
    } catch (error) {
      logger.error('Error generating recommended elemental balance:', error);

      // Return balanced default
      return {
        Fire: 0.25,
        Earth: 0.25,
        Air: 0.25,
        Water: 0.25,
      };
    }
  }

  /**
   * Calculate energy state balance based on celestial alignment
   */
  private calculateEnergyStateBalance(alignment: CelestialAlignment): EnergyStateProperties {
    // Initialize energy states with equal distribution
    const energyStateBalance: EnergyStateProperties = {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25,
    };

    // Skip calculation if missing required data
    if (!alignment.dominantPlanets || !alignment.zodiacSign) {
      return energyStateBalance;
    }

    // Modify energy states based on zodiac
    if (alignment.zodiacSign) {
      // First, apply zodiac influence
      const sign = alignment.zodiacSign.toLowerCase();

      // Apply elemental influences based on zodiac element
      switch (sign) {
        // Fire signs boost Spirit
        case 'aries':
        case 'leo':
        case 'sagittarius':
          energyStateBalance.Spirit += 0.1;
          energyStateBalance.Essence += 0.05;
          energyStateBalance.Matter -= 0.1;
          energyStateBalance.Substance -= 0.05;
          break;

        // Water signs boost Essence
        case 'cancer':
        case 'scorpio':
        case 'pisces':
          energyStateBalance.Spirit -= 0.05;
          energyStateBalance.Essence += 0.1;
          energyStateBalance.Matter -= 0.05;
          energyStateBalance.Substance += 0;
          break;

        // Air signs boost Substance
        case 'gemini':
        case 'libra':
        case 'aquarius':
          energyStateBalance.Spirit += 0.05;
          energyStateBalance.Essence -= 0.05;
          energyStateBalance.Matter -= 0.05;
          energyStateBalance.Substance += 0.05;
          break;

        // Earth signs boost Matter
        case 'taurus':
        case 'virgo':
        case 'capricorn':
          energyStateBalance.Spirit -= 0.1;
          energyStateBalance.Essence -= 0.05;
          energyStateBalance.Matter += 0.1;
          energyStateBalance.Substance += 0.05;
          break;
      }

      // Apply Jupiter's effects - expansion
      const jupiterPlanet = alignment.dominantPlanets.find(p => p.name === 'Jupiter');
      if (jupiterPlanet) {
        const jupiterInfluence = jupiterPlanet.influence;
        const jupiterEffect = (jupiterPlanet as any).effect as
          | 'expansive'
          | 'balanced'
          | 'restricted';

        // Apply effects based on Jupiter's condition
        if (jupiterEffect === 'expansive') {
          // Jupiter expands all energies, but especially Spirit and Substance
          energyStateBalance.Spirit += 0.07 * (jupiterInfluence || 0);
          energyStateBalance.Substance += 0.06 * (jupiterInfluence || 0);
          energyStateBalance.Essence += 0.04 * (jupiterInfluence || 0);
          energyStateBalance.Matter += 0.03 * (jupiterInfluence || 0);
        } else if (jupiterEffect === 'balanced') {
          // Balanced Jupiter provides moderate expansion to all energies
          energyStateBalance.Spirit += 0.04 * (jupiterInfluence || 0);
          energyStateBalance.Substance += 0.04 * (jupiterInfluence || 0);
          energyStateBalance.Essence += 0.04 * (jupiterInfluence || 0);
          energyStateBalance.Matter += 0.04 * (jupiterInfluence || 0);
        } else if (jupiterEffect === 'restricted') {
          // Restricted Jupiter still expands, but mainly focused on practical energies
          energyStateBalance.Spirit += 0.02 * (jupiterInfluence || 0);
          energyStateBalance.Substance += 0.03 * (jupiterInfluence || 0);
          energyStateBalance.Essence += 0.03 * (jupiterInfluence || 0);
          energyStateBalance.Matter += 0.06 * (jupiterInfluence || 0);
        }
      }

      // Apply Saturn's effects - restriction and structure
      const saturnPlanet = alignment.dominantPlanets.find(p => p.name === 'Saturn');
      if (saturnPlanet) {
        const saturnInfluence = saturnPlanet.influence;
        const saturnEffect = (saturnPlanet as any).effect as
          | 'restrictive'
          | 'balanced'
          | 'softened';

        // Apply effects based on Saturn's condition
        if (saturnEffect === 'restrictive') {
          // Strong Saturn restricts expansion but adds discipline and structure, especially to Matter
          energyStateBalance.Spirit -= 0.02 * (saturnInfluence || 0);
          energyStateBalance.Substance += 0.02 * (saturnInfluence || 0);
          energyStateBalance.Essence -= 0.02 * (saturnInfluence || 0);
          energyStateBalance.Matter += 0.06 * (saturnInfluence || 0);
        } else if (saturnEffect === 'balanced') {
          // Balanced Saturn provides helpful structure without excessive restriction
          energyStateBalance.Spirit += 0.01 * (saturnInfluence || 0);
          energyStateBalance.Substance += 0.03 * (saturnInfluence || 0);
          energyStateBalance.Essence -= 0.01 * (saturnInfluence || 0);
          energyStateBalance.Matter += 0.04 * (saturnInfluence || 0);
        } else if (saturnEffect === 'softened') {
          // Softened Saturn has reduced restrictive qualities
          energyStateBalance.Substance += 0.02 * (saturnInfluence || 0);
          energyStateBalance.Matter += 0.03 * (saturnInfluence || 0);
        }
      }
    }

    // Normalize energy state values
    const total = Object.values(energyStateBalance).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(energyStateBalance).forEach(key => {
        energyStateBalance[key as keyof EnergyStateProperties] /= total;
      });
    }

    return energyStateBalance;
  }

  /**
   * Calculate chakra energy distribution
   */
  private calculateChakraEnergies(
    alignment: CelestialAlignment,
    energyStates: EnergyStateProperties,
  ): ChakraEnergies {
    const chakraEnergies: ChakraEnergies = {
      root: 0.1, // Earth, Matter
      sacral: 0.1, // Water, Essence (lower)
      solarPlexus: 0.1, // Fire, Essence (upper)
      heart: 0.1, // Air/Water balance
      throat: 0.1, // Air, Substance
      thirdEye: 0.1, // Water/Air, Essence/Substance
      crown: 0.1, // Fire/Spirit
    };

    // Map elements to chakras
    const elementalBalance = alignment.elementalBalance || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
    chakraEnergies.root += ((elementalBalance as any)?.Earth || 0) * 0.2;
    chakraEnergies.sacral += ((elementalBalance as any)?.Water || 0) * 0.2;
    chakraEnergies.solarPlexus += ((elementalBalance as any)?.Fire || 0) * 0.2;
    chakraEnergies.heart +=
      ((elementalBalance as any)?.Air || 0) * 0.2 + ((elementalBalance as any)?.Water || 0) * 0.2;
    chakraEnergies.throat += ((elementalBalance as any)?.Air || 0) * 0.2;
    // Apply safe type casting for chakra property access
    chakraEnergies.thirdEye +=
      ((elementalBalance as any)?.Water || 0) * 0.2 + ((elementalBalance as any)?.Air || 0) * 0.2;
    chakraEnergies.crown += ((elementalBalance as any)?.Fire || 0) * 0.2;

    // Map energy states to chakras using the correct ESMS relationships
    // Spirit (Wands): Crown
    // Substance (Swords): Throat
    // Essence (Cups): Heart/Solar Plexus
    // Matter (Pentacles): Root
    chakraEnergies.crown += ((energyStates as any)?.Spirit || 0) * 0.2;
    chakraEnergies.throat += ((energyStates as any)?.Substance || 0) * 0.2;
    chakraEnergies.heart += ((energyStates as any)?.Essence || 0) * 0.2;
    chakraEnergies.solarPlexus += ((energyStates as any)?.Essence || 0) * 0.2;
    chakraEnergies.sacral += ((energyStates as any)?.Essence || 0) * 0.2;
    chakraEnergies.root += ((energyStates as any)?.Matter || 0) * 0.2;

    // Apply lunar phase influence
    switch (alignment.lunarPhase) {
      case 'new moon':
        // New moon boosts crown and thirdEye (Spirit/Substance)
        chakraEnergies.crown += 0.1;
        chakraEnergies.thirdEye += 0.1;
        break;
      case 'full moon':
        // Full moon boosts heart and sacral (Essence)
        chakraEnergies.heart += 0.1;
        chakraEnergies.sacral += 0.1;
        break;
      case 'waning crescent':
      case 'last quarter':
        // Waning phases boost root and sacral (Matter/lower Essence)
        chakraEnergies.root += 0.1;
        chakraEnergies.sacral += 0.05;
        break;
      case 'waxing crescent':
      case 'first quarter':
        // Waxing phases boost solar plexus and throat (upper Essence/Substance)
        chakraEnergies.solarPlexus += 0.1;
        chakraEnergies.throat += 0.05;
        break;
    }

    // Normalize chakra energy values
    const total = Object.values(chakraEnergies).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(chakraEnergies).forEach(key => {
        chakraEnergies[key as keyof ChakraEnergies] /= total;
      });
    }

    return chakraEnergies;
  }

  // Add type guard to validate CelestialData
  private isCelestialData(data: unknown): data is CelestialData {
    // Type guard to check if data is CelestialData
    if (!data || typeof data !== 'object') return false;

    const celestialData = data as Partial<CelestialData>;
    return (
      celestialData.sun !== undefined &&
      celestialData.moon !== undefined &&
      celestialData.elementalState !== undefined &&
      celestialData.season !== undefined &&
      celestialData.moonPhase !== undefined
    );
  }

  // Public API for testing
  getCurrentData(): CelestialData | null {
    const data = cache.get(this.CACHE_KEY);
    // Validate and type cast the data
    return this.isCelestialData(data) ? data : null;
  }

  /**
   * Calculate minor arcana card for current date
   */
  private calculateMinorArcanaForDate(date: Date): TarotCard | null {
    const month = date.getMonth(); // 0-11
    const day = date.getDate(); // 1-31

    // Find matching card based on date
    for (const [cardName, dateRange] of Object.entries(MINOR_ARCANA_DATE_MAPPING)) {
      const { startMonth, startDay, endMonth, endDay } = dateRange;

      // Check if the date falls within this card's range
      const afterStart = month > startMonth || (month === startMonth && day >= startDay);
      const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);

      // Handle year boundary cases (e.g., Dec 22 - Jan 1)
      let isInRange = false;
      if (startMonth > endMonth) {
        // Range spans the year boundary
        isInRange = afterStart || beforeEnd;
      } else {
        // Regular range within the year
        isInRange = afterStart && beforeEnd;
      }

      if (isInRange) {
        // Parse suit from card name (e.g., 'two_of_wands' -> 'wands')
        const [_, __, suit] = cardName.split('_');

        // Get value from card name (e.g., 'two_of_wands' -> 2)
        const valueMap: Record<string, number> = {
          ace: 1,
          two: 2,
          three: 3,
          four: 4,
          five: 5,
          six: 6,
          seven: 7,
          eight: 8,
          nine: 9,
          ten: 10,
        };
        const value = valueMap[cardName.split('_')[0]] || 0;

        // Get elemental association
        const affinityData = MINOR_ARCANA_ELEMENTAL_AFFINITIES[
          suit as keyof typeof MINOR_ARCANA_ELEMENTAL_AFFINITIES
        ] as Record<string, unknown>;
        const { element, _energyState } = affinityData;

        // Determine the zodiac sign based on the date
        const zodiacSign = this.determineZodiacSign(month, day);

        // Create and return the minor arcana card
        const displayName = cardName
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return {
          name: displayName,
          suit: suit as 'wands' | 'cups' | 'swords' | 'pentacles',
          description: `Minor Arcana card for ${zodiacSign}, representing the current period`,
          planetaryInfluences: {}, // Minor arcana are more linked to decans than planets
        };
      }
    }

    // Fallback - return Ace of Cups if no match found
    return null;
  }

  /**
   * Get meaning keywords for a minor arcana card
   */
  private getMeaningForMinorArcana(suit: string, value: number, isUpright: boolean): string[] {
    // Default meanings
    const meanings = {
      wands: {
        upright: [
          'Creativity',
          'Inspiration',
          'New beginnings', // Ace
          'Planning',
          'Discovery',
          'Future planning', // Two
          'Progress',
          'Expansion',
          'Foresight', // Three
          'Celebration',
          'Harmony',
          'Completion', // Four
          'Conflict',
          'Competition',
          'Disagreement', // Five
          'Victory',
          'Success',
          'Public reward', // Six
          'Challenge',
          'Perseverance',
          'Maintaining', // Seven
          'Movement',
          'Speed',
          'Rapid change', // Eight
          'Resilience',
          'Defense',
          'Persistence', // Nine
          'Burden',
          'Responsibility',
          'Completion', // Ten
        ],
        reversed: [
          'Delays',
          'Blocked creativity',
          'Lack of inspiration', // Ace
          'Lack of planning',
          'Disorganization',
          'Obstacles', // Two
          'Delays',
          'Frustration',
          'Obstacles to expansion', // Three
          'Dissatisfaction',
          'Boredom',
          'Missing celebration', // Four
          'Avoiding conflict',
          'Resolution',
          'Harmony', // Five
          'Private victory',
          'Fall from grace',
          'Excessive pride', // Six
          'Giving up',
          'Overwhelm',
          'Exhaustion', // Seven
          'Slowing down',
          'Obstacles',
          'Delays', // Eight
          'Weakness',
          'Giving up',
          'Overwhelm', // Nine
          'Release',
          'Delegation',
          'Collapse', // Ten
        ],
      },
      // Similar mappings for cups, swords, and pentacles...
      cups: {
        upright: [
          'Love',
          'New emotions',
          'Intuition', // Ace
          'Connection',
          'Attraction',
          'Relationship', // Two
          'Celebration',
          'Friendship',
          'Community', // Three
          'Apathy',
          'Contemplation',
          'Disconnect', // Four
          'Loss',
          'Regret',
          'Disappointment', // Five
          'Nostalgia',
          'Memories',
          'Reunion', // Six
          'Choices',
          'Fantasy',
          'Illusion', // Seven
          'Disillusionment',
          'Walking away',
          'Change', // Eight
          'Satisfaction',
          'Contentment',
          'Gratitude', // Nine
          'Harmony',
          'Fulfillment',
          'Emotional completion', // Ten
        ],
        reversed: [
          'Blocked emotions',
          'Repression',
          'Emptiness', // Ace
          'Disconnection',
          'One-sided attraction',
          'Imbalance', // Two
          'Overindulgence',
          'Isolation',
          'Loneliness', // Three
          'Openness',
          'New awareness',
          'Receptivity', // Four
          'Acceptance',
          'Forgiveness',
          'Moving on', // Five
          'Stuck in past',
          'Missing someone',
          'Independence', // Six
          'Clarity',
          'Reality check',
          'Decision making', // Seven
          'Returning',
          'Acceptance',
          'Moving forward', // Eight
          'Inner happiness',
          'Taking for granted',
          'Dissatisfaction', // Nine
          'Broken relationships',
          'Disconnection',
          'Misalignment', // Ten
        ],
      },
      swords: {
        upright: [
          'Clarity',
          'Truth',
          'Breakthrough', // Ace
          'Difficult decisions',
          'Balance',
          'Stalemate', // Two
          'Heartbreak',
          'Grief',
          'Separation', // Three
          'Rest',
          'Recovery',
          'Contemplation', // Four
          'Conflict',
          'Disagreement',
          'Competition', // Five
          'Transition',
          'Change',
          'Leaving behind', // Six
          'Deception',
          'Strategy',
          'Stealth', // Seven
          'Restriction',
          'Limitation',
          'Imprisonment', // Eight
          'Anxiety',
          'Worry',
          'Fear', // Nine
          'Endings',
          'Loss',
          'Painful transition', // Ten
        ],
        reversed: [
          'Confusion',
          'Chaos',
          'Cloudiness', // Ace
          'Indecision',
          'Confusion',
          'Information overload', // Two
          'Recovery',
          'Forgiveness',
          'Moving on', // Three
          'Awakening',
          'Renewal',
          'Re-engagement', // Four
          'Reconciliation',
          'Making amends',
          'Truce', // Five
          'Staying put',
          'Accepting difficulty',
          'Resistance', // Six
          'Honesty',
          'Open communication',
          'Truth revealed', // Seven
          'Freedom',
          'Self-acceptance',
          'New perspective', // Eight
          'Hope',
          'reaching out',
          'seeing the positive', // Nine
          'Recovery',
          'Regeneration',
          'Inevitable end', // Ten
        ],
      },
      pentacles: {
        upright: [
          'Prosperity',
          'Abundance',
          'New resources', // Ace
          'Balance',
          'Adaptability',
          'Time management', // Two
          'Teamwork',
          'Collaboration',
          'Skill', // Three
          'Conservation',
          'Security',
          'Saving', // Four
          'Hardship',
          'Struggle',
          'Insecurity', // Five
          'Charity',
          'Generosity',
          'Giving and receiving', // Six
          'Assessment',
          'Evaluation',
          'Patience', // Seven
          'Diligence',
          'Detail',
          'Craftsmanship', // Eight
          'Luxury',
          'Self-sufficiency',
          'Financial security', // Nine
          'Legacy',
          'Inheritance',
          'Culmination', // Ten
        ],
        reversed: [
          'Lost opportunity',
          'Lack of planning',
          'Missed chance', // Ace
          'Disorganization',
          'Financial chaos',
          'Imbalance', // Two
          'Lack of teamwork',
          'Disharmony',
          'Working alone', // Three
          'Greed',
          'Hoarding',
          'Financial insecurity', // Four
          'Recovery',
          'Support',
          'Overcoming hardship', // Five
          'Selfishness',
          'Strings attached',
          'Debt', // Six
          'Impatience',
          'Lack of strategy',
          'Poor investment', // Seven
          'Cutting corners',
          'Rushed work',
          'Perfectionism', // Eight
          'Material focus',
          'Showing off',
          'Financial dependence', // Nine
          'Short-term focus',
          'Lack of stability',
          'Fleeting success', // Ten
        ],
      },
    };

    // Adjust for zero-indexing of arrays
    const index = Math.max(0, Math.min(value - 1, 9));

    // Return appropriate meanings based on suit, value, and orientation
    const orientation = isUpright ? 'upright' : 'reversed';
    return (
      meanings[suit as keyof typeof meanings][orientation].slice(index * 3, index * 3 + 3) || [
        'Balance',
        'Harmony',
        'Connection',
      ]
    );
  }
}

export const celestialCalculator = CelestialCalculator.getInstance();
