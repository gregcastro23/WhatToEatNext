/**
 * Current Celestial Sky Provider for Vessel Progression
 *
 * Supplies verified, geocentric ecliptic positions of current planetary bodies
 * formatted for `computeVesselProgression`.
 *
 * @file src/lib/vessel/skyProvider.ts
 */

import { getCurrentPlanetaryPositions } from "@/utils/streamlinedPlanetaryPositions";
import { SIGN_ORDER } from "./aspectEngine";

export interface CurrentSkySnapshot {
  asOf: string;
  source: "swiss-ephemeris" | "vsop87-approximation";
  positions: Record<string, { longitude: number }>;
}

let cachedSnapshot: CurrentSkySnapshot | null = null;
let cacheTimestamp = 0;
const SKY_CACHE_TTL_MS = 30_000; // 30 seconds

export function getCurrentSkySnapshot(now = Date.now()): CurrentSkySnapshot {
  if (cachedSnapshot && now - cacheTimestamp < SKY_CACHE_TTL_MS) {
    return {
      ...cachedSnapshot,
      asOf: new Date(now).toISOString(),
    };
  }

  const nowDate = new Date(now);
  const currentPositions = getCurrentPlanetaryPositions();
  const positions: Record<string, { longitude: number }> = {};

  for (const [bodyName, data] of Object.entries(currentPositions)) {
    if (data && typeof data === "object") {
      let lon = data.exactLongitude;
      if (typeof lon !== "number" || !Number.isFinite(lon)) {
        // Fallback to sign + degree
        const signIdx = SIGN_ORDER.findIndex(
          (s) => s.toLowerCase() === (data.sign || "").toLowerCase(),
        );
        if (signIdx >= 0) {
          lon = signIdx * 30 + (data.degree || 0);
        }
      }

      if (typeof lon === "number" && Number.isFinite(lon)) {
        positions[bodyName] = {
          longitude: (((lon % 360) + 360) % 360),
        };
      }
    }
  }

  cachedSnapshot = {
    asOf: nowDate.toISOString(),
    source: "vsop87-approximation",
    positions,
  };
  cacheTimestamp = now;

  return cachedSnapshot;
}

export function clearSkySnapshotCache(): void {
  cachedSnapshot = null;
  cacheTimestamp = 0;
}
