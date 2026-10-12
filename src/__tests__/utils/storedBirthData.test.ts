/**
 * What an agent's stored birth record can honestly carry — through the REAL
 * temporal pipeline, over stored shapes copied from production (2026-10-12).
 *
 * Expected instants are tzdata's own numbers, not the pipeline's output read
 * back: Europe/Prague was on Prague Mean Time (+0:57:44) in 1856, Asia/Samarkand
 * on LMT (+4:27:53) in 980, Europe/London on LMT (−0:01:15) in 1723.
 * `zoneOffsetMinutes` rounds to whole minutes, hence 58, 268 and −1.
 */

import { isBirthData } from "@/types/apiResponses";
import { instantToWallClock } from "@/utils/astrology/birthTimezone";
import {
  readFirstStoredBirth,
  readStoredBirthData,
  type StoredBirth,
} from "@/utils/astrology/storedBirthData";
import {
  adamSmithAgenticRow,
  adamSmithLegacyRow,
  avicennaRow,
  freudRow,
  homerRow,
  placeholderAgentRow,
  socratesLegacyRow,
  socratesRow,
  yearOnlyRow,
} from "../helpers/companionFixtures";

function birthOf(result: StoredBirth) {
  if (result.kind !== "birth") {
    throw new Error(`expected a birth, got none (${result.reason})`);
  }
  return result.birthData;
}

function legacy(date: string, time: string, location: unknown): Record<string, unknown> {
  return { date, time, location };
}

const LOCAL_GETTERS: ReadonlyArray<
  "getFullYear" | "getMonth" | "getDate" | "getHours" | "getMinutes" | "getTimezoneOffset"
> = ["getFullYear", "getMonth", "getDate", "getHours", "getMinutes", "getTimezoneOffset"];

/** Poisoned local getters return values no correct result can contain, in EVERY zone. */
function withPoisonedLocalGetters<T>(fn: () => T): T {
  const spies = LOCAL_GETTERS.map((name) => jest.spyOn(Date.prototype, name).mockReturnValue(999));
  try {
    return fn();
  } finally {
    for (const spy of spies) spy.mockRestore();
  }
}

describe("a historical figure: {date, time, location}", () => {
  it("keeps the wall clock as dateTime and adds the true instant with its basis", () => {
    const birth = birthOf(readStoredBirthData(freudRow().birth_data));
    expect(birth).toEqual({
      dateTime: "1856-05-06T18:30:00.000Z",
      latitude: 49.6116,
      longitude: 17.2381,
      utcInstant: "1856-05-06T17:32:00.000Z",
      timezone: "Europe/Prague",
      timezoneBasis: "DERIVED_FROM_COORDINATES",
    });
  });

  it("does not read the wall clock as UTC: the instant moves, dateTime does not", () => {
    const birth = birthOf(readStoredBirthData(freudRow().birth_data));
    expect(birth.dateTime).toBe("1856-05-06T18:30:00.000Z");
    expect(birth.utcInstant).not.toBe(birth.dateTime);
  });

  it("round-trips: the wall clock is recoverable from the instant and the zone", () => {
    for (const build of [freudRow, avicennaRow, adamSmithAgenticRow, adamSmithLegacyRow]) {
      const birth = birthOf(readStoredBirthData(build().birth_data));
      if (birth.utcInstant === undefined || birth.timezone === undefined) {
        throw new Error("expected an instant and a zone");
      }
      expect(instantToWallClock(new Date(birth.utcInstant), birth.timezone).toISOString()).toBe(
        birth.dateTime,
      );
    }
  });

  it("handles a year below 1000 (four digits, leading zero) and its LMT offset", () => {
    const birth = birthOf(readStoredBirthData(avicennaRow().birth_data));
    expect(birth).toEqual({
      dateTime: "0980-08-22T03:30:00.000Z",
      latitude: 39.6539,
      longitude: 66.9597,
      utcInstant: "0980-08-21T23:02:00.000Z",
      timezone: "Asia/Samarkand",
      timezoneBasis: "DERIVED_FROM_COORDINATES",
    });
  });

  it("reads the @agentic form and the @agents legacy form of one person identically", () => {
    const agentic = birthOf(readStoredBirthData(adamSmithAgenticRow().birth_data));
    const legacyTwin = birthOf(readStoredBirthData(adamSmithLegacyRow().birth_data));
    expect(legacyTwin).toEqual(agentic);
    expect(agentic.utcInstant).toBe("1723-06-16T09:01:00.000Z");
    expect(agentic.timezone).toBe("Europe/London");
  });

  it("only ever returns something the client's strict guard accepts", () => {
    for (const build of [freudRow, avicennaRow, adamSmithAgenticRow, adamSmithLegacyRow]) {
      expect(isBirthData(birthOf(readStoredBirthData(build().birth_data)))).toBe(true);
    }
  });

  it("never reads a local getter — verified by poisoning all of them", () => {
    const clean = readStoredBirthData(freudRow().birth_data);
    const poisoned = withPoisonedLocalGetters(() => readStoredBirthData(freudRow().birth_data));
    expect(poisoned).toEqual(clean);
  });
});

