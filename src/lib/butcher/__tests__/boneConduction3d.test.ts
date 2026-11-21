/**
 * @jest-environment node
 *
 * 3D voxel conduction: physics validation of the engine (energy, symmetry,
 * analytic plane-wall agreement) and the bone-through simulation contract.
 */
import { BUTCHER_CUTS, getCutById } from "@/data/butcher/cutsCatalogue";
import { CUT_BONE_ANATOMY } from "@/lib/butcher/science/boneAnatomy";
import { simulateBoneConduction3d, simulateBoneConduction3dWith } from "@/lib/butcher/science/boneConduction3d";
import { VOXEL_BONE, VOXEL_LEAN, VOXEL_MARROW, buildBoneVoxelLayout } from "@/lib/butcher/science/boneVoxelGeometry";
import { cellIndex, readoutColumns } from "@/lib/butcher/science/boneVoxelReadout";
import { defaultTrajectoryMethodForCut } from "@/lib/butcher/science/trajectoryMethods";
import { biotNumber, slabCoefficient, slabEigenvalue } from "@/lib/cooking/thermo";
import { createTsVoxelEngine, type VoxelEngineLike, type VoxelGridSpec } from "@/lib/cooking/voxelConduction";
import type { AnatomicalCut } from "@/lib/butcher/types";

function cutOrThrow(id: string): AnatomicalCut {
  const cut = getCutById(id);
  if (!cut) throw new Error(`missing cut ${id}`);
  return cut;
}

const THROUGH_IDS = Object.entries(CUT_BONE_ANATOMY).filter(([, a]) => a.placement === "through").map(([id]) => id);

describe("voxel engine physics", () => {
  const K = 0.48;
  const RHO_C = 1060 * 3500;

  it("conserves Σ C·T to 1e-12 with every face adiabatic", () => {
    const n = 4 * 5 * 3;
    const material = Array.from({ length: n }, (_, c) => (c % 7 === 0 ? 1 : 0));
    const engine = createTsVoxelEngine({ nx: 4, ny: 5, nz: 3, dxM: 0.002, dyM: 0.002, dzM: 0.003, material, k: [K, 0.32], rhoC: [RHO_C, 2.5e6], initialC: 10 });
    engine.setFaces(new Array<number>(12).fill(0));
    const e0 = engine.energyJ();
    // A non-uniform start: one hot face first, then seal every face.
    engine.setFaces([0, 0, 0, 0, 500, 200, 0, 0, 0, 0, 0, 0]);
    engine.step(1, 20);
    engine.setFaces(new Array<number>(12).fill(0));
    const sealed = engine.energyJ();
    engine.step(1, 400);
    expect(Math.abs(engine.energyJ() - sealed) / sealed).toBeLessThan(1e-12);
    expect(sealed).toBeGreaterThan(e0);
  });

  it("stays mirror-symmetric in x under symmetric boundaries", () => {
    const [nx, ny, nz] = [6, 4, 3];
    const engine = createTsVoxelEngine({ nx, ny, nz, dxM: 0.002, dyM: 0.002, dzM: 0.002, material: new Array<number>(nx * ny * nz).fill(0), k: [K], rhoC: [RHO_C], initialC: 10 });
    engine.setFaces([30, 150, 30, 150, 200, 190, 12, 25, 0, 0, 0, 0]);
    engine.step(0.9 * engine.stableDt(), 300);
    const t = engine.temps();
    for (let k = 0; k < nz; k += 1) for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) {
      const a = t[i + nx * (j + ny * k)] ?? 0;
      const b = t[nx - 1 - i + nx * (j + ny * k)] ?? 0;
      expect(Math.abs(a - b)).toBeLessThan(1e-12);
    }
  });

  it("reproduces the analytic plane-wall (one-term) centre temperature within 1.5% of ΔT", () => {
    const L = 0.02;
    const ny = 40;
    const h = 60;
    const tInf = 180;
    const t0 = 10;
    const engine = createTsVoxelEngine({ nx: 1, ny, nz: 1, dxM: 0.01, dyM: (2 * L) / ny, dzM: 0.01, material: new Array<number>(ny).fill(0), k: [K], rhoC: [RHO_C], initialC: t0 });
    engine.setFaces([0, 0, 0, 0, h, tInf, h, tInf, 0, 0, 0, 0]);
    const lambda = slabEigenvalue(biotNumber(h, L, K));
    const a1 = slabCoefficient(lambda);
    const alpha = K / RHO_C;
    const dt = 0.5 * engine.stableDt();
    let elapsed = 0;
    for (const fo of [0.3, 0.6, 1.0]) {
      const targetS = (fo * L * L) / alpha;
      const steps = Math.round((targetS - elapsed) / dt);
      engine.step(dt, steps);
      elapsed += steps * dt;
      const foActual = (alpha * elapsed) / (L * L);
      const analytic = tInf + (t0 - tInf) * a1 * Math.exp(-lambda * lambda * foActual);
      const centre = ((engine.tempAt(ny / 2 - 1) + engine.tempAt(ny / 2)) / 2);
      expect(Math.abs(centre - analytic) / Math.abs(tInf - t0)).toBeLessThan(0.015);
    }
  });
});

