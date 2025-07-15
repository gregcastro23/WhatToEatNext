import { NextResponse } from 'next/server';
import { alchemize } from '@/services/RealAlchemizeService';
import { onAlchemizeApiCall, updateCurrentMoment } from '@/services/CurrentMomentManager';
import { getCurrentPlanetaryPositions, getPlanetaryPositionsForDateTime } from '@/services/astrologizeApi';
import { PlanetPosition } from '@/utils/astrologyUtils';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AlchemizeAPI');

// Interface for the API request
interface AlchemizeRequest {
  year?: number;
  month?: number; // 1-indexed (January = 1, February = 2, etc.)
  date?: number;
  hour?: number;
  minute?: number;
  latitude?: number;
  longitude?: number;
  zodiacSystem?: 'tropical' | 'sidereal';
  planetaryPositions?: Record<string, PlanetPosition>; // Optional: use provided positions instead of fetching
}

// Default location (New York City)
const DEFAULT_LOCATION = {
  latitude: 40.7498,
  longitude: -73.7976
};

/**
 * Handle POST requests - calculate alchemical properties for a specific date/time/location
 */
export async function POST(request: Request) {
  try {
    logger.info('Alchemize API called');
    
    // Get the request body
    const body: AlchemizeRequest = await request.json();
    
    // Extract parameters from request or use defaults
    const {
      year,
      month,
      date,
      hour,
      minute,
      latitude = DEFAULT_LOCATION.latitude,
      longitude = DEFAULT_LOCATION.longitude,
      zodiacSystem = 'tropical',
      planetaryPositions: providedPositions
    } = body;

    let planetaryPositions: Record<string, PlanetPosition>;
    let useCustomDate = false;

    // Determine if we should use custom date/time or current moment
    if (year && month && date && hour !== undefined && minute !== undefined) {
      useCustomDate = true;
      const customDate = new Date(year, month - 1, date, hour, minute); // month - 1 because Date constructor expects 0-indexed month
      logger.info(`Using custom date/time: ${customDate.toISOString()}`);
    }

    // Step 1: Get or use planetary positions
    if (providedPositions) {
      logger.info('Using provided planetary positions');
      planetaryPositions = providedPositions;
    } else {
      logger.info('Fetching planetary positions from astrologize API');
      
      if (useCustomDate) {
        const customDate = new Date(year!, month! - 1, date!, hour!, minute!);
        planetaryPositions = await getPlanetaryPositionsForDateTime(
          customDate,
          { latitude, longitude },
          zodiacSystem
        );
      } else {
        planetaryPositions = await getCurrentPlanetaryPositions(
          { latitude, longitude },
          zodiacSystem
        );
      }
    }

    // Validate planetary positions
    if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
      throw new Error('Failed to get planetary positions');
    }

    logger.info(`Retrieved ${Object.keys(planetaryPositions).length} planetary positions`);

    // Step 2: Update current moment data across all storage locations
    if (useCustomDate) {
      const customDate = new Date(year!, month! - 1, date!, hour!, minute!);
      await updateCurrentMoment(customDate, { latitude, longitude });
    } else {
      // Trigger update with current moment
      await onAlchemizeApiCall(planetaryPositions);
    }

    logger.info('Updated current moment data across all storage locations');

    // Step 3: Calculate alchemical properties
    const alchemicalResult = alchemize(planetaryPositions);
    
    logger.info('Alchemical calculation completed');

    // Step 4: Return comprehensive result
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      request: {
        useCustomDate,
        customDateTime: useCustomDate ? new Date(year!, month! - 1, date!, hour!, minute!).toISOString() : null,
        location: { latitude, longitude },
        zodiacSystem
      },
      planetaryPositions,
      alchemicalResult,
      metadata: {
        positionsSource: providedPositions ? 'provided' : 'api',
        currentMomentUpdated: true,
        apiCallId: `alchemize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Error in alchemize API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to calculate alchemical properties',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests - calculate alchemical properties for current time
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const latitude = parseFloat(searchParams.get('latitude') || String(DEFAULT_LOCATION.latitude));
  const longitude = parseFloat(searchParams.get('longitude') || String(DEFAULT_LOCATION.longitude));
  const zodiacSystem = (searchParams.get('zodiacSystem') || 'tropical') as 'tropical' | 'sidereal';
  
  // Forward to POST handler with current moment
  const payload: AlchemizeRequest = {
    latitude,
    longitude,
    zodiacSystem
  };

  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
} 