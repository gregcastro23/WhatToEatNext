/**
 * CI / Verification Gate: Do admin, asolHealth, and inbox SQL queries parse and execute against PostgreSQL?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Telemetry and inbox handlers rely on PostgreSQL parameter type deduction, JSONB
 * operators, INTERVAL math, and UNIQUE constraints on `webhook_events` and `users`.
 * Unit tests mock executeQuery, which cannot detect SQL syntax errors, wrong column
 * names, or bind parameter type mismatches.
 *
 * This verification script:
 *   1. Imports the live SQL statements from `asolHealthQueries.ts`, `inbox.ts`,
 *      idempotency, and shared admin SQL with ZERO regex scraping.
 *   2. Proves the gate detects broken SQL using a failing control (undefined column).
 *   3. PREPAREs all 13 shipped statements against live PostgreSQL (parse + type analysis).
 *   4. Establishes session-local TEMP tables shadowing `webhook_events` and `users`,
 *      verifying `relnamespace = pg_my_temp_schema()` so writes never touch shared tables.
 *   5. Exercises the complete claim, conflict, duplicate, completion, failure,
 *      retry, and telemetry query lifecycle on the TEMP schema.
 *   6. Pins every operation to one transaction/backend, then rolls it all back.
 *      A one-time TEMP check is insufficient through transaction-mode PgBouncer.
 *
 * Usage:
 *   bun scripts/checkAdminInboxSqlParses.ts
 *
 * @file scripts/checkAdminInboxSqlParses.ts
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import pg from "pg";
import {
  ASOL_SOURCES,
  OVERALL_HEALTH_24H_QUERY,
  RECENT_EVENTS_QUERY,
  SIGNATURE_BREAKDOWN_QUERY,
  SOURCE_HEALTH_24H_QUERY,
} from "../src/services/admin/asolHealthQueries";
import {
  CLAIM_INSERT_SQL,
  CLAIM_RETRY_SQL,
  COMPLETE_SQL,
  FAIL_SQL,
  MARK_DUPLICATE_SQL,
  STALE_LOCK_SECONDS,
  STORED_RESULT_SQL as IDEMPOTENCY_QUERY,
} from "../src/lib/hooks/inbox";
import {
  AGENT_ACTION_METRICS_SQL,
  AGENT_PULSE_ROSTER_SQL as ROSTER_QUERY,
  AGENT_ROSTER_STATS_SQL,
} from "../src/services/admin/adminAgentSql";

function resolveDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
  if (!url) {
    const candidates = [".env", "../../.env", "../.env"];
    for (const cand of candidates) {
      try {
        const env = readFileSync(cand, "utf8");
        for (const line of env.split("\n")) {
          if (line.startsWith("DATABASE_PUBLIC_URL=")) {
            url = line.split("=").slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
            if (url) return url;
          }
          if (line.startsWith("DATABASE_URL=")) {
            url = line.split("=").slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
            if (url) return url;
          }
        }
      } catch {
        // try next candidate
      }
    }
  }
  return url;
}

export async function checkAdminInboxSql(client: pg.Client): Promise<number> {
  // BEGIN pins the server backend even under transaction-mode PgBouncer. All
  // TEMP creation, resolution checks, and unqualified fixture statements must
  // remain inside this boundary; ROLLBACK removes the fixture relations too.
  await client.query("BEGIN");
  try {
    return await checkAdminInboxInTransaction(client);
  } finally {
    await client.query("ROLLBACK");
  }
}

async function checkAdminInboxInTransaction(client: pg.Client): Promise<number> {
  // ── Control 1: PREPARE rejection on undefined column ───────────────────────
  let controlPassed = false;
  await client.query("SAVEPOINT invalid_column_control");
  try {
    await client.query(
      "PREPARE _bad_ctrl AS SELECT nonexistent_column_xyz FROM webhook_events WHERE source = ANY($1::text[])",
    );
    await client.query("DEALLOCATE _bad_ctrl");
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "42703") {
      controlPassed = true;
    }
  } finally {
    // The intentional PostgreSQL error aborts the current transaction until
    // this savepoint is restored. Keep the outer backend pin in force.
    await client.query("ROLLBACK TO SAVEPOINT invalid_column_control");
    await client.query("RELEASE SAVEPOINT invalid_column_control");
  }
  if (!controlPassed) {
    throw new Error("Failing control failed: PREPARE accepted invalid column query");
  }
  console.log("✓ Control: PREPARE rejects invalid column query (code 42703)");

  // ── 1. PREPARE all 13 shipped statements against PostgreSQL ───────────────
  const statements = [
    { name: "_stmt_overall", sql: OVERALL_HEALTH_24H_QUERY },
    { name: "_stmt_source", sql: SOURCE_HEALTH_24H_QUERY },
    { name: "_stmt_sig", sql: SIGNATURE_BREAKDOWN_QUERY },
    { name: "_stmt_recent", sql: RECENT_EVENTS_QUERY },
    { name: "_stmt_claim_insert", sql: CLAIM_INSERT_SQL },
    { name: "_stmt_claim_retry", sql: CLAIM_RETRY_SQL },
    { name: "_stmt_mark_dup", sql: MARK_DUPLICATE_SQL },
    { name: "_stmt_complete", sql: COMPLETE_SQL },
    { name: "_stmt_fail", sql: FAIL_SQL },
    { name: "_stmt_idempotency", sql: IDEMPOTENCY_QUERY },
    { name: "_stmt_roster", sql: ROSTER_QUERY },
    { name: "_stmt_actions", sql: AGENT_ACTION_METRICS_SQL },
    { name: "_stmt_roster_stats", sql: AGENT_ROSTER_STATS_SQL },
  ];

  for (const stmt of statements) {
    await client.query(`PREPARE ${stmt.name} AS ${stmt.sql}`);
    await client.query(`DEALLOCATE ${stmt.name}`);
  }
  console.log(`✓ PREPARE: all ${statements.length} shipped statements prepared successfully against PostgreSQL`);

  // ── 2. Session TEMP table isolation ────────────────────────────────────────
  await client.query(`
    CREATE TEMP TABLE webhook_events (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      source text NOT NULL,
      event_id text NOT NULL,
      event_type text NOT NULL,
      subject_id text,
      occurred_at timestamptz,
      received_at timestamptz NOT NULL DEFAULT now(),
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      status text NOT NULL DEFAULT 'processing'::text,
      attempts integer NOT NULL DEFAULT 1,
      duplicates integer NOT NULL DEFAULT 0,
      last_received_at timestamptz NOT NULL DEFAULT now(),
      locked_at timestamptz DEFAULT now(),
      processed_at timestamptz,
      latency_ms integer,
      last_error text,
      result jsonb NOT NULL DEFAULT '{}'::jsonb,
      CONSTRAINT temp_webhook_events_source_event_id_key UNIQUE (source, event_id)
    );
    CREATE TEMP TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text,
      is_agent boolean NOT NULL DEFAULT false
    );
    CREATE TEMP TABLE request_log_entries (
      path text NOT NULL, status integer NOT NULL,
      latency_ms integer NOT NULL, at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const isoCheck = await client.query<{ count: number; isolated: boolean }>(`
    SELECT count(*)::int AS count, bool_and(relnamespace = pg_my_temp_schema()) AS isolated
    FROM pg_class
    WHERE oid IN (to_regclass('webhook_events'), to_regclass('users'), to_regclass('request_log_entries'))
  `);
  assert.equal(isoCheck.rows[0]?.count, 3, "All three fixture relations must resolve");
  assert.equal(isoCheck.rows[0]?.isolated, true, "All fixture names must resolve to temporary tables");
  console.log("✓ Isolation: webhook_events, users, and request_log_entries resolve to pg_my_temp_schema");

  let passedScenarios = 0;

  // ── Scenario 1: Initial claim insert ───────────────────────────────────────
  const claimRes1 = await client.query<{ id: string; attempts: number }>(CLAIM_INSERT_SQL, [
    "asol-sync-event",
    "evt-phase45-001",
    "sync_yield",
    "agent-001",
    new Date(),
    JSON.stringify({ signature: "valid", balance: 50 }),
  ]);
  assert.equal(claimRes1.rowCount, 1);
  const claimedId = claimRes1.rows[0]?.id;
  assert.equal(claimRes1.rows[0]?.attempts, 1);
  passedScenarios += 1;
  console.log("PASS Scenario 1: fresh event claimed with attempts=1");

  // ── Scenario 2: Idempotent duplicate claim (ON CONFLICT DO NOTHING) ───────
  const claimResDup = await client.query<{ id: string; attempts: number }>(CLAIM_INSERT_SQL, [
    "asol-sync-event",
    "evt-phase45-001",
    "sync_yield",
    "agent-001",
    new Date(),
    JSON.stringify({ signature: "valid", balance: 50 }),
  ]);
  assert.equal(claimResDup.rowCount, 0, "Duplicate insert must return 0 rows on conflict");
  passedScenarios += 1;
  console.log("PASS Scenario 2: duplicate insert returns 0 rows via ON CONFLICT DO NOTHING");

  // ── Scenario 3: Mark duplicate increments duplicates count ─────────────────
  const dupRes = await client.query<{ status: string }>(MARK_DUPLICATE_SQL, [
    "asol-sync-event",
    "evt-phase45-001",
  ]);
  assert.equal(dupRes.rowCount, 1);
  assert.equal(dupRes.rows[0]?.status, "processing");
  passedScenarios += 1;
  console.log("PASS Scenario 3: mark duplicate returns current status and increments counter");

  // ── Scenario 4: Complete execution with latency and result ────────────────
  await client.query(COMPLETE_SQL, [
    claimedId,
    "processed",
    125,
    JSON.stringify({ credited: true, netAmount: 10 }),
  ]);
  const idemRes = await client.query<{ result: { credited: boolean; netAmount: number } }>(
    IDEMPOTENCY_QUERY,
    ["asol-sync-event", "evt-phase45-001"],
  );
  assert.equal(idemRes.rows[0]?.result.credited, true);
  assert.equal(idemRes.rows[0]?.result.netAmount, 10);
  passedScenarios += 1;
  console.log("PASS Scenario 4: complete updates status to processed and idempotency query retrieves result");

  // ── Scenario 5: Failure recording and stale/failed claim retry ────────────
  const claimRes2 = await client.query<{ id: string; attempts: number }>(CLAIM_INSERT_SQL, [
    "asol-feed",
    "evt-phase45-002",
    "agent_post",
    "agent-002",
    new Date(),
    JSON.stringify({ signature: "unsigned" }),
  ]);
  assert.equal(claimRes2.rowCount, 1);
  const failId = claimRes2.rows[0]?.id;

  await client.query(FAIL_SQL, [failId, 350, "Verification timeout in test harness"]);
  const retryRes = await client.query<{ id: string; attempts: number }>(CLAIM_RETRY_SQL, [
    "asol-feed",
    "evt-phase45-002",
    STALE_LOCK_SECONDS,
  ]);
  assert.equal(retryRes.rowCount, 1);
  assert.equal(retryRes.rows[0]?.attempts, 2);
  passedScenarios += 1;
  console.log("PASS Scenario 5: failed claim updates status and CLAIM_RETRY_SQL increments attempts");

  // ── Scenario 6: asolHealth overall and source aggregation queries ─────────
  const sourcesParam = [[...ASOL_SOURCES]];
  const overallRes = await client.query(OVERALL_HEALTH_24H_QUERY, sourcesParam);
  assert.equal(overallRes.rowCount, 1);
  const overall = overallRes.rows[0];
  assert.equal(overall.total_received, 2);
  assert.equal(overall.total_processed, 1);
  assert.equal(overall.total_in_flight, 1);
  assert.equal(overall.total_duplicates, 1);
  passedScenarios += 1;
  console.log("PASS Scenario 6: OVERALL_HEALTH_24H_QUERY executes and returns expected telemetry aggregates");

  // ── Scenario 7: Source and signature breakdowns ───────────────────────────
  const sourceRes = await client.query(SOURCE_HEALTH_24H_QUERY, sourcesParam);
  assert.equal(sourceRes.rowCount, 2); // asol-sync-event and asol-feed

  const sigRes = await client.query(SIGNATURE_BREAKDOWN_QUERY, sourcesParam);
  assert.equal(sigRes.rowCount, 2);

  // NOW() is constant inside the pinned transaction. Give the fixture receipts
  // distinct times so this exercises DESC ordering rather than a timestamp tie.
  await client.query(
    "UPDATE pg_temp.webhook_events SET received_at = received_at - INTERVAL '1 second' WHERE id = $1",
    [claimedId],
  );
  const recentRes = await client.query(RECENT_EVENTS_QUERY, [sourcesParam[0], null]);
  assert.equal(recentRes.rowCount, 2);
  assert.equal(recentRes.rows[0]?.event_id, "evt-phase45-002");
  passedScenarios += 1;
  console.log("PASS Scenario 7: SOURCE_HEALTH, SIGNATURE_BREAKDOWN, and RECENT_EVENTS execute with expected groupings");

  // ── Scenario 8: Agent roster query ─────────────────────────────────────────
  await client.query("INSERT INTO pg_temp.users (name, is_agent) VALUES ('Solana Agent', true), ('Human User', false)");
  const rosterRes = await client.query<{ count: number }>(ROSTER_QUERY);
  assert.equal(rosterRes.rows[0]?.count, 1);
  passedScenarios += 1;
  console.log("PASS Scenario 8: ROSTER_QUERY accurately filters is_agent = true");

  // Both edges of every class: 399 is a success, 400/499 are client failures,
  // 402 and 409 are expected refusals (insufficient_funds, already_applied),
  // 500/599 are server failures.
  await client.query(`INSERT INTO pg_temp.request_log_entries(path,status,latency_ms)
    VALUES ('/api/feed',200,10),('/api/feed',399,10),('/api/feed',400,10),('/api/feed',499,10),
           ('/api/feed',402,10),('/api/feed',409,10),('/api/feed',500,30),('/api/feed',599,30),
           ('/api/other',200,5)`);
  const actions = await client.query(AGENT_ACTION_METRICS_SQL, [["/api/feed"]]);
  assert.equal(actions.rows.length, 1);
  assert.equal(actions.rows[0].total, 8);
  assert.equal(actions.rows[0].successes, 2);
  assert.equal(actions.rows[0].client_failures, 2, "400 and 499 are failures; 402 and 409 are not");
  assert.equal(actions.rows[0].refusals, 2, "402 and 409 only");
  assert.equal(actions.rows[0].server_failures, 2);
  assert.equal(
    actions.rows[0].successes + actions.rows[0].client_failures + actions.rows[0].refusals + actions.rows[0].server_failures,
    actions.rows[0].total,
    "every status lands in exactly one column",
  );
  passedScenarios += 1;
  console.log("PASS Scenario 9: shipped action metrics filter and aggregate the TEMP request log");

  // ── Scenario 10: an agent is ACTIVE when it has a feed event, not when it signed in ──
  await client.query(
    "CREATE TEMP TABLE feed_events (actor_id uuid, created_at timestamptz NOT NULL DEFAULT now())",
  );
  const feedIso = await client.query<{ isolated: boolean }>(
    "SELECT relnamespace = pg_my_temp_schema() AS isolated FROM pg_class WHERE oid = to_regclass('feed_events')",
  );
  assert.equal(feedIso.rows[0]?.isolated, true, "feed_events must resolve to the temporary fixture");
  await client.query("INSERT INTO pg_temp.users (name, is_agent) VALUES ('Idle Agent', true)");
  await client.query(`INSERT INTO pg_temp.feed_events (actor_id)
    SELECT u.id FROM pg_temp.users u, generate_series(1, 3) WHERE u.name = 'Solana Agent'`);
  await client.query(
    "INSERT INTO pg_temp.feed_events (actor_id) SELECT id FROM pg_temp.users WHERE name = 'Human User'",
  );
  await client.query(`INSERT INTO pg_temp.feed_events (actor_id, created_at)
    SELECT id, now() - interval '2 days' FROM pg_temp.users WHERE name = 'Idle Agent'`);
  const roster = await client.query<{ total_agents: number; active_agents: number }>(AGENT_ROSTER_STATS_SQL);
  assert.equal(roster.rows[0]?.total_agents, 2);
  assert.equal(
    roster.rows[0]?.active_agents,
    1,
    "three events by one agent count once; a human's event and a 2-day-old event do not count",
  );
  passedScenarios += 1;
  console.log("PASS Scenario 10: active agents are counted from feed events in the last 24 h");

  console.log(`Admin/Inbox SQL: ${passedScenarios} isolated PostgreSQL scenarios passed.`);
  return passedScenarios;
}

if (import.meta.main) {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.log("ℹ️ Skipping checkAdminInboxSql: no DATABASE_PUBLIC_URL / DATABASE_URL configured in environment");
    process.exit(0);
  }
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await checkAdminInboxSql(client);
  } finally {
    await client.end();
  }
}
