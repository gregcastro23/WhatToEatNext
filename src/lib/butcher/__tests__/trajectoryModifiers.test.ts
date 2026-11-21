/**
 * @jest-environment node
 *
 * V2-2 one-sided layered column: fat cap, bone-in (face / core / through),
 * and pre-cook prep modifiers on `simulateCoupledCutTrajectory`.
 */
import { BUTCHER_CUTS, getCutById } from "@/data/butcher/cutsCatalogue";
import { CUT_BONE_ANATOMY, boneAnatomyForCut } from "@/lib/butcher/science/boneAnatomy";
import { simulateCoupledCutTrajectory } from "@/lib/butcher/science/coupledMeatTrajectory";
import { PREP_IDS, PREP_PROFILES, applyToughnessReduction, effectivePrep, shiftWaterMass } from "@/lib/butcher/science/prepModifiers";
import { ITIS_TISSUE, buildSlabColumn, columnLayers } from "@/lib/butcher/science/slabColumn";
import { stepLayeredSlab } from "@/lib/butcher/science/slabDiffusion";
import type { AnatomicalCut } from "@/lib/butcher/types";

function cutOrThrow(id: string): AnatomicalCut {
  const cut = getCutById(id);
  if (!cut) throw new Error(`missing cut ${id}`);
  return cut;
}

const LEAN = { kWmK: 0.48, rhoCJm3K: 1060 * 3500 };

describe("layered slab column", () => {
  it("partitions fat cap, lean and bone exactly and conserves heat capacity", () => {
    const column = buildSlabColumn({
      meatThicknessMm: 30, maxSegmentMm: 15 / 14, lean: LEAN, fatCapMm: 6,
      bone: { placement: "face", corticalMm: 10, marrowMm: 0 },
    });
    const xs = column.positionsM;
    for (let i = 1; i < xs.length; i += 1) expect(xs[i] ?? 0).toBeGreaterThan(xs[i - 1] ?? 0);
    expect((xs[xs.length - 1] ?? 0) * 1000).toBeCloseTo(46, 9);
    expect(column.faceAKind).toBe("fat");
    expect(column.faceBKind).toBe("bone");
    expect(column.fatCapModelMm).toBe(6);
    expect(column.boneModelMm).toBe(10);
    expect(((column.positionsM[column.meatSurfaceB] ?? 0) - (column.positionsM[column.meatSurfaceA] ?? 0)) * 1000).toBeCloseTo(30, 9);

    const fatRhoC = ITIS_TISSUE.fat.densityKgM3 * ITIS_TISSUE.fat.specificHeatJkgK;
    const boneRhoC = ITIS_TISSUE.bone.densityKgM3 * ITIS_TISSUE.bone.specificHeatJkgK;
    const expected = fatRhoC * 0.006 + LEAN.rhoCJm3K * 0.03 + boneRhoC * 0.01;
    const total = column.nodeCap.reduce((a, b) => a + b, 0);
    expect(total / expected).toBeCloseTo(1, 12);
  });

  it("puts a core bone (cortical · marrow · cortical) between two equal lean halves", () => {
    const kinds = columnLayers({
      meatThicknessMm: 36, maxSegmentMm: 1, lean: LEAN, fatCapMm: 0,
      bone: { placement: "core", corticalMm: 2, marrowMm: 5 },
    }).map((l) => `${l.kind}:${l.thicknessMm}`);
    expect(kinds).toEqual(["lean:18", "bone:2", "marrow:5", "bone:2", "lean:18"]);
  });

  it("conserves energy with adiabatic faces and stays mirror-symmetric under symmetric boundaries", () => {
    const column = buildSlabColumn({ meatThicknessMm: 30, maxSegmentMm: 1.2, lean: LEAN, fatCapMm: 0, bone: null });
    const n = column.positionsM.length;
    const temps = column.positionsM.map((_, i) => 10 + (i * 37) % 23);
    const energy = (t: readonly number[]): number => t.reduce((acc, v, i) => acc + v * (column.nodeCap[i] ?? 0), 0);
    const before = energy(temps);
    const adiabatic = { hWm2K: 0, tMediumC: 0, qEvapWm2: 0 };
    for (let s = 0; s < 50; s += 1) stepLayeredSlab({ temps, column, dt: 4, faceA: adiabatic, faceB: adiabatic });
    expect(energy(temps) / before).toBeCloseTo(1, 10);

    const sym = new Array<number>(n).fill(10);
    const pan = { hWm2K: 225, tMediumC: 200, qEvapWm2: 0 };
    for (let s = 0; s < 120; s += 1) stepLayeredSlab({ temps: sym, column, dt: 2, faceA: pan, faceB: pan, crustConductivityFactor: 0.24 });
    for (let i = 0; i < n; i += 1) expect(sym[i] ?? 0).toBeCloseTo(sym[n - 1 - i] ?? 0, 8);
  });
});

