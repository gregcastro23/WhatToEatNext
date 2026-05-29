/**
 * Degraded-data signalling.
 *
 * Several calculation paths fall back to interpolated or static data when the
 * live source (Swiss-Ephemeris backend, astronomy-engine, or the monica math)
 * can't produce a real value. Historically those fallbacks were silent — the
 * payload looked identical to live data. `DegradedInfo` makes them observable:
 * a result carries it only when something fell back, so consumers (and the
 * /quantities UI) can warn instead of presenting stale numbers as live.
 */

export type DegradedReason =
  /** Live ephemeris failed; the static `getFallbackPlanetaryPositions()` was used. */
  | "astronomy-engine-fallback"
  /** Positions were interpolated from a fixed reference date (drift grows over time). */
  | "stale-positions"
  /** Monica couldn't be computed and stayed at its degenerate 1.0 default. */
  | "monica-degenerate";

export interface DegradedInfo {
  /** One or more machine-readable reasons, in discovery order. Presence ⇒ degraded. */
  reasons: DegradedReason[];
}

/**
 * Merge optional degraded signals into one. Reasons are de-duplicated while
 * preserving first-seen order. Returns `null` when nothing is degraded, so the
 * field can be omitted from healthy payloads.
 */
export function mergeDegraded(
  ...parts: Array<DegradedInfo | null | undefined>
): DegradedInfo | null {
  const reasons: DegradedReason[] = [];
  for (const part of parts) {
    if (!part) continue;
    for (const reason of part.reasons) {
      if (!reasons.includes(reason)) reasons.push(reason);
    }
  }
  return reasons.length > 0 ? { reasons } : null;
}
