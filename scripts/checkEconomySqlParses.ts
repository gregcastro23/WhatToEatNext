/**
 * CI gate: does the economy SQL actually PARSE against PostgreSQL?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-26]` the credit statement shipped to production in a state
 * where PostgreSQL rejected it outright:
 *
 *     42P08  inconsistent types deduced for parameter $4
 *
 * `$4` (sourceType) was bound BOTH as the INSERT value for a `character varying`
 * column AND, uncast, inside `CASE WHEN $4 IN ('agents_yield','daily_yield')`,
 * where the literals made it `text`. A bind parameter has exactly ONE deduced
 * type, so the statement could not be prepared at all — every credit threw.
 *
 * Thirteen unit tests covered that code path and all thirteen passed, because
 * they mock the database. A mocked `executeQuery` will happily "run" SQL that no
 * PostgreSQL will accept. That is the defect class this gate closes: SQL is a
 * second language in this codebase and only the database can typecheck it.
 *
 * ── Why PREPARE ─────────────────────────────────────────────────────────────
 *
 * PREPARE performs parse + parameter-type analysis — exactly where 42P08 fires —
 * and writes NOTHING. No transaction, no rows, no side effects. It also catches
 * misspelled columns, dropped tables, and a parameter count that has drifted
 * from the call site.
 *
 * ── Controls ────────────────────────────────────────────────────────────────
 *
 * A zero result is a claim requiring a control test: if the extractor silently
 * matched nothing, "0 statements failed" would read as a pass. So the run FAILS
 * unless it extracted every statement it expects, and it additionally proves it
 * can detect a genuinely broken statement by preparing one that must fail.
 *
 * Read-only. Never writes.
 *
 *   railway run --service Postgres -- bun scripts/checkEconomySqlParses.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import pg from "pg";

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!url) fail("no DATABASE_PUBLIC_URL / DATABASE_URL in the environment");

const SERVICE = join(
  process.cwd(),
  "src/services/TokenEconomyService.ts",
);
const source = readFileSync(SERVICE, "utf8");

// The four axis columns are interpolated into the statement, so each is a
// DIFFERENT statement and each must be checked. A typo in one would otherwise
// only surface for whichever axis happened to be credited.
const COLUMNS = ["spirit", "essence", "matter", "substance"] as const;

/** Resolve the SQL exactly as the module builds it — never a hand copy. */
function creditSql(column: string): string {
  const body = source.match(/return `WITH inserted[\s\S]*?RETURNING \*`;/)?.[0];
  if (!body) {
    fail(
      "CONTROL FAILED: could not extract the credit statement from " +
        "TokenEconomyService.ts. The gate cannot pass by finding nothing — if " +
        "the statement was renamed or restructured, update this extractor.",
    );
  }
  const sources = source
    .match(/const DAILY_YIELD_SOURCES = \[([\s\S]*?)\]/)?.[1]
    .match(/"[^"]+"/g);
  if (!sources || sources.length === 0) {
    fail("CONTROL FAILED: could not extract DAILY_YIELD_SOURCES");
  }
  return body!
    .replace(/^return `/, "")
    .replace(/`;$/, "")
    .replace(
      /\$\{DAILY_YIELD_SOURCES_SQL\}/g,
      sources!.map((s) => `'${s.slice(1, -1)}'`).join(", "),
    )
    .replace(/\$\{column\}/g, column);
}

/**
 * The debit statement, resolved the same way. It is a SEPARATE statement from the
 * credit and deliberately NOT an upsert — see the comment above `debitTokensSql`
 * for the production measurement showing an upsert-shaped debit drives a missing
 * balance to -25.0000. Its `WITH check_balance` opening is shared with the
 * transmutation statement, so the extractor anchors on `return \`` to stay unique.
 */
function debitSql(column: string): string {
  const body = source.match(/return `WITH check_balance[\s\S]*?RETURNING \*`;/)?.[0];
  if (!body) {
    fail(
      "CONTROL FAILED: could not extract the debit statement from " +
        "TokenEconomyService.ts. If it was renamed or restructured, update this " +
        "extractor — the gate must not pass by finding nothing.",
    );
  }
  return body!
    .replace(/^return `/, "")
    .replace(/`;$/, "")
    .replace(/\$\{column\}/g, column);
}

/**
 * The balance read. Gated because it is where the OTHER un-preparable shape lived:
 * `INSERT …; SELECT …` sent as one parameterised string, which PostgreSQL rejects
 * with `42601 cannot insert multiple commands into a prepared statement`. Every
 * call raised and fell through to a catch, so the "primary" path had never run.
 */
