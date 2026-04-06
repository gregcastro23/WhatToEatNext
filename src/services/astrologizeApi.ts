import { _logger } from "@/lib/logger";
import { log } from "@/services/LoggingService";
import { astrologizeApiCircuitBreaker } from "@/utils/apiCircuitBreaker";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import type { PlanetPosition } from "@/utils/astrologyUtils";

// Use relative API endpoints so they hit the Next.js routes
// The Next.js /api/... routes will securely proxy to the appropriate backend

const getAstrologizeApiUrl = () => {
  if (typeof window === "undefined") {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}/api/astrologize`;
    }
    return `http://localhost:${process.env.PORT || 3000}/api/astrologize`;
  }
  return `/api/astrologize`;
};

const getRecipeRecommendationsApiUrl = () => {
  return `/api/astrological/recipe-recommendations-by-chart`;
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
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1, // Convert to 1-indexed for local API
    date: now.getUTCDate(),
    hour: now.getUTCHours(),
    minute: now.getUTCMinutes(),
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
 * Calculate approximate Ascendant (rising sign) from date, time, and location.
 * Uses simplified Local Sidereal Time (LST) calculation.
 */
function calculateApproximateAscendant(
  requestData: LocalAstrologizeRequest,
): PlanetPosition {
  const signs = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
  ] as const;

  const now = new Date();
  const year = requestData.year ?? now.getFullYear();
  const month = requestData.month ?? (now.getMonth() + 1);
  const day = requestData.date ?? now.getDate();
  const hour = requestData.hour ?? now.getHours();
  const minute = requestData.minute ?? now.getMinutes();
  const longitude = requestData.longitude ?? DEFAULT_LOCATION.longitude;
  const latitude = requestData.latitude ?? DEFAULT_LOCATION.latitude;

  // Using accurate math via astronomy-engine
  let lstRad = 0;
  let oblRad = 0;
  try {
    const Astronomy = require("astronomy-engine");
    const astroTime = new Astronomy.AstroTime(new Date(Date.UTC(year, month - 1, day, hour, minute)));
    const gmst = Astronomy.SiderealTime(astroTime);
    // Convert LST to hours, then to radians
    let lstHours = ((gmst + longitude / 15) % 24 + 24) % 24;
    lstRad = (lstHours * 15) * Math.PI / 180;
    // Approximating obliquity of ecliptic ~23.439 degrees
    oblRad = 23.4392911 * Math.PI / 180;
  } catch (e) {
    // Fallback if astronomy-engine fails to load somehow
    const jdn = day + Math.floor((153 * (month + 12 * Math.floor((14 - month) / 12) - 3) + 2) / 5) + 365 * (year + 4800 - Math.floor((14 - month) / 12)) + Math.floor((year + 4800 - Math.floor((14 - month) / 12)) / 4) - 32045;
    const T = (jdn - 2451545.0) / 36525.0;
    const gst0 = 280.46061837 + 360.98564736629 * (jdn - 2451545.0) + 0.000387933 * T * T;
    const utcHours = hour + minute / 60.0;
    const gst = ((gst0 + utcHours * 1.00273790935 * 15) % 360 + 360) % 360;
    const lst = ((gst + longitude) % 360 + 360) % 360;
    lstRad = lst * Math.PI / 180;
    oblRad = (23.4393 - 0.0130 * T) * Math.PI / 180;
  }

  const latRad = latitude * Math.PI / 180;
  
  // RAMC to Ascendant conversion
  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad))
  );
  const ascLongitude = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;

  const signIndex = Math.floor(ascLongitude / 30);
  const degreeInSign = ascLongitude - signIndex * 30;
  const degree = Math.floor(degreeInSign);
  const minuteVal = Math.floor((degreeInSign - degree) * 60);

  return {
    sign: signs[signIndex % 12],
    degree,
    minute: minuteVal,
    exactLongitude: ascLongitude,
    isRetrograde: false,
  };
}

/**
 * Call the local astrologize API to get planetary positions with circuit breaker
 */
export async function fetchPlanetaryPositions(
  customDateTime?: Partial<LocalAstrologizeRequest>,
): Promise<Record<string, PlanetPosition>> {
  // Get current date/time or use provided values (needed by both main path and fallback)
  const defaultDateTime = getCurrentDateTimeLocation();
  const requestData: LocalAstrologizeRequest = {
    ...defaultDateTime,
    ...customDateTime,
  };

  const fallbackPositions = (): Record<string, PlanetPosition> => {
    log.info("Using date-aware fallback via astronomy-engine (API circuit breaker active)");
    // Build a date from the request data so fallback positions match the actual request
    const fallbackDate = new Date(
      Date.UTC(
        requestData.year ?? new Date().getUTCFullYear(),
        ((requestData.month ?? 1) - 1),
        requestData.date ?? 1,
        requestData.hour ?? 12,
        requestData.minute ?? 0,
      ),
    );
    const accurate = getAccuratePlanetaryPositions(fallbackDate);
    const positions: Record<string, PlanetPosition> = {};
    for (const [planet, data] of Object.entries(accurate)) {
      positions[planet] = {
        sign: data.sign || "aries",
        degree: Math.floor(data.degree),
        minute: Math.floor((data.degree - Math.floor(data.degree)) * 60),
        exactLongitude: data.exactLongitude,
        isRetrograde: data.isRetrograde,
      };
    }
    // Add Ascendant from approximate calculation if not present
    if (!positions.Ascendant) {
      positions.Ascendant = calculateApproximateAscendant(requestData);
    }
    return positions;
  };

  return astrologizeApiCircuitBreaker.call(async () => {

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

    // Use server-computed Ascendant when available (uses Astronomy.SiderealTime —
    // accurate to sub-arcsecond). Fall back to local approximate calculation.
    const serverAscendant = (data as any).ascendant;
    if (
      serverAscendant &&
      serverAscendant.sign &&
      typeof serverAscendant.exactLongitude === "number"
    ) {
      positions["Ascendant"] = {
        sign: normalizeSignName(serverAscendant.sign),
        degree: serverAscendant.degree ?? 0,
        minute: serverAscendant.minute ?? 0,
        exactLongitude: serverAscendant.exactLongitude,
        isRetrograde: false,
      };
      log.info(
        `Ascendant from server: ${serverAscendant.exactLongitude.toFixed(2)}° (${serverAscendant.sign})`,
      );
    } else {
      positions["Ascendant"] = calculateApproximateAscendant(requestData);
      log.info("Using approximate local Ascendant calculation");
    }

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
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1, // Convert to 1-indexed for local API,
    date: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
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
