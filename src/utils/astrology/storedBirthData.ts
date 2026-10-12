/**
 * What an agent's STORED birth record can honestly carry to a user.
 *
 * `user_profiles.birth_data` is `JSONB DEFAULT '{}'`, and agent rows reach it by
 * three unrelated writers. MEASURED against the live
 * `GET /api/commensal/companions` payload, 2026-10-12 (2,924 roster rows):
 *
 *   {}                        ~2,800  degree agents (`mars-leo-8`) and moon-phase
 *                                     agents. They are a placement, not a person:
 *                                     no date, no place, never had one.
 *   {date, time, location}      123   historical figures, from
 *                                     `scripts/sync-agentic-users.ts`. `date` is
 *                                     `1856-05-06` on the `@agentic` rows and a
 *                                     full ISO stamp on the legacy `@agents` rows;
 *                                     `location` is a JSON STRING on the former and
 *                                     an object on the latter.
 *   {dateTime, latitude, …}       1   the canonical `BirthData` shape — and that
 *                                     one row is the agent placeholder
 *                                     (`1900-01-01T12:00:00.000Z` at the retired
 *                                     "Fallback NY" pin), not a birth.
 *
 * Only the third shape satisfies `BirthData`, so the strict client guard rejected
 * 2,923 of 2,924 rows and, because it is all-or-nothing, the whole panel.
 *
 * ── THE RULINGS ─────────────────────────────────────────────────────────────
 *
 * - `{}` is ABSENT, not a birth. It is truthy, which is how it got past
 *   `!birthData` and into the response.
 * - A legacy record's `time` is a WALL CLOCK. It becomes `dateTime` exactly the
 *   way every other writer stores one (`…T18:30:00.000Z`, labelled `Z`, not a UTC
 *   instant), which needs no timezone and invents none.
 * - The true instant is added ONLY through the temporal pipeline
 *   (`resolveBirthZone` → `wallClockToInstant`), with the basis it reports.
 *   Coordinates win; nothing is assumed. When the pipeline names no zone the
 *   record says `timezoneBasis: "ABSENT"` and the reader falls back to the wall
 *   clock, exactly as for an unmigrated row.
 * - For a birth before standard time (nearly all of this roster) tzdata answers
 *   with the zone's LMT — the mean solar time of the zone's reference city, not
 *   of the birthplace. MEASURED on 8 rows that is 7–21 minutes from the
 *   birthplace's own LMT, against 37–365 minutes for reading the wall clock as
 *   UTC. It is the pipeline's published basis, not a refinement of it. The
 *   Julian/Gregorian question for dates before 1582 is not addressed either.
 * - Not a birth, whatever else the record says: the agent sentinel instant, a
 *   (0, 0) pin and the retired Fallback NY pin (each named by the repo itself —
 *   see `birthTimezone.ts`), and any year below {@link MIN_SUPPORTED_YEAR}.
 */

import { isBirthData } from "@/types/apiResponses";
import type { BirthData } from "@/types/natalChart";
import { isObject, safeJsonParse } from "@/utils/typeGuards";
import {
  AGENT_SENTINEL_DATETIME,
  isFabricatedFallbackPin,
  resolveBirthZone,
  wallClockToInstant,
} from "./birthTimezone";

/**
 * First year the zone pipeline handles. `zoneOffsetMinutes` rebuilds the wall
 * clock with `Date.UTC(year, …)`, which maps years 0–99 onto 1900–1999. MEASURED
 * 2026-10-12: a year-50 birth in Rome came back with an offset of 1,946,537,330
 * minutes. The roster's year-1 entries are the dataset's "unknown date" marker.
 */
const MIN_SUPPORTED_YEAR = 100;

export type NoBirthReason =
  /** Nothing stored: null, or the column's `{}` default. */
  | "absent"
  /** A value the repo itself names as not-a-birth. */
  | "placeholder"
  /** A year the zone pipeline cannot process. */
  | "unsupported-year"
  /** Something is stored, but no date, time and place can be read from it. */
  | "unreadable";

export interface BirthFound {
  kind: "birth";
  birthData: BirthData;
}

export interface NoBirth {
  kind: "none";
  reason: NoBirthReason;
}

export type StoredBirth = BirthFound | NoBirth;

const LEGACY_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/;
const LEGACY_TIME = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

function none(reason: NoBirthReason): NoBirth {
  return { kind: "none", reason };
}

