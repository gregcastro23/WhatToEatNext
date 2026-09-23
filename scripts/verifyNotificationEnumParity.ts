#!/usr/bin/env bun
/**
 * Idempotent Verification & Migration Script for notification_type Enum Parity.
 *
 * Checks live database enum values against canonical migration specifications,
 * specifically verifying Migration 30 values ('quest_completed', 'master_quest_broadcast').
 *
 * Usage:
 *   DATABASE_URL=postgresql://... bun scripts/verifyNotificationEnumParity.ts
 *   DATABASE_URL=postgresql://... bun scripts/verifyNotificationEnumParity.ts --apply
 *
 * @file scripts/verifyNotificationEnumParity.ts
 */

import pkg from "pg";

const { Pool } = pkg;

import {
  CANONICAL_DB_NOTIFICATION_TYPES,
  checkEnumParity,
} from "./lib/notificationEnumParity";

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set. Please provide DATABASE_URL in environment.");
    process.exit(1);
  }

  const applyFixes = process.argv.includes("--apply");
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log("Checking database notification_type enum parity...");
    const parity = await checkEnumParity(pool, applyFixes);

    console.log(`\nCurrent database enum values (${parity.currentValues.length}):`);
    console.log(parity.currentValues.map((v) => `  - ${v}`).join("\n"));

    if (parity.missingValues.length === 0) {
      console.log("\n✅ 100% PARITY: Database notification_type contains all 19 canonical values.");
      process.exit(0);
    }

    console.warn(`\n⚠️ ENUM GAP: Database is missing ${parity.missingValues.length} canonical value(s):`);
    for (const val of parity.missingValues) {
      const source = (val === "quest_completed" || val === "master_quest_broadcast")
        ? "Migration 30 (database/init/30-notification-type-master-quest-broadcast.sql)"
        : (val === "reaction_received" || val === "comment_received")
        ? "Migration 67 (database/init/67-social-notifications.sql)"
        : "Core Migration";
      console.warn(`  - '${val}' (${source})`);
    }

    if (applyFixes) {
      console.log(`\n🎉 Applied ${parity.appliedValues?.length ?? 0} missing value(s) to live database.`);
    } else {
      console.log("\nTo apply these additions idempotently to the database, run with --apply:");
      console.log("  bun scripts/verifyNotificationEnumParity.ts --apply\n");
      console.log("Or execute directly in psql:");
      for (const val of parity.missingValues) {
        console.log(`  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS '${val}';`);
      }
    }
  } finally {
    await pool.end();
  }
}

if (import.meta.main) {
  void main();
}
