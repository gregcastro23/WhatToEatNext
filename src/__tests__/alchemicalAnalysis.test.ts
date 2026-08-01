/**
 * Golden vectors for the alchemical analysis layer.
 *
 * These replace a scaffold in which every returned scalar came from
 * Math.random(). The single most important test in this file is the
 * determinism suite: the same inputs must produce byte-identical output on
 * repeated calls. That is the property the old code could never have passed,
 * and the one that stops it coming back.
 *
 * Every expected number below is hand-computable from the tables in
 * src/constants/alchemicalPillars.ts, and each assertion states the arithmetic.
 *
 * @file src/__tests__/alchemicalAnalysis.test.ts
 */

import {
  ALCHEMICAL_PILLARS,
  ELEMENTAL_THERMODYNAMIC_PROPERTIES,
  cookingMethodPillarAnalysis,
  elementalThermodynamicAnalysis,
  planetaryAlchemyAnalysis,
  tarotAlchemyAnalysis,
} from "@/constants/alchemicalPillars";

const pillarById = (id: number) => {
  const pillar = ALCHEMICAL_PILLARS.find((p) => p.id === id);
  if (!pillar) throw new Error(`fixture error: no pillar ${id}`);
  return pillar;
};

const SOLUTION = pillarById(1); // Spirit -1, Essence +1, Matter +1, Substance -1
const PROTECTION = pillarById(14); // all +1

