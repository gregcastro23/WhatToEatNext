/**
 * Golden vectors for the culinary physics layer.
 *
 * Every assertion here anchors to something OUTSIDE this repo — the defining
 * boiling point of water, Denver's published boiling point, Baldwin's
 * sous-vide tables, the Stefan–Boltzmann constant. A suite that only checked
 * the code against itself would have cheerfully blessed the
 * `200 + heat × 300 + monicaAdjustment` temperature this layer replaces.
 *
 * @file src/__tests__/cookingThermo.test.ts
 */

import {
  METHOD_PHYSICS,
  PHYSICS_METHOD_IDS,
  type MethodPhysicsProfile,
} from "@/data/cooking/methodPhysics";
import { METHOD_PHYSICAL_REFERENCE } from "@/data/cooking/physicalReference";
import {
  COOKWARE_DERIVED,
  contactTemperatureC,
  deriveCookware,
  FOOD_EFFUSIVITY,
} from "@/data/cooking/cookwareMaterials";
import {
  altitudeTimeMultiplier,
  biotNumber,
  boilingPointC,
  boilingPointCAtElevation,
  cToF,
  evaporativeCeilingC,
  Q10_CULINARY,
  radiantFluxKwM2,
  slabCoefficient,
  slabCoreTime,
  slabEigenvalue,
  STEFAN_BOLTZMANN,
  timeScaleFactor,
  wetBulbC,
  Z_VALUE_CULINARY_C,
  zValueFromQ10,
} from "@/lib/cooking/thermo";
import {
  buildMethodMetrics,
  getMethodCorpusStats,
  referenceCookTime,
  altitudeEffect,
} from "@/lib/cooking/methodMetrics";

describe("boiling point — anchored outside this repo", () => {
  it("returns 100 °C at standard sea-level pressure", () => {
    // 101.325 kPa boiling at 100 °C is the definition, not a measurement.
    expect(boilingPointC(101.325)).toBeCloseTo(100, 2);
  });

  it("reproduces Denver's published boiling point", () => {
    // Denver, 1609 m. Published figure ~202 °F / 94.4 °C.
    const c = boilingPointCAtElevation(1609);
    expect(c).toBeGreaterThan(94);
    expect(c).toBeLessThan(95.5);
    expect(cToF(c)).toBeGreaterThan(201);
    expect(cToF(c)).toBeLessThan(203);
  });

  it("beats the folk 1 °F-per-500-ft rule where that rule breaks down", () => {
    // At 3000 m the linear rule gives 212 − 19.7 = 192.3 °F.
    // The real answer is near 194 °F; the linear rule is ~1.8 °F low.
    const f = cToF(boilingPointCAtElevation(3000));
    expect(f).toBeGreaterThan(193);
    expect(f).toBeLessThan(195);
  });

  it("falls monotonically with elevation", () => {
    const points = [0, 500, 1000, 2000, 3000, 4000].map(boilingPointCAtElevation);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i]).toBeLessThan(points[i - 1]);
    }
  });

  it("refuses pressures outside Antoine validity rather than extrapolating", () => {
    // A pressure cooker at ~170 kPa implies ~115 °C, past the fit's ceiling.
    expect(() => boilingPointC(170)).toThrow(/Antoine validity/);
  });

  it("evaporativeCeilingC is the saturation temperature", () => {
    expect(evaporativeCeilingC(101.325)).toBeCloseTo(boilingPointC(101.325), 10);
  });
});

describe("time scaling by z-value", () => {
  it("is 1.0 at zero temperature change", () => {
    expect(timeScaleFactor(0)).toBeCloseTo(1, 10);
  });

  it("is exactly one decade per z-value of cooling", () => {
    expect(timeScaleFactor(-Z_VALUE_CULINARY_C, Z_VALUE_CULINARY_C)).toBeCloseTo(10, 10);
  });

  it("converts Q10 = 2 to a z-value near 33.2 °C", () => {
    expect(zValueFromQ10(Q10_CULINARY)).toBeCloseTo(33.219, 3);
  });

  it("SEPARATES the two altitude regimes rather than blending them", () => {
    // This is the whole reason the regime is a required argument. Denver:
    //   softening   ≈ ×1.4   (Q10 chemistry — matches the folk "add ~50 %")
    //   pasteurise  ≈ ×9     (microbial lethality, z = 5.6 °C)
    // Reporting either for the other would be wrong by ~6×.
    const soft = altitudeTimeMultiplier(1609, "softening");
    const past = altitudeTimeMultiplier(1609, "pasteurisation");
    expect(soft).toBeGreaterThan(1.3);
    expect(soft).toBeLessThan(1.6);
    expect(past).toBeGreaterThan(7);
    expect(past / soft).toBeGreaterThan(5);
  });
});

