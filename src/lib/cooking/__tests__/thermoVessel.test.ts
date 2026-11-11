import { COOKING_REGIMES, regimesAt } from "../cookingRegimes";
import { saturationPressureKpa, saturationTemperatureC } from "../if97";
import { formatFixed, readVessel, SATURATION_BAND_K } from "../thermoVessel";
import {
  clampVesselState,
  DEFAULT_VESSEL,
  VESSEL_PRESETS,
  VESSEL_RANGES,
  type VesselState,
} from "../vesselState";

function vessel(patch: Partial<VesselState>): VesselState {
  return { ...DEFAULT_VESSEL, ...patch };
}

function preset(id: "open" | "sealed" | "vacuum"): VesselState {
  const found = VESSEL_PRESETS.find((p) => p.id === id);
  if (!found) throw new Error(`missing preset ${id}`);
  return found.state;
}

const ids = (list: ReadonlyArray<{ id: string }>): string[] => list.map((r) => r.id);

describe("readVessel — the saturation ceiling", () => {
  it("an open pot at sea level boils at the IF97 ceiling and evaporates", () => {
    const r = readVessel(DEFAULT_VESSEL);
    expect(r.saturation.tsatC).toBe(saturationTemperatureC(101.325));
    expect(r.boilingState).toBe("at-boil");
    // The setpoint (100 °C) is above the ceiling (99.974 °C): a wet surface pins there.
    expect(r.aboveCeiling).toBe(true);
    expect(r.wetSurfaceC).toBe(r.saturation.tsatC);
    const expectedDeficit = saturationPressureKpa(r.wetSurfaceC) - 0.5 * saturationPressureKpa(25);
    expect(r.vaporDeficitKpa).toBe(expectedDeficit);
    expect(r.transfer).toBe("evaporating");
    expect(r.latentVsSeaLevel).toBe(1);
  });

  it("a vacuum lowers the ceiling and the latent heat rises", () => {
    const r = readVessel(vessel({ pressureKpa: 10, temperatureC: 100 }));
    expect(r.saturation.tsatC).toBeCloseTo(45.81, 2);
    expect(r.boilingState).toBe("above-saturation");
    expect(r.wetSurfaceC).toBe(r.saturation.tsatC);
    expect(r.latentVsSeaLevel).toBeGreaterThan(1);
  });

  it("a pressure vessel raises the ceiling and the latent heat falls", () => {
    const r = readVessel(vessel({ pressureKpa: 250, temperatureC: 120 }));
    expect(r.saturation.tsatC).toBeCloseTo(127.41, 2);
    expect(r.boilingState).toBe("sub-boiling");
    expect(r.aboveCeiling).toBe(false);
    expect(r.wetSurfaceC).toBe(120);
    expect(r.latentVsSeaLevel).toBeLessThan(1);
  });

  it("calls the boil within the ruled band on either side of T_sat", () => {
    const tsat = saturationTemperatureC(101.325);
    expect(readVessel(vessel({ temperatureC: tsat - SATURATION_BAND_K })).boilingState).toBe("at-boil");
    expect(readVessel(vessel({ temperatureC: tsat - SATURATION_BAND_K - 0.01 })).boilingState).toBe("sub-boiling");
    expect(readVessel(vessel({ temperatureC: tsat + SATURATION_BAND_K + 0.01 })).boilingState).toBe("above-saturation");
  });

  it("the display band does not hide a setpoint just above the ceiling", () => {
    // 1 K over T_sat reads "at the boil", yet only a dried surface reaches it.
    const r = readVessel(vessel({ pressureKpa: 198.67, temperatureC: 121 }));
    expect(r.boilingState).toBe("at-boil");
    expect(r.aboveCeiling).toBe(true);
    expect(ids(r.regimesOnceDry)).toEqual(["maillard"]);
  });
});

describe("readVessel — vapour-pressure deficit", () => {
  it("a sealed vessel full of its own steam has Δp_v ≈ 0 but is boiling, heat-limited", () => {
    const r = readVessel(preset("sealed"));
    // φ·p_sat(121 °C) exceeds 205 kPa, so the headspace is capped at the total pressure,
    // and the wet surface sits at T_sat(205 kPa), whose p_sat IS 205 kPa.
    expect(r.headspaceVaporCapped).toBe(true);
    expect(r.headspaceVaporKpa).toBe(205);
    expect(Math.abs(r.vaporDeficitKpa)).toBeLessThan(1e-9);
    expect(r.transfer).toBe("heat-limited");
  });

  it("an open rolling boil under pure steam is heat-limited too, not 'no exchange'", () => {
    const r = readVessel(vessel({ temperatureC: 100, humidityPct: 100, headspaceC: 100 }));
    expect(r.headspaceVaporCapped).toBe(true);
    expect(r.transfer).toBe("heat-limited");
  });

  it("a sub-boiling surface under air saturated at its own temperature is in equilibrium", () => {
    const r = readVessel(vessel({ temperatureC: 60, humidityPct: 100, headspaceC: 60 }));
    expect(r.boilingState).toBe("sub-boiling");
    expect(r.vaporDeficitKpa).toBe(0);
    expect(r.transfer).toBe("equilibrium");
  });

  it("hot saturated steam over cooler food condenses onto it", () => {
    const r = readVessel(vessel({ temperatureC: 60, humidityPct: 100, headspaceC: 100 }));
    expect(r.vaporDeficitKpa).toBeLessThan(0);
    expect(r.transfer).toBe("condensing");
  });

  it("dry air drives more evaporation than humid air at the same temperatures", () => {
    const dry = readVessel(vessel({ temperatureC: 70, humidityPct: 10 }));
    const humid = readVessel(vessel({ temperatureC: 70, humidityPct: 90 }));
    expect(dry.vaporDeficitKpa).toBeGreaterThan(humid.vaporDeficitKpa);
  });

  it("never lets the headspace vapour exceed the total pressure", () => {
    for (const humidityPct of [0, 50, 100]) {
      for (const headspaceC of [5, 100, 200, 260]) {
        const r = readVessel(vessel({ pressureKpa: 10, humidityPct, headspaceC }));
        expect(r.headspaceVaporKpa).toBeLessThanOrEqual(10);
      }
    }
  });
});

