/**
 * What the two scripts that write HSCA rows to production share: reading the live rows, the
 * checksum of every other row, the backup file, the same-basis control, and the small CLI helpers.
 * The writes themselves (and the decision of what to write) stay in each script.
 */
import fs from "node:fs";
import path from "node:path";
import pkg from "pg";
import { z } from "zod";
import {
  aggregateElemental,
  alchemicalQuantities,
  nutritionFor,
  type ElementalIndex,
} from "./hscaComputed";
import { liveIngredients, type Computed, type DbRow, type LiveIngredient, type SourceRecipe } from "./hscaDbSync";

export const { Client } = pkg;
export type PgClient = InstanceType<typeof Client>;

/** A computation this far from the stored one on most rows is on another basis, not drifted. */
export const BASIS_TOLERANCE = 0.1;
export const BASIS_FLOOR = 0.95;

export const args = process.argv.slice(2);
export const flag = (name: string): boolean => args.includes(`--${name}`);
export const option = (name: string): string | undefined => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
export const optionsOf = (name: string): string[] => args.filter((a) => a.startsWith(`--${name}=`)).map((a) => a.slice(name.length + 3));


export const rowSchema = z.object({
  id: z.string(),
  name: z.string(),
  instructions: z.unknown(),
  category: z.string(),
  prep_time_minutes: z.number(),
  cook_time_minutes: z.number(),
  servings: z.number(),
  difficulty_level: z.number(),
  read_model: z.record(z.string(), z.unknown()).nullable(),
  nutritional_profile: z.unknown(),
  instructions_text: z.string(),
  read_model_text: z.string().nullable(),
});
export type LiveRow = z.infer<typeof rowSchema>;

export const elementalSchema = z.object({ fire: z.number(), water: z.number(), earth: z.number(), air: z.number() });
export const alchemicalSchema = z.object({
  spirit: z.number(),
  essence: z.number(),
  matter: z.number(),
  substance: z.number(),
  totalASharp: z.number(),
  matchRate: z.number(),
});


export function ingredientNames(row: DbRow): string[] {
  const list = row.read_model?.ingredients;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item: unknown) => {
    const parsed = z.object({ name: z.string() }).safeParse(item);
    return parsed.success && parsed.data.name.length > 0 ? [parsed.data.name] : [];
  });
}

export function computedFromIngredients(index: ElementalIndex, ingredients: readonly LiveIngredient[], servings: number): Computed {
  const names = ingredients.map((i) => i.name);
  return { elemental: aggregateElemental(index, names), alchemical: alchemicalQuantities(names), nutrition: nutritionFor(ingredients, servings) };
}

export function computedFor(index: ElementalIndex, lines: readonly string[], servings: number): Computed {
  return computedFromIngredients(index, liveIngredients(lines), servings);
}

const sourceSchema = z.array(
  z.object({
    name: z.string().optional(),
    title: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
  }),
);

export function loadSource(file: string): SourceRecipe[] {
  return sourceSchema.parse(JSON.parse(fs.readFileSync(path.resolve(file), "utf8")));
}

