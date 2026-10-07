/**
 * What it takes to bring the live `recipes` rows for HSCA in step with a change to
 * recipes_database.json: which source records changed, which live row each one
 * is, and the exact row to write. No database access here; the script that
 * calls it (syncHscaRecipesToDb.ts) owns the connection and the transaction.
 *
 * A live HSCA row keeps its method twice, in the `instructions` column and in
 * `read_model.instructions`, and its ingredients only in `read_model.ingredients`,
 * beside the computed `elemental_properties` and `alchemical_quantities`.
 */
import { parseIngredientString } from "./hscaDish";
import type { LiveAlchemical, LiveElemental } from "./hscaComputed";

export interface SourceRecipe {
  name?: string | undefined;
  yield_amount?: string | null | undefined;
  title: string;
  ingredients: string[];
  instructions: string[];
}

export interface Change {
  index: number;
  title: string;
  before: SourceRecipe;
  after: SourceRecipe;
  ingredientsChanged: boolean;
}

export interface Plan {
  changed: Change[];
  appended: SourceRecipe[];
}

export interface LiveIngredient {
  name: string;
  unit: string;
  notes: string;
  amount: number;
  optional: false;
}

export interface ReadModel {
  [key: string]: unknown;
}

export interface DbRow {
  id: string;
  name: string;
  instructions: unknown;
  category: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty_level: number;
  read_model: ReadModel | null;
}

export type Match = { kind: "match"; row: DbRow } | { kind: "none" } | { kind: "ambiguous"; ids: string[] };

export interface Computed {
  elemental: LiveElemental | null;
  alchemical: LiveAlchemical;
  /** Per-serving nutrition, or null where the ingredients cannot substantiate it. */
  nutrition: Record<string, unknown> | null;
}

export interface RowUpdate {
  id: string;
  instructions: string[];
  readModel: ReadModel;
  ingredientsRewritten: boolean;
  /** The `nutritional_profile` column, set only when the ingredients were rewritten. */
  nutritionalProfile: Record<string, unknown> | undefined;
}

export type UpdateResult = { kind: "update"; update: RowUpdate } | { kind: "skip"; reason: string };

export interface Defaults {
  category: string;
  prep: number;
  cook: number;
  servings: number;
  difficulty: number;
  seasonal: string[];
  timeOfDay: string[];
}

export interface InsertRow {
  id: string;
  name: string;
  instructions: string[];
  category: string;
  prep: number;
  cook: number;
  servings: number;
  difficulty: number;
  nutritionalProfile: Record<string, unknown>;
  readModel: ReadModel;
}

/** JSON with sorted keys, so two jsonb values compare the way Postgres compares them. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([key, inner]) => `${JSON.stringify(key)}:${canonical(inner)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** The name the importer gave a source recipe, which is the live row's name. */
export function nameOf(recipe: SourceRecipe): string {
  return [recipe.name, recipe.title].find((n) => n !== undefined && n !== "") ?? "Unnamed Recipe";
}

/** The ingredient objects a live row carries for these source lines. */
export function liveIngredients(lines: readonly string[]): LiveIngredient[] {
  return lines.map((line) => {
    const parsed = parseIngredientString(line);
    return { name: parsed.rawName, unit: parsed.unit, notes: parsed.notes, amount: parsed.amount, optional: false };
  });
}

/** Source records that changed in place or were appended between two versions of the source. */
export function planChanges(base: readonly SourceRecipe[], current: readonly SourceRecipe[]): Plan {
  if (current.length < base.length) throw new Error(`the new source has fewer recipes (${current.length}) than the base (${base.length})`);
  const changed: Change[] = [];
  base.forEach((before, index) => {
    const after = current[index];
    if (after === undefined || after.title !== before.title) {
      throw new Error(`recipe ${index} is "${before.title}" in the base but "${after?.title}" now: the source was reordered`);
    }
    const instructionsChanged = canonical(before.instructions) !== canonical(after.instructions);
    const ingredientsChanged = canonical(before.ingredients) !== canonical(after.ingredients);
    if (instructionsChanged || ingredientsChanged) changed.push({ index, title: before.title, before, after, ingredientsChanged });
  });
  return { changed, appended: current.slice(base.length) };
}

/**
 * The live row a changed source record was ingested as: same name, and BOTH stored
 * copies of the method equal the old source method. That equality is the witness
 * that this row is the one imported from this record (a duplicate-titled recipe,
 * or a row someone has since edited, does not match and is left alone).
 */
export function matchRow(rows: readonly DbRow[], change: Change): Match {
  const wanted = canonical(change.before.instructions);
  const name = nameOf(change.before).toLowerCase();
  const hits = rows.filter(
    (row) => row.name.toLowerCase() === name && canonical(row.instructions) === wanted && canonical(row.read_model?.instructions) === wanted,
  );
  const [only] = hits;
  if (only === undefined) return { kind: "none" };
  return hits.length === 1 ? { kind: "match", row: only } : { kind: "ambiguous", ids: hits.map((row) => row.id) };
}