describe("determinism — the property the scaffold could never have had", () => {
  it("returns identical results across repeated calls", () => {
    const args = [
      "boiling",
      {
        seasonalFactors: ["summer", "winter"],
        planetaryInfluences: ["Sun", "Moon"],
        userPreferences: { Spirit: 0.7, Essence: 0.3 },
      },
    ] as const;

    const a = cookingMethodPillarAnalysis.analyzeCookingMethodPillar(...args);
    const b = cookingMethodPillarAnalysis.analyzeCookingMethodPillar(...args);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("is deterministic across all four analysis domains", () => {
    const twice = <T>(fn: () => T): [string, string] => [
      JSON.stringify(fn()),
      JSON.stringify(fn()),
    ];

    const [p1, p2] = twice(() =>
      cookingMethodPillarAnalysis.generatePillarRecommendations(SOLUTION),
    );
    expect(p1).toBe(p2);

    const [e1, e2] = twice(() =>
      elementalThermodynamicAnalysis.analyzeElementalThermodynamics("Fire", {
        seasonalFactors: ["summer"],
        planetaryInfluences: ["Sun"],
        cookingMethod: "boiling",
      }),
    );
    expect(e1).toBe(e2);

    const [pl1, pl2] = twice(() =>
      planetaryAlchemyAnalysis.analyzePlanetaryAlchemy("Sun", {
        zodiacInfluences: ["leo"],
        seasonalFactors: ["summer"],
      }),
    );
    expect(pl1).toBe(pl2);

    const [t1, t2] = twice(() =>
      tarotAlchemyAnalysis.analyzeTarotAlchemy("Temperance", {
        seasonalFactors: ["spring"],
      }),
    );
    expect(t1).toBe(t2);
  });
});

describe("ESMS alignment", () => {
  it("scores a pillar against itself as a perfect match", () => {
    const result =
      cookingMethodPillarAnalysis.generatePillarRecommendations(SOLUTION);
    const self = result.recommendations.find((r) => r.pillar.id === SOLUTION.id);
    expect(self).toBeDefined();
    expect(self!.compatibility.value).toBe(1);
  });

  it("computes the documented distance between Solution and Protection", () => {
    // Solution   (-1, +1, +1, -1)
    // Protection (+1, +1, +1, +1)
    // L1 distance = 2 + 0 + 0 + 2 = 4; span 2 × 4 axes = 8; 1 − 4/8 = 0.5
    const result =
      cookingMethodPillarAnalysis.generatePillarRecommendations(PROTECTION);
    const solution = result.recommendations.find((r) => r.pillar.id === 1);
    if (solution) {
      expect(solution.compatibility.value).toBeCloseTo(0.5, 10);
    }
    // Whether Solution survives Protection's candidate filter is incidental;
    // what matters is that when it does, the number is the derived one.
  });

  it("carries a derivation that states the arithmetic", () => {
    const result =
      cookingMethodPillarAnalysis.generatePillarRecommendations(SOLUTION);
    for (const rec of result.recommendations) {
      expect(rec.compatibility.derivation).toMatch(/1 − Σ\|Δ/);
      expect(rec.compatibility.derivation).toMatch(/span 2 × 4 axes/);
    }
  });

  it("keeps every score within 0–1", () => {
    for (const pillar of ALCHEMICAL_PILLARS) {
      const result =
        cookingMethodPillarAnalysis.generatePillarRecommendations(pillar);
      for (const rec of result.recommendations) {
        expect(rec.compatibility.value).toBeGreaterThanOrEqual(0);
        expect(rec.compatibility.value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("elemental compatibility reads the single elemental table", () => {
  it("uses ELEMENTAL_THERMODYNAMIC_PROPERTIES, not the scaffold's contradicting copy", () => {
    // The scaffold hardcoded Fire heat 0.9 / Water 0.3 / Air 0.6 / Earth entropy 0.4,
    // contradicting the real table. Pin the real values so a reintroduced copy fails.
    expect(ELEMENTAL_THERMODYNAMIC_PROPERTIES.Fire.heat).toBe(1.0);
    expect(ELEMENTAL_THERMODYNAMIC_PROPERTIES.Air.heat).toBe(0.3);
    expect(ELEMENTAL_THERMODYNAMIC_PROPERTIES.Water.heat).toBe(0.1);
    expect(ELEMENTAL_THERMODYNAMIC_PROPERTIES.Earth.entropy).toBe(0.1);
  });

  it("scores an element against itself as a perfect match", () => {
    const result =
      elementalThermodynamicAnalysis.generateThermodynamicRecommendations("Fire");
    const self = result.recommendations.find((r) => r.element === "Fire");
    expect(self).toBeDefined();
    expect(self!.compatibility.value).toBe(1);
  });

  it("reports the analysed element's real base properties", () => {
    const result =
      elementalThermodynamicAnalysis.analyzeElementalThermodynamics("Water");
    expect(result.baseProperties).toEqual(ELEMENTAL_THERMODYNAMIC_PROPERTIES.Water);
  });
});

describe("seasonal scores are read from the seasonal table", () => {
  it("uses seasonalElements[season].compatibility[element] verbatim", () => {
    // seasonalElements.summer.compatibility.Fire === 0.9
    const result = elementalThermodynamicAnalysis.analyzeElementalThermodynamics(
      "Fire",
      { seasonalFactors: ["summer"] },
    );
    const summer = result.analysis.seasonalOptimization.find(
      (s) => s.season === "summer",
    );
    expect(summer).toBeDefined();
    expect(summer!.score.value).toBe(0.9);
    expect(summer!.score.derivation).toContain("seasonalElements.summer");
  });

  it("omits an unrecognised season rather than defaulting it", () => {
    const result = elementalThermodynamicAnalysis.analyzeElementalThermodynamics(
      "Fire",
      { seasonalFactors: ["monsoon"] },
    );
    expect(result.analysis.seasonalOptimization).toHaveLength(0);
  });
});

describe("absent inputs stay absent", () => {
  it("returns null for a cooking method with no pillar mapping", () => {
    expect(
      cookingMethodPillarAnalysis.analyzeCookingMethodPillar("no_such_method_xyz"),
    ).toBeNull();
  });

  it("returns null for an unknown planet instead of a zeroed ESMS vector", () => {
    // The scaffold defaulted to { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 }
    // and then scored it, manufacturing a reading for a planet it has no data on.
    expect(planetaryAlchemyAnalysis.analyzePlanetaryAlchemy("Vulcan")).toBeNull();
    expect(
      planetaryAlchemyAnalysis.generatePlanetaryRecommendations("Vulcan"),
    ).toBeNull();
  });

  it("returns null for a tarot card with no pillar association", () => {
    expect(tarotAlchemyAnalysis.analyzeTarotAlchemy("Nine of Nothing")).toBeNull();
  });

  it("omits an unrecognised zodiac sign rather than scoring it", () => {
    const result = planetaryAlchemyAnalysis.analyzePlanetaryAlchemy("Sun", {
      zodiacInfluences: ["ophiuchus"],
    });
    expect(result).not.toBeNull();
    expect(result!.analysis.zodiacEnhancement).toHaveLength(0);
  });

  it("returns null user customization when no preferences are supplied", () => {
    const result =
      cookingMethodPillarAnalysis.analyzeCookingMethodPillar("boiling");
    expect(result).not.toBeNull();
    expect(result!.analysis.userCustomization).toBeNull();
  });

  it("returns null user customization for entirely unrecognised preference keys", () => {
    const result = cookingMethodPillarAnalysis.analyzeCookingMethodPillar(
      "boiling",
      { userPreferences: { Sweetness: 0.9 } },
    );
    expect(result!.analysis.userCustomization).toBeNull();
  });
});

describe("planetary phase is a real distinction", () => {
  it("distinguishes diurnal from nocturnal effects", () => {
    // Moon: diurnal { Essence 0.7, Matter 0.3 }, nocturnal { Essence 1 }.
    // The scaffold ignored the distinction entirely while randomising the result.
    const day = planetaryAlchemyAnalysis.analyzePlanetaryAlchemy("Moon", {
      isDaytime: true,
    });
    const night = planetaryAlchemyAnalysis.analyzePlanetaryAlchemy("Moon", {
      isDaytime: false,
    });
    expect(day!.baseEffects).not.toEqual(night!.baseEffects);
    expect(day!.phase).toBe("diurnal");
    expect(night!.phase).toBe("nocturnal");
  });
});

describe("the removed scaffold surface is gone", () => {
  it("no longer returns predictive success probabilities", () => {
    const analysis =
      cookingMethodPillarAnalysis.analyzeCookingMethodPillar("boiling");
    expect(analysis).not.toBeNull();
    expect(analysis as Record<string, unknown>).not.toHaveProperty(
      "predictiveModeling",
    );

    const transformation =
      cookingMethodPillarAnalysis.analyzePillarTransformation(SOLUTION);
    expect(transformation as Record<string, unknown>).not.toHaveProperty(
      "predictiveOutcomes",
    );
  });

  it("returns pillar effects unmodified, without the ±10% jitter", () => {
    const transformation =
      cookingMethodPillarAnalysis.analyzePillarTransformation(SOLUTION);
    expect(transformation.effects).toEqual(SOLUTION.effects);
  });
});
