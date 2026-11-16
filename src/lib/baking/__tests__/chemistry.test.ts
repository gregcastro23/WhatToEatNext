/** @jest-environment node */
import { fdcNutrient } from "@/data/baking/defineIngredient";
import {
  ATOMIC_WEIGHT,
  BICARBONATE_MMOL_PER_G,
  BITARTRATE_ACID_MMOL_PER_G,
  CO2_PER_G_BICARBONATE_NEUTRALISED,
  CO2_PER_G_BICARBONATE_THERMAL,
  MOLAR_MASS,
  NACL_PAC,
  pacFromMolarMass,
  SUGAR_PAC,
} from "@/lib/baking/chemistry";
import { aqueousWaterActivity, solubilityGPerGWater } from "@/lib/baking/waterActivity";
import type { SugarProfile } from "@/lib/baking/types";

function sugars(partial: Partial<SugarProfile>): SugarProfile {
  return { sucrose: 0, glucose: 0, fructose: 0, lactose: 0, maltose: 0, galactose: 0, allulose: 0, unspeciated: 0, ...partial };
}

describe("molar masses are computed from the atomic weights, not typed", () => {
  it("sucrose and water re-derive to the bit, in the module's own summation order", () => {
    const { H, C, O } = ATOMIC_WEIGHT;
    expect(MOLAR_MASS.sucrose).toBe(22 * H + 12 * C + 11 * O);
    expect(MOLAR_MASS.water).toBe(2 * H + O);
  });

  it("PAC is colligative: sucrose is 100 exactly and glucose recovers the tables' 190", () => {
    expect(SUGAR_PAC.sucrose).toBe(100);
    expect(SUGAR_PAC.glucose).toBeCloseTo(190.0, 2);
    expect(SUGAR_PAC.lactose).toBe(100);
    expect(NACL_PAC).toBe(pacFromMolarMass(MOLAR_MASS.sodiumChloride, 2));
  });
});

describe("leavening stoichiometry", () => {
  it("one CO₂ per bicarbonate with acid, half by heat alone", () => {
    expect(CO2_PER_G_BICARBONATE_NEUTRALISED).toBe(MOLAR_MASS.carbonDioxide / MOLAR_MASS.sodiumBicarbonate);
    expect(CO2_PER_G_BICARBONATE_THERMAL).toBe(CO2_PER_G_BICARBONATE_NEUTRALISED / 2);
    expect(CO2_PER_G_BICARBONATE_NEUTRALISED).toBeCloseTo(0.5239, 4);
  });

  it("FDC's sodium for baking soda corroborates pure NaHCO₃ within 0.2 %", () => {
    const sodiumMmolPerG = fdcNutrient("baking-soda", "sodiumMg") / ATOMIC_WEIGHT.Na / 100;
    expect(Math.abs(sodiumMmolPerG / BICARBONATE_MMOL_PER_G - 1)).toBeLessThan(0.002);
  });

  it("FDC's ash for cream of tartar matches the K₂CO₃ its ignition leaves within 0.5 %", () => {
    const k2co3 = 2 * ATOMIC_WEIGHT.K + ATOMIC_WEIGHT.C + 3 * ATOMIC_WEIGHT.O;
    const residuePct = (k2co3 / (2 * MOLAR_MASS.potassiumBitartrate)) * 100;
    expect(Math.abs(fdcNutrient("cream-of-tartar", "ash") / residuePct - 1)).toBeLessThan(0.005);
    expect(BITARTRATE_ACID_MMOL_PER_G).toBe(1000 / MOLAR_MASS.potassiumBitartrate);
  });
});

describe("aqueous water activity (Norrish + Ross)", () => {
  it("reproduces the measured a_w of saturated sucrose at 25 °C (0.844) within 0.005", () => {
    const water = 100;
    const sucrose = (solubilityGPerGWater("sucrose") ?? 0) * water;
    const r = aqueousWaterActivity(water, sugars({ sucrose }), 0);
    expect(r.available).toBe(true);
    if (r.available) expect(Math.abs(r.value.aw - 0.844)).toBeLessThan(0.005);
  });

  it("pure water is 1, and sugar or salt only lower it", () => {
    const pure = aqueousWaterActivity(100, sugars({}), 0);
    const sweet = aqueousWaterActivity(100, sugars({ sucrose: 80 }), 0);
    const salty = aqueousWaterActivity(100, sugars({ sucrose: 80 }), 5);
    if (!pure.available || !sweet.available || !salty.available) throw new Error("expected readings");
    expect(pure.value.aw).toBe(1);
    expect(sweet.value.aw).toBeLessThan(1);
    expect(salty.value.aw).toBeLessThan(sweet.value.aw);
  });

  it("NaCl counts as two ions: 1 molal sits on the ideal two-ion value and near the measured 0.967", () => {
    const r = aqueousWaterActivity(1000, sugars({}), MOLAR_MASS.sodiumChloride);
    if (!r.available) throw new Error("expected a reading");
    const waterMol = 1000 / MOLAR_MASS.water;
    expect(r.value.aw).toBeCloseTo(waterMol / (waterMol + 2), 12);
    // Robinson & Stokes' osmotic coefficient (≈0.936 at 1 m) puts the measured value at ≈0.967; ideal is 0.2 % low.
    expect(Math.abs(r.value.aw - 0.967)).toBeLessThan(0.005);
  });

  it("sugar past saturation stays crystalline and depresses nothing further", () => {
    const cap = (solubilityGPerGWater("sucrose") ?? 0) * 50;
    const saturated = aqueousWaterActivity(50, sugars({ sucrose: cap }), 0);
    const excess = aqueousWaterActivity(50, sugars({ sucrose: 300 }), 0);
    if (!saturated.available || !excess.available) throw new Error("expected readings");
    expect(excess.value.aw).toBe(saturated.value.aw);
    expect(excess.value.undissolvedSucroseGrams).toBe(300 - cap);
  });

  it("names what it could not model instead of counting it silently", () => {
    const r = aqueousWaterActivity(100, sugars({ lactose: 5, unspeciated: 2 }), 0, 1);
    if (!r.available) throw new Error("expected a reading");
    expect(r.value.excluded.join(" ")).toMatch(/lactose/);
    expect(r.value.excluded.join(" ")).toMatch(/unknown species/);
    expect(r.value.excluded.join(" ")).toMatch(/ethanol/);
  });

  it("refuses with no free water", () => {
    expect(aqueousWaterActivity(0, sugars({ sucrose: 10 }), 0).available).toBe(false);
  });
});