/**
 * The row after a change. Instructions are replaced in both copies. When the
 * ingredient list changed too, `read_model.ingredients` is rewritten and the
 * computed fields (elemental, ESMS, nutrition in both its places) are replaced with
 * `computed`, but only if the row's stored ingredients are exactly what the old
 * source parses to (otherwise the row was produced some other way and is skipped).
 * Nutrition computed from the old, longer list would otherwise be left standing.
 */
export function buildUpdate(row: DbRow, change: Change, computed: Computed | null): UpdateResult {
  const readModel = row.read_model;
  if (readModel === null) return { kind: "skip", reason: "row has no read_model" };
  const next: ReadModel = { ...readModel, instructions: change.after.instructions };
  if (!change.ingredientsChanged) {
    return {
      kind: "update",
      update: { id: row.id, instructions: change.after.instructions, readModel: next, ingredientsRewritten: false, nutritionalProfile: undefined },
    };
  }
  const stored = canonical(readModel.ingredients);
  if (stored !== canonical(liveIngredients(change.before.ingredients))) {
    return { kind: "skip", reason: "stored ingredients are not the parse of the old source lines" };
  }
  if (computed === null) return { kind: "skip", reason: "no computed fields supplied for a changed ingredient list" };
  next.ingredients = liveIngredients(change.after.ingredients);
  next.alchemical_quantities = computed.alchemical;
  if (computed.elemental) next.elemental_properties = computed.elemental;
  else delete next.elemental_properties;
  const nutritionalProfile = computed.nutrition ?? {};
  next.nutritional_profile = nutritionalProfile;
  return {
    kind: "update",
    update: { id: row.id, instructions: change.after.instructions, readModel: next, ingredientsRewritten: true, nutritionalProfile },
  };
}

function mode<T>(values: readonly T[], label: string, minShare: number): T {
  const counts = new Map<string, { value: T; n: number }>();
  for (const value of values) {
    const key = canonical(value);
    const seen = counts.get(key);
    counts.set(key, { value, n: (seen?.n ?? 0) + 1 });
  }
  const top = [...counts.values()].sort((a, b) => b.n - a.n)[0];
  if (top === undefined) throw new Error(`no existing HSCA rows to take a default ${label} from`);
  if (top.n / values.length < minShare) {
    throw new Error(`${label} is not a clear placeholder: its commonest value covers ${top.n}/${values.length} rows`);
  }
  return top.value;
}

function contextOf(row: DbRow): { seasonal: string[]; timeOfDay: string[] } {
  const contexts = row.read_model?.contexts;
  const first: unknown = Array.isArray(contexts) ? contexts[0] : undefined;
  const record = first !== null && typeof first === "object" ? first : {};
  const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
  return { seasonal: strings("seasonal" in record ? record.seasonal : undefined), timeOfDay: strings("timeOfDay" in record ? record.timeOfDay : undefined) };
}

/** The placeholders existing HSCA rows share; refuses when they do not share one. */
export function deriveDefaults(rows: readonly DbRow[], minShare = 0.9): Defaults {
  const contexts = rows.map(contextOf);
  return {
    category: mode(rows.map((r) => r.category), "category", minShare),
    prep: mode(rows.map((r) => r.prep_time_minutes), "prep time", minShare),
    cook: mode(rows.map((r) => r.cook_time_minutes), "cook time", minShare),
    servings: mode(rows.map((r) => r.servings), "servings", minShare),
    difficulty: mode(rows.map((r) => r.difficulty_level), "difficulty", minShare),
    seasonal: mode(contexts.map((c) => c.seasonal), "seasonal context", minShare),
    timeOfDay: mode(contexts.map((c) => c.timeOfDay), "time-of-day context", minShare),
  };
}

/**
 * A new live row for a source recipe the database has never had. `lunar` is left empty: the
 * stored phases follow no rule the repo holds (they do not track the dominant element) and no
 * reader uses them, so a value here would be invented.
 */
export function buildInsert(recipe: SourceRecipe, defaults: Defaults, computed: Computed, id: string): InsertRow {
  const name = nameOf(recipe);
  const nutritionalProfile = computed.nutrition ?? {};
  const readModel: ReadModel = {
    id,
    name,
    cuisine: "Hsca",
    category: defaults.category,
    contexts: [{ lunar: [], seasonal: defaults.seasonal, timeOfDay: defaults.timeOfDay }],
    servings: defaults.servings,
    allergens: [],
    ingredients: liveIngredients(recipe.ingredients),
    dietary_tags: [],
    instructions: recipe.instructions,
    cook_time_minutes: defaults.cook,
    prep_time_minutes: defaults.prep,
    nutritional_profile: nutritionalProfile,
    alchemical_quantities: computed.alchemical,
  };
  if (computed.elemental) readModel.elemental_properties = computed.elemental;
  return {
    id,
    name,
    instructions: recipe.instructions,
    category: defaults.category,
    prep: defaults.prep,
    cook: defaults.cook,
    servings: defaults.servings,
    difficulty: defaults.difficulty,
    nutritionalProfile,
    readModel,
  };
}