describe("fat cap (face A)", () => {
  it("insulates its own face, shifts the thermal centre toward it, and lengthens the cook", () => {
    const brisket = cutOrThrow("brisket-flat");
    const runs = [0, 6, 12].map((fatCapMm) => simulateCoupledCutTrajectory(brisket, { method: "smoking", targetCoreTempC: 93, fatCapMm }));
    const [bare, six, twelve] = runs;
    if (!bare || !six || !twelve) throw new Error("runs missing");
    expect(bare.faces[0].grayBandMm).toBeCloseTo(bare.faces[1].grayBandMm, 6);
    expect(six.faces[0].outer).toBe("fat");
    expect(six.faces[0].grayBandMm).toBeLessThan(six.faces[1].grayBandMm);
    expect(six.column.thermalCentreFromAMm).toBeLessThan(six.column.meatThicknessMm / 2);
    expect(six.cookMinutes).toBeGreaterThan(bare.cookMinutes);
    expect(twelve.cookMinutes).toBeGreaterThan(six.cookMinutes);
    expect(twelve.column.fatCapMm).toBe(12);
  });

  it("clamps the fat cap to 0–15 mm", () => {
    const strip = cutOrThrow("ny-strip");
    expect(simulateCoupledCutTrajectory(strip, { method: "searing", fatCapMm: 40 }).column.fatCapMm).toBe(15);
    expect(simulateCoupledCutTrajectory(strip, { method: "searing", fatCapMm: -3 }).column.fatCapMm).toBe(0);
  });
});

describe("bone-in", () => {
  it("has an anatomy entry for every hasBone cut and none for boneless cuts", () => {
    for (const cut of BUTCHER_CUTS) {
      expect(boneAnatomyForCut(cut) !== null).toBe(cut.geometry3d.hasBone);
    }
    for (const id of Object.keys(CUT_BONE_ANATOMY)) expect(getCutById(id)?.geometry3d.hasBone).toBe(true);
  });

  it("defaults bone-in from the catalogue and shields face B on a rib roast", () => {
    const rib = cutOrThrow("prime-rib");
    const implicit = simulateCoupledCutTrajectory(rib, { method: "roasting", targetCoreTempC: 54 });
    const boneless = simulateCoupledCutTrajectory(rib, { method: "roasting", targetCoreTempC: 54, boneIn: false });
    expect(implicit.column.boneIn).toBe(true);
    expect(implicit.column.bonePlacement).toBe("face");
    expect(implicit.faces[1].outer).toBe("bone");
    expect(implicit.faces[1].grayBandMm).toBeLessThan(implicit.faces[0].grayBandMm);
    expect(implicit.faces[1].crustDepthMm).toBe(0);
    expect(implicit.cookMinutes).toBeGreaterThan(boneless.cookMinutes);
    expect(boneless.faces[1].outer).toBe("lean");
  });

  it("moves the thermal centre to the marrow bone on a drumstick and lengthens the cook", () => {
    const drum = cutOrThrow("chicken-drumstick");
    const bone = simulateCoupledCutTrajectory(drum, { method: "roasting", targetCoreTempC: 80 });
    const none = simulateCoupledCutTrajectory(drum, { method: "roasting", targetCoreTempC: 80, boneIn: false });
    const half = bone.column.meatThicknessMm / 2;
    const nearInterface = [half, half + bone.column.boneMm].some((d) => Math.abs(bone.column.thermalCentreFromAMm - d) < 0.5);
    expect(bone.column.bonePlacement).toBe("core");
    expect(nearInterface).toBe(true);
    expect(bone.cookMinutes).toBeGreaterThan(none.cookMinutes);
  });

  it("leaves through-thickness bones (steaks) to the 3D model: the 1D column is the meat away from the bone", () => {
    const porterhouse = cutOrThrow("porterhouse");
    const boneIn = simulateCoupledCutTrajectory(porterhouse, { method: "searing", targetCoreTempC: 54 });
    const boneless = simulateCoupledCutTrajectory(porterhouse, { method: "searing", targetCoreTempC: 54, boneIn: false });
    expect(boneIn.column.boneNeeds3d).toBe(true);
    expect(boneIn.column.boneMm).toBe(0);
    expect(boneIn.peakNodeTempsC).toEqual(boneless.peakNodeTempsC);
    expect(boneless.column.boneNeeds3d).toBe(false);
  });

  it("ignores boneIn for boneless cuts", () => {
    const filet = cutOrThrow("tenderloin-filet");
    expect(simulateCoupledCutTrajectory(filet, { method: "searing", boneIn: true }).column.boneIn).toBe(false);
  });
});

