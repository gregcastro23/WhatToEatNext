/**
 * The lab solver — orchestration, and the honesty contract at the seam.
 *
 * The physics is tested downstairs, under a bit-exact cross-runtime fixture.
 * What is tested HERE is the thing that layer cannot test: that a kernel's
 * refusal arrives at the surface as a stated reason rather than as a number,
 * a zero, or a crash.
 *
 * @file src/__tests__/cookingLabSolver.test.ts
 */
import {
  DEFAULT_AMBIENT,
  SOLVABLE_INGREDIENTS,
  SOLVABLE_INGREDIENT_COUNT,
  TOTAL_INGREDIENT_COUNT,
  UNACCOUNTED_MASS_LIMIT,
  getSolvableIngredient,
  solveArrangement,
  type SolverInput,
} from "@/lib/cooking/labSolver";

const CHICKEN_ROAST: SolverInput = {
  ingredientId: "chicken",
  geometry: "slab",
  halfDimensionM: 0.02,
  massKg: 0.25,
  startC: 5,
  targetC: 74,
  methodId: "roasting",
};

describe("the solvable set", () => {
  it("is populated, and every entry carries a real composition", () => {
    expect(SOLVABLE_INGREDIENT_COUNT).toBeGreaterThan(20);
    for (const i of SOLVABLE_INGREDIENTS) {
      const { water, protein, fat, carbohydrate, ash } = i.composition;
      for (const f of [water, protein, fat, carbohydrate, ash]) {
        expect(Number.isFinite(f)).toBe(true);
        expect(f).toBeGreaterThanOrEqual(0);
      }
      // A composition with no water is not a food; it is a parse failure.
      expect(water + protein + fat + carbohydrate + ash).toBeGreaterThan(0.5);
    }
  });

  it("REPORTS how little of the corpus it can solve, rather than implying it is all", () => {
    // `[MEASURED 2026-08-18]` 40 of 931. The other 891 are not "unsupported
    // yet" — Choi–Okos needs water and ash and there is nowhere else to get
    // them, so they cannot be solved at all. A picker that listed all 931 and
    // failed on 891 would be this codebase's recurring defect in a new costume.
    expect(TOTAL_INGREDIENT_COUNT).toBeGreaterThan(SOLVABLE_INGREDIENT_COUNT * 5);
    expect(SOLVABLE_INGREDIENTS.length).toBe(SOLVABLE_INGREDIENT_COUNT);
  });

  it("is sorted and looks up by id", () => {
    const names = SOLVABLE_INGREDIENTS.map((i) => i.name);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
    expect(getSolvableIngredient("chicken")).not.toBeNull();
    expect(getSolvableIngredient("no such ingredient")).toBeNull();
  });

  it("defaults the ambient to a STANDARD ATMOSPHERE, not to weather", () => {
    // Deterministic and reproducible was the point; a live feed would make the
    // same arrangement give different answers on different days.
    expect(DEFAULT_AMBIENT.elevationM).toBe(0);
    expect(DEFAULT_AMBIENT.airC).toBe(20);
  });
});

describe("refusals arrive as reasons, never as numbers", () => {
  it("declines a core time for a method that is not heat-transfer limited", () => {
    // Pickling is mass-transfer limited and declares no h. A zero here would
    // read as "instant", which is the opposite of true.
    const s = solveArrangement({ ...CHICKEN_ROAST, ingredientId: "carrot", methodId: "pickling" });
    expect(s.coreTime.available).toBe(false);
    expect(s.bottleneck.available).toBe(false);
    expect(s.surfaceState.available).toBe(false);
    if (!s.coreTime.available) {
      expect(s.coreTime.reason).toMatch(/pickling/);
      expect(s.coreTime.reason).toMatch(/mass-transfer/);
      expect(s.coreTime.reason.length).toBeGreaterThan(20);
    }
  });

  it("declines an unreachable target and says why, carrying the kernel's own words", () => {
    // A 60 °C bath cannot bring a core to 90 °C, ever. The kernel throws; the
    // solver must surface that rather than returning a very large number.
    const s = solveArrangement({ ...CHICKEN_ROAST, methodId: "sous_vide", targetC: 90 });
    expect(s.coreTime.available).toBe(false);
    if (!s.coreTime.available) expect(s.coreTime.reason).toMatch(/never reach|not between/i);
    // …and the rest of the board still computes. One refusal is not a failure.
    expect(s.properties.available).toBe(true);
    expect(s.bottleneck.available).toBe(true);
  });

  it("never returns a Reading that is both unavailable and carrying a value", () => {
    // The discriminated union is the whole safety property. `T | null` would let
    // a caller write `?? 0` and turn a refusal into a measurement.
    const s = solveArrangement({ ...CHICKEN_ROAST, ingredientId: "carrot", methodId: "pickling" });
    for (const reading of [s.coreTime, s.bottleneck, s.surfaceState, s.waterLoss, s.properties]) {
      if (reading.available) expect(reading.value).toBeDefined();
      else expect(typeof reading.reason).toBe("string");
      expect("value" in reading).toBe(reading.available);
    }
  });

  it("THROWS on an unknown id, because that is a caller bug and not a fact", () => {
    // Degrading here would hide the bug behind an empty result board.
    expect(() => solveArrangement({ ...CHICKEN_ROAST, ingredientId: "unobtainium" })).toThrow(
      /solvable ingredient/,
    );
    expect(() => solveArrangement({ ...CHICKEN_ROAST, methodId: "levitating" })).toThrow(/method/);
    expect(() => solveArrangement({ ...CHICKEN_ROAST, vesselId: "cauldron" })).toThrow(/vessel/);
  });
});

