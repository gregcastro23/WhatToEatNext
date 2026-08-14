/**
 * Open-Meteo client for the environmental ingestion layer.
 *
 * Keyless, matching the OpenStreetMap/Overpass precedent already used for
 * restaurant lookup. Three endpoints:
 *
 *   forecast   live hourly sampling
 *   archive    ERA5 reanalysis, used once per location to seed the window
 *   elevation  90 m DEM, the full-fidelity elevation this engine depends on
 *
 * ── The one field that matters ──────────────────────────────────────────────
 *
 * `surface_pressure`, never `pressure_msl`. `[MEASURED 2026-07-30]` for Denver
 * (39.7392, −104.9903, elevation 1599 m) at the same timestamp:
 *
 *     surface_pressure   840.4 hPa  →  boiling point 94.9 °C
 *     pressure_msl      1006.0 hPa  →  boiling point 99.8 °C
 *
 * Sea-level-adjusted pressure has the altitude signal removed by construction,
 * so reading it produces a 4.9 °C error that looks entirely plausible and is
 * wrong everywhere except the coast. `assertStationPressure` below exists solely
 * to make that mistake impossible to ship silently.
 *
 * @file src/lib/environment/openMeteoClient.ts
 */

import { isPlausibleStationPressure } from "./isa";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const ELEVATION_URL = "https://api.open-meteo.com/v1/elevation";

/**
 * ERA5 reanalysis lags real time by roughly five days. Seeding a window that
 * runs right up to today would silently return short.
 */
export const ARCHIVE_LAG_DAYS = 6;

const REQUEST_TIMEOUT_MS = 15_000;

/** `[MEASURED 2026-07-30]` Open-Meteo reports pressure in hPa; this engine stores kPa. */
const HPA_TO_KPA = 0.1;

export interface EnvironmentSample {
  observedAt: Date;
  surfacePressureKpa: number;
  dewPointC: number;
  airTempC: number;
  source: "forecast" | "archive";
}

/**
 * Field names mirror Open-Meteo's wire format exactly and must not be
 * camelCased — they are the API's keys, not ours.
 */
