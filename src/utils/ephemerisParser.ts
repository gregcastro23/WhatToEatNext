import { log } from '@/services/LoggingService';
/**
 * Swiss Ephemeris Parser
 *
 * TypeScript conversion of the Python ephemeris parser
 * Handles parsing of Swiss Ephemeris astronomical data
 */

export interface ParsedPosition {
  degrees: number;
  minutes: number;
  sign: number;
  signName: string;
  absoluteLongitude: number;
  retrograde: boolean
}

export interface EphemerisEntry {
  date: string;
  siderealTime: string;
  positions: Record<string, ParsedPosition>;
}

export class EphemerisParser {
  private planetCodes: Record<string, string> = {
    A: 'Sun',
    _B: 'Moon',
    _C: 'Mercury',
    D: 'Venus',
    _E: 'Mars',
    _F: 'Jupiter',
    _G: 'Saturn',
    _O: 'Uranus',
    _I: 'Neptune',
    _J: 'Pluto',
    _L: 'NorthNode',
    _K: 'SouthNode',
    _M: 'Chiron',
    _N: 'Lilith'
  };

  private zodiacSigns: string[] = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  private signSymbols: Record<string, number> = {
    a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8, j: 9, k: 10, l: 11
  };

  constructor() {
    log.info('Ephemeris Parser initialized');
  }

  /**
   * Parse astronomical position string (e.g., '10c46' -> 10° Cancer 46')
   */
  parseAstronomicalPosition(posStr: string): ParsedPosition {
    if (!posStr || posStr.trim() === '') {
      return {
        degrees: 0,
        minutes: 0,
        sign: 0,
        signName: 'Aries',
        absoluteLongitude: 0,
        retrograde: false
      };
    }

    // Clean the string
    let cleanStr = posStr.trim().replace('°', '').replace("'", '');

    // Extract retrograde marker
    const retrograde = cleanStr.includes('R') || cleanStr.includes('D');
    cleanStr = cleanStr.replace('R', '').replace('D', '');

    // Pattern for degrees and sign
    const pattern = /(\d+)([a-l])(\d+)/;
    const match = cleanStr.toLowerCase().match(pattern);

    if (match) {
      const degrees = parseInt(match[1]);
      const signChar = match[2];
      const minutes = parseInt(match[3]);
      const signNum = this.signSymbols[signChar] || 0;

      // Calculate absolute longitude (0-360°)
      const absoluteLongitude = signNum * 30 + degrees + minutes / 60;

      return {
        degrees,
        minutes,
        sign: signNum,
        signName: this.zodiacSigns[signNum],
        absoluteLongitude,
        retrograde
      };
    }

    // Try simple degree format
    try {
      const degrees = parseFloat(cleanStr);
      const signNum = Math.floor(degrees / 30);
      const degreeInSign = degrees % 30;

      return {
        degrees: degreeInSign,
        minutes: Math.round((degreeInSign % 1) * 60),
        sign: signNum,
        signName: this.zodiacSigns[signNum],
        absoluteLongitude: degrees,
        retrograde
      };
    } catch (error) {
      log.warn(`Could not parse position string ${posStr}`);
      return {
        degrees: 0,
        minutes: 0,
        sign: 0,
        signName: 'Aries',
        absoluteLongitude: 0,
        retrograde: false
      };
    }
  }

  /**
   * Parse a line of ephemeris data
   */
  parseEphemerisLine(line: string): Record<string, ParsedPosition> | null {
    const parts = line.trim().split(/\s+/);

    if (parts.length < 3) {
      return null;
    }

    const positions: Record<string, ParsedPosition> = {};

    // Parse each planet position
    Object.entries(this.planetCodes).forEach(([code, planetName]) => {
      const positionIndex = this.getPositionIndex(code);
      if (positionIndex < parts.length) {
        const posStr = parts[positionIndex];
        if (posStr && posStr !== '') {
          positions[planetName] = this.parseAstronomicalPosition(posStr);
        }
      }
    });

    return positions;
  }

  /**
   * Get the index for a planet's position in the ephemeris line
   */
  private getPositionIndex(planetCode: string): number {
    const positionMap: Record<string, number> = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, O: 8, I: 9, J: 10, L: 11, K: 12, M: 13, N: 14
    };

