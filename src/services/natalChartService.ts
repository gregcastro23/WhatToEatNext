/**
 * Natal Chart Service
 *
 * Service for calculating individual natal charts from birth data.
 * Uses the astrologize API and planetary alchemy mapping to generate
 * complete natal chart data including elemental and alchemical properties.
 */

import { _logger } from "@/lib/logger";
import type {
  Planet,
  ZodiacSignType,
  Element,
  Modality,
} from "@/types/celestial";
import type { BirthData, NatalChart, PlanetInfo } from "@/types/natalChart";
import { signDegreeToLongitude } from "@/utils/aspectCalculator";
import {
  validateBirthChartAgainstEstimates,
  detectStaticFallback,
} from "@/utils/astrology/birthChartSignEstimator";
import {
  calculateAlchemicalFromPlanets,
  aggregateEnhancedZodiacElementals,
  getDominantElement,
  isSectDiurnalForBirth,
} from "@/utils/planetaryAlchemyMapping";
import { getSelfBaseUrl } from "@/utils/urlUtils";
import { getModalityForZodiac } from "@/utils/zodiacUtils";

/**
 * Interface for the astrologize API response (simplified)
 */
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

interface AscendantData {
  sign: string;
  degree?: number;
  minute?: number;
  exactLongitude?: number;
}

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
  ascendant?: AscendantData;
  birth_info: {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
  };
}

// Resolve an absolute astrologize URL when running on the server (where
// `fetch` rejects relative paths) and stay relative in the browser.
//
// Server-side base resolution: an explicit `ALCHM_MCP_BACKEND_URL` wins — the
// stdio MCP server / desktop sidecar injects it so this self-fetch reaches a
// real alchm.kitchen instead of a non-existent localhost backend. Otherwise we
// fall back to the app's own self base URL (Vercel alias in prod, localhost in
// dev), which is correct when this runs inside the Next.js app itself. See
// `mcp-server/src/index.ts` for how the sidecar defaults this env var.
function getAstrologizeApiUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/astrologize";
  }
  const explicit = process.env.ALCHM_MCP_BACKEND_URL?.trim();
  const base = explicit ? explicit.replace(/\/+$/, "") : getSelfBaseUrl();
  return `${base}/api/astrologize`;
}

/**
 * Normalize zodiac sign name from API to our lowercase format
 */
function normalizeSignName(signName: string): ZodiacSignType {
  const signMap: Record<string, ZodiacSignType> = {
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

  const normalized = signName.toLowerCase();
  return signMap[normalized] || ("aries");
}

/**
 * Calculate approximate Ascendant sign from birth data using Local Sidereal Time.
 * This is a fallback when the server doesn't return Ascendant data.
 */
function calculateApproximateAscendant(
  birthData: BirthData,
): PositionWithLongitude {
  const zodiacSigns: ZodiacSignType[] = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
  ] as ZodiacSignType[];

  const date = new Date(birthData.dateTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const longitude = birthData.longitude;
  const latitude = birthData.latitude;

  // Julian Day Number (simplified)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Greenwich Sidereal Time in degrees
  const T = (jdn - 2451545.0) / 36525.0;
  const gst0 = 280.46061837 + 360.98564736629 * (jdn - 2451545.0)
    + 0.000387933 * T * T;
  const utcHours = hour + minute / 60.0;
  const gst = ((gst0 + utcHours * 1.00273790935 * 15) % 360 + 360) % 360;

  // Local Sidereal Time
  const lst = ((gst + longitude) % 360 + 360) % 360;

  // Obliquity of the ecliptic and RAMC-to-Ascendant conversion
  const obliquity = 23.4393 - 0.0130 * T;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const lstRad = lst * Math.PI / 180;

  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad))
  );
  const ascLongitude = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;

  const signIndex = Math.floor(ascLongitude / 30) % 12;
  return {
    sign: zodiacSigns[signIndex],
    exactLongitude: ascLongitude,
  };
}

/**
 * Position data with sign and exact ecliptic longitude
 */
interface PositionWithLongitude {
  sign: ZodiacSignType;
  exactLongitude: number;
}

