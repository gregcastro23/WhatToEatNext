#!/usr/bin/env bun
/**
 * Idempotent Verification & Migration Script for notification_type Enum Parity.
 *
 * Checks live database enum values against canonical migration specifications,
 * specifically verifying Migration 30 values ('quest_completed', 'master_quest_broadcast')
 * and Migration 88 ('agent_broadcast').
 *
 * Usage:
 *   DATABASE_URL=postgresql://... bun scripts/verifyNotificationEnumParity.ts
 *   DATABASE_URL=postgresql://... bun scripts/verifyNotificationEnumParity.ts --apply --confirm-host=<hostname>
 *
 * @file scripts/verifyNotificationEnumParity.ts
 */

import pkg from "pg";

const { Pool } = pkg;

import {
  CANONICAL_NOTIFICATION_TYPES,
  checkEnumParity,
} from "./lib/notificationEnumParity";

function getMigrationSource(val: string): string {
  switch (val) {
    case "quest_completed":
    case "master_quest_broadcast":
      return "Migration 30 (database/init/30-notification-type-master-quest-broadcast.sql)";
    case "transit_attunement":
      return "Migration 49 (database/init/49-notification-type-transit-attunement.sql)";
    case "table_invite":
    case "table_rsvp":
    case "table_going_live":
    case "table_memory_posted":
      return "Migration 61 (database/init/61-notification-types-tables.sql)";
    case "dm_message":
    case "circle_message":
    case "table_chat_mention":
      return "Migration 63 (database/init/63-notification-type-chat.sql)";
    case "new_follower":
      return "Migration 65 (database/init/65-notification-type-social-graph.sql)";
    case "reaction_received":
    case "comment_received":
      return "Migration 67 (database/init/67-notification-types-engagement.sql)";
    case "table_join_request":
      return "Migration 69 (database/init/69-notification-type-table-join-request.sql)";
    case "agent_broadcast":
      return "Migration 88 (database/init/88-notification-type-agent-broadcast.sql)";
    default:
      return "Migration 13 (database/init/13-notifications-schema.sql)";
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set. Please provide DATABASE_URL in environment.");
    process.exit(1);
  }

  const applyFixes = process.argv.includes("--apply");

  let parsedHost = "";
  try {
    const url = new URL(databaseUrl.replace(/^postgresql:\/\//, "http://"));
    parsedHost = url.hostname;
  } catch {
    parsedHost = "unknown";
  }

  if (applyFixes) {
    const isLocal = parsedHost === "localhost" || parsedHost === "127.0.0.1" || parsedHost === "";
    if (!isLocal) {
      const confirmArg = process.argv.find((arg) => arg.startsWith("--confirm-host="));
      const confirmedHost = confirmArg ? confirmArg.split("=")[1] : "";
      if (confirmedHost !== parsedHost) {
        console.error(`❌ SAFETY GUARD: Target database host is '${parsedHost}'.`);
        console.error(`To apply DDL changes to a non-local database, you must pass:`);
        console.error(`  --confirm-host=${parsedHost}\n`);
        process.exit(1);
      }
    }
  }

  const isLocal = parsedHost === "localhost" || parsedHost === "127.0.0.1" || parsedHost === "";
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocal || databaseUrl.includes("sslmode=") ? undefined : { rejectUnauthorized: false },
  });

  try {
    console.log(`Checking database notification_type enum parity on host: ${parsedHost}...`);
    const parity = await checkEnumParity(pool, applyFixes);

    console.log(`\nCurrent database enum values (${parity.currentValues.length}):`);
    console.log(parity.currentValues.map((v) => `  - ${v}`).join("\n"));

    if (parity.missingValues.length === 0) {
      console.log(`\n✅ 100% PARITY: Database notification_type contains all ${CANONICAL_NOTIFICATION_TYPES.length} canonical values.`);
      process.exit(0);
    }

    console.warn(`\n⚠️ ENUM GAP: Database is missing ${parity.missingValues.length} canonical value(s):`);
    for (const val of parity.missingValues) {
      console.warn(`  - '${val}' (${getMigrationSource(val)})`);
    }

    if (applyFixes) {
      console.log(`\n🎉 Applied ${parity.appliedValues?.length ?? 0} missing value(s) to database.`);
      process.exit(0);
    } else {
      console.log("\nTo apply these additions idempotently to the database, run with --apply:");
      console.log(`  bun scripts/verifyNotificationEnumParity.ts --apply --confirm-host=${parsedHost}\n`);
      console.log("Or execute directly in psql:");
      for (const val of parity.missingValues) {
        console.log(`  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS '${val}';`);
      }
      // Gating requirement: exit 1 on parity gaps when not running --apply
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

const isDirectRun = process.argv[1]?.includes("verifyNotificationEnumParity");
if (isDirectRun) {
  void main();
}
