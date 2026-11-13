/**
 * Wire parser for `GET /api/alchm-quantities/aspects` as `PlanetaryAspectsDisplay`
 * reads it.
 *
 * Producer: `src/app/api/alchm-quantities/aspects/route.ts`.
 *   - Success: `NextResponse.json({ aspects, timestamp })` (route.ts:199-202),
 *     `timestamp` being `new Date().toISOString()`.
 *   - Every row field is set by the `result.push` block (route.ts:173-191),
 *     including the four placement fields `sign1` / `degree1` / `sign2` /
 *     `degree2` (route.ts:179-182) and an `influence` that is always one of the
 *     three literals (route.ts:161-168). `daysToExact` is capped at 9999 for a
 *     stationary pair (`src/utils/aspectKinematics.ts:96-97`), so the producer's
 *     value is finite; the parser enforces that rather than assuming it.
 *   - The `{ error, details }` 500 (route.ts:206-209) and the `rateLimit()`
 *     refusal (route.ts:63-64) are non-2xx. The host throws on `!res.ok` before
 *     it parses, so neither reaches this parser.
 *
 * What the host reads: per row `planet1`, `planet2`, `type`, `aspectAngle`,
 * `orbDegrees`, `strength`, `applying`, `daysToExact`, and the placement fields
 * (defaulted with `?? ""` / `?? 0` in `openCouncil`); per body `aspects` and
 * `timestamp`. Only those are validated. The kinematics fields
 * (`orbVelocity`, `relativeAngularVelocity`, `state`, `velocitySource`) are
 * never read, so drift in them cannot reject a row.
 *
 * Failure contract (inside the host's existing try/catch):
 *   - a body that is not a JSON object, an `aspects` that is not an array, or a
 *     `timestamp` that is not a string THROWS, so drift surfaces as the host's
 *     error state rather than as "No major aspects";
 *   - an empty `aspects: []` is a valid empty result;
 *   - a row whose read fields have the wrong type is dropped, but if rows
 *     arrived and NONE matched, that throws as well. Every number must be finite
 *     (`1e999` parses to Infinity), so a non-finite one drops the row too;
 *   - the placement fields may be ABSENT (the host defaults them), but a PRESENT
 *     value of the wrong type (JSON `null` included) drops the row, because
 *     defaulting it would open the council chat on the wrong degree agent;
 *   - `influence` is never read by the host, so a bad one does not reject the
 *     row: it is kept only when it is one of the three literals.
 *
 * Client-safe: imports only `@/lib/api/json`.
 *
 * @file src/components/planetaryAspectsParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";

export type AspectInfluence = "harmonious" | "challenging" | "neutral";

export interface AspectEntry {
  planet1: string;
  planet2: string;
  type: string;
  aspectAngle: number;
  orbDegrees: number;
  strength: number;
  applying: boolean;
  daysToExact: number;
  /** Kept only when it is one of the three literals; the host never reads it. */
  influence?: AspectInfluence;
  // Per-planet placement (from the aspects API) for building degree-agent ids.
  sign1?: string;
  degree1?: number;
  sign2?: string;
  degree2?: number;
}

export interface AspectsData {
  aspects: AspectEntry[];
  timestamp: string;
}

function isAspectInfluence(value: unknown): value is AspectInfluence {
  return value === "harmonious" || value === "challenging" || value === "neutral";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

/** JSON cannot carry NaN/Infinity, but `1e999` parses to Infinity. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || isFiniteNumber(value);
}

/** A row in the producer's shape, or `undefined` when a field the host reads is mistyped. */
function parseRow(value: unknown): AspectEntry | undefined {
  if (!isJsonRecord(value)) return undefined;
  const { planet1, planet2, type, aspectAngle, orbDegrees, strength } = value;
  const { applying, daysToExact, influence, sign1, degree1, sign2, degree2 } = value;
  if (typeof planet1 !== "string" || typeof planet2 !== "string") return undefined;
  if (typeof type !== "string" || typeof applying !== "boolean") return undefined;
  if (!isFiniteNumber(aspectAngle) || !isFiniteNumber(orbDegrees)) return undefined;
  if (!isFiniteNumber(strength) || !isFiniteNumber(daysToExact)) return undefined;
  if (!isOptionalString(sign1) || !isOptionalString(sign2)) return undefined;
  if (!isOptionalNumber(degree1) || !isOptionalNumber(degree2)) return undefined;
  return {
    planet1,
    planet2,
    type,
    aspectAngle,
    orbDegrees,
    strength,
    applying,
    daysToExact,
    ...(isAspectInfluence(influence) ? { influence } : {}),
    ...(sign1 !== undefined ? { sign1 } : {}),
    ...(degree1 !== undefined ? { degree1 } : {}),
    ...(sign2 !== undefined ? { sign2 } : {}),
    ...(degree2 !== undefined ? { degree2 } : {}),
  };
}

function parseRows(raw: unknown): AspectEntry[] {
  if (!Array.isArray(raw)) {
    throw new TypeError("Aspects response had no aspects array");
  }
  const list: readonly unknown[] = raw;
  const rows: AspectEntry[] = [];
  for (const item of list) {
    const row = parseRow(item);
    if (row) rows.push(row);
  }
  if (list.length > 0 && rows.length === 0) {
    throw new TypeError("No aspect in the response matched the expected shape");
  }
  return rows;
}

/** `parse` for `readJson`. */
export function parseAspectsResponse(value: unknown): AspectsData {
  if (!isJsonRecord(value)) {
    throw new TypeError("Aspects response was not a JSON object");
  }
  const aspects = parseRows(value.aspects);
  const { timestamp } = value;
  if (typeof timestamp !== "string") {
    throw new TypeError("Aspects response had no timestamp string");
  }
  return { aspects, timestamp };
}
