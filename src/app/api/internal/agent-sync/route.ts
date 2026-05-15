import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/internal/agent-sync
 *
 * Identity-provisioning endpoint for the planetary-agents engine.
 * Creates or links a WhatToEatNext user record for each agentic persona
 * and returns the WTEN userId so planetary_agents can persist it as
 * alchmKitchenUserId.
 *
 * Auth: X-Sync-Secret header matched against ALCHM_KITCHEN_SYNC_SECRET env var.
 *
 * Body: { email: string, displayName?: string, agentMetadata?: object }
 *
 * Responses:
 *   200 { ok: true, wtenUserId, created }
 *   400 { ok: false, reason: "invalid_request", message }
 *   401 { error: "Unauthorized" }
 *   422 { ok: false, reason: "invalid_email_domain", message }
 *   500 { ok: false, reason: "internal_error", message }
 */

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

interface AgentSyncBody {
  email: string;
  displayName?: string;
  agentMetadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();

  const authHeader = req.headers.get("X-Sync-Secret");
  const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;
  if (!syncSecret || authHeader !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AgentSyncBody;
  try {
    body = (await req.json()) as AgentSyncBody;
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_request", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { email: rawEmail, displayName: rawDisplayName, agentMetadata } = body;

  if (!rawEmail || typeof rawEmail !== "string") {
    return NextResponse.json(
      { ok: false, reason: "invalid_request", message: "email is required" },
      { status: 400 },
    );
  }

  const email = rawEmail.toLowerCase().trim();

  if (!email.endsWith(AGENTIC_EMAIL_DOMAIN)) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_email_domain",
        message: `Only ${AGENTIC_EMAIL_DOMAIN} addresses are accepted`,
      },
      { status: 422 },
    );
  }

  // Derive display name: prefer explicit arg, fall back to email local part
  const displayName = (() => {
    const fromArg = typeof rawDisplayName === "string" ? rawDisplayName.trim() : "";
    if (fromArg) return fromArg;
    const fromMeta =
      typeof agentMetadata?.agentName === "string" ? agentMetadata.agentName.trim() : "";
    if (fromMeta) return fromMeta;
    const local = email.split("@")[0] ?? "";
    return (
      local
        .split("-")
        .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ""))
        .join(" ")
        .trim() || "Agent"
    );
  })();

  try {
    // SELECT first to detect create vs link (same pattern as sync-debit)
    const existing = await executeQuery<{ id: string }>(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    let wtenUserId: string;
    let created: boolean;

    if (existing.rows.length > 0) {
      wtenUserId = existing.rows[0].id;
      created = false;
      // Keep is_agent fresh in case the row predates migration 23
      await executeQuery(
        "UPDATE users SET is_agent = true, updated_at = now() WHERE id = $1",
        [wtenUserId],
      );
    } else {
      const insertResult = await executeQuery<{ id: string }>(
        `INSERT INTO users
           (email, password_hash, role, is_active, email_verified, is_agent,
            name, profile, preferences, login_count, created_at, updated_at)
         VALUES
           ($1, 'AGENT_NO_LOGIN', 'USER'::user_role, true, true, true,
            $2, $3::jsonb, '{}'::jsonb, 0, now(), now())
         ON CONFLICT (email) DO UPDATE
           SET is_agent   = true,
               name       = COALESCE(EXCLUDED.name, users.name),
               updated_at = now()
         RETURNING id`,
        [email, displayName, JSON.stringify({ email, isAgent: true, name: displayName })],
      );
      const row = insertResult.rows[0];
      if (!row) throw new Error("Insert returned no row");
      wtenUserId = row.id;
      created = true;
    }

    // Upsert user_profiles so profile/community endpoints surface a name
    await executeQuery(
      `INSERT INTO user_profiles (user_id, name)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
         SET name       = COALESCE(EXCLUDED.name, user_profiles.name),
             updated_at = now()`,
      [wtenUserId, displayName],
    );

    const elapsed = Date.now() - t0;
    console.log(
      `agent_sync email=${email} wtenUserId=${wtenUserId} created=${created} elapsed_ms=${elapsed}`,
    );

    return NextResponse.json({ ok: true, wtenUserId, created });
  } catch (error) {
    console.error("[agent-sync] Internal Error:", error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: (error as Error).message },
      { status: 500 },
    );
  }
}
