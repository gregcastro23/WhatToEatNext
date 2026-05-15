/**
 * scripts/backfill-agent-sync.ts
 *
 * One-shot backfill: push every isAgentic=true user from the planetary_agents DB
 * through the WhatToEatNext /api/internal/agent-sync endpoint, then write the
 * returned WTEN userId back into planetary_agents.users.alchmKitchenUserId.
 *
 * Required env vars:
 *   PLANETARY_AGENTS_DATABASE_URL  — planetary_agents Postgres connection string
 *   WTEN_SYNC_SECRET               — value of ALCHM_KITCHEN_SYNC_SECRET on WTEN side
 *   WTEN_API_BASE_URL              — e.g. https://whattoeatnext-production.up.railway.app
 *
 * Run (from the WhatToEatNext repo, or copy to planetary_agents repo):
 *   bun run scripts/backfill-agent-sync.ts
 */

import pg from "pg";

const { Pool } = pg;

const PLANETARY_DB_URL = process.env.PLANETARY_AGENTS_DATABASE_URL;
const WTEN_SECRET = process.env.WTEN_SYNC_SECRET;
const WTEN_BASE = (process.env.WTEN_API_BASE_URL ?? "").replace(/\/$/, "");

if (!PLANETARY_DB_URL || !WTEN_SECRET || !WTEN_BASE) {
  console.error(
    "Missing required env vars: PLANETARY_AGENTS_DATABASE_URL, WTEN_SYNC_SECRET, WTEN_API_BASE_URL",
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: PLANETARY_DB_URL });

interface AgentRow {
  id: string;
  email: string;
  name: string | null;
  alchmKitchenUserId: string | null;
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows: agents } = await client.query<AgentRow>(
      `SELECT id, email, name, "alchmKitchenUserId"
       FROM users
       WHERE "isAgentic" = true
       ORDER BY email`,
    );

    console.log(`Found ${agents.length} agentic users to sync.`);

    let synced = 0;
    let skipped = 0;
    let failed = 0;

    for (const agent of agents) {
      if (agent.alchmKitchenUserId) {
        console.log(`SKIP already linked: ${agent.email} → ${agent.alchmKitchenUserId}`);
        skipped++;
        continue;
      }

      const t0 = Date.now();
      let resp: Response;
      try {
        resp = await fetch(`${WTEN_BASE}/api/internal/agent-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Sync-Secret": WTEN_SECRET,
          },
          body: JSON.stringify({
            email: agent.email,
            displayName: agent.name ?? undefined,
          }),
        });
      } catch (fetchErr) {
        console.error(`FAIL network error for ${agent.email}:`, fetchErr);
        failed++;
        continue;
      }

      const elapsed = Date.now() - t0;

      if (!resp.ok) {
        const text = await resp.text().catch(() => "(unreadable)");
        console.error(`FAIL HTTP ${resp.status} for ${agent.email}: ${text}`);
        failed++;
        continue;
      }

      const data = (await resp.json()) as { ok: boolean; wtenUserId?: string; created?: boolean };

      if (!data.ok || !data.wtenUserId) {
        console.error(`FAIL bad response for ${agent.email}:`, JSON.stringify(data));
        failed++;
        continue;
      }

      await client.query(
        `UPDATE users SET "alchmKitchenUserId" = $1 WHERE id = $2`,
        [data.wtenUserId, agent.id],
      );

      console.log(
        `OK email=${agent.email} wtenUserId=${data.wtenUserId} created=${data.created} elapsed_ms=${elapsed}`,
      );
      synced++;
    }

    console.log(`\nBackfill complete — synced: ${synced}, skipped: ${skipped}, failed: ${failed}`);
    if (failed > 0) {
      console.error(`${failed} agents still have no alchmKitchenUserId — review errors above.`);
      process.exitCode = 1;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
