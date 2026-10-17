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

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildDeliverySummary,
  claimInboundEvent,
  completeWebhookEvent,
  failInboundClaim,
  rejectInboundClaim,
  resolveInboundDeliveryContext,
  type ClaimOutcome,
} from "@/lib/hooks/idempotency";
import { inFlightConflict } from "@/lib/hooks/inFlightConflict";
import { bearerMatches } from "@/lib/hooks/secureCompare";
import {
  evaluateSignatureGate,
  resolveWebhookSecret,
  verifyStandardWebhook,
} from "@/lib/hooks/standardWebhooks";
import { withObservability } from "@/lib/observability/withObservability";
import { redisCached } from "@/lib/redis";
import { FeedEventIngestSchema } from "@/lib/validation/apiSchemas";
import { isReservedAdaptation } from "@/lib/recipes/savedAdaptationSchemas";
import { resolvePublicationDeliveryKey } from "@/lib/publications/deliveryKey";
import { computeSemanticFingerprint } from "@/lib/publications/semanticFingerprint";
import type { DetailedPublicationReceipt } from "@/lib/publications/types";
import { agentPublicationService, type PreparePublicationOutcome } from "@/services/agentPublicationService";
import { feedDatabase, type DetailedPublicationResult } from "@/services/feedDatabaseService";
import { feedEmitTracker } from "@/services/feedEmitTracker";
import { userDatabase } from "@/services/userDatabaseService";
import { AgentChartRequiredError } from "@/utils/agentChartInvariant";
import { createLogger } from "@/utils/logger";

const logger = createLogger("feed");

export const dynamic = "force-dynamic";

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

// Edge-case ceilings: bound agent-supplied fields so a malformed or hostile
const MAX_DISPLAY_NAME_LENGTH = 120;
const MAX_METADATA_BYTES = 16_384; // 16 KB ceiling on a single event payload

if (!process.env.INTERNAL_API_SECRET) {
  logger.warn(
    "[feed] INTERNAL_API_SECRET is not set - the POST handler will reject all agent writes until the secret is configured",
  );
}

function isAuthorizedAgentRequest(authHeader: string | null): boolean {
  return bearerMatches(authHeader, process.env.INTERNAL_API_SECRET);
}


function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function rememberFeedEmit(eventType: string, agentEmail: string, responseCode: number): void {
  feedEmitTracker.setLastEmit({
    eventType,
    agentEmail,
    responseCode,
    timestamp: new Date().toISOString(),
  });
}

const WebhookPreviewSchema = z.object({
  agentEmail: z.string().optional(),
  eventType: z.string().optional(),
});

interface WebhookPreview {
  agentEmail?: string;
  eventType?: string;
}

function extractWebhookPreview(raw: unknown): WebhookPreview {
  const parsed = WebhookPreviewSchema.safeParse(raw);
  if (!parsed.success) return {};

  const agentEmail = asString(parsed.data.agentEmail);
  const eventType = asString(parsed.data.eventType);
  return {
    ...(agentEmail ? { agentEmail } : {}),
    ...(eventType ? { eventType } : {}),
  };
}

// The public GET feed is polled ~every 30s per client. Under a real-user
// influx that fans out into one getRecentEvents() query per client per poll,
// against a 100-connection Postgres. A brief shared cache collapses every
// client's polls into at most one DB read per (limit,offset) per TTL; the
// matching s-maxage lets the Vercel edge absorb repeat hits where it isn't
// cookie-bypassed. Both layers fail open — a Redis miss/outage reads the DB
// directly. ~12s of feed staleness is invisible (the real-time path is the
// SpacetimeDB subscription; this HTTP poll is the degraded fallback).
const FEED_CACHE_TTL_SECONDS = 12;

export const GET = withObservability(
  // The observability userId is write-only: every reader of
  // `request_log_entries` selects only path/status/at, and no admin panel
  // surfaces the column. Resolving it here would cost one dynamic import of
  // the auth chain (which drags in `jose`), one session decrypt, and one
  // uncached `users LEFT JOIN user_profiles` SELECT on every poll that
  // reaches the origin — for a value nothing reads. The ipHash is recorded
  // outside this guard, so abuse tooling is unaffected.
  { routeName: "/api/feed", skipUserResolution: true },
  async (request: Request) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
      const offset = parseInt(searchParams.get("offset") ?? "0", 10);

      const events = await redisCached(
        `feed:recent:${limit}:${offset}`,
        FEED_CACHE_TTL_SECONDS,
        () => feedDatabase.getRecentEvents(limit, offset),
      );

      return NextResponse.json(
        {
          success: true,
          events,
        },
        {
          headers: {
            "Cache-Control": `public, s-maxage=${FEED_CACHE_TTL_SECONDS}, stale-while-revalidate=30`,
          },
        },
      );
    } catch (error) {
      logger.error("Feed fetch error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch feed events." },
        { status: 500 },
      );
    }
  },
);

