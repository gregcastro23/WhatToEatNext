/**
 * A natal chart's sect belongs to the birth moment at the birthplace.
 *
 * The bug these pin: `agents/unified` called `alchemize(chartPositions)` with
 * neither a date nor a sect, so `date` defaulted to `new Date()` and sect was
 * resolved at the site's New York reference observer. A birth chart therefore
 * inherited "is it daytime in New York right now" — creating the same agent
 * twelve hours apart produced two different monicas, and the chart was not a
 * function of the chart at all.
 */
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import { isCurrentSkyDiurnal, isDiurnalAt } from "@/utils/astrology/positions";

/** A fixed, arbitrary natal chart. Values never change, so any difference in
 *  output can only come from sect. */
const CHART: Record<string, PlanetaryPosition> = {
  Sun: { sign: "leo", degree: 15, minute: 0, exactLongitude: 135 },
  Moon: { sign: "taurus", degree: 3, minute: 0, exactLongitude: 33 },
  Mercury: { sign: "virgo", degree: 2, minute: 0, exactLongitude: 152 },
  Venus: { sign: "cancer", degree: 20, minute: 0, exactLongitude: 110 },
  Mars: { sign: "aries", degree: 8, minute: 0, exactLongitude: 8 },
  Jupiter: { sign: "sagittarius", degree: 25, minute: 0, exactLongitude: 265 },
  Saturn: { sign: "capricorn", degree: 11, minute: 0, exactLongitude: 281 },
};

// Noon and midnight UTC on the same day — one is unambiguously day in New York,
// the other unambiguously night.
const NOON_UTC = new Date("2026-03-15T17:00:00Z"); // ~13:00 in New York
const MIDNIGHT_UTC = new Date("2026-03-15T05:00:00Z"); // ~01:00 in New York

describe("isDiurnalAt — sect at an arbitrary place and moment", () => {
  it("disagrees between two places at the SAME instant", () => {
    // Same moment: daytime in Tokyo, night in New York. If sect ignored
    // location these would be equal.
    const instant = new Date("2026-03-15T03:00:00Z"); // 12:00 Tokyo, 23:00 NY
    const tokyo = isDiurnalAt(instant, 35.68, 139.65);
    const newYork = isDiurnalAt(instant, 40.71, -74.01);

    expect(tokyo).toBe(true);
    expect(newYork).toBe(false);
    expect(tokyo).not.toBe(newYork);
  });

  it("disagrees between two moments at the SAME place", () => {
    expect(isDiurnalAt(NOON_UTC, 40.71, -74.01)).toBe(true);
    expect(isDiurnalAt(MIDNIGHT_UTC, 40.71, -74.01)).toBe(false);
  });

  it("isCurrentSkyDiurnal is exactly isDiurnalAt at the New York observer", () => {
    for (const d of [NOON_UTC, MIDNIGHT_UTC]) {
      expect(isCurrentSkyDiurnal(d)).toBe(isDiurnalAt(d, 40.7128, -74.006));
    }
  });
});

describe("alchemize — the diurnal override", () => {
  it("sect actually changes the result (non-vacuity guard)", () => {
    const day = alchemize(CHART, null, NOON_UTC, { diurnal: true });
    const night = alchemize(CHART, null, NOON_UTC, { diurnal: false });

    // If these were equal, every other assertion here would be meaningless.
    expect(day.monica).not.toBeCloseTo(night.monica, 6);
  });

  it("a natal chart is INDEPENDENT of when it is computed, once sect is pinned", () => {
    // The same birth chart, with its own sect supplied, evaluated under two
    // wildly different "now"s. This is the property the bug violated.
    const a = alchemize(CHART, null, NOON_UTC, { diurnal: true });
    const b = alchemize(CHART, null, MIDNIGHT_UTC, { diurnal: true });

    expect(a.monica).toBeCloseTo(b.monica, 12);
  });

  it("WITHOUT the override, the same chart yields different monicas by clock", () => {
    // Demonstrates the defect directly: no override → sect follows the date,
    // so the identical natal chart reads differently at noon vs midnight.
    const noon = alchemize(CHART, null, NOON_UTC);
    const midnight = alchemize(CHART, null, MIDNIGHT_UTC);

    expect(noon.monica).not.toBeCloseTo(midnight.monica, 6);
  });

  it("the override wins over the date", () => {
    // NOON_UTC is diurnal in NY, but an explicit nocturnal override must win.
    const forced = alchemize(CHART, null, NOON_UTC, { diurnal: false });
    const natural = alchemize(CHART, null, MIDNIGHT_UTC); // genuinely nocturnal

    expect(forced.monica).toBeCloseTo(natural.monica, 12);
  });

  it("omitting the override preserves the previous behaviour exactly", () => {
    // Back-compat: every existing live-sky caller must be untouched.
    for (const d of [NOON_UTC, MIDNIGHT_UTC]) {
      const implicit = alchemize(CHART, null, d);
      const explicit = alchemize(CHART, null, d, {
        diurnal: isCurrentSkyDiurnal(d),
      });
      expect(implicit.monica).toBeCloseTo(explicit.monica, 12);
    }
  });
});
