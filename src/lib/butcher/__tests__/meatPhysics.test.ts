/**
 * @jest-environment node
 *
 * Tests for USDA FDC proximate mass closure, collagen-to-gelatin kinetics,
 * Warner-Bratzler slice-angle shear clamping, and cross-site recipe matching.
 */
import {
  BUTCHER_CUTS,
  SPECIES_LIST,
  getCutById,
  getFdcRecordForCut,
} from "@/data/butcher/cutsCatalogue";
import { FDC_BUTCHER_RECORDS } from "@/data/butcher/fdcButcherRecords";
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import {
  matchIngredientToButcherCut,
  matchRecipeToButcherCut,
} from "@/lib/butcher/recipeCutMatch";
import {
  evaluateGrainSlice,
  evaluateThermalProfile,
  generateThermalCurve,
} from "@/lib/butcher/science/meatPhysics";
import type { Recipe } from "@/types/recipe";

describe("USDA FDC Butcher Catalogue & Meat Biophysics", () => {
  it("covers all 5 species with 52 USDA-pinned cuts and valid proximate mass closure", () => {
    expect(SPECIES_LIST).toHaveLength(5);
    expect(BUTCHER_CUTS.length).toBeGreaterThanOrEqual(50);

    for (const cut of BUTCHER_CUTS) {
      const fdc = getFdcRecordForCut(cut);
      expect(fdc).not.toBeNull();
      if (!fdc) continue;

      const sum = fdc.waterG + fdc.proteinG + fdc.fatG + fdc.ashG;
      expect(sum).toBeGreaterThanOrEqual(96);
      expect(sum).toBeLessThanOrEqual(103);
      expect(fdc.collagenG).toBeGreaterThanOrEqual(0.2);
      expect(fdc.collagenG).toBeLessThanOrEqual(4.5);

      const grainLen = Math.hypot(
        cut.grainVector[0],
        cut.grainVector[1],
        cut.grainVector[2],
      );
      expect(grainLen).toBeCloseTo(1.0, 4);
      expect(cut.targetCoreTempC.min).toBeLessThanOrEqual(cut.targetCoreTempC.ideal);
      expect(cut.targetCoreTempC.ideal).toBeLessThanOrEqual(cut.targetCoreTempC.max);
      expect(Object.hasOwn(METHOD_PHYSICS, cut.solverMethodId)).toBe(true);
    }

    expect(Object.keys(FDC_BUTCHER_RECORDS).length).toBeGreaterThanOrEqual(45);
  });

  it("models collagen-to-gelatin hydrolysis vs actin moisture loss accurately", () => {
    const brisket = getCutById("brisket-flat");
    const tenderloin = getCutById("tenderloin-filet");
    expect(brisket).not.toBeNull();
    expect(tenderloin).not.toBeNull();
    if (!brisket || !tenderloin) return;

    // Brief cook at 70 °C leaves brisket collagen unhydrolyzed and tough
    const stalledBrisket = evaluateThermalProfile(brisket, 70, 10);
    expect(stalledBrisket.gelatinConversionPct).toBeLessThan(10);
    expect(stalledBrisket.tendernessScore).toBeLessThan(55);
    expect(stalledBrisket.warning).not.toBeNull();

    // Long braise / smoke at 92 °C converts >85% collagen to gelatin and restores tenderness
    const braisedBrisket = evaluateThermalProfile(brisket, 92, 240);
    expect(braisedBrisket.gelatinConversionPct).toBeGreaterThan(85);
    expect(braisedBrisket.tendernessScore).toBeGreaterThan(stalledBrisket.tendernessScore + 25);

    // Lean tenderloin peaks around 53 °C and loses tenderness/moisture past actin coagulation
    const rareTenderloin = evaluateThermalProfile(tenderloin, 53, 8);
    const overcookedTenderloin = evaluateThermalProfile(tenderloin, 76, 15);
    expect(rareTenderloin.tendernessScore).toBeGreaterThan(
      overcookedTenderloin.tendernessScore + 20,
    );
    expect(rareTenderloin.moistureRetentionPct).toBeGreaterThan(
      overcookedTenderloin.moistureRetentionPct + 15,
    );

    const curve = generateThermalCurve(brisket, 180);
    expect(curve.length).toBe(21);
  });

  it("clamps parallel 0-degree grain slices cleanly with zero Infinity or NaN", () => {
    const skirt = getCutById("outside-skirt");
    expect(skirt).not.toBeNull();
    if (!skirt) return;

    // Orthogonal vector perpendicular to grainVector -> dot === 0 -> theta === 0 deg
    const gx = skirt.grainVector[0];
    const gy = skirt.grainVector[1];
    const parallelNormal: readonly [number, number, number] = [-gy, gx, 0];

    const parallelEval = evaluateGrainSlice(skirt, parallelNormal, 225, 225);
    expect(Number.isFinite(parallelEval.effectiveFiberLengthMm)).toBe(true);
    expect(Number.isFinite(parallelEval.shearForceMultiplier)).toBe(true);
    expect(parallelEval.effectiveFiberLengthMm).toBeLessThanOrEqual(skirt.maxFiberLengthMm);
    expect(parallelEval.shearForceMultiplier).toBeGreaterThan(2.5);
    expect(parallelEval.grainAngleScore).toBeLessThan(30);

    // 90-degree cross-grain vector aligned along grainVector -> dot === 1 -> theta === 90 deg
    const crossEval = evaluateGrainSlice(skirt, skirt.grainVector, 225, 225);
    expect(crossEval.sliceAngleDeg).toBeCloseTo(90, 1);
    expect(crossEval.shearForceMultiplier).toBe(1);
    expect(crossEval.grainAngleScore).toBe(100);
    expect(crossEval.portionPrecisionScore).toBe(100);
  });

  it("matches protein ingredients and recipes while returning null for vegan dishes", () => {
    expect(matchIngredientToButcherCut("ribeye", "Ribeye Steak")?.cutId).toBe("ribeye");
    expect(matchIngredientToButcherCut("pork-belly", "Pork Belly")?.cutId).toBe("pork-belly");
    expect(matchIngredientToButcherCut("atlantic-salmon", "Atlantic Salmon")?.speciesId).toBe(
      "finfish",
    );
    expect(matchIngredientToButcherCut("basil", "Sweet Basil")).toBeNull();

    const braisedRibs: Recipe = {
      id: "braised-short-ribs",
      name: "Red Wine Braised Beef Short Ribs",
      ingredients: [{ name: "beef short ribs", amount: 1200, unit: "g" }],
      instructions: ["Sear and braise."],
      elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.2, Air: 0 },
    };
    const match = matchRecipeToButcherCut(braisedRibs);
    expect(match?.cutId).toBe("short-ribs");
    expect(match?.href).toBe("/kitchen-lab/butcher?species=beef&cut=short-ribs");

    const veganDish: Recipe = {
      id: "roasted-cauliflower",
      name: "Roasted Cauliflower Steak",
      isVegan: true,
      ingredients: [{ name: "cauliflower", amount: 500, unit: "g" }],
      instructions: ["Roast."],
      elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
    };
    expect(matchRecipeToButcherCut(veganDish)).toBeNull();
  });
});
