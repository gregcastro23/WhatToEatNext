// import { celestialBodies } from '../data/celestial/bodies';
import { celestialNumerology } from '../utils/numerology';
import { logger } from '../utils/logger';
import { cache } from '../utils/cache';
import type { CelestialAlignment, ElementalProperties, CelestialBody, TarotCard, EnergyStateProperties, ChakraEnergies, ZodiacSign, AspectType, PlanetaryAspect } from '../types/alchemy';

// Tarot elemental correspondences
const TAROT_ELEMENTAL_MAPPING: Record<string, { Element: string; Spirit: number; Essence: number; Matter: number; Substance: number }> = {
  'wands': { Element: 'Fire', Spirit: 0.9, Essence: 0.3, Matter: 0.2, Substance: 0.4 },
  'cups': { Element: 'Water', Essence: 0.8, Spirit: 0.4, Matter: 0.3, Substance: 0.5 },
  'swords': { Element: 'Air', Substance: 0.8, Spirit: 0.5, Matter: 0.3, Essence: 0.4 },
  'pentacles': { Element: 'Earth', Matter: 0.9, Spirit: 0.2, Substance: 0.4, Essence: 0.3 }
};

// Tarot zodiac associations
const TAROT_ZODIAC_MAPPING: Record<string, string[]> = {
  'aries': ['Emperor', 'Tower'],
  'taurus': ['Hierophant', 'Empress'],
  'gemini': ['Lovers', 'Magician'],
  'cancer': ['Chariot', 'High Priestess'],
  'leo': ['Strength', 'Sun'],
  'virgo': ['Hermit', 'Magician'],
  'libra': ['Justice', 'Empress'],
  'scorpio': ['Death', 'Judgment'],
  'sagittarius': ['Temperance', 'Wheel of Fortune'],
  'capricorn': ['Devil', 'World'],
  'aquarius': ['Star', 'Fool'],
  'pisces': ['Moon', 'Hanged Man']
};

// Planetary tarot associations
const TAROT_PLANETARY_MAPPING: Record<string, string[]> = {
  'Sun': ['Sun', 'Emperor'],
  'Moon': ['High Priestess', 'Moon'],
  'Mercury': ['Magician', 'Lovers'],
  'Venus': ['Empress', 'Hierophant'],
  'Mars': ['Tower', 'Chariot'],
  'Jupiter': ['Wheel of Fortune', 'Temperance'],
  'Saturn': ['World', 'Hermit'],
  'Uranus': ['Fool', 'Star'],
  'Neptune': ['Hanged Man', 'Moon'],
  'Pluto': ['Death', 'Judgment']
};

