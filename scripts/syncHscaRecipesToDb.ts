// scripts/syncHscaRecipesToDb.ts
/**
 * Brings the live HSCA rows of the Postgres `recipes` table in step with a change to
 * recipes_database.json (PR #939: 43 recipes corrected in place, 36 appended).
 *
 *   DATABASE_PUBLIC_URL=... bun scripts/syncHscaRecipesToDb.ts --base=<old recipes_database.json> \
 *     [--current=recipes_database.json] [--url-env=DATABASE_URL] [--phase=updates|inserts|both] \
 *     [--exclude=TITLE ...]                                   dry run: reads, plans, prints, writes nothing
 *     ... --rehearse                                          does every write and check, then ROLLS BACK
 *     ... --commit --backup=<file> --confirm-host=<host:port>  the same, then COMMITs
 *
 * The connection string comes from the environment only (named by --url-env); only its
 * host is ever printed. A dry run is a READ ONLY transaction, so it cannot write.
 *
 * A live row keeps its method twice (`instructions` and `read_model.instructions`) and its
 * ingredients only in `read_model.ingredients`, beside the computed `elemental_properties`
 * and `alchemical_quantities` (see lib/hscaDbSync.ts). What it refuses to do:
 *
 *   - touch a row unless BOTH stored copies of the method equal the OLD source method;
 *   - write at all unless the computation lands on the same basis as the stored computed fields
 *     of the existing rows: elemental shares within 0.10 per element on 95% of rows. This is a
 *     sanity bound, not a reproduction: the stored values were written at different times and are
 *     not bit-reproducible by any one engine state (ingredient data has moved since), so a new
 *     value is whatever the repo's backfill scripts compute today, which the copy in
 *     lib/hscaComputed.ts equals (checked 2026-10-04 on 538 ingredient lists, 0 differences);
 *   - commit unless every written row reads back as intended, the row counts moved by exactly
 *     the number inserted, and a checksum of every OTHER row is unchanged.
 *
 * A re-run after a commit finds every change "already applied" and every insert "already live".
 * To undo: the --backup file holds `to_jsonb(row)` for every updated row (delete the inserted
 * ids, which the commit output lists).
 */
import crypto from "node:crypto";
import { unifiedIngredients } from "../src/data/unified/ingredients";
import { buildElementalIndex, type ElementalIndex } from "./lib/hscaComputed";
import {
  BASIS_FLOOR,
  BASIS_TOLERANCE,
  checksumOthers,
  computedFor,
  control,
  countRows,
  flag,
  loadSource,
  option,
  optionsOf,
  readHscaRows,
  readRowsById,
  writeBackup,
  Client,
  type LiveRow,
  type PgClient,
} from "./lib/hscaDbIo";
import {
  buildInsert,
  buildUpdate,
  canonical,
  deriveDefaults,
  matchRow,
  nameOf,
  planChanges,
  type Change,
  type Defaults,
  type InsertRow,
  type RowUpdate,
  type SourceRecipe,
} from "./lib/hscaDbSync";

type Outcome =
  | { kind: "update"; change: Change; row: LiveRow; update: RowUpdate }
  | { kind: "applied"; change: Change; id: string }
  | { kind: "no-live-row"; change: Change }
  | { kind: "ambiguous"; change: Change; ids: string[] }
  | { kind: "skip"; change: Change; id: string; reason: string };

function alreadyApplied(rows: readonly LiveRow[], change: Change): LiveRow | undefined {
  const wanted = canonical(change.after.instructions);
  const name = nameOf(change.before).toLowerCase();
  return rows.find((r) => r.name.toLowerCase() === name && canonical(r.instructions) === wanted && canonical(r.read_model?.instructions) === wanted);
}

