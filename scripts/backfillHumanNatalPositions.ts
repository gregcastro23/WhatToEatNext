/**
 * Backfill `natal_positions` for humans who hold a chart but no positions.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-08-12]` against production: 71 of 71 chart-bearing AGENTS held
 * `natal_positions`; **0 of 8** chart-bearing HUMANS did. `createUser` wrote
 * `natal_chart` and `birth_data` and never the column `parseNatalPositions`
 * actually reads, so every full-chart computation for a human yielded nothing.
 * Nothing failed loudly: `checkAgentMonicaDrift` scans `WHERE u.is_agent`, so the
 * human population was outside every existing check.
 *
 * The leak is fixed at the source — `createUser` now derives the column from the
 * same chart it stores — so this repairs only the rows that predate that. Run it
 * AFTER the fix is deployed, or a signup during the gap rejoins the backlog.
 *
 * ── Design ──────────────────────────────────────────────────────────────────
 *
 * Selects by PREDICATE ("human, has a chart, has no positions"), never a
 * hardcoded id list, so it is re-runnable and correct if the set has moved.
 *
 * Derives through `natalPositionsFromStoredChart` — the SAME function the writer
 * now uses and whose rules come from the reader — so a backfilled row is
 * indistinguishable from a correctly-written one. It was validated against every
 * chart in production first: on all 71 agents, where the column was already
 * populated by a DIFFERENT writer, the converter reproduces the stored value's
 * monica to within 1e-9. That agreement is the evidence it is not guessing.
 *
 * Writes only where the column is still absent (`natal_positions IS NULL OR
 * jsonb_array_length = 0`), so a concurrent real write cannot be clobbered.
 *
 * Usage (dry run prints the plan and changes nothing):
 *   DATABASE_URL="$PROD_URL" bun run scripts/backfillHumanNatalPositions.ts
 *   DATABASE_URL="$PROD_URL" bun run scripts/backfillHumanNatalPositions.ts --execute
 */

import { executeQuery } from "@/lib/database";
import { fullChartMonica, natalPositionsFromStoredChart } from "@/utils/fullChartMonica";

const EXECUTE = process.argv.includes("--execute");

interface TargetRow {
  id: string;
  email: string;
  natal_chart: unknown;
}

const SELECT_TARGETS = `
  SELECT u.id::text AS id, u.email, up.natal_chart
    FROM users u JOIN user_profiles up ON up.user_id = u.id
   WHERE u.is_agent = false
     AND up.natal_chart IS NOT NULL
     AND up.natal_chart::text <> '{}'
     AND (up.natal_positions IS NULL OR jsonb_array_length(up.natal_positions) = 0)
   ORDER BY u.created_at
`;

const mask = (email: string) => {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
};

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("refusing to run: no DATABASE_URL in the environment");
    process.exit(1);
  }

  const targets = (await executeQuery(SELECT_TARGETS, [])).rows as TargetRow[];
  if (targets.length === 0) {
    console.log("Nothing to do: every chart-bearing human already has natal_positions.");
    return;
  }

  console.log(`${targets.length} human(s) hold a chart but no natal_positions:\n`);

  const plan: Array<{ id: string; rows: unknown[]; monica: number }> = [];
  const unusable: string[] = [];

  for (const t of targets) {
    const rows = natalPositionsFromStoredChart(t.natal_chart);
    const monica = rows ? fullChartMonica(rows) : null;
    if (!rows || !monica) {
      unusable.push(t.id);
      console.log(`  ${t.id.slice(0, 8)}  ${mask(t.email).padEnd(28)}  UNUSABLE — skipped, not guessed`);
      continue;
    }
    plan.push({ id: t.id, rows, monica: monica.combined });
    console.log(
      `  ${t.id.slice(0, 8)}  ${mask(t.email).padEnd(28)}  ` +
        `${rows.length} bodies  full-chart monica ${monica.combined.toFixed(6)}`,
    );
  }

  if (unusable.length > 0) {
    console.log(`\n${unusable.length} chart(s) could not be converted and were left alone.`);
  }

  if (!EXECUTE) {
    console.log("\nDRY RUN — nothing written. Re-run with --execute to apply.");
    return;
  }

  console.log("\nApplying…\n");
  let written = 0;
  for (const p of plan) {
    const res = await executeQuery(
      `UPDATE user_profiles
          SET natal_positions = $2::jsonb, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1::uuid
          AND (natal_positions IS NULL OR jsonb_array_length(natal_positions) = 0)`,
      [p.id, JSON.stringify(p.rows)],
    );
    if (res.rowCount === 1) {
      written += 1;
      console.log(`  ✓ ${p.id.slice(0, 8)}  written`);
    } else {
      console.log(`  – ${p.id.slice(0, 8)}  no row updated (already filled concurrently?)`);
    }
  }

  // Re-read rather than trusting the UPDATE's return: the column is the
  // authority on whether the value landed, and rowCount is a different claim.
  const remaining = (await executeQuery(SELECT_TARGETS, [])).rows as TargetRow[];
  console.log(
    `\nWrote ${written}/${plan.length}. Humans still missing natal_positions, ` +
      `re-read from the database: ${remaining.length}` +
      (unusable.length ? ` (${unusable.length} of them unusable by design)` : ""),
  );
  if (remaining.length > unusable.length) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error("backfill failed:", err);
    process.exit(1);
  })
  .finally(() => {
    setTimeout(() => process.exit(process.exitCode ?? 0), 250);
  });
