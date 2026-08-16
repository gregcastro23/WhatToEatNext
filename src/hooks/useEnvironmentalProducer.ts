"use client";

/**
 * useEnvironmentalProducer — produces live environmental telemetry and publishes
 * to SpacetimeDB.
 *
 * ── Architecture & Lifecycle ────────────────────────────────────────────────
 *
 * Populates the caller's own `environmental_observation` row in SpacetimeDB:
 *
 *   1. Priority 1 (GNSS): If device GNSS altitude is available from browser
 *      geolocation (`useUserLocation`), uses it directly with provenance `gps`.
 *
 *   2. Priority 2 (DEM / Baseline): If horizontal coordinates (lat, lng) are
 *      known but no GNSS altitude exists, calls `/api/environment/lookup`.
 *      That endpoint checks PostgreSQL `environmental_baselines` first for the
 *      `/geohash5` cell (0 network latency), falling back to Open-Meteo DEM.
 *      Provenance is mapped to `dem`.
 *
 *   3. Priority 3 (Manual / City Search): Location explicitly set by the cook
 *      maps to `user` (or `dem` if coordinates were geocoded).
 *
 *   4. Priority 4 (IP): Coarse IP geolocation centroid maps to `ip`.
 *
 * ── Throttling & Meaningful Change ──────────────────────────────────────────
 *
 * A resend on every render or small GPS drift would hammer the SpacetimeDB
 * reducer. Telemetry is published ONLY on meaningful change:
 *   - Initial observation
 *   - Provenance tag transition (e.g. `ip` → `gps`)
 *   - Vertical elevation delta ≥ 5 metres
 *   - Ambient temperature delta ≥ 0.5 °C
 *   - Relative humidity delta ≥ 2 %
 *   - Station pressure delta ≥ 0.1 kPa
 *
 * @file src/hooks/useEnvironmentalProducer.ts
 */

import { useEffect, useRef } from "react";
import {
  usePublishEnvironmentalObservation,
  type ElevationProvenance,
} from "@/hooks/useEnvironmentalObservation";
import { useUserLocation, type UserLocation } from "@/hooks/useUserLocation";
import { elevationBasisToProvenance } from "@/lib/environment/elevationProvenance";
import { isLiveEnvironmentEnabled } from "@/lib/spacetime/config";

interface PublishedObservationState {
  elevationM: number;
  elevationProvenance: ElevationProvenance;
  /** `null` = nothing measured it. NEVER a stand-in value. */
  ambientTempC: number | null;
  /** `null` = nothing measured it. NEVER a stand-in value. */
  relativeHumidityPct: number | null;
  stationPressureKpa: number | null;
}

/** Thresholds for meaningful change filtering. */
const MEANINGFUL_ELEVATION_DELTA_M = 5.0;
const MEANINGFUL_TEMP_DELTA_C = 0.5;
const MEANINGFUL_HUMIDITY_DELTA_PCT = 2.0;
const MEANINGFUL_PRESSURE_DELTA_KPA = 0.1;

/**
 * ⚠️ THERE ARE NO DEFAULT ROOM CONDITIONS HERE, DELIBERATELY.
 *
 * An earlier revision carried `DEFAULT_AMBIENT_TEMP_C = 21.0` and
 * `DEFAULT_RELATIVE_HUMIDITY_PCT = 50.0` for the case where no sensor exists —
 * which is every case, because nothing in this app supplies one. The result was
 * that every user published two invented constants, and the Humidity panel
 * rendered them beneath the words "● In your kitchen now". A plausible number
 * presented as a measurement is worse than a blank, because a blank prompts a
 * question and a fabrication ends one.
 *
 * If a thermometer or hygrometer is ever wired up, pass it through the override
 * options. Until then these stay `null` and the panel says nothing.
 */

/** Did any field move enough to be worth a reducer call? */
function changedBy(last: number | null, next: number | null, threshold: number): boolean {
  // A transition into or out of "unknown" is always meaningful — it changes
  // what the UI is allowed to claim, not merely by how much.
  if (last === null || next === null) return last !== next;
  return Math.abs(last - next) >= threshold;
}

