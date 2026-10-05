// scripts/repairHscaParsedLinesInDb.ts
/**
 * Repairs the live HSCA rows whose ingredient lines are what the importer's first parser made of
 * the archive's text: "¾ cup flour" as 1 piece named "¾ cup flour", "8-10 sheets rice paper" as 8
 * pieces of "-10 sheets rice paper", "Salt to taste" as the ingredient "salt to taste", and, before
 * #937, "4 Granny Smith apples" as 4 g of "ranny smith apples". The parser (scripts/lib/hscaDish.ts)
 * and hsca.ts were corrected; the rows in Postgres were not. The 33 rows with the #937 misread were
 * repaired on 2026-10-05 by a narrower first version of this script; this one covers every class.
 *
 *   DATABASE_PUBLIC_URL=... bun scripts/repairHscaParsedLinesInDb.ts --url-env=DATABASE_PUBLIC_URL
 *     dry run: reads, plans, prints, writes nothing (a READ ONLY transaction)
 *     ... --rehearse                                           does every write and check, then ROLLS BACK
 *     ... --commit --backup=<file> --confirm-host=<host:port>   the same, then COMMITs
 *
 * A stored line is replaced only when it is exactly what the frozen legacy parser made of its
 * source line, and it becomes what the corrected parser makes of it, which is the line hsca.ts
 * holds (lib/hscaParseRepair.ts). An edited line, or a row that fits no record, is reported and
 * left alone.
 *
 * Only what the repair changes is rewritten. The ingredient lines are. `elemental_properties` and
 * `alchemical_quantities` are rewritten only where today's code computes a different result from
 * the repaired names than from the old ones. `nutritional_profile` (column and read_model) is left
 * alone unless --nutrition is passed; then it is rewritten only where today's nutrition code computes
 * a different, substantiated total from the repaired lines than from the old ones, and it is never
 * cleared (today's code returns nothing for many rows on their old lines too, and clearing those is
 * a table-wide decision). It is opt-in because those totals divide by the placeholder 4 servings
 * every row carries, so a corrected line can move a total a long way (a dumpling recipe from 616 to
 * 1,489 kcal "a serving") without the total being any nearer the truth.
 *
 * It refuses to commit unless every repaired row reads back as intended with its method untouched,
 * the row counts and a checksum of every other row are unchanged, and a fresh plan over the rows
 * read back finds nothing left to repair.
 */
import { unifiedIngredients } from "../src/data/unified/ingredients";
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
import { choosePlan, legacyLiveIngredients, type RepairPlan } from "./lib/hscaParseRepair";

type Planned = { row: LiveRow; plan: RepairPlan };
type Repairing = {
  row: LiveRow;
  plan: Extract<RepairPlan, { kind: "repair" }>;
  readModel: ReadModel;
  nutritionalProfile: Record<string, unknown> | undefined;
  /** What the repaired lines would give; written only with --nutrition. */
  nutritionWould: Record<string, unknown> | undefined;
  elementalChanged: boolean;
  esmsChanged: boolean;
};

function sourceByName(source: readonly SourceRecipe[]): Map<string, SourceRecipe[]> {
  const byName = new Map<string, SourceRecipe[]>();
  for (const recipe of source) byName.set(nameOf(recipe).toLowerCase(), [...(byName.get(nameOf(recipe).toLowerCase()) ?? []), recipe]);
  return byName;
}

/**
 * Each source record is paired with its own legacy parse and its own corrected parse. The corrected
 * parse is what hsca.ts holds for the record (`bun scripts/syncHscaCuisine.ts --check` proves it).
 */
function planRows(rows: readonly LiveRow[], sources: Map<string, SourceRecipe[]>): Planned[] {
  return rows.map((row) => {
    const pairs = (sources.get(row.name.toLowerCase()) ?? []).map((recipe) => ({
      legacy: legacyLiveIngredients(recipe.ingredients),
      corrected: liveIngredients(recipe.ingredients),
    }));
    return { row, plan: choosePlan(row.read_model?.ingredients, pairs) };
  });
}

function repairing(planned: readonly Planned[], index: ElementalIndex, withNutrition: boolean): Repairing[] {
  return planned.flatMap(({ row, plan }) => {
    if (plan.kind !== "repair" || row.read_model === null) return [];
    const servings = typeof row.read_model.servings === "number" ? row.read_model.servings : row.servings;
    const was = computedFromIngredients(index, plan.before, servings);
    const now = computedFromIngredients(index, plan.ingredients, servings);
    const elementalChanged = canonical(was.elemental) !== canonical(now.elemental);
    const esmsChanged = canonical(was.alchemical) !== canonical(now.alchemical);
    const nutritionChanged = now.nutrition !== null && canonical(was.nutrition) !== canonical(now.nutrition);
    const readModel: ReadModel = { ...row.read_model, ingredients: plan.ingredients };
    if (esmsChanged) readModel.alchemical_quantities = now.alchemical;
    if (elementalChanged && now.elemental) readModel.elemental_properties = now.elemental;
    else if (elementalChanged) delete readModel.elemental_properties;
    const nutritionWould = nutritionChanged ? (now.nutrition ?? undefined) : undefined;
    if (withNutrition && nutritionWould !== undefined) readModel.nutritional_profile = nutritionWould;
    return [{ row, plan, readModel, nutritionalProfile: withNutrition ? nutritionWould : undefined, nutritionWould, elementalChanged, esmsChanged }];
  });
}