/**
 * Call astrologize API with birth data.
 * Returns both zodiac sign and exact ecliptic longitude for sub-arcminute accuracy.
 */
async function fetchPlanetaryPositions(
  birthData: BirthData,
): Promise<Record<Planet, PositionWithLongitude>> {
  try {
    // The EPHEMERIS is queried at the true instant when the temporal migration
    // has supplied one, and falls back to the wall clock otherwise.
    //
    // `dateTime` is a wall clock labelled `Z` (see BirthData's docs): a Brooklyn
    // birth at 14:24 is stored `1991-06-23T14:24:00.000Z` when the real instant
    // is 18:24Z. Querying the sky at the wall clock is wrong by exactly the
    // birthplace's UTC offset — four hours here, which is ~2.2 deg of Moon and
    // ~60 deg (two whole signs) of Ascendant.
    //
    // `utcInstant` is written by `scripts/backfillBirthInstant.ts` and is absent
    // on unmigrated rows and on rows where no defensible instant exists. It is
    // never fabricated, so `undefined` really does mean "unknown" and the
    // fallback below preserves exactly the pre-migration behaviour for them.
    //
    // ⚠️ SECT DOES NOT MOVE WITH THIS. `isSectDiurnal` is a 06:00-18:00 LOCAL
    // window; it must keep reading `dateTime`. MEASURED 2026-08-04: sourcing it
    // from the true instant instead flips day<->night on 6 of the 8 human rows
    // in prod (14:24 local is diurnal; 18:24Z is nocturnal because `18 < 18` is
    // false), swinging the profile ~32/49/9/9 -> ~14/16/47/22 and rewriting the
    // archetype — a flip manufactured by the migration rather than found by it.
    const ephemerisSource = birthData.utcInstant ?? birthData.dateTime;
    const date = new Date(ephemerisSource);
    if (Number.isNaN(date.getTime())) {
      throw new Error(
        `Unparseable birth instant: ${JSON.stringify(ephemerisSource)} ` +
          `(from birthData.${birthData.utcInstant ? "utcInstant" : "dateTime"}). ` +
          "Refusing to compute a chart from an invalid instant.",
      );
    }

    // UTC getters, deliberately — this is the timezone boundary.
    //
    // `/api/astrologize` reconstructs the instant with
    // `Date.UTC(year, month - 1, date, hour, minute)` (see that route). So the
    // components it wants are the UTC components of this instant, and
    // getUTC* -> Date.UTC is an exact round-trip on any machine.
    //
    // The local-time getters this replaces made the CALLER'S timezone part of
    // the physics. MEASURED 2026-08-03 re-igniting a stored chart (birth
    // 1991-06-23T14:24:00Z): TZ=UTC reproduced the stored Sun bit-exact at
    // 91.63304700590142, while TZ=America/New_York returned 91.47408219086523
    // -- 0.159 degrees of pure harness drift, small enough to read as rounding.
    // Prod runs on UTC infrastructure, so every stored chart was computed on the
    // UTC branch; these getters make that the behaviour everywhere instead of an
    // accident of deployment.
    //
    // NOTE (superseded 2026-08-04): this used to read "`birthData.timezone` is
    // still not applied, and that is deliberate" — parked because applying it
    // would re-date every stored chart and because the stored zone strings were
    // not uniformly IANA. Both halves are now resolved and the zone IS applied,
    // via `utcInstant` above rather than here:
    //
    //   * the mixed key-space was RULED — the zone is DERIVED from the birth
    //     coordinates, never from the stored string, which was wrong on 3 of the
    //     6 migratable rows (2x `UTC-5` on EDT births, 1x `America/New_York` on
    //     Brazilian coordinates). See `utils/astrology/birthTimezone.ts`.
    //   * the re-dating is the point, and was sized before it was done:
    //     `scripts/backfillBirthInstant.ts` reports it as a three-column
    //     STORED/CONTROL/NEW diff so engine drift cannot be mistaken for it.
    //
    // These getters remain UTC-only regardless: `/api/astrologize` rebuilds the
    // instant with `Date.UTC(...)`, so getUTC* -> Date.UTC is the exact
    // round-trip and the caller's zone stays out of the physics.
    const payload = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1, // 1-indexed
      date: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      zodiacSystem: "tropical" as const,
    };

    const astrologizeUrl = getAstrologizeApiUrl();
    let response: Response;
    try {
      response = await fetch(astrologizeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (cause) {
      // Fail loud with the unreachable URL + the knob to fix it, instead of a
      // bare "fetch failed". This is the path hit when the standalone MCP
      // sidecar self-fetches a backend that isn't there (e.g. localhost with no
      // local app running).
      throw new Error(
        `Could not reach the astrologize backend at ${astrologizeUrl}. ` +
          "Set ALCHM_MCP_BACKEND_URL to a reachable alchm.kitchen host.",
        { cause },
      );
    }

    if (!response.ok) {
      throw new Error(`Astrologize API error: ${response.statusText}`);
    }

    const data = (await response.json()) as AstrologizeResponse;

    // Determine Ascendant from server response or calculate locally
    let ascendant: PositionWithLongitude;
    if (data.ascendant?.sign) {
      const sign = normalizeSignName(data.ascendant.sign);
      const exactLongitude =
        data.ascendant.exactLongitude ??
        signDegreeToLongitude(
          sign,
          data.ascendant.degree ?? 0,
          data.ascendant.minute ?? 0,
        );
      if (exactLongitude === null) {
        throw new Error(`Could not derive Ascendant longitude for ${sign}`);
      }
      ascendant = { sign, exactLongitude };
      _logger.info(`Ascendant from API: ${data.ascendant.sign} (${data.ascendant.exactLongitude?.toFixed(2)}°)`);
    } else {
      // Calculate approximate Ascendant from birth data using Local Sidereal Time
      ascendant = calculateApproximateAscendant(birthData);
      _logger.info(`Ascendant calculated locally: ${ascendant.sign}`);
    }

    // Helper to extract longitude from a celestial body entry
    const getLongitude = (body: AstrologizePlanetData): number =>
      body?.ChartPosition?.Ecliptic?.DecimalDegrees ?? 0;

    // Extract planetary positions with exact longitudes
    const positions: Record<Planet, PositionWithLongitude> = {
      Sun: { sign: normalizeSignName(data._celestialBodies.sun.Sign.label), exactLongitude: getLongitude(data._celestialBodies.sun) },
      Moon: { sign: normalizeSignName(data._celestialBodies.moon.Sign.label), exactLongitude: getLongitude(data._celestialBodies.moon) },
      Mercury: { sign: normalizeSignName(data._celestialBodies.mercury.Sign.label), exactLongitude: getLongitude(data._celestialBodies.mercury) },
      Venus: { sign: normalizeSignName(data._celestialBodies.venus.Sign.label), exactLongitude: getLongitude(data._celestialBodies.venus) },
      Mars: { sign: normalizeSignName(data._celestialBodies.mars.Sign.label), exactLongitude: getLongitude(data._celestialBodies.mars) },
      Jupiter: { sign: normalizeSignName(data._celestialBodies.jupiter.Sign.label), exactLongitude: getLongitude(data._celestialBodies.jupiter) },
      Saturn: { sign: normalizeSignName(data._celestialBodies.saturn.Sign.label), exactLongitude: getLongitude(data._celestialBodies.saturn) },
      Uranus: { sign: normalizeSignName(data._celestialBodies.uranus.Sign.label), exactLongitude: getLongitude(data._celestialBodies.uranus) },
      Neptune: { sign: normalizeSignName(data._celestialBodies.neptune.Sign.label), exactLongitude: getLongitude(data._celestialBodies.neptune) },
      Pluto: { sign: normalizeSignName(data._celestialBodies.pluto.Sign.label), exactLongitude: getLongitude(data._celestialBodies.pluto) },
      Ascendant: ascendant,
    };

    return positions;
  } catch (error) {
    _logger.error("Error fetching planetary positions: ", error);
    throw error;
  }
}

/**
 * Calculate dominant modality from planetary positions
 */
function calculateDominantModality(
  planetaryPositions: Record<Planet, ZodiacSignType>,
): Modality {
  const modalityCounts: Record<string, number> = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };

  // Count occurrences of each modality
  Object.values(planetaryPositions).forEach((sign) => {
    const modality = getModalityForZodiac(sign);
    const capitalizedModality =
      modality.charAt(0).toUpperCase() + modality.slice(1);
    modalityCounts[capitalizedModality] =
      (modalityCounts[capitalizedModality] || 0) + 1;
  });

  // Find the dominant modality
  let dominant: Modality = "Cardinal";
  let maxCount = 0;

  (Object.entries(modalityCounts) as Array<[Modality, number]>).forEach(
    ([modality, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = modality;
      }
    },
  );

  return dominant;
}