describe("pre-cook prep", () => {
  it("dry brine browns sooner, wet brine later, and both reduce moisture loss", () => {
    const ribeye = cutOrThrow("ribeye");
    const run = (prep: (typeof PREP_IDS)[number]): ReturnType<typeof simulateCoupledCutTrajectory> =>
      simulateCoupledCutTrajectory(ribeye, { method: "searing", targetCoreTempC: 54, prep });
    const none = run("none");
    const dry = run("dry-brine-24h");
    const wet = run("wet-brine");
    expect(none.maillardOnsetMin).not.toBeNull();
    expect(dry.maillardOnsetMin ?? Infinity).toBeLessThan(none.maillardOnsetMin ?? 0);
    expect(wet.maillardOnsetMin ?? 0).toBeGreaterThan(none.maillardOnsetMin ?? Infinity);
    expect(dry.moistureRetentionPct).toBeGreaterThan(none.moistureRetentionPct);
    expect(wet.moistureRetentionPct).toBeGreaterThan(none.moistureRetentionPct);
    expect(dry.prep.prep).toBe("dry-brine-24h");
  });

  it("dry-aging shrinks the lean (drier surface, shorter stall) and lowers the tenderness deficit", () => {
    const brisket = cutOrThrow("brisket-flat");
    const fresh = simulateCoupledCutTrajectory(brisket, { method: "smoking", targetCoreTempC: 93 });
    const aged = simulateCoupledCutTrajectory(brisket, { method: "smoking", targetCoreTempC: 93, prep: "dry-aged-28d" });
    expect(aged.stallDurationMin).toBeLessThan(fresh.stallDurationMin);
    expect(aged.prep.surfaceWaterFactor).toBeLessThan(1);
    expect(aged.prep.waterMassChangeG).toBe(-11.2);
    const profile = PREP_PROFILES["dry-aged-28d"];
    expect(applyToughnessReduction(60, profile)).toBe(Number((100 - 40 * (1 - 0.227)).toFixed(1)));
    expect(applyToughnessReduction(60, PREP_PROFILES.none)).toBe(60);
  });

  it("names a basis for every non-trivial prep constant", () => {
    for (const id of PREP_IDS) {
      const p = PREP_PROFILES[id];
      const claims = [p.waterMassChangeG !== 0, p.surfaceWaterFactor !== 1, p.cookLossReductionFrac !== 0, p.toughnessReductionFrac !== 0].filter(Boolean).length;
      expect(p.basis.length).toBeGreaterThanOrEqual(Math.min(claims, 1));
      for (const line of p.basis) expect(line).toMatch(/MODEL ASSUMPTION|LITERATURE|COMPUTED|No cook-loss/);
    }
  });

  it("falls back to no prep where the literature does not cover the species", () => {
    const breast = cutOrThrow("breast-supreme");
    expect(effectivePrep("dry-aged-28d", breast).id).toBe("none");
    expect(simulateCoupledCutTrajectory(breast, { method: "searing", prep: "dry-aged-28d" }).prep.prep).toBe("none");
  });

  it("adds or removes water mass while conserving the proximate total", () => {
    const { proximate } = cutOrThrow("pork-tenderloin");
    const total = (p: typeof proximate): number => p.waterG + p.proteinG + p.fatG + p.ashG;
    for (const delta of [-11.2, 6]) {
      const adjusted = shiftWaterMass(proximate, delta);
      expect(total(adjusted)).toBeCloseTo(total(proximate), 9);
      expect(adjusted.waterG / total(adjusted)).toBeCloseTo((proximate.waterG + delta) / (total(proximate) + delta), 12);
      expect(adjusted.proteinG / adjusted.fatG).toBeCloseTo(proximate.proteinG / proximate.fatG, 12);
    }
    expect(shiftWaterMass(proximate, 0)).toBe(proximate);
  });
});
