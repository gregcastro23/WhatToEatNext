/**
 * Shared by the planetary-hour tests: the golden vectors, the classical table
 * WRITTEN OUT, and the comparison of `PlanetaryHourCalculator` with the vectors.
 *
 * Not a suite (jest ignores `__tests__/helpers/`). The same `evaluateCalculator`
 * runs in-process (`planetaryHourGoldenVectors.test.ts`) and, with a different
 * host clock, in a fresh process (`planetaryHourGoldenInZone.ts`).
 *
 * The expected values are in `backend/tests/planetary_hour_golden_vectors.json`,
 * written by the Python reference (`planetary_hour_at`), and the table below is
 * written out by hand: neither comes from the code under test.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

import { PlanetaryHourCalculator } from "@/lib/PlanetaryHourCalculator";

export const GOLDEN_PATH = join(
  __dirname,
  "..",
  "..",
  "..",
  "backend",
  "tests",
  "planetary_hour_golden_vectors.json",
);

/** One planetary day of the vector file. */
const GoldenDaySchema = z.object({
  place: z.string(),
  /** Local mean solar date of the sunrise that began this planetary day. */
  localDate: z.string(),
  weekday: z.string(),
  dayRuler: z.string(),
  sunrise: z.string(),
  sunset: z.string(),
  nextSunrise: z.string(),
  /** 24 entries: [instant UTC, ruling planet]; 0-11 by day from sunrise, 12-23 by night from sunset. */
  hours: z.array(z.tuple([z.string(), z.string()])),
});

const GoldenVectorsSchema = z.object({
  basis: z.object({ shortestHourMinutes: z.number() }),
  places: z.record(z.string(), z.object({ latitude: z.number(), longitude: z.number() })),
  days: z.array(GoldenDaySchema),
});

export type GoldenDay = z.infer<typeof GoldenDaySchema>;
export type GoldenVectors = z.infer<typeof GoldenVectorsSchema>;

/** The vector file, parsed: a file of another shape fails here saying how, instead of being trusted. */
export function loadGolden(): GoldenVectors {
  return GoldenVectorsSchema.parse(JSON.parse(readFileSync(GOLDEN_PATH, "utf8")));
}

/**
 * The classical planetary hours, written out. Hour i of a planetary day (0-23
 * from sunrise) is entry `i % 7` of the row for the weekday on which that
 * sunrise falls. Each row is the Chaldean order (Saturn, Jupiter, Mars, Sun,
 * Venus, Mercury, Moon, then Saturn again) from the planet of the weekday:
 * Sunday the Sun, Monday the Moon, Tuesday Mars, Wednesday Mercury, Thursday
 * Jupiter, Friday Venus, Saturday Saturn.
 */
export const CLASSICAL_ROWS: Readonly<Record<string, readonly string[]>> = {
  Sunday: ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"],
  Monday: ["Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury"],
  Tuesday: ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"],
  Wednesday: ["Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus"],
  Thursday: ["Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn"],
  Friday: ["Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun"],
  Saturday: ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"],
};

/** The planets in the order the Chaldeans gave them: each hour belongs to the next one in this list. */
export const CHALDEAN_ORDER = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
] as const;

/** The planet of each weekday, Sunday first. */
export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** The planet that follows `planet` in the Chaldean order, wrapping from the Moon to Saturn. */
export function chaldeanSuccessor(planet: string): string {
  const at = CHALDEAN_ORDER.findIndex((p) => p === planet);
  if (at < 0) throw new Error(`not a classical planet: ${planet}`);
  const next = CHALDEAN_ORDER[(at + 1) % 7];
  if (next === undefined) throw new Error("unreachable: modulo of a 7-entry list");
  return next;
}

