/** @jest-environment node */
import { BAKING_PRESETS, GENOISE_SPONGE, SOURDOUGH_COUNTRY_LOAF } from "@/data/baking/presets";
import type { BakingPreset } from "@/lib/baking/formulaTypes";
import { prepareBatter } from "@/lib/baking/sim/batter";
import { DEFAULT_NUMERICS, initialState } from "@/lib/baking/sim/simState";
import { exposedFaces, thermalStep } from "@/lib/baking/sim/simStep";
import { simulateBake, simulateReading } from "@/lib/baking/sim/simulate";
import type { SimNumerics, SimResult } from "@/lib/baking/sim/simTypes";
import { boilingPointC } from "@/lib/cooking/thermo";

const AMBIENT = { kitchenC: 20, kitchenRhPct: 50 };

function bake(p: BakingPreset, overrides: Partial<BakingPreset> = {}, numerics?: Partial<SimNumerics>): SimResult {
  const q = { ...p, ...overrides };
  const { batter, telemetry } = prepareBatter(q.formula, q.process);
  const input = { batter, geometry: q.geometry, oven: q.oven, ambient: AMBIENT, doneCoreC: q.doneCoreC };
  return simulateBake(numerics === undefined ? input : { ...input, numerics }, { structureToTenderizer: telemetry.structure.ratio });
}

function eventAt(r: SimResult, id: string): number | null {
  return r.events.find((e) => e.id === id)?.tMin ?? null;
}

describe("the evaporative plateau", () => {
  it("a wet core never passes the local boil, while the dried crust climbs past it", () => {
    const r = bake(SOURDOUGH_COUNTRY_LOAF);
    expect(Math.max(...r.frames.map((f) => f.coreC))).toBeLessThanOrEqual(r.boilingC + 1e-9);
    expect(r.frames[r.frames.length - 1]?.surfaceC ?? 0).toBeGreaterThan(150);
    expect(r.doneMin).not.toBeNull();
  });

  it("moves down with altitude, and the done target is capped below it", () => {
    const r = bake(SOURDOUGH_COUNTRY_LOAF, { oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, elevationM: 1600 } });
    expect(r.boilingC).toBeLessThan(95.5);
    expect(r.boilingC).toBeGreaterThan(93.5);
    expect(Math.max(...r.frames.map((f) => f.coreC))).toBeLessThanOrEqual(r.boilingC + 1e-9);
    expect(r.doneCoreC).toBeLessThan(r.boilingC);
    expect(r.limitations.join(" ")).toMatch(/capped/);
  });
});

