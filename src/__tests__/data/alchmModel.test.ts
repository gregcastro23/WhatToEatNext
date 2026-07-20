/**
 * Invariants for the consolidated alchm model (`src/data/alchm/model.json`).
 *
 * The model file is the single source for the aspect grids transcribed from the
 * Alchm Semantics workbook. These tests pin the transcription's shape so a
 * re-transcription, a hand edit, or a schema change cannot silently lose cells.
 *
 * Counts here were independently reproduced twice — once by an audit pass over
 * the raw CSV and once by the transcription script — and they agreed exactly.
 * If one of these fails, the model changed; decide whether that was intended
 * before updating the number.
 *
 * See docs/physics/SYNTHESIS_MODEL.md §5.
 */
import model from "@/data/alchm/model.json";

const BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter",
  "Saturn", "Uranus", "Neptune", "Pluto", "Ascendant",
] as const;

type Cell = {
  row: string;
  col: string;
  aspect: string;
  kind: "terms" | "abstract" | "self" | "impossible" | "empty";
  terms?: Array<{ axis: string; sign: number; slot?: boolean }>;
  flag?: string;
};

const grids = model.aspectGrids.grids as Array<{
  id: string;
  compass: string;
  lowerTriangle: { aspect: string };
  upperTriangle: { aspect: string };
  cells: Cell[];
}>;

const allCells = grids.flatMap((g) => g.cells);
const counts = model.aspectGrids.counts;

describe("alchm model — aspect grids", () => {
  it("has three grids over eleven bodies", () => {
    expect(grids).toHaveLength(3);
    expect(model.aspectGrids.bodies).toEqual([...BODIES]);
  });

  it("is complete: every ordered body pair appears in every grid", () => {
    for (const g of grids) {
      expect(g.cells).toHaveLength(BODIES.length ** 2);
      const seen = new Set(g.cells.map((c) => `${c.row}|${c.col}`));
      expect(seen.size).toBe(BODIES.length ** 2);
    }
  });

  it("matches the independently audited cell counts", () => {
    const kind = (k: Cell["kind"]) => allCells.filter((c) => c.kind === k).length;
    expect(allCells).toHaveLength(counts.totalCells);
    expect(kind("terms") + kind("abstract")).toBe(counts.valueBearing);
    expect(kind("self")).toBe(counts.selfDiagonal);
    expect(kind("impossible")).toBe(counts.impossible);
    expect(kind("empty")).toBe(counts.empty);
  });

  /**
   * The load-bearing structural claim: the lower and upper triangles are
   * DIFFERENT aspects, not a symmetric matrix. Verified originally by sign —
   * Sun→Moon reads (-Fire -Water) while Moon→Sun reads (+Fire +Water +Fire
   * +Water). Reading these grids as symmetric would silently merge conjunction
   * with opposition.
   */
  it("assigns each triangle its own aspect, and the diagonal to self", () => {
    for (const g of grids) {
      for (const c of g.cells) {
        const ia = BODIES.indexOf(c.row as (typeof BODIES)[number]);
        const ib = BODIES.indexOf(c.col as (typeof BODIES)[number]);
        if (ia === ib) expect(c.aspect).toBe("self");
        else if (ia > ib) expect(c.aspect).toBe(g.lowerTriangle.aspect);
        else expect(c.aspect).toBe(g.upperTriangle.aspect);
      }
      expect(g.lowerTriangle.aspect).not.toBe(g.upperTriangle.aspect);
    }
  });

  it("marks the diagonal self on every grid", () => {
    for (const g of grids) {
      const diag = g.cells.filter((c) => c.row === c.col);
      expect(diag).toHaveLength(BODIES.length);
      expect(diag.every((c) => c.kind === "self")).toBe(true);
    }
  });

  it("uses only the four elements on element grids and the four axes on the ESMS grid", () => {
    const ELEM = new Set(["Fire", "Water", "Ground", "Air"]);
    const ESMS = new Set(["Spirit", "Essence", "Matter", "Substance"]);
    const SLOT = new Set(["SIGN_ELEMENT_OF_OTHER", "SIGN_ELEMENT_OF_SELF"]);
    for (const g of grids) {
      const allowed = g.compass === "element" ? ELEM : ESMS;
      for (const c of g.cells) {
        for (const t of c.terms ?? []) {
          expect(allowed.has(t.axis) || SLOT.has(t.axis)).toBe(true);
        }
      }
    }
  });

  it("gives every term a sign of exactly +1 or -1", () => {
    for (const c of allCells) {
      for (const t of c.terms ?? []) expect(Math.abs(t.sign)).toBe(1);
    }
  });

  /**
   * `x` is a runtime slot, not missing data — it resolves to the element of a
   * sign placement at computation time. A third of the value-bearing cells
   * carry one, so treating them as holes badly understates the grids.
   */
  it("preserves runtime slots rather than dropping them", () => {
    const withSlot = allCells.filter((c) => c.terms?.some((t) => t.slot));
    expect(withSlot).toHaveLength(counts.containingRuntimeSlot);
    expect(withSlot.length).toBeGreaterThan(counts.valueBearing / 4);
  });

  /**
   * Three cells are deliberately unresolved and must stay visible. Two are
   * probable fill-down slips; one is the single empty cell in any grid. If a
   * later rule adjudicates them, remove the flag here in the same change.
   */
  it("keeps the three OPEN cells flagged", () => {
    const flagged = allCells.filter((c) => c.flag === "OPEN");
    expect(flagged.map((c) => `${c.row}×${c.col}`).sort()).toEqual([
      "Mars×Moon",
      "Saturn×Jupiter",
      "Uranus×Sun",
    ]);
    for (const c of flagged) expect(c.flagReason ?? "").not.toHaveLength(0);
  });

  it("records the one genuinely empty cell as Saturn×Jupiter", () => {
    const empty = allCells.filter((c) => c.kind === "empty");
    expect(empty).toHaveLength(1);
    expect(`${empty[0].row}×${empty[0].col}`).toBe("Saturn×Jupiter");
  });

  /**
   * The 21 `*` cells encode real astronomy (Mercury's 28° max elongation,
   * Venus's 48°). They are stored as `impossible` rather than empty so the
   * distinction between "cannot happen" and "not filled in" survives.
   */
  it("distinguishes impossible from empty", () => {
    const imp = allCells.filter((c) => c.kind === "impossible");
    expect(imp).toHaveLength(counts.impossible);
    expect(imp.every((c) => c.kind !== ("empty" as string))).toBe(true);
  });

  it("carries provenance and a model version", () => {
    expect(model.modelVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(model.aspectGrids.provenance).toBe("CANVAS");
    expect(Object.keys(model.provenanceTags).sort()).toEqual([
      "AUTHORED", "CANVAS", "CODE", "DERIVED", "OPEN",
    ]);
  });
});
