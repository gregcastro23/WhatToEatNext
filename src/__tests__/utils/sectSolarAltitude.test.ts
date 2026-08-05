/**
 * Sect = the Sun's real altitude above the birthplace horizon.
 *
 * The 06:00–18:00 UTC window this replaces was never a definition of sect — it
 * was a proxy for "the Sun is up", and one phrased in clock hours with no
 * horizon anywhere in it. These cases pin the places the proxy and the sky
 * actually disagree, because on the current production population they agree
 * everywhere (VERIFIED: 0 of 6 migrated rows change sect), so a suite built only
 * from prod data would pass with the proxy still in place and prove nothing.
 *
 * Altitudes below are astronomy-engine's, computed at the stated instant and
 * place; the `> 0` horizon crossing is the sect boundary.
 */

import {
  isSectDiurnal,
  isSectDiurnalForBirth,
} from "@/utils/planetaryAlchemyMapping";

const BROOKLYN = { latitude: 40.6526006, longitude: -73.9497211 };
const TROMSO = { latitude: 69.6496, longitude: 18.956 }; // inside the Arctic Circle

describe("sect from true solar altitude", () => {
  it("agrees with the retired clock proxy on every migrated production row", () => {
    // MEASURED 2026-08-04 against prod. Listed as {wall clock, true instant}
    // pairs so the fixture stays honest about which field drives which half.
    const PROD = [
      { utcInstant: "1991-06-23T18:24:00.000Z", ...BROOKLYN, expected: true }, // alt +65.05°
      { utcInstant: "1996-10-21T14:28:00.000Z", latitude: 40.7956894, longitude: -73.6989103, expected: true }, // +30.07°
      { utcInstant: "2021-10-10T14:21:00.000Z", latitude: 40.7135078, longitude: -73.8283132, expected: true }, // +32.44°
      { utcInstant: "1984-01-04T09:05:00.000Z", latitude: 2.8208478, longitude: -60.6719582, expected: false }, // −14.91°
    ];
    for (const row of PROD) {
      expect(
        isSectDiurnalForBirth({ dateTime: row.utcInstant, ...row }),
      ).toBe(row.expected);
    }
  });

  it("reads an evening birth as diurnal while the Sun is still up", () => {
    // 19:00 local in Brooklyn in late June — Sun at +14.70°, plainly daylight.
    // The proxy called this NOCTURNAL because 23:00 UTC falls outside 06:00–18:00.
    const birth = { dateTime: "1991-06-23T23:00:00.000Z", utcInstant: "1991-06-23T23:00:00.000Z", ...BROOKLYN };
    expect(isSectDiurnalForBirth(birth)).toBe(true);
    expect(isSectDiurnal(new Date(birth.utcInstant))).toBe(false); // the old answer
  });

  it("handles the midnight sun — 02:00 local inside the Arctic Circle in June", () => {
    // Sun at +4.22°: above the horizon at 2am. Sect is diurnal, and no
    // clock-hour rule can ever produce that answer.
    const birth = { dateTime: "2021-06-21T00:00:00.000Z", utcInstant: "2021-06-21T00:00:00.000Z", ...TROMSO };
    expect(isSectDiurnalForBirth(birth)).toBe(true);
    expect(isSectDiurnal(new Date(birth.utcInstant))).toBe(false);
  });

  it("handles the polar night — noon local inside the Arctic Circle in December", () => {
    // Sun at −2.51°: below the horizon at midday. Sect is nocturnal.
    const birth = { dateTime: "2021-12-21T11:00:00.000Z", utcInstant: "2021-12-21T11:00:00.000Z", ...TROMSO };
    expect(isSectDiurnalForBirth(birth)).toBe(false);
    expect(isSectDiurnal(new Date(birth.utcInstant))).toBe(true);
  });

  it("resolves the horizon crossing itself, not a rounded hour", () => {
    // Sunrise in Brooklyn on 1991-06-23 is ~09:25Z. Ten minutes either side of
    // it must land on opposite sides of the boundary — a granularity no
    // whole-hour window can express.
    const before = { dateTime: "1991-06-23T09:15:00.000Z", utcInstant: "1991-06-23T09:15:00.000Z", ...BROOKLYN };
    const after = { dateTime: "1991-06-23T09:35:00.000Z", utcInstant: "1991-06-23T09:35:00.000Z", ...BROOKLYN };
    expect(isSectDiurnalForBirth(before)).toBe(false);
    expect(isSectDiurnalForBirth(after)).toBe(true);
  });
});

describe("documented degradation, never silent", () => {
  it("falls back to the clock proxy when the row has no true instant", () => {
    // Unmigrated row: `dateTime` is a wall clock, which is not an instant, so
    // computing an altitude from it would be an altitude for the wrong moment.
    // Previous behaviour is preserved deliberately.
    const unmigrated = { dateTime: "1991-06-23T14:24:00.000Z", ...BROOKLYN };
    expect(isSectDiurnalForBirth(unmigrated)).toBe(isSectDiurnal(new Date("1991-06-23T14:24:00.000Z")));
  });

  it("falls back to the clock proxy when the row has no coordinates", () => {
    const noPlace = { dateTime: "1991-06-23T18:24:00.000Z", utcInstant: "1991-06-23T18:24:00.000Z" };
    expect(isSectDiurnalForBirth(noPlace)).toBe(false); // 18:24Z is outside 06:00–18:00
  });

  it("still accepts a bare Date for legacy callers", () => {
    expect(isSectDiurnalForBirth(new Date("1991-06-23T14:24:00.000Z"))).toBe(true);
    expect(isSectDiurnalForBirth(new Date("1991-06-23T23:00:00.000Z"))).toBe(false);
  });

  it("ignores a malformed instant rather than throwing", () => {
    const bad = { dateTime: "1991-06-23T14:24:00.000Z", utcInstant: "not-a-date", ...BROOKLYN };
    expect(isSectDiurnalForBirth(bad)).toBe(true); // falls through to the wall clock
  });
});