describe("a record that is already BirthData", () => {
  it("passes through untouched: a migrated row is not re-dated", () => {
    const migrated = {
      dateTime: "1991-06-23T14:24:00.000Z",
      latitude: 40.6526006,
      longitude: -73.9497211,
      utcInstant: "1991-06-23T18:24:00.000Z",
      timezone: "America/New_York",
      timezoneBasis: "DERIVED_FROM_COORDINATES",
    };
    expect(birthOf(readStoredBirthData(migrated))).toEqual(migrated);
  });
});

describe("nothing stored", () => {
  it.each([
    ["the column's {} default", {}],
    ["null", null],
    ["undefined", undefined],
    ["an array", []],
    ["a string", "1856-05-06"],
  ])("%s is absent", (_label, stored) => {
    expect(readStoredBirthData(stored)).toEqual({ kind: "none", reason: "absent" });
  });
});

describe("not a birth, whatever else the record says", () => {
  it("refuses the dataset's year-1 'unknown date' — with or without a real place", () => {
    expect(readStoredBirthData(homerRow().birth_data)).toEqual({
      kind: "none",
      reason: "unsupported-year",
    });
    expect(readStoredBirthData(socratesRow().birth_data)).toEqual({
      kind: "none",
      reason: "unsupported-year",
    });
  });

  it("refuses an ISO expanded year (470 BC) as unsupported, not as unreadable", () => {
    // MEASURED: socrates@agents.alchm.kitchen holds exactly this. "Unreadable" would
    // log an operator error on every request for a date that is merely out of range.
    expect(readStoredBirthData(socratesLegacyRow().birth_data)).toEqual({
      kind: "none",
      reason: "unsupported-year",
    });
    expect(
      readStoredBirthData(legacy("+010000-01-01", "12:00", { lat: 41.9, lon: 12.5 })),
    ).toEqual({ kind: "none", reason: "unsupported-year" });
  });

  it("refuses a known birth YEAR filed as Jan 1 noon at (0, 0, 'Unknown')", () => {
    expect(readStoredBirthData(yearOnlyRow().birth_data)).toEqual({
      kind: "none",
      reason: "placeholder",
    });
  });

  it("draws the year line at 100: the pipeline returns garbage below it", () => {
    const place = { lat: 41.9, lon: 12.5 };
    expect(readStoredBirthData(legacy("0099-06-01", "12:00", place))).toEqual({
      kind: "none",
      reason: "unsupported-year",
    });
    expect(readStoredBirthData(legacy("0100-06-01", "12:00", place)).kind).toBe("birth");
  });

  it("refuses the agent sentinel instant, however it is spelled", () => {
    expect(readStoredBirthData(placeholderAgentRow().birth_data)).toEqual({
      kind: "none",
      reason: "placeholder",
    });
    const place = { lat: 51.5, lon: -0.1 };
    expect(readStoredBirthData(legacy("1900-01-01", "12:00", place))).toEqual({
      kind: "none",
      reason: "placeholder",
    });
    expect(
      readStoredBirthData({ dateTime: "1900-01-01T12:00:00Z", latitude: 51.5, longitude: -0.1 }),
    ).toEqual({ kind: "none", reason: "placeholder" });
  });

  it("refuses a (0, 0) pin: it resolves to a made-up Etc/GMT, not a birthplace", () => {
    expect(readStoredBirthData(legacy("1856-05-06", "18:30", { lat: 0, lon: 0 }))).toEqual({
      kind: "none",
      reason: "placeholder",
    });
  });

  it("refuses the retired Fallback NY pin even with a plausible date", () => {
    expect(
      readStoredBirthData(legacy("1991-06-23", "10:24", { lat: 40.7498, lon: -73.7976 })),
    ).toEqual({ kind: "none", reason: "placeholder" });
  });
});

