/**
 * CI / Verification Gate: Does the device session and auth SQL actually PARSE and PREPARE against PostgreSQL?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Unit tests mock `executeQuery`, which tests string mappings and mocks but cannot
 * verify PostgreSQL query validity, parameter type deduction, or column presence.
 * A mocked test will happily accept SQL that PostgreSQL rejects with 42P08
 * (inconsistent parameter types) or 42703 (undefined column).
 *
 * This script runs against live PostgreSQL:
 *   1. Control: Verifies that PREPARE rejects an invalid query.
 *   2. Control: Verifies that every exported SQL query from `authQueries.ts` is exercised.
 *   3. PREPAREs every statement, confirming parameter types are deduced unambiguously.
 *   4. Zero rows are written (PREPARE only performs query planning/parsing).
 *
 * Usage:
 *   bun scripts/checkAuthSqlParses.ts
 */

import pg from "pg";
import { readFileSync, existsSync } from "node:fs";
import * as authQueries from "../src/lib/auth/authQueries";

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

let dbUrl = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!dbUrl && existsSync(".env")) {
  try {
    const env = readFileSync(".env", "utf8");
    for (const line of env.split("\n")) {
      if (line.startsWith("DATABASE_PUBLIC_URL=")) {
        dbUrl = line.split("=")[1]?.trim().replace(/^['"]|['"]$/g, "");
        break;
      }
      if (line.startsWith("DATABASE_URL=") && !dbUrl) {
        dbUrl = line.split("=")[1]?.trim().replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    // Best-effort .env read
  }
}

if (!dbUrl) {
  fail("no DATABASE_PUBLIC_URL / DATABASE_URL found in environment or .env");
}

interface Statement {
  label: string;
  sql: string;
  constantName: string;
}

const statements: Statement[] = [
  {
    label: "sessionTouch (UPDATE last_seen_at + device metadata)",
    sql: authQueries.TOUCH_SESSION_SQL,
    constantName: "TOUCH_SESSION_SQL",
  },
  {
    label: "signOut (UPDATE device_sessions revoked_at)",
    sql: authQueries.REVOKE_SESSION_ON_SIGNOUT_SQL,
    constantName: "REVOKE_SESSION_ON_SIGNOUT_SQL",
  },
  {
    label: "signOut (DELETE NextAuth sessions table row)",
    sql: authQueries.DELETE_NEXTAUTH_SESSION_ON_SIGNOUT_SQL,
    constantName: "DELETE_NEXTAUTH_SESSION_ON_SIGNOUT_SQL",
  },
  {
    label: "revokeSessionById (DELETE /api/auth/sessions/[id])",
    sql: authQueries.REVOKE_SESSION_BY_ID_SQL,
    constantName: "REVOKE_SESSION_BY_ID_SQL",
  },
  {
    label: "revokeAllSessions (POST /api/auth/sessions/revoke-all)",
    sql: authQueries.REVOKE_ALL_SESSIONS_SQL,
    constantName: "REVOKE_ALL_SESSIONS_SQL",
  },
  {
    label: "selectDeviceSessions (GET /api/auth/sessions)",
    sql: authQueries.SELECT_DEVICE_SESSIONS_SQL,
    constantName: "SELECT_DEVICE_SESSIONS_SQL",
  },
  {
    label: "selectRevokedAtByJti (sessionRevocation check)",
    sql: authQueries.SELECT_REVOKED_AT_BY_JTI_SQL,
    constantName: "SELECT_REVOKED_AT_BY_JTI_SQL",
  },
  {
    label: "insertDeviceSession (auth signIn upsert)",
    sql: authQueries.INSERT_DEVICE_SESSION_ON_SIGNIN_SQL,
    constantName: "INSERT_DEVICE_SESSION_ON_SIGNIN_SQL",
  },
  {
    label: "adminRevokeUserSessions (admin route)",
    sql: authQueries.ADMIN_REVOKE_USER_SESSIONS_SQL,
    constantName: "ADMIN_REVOKE_USER_SESSIONS_SQL",
  },
];

const EXPECTED_TOTAL = 9;

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

let failures = 0;
try {
  // ── Control 1: PREPARE rejects broken statement ─────────────────────────
  let controlCaught = false;
  try {
    await client.query(
      "PREPARE _gate_auth_control AS SELECT * FROM a_table_that_does_not_exist_xyz",
    );
    await client.query("DEALLOCATE _gate_auth_control");
  } catch {
    controlCaught = true;
  }
  if (!controlCaught) {
    fail("CONTROL FAILED: PREPARE accepted statement against nonexistent table.");
  }
  console.log("✓ control: PREPARE rejects a statement it should reject");

  // ── Control 2: 42P08 parameter type deduction control ───────────────────
  // Proves that the gate specifically detects PostgreSQL error 42P08.
  // The uncast variant of sessionTouch ($2 IS NOT NULL without explicit ::text cast)
  // fails parse/prepare with 42P08 because parameter $2's type cannot be deduced.
  let p08Caught = false;
  let p08ErrorCode = "";
  try {
    const uncastTouchSql = `UPDATE device_sessions
        SET last_seen_at = NOW(),
            device = COALESCE($2, device)
      WHERE id = $1
        AND (last_seen_at < NOW() - interval '10 minutes' OR (device IS NULL AND $2 IS NOT NULL))
      RETURNING id`;
    await client.query(`PREPARE _gate_ctrl_42p08 AS ${uncastTouchSql}`);
    await client.query("DEALLOCATE _gate_ctrl_42p08");
  } catch (e) {
    const err = e as { code?: string };
    p08Caught = true;
    p08ErrorCode = err.code ?? "";
  }

  if (!p08Caught || p08ErrorCode !== "42P08") {
    fail(
      `CONTROL FAILED: uncast $2 IS NOT NULL should fail with 42P08, but got code "${p08ErrorCode}" (caught: ${p08Caught}).`,
    );
  }
  console.log("✓ control: PREPARE rejects uncast $2 parameter with 42P08 (proven load-bearing cast)");

  // ── Control 3: All exported constants in authQueries are covered ────────
  const exportedQueryNames = Object.entries(authQueries)
    .filter(([_, v]) => typeof v === "string")
    .map(([k]) => k);
  const covered = new Set(statements.map((s) => s.constantName));
  const ungated = exportedQueryNames.filter((name) => !covered.has(name));
  if (ungated.length > 0) {
    fail(
      `CONTROL FAILED: ${ungated.length} exported query constant(s) in authQueries.ts are never PREPAREd: ${ungated.join(", ")}`,
    );
  }
  console.log(
    `✓ control: all ${exportedQueryNames.length} exported queries from authQueries.ts are exercised`,
  );

  // ── Control 4: Statement count assertion ────────────────────────────────
  if (statements.length !== EXPECTED_TOTAL) {
    fail(
      `CONTROL FAILED: expected ${EXPECTED_TOTAL} statements, built ${statements.length}.`,
    );
  }
  console.log(`✓ control: ${statements.length} statements registered as expected\n`);

  // ── PREPARE Gate Execution ──────────────────────────────────────────────
  for (let i = 0; i < statements.length; i++) {
    const { label, sql } = statements[i]!;
    // PostgreSQL truncates identifiers longer than 63 characters (NAMEDATALEN - 1).
    // Using an indexed prefix ensures uniqueness and guarantees exact match in pg_prepared_statements.
    const shortLabel = label.split(" ")[0]?.replace(/[^a-z0-9]/gi, "").slice(0, 30) ?? "stmt";
    const name = `_gate_auth_${i}_${shortLabel}`.toLowerCase();
    try {
      await client.query(`PREPARE ${name} AS ${sql}`);
      const meta = await client.query<{ parameter_types: string[] }>(
        "SELECT parameter_types::text[] FROM pg_prepared_statements WHERE name = $1",
        [name],
      );
      await client.query(`DEALLOCATE ${name}`);
      const paramTypes = meta.rows[0]?.parameter_types ?? [];
      console.log(
        `✓ ${label} prepares — ${paramTypes.length} params: ${paramTypes.join(", ")}`,
      );
    } catch (e) {
      failures++;
      const err = e as { code?: string; message?: string };
      console.error(`✗ ${label} FAILED TO PREPARE`);
      console.error(`    ${err.code ?? ""} ${err.message ?? String(e)}`);
      if (err.code === "42P08") {
        console.error(
          "    42P08: A bind parameter has ambiguous deduced types. Ensure all references have matching explicit casts.",
        );
      }
    }
  }

  if (failures > 0) {
    fail(
      `${failures} of ${statements.length} auth SQL statements cannot be prepared by PostgreSQL.`,
    );
  }

  console.log(
    `\n✓ all ${statements.length} auth statements parse and type-check against PostgreSQL`,
  );
} finally {
  await client.end();
}
