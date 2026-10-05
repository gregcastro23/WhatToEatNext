// scripts/repairHscaUnitPrefixInDb.ts
/**
 * Repairs the live HSCA rows whose ingredient lines carry the importer's unit-prefix misread
 * (#937): "4 Granny Smith apples" stored as 4 g of "ranny smith apples", "Canola oil" as a can
 * of "ola oil". hsca.ts and the importer were fixed; the rows in Postgres were not.
 *
 *   DATABASE_PUBLIC_URL=... bun scripts/repairHscaUnitPrefixInDb.ts --url-env=DATABASE_PUBLIC_URL
 *     dry run: reads, plans, prints, writes nothing (a READ ONLY transaction)
 *     ... --rehearse                                           does every write and check, then ROLLS BACK
 *     ... --commit --backup=<file> --confirm-host=<host:port>   the same, then COMMITs
 *
 * What a row becomes is what hsca.ts already serves for that line (lib/hscaUnitPrefix.ts). A row
 * is touched only when every line that differs from hsca.ts is exactly the misread of its source
 * line; an edited row, or one that fits no record, is reported and left alone.
 *
 * Only what the repair changes is rewritten. The ingredient lines are. `elemental_properties` and
 * `alchemical_quantities` are rewritten only where today's code computes a different result from
 * the repaired names than from the misread ones; where it computes the same, the stored value
 * stays (the stored values come from older ingredient data, and a rewrite would add that drift to
 * a row for no reason). `nutritional_profile` is never touched: today's nutrition code returns
 * nothing for most of these rows on their stored lines too, so recomputing it would clear numbers
 * the repair did not invalidate, which is a table-wide decision for the nutrition backfill.
 *
 * It refuses to commit unless every repaired row reads back as intended with its method untouched,
 * the row counts are unchanged, a checksum of every other row is unchanged, and a fresh plan over
 * the rows read back finds nothing left to repair.
 */
import { z } from "zod";
import { cuisine } from "../src/data/cuisines/hsca";
import { unifiedIngredients } from "../src/data/unified/ingredients";
import type { CuisineDishes, SeasonalDishes } from "../src/types/cuisine";
import { buildElementalIndex, type ElementalIndex } from "./lib/hscaComputed";
import {
  BASIS_FLOOR,
  BASIS_TOLERANCE,
  Client,
  checksumOthers,
  computedFromIngredients,
  control,
  countRows,
  flag,
  loadSource,
  option,
  readHscaRows,
  readRowsById,
  writeBackup,
  type LiveRow,
  type PgClient,
} from "./lib/hscaDbIo";
import { canonical, liveIngredients, nameOf, type ReadModel, type SourceRecipe } from "./lib/hscaDbSync";
import { choosePlan, type DishLine, type RepairPlan } from "./lib/hscaUnitPrefix";

const MEALS: ReadonlyArray<keyof CuisineDishes> = ["breakfast", "lunch", "dinner", "dessert"];
const SEASONS: ReadonlyArray<keyof SeasonalDishes> = ["spring", "summer", "autumn", "winter", "all"];

const dishSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({ amount: z.number(), unit: z.string(), name: z.string(), notes: z.string() })),
});

type Planned = { row: LiveRow; plan: RepairPlan };
type Repairing = { row: LiveRow; plan: Extract<RepairPlan, { kind: "repair" }>; readModel: ReadModel; elementalChanged: boolean; esmsChanged: boolean };

/** Every dish of hsca.ts, by lower-cased name (a dish is filed under several seasons; copies agree). */
function dishLinesByName(): Map<string, DishLine[][]> {
  const byName = new Map<string, DishLine[][]>();
  for (const meal of MEALS) {
    for (const season of SEASONS) {
      for (const dish of cuisine.dishes[meal]?.[season] ?? []) {
        const parsed = dishSchema.parse(dish);
        byName.set(parsed.name.toLowerCase(), [...(byName.get(parsed.name.toLowerCase()) ?? []), parsed.ingredients]);
      }
    }
  }
  return byName;
}

