/**
 * Shared mapping between the frontend meal-planner domain and the
 * `meal_plan_slot` table in the SpacetimeDB module.
 */

import type { MealType } from "@/types/menuPlanner";

/** Module convention: 0 = breakfast, 1 = lunch, 2 = dinner, 3 = snack. */
export const MEAL_TYPE_INDEX: Record<MealType, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
  snack: 3,
};

export const MEAL_TYPE_BY_INDEX: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

/**
 * The module keys weeks by "days since Unix epoch" of the week's start date.
 * The planner's `weekStartDate` is a local-calendar Sunday; we take its local
 * Y/M/D at UTC midnight so every device in any timezone derives the same key
 * for the same calendar week.
 */
export function weekEpochDay(weekStartDate: Date | string): number {
  const d = new Date(weekStartDate);
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000,
  );
}