/**
 * `1856-05-06` + `18:30` → `1856-05-06T18:30:00.000Z`: a wall clock labelled `Z`.
 * Null unless it names a real calendar moment — `toISOString()` normalizes an
 * overflowing day or an hour 24 into a different string, so a round trip that
 * does not reproduce the label means the input was not a date.
 */
function wallClockLabel(date: unknown, time: unknown): string | null {
  if (typeof date !== "string" || typeof time !== "string") return null;
  const d = LEGACY_DATE.exec(date);
  const t = LEGACY_TIME.exec(time);
  if (d === null || t === null) return null;
  const [, year, month, day] = d;
  const [, hour, minute, second = "00"] = t;
  const label = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
  const parsed = new Date(label);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString() !== label
    ? null
    : label;
}

/** `{lat, lon}` as stored — a JSON string on one writer's rows, an object on the other's. */
function readPlace(
  location: unknown,
): { latitude: number; longitude: number } | null {
  const place =
    typeof location === "string" ? safeJsonParse<unknown>(location) : location;
  if (!isObject(place)) return null;
  const { lat, lon } = place;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  // Written so NaN lands on the rejecting side: every comparison with it is false.
  if (!(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180)) return null;
  return { latitude: lat, longitude: lon };
}

/** Why this moment and place cannot be presented as a birth, or null when they can. */
function refusal(
  dateTime: string,
  latitude: number,
  longitude: number,
): NoBirthReason | null {
  const at = new Date(dateTime);
  if (Number.isNaN(at.getTime())) return "unreadable";
  if (at.getUTCFullYear() < MIN_SUPPORTED_YEAR) return "unsupported-year";
  const isSentinel = at.getTime() === Date.parse(AGENT_SENTINEL_DATETIME);
  const isNullIsland = latitude === 0 && longitude === 0;
  return isSentinel || isNullIsland || isFabricatedFallbackPin(latitude, longitude)
    ? "placeholder"
    : null;
}

/**
 * Add the true instant through the temporal pipeline, naming its basis. A zone
 * the pipeline cannot defend leaves the record on the wall clock and says so.
 */
function withInstant(
  dateTime: string,
  latitude: number,
  longitude: number,
): BirthData {
  const zone = resolveBirthZone({ latitude, longitude });
  if (zone.zone === null || zone.basis !== "DERIVED_FROM_COORDINATES") {
    return { dateTime, latitude, longitude, timezoneBasis: "ABSENT" };
  }
  const { instant } = wallClockToInstant(new Date(dateTime), zone.zone);
  if (Number.isNaN(instant.getTime())) {
    return { dateTime, latitude, longitude, timezoneBasis: "ABSENT" };
  }
  return {
    dateTime,
    latitude,
    longitude,
    utcInstant: instant.toISOString(),
    timezone: zone.zone,
    timezoneBasis: "DERIVED_FROM_COORDINATES",
  };
}

function readLegacy(stored: Record<string, unknown>): StoredBirth {
  const dateTime = wallClockLabel(stored.date, stored.time);
  const place = readPlace(stored.location);
  if (dateTime === null || place === null) return none("unreadable");
  const { latitude, longitude } = place;
  const refused = refusal(dateTime, latitude, longitude);
  if (refused !== null) return none(refused);
  return {
    kind: "birth",
    birthData: withInstant(dateTime, latitude, longitude),
  };
}

function readCanonical(birth: BirthData): StoredBirth {
  const refused = refusal(birth.dateTime, birth.latitude, birth.longitude);
  return refused === null ? { kind: "birth", birthData: birth } : none(refused);
}

/**
 * Read one stored birth record. The result is either a `BirthData` that
 * satisfies the client's strict guard, or the reason there is none — never a
 * best guess.
 */
export function readStoredBirthData(stored: unknown): StoredBirth {
  if (!isObject(stored) || Object.keys(stored).length === 0) {
    return none("absent");
  }
  return isBirthData(stored) ? readCanonical(stored) : readLegacy(stored);
}

/**
 * Read the first record that holds a birth. A record that is empty or unusable
 * must not shadow a later one that is not: `{}` is truthy, so a plain `??` chain
 * stops on it and never reaches the richer source behind it.
 *
 * When none holds a birth, the reason reported is the first that is not
 * `"absent"`, so a placeholder is never mistaken for "nothing was stored".
 */
export function readFirstStoredBirth(candidates: readonly unknown[]): StoredBirth {
  let reported: NoBirth = none("absent");
  for (const candidate of candidates) {
    const read = readStoredBirthData(candidate);
    if (read.kind === "birth") return read;
    if (reported.reason === "absent") reported = read;
  }
  return reported;
}
