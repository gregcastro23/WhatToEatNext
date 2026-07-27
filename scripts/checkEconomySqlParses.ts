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
 * PREPARE proves a statement is LEGAL, not that it is CORRECT. Semantics are
 * covered separately by `scripts/checkEconomyStatementBehaviour.mjs`, which
 * exercises each statement against production inside a rolled-back transaction.
 * Neither gate substitutes for the other.
 *
 * ── Why this imports instead of scraping ────────────────────────────────────
 *
 * It used to pull each statement out of `TokenEconomyService.ts` with a regex,
 * which drifts silently the moment anything is reformatted — a regex that stops
 * matching reports "extracted nothing", not "the SQL changed". The builders now
 * live in `src/services/tokenEconomyQueries.ts`, a module with ZERO runtime
 * imports, so this gate can import and call the real functions. It therefore
 * checks exactly what ships, and cannot drift from it at all.
 *
 * ── Controls ────────────────────────────────────────────────────────────────
 *
 * A zero result is a claim requiring a control test: if the gate silently
 * checked nothing, "0 statements failed" would read as a pass. Three controls
 * guard against that:
 *
 *   1. It proves it can detect a genuinely broken statement, by preparing one
 *      that must fail.
 *   2. Every builder exported by the queries module must be exercised. Add a
 *      builder without gating it and this fails, rather than quietly checking
 *      less than it appears to.
 *   3. The total statement count is asserted. A builder that starts yielding
 *      fewer variants (a collapsed loop, a dropped column) fails here even
 *      though every individual statement still prepares.
 *
 * Read-only. Never writes.
 *
 *   railway run --service Postgres -- bun scripts/checkEconomySqlParses.ts
 */
import pg from "pg";
import * as queries from "../src/services/tokenEconomyQueries";
import type {
  AxisColumn,
  TokenTypeName,
} from "../src/services/tokenEconomyQueries";

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!url) fail("no DATABASE_PUBLIC_URL / DATABASE_URL in the environment");

// The four axis columns are interpolated into the statements, so each is a
// DIFFERENT statement and each must be checked. A typo in one would otherwise
// only surface for whichever axis happened to be credited.
const COLUMNS: readonly AxisColumn[] = [
  "spirit",
  "essence",
  "matter",
  "substance",
];

// The credit/debit builders derive their column from the token type, so they
// are driven by the token names rather than the column names.
const TOKEN_TYPES: readonly TokenTypeName[] = [
  "Spirit",
  "Essence",
  "Matter",
  "Substance",
];

/** Placeholder bind values. PREPARE only performs type analysis, so these are
 *  never sent to the server — they exist because the builders return their
 *  parameters alongside their SQL. */
const AMOUNTS = { spirit: 1, essence: 2, matter: 3, substance: 4 };
const UUID = "00000000-0000-0000-0000-000000000000";

interface Statement {
  label: string;
  sql: string;
  /** Which exported builder produced it — used by the coverage control. */
  builder: string;
}

const statements: Statement[] = [];

for (const tokenType of TOKEN_TYPES) {
  statements.push({
    label: `credit(${queries.columnFor(tokenType)})`,
    sql: queries.creditTokensSql({
      userId: UUID,
      tokenType,
      amount: 1,
      sourceType: "signup_grant",
      sourceId: null,
      description: "probe",
      transactionGroupId: UUID,
      idempotencyKey: "probe",
    }).sql,
    builder: "creditTokensSql",
  });
  statements.push({
    label: `debit(${queries.columnFor(tokenType)})`,
    sql: queries.debitTokensSql({
      userId: UUID,
      tokenType,
      amount: 1,
      sourceType: "recipe_ingestion",
      sourceId: null,
      transactionGroupId: UUID,
      description: "probe",
    }).sql,
    builder: "debitTokensSql",
  });
}

statements.push({
  label: "getBalances",
  sql: queries.getBalancesSql(UUID).sql,
  builder: "getBalancesSql",
});

statements.push({
  label: "debitAll(spend)",
  sql: queries.debitAllTokensSql({
    userId: UUID,
    amounts: AMOUNTS,
    description: "probe",
    idempotencyKey: "probe",
    intent: { kind: "spend", sourceType: "recipe_ingestion", sourceId: null },
  }).sql,
  builder: "debitAllTokensSql",
});

statements.push({
  label: "debitAll(purchase)",
  sql: queries.debitAllTokensSql({
    userId: UUID,
    amounts: AMOUNTS,
    description: "probe",
    idempotencyKey: "probe",
    intent: { kind: "purchase", shopItemId: UUID },
  }).sql,
  builder: "debitAllTokensSql",
});

