"use client";

/**
 * useEnvironmentalObservation — live environmental telemetry for the cooking
 * method cards.
 *
 * Subscribes to the caller's own `environmental_observation` row and returns
 * elevation, ambient temperature, relative humidity and (optionally) a measured
 * station pressure. Follows the same shape as the five other subscribing
 * surfaces in this codebase: `.subscriptionBuilder().onApplied(refresh)
 * .subscribe([...])` plus `onInsert`/`onUpdate`/`onDelete`.
 *
 * ── What this data is allowed to touch ──────────────────────────────────────
 *
 * ⚠️ ARCHITECTURAL GUARDRAIL, not a style preference:
 *
 *   elevation + station pressure  →  the water ceiling, therefore `mediumC`
 *                                    and the reference core time. Real physics,
 *                                    real numbers, golden-vectored.
 *   ambient temperature + RH      →  PANEL TEXT ONLY — the evaporative ceiling
 *                                    and browning-onset copy.
 *
 * Humidity is deliberately NOT routed into the convection particle simulation.
 * That engine solves buoyancy, drag and Newton cooling; not one of those terms
 * takes a humidity argument. Animating particles on humidity would look
 * responsive and mean nothing — a fabricated behaviour wearing the costume of
 * physics. If humidity is ever to move a particle, it does so by first
 * appearing in the thermo-core equations with a citation and a golden vector,
 * not by being multiplied into a velocity because the number was available.
 *
 * ── Availability ────────────────────────────────────────────────────────────
 *
 * Returns `null` whenever there is no live reading — flag off, disconnected,
 * or simply no row yet. `null` means "we do not know where you are", and the
 * caller's correct response is to fall back to its manual elevation preset,
 * NOT to assume sea level. Those are different claims and the type keeps them
 * distinguishable.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { isLiveEnvironmentEnabled } from "@/lib/spacetime/config";
import type { EnvironmentalObservation as StdbObservationRow } from "@/lib/spacetime/generated/types";

/**
 * How a client came to believe its own elevation — see the Rust
 * `ElevationProvenance` doc comment for the measured error budget.
 */
export type ElevationProvenance = "gps" | "dem" | "ip" | "user";

/**
 * Vertical error a source is trusted to, metres. Used to decide whether the UI
 * may present a derived boiling point as a figure or must hedge it.
 *
 * `[BASIS]` GNSS vertical error is roughly 2× its horizontal error; DEM lookup
 * error is the model's own grid resolution; IP geolocation resolves to a city
 * centroid, which in mountain terrain is not an error bar at all but a
 * systematic offset. At ~0.34 °C per 100 m, only the last one is large enough
 * to change what a cook should do.
 */
export const PROVENANCE_VERTICAL_ERROR_M: Readonly<Record<ElevationProvenance, number>> = {
  user: 0,
  dem: 15,
  gps: 30,
  ip: 1000,
};

/** Above this the elevation is too soft to quote a boiling point from. */
const TRUSTWORTHY_VERTICAL_ERROR_M = 100;

export interface EnvironmentalReading {
  elevationM: number;
  elevationProvenance: ElevationProvenance;
  /** Vertical error attributed to the provenance, metres. */
  elevationErrorM: number;
  /**
   * False when the elevation is too coarse to derive a cooking number from —
   * currently IP geolocation only. A card reading this should present the
   * elevation as approximate and offer the manual picker rather than printing
   * a confident local boiling point.
   */
  elevationTrustworthy: boolean;
  /**
   * Measured room air temperature, °C, or `null` when nothing measured it.
   *
   * ⚠️ `null` must render as absence, never as a substituted figure. A previous
   * producer filled these with `21 °C` / `50 %` when no sensor existed, and the
   * panel presented the constants as a live reading of the user's kitchen.
   */
  ambientTempC: number | null;
  /** Measured relative humidity, %, or `null` when nothing measured it. */
  relativeHumidityPct: number | null;
  /**
   * Measured absolute station pressure, kPa, or null when the client has no
   * barometer. Null is NOT sea level — readers fall back to the ISA pressure
   * implied by `elevationM`.
   */
  stationPressureKpa: number | null;
  updatedAtMs: number;
}

const PROVENANCE_TAGS: readonly ElevationProvenance[] = ["gps", "dem", "ip", "user"];

/**
 * Map the generated sum-type tag onto our lowercase union.
 *
 * The binding emits `{ tag: "Gps" }`. An unrecognised tag means the module
 * grew a provenance this client does not know, and the honest answer is the
 * most conservative one — treat it as untrustworthy rather than silently
 * folding it into `gps`.
 */
function readProvenance(value: StdbObservationRow["elevationProvenance"]): ElevationProvenance {
  const tag = (value as { tag?: string } | undefined)?.tag?.toLowerCase();
  return PROVENANCE_TAGS.find((known) => known === tag) ?? "ip";
}

/**
 * Normalise a wire value to `number | null`, treating NaN as absence.
 *
 * NaN is the absence sentinel for `ambient_temp_c` / `relative_humidity_pct`,
 * forced by a blocked schema migration. It is a genuinely sound choice for
 * "not a number", but it is silent: `NaN ?? 0` is NaN, `NaN > 5` is false, and
 * `NaN.toFixed(0)` is the string "NaN" — so it must be converted once, at the
 * boundary, rather than guarded at each of the places that read it.
 */
function finiteOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapObservation(row: StdbObservationRow): EnvironmentalReading {
  const elevationProvenance = readProvenance(row.elevationProvenance);
  const elevationErrorM = PROVENANCE_VERTICAL_ERROR_M[elevationProvenance];

  return {
    elevationM: row.elevationM,
    elevationProvenance,
    elevationErrorM,
    elevationTrustworthy: elevationErrorM <= TRUSTWORTHY_VERTICAL_ERROR_M,
    // `finiteOrNull`, NOT `?? null`: these two arrive as a required f32 whose
    // absence sentinel is NaN (the `Option` migration is blocked — see the
    // field docs in `live_tables.rs`). `??` only catches null/undefined and
    // would sail straight past NaN, handing the panel a value that formats as
    // "NaN°F". Normalising here is what lets every downstream reader treat
    // these as an ordinary `number | null`.
    ambientTempC: finiteOrNull(row.ambientTempC),
    relativeHumidityPct: finiteOrNull(row.relativeHumidityPct),
    stationPressureKpa: finiteOrNull(row.stationPressureKpa),
    updatedAtMs: Number(row.updatedAt.toDate().getTime()),
  };
}

export function useEnvironmentalObservation(active = true): EnvironmentalReading | null {
  const { connection, status, identityHex } = useSpacetime();
  const enabled = isLiveEnvironmentEnabled();
  const [row, setRow] = useState<StdbObservationRow | null>(null);

  useEffect(() => {
    if (!enabled || !active || status !== "connected" || !connection || !identityHex) {
      setRow(null);
      return;
    }

    const refresh = (): void => {
      try {
        // The table is `public` for reads (SpacetimeDB 2.x leaves
        // client_visibility_filter unenforced), so filter by identity here —
        // the same thing GroceryCartContext does with its own rows.
        const mine = [...connection.db.environmental_observation.iter()].find(
          (candidate) => candidate.owner.toHexString() === identityHex,
        );
        setRow(mine ?? null);
      } catch {
        // Raced a disconnect; the status change clears state.
      }
    };

    const subscription = connection
      .subscriptionBuilder()
      .onApplied(refresh)
      .subscribe(["SELECT * FROM environmental_observation"]);

    connection.db.environmental_observation.onInsert(refresh);
    connection.db.environmental_observation.onUpdate(refresh);
    connection.db.environmental_observation.onDelete(refresh);

    return (): void => {
      try {
        connection.db.environmental_observation.removeOnInsert(refresh);
        connection.db.environmental_observation.removeOnUpdate(refresh);
        connection.db.environmental_observation.removeOnDelete(refresh);
        subscription.unsubscribe();
      } catch {
        // Already torn down with the connection.
      }
    };
  }, [connection, status, enabled, active, identityHex]);

  return useMemo(() => (row ? mapObservation(row) : null), [row]);
}

/**
 * Publish this client's environment. Returns a no-op when the flag is off or
 * the connection is down, so callers need no branch of their own.
 *
 * Nothing here is durable: this is the ephemeral live-sync surface. Anything
 * that must survive the session — a saved kitchen elevation, a permanently
 * adjusted recipe core time — is written to Postgres through the `pg` driver
 * on the server side, never inferred from these rows.
 */
export function usePublishEnvironmentalObservation(): (
  reading: Omit<
    EnvironmentalReading,
    "elevationErrorM" | "elevationTrustworthy" | "updatedAtMs"
  >,
) => void {
  const { connection, status } = useSpacetime();
  const enabled = isLiveEnvironmentEnabled();

  return useCallback(
    (reading) => {
      if (!enabled || status !== "connected" || !connection) return;
      // Best-effort: a dropped publish costs a stale card, not a wrong number,
      // and the next reading re-sends. Swallowing the rejection here is why
      // callers need no error branch.
      connection.reducers
        .upsertEnvironmentalObservation({
          elevationM: reading.elevationM,
          elevationProvenance: { tag: PROVENANCE_TAG_BY_VALUE[reading.elevationProvenance] },
          // NaN on the way out is the same sentinel the reader normalises on
          // the way in — the reducer accepts it for these two fields only.
          ambientTempC: reading.ambientTempC ?? Number.NaN,
          relativeHumidityPct: reading.relativeHumidityPct ?? Number.NaN,
          stationPressureKpa: reading.stationPressureKpa ?? undefined,
        })
        .catch(() => undefined);
    },
    [connection, status, enabled],
  );
}

/**
 * `"gps"` → `"Gps"`, matching the generated sum-type tags.
 *
 * An explicit table rather than a `charAt(0).toUpperCase()` trick: the return
 * type is the generated union, so if the module ever adds a variant this stops
 * compiling instead of shipping a string the module will reject at runtime.
 */
const PROVENANCE_TAG_BY_VALUE: Readonly<
  Record<ElevationProvenance, StdbObservationRow["elevationProvenance"]["tag"]>
> = {
  gps: "Gps",
  dem: "Dem",
  ip: "Ip",
  user: "User",
};