// Add minor arcana mappings after the existing major arcana mappings
// Minor arcana cards mapped to dates in the year - 36 decans of 10 days each
const MINOR_ARCANA_DATE_MAPPING = {
  // Wands (Fire) - Spring
  'ace_of_wands': { startMonth: 2, startDay: 21, endMonth: 2, endDay: 30 },  // aries decan 1
  'two_of_wands': { startMonth: 3, startDay: 1, endMonth: 3, endDay: 10 },   // aries decan 2
  'three_of_wands': { startMonth: 3, startDay: 11, endMonth: 3, endDay: 19 }, // aries decan 3
  'four_of_wands': { startMonth: 3, startDay: 20, endMonth: 3, endDay: 29 },  // taurus decan 1
  'five_of_wands': { startMonth: 3, startDay: 30, endMonth: 4, endDay: 9 },   // taurus decan 2
  'six_of_wands': { startMonth: 4, startDay: 10, endMonth: 4, endDay: 20 },   // taurus decan 3
  'seven_of_wands': { startMonth: 4, startDay: 21, endMonth: 4, endDay: 31 }, // gemini decan 1
  'eight_of_wands': { startMonth: 5, startDay: 1, endMonth: 5, endDay: 10 },  // gemini decan 2
  'nine_of_wands': { startMonth: 5, startDay: 11, endMonth: 5, endDay: 20 },  // gemini decan 3

  // Cups (Water) - Summer
  'ace_of_cups': { startMonth: 5, startDay: 21, endMonth: 5, endDay: 30 },   // cancer decan 1
  'two_of_cups': { startMonth: 6, startDay: 1, endMonth: 6, endDay: 11 },    // cancer decan 2
  'three_of_cups': { startMonth: 6, startDay: 12, endMonth: 6, endDay: 22 },  // cancer decan 3
  'four_of_cups': { startMonth: 6, startDay: 23, endMonth: 7, endDay: 2 },    // leo decan 1
  'five_of_cups': { startMonth: 7, startDay: 3, endMonth: 7, endDay: 12 },    // leo decan 2
  'six_of_cups': { startMonth: 7, startDay: 13, endMonth: 7, endDay: 22 },    // leo decan 3
  'seven_of_cups': { startMonth: 7, startDay: 23, endMonth: 8, endDay: 2 },   // virgo decan 1
  'eight_of_cups': { startMonth: 8, startDay: 3, endMonth: 8, endDay: 12 },   // virgo decan 2
  'nine_of_cups': { startMonth: 8, startDay: 13, endMonth: 8, endDay: 22 },   // virgo decan 3

  // Swords (Air) - Fall
  'ace_of_swords': { startMonth: 8, startDay: 23, endMonth: 9, endDay: 2 },   // Libra decan 1
  'two_of_swords': { startMonth: 9, startDay: 3, endMonth: 9, endDay: 12 },   // Libra decan 2
  'three_of_swords': { startMonth: 9, startDay: 13, endMonth: 9, endDay: 22 }, // Libra decan 3
  'four_of_swords': { startMonth: 9, startDay: 23, endMonth: 10, endDay: 2 },  // Scorpio decan 1
  'five_of_swords': { startMonth: 10, startDay: 3, endMonth: 10, endDay: 12 },  // Scorpio decan 2
  'six_of_swords': { startMonth: 10, startDay: 13, endMonth: 10, endDay: 21 },  // Scorpio decan 3
  'seven_of_swords': { startMonth: 10, startDay: 22, endMonth: 11, endDay: 1 }, // sagittarius decan 1
  'eight_of_swords': { startMonth: 11, startDay: 2, endMonth: 11, endDay: 11 }, // sagittarius decan 2
  'nine_of_swords': { startMonth: 11, startDay: 12, endMonth: 11, endDay: 21 }, // sagittarius decan 3

  // Pentacles (Earth) - Winter
  'ace_of_pentacles': { startMonth: 11, startDay: 22, endMonth: 0, endDay: 1 },  // capricorn decan 1
  'two_of_pentacles': { startMonth: 0, startDay: 2, endMonth: 0, endDay: 11 },   // capricorn decan 2
  'three_of_pentacles': { startMonth: 0, startDay: 12, endMonth: 0, endDay: 19 }, // capricorn decan 3
  'four_of_pentacles': { startMonth: 0, startDay: 20, endMonth: 0, endDay: 29 },  // aquarius decan 1
  'five_of_pentacles': { startMonth: 0, startDay: 30, endMonth: 1, endDay: 8 },   // aquarius decan 2
  'six_of_pentacles': { startMonth: 1, startDay: 9, endMonth: 1, endDay: 18 },    // aquarius decan 3
  'seven_of_pentacles': { startMonth: 1, startDay: 19, endMonth: 1, endDay: 28 }, // pisces decan 1
  'eight_of_pentacles': { startMonth: 1, startDay: 29, endMonth: 2, endDay: 10 }, // pisces decan 2
  'nine_of_pentacles': { startMonth: 2, startDay: 11, endMonth: 2, endDay: 20 }   // pisces decan 3
};

// Minor arcana elemental affinities
const MINOR_ARCANA_ELEMENTAL_AFFINITIES = {
  'wands': { element: 'Fire', energyState: 'Spirit' },
  'cups': { element: 'Water', energyState: 'Essence' },
  'swords': { element: 'Air', energyState: 'Substance' },
  'pentacles': { element: 'Earth', energyState: 'Matter' }
};

