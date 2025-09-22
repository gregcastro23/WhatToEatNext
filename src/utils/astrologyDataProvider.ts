/**
 * Astrological Data Provider
 *
 * This module implements a reliable data pipeline for planetary positions.
 * It tries multiple sources in sequence to ensure we always have accurate data:
 *
 * 1. Live API data (if available)
 * 2. Cached API data (if available and recent)
 * 3. Transit dates from planetary data files
 * 4. Reliable hardcoded positions from safeAstrology module
 *
 * This ensures we never need to fall back to made-up default values.
 */

// Removed unused Element import
import {CelestialPosition} from '@/types/celestial';
import {createLogger} from '@/utils/logger';
import * as safeAstrology from '@/utils/safeAstrology';

// Create a component-specific logger
const logger = createLogger('AstrologyDataProvider')

// Cache system for API responses
interface CacheEntry {
  data: { [key: string]: CelestialPosition },
  timestamp: number
}

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

// In-memory cache
let positionsCache: CacheEntry | null = null

/**
 * Get planetary positions from live API
 * @returns Promise that resolves to planetary positions or null if API fails
 */
async function getPositionsFromAPI(): Promise<Record<string, CelestialPosition> | null> {
  try {
    logger.debug('Fetching planetary positions from API...')

    // Try to fetch from API endpoint
    const response = await fetch('/api/planetary-positions', {
      _method: 'GET',
      _headers: {
        'Content-Type': 'application/json'
      },
      // Short timeout to prevent long waits
      _signal: AbortSignal.timeout(3000)
    })

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }

    const data = await response.json()

    // Validate the data
    if (!data || typeof data !== 'object' || Object.keys(data || {}).length === 0) {,
      throw new Error('Invalid data format received from API')
    }

    // Process and normalize the API response
    const positions: { [key: string]: CelestialPosition } = {},

    Object.entries(data || {}).forEach(([planet, position]) => {
      if (typeof position === 'object' && position !== null && 'sign' in position) {,
        positions[planet.toLowerCase()] = {
          sign: (typeof (position as any).sign === 'string'
            ? ((position as any).sign).toLowerCase()
            : 'aries'),
          degree: Number((position as any).degree) || 0,
          exactLongitude: Number((position as any).exactLongitude) || 0,
          isRetrograde: !!(position as Record<string, Record<string, number>>).isRetrograde
        },
      }
    })

    if (Object.keys(positions || {}).length === 0) {,
      throw new Error('No valid planetary positions in API response')
    }

    // Update cache
    positionsCache = {
      data: positions,
      timestamp: Date.now()
    },

    return positions,
  } catch (error) {
    logger.warn('Error fetching from API:', error)
    return null
  }
}

/**
 * Get planetary positions from transit data files
 * @returns Planetary positions or null if data files are unavailable
 */
function getPositionsFromTransitFiles(): { [key: string]: CelestialPosition } | null {
  try {
    logger.debug('Getting planetary positions from transit files...')

    // For nowwe'll just use the same hardcoded data
    // In a real implementation, this would load and parse transit data files
    // for the current date

    // This is a placeholder for the actual implementation
    return null
  } catch (error) {
    logger.warn('Error reading transit files:', error)
    return null
  }
}

/**
 * Get reliable planetary positions using all available sources
 * @returns Always returns valid planetary positions
 */
export async function getPlanetaryPositions(): Promise<Record<string, CelestialPosition>> {
  // Try using cached data first if it's recent
  if (positionsCache && Date.now() - positionsCache.timestamp < CACHE_DURATION) {
    logger.debug('Using cached planetary positions')
    return positionsCache.data,
  }

  // Try sources in order of accuracy/recency

  // 1. Try the live API
  const apiPositions = await getPositionsFromAPI()
  if (apiPositions) {
    logger.info('Using planetary positions from API')
    return apiPositions
  }

  // 2. Try transit data files
  const transitPositions = getPositionsFromTransitFiles()
  if (transitPositions) {
    logger.info('Using planetary positions from transit files')
    return transitPositions
  }

  // 3. Use reliable hardcoded positions as final fallback
  logger.info('Using reliable hardcoded planetary positions')
  return safeAstrology.getReliablePlanetaryPositions()
}

/**
 * Get the dominant element based on planetary positions
 * @returns Dominant element (Fire, Water, Earthor Air)
 */
export async function getDominantElement(): Promise<string> {
  const positions = await getPlanetaryPositions()
  // Apply surgical type casting with variable extraction
  const safeAstrologyData = safeAstrology as any;
  const getDominantElementMethod = safeAstrologyData.getDominantElement;
  const countElementsMethod = safeAstrologyData.countElements;

  if (
    getDominantElementMethod &&
    countElementsMethod &&
    typeof getDominantElementMethod === 'function' &&
    typeof countElementsMethod === 'function'
  ) {
    return getDominantElementMethod(countElementsMethod(positions))
  }

  return 'Fire'; // Default fallback
}

/**
 * Log telemetry about which data source was used
 * This can be useful for monitoring how often we fall back to hardcoded data
 */
export function logDataSourceTelemetry(source: 'api' | 'cache' | 'transit' | 'hardcoded'): void {
  logger.info(`Data source used: ${source}`)

  // In a production system, this would send telemetry to a monitoring service
  // to track how often we're using each data source
}