describe("the composition warning", () => {
  it("fires for an ingredient whose mass does not add up", () => {
    // Vanilla extract closes at 0.656 — the missing third is ethanol, which
    // Choi–Okos cannot see, and the density it returns is nearly double reality.
    const s = solveArrangement({
      ...CHICKEN_ROAST,
      ingredientId: "vanilla_extract",
      methodId: "boiling",
    });
    expect(s.compositionWarning).toBeDefined();
    expect(s.compositionWarning).toMatch(/unaccounted/);
    // The properties still compute — the warning is what makes them readable.
    expect(s.properties.available).toBe(true);
  });

  it("stays silent for an ingredient that closes properly", () => {
    // A warning on every ingredient would be noise, and would train a reader to
    // ignore the one that matters.
    const s = solveArrangement(CHICKEN_ROAST);
    expect(s.compositionWarning).toBeUndefined();
    expect(Math.abs(s.ingredient.unaccountedFraction)).toBeLessThan(UNACCOUNTED_MASS_LIMIT);
  });
});

describe("the arrangement actually reaches the physics", () => {
  it("lets a lid change the water loss WITHOUT changing the core time", () => {
    // Power moves what leaves the pot; it does not move the medium temperature,
    // and the medium temperature is what paces the core. Conflating the two is
    // the most natural mistake this orchestration could make.
    const base: SolverInput = {
      ingredientId: "carrot",
      geometry: "sphere",
      halfDimensionM: 0.015,
      massKg: 0.05,
      startC: 15,
      targetC: 90,
      methodId: "braising",
      vesselId: "dutch_oven_55qt",
    };
    const low = solveArrangement({ ...base, burnerPowerW: 200 });
    const high = solveArrangement({ ...base, burnerPowerW: 800 });
    if (!low.coreTime.available || !high.coreTime.available) throw new Error("expected a time");
    expect(high.coreTime.value.minutes).toBeCloseTo(low.coreTime.value.minutes, 9);
    if (!low.waterLoss.available || !high.waterLoss.available) throw new Error("expected a loss");
    expect(high.waterLoss.value.gramsPerHour).toBeGreaterThan(
      low.waterLoss.value.gramsPerHour * 2,
    );
    // …and the lid is reported as returning condensate in both.
    expect(low.waterLoss.value.covered).toBeDefined();
    expect(low.waterLoss.value.covered!.returnedGramsPerHour).toBeGreaterThan(0);
  });

  it("moves the water ceiling with elevation", () => {
    const denver = solveArrangement({ ...CHICKEN_ROAST, ambient: { elevationM: 1609 } });
    expect(denver.ceilingC).toBeLessThan(96);
    expect(solveArrangement(CHICKEN_ROAST).ceilingC).toBeCloseTo(100, 1);
  });

  it("lets a ROAST brown and a boil not — the ceiling gates browning only while wet", () => {
    // REGRESSION. The first version ANDed the method's verdict with
    // `ceiling >= 140 °C`, which is never true at any habitable elevation, so
    // NOTHING could brown — roasting included. The ceiling pins a WET surface;
    // once it dries it climbs past freely, and that is why roasts brown at all.
    const roast = solveArrangement(CHICKEN_ROAST);
    const boil = solveArrangement({ ...CHICKEN_ROAST, ingredientId: "carrot", methodId: "boiling" });
    if (!roast.surfaceState.available || !boil.surfaceState.available) {
      throw new Error("expected both to solve");
    }
    expect(roast.surfaceState.value.canBrown).toBe(true);
    expect(boil.surfaceState.value.canBrown).toBe(false);
    expect(roast.surfaceState.value.browningNote).toMatch(/dry/);
  });

  it("holds the surface far below the oven air, and says it is a LOWER bound", () => {
    const s = solveArrangement(CHICKEN_ROAST);
    if (!s.surfaceState.available) throw new Error("expected a surface state");
    expect(s.surfaceState.value.lowerBoundC).toBeLessThan(80);
    expect(s.surfaceState.value.lowerBoundC).toBeLessThan(s.surfaceState.value.ceilingC);
  });

  it("passes the one-term validity flag through instead of swallowing it", () => {
    // Fo ≤ 0.2 means the truncation understates the early transient. Only the
    // caller can decide whether to show that, so it has to arrive.
    const s = solveArrangement(CHICKEN_ROAST);
    if (!s.coreTime.available) throw new Error("expected a time");
    expect(typeof s.coreTime.value.oneTermValid).toBe("boolean");
    expect(s.coreTime.value.fourier).toBeGreaterThan(0);
    expect(s.coreTime.value.minutes).toBeGreaterThan(0);
  });

  it("names the bottleneck, and it differs between an oven and a pot", () => {
    const roast = solveArrangement(CHICKEN_ROAST);
    const boil = solveArrangement({
      ...CHICKEN_ROAST,
      ingredientId: "carrot",
      geometry: "sphere",
      halfDimensionM: 0.015,
      methodId: "boiling",
      vesselId: "stockpot_8qt",
    });
    if (!roast.bottleneck.available || !boil.bottleneck.available) {
      throw new Error("expected both chains");
    }
    expect(boil.bottleneck.value.foodBiot!).toBeGreaterThan(roast.bottleneck.value.foodBiot!);
    // A vesselless roast has a two-link chain; the pot has five.
    expect(roast.bottleneck.value.links.length).toBe(2);
    expect(boil.bottleneck.value.links.length).toBe(5);
  });
});
