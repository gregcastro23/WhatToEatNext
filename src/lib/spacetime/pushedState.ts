/**
 * Durable "what this device pushed" state for the SpacetimeDB write-mirrors.
 *
 * The planner/cart sync loops only issue *deletes* for keys they themselves
 * pushed. Keeping that map in memory alone meant a device that went offline
 * couldn't recognize remote deletions on its next session (and would
 * resurrect them). Persisting the map per SpacetimeDB identity closes that
 * gap — a tombstone-equivalent without server-side tombstone rows.
 *
 * Each entry records the pushed value-signature plus the push time; deletion
 * application requires the entry to be older than a grace window so an
 * in-flight (or rejected) push is never misread as "deleted remotely".
 */

export interface PushedEntry {
  /** Signature of the value this device last pushed. */
  s: string;
  /** Epoch ms of the push (grace window for in-flight writes). */
  t: number;
}

/** Entries younger than this are never treated as remote deletions. */
export const PUSH_GRACE_MS = 10_000;

export function loadPushedEntries(storageKey: string): Map<string, PushedEntry> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Record<string, PushedEntry>;
    return new Map(
      Object.entries(parsed).filter(
        ([, v]) => v && typeof v.s === "string" && typeof v.t === "number",
      ),
    );
  } catch {
    return new Map();
  }
}

export function savePushedEntries(
  storageKey: string,
  entries: Map<string, PushedEntry>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(Object.fromEntries(entries)),
    );
  } catch {
    // Quota/private-mode failures degrade to session-scoped behavior.
  }
}

/** True when a missing remote row may be applied as a remote deletion. */
export function eligibleForDeletion(entry: PushedEntry | undefined): boolean {
  return entry !== undefined && Date.now() - entry.t > PUSH_GRACE_MS;
}
