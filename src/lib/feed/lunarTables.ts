/**
 * Lunar auto-tables — the communal cook-alongs the sky schedules.
 *
 * A "table" opens around each new and full moon (24h before → 36h after the
 * exact event) with a deterministic key like `full-moon-2026-07-29`. There are
 * NO database rows: the current/next table is pure astronomy (suncalc), the
 * feed renders a pinned strip from this module, and cooked-it posts made while
 * a table is open carry `metadata.tableKey` so the table's thread is just a
 * feed filter. Isomorphic (server + client) and deterministic per timestamp.
 */

import SunCalc from "suncalc";

export interface LunarTable {
  key: string; // e.g. "full-moon-2026-07-29" (UTC date of the exact event)
  kind: "full-moon" | "new-moon";
  title: string; // "Full Moon Feast" | "New Moon Table"
  invitation: string;
  /** Exact astronomical moment of the event. */
  peakAt: Date;
  opensAt: Date;
  closesAt: Date;
  /** True when `now` falls inside the open window. */
  isOpen: boolean;
}

const OPEN_BEFORE_MS = 24 * 60 * 60 * 1000;
const OPEN_AFTER_MS = 36 * 60 * 60 * 1000;

const TITLES: Record<LunarTable["kind"], { title: string; invitation: string }> = {
  "full-moon": {
    title: "Full Moon Feast",
    invitation: "Cook something abundant under the full light — the table is set for everyone beneath it.",
  },
  "new-moon": {
    title: "New Moon Table",
    invitation: "Begin something under the dark sky — simple dishes, new intentions, shared quietly.",
  },
};

/**
 * Find the exact moment the moon phase crosses `target` (0 = new, 0.5 = full),
 * scanning hourly then bisecting to the minute.
 */
function findPhaseCrossing(from: Date, target: 0 | 0.5, horizonDays: number): Date | null {
  const HOUR = 60 * 60 * 1000;
  // Signed distance from target in phase space (wraps at 1).
  const dist = (d: Date) => {
    const p = SunCalc.getMoonIllumination(d).phase;
    let delta = p - target;
    if (delta > 0.5) delta -= 1;
    if (delta < -0.5) delta += 1;
    return delta;
  };

  let prev = from;
  let prevDist = dist(prev);
  for (let h = 1; h <= horizonDays * 24; h++) {
    const cur = new Date(from.getTime() + h * HOUR);
    const curDist = dist(cur);
    // Crossing: distance flips sign from negative (approaching) to positive (past).
    if (prevDist < 0 && curDist >= 0) {
      let lo = prev.getTime();
      let hi = cur.getTime();
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (dist(new Date(mid)) < 0) lo = mid;
        else hi = mid;
      }
      return new Date(hi);
    }
    prev = cur;
    prevDist = curDist;
  }
  return null;
}

function toTable(kind: LunarTable["kind"], peakAt: Date, now: Date): LunarTable {
  const opensAt = new Date(peakAt.getTime() - OPEN_BEFORE_MS);
  const closesAt = new Date(peakAt.getTime() + OPEN_AFTER_MS);
  const dateKey = peakAt.toISOString().slice(0, 10);
  return {
    key: `${kind}-${dateKey}`,
    kind,
    ...TITLES[kind],
    peakAt,
    opensAt,
    closesAt,
    isOpen: now >= opensAt && now <= closesAt,
  };
}

/**
 * The currently-open table, or the next one on the calendar. Starts the scan
 * slightly in the past so a table whose peak just passed (still inside its
 * open window) is found.
 */
export function nextLunarTable(now = new Date()): LunarTable | null {
  const scanFrom = new Date(now.getTime() - OPEN_AFTER_MS);
  const candidates: LunarTable[] = [];
  const full = findPhaseCrossing(scanFrom, 0.5, 35);
  if (full) candidates.push(toTable("full-moon", full, now));
  const newMoon = findPhaseCrossing(scanFrom, 0, 35);
  if (newMoon) candidates.push(toTable("new-moon", newMoon, now));
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.peakAt.getTime() - b.peakAt.getTime());
  // Prefer an open table; otherwise the soonest upcoming one.
  return candidates.find((t) => t.isOpen) ?? candidates.find((t) => t.peakAt.getTime() >= now.getTime()) ?? candidates[0];
}