function classify(rows: readonly LiveRow[], change: Change, index: ElementalIndex): Outcome {
  const match = matchRow(rows, change);
  if (match.kind === "ambiguous") return { kind: "ambiguous", change, ids: match.ids };
  if (match.kind === "none") {
    const done = alreadyApplied(rows, change);
    return done ? { kind: "applied", change, id: done.id } : { kind: "no-live-row", change };
  }
  const row = rows.find((r) => r.id === match.row.id);
  if (row === undefined) throw new Error(`matched row ${match.row.id} is not among the rows read`);
  const servings = typeof row.read_model?.servings === "number" ? row.read_model.servings : row.servings;
  const computed = change.ingredientsChanged ? computedFor(index, change.after.ingredients, servings) : null;
  const built = buildUpdate(row, change, computed);
  return built.kind === "update" ? { kind: "update", change, row, update: built.update } : { kind: "skip", change, id: row.id, reason: built.reason };
}

interface InsertPlan {
  inserts: InsertRow[];
  alreadyLive: string[];
}

function planInserts(rows: readonly LiveRow[], appended: readonly SourceRecipe[], defaults: Defaults, index: ElementalIndex): InsertPlan {
  const live = new Set(rows.map((r) => r.name.toLowerCase()));
  const plan: InsertPlan = { inserts: [], alreadyLive: [] };
  for (const recipe of appended) {
    const name = nameOf(recipe);
    if (live.has(name.toLowerCase())) {
      plan.alreadyLive.push(name);
      continue;
    }
    live.add(name.toLowerCase());
    const computed = computedFor(index, recipe.ingredients, defaults.servings);
    plan.inserts.push(buildInsert(recipe, defaults, computed, crypto.randomUUID()));
  }
  return plan;
}

async function writeUpdate(client: PgClient, row: LiveRow, update: RowUpdate): Promise<void> {
  const res = await client.query(
    `UPDATE recipes SET instructions = $2::jsonb, read_model = $3::jsonb,
                        nutritional_profile = coalesce($6::jsonb, nutritional_profile), updated_at = NOW()
      WHERE id = $1::uuid AND instructions::text = $4 AND read_model::text = $5`,
    [
      update.id,
      JSON.stringify(update.instructions),
      JSON.stringify(update.readModel),
      row.instructions_text,
      row.read_model_text,
      update.nutritionalProfile === undefined ? null : JSON.stringify(update.nutritionalProfile),
    ],
  );
  if (res.rowCount !== 1) throw new Error(`update of ${row.name} (${row.id}) changed ${String(res.rowCount)} rows: the row moved since it was read`);
}

async function writeInsert(client: PgClient, insert: InsertRow): Promise<void> {
  const res = await client.query(
    `INSERT INTO recipes (id, name, cuisine, category, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty_level, nutritional_profile, read_model)
     VALUES ($1::uuid, $2, 'Hsca'::cuisine_type, $3, $4::jsonb, $5, $6, $7, $8, $9::jsonb, $10::jsonb)`,
    [
      insert.id,
      insert.name,
      insert.category,
      JSON.stringify(insert.instructions),
      insert.prep,
      insert.cook,
      insert.servings,
      insert.difficulty,
      JSON.stringify(insert.nutritionalProfile),
      JSON.stringify(insert.readModel),
    ],
  );
  if (res.rowCount !== 1) throw new Error(`insert of ${insert.name} wrote ${String(res.rowCount)} rows`);
}

