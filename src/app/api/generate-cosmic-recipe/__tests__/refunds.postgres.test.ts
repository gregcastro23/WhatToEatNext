/**
 * @jest-environment node
 *
 * Actual settlement + TokenEconomyService over real session-local PostgreSQL
 * fixtures. Only the DB connection boundary is replaced: statements and the
 * production transaction callback execute on one real Client. No SQL is mocked.
 */
import assert from "node:assert/strict";
import { Client } from "pg";
import { settleCosmicRecipeRefund, type SpendRecord } from "../cosmicRefundSettlement";

let client: Client;
const mockExecuteQuery = jest.fn();
const mockWithTransaction = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
  withTransaction: (...args: unknown[]) => mockWithTransaction(...args),
}));

const url = process.env.COSMIC_REFUND_TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;
const userId = "00000000-0000-0000-0000-000000000001";
const groupId = "11111111-1111-1111-1111-111111111111";
const basket = { spirit: 7.5, essence: 7.5, matter: 7.5, substance: 7.5 };
const spend: SpendRecord = { userId, groupId, costs: basket, refund: basket };

suite("cosmic refunds on PostgreSQL (requires COSMIC_REFUND_TEST_DATABASE_URL)", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  beforeAll(async () => {
    if (!url) throw new Error("Dedicated refund test database URL required");
    const parsedUrl = new URL(url);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname);
    client = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
    await client.connect();
    await client.query(`CREATE TEMP TABLE users (id uuid PRIMARY KEY);
      CREATE TEMP TABLE token_balances (
        user_id uuid PRIMARY KEY REFERENCES users(id),
        spirit decimal(12,4) NOT NULL DEFAULT 0, essence decimal(12,4) NOT NULL DEFAULT 0,
        matter decimal(12,4) NOT NULL DEFAULT 0, substance decimal(12,4) NOT NULL DEFAULT 0,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TEMP TABLE token_transactions (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        transaction_group_id uuid NOT NULL DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL REFERENCES users(id), token_type text NOT NULL,
        amount decimal(12,4) NOT NULL, source_type text NOT NULL,
        source_id text, description text, idempotency_key text UNIQUE,
        yield_day date, created_at timestamptz NOT NULL DEFAULT now()
      )`);
    const isolation = await client.query<{ count: number; isolated: boolean }>(`SELECT count(*)::int AS count,
      bool_and(relnamespace = pg_my_temp_schema()) AS isolated FROM pg_class
      WHERE oid IN (to_regclass('users'),to_regclass('token_balances'),to_regclass('token_transactions'))`);
    assert.deepEqual(isolation.rows, [{ count: 3, isolated: true }]);
    // The service's lazy DB branch must activate; its import resolves only to
    // the boundary above, after TEMP isolation has been established.
    process.env.DATABASE_URL = url;
    mockExecuteQuery.mockImplementation((sql: string, values: unknown[]) => client.query(sql, values));
    mockWithTransaction.mockImplementation(async (operation: (tx: Client) => Promise<unknown>) => {
      await client.query("BEGIN");
      try {
        const result = await operation(client);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    });
  });

  beforeEach(async () => {
    await client.query("TRUNCATE pg_temp.token_transactions,pg_temp.token_balances,pg_temp.users RESTART IDENTITY CASCADE");
    await client.query("INSERT INTO pg_temp.users VALUES ($1)", [userId]);
    await client.query("INSERT INTO pg_temp.token_balances(user_id,spirit,essence,matter,substance) VALUES ($1,42.5,42.5,42.5,42.5)", [userId]);
  });

  afterAll(async () => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    await client?.end();
  });

  async function balances() {
    return (await client.query("SELECT spirit::text,essence::text,matter::text,substance::text FROM pg_temp.token_balances")).rows;
  }

  it("restores all four axes and replays without another row or balance delta", async () => {
    expect(await settleCosmicRecipeRefund(spend)).toMatchObject({ refunded: true, refundStatus: "confirmed" });
    const ledger = await client.query(`SELECT token_type,amount::text,idempotency_key,source_id FROM pg_temp.token_transactions ORDER BY token_type`);
    expect(ledger.rows).toHaveLength(4);
    for (const row of ledger.rows) {
      expect(row.amount).toBe("7.5000");
      expect(row.source_id).toBe(groupId);
      expect(row.idempotency_key).toBe(`cosmic_recipe_refund:${groupId}:${row.token_type}`);
    }
    const restored = [{ spirit: "50.0000", essence: "50.0000", matter: "50.0000", substance: "50.0000" }];
    expect(await balances()).toEqual(restored);
    expect(await settleCosmicRecipeRefund(spend)).toMatchObject({ refunded: true, creditResult: { status: "replayed" } });
    expect(await balances()).toEqual(restored);
    expect((await client.query("SELECT count(*)::int AS count FROM pg_temp.token_transactions")).rows[0].count).toBe(4);
  });

  it("refunds the exact net basket and creates rows only for its three positive axes", async () => {
    await client.query("UPDATE pg_temp.token_balances SET spirit=43.175,essence=50,matter=49,substance=47.5");
    const refund = { spirit: 6.825, essence: 0, matter: 1, substance: 2.5 };
    expect(await settleCosmicRecipeRefund({ ...spend, refund })).toMatchObject({ refunded: true, creditResult: { written: 3, requested: 3 } });
    expect((await client.query("SELECT token_type,amount::text FROM pg_temp.token_transactions ORDER BY token_type")).rows).toEqual([
      { token_type: "Matter", amount: "1.0000" },
      { token_type: "Spirit", amount: "6.8250" },
      { token_type: "Substance", amount: "2.5000" },
    ]);
    expect(await balances()).toEqual([{ spirit: "50.0000", essence: "50.0000", matter: "50.0000", substance: "50.0000" }]);
  });

  it("rolls back earlier credits when the third axis fails, then safely retries", async () => {
    await client.query("ALTER TABLE pg_temp.token_transactions ADD CONSTRAINT injected_failure CHECK(token_type<>'Matter')");
    try {
      expect(await settleCosmicRecipeRefund(spend)).toMatchObject({ refunded: false, refundStatus: "failed", creditResult: { status: "failed", code: "23514" } });
      expect((await client.query("SELECT count(*)::int AS count FROM pg_temp.token_transactions")).rows[0].count).toBe(0);
      expect(await balances()).toEqual([{ spirit: "42.5000", essence: "42.5000", matter: "42.5000", substance: "42.5000" }]);
    } finally {
      await client.query("ALTER TABLE pg_temp.token_transactions DROP CONSTRAINT injected_failure");
    }
    expect(await settleCosmicRecipeRefund(spend)).toMatchObject({ refunded: true, refundStatus: "confirmed" });
  });
});
