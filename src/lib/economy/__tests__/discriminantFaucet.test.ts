import {
  calculateChartBaseline,
  computeDiscriminantDailyYield,
  computeSynastryScore,
  DegradedEphemerisError,
  deriveTransitWeightsFromPositions,
  FALLBACK_NETWORK_SUPPLY,
  getLiveNetworkSupply,
  validateLedgerClamp,
} from "@/lib/economy/discriminant-faucet";
import {
  AXIS_FLOOR,
  PROTOCOL_BAND,
  type GlobalSupplyState,
} from "@/types/economy";
import { calculatePositionsWithAstronomyEngine } from "@/utils/serverPlanetaryCalculations";
import type { AlchemicalPlanetPositions } from "@/utils/planetaryAlchemyMapping";

const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const NEUTRAL_SUPPLY: GlobalSupplyState = {
  spirit: 25_000,
  essence: 25_000,
  matter: 25_000,
  substance: 25_000,
};

const NATAL_WEIGHTS = {
  spirit: 0.25,
  essence: 0.25,
  matter: 0.25,
  substance: 0.25,
};

function chartAt(longitudes: readonly number[]): AlchemicalPlanetPositions {
  return Object.fromEntries(
    PLANETS.map((planet, index) => {
      const longitude = ((longitudes[index % longitudes.length] ?? 0) % 360 + 360) % 360;
      return [
        planet,
        {
          sign: SIGNS[Math.floor(longitude / 30)] ?? "Aries",
          degree: longitude % 30,
          exactLongitude: longitude,
        },
      ];
    }),
  );
}

function liveSky(date: Date): AlchemicalPlanetPositions {
  const { positions, usedFallback } = calculatePositionsWithAstronomyEngine(date, {
    log: false,
  });
  if (usedFallback) throw new Error(`test ephemeris degraded at ${date.toISOString()}`);
  return positions;
}

