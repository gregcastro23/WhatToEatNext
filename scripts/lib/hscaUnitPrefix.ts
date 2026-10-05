/**
 * The live HSCA rows whose ingredient lines carry the importer's unit-prefix misread
 * (#937): "4 Granny Smith apples" stored as 4 g of "ranny smith apples", "Canola oil" as
 * a can of "ola oil". hsca.ts was restored by hand and the importer's regex fixed, but
 * the rows already in Postgres kept the old lines. No database access here.
 *
 * A stored line is repaired only when it is exactly that misread of its source line, and
 * the line it becomes is the one hsca.ts already serves (which is the importer's own
 * whole-word parse, plus #937's documented exceptions: "N garlic cloves" as N cloves of
 * garlic, a "Garnish:" label dropped from the name). Any other difference between a row
 * and the catalog means the row was edited or is not this record, and it is left alone.
 */
import { z } from "zod";
import { canonical, type LiveIngredient } from "./hscaDbSync";

/** A line of a dish in hsca.ts. */
export interface DishLine {
  amount: number;
  unit: string;
  name: string;
  notes: string;
}

export interface LineRepair {
  index: number;
  from: LiveIngredient;
  to: LiveIngredient;
}

export type RepairPlan =
  | { kind: "clean" }
  | { kind: "repair"; repairs: LineRepair[]; before: LiveIngredient[]; ingredients: LiveIngredient[] }
  | { kind: "skip"; reason: string };

/** Strict, so a stored line with any other key is refused rather than silently rewritten. */
const storedLines = z.array(
  z.strictObject({ name: z.string(), unit: z.string(), notes: z.string(), amount: z.number(), optional: z.literal(false) }),
);

/** A dish line in the shape a live row stores. */
export function liveLine(line: DishLine): LiveIngredient {
  return { name: line.name, unit: line.unit, notes: line.notes, amount: line.amount, optional: false };
}

/**
 * Is `stored` the old importer's misread of the line whose whole-word parse is `fixed`? The
 * misread took a unit from the first letters of the first word, so its unit and name put
 * back together are the correct name (or the correct unit and name): "g" + "arlic cloves",
 * "can" + "ola oil", "g" + "allons water" against the unit "gallons" and the name "water".
 */
export function isUnitPrefixMisread(stored: LiveIngredient, fixed: LiveIngredient): boolean {
  const rejoined = `${stored.unit}${stored.name}`;
  return (
    (rejoined === fixed.name || rejoined === `${fixed.unit} ${fixed.name}`) &&
    stored.amount === fixed.amount &&
    stored.notes === fixed.notes
  );
}

/** The plan for one stored ingredient list against one source parse and one hsca.ts dish. */
export function planRepair(stored: unknown, fixed: readonly LiveIngredient[], corrected: readonly DishLine[]): RepairPlan {
  const parsed = storedLines.safeParse(stored);
  if (!parsed.success) return { kind: "skip", reason: "stored ingredients are not the usual {name, unit, notes, amount, optional} lines" };
  const lines = parsed.data;
  if (lines.length !== fixed.length || lines.length !== corrected.length) {
    return { kind: "skip", reason: `line counts differ: stored ${lines.length}, source ${fixed.length}, hsca.ts ${corrected.length}` };
  }
  const repairs: LineRepair[] = [];
  for (const [index, line] of lines.entries()) {
    const source = fixed[index];
    const target = corrected[index];
    if (source === undefined || target === undefined) return { kind: "skip", reason: `no line ${index} to compare` };
    const to = liveLine(target);
    if (canonical(line) === canonical(to)) continue;
    if (!isUnitPrefixMisread(line, source) || line.amount !== to.amount) {
      return { kind: "skip", reason: `line ${index} differs from hsca.ts but is not the unit-prefix misread: ${canonical(line)}` };
    }
    repairs.push({ index, from: line, to });
  }
  if (repairs.length === 0) return { kind: "clean" };
  const ingredients = lines.map((line, index) => repairs.find((r) => r.index === index)?.to ?? line);
  return { kind: "repair", repairs, before: lines, ingredients };
}

/**
 * The plan for a row, given every (source parse, hsca.ts dish) pair its name and line count fit.
 * Two records can share a name; the row is repaired only when every pair that fits agrees.
 */
export function choosePlan(
  stored: unknown,
  pairs: ReadonlyArray<{ fixed: readonly LiveIngredient[]; corrected: readonly DishLine[] }>,
): RepairPlan {
  const plans = pairs.map((pair) => planRepair(stored, pair.fixed, pair.corrected));
  const usable = plans.filter((plan) => plan.kind !== "skip");
  const [first] = usable;
  if (first === undefined) return plans[0] ?? { kind: "skip", reason: "no source record and hsca.ts dish of this name and line count" };
  if (usable.some((plan) => canonical(plan) !== canonical(first))) return { kind: "skip", reason: "several records fit the row and disagree" };
  return first;
}