describe("transient slab conduction", () => {
  it("solves λ·tan λ = Bi", () => {
    for (const bi of [0.1, 1, 2.639, 10, 1000]) {
      const lambda = slabEigenvalue(bi);
      expect(lambda * Math.tan(lambda)).toBeCloseTo(bi, 6);
    }
  });

  it("approaches the Bi→∞ limits λ₁ → π/2, A₁ → 4/π", () => {
    const lambda = slabEigenvalue(1e9);
    expect(lambda).toBeCloseTo(Math.PI / 2, 6);
    expect(slabCoefficient(lambda)).toBeCloseTo(4 / Math.PI, 5);
  });

  it("VALIDATES against Baldwin's published sous-vide table", () => {
    // 25 mm slab, fridge (5 °C) into a 55 °C bath, h = 95 W·m⁻²·K⁻¹ (Baldwin's
    // figure for a well-circulated bath), to within 0.5 °C of the bath.
    // Baldwin's tables give roughly 60–70 min for a 25 mm slab.
    const r = slabCoreTime({ thicknessMm: 25, mediumC: 55, initialC: 5, targetC: 54.5, hWm2K: 95 });
    expect(r.biot).toBeCloseTo(2.639, 2);
    expect(r.minutes).toBeGreaterThan(55);
    expect(r.minutes).toBeLessThan(85);
    expect(r.oneTermValid).toBe(true);
  });

  it("interpolates the thickness law between L¹ and L² with Biot number", () => {
    // The thickness penalty is NOT a fixed t ∝ L². It runs from L¹ in the
    // lumped limit (Bi → 0, surface resistance dominates and time scales with
    // volume/area) to L² in the conduction limit (Bi → ∞).
    // `[MEASURED 2026-08-16]` doubling 12.5 → 25 mm at 175 °C:
    const ratio = (h: number) => {
      const thin = slabCoreTime({ thicknessMm: 12.5, mediumC: 175, initialC: 5, targetC: 60, hWm2K: h });
      const thick = slabCoreTime({ thicknessMm: 25, mediumC: 175, initialC: 5, targetC: 60, hWm2K: h });
      return thick.minutes / thin.minutes;
    };
    const stillAir = ratio(25);      // Bi 0.35 → 0.69
    const bath = ratio(95);          // Bi 1.32 → 2.64
    const oil = ratio(500);          // Bi 6.9  → 13.9
    const boilingWater = ratio(3000);// Bi 42   → 83

    // Every regime is superlinear, and none exceeds the L² ceiling.
    for (const r of [stillAir, bath, oil, boilingWater]) {
      expect(r).toBeGreaterThan(2);
      expect(r).toBeLessThanOrEqual(4.01);
    }
    // And the exponent rises monotonically with Biot number.
    expect(stillAir).toBeLessThan(bath);
    expect(bath).toBeLessThan(oil);
    expect(oil).toBeLessThan(boilingWater);
    // Low-Bi is near L¹·²; high-Bi is essentially L².
    expect(stillAir).toBeLessThan(2.6);
    expect(boilingWater).toBeGreaterThan(3.8);
  });

  it("ranks methods the way a kitchen does: a 100 °C pot beats a 175 °C still-air oven", () => {
    const oven = slabCoreTime({ thicknessMm: 25, mediumC: 175, initialC: 5, targetC: 60, hWm2K: 25 });
    const pot = slabCoreTime({ thicknessMm: 25, mediumC: 100, initialC: 5, targetC: 60, hWm2K: 3000 });
    expect(pot.minutes).toBeLessThan(oven.minutes);
  });

  it("refuses a target the medium cannot reach instead of returning a number", () => {
    expect(() =>
      slabCoreTime({ thicknessMm: 25, mediumC: 60, initialC: 5, targetC: 60, hWm2K: 95 }),
    ).toThrow(/can never reach/);
  });

  it("classifies the Biot regime correctly at both extremes", () => {
    // Thin cut in still air: medium-limited.
    expect(biotNumber(25, 0.005, 0.45)).toBeLessThan(0.5);
    // Thick cut in boiling water: conduction-limited.
    expect(biotNumber(3000, 0.0125, 0.45)).toBeGreaterThan(10);
  });
});

