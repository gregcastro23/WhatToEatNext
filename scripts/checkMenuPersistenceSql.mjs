// Behaviour of the weekly_menus statements against a real PostgreSQL, in a
// transaction that is ALWAYS rolled back.
//
// ── Why this exists ─────────────────────────────────────────────────────────
//
// `weekly_menus.nutritional_totals` never held totals.
// `[MEASURED 2026-09-27, prod, read-only]`:
//   - 36 human menus stored createInitialMenu's seven all-zero days, 34 of them
//     on days that had meals;
//   - 27 agent menus stored ASOL's flat, model-estimated
//     {calories, protein, carbs, fat}, with no stated basis.
// Nothing read either. Owner ruling 2026-09-27 (option a): write `{}`, never
// read it, no migration. Each row is overwritten on its next save.
//
// ── What this proves ────────────────────────────────────────────────────────
//
//   1. Every shipped statement runs: parse, parameter types, columns.
//   2. A save stores `{}` on the insert path, on a template, and on the
//      conflict path over BOTH pre-ruling shapes ("replaced on next save").
//   3. No statement returns `nutritional_totals`.
//   4. Controls: each check is re-run against a mutant that restores the
//      pre-ruling behaviour, and must fail. A check that cannot fail proves
//      nothing.
//
// The statements are IMPORTED from `src/services/menuPersistenceQueries.ts`
// (no runtime imports), so this runs exactly what ships.
//
//   railway run --service Postgres -- bun scripts/checkMenuPersistenceSql.mjs
//   DATABASE_PUBLIC_URL="$PROD_URL" bun scripts/checkMenuPersistenceSql.mjs
import { randomUUID } from "node:crypto";
import pg from "pg";
import {
  INSERT_TEMPLATE_SQL,
  SELECT_MENU_SQL,
  SELECT_TEMPLATES_SQL,
  UPSERT_MENU_SQL,
} from "../src/services/menuPersistenceQueries.ts";

const c = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

let bad = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const no = (m) => {
  console.error(`  FAIL ${m}`);
  bad++;
};

// Weeks far in the future, so nothing here can meet a real row's
// UNIQUE (user_id, week_start_date) — and the user is synthetic anyway.
const WEEK = { placeholder: "2099-01-04", agent: "2099-01-11", fresh: "2099-01-18", template: "2099-01-25" };

const ZERO_DAY = {
  calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0,
  gregsEnergy: 0, monicaConstant: 0, kalchm: 0,
  elementalBalance: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
};
/** What the planner wrote before the ruling: seven all-zero days. */
const PLACEHOLDER = JSON.stringify(Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [d, ZERO_DAY])));
/** What ASOL's agents wrote before the ruling: one flat, model-estimated object. */
const AGENT_ESTIMATE = JSON.stringify({ calories: 2100, protein: 90, carbs: 250, fat: 70 });

const MUTANTS = {
  conflictKeepsStoredValue: UPSERT_MENU_SQL.replace(/\n\s*nutritional_totals = '\{\}'::jsonb,/, ""),
  insertWritesPlaceholder: UPSERT_MENU_SQL.replace("$3::jsonb, '{}'::jsonb,", `$3::jsonb, '${PLACEHOLDER}'::jsonb,`),
  readReturnsColumn: SELECT_MENU_SQL.replace("SELECT id,", "SELECT id, nutritional_totals,"),
};

/** Same insert the other rolled-back gates use for a synthetic user. */
async function mkUser() {
  const id = randomUUID();
  await c.query(
    `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, is_agent,
                        name, profile, preferences, login_count, created_at, updated_at)
     VALUES ($1,$2,'NO_LOGIN','USER'::user_role,true,true,false,'probe','{}'::jsonb,'{}'::jsonb,0,
             clock_timestamp(), clock_timestamp())`,
    [id, `mps-${id}@example.invalid`],
  );
  return id;
}

/** A row as it stood before the ruling, written without the shipped statements. */
async function seed(userId, week, totalsJson) {
  await c.query(
    `INSERT INTO weekly_menus (user_id, week_start_date, meals, nutritional_totals, grocery_list)
     VALUES ($1, $2, '[]'::jsonb, $3::jsonb, '[]'::jsonb)`,
    [userId, week, totalsJson],
  );
}

const upsertParams = (userId, week) => [userId, week, "[]", "[]", "[]", null];

async function storedTotals(userId, week) {
  const { rows } = await c.query(
    "SELECT nutritional_totals FROM weekly_menus WHERE user_id = $1 AND week_start_date = $2",
    [userId, week],
  );
  return rows[0]?.nutritional_totals;
}

