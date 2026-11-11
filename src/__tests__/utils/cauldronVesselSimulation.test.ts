import { CatalogResponseSchema } from "@/components/lab/cauldron/useElementalCatalog";
import { COOKING_REGIMES } from "@/lib/cooking/cookingRegimes";
import { saturationTemperatureC } from "@/lib/cooking/if97";
import { readVessel } from "@/lib/cooking/thermoVessel";
import { DEFAULT_VESSEL, VESSEL_PRESETS, type VesselState } from "@/lib/cooking/vesselState";
import type { ElementalProperties } from "@/types/alchemy";
import {
  blendStageElementalWithCatalog,
  computeCauldronCircuitWithCatalog,
  computeStageCircuitWithCatalog,
  findIngredientElemental,
  ingredientMatchReport,
  matchIngredient,
  namedStages,
  resolveIngredientElementalFromCatalog,
  unresolvedIngredientNames,
  type BatchStageInput,
} from "@/utils/cauldronVesselCore";
import { cauldronVesselProfile } from "@/utils/cauldronVesselProfile";
import { buildIngredientElementalCatalog, simulateCauldron } from "@/utils/cauldronVesselSimulation";

const FIRE: ElementalProperties = { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 };
const WATER: ElementalProperties = { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 };

const SEAR: BatchStageInput = {
  name: "Sear the base",
  ingredients: [
    { name: "beef", amount: 4, unit: "cup", elementalProperties: FIRE },
    { name: "onion", amount: 2, unit: "cup", elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.1, Air: 0.1 } },
  ],
};
const BRAISE: BatchStageInput = {
  name: "Braise the bulk",
  ingredients: [
    { name: "stock", amount: 6, unit: "cup", elementalProperties: WATER },
    { name: "carrot", amount: 3, unit: "cup", elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 } },
  ],
};

function preset(id: "open" | "sealed" | "vacuum"): VesselState {
  const found = VESSEL_PRESETS.find((p) => p.id === id);
  if (!found) throw new Error(`missing preset ${id}`);
  return found.state;
}

function profileFor(state: VesselState): ReturnType<typeof cauldronVesselProfile> {
  return cauldronVesselProfile(state, readVessel(state));
}

