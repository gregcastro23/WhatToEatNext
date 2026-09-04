/**
 * PlanetaryHoursClient — local-fallback characterisation.
 *
 * The local fallback is the DEFAULT path: `useBackend` is only true when
 * NEXT_PUBLIC_PLANETARY_HOURS_BACKEND === "true", so in most deployments every
 * planetary-hour read lands here.
 *
 * It used to call `(calculator.getCurrentPlanetaryHour as any)(targetDate)`.
 * `getCurrentPlanetaryHour()` takes NO arguments and returns no boundaries, so
 * the cast silently dropped the caller's requested time (every answer was for
 * "now") and left `start`/`end` permanently undefined — while the backend path
 * of the same method returns both. The cast was hiding a wrong method name:
 * `getDetailedPlanetaryHour(date)` is the one that takes a date and returns
 * boundaries, which is what the local variable `detailed` was always named for.
 *
 * These assertions pin both halves so the bug cannot return.
 */
import { PlanetaryHoursClient } from "@/services/PlanetaryHoursClient";

describe("PlanetaryHoursClient local fallback", () => {
  // New York. Any mid-latitude fix works; the assertions below are
  // timezone-independent by construction.
  const location = { latitude: 40.7128, longitude: -74.006 };

  // Deliberately far from "now". If the requested date were ignored, the
  // returned boundaries would sit around the current instant and could not
  // possibly bracket this one.
  const requested = new Date("2026-01-15T17:00:00.000Z");

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_PLANETARY_HOURS_BACKEND;
  });

  it("returns real hour boundaries that bracket the requested instant", async () => {
    const client = new PlanetaryHoursClient();
    const result = await client.getCurrentPlanetaryHour({
      datetime: requested,
      location,
    });

    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);

    const start = (result.start as Date).getTime();
    const end = (result.end as Date).getTime();
    const target = requested.getTime();

    expect(start).toBeLessThanOrEqual(target);
    expect(end).toBeGreaterThanOrEqual(target);
    // A planetary hour is one twelfth of a day or night period: always > 0,
    // and never a whole day even at the solstice extremes of this latitude.
    expect(end).toBeGreaterThan(start);
    expect(end - start).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it("honours the supplied datetime rather than answering for 'now'", async () => {
    const client = new PlanetaryHoursClient();
    const morning = await client.getCurrentPlanetaryHour({
      datetime: new Date("2026-01-15T13:00:00.000Z"),
      location,
    });
    const evening = await client.getCurrentPlanetaryHour({
      datetime: new Date("2026-01-16T01:00:00.000Z"),
      location,
    });

    // Twelve hours apart at this latitude: one is a day hour, the other a
    // night hour. Under the old cast both calls computed for the same "now"
    // and were therefore identical.
    expect(morning.isDaytime).not.toBe(evening.isDaytime);
    expect((morning.start as Date).getTime()).not.toBe(
      (evening.start as Date).getTime(),
    );
  });
});