/**
 * Calculate natal chart from birth data
 *
 * @param birthData - Birth date, time, and location
 * @returns Complete natal chart with planetary, elemental, and alchemical properties
 */
export async function calculateNatalChart(
  birthData: BirthData,
): Promise<NatalChart> {
  try {
    // Fetch planetary positions from astrologize API
    const planetaryPositions = await fetchPlanetaryPositions(birthData);

    // Extract sign-only record for validation and alchemy calculations
    const signPositions: Record<Planet, ZodiacSignType> = {} as Record<Planet, ZodiacSignType>;
    Object.entries(planetaryPositions).forEach(([planet, data]) => {
      signPositions[planet as Planet] = data.sign;
    });

    // Validate birth chart positions against astronomical estimates
    const birthDate = new Date(birthData.dateTime);
    const diurnal = isSectDiurnalForBirth(birthDate);

    if (detectStaticFallback(signPositions)) {
      _logger.error(
        "Birth chart returned STATIC FALLBACK positions — these do not reflect the actual birth date. The API circuit breaker may be open.",
      );
    }
    const validation = validateBirthChartAgainstEstimates(birthDate, signPositions);
    if (validation.hasWarnings) {
      _logger.warn(
        `Birth chart validation: ${validation.passedPlanets}/${validation.validatedPlanets} planets passed.`,
        validation.warnings.map((w) => w.message),
      );
    }

    // Convert to format expected by planetary alchemy mapping
    const positionsForAlchemy: Record<string, string> = {};
    Object.entries(signPositions).forEach(([planet, sign]) => {
      positionsForAlchemy[planet] = sign;
    });

    // Calculate all three ESMS layers from the same longitude-bearing chart.
    const alchemicalProperties = calculateAlchemicalFromPlanets(
      planetaryPositions,
      diurnal,
    );

    // Calculate elemental balance from zodiac signs WITH sect logic
    const elementalBalance = aggregateEnhancedZodiacElementals(positionsForAlchemy, diurnal);

    // Determine dominant element and modality
    const dominantElement = getDominantElement(elementalBalance) as Element;
    const dominantModality = calculateDominantModality(signPositions);

    const planets: PlanetInfo[] = Object.entries(planetaryPositions).map(
      ([name, data]) => ({
        name: name as Planet,
        sign: data.sign,
        position: data.exactLongitude,
      }),
    );

    // Create natal chart
    const natalChart: NatalChart = {
      birthData,
      planets,
      ascendant: signPositions.Ascendant,
      planetaryPositions: signPositions,
      dominantElement,
      dominantModality,
      elementalBalance,
      alchemicalProperties,
      calculatedAt: new Date().toISOString(),
    };

    return natalChart;
  } catch (error) {
    _logger.error("Error calculating natal chart: ", error);
    throw new Error(
      "Failed to calculate natal chart. Please check birth data and try again.",
      { cause: error },
    );
  }
}

/**
 * Validate birth data before calculating natal chart
 */
export function validateBirthData(birthData: BirthData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate date/time
  const date = new Date(birthData.dateTime);
  if (isNaN(date.getTime())) {
    errors.push("Invalid date/time format");
  }

  // Validate latitude (-90 to 90)
  if (
    birthData.latitude < -90 ||
    birthData.latitude > 90 ||
    isNaN(birthData.latitude)
  ) {
    errors.push("Latitude must be between -90 and 90");
  }

  // Validate longitude (-180 to 180)
  if (
    birthData.longitude < -180 ||
    birthData.longitude > 180 ||
    isNaN(birthData.longitude)
  ) {
    errors.push("Longitude must be between -180 and 180");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