function near(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

function numbersMatch(stored: object, fresh: object): boolean {
  const freshEntries = new Map<string, unknown>(Object.entries(fresh));
  const storedEntries = Object.entries(stored);
  return (
    storedEntries.length === freshEntries.size &&
    storedEntries.every(([key, value]) => {
      const other = freshEntries.get(key);
      return typeof value === "number" && typeof other === "number" && near(value, other);
    })
  );
}

export interface Control {
  rows: number;
  elemental: number;
  alchemical: number;
  /** Rows whose elemental shares all lie within BASIS_TOLERANCE of the stored ones. */
  sameBasis: number;
}

function sharesWithin(stored: object, fresh: object, tolerance: number): boolean {
  const freshEntries = new Map<string, unknown>(Object.entries(fresh));
  return Object.entries(stored).every(([key, value]) => {
    const other = freshEntries.get(key);
    return typeof value === "number" && typeof other === "number" && Math.abs(value - other) <= tolerance;
  });
}

/** How close is this file's computation to what the existing rows store? */
export function control(rows: readonly LiveRow[], index: ElementalIndex): Control {
  const result: Control = { rows: 0, elemental: 0, alchemical: 0, sameBasis: 0 };
  for (const row of rows) {
    const names = ingredientNames(row);
    if (names.length === 0) continue;
    result.rows += 1;
    const fresh = { elemental: aggregateElemental(index, names), alchemical: alchemicalQuantities(names) };
    const storedElemental = elementalSchema.safeParse(row.read_model?.elemental_properties);
    const elementalOk = fresh.elemental === null ? !storedElemental.success : storedElemental.success && numbersMatch(storedElemental.data, fresh.elemental);
    const storedAlchemical = alchemicalSchema.safeParse(row.read_model?.alchemical_quantities);
    const alchemicalOk = storedAlchemical.success && numbersMatch(storedAlchemical.data, fresh.alchemical);
    if (elementalOk) result.elemental += 1;
    if (alchemicalOk) result.alchemical += 1;
    if (storedElemental.success && fresh.elemental !== null && sharesWithin(storedElemental.data, fresh.elemental, BASIS_TOLERANCE)) result.sameBasis += 1;
  }
  return result;
}


export const ROW_COLUMNS = `id, name, instructions, category, prep_time_minutes, cook_time_minutes, servings, difficulty_level, read_model, nutritional_profile,
  instructions::text AS instructions_text, read_model::text AS read_model_text`;

export async function readHscaRows(client: PgClient): Promise<LiveRow[]> {
  const res = await client.query(`SELECT ${ROW_COLUMNS} FROM recipes WHERE cuisine::text = 'Hsca' ORDER BY created_at, id`);
  return z.array(rowSchema).parse(res.rows);
}

export async function readRowsById(client: PgClient, ids: readonly string[]): Promise<LiveRow[]> {
  const res = await client.query(`SELECT ${ROW_COLUMNS} FROM recipes WHERE id = ANY($1::uuid[])`, [ids]);
  return z.array(rowSchema).parse(res.rows);
}

export async function checksumOthers(client: PgClient, ids: readonly string[]): Promise<string> {
  const res = await client.query(
    `SELECT count(*)::int AS n, md5(coalesce(string_agg(r::text, '|' ORDER BY r.id), '')) AS sum FROM recipes r WHERE r.id <> ALL($1::uuid[])`,
    [ids],
  );
  const parsed = z.object({ n: z.number(), sum: z.string() }).parse(res.rows[0]);
  return `${parsed.n}:${parsed.sum}`;
}

export async function countRows(client: PgClient): Promise<{ all: number; hsca: number }> {
  const res = await client.query(`SELECT count(*)::int AS all, count(*) FILTER (WHERE cuisine::text = 'Hsca')::int AS hsca FROM recipes`);
  return z.object({ all: z.number(), hsca: z.number() }).parse(res.rows[0]);
}

export async function writeBackup(client: PgClient, file: string, ids: readonly string[], host: string): Promise<number> {
  const res = await client.query(`SELECT to_jsonb(r) AS j FROM recipes r WHERE r.id = ANY($1::uuid[]) ORDER BY r.id`, [ids]);
  const rows = z.array(z.object({ j: z.record(z.string(), z.unknown()) })).parse(res.rows).map((r) => r.j);
  fs.writeFileSync(path.resolve(file), JSON.stringify({ host, table: "recipes", rows }, null, 1));
  const back = z.object({ rows: z.array(z.unknown()) }).parse(JSON.parse(fs.readFileSync(path.resolve(file), "utf8")));
  if (back.rows.length !== ids.length) throw new Error(`backup holds ${back.rows.length} rows, expected ${ids.length}`);
  return back.rows.length;
}
