/**
 * IANA zone primitives — validation and the wall-clock ↔ instant conversion.
 *
 * Split out from `birthTimezone.ts` for one reason: everything here runs on
 * `Intl` alone, with no dependencies, so client components (the onboarding
 * wizard's timezone field) can validate a zone without pulling the ~150KB
 * tz boundary raster that `resolveBirthZone` needs into the browser bundle.
 *
 * `birthTimezone.ts` re-exports all of it, so server callers have one import.
 */

/**
 * Does the runtime accept this as an IANA zone? The only honest validator —
 * hand-maintained allowlists go stale every time tzdata splits a zone.
 *
 * Note `Etc/GMT+5` IS valid IANA (and, confusingly, means UTC−5), while a bare
 * `UTC-5` is not. That distinction is the whole point: `UTC±N` is the shape the
 * retired `estimateTimezone` emitted, and it must not validate.
 */
export function isIanaZone(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Matches the `UTC±N` / `GMT±N` shapes the old `estimateTimezone` emitted. */
const RAW_OFFSET_RE = /^(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/i;

/**
 * Minutes east of UTC for a raw `UTC±N` string, or null if it is not one.
 *
 * Exists to REPORT what a legacy string claimed, never to act on it — see the
 * ruling in `birthTimezone.ts`. Both prod rows spelled `UTC-5` are EDT births
 * whose true offset is −240, so acting on the parsed −300 would bake in the bug.
 */
export function parseRawOffsetMinutes(value: string): number | null {
  const m = RAW_OFFSET_RE.exec(value.trim());
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  const hours = Number(m[2]);
  const minutes = m[3] ? Number(m[3]) : 0;
  if (hours > 14 || minutes > 59) return null;
  return sign * (hours * 60 + minutes);
}

/**
 * Offset of `zone` at absolute instant `at`, in minutes east of UTC.
 *
 * Reads the zone's real tzdata rules, so it returns −240 for New York in July
 * and −300 in January. This is why the two `UTC-5` rows resolve to −4.
 */
export function zoneOffsetMinutes(zone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);

  const p: Record<string, string> = {};
  for (const part of parts) p[part.type] = part.value;

  const asIfUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
  );
  return Math.round((asIfUtc - at.getTime()) / 60_000);
}

/** The wall clock in `zone` at `at`, expressed as UTC-labelled milliseconds. */
function wallClockMsAt(zone: string, at: Date): number {
  return at.getTime() + zoneOffsetMinutes(zone, at) * 60_000;
}

export type WallClockResolution =
  /** Exactly one instant maps to this wall clock. */
  | "UNIQUE"
  /** DST fall-back overlap: two instants match. The EARLIER is returned. */
  | "AMBIGUOUS"
  /** DST spring-forward gap: this wall clock never happened. */
  | "NONEXISTENT";

export interface InstantResolution {
  instant: Date;
  resolution: WallClockResolution;
  offsetMinutes: number;
}

/**
 * Interpret a UTC-LABELLED wall clock as local time in `zone` and return the
 * absolute instant.
 *
 * `wallLabelledUtc` is the value as stored: `1991-06-23T14:24:00.000Z` meaning
 * "14:24 on the wall", not "14:24 UTC". Returns 1991-06-23T18:24:00Z.
 *
 * DST edges are DETECTED, not papered over, because a silent pick is how an hour
 * goes missing without any check failing:
 *
 *   - AMBIGUOUS (clocks went back; the wall time occurred twice) — the earlier
 *     instant is returned, matching the usual civil reading of the first pass.
 *   - NONEXISTENT (clocks sprang forward; the wall time never occurred) — the
 *     instant is resolved with the post-transition offset, landing just past the
 *     gap. The caller is told, so it can refuse or flag the row.
 */
export function wallClockToInstant(wallLabelledUtc: Date, zone: string): InstantResolution {
  const wallMs = wallLabelledUtc.getTime();

  // Bracket the wall clock by ±24h and take the offset in force at each end. Any
  // single tzdata transition lies between them, so this yields BOTH candidate
  // offsets — the pre- and post-transition ones. (Iterating from the naive guess
  // instead cannot do this: on a fall-back both probes converge on the first
  // pass, and the second 01:30 is never generated at all.)
  const offsetBefore = zoneOffsetMinutes(zone, new Date(wallMs - 86_400_000));
  const offsetAfter = zoneOffsetMinutes(zone, new Date(wallMs + 86_400_000));

  // Keep only candidates that actually round-trip back to the requested wall
  // clock. This is what separates the three cases: 2 survivors means the wall
  // clock happened twice, 0 means it never happened.
  const candidates = Array.from(
    new Set([wallMs - offsetBefore * 60_000, wallMs - offsetAfter * 60_000]),
  )
    .filter((ms) => wallClockMsAt(zone, new Date(ms)) === wallMs)
    .sort((a, b) => a - b);

  const [firstCandidate] = candidates;
  if (candidates.length === 1 && firstCandidate !== undefined) {
    const instant = new Date(firstCandidate);
    return { instant, resolution: "UNIQUE", offsetMinutes: zoneOffsetMinutes(zone, instant) };
  }

  if (candidates.length > 1 && firstCandidate !== undefined) {
    const instant = new Date(firstCandidate); // earlier of the two passes
    return { instant, resolution: "AMBIGUOUS", offsetMinutes: zoneOffsetMinutes(zone, instant) };
  }

  // Nothing round-tripped: the wall clock falls inside a spring-forward gap.
  // Resolve with the post-transition offset, which lands just past the gap.
  const instant = new Date(wallMs - offsetAfter * 60_000);
  return { instant, resolution: "NONEXISTENT", offsetMinutes: zoneOffsetMinutes(zone, instant) };
}

/**
 * Inverse of {@link wallClockToInstant}: the local wall clock at `instant`,
 * returned UTC-labelled so it round-trips through the existing storage shape.
 */
export function instantToWallClock(instant: Date, zone: string): Date {
  return new Date(wallClockMsAt(zone, instant));
}
