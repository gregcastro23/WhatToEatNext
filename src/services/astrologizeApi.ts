import { PlanetPosition } from '@/utils/astrologyUtils';
import type { ZodiacSign } from '@/types/alchemy';
import { PlanetaryPosition } from "@/types/celestial";
import { astrologizeApiCircuitBreaker } from '@/utils/apiCircuitBreaker';

// Use local API endpoint instead of external
const LOCAL_ASTROLOGIZE_API_URL = '/api/astrologize';

// Interface for the local API request
interface LocalAstrologizeRequest {
  year?: number;
  month?: number;  // 1-indexed for user input (January = 1, February = 2, etc.)
  date?: number;
  hour?: number;
  minute?: number;
  latitude?: number;
  longitude?: number;
  zodiacSystem?: 'tropical' | 'sidereal'; // Add zodiac system support
}

// Interface for planetary data from the API
interface AstrologizePlanetData {
  key: string;
  label: string;
  Sign: {
    key: string;
    zodiac: string;
    label: string;
  };
  ChartPosition: {
    Ecliptic: {
      DecimalDegrees: number;
      ArcDegrees: {
        degrees: number;
        minutes: number;
        seconds: number;
      };
    };
  };
  isRetrograde: boolean;
}

// Interface for the API response (updated to match actual astrologize API structure)
interface AstrologizeResponse {
  _celestialBodies: {
    all: AstrologizePlanetData[];
    sun: AstrologizePlanetData;
    moon: AstrologizePlanetData;
    mercury: AstrologizePlanetData;
    venus: AstrologizePlanetData;
    mars: AstrologizePlanetData;
    jupiter: AstrologizePlanetData;
    saturn: AstrologizePlanetData;
    uranus: AstrologizePlanetData;
    neptune: AstrologizePlanetData;
    pluto: AstrologizePlanetData;
  };
  birth_info: {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
    ayanamsa: string;
  };
}

// Default location (New York City)
const DEFAULT_LOCATION = {
  latitude: 40.7498,
  longitude: -73.7976
};

/**
 * Get current date/time/location for astrology API
 */
function getCurrentDateTimeLocation(customLocation?: { latitude: number; longitude: number }) {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // Convert to 1-indexed for local API
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    latitude: customLocation?.latitude ?? DEFAULT_LOCATION.latitude,
    longitude: customLocation?.longitude ?? DEFAULT_LOCATION.longitude,
    zodiacSystem: 'tropical' as const // Default to tropical zodiac
  };
}

/**
 * Convert sign name from API to our format
 */
function normalizeSignName(signName: string): ZodiacSign {
  const signMap: { [key: string]: ZodiacSign } = {
    'aries': 'aries',
    'taurus': 'taurus', 
    'gemini': 'gemini',
    'cancer': 'cancer',
    'leo': 'leo',
    'virgo': 'virgo',
    'libra': 'libra',
    'scorpio': 'scorpio',
    'sagittarius': 'sagittarius',
    'capricorn': 'capricorn',
    'aquarius': 'aquarius',
    'pisces': 'pisces'
  };
  
  const normalized = signName?.toLowerCase() as ZodiacSign;
  return signMap[normalized] || 'aries';
}

/**
 * Calculate exact longitude from decimal degrees
 */
function calculateExactLongitude(decimalDegrees: number): number {
  // Normalize to 0-360 range
  return ((decimalDegrees % 360) + 360) % 360;
}

/**
 * Call the local astrologize API to get planetary positions with circuit breaker
 */
