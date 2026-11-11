/**
 * Cross-runtime parity for the planetary hour — the TypeScript half.
 *
 * `PlanetaryHourCalculator` and the Python `planetary_hour_at`
 * (backend/utils/planetary_hours.py) are two engines for one rule, and nothing
 * in either build stops them drifting apart. The defence is the one the kalchm
 * engine uses: both must reproduce the SAME golden vectors, so both read the same
 * file, backend/tests/planetary_hour_golden_vectors.json. The file's
 * `_comment` names the basis of every value.
 *
 * THE DEFECTS THIS PINS (MEASURED 2026-11-10, 1,344 hours = 4 places x a June
 * and a December week x 7 weekdays x the middle of each of the 24 hours, against
 * the calculator as it was on master):
 *
 *   ruler right on 889 (66%) with TZ=UTC, 830 (62%) with TZ=America/New_York,
 *   749 (56%) with TZ=Asia/Tokyo; and in the UTC run, with the night split at the
 *   place's civil midnight, 567 of 672 day hours, 245 of 308 evening night
 *   hours, 77 of 364 (21%) pre-dawn night hours. After the fix: 1,344 of 1,344
 *   in every zone tried (UTC, New York, Tokyo, Auckland, Kiritimati).
 *
 *   1. `date.getDay()` is the HOST's weekday. The answer depended on the machine,
 *      and was wrong wherever the place's date and the host's differ: every
 *      evening after 00:00 UTC in the Americas, every morning before it in Asia.
 *   2. Before sunrise `timeSinceStart = date - sunset` is negative, so the hour
 *      index was clamped to 0: "night hour 1 of the new calendar day". The
 *      planetary day runs from sunrise to sunrise, so the hours between midnight
 *      and dawn are the LAST hours of the day that began yesterday.
 *
 * `isDaytime` was already right on all 1,344 in every zone.
 *
 * ── HOW THE HOST ZONE IS VARIED ─────────────────────────────────────────────
 *
 * `process.env.TZ = ...` inside a jest module does not relatch Node's zone (see
 * natalChartTimezoneBoundary.test.ts and birthTimezone.test.ts, which document
 * it), so this file does two things instead:
 *
 *   - the repo's own pattern: every local-time getter is POISONED, so a
 *     calculator that reads the host's weekday or hour gets a value that cannot
 *     occur. Correct code never touches them. That holds in EVERY zone, UTC
 *     included, which is where a zone-based test goes blind;
 *   - real zones: a fresh process is started with `TZ` in its environment and
 *     runs the same comparison (the way recipeNftDeterminism.test.ts asks a
 *     fresh process). Its own zone and offset are read back, so a zone that did
 *     not take cannot pass quietly.
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";

import SunCalc from "suncalc";
import { z } from "zod";

import {
  CHALDEAN_ORDER,
  CLASSICAL_ROWS,
  WEEKDAY_NAMES,
  chaldeanSuccessor,
  classicalRuler,
  evaluateCalculator,
  loadGolden,
  localMeanSolarDate,
  segmentOf,
  type Evaluation,
  type GoldenVectors,
  type Mismatch,
} from "@/__tests__/helpers/planetaryHourGolden";

const REPO_ROOT = join(__dirname, "..", "..", "..");
const GOLDEN: GoldenVectors = loadGolden();

/** A report short enough to read: the count, and the first few that disagree. */
function report(mismatches: Mismatch[]): { count: number; first: Mismatch[] } {
  return { count: mismatches.length, first: mismatches.slice(0, 3) };
}

/**
 * Sentinels for the local-time getters, deliberately impossible for a correct
 * result: there is no weekday 9, hour 77 or month 11 in a payload that never
 * asked the host. `getDay` is the one that threw the old calculator off; the
 * rest keep a future "just use the hour" from coming back.
 */
const POISON = {
  getDay: 9,
  getDate: 31,
  getMonth: 11,
  getFullYear: 1888,
  getHours: 77,
  getMinutes: 88,
  getSeconds: 99,
  getTimezoneOffset: 999,
} as const;

/**
 * Run `fn` with every local-time getter poisoned. Scoped as tightly as possible
 * and always restored, since Date.prototype is global and jest itself uses it.
 */
