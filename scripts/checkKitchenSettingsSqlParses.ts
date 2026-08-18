/**
 * CI / Verification Gate: Does kitchenSettingsService SQL actually PARSE and EXECUTE against PostgreSQL?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The kitchen-settings unit tests mock executeQuery, which tests TypeScript mappings
 * but cannot verify PostgreSQL query validity, parameter type deduction, JSONB
 * operators, or column constraints.
 *
 * This script runs against live PostgreSQL inside a strictly rolled-back transaction:
 *   1. PREPAREs all 3 kitchenSettingsService SQL statements.
 *   2. Provisions a temporary test user in `users` (inside transaction).
 *   3. EXECUTES the INSERT, UPDATE, and SELECT queries with real UUIDs, numeric
 *      elevations, JSONB settings payloads, and basis enums.
 *   4. Verifies constraint enforcement (e.g. invalid basis rejection).
 *   5. Rolls back completely so zero rows or side effects persist.
 *
 * Usage:
 *   bun scripts/checkKitchenSettingsSqlParses.ts
 */

import pg from "pg";
import { readFileSync } from "node:fs";

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const env = readFileSync(".env", "utf8");
let dbUrl = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!dbUrl) {
  for (const line of env.split("\n")) {
    if (line.startsWith("DATABASE_PUBLIC_URL=")) {
      dbUrl = line.split("=")[1].trim().replace(/^['\"]|['\"]$/g, "");
      break;
    }
  }
}

if (!dbUrl) fail("No DATABASE_PUBLIC_URL / DATABASE_URL found");

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

const UPDATE_SQL = `
  UPDATE user_profiles
  SET
    kitchen_elevation_m = COALESCE($2::numeric, kitchen_elevation_m),
    kitchen_elevation_basis = COALESCE($3::varchar, kitchen_elevation_basis),
    kitchen_settings = COALESCE(user_profiles.kitchen_settings, '{}'::jsonb) || $4::jsonb,
    updated_at = NOW()
  WHERE user_id = $1::uuid
  RETURNING user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at;
`;

const INSERT_SQL = `
  INSERT INTO user_profiles (
    user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at
  ) VALUES (
    $1::uuid, $2::numeric, $3::varchar, $4::jsonb, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    kitchen_elevation_m = EXCLUDED.kitchen_elevation_m,
    kitchen_elevation_basis = EXCLUDED.kitchen_elevation_basis,
    kitchen_settings = COALESCE(user_profiles.kitchen_settings, '{}'::jsonb) || EXCLUDED.kitchen_settings,
    updated_at = NOW()
  RETURNING user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at;
`;

const SELECT_SQL = `
  SELECT user_id, kitchen_elevation_m, kitchen_elevation_basis, kitchen_settings, updated_at
  FROM user_profiles
  WHERE user_id = $1::uuid;
`;

async function main(): Promise<void> {
  await client.connect();
  console.log("Connected to PostgreSQL for kitchen settings SQL verification");

  await client.query("BEGIN");

  try {
    // Control 1: PREPARE rejection
    let controlPassed = false;
    await client.query("SAVEPOINT _ctrl_sp");
    try {
      await client.query("PREPARE _bad_stmt AS SELECT * FROM _nonexistent_table_xyz");
      await client.query("DEALLOCATE _bad_stmt");
    } catch {
      controlPassed = true;
      await client.query("ROLLBACK TO SAVEPOINT _ctrl_sp");
    }
    if (!controlPassed) fail("Control failed: PREPARE accepted invalid statement");
    console.log("✓ Control: PREPARE rejects invalid statement");

    // 1. PREPARE all 3 statements
    await client.query(`PREPARE _ks_update AS ${UPDATE_SQL}`);
    console.log("✓ PREPARE: UPDATE user_profiles compiles cleanly");

    await client.query(`PREPARE _ks_insert AS ${INSERT_SQL}`);
    console.log("✓ PREPARE: INSERT ... ON CONFLICT (user_id) compiles cleanly");

    await client.query(`PREPARE _ks_select AS ${SELECT_SQL}`);
    console.log("✓ PREPARE: SELECT user_profiles compiles cleanly");

    // 2. Provision temporary test user in `users` to satisfy FK constraint
    const testUserId = "a0000000-0000-0000-0000-000000000001";
    await client.query(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at)
       VALUES ($1::uuid, 'sql_gate_test@alchm.kitchen', 'test_hash', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [testUserId]
    );

    // 3. Test execute with real values inside rolled-back transaction
    const testPayload = JSON.stringify({
      stationPressureKpa: 83.4,
      recipeAdjustments: [{ recipeId: "r1", adjustedCoreMinutes: 25 }],
      lastFlushedAt: new Date().toISOString(),
    });

    // Execute INSERT
    const insertRes = await client.query(INSERT_SQL, [
      testUserId,
      1609.5,
      "MEASURED",
      testPayload,
    ]);
    if (insertRes.rows.length !== 1) fail("INSERT failed to return row");
    console.log("✓ EXECUTE: INSERT ... ON CONFLICT returned valid row (basis:", insertRes.rows[0].kitchen_elevation_basis + ")");

    // Execute UPDATE
    const updatePayload = JSON.stringify({
      ambientNotes: "high-altitude test",
      lastFlushedAt: new Date().toISOString(),
    });
    const updateRes = await client.query(UPDATE_SQL, [
      testUserId,
      1615.0,
      "DERIVED",
      updatePayload,
    ]);
    if (updateRes.rows.length !== 1) fail("UPDATE failed to return updated row");
    const updatedSettings = updateRes.rows[0].kitchen_settings;
    if (typeof updatedSettings !== "object" || !updatedSettings.stationPressureKpa || !updatedSettings.ambientNotes) {
      fail("JSONB merge failed to retain both old and new keys");
    }
    console.log("✓ EXECUTE: UPDATE merged JSONB settings and updated elevation to:", updateRes.rows[0].kitchen_elevation_m, "m");

    // Execute SELECT
    const selectRes = await client.query(SELECT_SQL, [testUserId]);
    if (selectRes.rows.length !== 1) fail("SELECT failed to retrieve row");
    console.log("✓ EXECUTE: SELECT retrieved persisted row cleanly");

    // 4. Verify Constraint: invalid basis is rejected
    let constraintCaught = false;
    await client.query("SAVEPOINT _basis_sp");
    try {
      await client.query(UPDATE_SQL, [
        testUserId,
        500,
        "INVALID_BASIS_STRING",
        "{}",
      ]);
    } catch {
      constraintCaught = true;
      await client.query("ROLLBACK TO SAVEPOINT _basis_sp");
    }
    if (!constraintCaught) fail("Constraint check failed: invalid basis string was accepted");
    console.log("✓ CONSTRAINT: user_profiles_kitchen_elevation_basis_check successfully rejects invalid basis strings");

  } finally {
    await client.query("ROLLBACK");
    console.log("✓ Transaction rolled back — zero rows or side-effects persisted");
  }

  console.log("\n✓ All kitchenSettingsService SQL statements PARSE, EXECUTE, and ENFORCE CONSTRAINTS cleanly against PostgreSQL.\n");
}

main()
  .catch(async (err) => {
    try {
      await client.query("ROLLBACK");
    } catch {}
    fail(err instanceof Error ? err.message : String(err));
  })
  .finally(() => {
    void client.end();
  });
