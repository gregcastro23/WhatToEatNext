/** @jest-environment node */
import { Client } from "pg";

const mockQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockQuery(...args),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { agentPublicationService } from "@/services/agentPublicationService";
import { recipeReflectionsService } from "@/services/recipeReflectionsService";

const databaseUrl = process.env.PHASE45_TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

const actorId = "33333333-3333-4333-8333-333333333333";
const recipeId = "44444444-4444-4444-8444-444444444444";

suite("agent_publications and recipe_reflections against disposable PostgreSQL", () => {
  let db: Client;

  beforeAll(async () => {
    if (!databaseUrl) throw new Error("PHASE45_TEST_DATABASE_URL is required");
    const url = new URL(databaseUrl);
    if (
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      !/^\/phase45_test[a-z0-9_]*$/.test(url.pathname)
    ) {
      throw new Error(
        "Disposable proof requires a disposable loopback phase45_test database",
      );
    }

    db = new Client({ connectionString: databaseUrl });
    await db.connect();

    // Create session-local temp tables mirroring migration 94
    await db.query(`
      CREATE TEMP TABLE users (
        id uuid PRIMARY KEY,
        email text,
        is_agent boolean
      );

      CREATE TEMP TABLE user_profiles (
        user_id uuid PRIMARY KEY,
        name text
      );

      CREATE TEMP TABLE agent_publications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        principal_id varchar(128) NOT NULL,
        operation varchar(64) NOT NULL,
        delivery_key varchar(255) NOT NULL,
        payload_fingerprint varchar(64) NOT NULL,
        actor_id varchar(128),
        status varchar(32) NOT NULL DEFAULT 'in_flight',
        feed_event_id uuid,
        recipe_reflection_id uuid,
        menu_id varchar(128),
        feed_published boolean DEFAULT false,
        recipe_comment_status varchar(32) DEFAULT 'not_requested',
        legacy_interaction_status varchar(32) DEFAULT 'not_requested',
        receipt_payload jsonb,
        error_message text,
        locked_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_agent_publications_key UNIQUE (principal_id, operation, delivery_key)
      );

      CREATE TEMP TABLE recipe_reflections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        recipe_id varchar(128) NOT NULL,
        author_id uuid NOT NULL,
        publication_id uuid,
        feed_event_id uuid,
        delivery_key varchar(255),
        source varchar(64) NOT NULL DEFAULT 'recipe_alteration',
        content_state varchar(32) NOT NULL DEFAULT 'proposed',
        review text NOT NULL,
        score numeric(3, 2),
        is_agent boolean NOT NULL DEFAULT false,
        instruction_review_required boolean NOT NULL DEFAULT true,
        provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamptz,
        hidden boolean NOT NULL DEFAULT false
      );

      INSERT INTO users VALUES ('${actorId}', 'leonardo@agentic.alchm.kitchen', true);
      INSERT INTO user_profiles VALUES ('${actorId}', 'Leonardo');
    `);

    mockQuery.mockImplementation((sql: string, params: unknown[] = []) =>
      db.query(sql, params),
    );
  });

  afterAll(async () => {
    await db?.end();
  });

  beforeEach(async () => {
    await db.query("TRUNCATE pg_temp.agent_publications, pg_temp.recipe_reflections");
  });

  it("handles atomic reservation, replay, and payload conflicts in postgres", async () => {
    const deliveryKey = "pg-delivery-key-1";
    const fingerprint1 = "sha256_hash_version_1";
    const fingerprint2 = "sha256_hash_version_2";

    // 1. Initial reservation
    const prep1 = await agentPublicationService.preparePublication({
      principalId: "principal-pa",
      operation: "feed_publish",
      deliveryKey,
      actorId,
      payloadFingerprint: fingerprint1,
    });
    expect(prep1.kind).toBe("proceed");

    // 2. Complete publication
    await agentPublicationService.completePublication({
      publicationId: prep1.publicationId,
      feedPublished: true,
      receiptPayload: {
        success: true,
        schemaVersion: 1,
        deliveryId: deliveryKey,
        operation: "feed_publish",
        feedPublished: true,
      },
    });

    // 3. Replay with identical fingerprint returns replayed receipt
    const replay = await agentPublicationService.preparePublication({
      principalId: "principal-pa",
      operation: "feed_publish",
      deliveryKey,
      actorId,
      payloadFingerprint: fingerprint1,
    });
    expect(replay.kind).toBe("replayed");

    // 4. Replay with changed fingerprint returns payload_conflict
    const conflict = await agentPublicationService.preparePublication({
      principalId: "principal-pa",
      operation: "feed_publish",
      deliveryKey,
      actorId,
      payloadFingerprint: fingerprint2,
    });
    expect(conflict.kind).toBe("payload_conflict");
  });

  it("persists append-only recipe reflections in postgres", async () => {
    const r1 = await recipeReflectionsService.createReflection({
      recipeId,
      authorId: actorId,
      source: "recipe_alteration",
      review: "Postgres test reflection 1",
      score: 4,
      isAgent: true,
    });
    expect(r1.id).toBeDefined();

    const countRes = await db.query("SELECT count(*)::int AS count FROM pg_temp.recipe_reflections");
    expect(countRes.rows[0].count).toBe(1);
  });
});
