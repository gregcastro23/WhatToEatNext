/**
 * The Elemental Exchange Index — oracle core (ADR-011).
 *
 * Every test injects positions and a fixed instant; nothing reads ambient
 * time or the live ephemeris (the repo convention: test the mechanism, not
 * the ambient). The negative controls exist because the sibling prototype
 * failed exactly these ways: a composite pinned constant forever, a price
 * blind to within-sign motion, a sparkline computed with a different formula
 * than the headline, and fabricated quotes on engine failure.
 */

import {
  BASELINE_WEIGHT,
  PER_TOKEN_MAX,
  PER_TOKEN_MIN,
  PERSONALIZATION_SCALE,
  globalMultiplierForANumber,
} from "@/lib/economy/livePricing";
import {
  ORACLE_BUCKET_MS,
  SPARKLINE_POINTS,
  buildPriceIndexSnapshot,
  clearPriceIndexMemo,
  computeSkySample,
  getLivePriceIndexSnapshot,
  type PositionsProvider,
} from "@/lib/economy/priceIndex";
import type { PlanetPositionData } from "@/utils/astrology/positions";

// 2026-07-20 12:00 UTC = 08:00 EDT — comfortably diurnal at the canonical NY
// observer, well clear of twilight (the positions.test.ts convention).
const FIXED_DATE = new Date("2026-07-20T12:00:00.000Z");

const SIGN_INDEX: Record<string, number> = {
  aries: 0, taurus: 1, gemini: 2, cancer: 3, leo: 4, virgo: 5,
  libra: 6, scorpio: 7, sagittarius: 8, capricorn: 9, aquarius: 10, pisces: 11,
};

function planetAt(
  sign: string,
  degree: number,
  isRetrograde = false,
): PlanetPositionData {
  return {
    sign: sign as PlanetPositionData["sign"],
    degree,
    exactLongitude: SIGN_INDEX[sign] * 30 + degree,
    isRetrograde,
  };
}

/** A plausible mid-2026 sky. Weights are non-uniform by construction. */
function fixtureSky(): Record<string, PlanetPositionData> {
  return {
    Sun: planetAt("cancer", 28.2),
    Moon: planetAt("taurus", 12.4),
    Mercury: planetAt("leo", 5.1),
    Venus: planetAt("gemini", 20.7),
    Mars: planetAt("virgo", 3.9),
    Jupiter: planetAt("cancer", 10.3),
    Saturn: planetAt("aries", 2.1, true),
    Uranus: planetAt("gemini", 1.6),
    Neptune: planetAt("aries", 2.8, true),
    Pluto: planetAt("aquarius", 3.2, true),
  };
}

const constantProvider =
  (sky: Record<string, PlanetPositionData>): PositionsProvider =>
  () => ({ positions: sky, degraded: null });

describe("computeSkySample — the EEI formula", () => {
  it("round-trips from livePricing's own constants (no copied numbers)", () => {
    const sample = computeSkySample(fixtureSky(), FIXED_DATE);
    const tokens = ["Spirit", "Essence", "Matter", "Substance"] as const;
    for (const token of tokens) {
      const w = sample.weights[token];
      const expected =
        globalMultiplierForANumber(sample.aNumber) *
        (1 - PERSONALIZATION_SCALE * ((w - BASELINE_WEIGHT) / 2));
      // aNumber and eei are rounded to 4dp independently; allow that much.
      expect(Math.abs(sample.eei[token] - expected)).toBeLessThan(1e-3);
      expect(sample.eei[token]).toBeGreaterThanOrEqual(PER_TOKEN_MIN);
      expect(sample.eei[token]).toBeLessThanOrEqual(PER_TOKEN_MAX);
    }
  });

  it("weights are a simplex and the four quotes are NOT all equal on a real sky", () => {
    const sample = computeSkySample(fixtureSky(), FIXED_DATE);
    const sum =
      sample.weights.Spirit +
      sample.weights.Essence +
      sample.weights.Matter +
      sample.weights.Substance;
    expect(sum).toBeCloseTo(1, 10);
    const values = new Set(Object.values(sample.eei));
    expect(values.size).toBeGreaterThan(1);
  });

  it("THROWS on an empty sky instead of quoting — a broken engine must never price", () => {
    // The prototype's route swallowed this and served $1.0000 under
    // success:true. The throw is the design boundary that forbids it.
    expect(() => computeSkySample({}, FIXED_DATE)).toThrow(/unusable ESMS total/);
  });
});