describe("cauldron vessel profile — every field is read off the SI vessel", () => {
  it("voltage spans the vessel's 20–260 °C control range", () => {
    expect(profileFor({ ...DEFAULT_VESSEL, temperatureC: 20 }).profile.voltage).toBe(0);
    expect(profileFor({ ...DEFAULT_VESSEL, temperatureC: 260 }).profile.voltage).toBe(1);
    expect(profileFor({ ...DEFAULT_VESSEL, temperatureC: 140 }).profile.voltage).toBe(0.5);
  });

  it("current is the steam ceiling measured from the same 20 °C floor", () => {
    const top = saturationTemperatureC(250);
    expect(profileFor({ ...DEFAULT_VESSEL, pressureKpa: 250 }).profile.current).toBe(1);
    expect(profileFor(DEFAULT_VESSEL).profile.current).toBe((saturationTemperatureC(101.325) - 20) / (top - 20));
  });

  it("resistance is the unbalanced share of surface vapour pressure, zero when nothing evaporates", () => {
    expect(profileFor(preset("sealed")).profile.resistance).toBe(0);
    const open = readVessel(DEFAULT_VESSEL);
    expect(profileFor(DEFAULT_VESSEL).profile.resistance).toBe(open.vaporDeficitKpa / open.surfaceVaporKpa);
    const condensing = { ...DEFAULT_VESSEL, temperatureC: 60, humidityPct: 100, headspaceC: 100 };
    expect(profileFor(condensing).profile.resistance).toBe(0);
  });

  it("force impact counts the cited regimes the vessel has switched on", () => {
    const sear = { ...DEFAULT_VESSEL, temperatureC: 180 };
    const r = readVessel(sear);
    const active = new Set([...r.regimesWhileWet, ...r.regimesOnceDry].map((x) => x.id)).size;
    expect(profileFor(sear).profile.forceImpact).toBe(active / COOKING_REGIMES.length);
  });

  it("velocity follows the thermal drive and momentum the wet-heat ceiling, by ruling", () => {
    const { profile } = profileFor(preset("vacuum"));
    expect(profile.velocityFactor).toBe(profile.voltage);
    expect(profile.momentumRetention).toBe(profile.current);
  });

  it("shows every mapping with its reading and formula, all inside 0–1", () => {
    for (const p of VESSEL_PRESETS) {
      const { mappings } = profileFor(p.state);
      expect(mappings.map((m) => m.field).sort()).toEqual(
        ["current", "forceImpact", "momentumRetention", "resistance", "velocityFactor", "voltage"],
      );
      for (const m of mappings) {
        expect(m.reading.length).toBeGreaterThan(0);
        expect(m.formula.length).toBeGreaterThan(0);
        expect(m.value).toBeGreaterThanOrEqual(0);
        expect(m.value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("cauldron circuit", () => {
  const OPEN = profileFor(DEFAULT_VESSEL).profile;

  it("blends by quantity and normalises", () => {
    const blend = blendStageElementalWithCatalog(SEAR.ingredients);
    expect(blend.Fire + blend.Water + blend.Earth + blend.Air).toBeCloseTo(1, 12);
    expect(blend.Fire).toBeGreaterThan(blend.Water);
    expect(blendStageElementalWithCatalog([]).Fire).toBe(0.25);
  });

  it("produces finite stage quantities with R = entropy and losses = I²R", () => {
    const s = computeStageCircuitWithCatalog(SEAR, 0, OPEN);
    for (const v of [s.heat, s.entropy, s.reactivity, s.gregsEnergy, s.kalchm, s.monica, s.charge, s.potentialDifference, s.currentFlow, s.power]) {
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(s.resistance).toBe(s.entropy);
    expect(s.powerLosses).toBe(s.currentFlow * s.currentFlow * s.resistance);
    expect(s.efficiency).toBeGreaterThanOrEqual(0);
    expect(s.efficiency).toBeLessThanOrEqual(1);
    expect(s.name).toBe("Sear the base");
  });

  it("names a blank stage by its position", () => {
    expect(computeStageCircuitWithCatalog({ ...BRAISE, name: "  " }, 1, OPEN).name).toBe("Stage 2");
  });

  it("wires stages in series", () => {
    const { stages, series } = computeCauldronCircuitWithCatalog([SEAR, BRAISE], OPEN);
    const [a, b] = stages;
    if (!a || !b) throw new Error("expected two stages");
    expect(series.stageCount).toBe(2);
    expect(series.totalResistance).toBe(a.resistance + b.resistance);
    expect(series.totalCharge).toBe(a.charge + b.charge);
    expect(series.netEfficiency).toBeGreaterThanOrEqual(0);
    expect(series.netEfficiency).toBeLessThanOrEqual(1);
  });

  it("handles an empty cauldron", () => {
    const { series } = computeCauldronCircuitWithCatalog([], OPEN);
    expect(series.stageCount).toBe(0);
    expect(series.seriesCurrent).toBe(0);
    expect(series.netKalchm).toBe(1);
  });

  it("the vessel moves the circuit: a sealed vessel and a vacuum read differently", () => {
    const sealed = computeCauldronCircuitWithCatalog([SEAR], profileFor(preset("sealed")).profile);
    const vacuum = computeCauldronCircuitWithCatalog([SEAR], profileFor(preset("vacuum")).profile);
    expect(sealed.series.totalPower).not.toBe(vacuum.series.totalPower);
    // ESMS comes from the ingredients, not the vessel.
    expect(sealed.stages[0]?.esms).toEqual(vacuum.stages[0]?.esms);
  });
});

describe("ingredient resolution against the full catalog", () => {
  const catalog = buildIngredientElementalCatalog();

  it("serves a catalog the client's schema accepts", () => {
    expect(CatalogResponseSchema.safeParse({ catalog }).success).toBe(true);
    expect(Object.keys(catalog).length).toBeGreaterThan(500);
  });

  it("finds real ingredients and reports unknown ones instead of hiding them", () => {
    expect(findIngredientElemental("garlic", catalog)).not.toBeNull();
    expect(findIngredientElemental("definitely-not-a-real-ingredient-xyz", catalog)).toBeNull();
    expect(resolveIngredientElementalFromCatalog("definitely-not-a-real-ingredient-xyz", catalog).Fire).toBe(0.25);
    const stages: BatchStageInput[] = [
      { ingredients: [{ name: "garlic", amount: 1, unit: "tbsp" }, { name: "zzq-unknown", amount: 1, unit: "cup" }, { name: " ", amount: 1, unit: "cup" }] },
    ];
    expect(unresolvedIngredientNames(stages, catalog)).toEqual(["zzq-unknown"]);
  });

  it("simulates end to end from stages and a vessel", () => {
    const sim = simulateCauldron([SEAR, BRAISE], preset("sealed"));
    expect(sim.circuit.series.stageCount).toBe(2);
    expect(sim.profile.profile.resistance).toBe(0);
    // Pure steam at the vessel pressure over a surface at the boil: heat-limited, not equilibrium.
    expect(sim.reading.transfer).toBe("heat-limited");
  });
});

describe("series aggregation — exact, not just bounded", () => {
  const OPEN = profileFor(DEFAULT_VESSEL).profile;
  const { stages, series } = computeCauldronCircuitWithCatalog([SEAR, BRAISE], OPEN);

  it("series current is total potential over total resistance, and losses are I²R", () => {
    expect(series.seriesCurrent).toBe(series.totalPotential / series.totalResistance);
    expect(series.totalLosses).toBe(series.seriesCurrent * series.seriesCurrent * series.totalResistance);
    expect(series.totalPotential).toBe(stages.reduce((sum, st) => sum + st.potentialDifference, 0));
    expect(series.totalPower).toBe(stages.reduce((sum, st) => sum + st.power, 0));
  });

  it("net Kalchm is the product and net Monica the mean of the stages", () => {
    expect(series.netKalchm).toBe(stages.reduce((prod, st) => prod * st.kalchm, 1));
    expect(series.netMonica).toBe(stages.reduce((sum, st) => sum + st.monica, 0) / stages.length);
  });

  it("server callers can pass planetary positions, and they move the circuit", () => {
    const sky = { Mars: { sign: "aries", isRetrograde: true }, Venus: { sign: "taurus", isRetrograde: false } };
    const withSky = computeCauldronCircuitWithCatalog([SEAR], OPEN, undefined, sky);
    const without = computeCauldronCircuitWithCatalog([SEAR], OPEN);
    expect(withSky.series.totalPower).not.toBe(without.series.totalPower);
  });
});

describe("ingredient matching is reported, not hidden", () => {
  const catalog = buildIngredientElementalCatalog();

  it("an exact multi-word name resolves through its underscore key", () => {
    expect(matchIngredient("Olive Oil", catalog)).toEqual({ key: "olive_oil", elemental: catalog.olive_oil, exact: true });
  });

  it("a substring match is marked partial — 'egg' must not pass as a lookup", () => {
    const egg = matchIngredient("egg", catalog);
    expect(egg?.exact).toBe(false);
    expect(egg?.key).not.toBe("egg");
    expect(matchIngredient("stock", catalog)?.exact).toBe(false);
  });

  it("the report separates misses from partial matches", () => {
    const report = ingredientMatchReport(
      [{ ingredients: [{ name: "garlic", amount: 1, unit: "tbsp" }, { name: "stock", amount: 1, unit: "cup" }, { name: "zzq-unknown", amount: 1, unit: "cup" }] }],
      catalog,
    );
    expect(report.unresolved).toEqual(["zzq-unknown"]);
    expect(report.partial.map((p) => p.name)).toEqual(["stock"]);
  });

  it("an empty stage is not wired: it would add a made-up neutral circuit", () => {
    const empty: BatchStageInput = { name: "Stage 3", ingredients: [{ name: "  ", amount: 1, unit: "cup" }] };
    expect(namedStages([SEAR, empty, BRAISE]).map((st) => st.name)).toEqual(["Sear the base", "Braise the bulk"]);
    const OPEN = profileFor(DEFAULT_VESSEL).profile;
    const wired = computeCauldronCircuitWithCatalog(namedStages([SEAR, empty, BRAISE]), OPEN);
    const baseline = computeCauldronCircuitWithCatalog([SEAR, BRAISE], OPEN);
    expect(wired.series.totalPower).toBe(baseline.series.totalPower);
  });
});
