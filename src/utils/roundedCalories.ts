/**
 * A calorie count as a whole number, or null when the value is absent.
 * 0 is a value: a recipe can state it, and `x && ...` used to hide it.
 * Computed totals are floats (410.00997676887453), never shown as such.
 */
export function roundedCalories(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : null;
}