describe("buildPriceIndexSnapshot — determinism and honesty", () => {
  it("is a pure function of (bucket, provider): identical on replay", () => {
    const a = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(fixtureSky()));
    const b = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(fixtureSky()));
    expect(b).toEqual(a);
  });

  it("pins to the minute bucket: +30s identical, +61s a new bucket", () => {
    const base = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(fixtureSky()));
    const same = buildPriceIndexSnapshot(
      new Date(FIXED_DATE.getTime() + 30_000),
      constantProvider(fixtureSky()),
    );
    const next = buildPriceIndexSnapshot(
      new Date(FIXED_DATE.getTime() + 61_000),
      constantProvider(fixtureSky()),
    );
    expect(same.bucketStartUtc).toBe(base.bucketStartUtc);
    expect(next.bucketStartUtc).not.toBe(base.bucketStartUtc);
  });

  it("composite equals the global multiplier (anti-'pinned at 1.175': it MOVES with A)", () => {
    const snapshot = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(fixtureSky()));
    // mean(EEI) = m exactly, pre-rounding: the (w − baseline) terms sum to 0
    // over the simplex and the clamps never bind on valid weights.
    const mean =
      snapshot.tokens.reduce((acc, t) => acc + t.index, 0) / snapshot.tokens.length;
    expect(Math.abs(mean - snapshot.multiplier)).toBeLessThan(1e-3);
    // The composite is a function of the sky, not a constant of the model:
    // a different sky with a different A-number moves it.
    const shifted = fixtureSky();
    shifted.Moon = planetAt("virgo", 21.9); // different sign AND degree
    const other = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(shifted));
    expect(other.compositeIndex).not.toBe(snapshot.compositeIndex);
  });

  it("moves when a planet changes SIGN (the sign-blind collapse is not reintroduced)", () => {
    const a = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(fixtureSky()));
    const moved = fixtureSky();
    moved.Moon = planetAt("virgo", 12.4); // same degree, different sign
    const b = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(moved));
    expect(b.tokens.map((t) => t.index)).not.toEqual(a.tokens.map((t) => t.index));
  });

  it("moves WITHIN a sign (degree-level dignity + aspects reach the index)", () => {
    // The prototype froze for days between ingresses because its alchemy
    // loop read only the sign label. Venus 5° → 25° gemini crosses term and
    // face boundaries and re-orbs every aspect; the quotes must move.
    const early = fixtureSky();
    early.Venus = planetAt("gemini", 5.2);
    const late = fixtureSky();
    late.Venus = planetAt("gemini", 25.2);
    const a = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(early));
    const b = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(late));
    expect(b.tokens.map((t) => t.index)).not.toEqual(a.tokens.map((t) => t.index));
  });

  it("a frozen sky reports 0.00% — the only intra-window motion is the real sect flip", () => {
    // Even with the planets frozen, the Earth still turns: alchemize applies
    // the diurnal/nocturnal ESMS table per sample instant, so the 24h window
    // contains AT MOST two distinct values (one per sect branch) — and the
    // endpoints, 24h apart at the same wall-clock, share a sect, so the
    // headline change is exactly 0. Decorative motion beyond the sect flip
    // (the prototype's synthetic sines) would fail this test.
    const snapshot = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(fixtureSky()));
    for (const token of snapshot.tokens) {
      expect(token.change24hPct).toBe(0);
      expect(token.sparkline[0]).toBe(token.sparkline[token.sparkline.length - 1]);
      expect(new Set(token.sparkline).size).toBeLessThanOrEqual(2);
      expect(token.sparkline).toHaveLength(SPARKLINE_POINTS);
    }
  });

  it("the sparkline's last point IS the headline quote (one formula, one series)", () => {
    // Provider that moves the Moon over the window, so the series is not flat.
    const provider: PositionsProvider = (date) => {
      const sky = fixtureSky();
      const hoursFromStart =
        (date.getTime() - (FIXED_DATE.getTime() - 24 * 3_600_000)) / 3_600_000;
      // ~13°/day lunar motion, degree-level only, staying inside taurus.
      sky.Moon = planetAt("taurus", 3 + hoursFromStart * 0.54);
      return { positions: sky, degraded: null };
    };
    const snapshot = buildPriceIndexSnapshot(FIXED_DATE, provider);
    let anyChange = false;
    for (const token of snapshot.tokens) {
      expect(token.sparkline[token.sparkline.length - 1]).toBe(token.index);
      if (token.change24hPct !== 0) anyChange = true;
      // change24h must recompute from the same series' endpoints.
      const implied =
        (token.index / token.sparkline[0] - 1) * 100;
      expect(Math.abs(token.change24hPct - implied)).toBeLessThan(0.01);
    }
    expect(anyChange).toBe(true);
  });

  it("propagates the positions util's degraded reasons instead of hiding them", () => {
    const provider: PositionsProvider = () => ({
      positions: fixtureSky(),
      degraded: { reasons: ["stale-positions"] },
    });
    const snapshot = buildPriceIndexSnapshot(FIXED_DATE, provider);
    expect(snapshot.degraded).toContain("stale-positions");
  });

  it("throws (does not quote) when the provider yields an empty sky", () => {
    const provider: PositionsProvider = () => ({ positions: {}, degraded: null });
    expect(() => buildPriceIndexSnapshot(FIXED_DATE, provider)).toThrow();
  });
});