function sourceByName(source: readonly SourceRecipe[]): Map<string, SourceRecipe[]> {
  const byName = new Map<string, SourceRecipe[]>();
  for (const recipe of source) byName.set(nameOf(recipe).toLowerCase(), [...(byName.get(nameOf(recipe).toLowerCase()) ?? []), recipe]);
  return byName;
}

function planRows(rows: readonly LiveRow[], sources: Map<string, SourceRecipe[]>, dishes: Map<string, DishLine[][]>): Planned[] {
  return rows.map((row) => {
    const key = row.name.toLowerCase();
    const pairs = (sources.get(key) ?? []).flatMap((recipe) =>
      (dishes.get(key) ?? []).map((corrected) => ({ fixed: liveIngredients(recipe.ingredients), corrected })),
    );
    return { row, plan: choosePlan(row.read_model?.ingredients, pairs) };
  });
}

function repairing(planned: readonly Planned[], index: ElementalIndex): Repairing[] {
  return planned.flatMap(({ row, plan }) => {
    if (plan.kind !== "repair" || row.read_model === null) return [];
    const servings = typeof row.read_model.servings === "number" ? row.read_model.servings : row.servings;
    const was = computedFromIngredients(index, plan.before, servings);
    const now = computedFromIngredients(index, plan.ingredients, servings);
    const elementalChanged = canonical(was.elemental) !== canonical(now.elemental);
    const esmsChanged = canonical(was.alchemical) !== canonical(now.alchemical);
    const readModel: ReadModel = { ...row.read_model, ingredients: plan.ingredients };
    if (esmsChanged) readModel.alchemical_quantities = now.alchemical;
    if (elementalChanged && now.elemental) readModel.elemental_properties = now.elemental;
    else if (elementalChanged) delete readModel.elemental_properties;
    return [{ row, plan, readModel, elementalChanged, esmsChanged }];
  });
}

function describe(repairs: readonly Repairing[]): void {
  for (const { row, plan, elementalChanged, esmsChanged } of repairs) {
    console.log(`  REPAIR  ${row.id}  ${row.name}  (elemental ${elementalChanged ? "rewritten" : "kept"}, ESMS ${esmsChanged ? "rewritten" : "kept"})`);
    for (const { index, from, to } of plan.repairs) {
      console.log(`      [${index}] ${from.amount} | ${from.unit} | ${from.name}   ->   ${to.amount} | ${to.unit} | ${to.name}`);
    }
  }
}

async function writeRepair(client: PgClient, repair: Repairing): Promise<void> {
  const { row } = repair;
  const res = await client.query(
    `UPDATE recipes SET read_model = $2::jsonb, updated_at = NOW()
      WHERE id = $1::uuid AND read_model::text = $3 AND instructions::text = $4`,
    [row.id, JSON.stringify(repair.readModel), row.read_model_text, row.instructions_text],
  );
  if (res.rowCount !== 1) throw new Error(`repair of ${row.name} (${row.id}) changed ${String(res.rowCount)} rows: the row moved since it was read`);
}

/** Everything that must hold before the transaction may commit; returns the failures. */
async function verify(
  client: PgClient,
  repairs: readonly Repairing[],
  before: { counts: { all: number; hsca: number }; others: string; skipped: number },
  ids: readonly string[],
  context: { sources: Map<string, SourceRecipe[]>; dishes: Map<string, DishLine[][]> },
): Promise<string[]> {
  const failures: string[] = [];
  const read = new Map((await readRowsById(client, ids)).map((r) => [r.id, r]));
  for (const { row, readModel } of repairs) {
    const now = read.get(row.id);
    if (now === undefined) failures.push(`${row.name}: row is gone`);
    else if (now.instructions_text !== row.instructions_text) failures.push(`${row.name}: method changed`);
    else if (canonical(now.nutritional_profile) !== canonical(row.nutritional_profile)) failures.push(`${row.name}: nutritional_profile column changed`);
    else if (canonical(now.read_model) !== canonical(readModel)) failures.push(`${row.name}: read_model not as intended`);
  }
  const counts = await countRows(client);
  if (counts.all !== before.counts.all || counts.hsca !== before.counts.hsca) failures.push(`row counts moved: ${canonical(before.counts)} -> ${canonical(counts)}`);
  const others = await checksumOthers(client, ids);
  if (others !== before.others) failures.push(`other rows changed: checksum ${before.others} -> ${others}`);
  const after = planRows(await readHscaRows(client), context.sources, context.dishes);
  const left = after.filter((p) => p.plan.kind === "repair").length;
  const skipped = after.filter((p) => p.plan.kind === "skip").length;
  if (left > 0) failures.push(`${left} rows still need repair after the writes`);
  if (skipped !== before.skipped) failures.push(`skipped rows ${before.skipped} -> ${skipped}`);
  return failures;
}