function getBalancesSql(): string {
  const body = source.match(
    /`INSERT INTO token_balances \(user_id\) VALUES \(\$1\)\s*\n\s*ON CONFLICT[\s\S]*?RETURNING \*`/,
  )?.[0];
  if (!body) {
    fail(
      "CONTROL FAILED: could not extract the getBalances statement from " +
        "TokenEconomyService.ts. Update this extractor rather than letting the " +
        "gate pass on nothing.",
    );
  }
  return body!.replace(/^`/, "").replace(/`$/, "");
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

let failures = 0;
try {
  // ── Control: the gate can detect a statement that IS broken ───────────────
  // Without this, a PREPARE that silently succeeds on anything would make every
  // check below meaningless.
  let controlCaught = false;
  try {
    await client.query(
      "PREPARE _gate_control AS SELECT * FROM a_table_that_does_not_exist_xyz",
    );
    await client.query("DEALLOCATE _gate_control");
  } catch {
    controlCaught = true;
  }
  if (!controlCaught) {
    fail(
      "CONTROL FAILED: PREPARE accepted a statement against a nonexistent " +
        "table, so it is not validating anything.",
    );
  }
  console.log("✓ control: PREPARE rejects a statement it should reject");

  // ── The gate ──────────────────────────────────────────────────────────────
  for (const column of COLUMNS) {
    const sql = creditSql(column);
    const name = `_gate_credit_${column}`;
    try {
      await client.query(`PREPARE ${name} AS ${sql}`);
      const meta = await client.query<{ parameter_types: string[] }>(
        "SELECT parameter_types::text[] FROM pg_prepared_statements WHERE name = $1",
        [name],
      );
      await client.query(`DEALLOCATE ${name}`);
      console.log(
        `✓ credit(${column}) prepares — ${meta.rows[0]?.parameter_types.length ?? "?"} params: ` +
          `${meta.rows[0]?.parameter_types.join(", ")}`,
      );
    } catch (e) {
      failures++;
      const err = e as { code?: string; message?: string };
      console.error(`✗ credit(${column}) FAILED TO PREPARE`);
      console.error(`    ${err.code ?? ""} ${err.message ?? String(e)}`);
      if (err.code === "42P08") {
        console.error(
          "    A bind parameter has ONE deduced type. If the same $n is used " +
            "both as\n    an INSERT value and inside a comparison against " +
            "string literals, BOTH\n    references must carry the same explicit " +
            "cast — casting only one does not fix it.",
        );
      }
    }
  }

  // Debit, one statement per axis, same reasoning as the credit above.
  const others: Array<[string, string]> = [
    ...COLUMNS.map((c) => [`debit(${c})`, debitSql(c)] as [string, string]),
    ["getBalances", getBalancesSql()],
  ];
  for (const [label, sql] of others) {
    // Lowercased: PREPARE folds an unquoted identifier, so a mixed-case name
    // would not match in pg_prepared_statements and the param report would read
    // "? params: undefined" while the statement had in fact prepared fine.
    const name = `_gate_${label.replace(/[^a-z0-9]/gi, "_")}`.toLowerCase();
    try {
      await client.query(`PREPARE ${name} AS ${sql}`);
      const meta = await client.query<{ parameter_types: string[] }>(
        "SELECT parameter_types::text[] FROM pg_prepared_statements WHERE name = $1",
        [name],
      );
      await client.query(`DEALLOCATE ${name}`);
      console.log(
        `✓ ${label} prepares — ${meta.rows[0]?.parameter_types.length ?? "?"} params: ` +
          `${meta.rows[0]?.parameter_types.join(", ")}`,
      );
    } catch (e) {
      failures++;
      const err = e as { code?: string; message?: string };
      console.error(`✗ ${label} FAILED TO PREPARE`);
      console.error(`    ${err.code ?? ""} ${err.message ?? String(e)}`);
      if (err.code === "42601") {
        console.error(
          "    The extended query protocol allows exactly ONE command per\n" +
            "    parameterised message — `INSERT …; SELECT …` in a single string\n" +
            "    with a bind parameter can never be prepared.",
        );
      }
    }
  }

  const total = COLUMNS.length + others.length;
  if (failures > 0) {
    fail(
      `${failures} of ${total} economy statements cannot be prepared by ` +
        "PostgreSQL.\n  Unit tests cannot catch this: they mock the database, and " +
        "a mock will\n  happily accept SQL no database would.",
    );
  }
  console.log(
    `\n✓ all ${total} economy statements parse and type-check against PostgreSQL`,
  );
  // Stated so a reader does not mistake this for full coverage: the multi-axis
  // spend/purchase CTEs (`WITH balance_check …`) and the transmutation statement
  // are still inline template literals inside their methods, and this extractor
  // cannot reach them. They need lifting into named builders first.
  console.log(
    "  NOT covered: the two spend/purchase CTEs and transmutation — still inline,\n" +
      "  pending extraction into builders. 3 statements ungated.",
  );
} finally {
  await client.end();
}
