import {
  blendStageElemental,
  computeStageCircuit,
  computeBatchCircuit,
  resolveIngredientElemental,
  type BatchStageInput,
} from "@/utils/tiltSkilletCircuit";
import type { ElementalProperties } from "@/types/alchemy";

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

describe("blendStageElemental", () => {
  it("returns a normalized elemental profile (sums to ~1)", () => {
    const blend = blendStageElemental(SEAR.ingredients);
    const sum = blend.Fire + blend.Water + blend.Earth + blend.Air;
    expect(sum).toBeCloseTo(1, 5);
    // Fire-dominant stage stays Fire-dominant
    expect(blend.Fire).toBeGreaterThan(blend.Water);
  });

  it("weights by quantity (more of an ingredient pulls the blend toward it)", () => {
    const mostlyFire = blendStageElemental([
      { name: "a", amount: 10, unit: "cup", elementalProperties: FIRE },
      { name: "b", amount: 1, unit: "cup", elementalProperties: WATER },
    ]);
    const mostlyWater = blendStageElemental([
      { name: "a", amount: 1, unit: "cup", elementalProperties: FIRE },
      { name: "b", amount: 10, unit: "cup", elementalProperties: WATER },
    ]);
    expect(mostlyFire.Fire).toBeGreaterThan(mostlyWater.Fire);
    expect(mostlyWater.Water).toBeGreaterThan(mostlyFire.Water);
  });

  it("falls back to neutral for an empty stage", () => {
    const blend = blendStageElemental([]);
    expect(blend.Fire).toBeCloseTo(0.25, 5);
  });
});

describe("computeStageCircuit", () => {
  it("produces finite circuit quantities with efficiency in [0,1]", () => {
    const s = computeStageCircuit(SEAR, 0);
    for (const v of [
      s.heat, s.entropy, s.reactivity, s.gregsEnergy, s.kalchm, s.monica,
      s.charge, s.potentialDifference, s.currentFlow, s.power, s.resistance, s.powerLosses, s.efficiency,
    ]) {
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(s.efficiency).toBeGreaterThanOrEqual(0);
    expect(s.efficiency).toBeLessThanOrEqual(1);
    // R = entropy mapping
    expect(s.resistance).toBeCloseTo(s.entropy, 6);
    // Losses = I²R
    expect(s.powerLosses).toBeCloseTo(s.currentFlow * s.currentFlow * s.resistance, 6);
    expect(s.name).toBe("Sear the base");
  });
});

describe("computeBatchCircuit", () => {
  it("wires stages into a series circuit with finite aggregates", () => {
    const { stages, series } = computeBatchCircuit([SEAR, BRAISE]);
    expect(stages).toHaveLength(2);
    expect(series.stageCount).toBe(2);
    expect(series.totalResistance).toBeCloseTo(stages[0].resistance + stages[1].resistance, 6);
    expect(series.totalCharge).toBeCloseTo(stages[0].charge + stages[1].charge, 6);
    for (const v of [
      series.totalPotential, series.totalResistance, series.seriesCurrent,
      series.totalPower, series.totalLosses, series.netEfficiency, series.netKalchm, series.netMonica,
    ]) {
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(series.netEfficiency).toBeGreaterThanOrEqual(0);
    expect(series.netEfficiency).toBeLessThanOrEqual(1);
  });

  it("handles an empty plan without throwing", () => {
    const { stages, series } = computeBatchCircuit([]);
    expect(stages).toHaveLength(0);
    expect(series.stageCount).toBe(0);
    expect(series.seriesCurrent).toBe(0);
    expect(series.netKalchm).toBe(1);
  });
});

describe("resolveIngredientElemental", () => {
  it("returns a neutral profile for an unknown ingredient", () => {
    const el = resolveIngredientElemental("definitely-not-a-real-ingredient-xyz");
    const sum = el.Fire + el.Water + el.Earth + el.Air;
    expect(sum).toBeCloseTo(1, 5);
    expect(el.Fire).toBeCloseTo(0.25, 5);
  });
});
