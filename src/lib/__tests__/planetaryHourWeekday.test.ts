/**
 * Which weekday's row rules a planetary hour: the weekday AT THE PLACE of the
 * sunrise that BEGAN the planetary day, never the host's weekday and never the
 * calendar day of the moment.
 *
 * `planetaryHourGoldenVectors.test.ts` holds the calculator to 1,344 hours the
 * Python reference computed. This file pins the cases that explain WHY the old
 * code failed, one moment at a time, so a regression names its cause:
 *
 *   - 01:00 UTC on a Sunday is still Saturday evening in New York;
 *   - 03:00 on Tuesday, before sunrise, belongs to Monday's planetary day;
 *   - the planetary day turns over at SUNRISE (not at midnight, in either place's
 *     zone), and the Chaldean order continues unbroken across that turn;
 *   - the hour it names is the hour whose end it reports.
 *
 * Expected values: the New York moments are an almanac's sunrise 05:25 and
 * sunset 20:31 EDT on 2025-06-21 worked by hand (as in the Python reference's
 * own tests, backend/tests/test_planetary_hours.py, BY_HAND), and the rest were
 * asked of the Python reference `planetary_hour_at` (PR #996 @ 6961ee36) and
 * agree with the classical table written out in the golden-vector helper. None
 * of it is read from the code under test.
 */
import SunCalc from "suncalc";

import {
  chaldeanSuccessor,
  classicalRuler,
  loadGolden,
} from "@/__tests__/helpers/planetaryHourGolden";
import { PlanetaryHourCalculator } from "@/lib/PlanetaryHourCalculator";

const NEW_YORK = { latitude: 40.7128, longitude: -74.006 };
const LONDON = { latitude: 51.5074, longitude: -0.1278 };
const TOKYO = { latitude: 35.6762, longitude: 139.6503 };
const SYDNEY = { latitude: -33.8688, longitude: 151.2093 };
const AUCKLAND = { latitude: -36.8485, longitude: 174.7633 };

function at(place: { latitude: number; longitude: number }) {
  return new PlanetaryHourCalculator(place.latitude, place.longitude);
}

describe("the planetary day is the one that began at the last sunrise, at the place", () => {
  // New York, Saturday 2025-06-21: Saturn's day. Sunrise 05:25 EDT (09:25Z),
  // sunset 20:31 EDT (00:31Z on the 22nd): day hours of 75.5 minutes, night
  // hours of 44.5. Saturday's row: Saturn Jupiter Mars Sun Venus Mercury Moon.
  const BY_HAND: Array<[label: string, iso: string, hour: number, planet: string]> = [
    ["13:30 EDT: 8h05 after sunrise = 6.4 day hours", "2025-06-21T17:30:00Z", 6, "Moon"],
    ["17:30 EDT: 12h05 after sunrise = 9.6 day hours", "2025-06-21T21:30:00Z", 9, "Mars"],
    [
      "21:00 EDT: 29 min after sunset = 0.65 night hours; 01:00Z is already Sunday",
      "2025-06-22T01:00:00Z",
      12,
      "Mercury",
    ],
    [
      "03:00 EDT on Sunday: 6h29 after Saturday's sunset = 8.7 night hours",
      "2025-06-22T07:00:00Z",
      20,
      "Moon",
    ],
  ];

  it.each(BY_HAND)(
    "New York Saturday %s",
    (_label, iso, hour, planet) => {
      const calculator = at(NEW_YORK);
      const when = new Date(iso);
      expect(calculator.getPlanetaryHour(when)).toEqual({
        planet,
        hourNumber: hour % 12,
        isDaytime: hour < 12,
      });
      // Saturday's planetary day for all four, including the one at 01:00Z
      // Sunday and the one at 07:00Z Sunday.
      expect(calculator.getPlanetaryDay(when)).toBe("Saturn");
      expect(classicalRuler("Saturday", hour)).toBe(planet);
    },
  );

  it("01:00 UTC on a Sunday is Saturday evening in New York: Saturn's day, not the Sun's", () => {
    // The UTC weekday (and the weekday of any host east of New York) says Sunday.
    const when = new Date("2025-06-22T01:00:00Z");
    expect(when.getUTCDay()).toBe(0);
    expect(at(NEW_YORK).getPlanetaryDay(when)).toBe("Saturn");
  });

  it("before sunrise the planetary day is yesterday's: 03:00 BST on a Tuesday in London is Monday's, the Moon's", () => {
    // Sunrise 04:44 BST. Asked of the reference: hour 21 (night hour 10 of the
    // day that began Monday), the Moon. The calendar day of the moment is
    // Tuesday, Mars's, whose first night hour would be Mercury.
    const when = new Date("2025-06-24T02:00:00Z");
    const calculator = at(LONDON);
    expect(calculator.getPlanetaryDay(when)).toBe("Moon");
    expect(calculator.getPlanetaryHour(when)).toEqual({
      planet: "Moon",
      hourNumber: 9,
      isDaytime: false,
    });
  });

  it("east of Greenwich the sunrise that begins the day is on the previous UTC date", () => {
    // Noon on Tuesday 2025-06-24 in Auckland is 00:00Z that day; its sunrise
    // was 19:34Z on Monday the 23rd, and Tuesday's row begins with Mars.
    const auckland = at(AUCKLAND);
    const noonTuesday = new Date("2025-06-24T00:00:00Z");
    expect(auckland.getPlanetaryDay(noonTuesday)).toBe("Mars");
    expect(auckland.getPlanetaryHour(noonTuesday)).toEqual({
      planet: "Saturn", // Tuesday's row, hour 5
      hourNumber: 5,
      isDaytime: true,
    });
    // 07:00 on Wednesday morning in Tokyo is 22:00Z on Tuesday: Wednesday's day.
    const tokyo = at(TOKYO);
    const wednesdayMorning = new Date("2025-06-24T22:00:00Z");
    expect(wednesdayMorning.getUTCDay()).toBe(2);
    expect(tokyo.getPlanetaryDay(wednesdayMorning)).toBe("Mercury");
    expect(tokyo.getPlanetaryHour(wednesdayMorning).planet).toBe("Saturn");
    // 20:00 on Monday evening in Sydney: Monday's day, night hour 3.
    expect(at(SYDNEY).getPlanetaryHour(new Date("2025-06-23T10:00:00Z"))).toEqual({
      planet: "Moon",
      hourNumber: 2,
      isDaytime: false,
    });
  });
});