// Transmutation interpolates TWO columns, so every ordered pair is its own
// statement — 4 x 3 = 12. Checking one pair would leave a typo in any of the
// other eleven to surface only for whoever happened to swap those two axes.
for (const fromColumn of COLUMNS) {
  for (const toColumn of COLUMNS) {
    if (fromColumn === toColumn) continue;
    statements.push({
      label: `transmute(${fromColumn}->${toColumn})`,
      sql: queries.transmuteSql({
        fromColumn,
        toColumn,
        userId: UUID,
        costAmount: 3,
        targetAmount: 1,
        transactionGroupId: UUID,
        fromToken: "Spirit",
        toToken: "Essence",
        debitDescription: "probe",
        creditDescription: "probe",
        idempotencyKey: "probe",
      }).sql,
      builder: "transmuteSql",
    });
  }
}

// 4 credit + 4 debit + 1 getBalances + 2 debitAll + 12 transmute
const EXPECTED_TOTAL = 23;

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

let failures = 0;
try {
  // ── Control 1: the gate can detect a statement that IS broken ─────────────
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

  // ── Control 2: every exported builder is actually exercised ───────────────
  // Derived from the module's exports rather than a hand-kept list, so adding a
  // builder and forgetting to gate it fails here instead of passing quietly.
  // Exported functions that are NOT SQL builders and so have nothing to
  // PREPARE. Listed explicitly rather than filtered by a name pattern: adding
  // an export then has to be a conscious decision here, instead of silently
  // slipping past a `endsWith("Sql")` test.
  const NON_BUILDER_EXPORTS = new Set(["columnFor"]);

  const exportedBuilders = Object.entries(queries)
    .filter(([k, v]) => typeof v === "function" && !NON_BUILDER_EXPORTS.has(k))
    .map(([k]) => k);
  const covered = new Set(statements.map((s) => s.builder));
  const ungated = exportedBuilders.filter((b) => !covered.has(b));
  if (ungated.length > 0) {
    fail(
      `CONTROL FAILED: ${ungated.length} exported builder(s) are never ` +
        `PREPAREd: ${ungated.join(", ")}.\n  Every SQL builder in ` +
        "tokenEconomyQueries.ts must be exercised by this gate.",
    );
  }
  console.log(
    `✓ control: all ${exportedBuilders.length} exported builders are exercised ` +
      `(${exportedBuilders.join(", ")})`,
  );

  // ── Control 3: the statement count has not silently shrunk ────────────────
  if (statements.length !== EXPECTED_TOTAL) {
    fail(
      `CONTROL FAILED: expected ${EXPECTED_TOTAL} statements, built ` +
        `${statements.length}. A builder yielding fewer variants would still ` +
        "prepare cleanly while covering less — update EXPECTED_TOTAL only if " +
        "the reduction is intended.",
    );
  }
  console.log(`✓ control: ${statements.length} statements built as expected`);

  // ── The gate ──────────────────────────────────────────────────────────────
  console.log("");
  for (const { label, sql } of statements) {
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
      if (err.code === "42P08") {
        console.error(
          "    A bind parameter has ONE deduced type. If the same $n is used " +
            "both as\n    an INSERT value and inside a comparison against " +
            "string literals, BOTH\n    references must carry the same explicit " +
            "cast — casting only one does not fix it.",
        );
      }
      if (err.code === "42601") {
        console.error(
          "    The extended query protocol allows exactly ONE command per\n" +
            "    parameterised message — `INSERT …; SELECT …` in a single string\n" +
            "    with a bind parameter can never be prepared.",
        );
      }
      if (err.code === "42702") {
        console.error(
          "    Ambiguous column. In an UPDATE … FROM balance_check, both\n" +
            "    relations expose spirit/essence/matter/substance — qualify the\n" +
            "    right-hand side of every SET with `token_balances.`.",
        );
      }
    }
  }

  if (failures > 0) {
    fail(
      `${failures} of ${statements.length} economy statements cannot be ` +
        "prepared by PostgreSQL.\n  Unit tests cannot catch this: they mock the " +
        "database, and a mock will\n  happily accept SQL no database would.",
    );
  }
  console.log(
    `\n✓ all ${statements.length} economy statements parse and type-check ` +
      "against PostgreSQL",
  );
  // Stated so a reader does not mistake this for total coverage of the file.
  // Every statement that MOVES MONEY is now gated. What remains ungated are
  // simple reads and one timestamp write, none of which touch a balance:
  console.log(
    "\n  Covered: every balance-mutating statement (credit, debit, multi-axis\n" +
      "  spend, premium purchase, transmutation, balance ensure-and-read).\n" +
      "\n  NOT covered — still inline in TokenEconomyService.ts, none of which\n" +
      "  move a balance:\n" +
      "    · the two `SELECT 1 FROM token_transactions … idempotency_key LIKE`\n" +
      "      pre-checks (debitAllTokens, purchaseShopItem)\n" +
      "    · getTransactions' page + count reads\n" +
      "    · updateDailyClaimTimestamp's `UPDATE token_balances SET <col> = now()`\n" +
      "    · hasActivePurchase, getShopItem, getShopItems, and the shop_items\n" +
      "      lookup in purchaseShopItem",
  );
} finally {
  await client.end();
}
