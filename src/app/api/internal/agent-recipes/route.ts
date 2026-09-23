/**
 * Internal Agent Recipe Authoring
 * POST /api/internal/agent-recipes
 *
 * Lets the Planetary Agents service persist a recipe AUTHORED BY an agentic
 * user into `user_custom_recipes` — the same store the human "save a custom
 * recipe" flow uses — so an agent's recipe is real, durable, and attributed to
 * its user row (it shows under that user the same way human custom recipes do).
 *
 * Secret-gated (INTERNAL_API_SECRET) because agentic users have no session
 * cookie. The caller supplies the agent's WTEN user id, which Planetary Agents
 * already stores as `alchmKitchenUserId` after agent-sync. Returns the new id
 * so PA can reference it on the agent's profile feed event.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import {
  buildDeliverySummary,
  claimInboundEvent,
  completeWebhookEvent,
  failWebhookEvent,
  resolveInboundDeliveryContext,
} from "@/lib/hooks/idempotency";
import { inFlightConflict } from "@/lib/hooks/inFlightConflict";
import { bearerMatches, safeEqual } from "@/lib/hooks/secureCompare";
import {
  evaluateSignatureGate,
  resolveWebhookSecret,
  verifyStandardWebhook,
} from "@/lib/hooks/standardWebhooks";
import { _logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AgentRecipeBodySchema = z.object({
  // The authoring agent's WTEN user id (PA's alchmKitchenUserId).
  userId: z.string().trim().min(1, "userId (agentic WTEN user id) is required"),
  name: z.string().trim().min(1, "name is required").max(200),
  cuisine: z.string().trim().max(120).optional(),
  // Where the recipe came from; defaults to "agent" so these are filterable.
  source: z.string().trim().max(60).optional(),
  // Optional catalog recipe this was riffed from.
  sourceRecipeId: z.string().trim().max(200).optional(),
  payload: z.record(z.string(), z.unknown()),
  notes: z.string().max(2000).optional(),
});

interface InsertedRow {
  id: string;
  created_at: string;
}

async function readJsonBody(request: NextRequest): Promise<{ text: string; data: unknown } | null> {
  try {
    const text = await request.text();
    return { text, data: JSON.parse(text) };
  } catch {
    return null;
  }
}

function checkAgentRecipeAuth(
  request: NextRequest,
  rawBodyText: string,
): { ok: true; verification: ReturnType<typeof verifyStandardWebhook> } | { ok: false; response: NextResponse } {
  const verification = verifyStandardWebhook({
    headers: request.headers,
    rawBody: rawBodyText,
    secret: resolveWebhookSecret(),
  });
  const gate = evaluateSignatureGate(verification);
  if (!gate.proceed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: gate.error ?? "Unauthorized" },
        { status: gate.status ?? 401 },
      ),
    };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const syncHeader = request.headers.get("x-sync-secret") ?? "";

  const isBearerAuthorized = bearerMatches(
    authHeader,
    process.env.INTERNAL_API_SECRET,
  );
  const isSyncHeaderAuthorized = safeEqual(
    syncHeader,
    process.env.ALCHM_KITCHEN_SYNC_SECRET,
  );

  if (!isBearerAuthorized && !isSyncHeaderAuthorized) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, verification };
}

export async function POST(request: NextRequest) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { text: rawBodyText, data: rawBody } = parsedBody;

  const authCheck = checkAgentRecipeAuth(request, rawBodyText);
  if (!authCheck.ok) {
    return authCheck.response;
  }
  const { verification } = authCheck;

  const parsed = AgentRecipeBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const delivery = resolveInboundDeliveryContext(request.headers, rawBody, verification);

  const claimResult = await claimInboundEvent({
    source: "asol-agent-recipes",
    key: delivery.effectiveKey,
    eventType: "agent-recipe",
    subjectId: body.userId,
    summary: buildDeliverySummary({ userId: body.userId, name: body.name }, delivery),
    data: rawBody,
  });

  if (claimResult.isDuplicate) {
    if (claimResult.isInFlight) {
      return inFlightConflict({
        success: false,
        error: "conflict",
        message: "Event is currently being processed",
      });
    }
    return NextResponse.json({
      ...(claimResult.previousResult ?? { success: true }),
      deduplicated: true,
    });
  }

  try {
    const result = await executeQuery<InsertedRow>(
      `INSERT INTO user_custom_recipes
         (user_id, name, cuisine, source, source_recipe_id, payload, notes)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       RETURNING id, created_at`,
      [
        body.userId,
        body.name,
        body.cuisine ?? null,
        body.source ?? "agent",
        body.sourceRecipeId ?? null,
        JSON.stringify(body.payload),
        body.notes ?? null,
      ],
    );
    const [row] = result.rows;
    if (!row) {
      return NextResponse.json(
        { success: false, error: "recipe insert returned no row" },
        { status: 500 },
      );
    }
    const responsePayload = {
      success: true,
      id: row.id,
      createdAt: new Date(row.created_at).getTime(),
    };
    if (claimResult.claim) {
      await completeWebhookEvent(claimResult.claim, "processed", responsePayload);
    }
    return NextResponse.json(responsePayload);
  } catch (error) {
    if (claimResult.claim) {
      await failWebhookEvent(claimResult.claim, error);
    }
    _logger.error("[POST /api/internal/agent-recipes]", error);
    return NextResponse.json(
      { error: "Failed to author recipe" },
      { status: 500 },
    );
  }
}
