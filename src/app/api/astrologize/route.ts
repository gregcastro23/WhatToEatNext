import * as Astronomy from 'astronomy-engine';
import { NextResponse } from 'next/server';
import { _logger } from '@/lib/logger';
import { onAstrologizeApiCall } from '@/services/CurrentMomentManager';
import { log } from '@/services/LoggingService';
import type { ZodiacSign } from '@/types/celestial';
import type { PlanetPosition } from '@/utils/astrologyUtils';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AstrologizeAPI');

// Interface for the API request
interface AstrologizeRequest {
  year?: number;
  month?: number; // 1-indexed (January = 1, February = 2, etc.)
  date?: number;
  hour?: number;
  minute?: number;
  latitude?: number;
  longitude?: number;
  zodiacSystem?: 'tropical' | 'sidereal';
}

// Default location (New York City)
const DEFAULT_LOCATION = {
  latitude: 40.7498,
  longitude: -73.7976
};

/**
 * Convert ecliptic longitude to zodiac sign and degree
 */
function longitudeToZodiacPosition(longitude: number): { sign: ZodiacSign; degree: number; minute: number } {
  // Normalize to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  // Each sign is 30 degrees
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degreeInSign = normalizedLongitude % 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);

  const signs: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  return {
    sign: signs[signIndex],
    degree,
    minute
  };
}

/**
 * Calculate planetary positions using astronomy-engine
 */
function calculateLocalPlanetaryPositions(date: Date): Record<string, PlanetPosition> {
  const positions: Record<string, PlanetPosition> = {};

  try {
    // Calculate positions for each planet
    const planets = [
      { name: 'Sun', body: Astronomy.Body.Sun },
      { name: 'Moon', body: Astronomy.Body.Moon },
      { name: 'Mercury', body: Astronomy.Body.Mercury },
      { name: 'Venus', body: Astronomy.Body.Venus },
      { name: 'Mars', body: Astronomy.Body.Mars },
      { name: 'Jupiter', body: Astronomy.Body.Jupiter },
      { name: 'Saturn', body: Astronomy.Body.Saturn },
      { name: 'Uranus', body: Astronomy.Body.Uranus },
      { name: 'Neptune', body: Astronomy.Body.Neptune },
      { name: 'Pluto', body: Astronomy.Body.Pluto }
    ];

    for (const planet of planets) {
      try {
        // Get ecliptic coordinates
        const ecliptic = Astronomy.Ecliptic(planet.body, date);
        const longitude = ecliptic.elon;

        // Convert to zodiac position
        const zodiacPos = longitudeToZodiacPosition(longitude);

        // Check if retrograde (compare velocity)
        let isRetrograde = false;
        try {
          if (planet.body !== Astronomy.Body.Sun && planet.body !== Astronomy.Body.Moon) {
            const futureDate = new Date(date.getTime() + 24 * 60 * 60 * 1000); // 1 day ahead
            const futureEcliptic = Astronomy.Ecliptic(planet.body, futureDate);
            // If future longitude is less than current (accounting for wrap-around), it's retrograde
            const delta = ((futureEcliptic.elon - longitude + 540) % 360) - 180;
            isRetrograde = delta < 0;
          }
        } catch (retroError) {
          // If retrograde calculation fails, assume direct motion
          isRetrograde = false;
        }

        positions[planet.name] = {
          sign: zodiacPos.sign,
          degree: zodiacPos.degree,
          minute: zodiacPos.minute,
          exactLongitude: longitude,
          isRetrograde
        };
      } catch (planetError) {
        logger.warn(`Failed to calculate position for ${planet.name}:`, planetError);
      }
    }

    logger.info(`Calculated ${Object.keys(positions).length} planetary positions using astronomy-engine`);

  } catch (error) {
    logger.error('Error calculating planetary positions:', error);
    throw error;
  }

  return positions;
}

/**
 * Handle POST requests - calculate astrological positions for a specific date/time/location
 */
export async function POST(request: Request) {
  try {
    // Get the request body
    const body: AstrologizeRequest = await request.json();

    // Extract parameters from request or use defaults
    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1, // 1-indexed
      date = new Date().getDate(),
      hour = new Date().getHours(),
      minute = new Date().getMinutes(),
      latitude = DEFAULT_LOCATION.latitude,
      longitude = DEFAULT_LOCATION.longitude,
      zodiacSystem = 'tropical' // Default to tropical zodiac
    } = body;

    // Create date object (month is 1-indexed in request, 0-indexed in Date constructor)
    const targetDate = new Date(year, month - 1, date, hour, minute);

    logger.info(`Calculating positions for ${targetDate.toISOString()}`);

    // Calculate planetary positions using local astronomy-engine
    const planetaryPositions = calculateLocalPlanetaryPositions(targetDate);

    // Validate planetary positions
    if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
      throw new Error('Failed to calculate planetary positions');
    }

    logger.info(`Retrieved ${Object.keys(planetaryPositions).length} planetary positions`);

    // Update current moment data
    try {
      await onAstrologizeApiCall(planetaryPositions);
      logger.info('Updated current moment data from local calculations');
    } catch (updateError) {
      logger.warn('Failed to update current moment data:', updateError);
      // Don't fail the entire request if update fails
    }

    // Return in format compatible with previous API structure
    const celestialBodies: any = {};

    for (const [planetName, position] of Object.entries(planetaryPositions)) {
      const planetKey = planetName.toLowerCase();
      celestialBodies[planetKey] = {
        key: planetKey,
        label: planetName,
        Sign: {
          key: position.sign,
          zodiac: position.sign,
          label: position.sign.charAt(0).toUpperCase() + position.sign.slice(1)
        },
        ChartPosition: {
          Ecliptic: {
            DecimalDegrees: position.exactLongitude,
            ArcDegrees: {
              degrees: position.degree,
              minutes: position.minute,
              seconds: 0
            }
          }
        },
        isRetrograde: position.isRetrograde
      };
    }

    const response = {
      _celestialBodies: {
        ...celestialBodies,
        all: Object.values(celestialBodies)
      },
      birth_info: {
        year,
        month,
        date,
        hour,
        minute,
        latitude,
        longitude,
        ayanamsa: zodiacSystem.toUpperCase() === 'TROPICAL' ? 'TROPICAL' : 'LAHIRI'
      },
      metadata: {
        source: 'local-astronomy-engine',
        timestamp: new Date().toISOString(),
        calculatedAt: targetDate.toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    _logger.error('Error in astrologize API:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate astrological data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests - calculate astrological positions for current time
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Extract query parameters
  const latitude = parseFloat(searchParams.get('latitude') || String(DEFAULT_LOCATION.latitude));
  const longitude = parseFloat(searchParams.get('longitude') || String(DEFAULT_LOCATION.longitude));
  const zodiacSystem = (searchParams.get('zodiacSystem') || 'tropical') as 'tropical' | 'sidereal';

  // Use current date/time
  const now = new Date();

  const payload: AstrologizeRequest = {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // Convert to 1-indexed
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    latitude,
    longitude,
    zodiacSystem
  };

  // Forward to POST handler
  return POST(
    new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  );
}