describe("readVessel — regimes", () => {
  it("reports dry-surface regimes only when the setpoint is above the ceiling", () => {
    expect(readVessel(vessel({ temperatureC: 90 })).regimesOnceDry).toEqual([]);
    const searing = readVessel(vessel({ temperatureC: 180 }));
    expect(ids(searing.regimesWhileWet)).toEqual(["collagen-gelatin"]);
    expect(ids(searing.regimesOnceDry)).toEqual(["maillard", "pyrazine", "sucrose-caramelisation"]);
  });

  it("does not put Maillard on a wet surface, even at a pressure cooker's 121 °C", () => {
    const r = readVessel(preset("sealed"));
    expect(r.wetSurfaceC).toBeGreaterThan(120);
    expect(ids(r.regimesWhileWet)).toEqual(["collagen-gelatin"]);
  });

  it("drops water-bound reactions from a dried surface", () => {
    const r = readVessel(vessel({ pressureKpa: 10, temperatureC: 100 }));
    expect(ids(r.regimesOnceDry)).not.toContain("collagen-gelatin");
    expect(r.regimesOnceDry).toEqual([]);
  });
});

describe("cooking regimes — provenance", () => {
  it("every regime names at least one https source and a coherent span", () => {
    expect(new Set(ids(COOKING_REGIMES)).size).toBe(COOKING_REGIMES.length);
    for (const r of COOKING_REGIMES) {
      expect(r.sources.length).toBeGreaterThan(0);
      for (const s of r.sources) expect(s.url.startsWith("https://")).toBe(true);
      if (r.endC !== null) expect(r.endC).toBeGreaterThan(r.onsetC);
    }
  });

  it("uses sourced onsets and ends as inclusive edges", () => {
    expect(ids(regimesAt(120))).toContain("maillard");
    expect(ids(regimesAt(119.99))).not.toContain("maillard");
    expect(ids(regimesAt(60))).toContain("yeast-death");
    expect(ids(regimesAt(60.01))).not.toContain("yeast-death");
    const lacticEnd = ((75 - 32) * 5) / 9;
    expect(ids(regimesAt(lacticEnd))).toContain("lactic-fermentation");
    expect(ids(regimesAt(lacticEnd + 0.01))).not.toContain("lactic-fermentation");
  });

  it("filters by the surface the source supports", () => {
    expect(ids(regimesAt(130, "wet"))).not.toContain("maillard");
    expect(ids(regimesAt(130, "dry"))).toContain("maillard");
    expect(ids(regimesAt(70, "dry"))).not.toContain("collagen-gelatin");
    expect(ids(regimesAt(70, "wet"))).toEqual(["protein-coagulation", "collagen-gelatin"]);
  });

  it("Fahrenheit and kelvin onsets round-trip from what their sources print", () => {
    const byId = new Map(COOKING_REGIMES.map((r) => [r.id, r]));
    expect(byId.get("lactic-fermentation")?.onsetC).toBe(((60 - 32) * 5) / 9);
    expect(byId.get("lactic-fermentation")?.endC).toBe(((75 - 32) * 5) / 9);
    expect(byId.get("sucrose-caramelisation")?.onsetC).toBe(442 - 273.15);
  });
});

describe("vessel state", () => {
  it("every preset is inside the control ranges", () => {
    for (const p of VESSEL_PRESETS) {
      expect(clampVesselState(p.state)).toEqual(p.state);
    }
  });

  it("clamps out-of-range and non-finite inputs", () => {
    const clamped = clampVesselState({ pressureKpa: 999, temperatureC: Number.NaN, humidityPct: -5, headspaceC: 25 });
    expect(clamped.pressureKpa).toBe(VESSEL_RANGES.pressureKpa.max);
    expect(clamped.temperatureC).toBe(VESSEL_RANGES.temperatureC.min);
    expect(clamped.humidityPct).toBe(0);
  });

  it("the pressure-cooker preset is 15 psi gauge over the ISA atmosphere", () => {
    expect(Math.round(101.325 + 15 * 6.894757)).toBe(preset("sealed").pressureKpa);
  });
});

describe("formatFixed", () => {
  it("never prints a negative zero, and keeps real negatives", () => {
    expect(formatFixed(-1e-13, 2)).toBe("0.00");
    expect(formatFixed(-0, 0)).toBe("0");
    expect(formatFixed(-0.004, 2)).toBe("0.00");
    expect(formatFixed(-0.006, 2)).toBe("-0.01");
    expect(formatFixed(19.345, 1)).toBe((19.345).toFixed(1));
  });
});