async function main(): Promise<void> {
  const commit = flag("commit");
  const write = commit || flag("rehearse");
  const urlEnv = option("url-env") ?? "DATABASE_URL";
  const url = process.env[urlEnv];
  if (!url) throw new Error(`${urlEnv} is not set in the environment`);
  const host = new URL(url).host;
  if (commit && (option("backup") === undefined || option("confirm-host") !== host)) {
    throw new Error("--commit needs --backup=<file> and --confirm-host=<the host printed above>");
  }
  const sources = sourceByName(loadSource(option("current") ?? "recipes_database.json"));
  const dishes = dishLinesByName();
  const index = buildElementalIndex(unifiedIngredients);
  console.log(`host ${host}; ${commit ? "COMMIT" : write ? "rehearsal (rolls back)" : "dry run"}`);

  const client = new Client({ connectionString: url, ssl: host.endsWith(".railway.internal") ? false : { rejectUnauthorized: false } });
  await client.connect();
  await client.query(`BEGIN ISOLATION LEVEL REPEATABLE READ${write ? "" : " READ ONLY"}`);
  try {
    const rows = await readHscaRows(client);
    const counts = await countRows(client);
    const planned = planRows(rows, sources, dishes);
    const repairs = repairing(planned, index);
    const skipped = planned.flatMap((p) => (p.plan.kind === "skip" ? [`${p.row.name}: ${p.plan.reason}`] : []));
    console.log(`live: ${counts.all} recipes, ${rows.length} Hsca; ${planned.filter((p) => p.plan.kind === "clean").length} clean, ${repairs.length} to repair (${repairs.reduce((n, r) => n + r.plan.repairs.length, 0)} lines), ${skipped.length} skipped`);
    describe(repairs);
    for (const line of skipped) console.log(`  SKIP    ${line}`);

    const ctl = control(rows, index);
    const share = ctl.sameBasis / Math.max(1, ctl.rows);
    console.log(`control: elemental within ${BASIS_TOLERANCE} of the stored values on ${ctl.sameBasis}/${ctl.rows} rows (${(share * 100).toFixed(1)}%, floor ${BASIS_FLOOR * 100}%)`);
    if (!write) {
      console.log(`dry run: nothing written. Would repair ${repairs.length} rows.`);
      return;
    }
    if (share < BASIS_FLOOR) throw new Error("the computation is on another basis from the stored values: not writing");
    const ids = repairs.map((r) => r.row.id);
    const backup = option("backup");
    if (backup !== undefined) console.log(`backup: ${await writeBackup(client, backup, ids, host)} rows -> ${backup}`);
    const before = { counts, others: await checksumOthers(client, ids), skipped: skipped.length };
    for (const repair of repairs) await writeRepair(client, repair);
    const failures = await verify(client, repairs, before, ids, { sources, dishes });
    if (failures.length > 0) throw new Error(`verification failed, rolling back:\n  ${failures.join("\n  ")}`);
    if (!commit) {
      await client.query("ROLLBACK");
      console.log(`rehearsal passed: ${repairs.length} rows written, verified, and rolled back. Nothing is committed.`);
      return;
    }
    await client.query("COMMIT");
    console.log(`COMMITTED: ${repairs.length} rows repaired`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
