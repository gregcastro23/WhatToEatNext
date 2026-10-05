/**
 * Live HSCA rows whose ingredient lines carry what the importer's first parser made of them
 * ("¾ cup flour" as 1 piece named "¾ cup flour", "8-10 sheets rice paper" as 8 pieces of
 * "-10 sheets rice paper", "Salt to taste" as the ingredient "salt to taste", "g ranny smith
 * apples"). The parser was corrected and hsca.ts rebuilt; the rows already in Postgres kept the
 * old lines. No database access here.
 *
 * A stored line is replaced only when it is exactly what the frozen legacy parser
 * (hscaLegacyParse.ts) made of its source line, and it becomes the line hsca.ts now holds. A line
 * that is neither, or a row whose line count differs, means the row was edited or is not this
 * record, and the row is left alone.
 */
import { z } from "zod";
import { legacyParseIngredientString } from "./hscaLegacyParse";
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

/** What the importer's first parser made of each source line, in the shape a live row stores. */
export function legacyLiveIngredients(lines: readonly string[]): LiveIngredient[] {
  return lines.map((line) => {
    const parsed = legacyParseIngredientString(line);
    return { name: parsed.rawName, unit: parsed.unit, notes: parsed.notes, amount: parsed.amount, optional: false };
  });
}

/** The plan for one stored ingredient list against one source's legacy parse and one hsca.ts dish. */
export function planRepair(stored: unknown, legacy: readonly LiveIngredient[], corrected: readonly DishLine[]): RepairPlan {
  const parsed = storedLines.safeParse(stored);
  if (!parsed.success) return { kind: "skip", reason: "stored ingredients are not the usual {name, unit, notes, amount, optional} lines" };
  const lines = parsed.data;
  if (lines.length !== legacy.length || lines.length !== corrected.length) {
    return { kind: "skip", reason: `line counts differ: stored ${lines.length}, source ${legacy.length}, hsca.ts ${corrected.length}` };
  }
  const repairs: LineRepair[] = [];
  for (const [index, line] of lines.entries()) {
    const old = legacy[index];
    const target = corrected[index];
    if (old === undefined || target === undefined) return { kind: "skip", reason: `no line ${index} to compare` };
    const to = liveLine(target);
    if (canonical(line) === canonical(to)) continue;
    if (canonical(line) !== canonical(old)) {
      return { kind: "skip", reason: `line ${index} is neither the corrected line nor the old parser's output: ${canonical(line)}` };
    }
    repairs.push({ index, from: line, to });
  }
  if (repairs.length === 0) return { kind: "clean" };
  const ingredients = lines.map((line, index) => repairs.find((r) => r.index === index)?.to ?? line);
  return { kind: "repair", repairs, before: lines, ingredients };
}

/**
 * The plan for a row, given every (legacy parse, hsca.ts dish) pair its name fits. Two records can
 * share a name; the row is repaired only when every pair that fits agrees.
 */
export function choosePlan(
  stored: unknown,
  pairs: ReadonlyArray<{ legacy: readonly LiveIngredient[]; corrected: readonly DishLine[] }>,
): RepairPlan {
  const plans = pairs.map((pair) => planRepair(stored, pair.legacy, pair.corrected));
  const usable = plans.filter((plan) => plan.kind !== "skip");
  const [first] = usable;
  if (first === undefined) return plans[0] ?? { kind: "skip", reason: "no source record and hsca.ts dish of this name" };
  if (usable.some((plan) => canonical(plan) !== canonical(first))) return { kind: "skip", reason: "several records fit the row and disagree" };
  return first;
}
