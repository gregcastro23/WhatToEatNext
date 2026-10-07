// scripts/repairHscaServingsInDb.ts
/**
 * Gives the live HSCA rows the servings their recipes state, and carries the stored per-serving
 * nutrition with them. Every row was written with 4 servings; the source says "6-8 servings",
 * "Serves 8", "2 cups (8 servings)" for 174 recipes (lib/hscaYield.ts), and says nothing about
 * servings for the rest, which keep the placeholder.
 *
 *   DATABASE_PUBLIC_URL=... bun scripts/repairHscaServingsInDb.ts --url-env=DATABASE_PUBLIC_URL
 *     dry run: reads, plans, prints, writes nothing (a READ ONLY transaction)
 *     ... --rehearse                                           does every write and check, then ROLLS BACK
 *     ... --commit --backup=<file> --confirm-host=<host:port>   the same, then COMMITs
 *
 * A row is matched to its source record by its stored ingredients AND its stored method both being
 * exactly that record's, so a duplicate-titled recipe, or a row someone edited, is not guessed at.
 * It is changed only while it still carries the placeholder 4 in `servings` and in
 * `read_model.servings`. `servings` (both places) becomes the stated number and every stored
 * per-serving nutrition value (column and read_model) is multiplied by 4 / servings: exact, no
 * engine, nothing cleared or invented (lib/hscaServingsRepair.ts).
 *
 * It refuses to commit unless every changed row reads back as intended with its method untouched,
 * row counts and a checksum of every other row are unchanged, and a fresh plan finds nothing left.
 */
