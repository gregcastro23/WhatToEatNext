/**
 * Live Ephemeris Utility
 *
 * Provides real-time planetary position calculations using the astronomy-engine
 * library. This is the primary client for live sky data throughout the dashboard.
 *
 * Architecture:
 *   1. Backend Swiss Ephemeris (pyswisseph) — highest precision, requires backend
 *   2. astronomy-engine (this module) — moderate precision, always available
 *   3. Static fallback — last resort
 *
 * This module wraps astronomy-engine with:
 *   - Proper sunrise / sunset sect determination
 *   - Caching (positions barely change within a few minutes)
 *   - A unified snapshot interface consumed by the alchemizer and UI
 */

import * as Astronomy from "astronomy-engine";
import type { ZodiacSignType } from "@/types/celestial";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import {
  PLANETARY_ALCHEMY,
  PLANETARY_SECTARIAN_ELEMENTS,
  isSectDiurnal,
  getPlanetarySectElement,
  getZodiacQuality,
  type AlchemicalElement,
  type ZodiacQuality,
} from "@/utils/planetaryAlchemyMapping";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LivePlanetData {
  name: string;
  position: PlanetPosition;
  esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
  /** Element derived from the zodiac sign the planet currently occupies */
  signElement: AlchemicalElement;
  /** Element the planet expresses under the current sect (day/night) */
  sectElement: AlchemicalElement;
  /** Quality / modality of the current sign (Cardinal / Fixed / Mutable) */
  signQuality: ZodiacQuality;
}

