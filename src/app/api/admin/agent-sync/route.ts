/**
 * Admin: manual agent re-sync to PA (planetary_agents).
 *
 * POST /api/admin/agent-sync
 *
 * Body (one of):
 *   { email:    "<agent>@agentic.alchm.kitchen" }   // re-sync a single user
 *   { agentId:  "<agent>"                       }   // re-sync by agentId
 *   { all:      true                            }   // re-sync ALL is_agent=true users
 *
 * Requires admin role. POSTs to PA's /api/internal/agent-sync with
 * X-Sync-Secret: INTERNAL_API_SECRET. PA forwards updates to alchm.kitchen
 * internally.
 *
 * @file src/app/api/admin/agent-sync/route.ts
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { getServiceUrl } from "@/lib/serviceUrls";
import { userDatabase } from "@/services/userDatabaseService";
import { logger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";
const PA_SYNC_TIMEOUT_MS = 5000;
const BATCH_CONCURRENCY = 4;

interface SyncTarget {
  agentId: string;
  email: string;
  displayName: string | null;
}

interface SyncResult {
  agentId: string;
  email: string;
  ok: boolean;
  status?: number;
  error?: string;
}

function getPaConfig(): { url: string; secret: string } | { error: string } {
  const secret = process.env.INTERNAL_API_SECRET;
  // PA Python backend is at api.agents.alchm.kitchen — the bare
  // agents.alchm.kitchen domain is the Next.js UI and does NOT serve
  // /api/internal/agent-sync (would silently 404).
  const base = getServiceUrl("planetaryAgentsApi");
  if (!secret) return { error: "INTERNAL_API_SECRET not configured" };
  return { url: `${base}/api/internal/agent-sync`, secret };
}

async function postOne(
  url: string,
  secret: string,
  target: SyncTarget,
): Promise<SyncResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PA_SYNC_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": secret,
      },
      body: JSON.stringify({
        agentId: target.agentId,
        displayName: target.displayName ?? target.agentId,
        email: target.email,
      }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "(unreadable)");
      return {
        agentId: target.agentId,
        email: target.email,
        ok: false,
        status: resp.status,
        error: text.slice(0, 200),
      };
    }
    return { agentId: target.agentId, email: target.email, ok: true, status: resp.status };
  } catch (err) {
    return {
      agentId: target.agentId,
      email: target.email,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function runBatched(
  url: string,
  secret: string,
  targets: SyncTarget[],
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (let i = 0; i < targets.length; i += BATCH_CONCURRENCY) {
    const chunk = targets.slice(i, i + BATCH_CONCURRENCY);
    const settled = await Promise.all(chunk.map((t) => postOne(url, secret, t)));
    results.push(...settled);
  }
  return results;
}

export async function POST(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  let body: { agentId?: string; email?: string; all?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const cfg = getPaConfig();
  if ("error" in cfg) {
    return NextResponse.json(
      { success: false, error: cfg.error },
      { status: 503 },
    );
  }

  let targets: SyncTarget[] = [];

  if (body.all) {
    // Pull every is_agent=true user from the DB.
    try {
      const result = await executeQuery(
        `SELECT email, name FROM users WHERE is_agent = true ORDER BY email`,
        [],
      );
      const rows = (result.rows ?? []) as Array<{ email: string; name: string | null }>;
      targets = rows
        .filter((r) => r.email.endsWith(AGENTIC_EMAIL_DOMAIN))
        .map((r) => ({
          agentId: r.email.split("@")[0],
          email: r.email,
          displayName: r.name,
        }));
    } catch (err) {
      logger.error("[admin/agent-sync] DB enumerate failed", err);
      return NextResponse.json(
        { success: false, error: "Failed to enumerate agentic users" },
        { status: 500 },
      );
    }
  } else if (body.email) {
    const email = body.email.toLowerCase().trim();
    if (!email.endsWith(AGENTIC_EMAIL_DOMAIN)) {
      return NextResponse.json(
        {
          success: false,
          error: `email must end in ${AGENTIC_EMAIL_DOMAIN}`,
        },
        { status: 400 },
      );
    }
    const user = await userDatabase.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }
    // UserWithProfile carries the name on its profile sub-object; the SELECT
    // alias in getUserByEmail also exposes a top-level `name`. Cover both
    // shapes without forcing a hard cast.
    const userWithName = user as { profile?: { name?: string | null }; name?: string | null };
    const displayName =
      userWithName.profile?.name ?? userWithName.name ?? null;
    targets = [{ agentId: email.split("@")[0], email, displayName }];
  } else if (body.agentId) {
    const agentId = body.agentId.trim();
    const email = `${agentId}${AGENTIC_EMAIL_DOMAIN}`;
    const user = await userDatabase
      .getUserByEmail(email)
      .catch(() => null);
    const userWithName = user as
      | { profile?: { name?: string | null }; name?: string | null }
      | null;
    const displayName =
      userWithName?.profile?.name ?? userWithName?.name ?? null;
    targets = [{ agentId, email, displayName }];
  } else {
    return NextResponse.json(
      { success: false, error: "Provide one of: email, agentId, all=true" },
      { status: 400 },
    );
  }

  if (targets.length === 0) {
    return NextResponse.json({
      success: true,
      synced: 0,
      failed: 0,
      results: [],
      note: "No agentic users matched",
    });
  }

  const results = await runBatched(cfg.url, cfg.secret, targets);
  const synced = results.filter((r) => r.ok).length;
  const failed = results.length - synced;

  logger.info(
    `[admin/agent-sync] complete: synced=${synced} failed=${failed} adminEmail=${authResult.user.email}`,
  );

  return NextResponse.json({
    success: true,
    synced,
    failed,
    results,
  });
}
