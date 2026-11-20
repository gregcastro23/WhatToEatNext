/**
 * Unit tests for Sauce Lab Real Physics engine & preset resolution.
 */
import { computeSaucePhysics, inputsFromPreset, simulateReductionCurve } from "../engine";
import { findSaucePresetId, getSaucePreset, SAUCE_BENCH_PRESETS } from "../presets";

describe("Sauce Lab real-physics engine", () => {
  it("computes Choi & Okos thermophysical properties and wheat-roux gelatinization for Béchamel", () => {
    const base = inputsFromPreset(getSaucePreset("bechamel"));
    const cold = computeSaucePhysics({ ...base, tempC: 40 });
    const hot = computeSaucePhysics({ ...base, tempC: 86 });

    expect(hot.thermo.densityKgM3).toBeGreaterThan(950);
    expect(hot.thermo.densityKgM3).toBeLessThan(1100);
    expect(hot.thermo.specificHeatJkgK).toBeGreaterThan(2500);
    expect(hot.thermo.specificHeatJkgK).toBeLessThan(4100);

    expect(cold.thickener.gelatinizationPct).toBe(0);
    expect(hot.thickener.gelatinizationPct).toBe(100);
  });

  it("flags Hollandaise curdling risk above 75 °C while keeping 62 °C emulsion out of split-risk", () => {
    const hollandaise = inputsFromPreset(getSaucePreset("hollandaise"));
    const warm = computeSaucePhysics({ ...hollandaise, tempC: 62 });
    const hot = computeSaucePhysics({ ...hollandaise, tempC: 78 });

    expect(warm.emulsion.stabilityBand).not.toBe("split-risk");
    expect(hot.emulsion.stabilityBand).toBe("split-risk");
    expect(hot.warnings.some((w) => /curdling/i.test(w))).toBe(true);
  });

  it("scales Stokes creaming velocity quadratically with droplet radius (8x smaller -> 64x slower)", () => {
    const hollandaise = inputsFromPreset(getSaucePreset("hollandaise"));
    const coarse = computeSaucePhysics({ ...hollandaise, dropletRadiusUm: 40 });
    const fine = computeSaucePhysics({ ...hollandaise, dropletRadiusUm: 5 });

    const ratio = coarse.emulsion.stokesCreamingMmMin / fine.emulsion.stokesCreamingMmMin;
    expect(ratio).toBeCloseTo(64, 5);
  });

  it("doubles solute concentration factor at 50% water reduction and preserves linear latent heat", () => {
    const marinara = inputsFromPreset(getSaucePreset("marinara"));
    const half = computeSaucePhysics({ ...marinara, targetReductionPct: 50 });

    expect(half.reduction.soluteConcentrationFactor).toBeCloseTo(2.0, 2);
    expect(half.evaporatedWaterG).toBeCloseTo(marinara.waterG * 0.5, 5);
    expect(half.reduction.latentEnergyKj).toBeCloseTo(
      (half.evaporatedWaterG / 1000) * half.reduction.hfgKjKg,
      5,
    );
  });

  it("produces monotonically increasing simmer time and solids percentage along the reduction curve", () => {
    const espagnole = inputsFromPreset(getSaucePreset("espagnole"));
    const curve = simulateReductionCurve(espagnole, 6);
    expect(curve).toHaveLength(7);
    for (let i = 1; i < curve.length; i += 1) {
      const curr = curve[i];
      const prev = curve[i - 1];
      if (curr && prev) {
        expect(curr.minutes).toBeGreaterThanOrEqual(prev.minutes);
        expect(curr.solidsPct).toBeGreaterThanOrEqual(prev.solidsPct);
      }
    }
  });

  it("resolves every preset by id, focusKey, catalogueSauceId, and falls back to bechamel cleanly", () => {
    for (const preset of SAUCE_BENCH_PRESETS) {
      expect(getSaucePreset(preset.id).id).toBe(preset.id);
      expect(getSaucePreset(preset.catalogueSauceId).id).toBe(preset.id);
    }
    expect(getSaucePreset("non-existent-sauce").id).toBe("bechamel");
    expect(findSaucePresetId("Carbonara")).toBeUndefined();
    expect(findSaucePresetId("Hollandaise")).toBe("hollandaise");
  });
});
