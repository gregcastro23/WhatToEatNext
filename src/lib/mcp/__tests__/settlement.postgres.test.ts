/** @jest-environment node */
/**
 * MCP settlement against real PostgreSQL: the ESMS ledger, idempotent replay,
 * concurrent retries, and the reflection's debit + write + feed savepoint, all
 * through the real economy, reflection and feed services and the migrated
 * schema (CHECK constraints included). Only the chart backend and the recipe
 * catalog are stubbed.
 *
 * Run against a disposable loopback database holding every migration:
 *   createdb -h 127.0.0.1 -U postgres mcp_test_settlement
 *   for f in database/init/*.sql; do psql -h 127.0.0.1 -U postgres -d mcp_test_settlement -q -f "$f"; done
 *   MCP_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1/mcp_test_settlement \
 *     npx jest src/lib/mcp/__tests__/settlement.postgres.test.ts
 * (01-schema's trailing GRANTs, 06's legacy enum value and 59's pgvector
 * extension may fail locally; none of them touch these tables.)
 */
import { createHash, randomUUID } from "node:crypto";
import { Client } from "pg";
import type { ToolResult } from "@/lib/mcp/tools";

jest.mock("@/lib/mcp/invocationLog", () => ({
  recordInvocation: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/services/RecipeService", () => ({
  recipeService: {
    searchRecipes: jest.fn().mockResolvedValue([
      {
        id: "r1",
        name: "Saffron Soup",
        description: "A warming bowl",
        cuisine: "Persian",
        timeToMake: "30 MIN",
        numberOfServings: 2,
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
        ingredients: [{ amount: 1, unit: "pinch", name: "saffron" }],
        instructions: ["Simmer"],
      },
    ]),
  },
}));

const databaseUrl = process.env.MCP_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

const AXES = ["spirit", "essence", "matter", "substance"] as const;

