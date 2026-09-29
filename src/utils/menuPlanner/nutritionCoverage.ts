/**
 * Day and week nutrition totals that say what they cover (owner ruling
 * 2026-09-26, option a).
 *
 * A planned recipe that publishes no nutrition is not a 0 kcal meal. A total
 * that leaves it out is a lower bound, and is shown as one:
 * "≥1311 kcal · partial: 2 of 3 meals have nutrition". When no planned meal
 * has nutrition there is no total to show. Values derived from a partial
 * total (compliance, the goal bar, suggestions) are still computed from it
 * and carry the same label.
 *
 * [MEASURED 2026-09-26, `getServerRecipes`, 1,084 recipes] 16 publish no
 * nutrition on master, and 59 under the nutrition-completeness gate. A
 * breakfast + lunch + dinner day, drawn uniformly from the generator's
 * meal × season pools, includes one of them 2.4–3.7% of the time on master
 * and 21–22% under the gate.
 */

import type { NutritionCoverage } from "@/types/nutrition";

export type CoverageState = "complete" | "partial" | "none";

/** No meals planned: nothing is missing, and the total is a true 0. */
export const NO_MEALS: NutritionCoverage = { planned: 0, withNutrition: 0 };

/** Whether a nutrition payload publishes a calorie value a total can use. */
export function publishesCalories(
  nutrition: unknown,
): nutrition is { calories: number } {
  return (
    typeof nutrition === "object" &&
    nutrition !== null &&
    "calories" in nutrition &&
    typeof nutrition.calories === "number" &&
    Number.isFinite(nutrition.calories)
  );
}

/** Coverage of one day, from whether each planned meal entered the total. */
export function coverageOf(entered: readonly boolean[]): NutritionCoverage {
  return {
    planned: entered.length,
    withNutrition: entered.filter(Boolean).length,
  };
}

/** Coverage of a week, from its days. A week with a partial day is partial. */
export function sumCoverage(
  parts: readonly NutritionCoverage[],
): NutritionCoverage {
  return parts.reduce(
    (sum, part) => ({
      planned: sum.planned + part.planned,
      withNutrition: sum.withNutrition + part.withNutrition,
    }),
    NO_MEALS,
  );
}

export function coverageState(coverage: NutritionCoverage): CoverageState {
  const { planned, withNutrition } = coverage;
  if (withNutrition >= planned) return "complete";
  return withNutrition === 0 ? "none" : "partial";
}

/**
 * The label a total carries: "partial: 2 of 3 meals have nutrition", or the
 * reason there is no total. Null when the total is whole.
 */
export function coverageNote(coverage: NutritionCoverage): string | null {
  const { planned, withNutrition } = coverage;
  const state = coverageState(coverage);
  if (state === "complete") return null;
  if (state === "partial") {
    const verb = withNutrition === 1 ? "has" : "have";
    return `partial: ${withNutrition} of ${planned} meals ${verb} nutrition`;
  }
  return planned === 1
    ? "no nutrition published for this meal"
    : `no nutrition published for these ${planned} meals`;
}

/** A total as shown: "1311", "≥1311" when partial, "—" when there is none. */
export function formatCoveredTotal(
  value: number,
  coverage: NutritionCoverage,
  unit = "",
): string {
  const state = coverageState(coverage);
  if (state === "none") return "—";
  const bound = state === "partial" ? "≥" : "";
  return `${bound}${Math.round(value)}${unit}`;
}

/** A share derived from the total (compliance): "74%", or "—" when there is no total. */
export function formatCoveredShare(
  share: number,
  coverage: NutritionCoverage,
): string {
  return coverageState(coverage) === "none" ? "—" : `${Math.round(share * 100)}%`;
}
