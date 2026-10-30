/**
 * @jest-environment node
 *
 * Production persistence and feed writer over real PostgreSQL. Only the query
 * connection boundary is replaced. Separate clients share a randomly named
 * disposable schema so the primary-key contention is real, rather than an
 * in-memory simulation or queued statements on one connection.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { Client } from "pg";
import { AdaptationConflict, contentHash } from "../adaptationAgentBasis";
import {
  adaptationPublication,
  adaptationVersionId,
  loadSavedAdaptation,
  publishSavedAdaptation,
  saveAdaptation,
} from "../savedAdaptationPersistence";
import {
  AdaptationRecipeSchema,
  SAVED_ADAPTATION_SOURCE,
  SavedAdaptationSchema,
  type SavedAdaptation,
} from "../savedAdaptationSchemas";
import {
  ACTOR_ID,
  REQUEST,
  SOURCE_ID,
  savedFixture,
} from "./helpers/adaptationFixtures";

const mockQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockQuery(...args),
}));
jest.mock("@/lib/logger", () => ({
  _logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const databaseUrl = process.env.SAVED_ADAPTATION_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;
const queryClient = new AsyncLocalStorage<Client>();
const requester = "55555555-5555-4555-8555-555555555555";
const otherRequester = "66666666-6666-4666-8666-666666666666";
const otherActor = "77777777-7777-4777-8777-777777777777";
const otherRequestId = "88888888-8888-4888-8888-888888888888";

interface TestDatabase {
  control: Client;
  first: Client;
  second: Client;
  schema: string;
}

function disposableUrl(raw: string | undefined): string {
  if (!raw)
    throw new Error("SAVED_ADAPTATION_TEST_DATABASE_URL is required");
  const url = new URL(raw);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    !/^\/(?:phase45_test|cosmic_refund_test)(?:_[a-z0-9]+)*$/i.test(
      url.pathname,
    ) ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error(
      "Saved-adaptation proof requires an explicit disposable loopback test database URL without query overrides; no database was contacted",
    );
  }
  return raw;
}

function requiredStatement(sql: string, pattern: RegExp): string {
  const statement = sql.match(pattern)?.[0];
  if (!statement) throw new Error("Required production fixture DDL not found");
  return statement;
}

function versionFor(
  owner = requester,
  requestId = REQUEST.clientRequestId,
): SavedAdaptation {
  return savedFixture(adaptationVersionId(owner, requestId));
}

function editedVersion(version: SavedAdaptation): SavedAdaptation {
  const recipe = AdaptationRecipeSchema.parse({
    ...version.recipe,
    instructions: ["Steam firm tofu, then add the olive oil."],
  });
  return SavedAdaptationSchema.parse({
    ...version,
    recipe,
    receipt: { ...version.receipt, contentHash: contentHash(recipe) },
  });
}

suite("saved adaptations on disposable PostgreSQL", () => {
  let database: TestDatabase | undefined;
  const originalInternalSecret = process.env.INTERNAL_API_SECRET;

  function db(): TestDatabase {
    if (!database) throw new Error("Disposable database is not initialized");
    return database;
  }

  beforeAll(async () => {
    // Validate before constructing clients. Never fall back to application env.
    const connectionString = disposableUrl(databaseUrl);
    const schema = `phase45_adaptation_${randomUUID().replaceAll("-", "")}`;
    database = {
      control: new Client({ connectionString, ssl: false }),
      first: new Client({ connectionString, ssl: false }),
      second: new Client({ connectionString, ssl: false }),
      schema,
    };
    const { control, first, second } = db();
    await Promise.all([control.connect(), first.connect(), second.connect()]);
    await control.query(`CREATE SCHEMA "${schema}"`);
    await control.query(`SET search_path TO "${schema}", public`);

    const init = join(process.cwd(), "database", "init");
    const core = await readFile(join(init, "01-schema.sql"), "utf8");
    await control.query(
      requiredStatement(core, /CREATE TYPE user_role AS ENUM[^;]+;/),
    );
    await control.query(
      requiredStatement(core, /CREATE TABLE users \([\s\S]*?\n\);/),
    );
    await control.query(
      requiredStatement(
        core,
        /CREATE OR REPLACE FUNCTION update_updated_at_column\(\)[\s\S]*?\$\$ language 'plpgsql';/,
      ),
    );
    // Exact production migrations, including UUID PK, users FK and triggers.
    for (const migration of [
      "21-user-custom-recipes-schema.sql",
      "19-recipe-social-schema.sql",
      "23-agentic-users-schema.sql",
    ]) {
      await control.query(await readFile(join(init, migration), "utf8"));
    }
    // Only the feed actor lookup's profile projection is needed by this proof.
    await control.query(`CREATE TABLE user_profiles (
      user_id uuid PRIMARY KEY REFERENCES users(id), name text,
      share_identity boolean NOT NULL DEFAULT true
    )`);
    // Public is excluded during every production statement. A missing fixture
    // must fail instead of falling through to a persistent application table.
    for (const client of [control, first, second]) {
      await client.query(`SET search_path TO "${schema}", pg_catalog`);
      const isolation = await client.query<{ count: number; isolated: boolean }>(
        `SELECT count(*)::int AS count,
          bool_and(n.nspname=$1) AS isolated
         FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
         WHERE c.oid IN (to_regclass('users'),to_regclass('user_profiles'),
           to_regclass('user_custom_recipes'),to_regclass('feed_events'),
           to_regclass('user_recipe_interactions'))`,
        [schema],
      );
      expect(isolation.rows).toEqual([{ count: 5, isolated: true }]);
    }
    // Actual feed writer runs, but its optional outbound PA mirror is disabled.
    delete process.env.INTERNAL_API_SECRET;
  });

  beforeEach(async () => {
    const { control } = db();
    await control.query(
      "TRUNCATE user_custom_recipes,feed_events,user_recipe_interactions,user_profiles,users CASCADE",
    );
    await control.query(
      `INSERT INTO users(id,email,password_hash,is_agent)
       VALUES ($1,'leonardo-da-vinci@agentic.alchm.kitchen','test-only',true),
         ($2,'unrelated@agentic.alchm.kitchen','test-only',true)`,
      [ACTOR_ID, otherActor],
    );
    await control.query(
      "INSERT INTO user_profiles(user_id,name) VALUES ($1,'Leonardo'),($2,'Unrelated')",
      [ACTOR_ID, otherActor],
    );
    mockQuery.mockImplementation((sql: string, params: unknown[] = []) => {
      const client = queryClient.getStore();
      if (!client)
        throw new Error("Production query escaped the disposable client context");
      return client.query(sql, params);
    });
  });

  afterAll(async () => {
    if (originalInternalSecret === undefined)
      delete process.env.INTERNAL_API_SECRET;
    else process.env.INTERNAL_API_SECRET = originalInternalSecret;
    if (!database) return;
    const { first, second, control, schema } = database;
    await Promise.allSettled([first.end(), second.end()]);
    try {
      await control.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } finally {
      await control.end();
    }
  });

  async function rowCount(): Promise<number | undefined> {
    return (
      await db().control.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM user_custom_recipes",
      )
    ).rows[0]?.count;
  }

  it("contends on the actual primary key and returns one winner for concurrent same-request saves", async () => {
    const { control, first, second } = db();
    const version = versionFor();
    const firstPid = (await first.query<{ pid: number }>(
      "SELECT pg_backend_pid() AS pid",
    )).rows[0]?.pid;
    const secondPid = (await second.query<{ pid: number }>(
      "SELECT pg_backend_pid() AS pid",
    )).rows[0]?.pid;
    if (!firstPid || !secondPid) throw new Error("Backend PIDs unavailable");
    let committed = false;
    let concurrent: ReturnType<typeof saveAdaptation> | undefined;
    await first.query("BEGIN");
    try {
      // Hold the first insert open to force the second connection to encounter
      // the real uncommitted unique key rather than merely a completed replay.
      const winner = await queryClient.run(first, () => saveAdaptation(version));
      concurrent = queryClient.run(second, () =>
        saveAdaptation(editedVersion(version)),
      );
      let observedLock = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const blocking = await control.query<{ blocked: boolean }>(
          "SELECT $1::int=ANY(pg_blocking_pids($2::int)) AS blocked",
          [firstPid, secondPid],
        );
        if (blocking.rows[0]?.blocked) {
          observedLock = true;
          break;
        }
        await setTimeout(20);
      }
      expect(observedLock).toBe(true);
      await first.query("COMMIT");
      committed = true;
      const replay = await concurrent;
      expect(winner.inserted).toBe(true);
      expect(replay.inserted).toBe(false);
      expect(replay.version).toEqual(winner.version);
      expect(replay.version.id).toBe(version.id);
      expect(await rowCount()).toBe(1);
    } finally {
      if (!committed) await first.query("ROLLBACK");
      await concurrent?.catch(() => {});
    }
  });

  it("replays a lost response without overwriting the original and rejects changed request details", async () => {
    const { first, second } = db();
    const version = versionFor();
    await queryClient.run(first, () => saveAdaptation(version));
    const replay = await queryClient.run(second, () =>
      saveAdaptation(editedVersion(version)),
    );
    expect(replay).toEqual({ version, inserted: false });
    const changedRequest = SavedAdaptationSchema.parse({
      ...editedVersion(version),
      requestFingerprint: "b".repeat(64),
    });
    await expect(
      queryClient.run(second, () => saveAdaptation(changedRequest)),
    ).rejects.toBeInstanceOf(AdaptationConflict);
    expect(await queryClient.run(first, () => loadSavedAdaptation(version.id)))
      .toEqual(version);
    expect(await rowCount()).toBe(1);
  });

  it("keeps the same request ID independent across authenticated requesters", async () => {
    const { first, second } = db();
    const one = versionFor();
    const two = versionFor(otherRequester);
    expect(one.id).not.toBe(two.id);
    const results = await Promise.all([
      queryClient.run(first, () => saveAdaptation(one)),
      queryClient.run(second, () => saveAdaptation(two)),
    ]);
    expect(results.every((result) => result.inserted)).toBe(true);
    expect(await rowCount()).toBe(2);
    expect(await queryClient.run(first, () => loadSavedAdaptation(one.id)))
      .toEqual(one);
    expect(await queryClient.run(second, () => loadSavedAdaptation(two.id)))
      .toEqual(two);
  });

  it("retains two immutable versions for distinct request IDs and round-trips the content hash through JSONB", async () => {
    const { control, first, second } = db();
    const one = versionFor();
    const two = editedVersion(versionFor(requester, otherRequestId));
    await queryClient.run(first, () => saveAdaptation(one));
    await queryClient.run(second, () => saveAdaptation(two));
    expect(await rowCount()).toBe(2);
    const stored = await control.query<{ payload: unknown; serialized: string }>(
      "SELECT payload,payload::text AS serialized FROM user_custom_recipes WHERE id=$1",
      [one.id],
    );
    expect(stored.rows[0]?.payload).toEqual(one);
    // JSONB canonicalizes key ordering; runtime validation must survive that.
    expect(stored.rows[0]?.serialized).not.toBe(JSON.stringify(one));
    expect(await queryClient.run(first, () => loadSavedAdaptation(one.id)))
      .toEqual(one);
    expect(await queryClient.run(second, () => loadSavedAdaptation(two.id)))
      .toEqual(two);
    expect(one.receipt.contentHash).not.toBe(two.receipt.contentHash);
  });

  it("enforces the real actor foreign key and refuses unreadable changed content without repair", async () => {
    const { control, first } = db();
    const version = versionFor();
    const absentActor = SavedAdaptationSchema.parse({
      ...version,
      receipt: {
        ...version.receipt,
        actor: { ...version.receipt.actor, id: requester },
      },
    });
    await expect(
      queryClient.run(first, () => saveAdaptation(absentActor)),
    ).rejects.toMatchObject({ code: "23503" });
    expect(await rowCount()).toBe(0);
    await queryClient.run(first, () => saveAdaptation(version));
    await control.query(
      `UPDATE user_custom_recipes SET payload=jsonb_set(payload,
        '{recipe,instructions}', '["Changed without updating the receipt hash"]'::jsonb)
       WHERE id=$1`,
      [version.id],
    );
    await expect(
      queryClient.run(first, () => loadSavedAdaptation(version.id)),
    ).rejects.toThrow("unreadable");
    const preserved = await control.query<{ unchanged: boolean }>(
      "SELECT payload#>>'{recipe,instructions,0}'=$2 AS unchanged FROM user_custom_recipes WHERE id=$1",
      [version.id, "Changed without updating the receipt hash"],
    );
    expect(preserved.rows).toEqual([{ unchanged: true }]);
    expect(await rowCount()).toBe(1);
  });

  it("requires a saved matching actor/source/original/action before confirming publication", async () => {
    const { control, first } = db();
    const version = versionFor();
    await queryClient.run(first, () => saveAdaptation(version));
    const metadata = {
      versionId: version.id,
      source: SAVED_ADAPTATION_SOURCE,
      recipeId: SOURCE_ID,
      action: "adapted",
    };
    for (const [actor, payload] of [
      [otherActor, metadata],
      [ACTOR_ID, { ...metadata, source: "agent" }],
      [ACTOR_ID, { ...metadata, recipeId: "another-original" }],
      [ACTOR_ID, { ...metadata, action: "preview" }],
      [ACTOR_ID, { ...metadata, versionId: otherRequestId }],
    ]) {
      await control.query(
        "INSERT INTO feed_events(actor_id,event_type,metadata_payload) VALUES ($1,'recipe_adapted',$2::jsonb)",
        [actor, JSON.stringify(payload)],
      );
    }
    expect(await queryClient.run(first, () => adaptationPublication(version.id)))
      .toBe("not-published");
    await control.query(
      "INSERT INTO feed_events(actor_id,event_type,metadata_payload) VALUES ($1,'recipe_adapted',$2::jsonb)",
      [ACTOR_ID, JSON.stringify(metadata)],
    );
    expect(await queryClient.run(first, () => adaptationPublication(version.id)))
      .toBe("published");
    expect(await queryClient.run(first, () => adaptationPublication(otherRequestId)))
      .toBe("not-published");
  });

  it("persists the actual Adapted feed event without adding rating/cooking evidence or changing an existing interaction", async () => {
    const { control, first } = db();
    const version = versionFor();
    await queryClient.run(first, () => saveAdaptation(version));
    expect(await queryClient.run(first, () => publishSavedAdaptation(version)))
      .toBe("published");
    expect(await queryClient.run(first, () => adaptationPublication(version.id)))
      .toBe("published");
    expect((await control.query("SELECT * FROM user_recipe_interactions")).rows)
      .toEqual([]);
    const feed = await control.query<{ actor_id: string; metadata_payload: unknown }>(
      "SELECT actor_id,metadata_payload FROM feed_events WHERE event_type='recipe_adapted'",
    );
    expect(feed.rows).toHaveLength(1);
    expect(feed.rows[0]?.actor_id).toBe(ACTOR_ID);
    expect(feed.rows[0]?.metadata_payload).toMatchObject({
      versionId: version.id,
      recipeId: SOURCE_ID,
      action: "adapted",
      source: SAVED_ADAPTATION_SOURCE,
    });
    for (const key of ["rating", "madeIt", "made_it", "review"])
      expect(feed.rows[0]?.metadata_payload).not.toHaveProperty(key);

    await control.query(
      `INSERT INTO user_recipe_interactions(user_id,recipe_id,made_it,rating,review,updated_at)
       VALUES ($1,$2,true,4,'I cooked this recipe.','2025-01-01T12:00:00Z')`,
      [ACTOR_ID, SOURCE_ID],
    );
    const original = (await control.query("SELECT * FROM user_recipe_interactions")).rows;
    expect(await queryClient.run(first, () => publishSavedAdaptation(version)))
      .toBe("published");
    expect((await control.query("SELECT * FROM user_recipe_interactions")).rows)
      .toEqual(original);
  });
});