/** The ruling planet of hour `hour` (0-23 from sunrise) of a planetary day that began on `weekday`. */
export function classicalRuler(weekday: string, hour: number): string {
  const row = CLASSICAL_ROWS[weekday];
  const ruler = row?.[hour % 7];
  if (ruler === undefined) throw new Error(`no classical row for ${weekday} hour ${hour}`);
  return ruler;
}

/**
 * The local mean solar date (UTC + longitude / 15 hours) of an instant, as
 * YYYY-MM-DD. UTC getters only: the host's zone has no part in it.
 */
export function localMeanSolarDate(instant: string, longitude: number): string {
  return new Date(Date.parse(instant) + (longitude / 15) * 3_600_000)
    .toISOString()
    .slice(0, 10);
}

export type Segment = "day" | "evening night" | "pre-dawn night";

/**
 * Which part of the planetary day a vector is in. "Pre-dawn" is a night hour
 * past local mean solar midnight: its instant has a later local date than the
 * sunrise that began the planetary day.
 */
export function segmentOf(
  day: GoldenDay,
  hour: number,
  instant: string,
  longitude: number,
): Segment {
  if (hour < 12) return "day";
  return localMeanSolarDate(instant, longitude) === day.localDate
    ? "evening night"
    : "pre-dawn night";
}

export interface Mismatch {
  place: string;
  localDate: string;
  hour: number;
  instant: string;
  expected: string;
  got: string;
}

export interface Evaluation {
  checked: number;
  /** Wrong ruling planet, by part of the planetary day. */
  wrongRuler: Record<Segment, Mismatch[]>;
  checkedBySegment: Record<Segment, number>;
  /** Wrong hour number (0-11) or day/night flag. */
  wrongHour: Mismatch[];
  /** Wrong planet of the day. */
  wrongDayRuler: Mismatch[];
}

function describeHour(planet: string, hourNumber: number, isDaytime: boolean): string {
  return `${planet} hourNumber=${hourNumber} ${isDaytime ? "day" : "night"}`;
}

/**
 * Ask `PlanetaryHourCalculator` about every vector. A call that throws is
 * recorded as a mismatch carrying the message, so a poisoned local getter
 * shows up as what it is.
 */
export function evaluateCalculator(golden: GoldenVectors): Evaluation {
  const result: Evaluation = {
    checked: 0,
    wrongRuler: { day: [], "evening night": [], "pre-dawn night": [] },
    checkedBySegment: { day: 0, "evening night": 0, "pre-dawn night": 0 },
    wrongHour: [],
    wrongDayRuler: [],
  };
  for (const day of golden.days) {
    const place = golden.places[day.place];
    if (place === undefined) throw new Error(`golden vectors name no place ${day.place}`);
    const calculator = new PlanetaryHourCalculator(place.latitude, place.longitude);
    day.hours.forEach(([instant, ruler], hour) => {
      const at = new Date(instant);
      const segment = segmentOf(day, hour, instant, place.longitude);
      const where = { place: day.place, localDate: day.localDate, hour, instant };
      result.checked += 1;
      result.checkedBySegment[segment] += 1;
      try {
        const got = calculator.getPlanetaryHour(at);
        if (got.planet !== ruler) {
          result.wrongRuler[segment].push({
            ...where,
            expected: ruler,
            got: got.planet,
          });
        }
        if (got.hourNumber !== hour % 12 || got.isDaytime !== hour < 12) {
          result.wrongHour.push({
            ...where,
            expected: describeHour(ruler, hour % 12, hour < 12),
            got: describeHour(got.planet, got.hourNumber, got.isDaytime),
          });
        }
        const dayRuler = calculator.getPlanetaryDay(at);
        if (dayRuler !== day.dayRuler) {
          result.wrongDayRuler.push({ ...where, expected: day.dayRuler, got: dayRuler });
        }
      } catch (error) {
        const message = `THREW ${error instanceof Error ? error.message : String(error)}`;
        result.wrongRuler[segment].push({ ...where, expected: ruler, got: message });
      }
    });
  }
  return result;
}
