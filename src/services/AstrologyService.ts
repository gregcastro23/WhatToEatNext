import * as safeAstrology from '../utils/safeAstrology';
import { createLogger } from '../utils/logger';
import { formatDateForCalculation, getCurrentAstrologicalState } from '../utils/safeAstrology';
import { AspectData, AstrologyPositionData, Planet, PlanetaryHour, ZodiacSign } from '../types/astrology';

const logger = createLogger('AstrologyService');

// Define constants used in the service
const ZODIAC_SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 
  'leo', 'virgo', 'libra', 'scorpio', 
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const PLANETARY_HOURS: PlanetaryHour[] = [
  'sun', 'venus', 'mercury', 'moon',
  'saturn', 'jupiter', 'mars'
];

// Define supported planets constant to fix the SUPPORTED_PLANETS error
const SUPPORTED_PLANETS: Planet[] = [
  'sun', 'Moon', 'mercury', 'venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
];

/**
 * Service for astrological calculations and planetary positions
 * This is a singleton class that wraps safeAstrology methods to ensure
 * reliable position data even when external services fail
 */
export class AstrologyService {
  private static instance: AstrologyService;
  
  private constructor() {
    logger.info('AstrologyService initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AstrologyService {
    if (!AstrologyService.instance) {
      AstrologyService.instance = new AstrologyService();
    }
    return AstrologyService.instance;
  }
  
  /**
   * Get reliable planetary positions
   * Uses hardcoded data that won't fail
   */
  public getHardcodedPlanetaryPositions(): Record<string, unknown> {
    return safeAstrology.getReliablePlanetaryPositions();
  }
  
  /**
   * Normalize positions for calculations
   */
  public normalizePositions(positions: Record<string, unknown>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};
    
    // Convert position data to normalized form for calculations
    for (const [planet, data] of Object.entries(positions)) {
      if (data && typeof data === 'object' && 'sign' in data) {
        normalized[planet] = {
          ...data,
          // Add normalized properties for calculations
          signIndex: this.getSignIndex(data.sign),
          absoluteDegree: this.getSignIndex(data.sign) * 30 + (data.degree || 0)
        };
      }
    }
    
    return normalized;
  }
  
  /**
   * Calculate lunar phase from positions
   */
  public calculateLunarPhase(positions: Record<string, unknown>): string {
    // Use safeAstrology if available
    try {
      const phase = safeAstrology.calculateLunarPhase();
      const phaseName = safeAstrology.getLunarPhaseName(phase);
      return this.formatLunarPhaseForContext(phaseName);
    } catch (error) {
      logger.error('Error calculating lunar phase:', error);
      // Fall back to default
      return 'full_moon';
    }
  }
  
  /**
   * Calculate elemental state from positions
   */
  public calculateElementalState(positions: Record<string, unknown>): Record<string, number> {
    const elements = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
    
    try {
      // Get sign elements and calculate influence
      let totalInfluence = 0;
      
      // Planet weights - sun and Moon have more influence
      const weights: Record<string, number> = {
        'sun': 3,
        'moon': 2,
        'mercury': 1,
        'venus': 1,
        'mars': 1,
        'jupiter': 1,
        'saturn': 1,
        'uranus': 0.5,
        'neptune': 0.5,
        'pluto': 0.5
      };
      
      // Element mapping for signs
      const signElements: Record<string, string> = {
        'aries': 'Fire',
        'leo': 'Fire',
        'sagittarius': 'Fire',
        'taurus': 'Earth',
        'virgo': 'Earth', 
        'capricorn': 'Earth',
        'gemini': 'Air',
        'libra': 'Air',
        'aquarius': 'Air',
        'cancer': 'Water',
        'scorpio': 'Water',
        'pisces': 'Water'
      };
      
      // Calculate elemental influences
      for (const [planet, data] of Object.entries(positions)) {
        if (data && typeof data === 'object' && 'sign' in data) {
          const sign = data.sign.toLowerCase();
          const element = signElements[sign];
          const weight = weights[planet.toLowerCase()] || 0.5;
          
          if (element) {
            elements[element] += weight;
            totalInfluence += weight;
          }
        }
      }
      
      // Normalize values
      if (totalInfluence > 0) {
        for (const element in elements) {
          elements[element as keyof typeof elements] /= totalInfluence;
        }
      }
      
      return elements;
    } catch (error) {
      logger.error('Error calculating elemental state:', error);
      // Return balanced elements as fallback
      return elements;
    }
  }
  
