/**
 * Golden vectors for the environmental physics layer.
 *
 * These pin the math to values that exist OUTSIDE this repo — the ISA standard
 * atmosphere, published geohash vectors, and a live Open-Meteo reading captured
 * on 2026-07-30. A test that only checks the code against itself would have
 * happily blessed the sea-level-pressure bug this file exists to prevent.
 *
 * @file src/__tests__/environmentalPhysics.test.ts
 */

import {
  ENVIRONMENT_GEOHASH_PRECISION,
  decodeGeohashCenter,
  encodeGeohash,
  sampleHourForGeohash,
} from "@/lib/environment/geohash";
import {
  SEA_LEVEL_PRESSURE_KPA,
  elevationFromPressure,
  isPlausibleStationPressure,
  pressureFromElevation,
} from "@/lib/environment/isa";
import { assertStationPressure } from "@/lib/environment/openMeteoClient";
import {
  MAD_TO_SIGMA,
  madSigma,
  median,
  robustStat,
  robustZScore,
} from "@/lib/environment/robustStats";

// `[MEASURED 2026-07-30]` Open-Meteo, Denver (39.7392, -104.9903).
// Captured live; both fields at the same timestamp.
const DENVER_ELEVATION_M = 1599;
const DENVER_SURFACE_PRESSURE_KPA = 84.04; // surface_pressure: 840.4 hPa
const DENVER_MSL_PRESSURE_KPA = 100.6; // pressure_msl:   1006.0 hPa

describe("ISA barometric formula", () => {
  it("returns standard pressure at sea level", () => {
    expect(pressureFromElevation(0)).toBeCloseTo(SEA_LEVEL_PRESSURE_KPA, 6);
  });

  it("matches published values at real elevations", () => {
    // Denver ~1599 m → ~83.5 kPa; Mexico City ~2240 m → ~77.2 kPa.
    expect(pressureFromElevation(DENVER_ELEVATION_M)).toBeCloseTo(83.53, 1);
    expect(pressureFromElevation(2240)).toBeCloseTo(77.16, 1);
  });

  it("round-trips through the inverse", () => {
    for (const elevation of [0, 500, 1599, 2240, 3640, 5100]) {
      expect(elevationFromPressure(pressureFromElevation(elevation))).toBeCloseTo(elevation, 3);
    }
  });

  it("refuses elevations above the troposphere ceiling", () => {
    expect(() => pressureFromElevation(12_000)).toThrow(/troposphere/i);
  });

  it("refuses a non-finite elevation rather than producing NaN", () => {
    expect(() => pressureFromElevation(Number.NaN)).toThrow(RangeError);
  });
});

describe("station pressure vs sea-level pressure — the MSLP trap", () => {
  it("accepts a real station reading at elevation", () => {
    expect(isPlausibleStationPressure(DENVER_SURFACE_PRESSURE_KPA, DENVER_ELEVATION_M)).toBe(true);
    expect(() =>
      assertStationPressure(DENVER_SURFACE_PRESSURE_KPA, DENVER_ELEVATION_M),
    ).not.toThrow();
  });

  it("rejects the sea-level-adjusted reading for the same place and time", () => {
    // This is the whole point. pressure_msl looks like a perfectly ordinary
    // pressure — it is simply the wrong one, and using it silently erases the
    // largest term in the engine.
    expect(isPlausibleStationPressure(DENVER_MSL_PRESSURE_KPA, DENVER_ELEVATION_M)).toBe(false);
    expect(() => assertStationPressure(DENVER_MSL_PRESSURE_KPA, DENVER_ELEVATION_M)).toThrow(
      /pressure_msl instead of surface_pressure/,
    );
  });

  it("quantifies the error the trap would cause", () => {
    // The two fields differ by ~16.6 kPa at Denver. At the Clausius-Clapeyron
    // slope of 0.281 °C/kPa that is ~4.7 °C of boiling point — larger than any
    // weather anomaly this engine will ever report.
    const deltaKpa = DENVER_MSL_PRESSURE_KPA - DENVER_SURFACE_PRESSURE_KPA;
    expect(deltaKpa).toBeGreaterThan(15);
    expect(deltaKpa * 0.281).toBeGreaterThan(4);
  });

  it("still accepts genuine synoptic extremes at sea level", () => {
    // A deep low (950 hPa) must not be mistaken for a wrong-field ingestion,
    // and neither must the record low (870 hPa, Typhoon Tip) or a strong high.
    expect(isPlausibleStationPressure(95.0, 0)).toBe(true);
    expect(isPlausibleStationPressure(87.0, 0)).toBe(true);
    expect(isPlausibleStationPressure(108.4, 0)).toBe(true);
  });

  it("declines to judge below the discrimination floor", () => {
    // Under ~600 m, MSLP and station pressure are closer together than ordinary
    // weather moves either one. The honest answer is "cannot tell", which this
    // returns as plausible rather than inventing a verdict.
    expect(isPlausibleStationPressure(101.3, 200)).toBe(true);
    expect(isPlausibleStationPressure(99.0, 200)).toBe(true);
  });

  it("discriminates by which hypothesis the reading is closer to", () => {
    // Mexico City, 2240 m → ISA baseline ~77.2 kPa.
    expect(isPlausibleStationPressure(77.5, 2240)).toBe(true); // real station reading
    expect(isPlausibleStationPressure(101.0, 2240)).toBe(false); // sea-level-adjusted

    // A storm at altitude is still nearer its own baseline than sea level.
    expect(isPlausibleStationPressure(74.0, 2240)).toBe(true);
  });
});