function withPoisonedLocalGetters<T>(fn: () => T): T {
  const spies = [
    jest.spyOn(Date.prototype, "getDay").mockReturnValue(POISON.getDay),
    jest.spyOn(Date.prototype, "getDate").mockReturnValue(POISON.getDate),
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(POISON.getMonth),
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(POISON.getFullYear),
    jest.spyOn(Date.prototype, "getHours").mockReturnValue(POISON.getHours),
    jest.spyOn(Date.prototype, "getMinutes").mockReturnValue(POISON.getMinutes),
    jest.spyOn(Date.prototype, "getSeconds").mockReturnValue(POISON.getSeconds),
    jest.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(POISON.getTimezoneOffset),
  ];
  try {
    return fn();
  } finally {
    for (const spy of spies) spy.mockRestore();
  }
}

/** The one JSON line `planetaryHourGoldenInZone.ts` prints. */
const InZoneReportSchema = z.object({
  zone: z.string(),
  offsetJune: z.number(),
  checked: z.number(),
  wrongRuler: z.object({ day: z.number(), eveningNight: z.number(), preDawnNight: z.number() }),
  wrongHour: z.number(),
  wrongDayRuler: z.number(),
  firstMismatches: z.array(
    z.object({
      place: z.string(),
      localDate: z.string(),
      hour: z.number(),
      instant: z.string(),
      expected: z.string(),
      got: z.string(),
    }),
  ),
});

