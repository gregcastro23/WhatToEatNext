/**
 * The planetary hour's solar day must be resolved at the COORDINATES, never at
 * the host's timezone.
 *
 * All three SunCalc call sites in PlanetaryHourCalculator used to build their
 * day basis from `new Date(date.getFullYear(), date.getMonth(), date.getDate())`
 * — midnight in the RUNNER'S zone — and then ask for solar times at a different
 * longitude. Those disagree whenever they land on opposite sides of a date
 * boundary, which is the normal case in production: Vercel runs UTC, so for a
 * New York fix (lng -74) the synthesized midnight 2026-01-15T00:00:00Z is
 * 2026-01-14 19:00 local and SunCalc returned the PREVIOUS day's sunrise and
 * sunset — wrong ruling planet, wrong isDaytime, wrong boundaries.
 *
 * These assertions are deliberately TIMEZONE-INDEPENDENT. They sweep longitudes
 * either side of the meridian so the bug is caught wherever the suite runs, not
 * only on a UTC runner: a developer in New York would otherwise see the
 * western cases pass and never learn the eastern ones were broken.
 */
import { PlanetaryHourCalculator } from "@/lib/PlanetaryHourCalculator";

const PLACES = [
  { name: "New York", latitude: 40.7128, longitude: -74.006 },
  { name: "London", latitude: 51.5072, longitude: -0.1276 },
  { name: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
  { name: "Auckland", latitude: -36.8485, longitude: 174.7633 },
];

// Spread across the clock so both day and night hours are exercised.
const INSTANTS = [
  "2026-01-15T02:00:00.000Z",
  "2026-01-15T09:00:00.000Z",
  "2026-01-15T17:00:00.000Z",
  "2026-06-21T12:00:00.000Z",
];

const DAY_MS = 24 * 60 * 60 * 1000;

describe("planetary hour boundaries are resolved at the coordinates", () => {
  for (const place of PLACES) {
    for (const iso of INSTANTS) {
      it(`${place.name} @ ${iso} — the returned hour contains the instant`, () => {
        const when = new Date(iso);
        const calc = new PlanetaryHourCalculator(place.latitude, place.longitude);
        const hour = calc.getDetailedPlanetaryHour(when);

        expect(hour.start).toBeInstanceOf(Date);
        expect(hour.end).toBeInstanceOf(Date);

        const start = hour.start.getTime();
        const end = hour.end.getTime();

        // The whole point: the hour you are told you are in must be the hour
        // that actually contains the instant you asked about.
        expect(start).toBeLessThanOrEqual(when.getTime());
        expect(end).toBeGreaterThanOrEqual(when.getTime());

        // A planetary hour is one twelfth of a day or night period, so it is
        // always positive and always well under a day.
        expect(end).toBeGreaterThan(start);
        expect(end - start).toBeLessThan(DAY_MS);
      });
    }
  }
});