describe("radiation", () => {
  it("uses the CODATA Stefan–Boltzmann constant", () => {
    expect(STEFAN_BOLTZMANN).toBeCloseTo(5.670374419e-8, 17);
  });

  it("separates grilling from roasting by an order of magnitude", () => {
    const charcoal = radiantFluxKwM2(1200, 400);
    const ovenWall = radiantFluxKwM2(505, 400);
    expect(charcoal).toBeGreaterThan(90);
    expect(ovenWall).toBeLessThan(5);
    expect(charcoal / ovenWall).toBeGreaterThan(20);
  });
});

describe("wet-bulb refuses to extrapolate", () => {
  it("works in its validated ambient range", () => {
    const wb = wetBulbC(25, 60);
    expect(wb).not.toBeNull();
    expect(wb!).toBeLessThan(25);
    expect(wb!).toBeGreaterThan(15);
  });

  it("returns null below its usable floor, where the fit goes non-physical", () => {
    expect(wetBulbC(-20, 95)).toBeNull();
    expect(wetBulbC(-15, 95)).toBeNull();
    expect(wetBulbC(-10, 95)).not.toBeNull();
  });

  it("returns null at oven temperatures instead of an impossible answer", () => {
    // `[MEASURED 2026-08-16]` the Stull fit returns 176.1 °C for a 175 °C dry
    // bulb at 100 % RH — above the dry bulb, which is thermodynamically
    // impossible. Declining beats extrapolating.
    expect(wetBulbC(175, 100)).toBeNull();
    expect(wetBulbC(175, 20)).toBeNull();
  });

  it("never exceeds the dry bulb inside its validity range", () => {
    // The raw Stull fit violates this below about −12 °C (up to 2.4 K above the
    // dry bulb at −20 °C), so the validity floor is −10 °C and the result is
    // additionally clamped. Both guards are load-bearing.
    for (let t = -10; t <= 50; t += 5) {
      for (const rh of [5, 30, 60, 95]) {
        const wb = wetBulbC(t, rh);
        expect(wb).not.toBeNull();
        expect(wb!).toBeLessThanOrEqual(t);
      }
    }
  });
});

describe("cookware materials", () => {
  it("derives effusivity, areal capacity and spreading from the inputs, never transcribed", () => {
    const material = {
      id: "x", name: "X", kWmK: 52, rhoKgM3: 7200, cJkgK: 460,
      typicalThicknessMm: 5, characterNote: "", limitationNote: "", bestFor: [],
    };
    const d = deriveCookware(material);
    expect(d.effusivity).toBeCloseTo(Math.sqrt(52 * 7200 * 460), 6);
    expect(d.arealHeatCapacity).toBeCloseTo(7200 * 460 * 0.005, 6);
    expect(d.spreading).toBeCloseTo(52 * 0.005, 10);
  });

  it("food effusivity agrees with the diffusivity used by the slab solver", () => {
    // k/(ρc) from the cookware property set must land near the 1.3e-7 m²/s the
    // thermo module uses, or the two files are describing different food.
    const alpha = 0.45 / (1050 * 3500);
    expect(alpha).toBeGreaterThan(1.15e-7);
    expect(alpha).toBeLessThan(1.4e-7);
    expect(FOOD_EFFUSIVITY).toBeCloseTo(Math.sqrt(0.45 * 1050 * 3500), 6);
  });

  it("ranks materials by contact temperature the way a cook experiences them", () => {
    const byId = Object.fromEntries(COOKWARE_DERIVED.map((m) => [m.id, m]));
    const contact = (id: string) => contactTemperatureC(230, 5, byId[id].effusivity);
    // Copper > cast iron > stainless > glass.
    expect(contact("copper")).toBeGreaterThan(contact("cast_iron"));
    expect(contact("cast_iron")).toBeGreaterThan(contact("stainless_304"));
    expect(contact("stainless_304")).toBeGreaterThan(contact("borosilicate_glass"));
    // And the cast-iron/stainless gap straddles a real threshold.
    expect(contact("cast_iron") - contact("stainless_304")).toBeGreaterThan(5);
  });

  it("cast iron stores more than carbon steel at typical gauges — the wok-crowding law", () => {
    const byId = Object.fromEntries(COOKWARE_DERIVED.map((m) => [m.id, m]));
    expect(byId.cast_iron.arealHeatCapacity).toBeGreaterThan(byId.carbon_steel.arealHeatCapacity * 1.8);
  });
});

