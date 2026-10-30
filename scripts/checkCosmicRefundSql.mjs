/**
 * Cosmic recipe refund settlement and replay proof against session-local PostgreSQL fixtures.
 *
 * Proves:
 * 1. Restored balances after debit + refund.
 * 2. Exactly one ledger row per positive net axis; four rows only in an all-positive fixture.
 * 3. Partial fixtures (e.g. 0-amount net axis after auto-swap) emit rows only for positive axes.
 * 4. Replay with the same idempotency key writes no extra rows and causes no balance delta.
 * 5. Transaction rollback isolates failures so partial refunds cannot persist.
 */
import assert from "node:assert/strict";
import pg from "pg";
import { creditTokensSql } from "../src/services/tokenEconomyQueries.ts";
import { requireCosmicRefundTestDatabaseUrl } from "./lib/cosmicRefundTestDatabase.ts";

const USER_ID = "00000000-0000-0000-0000-000000000001";
const DEBIT_GROUP = "11111111-1111-1111-1111-111111111111";

export async function checkCosmicRefundSql(client) {
  // TEMP tables shadow application names and disappear when connection closes.
  await client.query(`
    CREATE TEMP TABLE users (
      id uuid PRIMARY KEY,
      name text,
      is_agent boolean NOT NULL DEFAULT false
    );
    CREATE TEMP TABLE token_balances (
      user_id uuid PRIMARY KEY REFERENCES users(id),
      spirit decimal(12,4) NOT NULL DEFAULT 0,
      essence decimal(12,4) NOT NULL DEFAULT 0,
      matter decimal(12,4) NOT NULL DEFAULT 0,
      substance decimal(12,4) NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TEMP TABLE token_transactions (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      transaction_group_id uuid NOT NULL DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL REFERENCES users(id),
      token_type varchar(20) NOT NULL CONSTRAINT fixture_axis CHECK (token_type IN ('Spirit','Essence','Matter','Substance')),
      amount decimal(12,4) NOT NULL,
      source_type varchar(50) NOT NULL,
      source_id varchar(255),
      description text,
      idempotency_key varchar(255) UNIQUE,
      yield_day date,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const isolation = await client.query(`
    SELECT count(*)::int AS count, bool_and(relnamespace = pg_my_temp_schema()) AS isolated
    FROM pg_class
    WHERE oid IN (
      to_regclass('users'),
      to_regclass('token_balances'),
      to_regclass('token_transactions')
    )
  `);
  assert.equal(isolation.rows[0].count, 3, "All three fixture relations must resolve");
  assert.equal(isolation.rows[0].isolated, true, "All fixture names must resolve to temporary tables");

  const countTx = async () =>
    (await client.query("SELECT count(*)::int AS n FROM pg_temp.token_transactions")).rows[0].n;

  const getBalances = async () => {
    const res = await client.query(
      "SELECT spirit::text, essence::text, matter::text, substance::text FROM pg_temp.token_balances WHERE user_id = $1",
      [USER_ID],
    );
    return res.rows[0] ?? null;
  };

  const applyCredits = async (credits, groupId, baseIdemKey) => {
    await client.query("BEGIN");
    try {
      const applicable = credits.filter((c) => c.amount > 0);
      let written = 0;
      for (const { tokenType, amount } of applicable) {
        const query = creditTokensSql({
          userId: USER_ID,
          tokenType,
          amount,
          sourceType: "cosmic_recipe_refund",
          sourceId: groupId,
          description: "Refund - cosmic recipe generation produced no recipe",
          transactionGroupId: groupId,
          idempotencyKey: baseIdemKey ? `${baseIdemKey}:${tokenType}` : null,
        });
        const res = await client.query(query.sql, query.values);
        if (res.rows.length > 0) {
          written += 1;
        }
      }
      await client.query("COMMIT");
      return written;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  };

  let passed = 0;
  async function scenario(name, run) {
    await client.query("TRUNCATE pg_temp.token_transactions, pg_temp.token_balances, pg_temp.users RESTART IDENTITY CASCADE");
    await client.query("INSERT INTO pg_temp.users (id, name) VALUES ($1, 'Fixture user')", [USER_ID]);
    await client.query(
      "INSERT INTO pg_temp.token_balances (user_id, spirit, essence, matter, substance) VALUES ($1, 50, 50, 50, 50)",
      [USER_ID],
    );
    await run();
    passed += 1;
    console.log(`PASS ${name}`);
  }

  await scenario("all-positive fixture writes exactly 4 rows and restores balances", async () => {
    // Simulate debit of 7.5 on all 4 axes
    await client.query(
      "UPDATE pg_temp.token_balances SET spirit = 42.5, essence = 42.5, matter = 42.5, substance = 42.5 WHERE user_id = $1",
      [USER_ID],
    );
    const credits = [
      { tokenType: "Spirit", amount: 7.5 },
      { tokenType: "Essence", amount: 7.5 },
      { tokenType: "Matter", amount: 7.5 },
      { tokenType: "Substance", amount: 7.5 },
    ];
    const written = await applyCredits(credits, DEBIT_GROUP, `cosmic_recipe_refund:${DEBIT_GROUP}`);
    assert.equal(written, 4, "Must write 4 rows for 4 positive axes");
    assert.equal(await countTx(), 4, "Must record exactly 4 ledger rows");

    const bal = await getBalances();
    assert.equal(bal.spirit, "50.0000");
    assert.equal(bal.essence, "50.0000");
    assert.equal(bal.matter, "50.0000");
    assert.equal(bal.substance, "50.0000");
  });

  await scenario("partial fixture with zero-amount axis writes only positive axes (3 rows)", async () => {
    // Simulate auto-swap deficit where essence net refund is 0
    await client.query(
      "UPDATE pg_temp.token_balances SET spirit = 43.175, essence = 50.0, matter = 49.0, substance = 47.5 WHERE user_id = $1",
      [USER_ID],
    );
    const credits = [
      { tokenType: "Spirit", amount: 6.825 },
      { tokenType: "Essence", amount: 0 },
      { tokenType: "Matter", amount: 1.0 },
      { tokenType: "Substance", amount: 2.5 },
    ];
    const written = await applyCredits(credits, DEBIT_GROUP, `cosmic_recipe_refund:${DEBIT_GROUP}`);
    assert.equal(written, 3, "Must write only 3 rows (zero-amount essence is omitted)");
    assert.equal(await countTx(), 3, "Ledger must have only 3 rows");

    const res = await client.query("SELECT token_type FROM pg_temp.token_transactions ORDER BY token_type");
    const types = res.rows.map((r) => r.token_type);
    assert.deepEqual(types, ["Matter", "Spirit", "Substance"], "Essence must not have a ledger entry");

    const bal = await getBalances();
    assert.equal(bal.spirit, "50.0000");
    assert.equal(bal.essence, "50.0000");
    assert.equal(bal.matter, "50.0000");
    assert.equal(bal.substance, "50.0000");
  });

  await scenario("idempotent replay writes zero extra rows and leaves balances unchanged", async () => {
    const credits = [
      { tokenType: "Spirit", amount: 7.5 },
      { tokenType: "Essence", amount: 7.5 },
      { tokenType: "Matter", amount: 7.5 },
      { tokenType: "Substance", amount: 7.5 },
    ];
    // First execution
    const firstWritten = await applyCredits(credits, DEBIT_GROUP, `cosmic_recipe_refund:${DEBIT_GROUP}`);
    assert.equal(firstWritten, 4);
    assert.equal(await countTx(), 4);
    const balAfterFirst = await getBalances();

    // Replay with identical idempotency key
    const replayWritten = await applyCredits(credits, DEBIT_GROUP, `cosmic_recipe_refund:${DEBIT_GROUP}`);
    assert.equal(replayWritten, 0, "Replay must write 0 rows");
    assert.equal(await countTx(), 4, "Ledger row count must remain exactly 4");

    const balAfterReplay = await getBalances();
    assert.deepEqual(balAfterReplay, balAfterFirst, "Balances must not change on replay");
  });

  await scenario("ledger transaction rollback prevents partial writes on failure", async () => {
    await client.query("ALTER TABLE pg_temp.token_transactions ADD CONSTRAINT injected_fail CHECK (token_type <> 'Matter')");
    try {
      const credits = [
        { tokenType: "Spirit", amount: 7.5 },
        { tokenType: "Essence", amount: 7.5 },
        { tokenType: "Matter", amount: 7.5 },
        { tokenType: "Substance", amount: 7.5 },
      ];
      await assert.rejects(
        applyCredits(credits, DEBIT_GROUP, `cosmic_recipe_refund:${DEBIT_GROUP}`),
        (err) => err.code === "23514",
      );
      assert.equal(await countTx(), 0, "Rollback must leave 0 ledger rows");
      const bal = await getBalances();
      assert.equal(bal.spirit, "50.0000", "Balances must be unaffected");
    } finally {
      await client.query("ALTER TABLE pg_temp.token_transactions DROP CONSTRAINT injected_fail");
    }
  });

  console.log(`Cosmic refund SQL: ${passed} isolated PostgreSQL scenarios passed.`);
  return passed;
}

if (import.meta.main) {
  const url = requireCosmicRefundTestDatabaseUrl(process.env.COSMIC_REFUND_TEST_DATABASE_URL);
  const client = new pg.Client({ connectionString: url, ssl: false });
  await client.connect();
  try {
    await checkCosmicRefundSql(client);
  } finally {
    await client.end();
  }
}
