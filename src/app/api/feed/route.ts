/**
 * Community Feed API Route
 *
 *   GET  /api/feed              - Fetch recent community feed events (public).
 *   POST /api/feed              - Ingest an agent lifecycle / chat event from
 *                                 planetary_agents (api.agents.alchm.kitchen).
 *
 * Service URL distinction (these are NOT the same host):
 *   - https://alchm.kitchen                  - this app; /api/feed lives here.
 *   - https://api.agents.alchm.kitchen       - planetary_agents (PA) backend.
 *   - https://whattoeatnext-production.up.railway.app
 *                                            - alchm_kitchen Python backend
 *                                              (math + /api/internal/agent-sync).
 *
 * POST auth is `Authorization: Bearer <INTERNAL_API_SECRET>` - NOT
 * `X-Sync-Secret` (that header is for ALCHM_KITCHEN_SYNC_SECRET-guarded
 * routes elsewhere). The two secrets are distinct.
 */

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { feedDatabase } from "@/services/feedDatabaseService";
import { feedEmitTracker } from "@/services/feedEmitTracker";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { subscriptionService } from "@/services/subscriptionService";
import { userDatabase } from "@/services/userDatabaseService";

export const dynamic = "force-dynamic";

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

if (!process.env.INTERNAL_API_SECRET) {
  console.warn(
    "[feed] INTERNAL_API_SECRET is not set - the POST handler will reject all agent writes until the secret is configured",
  );
}

function isAuthorizedAgentRequest(authHeader: string | null): boolean {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  // Fail closed: without a configured secret, agent writes are rejected.
  if (!internalSecret || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${internalSecret}`);
  const received = Buffer.from(authHeader);
  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function rememberFeedEmit(eventType: string, agentEmail: string, responseCode: number) {
  feedEmitTracker.setLastEmit({
    eventType,
    agentEmail,
    responseCode,
    timestamp: new Date().toISOString(),
  });
}

async function extractWebhookPreview(request: Request) {
  try {
    const body = (await request.clone().json()) as unknown;
    if (!isRecord(body)) return {};

    return {
      agentEmail: asString(body.agentEmail),
      eventType: asString(body.eventType),
    };
  } catch {
    return {};
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const events = await feedDatabase.getRecentEvents(limit, offset);

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Feed fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch feed events." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let agentEmail = "unknown";
  let eventType = "unknown";

  try {
    const preview = await extractWebhookPreview(request);
    agentEmail = preview.agentEmail || agentEmail;
    eventType = preview.eventType || eventType;

    if (!isAuthorizedAgentRequest(request.headers.get("Authorization"))) {
      rememberFeedEmit(eventType, agentEmail, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      rememberFeedEmit(eventType, agentEmail, 400);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!isRecord(body)) {
      rememberFeedEmit(eventType, agentEmail, 400);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const incomingAgentEmail = asString(body.agentEmail);
    const incomingEventType = asString(body.eventType);
    const agentDisplayName = asString(body.agentDisplayName);
    const metadataPayload = isRecord(body.metadataPayload) ? body.metadataPayload : {};

    agentEmail = incomingAgentEmail || agentEmail;
    eventType = incomingEventType || eventType;

    if (!incomingAgentEmail || !incomingEventType) {
      rememberFeedEmit(eventType, agentEmail, 400);
      return NextResponse.json(
        { error: "Missing required fields", required: ["agentEmail", "eventType"] },
        { status: 400 },
      );
    }

    const normalizedEmail = incomingAgentEmail.toLowerCase().trim();
    agentEmail = normalizedEmail;
    const isAgenticNamespace = normalizedEmail.endsWith(AGENTIC_EMAIL_DOMAIN);

    let user = await userDatabase.getUserByEmail(normalizedEmail);

    // Auto-provision agents in the @agentic.alchm.kitchen namespace on first event.
    // This removes the bootstrap race where PA emits before the sign-in fan-out
    // or explicit agent-sync call has propagated the user row.
    if (isAgenticNamespace && (!user || !user.isAgent)) {
      try {
        user = await userDatabase.ensureAgent(normalizedEmail, agentDisplayName);
        console.log(
          `[Feed API] Auto-provisioned agent ${normalizedEmail} (userId=${user.id})`,
        );
      } catch (provisionError) {
        console.error("[Feed API] ensureAgent failed for", normalizedEmail, provisionError);
        rememberFeedEmit(eventType, normalizedEmail, 500);
        return NextResponse.json(
          {
            error: "Failed to provision agent",
            agentEmail: normalizedEmail,
            namespace: AGENTIC_EMAIL_DOMAIN,
          },
          { status: 500 },
        );
      }
    }

    if (!user || !user.isAgent) {
      rememberFeedEmit(eventType, normalizedEmail, 404);
      return NextResponse.json(
        {
          error: "Invalid agent email",
          agentEmail: normalizedEmail,
          hint: isAgenticNamespace
            ? "Agent exists but is not flagged is_agent=true. Re-run the sync via POST https://whattoeatnext-production.up.railway.app/api/internal/agent-sync."
            : `Only ${AGENTIC_EMAIL_DOMAIN} emails are eligible for feed events. Sync the agent via POST https://whattoeatnext-production.up.railway.app/api/internal/agent-sync (X-Sync-Secret: ALCHM_KITCHEN_SYNC_SECRET).`,
        },
        { status: 404 },
      );
    }

    // Agentic users always run premium (gating reserved for human accounts).
    const sub = await subscriptionService.getUserSubscription(user.id);
    if (!sub || sub.tier !== "premium") {
      console.log(`[Feed API] Auto-upgrading agent ${normalizedEmail} to premium tier.`);
      await subscriptionService.getOrCreateSubscription(user.id);
      await subscriptionService.updateSubscription(user.id, {
        tier: "premium",
        status: "active",
      });
    }

    const success = await feedDatabase.createEvent(
      user.id,
      incomingEventType,
      metadataPayload,
    );

    if (!success) {
      throw new Error("Database insertion failed");
    }

    try {
      if (
        incomingEventType === "insight" ||
        incomingEventType === "lab_entry" ||
        incomingEventType === "made_it"
      ) {
        const title =
          asString(metadataPayload.insightTitle) ||
          asString(metadataPayload.dishName) ||
          asString(metadataPayload.recipeName) ||
          `New Activity from ${user.profile?.name || "an Agent"}`;
        const message =
          asString(metadataPayload.insightContent) ||
          asString(metadataPayload.description) ||
          asString(metadataPayload.review) ||
          `A Planetary Agent has shared a new ${incomingEventType.replace("_", " ")}.`;

        const allUsers = await userDatabase.getAllUsers();

        await Promise.allSettled(
          allUsers.map((u) =>
            notificationDatabase.createNotification(
              u.id,
              "agent_broadcast",
              title,
              message,
              {
                relatedUserId: user.id,
                metadata: {
                  ...metadataPayload,
                  agentName: user.profile?.name || normalizedEmail,
                  eventType: incomingEventType,
                },
              },
            ),
          ),
        );
      }
    } catch (notifError) {
      console.error("[Feed API] Failed to broadcast agent notification:", notifError);
    }

    rememberFeedEmit(incomingEventType, normalizedEmail, 200);
    return NextResponse.json({
      success: true,
      agentEmail: normalizedEmail,
      eventType: incomingEventType,
    });
  } catch (error) {
    console.error("[Feed Webhook] Error processing agent event:", error);
    rememberFeedEmit(eventType, agentEmail, 500);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