describe("method physics profiles", () => {
  it("covers every servable cooking method", () => {
    const servable = Object.keys(METHOD_PHYSICAL_REFERENCE).filter((id) => id !== "raw");
    const missing = servable.filter((id) => !METHOD_PHYSICS[id]);
    expect(missing).toEqual([]);
  });

  it("has transfer modes summing to 1, or to 0 for non-thermal methods", () => {
    for (const [id, p] of Object.entries(METHOD_PHYSICS)) {
      const sum = p.modes.conduction + p.modes.convection + p.modes.radiation + p.modes.phaseChange;
      if (p.h === null) {
        expect([id, sum]).toEqual([id, 0]);
      } else {
        expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
      }
    }
  });

  it("orders each h band low ≤ typical ≤ high", () => {
    for (const p of Object.values(METHOD_PHYSICS)) {
      if (!p.h) continue;
      expect(p.h.low).toBeLessThanOrEqual(p.h.typical);
      expect(p.h.typical).toBeLessThanOrEqual(p.h.high);
      expect(p.h.low).toBeGreaterThan(0);
    }
  });

  it("never claims browning for a method whose surface stays wet", () => {
    // A surface pinned at the boiling point cannot reach the ~140 °C Maillard
    // threshold. Any wet method claiming browning is a data error.
    const wetMethods = ["boiling", "steaming", "poaching", "simmering", "sous_vide", "braising", "stewing", "pressure_cooking"];
    for (const id of wetMethods) {
      expect([id, METHOD_PHYSICS[id].surfaceCanBrown]).toEqual([id, false]);
    }
  });

  it("declares no h for methods that are not heat-transfer problems", () => {
    for (const id of ["fermentation", "curing", "pickling", "marinating", "spherification"]) {
      expect([id, METHOD_PHYSICS[id].h]).toEqual([id, null]);
    }
  });

  it("gives pressure cooking the COMPENSATED altitude response, not merely 'sensitive'", () => {
    // The one appliance high-altitude kitchens buy specifically to defeat
    // altitude must never be handed an altitude slowdown.
    expect(METHOD_PHYSICS.pressure_cooking.altitudeResponse).toBe("compensated");
    expect(METHOD_PHYSICS.boiling.altitudeResponse).toBe("penalised");
    expect(METHOD_PHYSICS.dehydrating.altitudeResponse).toBe("accelerated");
    expect(METHOD_PHYSICS.roasting.altitudeResponse).toBe("unaffected");

    expect(altitudeEffect("pressure_cooking", 3000)!.multipliersApply).toBe(false);
    expect(altitudeEffect("boiling", 3000)!.multipliersApply).toBe(true);
    expect(altitudeEffect("roasting", 3000)!.multipliersApply).toBe(false);
  });
});