export interface LiveSkySnapshot {
  /** All 10 planet data objects */
  planets: LivePlanetData[];
  /** Raw position map keyed by planet name (for alchemize()) */
  positions: Record<string, PlanetPosition>;
  /** true during the day sect, false at night */
  isDiurnal: boolean;
  /** ISO timestamp of the moment this snapshot represents */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Zodiac helpers
// ---------------------------------------------------------------------------

const ZODIAC_SIGNS: ZodiacSignType[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const SIGN_ELEMENTS: Record<string, AlchemicalElement> = {
  aries: "Fire", taurus: "Earth", gemini: "Air", cancer: "Water",
  leo: "Fire", virgo: "Earth", libra: "Air", scorpio: "Water",
  sagittarius: "Fire", capricorn: "Earth", aquarius: "Air", pisces: "Water",
};

function longitudeToZodiac(longitude: number): {
  sign: ZodiacSignType;
  degree: number;
  minute: number;
} {
  const norm = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  return {
    sign: ZODIAC_SIGNS[idx],
    degree: Math.floor(degInSign),
    minute: Math.floor((degInSign - Math.floor(degInSign)) * 60),
  };
}

// ---------------------------------------------------------------------------
// Sunrise / Sunset based Sect
// ---------------------------------------------------------------------------

/**
 * Determine whether the given moment is diurnal (Sun above horizon).
 *
 * When latitude and longitude are available we use astronomy-engine's
 * SearchRiseSet to find the surrounding sunrise and sunset and compare.
 * Without geo-location we fall back to the simple UTC 06–18 heuristic
 * already in planetaryAlchemyMapping.ts.
 *
 * @param date  - The moment to evaluate (defaults to now)
 * @param lat   - Observer latitude in degrees (positive N)
 * @param lon   - Observer longitude in degrees (positive E)
 */
export function isDiurnalSect(
  date: Date = new Date(),
  lat?: number,
  lon?: number,
): boolean {
  if (lat == null || lon == null) {
    // No location — use simple UTC heuristic
    return isSectDiurnal(date);
  }

  try {
    const observer = new Astronomy.Observer(lat, lon, 0);
    const astroTime = new Astronomy.AstroTime(date);

    // Search for the most recent sunrise (look backwards up to 1 day)
    const sunrise = Astronomy.SearchRiseSet(
      Astronomy.Body.Sun,
      observer,
      +1, // direction: rise
      astroTime,
      -1, // search backwards within 1 day
    );

    // Search for the most recent sunset (look backwards up to 1 day)
    const sunset = Astronomy.SearchRiseSet(
      Astronomy.Body.Sun,
      observer,
      -1, // direction: set
      astroTime,
      -1,
    );

    if (sunrise && sunset) {
      // If the most recent sunrise is MORE recent than the most recent sunset,
      // the Sun is currently above the horizon → diurnal.
      return sunrise.date.getTime() > sunset.date.getTime();
    }
  } catch {
    // Polar regions or calculation edge cases — fall back
  }

  return isSectDiurnal(date);
}

// ---------------------------------------------------------------------------
// Planet definitions
// ---------------------------------------------------------------------------

const PLANET_BODIES = [
  { name: "Sun", body: Astronomy.Body.Sun },
  { name: "Moon", body: Astronomy.Body.Moon },
  { name: "Mercury", body: Astronomy.Body.Mercury },
  { name: "Venus", body: Astronomy.Body.Venus },
  { name: "Mars", body: Astronomy.Body.Mars },
  { name: "Jupiter", body: Astronomy.Body.Jupiter },
  { name: "Saturn", body: Astronomy.Body.Saturn },
  { name: "Uranus", body: Astronomy.Body.Uranus },
  { name: "Neptune", body: Astronomy.Body.Neptune },
  { name: "Pluto", body: Astronomy.Body.Pluto },
];

// ---------------------------------------------------------------------------
// Core position calculation
// ---------------------------------------------------------------------------

/**
 * Calculate live planetary positions for a given moment using astronomy-engine.
 *
 * @param date - The moment to compute (defaults to now)
 * @returns Map of planet names to their positions
 */
export function calculateLivePositions(
  date: Date = new Date(),
): Record<string, PlanetPosition> {
  const positions: Record<string, PlanetPosition> = {};
  const astroTime = new Astronomy.AstroTime(date);

  for (const planet of PLANET_BODIES) {
    try {
      let longitude: number;

      if (planet.body === Astronomy.Body.Sun) {
        // Sun = Earth heliocentric longitude + 180
        const earthLong = Astronomy.EclipticLongitude(
          Astronomy.Body.Earth,
          astroTime,
        );
        longitude = (earthLong + 180) % 360;
      } else {
        longitude = Astronomy.EclipticLongitude(planet.body, astroTime);
      }

      const zodiac = longitudeToZodiac(longitude);

      // Retrograde detection (compare with position 2 days prior)
      let isRetrograde = false;
      if (
        planet.body !== Astronomy.Body.Sun &&
        planet.body !== Astronomy.Body.Moon
      ) {
        try {
          const prev = new Astronomy.AstroTime(
            new Date(date.getTime() - 2 * 86_400_000),
          );
          const prevLong = Astronomy.EclipticLongitude(planet.body, prev);
          let diff = longitude - prevLong;
          if (Math.abs(diff) > 180) diff += diff > 0 ? -360 : 360;
          isRetrograde = diff < 0;
        } catch {
          // ignore
        }
      }

      positions[planet.name] = {
        sign: zodiac.sign,
        degree: zodiac.degree,
        minute: zodiac.minute,
        exactLongitude: longitude,
        isRetrograde,
      };
    } catch {
      // If a single planet fails, skip — caller should merge fallback
    }
  }

  return positions;
}

// ---------------------------------------------------------------------------
// Unified snapshot
// ---------------------------------------------------------------------------

/**
 * Build a complete "live sky" snapshot for a given moment.
 *
 * This combines:
 *   - astronomy-engine positions
 *   - ESMS values from PLANETARY_ALCHEMY
 *   - Sectarian elements from PLANETARY_SECTARIAN_ELEMENTS
 *   - Sign qualities from ZODIAC_QUALITIES
 *
 * The result is ready to be consumed by the alchemizer, APIs, and UI.
 *
 * @param date - Moment to evaluate (defaults to now)
 * @param lat  - Optional observer latitude
 * @param lon  - Optional observer longitude
 */
export function getLiveSkySnapshot(
  date: Date = new Date(),
  lat?: number,
  lon?: number,
): LiveSkySnapshot {
  const positions = calculateLivePositions(date);
  const diurnal = isDiurnalSect(date, lat, lon);

  const planets: LivePlanetData[] = [];

  for (const { name } of PLANET_BODIES) {
    const pos = positions[name];
    if (!pos) continue;

    const alchemy =
      PLANETARY_ALCHEMY[name as keyof typeof PLANETARY_ALCHEMY];
    if (!alchemy) continue;

    const signElement: AlchemicalElement =
      SIGN_ELEMENTS[pos.sign] ?? "Air";

    const sectElement = getPlanetarySectElement(name, diurnal);

    const signQuality = getZodiacQuality(pos.sign);

    planets.push({
      name,
      position: pos,
      esms: {
        Spirit: alchemy.Spirit,
        Essence: alchemy.Essence,
        Matter: alchemy.Matter,
        Substance: alchemy.Substance,
      },
      signElement,
      sectElement,
      signQuality,
    });
  }

  return {
    planets,
    positions,
    isDiurnal: diurnal,
    timestamp: date.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Simple position cache (optional, keyed by minute-resolution timestamp)
// ---------------------------------------------------------------------------

const positionCache = new Map<string, Record<string, PlanetPosition>>();
const CACHE_MAX = 128;

/**
 * Cached version of calculateLivePositions.
 * Cache key resolution: 1 minute (planetary positions don't change faster than that).
 */
export function getCachedPositions(
  date: Date = new Date(),
): Record<string, PlanetPosition> {
  // Round to nearest minute for cache key
  const key = new Date(
    Math.floor(date.getTime() / 60_000) * 60_000,
  ).toISOString();

  const cached = positionCache.get(key);
  if (cached) return cached;

  const positions = calculateLivePositions(date);

  // Evict oldest entries if cache is too large
  if (positionCache.size >= CACHE_MAX) {
    const oldest = positionCache.keys().next().value;
    if (oldest) positionCache.delete(oldest);
  }

  positionCache.set(key, positions);
  return positions;
}