suite("MCP settlement against disposable PostgreSQL", () => {
  let db: Client;
  let invokeTool: typeof import("@/lib/mcp/tools").invokeTool;
  let closeDatabase: typeof import("@/lib/database/connection").closeDatabase;
  const funded = { userId: randomUUID(), apiKey: `mcp-test-${randomUUID()}` };
  const broke = { userId: randomUUID(), apiKey: `mcp-test-${randomUUID()}` };

  async function balance(userId: string): Promise<Record<string, number>> {
    const res = await db.query<Record<string, string>>(
      "SELECT spirit, essence, matter, substance FROM token_balances WHERE user_id = $1",
      [userId],
    );
    const [row] = res.rows;
    return Object.fromEntries(AXES.map((axis) => [axis, Number(row?.[axis] ?? 0)]));
  }

  async function ledgerRows(userId: string): Promise<
    Array<{ idempotency_key: string | null; source_id: string; source_type: string; amount: string }>
  > {
    const res = await db.query<{
      idempotency_key: string | null;
      source_id: string;
      source_type: string;
      amount: string;
    }>(
      `SELECT idempotency_key, source_id, source_type, amount::text
         FROM token_transactions WHERE user_id = $1 ORDER BY id`,
      [userId],
    );
    return res.rows;
  }

  async function seedAgent(
    who: { userId: string; apiKey: string },
    funds: number,
  ): Promise<void> {
    await db.query(
      `INSERT INTO users (id, email, password_hash, is_agent)
       VALUES ($1, $2, 'not-a-login', true)`,
      [who.userId, `mcp-test-${who.userId}@agentic.alchm.kitchen`],
    );
    await db.query(
      `INSERT INTO user_profiles (user_id, name) VALUES ($1, 'Test Alchemist')`,
      [who.userId],
    );
    await db.query(
      `INSERT INTO api_keys (name, key_hash, user_id, rate_limit_tier)
       VALUES ('mcp settlement test', $1, $2, 'alchemist')`,
      [createHash("sha256").update(who.apiKey).digest("hex"), who.userId],
    );
    await db.query(
      `INSERT INTO token_balances (user_id, spirit, essence, matter, substance)
       VALUES ($1, $2, $2, $2, $2)`,
      [who.userId, funds],
    );
  }

  function reflectionIdOf(result: ToolResult): string {
    const { data } = result;
    if (
      typeof data !== "object" ||
      data === null ||
      !("reflectionId" in data) ||
      typeof data.reflectionId !== "string"
    )
      throw new Error("The result carries no reflectionId");
    return data.reflectionId;
  }

  function call(
    who: { apiKey: string },
    name: string,
    args: Record<string, unknown>,
    idempotencyKey?: string,
  ): Promise<ToolResult> {
    return invokeTool(name, {
      ...args,
      _meta: {
        apiKey: who.apiKey,
        caller: "settlement-test",
        ...(idempotencyKey ? { idempotencyKey } : {}),
      },
    });
  }

  beforeAll(async () => {
    if (!databaseUrl) throw new Error("MCP_TEST_DATABASE_URL is required");
    const url = new URL(databaseUrl);
    if (
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      !/^\/mcp_test[a-z0-9_]*$/.test(url.pathname)
    ) {
      throw new Error("Settlement proof requires a disposable loopback mcp_test database");
    }
    for (const key of ["MCP_USER_API_KEY", "ALCHM_MCP_USER_API_KEY", "INTERNAL_API_SECRET"])
      delete process.env[key];
    // The code under test reads DATABASE_URL when its modules load.
    process.env.DATABASE_URL = databaseUrl;
    db = new Client({ connectionString: databaseUrl });
    await db.connect();
    await seedAgent(funded, 100);
    await seedAgent(broke, 0);
    ({ invokeTool } = await import("@/lib/mcp/tools"));
    ({ closeDatabase } = await import("@/lib/database/connection"));
  }, 30000);

  afterAll(async () => {
    await closeDatabase?.();
    await db?.end();
  });

  it("charges a recipe search once per idempotency key and refuses its reuse", async () => {
    const before = await balance(funded.userId);
    const first = await call(funded, "generate_cosmic_recipe", { prompt: "saffron" }, "search-1");
    const retry = await call(funded, "generate_cosmic_recipe", { prompt: "saffron" }, "search-1");
    const reused = await call(funded, "generate_cosmic_recipe", { prompt: "stew" }, "search-1");

    expect(first.ok).toBe(true);
    expect(first.billing).toMatchObject({ status: "charged" });
    expect(retry.ok).toBe(true);
    expect(retry.billing).toMatchObject({ status: "replayed", amounts: null });
    expect(reused.errorCode).toBe("CONFLICT");
    expect(reused.data).toBeNull();

    const after = await balance(funded.userId);
    for (const axis of AXES) expect(before[axis] - after[axis]).toBeCloseTo(2.5, 4);
    const rows = (await ledgerRows(funded.userId)).filter((row) =>
      row.source_id.startsWith("generate_cosmic_recipe#"),
    );
    expect(rows).toHaveLength(4);
    expect(new Set(rows.map((row) => row.source_id)).size).toBe(1);
    for (const row of rows) expect(row.idempotency_key).toMatch(/^mcp:[0-9a-f]{48}:(Spirit|Essence|Matter|Substance)$/);
  });

  it("refuses to replay a settlement older than the replay window", async () => {
    const first = await call(funded, "generate_cosmic_recipe", { prompt: "saffron" }, "search-old");
    expect(first.billing).toMatchObject({ status: "charged" });
    await db.query(
      `UPDATE token_transactions SET created_at = now() - interval '25 hours'
        WHERE user_id = $1 AND source_id LIKE 'generate_cosmic_recipe#%'`,
      [funded.userId],
    );
    const before = await balance(funded.userId);
    const late = await call(funded, "generate_cosmic_recipe", { prompt: "saffron" }, "search-old");
    expect(late.errorCode).toBe("CONFLICT");
    expect(await balance(funded.userId)).toEqual(before);
  });

  it("settles concurrent retries of one key exactly once", async () => {
    const before = await balance(funded.userId);
    const results = await Promise.all(
      Array.from({ length: 3 }, () =>
        call(funded, "generate_cosmic_recipe", { prompt: "saffron" }, "search-concurrent"),
      ),
    );
    const statuses = results.map((result) => result.billing?.status).sort();
    expect(statuses).toEqual(["charged", "replayed", "replayed"]);
    const after = await balance(funded.userId);
    for (const axis of AXES) expect(before[axis] - after[axis]).toBeCloseTo(2.5, 4);
  });

  it("charges unkeyed calls every time", async () => {
    const before = await balance(funded.userId);
    await call(funded, "generate_cosmic_recipe", { prompt: "saffron" });
    await call(funded, "generate_cosmic_recipe", { prompt: "saffron" });
    const after = await balance(funded.userId);
    for (const axis of AXES) expect(before[axis] - after[axis]).toBeCloseTo(5, 4);
  });

  it("stores a paid reflection as proposed, links its feed event, and replays it", async () => {
    const before = await balance(funded.userId);
    const args = { recipeId: "r1", reflection: "Saffron carries the Sun into the broth." };
    const first = await call(funded, "submit_recipe_reflection", args, "reflect-1");
    const retry = await call(funded, "submit_recipe_reflection", args, "reflect-1");

    expect(first.ok).toBe(true);
    expect(first.data).toMatchObject({ contentState: "proposed", published: true, replayed: false });
    expect(retry.data).toMatchObject({
      reflectionId: reflectionIdOf(first),
      replayed: true,
      published: true,
    });
    expect(retry.billing).toMatchObject({ status: "replayed" });

    const stored = await db.query<{
      id: string;
      content_state: string;
      delivery_key: string;
      feed_event_id: string | null;
    }>(
      `SELECT id, content_state, delivery_key, feed_event_id
         FROM recipe_reflections WHERE author_id = $1`,
      [funded.userId],
    );
    expect(stored.rows).toHaveLength(1);
    const [row] = stored.rows;
    expect(row?.id).toBe(reflectionIdOf(first));
    expect(row?.content_state).toBe("proposed");
    expect(row?.delivery_key).toMatch(/^mcp:[0-9a-f]{48}$/);
    const feed = await db.query<{ event_type: string; reflection_id: string }>(
      `SELECT event_type, metadata_payload->>'recipeReflectionId' AS reflection_id
         FROM feed_events WHERE id = $1`,
      [row?.feed_event_id],
    );
    expect(feed.rows).toEqual([{ event_type: "recipe_review", reflection_id: row?.id }]);
    const after = await balance(funded.userId);
    for (const axis of AXES) expect(before[axis] - after[axis]).toBeCloseTo(0.1, 4);
  });

  it("writes nothing for a reflection its author cannot pay for", async () => {
    const result = await call(
      broke,
      "submit_recipe_reflection",
      { recipeId: "r1", reflection: "An unaffordable thought." },
      "reflect-broke",
    );
    expect(result.errorCode).toBe("QUOTA");
    const reflections = await db.query(
      "SELECT 1 FROM recipe_reflections WHERE author_id = $1",
      [broke.userId],
    );
    expect(reflections.rowCount).toBe(0);
    expect(await ledgerRows(broke.userId)).toEqual([]);
  });

  it("keeps a paid reflection when its feed publication fails, and publishes it on retry", async () => {
    const args = { recipeId: "r1", reflection: "Publication can wait for the stars." };
    const before = await balance(funded.userId);
    // Refuse the feed insert so the savepoint has to undo an aborted transaction.
    await db.query(
      `ALTER TABLE feed_events ADD CONSTRAINT mcp_test_block_reviews
         CHECK (event_type <> 'recipe_review') NOT VALID`,
    );
    let first: ToolResult;
    try {
      first = await call(funded, "submit_recipe_reflection", args, "reflect-feed");
    } finally {
      await db.query("ALTER TABLE feed_events DROP CONSTRAINT mcp_test_block_reviews");
    }
    expect(first.ok).toBe(true);
    expect(first.data).toMatchObject({
      published: false,
      publicationReceipt: { feedPublished: false, feedEventId: null },
    });
    const reflectionId = reflectionIdOf(first);
    const unpublished = await db.query<{ feed_event_id: string | null }>(
      "SELECT feed_event_id FROM recipe_reflections WHERE id = $1",
      [reflectionId],
    );
    expect(unpublished.rows).toEqual([{ feed_event_id: null }]);

    const retry = await call(funded, "submit_recipe_reflection", args, "reflect-feed");
    expect(retry.data).toMatchObject({ reflectionId, replayed: true, published: true });
    const published = await db.query<{ feed_event_id: string | null }>(
      "SELECT feed_event_id FROM recipe_reflections WHERE id = $1",
      [reflectionId],
    );
    expect(published.rows[0]?.feed_event_id).toEqual(expect.any(String));
    const copies = await db.query(
      "SELECT 1 FROM recipe_reflections WHERE delivery_key = (SELECT delivery_key FROM recipe_reflections WHERE id = $1)",
      [reflectionId],
    );
    expect(copies.rowCount).toBe(1);
    const after = await balance(funded.userId);
    for (const axis of AXES) expect(before[axis] - after[axis]).toBeCloseTo(0.1, 4);
  });
});