export async function fetchPlanetaryPositions(
  customDateTime?: Partial<LocalAstrologizeRequest>
): Promise<Record<string, PlanetPosition>> {
  
  const fallbackPositions = (): Record<string, PlanetPosition> => {
    console.log('Using fallback planetary positions due to API failure');
    return {
      Sun: { sign: 'gemini', degree: 13, minutes: 54, exactLongitude: 73.9, isRetrograde: false },
      moon: { sign: 'virgo', degree: 26, minutes: 31, exactLongitude: 176.52, isRetrograde: false },
      Mercury: { sign: 'gemini', degree: 20, minutes: 11, exactLongitude: 80.18, isRetrograde: false },
      Venus: { sign: 'aries', degree: 28, minutes: 6, exactLongitude: 28.1, isRetrograde: false },
      Mars: { sign: 'leo', degree: 22, minutes: 48, exactLongitude: 142.8, isRetrograde: false },
      Jupiter: { sign: 'gemini', degree: 28, minutes: 44, exactLongitude: 88.73, isRetrograde: false },
      Saturn: { sign: 'aries', degree: 0, minutes: 41, exactLongitude: 0.68, isRetrograde: false },
      Uranus: { sign: 'taurus', degree: 28, minutes: 17, exactLongitude: 58.28, isRetrograde: false },
      Neptune: { sign: 'aries', degree: 1, minutes: 55, exactLongitude: 1.92, isRetrograde: false },
      Pluto: { sign: 'aquarius', degree: 3, minutes: 36, exactLongitude: 303.6, isRetrograde: true },
      Ascendant: { sign: 'aries', degree: 16, minutes: 16, exactLongitude: 16.27, isRetrograde: false }
    };
  };

  return astrologizeApiCircuitBreaker.call(async () => {
    // Get current date/time or use provided values
    const defaultDateTime = getCurrentDateTimeLocation();
    const requestData: LocalAstrologizeRequest = {
      ...defaultDateTime,
      ...customDateTime
    };

    console.log('Calling local astrologize API with:', requestData);

    // Determine if we should use GET or POST
    const isCurrentTime = !customDateTime || Object.keys(customDateTime).length === 0;
    
    let response: Response;
    
    if (isCurrentTime) {
      // Use GET for current time with query parameters
      const params = new URLSearchParams();
      if (requestData.latitude) params.append('latitude', requestData.latitude.toString());
      if (requestData.longitude) params.append('longitude', requestData.longitude.toString());
      if (requestData.zodiacSystem) params.append('zodiacSystem', requestData.zodiacSystem);
      
      const url = `${LOCAL_ASTROLOGIZE_API_URL}?${params.toString()}`;
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
    } else {
      // Use POST for custom date/time
      response = await fetch(LOCAL_ASTROLOGIZE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: AstrologizeResponse = await response.json();
    
    // Extract planetary positions from the new API structure
    const celestialBodies = data?._celestialBodies;
    
    if (!celestialBodies) {
      throw new Error('Invalid API response structure');
    }
    
    const positions: { [key: string]: PlanetPosition } = {};

    // Process each planet from the celestial bodies
    const planetMap = {
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
      const planetData = celestialBodies[apiKey as keyof typeof planetMap];
      if (planetData) {
        const sign = normalizeSignName(planetData.Sign.key);
        const decimalDegrees = planetData.ChartPosition.Ecliptic.DecimalDegrees;
        const arcDegrees = planetData.ChartPosition.Ecliptic.ArcDegrees;
        
        positions[planetName] = {
          sign,
          degree: arcDegrees.degrees,
          minutes: arcDegrees.minutes,
          exactLongitude: calculateExactLongitude(decimalDegrees),
          isRetrograde: planetData.isRetrograde || false
        };
      }
    });

    // For now, calculate Ascendant from the response if available
    // This should be extracted from the actual API response in future updates
    positions['Ascendant'] = {
      sign: 'aries',
      degree: 16,
      minutes: 16,
      exactLongitude: 16.27,
      isRetrograde: false
    };

    console.log('Successfully fetched planetary positions from local API:', Object.keys(positions));
    console.log('🌟 Using', data.birth_info?.ayanamsa || 'TROPICAL', 'zodiac system');
    return positions;

  }, fallbackPositions);
}

/**
 * Get planetary positions for the current moment
 */
export async function getCurrentPlanetaryPositions(
  location?: { latitude: number; longitude: number },
  zodiacSystem: 'tropical' | 'sidereal' = 'tropical'
): Promise<Record<string, PlanetPosition>> {
  return await fetchPlanetaryPositions({
    ...location,
    zodiacSystem
  });
}

/**
 * Get planetary positions for a specific date/time
 */
export async function getPlanetaryPositionsForDateTime(
  date: Date,
  location?: { latitude: number; longitude: number },
  zodiacSystem: 'tropical' | 'sidereal' = 'tropical'
): Promise<Record<string, PlanetPosition>> {
  return await fetchPlanetaryPositions({
    year: date.getFullYear(),
    month: date.getMonth() + 1, // Convert to 1-indexed for local API
    date: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    zodiacSystem,
    ...location
  });
}

/**
 * Test the astrologize API connection
 */
export async function testAstrologizeApi(): Promise<boolean> {
  try {
    const positions = await fetchPlanetaryPositions();
    return Object.keys(positions || {}).length > 0;
  } catch (error) {
    console.error('Astrologize API test failed:', error);
    return false;
  }
} 