describe("robust statistics", () => {
  it("computes median for odd and even samples", () => {
    expect(median([3, 1, 5, 2, 4])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it("refuses an empty sample rather than returning zero", () => {
    // A fabricated zero baseline would propagate into every anomaly the
    // location ever reports.
    expect(() => median([])).toThrow(RangeError);
    expect(() => madSigma([])).toThrow(RangeError);
  });

  it("scales MAD to a sigma-equivalent", () => {
    expect(madSigma([1, 2, 3, 4, 5])).toBeCloseTo(1 * MAD_TO_SIGMA, 6);
  });

  it("resists an outlier that would wreck a classical sigma", () => {
    const withOutlier = [1, 2, 3, 4, 100];
    const stat = robustStat(withOutlier);

    // Median is unmoved by the outlier.
    expect(stat.median).toBe(3);
    expect(stat.madSigma).toBeCloseTo(1.4826, 4);

    // A classical sigma would be ~43 — thirty times wider — and would rate the
    // outlier as barely 2 sigma, suppressing exactly the alert it should raise.
    const mean = withOutlier.reduce((a, b) => a + b, 0) / withOutlier.length;
    const classicalSigma = Math.sqrt(
      withOutlier.reduce((acc, v) => acc + (v - mean) ** 2, 0) / withOutlier.length,
    );
    expect(classicalSigma).toBeGreaterThan(20 * stat.madSigma);

    // Against the robust baseline the outlier is unmistakable.
    expect(robustZScore(100, stat)!).toBeGreaterThan(50);
  });

  it("returns null — not Infinity — for a degenerate baseline", () => {
    // Every observation identical: the window genuinely cannot say how unusual
    // today is, and the honest answer is "unknown".
    const flat = robustStat([10, 10, 10, 10, 10]);
    expect(flat.madSigma).toBe(0);
    expect(robustZScore(99, flat)).toBeNull();
  });

  it("returns null for a non-finite observation", () => {
    expect(robustZScore(Number.NaN, robustStat([1, 2, 3]))).toBeNull();
  });
});

describe("geohash", () => {
  it("matches the published reference vector", () => {
    // The canonical (57.64911, 10.40744) → "u4pruydqqvj" example.
    expect(encodeGeohash(57.64911, 10.40744, 11)).toBe("u4pruydqqvj");
    expect(encodeGeohash(57.64911, 10.40744, 5)).toBe("u4pru");
  });

  it("encodes the null island", () => {
    expect(encodeGeohash(0, 0, 5)).toBe("s0000");
  });

  it("defaults to the environmental precision", () => {
    expect(encodeGeohash(39.7392, -104.9903)).toHaveLength(ENVIRONMENT_GEOHASH_PRECISION);
  });

  it("decodes to a centre inside the original cell", () => {
    const geohash = encodeGeohash(39.7392, -104.9903, 5);
    const center = decodeGeohashCenter(geohash);
    // A p5 cell is ~4.9 km, so the centre is within ~0.05° of any point in it.
    expect(Math.abs(center.latitude - 39.7392)).toBeLessThan(0.05);
    expect(Math.abs(center.longitude - -104.9903)).toBeLessThan(0.05);
    expect(encodeGeohash(center.latitude, center.longitude, 5)).toBe(geohash);
  });

  it("rejects out-of-range coordinates instead of wrapping", () => {
    expect(() => encodeGeohash(91, 0)).toThrow(RangeError);
    expect(() => encodeGeohash(0, 181)).toThrow(RangeError);
  });

  it("derives a stable sampling hour in range", () => {
    const geohash = encodeGeohash(39.7392, -104.9903, 5);
    const hour = sampleHourForGeohash(geohash);
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThan(24);
    // Deterministic: the same cell must sample at the same hour every day, or
    // the semidiurnal tide leaks back into the window's dispersion.
    expect(sampleHourForGeohash(geohash)).toBe(hour);
  });

  it("spreads distinct cells across different hours", () => {
    const hours = new Set(
      ["u4pru", "s0000", "9xj64", "gcpvj", "dr5re", "xn774", "6gyf4", "kzf24"].map(
        sampleHourForGeohash,
      ),
    );
    // Not a uniformity proof — just that the derivation is not degenerate, which
    // would stampede the whole fleet into one cron minute.
    expect(hours.size).toBeGreaterThan(1);
  });
});
