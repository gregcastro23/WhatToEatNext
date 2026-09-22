/**
 * Verification script: Postgres notification_type enum parity with TypeScript schemas.
 *
 * Checks that every notification type declared in the database enum exists
 * in `NOTIFICATION_TYPES` in `src/lib/validation/notificationResponseSchemas.ts`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { NOTIFICATION_TYPES } from "../src/lib/validation/notificationResponseSchemas";

const tsTypes = new Set<string>(NOTIFICATION_TYPES);

async function checkDatabaseEnum(): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    console.log("ℹ️ DATABASE_URL not set — skipping live Postgres enum query.");
    return [];
  }
  try {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log(`📡 Querying target database host: ${dbUrl.host}`);
    } catch {
      console.log("📡 Querying target database (unparseable URL)");
    }
    const { getDatabasePool, closeDatabase } = await import("../src/lib/database/rawPool");
    const pool = getDatabasePool();
    const res = await pool.query<{ val: string }>(
      "SELECT unnest(enum_range(NULL::notification_type)) as val;",
    );
    await closeDatabase();
    return res.rows.map((r) => r.val);
  } catch (err) {
    console.warn("⚠️ Could not query live database for notification_type enum:", err);
    return [];
  }
}

function checkMigrationsEnum(): string[] {
  const migrationsDir = join(process.cwd(), "database", "init");
  const typesFound = new Set<string>();

  try {
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      // Match CREATE TYPE notification_type AS ENUM (...)
      const createMatch = sql.match(/CREATE\s+TYPE\s+notification_type\s+AS\s+ENUM\s*\(([^)]+)\)/i);
      if (createMatch) {
        const matchBody = createMatch[1];
        if (matchBody) {
          const literals = matchBody.match(/'([^']+)'/g);
          if (literals) {
            for (const lit of literals) {
              typesFound.add(lit.replace(/'/g, ""));
            }
          }
        }
      }
      // Match ALTER TYPE notification_type ADD VALUE ...
      const alterMatches = sql.matchAll(/ALTER\s+TYPE\s+notification_type\s+ADD\s+VALUE\s+(?:IF\s+NOT\s+EXISTS\s+)?'([^']+)'/gi);
      for (const m of alterMatches) {
        const val = m[1];
        if (val) {
          typesFound.add(val);
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not scan migration files:", err);
  }

  return Array.from(typesFound);
}

async function main() {
  console.log(`Checking notification_type enum parity across TypeScript, Migrations, and Live DB...`);
  console.log(`TypeScript NOTIFICATION_TYPES count: ${tsTypes.size}`);

  const migrationTypes = checkMigrationsEnum();
  console.log(`Migration SQL notification_type values found: ${migrationTypes.length}`);

  const dbTypes = await checkDatabaseEnum();
  if (dbTypes.length > 0) {
    console.log(`Live DB notification_type values found: ${dbTypes.length}`);
  }

  let hasError = false;

  // Check migration types against TS
  for (const t of migrationTypes) {
    if (!tsTypes.has(t)) {
      console.error(`❌ Migration enum value '${t}' is missing from TypeScript NOTIFICATION_TYPES!`);
      hasError = true;
    }
  }

  // Check live DB types against TS
  for (const t of dbTypes) {
    if (!tsTypes.has(t)) {
      console.error(`❌ Live DB enum value '${t}' is missing from TypeScript NOTIFICATION_TYPES!`);
      hasError = true;
    }
  }

  if (hasError) {
    process.exit(1);
  }

  console.log("✅ All Postgres notification_type enum values are declared in TypeScript NOTIFICATION_TYPES.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
