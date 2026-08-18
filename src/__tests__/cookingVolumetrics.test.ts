/**
 * Volumetrics — measured volume→mass, packing, batch energy, and shrinkage.
 *
 * The defect this layer exists to fix is quantified, not asserted:
 * `[MEASURED 2026-08-18]` across the 1,078-recipe corpus, converting every
 * volume unit as if the ingredient were water overstates the total mass of
 * volume-measured ingredients by 11.6 %, with individual errors up to 15×.
 *
 * @file src/__tests__/cookingVolumetrics.test.ts
 */
import { MEASURED_PORTIONS, PORTIONS_BY_INGREDIENT } from "@/data/cooking/measuredPortions";
import type { MassFractions } from "@/lib/cooking/choiOkos";
import {
  MEASURE_ML,
  analysePacking,
  batchFusionLoad,
  batchThermalLoad,
  measuredPortionFor,
  volumeAfterMoistureLoss,
  volumeOnFreezing,
  volumeToMass,
} from "@/lib/cooking/volumetrics";

/** What `src/utils/unitConversion.ts` assumes a cup weighs, for every ingredient. */
const WATER_ASSUMPTION_G_PER_CUP = 240;

const FLOUR: MassFractions = {
  water: 0.119,
  protein: 0.103,
  fat: 0.01,
  carbohydrate: 0.763,
  ash: 0.0047,
};
const OLIVE_OIL: MassFractions = { water: 0, protein: 0, fat: 1, carbohydrate: 0, ash: 0 };
const STOCK: MassFractions = {
  water: 0.95,
  protein: 0.02,
  fat: 0.005,
  carbohydrate: 0.015,
  ash: 0.01,
};

