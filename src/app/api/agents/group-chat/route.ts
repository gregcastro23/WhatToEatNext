/**
 * Transit → group-chat session creator (server proxy to Planetary Agents).
 *
 * POST /api/agents/group-chat
 *
 * Body:
 *   {
 *     agents: Array<{ id: string; planet?; sign?; degree?; name? }>,  // ≥1, capped at 6
 *     transit?: { aspect?: string; key?: string; label?: string },
 *     source?: string                                                  // e.g. "aspects-display"
 *   }
 *
 * Behaviour (matches the "create-then-redirect" decision):
 *   - 1 agent  → return the existing single-agent deep link (works today; no PA call).
 *   - ≥2 agents → POST to PA `${agentsUi}/api/internal/group-chat` with
 *                 `X-Sync-Secret: INTERNAL_API_SECRET` (mirrors the admin agent-sync
 *                 proxy), expecting `{ sessionId, url }` back, and return that url.
 *   - Any failure (PA route not yet shipped, unreachable, unconfigured) degrades
 *     gracefully to the primary agent's single chat so the click never dead-ends.
 *
 * The browser always just navigates to the returned `url` — all fallback logic
 * lives here, server-side. `userId` is best-effort attribution only (the call is
 * secret-gated server-to-server, so it is not a trust boundary).
 *
 * @file src/app/api/agents/group-chat/route.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { createLogger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("TransitGroupChatProxy");

const RATE_LIMIT = { window: 60_000, max: 20, bucket: "agents-group-chat" };
const PA_TIMEOUT_MS = 6000;
const MAX_AGENTS = 6;

interface Participant {
  id: string;
  planet?: string;
  sign?: string;
  degree?: number;
  name?: string;
}

interface RequestBody {
  agents?: Participant[];
  transit?: { aspect?: string; key?: string; label?: string } | null;
  source?: string;
}

/** Deep link a single agent's chat — used for solo councils and as the failure fallback. */
function singleChatUrl(agentId: string): string {
  return `${getServiceUrlSafe("agentsUi")}/gallery/chat/${encodeURIComponent(agentId)}`;
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate + de-dupe + cap.
  const seen = new Set<string>();
  const agents = (Array.isArray(body.agents) ? body.agents : [])
    .filter((a): a is Participant => !!a && typeof a.id === "string" && a.id.length > 0)
    .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
    .slice(0, MAX_AGENTS);

  if (agents.length === 0) {
    return NextResponse.json({ error: "No valid agents provided" }, { status: 400 });
  }

  // Solo council → the existing single-agent chat (resolves today against the
  // seeded planetary-degree agents; no PA group endpoint needed).
  if (agents.length === 1) {
    return NextResponse.json({ url: singleChatUrl(agents[0].id), sessionId: null, degraded: false, solo: true });
  }

  const secret = process.env.INTERNAL_API_SECRET;
  const paBase = getServiceUrlSafe("agentsUi");
  const fallback = singleChatUrl(agents[0].id);

  if (!secret) {
    logger.warn("INTERNAL_API_SECRET unset — degrading to single-agent fallback");
    return NextResponse.json({ url: fallback, degraded: true, reason: "secret-unconfigured" });
  }

  // Best-effort attribution; never blocks the request.
  let userId: string | null = null;
  try {
    userId = await getUserIdFromRequest(request);
  } catch {
    userId = null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PA_TIMEOUT_MS);
  try {
    const resp = await fetch(`${paBase}/api/internal/group-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sync-Secret": secret },
      body: JSON.stringify({
        agentIds: agents.map((a) => a.id),
        agents,
        transit: body.transit ?? null,
        origin: "alchm.kitchen",
        source: body.source ?? "transit-click",
        userId,
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      logger.warn("PA group-chat create failed; using fallback", {
        status: resp.status,
        body: text.slice(0, 200),
      });
      return NextResponse.json({ url: fallback, degraded: true, reason: `pa-${resp.status}` });
    }

    const data = (await resp.json().catch(() => ({}))) as { sessionId?: string; url?: string };
    const url =
      data.url ??
      (data.sessionId ? `${paBase}/gallery/group/${encodeURIComponent(data.sessionId)}` : fallback);

    return NextResponse.json({ url, sessionId: data.sessionId ?? null, degraded: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn("PA group-chat create errored; using fallback", { error: msg });
    return NextResponse.json({ url: fallback, degraded: true, reason: "pa-unreachable" });
  } finally {
    clearTimeout(timer);
  }
}