describe("something stored that cannot be read", () => {
  const place = { lat: 49.6, lon: 17.2 };
  it.each([
    ["a date that is not a date", legacy("sometime", "18:30", place)],
    ["February 30th", legacy("1856-02-30", "18:30", place)],
    ["hour 24", legacy("1856-05-06", "24:00", place)],
    ["no time", { date: "1856-05-06", location: place }],
    ["a time that is not a time", legacy("1856-05-06", "evening", place)],
    ["no place", { date: "1856-05-06", time: "18:30" }],
    ["a location that is not JSON", legacy("1856-05-06", "18:30", "{not json")],
    ["a latitude past the pole", legacy("1856-05-06", "18:30", { lat: 91, lon: 17.2 })],
    ["a longitude past the antimeridian", legacy("1856-05-06", "18:30", { lat: 49, lon: 181 })],
    ["a NaN coordinate", legacy("1856-05-06", "18:30", { lat: NaN, lon: 17.2 })],
    ["a string coordinate", legacy("1856-05-06", "18:30", { lat: "49.6", lon: "17.2" })],
    ["a canonical record with an unparseable dateTime", { dateTime: "x", latitude: 1, longitude: 2 }],
  ])("%s is unreadable", (_label, stored) => {
    expect(readStoredBirthData(stored)).toEqual({ kind: "none", reason: "unreadable" });
  });
});

describe("readFirstStoredBirth", () => {
  const real = freudRow().birth_data;

  it("lets {} be skipped: a truthy empty record must not shadow a real one behind it", () => {
    expect(readFirstStoredBirth([{}, real]).kind).toBe("birth");
    expect(readFirstStoredBirth([null, {}, undefined, real]).kind).toBe("birth");
  });

  it("lets an unusable record be skipped too", () => {
    expect(readFirstStoredBirth([homerRow().birth_data, real]).kind).toBe("birth");
  });

  it("takes the first record that holds a birth, in order", () => {
    const first = birthOf(readFirstStoredBirth([real, adamSmithAgenticRow().birth_data]));
    expect(first.dateTime).toBe("1856-05-06T18:30:00.000Z");
  });

  it("reports the first reason that is not 'absent', so a placeholder is not 'nothing stored'", () => {
    expect(readFirstStoredBirth([{}, homerRow().birth_data, null])).toEqual({
      kind: "none",
      reason: "unsupported-year",
    });
    expect(readFirstStoredBirth([legacy("x", "y", null), homerRow().birth_data])).toEqual({
      kind: "none",
      reason: "unreadable",
    });
    expect(readFirstStoredBirth([{}, null])).toEqual({ kind: "none", reason: "absent" });
    expect(readFirstStoredBirth([])).toEqual({ kind: "none", reason: "absent" });
  });
});
