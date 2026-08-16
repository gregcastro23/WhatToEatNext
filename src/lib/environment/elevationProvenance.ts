/**
 * Elevation vocabulary reconciliation between PostgreSQL and SpacetimeDB.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Two subsystems in this repository independently modeled elevation provenance:
 *
 *   1. PostgreSQL `environmental_baselines.elevation_basis` (migration 74):
 *      CHECK (elevation_basis IN ('MEASURED', 'DERIVED', 'COMPUTED', 'ABSENT'))
 *
 *   2. SpacetimeDB `ElevationProvenance` (PR #765):
 *      enum ElevationProvenance { Gps, Dem, Ip, User }
 *
 * Repo convention is NORMALIZE ON READ, ADD SPELLINGS, NEVER RENAME. Neither
 * column's stored values are migrated. This module provides the single
 * authoritative bidirectional mapping between the two vocabularies.
 *
 * ── Semantic Mapping & Basis ────────────────────────────────────────────────
 *
 * | Spacetime Provenance | Postgres Basis | Physical / Methodological Justification |
 * |---|---|---|
 * | `gps` (`Gps`)        | `MEASURED`     | Direct physical GNSS/GPS altimeter reading from the device. |
 * | `user` (`User`)      | `MEASURED`     | Direct human measurement (cook read an altimeter, topo map, or sign). |
 * | `dem` (`Dem`)        | `DERIVED`      | Extracted from a Digital Elevation Model (e.g. Open-Meteo DEM / USGS 3DEP). |
 * | `ip` (`Ip`)          | `COMPUTED`     | Inferred / approximated from a coarse IP geolocation city centroid. |
 * | `null` (no row)      | `ABSENT`       | No elevation data available. |
 *
 * ── Absence Representation ──────────────────────────────────────────────────
 *
 * SpacetimeDB expresses absence by having no `EnvironmentalObservation` row for
 * an identity (or `Option<f32>` where a field is omitted). When mapping from
 * Postgres to Spacetime, `ABSENT` maps to `null` (or no row). When mapping
 * from Spacetime to Postgres, a missing/cleared observation maps to `ABSENT`.
 *
 * @file src/lib/environment/elevationProvenance.ts
 */

import type { ElevationProvenance } from '@/hooks/useEnvironmentalObservation';

/**
 * PostgreSQL `elevation_basis` column values allowed by migration 74.
 */
export type PostgresElevationBasis = 'MEASURED' | 'DERIVED' | 'COMPUTED' | 'ABSENT';

/**
 * Map SpacetimeDB `ElevationProvenance` onto Postgres `elevation_basis`.
 *
 * - `'gps'` / `'user'` → `'MEASURED'` (both represent directly measured physical figures)
 * - `'dem'`            → `'DERIVED'`  (sampled from digital elevation models)
 * - `'ip'`             → `'COMPUTED'` (heuristic calculation from network routing / centroid)
 * - `null` / `undefined` → `'ABSENT'` (no observation available)
 */
export function provenanceToElevationBasis(
  provenance: ElevationProvenance | null | undefined,
): PostgresElevationBasis {
  if (!provenance) return 'ABSENT';

  const normalized = String(provenance).toLowerCase().trim();
  switch (normalized) {
    case 'gps':
    case 'user':
      return 'MEASURED';
    case 'dem':
      return 'DERIVED';
    case 'ip':
      return 'COMPUTED';
    default:
      // Conservative fallback for unknown future spellings
      return 'COMPUTED';
  }
}

/**
 * Accept EITHER vocabulary and return the Postgres one.
 *
 * ⚠️ THE REASON THIS EXISTS IS A SILENT DOWNGRADE.
 *
 * `provenanceToElevationBasis` takes the Spacetime vocabulary and falls through
 * to `'COMPUTED'` for anything it does not recognise — which includes every
 * Postgres basis. `[MEASURED 2026-08-16]` Feeding it a value that was already
 * correct produced:
 *
 *     'MEASURED' -> 'COMPUTED'      'DERIVED' -> 'COMPUTED'
 *
 * The save path did exactly that, via an `as any` that silenced the type error.
 * `/api/environment/lookup` returns `elevationBasis: 'DERIVED'`, so a
 * round-trip through "save my kitchen settings" re-recorded a model-derived
 * elevation as a guessed one — and provenance is precisely what decides whether
 * the UI may print a confident boiling point.
 *
 * A caller holding a value that might be in either vocabulary must use this,
 * not the one-way mapper.
 */
export function normaliseToElevationBasis(
  value: string | null | undefined,
): PostgresElevationBasis | null {
  if (!value) return null;

  const upper = value.toUpperCase().trim();
  if (upper === 'MEASURED' || upper === 'DERIVED' || upper === 'COMPUTED' || upper === 'ABSENT') {
    return upper;
  }

  const lower = value.toLowerCase().trim();
  if (lower === 'gps' || lower === 'user' || lower === 'dem' || lower === 'ip') {
    return provenanceToElevationBasis(lower);
  }

  // Neither vocabulary. Refuse rather than guess: writing a wrong provenance is
  // worse than writing none, because a wrong one is trusted.
  return null;
}

export interface ElevationBasisToProvenanceOptions {
  /**
   * Disambiguation hint when Postgres basis is 'MEASURED'.
   * If true or 'user', maps to 'user'; otherwise defaults to 'gps'.
   */
  preferUser?: boolean;
}

/**
 * Map Postgres `elevation_basis` onto SpacetimeDB `ElevationProvenance`.
 *
 * Normalizes on read (case-insensitive, trims whitespace).
 *
 * - `'MEASURED'` → `'gps'` (or `'user'` if disambiguated via options)
 * - `'DERIVED'`  → `'dem'`
 * - `'COMPUTED'` → `'ip'`
 * - `'ABSENT'`   → `null` (absence on Spacetime is expressed by no row / null)
 */
export function elevationBasisToProvenance(
  basis: string | null | undefined,
  options?: ElevationBasisToProvenanceOptions,
): ElevationProvenance | null {
  if (!basis) return null;

  const normalized = basis.toUpperCase().trim();
  switch (normalized) {
    case 'MEASURED':
      return options?.preferUser ? 'user' : 'gps';
    case 'DERIVED':
      return 'dem';
    case 'COMPUTED':
      return 'ip';
    case 'ABSENT':
      return null;
    default:
      // Unknown spelling on read: fold into conservative 'ip' (untrustworthy) rather than crashing
      return 'ip';
  }
}