describe("bone-through 3D simulation", () => {
  it("returns null unless the bone runs through the thickness", () => {
    expect(simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", { cut: cutOrThrow("prime-rib"), method: "roasting" })).toBeNull();
    expect(simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", { cut: cutOrThrow("tenderloin-filet"), method: "searing" })).toBeNull();
    expect(BUTCHER_CUTS.filter((c) => buildBoneVoxelLayout(c, c.typicalThicknessMm) !== null).map((c) => c.id).sort()).toEqual([...THROUGH_IDS].sort());
  });

  it("builds plates ≥ 2 cells thick and a marrow-cored cylinder for the crosscut shank", () => {
    for (const id of THROUGH_IDS) {
      const cut = cutOrThrow(id);
      const layout = buildBoneVoxelLayout(cut, cut.typicalThicknessMm);
      if (!layout) throw new Error(id);
      const mats = Array.from(layout.spec.material);
      expect(mats.filter((m) => m === VOXEL_BONE).length).toBeGreaterThan(0);
      expect(layout.spec.nx * layout.spec.ny * layout.spec.nz).toBeLessThanOrEqual(24_000);
      if (layout.anatomy.through?.kind === "plate") expect(layout.boneXMm[1] - layout.boneXMm[0]).toBeGreaterThanOrEqual(2 * layout.dxMm - 1e-9);
    }
    const shank = buildBoneVoxelLayout(cutOrThrow("osso-buco-shank"), 45);
    expect(Array.from(shank?.spec.material ?? []).some((m) => m === VOXEL_MARROW)).toBe(true);
  });

  it("gives finite, ordered readouts for every through-bone cut under its default method, stopping at the probe's pull", () => {
    for (const id of THROUGH_IDS) {
      const cut = cutOrThrow(id);
      const method = defaultTrajectoryMethodForCut(cut);
      const r = simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", { cut, method });
      if (!r) throw new Error(id);
      for (const col of [r.boneAdjacent, r.boneAdjacentBoneless, r.thermalCentre]) {
        for (const v of Object.values(col)) expect(Number.isFinite(v)).toBe(true);
        expect(col.carryoverPeakC).toBeGreaterThanOrEqual(col.coreAtRemovalC);
      }
      expect(r.boneAdjacent.distanceFromBoneMm).toBeLessThan(r.thermalCentre.distanceFromBoneMm);
      expect(r.boneAdjacentBoneless.distanceFromBoneMm).toBe(r.boneAdjacent.distanceFromBoneMm);
      // The probe ends the main stage within one step of the pull; only a finishing sear can lift it further.
      expect(r.thermalCentre.coreAtRemovalC).toBeGreaterThanOrEqual(r.pullCoreTempC - 0.05);
      expect(r.thermalCentre.coreAtRemovalC).toBeLessThan(r.pullCoreTempC + 3);
      for (const col of [r.boneAdjacent, r.thermalCentre]) expect(col.grayBandMm).toBeLessThanOrEqual(cut.typicalThicknessMm / 2 + 1e-9);
      expect(r.slice.material).toHaveLength(r.slice.nx * r.slice.ny);
      expect(r.slice.peakTemps).toHaveLength(r.slice.nx * r.slice.ny);
      expect(r.basis.length).toBeGreaterThanOrEqual(4);
      expect(r.runtime).toBe("typescript");
    }
  });

  it("measures the bone's own conduction effect against a boneless counterfactual (small: bone diffuses heat about as fast as lean)", () => {
    for (const id of ["porterhouse", "t-bone", "ribeye", "pork-loin-chop"]) {
      const r = simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", { cut: cutOrThrow(id), method: "searing" });
      if (!r) throw new Error(id);
      expect(r.boneEffectAtRemovalC).toBeCloseTo(r.boneAdjacentBoneless.coreAtRemovalC - r.boneAdjacent.coreAtRemovalC, 0);
      expect(Math.abs(r.boneEffectAtRemovalC)).toBeLessThan(3);
    }
  });

  it("replays the bone-in step log EXACTLY on the boneless counterfactual (same faces, dt and step counts)", () => {
    const logs: string[][] = [];
    const spyFactory = (spec: VoxelGridSpec): VoxelEngineLike => {
      const engine = createTsVoxelEngine(spec);
      const log: string[] = [];
      logs.push(log);
      const step = engine.step.bind(engine);
      const setFaces = engine.setFaces.bind(engine);
      engine.step = (dt: number, n: number): void => { log.push(`step ${dt} x${n}`); step(dt, n); };
      engine.setFaces = (f: ArrayLike<number>): void => { log.push(`faces ${Array.from(f).join(",")}`); setFaces(f); };
      return engine;
    };
    for (const id of ["lamb-loin-chop", "ribeye", "osso-buco-shank"]) {
      logs.length = 0;
      const cut = cutOrThrow(id);
      simulateBoneConduction3dWith(spyFactory, "typescript", { cut, method: defaultTrajectoryMethodForCut(cut) });
      const [boneIn = [], boneless = []] = logs;
      // Expand "step dt xN" so a batched replay and step-by-step cooking compare as the same dt sequence.
      const steps = (l: readonly string[]): string[] => l.filter((x) => x.startsWith("step")).flatMap((x) => {
        const [, dt = "", times = "x1"] = x.split(" ");
        return new Array<string>(Number(times.slice(1))).fill(dt);
      });
      expect(steps(boneIn).length).toBeGreaterThan(10);
      expect(steps(boneless)).toEqual(steps(boneIn));
    }
  });

  it("caps each face's gray band at half the thickness even when a column is gray through", () => {
    const r = simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", { cut: cutOrThrow("ribeye"), method: "reverse-sear", targetCoreTempC: 74 });
    if (!r) throw new Error("ribeye");
    expect(r.thermalCentre.grayBandMm).toBeLessThanOrEqual(cutOrThrow("ribeye").typicalThicknessMm / 2 + 1e-9);
    expect(r.boneAdjacent.grayBandMm).toBeLessThanOrEqual(cutOrThrow("ribeye").typicalThicknessMm / 2 + 1e-9);
  });

  it("reads 'beside the bone' from the voxelised bone in the readout slice (cylinder slice passes through the axis)", () => {
    for (const id of THROUGH_IDS) {
      const cut = cutOrThrow(id);
      const layout = buildBoneVoxelLayout(cut, cut.typicalThicknessMm);
      if (!layout) throw new Error(id);
      const cols = readoutColumns(layout);
      const mat = (i: number): number => Number(layout.spec.material[cellIndex(layout.spec, i, cols.jMid, cols.kMid)]);
      expect(mat(cols.adjacentI)).toBe(VOXEL_LEAN);
      const towardBone = mat(cols.adjacentI - 1) !== VOXEL_LEAN ? cols.adjacentI - 1 : cols.adjacentI + 1;
      expect(mat(towardBone)).not.toBe(VOXEL_LEAN);
      expect(cols.adjacentMm).toBeCloseTo(layout.dxMm / 2, 9);
      expect(mat(cols.probeI)).toBe(VOXEL_LEAN);
      if (layout.anatomy.through?.kind === "cylinder") expect(layout.spec.nz % 2).toBe(1);
    }
  });

  it("resolves the async entry to the TypeScript runtime under Jest and matches the sync core", async () => {
    const input = { cut: cutOrThrow("t-bone"), method: "searing" as const };
    const viaLoader = await simulateBoneConduction3d(input);
    const direct = simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", input);
    expect(viaLoader?.runtime).toBe("typescript");
    expect(viaLoader).toEqual(direct);
    expect(await simulateBoneConduction3d({ cut: cutOrThrow("prime-rib"), method: "roasting" })).toBeNull();
  });
});