interface OpenMeteoHourlyResponse {
  elevation?: number;
  hourly?: {
    time?: string[];
    surface_pressure?: Array<number | null>;
    dew_point_2m?: Array<number | null>;
    temperature_2m?: Array<number | null>;
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Open-Meteo responded ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Reject a reading that cannot be station pressure at this elevation.
 *
 * Throws rather than clamping or defaulting. A wrong-field ingestion is not a
 * degraded reading to be smoothed over — it is a value that would poison every
 * baseline computed from it, and it must fail loudly at the boundary.
 */
export function assertStationPressure(pressureKpa: number, elevationM: number): void {
  if (!isPlausibleStationPressure(pressureKpa, elevationM)) {
    throw new Error(
      `Refusing pressure ${pressureKpa.toFixed(2)} kPa at elevation ${elevationM} m: ` +
        `implausible as station pressure. This is the signature of reading ` +
        `pressure_msl instead of surface_pressure.`,
    );
  }
}

/**
 * Zip Open-Meteo's parallel arrays into samples, dropping any hour with a null
 * in any required field.
 *
 * Nulls are dropped rather than interpolated or zero-filled. A fabricated 0 kPa
 * would sail through as a real observation and wreck the window's median.
 */
function toSamples(
  payload: OpenMeteoHourlyResponse,
  elevationM: number,
  source: "forecast" | "archive",
): EnvironmentSample[] {
  const { hourly } = payload;
  if (!hourly?.time?.length) return [];

  // Renamed on destructure: the wire keys are snake_case, our locals are not.
  const {
    time,
    surface_pressure: surfacePressureSeries,
    dew_point_2m: dewPointSeries,
    temperature_2m: airTempSeries,
  } = hourly;
  if (!surfacePressureSeries || !dewPointSeries || !airTempSeries) {
    throw new Error(
      "Open-Meteo response is missing a required hourly field " +
        "(surface_pressure, dew_point_2m, temperature_2m)",
    );
  }

  const samples: EnvironmentSample[] = [];
  for (let i = 0; i < time.length; i++) {
    const pressureHpa = surfacePressureSeries[i];
    const dewPoint = dewPointSeries[i];
    const airTemp = airTempSeries[i];
    if (pressureHpa == null || dewPoint == null || airTemp == null) continue;

    const surfacePressureKpa = pressureHpa * HPA_TO_KPA;
    assertStationPressure(surfacePressureKpa, elevationM);

    samples.push({
      // Open-Meteo hourly timestamps are UTC when no timezone is requested.
      observedAt: new Date(`${time[i]}Z`),
      surfacePressureKpa,
      dewPointC: dewPoint,
      airTempC: airTemp,
      source,
    });
  }
  return samples;
}

/**
 * Full-fidelity DEM elevation for a coordinate.
 *
 * Deliberately separate from the weather call: the weather cache is keyed at
 * geohash p5 (~5 km), which is far too coarse for elevation in mountainous
 * terrain, and elevation is the dominant term in the entire engine.
 */
export async function fetchElevation(latitude: number, longitude: number): Promise<number> {
  const url = `${ELEVATION_URL}?latitude=${latitude}&longitude=${longitude}`;
  const payload = await fetchJson<{ elevation?: number[] }>(url);
  const elevation = payload.elevation?.[0];
  if (elevation == null || !Number.isFinite(elevation)) {
    throw new Error(`Open-Meteo elevation lookup returned no value for ${latitude},${longitude}`);
  }
  return elevation;
}

/** Live hourly readings for the current day. */
export async function fetchForecastSamples(
  latitude: number,
  longitude: number,
  elevationM: number,
): Promise<EnvironmentSample[]> {
  const url =
    `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&hourly=surface_pressure,dew_point_2m,temperature_2m&forecast_days=1`;
  const payload = await fetchJson<OpenMeteoHourlyResponse>(url);
  return toSamples(payload, elevationM, "forecast");
}

/**
 * ERA5 reanalysis over a date range, used once per location to seed the window.
 *
 * This is what makes a location's anomalies valid on day one instead of after a
 * month of waiting — the same trailing-30d robust statistic, with the window
 * filled rather than accumulated.
 *
 * @param startDate ISO date, YYYY-MM-DD.
 * @param endDate ISO date, YYYY-MM-DD. Must respect ARCHIVE_LAG_DAYS.
 */
export async function fetchArchiveSamples(
  latitude: number,
  longitude: number,
  elevationM: number,
  startDate: string,
  endDate: string,
): Promise<EnvironmentSample[]> {
  const url =
    `${ARCHIVE_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${startDate}&end_date=${endDate}` +
    `&hourly=surface_pressure,dew_point_2m,temperature_2m`;
  const payload = await fetchJson<OpenMeteoHourlyResponse>(url);
  return toSamples(payload, elevationM, "archive");
}

/**
 * Reduce hourly samples to one reading per UTC day, taken at a fixed hour.
 *
 * Sampling the same hour each day keeps the semidiurnal atmospheric tide
 * (~1–2 hPa, a real periodic signal) out of the window's dispersion. Averaging
 * whole days would also remove it, but would flatten the genuine synoptic peaks
 * this engine exists to detect.
 *
 * When the target hour is missing for a day, the nearest available hour is used
 * rather than dropping the day — a gap costs more than a couple of hours of tide.
 */
export function reduceToDailyAtHour(
  samples: readonly EnvironmentSample[],
  targetUtcHour: number,
): EnvironmentSample[] {
  const byDay = new Map<string, EnvironmentSample>();

  for (const sample of samples) {
    const dayKey = sample.observedAt.toISOString().slice(0, 10);
    const existing = byDay.get(dayKey);
    if (!existing) {
      byDay.set(dayKey, sample);
      continue;
    }
    const distance = Math.abs(sample.observedAt.getUTCHours() - targetUtcHour);
    const existingDistance = Math.abs(existing.observedAt.getUTCHours() - targetUtcHour);
    if (distance < existingDistance) byDay.set(dayKey, sample);
  }

  return [...byDay.values()].sort(
    (a, b) => a.observedAt.getTime() - b.observedAt.getTime(),
  );
}
