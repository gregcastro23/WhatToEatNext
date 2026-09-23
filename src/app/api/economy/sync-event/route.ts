import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import {
  buildDeliverySummary,
  claimInboundEvent,
  completeWebhookEvent,
  failWebhookEvent,
  resolveInboundDeliveryContext,
} from "@/lib/hooks/idempotency";
import { inFlightConflict } from "@/lib/hooks/inFlightConflict";
import { safeEqual } from "@/lib/hooks/secureCompare";
import {
  evaluateSignatureGate,
  resolveWebhookSecret,
  verifyStandardWebhook,
} from "@/lib/hooks/standardWebhooks";
import { _logger } from "@/lib/logger";
import { EconomySyncEventRequestSchema } from "@/lib/validation/apiSchemas";
import { questService, type QuestEventMetadata } from "@/services/QuestService";

/**
 * POST /api/economy/sync-event
 *
 * Internal server-to-server endpoint for reporting quest events from planetary-agents.
 *
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 *
 * Body:
 *   {
 *     userEmail: string,
 *     event: string,
 *     metadata?: {
 *       agentName?: string,
 *       sacredStat?: string,
 *       planetarySignature?: { ... }
 *     }
 *   }
 *
 * Response: { ok, event, completedCount, completed: [{ questSlug, tokensAwarded, tokenType }] }
 */
const STRING_MAX_LENGTH = 200;

function coerceString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return undefined;
  return trimmed;
}

function parseEventMetadata(raw: unknown): QuestEventMetadata | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const agentName = coerceString(obj.agentName, STRING_MAX_LENGTH);
  const sacredStat = coerceString(obj.sacredStat, STRING_MAX_LENGTH);
  const signature =
    obj.planetarySignature && typeof obj.planetarySignature === "object" && !Array.isArray(obj.planetarySignature)
      ? (obj.planetarySignature as Record<string, unknown>)
      : undefined;
  if (!agentName && !sacredStat && !signature) return undefined;
  return {
    ...(agentName ? { agentName } : {}),
    ...(sacredStat ? { sacredStat } : {}),
    ...(signature ? { planetarySignature: signature } : {}),
  };
}

async function readJsonBody(req: NextRequest): Promise<{ text: string; data: unknown } | null> {
  try {
    const text = await req.text();
    return { text, data: JSON.parse(text) };
  } catch {
    return null;
  }
}

function checkSyncAuth(req: NextRequest, rawBodyText: string): { ok: true } | { ok: false; response: NextResponse } {
  const verification = verifyStandardWebhook({
    headers: req.headers,
    rawBody: rawBodyText,
    secret: resolveWebhookSecret(),
  });
  const gate = evaluateSignatureGate(verification);
  if (!gate.proceed) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, reason: "unauthorized", error: gate.error },
        { status: gate.status ?? 401 },
      ),
    };
  }

  const authHeader = req.headers.get("X-Sync-Secret");
  const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  if (!safeEqual(authHeader, syncSecret)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, reason: "unauthorized" },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
}

export async function POST(req: NextRequest) {
  try {
    const parsedBody = await readJsonBody(req);
    if (!parsedBody) {
      return NextResponse.json(
        { ok: false, reason: "invalid_request", message: "Body must be valid JSON" },
        { status: 400 },
      );
    }
    const { text: rawBodyText, data: rawBody } = parsedBody;

    const authCheck = checkSyncAuth(req, rawBodyText);
    if (!authCheck.ok) {
      return authCheck.response;
    }

    const parseResult = EconomySyncEventRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          ok: false,
          reason: "invalid_request",
          message: "Missing or invalid userEmail or event",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { userEmail, event, metadata: rawMetadata } = parseResult.data;
    const metadata = parseEventMetadata(rawMetadata);

    // 2. Look up user ID by email (and confirm they're an agentic account)
    const userResult = await executeQuery<{ id: string; is_agent: boolean | null }>(
      "SELECT id, is_agent FROM users WHERE email = $1 LIMIT 1",
      [userEmail.toLowerCase()],
    );

    const [eventUser] = userResult.rows;
    if (!eventUser) {
      return NextResponse.json(
        { ok: false, reason: "user_not_found" },
        { status: 404 },
      );
    }

    const { id: userId, is_agent: isAgent } = eventUser;

    // 3. Claim idempotency key if provided
    const verification = verifyStandardWebhook({
      headers: req.headers,
      rawBody: rawBodyText,
      secret: resolveWebhookSecret(),
    });
    const delivery = resolveInboundDeliveryContext(req.headers, rawBody, verification);

    const claimResult = await claimInboundEvent({
      source: "asol-sync-event",
      key: delivery.effectiveKey,
      eventType: "sync-event",
      subjectId: userEmail,
      summary: buildDeliverySummary({ userEmail, event }, delivery),
      data: rawBody,
    });

    if (claimResult.isDuplicate) {
      if (claimResult.isInFlight) {
        return inFlightConflict({
          ok: false,
          error: "conflict",
          message: "Event is currently being processed",
        });
      }
      return NextResponse.json({
        ...(claimResult.previousResult ?? { ok: true, event }),
        deduplicated: true,
      });
    }

    try {
      // 4. Report Event to QuestService
      const completed = await questService.reportEvent(userId, event, metadata);

      const responsePayload = {
        ok: true,
        event,
        isAgent: isAgent === true,
        completedCount: completed.length,
        completed,
      };

      if (claimResult.claim) {
        await completeWebhookEvent(claimResult.claim, "processed", responsePayload);
      }

      return NextResponse.json(responsePayload);
    } catch (innerError) {
      if (claimResult.claim) {
        await failWebhookEvent(claimResult.claim, innerError);
      }
      throw innerError;
    }

  } catch (error) {
    _logger.error("[sync-event] Internal Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", message },
      { status: 500 }
    );
  }
}
