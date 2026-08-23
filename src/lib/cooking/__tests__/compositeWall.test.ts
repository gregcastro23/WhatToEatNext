/**
 * @jest-environment node
 *
 * Composite vessel walls, TypeScript side.
 *
 * The Rust half is covered by `crates/thermo-core/src/tests.rs` and the two are
 * held together by `scripts/verify-boundary-solver-parity.mjs`, which now A/Bs
 * six chains including three composites. What CANNOT live there is anything
 * about the caller-facing shape — the both-or-neither rule, the ply cap, and
 * the guarantee that a single-layer wall is completely unchanged.
 */

import {
  COOKWARE_CONSTRUCTIONS,
  COOKWARE_MATERIALS,
  constructionPlies,
} from "@/data/cooking/cookwareMaterials";
import { solveBoundaryNetwork } from "@/lib/cooking/boundaryNetwork";
import { MAX_WALL_LAYERS, wallPlies } from "@/lib/cooking/wallPlies";

const BASE = {
  sourceToVesselHWm2K: 60,
  areaM2: 0.05,
  vesselToMediumHWm2K: 5000,
} as const;

const TRI_PLY = [
  { name: "stainless outer", thicknessM: 0.0005, kWmK: 16.2 },
  { name: "aluminium core", thicknessM: 0.002, kWmK: 205 },
  { name: "stainless inner", thicknessM: 0.0005, kWmK: 16.2 },
];

describe("wallPlies refuses an ambiguous wall", () => {
  it("rejects both forms at once", () => {
    // Preferring one silently would let a stale kWmK sit in the same object
    // describing a different pan.
    expect(() =>
      wallPlies({ kWmK: 16.2, thicknessM: 0.003, layers: TRI_PLY }),
    ).toThrow(/not both/);
  });

  it("rejects neither form", () => {
    expect(() => wallPlies({})).toThrow(/supplied together/);
    expect(() => wallPlies({ kWmK: 16.2 })).toThrow(/supplied together/);
  });

  it("rejects an empty or over-deep stack", () => {
    expect(() => wallPlies({ layers: [] })).toThrow(/1\.\.=5/);
    const tooMany = Array.from({ length: MAX_WALL_LAYERS + 1 }, () => TRI_PLY[0]);
    expect(() => wallPlies({ layers: tooMany })).toThrow(/1\.\.=5/);
    // Exactly at the cap must be accepted — an off-by-one drops a 5-ply pan.
    const atCap = Array.from({ length: MAX_WALL_LAYERS }, () => TRI_PLY[0]);
    expect(wallPlies({ layers: atCap })).toHaveLength(MAX_WALL_LAYERS);
  });

  it("synthesises a single ply from the scalar pair", () => {
    expect(wallPlies({ kWmK: 16.2, thicknessM: 0.003 })).toEqual([
      { name: "wall", thicknessM: 0.003, kWmK: 16.2 },
    ]);
  });
});

describe("a composite wall is the sum of its plies", () => {
  it("splitting one layer into identical plies changes nothing", () => {
    // Additivity, proven before anything downstream leans on the decomposition.
    const single = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 100,
      vessel: { ...BASE, kWmK: 16.2, thicknessM: 0.003 },
    });
    const split = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 100,
      vessel: {
        ...BASE,
        layers: [
          { name: "a", thicknessM: 0.001, kWmK: 16.2 },
          { name: "b", thicknessM: 0.001, kWmK: 16.2 },
          { name: "c", thicknessM: 0.001, kWmK: 16.2 },
        ],
      },
    });
    expect(split.totalResistanceKperW).toBeCloseTo(single.totalResistanceKperW, 12);
    expect(split.heatFlowW).toBeCloseTo(single.heatFlowW, 9);
  });

  it("sits between solid stainless and solid aluminium", () => {
    // The reason composites exist: one k has to be picked otherwise, and both
    // available choices are wrong in a direction that matters.
    const r = (vessel: Parameters<typeof solveBoundaryNetwork>[0]["vessel"]): number =>
      solveBoundaryNetwork({ sourceC: 250, sinkC: 100, vessel }).totalResistanceKperW;

    const clad = r({ ...BASE, layers: TRI_PLY });
    const steel = r({ ...BASE, kWmK: 16.2, thicknessM: 0.003 });
    const alu = r({ ...BASE, kWmK: 205, thicknessM: 0.003 });
    expect(clad).toBeLessThan(steel);
    expect(clad).toBeGreaterThan(alu);
  });

  it("keeps shares closing to 1 and emits one link per ply", () => {
    const solved = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 100,
      vessel: { ...BASE, layers: TRI_PLY },
    });
    expect(solved.links.map((l) => l.id)).toEqual([
      "source-to-vessel",
      "vessel-layer-0",
      "vessel-layer-1",
      "vessel-layer-2",
      "vessel-to-medium",
    ]);
    // The material name reaches the reader; the id stays positional.
    expect(solved.links[2].label).toBe("aluminium core");
    const sum = solved.links.reduce((acc, l) => acc + l.share, 0);
    expect(sum).toBeCloseTo(1, 12);
  });

  it("still calls a single ply `vessel-wall`", () => {
    // The compatibility guarantee the golden vectors depend on.
    const solved = solveBoundaryNetwork({
      sourceC: 250,
      sinkC: 100,
      vessel: { ...BASE, kWmK: 16.2, thicknessM: 0.003 },
    });
    expect(solved.links.map((l) => l.id)).toEqual([
      "source-to-vessel",
      "vessel-wall",
      "vessel-to-medium",
    ]);
  });
});

describe("clad constructions resolve from cited materials", () => {
  it.each(COOKWARE_CONSTRUCTIONS.map((c) => c.id))("%s resolves", (id) => {
    const plies = constructionPlies(id);
    expect(plies).not.toBeNull();
    expect(plies!.length).toBeGreaterThan(1);
    expect(plies!.length).toBeLessThanOrEqual(MAX_WALL_LAYERS);
    for (const ply of plies!) {
      expect(ply.thicknessM).toBeGreaterThan(0);
      expect(ply.kWmK).toBeGreaterThan(0);
    }
  });

  it("takes every conductivity from COOKWARE_MATERIALS, never its own copy", () => {
    // The whole reason a ply names a material id instead of restating k. If a
    // layup ever carried its own number it could drift from the alloy it claims
    // to be, and no test anywhere else would see it.
    for (const construction of COOKWARE_CONSTRUCTIONS) {
      const resolved = constructionPlies(construction.id)!;
      construction.plies.forEach((ply, i) => {
        const material = COOKWARE_MATERIALS.find((m) => m.id === ply.materialId);
        expect(material).toBeDefined();
        expect(resolved[i].kWmK).toBe(material!.kWmK);
      });
    }
  });

  it("refuses an unknown construction or material rather than defaulting", () => {
    expect(constructionPlies("no_such_layup")).toBeNull();
  });

  it("copper core conducts better than tri-ply at a similar gauge", () => {
    const r = (id: string): number =>
      solveBoundaryNetwork({
        sourceC: 250,
        sinkC: 100,
        vessel: { ...BASE, layers: constructionPlies(id)! },
      }).totalResistanceKperW;
    expect(r("copper_core_5ply")).toBeLessThan(r("tri_ply_stainless"));
  });
});