describe("mechanisms the brief names", () => {
  it("steam condensing on the cold dough heats its surface faster", () => {
    // What the model DOES capture. Steam's other effect — an extensible crust that lets the loaf rise
    // longer — needs crust rigidity to cap the rise, which is not modelled (see the stated limitations).
    const dry = bake(SOURDOUGH_COUNTRY_LOAF, { oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, steamFraction: 0 } });
    const steamed = bake(SOURDOUGH_COUNTRY_LOAF);
    const at1 = (r: SimResult): number => r.frames.find((f) => f.tMin >= 1)?.surfaceC ?? 0;
    expect(at1(steamed)).toBeGreaterThan(at1(dry) + 5);
    expect(steamed.limitations.join(" ")).toMatch(/extensible crust/);
  });

  it("in heavy steam the surface climbs to the dew point within a minute — only condensation's latent heat can do that", () => {
    const y = 0.7;
    const heavy = bake(SOURDOUGH_COUNTRY_LOAF, { oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, steamFraction: y } });
    const dewPointC = boilingPointC(y * heavy.pressureKpa);
    const surfaceAt1 = heavy.frames.find((f) => f.tMin >= 1)?.surfaceC ?? 0;
    expect(dewPointC).toBeGreaterThan(89);
    expect(surfaceAt1).toBeGreaterThan(dewPointC - 6);
    expect(surfaceAt1).toBeLessThanOrEqual(heavy.boilingC);
  });

  it("at the oven door, condensing steam's latent heat lands in the outer layer within one step", () => {
    const outerAfterOneStep = (steamFraction: number): number => {
      const { batter } = prepareBatter(SOURDOUGH_COUNTRY_LOAF.formula, SOURDOUGH_COUNTRY_LOAF.process);
      const input = { batter, geometry: SOURDOUGH_COUNTRY_LOAF.geometry, oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, steamFraction }, ambient: AMBIENT, doneCoreC: 96 };
      const state = initialState(input, DEFAULT_NUMERICS);
      thermalStep(state, input, exposedFaces(state, input).map(() => ({ surfaceC: batter.startC, latentWm2: 0 })), DEFAULT_NUMERICS.dtS);
      return state.nodes[state.nodes.length - 1]?.tempC ?? 0;
    };
    expect(outerAfterOneStep(0.85) - outerAfterOneStep(0)).toBeGreaterThan(1);
  });

  it("the condensing steam's latent heat goes INTO the dough: heavy steam reaches done minutes sooner", () => {
    const dry = bake(SOURDOUGH_COUNTRY_LOAF, { oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, steamFraction: 0 } });
    const heavy = bake(SOURDOUGH_COUNTRY_LOAF, { oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, steamFraction: 0.85 } });
    expect((dry.doneMin ?? Infinity) - (heavy.doneMin ?? Infinity)).toBeGreaterThan(3);
  });

  it("more sucrose delays the set (Allan et al. 2020) — the sunken-cake mechanism", () => {
    const sweeter = { ...GENOISE_SPONGE.formula, lines: GENOISE_SPONGE.formula.lines.map((l) => (l.ingredientId === "granulated-sugar" ? { ...l, grams: l.grams * 2 } : l)) };
    const base = prepareBatter(GENOISE_SPONGE.formula, GENOISE_SPONGE.process).batter.sugarGelShiftK;
    const more = prepareBatter(sweeter, GENOISE_SPONGE.process).batter.sugarGelShiftK;
    expect(more).toBeGreaterThan(base);
    expect(eventAt(bake(GENOISE_SPONGE, { formula: sweeter }), "structure-set") ?? Infinity).toBeGreaterThan(eventAt(bake(GENOISE_SPONGE), "structure-set") ?? Infinity);
  });

  it("zones are entered in thermal order at the core", () => {
    const r = bake(SOURDOUGH_COUNTRY_LOAF);
    const starts = r.zones.filter((z) => z.zone <= 4).map((z) => z.startMin ?? Infinity);
    for (let i = 1; i < starts.length; i += 1) expect(starts[i] ?? Infinity).toBeGreaterThanOrEqual(starts[i - 1] ?? 0);
  });
});

describe("numerics", () => {
  it("is grid-converged at the default resolution: done within 10 % of a grid twice as fine", () => {
    const coarse = bake(SOURDOUGH_COUNTRY_LOAF).doneMin ?? Infinity;
    const fine = bake(SOURDOUGH_COUNTRY_LOAF, {}, { nodes: 48, dtS: 1 }).doneMin ?? Infinity;
    expect(Math.abs(coarse - fine) / fine).toBeLessThan(0.1);
  });

  it("is deterministic", () => {
    expect(bake(GENOISE_SPONGE).frames).toEqual(bake(GENOISE_SPONGE).frames);
  });

  it("every preset bakes to done inside its own bake time, with no failure mode", () => {
    for (const p of BAKING_PRESETS) {
      const r = bake(p);
      expect({ preset: p.id, done: r.doneMin !== null && r.doneMin <= p.oven.bakeMinutes }).toEqual({ preset: p.id, done: true });
      expect({ preset: p.id, warnings: r.warnings.filter((w) => w.severity !== "info").map((w) => w.id) }).toEqual({ preset: p.id, warnings: [] });
    }
  });
});

describe("failure modes and refusals", () => {
  it("a bake cut short reports a raw core", () => {
    const r = bake(SOURDOUGH_COUNTRY_LOAF, { oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, bakeMinutes: 10 } });
    expect(r.warnings.map((w) => w.id)).toContain("raw-core");
  });

  it("an oven far too hot scorches the crust before the core sets", () => {
    const r = bake(SOURDOUGH_COUNTRY_LOAF, { oven: { ...SOURDOUGH_COUNTRY_LOAF.oven, ovenC: 320, steamFraction: 0 } });
    expect(r.warnings.map((w) => w.id)).toContain("scorch");
  });

  it("refuses an input outside its envelope with a stated reason, not a number", () => {
    const { batter } = prepareBatter(GENOISE_SPONGE.formula, GENOISE_SPONGE.process);
    const r = simulateReading({ batter, geometry: GENOISE_SPONGE.geometry, oven: { ...GENOISE_SPONGE.oven, ovenC: 60 }, ambient: AMBIENT, doneCoreC: 95 });
    expect(r.available).toBe(false);
    if (!r.available) expect(r.reason).toMatch(/oven temperature/);
  });
});