describe("the planetary day turns over at sunrise, and nowhere else", () => {
  // Tuesday 2025-06-24 at three places on opposite sides of the UTC date line.
  // Monday's last hour (24th, Chaldean index 23 % 7 = 2 in Monday's row) is
  // Jupiter; Tuesday's first is Mars; Mars follows Jupiter in the Chaldean order.
  const PLACES: Array<[string, { latitude: number; longitude: number }]> = [
    ["New York", NEW_YORK],
    ["Tokyo", TOKYO],
    ["Sydney", SYDNEY],
  ];

  it.each(PLACES)("%s: one second before sunrise is Monday's last hour, one second after is Tuesday's first", (_name, place) => {
    const calculator = at(place);
    const noon = new Date("2025-06-24T12:00:00Z");
    const { sunrise } = SunCalc.getTimes(noon, place.latitude, place.longitude);
    const before = new Date(sunrise.getTime() - 1000);
    const after = new Date(sunrise.getTime() + 1000);

    expect(classicalRuler("Monday", 23)).toBe("Jupiter");
    expect(classicalRuler("Tuesday", 0)).toBe("Mars");
    expect(chaldeanSuccessor("Jupiter")).toBe("Mars");

    expect(calculator.getPlanetaryDay(before)).toBe("Moon");
    expect(calculator.getPlanetaryHour(before)).toEqual({
      planet: "Jupiter",
      hourNumber: 11,
      isDaytime: false,
    });
    expect(calculator.getPlanetaryDay(after)).toBe("Mars");
    expect(calculator.getPlanetaryHour(after)).toEqual({
      planet: "Mars",
      hourNumber: 0,
      isDaytime: true,
    });
  });

  it.each(PLACES)("%s: local mean solar midnight changes neither the day nor the order of the hours", (_name, place) => {
    const calculator = at(place);
    // Midnight at this longitude on the night of 24-25 June, by local mean solar
    // time: 00:00 UTC on the 25th less longitude / 15 hours.
    const midnight = Date.UTC(2025, 5, 25) - (place.longitude / 15) * 3_600_000;
    const before = calculator.getPlanetaryHour(new Date(midnight - 60_000));
    const after = calculator.getPlanetaryHour(new Date(midnight + 60_000));
    expect(calculator.getPlanetaryDay(new Date(midnight - 60_000))).toBe("Mars");
    expect(calculator.getPlanetaryDay(new Date(midnight + 60_000))).toBe("Mars");
    expect(before.isDaytime).toBe(false);
    expect(after.isDaytime).toBe(false);
    // Two minutes apart in the middle of the night: the same hour or the next.
    const sameOrNext = [before.planet, chaldeanSuccessor(before.planet)];
    expect(sameOrNext).toContain(after.planet);
  });
});