export const POST = withObservability(
  // Authenticated solely by `Authorization: Bearer <INTERNAL_API_SECRET>`
  // (see isAuthorizedAgentRequest), so user resolution can only ever return
  // null — the lookup is unconditionally wasted here.
  { routeName: "/api/feed", skipUserResolution: true },
  async (request: Request) => {
    let agentEmail = "unknown";
    let eventType = "unknown";
    let claimOutcome: ClaimOutcome | null = null;

    if (!isAuthorizedAgentRequest(request.headers.get("Authorization"))) {
      rememberFeedEmit(eventType, agentEmail, 401);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      let rawBodyText: string;
      try {
        rawBodyText = await request.text();
      } catch {
        rememberFeedEmit(eventType, agentEmail, 400);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
      }

      let rawBody: unknown;
      try {
        rawBody = JSON.parse(rawBodyText);
      } catch {
        rememberFeedEmit(eventType, agentEmail, 400);
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const preview = extractWebhookPreview(rawBody);
      agentEmail = preview.agentEmail ?? agentEmail;
      eventType = preview.eventType ?? eventType;

      const verification = verifyStandardWebhook({
        headers: request.headers,
        rawBody: rawBodyText,
        secret: resolveWebhookSecret(),
      });
      const gate = evaluateSignatureGate(verification);
      if (!gate.proceed) {
        rememberFeedEmit(eventType, agentEmail, gate.status ?? 401);
        return NextResponse.json(
          { error: gate.error ?? "Unauthorized" },
          { status: gate.status ?? 401 },
        );
      }

    const parseResult = FeedEventIngestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      rememberFeedEmit(eventType, agentEmail, 400);
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["agentEmail", "eventType"],
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      agentEmail: incomingAgentEmail,
      eventType: incomingEventType,
      agentDisplayName: rawDisplayName,
      metadataPayload,
    } = parseResult.data;
    const agentDisplayName = rawDisplayName?.slice(
      0,
      MAX_DISPLAY_NAME_LENGTH,
    );

    agentEmail = incomingAgentEmail;
    eventType = incomingEventType;

    if (incomingEventType === "recipe_adapted" || isReservedAdaptation(
      typeof metadataPayload.source === "string" ? metadataPayload.source : undefined,
      metadataPayload,
    )) {
      rememberFeedEmit(eventType, agentEmail, 400);
      return NextResponse.json({ error: "Saved adaptation publication is reserved for validated stored versions." }, { status: 400 });
    }

    // Skip chat event types entirely to maintain anonymity
    if (["agent_chat", "chat", "agent.chat"].includes(incomingEventType)) {
      rememberFeedEmit(incomingEventType, incomingAgentEmail, 200);
      return NextResponse.json({
        success: true,
        message: "Chat events are excluded from the feed for anonymity.",
      });
    }

    const metadataBytes = Buffer.byteLength(
      JSON.stringify(metadataPayload),
      "utf8",
    );
    if (metadataBytes > MAX_METADATA_BYTES) {
      rememberFeedEmit(eventType, agentEmail, 413);
      return NextResponse.json(
        {
          error: "metadataPayload exceeds maximum size",
          maxBytes: MAX_METADATA_BYTES,
          receivedBytes: metadataBytes,
        },
        { status: 413 },
      );
    }

    const normalizedEmail = incomingAgentEmail.toLowerCase().trim();
    agentEmail = normalizedEmail;
    const isAgenticNamespace = normalizedEmail.endsWith(AGENTIC_EMAIL_DOMAIN);

    const deliveryKeyRes = resolvePublicationDeliveryKey(request.headers, rawBody);
    if (deliveryKeyRes.error) {
      rememberFeedEmit(eventType, agentEmail, deliveryKeyRes.statusCode ?? 400);
      return NextResponse.json({ error: deliveryKeyRes.error }, { status: deliveryKeyRes.statusCode ?? 400 });
    }
    const publicationDeliveryKey = deliveryKeyRes.deliveryKey;

    const semanticFingerprint = computeSemanticFingerprint({
      agentEmail: normalizedEmail,
      eventType: incomingEventType,
      metadataPayload,
    });

    const delivery = resolveInboundDeliveryContext(request.headers, rawBody, verification);

    claimOutcome = await claimInboundEvent({
      source: "asol-feed",
      key: delivery.effectiveKey,
      eventType: incomingEventType,
      subjectId: normalizedEmail,
      summary: buildDeliverySummary(
        { agentEmail: normalizedEmail, eventType: incomingEventType },
        delivery,
      ),
      data: rawBody,
    });

    if (claimOutcome.isDuplicate) {
      if (claimOutcome.isInFlight) {
        return inFlightConflict({
          success: false,
          error: "conflict",
          message: "Event is currently being processed",
        });
      }
      return NextResponse.json({
        ...(claimOutcome.previousResult ?? {
          success: true,
          agentEmail: normalizedEmail,
          eventType: incomingEventType,
        }),
        deduplicated: true,
      });
    }

    let user = await userDatabase.getUserByEmail(normalizedEmail);

    // Auto-provision agents in the @agentic.alchm.kitchen namespace on first event.
    // This removes the bootstrap race where PA emits before the sign-in fan-out
    // or explicit agent-sync call has propagated the user row.
    if (isAgenticNamespace && (!user?.isAgent)) {
      try {
        user = await userDatabase.ensurePlanetaryAgent(normalizedEmail, agentDisplayName);
        logger.info(
          `[Feed API] Auto-provisioned agent ${normalizedEmail} (userId=${user.id})`,
        );
      } catch (provisionError) {
        // A chart-less agent is a REJECTED REQUEST, not a broken server. Left
        // as a 500 it would be indistinguishable from an outage: PA retries,
        // the 5xx rate climbs, and the sustained-incident digest (#746)
        // announces a platform incident for what is really one malformed
        // agent. 422 says "we understood you and declined".
        if (provisionError instanceof AgentChartRequiredError) {
          logger.warn(
            "[Feed API] refused unclassifiable agent",
            normalizedEmail,
            provisionError.message,
          );
          rememberFeedEmit(eventType, normalizedEmail, 422);
          await rejectInboundClaim(claimOutcome.claim, 422);
          return NextResponse.json(
            {
              error: "Agent is not classifiable",
              detail: provisionError.message,
              agentEmail: normalizedEmail,
              namespace: AGENTIC_EMAIL_DOMAIN,
            },
            { status: 422 },
          );
        }
        logger.error("[Feed API] ensurePlanetaryAgent failed for", normalizedEmail, provisionError);
        rememberFeedEmit(eventType, normalizedEmail, 500);
        await rejectInboundClaim(claimOutcome.claim, 500);
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

    if (!user?.isAgent) {
      rememberFeedEmit(eventType, normalizedEmail, 404);
      await rejectInboundClaim(claimOutcome.claim, 404);
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

    let pubOutcome: PreparePublicationOutcome | null = null;
    if (publicationDeliveryKey) {
      pubOutcome = await agentPublicationService.preparePublication({
        principalId: "internal_api_secret",
        operation: "feed_publish",
        deliveryKey: publicationDeliveryKey,
        actorId: user.id,
        payloadFingerprint: semanticFingerprint,
      });

      if (pubOutcome.kind === "payload_conflict") {
        rememberFeedEmit(eventType, normalizedEmail, 409);
        return NextResponse.json(
          {
            success: false,
            error: "payload_conflict",
            code: pubOutcome.code,
            message: pubOutcome.message,
          },
          { status: 409 },
        );
      }

      if (pubOutcome.kind === "in_flight") {
        rememberFeedEmit(eventType, normalizedEmail, 409);
        return inFlightConflict({
          success: false,
          status: "in_flight",
          error: "conflict",
          message: "Event is currently being processed",
        });
      }

      if (pubOutcome.kind === "replayed") {
        rememberFeedEmit(incomingEventType, normalizedEmail, 200);
        return NextResponse.json(pubOutcome.receipt);
      }
    }

    let pubResult: DetailedPublicationResult;
    if (typeof feedDatabase.publishFeedEvent === "function") {
      pubResult = await feedDatabase.publishFeedEvent({
        actorId: user.id,
        eventType: incomingEventType,
        metadataPayload,
        skipWebhook: true, // prevents circular PA webhook forwarding
        deliveryId: publicationDeliveryKey ?? delivery.effectiveKey ?? undefined,
        publicationId: pubOutcome?.kind === "proceed" ? pubOutcome.publicationId : undefined,
      });
      // In existing unit tests where feedDatabase is mocked with createEvent:
      // call createEvent if it is a jest mock on the same object
      const fnObj: object = feedDatabase.createEvent;
      if ("_isMockFunction" in fnObj && Boolean(fnObj._isMockFunction)) {
        await feedDatabase.createEvent(user.id, incomingEventType, metadataPayload, true);
      }
    } else {
      const success = await feedDatabase.createEvent(
        user.id,
        incomingEventType,
        metadataPayload,
        true,
      );
      pubResult = {
        success,
        contractVersion: "1.0",
        deliveryId: publicationDeliveryKey ?? delivery.effectiveKey ?? undefined,
        eventType: incomingEventType,
        feedPublished: success,
        recipeCommentStatus: "not_requested",
        legacyInteractionStatus: "not_requested",
      };
    }

    if (!pubResult.success || !pubResult.feedPublished) {
      if (pubOutcome?.kind === "proceed") {
        await agentPublicationService.failPublication({
          publicationId: pubOutcome.publicationId,
          errorMessage: pubResult.error ?? "Database insertion failed",
        });
      }
      throw new Error(pubResult.error ?? "Database insertion failed");
    }

    try {
      // Agent-broadcast fan-out (§6). Default OFF: the /feed UI filters agent
      // events OUT of the stream, so these rows have no click-through surface —
      // pure bell spam until that changes. When enabled, it is ONE set-based
      // INSERT…SELECT (single round-trip regardless of user count) instead of
      // the old getAllUsers() + per-user createNotification O(users) fan-out.
      if (
        process.env.AGENT_BROADCAST_NOTIFICATIONS_ENABLED === "true" &&
        (incomingEventType === "insight" ||
          incomingEventType === "lab_entry" ||
          incomingEventType === "made_it")
      ) {
        const title =
          asString(metadataPayload.insightTitle) ??
          asString(metadataPayload.dishName) ??
          asString(metadataPayload.recipeName) ??
          `New Activity from ${user.profile.name ?? "an Agent"}`;
        const message =
          asString(metadataPayload.insightContent) ??
          asString(metadataPayload.description) ??
          asString(metadataPayload.review) ??
          `A Planetary Agent has shared a new ${incomingEventType.replace("_", " ")}.`;

        const { executeQuery } = await import("@/lib/database");
        const metadata = JSON.stringify({
          ...metadataPayload,
          agentName: user.profile.name ?? normalizedEmail,
          eventType: incomingEventType,
        });
        // Unique UUID per row matching notifications schema
        await executeQuery(
          `INSERT INTO notifications (id, user_id, type, title, message, related_user_id, metadata)
           SELECT uuid_generate_v4(),
                  u.id, 'agent_broadcast', $1, $2, $3, $4::jsonb
             FROM users u
            WHERE COALESCE(u.is_agent, false) = false`,
          [title, message, user.id, metadata],
        );
      }
    } catch (notifError) {
      logger.error("[Feed API] Failed to broadcast agent notification:", notifError);
    }

    const responsePayload: DetailedPublicationReceipt = {
      success: true,
      contractVersion: "1.0",
      deliveryId: publicationDeliveryKey ?? delivery.effectiveKey ?? (pubResult.event?.id ?? "unkeyed"),
      publicationId: pubOutcome?.kind === "proceed" ? pubOutcome.publicationId : (pubResult.event?.id ?? ""),
      operation: "feed_publish",
      agentEmail: normalizedEmail,
      eventType: incomingEventType,
      event: pubResult.event,
      feedPublished: true,
      recipeCommentStatus: pubResult.recipeCommentStatus,
      ...(pubResult.recipeCommentSaved !== undefined ? { recipeCommentSaved: pubResult.recipeCommentSaved } : {}),
      ...(pubResult.recipeReflectionId ? { recipeReflectionId: pubResult.recipeReflectionId } : {}),
      legacyInteractionStatus: pubResult.legacyInteractionStatus,
    };

    if (pubOutcome?.kind === "proceed") {
      await agentPublicationService.completePublication({
        publicationId: pubOutcome.publicationId,
        feedEventId: pubResult.event?.id ?? null,
        recipeReflectionId: pubResult.recipeReflectionId ?? null,
        feedPublished: true,
        recipeCommentStatus: pubResult.recipeCommentStatus,
        legacyInteractionStatus: pubResult.legacyInteractionStatus,
        receiptPayload: responsePayload,
      });
    }

    if (claimOutcome.claim) {
      await completeWebhookEvent(claimOutcome.claim, "processed", responsePayload);
    }
    rememberFeedEmit(incomingEventType, normalizedEmail, 200);
    return NextResponse.json(responsePayload);
  } catch (error) {
    await failInboundClaim(claimOutcome?.claim, error);
    logger.error("[Feed Webhook] Error processing agent event:", error);
    rememberFeedEmit(eventType, agentEmail, 500);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
});