interface CelestialPosition {
  sign: string;
  degree: number;
}

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
  private lastCalculation: number = 0;

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
        if (!cached.astrologicalInfluences || !Array.isArray(cached.astrologicalInfluences) || cached.astrologicalInfluences.length === 0) {
          const influences = cached.dominantPlanets ? 
            [...cached.dominantPlanets.map((p) => p.name), cached.zodiacSign || 'libra', 'all'] : 
            ['Sun', 'Moon', cached.zodiacSign || 'libra', 'all'];
          
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
      
      // Determine planetary influences based on day of week and hour
      const dominantPlanets = this.determineDominantPlanets(now.getDay(), hour);
      
      // Calculate lunar phase
      const lunarPhase = this.calculateLunarPhase(now);
      
      // Calculate elemental balance
      const elementalBalance = this.calculateElementalBalance(zodiacSign, dominantPlanets, lunarPhase);
      
      // Calculate tarot influences
      const tarotInfluences = this.calculateTarotInfluences(zodiacSign, dominantPlanets);
      cache.set(this.TAROT_CACHE_KEY, tarotInfluences, 60 * 60);
      
      // Generate astrological influences from planets, zodiac, and tarot
      const astroInfluences = [
        ...dominantPlanets.map(p => p.name),
        zodiacSign,
        ...tarotInfluences.map(t => t.name),
        'all' // Always include 'all' for universal matching
      ];
      
      // Build complete celestial alignment
      const alignment: CelestialAlignment = {
        date: now.toISOString(),
        zodiacSign,
        dominantPlanets,
        lunarPhase,
        elementalBalance,
        aspectInfluences: this.calculatePlanetaryAspects(now).map(aspect => ({
          planet1: aspect.planets[0],
          planet2: aspect.planets[1],
          type: aspect.type,
          orb: aspect.orb || 0,
          strength: aspect.influence
        } as PlanetaryAspect)),
        astrologicalInfluences: astroInfluences // Ensure this is always present and includes tarot influences and 'all'
      };
      
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
   * Calculate tarot influences based on current zodiac, planets, and date
   */
  private calculateTarotInfluences(zodiacSign: ZodiacSign, dominantPlanets: CelestialBody[]): TarotCard[] {
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
    planetaryAssociation?: string
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
      const element = TAROT_ELEMENTAL_MAPPING[suit]?.Element as 'Fire' | 'Water' | 'Earth' | 'Air';
      elementalAssociation = element;
    }
    
    return {
      name,
      suit,
      value: 0, // Placeholder
      description: `Tarot card associated with ${zodiacAssociation || planetaryAssociation || 'universal forces'}`,
      meaning: {
        upright: ['Connection', 'Harmony', 'Balance'],
        reversed: ['Disconnection', 'Disharmony', 'Imbalance']
      },
      elementalAssociation,
      zodiacAssociation: zodiacAssociation as ZodiacSign | undefined,
      planetaryAssociation
    };
  }
  
  /**
   * Ensure a celestial alignment has all required properties
   */
  private ensureCompleteAlignment(alignment: Partial<CelestialAlignment>): CelestialAlignment {
    if (!alignment) {
      return this.getFallbackAlignment();
    }
    
    // Start with complete defaults
    const safeAlignment: CelestialAlignment = {
      date: new Date().toISOString(),
      zodiacSign: 'libra' as ZodiacSign,
      dominantPlanets: [
        { name: 'Sun', influence: 0.5 },
        { name: 'Moon', influence: 0.5 }
      ],
      lunarPhase: 'full',
      elementalBalance: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      aspectInfluences: [],
      astrologicalInfluences: ['Sun', 'Moon', 'libra', 'all']
    };
    
    // Override with any valid properties from the input
    if (typeof alignment.date === 'string') {
      safeAlignment.date = alignment.date;
    }
    
    if (typeof alignment.zodiacSign === 'string') {
      safeAlignment.zodiacSign = alignment.zodiacSign as ZodiacSign;
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
    if (alignment.astrologicalInfluences && Array.isArray(alignment.astrologicalInfluences) && alignment.astrologicalInfluences.length > 0) {
      safeAlignment.astrologicalInfluences = alignment.astrologicalInfluences;
    } else {
      // Generate from dominant planets and zodiac sign
      safeAlignment.astrologicalInfluences = [
        ...(safeAlignment.dominantPlanets.map(p => p.name)),
        safeAlignment.zodiacSign,
        'all' // Add 'all' as a fallback to ensure matches with recipes
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
      zodiacSign: 'libra' as ZodiacSign, // Balance
      dominantPlanets: [
        { name: 'Sun', influence: 0.5 },
        { name: 'Moon', influence: 0.5 }
      ],
      lunarPhase: 'full',
      elementalBalance: {
        Fire: 0.25,
        Earth: 0.25,
        Air: 0.25,
        Water: 0.25
      },
      aspectInfluences: [],
      astrologicalInfluences: ['Sun', 'Moon', 'libra', 'all'] // Ensure this is always present and has values
    };
  }

  /**
   * Determine zodiac sign based on month and day
   */
  private determineZodiacSign(month: number, day: number): ZodiacSign {
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
   * Determine dominant planets based on day of week and hour
   */
  private determineDominantPlanets(dayOfWeek: number, hour: number): CelestialBody[] {
    // Simplified planetary rulers based on day of week
    const dayRulers = [
      'Sun',     // Sunday
      'Moon',    // Monday
      'Mars',    // Tuesday
      'Mercury', // Wednesday
      'Jupiter', // Thursday
      'Venus',   // Friday
      'Saturn'   // Saturday
    ];
    
    // Hour rulers (simplified)
    const hourRulers = [
      'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
      'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
      'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars',
      'Sun', 'Venus', 'Mercury'
    ];
    
    const dayRuler = dayRulers[dayOfWeek];
    const hourRuler = hourRulers[hour];
    
    // Create dominant planets array with weights
    const dominantPlanets: CelestialBody[] = [
      { name: dayRuler, influence: 0.7 },
      { name: hourRuler, influence: 0.5 }
    ];
    
    // If it's a full moon, add lunar influence
    const now = new Date();
    const lunarPhase = this.calculateLunarPhase(now);
    if (lunarPhase === 'full') {
      dominantPlanets.push({ name: 'Moon', influence: 0.6 });
    }
    
    // Add some outer planets for additional influences
    dominantPlanets.push(
      { name: 'Uranus', influence: 0.3 },
      { name: 'Neptune', influence: 0.2 },
      { name: 'Pluto', influence: 0.2 }
    );
    
    return dominantPlanets;
  }
  
  /**
   * Calculate lunar phase (simplified)
   */
  private calculateLunarPhase(date: Date): string {
    // Simplified lunar phase calculation
    const lunarCycle = 29.53; // days
    const knownNewMoon = new Date('2023-01-21T20:53:00Z');
    
    // Calculate days since known new moon
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / msPerDay;
    
    // Calculate current phase (0 to 1, where 0 and 1 are new moon, 0.5 is full moon)
    const normalizedPhase = (daysSinceNewMoon % lunarCycle) / lunarCycle;
    
    // Determine phase name
    if (normalizedPhase < 0.03 || normalizedPhase > 0.97) return 'new';
    if (normalizedPhase < 0.25) return 'waxing crescent';
    if (normalizedPhase < 0.28) return 'first quarter';
    if (normalizedPhase < 0.47) return 'waxing gibbous';
    if (normalizedPhase < 0.53) return 'full';
    if (normalizedPhase < 0.72) return 'waning gibbous';
    if (normalizedPhase < 0.78) return 'third quarter';
    return 'waning crescent';
  }
  
  /**
   * Calculate elemental balance based on zodiac sign, planets, and lunar phase
   */
  private calculateElementalBalance(zodiacSign: ZodiacSign, dominantPlanets: CelestialBody[], lunarPhase: string): ElementalProperties {
    // Initialize elemental balance
    const balance: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
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
      pisces: 'Water'
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
      Uranus: 'Air'
    };
    
    dominantPlanets.forEach(planet => {
      const element = planetElements[planet.name];
      if (element) {
        balance[element] += 0.1 * planet.influence;
      }
    });
    
    // Apply lunar phase influence
    if (lunarPhase === 'full') {
      balance.Water += 0.15;
    } else if (lunarPhase === 'new') {
      balance.Air += 0.15;
    } else if (lunarPhase.includes('waxing')) {
      balance.Fire += 0.1;
    } else if (lunarPhase.includes('waning')) {
      balance.Earth += 0.1;
    }
    
    // Normalize values
    const sum = Object.values(balance).reduce((a, b) => a + b, 0);
    Object.keys(balance).forEach(key => {
      balance[key as keyof ElementalProperties] /= sum;
    });
    
    return balance;
  }
  
  /**
   * Calculate planetary aspects (simplified)
   */
  private calculatePlanetaryAspects(date: Date): Array<{type: AspectType, planets: string[], influence: number, orb?: number}> {
    // Simplified implementation
    const aspects = [];
    
    // Add a conjunction aspect based on day of week
    const weekday = date.getDay();
    if (weekday === 0) {
      aspects.push({
        type: 'conjunction' as AspectType,
        planets: ['Sun', 'Mercury'],
        influence: 0.7,
        orb: 2.1
      });
    } else if (weekday === 1) {
      aspects.push({
        type: 'trine' as AspectType,
        planets: ['Moon', 'Venus'],
        influence: 0.6,
        orb: 3.2
      });
    } else if (weekday === 2) {
      aspects.push({
        type: 'square' as AspectType,
        planets: ['Mars', 'Saturn'],
        influence: 0.5,
        orb: 2.5
      });
    } else if (weekday === 3) {
      aspects.push({
        type: 'sextile' as AspectType,
        planets: ['Mercury', 'Jupiter'],
        influence: 0.6,
        orb: 1.8
      });
    } else if (weekday === 4) {
      aspects.push({
        type: 'opposition' as AspectType,
        planets: ['Jupiter', 'Saturn'],
        influence: 0.5,
        orb: 4.0
      });
    } else if (weekday === 5) {
      aspects.push({
        type: 'trine' as AspectType,
        planets: ['Venus', 'Neptune'],
        influence: 0.6,
        orb: 2.7
      });
    } else {
      aspects.push({
        type: 'square' as AspectType,
        planets: ['Saturn', 'Uranus'],
        influence: 0.5,
        orb: 3.3
      });
    }
    
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
        alignment.zodiacSign, 
        alignment.dominantPlanets
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
      const balance: ElementalProperties = { ...alignment.elementalBalance };
      
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
        
        // Give more weight to minor arcana cards (value 1-10)
        if (card.value > 0) {
          suitAdjustment = 0.04; // Double the influence for minor arcana
        }
        
        if (card.suit === 'wands') {
          balance.Fire += suitAdjustment;
          energyStateBalance.Spirit += 0.03 * (card.value > 0 ? 1.5 : 1);
        }
        if (card.suit === 'cups') {
          balance.Water += suitAdjustment;
          energyStateBalance.Essence += 0.03 * (card.value > 0 ? 1.5 : 1);
        }
        if (card.suit === 'swords') {
          balance.Air += suitAdjustment;
          energyStateBalance.Substance += 0.03 * (card.value > 0 ? 1.5 : 1);
        }
        if (card.suit === 'pentacles') {
          balance.Earth += suitAdjustment;
          energyStateBalance.Matter += 0.03 * (card.value > 0 ? 1.5 : 1);
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
          balance[key as keyof ElementalProperties] /= sum;
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
        Water: 0.25
      };
    }
  }
  
  /**
   * Calculate energy state balance based on celestial alignment
   */
  private calculateEnergyStateBalance(alignment: CelestialAlignment): EnergyStateProperties {
    // Default balanced energy states
    const energyStateBalance: EnergyStateProperties = {
      Spirit: 0.25,   // Associated with Crown chakra, wands
      Substance: 0.25, // Associated with Throat chakra, swords
      Essence: 0.25,   // Associated with Heart/Solar Plexus chakra, cups
      Matter: 0.25     // Associated with Root chakra, pentacles
    };
    
    // Apply zodiac influence on energy states
    // aries, leo, sagittarius boost Spirit
    // gemini, Libra, aquarius boost Substance
    // cancer, Scorpio, pisces boost Essence
    // taurus, virgo, capricorn boost Matter
    const fireZodiac = ['aries', 'leo', 'sagittarius'];
    const airZodiac = ['gemini', 'libra', 'aquarius'];
    const waterZodiac = ['cancer', 'scorpio', 'pisces'];
    const earthZodiac = ['taurus', 'virgo', 'capricorn'];
    
    const zodiacSign = alignment.zodiacSign.toLowerCase();
    if (fireZodiac.includes(zodiacSign)) {
      energyStateBalance.Spirit += 0.15;
    } else if (airZodiac.includes(zodiacSign)) {
      energyStateBalance.Substance += 0.15;
    } else if (waterZodiac.includes(zodiacSign)) {
      energyStateBalance.Essence += 0.15;
    } else if (earthZodiac.includes(zodiacSign)) {
      energyStateBalance.Matter += 0.15;
    }
    
    // Apply planetary influences on energy states
    if (alignment.dominantPlanets && Array.isArray(alignment.dominantPlanets)) {
      alignment.dominantPlanets.forEach(planet => {
        // Solar planets (Sun, Saturn): increase Spirit
        if (['Sun', 'Saturn'].includes(planet.name)) {
          energyStateBalance.Spirit += 0.05 * planet.influence;
        }
        // Air planets (Mercury, Jupiter, Uranus): increase Substance
        else if (['Mercury', 'Jupiter', 'Uranus'].includes(planet.name)) {
          energyStateBalance.Substance += 0.05 * planet.influence;
        }
        // Water planets (Moon, Neptune, Venus): increase Essence
        else if (['Moon', 'Neptune', 'Venus'].includes(planet.name)) {
          energyStateBalance.Essence += 0.05 * planet.influence;
        }
        // Earth planets (Mars, Pluto): increase Matter
        else if (['Mars', 'Pluto'].includes(planet.name)) {
          energyStateBalance.Matter += 0.05 * planet.influence;
        }
      });
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
  private calculateChakraEnergies(alignment: CelestialAlignment, energyStates: EnergyStateProperties): ChakraEnergies {
    const chakraEnergies: ChakraEnergies = {
      root: 0.1,       // Earth, Matter
      sacral: 0.1,      // Water, Essence (lower)
      solarPlexus: 0.1, // Fire, Essence (upper)
      heart: 0.1,       // Air/Water balance
      throat: 0.1,      // Air, Substance
      brow: 0.1,        // Water/Air, Essence/Substance
      crown: 0.1        // Fire/Spirit
    };
    
    // Map elements to chakras
    chakraEnergies.root += alignment.elementalBalance.Earth * 0.5;
    chakraEnergies.sacral += alignment.elementalBalance.Water * 0.3;
    chakraEnergies.solarPlexus += alignment.elementalBalance.Fire * 0.3;
    chakraEnergies.heart += (alignment.elementalBalance.Air * 0.25) + (alignment.elementalBalance.Water * 0.25);
    chakraEnergies.throat += alignment.elementalBalance.Air * 0.4;
    chakraEnergies.brow += (alignment.elementalBalance.Water * 0.2) + (alignment.elementalBalance.Air * 0.2);
    chakraEnergies.crown += alignment.elementalBalance.Fire * 0.3;
    
    // Map energy states to chakras using the correct ESMS relationships
    // Spirit (Wands): Crown
    // Substance (Swords): Throat
    // Essence (Cups): Heart/Solar Plexus
    // Matter (Pentacles): Root
    chakraEnergies.crown += energyStates.Spirit * 0.5;
    chakraEnergies.throat += energyStates.Substance * 0.5;
    chakraEnergies.heart += energyStates.Essence * 0.3;
    chakraEnergies.solarPlexus += energyStates.Essence * 0.3;
    chakraEnergies.sacral += energyStates.Essence * 0.2;
    chakraEnergies.root += energyStates.Matter * 0.5;
    
    // Apply lunar phase influence
    switch (alignment.lunarPhase) {
      case 'new':
        // New moon boosts crown and brow (Spirit/Substance)
        chakraEnergies.crown += 0.1;
        chakraEnergies.brow += 0.1;
        break;
      case 'full':
        // Full moon boosts heart and sacral (Essence)
        chakraEnergies.heart += 0.1;
        chakraEnergies.sacral += 0.1;
        break;
      case 'waning crescent': 
      case 'third quarter':
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
  private isCelestialData(data: any): data is CelestialData {
    return data && 
      typeof data === 'object' &&
      data.sun && 
      data.moon && 
      data.elementalState &&
      data.season &&
      data.moonPhase;
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
    const day = date.getDate();    // 1-31
    
    // Find matching card based on date
    for (const [cardName, dateRange] of Object.entries(MINOR_ARCANA_DATE_MAPPING)) {
      const { startMonth, startDay, endMonth, endDay } = dateRange;
      
      // Check if the date falls within this card's range
      const afterStart = (month > startMonth) || (month === startMonth && day >= startDay);
      const beforeEnd = (month < endMonth) || (month === endMonth && day <= endDay);
      
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
          'ace': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        const value = valueMap[cardName.split('_')[0]] || 0;
        
        // Get elemental association
        const { element, energyState } = MINOR_ARCANA_ELEMENTAL_AFFINITIES[suit as keyof typeof MINOR_ARCANA_ELEMENTAL_AFFINITIES];
        
        // Determine the zodiac sign based on the date
        const zodiacSign = this.determineZodiacSign(month, day);
        
        // Create and return the minor arcana card
        const displayName = cardName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return {
          name: displayName,
          suit: suit as 'wands' | 'cups' | 'swords' | 'pentacles',
          value,
          description: `Minor Arcana card for ${zodiacSign}, representing the current period`,
          meaning: {
            upright: this.getMeaningForMinorArcana(suit, value, true),
            reversed: this.getMeaningForMinorArcana(suit, value, false)
          },
          elementalAssociation: element as 'Fire' | 'Water' | 'Earth' | 'Air',
          zodiacAssociation: zodiacSign,
          planetaryAssociation: undefined // Minor arcana are more linked to decans than planets
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
      'wands': {
        upright: [
          'Creativity', 'Inspiration', 'New beginnings', // Ace
          'Planning', 'Discovery', 'Future planning',    // Two
          'Progress', 'Expansion', 'Foresight',          // Three
          'Celebration', 'Harmony', 'Completion',        // Four
          'Conflict', 'Competition', 'Disagreement',     // Five
          'Victory', 'Success', 'Public reward',         // Six
          'Challenge', 'Perseverance', 'Maintaining',    // Seven
          'Movement', 'Speed', 'Rapid change',           // Eight
          'Resilience', 'Defense', 'Persistence',        // Nine
          'Burden', 'Responsibility', 'Completion'       // Ten
        ],
        reversed: [
          'Delays', 'Blocked creativity', 'Lack of inspiration',   // Ace
          'Lack of planning', 'Disorganization', 'Obstacles',      // Two
          'Delays', 'Frustration', 'Obstacles to expansion',       // Three
          'Dissatisfaction', 'Boredom', 'Missing celebration',     // Four
          'Avoiding conflict', 'Resolution', 'Harmony',            // Five
          'Private victory', 'Fall from grace', 'Excessive pride', // Six
          'Giving up', 'Overwhelm', 'Exhaustion',                  // Seven
          'Slowing down', 'Obstacles', 'Delays',                   // Eight
          'Weakness', 'Giving up', 'Overwhelm',                    // Nine
          'Release', 'Delegation', 'Collapse'                      // Ten
        ]
      },
      // Similar mappings for cups, swords, and pentacles...
      'cups': {
        upright: [
          'Love', 'New emotions', 'Intuition',        // Ace
          'Connection', 'Attraction', 'Relationship', // Two 
          'Celebration', 'Friendship', 'Community',   // Three
          'Apathy', 'Contemplation', 'Disconnect',    // Four
          'Loss', 'Regret', 'Disappointment',         // Five
          'Nostalgia', 'Memories', 'Reunion',         // Six
          'Choices', 'Fantasy', 'Illusion',           // Seven
          'Disillusionment', 'Walking away', 'Change', // Eight
          'Satisfaction', 'Contentment', 'Gratitude', // Nine
          'Harmony', 'Fulfillment', 'Emotional completion' // Ten
        ],
        reversed: [
          'Blocked emotions', 'Repression', 'Emptiness',      // Ace
          'Disconnection', 'One-sided attraction', 'Imbalance', // Two
          'Overindulgence', 'Isolation', 'Loneliness',        // Three
          'Openness', 'New awareness', 'Receptivity',         // Four
          'Acceptance', 'Forgiveness', 'Moving on',           // Five
          'Stuck in past', 'Missing someone', 'Independence', // Six
          'Clarity', 'Reality check', 'Decision making',      // Seven
          'Returning', 'Acceptance', 'Moving forward',        // Eight
          'Inner happiness', 'Taking for granted', 'Dissatisfaction', // Nine
          'Broken relationships', 'Disconnection', 'Misalignment' // Ten
        ]
      },
      'swords': {
        upright: [
          'Clarity', 'Truth', 'Breakthrough',        // Ace
          'Difficult decisions', 'Balance', 'Stalemate', // Two 
          'Heartbreak', 'Grief', 'Separation',       // Three
          'Rest', 'Recovery', 'Contemplation',       // Four
          'Conflict', 'Disagreement', 'Competition', // Five
          'Transition', 'Change', 'Leaving behind',  // Six
          'Deception', 'Strategy', 'Stealth',        // Seven
          'Restriction', 'Limitation', 'Imprisonment', // Eight
          'Anxiety', 'Worry', 'Fear',                // Nine
          'Endings', 'Loss', 'Painful transition'    // Ten
        ],
        reversed: [
          'Confusion', 'Chaos', 'Cloudiness',            // Ace
          'Indecision', 'Confusion', 'Information overload', // Two
          'Recovery', 'Forgiveness', 'Moving on',        // Three
          'Awakening', 'Renewal', 'Re-engagement',       // Four
          'Reconciliation', 'Making amends', 'Truce',    // Five
          'Staying put', 'Accepting difficulty', 'Resistance', // Six
          'Honesty', 'Open communication', 'Truth revealed', // Seven
          'Freedom', 'Self-acceptance', 'New perspective', // Eight
          'Hope', 'reaching out', 'seeing the positive',  // Nine
          'Recovery', 'Regeneration', 'Inevitable end'    // Ten
        ]
      },
      'pentacles': {
        upright: [
          'Prosperity', 'Abundance', 'New resources',    // Ace
          'Balance', 'Adaptability', 'Time management',  // Two
          'Teamwork', 'Collaboration', 'Skill',          // Three
          'Conservation', 'Security', 'Saving',          // Four
          'Hardship', 'Struggle', 'Insecurity',          // Five
          'Charity', 'Generosity', 'Giving and receiving', // Six
          'Assessment', 'Evaluation', 'Patience',       // Seven
          'Diligence', 'Detail', 'Craftsmanship',       // Eight
          'Luxury', 'Self-sufficiency', 'Financial security', // Nine
          'Legacy', 'Inheritance', 'Culmination'        // Ten
        ],
        reversed: [
          'Lost opportunity', 'Lack of planning', 'Missed chance', // Ace
          'Disorganization', 'Financial chaos', 'Imbalance',     // Two
          'Lack of teamwork', 'Disharmony', 'Working alone',     // Three
          'Greed', 'Hoarding', 'Financial insecurity',           // Four
          'Recovery', 'Support', 'Overcoming hardship',          // Five
          'Selfishness', 'Strings attached', 'Debt',             // Six
          'Impatience', 'Lack of strategy', 'Poor investment',   // Seven
          'Cutting corners', 'Rushed work', 'Perfectionism',     // Eight
          'Material focus', 'Showing off', 'Financial dependence', // Nine
          'Short-term focus', 'Lack of stability', 'Fleeting success' // Ten
        ]
      }
    };
    
    // Adjust for zero-indexing of arrays
    const index = Math.max(0, Math.min(value - 1, 9));
    
    // Return appropriate meanings based on suit, value, and orientation
    const orientation = isUpright ? 'upright' : 'reversed';
    return meanings[suit as keyof typeof meanings]?.[orientation]?.slice(index * 3, (index * 3) + 3) || 
      ['Balance', 'Harmony', 'Connection'];
  }
}

export const celestialCalculator = CelestialCalculator.getInstance(); 