describe("the hour it names is the hour whose end it reports", () => {
  const GOLDEN = loadGolden();

  it("for every golden moment the next hour is the Chaldean successor and the hour contains the moment", () => {
    const wrong: string[] = [];
    for (const day of GOLDEN.days) {
      const place = GOLDEN.places[day.place];
      if (place === undefined) throw new Error(`no place ${day.place}`);
      const calculator = at(place);
      for (const [instant] of day.hours) {
        const when = new Date(instant);
        const detailed = calculator.getDetailedPlanetaryHour(when);
        if (detailed.nextPlanet !== chaldeanSuccessor(detailed.planet)) {
          wrong.push(`${day.place} ${instant}: ${detailed.planet} then ${detailed.nextPlanet}`);
        }
        if (!(detailed.start.getTime() <= when.getTime() && when.getTime() < detailed.end.getTime())) {
          wrong.push(`${day.place} ${instant}: hour ${detailed.start.toISOString()} to ${detailed.end.toISOString()}`);
        }
      }
    }
    expect(wrong.slice(0, 5)).toEqual([]);
  });

  it("the hour changes at the moment getNextPlanetaryHourTransition returns, before dawn as well", () => {
    // The transition is a fractional number of milliseconds that `new Date`
    // truncates, so it can be up to a millisecond before the exact boundary:
    // the hour is the same two milliseconds before it and the next one a
    // millisecond after it.
    //
    // KNOWN LIMIT, not changed here: SunCalc's solar day changes at solar
    // midnight, and each side of it rebuilds the night from its own sunset and
    // sunrise. So for the one hour of each night that straddles solar midnight,
    // the two calls place that hour's end slightly differently. MEASURED
    // 2026-11-10: at most 12.2 s on these 28 straddling hours, 43.8 s on 292 in
    // 12,800 random instants at 32 other places (Ushuaia the worst), against
    // hours of 36 minutes and more. The tolerance for such an hour is 60 s.
    const straddlingTolerance = 60_000;
    const wrong: string[] = [];
    let straddling = 0;
    let checked = 0;
    for (const day of GOLDEN.days) {
      const place = GOLDEN.places[day.place];
      if (place === undefined) throw new Error(`no place ${day.place}`);
      const calculator = at(place);
      for (const [instant] of day.hours) {
        const when = new Date(instant);
        const end = calculator.getNextPlanetaryHourTransition(when).getTime();
        const sunriseNow = SunCalc.getTimes(when, place.latitude, place.longitude).sunrise.getTime();
        const sunriseThen = SunCalc.getTimes(new Date(end + 1), place.latitude, place.longitude).sunrise.getTime();
        const slack = sunriseNow === sunriseThen ? 0 : straddlingTolerance;
        if (slack > 0) straddling += 1;
        checked += 1;
        const last = calculator.getPlanetaryHour(new Date(end - 2 - slack));
        const first = calculator.getPlanetaryHour(new Date(end + 1 + slack));
        const now = calculator.getPlanetaryHour(when);
        if (last.planet !== now.planet || last.hourNumber !== now.hourNumber) {
          wrong.push(`${day.place} ${instant}: still ${now.planet} until ${end} but ${last.planet} at ${end - 2 - slack}`);
        }
        if (first.planet !== chaldeanSuccessor(now.planet)) {
          wrong.push(`${day.place} ${instant}: ${now.planet} then ${first.planet} at ${end + 1 + slack}`);
        }
      }
    }
    expect(wrong.slice(0, 5)).toEqual([]);
    // CONTROL: every hour was checked, and the loose branch is the rare one:
    // at most one hour of each of the 56 nights.
    expect(checked).toBe(1344);
    expect(straddling).toBeGreaterThan(0);
    expect(straddling).toBeLessThanOrEqual(56);
  });
});

describe("where the Sun does not rise there is no planetary hour", () => {
  // Tromso. No standard sunrise from 26 November to 15 January and no sunset
  // from 17 May to 25 July (measured by the reference over 2025; its tests raise
  // ValueError for both). 2025-12-21 is a Sunday and 2025-06-21 a Saturday.
  const TROMSO = new PlanetaryHourCalculator(69.6492, 18.9553);

  it("getPlanetaryHour throws rather than guess, as it always did", () => {
    expect(() => TROMSO.getPlanetaryHour(new Date("2025-12-21T12:00:00Z"))).toThrow(
      /PlanetaryHourCalculator/,
    );
    expect(() => TROMSO.getPlanetaryHour(new Date("2025-06-21T12:00:00Z"))).toThrow(
      /PlanetaryHourCalculator/,
    );
  });

  it("getPlanetaryDay, which never threw, answers with the ruler of the local mean solar date", () => {
    expect(TROMSO.getPlanetaryDay(new Date("2025-12-21T12:00:00Z"))).toBe("Sun");
    expect(TROMSO.getPlanetaryDay(new Date("2025-06-21T12:00:00Z"))).toBe("Saturn");
  });
});
