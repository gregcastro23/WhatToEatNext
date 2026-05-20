/**
 * scripts/grant-test-tokens.ts
 *
 * One-shot, idempotent admin grant of 5 Spirit + 5 Essence + 5 Matter +
 * 5 Substance to every **active, onboarded** user. Used to verify the
 * end-to-end onboarding → balance flow against production data.
 *
 * Safe to re-run: the idempotency key (`ADMIN_TEST_GRANT_KEY`) ensures the
 * underlying `token_transactions.idempotency_key` unique index blocks any
 * duplicate credit, so repeat invocations are a no-op for users who already
 * received the grant.
 *
 * Run from Railway so it sees postgres.railway.internal:
 *
 *   railway run bun scripts/grant-test-tokens.ts --dry-run     # preview only
 *   railway run bun scripts/grant-test-tokens.ts               # execute
 *
 * Optional flags:
 *   --dry-run        Print the plan + audience count, write nothing.
 *   --limit N        Cap the audience to the first N users (smoke-test).
 *   --emails a,b,c   Limit to specific email addresses (comma-separated).
 *
 * Exit codes:
 *   0  success (or dry run)
 *   1  fatal error (missing DATABASE_URL, query failure)
 *   2  partial failure (some users could not be credited)
 */

import { Pool } from "pg";
import { tokenEconomy } from "../src/services/TokenEconomyService";
import { TOKEN_TYPES } from "../src/types/economy";

const GRANT_AMOUNT = 5;
const ADMIN_TEST_GRANT_KEY = "admin-test-grant-2026-05-20";
const GRANT_DESCRIPTION =
  "Admin test grant — onboarding/persistence verification (5 of each ESMS token)";

interface Args {
  dryRun: boolean;
  limit: number | null;
  emails: string[] | null;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, limit: null, emails: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--limit") {
      const v = Number(argv[++i]);
      if (!Number.isFinite(v) || v <= 0) {
        console.error("--limit must be a positive integer");
        process.exit(1);
      }
      args.limit = v;
    } else if (a === "--emails") {
      const v = argv[++i] ?? "";
      args.emails = v
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (args.emails.length === 0) {
        console.error("--emails requires at least one comma-separated address");
        process.exit(1);
      }
    } else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: bun scripts/grant-test-tokens.ts [--dry-run] [--limit N] [--emails a,b,c]",
      );
      process.exit(0);
    }
  }
  return args;
}

interface AudienceRow {
  id: string;
  email: string;
}

async function selectAudience(
  pool: Pool,
  emails: string[] | null,
  limit: number | null,
): Promise<AudienceRow[]> {
  const params: unknown[] = [];
  let where = `u.is_active = true AND up.onboarding_completed = true`;
  if (emails && emails.length > 0) {
    params.push(emails);
    where += ` AND lower(u.email) = ANY($${params.length}::text[])`;
  }
  let sql = `SELECT u.id::text AS id, u.email AS email
             FROM users u
             JOIN user_profiles up ON up.user_id = u.id
             WHERE ${where}
             ORDER BY u.created_at ASC`;
  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }
  const result = await pool.query<AudienceRow>(sql, params);
  return result.rows;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Run via `railway run` or export it first.");
    process.exit(1);
  }

  const dbHost = (() => {
    try {
      return new URL(databaseUrl).hostname;
    } catch {
      return "unknown";
    }
  })();

  console.log("─".repeat(60));
  console.log("Admin test grant — 5 of each ESMS token per user");
  console.log("─".repeat(60));
  console.log(`Mode:            ${args.dryRun ? "DRY RUN (no writes)" : "EXECUTE"}`);
  console.log(`Database host:   ${dbHost}`);
  console.log(`Idempotency key: ${ADMIN_TEST_GRANT_KEY}`);
  console.log(`Amount per user: ${GRANT_AMOUNT} × [${TOKEN_TYPES.join(", ")}]`);
  console.log(
    `Audience:        active && onboarded${
      args.emails ? ` && email IN [${args.emails.join(", ")}]` : ""
    }${args.limit ? ` LIMIT ${args.limit}` : ""}`,
  );
  console.log("─".repeat(60));

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  let audience: AudienceRow[];
  try {
    audience = await selectAudience(pool, args.emails, args.limit);
  } catch (err) {
    console.error("Failed to query audience:", err);
    await pool.end();
    process.exit(1);
  }

  console.log(`Audience size:   ${audience.length} user(s)`);
  if (audience.length === 0) {
    console.log("Nothing to do.");
    await pool.end();
    return;
  }

  // Preview the first few so the operator can sanity-check before committing.
  const preview = audience.slice(0, 5);
  console.log("First few:");
  preview.forEach((u) => console.log(`  • ${u.id}  ${u.email}`));
  if (audience.length > preview.length) {
    console.log(`  … and ${audience.length - preview.length} more`);
  }
  console.log("─".repeat(60));

  if (args.dryRun) {
    console.log("Dry run complete. Re-run without --dry-run to credit tokens.");
    await pool.end();
    return;
  }

  // We rely on TokenEconomyService.creditMultipleTokens for atomicity per user
  // and on the unique index over token_transactions.idempotency_key for the
  // global "exactly once" guarantee across re-runs.
  const credits = TOKEN_TYPES.map((tokenType) => ({
    tokenType,
    amount: GRANT_AMOUNT,
  }));

  let credited = 0;
  let alreadyClaimed = 0;
  let failed = 0;
  const start = Date.now();

  for (const user of audience) {
    const idempotencyKey = `${ADMIN_TEST_GRANT_KEY}:${user.id}`;
    try {
      const result = await tokenEconomy.creditMultipleTokens(
        user.id,
        credits,
        "admin",
        {
          description: GRANT_DESCRIPTION,
          idempotencyKey,
        },
      );

      if (result === null) {
        alreadyClaimed++;
      } else {
        credited++;
      }
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${user.email}: ${message}`);
    }
  }

  const elapsedMs = Date.now() - start;

  console.log("─".repeat(60));
  console.log(`Credited:        ${credited}`);
  console.log(`Already claimed: ${alreadyClaimed}  (idempotency skip)`);
  console.log(`Failed:          ${failed}`);
  console.log(`Elapsed:         ${(elapsedMs / 1000).toFixed(2)}s`);
  console.log("─".repeat(60));

  await pool.end();

  if (failed > 0) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