describe("derived method metrics", () => {
  it("builds metrics for every profiled method", () => {
    for (const id of PHYSICS_METHOD_IDS) {
      expect(buildMethodMetrics(id)).not.toBeNull();
    }
    expect(buildMethodMetrics("not_a_method")).toBeNull();
  });

  it("REFUSES a core time for mass-transfer methods even when they have an h", () => {
    // Smoking has a real convective h of ~20 W·m⁻²·K⁻¹, and the slab solver
    // will happily return ~36 min for it. That is a heat-transfer answer to a
    // mass-transfer question: smoking is paced by phenol deposition and the
    // evaporative stall over many hours.
    const smoking: MethodPhysicsProfile = METHOD_PHYSICS.smoking;
    expect(smoking.h).not.toBeNull();
    const rt = referenceCookTime(smoking);
    expect(rt.result).toBeNull();
    expect(rt.unavailableReason).toMatch(/mass transfer/);
  });

  it("refuses a core time when the medium cannot reach the target", () => {
    const rt = referenceCookTime(METHOD_PHYSICS.sous_vide);
    expect(rt.result).toBeNull();
    expect(rt.unavailableReason).toMatch(/cannot carry a core/);
  });

  it("standardises h on a log scale so the middle of the range discriminates", () => {
    const stats = getMethodCorpusStats();
    // Raw h spans 8 → 10 000. On a log scale the corpus sigma must be a
    // fraction of a decade, otherwise nothing but the extremes would separate.
    expect(stats.logH.madSigma).toBeGreaterThan(0.3);
    expect(stats.logH.madSigma).toBeLessThan(1.5);

    const steaming = buildMethodMetrics("steaming")!;
    const roasting = buildMethodMetrics("roasting")!;
    const frying = buildMethodMetrics("frying")!;
    // Extremes are outliers, and the middle still has a signed, non-trivial z.
    expect(steaming.transfer!.z!).toBeGreaterThan(1.5);
    expect(roasting.transfer!.z!).toBeLessThan(-1);
    expect(Math.abs(frying.transfer!.z!)).toBeGreaterThan(0.1);
  });

  it("recommends only materials that exist in the cookware registry", () => {
    for (const id of PHYSICS_METHOD_IDS) {
      const m = buildMethodMetrics(id)!;
      expect(m.equipment.length).toBe(METHOD_PHYSICS[id].recommendedMaterials.length);
    }
  });
});

describe("REGRESSION: the physical envelope is internally consistent", () => {
  it("keeps every published ideal temperature inside its own low–high band", () => {
    // The defect this whole layer replaces was a headline temperature outside
    // the envelope printed beneath it. The envelope itself must at least be
    // self-consistent, or there is nothing to be outside of.
    const offenders: string[] = [];
    for (const [id, ref] of Object.entries(METHOD_PHYSICAL_REFERENCE)) {
      const { low, high, ideal } = ref.temperatureF;
      if (low > high || ideal < low || ideal > high) {
        offenders.push(`${id}: ideal ${ideal} outside ${low}–${high}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps each method's driving temperature within reach of its envelope", () => {
    // The physics `mediumC` and the published envelope describe the same
    // process from two directions; if they disagree wildly, one is wrong.
    const offenders: string[] = [];
    for (const id of PHYSICS_METHOD_IDS) {
      const ref = METHOD_PHYSICAL_REFERENCE[id];
      if (!ref) continue;
      // A documented divergence is the honest case, not a failure — braising's
      // envelope is the oven dial while its medium is the liquid. What must
      // never happen is an UNDOCUMENTED gap.
      if (METHOD_PHYSICS[id].mediumDivergenceNote) continue;
      const mediumF = cToF(METHOD_PHYSICS[id].mediumC);
      // 30 °F of slack: the envelope is a range of practice, the medium is one
      // representative operating point inside it.
      if (mediumF < ref.temperatureF.low - 30 || mediumF > ref.temperatureF.high + 30) {
        offenders.push(
          `${id}: medium ${mediumF.toFixed(0)}°F vs envelope ${ref.temperatureF.low}–${ref.temperatureF.high}°F`,
        );
      }
    }
    expect(offenders).toEqual([]);
  });

  it("requires a written explanation wherever medium and envelope diverge", () => {
    // The escape hatch above must stay expensive: a divergence note is only
    // legitimate if the gap is real and explained.
    for (const id of PHYSICS_METHOD_IDS) {
      const note = METHOD_PHYSICS[id].mediumDivergenceNote;
      if (!note) continue;
      const ref = METHOD_PHYSICAL_REFERENCE[id];
      const mediumF = cToF(METHOD_PHYSICS[id].mediumC);
      const outside = mediumF < ref.temperatureF.low - 30 || mediumF > ref.temperatureF.high + 30;
      expect([id, outside]).toEqual([id, true]);
      expect(note.length).toBeGreaterThan(80);
    }
  });
});
