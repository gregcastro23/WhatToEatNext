/**
 * CI gate: does the environmental ingestion SQL actually PARSE against PostgreSQL?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * SQL is a second language in this codebase and only the database can typecheck
 * it. `[MEASURED 2026-07-26]` the credit statement shipped in a state PostgreSQL
 * rejected outright (42P08, inconsistent types deduced for a parameter) while
 * thirteen unit tests covering that exact path passed — because they mock the
 * database, and a mocked `executeQuery` will happily "run" SQL no PostgreSQL
 * will accept.
 *
 * This gate closes the same defect class for the ingestion layer.
 *
 * ── Why PREPARE ─────────────────────────────────────────────────────────────
 *
 * PREPARE performs parse + parameter-type analysis — exactly where 42P08 fires —
 * and writes NOTHING. No transaction, no rows, no side effects. It also catches
 * misspelled columns, dropped tables, and a parameter count that has drifted
 * from its call site.
 *
 * PREPARE proves a statement is LEGAL, not that it is CORRECT.
 *
 * ── Why this imports instead of scraping ────────────────────────────────────
 *
 * `src/services/environmentalQueries.ts` has ZERO runtime imports, so this gate
 * imports and calls the real builders. It therefore checks exactly what ships
 * and cannot drift from it. A regex that stops matching would report "extracted
 * nothing", not "the SQL changed".
 *
 * ── Controls ────────────────────────────────────────────────────────────────
 *
 * A zero result is a claim requiring a control test: if this gate silently
 * checked nothing, "0 statements failed" would read as a pass. Three controls:
 *
 *   1. It proves it can detect a genuinely broken statement.
 *   2. Every builder exported by the queries module must be exercised. Add a
 *      builder without gating it and this fails, rather than quietly checking
 *      less than it appears to.
 *   3. The statement count is asserted, so a builder that starts yielding
 *      fewer variants fails here even though each one still prepares.
 *
 * ── Why it provisions its own schema ────────────────────────────────────────
 *
 * The gate applies `database/init/74-environmental-observations.sql` inside a
 * transaction, prepares every statement against it, and ROLLS BACK. Nothing
 * persists — not a table, not a row.
 *
 * That means it can run against any database, including production, before the
 * migration has been applied anywhere. It also verifies something a
 * schema-assuming gate cannot: that the migration and the queries agree. A
 * column renamed in one and not the other fails here, at review time, instead
 * of at deploy time.
 *
 * Never writes. Every statement runs inside a transaction that is rolled back.
 *
 *   railway run --service Postgres -- bun scripts/checkEnvironmentalSqlParses.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";
import * as queries from "../src/services/environmentalQueries";

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!url) fail("no DATABASE_PUBLIC_URL / DATABASE_URL in the environment");

interface GatedStatement {
  /** Which exported builder produced it — used by the coverage control. */
  builder: string;
  sql: string;
}

const statements: GatedStatement[] = [
  { builder: "buildInsertObservation", sql: queries.buildInsertObservation() },
  { builder: "buildSelectWindowObservations", sql: queries.buildSelectWindowObservations() },
  { builder: "buildUpsertBaseline", sql: queries.buildUpsertBaseline() },
  { builder: "buildSelectBaseline", sql: queries.buildSelectBaseline() },
  {
    builder: "buildSelectGeohashesDueForSampling",
    sql: queries.buildSelectGeohashesDueForSampling(),
  },
  { builder: "buildSelectStaleBaselines", sql: queries.buildSelectStaleBaselines() },
  { builder: "buildPruneObservations", sql: queries.buildPruneObservations() },
  { builder: "buildCountObservations", sql: queries.buildCountObservations() },
  { builder: "buildSummarizeBaselines", sql: queries.buildSummarizeBaselines() },
];

/**
 * Bumped deliberately when a builder is added or removed. A silent drop here is
 * the failure this constant exists to catch.
 */
const EXPECTED_STATEMENT_COUNT = 9;

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

const MIGRATION_PATH = join(
  import.meta.dirname ?? __dirname,
  "..",
  "database",
  "init",
  "74-environmental-observations.sql",
);