function isMeaningfulChange(
  last: PublishedObservationState | null,
  next: PublishedObservationState,
): boolean {
  if (!last) return true;
  if (last.elevationProvenance !== next.elevationProvenance) return true;
  if (Math.abs(last.elevationM - next.elevationM) >= MEANINGFUL_ELEVATION_DELTA_M) return true;
  if (changedBy(last.ambientTempC, next.ambientTempC, MEANINGFUL_TEMP_DELTA_C)) return true;
  if (
    changedBy(last.relativeHumidityPct, next.relativeHumidityPct, MEANINGFUL_HUMIDITY_DELTA_PCT)
  ) {
    return true;
  }
  if (changedBy(last.stationPressureKpa, next.stationPressureKpa, MEANINGFUL_PRESSURE_DELTA_KPA)) {
    return true;
  }
  return false;
}

export interface UseEnvironmentalProducerOptions {
  /** Optional override location (defaults to useUserLocation). */
  locationOverride?: UserLocation | null;
  /** Ambient temperature override °C if kitchen thermometer connected. */
  ambientTempCOverride?: number;
  /** Relative humidity override % if kitchen hygrometer connected. */
  relativeHumidityPctOverride?: number;
  /** Station pressure override kPa if hardware barometer connected. */
  stationPressureKpaOverride?: number | null;
  /** Whether the producer is actively polling/publishing. Default: true. */
  active?: boolean;
}

export function useEnvironmentalProducer(options?: UseEnvironmentalProducerOptions) {
  const active = options?.active ?? true;
  const enabled = isLiveEnvironmentEnabled();
  const { location: hookLocation } = useUserLocation();
  const location = options?.locationOverride !== undefined ? options?.locationOverride : hookLocation;

  const publish = usePublishEnvironmentalObservation();
  const lastPublished = useRef<PublishedObservationState | null>(null);
  const inFlightLookup = useRef<string | null>(null);

  useEffect(() => {
    if (!active || !enabled || !location) {
      return;
    }

    let cancelled = false;

    async function resolveAndPublish() {
      if (!location) return;

      // `?? null`, never `?? <plausible constant>`. No sensor means no reading.
      const ambientTempC = options?.ambientTempCOverride ?? null;
      const relativeHumidityPct = options?.relativeHumidityPctOverride ?? null;
      const stationPressureKpa = options?.stationPressureKpaOverride ?? null;

      // 1. GNSS altitude available directly from device
      if (typeof location.altitude === "number" && Number.isFinite(location.altitude)) {
        const next: PublishedObservationState = {
          elevationM: location.altitude,
          elevationProvenance: location.elevationProvenance ?? "gps",
          ambientTempC,
          relativeHumidityPct,
          stationPressureKpa,
        };
        if (isMeaningfulChange(lastPublished.current, next)) {
          lastPublished.current = next;
          publish(next);
        }
        return;
      }

      // 2. DEM / Baseline lookup via /api/environment/lookup
      const cacheKey = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
      if (inFlightLookup.current === cacheKey) return;
      inFlightLookup.current = cacheKey;

      try {
        const res = await fetch(`/api/environment/lookup?lat=${encodeURIComponent(location.lat)}&lng=${encodeURIComponent(location.lng)}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!data.success || typeof data.elevationM !== "number" || cancelled) return;

        const resolvedProvenance: ElevationProvenance =
          location.elevationProvenance ??
          elevationBasisToProvenance(data.elevationBasis) ??
          "dem";

        const next: PublishedObservationState = {
          elevationM: data.elevationM,
          elevationProvenance: resolvedProvenance,
          ambientTempC,
          relativeHumidityPct,
          stationPressureKpa: stationPressureKpa ?? (data.pressureMedianKpa ? Number(data.pressureMedianKpa) : null),
        };

        if (isMeaningfulChange(lastPublished.current, next)) {
          lastPublished.current = next;
          publish(next);
        }
      } catch {
        // Best-effort lookup
      } finally {
        inFlightLookup.current = null;
      }
    }

    void resolveAndPublish();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    enabled,
    location,
    options?.ambientTempCOverride,
    options?.relativeHumidityPctOverride,
    options?.stationPressureKpaOverride,
    publish,
  ]);
}

export default useEnvironmentalProducer;