import {
  Client,
  checksumOthers,
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
import { canonical, liveIngredients, nameOf, type SourceRecipe } from "./lib/hscaDbSync";
import { planServings, readModelWithServings, scaleProfile, type ServingsPlan } from "./lib/hscaServingsRepair";
import { servingsFromYield } from "./lib/hscaYield";

type Planned = { row: LiveRow; plan: ServingsPlan; fits: number };
type Repairing = {
  row: LiveRow;
  from: number;
  to: number;
  readModel: Record<string, unknown>;
  nutritionalProfile: unknown;
};

function sourceByName(source: readonly SourceRecipe[]): Map<string, SourceRecipe[]> {
  const byName = new Map<string, SourceRecipe[]>();
  for (const recipe of source) byName.set(nameOf(recipe).toLowerCase(), [...(byName.get(nameOf(recipe).toLowerCase()) ?? []), recipe]);
  return byName;
}

/** The record a row was imported from: its ingredients and its method are both exactly the record's. */
function fitsRecord(row: LiveRow, recipe: SourceRecipe): boolean {
  return (
    canonical(row.read_model?.ingredients) === canonical(liveIngredients(recipe.ingredients)) &&
    canonical(row.read_model?.instructions) === canonical(recipe.instructions) &&
    canonical(row.instructions) === canonical(recipe.instructions)
  );
}

function planRows(rows: readonly LiveRow[], sources: Map<string, SourceRecipe[]>): Planned[] {
  return rows.map((row) => {
    const fitting = (sources.get(row.name.toLowerCase()) ?? []).filter((recipe) => fitsRecord(row, recipe));
    const plan = fitting.length === 0 ? { kind: "skip" as const, reason: "no source record has this row's ingredients and method" } : planServings({ servings: row.servings, readModel: row.read_model }, fitting.map((r) => servingsFromYield(r.yield_amount)));
    return { row, plan, fits: fitting.length };
  });
}

function repairing(planned: readonly Planned[]): Repairing[] {
  return planned.flatMap(({ row, plan }) => {
    if (plan.kind !== "repair" || row.read_model === null) return [];
    const readModel = readModelWithServings(row.read_model, plan.from, plan.to);
    return [{ row, from: plan.from, to: plan.to, readModel, nutritionalProfile: scaleProfile(row.nutritional_profile, plan.from / plan.to) }];
  });
}

function calories(profile: unknown): string {
  if (profile !== null && typeof profile === "object" && "calories" in profile && typeof profile.calories === "number") return String(profile.calories);
  return "none";
}

async function writeRepair(client: PgClient, repair: Repairing): Promise<void> {
  const { row } = repair;
  const res = await client.query(
    `UPDATE recipes SET servings = $2, read_model = $3::jsonb, nutritional_profile = $4::jsonb, updated_at = NOW()
      WHERE id = $1::uuid AND servings = $7 AND read_model::text = $5 AND instructions::text = $6`,
    [row.id, repair.to, JSON.stringify(repair.readModel), JSON.stringify(repair.nutritionalProfile), row.read_model_text, row.instructions_text, repair.from],
  );
  if (res.rowCount !== 1) throw new Error(`servings of ${row.name} (${row.id}) changed ${String(res.rowCount)} rows: the row moved since it was read`);
}

/** Everything that must hold before the transaction may commit; returns the failures. */
async function verify(
  client: PgClient,
  repairs: readonly Repairing[],
  before: { counts: { all: number; hsca: number }; others: string },
  ids: readonly string[],
  sources: Map<string, SourceRecipe[]>,
): Promise<string[]> {
  const failures: string[] = [];
  const read = new Map((await readRowsById(client, ids)).map((r) => [r.id, r]));
  for (const { row, to, readModel, nutritionalProfile } of repairs) {
    const now = read.get(row.id);
    if (now === undefined) failures.push(`${row.name}: row is gone`);
    else if (now.servings !== to) failures.push(`${row.name}: servings column is ${now.servings}, expected ${to}`);
    else if (now.instructions_text !== row.instructions_text) failures.push(`${row.name}: method changed`);
    else if (canonical(now.nutritional_profile) !== canonical(nutritionalProfile)) failures.push(`${row.name}: nutritional_profile column not as intended`);
    else if (canonical(now.read_model) !== canonical(readModel)) failures.push(`${row.name}: read_model not as intended`);
  }
  const counts = await countRows(client);
  if (counts.all !== before.counts.all || counts.hsca !== before.counts.hsca) failures.push(`row counts moved: ${canonical(before.counts)} -> ${canonical(counts)}`);
  const others = await checksumOthers(client, ids);
  if (others !== before.others) failures.push(`other rows changed: checksum ${before.others} -> ${others}`);
  const left = planRows(await readHscaRows(client), sources).filter((p) => p.plan.kind === "repair").length;
  if (left > 0) failures.push(`${left} rows still need their servings after the writes`);
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
  console.log(`host ${host}; ${commit ? "COMMIT" : write ? "rehearsal (rolls back)" : "dry run"}`);

  const client = new Client({ connectionString: url, ssl: host.endsWith(".railway.internal") ? false : { rejectUnauthorized: false } });
  await client.connect();
  await client.query(`BEGIN ISOLATION LEVEL REPEATABLE READ${write ? "" : " READ ONLY"}`);
  try {
    const rows = await readHscaRows(client);
    const counts = await countRows(client);
    const planned = planRows(rows, sources);
    const repairs = repairing(planned);
    const tally = (kind: ServingsPlan["kind"]): number => planned.filter((p) => p.plan.kind === kind).length;
    console.log(`live: ${counts.all} recipes, ${rows.length} Hsca; ${tally("clean")} already right, ${tally("none")} state no servings (keep the placeholder), ${repairs.length} to change, ${tally("skip")} not matched or not the placeholder`);
    const byServings = new Map<number, number>();
    for (const r of repairs) byServings.set(r.to, (byServings.get(r.to) ?? 0) + 1);
    console.log(`new servings: ${[...byServings].sort((a, b) => a[0] - b[0]).map(([n, k]) => `${n} x${k}`).join(", ")}`);
    console.log(`stored nutrition rescaled on ${repairs.filter((r) => canonical(r.nutritionalProfile) !== canonical(r.row.nutritional_profile)).length} of those rows`);
    if (flag("rows")) {
      for (const r of repairs) console.log(`  ${r.row.id}  ${r.row.name}  ${r.from} -> ${r.to} servings; kcal ${calories(r.row.nutritional_profile)} -> ${calories(r.nutritionalProfile)}`);
    }
    for (const p of planned) if (p.plan.kind === "skip") console.log(`  SKIP  ${p.row.name}: ${p.plan.reason}`);
    if (!write) {
      console.log(`dry run: nothing written. Would change ${repairs.length} rows.`);
      return;
    }
    const ids = repairs.map((r) => r.row.id);
    const backup = option("backup");
    if (backup !== undefined) console.log(`backup: ${await writeBackup(client, backup, ids, host)} rows -> ${backup}`);
    const before = { counts, others: await checksumOthers(client, ids) };
    for (const repair of repairs) await writeRepair(client, repair);
    const failures = await verify(client, repairs, before, ids, sources);
    if (failures.length > 0) throw new Error(`verification failed, rolling back:\n  ${failures.join("\n  ")}`);
    if (!commit) {
      await client.query("ROLLBACK");
      console.log(`rehearsal passed: ${repairs.length} rows written, verified, and rolled back. Nothing is committed.`);
      return;
    }
    await client.query("COMMIT");
    console.log(`COMMITTED: ${repairs.length} rows changed`);
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
