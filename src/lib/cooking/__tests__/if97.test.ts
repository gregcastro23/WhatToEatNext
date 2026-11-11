import {
  region1EnthalpyKjKg,
  region2EnthalpyKjKg,
  saturationPressureMpa,
  saturationStateAtPressure,
  saturationTemperatureC,
  saturationTemperatureK,
} from "../if97";
import {
  REGION1_IJN,
  REGION2_IDEAL_JN,
  REGION2_RESIDUAL_IJN,
  REGION4_N,
} from "../if97Coefficients";
import transcription from "./fixtures/if97-transcription.json";

/** Fixture rows as numbers: every printed string parsed, every index kept. */
function asNumbers(rows: ReadonlyArray<ReadonlyArray<string | number>>): number[][] {
  return rows.map((row) => row.map((cell) => (typeof cell === "number" ? cell : Number(cell))));
}

/**
 * The verification values below are printed to nine digits, so they cannot
 * see a slip in the 10th–14th digit of a coefficient (MEASURED: two such
 * mutants survived them). This second, independent transcription can: it was
 * read from the release PDF and agreed digit-for-digit with two open-source
 * implementations. A typo now has to be made twice, identically, to pass.
 */
describe("IF97 coefficients vs an independent transcription", () => {
  it("region 4 n1…n10", () => {
    expect([...REGION4_N]).toEqual(transcription.region4_n.map(Number));
  });
  it("region 1, 34 rows", () => {
    expect(REGION1_IJN.map((r) => [...r])).toEqual(asNumbers(transcription.region1));
  });
  it("region 2 ideal-gas, 9 rows", () => {
    expect(REGION2_IDEAL_JN.map((r) => [...r])).toEqual(asNumbers(transcription.region2_ideal));
  });
  it("region 2 residual, 43 rows", () => {
    expect(REGION2_RESIDUAL_IJN.map((r) => [...r])).toEqual(asNumbers(transcription.region2_residual));
  });
});

/**
 * IAPWS-IF97 against the release's own computer-program verification values.
 *
 * The release prints nine significant digits, so the assertion is that the
 * computed value ROUNDS to the printed one — exact agreement at the stated
 * precision, not "close". These points reach every coefficient row with J ≠ 0
 * (enthalpy multiplies each term by J, so J = 0 rows are covered only by the
 * transcription check above). A wrong exponent in region-2 residual row 35
 * (π^20) left every low-pressure value untouched and moved h(700 K, 30 MPa) by
 * 26.9 kJ·kg⁻¹, which is why the 30 MPa point stays even though the vessel
 * never sees it.
 */
function expectPrinted(got: number, printed: string): void {
  expect(Number(got.toPrecision(9))).toBe(Number(printed));
}

describe("IF97 verification values (R7-97(2012))", () => {
  it.each([
    [300, 3, "0.115331273e3"],
    [300, 80, "0.184142828e3"],
    [500, 3, "0.975542239e3"],
  ])("Table 5: region 1 h(T=%s K, p=%s MPa) = %s kJ/kg", (t, p, printed) => {
    expectPrinted(region1EnthalpyKjKg(p, t), printed);
  });

  it.each([
    [300, 0.0035, "0.254991145e4"],
    [700, 0.0035, "0.333568375e4"],
    [700, 30, "0.263149474e4"],
  ])("Table 15: region 2 h(T=%s K, p=%s MPa) = %s kJ/kg", (t, p, printed) => {
    expectPrinted(region2EnthalpyKjKg(p, t), printed);
  });

  it.each([
    [300, "0.353658941e-2"],
    [500, "0.263889776e1"],
    [600, "0.123443146e2"],
  ])("Table 35: p_s(%s K) = %s MPa", (t, printed) => {
    expectPrinted(saturationPressureMpa(t), printed);
  });

  it.each([
    [0.1, "0.372755919e3"],
    [1, "0.453035632e3"],
    [10, "0.584149488e3"],
  ])("Table 36: T_s(%s MPa) = %s K", (p, printed) => {
    expectPrinted(saturationTemperatureK(p), printed);
  });
});

/**
 * Cross-check against an independent formulation.
 *
 * BASIS: NIST Chemistry WebBook, water (C7732185), saturation properties,
 * pressure increments, retrieved 2026-11-11. NIST computes from IAPWS-95, of
 * which IF97 is a fit, so the two agree closely but not exactly. The
 * tolerances are the MEASURED maximum differences at these five points
 * (T_s 0.00223 K at 250 kPa, h′ 0.0670 kJ/kg at 101.325 kPa, h″ 0.0279 kJ/kg
 * at 10 kPa), rounded up to 0.005 / 0.1 / 0.05 — this test
 * catches a broken implementation, the verification table above proves a
 * correct one.
 */
describe("IF97 saturated states vs NIST (IAPWS-95)", () => {
  const NIST: ReadonlyArray<readonly [number, number, number, number]> = [
    [10, 45.80633, 191.8059, 2583.859],
    [50, 81.31689, 340.5419, 2645.215],
    [101.325, 99.9743, 419.0577, 2675.529],
    [198.67, 119.9993, 503.8087, 2705.925],
    [250, 127.4114, 535.345, 2716.49],
  ];

  it.each(NIST)("%s kPa", (pressureKpa, tsatC, hLiquid, hVapor) => {
    const s = saturationStateAtPressure(pressureKpa);
    expect(Math.abs(s.tsatC - tsatC)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(s.liquidKjKg - hLiquid)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(s.vaporKjKg - hVapor)).toBeLessThanOrEqual(0.05);
    expect(s.latentKjKg).toBe(s.vaporKjKg - s.liquidKjKg);
  });

  it("puts the open pot's boil at 99.974 °C, not 100 °C", () => {
    // 100 °C is the boiling point at 101.418 kPa; ISA sea level is lower.
    expect(saturationTemperatureC(101.325).toFixed(3)).toBe("99.974");
  });
});

describe("IF97 validity envelope", () => {
  it("refuses pressures outside region 4", () => {
    expect(() => saturationTemperatureK(0.0006)).toThrow(RangeError);
    expect(() => saturationTemperatureK(22.1)).toThrow(RangeError);
    expect(() => saturationTemperatureK(Number.NaN)).toThrow(RangeError);
  });

  it("refuses temperatures outside region 4", () => {
    expect(() => saturationPressureMpa(273.1)).toThrow(RangeError);
    expect(() => saturationPressureMpa(647.2)).toThrow(RangeError);
  });

  it("accepts region 4's own end-points, which the release includes", () => {
    expect(() => saturationPressureMpa(273.15)).not.toThrow();
    expect(() => saturationPressureMpa(647.096)).not.toThrow();
    expect(() => saturationTemperatureK(611.213e-6)).not.toThrow();
    expect(() => saturationTemperatureK(22.064)).not.toThrow();
  });

  it("refuses saturated states that fall in region 3", () => {
    // 20 MPa saturates at ~638.9 K, above the 623.15 K edge of regions 1 and 2.
    expect(() => saturationStateAtPressure(20_000)).toThrow(/region 3/);
    expect(() => saturationStateAtPressure(16_000)).not.toThrow();
  });
});
