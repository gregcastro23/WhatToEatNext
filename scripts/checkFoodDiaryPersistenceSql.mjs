// Behaviour of the food_diary_entries statements against a real PostgreSQL, in
// a transaction that is ALWAYS rolled back.
//
// ── Why this exists ─────────────────────────────────────────────────────────
//
// `[MEASURED 2026-09-28, prod, read-only]` food_diary_entries held 0 rows.
// Since 04e9fa72 (2026-04-30) createEntry bound `entry_<ms>_<random>` to the
// UUID `id` column, every insert failed, and the service kept the entry in one
// server instance's memory while answering 200. Its mocked tests never ran the
// statement. The `saturated_fat` and `potassium` columns were never written,
// and the `food_source` enum lacked two values the app logs.
//
// ── What this proves ────────────────────────────────────────────────────────
//
//   1. An entry built as createEntry builds it inserts, and reads back with the
//      potassium and saturated fat it carried; a value it lacked reads back
//      absent, not 0.
//   2. An update writes potassium and saturated fat.
//   3. A delete removes the owner's row and nobody else's.
//   4. Every value in FOOD_SOURCES is storable: inserted, where the live enum has
//      it, and otherwise added by migration 89 (applied inside the rolled-back
//      transaction; PostgreSQL forbids using an enum value added in the same
//      transaction, so those inserts are proven once the migration is live).
//   5. Controls: each check re-runs against a mutant restoring the old
//      behaviour, and must fail. A check that cannot fail proves nothing.
//
// The statements are IMPORTED from `src/services/foodDiaryQueries.ts` (type
// imports only), so this runs exactly what ships.
//
//   railway run --service Postgres -- bun scripts/checkFoodDiaryPersistenceSql.mjs
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";
import {
  DELETE_ENTRY_SQL,
  INSERT_ENTRY_SQL,
  UPDATE_ENTRY_SQL,
  insertEntryParams,
  newEntryId,
  rowNutrition,
  updateEntryParams,
} from "../src/services/foodDiaryQueries.ts";
import { FOOD_SOURCES } from "../src/types/foodSource.ts";

const MIGRATION = readFileSync(new URL("../database/init/89-food-source-restaurant-search.sql", import.meta.url), "utf8");