/** Everything that must hold before the transaction may commit; returns the failures. */
async function verify(
  client: PgClient,
  updates: readonly Extract<Outcome, { kind: "update" }>[],
  inserts: readonly InsertRow[],
  before: { counts: { all: number; hsca: number }; others: string },
  affectedIds: readonly string[],
): Promise<string[]> {
  const failures: string[] = [];
  const read = new Map((await readRowsById(client, affectedIds)).map((r) => [r.id, r]));
  for (const { row, update } of updates) {
    const now = read.get(update.id);
    if (now === undefined) failures.push(`${row.name}: row is gone`);
    else if (canonical(now.instructions) !== canonical(update.instructions)) failures.push(`${row.name}: instructions column not as intended`);
    else if (canonical(now.read_model) !== canonical(update.readModel)) failures.push(`${row.name}: read_model not as intended`);
    else if (update.nutritionalProfile !== undefined && canonical(now.nutritional_profile) !== canonical(update.nutritionalProfile)) {
      failures.push(`${row.name}: nutritional_profile column not as intended`);
    }
  }
  for (const insert of inserts) {
    const now = read.get(insert.id);
    if (now === undefined) failures.push(`${insert.name}: inserted row is missing`);
    else if (canonical(now.instructions) !== canonical(insert.instructions)) failures.push(`${insert.name}: instructions column not as intended`);
    else if (canonical(now.read_model) !== canonical(insert.readModel)) failures.push(`${insert.name}: read_model not as intended`);
    else if (canonical(now.nutritional_profile) !== canonical(insert.nutritionalProfile)) failures.push(`${insert.name}: nutritional_profile column not as intended`);
  }
  const counts = await countRows(client);
  if (counts.all !== before.counts.all + inserts.length) failures.push(`recipes rows ${before.counts.all} -> ${counts.all}, expected +${inserts.length}`);
  if (counts.hsca !== before.counts.hsca + inserts.length) failures.push(`Hsca rows ${before.counts.hsca} -> ${counts.hsca}, expected +${inserts.length}`);
  const others = await checksumOthers(client, affectedIds);
  if (others !== before.others) failures.push(`other rows changed: checksum ${before.others} -> ${others}`);
  return failures;
}

function describe(outcomes: readonly Outcome[]): void {
  for (const o of outcomes) {
    const lines = `${o.change.before.instructions.length}->${o.change.after.instructions.length} lines`;
    if (o.kind === "update") console.log(`  UPDATE  ${o.row.id}  ${o.change.title}  (${lines}${o.update.ingredientsRewritten ? `, ingredients + computed fields rewritten; nutrition ${o.row.read_model?.nutritional_profile ? "was present" : "was none"}, now ${Object.keys(o.update.nutritionalProfile ?? {}).length > 0 ? "recomputed" : "empty"}` : ""})`);
    else if (o.kind === "applied") console.log(`  applied ${o.id}  ${o.change.title}  (already has the new method)`);
    else if (o.kind === "no-live-row") console.log(`  no row  ${o.change.title}  (no live row carries the old method: a duplicate-titled source record, or edited)`);
    else if (o.kind === "ambiguous") console.log(`  AMBIG   ${o.change.title}  ${o.ids.join(", ")}`);
    else console.log(`  SKIP    ${o.id}  ${o.change.title}  ${o.reason}`);
  }
}

