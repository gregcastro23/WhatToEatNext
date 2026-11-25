import {
  ESMS_K_MAX,
  LEDGER_ESMS_MAX,
  formatLedgerEsms,
  formatStoredLedgerEsms,
  parseLedgerEsms,
  quantizeClaimAmounts,
  quantizeEsms,
  quantizeLedgerEsms,
} from "@/lib/economy/esmsQuantization";

describe("esmsQuantization ledger claim-bridge helpers", () => {
  it("floors rather than rounds and handles production-scale balances above ESMS_K_MAX", () => {
    expect(quantizeLedgerEsms(1.99999)).toBe(19_999);
    expect(quantizeLedgerEsms(1 - Number.EPSILON)).toBe(9_999);
    expect(quantizeLedgerEsms(0.00009999)).toBe(0);
    expect(quantizeLedgerEsms(1e-7)).toBe(0);
    expect(quantizeLedgerEsms(0)).toBe(0);
    expect(quantizeLedgerEsms(4599.35)).toBe(45_993_500);
    expect(quantizeLedgerEsms(LEDGER_ESMS_MAX)).toBe(999_999_999_999);
    expect(() => quantizeEsms(4599.35)).toThrow(TypeError);
    expect(ESMS_K_MAX).toBe(100);
  });

  it("is 100% lossless across exact 4-dp DECIMAL(12,4) values where float multiplication drifts", () => {
    expect(Math.floor(0.0003 * 10_000)).toBe(2);
    expect(Math.floor(0.0029 * 10_000)).toBe(28);
    for (let u = 0; u <= 20_000; u++) {
      const parsedFromPg = Number.parseFloat(formatLedgerEsms(u));
      expect(quantizeLedgerEsms(parsedFromPg)).toBe(u);
    }
  });

  it("satisfies sub-additivity conservation q(a) + q(b) <= q(a + b)", () => {
    const pairs: Array<[number, number]> = [
      [0.12349, 0.12349],
      [12.34569, 98.76549],
      [4599.35009, 0.00019],
    ];
    for (const [a, b] of pairs) {
      expect(quantizeLedgerEsms(a) + quantizeLedgerEsms(b)).toBeLessThanOrEqual(
        quantizeLedgerEsms(a + b),
      );
    }
  });

  it("fails closed on non-finite, negative, or overflowing ledger balances", () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0.0001, LEDGER_ESMS_MAX + 1]) {
      expect(() => quantizeLedgerEsms(bad)).toThrow(TypeError);
      expect(() => formatStoredLedgerEsms(bad)).toThrow(TypeError);
    }
  });

  it("round-trips formatLedgerEsms and parseLedgerEsms without scientific notation", () => {
    const cases: Array<[number, string]> = [
      [0, "0.0000"],
      [1, "0.0001"],
      [29, "0.0029"],
      [9_999, "0.9999"],
      [10_000, "1.0000"],
      [45_993_500, "4599.3500"],
      [999_999_999_999, "99999999.9999"],
    ];
    for (const [units, expected] of cases) {
      const formatted = formatLedgerEsms(units);
      expect(formatted).toBe(expected);
      expect(parseLedgerEsms(formatted)).toBe(units);
    }
    expect(parseLedgerEsms("42")).toBe(420_000);
    expect(parseLedgerEsms("1.5")).toBe(15_000);
  });

  it("rejects malformed or out-of-range ledger strings and unit counts", () => {
    for (const bad of ["", "-1.0000", "1.12345", "1e-4", "abc", "100000000.0000"]) {
      expect(() => parseLedgerEsms(bad)).toThrow(TypeError);
    }
    for (const badUnits of [-1, 1.5, 1_000_000_000_000, Number.NaN]) {
      expect(() => formatLedgerEsms(badUnits)).toThrow(TypeError);
    }
  });

  it("preserves stored DECIMAL(12,4) retry amounts without float-multiplication drift", () => {
    expect(Math.floor(0.0029 * 10_000)).toBe(28); // binary-float trap on naive re-flooring
    expect(formatStoredLedgerEsms(0.0029)).toBe("0.0029");
    expect(formatStoredLedgerEsms(0.0058)).toBe("0.0058");
    expect(formatStoredLedgerEsms(4599.35)).toBe("4599.3500");
  });

  it("quantizes all four axes once with exact parity between strings and numeric amounts", () => {
    const result = quantizeClaimAmounts({
      spirit: 4599.35009,
      essence: 0,
      matter: 0.00019,
      substance: 13.81,
    });
    expect(result.units).toEqual({
      spirit: 45_993_500,
      essence: 0,
      matter: 1,
      substance: 138_100,
    });
    expect(result.decimalStrings).toEqual({
      spirit: "4599.3500",
      essence: "0.0000",
      matter: "0.0001",
      substance: "13.8100",
    });
    expect(result.numericAmounts).toEqual({
      spirit: 4599.35,
      essence: 0,
      matter: 0.0001,
      substance: 13.81,
    });
    expect(result.totalUnits).toBe(46_131_601);

    const zero = quantizeClaimAmounts({ spirit: 0.00009, essence: 0, matter: 0, substance: 0 });
    expect(zero.totalUnits).toBe(0);
  });
});