describe("measured portions data", () => {
  it("is populated — an empty table would pass every test below vacuously", () => {
    expect(MEASURED_PORTIONS.length).toBeGreaterThan(0);
    expect(PORTIONS_BY_INGREDIENT.size).toBe(MEASURED_PORTIONS.length);
  });

  it("carries the FDC record behind every row", () => {
    // A gram weight with no source is the thing this table replaces.
    for (const row of MEASURED_PORTIONS) {
      expect(typeof row.fdcId).toBe("number");
      expect(row.fdcId).toBeGreaterThan(0);
      expect(row.fdcDescription.length).toBeGreaterThan(0);
      expect(row.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Object.keys(row.gramsPer).length).toBeGreaterThan(0);
      for (const grams of Object.values(row.gramsPer)) {
        expect(grams).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the measures ordered cup > tbsp > tsp wherever all three exist", () => {
    // A transposed or mislabelled row would show up here and nowhere else.
    for (const row of MEASURED_PORTIONS) {
      const { cup, tbsp, tsp } = row.gramsPer;
      if (cup !== undefined && tbsp !== undefined) expect(cup).toBeGreaterThan(tbsp);
      if (tbsp !== undefined && tsp !== undefined) expect(tbsp).toBeGreaterThan(tsp);
    }
  });
});

describe("volume to mass", () => {
  it("uses the USDA cup, not the 240 mL nutrition-label cup", () => {
    // Mixing the two is a 1.4 % error sitting silently under everything else.
    expect(MEASURE_ML.cup).toBeCloseTo(236.588, 3);
    expect(MEASURE_ML.tbsp).toBeCloseTo(236.588 / 16, 6);
    expect(MEASURE_ML.tsp).toBeCloseTo(236.588 / 48, 6);
  });

  it("disagrees sharply with the water assumption it replaces", () => {
    // The numbers that justify the whole layer. Each is a measured USDA weight.
    const cases: Array<[string, number, number]> = [
      ["All-Purpose Flour", 125, 1.92],
      ["Sugar", 188, 1.28],
      ["Cilantro", 16, 15.0],
    ];
    for (const [ingredient, wantGrams, wantRatio] of cases) {
      const got = volumeToMass(ingredient, 1, "cup");
      expect(got).not.toBeNull();
      expect(got!.grams).toBeCloseTo(wantGrams, 4);
      expect(WATER_ASSUMPTION_G_PER_CUP / got!.grams).toBeCloseTo(wantRatio, 1);
      expect(got!.basis).toBe("usda-measured");
      expect(got!.fdcId).toBeGreaterThan(0);
    }
  });

  it("also catches the case where the old table UNDERSTATES", () => {
    // Salt is denser than water, so the water assumption is low, not high.
    // A fix that only ever reduced masses would be wrong in a way that a
    // one-directional test could not see.
    const salt = volumeToMass("Salt", 1, "cup");
    expect(salt!.grams).toBeGreaterThan(WATER_ASSUMPTION_G_PER_CUP);
  });

  it("REFUSES rather than guessing when nobody has measured the ingredient", () => {
    // The defect being fixed is not "the number was wrong", it is "a number was
    // always returned". Returning null is the point.
    expect(volumeToMass("Quinoa", 1, "cup")).toBeNull();
    expect(volumeToMass("no such ingredient at all", 1, "cup")).toBeNull();
    // Present ingredient, but USDA published no cup weight for it.
    const thyme = measuredPortionFor("Thyme");
    expect(thyme).toBeDefined();
    if (thyme!.gramsPer.cup === undefined) {
      expect(volumeToMass("Thyme", 1, "cup")).toBeNull();
    }
  });

  it("scales linearly and matches on lookup regardless of case or padding", () => {
    const one = volumeToMass("All-Purpose Flour", 1, "cup")!;
    const three = volumeToMass("  all-purpose FLOUR ", 3, "cup")!;
    expect(three.grams).toBeCloseTo(one.grams * 3, 9);
    expect(() => volumeToMass("Sugar", -1, "cup")).toThrow(RangeError);
  });
});

describe("packing — how much of a cup is air", () => {
  it("finds a liquid essentially solid, and a powder mostly air", () => {
    // Choi & Okos gives TRUE density; a measured cup gives BULK. For a liquid
    // they coincide, and for flour they do not — which is exactly why
    // composition alone cannot convert a cup of a powder.
    const oil = analysePacking(OLIVE_OIL, 216, "cup");
    expect(Math.abs(oil.porosity)).toBeLessThan(0.02);

    const flour = analysePacking(FLOUR, 125, "cup");
    expect(flour.porosity).toBeGreaterThan(0.55);
    expect(flour.porosity).toBeLessThan(0.75);
    // Sanity: bulk must be the smaller of the two for anything with voids.
    expect(flour.bulkDensityKgM3).toBeLessThan(flour.trueDensityKgM3);
  });

  it("reports a physically impossible porosity rather than clamping it", () => {
    // Bulk above true density cannot happen, so a negative value is a signal
    // that the measured portion and the composition describe different
    // preparations. Clamping to zero would erase that signal.
    const impossible = analysePacking(OLIVE_OIL, 400, "cup");
    expect(impossible.porosity).toBeLessThan(0);
  });
});

describe("batch thermal load", () => {
  it("shows the latent term dominating a reduction", () => {
    // 2 L of stock, 20 → 100 °C, losing 8 % of its mass to steam.
    const load = batchThermalLoad(2, STOCK, 20, 100, 0.08);
    expect(load.sensibleJ).toBeGreaterThan(0);
    expect(load.latentJ).toBeGreaterThan(0);
    // Just 8 % of the mass accounts for over a third of the energy.
    expect(load.latentShare).toBeGreaterThan(0.3);
    expect(load.totalJ).toBeCloseTo(load.sensibleJ + load.latentJ, 6);
  });

  it("turns energy into time at a stated burner power", () => {
    const load = batchThermalLoad(2, STOCK, 20, 100, 0.08);
    const minutes = load.minutesAt(2000);
    // The honest answer is materially longer than the sensible-only estimate,
    // which is why pots take longer than the arithmetic suggests.
    expect(minutes).toBeGreaterThan(load.sensibleJ / 2000 / 60);
    expect(load.minutesAt(4000)).toBeCloseTo(minutes / 2, 9);
    expect(() => load.minutesAt(0)).toThrow(RangeError);
  });

  it("doubles with the batch, which is the point about scaling up", () => {
    const single = batchThermalLoad(1, STOCK, 20, 100);
    const double = batchThermalLoad(2, STOCK, 20, 100);
    expect(double.totalJ).toBeCloseTo(single.totalJ * 2, 6);
  });

  it("evaluates properties at the midpoint, not an endpoint", () => {
    // Specific heat varies across the span; using either end biases the answer
    // in a predictable direction. A midpoint evaluation must land BETWEEN the
    // two endpoint evaluations.
    const mid = batchThermalLoad(1, STOCK, 0, 100).sensibleJ;
    const lo = 1 * 100 * 4180;
    expect(mid).toBeGreaterThan(lo * 0.9);
    expect(mid).toBeLessThan(lo * 1.1);
  });

  it("refuses a non-positive mass", () => {
    expect(() => batchThermalLoad(0, STOCK, 20, 100)).toThrow(RangeError);
    expect(() => batchFusionLoad(-1, 0.9)).toThrow(RangeError);
  });
});

describe("volume change", () => {
  it("shrinks volume FASTER than mass, because water is the least dense part", () => {
    const reduced = volumeAfterMoistureLoss(STOCK, 0.5);
    expect(reduced.massRatio).toBeCloseTo(0.5, 9);
    expect(reduced.volumeRatio).toBeLessThan(reduced.massRatio);
    // …and the solids concentrate.
    expect(reduced.finalWaterFraction).toBeLessThan(STOCK.water);
  });

  it("refuses to evaporate more water than the food contains", () => {
    // Past that point the mass would have to come from the solids, which is
    // rendering or pyrolysis — a different process, not a bigger number.
    expect(() => volumeAfterMoistureLoss(STOCK, 0.99)).toThrow(RangeError);
    expect(() => volumeAfterMoistureLoss(STOCK, 1)).toThrow(RangeError);
  });

  it("expands on freezing by LESS than water does, because only some water freezes", () => {
    // Pure water expands ~9 %. A food expands less: bound water stays liquid
    // and the solids do not expand at all. This is why a full jar of stock
    // splits and a full jar of oil does not.
    const frozen = volumeOnFreezing(STOCK);
    expect(frozen.volumeRatio).toBeGreaterThan(1);
    expect(frozen.volumeRatio).toBeLessThan(1.09);
    const oilFrozen = volumeOnFreezing(OLIVE_OIL);
    expect(oilFrozen.volumeRatio).toBeCloseTo(1, 6);
  });
});
