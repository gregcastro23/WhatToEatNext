/**
 * Live HSCA rows carry 4 servings until their yield says otherwise (hscaYield.ts), and their stored
 * per-serving nutrition was divided by that 4. When a row gets its stated servings, every stored
 * per-serving number follows by the ratio of the old divisor to the new: exact, needs no engine, and
 * neither clears nor invents a value. No database access here.
 */
import { PLACEHOLDER_SERVINGS } from "./hscaDish";

const round2 = (value: number): number => Math.round(value * 100) / 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function scaleNested(value: unknown, factor: number): unknown {
  if (typeof value === "number") return value * factor;
  if (Array.isArray(value)) return value.map((item) => scaleNested(item, factor));
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, scaleNested(inner, factor)]));
  return value;
}

/**
 * A stored nutritional profile with every number multiplied by `factor`; top-level numbers are rounded to
 * 2 places as backfillRecipeNutrition.ts writes them, nested ones (the daily-value fractions) are not.
 * Anything that is not a profile with a positive calorie count (the honest-empty `{}`, null) comes back
 * unchanged: there is nothing to rescale.
 */
export function scaleProfile(profile: unknown, factor: number): unknown {
  if (!isRecord(profile) || typeof profile.calories !== "number" || !(profile.calories > 0)) return profile;
  return Object.fromEntries(
    Object.entries(profile).map(([key, value]) => [key, typeof value === "number" ? round2(value * factor) : scaleNested(value, factor)]),
  );
}

export interface ServingsRow {
  servings: number;
  readModel: Record<string, unknown> | null;
}

export type ServingsPlan =
  | { kind: "clean" }
  | { kind: "none" }
  | { kind: "repair"; from: number; to: number }
  | { kind: "skip"; reason: string };

/**
 * `stated` is what each source record that fits the row says (undefined when it states none). The row is
 * repaired only when it still carries the placeholder in BOTH places and every fitting record that states
 * servings agrees.
 */
export function planServings(row: ServingsRow, stated: ReadonlyArray<number | undefined>): ServingsPlan {
  const values = [...new Set(stated.filter((n): n is number => n !== undefined))];
  const [target] = values;
  if (target === undefined) return { kind: "none" };
  if (values.length > 1) return { kind: "skip", reason: `records disagree on servings: ${values.join(", ")}` };
  const inModel = row.readModel?.servings;
  if (row.servings === target && inModel === target) return { kind: "clean" };
  if (row.servings !== PLACEHOLDER_SERVINGS || inModel !== PLACEHOLDER_SERVINGS) {
    return { kind: "skip", reason: `servings are ${row.servings} (read_model ${String(inModel)}), not the placeholder ${PLACEHOLDER_SERVINGS}` };
  }
  return { kind: "repair", from: PLACEHOLDER_SERVINGS, to: target };
}

/** The read_model after the change: the new servings, and any stored profile rescaled. */
export function readModelWithServings(readModel: Record<string, unknown>, from: number, to: number): Record<string, unknown> {
  const next: Record<string, unknown> = { ...readModel, servings: to };
  if ("nutritional_profile" in readModel) next.nutritional_profile = scaleProfile(readModel.nutritional_profile, from / to);
  return next;
}