describe("[GOLDEN] fixture-sky pins", () => {
  // Pinned from execution under the jest runner (the repo's pin discipline).
  // These move ONLY when the canonical engine moves (sect table, dignity
  // manifest, aspect layer, inertial weights) — that is the point: the
  // oracle must notice engine drift, and this test is where it surfaces.
  // Re-derive by running this suite and reading the received values; never
  // hand-edit one number in isolation.
  it("pins the full quote row for the 2026-07-20 fixture sky", () => {
    const snapshot = buildPriceIndexSnapshot(FIXED_DATE, constantProvider(fixtureSky()));
    // Scarcity polarity, visible in the pins: Spirit carries half the sky
    // (w 0.5029) and is the CHEAPEST quote; Substance is scarcest (w 0.0404)
    // and the DEAREST. mean(index) = multiplier to 4dp.
    expect(snapshot.aNumber).toBe(6.3484);
    expect(snapshot.multiplier).toBe(0.8635);
    expect(snapshot.tokens.map((t) => t.index)).toEqual([0.8089, 0.8355, 0.9008, 0.9087]);
    expect(snapshot.tokens.map((t) => t.weight)).toEqual([0.5029, 0.3795, 0.0772, 0.0404]);
    expect(snapshot.compositeIndex).toBe(0.8635);
    expect(snapshot.sunSign).toBe("cancer");
    expect(snapshot.dominantElement).toBe("Air");
    expect(snapshot.isDiurnal).toBe(true);
  });
});

describe("getLivePriceIndexSnapshot — the per-bucket memo", () => {
  beforeEach(() => clearPriceIndexMemo());

  it("returns the identical object within a bucket and a fresh one across buckets", () => {
    // The live wrapper uses the real ephemeris; two calls in one bucket must
    // hit the memo (object identity), which is what makes concurrent polls
    // agree on one instance.
    const a = getLivePriceIndexSnapshot(FIXED_DATE);
    const b = getLivePriceIndexSnapshot(new Date(FIXED_DATE.getTime() + 10_000));
    expect(b).toBe(a);
    const c = getLivePriceIndexSnapshot(
      new Date(FIXED_DATE.getTime() + ORACLE_BUCKET_MS),
    );
    expect(c).not.toBe(a);
  });
});