describe("planetary hour golden vectors: the vectors themselves", () => {
  // CONTROL. `it.each([])` and a loop over an empty list both pass, so an empty
  // or unreadable file would leave this whole suite green while testing nothing.
  it("loaded the full set: 56 planetary days, 1,344 hours, every place, season and weekday", () => {
    expect(GOLDEN.days).toHaveLength(56);
    expect(GOLDEN.days.every((day) => day.hours.length === 24)).toBe(true);
    expect(Object.keys(GOLDEN.places).sort()).toEqual(["London", "New York", "Sydney", "Tokyo"]);
    for (const place of Object.keys(GOLDEN.places)) {
      const days = GOLDEN.days.filter((day) => day.place === place);
      expect(days).toHaveLength(14);
      for (const half of [days.slice(0, 7), days.slice(7)]) {
        expect(new Set(half.map((day) => day.weekday)).size).toBe(7);
      }
    }
    const segments = { day: 0, "evening night": 0, "pre-dawn night": 0 };
    for (const day of GOLDEN.days) {
      const place = GOLDEN.places[day.place];
      day.hours.forEach(([instant], hour) => {
        segments[segmentOf(day, hour, instant, place?.longitude ?? Number.NaN)] += 1;
      });
    }
    // The parts of the day the old code got wrong must be well represented.
    expect(segments.day).toBe(672);
    expect(segments["evening night"]).toBeGreaterThan(250);
    expect(segments["pre-dawn night"]).toBeGreaterThan(250);
    expect(segments["evening night"] + segments["pre-dawn night"]).toBe(672);
  });

  // CONTROL on the table this file writes out, which every check below leans on.
  it("the classical table written out is the Chaldean order from each weekday's planet", () => {
    const dayPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    WEEKDAY_NAMES.forEach((weekday, index) => {
      const row = CLASSICAL_ROWS[weekday];
      expect(row).toHaveLength(7);
      expect(row?.[0]).toBe(dayPlanets[index]);
      for (let i = 0; i < 7; i += 1) {
        expect(row?.[(i + 1) % 7]).toBe(chaldeanSuccessor(row?.[i] ?? ""));
      }
    });
    expect(new Set(CHALDEAN_ORDER).size).toBe(7);
  });

  it("every vector's ruler, day ruler and weekday follow from the classical table and the local mean solar date, without either engine", () => {
    const wrong: string[] = [];
    for (const day of GOLDEN.days) {
      const place = GOLDEN.places[day.place];
      if (place === undefined) throw new Error(`no place ${day.place}`);
      const date = localMeanSolarDate(day.sunrise, place.longitude);
      const weekday = WEEKDAY_NAMES[new Date(`${date}T00:00:00Z`).getUTCDay()];
      if (date !== day.localDate || weekday !== day.weekday) {
        wrong.push(`${day.place} ${day.sunrise}: date ${date} ${weekday}, file says ${day.localDate} ${day.weekday}`);
      }
      if (classicalRuler(day.weekday, 0) !== day.dayRuler) {
        wrong.push(`${day.place} ${day.localDate}: day ruler ${day.dayRuler}`);
      }
      day.hours.forEach(([instant, ruler], hour) => {
        if (classicalRuler(day.weekday, hour) !== ruler) {
          wrong.push(`${day.place} ${day.localDate} hour ${hour} ${instant}: ${ruler}`);
        }
      });
    }
    expect(wrong.slice(0, 5)).toEqual([]);
  });

  it("each instant lies inside the hour it is the middle of, by the file's own sunrise, sunset and next sunrise", () => {
    const outside: string[] = [];
    for (const day of GOLDEN.days) {
      const sunrise = Date.parse(day.sunrise);
      const sunset = Date.parse(day.sunset);
      const next = Date.parse(day.nextSunrise);
      day.hours.forEach(([instant], hour) => {
        const [from, length] =
          hour < 12 ? [sunrise, (sunset - sunrise) / 12] : [sunset, (next - sunset) / 12];
        const into = (Date.parse(instant) - from) / length - (hour % 12);
        // Stored to the second, so within a few seconds of the exact middle.
        if (Math.abs(into - 0.5) > 0.01) outside.push(`${day.place} ${day.localDate} hour ${hour}: ${into}`);
      });
    }
    expect(outside.slice(0, 5)).toEqual([]);
  });

  // CONTROL on the choice of instants. The vectors are the middles of hours of at
  // least `shortestHourMinutes`; they only stand for "this hour" if SunCalc's
  // sunrise and sunset (which the calculator uses, and which stay) are close to
  // the reference's. MEASURED 2026-11-10 over these 56 days x 3 events: at most
  // 88.4 s apart (88.4 sunrise, 87.9 sunset, 87.4 next sunrise).
  it("SunCalc's sunrise and sunset agree with the reference's to within 120 s, far inside half an hour", () => {
    const apart: string[] = [];
    let worst = 0;
    for (const day of GOLDEN.days) {
      const place = GOLDEN.places[day.place];
      if (place === undefined) throw new Error(`no place ${day.place}`);
      const noon = (Date.parse(day.sunrise) + Date.parse(day.sunset)) / 2;
      const today = SunCalc.getTimes(new Date(noon), place.latitude, place.longitude);
      const tomorrow = SunCalc.getTimes(new Date(noon + 86_400_000), place.latitude, place.longitude);
      for (const [name, ours, theirs] of [
        ["sunrise", today.sunrise.getTime(), Date.parse(day.sunrise)],
        ["sunset", today.sunset.getTime(), Date.parse(day.sunset)],
        ["next sunrise", tomorrow.sunrise.getTime(), Date.parse(day.nextSunrise)],
      ] as const) {
        const seconds = Math.abs(ours - theirs) / 1000;
        worst = Math.max(worst, seconds);
        if (seconds > 120) apart.push(`${day.place} ${day.localDate} ${name}: ${seconds}s`);
      }
    }
    expect(apart).toEqual([]);
    expect(worst).toBeGreaterThan(0); // the comparison compared something
    expect(GOLDEN.basis.shortestHourMinutes).toBeGreaterThan(30); // half of it is 15 minutes, against 120 s
  });
});

describe("PlanetaryHourCalculator reproduces the reference, hour by hour", () => {
  const evaluation: Evaluation = evaluateCalculator(GOLDEN);

  it("evaluated every vector", () => {
    expect(evaluation.checked).toBe(1344);
    expect(evaluation.checkedBySegment.day).toBe(672);
  });

  it("rules every DAY hour as the reference does", () => {
    expect(report(evaluation.wrongRuler.day)).toEqual({ count: 0, first: [] });
  });

  it("rules every EVENING night hour (sunset to local midnight) as the reference does", () => {
    expect(report(evaluation.wrongRuler["evening night"])).toEqual({ count: 0, first: [] });
  });

  it("rules every PRE-DAWN night hour (local midnight to sunrise) as the reference does", () => {
    expect(report(evaluation.wrongRuler["pre-dawn night"])).toEqual({ count: 0, first: [] });
  });

  it("reports the hour number (0-11) and whether it is day, as the reference does, before dawn too", () => {
    expect(report(evaluation.wrongHour)).toEqual({ count: 0, first: [] });
  });

  it("names the planet of the planetary day the moment is in, as the reference does", () => {
    expect(report(evaluation.wrongDayRuler)).toEqual({ count: 0, first: [] });
  });
});