const isEmptyObject = (v) => v !== null && typeof v === "object" && Object.keys(v).length === 0;
const returnsColumn = (result) => result.fields.some((f) => f.name === "nutritional_totals");

/** Run `body` inside a savepoint and undo it, so a mutant cannot disturb later checks. */
async function inSavepoint(body) {
  await c.query("SAVEPOINT mutant");
  try {
    return await body();
  } finally {
    await c.query("ROLLBACK TO SAVEPOINT mutant");
  }
}

async function checkShipped(userId) {
  const conflict = await c.query(UPSERT_MENU_SQL, upsertParams(userId, WEEK.placeholder));
  if (isEmptyObject(await storedTotals(userId, WEEK.placeholder))) ok("a save over the seven-zero-day placeholder stores {}");
  else no("a save over the seven-zero-day placeholder kept it");

  await c.query(UPSERT_MENU_SQL, upsertParams(userId, WEEK.agent));
  if (isEmptyObject(await storedTotals(userId, WEEK.agent))) ok("a save over an agent's flat estimate stores {}");
  else no("a save over an agent's flat estimate kept it");

  await c.query(UPSERT_MENU_SQL, upsertParams(userId, WEEK.fresh));
  if (isEmptyObject(await storedTotals(userId, WEEK.fresh))) ok("a first save stores {}");
  else no("a first save stored something other than {}");

  const template = await c.query(INSERT_TEMPLATE_SQL, [...upsertParams(userId, WEEK.template), "probe template"]);
  if (isEmptyObject(await storedTotals(userId, WEEK.template))) ok("a saved template stores {}");
  else no("a saved template stored something other than {}");

  const read = await c.query(SELECT_MENU_SQL, [userId, WEEK.fresh]);
  const templates = await c.query(SELECT_TEMPLATES_SQL, [userId]);
  if (read.rowCount === 1 && templates.rowCount === 1) ok("the menu and template reads find the rows just saved");
  else no(`reads found ${read.rowCount} menu / ${templates.rowCount} template rows, expected 1 / 1`);

  const leaking = [["upsert", conflict], ["template insert", template], ["menu read", read], ["template read", templates]]
    .filter(([, r]) => returnsColumn(r)).map(([name]) => name);
  if (leaking.length === 0) ok("no statement returns nutritional_totals");
  else no(`returns nutritional_totals: ${leaking.join(", ")}`);
}

async function checkMutantsFail(userId) {
  for (const [name, sql] of Object.entries(MUTANTS)) {
    if (sql === UPSERT_MENU_SQL || sql === SELECT_MENU_SQL) no(`mutant did not apply (statement changed shape): ${name}`);
  }
  const keptPlaceholder = await inSavepoint(async () => {
    await seed(userId, "2099-02-01", PLACEHOLDER);
    await c.query(MUTANTS.conflictKeepsStoredValue, upsertParams(userId, "2099-02-01"));
    return !isEmptyObject(await storedTotals(userId, "2099-02-01"));
  });
  if (keptPlaceholder) ok("control: an upsert that skips the column keeps the placeholder, so that check can fail");
  else no("control: the conflict-path check passed a mutant that skips the column");

  const wrotePlaceholder = await inSavepoint(async () => {
    await c.query(MUTANTS.insertWritesPlaceholder, upsertParams(userId, "2099-02-08"));
    return !isEmptyObject(await storedTotals(userId, "2099-02-08"));
  });
  if (wrotePlaceholder) ok("control: an insert that writes the placeholder is caught, so that check can fail");
  else no("control: the insert-path check passed a mutant that writes the placeholder");

  const leaked = await inSavepoint(async () => returnsColumn(await c.query(MUTANTS.readReturnsColumn, [userId, WEEK.fresh])));
  if (leaked) ok("control: a read that selects the column is caught, so that check can fail");
  else no("control: the column check passed a read that selects nutritional_totals");
}

await c.query("BEGIN");
try {
  const userId = await mkUser();
  await seed(userId, WEEK.placeholder, PLACEHOLDER);
  await seed(userId, WEEK.agent, AGENT_ESTIMATE);
  await checkShipped(userId);
  await checkMutantsFail(userId);
} catch (error) {
  no(`statement failed against PostgreSQL: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await c.query("ROLLBACK");
  await c.end();
}

console.log(
  bad === 0
    ? "\nPASS — weekly_menus saves store {} for nutritional_totals and no read returns it (rolled back)\n"
    : `\nFAILED: ${bad}\n`,
);
process.exit(bad === 0 ? 0 : 1);