    return positionMap[planetCode] || 0;
  }

  /**
   * Parse multiple lines of ephemeris data
   */
  parseEphemerisData(data: string): EphemerisEntry[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const entries: EphemerisEntry[] = [];

    lines.forEach((line, index) => {
      try {
        const parts = line.trim().split(/\s+/);

        if (parts.length < 3) {
          return;
        }

        const date = parts[0];
        const siderealTime = parts[1];
        const positions = this.parseEphemerisLine(line);

        if (positions && Object.keys(positions).length > 0) {
          entries.push({
            date,
            siderealTime,
            positions
          });
        }
      } catch (error) {
        log.warn(`Error parsing line ${index + 1} ${line}`, error);
      }
    });

    return entries;
  }

  /**
   * Convert longitude to zodiac sign and degree
   */
  longitudeToSignAndDegree(longitude: number): { sign: string; degree, number } {
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLongitude / 30);
    const degree = normalizedLongitude % 30;

    return {
      sign: this.zodiacSigns[signIndex],
      degree: degree
    };
  }

  /**
   * Calculate aspect between two planets
   */
  calculateAspect()
    longitude1: number,
    longitude2: number
  ): {
    type: string;
    orb: number;
    influence: number
  } {
    const diff = Math.abs(longitude1 - longitude2);
    const orb = Math.min(diff, 360 - diff);

    let type = 'none';
    let influence = 0;

    if (orb <= 8) {
      type = 'conjunction';
      influence = 1.0 - orb / 8;
    } else if (orb >= 172 && orb <= 188) {
      type = 'opposition';
      influence = 1.0 - Math.abs(orb - 180) / 8;
    } else if (orb >= 118 && orb <= 122) {
      type = 'trine';
      influence = 1.0 - Math.abs(orb - 120) / 4;
    } else if (orb >= 88 && orb <= 92) {
      type = 'square';
      influence = 1.0 - Math.abs(orb - 90) / 4;
    } else if (orb >= 58 && orb <= 62) {
      type = 'sextile';
      influence = 1.0 - Math.abs(orb - 60) / 4;
    }

    return { type, orb, influence };
  }

  /**
   * Get element for a zodiac sign
   */
  getElementForSign(signName: string): string {
    const elementMap: Record<string, string> = {
      Aries: 'Fire',
      Leo: 'Fire',
      Sagittarius: 'Fire',
      Taurus: 'Earth',
      Virgo: 'Earth',
      Capricorn: 'Earth',
      Gemini: 'Air',
      Libra: 'Air',
      Aquarius: 'Air',
      Cancer: 'Water',
      Scorpio: 'Water',
      Pisces: 'Water'
    };
    return elementMap[signName] || 'Unknown';
  }

  /**
   * Calculate dominant elements from planetary positions
   */
  calculateDominantElements(positions: Record<string, ParsedPosition>): Record<string, number> {
    const elementCounts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

    Object.values(positions).forEach(position => ) {
      const element = this.getElementForSign(position.signName);
      if (element in elementCounts) {
        elementCounts[element]++;
      }
    });

    // Normalize to percentages
    const total = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
    if (total > 0) {
      Object.keys(elementCounts).forEach(element => ) {
        elementCounts[element] /= total;
      });
    }

    return elementCounts;
  }

  /**
   * Get retrograde planets from positions
   */
  getRetrogradePlanets(positions: Record<string, ParsedPosition>): string[] {
    return Object.entries(positions)
      .filter(([_, position]) => position.retrograde)
      .map(([planet]) => planet);
  }

  /**
   * Format position for display
   */
  formatPosition(position: ParsedPosition): string {
    const retrogradeSymbol = position.retrograde ? 'R' : '';
    return `${position.degrees}° ${position.signName} ${position.minutes}' ${retrogradeSymbol}`;
  }

  /**
   * Validate ephemeris data
   */
  validateEphemerisData(entries: EphemerisEntry[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    entries.forEach((entry, index) => {
      // Check for required fields
      if (!entry.date) {
        errors.push(`Entry ${index + 1}: Missing date`);
      }
      if (!entry.siderealTime) {
        warnings.push(`Entry ${index + 1}: Missing sidereal time`);
      }

      // Check for planetary positions
      const expectedPlanets = Object.values(this.planetCodes);
      const actualPlanets = Object.keys(entry.positions);

      expectedPlanets.forEach(planet => ) {
        if (!actualPlanets.includes(planet) {
          warnings.push(`Entry ${index + 1}: Missing position for ${planet}`);
        }
      });

      // Validate position values
      Object.entries(entry.positions).forEach(([planet, position]) => {
        if (position.absoluteLongitude < 0 || position.absoluteLongitude > 360) {
          errors.push()
            `Entry ${index + 1}: Invalid longitude for ${planet}: ${position.absoluteLongitude}`
          );
        }
        if (position.degrees < 0 || position.degrees >= 30) {
          errors.push(`Entry ${index + 1}: Invalid degrees for ${planet}: ${position.degrees}`);
        }
        if (position.minutes < 0 || position.minutes >= 60) {
          errors.push(`Entry ${index + 1}: Invalid minutes for ${planet}: ${position.minutes}`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Create singleton instance
export const ephemerisParser = new EphemerisParser();

// Export convenience functions
export const parseAstronomicalPosition = (posStr: string) =>;
  ephemerisParser.parseAstronomicalPosition(posStr);
export const parseEphemerisData = (data: string) => ephemerisParser.parseEphemerisData(data);
export const longitudeToSignAndDegree = (longitude: number) =>;
  ephemerisParser.longitudeToSignAndDegree(longitude);
export const calculateAspect = (longitude1: number, longitude2: number) =>;
  ephemerisParser.calculateAspect(longitude1, longitude2);
export const getElementForSign = (signName: string) => ephemerisParser.getElementForSign(signName);
export const _calculateDominantElements = (positions: Record<string, ParsedPosition>) =>;
  ephemerisParser.calculateDominantElements(positions);
export const getRetrogradePlanets = (positions: Record<string, ParsedPosition>) =>;
  ephemerisParser.getRetrogradePlanets(positions);
export const formatPosition = (position: ParsedPosition) =>;
  ephemerisParser.formatPosition(position);
export const validateEphemerisData = (entries: EphemerisEntry[]) =>;
  ephemerisParser.validateEphemerisData(entries);