describe("the answer does not depend on the host's clock", () => {
  // CONTROL on the lever, as natalChartTimezoneBoundary.test.ts has it: if the
  // poison did not bite, every assertion made under it would pass vacuously.
  it("poisoning the local getters actually bites, and the UTC ones are left alone", () => {
    const probe = new Date("2025-06-22T01:00:00.000Z");
    expect(probe.getUTCDay()).toBe(0);
    withPoisonedLocalGetters(() => {
      expect(probe.getDay()).toBe(POISON.getDay);
      expect(probe.getHours()).toBe(POISON.getHours);
      expect(probe.getTimezoneOffset()).toBe(POISON.getTimezoneOffset);
      expect(probe.getUTCDay()).toBe(0);
      expect(probe.getUTCHours()).toBe(1);
      expect(probe.valueOf()).toBe(Date.UTC(2025, 5, 22, 1, 0, 0));
    });
    expect(probe.getDay()).not.toBe(POISON.getDay);
  });

  it("reads no local-time getter for any of the 1,344 hours: every answer is the reference's", () => {
    const poisoned = withPoisonedLocalGetters(() => evaluateCalculator(GOLDEN));
    expect(poisoned.checked).toBe(1344);
    expect({
      day: report(poisoned.wrongRuler.day),
      evening: report(poisoned.wrongRuler["evening night"]),
      preDawn: report(poisoned.wrongRuler["pre-dawn night"]),
      hour: report(poisoned.wrongHour),
      dayRuler: report(poisoned.wrongDayRuler),
    }).toEqual({
      day: { count: 0, first: [] },
      evening: { count: 0, first: [] },
      preDawn: { count: 0, first: [] },
      hour: { count: 0, first: [] },
      dayRuler: { count: 0, first: [] },
    });
  });

  // The zones span the world: UTC (what Vercel runs), the two the old code was
  // measured in, the two where the day is most out of step with UTC (Kiritimati
  // is UTC+14, Pago Pago UTC-11) and Auckland. `offsetJune` is the zone's own
  // offset on 2025-06-15 in minutes west of UTC (tzdata, not the code under test).
  const HOST_ZONES: Array<[zone: string, offsetJune: number]> = [
    ["UTC", 0],
    ["America/New_York", 240],
    ["Asia/Tokyo", -540],
    ["Pacific/Auckland", -720],
    ["Pacific/Kiritimati", -840],
    ["Pacific/Pago_Pago", 660],
  ];

  it.each(HOST_ZONES)(
    "gives the reference's answer on a host whose clock is %s",
    (zone, offsetJune) => {
      const { NODE_OPTIONS: _skipNodeOptions, ...env } = process.env;
      const stdout = execFileSync(
        "bun",
        ["run", join(REPO_ROOT, "src/__tests__/helpers/planetaryHourGoldenInZone.ts")],
        { cwd: REPO_ROOT, env: { ...env, TZ: zone }, encoding: "utf8", timeout: 120_000 },
      );
      const line = stdout.trim().split("\n").pop() ?? "";
      const seen = InZoneReportSchema.parse(JSON.parse(line));
      // The zone took: a process that quietly stayed on UTC would pass the rest.
      expect(seen.zone).toBe(zone);
      expect(seen.offsetJune).toBe(offsetJune);
      expect(seen.checked).toBe(1344);
      expect({
        wrongRuler: seen.wrongRuler,
        wrongHour: seen.wrongHour,
        wrongDayRuler: seen.wrongDayRuler,
        first: seen.firstMismatches,
      }).toEqual({
        wrongRuler: { day: 0, eveningNight: 0, preDawnNight: 0 },
        wrongHour: 0,
        wrongDayRuler: 0,
        first: [],
      });
    },
    150_000,
  );
});
