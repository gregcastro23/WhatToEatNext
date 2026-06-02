#!/usr/bin/env bun
/**
 * List all registered users — queries Railway Postgres directly.
 *
 * Usage:
 *   bun run scripts/list_users.ts          # show every user
 *   bun run scripts/list_users.ts google   # show only Google‑OAuth users
 *   bun run scripts/list_users.ts --json   # output JSON instead of table
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

const { Client } = pg;

// ── Load DATABASE_URL from .env.production.local ────────────────────────────
function loadEnvFile(filename: string): Record<string, string> {
  const envPath = resolve(import.meta.dir, "..", filename);
  const vars: Record<string, string> = {};
  try {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx);
      let val = trimmed.slice(eqIdx + 1);
      // strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[key] = val;
    }
  } catch {
    // file may not exist
  }
  return vars;
}

// Prefer env var already set, then .env.local, then .env.production.local
const databaseUrl =
  process.env.DATABASE_URL ||
  loadEnvFile(".env.local")["DATABASE_URL"] ||
  loadEnvFile(".env.production.local")["DATABASE_URL"];

if (!databaseUrl || databaseUrl.includes("${{")) {
  console.error(
    "❌  No usable DATABASE_URL found.\n" +
    "    Set it in the environment or ensure .env.production.local has a literal connection string.\n" +
    '    (Railway template vars like ${{PGUSER}} are not interpolated locally.)'
  );
  process.exit(1);
}

// ── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const filterGoogle = args.includes("google");
const outputJson = args.includes("--json");

// ── Query ────────────────────────────────────────────────────────────────────
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();

  const sql = `
    SELECT
      u.id,
      u.email,
      u.name,
      u.role,
      a.provider         AS auth_provider,
      u.is_active         AS active,
      s.tier              AS sub_tier,
      s.status            AS sub_status,
      u.last_login_at,
      u.created_at
    FROM users u
    LEFT JOIN accounts a            ON u.id = a."userId"
    LEFT JOIN user_subscriptions s  ON u.id = s.user_id
    ${filterGoogle ? "WHERE a.provider = 'google'" : ""}
    ORDER BY u.created_at DESC
  `;

  const { rows } = await client.query(sql);
  await client.end();

  if (rows.length === 0) {
    console.log(filterGoogle ? "No Google‑OAuth users found." : "No users found.");
    return;
  }

  console.log(`\n✅  ${rows.length} user(s) found${filterGoogle ? " (Google OAuth)" : ""}:\n`);

  if (outputJson) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.table(
      rows.map((r: Record<string, unknown>) => ({
        id: (r.id as string)?.slice(0, 8) + "…",
        email: r.email,
        name: r.name ?? "—",
        role: r.role ?? "USER",
        provider: r.auth_provider ?? "—",
        active: r.active,
        tier: r.sub_tier ?? "free",
        status: r.sub_status ?? "—",
        last_login: r.last_login_at
          ? new Date(r.last_login_at as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "never",
        created: r.created_at
          ? new Date(r.created_at as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
      }))
    );
  }
}

main().catch((err) => {
  console.error("❌ error while listing users:", err.message ?? err);
  client.end().catch(() => {});
  process.exit(1);
});
