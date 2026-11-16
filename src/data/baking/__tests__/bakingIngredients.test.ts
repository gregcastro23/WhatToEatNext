/** @jest-environment node */
import { BAKING_INGREDIENTS } from "@/data/baking";
import { FDC_BAKING_RECORDS } from "@/data/baking/fdcRecords";
import { citation } from "@/lib/baking/citations";
import { SIM } from "@/lib/baking/sim/constants";

/**
 * Stated exceptions: baking soda is a pure chemical proximate analysis cannot
 * close; brown butter inherits butter's own 1.7 g FDC residual, which removing
 * the water magnifies to just over 2 % of the solids.
 */
const NON_CLOSING = new Set(["baking-soda", "brown-butter"]);

describe("baking ingredient vectors", () => {
  it("are unique by id and at least thirty strong", () => {
    const ids = BAKING_INGREDIENTS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(30);
  });

  it("name a real source for every field of every ingredient", () => {
    for (const i of BAKING_INGREDIENTS) {
      for (const [field, basis] of Object.entries(i.provenance)) {
        expect({ id: i.id, field, known: citation(basis.source) !== null }).toEqual({ id: i.id, field, known: true });
      }
    }
  });

  it("carry their FDC record's composition to the bit (the generated module is the only copy)", () => {
    const records = new Map(FDC_BAKING_RECORDS.map((r) => [r.fdcId, r]));
    for (const i of BAKING_INGREDIENTS) {
      if (i.fdc === null) continue;
      const r = records.get(i.fdc.fdcId);
      expect(r).toBeDefined();
      if (r === undefined) continue;
      expect([i.id, i.waterPct, i.fatPct, i.proteinPct]).toEqual([i.id, r.per100g.water, r.per100g.fat, r.per100g.protein]);
      expect(i.provenance.composition.fdcId).toBe(r.fdcId);
    }
  });

  it("close their proximate analysis within 2 % (ethanol counted), except a stated pure chemical", () => {
    for (const i of BAKING_INGREDIENTS) {
      if (NON_CLOSING.has(i.id)) continue;
      const c = i.composition;
      const closure = c.water + c.protein + c.fat + c.carbohydrate + c.ash + c.ethanol;
      expect({ id: i.id, closes: Math.abs(closure - 100) <= 2 }).toEqual({ id: i.id, closes: true });
    }
  });

  it("stay inside their physical ranges", () => {
    for (const i of BAKING_INGREDIENTS) {
      const fractions = [i.solidFatIndex, i.glutenPotency, i.reducingSugarScore, i.flourShare].filter((v): v is number => v !== null);
      expect({ id: i.id, ok: fractions.every((v) => v >= 0 && v <= 1) }).toEqual({ id: i.id, ok: true });
      expect({ id: i.id, ok: i.starchPct + i.sugarPct <= i.composition.carbohydrate + 0.5 }).toEqual({ id: i.id, ok: true });
      if (i.coagulationTempC !== null) expect(i.coagulationEndC ?? -1).toBeGreaterThan(i.coagulationTempC);
    }
  });

  it("keep absence as null: an unquantified acid is null, never a silent zero", () => {
    const brownSugar = BAKING_INGREDIENTS.find((i) => i.id === "brown-sugar");
    expect(brownSugar?.acidMmolPerG).toBeNull();
    expect(brownSugar?.provenance.acidMmolPerG.kind).toBe("ABSENT");
  });
});

describe("simulator constants", () => {
  it("each carries a basis with a known source", () => {
    for (const [key, c] of Object.entries(SIM)) expect({ key, known: citation(c.basis.source) !== null && Number.isFinite(c.value) }).toEqual({ key, known: true });
  });

  it("the gelatinization window width re-derives from the cassava DSC midpoints it cites", () => {
    expect(SIM.gelWindowK.value).toBe((69.1 + 77.12) / 2 - (56.33 + 63.0) / 2);
  });
});