describe("untethered discriminant faucet", () => {
  it("uses degree-level natal-to-current-sky resonance to change the total", () => {
    const natal = chartAt([0]);
    const exactConjunctionSky = chartAt([0]);
    const squareSky = chartAt([90]);
    const baseline = calculateChartBaseline(natal, 2026);

    const resonant = computeDiscriminantDailyYield({
      natalWeights: NATAL_WEIGHTS,
      natalPositions: natal,
      transitPositions: exactConjunctionSky,
      chartBaseline: baseline,
      supply: NEUTRAL_SUPPLY,
    });
    const tense = computeDiscriminantDailyYield({
      natalWeights: NATAL_WEIGHTS,
      natalPositions: natal,
      transitPositions: squareSky,
      chartBaseline: baseline,
      supply: NEUTRAL_SUPPLY,
    });

    expect(resonant.total).toBe(PROTOCOL_BAND.max);
    expect(tense.total).toBe(PROTOCOL_BAND.min);
    expect(resonant.total).not.toBe(12);
    expect(tense.total).not.toBe(12);
  });

  it("applies the specified 6-degree, linearly tapered aspect law", () => {
    const natal = chartAt([0]);
    const exactTrine = chartAt([120]);
    const halfOrbTrine = chartAt([123]);
    const outsideOrb = chartAt([126.01]);

    expect(computeSynastryScore(natal, exactTrine)).toBeCloseTo(100, 8);
    expect(computeSynastryScore(natal, halfOrbTrine)).toBeCloseTo(50, 8);
    expect(computeSynastryScore(natal, outsideOrb)).toBe(0);
  });

  it("responds to different actual moments within the same UTC day", () => {
    const natal = liveSky(new Date("1990-01-01T12:00:00Z"));
    const chartBaseline = calculateChartBaseline(natal, 2026);
    const totals = [0, 6, 12, 18].map((hour) => computeDiscriminantDailyYield({
      natalWeights: NATAL_WEIGHTS,
      natalPositions: natal,
      transitPositions: liveSky(new Date(Date.UTC(2026, 8, 12, hour))),
      chartBaseline,
      supply: NEUTRAL_SUPPLY,
    }).total);
    expect(new Set(totals).size).toBe(4);
  });

  it("preserves the specified clipping law without claiming clipped emission neutrality", () => {
    const natal = chartAt([0]);
    // Signed scores -50 and 100 average 25. The bounded payouts are 3 and
    // 24, averaging 13.5: raw-mean normalization is not clipped-mean neutrality.
    const skies = [chartAt([90]), chartAt([0])];
    const chartBaseline = calculateChartBaseline(natal, 2026, skies);
    expect(chartBaseline).toBe(25);
    const totals = skies.map((transitPositions) => computeDiscriminantDailyYield({
      natalWeights: NATAL_WEIGHTS, natalPositions: natal, transitPositions,
      chartBaseline, supply: NEUTRAL_SUPPLY,
    }).total);
    expect(totals).toEqual([3, 24]);
  });

  /**
   * An unrecognised sign must contribute nothing, never the -0.25 cross-polar
   * score. Two layers enforce this — `canonicalSign` drops the body, and the
   * `ELEMENT_BY_SIGN` miss returns 0 — so breaking either alone leaves the
   * other holding and this stays green. Red-proven only with both removed:
   * the score then goes to -25 (100 pairs x -0.25). Treat it as a pin on the
   * observable behaviour, not on either mechanism individually.
   */
  it("contributes nothing for an unrecognised sign, rather than scoring it", () => {
    const signOnly = (sign: string): AlchemicalPlanetPositions =>
      Object.fromEntries(PLANETS.map((planet) => [planet, sign]));

    const crossPolar = computeSynastryScore(signOnly("Aries"), signOnly("Cancer"));
    const sameElement = computeSynastryScore(signOnly("Aries"), signOnly("Leo"));
    const unrecognised = computeSynastryScore(signOnly("Aries"), signOnly("Ophiuchus"));

    expect(crossPolar).toBeLessThan(0);
    expect(sameElement).toBeGreaterThan(0);
    expect(unrecognised).toBe(0);
  });

  it("keeps every axis above its gas floor and conserves the variable total exactly", () => {
    const natal = chartAt([0, 120, 240]);
    const sky = chartAt([0, 30, 60, 90, 120, 150, 180, 210, 240, 270]);
    const result = computeDiscriminantDailyYield({
      natalWeights: { spirit: 1, essence: 0, matter: 0, substance: 0 },
      natalPositions: natal,
      transitPositions: sky,
      chartBaseline: calculateChartBaseline(natal, 2026),
      supply: { ...NEUTRAL_SUPPLY, matter: 100_000 },
    });

    expect(result.total).toBeGreaterThanOrEqual(PROTOCOL_BAND.min);
    expect(result.total).toBeLessThanOrEqual(PROTOCOL_BAND.max);
    expect(result.spirit).toBeGreaterThanOrEqual(AXIS_FLOOR);
    expect(result.essence).toBeGreaterThanOrEqual(AXIS_FLOOR);
    expect(result.matter).toBeGreaterThanOrEqual(AXIS_FLOOR);
    expect(result.substance).toBeGreaterThanOrEqual(AXIS_FLOOR);
    expect(
      Math.round(
        (result.spirit + result.essence + result.matter + result.substance) * 10_000,
      ) / 10_000,
    ).toBe(result.total);
    expect(() => validateLedgerClamp(result)).not.toThrow();
  });

  it("keeps the four 2026 reference fixtures within their measured emission bounds", () => {
    const charts = [
      chartAt([0]),
      chartAt([0, 120, 240]),
      chartAt([0, 36, 72, 108, 144, 180, 216, 252, 288, 324]),
      chartAt([14, 43, 81, 117, 154, 188, 221, 259, 302, 347]),
    ];
    const skies = Array.from({ length: 365 }, (_, day) =>
      liveSky(new Date(Date.UTC(2026, 0, day + 1, 12))),
    );

    const annual = charts.map((natal) => {
      const baseline = calculateChartBaseline(natal, 2026);
      return skies.reduce(
        (sum, transitPositions) =>
          sum +
          computeDiscriminantDailyYield({
            natalWeights: NATAL_WEIGHTS,
            natalPositions: natal,
            transitPositions,
            chartBaseline: baseline,
            supply: NEUTRAL_SUPPLY,
          }).total,
        0,
      );
    });

    const target = 365 * 12;
    for (const emitted of annual) {
      expect(emitted).toBeGreaterThanOrEqual(target * 0.95);
      expect(emitted).toBeLessThanOrEqual(target * 1.05);
    }
    expect(Math.max(...annual) / Math.min(...annual)).toBeLessThan(1.05);
  });

  /**
   * The test above sweeps 2026 against a 2026 baseline. The UNCLIPPED mean
   * ratio is 1 by construction; the clipped grants need not average 12.
   *
   * This is the out-of-sample pin. It sweeps years the engine was never
   * calibrated against, and it is the regression guard for a fixed epoch:
   * with `baselineEpochFor` frozen to a single year, chart-shape spread
   * measured 1.91x in 2027, 3.47x in 2029 and 4.99x in 2031 — reinstating the
   * shape exploit ADR-015 exists to close. Bounds below are set from measured
   * behaviour, not from the ADR's aspiration.
   */
  it("keeps the four reference fixtures within their measured multi-year bounds", () => {
    const charts = [
      chartAt([0]),
      chartAt([0, 120, 240]),
      chartAt([0, 36, 72, 108, 144, 180, 216, 252, 288, 324]),
      chartAt([14, 43, 81, 117, 154, 188, 221, 259, 302, 347]),
    ];

    for (const year of [2027, 2029, 2031]) {
      const skies = Array.from({ length: 365 }, (_, day) =>
        liveSky(new Date(Date.UTC(year, 0, day + 1, 12))),
      );

      const annual = charts.map((natal) => {
        // Deliberately NOT passing `skies` as samples: the baseline must come
        // from the engine's own epoch resolution, or this test stops guarding
        // it. (Passing samples here made a frozen-epoch red-proof pass.)
        const baseline = calculateChartBaseline(natal, year);
        return skies.reduce(
          (sum, transitPositions) =>
            sum +
            computeDiscriminantDailyYield({
              natalWeights: NATAL_WEIGHTS,
              natalPositions: natal,
              transitPositions,
              chartBaseline: baseline,
              supply: NEUTRAL_SUPPLY,
            }).total,
          0,
        );
      });

      // The anti-exploit invariant: no chart shape may out-earn another
      // materially. A frozen epoch drives this to 5x by 2031.
      expect(Math.max(...annual) / Math.min(...annual)).toBeLessThan(1.5);

      // Emission stays near the 12/day centre for a realistic chart. The
      // adversarial shapes are allowed a wider miss: band clamping truncates
      // their low tail asymmetrically (trine lattice measured -25.7% in 2029).
      const realistic = annual[annual.length - 1] ?? 0;
      expect(realistic).toBeGreaterThan(365 * 12 * 0.9);
      expect(realistic).toBeLessThan(365 * 12 * 1.1);
    }
  });

  it("returns a bit-identical baseline for the same chart and fixed epoch", () => {
    const natal = chartAt([14, 43, 81, 117, 154, 188, 221, 259, 302, 347]);
    expect(calculateChartBaseline(natal, 2026)).toBe(calculateChartBaseline(natal, 2026));
  });

  it("caches live circulating supply for five minutes", async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, "now").mockReturnValue(now);
    const query = jest.fn().mockResolvedValue({
      rows: [{ spirit: 10, essence: 20, matter: 40, substance: 30 }],
    });

    const first = await getLiveNetworkSupply(query);
    const second = await getLiveNetworkSupply(query);

    expect(first).toEqual({
      spirit: 10,
      essence: 20,
      matter: 40,
      substance: 30,
      total: 100,
      isDegraded: false,
    });
    expect(second).toEqual(first);
    expect(query).toHaveBeenCalledTimes(1);
    clock.mockReturnValue(now + 300_001);
    await getLiveNetworkSupply(query);
    expect(query).toHaveBeenCalledTimes(2);

    clock.mockReturnValue(now + 600_002);
    query.mockResolvedValue({ rows: [{ spirit: NaN, essence: 20, matter: 40, substance: 30 }] });
    expect(await getLiveNetworkSupply(query)).toEqual(FALLBACK_NETWORK_SUPPLY);
    clock.mockRestore();
  });

  it("refuses partial or corrupt current-sky geometry", () => {
    const partial = chartAt([0]);
    delete partial.Pluto;
    expect(() =>
      deriveTransitWeightsFromPositions(partial, { requireComplete: true }),
    ).toThrow(DegradedEphemerisError);

    const corrupt = chartAt([0]);
    corrupt.Mars = { sign: "not-a-sign", exactLongitude: Number.NaN };
    expect(() =>
      deriveTransitWeightsFromPositions(corrupt, { requireComplete: true }),
    ).toThrow(DegradedEphemerisError);
  });

  it.each([
    { sign: "Aries", degree: 1, exactLongitude: NaN },
    { sign: "Aries", degree: 1, exactLongitude: Infinity },
    { sign: "Aries", degree: 1, exactLongitude: 999 },
    { sign: "Aries", degree: 1, exactLongitude: -1 },
    { sign: "Aries", degree: 0, exactLongitude: 120 },
    { sign: "Aries", degree: 20, exactLongitude: 1 },
    { sign: "Aries", degree: NaN, exactLongitude: 1 },
  ])("rejects explicitly malformed or contradictory geometry: %j", (position) => {
    const sky = chartAt([0]);
    sky.Mars = position;
    expect(() => deriveTransitWeightsFromPositions(sky, { requireComplete: true }))
      .toThrow(DegradedEphemerisError);
  });

  it("accepts a genuine zero longitude and sign-relative reconstruction", () => {
    const sky = chartAt([0]);
    sky.Mars = { sign: "Taurus", degree: 4.5 };
    expect(() => deriveTransitWeightsFromPositions(sky, { requireComplete: true })).not.toThrow();
  });

  it.each([
    { spirit: 0.29995, essence: 0.70005, matter: 1, substance: 1, total: 3 },
    { spirit: 0.75001, essence: 0.75001, matter: 0.75001, substance: 0.75001, total: 3 },
    { spirit: 0.3, essence: 0.7, matter: 1, substance: 1.0001, total: 3 },
    { spirit: 0.3, essence: 0.7, matter: 1, substance: 1, total: 3.00001 },
    { spirit: NaN, essence: 0.7, matter: 1, substance: 1, total: 3 },
  ])("refuses nonquantized, sub-floor or nonconserving ledger amounts: %j", (distribution) => {
    expect(() => validateLedgerClamp(distribution)).toThrow(/Ledger clamp invariant breach/);
  });

  it("fails closed at the ledger boundary", () => {
    expect(() =>
      validateLedgerClamp({
        spirit: 0.3,
        essence: 0.3,
        matter: 0.3,
        substance: 0.3,
        total: 12,
      }),
    ).toThrow(/Ledger clamp invariant breach/);
  });
});
