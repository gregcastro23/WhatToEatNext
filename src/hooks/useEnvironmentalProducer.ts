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

/**
 * The subset of `/api/environment/lookup`'s response this hook consumes.
 *
 * Declared as `unknown` fields and narrowed below rather than typed as the
 * happy path: it is parsed JSON from a network call, and asserting the shape
 * would convert a runtime surprise into unchecked member access.
 */
interface EnvironmentLookupResponse {
  success?: unknown;
  elevationM?: unknown;
  elevationBasis?: unknown;
  pressureMedianKpa?: unknown;
}

/** Room-condition inputs, all of which are absent until hardware supplies them. */
interface RoomOverrides {
  ambientTempC: number | null;
  relativeHumidityPct: number | null;
  stationPressureKpa: number | null;
}

/** Device GNSS gave us an altitude directly — no lookup needed. */
function readingFromGnss(
  location: UserLocation,
  room: RoomOverrides,
): PublishedObservationState | null {
  if (typeof location.altitude !== "number" || !Number.isFinite(location.altitude)) return null;
  return {
    elevationM: location.altitude,
    elevationProvenance: location.elevationProvenance ?? "gps",
    ...room,
  };
}

/** No GNSS altitude: ask the lookup route, which prefers a stored baseline. */
async function readingFromLookup(
  location: UserLocation,
  room: RoomOverrides,
): Promise<PublishedObservationState | null> {
  const query = `lat=${encodeURIComponent(location.lat)}&lng=${encodeURIComponent(location.lng)}`;
  const res = await fetch(`/api/environment/lookup?${query}`);
  if (!res.ok) return null;

  const data = (await res.json()) as EnvironmentLookupResponse;
  if (data.success !== true || typeof data.elevationM !== "number") return null;

  const basis = typeof data.elevationBasis === "string" ? data.elevationBasis : null;
  const baselinePressure =
    typeof data.pressureMedianKpa === "number" ? data.pressureMedianKpa : null;

  return {
    elevationM: data.elevationM,
    elevationProvenance: location.elevationProvenance ?? elevationBasisToProvenance(basis) ?? "dem",
    ambientTempC: room.ambientTempC,
    relativeHumidityPct: room.relativeHumidityPct,
    stationPressureKpa: room.stationPressureKpa ?? baselinePressure,
  };
}

export function useEnvironmentalProducer(options?: UseEnvironmentalProducerOptions): void {
  const active = options?.active ?? true;
  const enabled = isLiveEnvironmentEnabled();
  const { location: hookLocation } = useUserLocation();
  const location = options?.locationOverride !== undefined ? options.locationOverride : hookLocation;

  const publish = usePublishEnvironmentalObservation();
  const lastPublished = useRef<PublishedObservationState | null>(null);
  const inFlightLookup = useRef<string | null>(null);

  const ambientTempCOverride = options?.ambientTempCOverride;
  const relativeHumidityPctOverride = options?.relativeHumidityPctOverride;
  const stationPressureKpaOverride = options?.stationPressureKpaOverride;

  useEffect(() => {
    if (!active || !enabled || !location) return;

    let cancelled = false;
    // `?? null`, never `?? <plausible constant>`. No sensor means no reading.
    const room: RoomOverrides = {
      ambientTempC: ambientTempCOverride ?? null,
      relativeHumidityPct: relativeHumidityPctOverride ?? null,
      stationPressureKpa: stationPressureKpaOverride ?? null,
    };

    const emit = (next: PublishedObservationState | null): void => {
      if (cancelled || !next) return;
      if (!isMeaningfulChange(lastPublished.current, next)) return;
      lastPublished.current = next;
      publish(next);
    };

    const fromGnss = readingFromGnss(location, room);
    if (fromGnss) {
      emit(fromGnss);
      return;
    }

    // One lookup in flight per coordinate: without this guard a re-render
    // storm would issue a request per render for the same place.
    const cacheKey = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
    if (inFlightLookup.current === cacheKey) return;
    inFlightLookup.current = cacheKey;

    readingFromLookup(location, room)
      .then(emit)
      // Best-effort: a failed lookup costs a card that keeps its manual preset,
      // not a wrong number.
      .catch(() => undefined)
      .finally(() => {
        inFlightLookup.current = null;
      });

    return (): void => {
      cancelled = true;
    };
  }, [
    active,
    enabled,
    location,
    ambientTempCOverride,
    relativeHumidityPctOverride,
    stationPressureKpaOverride,
    publish,
  ]);
}

export default useEnvironmentalProducer;