async function main(): Promise<void> {
  await client.connect();

  // ── Provision the schema inside a transaction that is always rolled back ──
  // Nothing here persists. This also proves the migration and the queries agree.
  const migrationSql = readFileSync(MIGRATION_PATH, "utf8");
  await client.query("BEGIN");
  try {
    await client.query(migrationSql);
  } catch (error) {
    await client.query("ROLLBACK");
    const err = error as { code?: string; message?: string };
    fail(
      `the migration itself failed to apply: ${err.code ?? ""} ${err.message ?? String(error)}\n` +
        `  ${MIGRATION_PATH}`,
    );
  }
  console.log("✓ migration 74 applies cleanly (inside a rolled-back transaction)");

  // ── Control 1: the gate can detect a statement that IS broken ─────────────
  // Inside a savepoint: the failure is deliberate, and any error aborts the
  // enclosing transaction. Without this, the control poisons every statement
  // after it and they all report 25P02 rather than their own verdict.
  let controlCaught = false;
  await client.query("SAVEPOINT _env_gate_control_sp");
  try {
    await client.query(
      "PREPARE _env_gate_control AS SELECT * FROM a_table_that_does_not_exist_xyz",
    );
    await client.query("DEALLOCATE _env_gate_control");
    await client.query("RELEASE SAVEPOINT _env_gate_control_sp");
  } catch {
    controlCaught = true;
    await client.query("ROLLBACK TO SAVEPOINT _env_gate_control_sp");
  }
  if (!controlCaught) {
    fail(
      "control failed: PREPARE accepted a statement referencing a nonexistent table. " +
        "This gate cannot detect anything and its pass is meaningless.",
    );
  }
  console.log("✓ control: PREPARE rejects a statement it should reject");

  // ── Control 2: every exported builder is actually exercised ───────────────
  const exportedBuilders = Object.keys(queries).filter(
    (key) => typeof (queries as Record<string, unknown>)[key] === "function",
  );
  const exercised = new Set(statements.map((s) => s.builder));
  const unexercised = exportedBuilders.filter((name) => !exercised.has(name));
  if (unexercised.length > 0) {
    fail(
      `control failed: ${unexercised.length} exported builder(s) go unchecked: ` +
        `${unexercised.join(", ")}. Every builder exported by ` +
        "environmentalQueries.ts must be exercised by this gate.",
    );
  }
  console.log(
    `✓ control: all ${exportedBuilders.length} exported builders are exercised`,
  );

  // ── Control 3: the statement count has not silently shrunk ────────────────
  if (statements.length !== EXPECTED_STATEMENT_COUNT) {
    fail(
      `control failed: built ${statements.length} statements, expected ` +
        `${EXPECTED_STATEMENT_COUNT}. If a builder was intentionally added or ` +
        "removed, update EXPECTED_STATEMENT_COUNT deliberately.",
    );
  }
  console.log(`✓ control: ${statements.length} statements built as expected`);

  // ── The gate proper ───────────────────────────────────────────────────────
  const failures: Array<{ builder: string; code?: string; message: string }> = [];

  for (const [index, { builder, sql }] of statements.entries()) {
    const name = `_env_gate_${index}`;
    const savepoint = `_env_gate_sp_${index}`;
    // Each statement gets its own savepoint so one failure cannot abort the
    // transaction and cascade every later statement into a bogus 25P02. Each
    // builder must report its OWN verdict, or the gate's output is misleading
    // about where the defect actually is.
    await client.query(`SAVEPOINT ${savepoint}`);
    try {
      await client.query(`PREPARE ${name} AS ${sql}`);
      await client.query(`DEALLOCATE ${name}`);
      await client.query(`RELEASE SAVEPOINT ${savepoint}`);
      console.log(`  ✓ ${builder}`);
    } catch (error) {
      await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      const err = error as { code?: string; message?: string };
      failures.push({
        builder,
        code: err.code,
        message: err.message ?? String(error),
      });
      console.error(`  ✗ ${builder}  ${err.code ?? ""} ${err.message ?? ""}`);
    }
  }

  // Discard the provisional schema. Nothing this gate did survives.
  await client.query("ROLLBACK");
  console.log("✓ transaction rolled back — no schema or rows persisted");

  if (failures.length > 0) {
    fail(
      `${failures.length}/${statements.length} statement(s) could not be prepared. ` +
        "PostgreSQL cannot run this SQL; no amount of mocked-DB tests will show it.",
    );
  }

  console.log(
    `\n✓ all ${statements.length} environmental statements PREPARE cleanly.\n` +
      "  This proves they are LEGAL, not that they are CORRECT.\n",
  );
}

main()
  .catch(async (error) => {
    // Best-effort rollback so a mid-run throw cannot leave the provisional
    // schema behind on an open connection.
    try {
      await client.query("ROLLBACK");
    } catch {
      /* connection already gone; nothing to undo */
    }
    fail(error instanceof Error ? error.message : String(error));
  })
  .finally(() => {
    void client.end();
  });
