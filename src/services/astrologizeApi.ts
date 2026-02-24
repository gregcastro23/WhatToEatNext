import { _logger } from "@/lib/logger";
import { log } from "@/services/LoggingService";
import { astrologizeApiCircuitBreaker } from "@/utils/apiCircuitBreaker";
import type { PlanetPosition } from "@/utils/astrologyUtils";

// Use local API endpoint instead of external
// On server-side, we need an absolute URL since relative URLs don't work in Node.js
const getBackendBaseUrl = () => {
  if (typeof window === "undefined") {
    // Server-side: use absolute URL from environment variables
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:8001"
    ); // Fallback to local Docker port
  }
  // Client-side: use relative URL if backend is proxied, or absolute if explicitly set
  return process.env.NEXT_PUBLIC_BACKEND_URL || "";
};

const getAstrologizeApiUrl = () => {
  const baseUrl = getBackendBaseUrl();
  return `${baseUrl}/api/astrologize`; // Corrected endpoint for planetary positions
};

const getRecipeRecommendationsApiUrl = () => {
  const baseUrl = getBackendBaseUrl();
  return `${baseUrl}/api/astrological/recipe-recommendations-by-chart`; // New endpoint
};

// Interface for the local API request
interface LocalAstrologizeRequest {
  year?: number;
  month?: number; // 1-indexed for user input (January = 1, February = 2, etc.)
  date?: number;
  hour?: number;
  minute?: number;
  latitude?: number;
  longitude?: number;
  zodiacSystem?: "tropical" | "sidereal"; // Add zodiac system support
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
  longitude: -73.7976,
};

/**
 * Get current date/time/location for astrology API
 */
function getCurrentDateTimeLocation(customLocation?: {
  latitude: number;
  longitude: number;
}) {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // Convert to 1-indexed for local API
    date: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    latitude: customLocation?.latitude ?? DEFAULT_LOCATION.latitude,
    longitude: customLocation?.longitude ?? DEFAULT_LOCATION.longitude,
    zodiacSystem: "tropical" as const, // Default to tropical zodiac
  };
}

/**
 * Convert sign name from API to our format
 */
