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
  thermalCurveBoundsFor,
} from "@/lib/butcher/science/meatPhysics";
import { knifeNormalAtAngle } from "@/lib/butcher/science/butcherGame";
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
    expect(parallelEval.grainAngleScore).toBeLessThan(15);

    // 20-degree steep parallel bias degrades sharply (<35)
    const steepEval = evaluateGrainSlice(
      skirt,
      knifeNormalAtAngle(20, skirt.grainVector),
      225,
      225,
    );
    expect(steepEval.grainAngleScore).toBeLessThan(35);

    // Valid 45-degree bias cut still retains most cross-grain tenderness benefit (>=80)
    const bias45Eval = evaluateGrainSlice(
      skirt,
      knifeNormalAtAngle(45, skirt.grainVector),
      225,
      225,
    );
    expect(bias45Eval.grainAngleScore).toBeGreaterThanOrEqual(80);
    expect(bias45Eval.verdict).toBe("Bias Cross-Grain Cut");

    // 90-degree cross-grain vector aligned along grainVector -> dot === 1 -> theta === 90 deg
    const crossEval = evaluateGrainSlice(skirt, skirt.grainVector, 225, 225);
    expect(crossEval.sliceAngleDeg).toBeCloseTo(90, 1);
    expect(crossEval.shearForceMultiplier).toBe(1);
    expect(crossEval.grainAngleScore).toBe(100);
    expect(crossEval.portionPrecisionScore).toBe(100);
  });

  it("models species-specific DSC windows for finfish myocommata, poultry breast/thigh, and mammalian actin", () => {
    const brisket = getCutById("brisket-flat");
    const salmonBelly = getCutById("belly-toro");
    const chickenBreast = getCutById("breast-supreme");
    const chickenThigh = getCutById("chicken-thigh");
    expect(brisket && salmonBelly && chickenBreast && chickenThigh).toBeTruthy();
    if (!brisket || !salmonBelly || !chickenBreast || !chickenThigh) return;

    // Mammalian DSC distinction: 69.5 °C drives moisture expulsion while actin peaks at 80–83 °C
    const midShrink = evaluateThermalProfile(brisket, 70, 5);
    const actinPeak = evaluateThermalProfile(brisket, 82, 5);
    expect(midShrink.actinCoagulatedPct).toBeLessThan(10);
    expect(actinPeak.actinCoagulatedPct).toBeGreaterThan(55);

    // Finfish myocommata gelatinize around 45–55 °C (0% at 40 °C), and warn on >=60 °C albumin loss
    const coolFish = evaluateThermalProfile(salmonBelly, 40, 12);
    const miCuitFish = evaluateThermalProfile(salmonBelly, 50, 12);
    const overcookedFish = evaluateThermalProfile(salmonBelly, 64, 12);
    expect(coolFish.gelatinConversionPct).toBe(0);
    expect(miCuitFish.gelatinConversionPct).toBeGreaterThan(50);
    expect(miCuitFish.warning).toBeNull();
    expect(overcookedFish.warning).toMatch(/albumin expulsion/i);
    expect(miCuitFish.moistureRetentionPct).toBeGreaterThan(overcookedFish.moistureRetentionPct + 15);
    expect(thermalCurveBoundsFor("finfish")).toEqual({ minC: 35, maxC: 75, stepC: 2 });
    const fishCurve = generateThermalCurve(salmonBelly, 12);
    expect(fishCurve[0]?.tempC).toBe(35);
    expect(fishCurve[fishCurve.length - 1]?.tempC).toBe(75);

    // Poultry white meat dries & warns past 72 °C whereas dark meat tolerates 82 °C collagen softening
    const juicyBreast = evaluateThermalProfile(chickenBreast, 65, 10);
    const dryBreast = evaluateThermalProfile(chickenBreast, 75, 10);
    const tenderThigh = evaluateThermalProfile(chickenThigh, 82, 45);
    expect(juicyBreast.warning).toBeNull();
    expect(dryBreast.warning).toMatch(/white-meat drying/i);
    expect(juicyBreast.moistureRetentionPct).toBeGreaterThan(dryBreast.moistureRetentionPct + 15);
    expect(tenderThigh.gelatinConversionPct).toBeGreaterThan(50);
    expect(tenderThigh.warning).toBeNull();
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