const c = new pg.Client({ connectionString: process.env.DATABASE_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let bad = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const no = (m) => {
  console.error(`  FAIL ${m}`);
  bad++;
};

/** The statement and parameters before this change: 35 columns, no saturated_fat / potassium. */
const OLD_INSERT_SQL = INSERT_ENTRY_SQL.replace("sugar, sodium, saturated_fat, potassium,", "sugar, sodium,")
  .replace(/,\s*\$36, \$37\n/, "\n");
const oldInsertParams = (entry) => insertEntryParams(entry).filter((_, i) => i !== 21 && i !== 22);
const OLD_UPDATE_SQL = UPDATE_ENTRY_SQL.replace(" saturated_fat = $13, potassium = $14,", "")
  .replace(/\$(\d+)/g, (m, n) => (Number(n) > 14 ? `$${Number(n) - 2}` : m));
const oldUpdateParams = (entry) => updateEntryParams(entry).filter((_, i) => i !== 12 && i !== 13);
const MUTANTS = {
  oldId: () => `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  nullAsZero: (row) => ({ ...rowNutrition(row), sugar: Number(row.sugar ?? 0) }),
  deleteIgnoresOwner: DELETE_ENTRY_SQL.replace("AND user_id = $2", "AND $2::uuid IS NOT NULL"),
};

async function mkUser() {
  const id = randomUUID();
  await c.query(
    `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, is_agent,
                        name, profile, preferences, login_count, created_at, updated_at)
     VALUES ($1,$2,'NO_LOGIN','USER'::user_role,true,true,false,'probe','{}'::jsonb,'{}'::jsonb,0,
             clock_timestamp(), clock_timestamp())`,
    [id, `fdp-${id}@example.invalid`],
  );
  return id;
}

function entry(userId, overrides = {}) {
  const now = new Date();
  return {
    id: newEntryId(), userId, foodName: "probe orange", foodSource: "quick", sourceId: "orange",
    date: new Date("2099-01-04"), mealType: "breakfast", time: "08:30",
    serving: { amount: 1, unit: "piece", grams: 131, description: "1 medium" }, quantity: 1,
    // No sugar and no sodium: they must read back absent.
    nutrition: { calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, potassium: 237, saturatedFat: 0.02 },
    nutritionConfidence: "high", isFavorite: false, tags: [], createdAt: now, updatedAt: now,
    ...overrides,
  };
}

let savepoints = 0;
/** Run `body` and undo it. Each savepoint is named apart, so nesting unwinds correctly. */
async function inSavepoint(body) {
  const name = `probe_${++savepoints}`;
  await c.query(`SAVEPOINT ${name}`);
  try {
    return await body();
  } finally {
    await c.query(`ROLLBACK TO SAVEPOINT ${name}`);
  }
}

const readBack = async (id, mapRow = rowNutrition) => {
  const { rows } = await c.query("SELECT * FROM food_diary_entries WHERE id = $1", [id]);
  return rows[0] ? mapRow(rows[0]) : undefined;
};

/** Check 1 over (sql, params, mapRow). Returns the failures it saw. */
async function roundTrip(userId, { makeId = newEntryId, sql = INSERT_ENTRY_SQL, params = insertEntryParams, mapRow } = {}) {
  const e = entry(userId, { id: makeId() });
  const failures = [];
  try {
    await c.query(sql, params(e));
  } catch (err) {
    return [`insert failed: ${err.message}`];
  }
  const n = await readBack(e.id, mapRow);
  if (n?.potassium !== 237) failures.push(`potassium read back ${n?.potassium}`);
  if (n?.saturatedFat !== 0.02) failures.push(`saturated fat read back ${n?.saturatedFat}`);
  if (n?.sugar !== undefined || n?.sodium !== undefined) failures.push(`absent sugar/sodium read back ${n?.sugar}/${n?.sodium}`);
  return failures;
}

/** Check 2: an update writes potassium. */
async function updates(userId, sql = UPDATE_ENTRY_SQL, params = updateEntryParams) {
  const e = entry(userId);
  await c.query(INSERT_ENTRY_SQL, insertEntryParams(e));
  const updated = { ...e, nutrition: { ...e.nutrition, potassium: 300 }, updatedAt: new Date() };
  try {
    await c.query(sql, params(updated));
  } catch (err) {
    return [`update failed: ${err.message}`];
  }
  const n = await readBack(e.id);
  return n?.potassium === 300 ? [] : [`potassium after update ${n?.potassium}`];
}

/** Check 3: only the owner's delete removes the row. */
async function deletes(userId, otherId, sql = DELETE_ENTRY_SQL) {
  const e = entry(userId);
  await c.query(INSERT_ENTRY_SQL, insertEntryParams(e));
  const byOther = await c.query(sql, [e.id, otherId]);
  const byOwner = await c.query(sql, [e.id, userId]);
  const failures = [];
  if (byOther.rowCount !== 0) failures.push(`another user's delete removed ${byOther.rowCount} row(s)`);
  if (byOwner.rowCount !== 1 && byOther.rowCount === 0) failures.push(`the owner's delete removed ${byOwner.rowCount}`);
  return failures;
}

// From the catalog: enum_range() would "use" a value added in this transaction,
// which PostgreSQL refuses until it is committed.
const liveLabels = async () =>
  (await c.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'food_source'::regtype")).rows.map((r) => r.enumlabel);

/** Check 4: every source inserts, or migration 89 adds it. */
async function sourcesStorable(userId, sources = FOOD_SOURCES) {
  const live = new Set(await liveLabels());
  const failures = [];
  for (const source of sources.filter((s) => live.has(s))) {
    await inSavepoint(async () => {
      try {
        await c.query(INSERT_ENTRY_SQL, insertEntryParams(entry(userId, { foodSource: source })));
      } catch (err) {
        failures.push(`${source}: ${err.message}`);
      }
    });
  }
  const missing = sources.filter((s) => !live.has(s));
  if (missing.length > 0) {
    const added = await inSavepoint(async () => {
      await c.query(MIGRATION);
      return new Set(await liveLabels());
    });
    for (const source of missing) if (!added.has(source)) failures.push(`${source}: not in the enum, and migration 89 does not add it`);
    const byMigration = missing.filter((s) => added.has(s));
    if (byMigration.length > 0) console.log(`  ..   ${byMigration.join(", ")}: added by migration 89 (inserts proven once it is live)`);
  }
  return failures;
}

/** Run the shipped check, then its mutant, which must fail. */
async function check(name, shipped, mutant) {
  const failures = await inSavepoint(shipped);
  if (failures.length === 0) ok(name);
  else no(`${name}: ${failures.join("; ")}`);
  const caught = await inSavepoint(mutant);
  if (caught.length > 0) ok(`control fails as it must (${caught[0]})`);
  else no(`control for "${name}" passed: the check cannot fail`);
}

try {
  await c.query("BEGIN");
  const userId = await mkUser();
  const otherId = await mkUser();
  console.log("food diary statements against PostgreSQL (rolled back):");
  await check("an entry inserts and reads back what it carried, absent as absent",
    () => roundTrip(userId), () => roundTrip(userId, { makeId: MUTANTS.oldId }));
  await check("potassium and saturated fat are written", () => roundTrip(userId),
    () => roundTrip(userId, { sql: OLD_INSERT_SQL, params: oldInsertParams }));
  await check("a column the entry lacked reads back absent, not 0", () => roundTrip(userId),
    () => roundTrip(userId, { mapRow: MUTANTS.nullAsZero }));
  await check("an update writes potassium", () => updates(userId),
    () => updates(userId, OLD_UPDATE_SQL, oldUpdateParams));
  await check("a delete removes only the owner's row", () => deletes(userId, otherId),
    () => deletes(userId, otherId, MUTANTS.deleteIgnoresOwner));
  await check("every food source is storable", () => sourcesStorable(userId),
    () => sourcesStorable(userId, [...FOOD_SOURCES, "delivery"]));
} finally {
  await c.query("ROLLBACK");
  await c.end();
}

if (bad > 0) {
  console.error(`\n${bad} check(s) failed.`);
  process.exit(1);
}
console.log("\nall food diary statement checks passed (rolled back).");
