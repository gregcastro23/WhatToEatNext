/**
 * The food_diary_entries statements, the values they bind, and how a row's
 * nutrition reads back.
 *
 * Type imports only, so `scripts/checkFoodDiaryPersistenceSql.mjs` loads this
 * file and runs these exact statements against PostgreSQL, rolled back.
 *
 * [MEASURED 2026-09-28, prod, read-only] The table held 0 rows. Since 04e9fa72
 * (2026-04-30) every insert bound `entry_<ms>_<random>` to the UUID `id` column
 * and failed ("invalid input syntax for type uuid"). The service swallowed the
 * error, kept the entry in one server instance's memory and answered 200; the
 * next read found nothing. The table's `saturated_fat` and `potassium` columns
 * were never written or read.
 */
import type { FoodDiaryEntry, FoodDiaryNutrition } from "../types/foodDiary";

/** An id the `id UUID` column accepts. */
export function newEntryId(): string {
  return globalThis.crypto.randomUUID();
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rows belong to accounts (`user_id UUID REFERENCES users`); "guest" is not one. */
export function isPersistableUserId(userId: string): boolean {
  return UUID.test(userId);
}

/** A row's nutrition columns, as pg returns them (NUMERIC arrives as a string). */
export interface NutritionRow {
  calories?: unknown;
  protein?: unknown;
  carbs?: unknown;
  fat?: unknown;
  fiber?: unknown;
  sugar?: unknown;
  sodium?: unknown;
  saturated_fat?: unknown;
  potassium?: unknown;
}

/** Stored nutrition: column, and the entry field it holds. */
const NUTRITION_COLUMNS: ReadonlyArray<[keyof NutritionRow, keyof FoodDiaryNutrition]> = [
  ["calories", "calories"],
  ["protein", "protein"],
  ["carbs", "carbs"],
  ["fat", "fat"],
  ["fiber", "fiber"],
  ["sugar", "sugar"],
  ["sodium", "sodium"],
  ["saturated_fat", "saturatedFat"],
  ["potassium", "potassium"],
];

export const INSERT_ENTRY_SQL = `INSERT INTO food_diary_entries (
  id, user_id, food_name, food_source, source_id, brand_name,
  date, meal_type, time, serving_amount, serving_unit, serving_grams,
  serving_description, quantity, calories, protein, carbs, fat, fiber,
  sugar, sodium, saturated_fat, potassium, nutrition_confidence,
  elemental_fire, elemental_water, elemental_earth, elemental_air,
  notes, tags, price, store, quality, is_favorite,
  astrological_context, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
  $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
  $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
)`;

export const UPDATE_ENTRY_SQL = `UPDATE food_diary_entries
   SET serving_amount = $1, serving_unit = $2, serving_grams = $3,
       serving_description = $4, quantity = $5, calories = $6,
       protein = $7, carbs = $8, fat = $9, fiber = $10,
       sugar = $11, sodium = $12, saturated_fat = $13, potassium = $14,
       rating = $15, mood_tags = $16, notes = $17, would_eat_again = $18,
       is_favorite = $19, tags = $20, price = $21, store = $22,
       quality = $23, updated_at = $24
 WHERE id = $25 AND user_id = $26`;

export const DELETE_ENTRY_SQL = `DELETE FROM food_diary_entries WHERE id = $1 AND user_id = $2`;

/** The nutrition values in column order; absent binds NULL, never 0. */
function nutritionParams(nutrition: FoodDiaryNutrition): Array<number | null> {
  return NUTRITION_COLUMNS.map(([, field]) => nutrition[field] ?? null);
}

function servingParams(entry: FoodDiaryEntry): unknown[] {
  const { serving } = entry;
  return [serving.amount, serving.unit, serving.grams || null, serving.description ?? null, entry.quantity];
}

export function insertEntryParams(entry: FoodDiaryEntry): unknown[] {
  const e = entry.elementalProperties;
  return [
    entry.id, entry.userId, entry.foodName, entry.foodSource, entry.sourceId ?? null, entry.brandName ?? null,
    entry.date, entry.mealType, entry.time, ...servingParams(entry),
    ...nutritionParams(entry.nutrition), entry.nutritionConfidence,
    e?.Fire ?? null, e?.Water ?? null, e?.Earth ?? null, e?.Air ?? null,
    entry.notes ?? null, entry.tags ?? [], entry.price ?? null, entry.store ?? null, entry.quality ?? null,
    entry.isFavorite,
    entry.astrologicalContext === undefined ? null : JSON.stringify(entry.astrologicalContext),
    entry.createdAt, entry.updatedAt,
  ];
}

export function updateEntryParams(entry: FoodDiaryEntry): unknown[] {
  return [
    ...servingParams(entry), ...nutritionParams(entry.nutrition),
    entry.rating ?? null, entry.moodTags ?? [], entry.notes ?? null, entry.wouldEatAgain ?? null,
    entry.isFavorite, entry.tags ?? [], entry.price ?? null, entry.store ?? null, entry.quality ?? null,
    entry.updatedAt, entry.id, entry.userId,
  ];
}

/** pg returns NUMERIC as a string. NULL is absent, not 0. */
function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** A row's stored nutrition, with only the values the row holds. */
export function rowNutrition(row: NutritionRow): FoodDiaryNutrition {
  const nutrition: FoodDiaryNutrition = {};
  for (const [column, field] of NUTRITION_COLUMNS) {
    const value = optionalNumber(row[column]);
    if (value !== undefined) nutrition[field] = value;
  }
  return nutrition;
}
