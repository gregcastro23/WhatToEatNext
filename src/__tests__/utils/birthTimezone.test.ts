/**
 * Guards the wall-clock ↔ absolute-instant boundary for birth data.
 *
 * Two things are pinned here, and they fail for different reasons:
 *
 *   RESOLUTION — the zone a birth record resolves to, and the exact historical
 *     offset at that instant. This is what makes the two prod `UTC-5` rows come
 *     out at −4 (they are EDT births), and what catches the row whose IANA
 *     string names a different continent than its coordinates.
 *
 *   HOST INDEPENDENCE — none of it may read the runner's clock. The suite forces
 *     TZ=Pacific/Auckland before importing, plus a meta-assertion that the runner
 *     honoured it, because a TZ-keyed guard that silently goes blind is worse
 *     than no guard: it passes on a UTC CI box while the bug ships.
 *
 * Every fixture below is a MEASURED prod row (2026-08-04) or a documented tzdata
 * transition, never an invented convenience value.
 */

// Must precede the import under test: Date's local getters bind at construction.
process.env.TZ = "Pacific/Auckland";

import {
  isIanaZone,
  parseRawOffsetMinutes,
  resolveBirthZone,
  zoneOffsetMinutes,
  wallClockToInstant,
  instantToWallClock,
} from "@/utils/astrology/birthTimezone";

/** The 8 human birth records in prod, measured 2026-08-04. */
const PROD_ROWS = [
  {
    id: "57672a00",
    stored: "1958-10-01T16:00:00.000Z",
    stz: "America/New_York",
    lat: 40.75,
    lon: -73.798,
    zone: "America/New_York",
    offset: -240,
    instant: "1958-10-01T20:00:00.000Z",
  },
  {
    id: "5f40a6e5",
    stored: "1984-01-04T05:05:00.000Z",
    stz: "America/New_York",
    lat: 2.8208478,
    lon: -60.6719582,
    zone: "America/Boa_Vista", // ← coordinates are Brazil; the stored string is not
    offset: -240,
    instant: "1984-01-04T09:05:00.000Z",
  },
  {
    id: "9726fa59",
    stored: "1990-04-20T04:20:00.000Z",
    stz: "America/New_York",
    lat: 40.75,
    lon: -73.798,
    zone: "America/New_York",
    offset: -240,
    instant: "1990-04-20T08:20:00.000Z",
  },
  {
    id: "2ee5eb05",
    stored: "1991-06-23T14:24:00.000Z",
    stz: "America/New_York",
    lat: 40.6526006,
    lon: -73.9497211,
    zone: "America/New_York",
    offset: -240,
    instant: "1991-06-23T18:24:00.000Z",
  },
  {
    id: "3de96e89",
    stored: "1996-10-21T10:28:00.000Z",
    stz: "UTC-5", // ← raw offset, and wrong: this is an EDT date
    lat: 40.7956894,
    lon: -73.6989103,
    zone: "America/New_York",
    offset: -240,
    instant: "1996-10-21T14:28:00.000Z",
  },
  {
    id: "5e813bbf",
    stored: "2021-10-10T10:21:00.000Z",
    stz: "UTC-5",
    lat: 40.7135078,
    lon: -73.8283132,
    zone: "America/New_York",
    offset: -240,
    instant: "2021-10-10T14:21:00.000Z",
  },
] as const;

describe("birth timezone resolution", () => {
  it("runs under a non-UTC host, or the host-independence claims below are vacuous", () => {
    // Meta-assertion. If the runner ignored process.env.TZ this suite would
    // still pass every other case while proving nothing about host independence.
    expect(new Date("2021-07-01T00:00:00Z").getTimezoneOffset()).not.toBe(0);
  });

  it.each(PROD_ROWS)(
    "resolves $id from coordinates, not from its stored string",
    ({ stz, lat, lon, zone }) => {
      const r = resolveBirthZone({ latitude: lat, longitude: lon, timezone: stz });
      expect(r.zone).toBe(zone);
      expect(r.basis).toBe("DERIVED_FROM_COORDINATES");
    },
  );

  it.each(PROD_ROWS)(
    "converts $id's wall clock to the true instant at the real historical offset",
    ({ stored, stz, lat, lon, zone, offset, instant }) => {
      const r = resolveBirthZone({ latitude: lat, longitude: lon, timezone: stz });
      const res = wallClockToInstant(new Date(stored), r.zone as string);
      expect(res.resolution).toBe("UNIQUE");
      expect(res.offsetMinutes).toBe(offset);
      expect(res.instant.toISOString()).toBe(instant);
      expect(zoneOffsetMinutes(zone, res.instant)).toBe(offset);
    },
  );

  it("flags the row whose IANA string names a different continent than its pin", () => {
    const boaVista = PROD_ROWS.find((r) => r.id === "5f40a6e5")!;
    const r = resolveBirthZone({
      latitude: boaVista.lat,
      longitude: boaVista.lon,
      timezone: boaVista.stz,
    });
    expect(r.zone).toBe("America/Boa_Vista");
    expect(r.storedTimezone).toBe("America/New_York");
    expect(r.storedDisagrees).toBe(true);
    expect(r.storedIsRawOffset).toBe(false);
  });

  it("prices the two UTC-5 rows at −4, because both are EDT births", () => {
    // This is the whole point of resolving through tzdata rather than the
    // literal string: taking `UTC-5` at face value is an hour wrong on both.
    for (const id of ["3de96e89", "5e813bbf"] as const) {
      const row = PROD_ROWS.find((r) => r.id === id)!;
      const r = resolveBirthZone({ latitude: row.lat, longitude: row.lon, timezone: row.stz });
      expect(r.storedIsRawOffset).toBe(true);
      expect(parseRawOffsetMinutes(row.stz)).toBe(-300); // what the string claims
      expect(wallClockToInstant(new Date(row.stored), r.zone as string).offsetMinutes).toBe(-240);
    }
  });
});

