import { planetaryAlignmentAlchemy } from "@/services/RealAlchemizeService";
import { unifiedRecommendationService } from "@/services/UnifiedRecommendationService";

// A realistic, varied alignment spanning all four elements and both sects.
const ALIGNMENT = {
  Sun: { sign: "leo", degree: 15 },
  Moon: { sign: "cancer", degree: 10 },
  Mercury: { sign: "virgo", degree: 2 },
  Venus: { sign: "libra", degree: 20 },
  Mars: { sign: "aries", degree: 8 },
  Jupiter: { sign: "sagittarius", degree: 25 },
  Saturn: { sign: "capricorn", degree: 12 },
};

describe("planetaryAlignmentAlchemy (canonical engine adapter)", () => {
  it("derives real, finite kalchm and monica from the ESMS axes", () => {
    const sig = planetaryAlignmentAlchemy(ALIGNMENT);
    expect(Number.isFinite(sig.kalchm)).toBe(true);
    expect(Number.isFinite(sig.monica)).toBe(true);
    const esmsSum =
      sig.esms.Spirit + sig.esms.Essence + sig.esms.Matter + sig.esms.Substance;
    expect(esmsSum).toBeGreaterThan(0);
  });

  it("returns a normalized elemental profile reflecting the alignment (not flat 0.25)", () => {
    const { Fire, Water, Earth, Air } = planetaryAlignmentAlchemy(ALIGNMENT).elementalProperties;
    expect(Fire + Water + Earth + Air).toBeCloseTo(1, 5);
    const allQuarter = [Fire, Water, Earth, Air].every((v) => Math.abs(v - 0.25) < 1e-9);
    expect(allQuarter).toBe(false);
  });

  it("tolerates positions without degree/minute (the sign alone drives the result)", () => {
    const sig = planetaryAlignmentAlchemy({ Sun: { sign: "leo" }, Moon: { sign: "taurus" } });
    expect(Number.isFinite(sig.kalchm)).toBe(true);
    expect(Number.isFinite(sig.monica)).toBe(true);
  });
});

describe("UnifiedRecommendationService.calculateThermodynamics (honest elemental-only path)", () => {
  it("computes real heat/entropy/reactivity/gregsEnergy from the elemental balance", () => {
    const t = unifiedRecommendationService.calculateThermodynamics({
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.1,
      Air: 0.3,
    });
    expect(Number.isFinite(t.heat)).toBe(true);
    expect(Number.isFinite(t.entropy)).toBe(true);
    expect(Number.isFinite(t.reactivity)).toBe(true);
    expect(Number.isFinite(t.gregsEnergy)).toBe(true);
    expect(t.heat).toBeCloseTo((0.4 + 0.3) / 2, 10);
  });

  it("returns NaN for kalchm/monica — not derivable from elementals (no fabricated 1.0)", () => {
    const t = unifiedRecommendationService.calculateThermodynamics({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    });
    expect(Number.isNaN(t.kalchm)).toBe(true);
    expect(Number.isNaN(t.monica)).toBe(true);
  });
});

describe("UnifiedRecommendationService.getRecommendationsForPlanetaryAlignment", () => {
  type AlchemyCtx = {
    base?: boolean;
    elementalProperties: { Fire: number; Water: number; Earth: number; Air: number };
    alchemy?: {
      kalchm: number;
      monica: number;
      esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
    };
  };

  afterEach(() => jest.restoreAllMocks());

  it("drives recommendations with real elementals and attaches the real alchemy signature", async () => {
    // Isolate from the recipe/ingredient/cuisine data path — we are asserting the
    // alchemy wiring, not the downstream recommendation engine.
    jest
      .spyOn(unifiedRecommendationService, "getRecommendationsForElements")
      .mockResolvedValue({ items: [], scores: {}, context: { base: true } });

    const result = await unifiedRecommendationService.getRecommendationsForPlanetaryAlignment(
      ALIGNMENT,
      "cuisine",
    );
    const ctx = result.context as AlchemyCtx;

    expect(ctx.base).toBe(true); // base context preserved
    const ep = ctx.elementalProperties;
    expect(ep.Fire + ep.Water + ep.Earth + ep.Air).toBeCloseTo(1, 5);
    expect(ctx.alchemy).toBeDefined();
    expect(Number.isFinite(ctx.alchemy!.kalchm)).toBe(true);
    expect(Number.isFinite(ctx.alchemy!.monica)).toBe(true);
    expect(ctx.alchemy!.esms.Spirit).toBeGreaterThanOrEqual(0);
  });
});
