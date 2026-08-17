/**
 * Admin kit — the provenance contract.
 *
 * Every admin service already returns a `live: boolean` alongside its data,
 * but "not live" collapses several genuinely different situations that an
 * operator must be able to tell apart:
 *
 *   - the query ran and the answer really is zero
 *   - the query failed, so we have no answer at all
 *   - the answer is real but was measured a while ago
 *   - the thing being measured has no instrumentation, so no answer can exist
 *
 * The audit found ~25 hand-written `● LIVE` literals across the admin using
 * seven different words for the false case, and panels routinely rendering a
 * failed query as a confident `0`. This module is the single vocabulary that
 * replaces them.
 *
 * @file src/components/admin/kit/provenance.ts
 */

export type ProvenanceState =
  /** A source was read successfully and the value is current. */
  | "live"
  /** Real data, but older than the panel's freshness expectation. */
  | "stale"
  /** The read failed. There is NO value — never render this as a zero. */
  | "no-source"
  /** Nothing writes this signal, so no value can ever exist. */
  | "not-instrumented"
  /** Some sources answered and some did not. */
  | "partial";

export interface Provenance {
  state: ProvenanceState;
  /** Age of the underlying measurement, when known. Drives the STALE label. */
  ageMs?: number;
  /** For `partial`: how many sources answered out of how many. */
  ok?: number;
  total?: number;
  /** Optional operator-facing reason, e.g. "auth_events query failed". */
  detail?: string;
}

/** Whether a value exists at all. `false` means render an em-dash, not a 0. */
export function hasValue(p: Provenance): boolean {
  return p.state === "live" || p.state === "stale" || p.state === "partial";
}

export const PROVENANCE_LABEL: Record<ProvenanceState, string> = {
  live: "LIVE",
  stale: "STALE",
  "no-source": "NO SOURCE",
  "not-instrumented": "NOT INSTRUMENTED",
  partial: "PARTIAL",
};

/**
 * Map a service's `live` flag onto a provenance value.
 *
 * `live: true` with zero rows is a *measured* empty result and stays `live` —
 * that is a real zero and callers may render it as one. Only a failed read
 * becomes `no-source`.
 */
export function fromLiveFlag(
  live: boolean,
  options: { ageMs?: number; staleAfterMs?: number; detail?: string } = {},
): Provenance {
  if (!live) {
    return { state: "no-source", detail: options.detail };
  }
  const { ageMs, staleAfterMs } = options;
  if (
    typeof ageMs === "number" &&
    typeof staleAfterMs === "number" &&
    ageMs > staleAfterMs
  ) {
    return { state: "stale", ageMs, detail: options.detail };
  }
  return { state: "live", ageMs, detail: options.detail };
}

/**
 * Combine several sources into one verdict for a panel that merges them.
 * All good → live. None good → no-source. Otherwise → partial, carrying the
 * counts so the badge can say "3 of 5".
 */
export function combine(sources: Provenance[]): Provenance {
  if (sources.length === 0) return { state: "no-source" };
  const ok = sources.filter(hasValue).length;
  if (ok === sources.length) {
    return sources.some((s) => s.state === "stale")
      ? { state: "stale" }
      : { state: "live" };
  }
  if (ok === 0) return { state: "no-source" };
  return { state: "partial", ok, total: sources.length };
}

/** "4m", "2h", "3d" — compact age for the STALE badge. */
export function formatAge(ageMs: number): string {
  const s = Math.max(0, Math.floor(ageMs / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