  /**
   * Helper method to get sign index (0-11)
   */
  private getSignIndex(sign: string): number {
    const signs = [
      'aries', 'taurus', 'gemini', 'cancer', 
      'leo', 'virgo', 'libra', 'scorpio', 
      'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    const index = signs.indexOf(sign.toLowerCase());
    return index >= 0 ? index : 0; // Fallback to 0 (Aries) if not found
  }
  
  /**
   * Get sign index from degree
   */
  private getSignIndex(degree: number): number {
    return Math.floor(degree / 30);
  }
  
  /**
   * Format lunar phase name to match expected format in context
   */
  private formatLunarPhaseForContext(phaseName: string): string {
    // Convert phrase like "new moon" to "new_moon"
    return phaseName.replace(/\s+/g, '_').toLowerCase();
  }

  private formatLunarPhaseName(phase: string): string {
    return phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getLunarIllumination(date: Date = new Date()): number {
    try {
      return this.safeAstrology.getLunarIllumination(date);
    } catch (error) {
      logger.error('Error calculating lunar illumination:', error);
      // Return a middle value as default
      return 0.5;
    }
  }

  async calculatePlanetaryPositions(
    latitude: number, 
    longitude: number, 
    date: Date
  ): Promise<AstrologyPositionData>;
  async calculatePlanetaryPositions(params: {
    latitude: number;
    longitude: number;
    date?: Date;
  }): Promise<AstrologyPositionData>;
  async calculatePlanetaryPositions(
    latitudeOrParams: number | { latitude: number; longitude: number; date?: Date; },
    longitude?: number,
    date: Date = new Date()
  ): Promise<AstrologyPositionData> {
    let lat: number;
    let lng: number;
    let targetDate: Date;

    // Handle both parameter styles
    if (typeof latitudeOrParams === 'object') {
      lat = latitudeOrParams.latitude;
      lng = latitudeOrParams.longitude;
      targetDate = latitudeOrParams.date || new Date();
    } else {
      lat = latitudeOrParams;
      lng = longitude as number;
      targetDate = date;
    }

    try {
      logger.info(`Calculating planetary positions for lat: ${lat}, long: ${lng}, date: ${targetDate}`);
      
      // Use the astrology library to calculate positions
      const positions = this.safeAstrology.getPositions(targetDate, {
        latitude: lat, 
        longitude: lng
      });
      
      // Normalize the positions to our expected format
      return this.normalizePlanetaryPositions(positions);
    } catch (error) {
      logger.error('Error calculating planetary positions:', error);
      // Return fallback data when calculation fails
      return this.getHardcodedPlanetaryPositions();
    }
  }

  async calculatePlanetaryAspects({
    latitude,
    longitude,
    date = new Date()
  }: {
    latitude: number;
    longitude: number;
    date?: Date;
  }): Promise<AspectData[]> {
    try {
      const formattedDate = formatDateForCalculation(date);
      return await this.safeAstrology.getPlanetaryAspects(latitude, longitude, formattedDate);
    } catch (error) {
      logger.error('Error calculating planetary aspects:', error);
      return [];
    }
  }

  getCurrentSign(positions: AstrologyPositionData): ZodiacSign {
    try {
      const sunPosition = positions.sun;
      if (!sunPosition) throw new Error('sun position not found');
      
      const signIndex = this.getSignIndex(sunPosition.position);
      return ZODIAC_SIGNS[signIndex];
    } catch (error) {
      logger.error('Error determining current sign:', error);
      // Default to Taurus if we can't determine
      return 'taurus';
    }
  }

  getPlanetaryHour(date: Date = new Date()): PlanetaryHour {
    try {
      const hour = date.getHours();
      const day = date.getDay();
      
      // Simple planetary hour calculation
      const planetIndex = (day * 24 + hour) % 7;
      return PLANETARY_HOURS[planetIndex];
    } catch (error) {
      logger.error('Error calculating planetary hour:', error);
      // Default to venus
      return 'venus';
    }
  }

  private normalizePlanetaryPositions(positions: unknown): AstrologyPositionData {
    try {
      const normalized: AstrologyPositionData = {};
      
      Object.entries(positions).forEach(([planet, data]: [string, any]) => {
        if (SUPPORTED_PLANETS.includes(planet as Planet)) {
          normalized[planet as Planet] = {
            position: data.position,
            sign: ZODIAC_SIGNS[this.getSignIndex(data.position)],
            isRetrograde: data.isRetrograde || false,
            house: data.house || 1
          };
        }
      });
      
      return normalized;
    } catch (error) {
      logger.error('Error normalizing planetary positions:', error);
      return this.getHardcodedPlanetaryPositions();
    }
  }

  private getReliablePlanetaryPositions(): AstrologyPositionData {
    // Fallback planetary positions when calculations fail
    const fallbackData: AstrologyPositionData = {};
    
    try {
      // Use SUPPORTED_PLANETS if available, or define a fallback list
      const planets = SUPPORTED_PLANETS || [
        'sun', 'Moon', 'mercury', 'venus', 'Mars', 
        'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
      ];
      
      planets.forEach((planet, index) => {
        // Spread planets across the zodiac as a fallback
        const position = (index * 30) % 360;
        fallbackData[planet] = {
          position,
          sign: ZODIAC_SIGNS[this.getSignIndex(position)],
          isRetrograde: false,
          house: 1
        };
      });
    } catch (error) {
      logger.error('Error creating fallback planetary positions:', error);
      
      // Ultimate fallback with hardcoded planets
      const basicPlanets = [
        'sun', 'Moon', 'mercury', 'venus', 'Mars', 
        'Jupiter', 'Saturn'
      ];
      
      basicPlanets.forEach((planet, index) => {
        const position = (index * 30) % 360;
        fallbackData[planet as Planet] = {
          position,
          sign: ZODIAC_SIGNS[Math.floor(position / 30) % 12],
          isRetrograde: false,
          house: 1
        };
      });
    }
    
    return fallbackData;
  }

  /**
   * Get the current lunar phase and illumination
   * @param date Date to calculate lunar phase for (default: current date)
   * @returns Object containing phase name and illumination percentage
   */
  getLunarPhase(date: Date = new Date()): { phase: string; illumination: number } {
    try {
      // Try using safeAstrology to get moon data
      const moonData = safeAstrology.getMoonIllumination(true);
      const phase = moonData.phase || 'new_moon';
      
      // Format phase name for consistency (convert spaces to underscores)
      const formattedPhase = this.formatLunarPhaseForContext(phase);
      
      return {
        phase: formattedPhase,
        illumination: moonData.illumination
      };
    } catch (error) {
      logger.error('Error calculating lunar phase:', error);
      // Fall back to default values
      return {
        phase: 'new_moon',
        illumination: 0.01
      };
    }
  }
} 