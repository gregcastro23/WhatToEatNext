/**
 * Typed reader for the consolidated alchm model.
 *
 * This module exposes the transcribed aspect grids. It is deliberately NOT wired
 * into `aspectESMSEffects.ts` yet — the per-aspect magnitude constant is still
 * unsettled (see SYNTHESIS_MODEL.md §13c), and wiring without it would put
 * arbitrary numbers into production.
 *
 * Three things a caller must understand before using this data:
 *
 *  1. **The lower and upper triangles are different aspects.** `Sun→Moon` is an
 *     opposition; `Moon→Sun` is a conjunction. Never treat a grid as symmetric —
 *     doing so silently merges conjunction with opposition.
 *
 *  2. **`x` is a runtime slot, not a missing value.** 106 of 308 value-bearing
 *     cells contain one, resolving to the element of a sign placement at
 *     computation time. `resolveSlots` handles this; reading `terms` directly
 *     will leave them unresolved.
 *
 *  3. **The grid's sign carries no pair-specific information.** Conjunction
 *     cells are 100% positive and opposition cells 91% negative, so polarity is
 *     entirely a function of aspect type. Pair polarity — the thing that makes a
 *     New Moon deplete rather than join — exists for only 4 of 45 pairs and
 *     lives in `aspectESMSEffects.ts`, not here. See §12a.
 *
 * @see docs/physics/SYNTHESIS_MODEL.md
 */
import model from "./model.json";

export type Element = "Fire" | "Water" | "Ground" | "Air";
export type Axis = "Spirit" | "Essence" | "Matter" | "Substance";
export type RuntimeSlot = "SIGN_ELEMENT_OF_OTHER" | "SIGN_ELEMENT_OF_SELF";

/** A cell's kind. `impossible` and `empty` are deliberately distinct — see §5c. */
export type CellKind = "terms" | "abstract" | "self" | "impossible" | "empty";

export interface GridTerm {
  /** An element, an ESMS axis, or an unresolved runtime slot. */
  axis: Element | Axis | RuntimeSlot;
  /** Always exactly +1 or -1. */
  sign: 1 | -1;
  /** True when `axis` is a runtime slot needing chart context to resolve. */
  slot?: boolean;
  /** True for `y`, which the workbook never defines. */
  undefined?: boolean;
}

export interface GridCell {
  row: string;
  col: string;
  aspect: string;
  kind: CellKind;
  terms?: GridTerm[];
  /** Present when this cell was corrected during completion. */
  provenance?: "AUTHORED";
  /** The workbook's original value, retained wherever a cell was overwritten. */
  canvasAxes?: string[];
  correctionReason?: string;
  /** Present on cells deliberately left unresolved. */
  flag?: "OPEN";
  flagReason?: string;
}

export interface AspectGrid {
  id: string;
  compass: "element" | "esms";
  lowerTriangle: { aspect: string; orb: string };
  upperTriangle: { aspect: string; orb: string };
  cells: GridCell[];
}

const grids = model.aspectGrids.grids as unknown as AspectGrid[];

export const MODEL_VERSION = model.modelVersion;
export const BODIES = model.aspectGrids.bodies as readonly string[];

export function getGrid(id: string): AspectGrid | undefined {
  return grids.find((g) => g.id === id);
}

export function getGrids(): readonly AspectGrid[] {
  return grids;
}

/**
 * The cell for an ordered pair. Order matters — `(Sun, Moon)` and `(Moon, Sun)`
 * are different aspects, not the same one read twice.
 */
export function getCell(
  gridId: string,
  row: string,
  col: string,
): GridCell | undefined {
  return getGrid(gridId)?.cells.find((c) => c.row === row && c.col === col);
}

/**
 * Resolve a cell's runtime slots against the sign elements of the two bodies.
 *
 * Returns `null` for cells that carry no terms (self, impossible, empty), so a
 * caller cannot mistake "no interaction" for "zero interaction".
 */
export function resolveSlots(
  cell: GridCell,
  selfSignElement: Element,
  otherSignElement: Element,
): Array<{ axis: Element | Axis; sign: 1 | -1 }> | null {
  if (cell.kind !== "terms" || !cell.terms) return null;
  return cell.terms.map((t) => ({
    sign: t.sign,
    axis:
      t.axis === "SIGN_ELEMENT_OF_OTHER"
        ? otherSignElement
        : t.axis === "SIGN_ELEMENT_OF_SELF"
          ? selfSignElement
          : t.axis,
  }));
}

/**
 * Collapse a cell's terms into a per-axis net, summing repeats.
 * `(🔥🔥💧)` becomes `{ Fire: 2, Water: 1 }`.
 *
 * NOTE: this returns raw glyph counts. Converting them to ESMS deltas needs the
 * per-aspect magnitude constant, which is still `[OPEN]` — see §13c.
 */
export function netTerms(
  terms: Array<{ axis: string; sign: number }>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of terms) out[t.axis] = (out[t.axis] ?? 0) + t.sign;
  return out;
}

/**
 * The two ESMS axes each body carries, by sect. This is the synthesis table —
 * the constraint that a grid cell may only contain axes its two planets hold
 * holds at 84/84 after correction.
 */
export const SYNTHESIS_POOL: Readonly<Record<string, readonly [Axis, Axis]>> = {
  Sun: ["Spirit", "Spirit"],
  Moon: ["Essence", "Matter"],
  Mercury: ["Spirit", "Substance"],
  Venus: ["Essence", "Matter"],
  Mars: ["Essence", "Matter"],
  Jupiter: ["Spirit", "Essence"],
  Saturn: ["Spirit", "Matter"],
  Uranus: ["Essence", "Matter"],
  Neptune: ["Essence", "Substance"],
  Pluto: ["Essence", "Matter"],
} as const;

/** Cells left deliberately unresolved. Callers should degrade rather than guess. */
export function openCells(): GridCell[] {
  return grids.flatMap((g) => g.cells).filter((c) => c.flag === "OPEN");
}
