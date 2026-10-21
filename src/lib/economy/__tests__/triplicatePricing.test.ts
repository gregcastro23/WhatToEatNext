import {
  aspectSeparation,
  buildResonanceWindowKey,
  checkEquilibriumProgress,
  evaluateTriplicateSynastry,
  orbTightness,
} from "@/lib/economy/triplicatePricing";

describe("triplicatePricing", () => {
  it("aspectSeparation calculates angular distance on circle (0-180)", () => {
    expect(aspectSeparation(10, 20)).toBe(10);
    expect(aspectSeparation(350, 10)).toBe(20);
    expect(aspectSeparation(0, 180)).toBe(180);
    expect(aspectSeparation(10, 200)).toBe(170);
  });

  it("orbTightness yields 1.0 at exact aspect and 0 at maxOrb", () => {
    expect(orbTightness(0, 6)).toBe(1);
    expect(orbTightness(6, 6)).toBe(0);
    expect(orbTightness(7, 6)).toBe(0);
    expect(orbTightness(3, 6)).toBeCloseTo(0.5, 2);
  });

  it("buildResonanceWindowKey sorts agent IDs deterministically", () => {
    const key1 = buildResonanceWindowKey({
      makerId: "agent-a",
      takerId: "agent-b",
      transitPlanet: "Sun",
      aspectType: "trine",
      dateBucketUtc: "2026-10-17-H1",
    });
    const key2 = buildResonanceWindowKey({
      makerId: "agent-b",
      takerId: "agent-a",
      transitPlanet: "Sun",
      aspectType: "trine",
      dateBucketUtc: "2026-10-17-H1",
    });
    expect(key1).toBe("triplicate_window:agent-a:agent-b:sun:trine:2026-10-17-H1");
    expect(key2).toBe(key1);
  });

  describe("checkEquilibriumProgress", () => {
    const prices = { Spirit: 1.0, Essence: 1.0, Matter: 1.0, Substance: 1.0 };

    it("accepts a trade that strictly reduces portfolio variance for both parties", () => {
      // Maker has surplus Spirit (20) and deficit Essence (0)
      const maker = { spirit: 20, essence: 0, matter: 10, substance: 10 };
      // Taker has surplus Essence (20) and deficit Spirit (0)
      const taker = { spirit: 0, essence: 20, matter: 10, substance: 10 };

      // Swap 5 Spirit for 5 Essence
      const result = checkEquilibriumProgress({
        makerHoldings: maker,
        takerHoldings: taker,
        giveToken: "Spirit",
        giveAmount: 5,
        wantToken: "Essence",
        wantAmount: 5,
        prices,
      });

      expect(result.ok).toBe(true);
    });

    it("rejects a trade where variance is identical (flipping imbalance from one axis to another)", () => {
      // Maker has [20, 0, 10, 10] -> swapping 20 Spirit for 20 Essence yields [0, 20, 10, 10] (same variance)
      const maker = { spirit: 20, essence: 0, matter: 10, substance: 10 };
      const taker = { spirit: 0, essence: 20, matter: 10, substance: 10 };

      const result = checkEquilibriumProgress({
        makerHoldings: maker,
        takerHoldings: taker,
        giveToken: "Spirit",
        giveAmount: 20,
        wantToken: "Essence",
        wantAmount: 20,
        prices,
      });

      expect(result.ok).toBe(false);
      expect(result.reason).toContain("does not reduce Maker portfolio imbalance");
    });

    it("rejects a trade that worsens imbalance", () => {
      // Maker has [20, 0, 10, 10], trying to acquire MORE Spirit
      const maker = { spirit: 20, essence: 0, matter: 10, substance: 10 };
      const taker = { spirit: 0, essence: 20, matter: 10, substance: 10 };

      const result = checkEquilibriumProgress({
        makerHoldings: maker,
        takerHoldings: taker,
        giveToken: "Essence",
        giveAmount: 5,
        wantToken: "Spirit",
        wantAmount: 5,
        prices,
      });

      expect(result.ok).toBe(false);
    });
  });

  describe("evaluateTriplicateSynastry", () => {
    it("detects harmonious Grand Trine and computes symmetric rebate", () => {
      // Agent A: Sun at 10 deg Aries (Fire, exactLongitude = 10)
      const natalA = [
        { planet: "Sun", sign: "aries", degree: 10, exactLongitude: 10 },
        { planet: "Jupiter", sign: "leo", degree: 10, exactLongitude: 130 },
      ];
      // Agent B: Mars at 10 deg Sagittarius (Fire, exactLongitude = 250)
      const natalB = [
        { planet: "Mars", sign: "sagittarius", degree: 10, exactLongitude: 250 },
        { planet: "Moon", sign: "cancer", degree: 5, exactLongitude: 95 },
      ];
      // Transit Sky: Transit Venus at 10 deg Leo (Fire, exactLongitude = 130) closing Grand Trine
      const transitPositions = {
        Venus: { sign: "leo", degree: 10, exactLongitude: 130 },
        Sun: { sign: "aries", degree: 10, exactLongitude: 10 },
      };

      const evalResult = evaluateTriplicateSynastry({
        makerId: "maker-1",
        takerId: "taker-2",
        makerNatal: natalA,
        takerNatal: natalB,
        giveToken: "Spirit",
        giveAmount: 10,
        wantToken: "Essence",
        wantAmount: 10,
        transitPositions,
      });

      expect(evalResult.beta).toBeGreaterThanOrEqual(0.05);
      expect(evalResult.qualifies).toBe(true);
      expect(evalResult.makerRebateAmount).toBeCloseTo(10 * evalResult.beta, 3);
      expect(evalResult.takerRebateAmount).toBeCloseTo(10 * evalResult.beta, 3);
      expect(evalResult.windowKey).toMatch(/^triplicate_window:maker-1:taker-2:/);
    });
  });
});