function normalizeSignName(signName: string): any {
  const signMap: { [key: string]: any } = {
    aries: "aries",
    taurus: "taurus",
    gemini: "gemini",
    cancer: "cancer",
    leo: "leo",
    virgo: "virgo",
    libra: "libra",
    scorpio: "scorpio",
    sagittarius: "sagittarius",
    capricorn: "capricorn",
    aquarius: "aquarius",
    pisces: "pisces",
  };
  const normalized = signName.toLowerCase() as any;
  return signMap[normalized] || "aries";
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
  customDateTime?: Partial<LocalAstrologizeRequest>,
): Promise<Record<string, PlanetPosition>> {
  const fallbackPositions = (): Record<string, PlanetPosition> => {
    log.info("Using fallback planetary positions due to API failure");
    return {
      Sun: {
        sign: "sagittarius",
        degree: 2,
        minute: 30,
        exactLongitude: 242.5,
        isRetrograde: false,
      },
      Moon: {
        sign: "cancer",
        degree: 15,
        minute: 20,
        exactLongitude: 105.33,
        isRetrograde: false,
      },
      Mercury: {
        sign: "sagittarius",
        degree: 18,
        minute: 45,
        exactLongitude: 258.75,
        isRetrograde: false,
      },
      Venus: {
        sign: "capricorn",
        degree: 10,
        minute: 30,
        exactLongitude: 280.5,
        isRetrograde: false,
      },
      Mars: {
        sign: "leo",
        degree: 25,
        minute: 15,
        exactLongitude: 145.25,
        isRetrograde: false,
      },
      Jupiter: {
        sign: "gemini",
        degree: 16,
        minute: 40,
        exactLongitude: 76.67,
        isRetrograde: false,
      },
      Saturn: {
        sign: "pisces",
        degree: 14,
        minute: 20,
        exactLongitude: 344.33,
        isRetrograde: false,
      },
      Uranus: {
        sign: "taurus",
        degree: 22,
        minute: 10,
        exactLongitude: 52.17,
        isRetrograde: true,
      },
      Neptune: {
        sign: "pisces",
        degree: 27,
        minute: 45,
        exactLongitude: 357.75,
        isRetrograde: false,
      },
      Pluto: {
        sign: "aquarius",
        degree: 0,
        minute: 15,
        exactLongitude: 300.25,
        isRetrograde: false,
      },
      Ascendant: {
        sign: "aries",
        degree: 16,
        minute: 16,
        exactLongitude: 16.27,
        isRetrograde: false,
      },
    };
  };

  return astrologizeApiCircuitBreaker.call(async () => {
    // Get current date/time or use provided values
    const defaultDateTime = getCurrentDateTimeLocation();
    const requestData: LocalAstrologizeRequest = {
      ...defaultDateTime,
      ...customDateTime,
    };

    log.info("Calling local astrologize API with: ", requestData);

    // Determine if we should use GET or POST
    const isCurrentTime =
      !customDateTime || Object.keys(customDateTime).length === 0;

    let response: Response;

    if (isCurrentTime) {
      // Use GET for current time with query parameters
      const params = new URLSearchParams();
      if (requestData.latitude)
        params.append("latitude", requestData.latitude.toString());
      if (requestData.longitude)
        params.append("longitude", requestData.longitude.toString());
      if (requestData.zodiacSystem)
        params.append("zodiacSystem", requestData.zodiacSystem);

      const url = `${getAstrologizeApiUrl()}?${params.toString()}`;
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout for faster fallback
      });
    } else {
      // Use POST for custom date/time
      response = await fetch(getAstrologizeApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(5000), // 5 second timeout for faster fallback
      });
    }

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data: AstrologizeResponse = await response.json();

    // Extract planetary positions from the new API structure;
    const celestialBodies = data._celestialBodies;

    if (!celestialBodies) {
      throw new Error("Invalid API response structure");
    }

    // If the API returned a graceful-degradation error response with empty bodies,
    // throw so the circuit breaker activates the local fallback positions.
    const hasError = (data as any).error;
    const hasNoPlanets =
      !celestialBodies.all ||
      celestialBodies.all.length === 0;
    if (hasError && hasNoPlanets) {
      throw new Error(
        `API returned error: ${(data as any).error || "Calculations unavailable"}`,
      );
    }

    const positions: { [key: string]: PlanetPosition } = {};

    // Process each planet from the celestial bodies
    const planetMap = {
      sun: "Sun",
      moon: "Moon",
      mercury: "Mercury",
      venus: "Venus",
      mars: "Mars",
      jupiter: "Jupiter",
      saturn: "Saturn",
      uranus: "Uranus",
      neptune: "Neptune",
      pluto: "Pluto",
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
          minute: arcDegrees.minutes,
          exactLongitude: calculateExactLongitude(decimalDegrees),
          isRetrograde: planetData.isRetrograde || false,
        };
      }
    });

    // For now, calculate Ascendant from the response if available
    // This should be extracted from the actual API response in future updates
    positions["Ascendant"] = {
      sign: "aries",
      degree: 16,
      minute: 16,
      exactLongitude: 16.27,
      isRetrograde: false,
    };

    log.info(
      "Successfully fetched planetary positions from local API:",
      Object.keys(positions),
    );
    log.info("🌟 Using zodiac system: ", {
      system: data.birth_info?.ayanamsa || "TROPICAL",
    });
    return positions;
  }, fallbackPositions);
}

/**
 * Get planetary positions for the current moment
 */
export async function getCurrentPlanetaryPositions(
  location?: { latitude: number; longitude: number },
  zodiacSystem: "tropical" | "sidereal" = "tropical",
): Promise<Record<string, PlanetPosition>> {
  return await fetchPlanetaryPositions({
    ...location,
    zodiacSystem,
  });
}

/**
 * Get planetary positions for a specific date/time
 */
export async function getPlanetaryPositionsForDateTime(
  date: Date,
  location?: { latitude: number; longitude: number },
  zodiacSystem: "tropical" | "sidereal" = "tropical",
): Promise<Record<string, PlanetPosition>> {
  return await fetchPlanetaryPositions({
    year: date.getFullYear(),
    month: date.getMonth() + 1, // Convert to 1-indexed for local API,
    date: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    zodiacSystem,
    ...location,
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
    _logger.error("Astrologize API test failed: ", error);
    return false;
  }
}

/**
 * Fetch astrological recipe recommendations based on birth data.
 */
export async function fetchAstrologicalRecipes(birthData: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
}): Promise<any> {
  // TODO: Define a proper interface for recipe recommendations
  return astrologizeApiCircuitBreaker.call(async () => {
    log.info("Fetching astrological recipe recommendations with: ", birthData);

    const response = await fetch(getRecipeRecommendationsApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(birthData),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(
        `Recipe recommendations API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    log.info("Successfully fetched astrological recipe recommendations.");
    return data;
  });
}

/**
 * Get current chart data (alias for getCurrentPlanetaryPositions)
 */
export async function getCurrentChart(
  location?: { latitude: number; longitude: number },
  zodiacSystem: "tropical" | "sidereal" = "tropical",
): Promise<Record<string, PlanetPosition>> {
  return await getCurrentPlanetaryPositions(location, zodiacSystem);
}
