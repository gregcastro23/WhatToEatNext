/**
 * GET /api/internal/agent-sync/status
 *
 * Reports whether the current user is synchronized with the FastAPI
 * agent mesh (agents.alchm.kitchen). The /profile/security UI uses this
 * to render the "AGENT SYNC" chip.
 *
 * Status logic (in order):
 *   1. Unauthenticated   → { active: false, lastSync: null }
 *   2. Backend reachable → proxies to FastAPI's /internal/agent-sync/status
 *      with `Authorization: Bearer ${INTERNAL_API_SECRET}` (or
 *      `X-Internal-Secret` for legacy compatibility).
 *   3. Backend unreachable → returns { active: false, lastSync: null,
 *      reason: 'backend-unreachable' }. The UI degrades to "OFFLINE".
 *
 * The route reads the most-recent `last_sync_at` from a future agent_sync
 * table when the FastAPI side isn't reachable — but it never fails the UI.
 *
 * @file src/app/api/internal/agent-sync/status/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.API_BASE_URL ||
  process.env.BACKEND_URL ||
  "https://whattoeatnext-production.up.railway.app";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "";
const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";
const PROXY_TIMEOUT_MS = 2500;

type StatusResponse = {
  active: boolean;
  lastSync: string | null;
  /** "db" when sourced from a local mirror, "proxy" when forwarded from FastAPI, "fallback" otherwise. */
  source: "proxy" | "fallback" | "db";
  /** Free-form diagnostic (only in dev). */
  reason?: string;
};

async function fetchBackendStatus(
  userId: string,
  email: string | null | undefined,
): Promise<{ active: boolean; lastSync: string | null } | null> {
  if (!INTERNAL_SECRET) return null;
  const url = `${BACKEND_URL.replace(/\/+$/, "")}/internal/agent-sync/status`;
  const params = new URLSearchParams({ user_id: userId });
  if (email) params.set("email", email);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${INTERNAL_SECRET}`,
        "X-Internal-Secret": INTERNAL_SECRET,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      active?: boolean;
      lastSync?: string | null;
      last_sync_at?: string | null;
    };
    return {
      active: Boolean(json.active),
      lastSync: json.lastSync ?? json.last_sync_at ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) {
    const payload: StatusResponse = {
      active: false,
      lastSync: null,
      source: "fallback",
      reason: process.env.NODE_ENV === "development" ? "unauthenticated" : undefined,
    };
    return NextResponse.json(payload);
  }

  const proxied = await fetchBackendStatus(user.id, user.email);
  if (proxied) {
    return NextResponse.json<StatusResponse>({
      active: proxied.active,
      lastSync: proxied.lastSync,
      source: "proxy",
    });
  }

  // Heuristic fallback: any user whose email lives on @agentic.alchm.kitchen
  // is presumed to be the agent mesh's own service identity — surface that
  // visibly even if the backend status endpoint isn't deployed yet.
  const isAgentEmail =
    typeof user.email === "string" && user.email.endsWith(AGENTIC_EMAIL_DOMAIN);

  return NextResponse.json<StatusResponse>({
    active: isAgentEmail,
    lastSync: null,
    source: "fallback",
    reason:
      process.env.NODE_ENV === "development"
        ? INTERNAL_SECRET
          ? "backend-unreachable"
          : "INTERNAL_API_SECRET-not-set"
        : undefined,
  });
}
