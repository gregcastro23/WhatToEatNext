/**
 * Wire parsers for weekly menu endpoints consumed by the profile week cards.
 *
 * Producer contracts:
 * - GET /api/menu-planner/menus (`src/app/api/menu-planner/menus/route.ts:41-43`,
 *   `src/lib/menu-planner/schemas.ts:247-251`) returns `{ success: true, menu }`
 *   where `menu` is `null` or `{ ..., meals: MealSlot[] }`.
 * - GET /api/menu-planner/public-week (`src/app/api/menu-planner/public-week/route.ts:31-46, 99-107`)
 *   returns `{ success: true, userId, displayName, weekStartDate, updatedAt, meals }`
 *   where `updatedAt` is `string | null` and each meal projects `dayOfWeek`,
 *   `mealType`, and optional `recipe: { id, name, elementalProperties: ... | null }`.
 */

import { isJsonRecord } from "@/lib/api/json";
import type { DayOfWeek, MealType } from "@/types/menuPlanner";

export interface WeekMealRecipe {
  elementalProperties?: Record<string, number>;
}

export interface WeekMealSlot {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipe?: WeekMealRecipe;
}

export interface OwnerWeekMenuResponse {
  meals: WeekMealSlot[];
}

export interface PublicWeekResponse {
  meals: WeekMealSlot[];
  updatedAt: string | null;
}

function parseDayOfWeek(value: unknown): DayOfWeek | null {
  switch (value) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      return value;
    default:
      return null;
  }
}

function parseMealType(value: unknown): MealType | null {
  switch (value) {
    case "breakfast":
    case "lunch":
    case "dinner":
    case "snack":
      return value;
    default:
      return null;
  }
}

function parseElementalProperties(value: unknown): Record<string, number> | null {
  if (!isJsonRecord(value)) return null;
  const out: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "number" || !Number.isFinite(entry)) {
      return null;
    }
    out[key] = entry;
  }
  return out;
}

function parseWeekMealSlot(row: unknown): WeekMealSlot | null {
  if (!isJsonRecord(row)) return null;
  const dayOfWeek = parseDayOfWeek(row.dayOfWeek);
  const mealType = parseMealType(row.mealType);
  if (dayOfWeek === null || mealType === null) return null;

  if (row.recipe === undefined || row.recipe === null) {
    return { dayOfWeek, mealType };
  }
  if (!isJsonRecord(row.recipe)) return null;

  const rawProps = row.recipe.elementalProperties;
  if (rawProps === undefined || rawProps === null) {
    return { dayOfWeek, mealType, recipe: {} };
  }

  const elementalProperties = parseElementalProperties(rawProps);
  if (elementalProperties === null) return null;

  return { dayOfWeek, mealType, recipe: { elementalProperties } };
}

function parseWeekMeals(rawMeals: unknown, label: string): WeekMealSlot[] {
  if (!Array.isArray(rawMeals)) {
    throw new Error(`Invalid ${label} response: expected meals array`);
  }
  const meals: WeekMealSlot[] = [];
  for (const item of rawMeals) {
    const parsed = parseWeekMealSlot(item);
    if (parsed !== null) {
      meals.push(parsed);
    }
  }
  if (rawMeals.length > 0 && meals.length === 0) {
    throw new Error(`Invalid ${label} response: no valid meal slots matched`);
  }
  return meals;
}

export function parseOwnerWeekMenuResponse(value: unknown): OwnerWeekMenuResponse {
  if (!isJsonRecord(value) || value.success !== true) {
    throw new Error("Invalid owner week menu response");
  }
  if (value.menu === null) {
    return { meals: [] };
  }
  if (!isJsonRecord(value.menu)) {
    throw new Error("Invalid owner week menu response: expected menu record or null");
  }
  return { meals: parseWeekMeals(value.menu.meals, "owner week menu") };
}

export function parsePublicWeekResponse(value: unknown): PublicWeekResponse {
  if (!isJsonRecord(value) || value.success !== true) {
    throw new Error("Invalid public week response");
  }
  const { updatedAt, meals } = value;
  if (updatedAt !== null && typeof updatedAt !== "string") {
    throw new Error("Invalid public week response: expected string or null updatedAt");
  }
  return {
    meals: parseWeekMeals(meals, "public week menu"),
    updatedAt,
  };
}
