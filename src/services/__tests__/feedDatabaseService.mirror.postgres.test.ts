/** @jest-environment node */
import { Client } from "pg";

const mockQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockQuery(...args),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { feedDatabase } from "@/services/feedDatabaseService";

const databaseUrl = process.env.PHASE45_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;
const actorId = "11111111-1111-4111-8111-111111111111";
const recipeId = "22222222-2222-4222-8222-222222222222";

suite("recipe reflection mirror against disposable PostgreSQL", () => {
  let db: Client;
  beforeAll(async () => {
    if (!databaseUrl) throw new Error("PHASE45_TEST_DATABASE_URL is required");
    const url = new URL(databaseUrl);
    if (
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      !/^\/phase45_test[a-z0-9_]*$/.test(url.pathname)
    ) {
      throw new Error(
        "Mirror proof requires a disposable loopback phase45_test database",
      );
    }
    db = new Client({ connectionString: databaseUrl });
    await db.connect();
    // Session-local shadows run the exact production SQL without touching public rows.
    await db.query(`CREATE TEMP TABLE users(id uuid PRIMARY KEY, email text, is_agent boolean);
      CREATE TEMP TABLE user_profiles(user_id uuid PRIMARY KEY, name text, share_identity boolean);
      CREATE TEMP TABLE feed_events(actor_id uuid, event_type text, metadata_payload jsonb);
      CREATE TEMP TABLE user_recipe_interactions(
        user_id uuid, recipe_id uuid, made_it boolean, rating integer, review text,
        updated_at timestamptz DEFAULT now(), PRIMARY KEY(user_id, recipe_id));
      INSERT INTO users VALUES ('${actorId}','leonardo@agentic.alchm.kitchen',true);
      INSERT INTO user_profiles VALUES ('${actorId}','Leonardo',true);`);
    mockQuery.mockImplementation((sql: string, params: unknown[] = []) =>
      db.query(sql, params),
    );
  });

  afterAll(async () => {
    await db?.end();
  });
  beforeEach(async () => {
    await db.query(
      "TRUNCATE pg_temp.feed_events, pg_temp.user_recipe_interactions",
    );
  });

  async function interaction() {
    const result = await db.query<{
      made_it: boolean;
      rating: number | null;
      review: string;
      updated_at: Date;
    }>(
      "SELECT made_it,rating,review,updated_at FROM pg_temp.user_recipe_interactions WHERE user_id=$1 AND recipe_id=$2",
      [actorId, recipeId],
    );
    return result.rows;
  }

  it("keeps a prior explicit rating, cooking record, review and timestamp across repeated critiques", async () => {
    await db.query(
      `INSERT INTO pg_temp.user_recipe_interactions VALUES ($1,$2,true,4,'I cooked this recipe.','2025-01-01T12:00:00Z')`,
      [actorId, recipeId],
    );
    const original = await interaction();
    for (const text of [
      "A generated reflection.",
      "A later generated reflection.",
    ]) {
      expect(
        await feedDatabase.createEvent(
          actorId,
          "recipe_review",
          {
            recipeId,
            review: text,
            source: "catalog_critique",
            contentState: "curated",
          },
          true,
        ),
      ).toBe(true);
      expect(await interaction()).toEqual(original);
    }
    expect(
      (await db.query("SELECT count(*)::int AS n FROM pg_temp.feed_events"))
        .rows[0].n,
    ).toBe(2);
  });

  it("inserts a new reflection without inventing rating or cooking evidence and accepts a subsequent explicit rating", async () => {
    expect(
      await feedDatabase.createEvent(
        actorId,
        "recipe_review",
        {
          recipeId,
          review: "A generated reflection.",
          source: "catalog_critique",
        },
        true,
      ),
    ).toBe(true);
    expect(await interaction()).toEqual([
      expect.objectContaining({
        made_it: false,
        rating: null,
        review: "A generated reflection.",
      }),
    ]);

    expect(
      await feedDatabase.createEvent(
        actorId,
        "recipe_review",
        {
          recipeId,
          review: "I made it and rated it.",
          rating: 3,
          madeIt: true,
        },
        true,
      ),
    ).toBe(true);
    expect(await interaction()).toEqual([
      expect.objectContaining({
        made_it: true,
        rating: 3,
        review: "I made it and rated it.",
      }),
    ]);
  });

  it("preserves explicit rating and cooking fields when a later ordinary text event omits them", async () => {
    await db.query(
      `INSERT INTO pg_temp.user_recipe_interactions VALUES ($1,$2,true,4,'Original review.',now())`,
      [actorId, recipeId],
    );
    expect(
      await feedDatabase.createEvent(
        actorId,
        "recipe_review",
        {
          recipeId,
          review: "Updated written review.",
        },
        true,
      ),
    ).toBe(true);
    expect(await interaction()).toEqual([
      expect.objectContaining({
        made_it: true,
        rating: 4,
        review: "Updated written review.",
      }),
    ]);
  });

  it("confirms only feed publication when the optional interaction mirror fails", async () => {
    await db.query(
      "ALTER TABLE pg_temp.user_recipe_interactions RENAME TO hidden_interactions",
    );
    try {
      expect(
        await feedDatabase.createEvent(
          actorId,
          "recipe_review",
          {
            recipeId,
            review: "Still published to the feed.",
            source: "catalog_critique",
          },
          true,
        ),
      ).toBe(true);
      expect(
        (await db.query("SELECT count(*)::int AS n FROM pg_temp.feed_events"))
          .rows[0].n,
      ).toBe(1);
    } finally {
      await db.query(
        "ALTER TABLE pg_temp.hidden_interactions RENAME TO user_recipe_interactions",
      );
    }
  });
});
