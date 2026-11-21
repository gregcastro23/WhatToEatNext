/**
 * Pin-list logic for the Quick Compare drawer, kept apart from
 * `cutComparison.ts` so the always-mounted lab state does not pull the
 * trajectory solver into the route's first-load JS.
 *
 * @file src/lib/butcher/science/comparePins.ts
 */

export const MAX_PINNED_CUTS = 2;

/** Pin list update: toggling a pinned cut unpins it; pinning a third drops the oldest. */
export function togglePinnedCut(pins: readonly string[], cutId: string): readonly string[] {
  if (pins.includes(cutId)) return pins.filter((id) => id !== cutId);
  return [...pins, cutId].slice(-MAX_PINNED_CUTS);
}