async function main(): Promise<void> {
  const basePath = option("base");
  if (basePath === undefined) throw new Error("--base=<the recipes_database.json before the change> is required");
  const commit = flag("commit");
  const write = commit || flag("rehearse");
  const phase = option("phase") ?? "both";
  if (!["updates", "inserts", "both"].includes(phase)) throw new Error(`--phase must be updates, inserts or both, not ${phase}`);
  const excluded = new Set(optionsOf("exclude").map((t) => t.toLowerCase()));
  const urlEnv = option("url-env") ?? "DATABASE_URL";
  const url = process.env[urlEnv];
  if (!url) throw new Error(`${urlEnv} is not set in the environment`);
  const host = new URL(url).host;

  const plan = planChanges(loadSource(basePath), loadSource(option("current") ?? "recipes_database.json"));
  const wantUpdates = phase !== "inserts";
  const wantInserts = phase !== "updates";
  const changes = plan.changed.filter((c) => !excluded.has(c.title.toLowerCase()));
  const appended = plan.appended.filter((r) => !excluded.has(nameOf(r).toLowerCase()));
  console.log(`source: ${plan.changed.length} changed, ${plan.appended.length} appended (${excluded.size} titles excluded); host ${host}; ${commit ? "COMMIT" : write ? "rehearsal (rolls back)" : "dry run"}; phase ${phase}`);
  if (commit && (option("backup") === undefined || option("confirm-host") !== host)) {
    throw new Error("--commit needs --backup=<file> and --confirm-host=<the host printed above>");
  }

  const index = buildElementalIndex(unifiedIngredients);
  const client = new Client({ connectionString: url, ssl: host.endsWith(".railway.internal") ? false : { rejectUnauthorized: false } });
  await client.connect();
  await client.query(`BEGIN ISOLATION LEVEL REPEATABLE READ${write ? "" : " READ ONLY"}`);
  try {
    const rows = await readHscaRows(client);
    const counts = await countRows(client);
    console.log(`live: ${counts.all} recipes, ${rows.length} Hsca`);

    const ctl = control(rows, index);
    const share = ctl.sameBasis / Math.max(1, ctl.rows);
    console.log(`control: ${ctl.rows} rows with ingredients; stored values reproduced exactly: elemental ${ctl.elemental}, ESMS ${ctl.alchemical}; elemental within ${BASIS_TOLERANCE} on ${ctl.sameBasis} (${(share * 100).toFixed(1)}%, floor ${BASIS_FLOOR * 100}%)`);

    const outcomes = wantUpdates ? changes.map((c) => classify(rows, c, index)) : [];
    const tally = (kind: Outcome["kind"]): number => outcomes.filter((o) => o.kind === kind).length;
    console.log(`changes: ${tally("update")} to update, ${tally("applied")} already applied, ${tally("no-live-row")} with no live row, ${tally("ambiguous")} ambiguous, ${tally("skip")} skipped`);
    describe(outcomes);

    let inserts: InsertRow[] = [];
    if (wantInserts) {
      const defaults = deriveDefaults(rows);
      console.log(`defaults for new rows: ${JSON.stringify(defaults)}`);
      const insertPlan = planInserts(rows, appended, defaults, index);
      inserts = insertPlan.inserts;
      console.log(`inserts: ${inserts.length} new rows, ${insertPlan.alreadyLive.length} already live`);
      for (const i of inserts) console.log(`  INSERT  ${i.id}  ${i.name}  (${i.instructions.length} method lines, ${i.readModel.elemental_properties ? "elemental ok" : "NO elemental match"}, nutrition ${Object.keys(i.nutritionalProfile).length > 0 ? "computed" : "empty"})`);
      for (const name of insertPlan.alreadyLive) console.log(`  live    ${name}`);
    }

    const updates = outcomes.flatMap((o) => (o.kind === "update" ? [o] : []));
    const blocked = outcomes.filter((o) => o.kind === "ambiguous" || o.kind === "skip");
    if (!write) {
      console.log(`dry run: nothing written. Would update ${updates.length}, insert ${inserts.length}.`);
      return;
    }
    if (share < BASIS_FLOOR) throw new Error(`only ${(share * 100).toFixed(1)}% of rows have elemental shares within ${BASIS_TOLERANCE} of the stored ones, below ${BASIS_FLOOR * 100}%: the computation is on another basis, not writing`);
    if (blocked.length > 0) throw new Error(`${blocked.length} changes are ambiguous or skipped: resolve them or --exclude their titles`);

    const updateIds = updates.map((u) => u.update.id);
    const affectedIds = [...updateIds, ...inserts.map((i) => i.id)];
    const backup = option("backup");
    if (backup !== undefined) console.log(`backup: ${await writeBackup(client, backup, updateIds, host)} rows -> ${backup}`);
    const before = { counts, others: await checksumOthers(client, affectedIds) };

    for (const u of updates) await writeUpdate(client, u.row, u.update);
    for (const i of inserts) await writeInsert(client, i);
    const failures = await verify(client, updates, inserts, before, affectedIds);
    if (failures.length > 0) throw new Error(`verification failed, rolling back:\n  ${failures.join("\n  ")}`);
    if (!commit) {
      await client.query("ROLLBACK");
      console.log(`rehearsal passed: ${updates.length} updates and ${inserts.length} inserts written, verified, and rolled back. Nothing is committed.`);
      return;
    }
    await client.query("COMMIT");
    console.log(`COMMITTED: ${updates.length} rows updated, ${inserts.length} inserted`);
    console.log(`inserted ids: ${inserts.map((i) => i.id).join(" ")}`);
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
