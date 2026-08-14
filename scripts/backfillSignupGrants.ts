/**
 * Backfill the welcome grant for human users who never received one.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-08-10]` against production: 6 of 14 human signups held a zero
 * ESMS balance. `grantSignupBonus` was reachable from exactly ONE call site —
 * the NextAuth `signIn` callback — while THREE code paths create a user. The two
 * JIT paths (the `jwt` callback fallback, and the heal in
 * `getDatabaseUserFromRequest`) created the row, seeded an empty
 * `token_balances`, and granted nothing.
 *
 * All 6 had `login_count = 0`, no `accounts` row, and no `auth_events` months
 * after signing up, so the "self-heals on the next sign-in" retry could never
 * reach them: it lives in the callback that had never completed for them.
 *
 * The leak is fixed at the source — `createUser` now writes the grant inside the
 * same transaction as the user row — so this script only repairs the users who
 * predate that. Run it AFTER the fix is deployed, or the next signup during a DB
 * blip rejoins the backlog.
 *
 * ── Design ──────────────────────────────────────────────────────────────────
 *
 * Selects by PREDICATE, never a hardcoded list of ids: "human with no grant
 * row". That makes it re-runnable, self-limiting, and correct if the set has
 * changed since the diagnosis.
 *
 * Calls `tokenEconomy.grantSignupBonus` — the real production writer, with its
 * retries and its idempotency key — rather than hand-rolled INSERTs, so a
 * backfilled user is indistinguishable from a correctly-granted one. The
 * per-axis `ON CONFLICT (idempotency_key) DO NOTHING` means running this twice
 * cannot double-credit.
 *
 * Usage (dry run prints the plan and changes nothing):
 *   DATABASE_URL="$PROD_URL" bun run scripts/backfillSignupGrants.ts
 *   DATABASE_URL="$PROD_URL" bun run scripts/backfillSignupGrants.ts --execute
 */

import { executeQuery } from "@/lib/database";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { SIGNUP_GRANT_PER_TOKEN } from "@/services/tokenEconomyQueries";

const EXECUTE = process.argv.includes("--execute");

interface TargetRow {
  id: string;
  email: string;
  created_at: string;
  login_count: number | null;
  total_esms: string;
}

/** Humans with no welcome grant on the ledger. Both grant sources count:
 *  `initial_grant` is a closed set (420 rows, 2026-05-14 → 2026-05-25, no
 *  writer left in the tree), and a user who got one is not owed the other.
 *
 *  `is_agent IS NOT TRUE` rather than `= false` only to read identically to the
 *  admin indicator it repairs (`welcomeGrantCoverageSql`). It is not a
 *  behaviour change and does not close a gap: `users.is_agent` is NOT NULL with
 *  default false, so the two forms select the same rows. A repair tool that
 *  merely LOOKS like it disagrees with its alarm is worth one word to fix. */
const SELECT_TARGETS = `
  SELECT u.id::text            AS id,
         u.email,
         u.created_at::text    AS created_at,
         u.login_count,
         (COALESCE(b.spirit,0) + COALESCE(b.essence,0)
          + COALESCE(b.matter,0) + COALESCE(b.substance,0))::text AS total_esms
  FROM users u
  LEFT JOIN token_balances b ON b.user_id = u.id
  WHERE u.is_agent IS NOT TRUE
    AND NOT EXISTS (
      SELECT 1 FROM token_transactions t
      WHERE t.user_id = u.id
        AND t.source_type IN ('signup_grant', 'initial_grant')
    )
  ORDER BY u.created_at
`;

const mask = (email: string) => {
  const [local, domain] = email.split("@");
  const head = local.slice(0, 2);
  return `${head}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
};

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("refusing to run: no DATABASE_URL in the environment");
    process.exit(1);
  }

  const targets = (await executeQuery(SELECT_TARGETS, [])).rows as TargetRow[];

  if (targets.length === 0) {
    console.log("Nothing to do: every human user already holds a welcome grant.");
    return;
  }

  console.log(
    `${targets.length} human user(s) owed a welcome grant ` +
      `(${SIGNUP_GRANT_PER_TOKEN} per axis = ${SIGNUP_GRANT_PER_TOKEN * 4} ESMS each):\n`,
  );
  for (const t of targets) {
    console.log(
      `  ${t.id.slice(0, 8)}  ${mask(t.email).padEnd(28)}  ` +
        `signed up ${t.created_at.slice(0, 10)}  ` +
        `login_count=${t.login_count ?? 0}  balance=${t.total_esms}`,
    );
  }

  if (!EXECUTE) {
    console.log("\nDRY RUN — nothing written. Re-run with --execute to apply.");
    return;
  }

  console.log("\nApplying…\n");
  let granted = 0;
  const failed: string[] = [];

  for (const t of targets) {
    const ok = await tokenEconomy.grantSignupBonus(t.id);
    if (ok) {
      granted += 1;
      console.log(`  ✓ ${t.id.slice(0, 8)}  granted`);
    } else {
      failed.push(t.id);
      console.log(`  ✗ ${t.id.slice(0, 8)}  FAILED — grantSignupBonus exhausted its retries`);
    }
  }

  // Re-run the selection rather than trusting the return values: the ledger is
  // the authority on whether the grant landed, and a `true` from a writer is
  // not the same claim as a row being present.
  const remaining = (await executeQuery(SELECT_TARGETS, [])).rows as TargetRow[];
  console.log(
    `\nGranted ${granted}/${targets.length}. ` +
      `Users still owed a grant, re-read from the ledger: ${remaining.length}.`,
  );
  if (failed.length > 0) {
    console.log(`Failed ids: ${failed.join(", ")}`);
  }
  if (remaining.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("backfill failed:", err);
    process.exit(1);
  })
  .finally(() => {
    // The pg pool keeps the event loop alive; this is a one-shot script.
    setTimeout(() => process.exit(process.exitCode ?? 0), 250);
  });