describe("IANA validation", () => {
  it("rejects the shapes the retired estimateTimezone emitted", () => {
    expect(isIanaZone("UTC-5")).toBe(false);
    expect(isIanaZone("UTC+13")).toBe(false);
    expect(isIanaZone("")).toBe(false);
    expect(isIanaZone(undefined)).toBe(false);
    expect(isIanaZone("Not/AZone")).toBe(false);
  });

  it("accepts real IANA names, including the fixed-offset Etc/* family", () => {
    expect(isIanaZone("America/New_York")).toBe(true);
    expect(isIanaZone("America/Boa_Vista")).toBe(true);
    expect(isIanaZone("Etc/GMT+5")).toBe(true);
    expect(isIanaZone("UTC")).toBe(true);
  });

  it("parses raw offsets for reporting without ever accepting them as zones", () => {
    expect(parseRawOffsetMinutes("UTC-5")).toBe(-300);
    expect(parseRawOffsetMinutes("UTC+13")).toBe(780);
    expect(parseRawOffsetMinutes("GMT+5:30")).toBe(330);
    expect(parseRawOffsetMinutes("America/New_York")).toBeNull();
    expect(parseRawOffsetMinutes("UTC+99")).toBeNull();
  });

  it("refuses to substitute a raw offset for a zone when coordinates are absent", () => {
    const r = resolveBirthZone({ latitude: null, longitude: null, timezone: "UTC-5" });
    expect(r.zone).toBeNull();
    expect(r.basis).toBe("ABSENT");
    expect(r.storedIsRawOffset).toBe(true);
  });

  it("falls back to a stored IANA name only when coordinates are unusable", () => {
    const r = resolveBirthZone({ latitude: null, longitude: null, timezone: "America/New_York" });
    expect(r.zone).toBe("America/New_York");
    expect(r.basis).toBe("STORED_IANA_STRING");
  });
});

describe("DST edges are detected, not papered over", () => {
  // US DST 2021: forward 2021-03-14 02:00 → 03:00, back 2021-11-07 02:00 → 01:00.
  it("reports the spring-forward gap as NONEXISTENT", () => {
    const res = wallClockToInstant(new Date("2021-03-14T02:30:00.000Z"), "America/New_York");
    expect(res.resolution).toBe("NONEXISTENT");
  });

  it("reports the fall-back overlap as AMBIGUOUS and returns the earlier pass", () => {
    const res = wallClockToInstant(new Date("2021-11-07T01:30:00.000Z"), "America/New_York");
    expect(res.resolution).toBe("AMBIGUOUS");
    expect(res.offsetMinutes).toBe(-240); // EDT — the first of the two 01:30s
    expect(res.instant.toISOString()).toBe("2021-11-07T05:30:00.000Z");
  });

  it("treats an ordinary wall clock either side of a transition as UNIQUE", () => {
    for (const w of ["2021-03-14T04:30:00.000Z", "2021-11-07T03:30:00.000Z"]) {
      expect(wallClockToInstant(new Date(w), "America/New_York").resolution).toBe("UNIQUE");
    }
  });
});

describe("round-trip", () => {
  it("recovers the stored wall clock from the true instant", () => {
    for (const row of PROD_ROWS) {
      const r = resolveBirthZone({ latitude: row.lat, longitude: row.lon, timezone: row.stz });
      const { instant } = wallClockToInstant(new Date(row.stored), r.zone as string);
      // This is the invariant the dual-storage model rests on: local_wall_time is
      // recoverable from true_utc_instant + zone, so nothing is lost by storing both.
      expect(instantToWallClock(instant, r.zone as string).toISOString()).toBe(row.stored);
    }
  });

  it("is unaffected by the host zone", () => {
    // Same inputs, evaluated while the process sits in Pacific/Auckland (UTC+12).
    // Any local getter anywhere in the chain would show up here as a 12h error.
    const row = PROD_ROWS.find((r) => r.id === "2ee5eb05")!;
    const res = wallClockToInstant(new Date(row.stored), "America/New_York");
    expect(res.instant.toISOString()).toBe("1991-06-23T18:24:00.000Z");
    expect(zoneOffsetMinutes("Pacific/Auckland", new Date("1991-06-23T18:24:00Z"))).toBe(720);
  });
});
