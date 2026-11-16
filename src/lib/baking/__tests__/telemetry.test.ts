/** @jest-environment node */
import { BAKING_PRESETS } from "@/data/baking/presets";
import { BICARBONATE_MMOL_PER_G, BITARTRATE_ACID_MMOL_PER_G, CO2_G_PER_MMOL } from "@/lib/baking/chemistry";
import { BAKING_ELEMENTS, elementalReading } from "@/lib/baking/elemental";
import type { Formula } from "@/lib/baking/formulaTypes";
import { scaleToLimit } from "@/lib/baking/scaling";
import { formulaTelemetry } from "@/lib/baking/telemetry";

function formula(lines: Array<[string, number]>): Formula {
  return { id: "t", name: "t", lines: lines.map(([ingredientId, grams]) => ({ ingredientId, grams })) };
}

describe("true hydration — the baker's convention, with hidden water counted", () => {
  it("a lean 70 % dough reads 70 %: the flour's own moisture stays out", () => {
    const t = formulaTelemetry(formula([["bread-flour", 1000], ["water", 700]]));
    expect(t.trueHydrationPct).toBeCloseTo(70, 9);
    expect(t.bakersPercent[0]).toBe(100);
  });

  it("counts even salt's trace moisture (0.2 g per 100 g) — real water is never dropped", () => {
    const t = formulaTelemetry(formula([["bread-flour", 1000], ["water", 700], ["salt", 20]]));
    expect(t.trueHydrationPct).toBeCloseTo(70 + (20 * 0.2) / 100 / 10, 9);
  });

  it("a levain's flour joins the base and its water joins the hydration", () => {
    const t = formulaTelemetry(formula([["bread-flour", 450], ["water", 300], ["sourdough-levain", 100]]));
    expect(t.flourGrams).toBe(500);
    expect(t.trueHydrationPct).toBeCloseTo(70, 9);
  });

  it("milk, egg and butter water count; plain hydration would miss them", () => {
    const t = formulaTelemetry(formula([["bread-flour", 500], ["whole-egg", 300], ["butter", 250]]));
    const expected = ((300 * 76.2) / 100 + (250 * 16.2) / 100) / 500 * 100;
    expect(t.trueHydrationPct).toBeCloseTo(expected, 9);
  });

  it("null with no flour, rather than a division by zero", () => {
    expect(formulaTelemetry(formula([["water", 100], ["granulated-sugar", 50]])).trueHydrationPct).toBeNull();
  });
});

describe("acid–base balance and the leavening budget", () => {
  it("cream of tartar neutralises soda one-for-one and releases one CO₂ each", () => {
    const sodaG = 2;
    const tartarG = (sodaG * BICARBONATE_MMOL_PER_G) / BITARTRATE_ACID_MMOL_PER_G;
    const t = formulaTelemetry(formula([["all-purpose-flour", 200], ["baking-soda", sodaG], ["cream-of-tartar", tartarG]]));
    expect(t.acidBase.excessBaseMmol).toBeCloseTo(0, 9);
    expect(t.leavening.neutralisationCo2Grams).toBeCloseTo(sodaG * BICARBONATE_MMOL_PER_G * CO2_G_PER_MMOL, 9);
  });

  it("soda with no acid decomposes at half the CO₂ and is reported as excess base", () => {
    const t = formulaTelemetry(formula([["all-purpose-flour", 200], ["water", 120], ["baking-soda", 2]]));
    expect(t.acidBase.excessBaseMmol).toBeCloseTo(2 * BICARBONATE_MMOL_PER_G, 9);
    expect(t.leavening.thermalCo2Grams).toBeCloseTo((2 * BICARBONATE_MMOL_PER_G * CO2_G_PER_MMOL) / 2, 9);
  });

  it("names an acidic ingredient whose acidity is unquantified, only when soda is there to care", () => {
    const withSoda = formulaTelemetry(formula([["all-purpose-flour", 200], ["brown-sugar", 100], ["baking-soda", 2]]));
    const without = formulaTelemetry(formula([["all-purpose-flour", 200], ["brown-sugar", 100]]));
    expect(withSoda.acidBase.unquantified).toContain("brown-sugar");
    expect(withSoda.caveats.join(" ")).toMatch(/brown-sugar/);
    expect(without.caveats.join(" ")).not.toMatch(/Acidity not quantified/);
  });
});

describe("scaling and the elemental projection", () => {
  it("scales the batch around the limiting ingredient exactly", () => {
    const f = formula([["butter", 200], ["all-purpose-flour", 300]]);
    const { formula: scaled, factor } = scaleToLimit(f, 0, 135);
    expect(factor).toBe(135 / 200);
    expect(scaled.lines[0]?.grams).toBe(135);
    expect(scaled.lines[1]?.grams).toBe(300 * (135 / 200));
    expect(() => scaleToLimit(formula([["butter", 0]]), 0, 10)).toThrow(RangeError);
  });

  it("every preset's elements stay 0–100, shares sum to one, components stay 0–1", () => {
    for (const preset of BAKING_PRESETS) {
      const reading = elementalReading(formulaTelemetry(preset.formula), 0.5, preset.process.densityGPerMl, { browningExtent: 0.5, volumeRatio: 1.4 });
      const total = BAKING_ELEMENTS.reduce((s, e) => s + reading.shares[e], 0);
      expect(total).toBeCloseTo(1, 12);
      for (const e of BAKING_ELEMENTS) {
        expect(reading.scores[e]).toBeGreaterThanOrEqual(0);
        expect(reading.scores[e]).toBeLessThanOrEqual(100);
        for (const c of reading.components[e]) expect(c.value >= 0 && c.value <= 1).toBe(true);
      }
    }
  });
});
