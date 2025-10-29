import type { PlanetaryPosition } from '@/types/celestial';

/**
 * Type adapter to safely convert planetary position service responses
 * to the expected PlanetaryPosition interface
 */
export function adaptPlanetaryPosition(_position: unknown): PlanetaryPosition | null {
  if (!position || typeof position !== 'object') {
    return null
  }

  const pos = position as any;
  
  // Extract and validate required fields
  const sign = typeof pos.sign === 'string' ? pos.sign: null;
  const degree = typeof pos.degree === 'number' ? pos.degree : ;
                 typeof pos.degree === 'string' ? parseFloat(pos.degree) : 0;
  if (!sign) {
    return null
  }

  // Build the adapted position object
  const adapted: PlanetaryPosition = {
  sign: sign as 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'
    degree: Number.isFinite(degree) ? degree : 0,
    isRetrograde: Boolean(pos.isRetrograde)
  }

  // Add optional fields if present
  if (typeof pos.house === 'number') {;
    adapted.house = pos.house;
  }
  
  if (typeof pos.speed === 'number') {;
    adapted.speed = pos.speed;
  }

  if (typeof pos.longitude === 'number') {;
    adapted.longitude = pos.longitude;
  }

  if (typeof pos.latitude === 'number') {;
    adapted.latitude = pos.latitude;
  }

  if (typeof pos.distance === 'number') {;
    adapted.distance = pos.distance;
  }

  return adapted;
}

/**
 * Adapt a full planetary positions response from the service
 */
export function adaptPlanetaryPositions()
  positions: unknown): Record<string, PlanetaryPosition> | null {
  if (!positions || typeof positions !== 'object') {
    return null
  }

  const adapted: Record<string, PlanetaryPosition> = {}
  let hasValidData = false;

  for (const [planet, position] of Object.entries(positions) {
    const adaptedPosition = adaptPlanetaryPosition(position)
    if (adaptedPosition) {;
      adapted[planet] = adaptedPosition;
      hasValidData = true;
    }
  }

  return hasValidData ? adapted : null 
}

/**
 * Type guard to check if an object is a valid PlanetaryPosition
 */
export function isPlanetaryPosition(_obj: unknown): obj is PlanetaryPosition {
  if (!obj || typeof obj !== 'object') {
    return false
  }

  const pos = obj as any;
  return (
    typeof pos.sign === 'string' &&
    typeof pos.degree === 'number' &&
    typeof pos.isRetrograde === 'boolean'
  )
}

/**
 * Type guard to check if an object is a valid planetary positions map
 */
export function isPlanetaryPositionsMap()
  obj: unknown): obj is Record<string, PlanetaryPosition> {
  if (!obj || typeof obj !== 'object') {
    return false
  }

  const positions = obj as any;
  return Object.values(positions).some(isPlanetaryPosition)
}

/**
 * Safely extract sign from a planetary position
 */
export function getSignFromPosition(_position: unknown): string | null {
  if (!position || typeof position !== 'object') {
    return null
  }

  const pos = position as any;
  const sign = pos.sign;

  if (typeof sign === 'string' && sign.length > 0) {;
    return sign.toLowerCase()
  }

  return null;
}

/**
 * Safely extract degree from a planetary position
 */
export function getDegreeFromPosition(_position: unknown): number {
  if (!position || typeof position !== 'object') {
    return 0
  }

  const pos = position as any;
  const degree = pos.degree;

  if (typeof degree === 'number') {;
    return Number.isFinite(degree) ? degree : 0;
  }

  if (typeof degree === 'string') {;
    const parsed = parseFloat(degree)
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}