/** Agent initialization/repair behavior against session-local PostgreSQL fixtures. */
import assert from "node:assert/strict";
import pg from "pg";
import { AGENT_ESMS_SEED_SQL } from "./lib/agentEsmsSeed.ts";
import { AGENT_LEDGER_DRIFT_SQL, readAgentLedgerDrift, repairAgentLedger } from "./lib/agentLedgerRepair.ts";

const AGENT = "00000000-0000-0000-0000-000000000001";
const OTHER = "00000000-0000-0000-0000-000000000002";

export async function checkAgentLedgerSql(client) {
  // Validate shipped schema compatibility without executing either statement.
  await client.query(`PREPARE agent_esms_seed_proof AS ${AGENT_ESMS_SEED_SQL}`);
  await client.query("DEALLOCATE agent_esms_seed_proof");
  await client.query(`PREPARE agent_ledger_drift_proof AS ${AGENT_LEDGER_DRIFT_SQL}`);
  await client.query("DEALLOCATE agent_ledger_drift_proof");
  // Repair owns its transaction, so an outer rollback would not isolate writes.
  // TEMP tables shadow application names and disappear when this connection closes.
  await client.query(`CREATE TEMP TABLE users (id uuid PRIMARY KEY, name text, is_agent boolean NOT NULL);
    CREATE TEMP TABLE token_balances (
      user_id uuid PRIMARY KEY REFERENCES users(id),
      spirit decimal(12,4) NOT NULL DEFAULT 0, essence decimal(12,4) NOT NULL DEFAULT 0,
      matter decimal(12,4) NOT NULL DEFAULT 0, substance decimal(12,4) NOT NULL DEFAULT 0,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TEMP TABLE token_transactions (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      transaction_group_id uuid NOT NULL DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL REFERENCES users(id),
      token_type varchar(20) NOT NULL CONSTRAINT fixture_axis CHECK (token_type IN ('Spirit','Essence','Matter','Substance')),
      amount decimal(12,4) NOT NULL, source_type varchar(50) NOT NULL,
      source_id varchar(255), description text, idempotency_key varchar(255) UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );`);
  const isolation = await client.query(`SELECT bool_and(relnamespace = pg_my_temp_schema()) AS isolated
    FROM pg_class WHERE oid IN (to_regclass('users'), to_regclass('token_balances'), to_regclass('token_transactions'))`);
  assert.equal(isolation.rows[0].isolated, true, "All fixture names must resolve to temporary tables");

  const count = async () => (await client.query("SELECT count(*)::int AS n FROM pg_temp.token_transactions")).rows[0].n;
  const seed = (amounts = ["10", "20", "30", "40"], userId = AGENT) => client.query(AGENT_ESMS_SEED_SQL, [userId, ...amounts]);
  const balance = async (amounts = ["10", "20", "30", "40"]) => client.query(
    "INSERT INTO pg_temp.token_balances (user_id,spirit,essence,matter,substance) VALUES ($1,$2,$3,$4,$5)", [AGENT, ...amounts]);
  const credit = (userId, axis, amount, key) => client.query(`INSERT INTO pg_temp.token_transactions
    (user_id,token_type,amount,source_type,idempotency_key) VALUES ($1,$2,$3,'initial_grant',$4)`, [userId, axis, amount, key]);
  let passed = 0;
  async function scenario(name, run) {
    await client.query("TRUNCATE pg_temp.token_transactions,pg_temp.token_balances,pg_temp.users RESTART IDENTITY CASCADE");
    await client.query("INSERT INTO pg_temp.users VALUES ($1,'Fixture agent',true),($2,'Other agent',true)", [AGENT, OTHER]);
    await run();
    passed += 1;
    console.log(`PASS ${name}`);
  }

  await scenario("initialization creates one balanced four-axis grant", async () => {
    assert.equal((await seed()).rows[0].credited_axes, 4);
    assert.equal(await count(), 4);
    assert.deepEqual(await readAgentLedgerDrift(client), []);
    const groups = await client.query("SELECT count(DISTINCT transaction_group_id)::int AS n FROM pg_temp.token_transactions");
    assert.equal(groups.rows[0].n, 1);
  });
  await scenario("repeated initialization preserves existing balances", async () => {
    await seed();
    assert.equal((await seed(["99", "99", "99", "99"])).rows[0].credited_axes, 0);
    assert.equal(await count(), 4);
    assert.equal((await client.query("SELECT spirit::text FROM pg_temp.token_balances")).rows[0].spirit, "10.0000");
  });
  await scenario("multiple initialization requests emit only one grant", async () => {
    await Promise.all([seed(), seed()]);
    assert.equal(await count(), 4);
    assert.deepEqual(await readAgentLedgerDrift(client), []);
  });
  await scenario("ledger failure rolls back balance and every credit", async () => {
    await client.query("ALTER TABLE pg_temp.token_transactions ADD CONSTRAINT injected_failure CHECK (token_type <> 'Essence')");
    try {
      await assert.rejects(seed());
      assert.equal(await count(), 0);
      assert.equal((await client.query("SELECT count(*)::int AS n FROM pg_temp.token_balances")).rows[0].n, 0);
    } finally {
      await client.query("ALTER TABLE pg_temp.token_transactions DROP CONSTRAINT injected_failure");
    }
  });
  await scenario("credits use the balance's stored decimal rounding", async () => {
    await seed(["1.23456", "0", "0.00006", "3.45678"]);
    assert.equal(await count(), 3);
    assert.deepEqual(await readAgentLedgerDrift(client), []);
  });
  await scenario("invalid quantities create neither balances nor credits", async () => {
    for (const invalid of ["-1", "NaN"]) {
      assert.equal((await seed([invalid, "0", "0", "0"])).rows[0].invalid_quantities, true);
    }
    for (const invalid of ["Infinity", "-Infinity"]) {
      await assert.rejects(seed([invalid, "0", "0", "0"]), (error) => error.code === "22003");
    }
    assert.equal(await count(), 0);
    assert.equal((await client.query("SELECT count(*)::int AS n FROM pg_temp.token_balances")).rows[0].n, 0);
  });
  await scenario("an unexplained ledger prevents initialization", async () => {
    await credit(AGENT, "Spirit", "1", "prior-ledger");
    assert.equal((await seed()).rows[0].ledger_without_balance, true);
    assert.equal(await count(), 1);
    assert.equal((await client.query("SELECT count(*)::int AS n FROM pg_temp.token_balances")).rows[0].n, 0);
  });
  await scenario("a conflicting credit key rolls back initialization", async () => {
    await credit(OTHER, "Spirit", "1", `init_grant_esms_sync:${AGENT}:Spirit`);
    await assert.rejects(seed());
    assert.equal(await count(), 1);
    assert.equal((await client.query("SELECT count(*)::int AS n FROM pg_temp.token_balances")).rows[0].n, 0);
  });
  await scenario("missing ledger axes remain visible and dry runs preserve data", async () => {
    await balance();
    await credit(AGENT, "Spirit", "10", "existing-spirit");
    assert.equal((await readAgentLedgerDrift(client)).length, 3);
    const result = await repairAgentLedger(client, { write: false });
    assert.equal(result.committed, false);
    assert.equal(result.totalOwed, "90.0000");
    assert.equal(await count(), 1);
  });
  await scenario("partial grants repair completely and reruns are idempotent", async () => {
    await balance();
    await credit(AGENT, "Spirit", "10", "existing-spirit");
    assert.equal((await repairAgentLedger(client, { write: true })).inserted, 3);
    assert.deepEqual(await readAgentLedgerDrift(client), []);
    assert.equal((await repairAgentLedger(client, { write: true })).inserted, 0);
    assert.equal(await count(), 4);
  });
  await scenario("balances without any ledger repair all four axes", async () => {
    await balance();
    assert.equal((await readAgentLedgerDrift(client)).length, 4);
    assert.equal((await repairAgentLedger(client, { write: true })).inserted, 4);
    assert.deepEqual(await readAgentLedgerDrift(client), []);
  });
  await scenario("human drift is refused without writes", async () => {
    await balance();
    await client.query("UPDATE pg_temp.users SET is_agent=false WHERE id=$1", [AGENT]);
    await assert.rejects(repairAgentLedger(client, { write: true }), /non-agents/);
    assert.equal(await count(), 0);
  });
  await scenario("negative owed amounts are refused without writes", async () => {
    await balance(["1", "0", "0", "0"]);
    await credit(AGENT, "Spirit", "2", "excess-ledger");
    await assert.rejects(repairAgentLedger(client, { write: true }), /non-positive/);
    assert.equal(await count(), 1);
  });
  await scenario("the smallest stored decimal discrepancy is repaired exactly", async () => {
    await balance(["0.0001", "0.0002", "0.0003", "0.0004"]);
    const result = await repairAgentLedger(client, { write: true });
    assert.equal(result.totalOwed, "0.0010");
    assert.equal(result.inserted, 4);
    assert.deepEqual(await readAgentLedgerDrift(client), []);
  });
  await scenario("a used repair key cannot hide renewed drift", async () => {
    await balance(["2", "0", "0", "0"]);
    await credit(AGENT, "Spirit", "1", `reconcile_agent_esms_seed:${AGENT}:Spirit`);
    await assert.rejects(repairAgentLedger(client, { write: true }), /REFUSING TO COMMIT/);
    assert.equal(await count(), 1);
    assert.equal((await readAgentLedgerDrift(client)).length, 1);
  });
  await scenario("orphan ledger users are detected even with a zero sum", async () => {
    await credit(AGENT, "Spirit", "2", "orphan-credit");
    await credit(AGENT, "Spirit", "-2", "orphan-debit");
    assert.equal((await readAgentLedgerDrift(client))[0].orphan, true);
    await assert.rejects(repairAgentLedger(client, { write: true }), /orphan/);
    assert.equal(await count(), 2);
  });
  await scenario("repair insertion failures roll back all credits", async () => {
    await balance();
    await client.query("ALTER TABLE pg_temp.token_transactions ADD CONSTRAINT injected_failure CHECK (token_type <> 'Matter')");
    try {
      await assert.rejects(repairAgentLedger(client, { write: true }));
      assert.equal(await count(), 0);
    } finally {
      await client.query("ALTER TABLE pg_temp.token_transactions DROP CONSTRAINT injected_failure");
    }
  });
  await scenario("post-insert verification refuses and rolls back new drift", async () => {
    await balance();
    let reads = 0;
    const injectingClient = {
      async query(sql, values) {
        if (sql === AGENT_LEDGER_DRIFT_SQL && ++reads === 2) {
          await client.query("UPDATE pg_temp.token_balances SET matter=matter+1 WHERE user_id=$1", [AGENT]);
        }
        return client.query(sql, values);
      },
    };
    await assert.rejects(repairAgentLedger(injectingClient, { write: true }), /REFUSING TO COMMIT/);
    assert.equal(await count(), 0);
    assert.equal((await client.query("SELECT matter::text FROM pg_temp.token_balances")).rows[0].matter, "30.0000");
  });
  console.log(`Agent ledger SQL: ${passed} isolated PostgreSQL scenarios passed.`);
  return passed;
}

if (import.meta.main) {
  const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("Agent ledger SQL checks require DATABASE_PUBLIC_URL / DATABASE_URL");
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await checkAgentLedgerSql(client);
  } finally {
    await client.end();
  }
}
