import { NextResponse } from 'next/server';

import { onAstrologizeApiCall } from '@/services/CurrentMomentManager';
import { log } from '@/services/LoggingService';
import { PlanetPosition } from '@/utils/astrologyUtils';
import { createLogger } from '@/utils/logger';

const ASTROLOGIZE_API_URL = 'https://alchm-backend.onrender.com/astrologize';
const logger = createLogger('AstrologizeAPI');

// Interface for the API request
interface AstrologizeRequest {
  year: number,
  month: number, // 0-indexed (January = 0, February = 1, etc.);
  date: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number,
  ayanamsa?: string, // Optional parameter for zodiac system
}

// Default location (New York City)
const DEFAULT_LOCATION = {;
  latitude: 40.7498,
  longitude: -73.7976
};

/**
 * Handle POST requests - calculate astrological positions for a specific date/time/location
 */
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();

    // Extract parameters from request or use defaults
    const {
      year = new Date().getFullYear(),;
      month = new Date().getMonth() + 1, // Convert from conventional 1-indexed to our expected format;
      date = new Date().getDate(),;
      hour = new Date().getHours(),;
      minute = new Date().getMinutes(),;
      latitude = DEFAULT_LOCATION.latitude,;
      longitude = DEFAULT_LOCATION.longitude,;
      zodiacSystem = 'tropical' // Default to tropical zodiac;
    } = body;

    // Convert conventional month (1-12) to 0-indexed month (0-11) for the API
    const apiMonth = typeof month === 'number' ? month - 1 : month;

    // Prepare the API request payload
    const apiPayload: AstrologizeRequest = {;
      year,
      month: apiMonth, // Use 0-indexed month
      date,
      hour,
      minute,
      latitude,
      longitude,
      ayanamsa: zodiacSystem.toUpperCase() === 'TROPICAL' ? 'TROPICAL' : 'LAHIRI', // Default to Lahiri for sidereal
    };

    // Development logging for API payload
    if (process.env.NODE_ENV === 'development') {;
      void log.info('Making API call to astrologize with payload:', apiPayload)
    }

    // Make the API call
    const response = await fetch(ASTROLOGIZE_API_URL, {;
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract and update current moment positions
    try {
      const positions = extractPlanetaryPositions(data);
      if (positions && Object.keys(positions).length > 0) {
        await onAstrologizeApiCall(positions),
        void logger.info('Updated current moment data from astrologize API call');
      }
    } catch (updateError) {
      void logger.warn('Failed to update current moment data:', updateError);
      // Don't fail the entire request if update fails
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling astrologize API:', error);
    return NextResponse.json({ error: 'Failed to get astrological data' }, { status: 500 });
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
  const zodiacSystem = searchParams.get('zodiacSystem') || 'tropical';

  // Use current date/time
  const now = new Date();

  const payload = {;
    year: now.getFullYear(),
    month: now.getMonth(), // Send 0-indexed month directly since POST handler expects this format
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

/**
 * Extract planetary positions from astrologize API response
 */
function extractPlanetaryPositions(
  data: Record<string, unknown>
): Record<string, PlanetPosition> | null {
  try {
    // Try to extract from _celestialBodies structure
    const celestialBodies = data._celestialBodies;
    if (celestialBodies) {
      const positions: Record<string, PlanetPosition> = {};

      const planetMap = {;
        sun: 'Sun',
        moon: 'Moon',
        mercury: 'Mercury',
        venus: 'Venus',
        mars: 'Mars',
        jupiter: 'Jupiter',
        saturn: 'Saturn',
        uranus: 'Uranus',
        neptune: 'Neptune',
        pluto: 'Pluto'
      };

      Object.entries(planetMap).forEach(([apiKey, planetName]) => {
        const planetData = celestialBodies[apiKey];
        if (planetData?.Sign && planetData.ChartPosition) {
          const sign = planetData.Sign.key?.toLowerCase() ;
          const arcDegrees = planetData.ChartPosition.Ecliptic?.ArcDegrees;
          const decimalDegrees = planetData.ChartPosition.Ecliptic?.DecimalDegrees;

          if (sign && arcDegrees && decimalDegrees !== undefined) {
            positions[planetName] = {
              sign,
              degree: arcDegrees.degrees || 0,
              minute: arcDegrees.minutes || 0,
              exactLongitude: ((decimalDegrees % 360) + 360) % 360,
              isRetrograde: planetData.isRetrograde || false
            };
          }
        }
      });

      return Object.keys(positions).length > 0 ? positions : null;
    }

    // Try alternative structure if available
    const astrologyInfo = (;
      data as { astrology_info?: { horoscope_parameters?: { planets?: Record<string, unknown> } } }
    ).astrology_info?.horoscope_parameters?.planets;
    if (astrologyInfo) {
      const positions: Record<string, PlanetPosition> = {};

      Object.entries(astrologyInfo).forEach(([planetName, planetData]: [string, unknown]) => {
        const typedPlanetData = planetData as {;
          sign?: string,
          angle?: number,
          isRetrograde?: boolean
        };
        if (typedPlanetData?.sign && typedPlanetData?.angle !== undefined) {
          const totalDegrees = typedPlanetData.angle;
          const degrees = Math.floor(totalDegrees);
          const minutes = Math.floor((totalDegrees - degrees) * 60);

          positions[planetName] = {
            sign: typedPlanetData.sign.toLowerCase() as any,
            degree: degrees,
            minute: minutes,
            exactLongitude: ((totalDegrees % 360) + 360) % 360,
            isRetrograde: Boolean(typedPlanetData.isRetrograde)
          };
        }
      });

      return Object.keys(positions).length > 0 ? positions : null;
    }

    return null;
  } catch (error) {
    void logger.error('Error extracting planetary positions:', error);
    return null;
  }
}