function calories(profile: unknown): string {
  if (profile !== null && typeof profile === "object" && "calories" in profile && typeof profile.calories === "number") return String(profile.calories);
  return "none";
}

function describe(repairs: readonly Repairing[], showLines: boolean): void {
  for (const { row, plan, elementalChanged, esmsChanged, nutritionalProfile, nutritionWould } of repairs) {
    const nutrition =
      nutritionWould === undefined
        ? false
        : `nutrition ${calories(row.nutritional_profile)} -> ${calories(nutritionWould)} kcal${nutritionalProfile === undefined ? " (not written)" : ""}`;
    const touched = [elementalChanged && "elemental", esmsChanged && "ESMS", nutrition].filter(Boolean).join(", ");
    console.log(`  REPAIR  ${row.id}  ${row.name}  (${plan.repairs.length} lines; also rewritten: ${touched || "nothing else"})`);
    if (!showLines) continue;
    for (const { index, from, to } of plan.repairs) {
      console.log(`      [${index}] ${from.amount} | ${from.unit} | ${from.name} | ${from.notes}   ->   ${to.amount} | ${to.unit} | ${to.name} | ${to.notes}`);
    }
  }
}

async function writeRepair(client: PgClient, repair: Repairing): Promise<void> {
  const { row } = repair;
  const res = await client.query(
    `UPDATE recipes SET read_model = $2::jsonb, nutritional_profile = coalesce($3::jsonb, nutritional_profile), updated_at = NOW()
      WHERE id = $1::uuid AND read_model::text = $4 AND instructions::text = $5`,
    [
      row.id,
      JSON.stringify(repair.readModel),
      repair.nutritionalProfile === undefined ? null : JSON.stringify(repair.nutritionalProfile),
      row.read_model_text,
      row.instructions_text,
    ],
  );
  if (res.rowCount !== 1) throw new Error(`repair of ${row.name} (${row.id}) changed ${String(res.rowCount)} rows: the row moved since it was read`);
}

/** Everything that must hold before the transaction may commit; returns the failures. */
async function verify(
  client: PgClient,
  repairs: readonly Repairing[],
  before: { counts: { all: number; hsca: number }; others: string; skipped: number },
  ids: readonly string[],
  sources: Map<string, SourceRecipe[]>,
): Promise<string[]> {
  const failures: string[] = [];
  const read = new Map((await readRowsById(client, ids)).map((r) => [r.id, r]));
  for (const { row, readModel, nutritionalProfile } of repairs) {
    const now = read.get(row.id);
    const wantedColumn = nutritionalProfile ?? row.nutritional_profile;
    if (now === undefined) failures.push(`${row.name}: row is gone`);
    else if (now.instructions_text !== row.instructions_text) failures.push(`${row.name}: method changed`);
    else if (canonical(now.nutritional_profile) !== canonical(wantedColumn)) failures.push(`${row.name}: nutritional_profile column not as intended`);
    else if (canonical(now.read_model) !== canonical(readModel)) failures.push(`${row.name}: read_model not as intended`);
  }
  const counts = await countRows(client);
  if (counts.all !== before.counts.all || counts.hsca !== before.counts.hsca) failures.push(`row counts moved: ${canonical(before.counts)} -> ${canonical(counts)}`);
  const others = await checksumOthers(client, ids);
  if (others !== before.others) failures.push(`other rows changed: checksum ${before.others} -> ${others}`);
  const after = planRows(await readHscaRows(client), sources);
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
  const index = buildElementalIndex(unifiedIngredients);
  console.log(`host ${host}; ${commit ? "COMMIT" : write ? "rehearsal (rolls back)" : "dry run"}`);

  const client = new Client({ connectionString: url, ssl: host.endsWith(".railway.internal") ? false : { rejectUnauthorized: false } });
  await client.connect();
  await client.query(`BEGIN ISOLATION LEVEL REPEATABLE READ${write ? "" : " READ ONLY"}`);
  try {
    const rows = await readHscaRows(client);
    const counts = await countRows(client);
    const planned = planRows(rows, sources);
    const repairs = repairing(planned, index, flag("nutrition"));
    const skipped = planned.flatMap((p) => (p.plan.kind === "skip" ? [`${p.row.name}: ${p.plan.reason}`] : []));
    const lineCount = repairs.reduce((n, r) => n + r.plan.repairs.length, 0);
    console.log(`live: ${counts.all} recipes, ${rows.length} Hsca; ${planned.filter((p) => p.plan.kind === "clean").length} clean, ${repairs.length} to repair (${lineCount} lines), ${skipped.length} skipped`);
    console.log(`also rewritten: elemental on ${repairs.filter((r) => r.elementalChanged).length} rows, ESMS on ${repairs.filter((r) => r.esmsChanged).length}, nutrition on ${repairs.filter((r) => r.nutritionalProfile !== undefined).length} (${repairs.filter((r) => r.nutritionWould !== undefined).length} would change; pass --nutrition to write them)`);
    describe(repairs, flag("lines"));
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
    const failures = await verify(client, repairs, before, ids, sources);
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
