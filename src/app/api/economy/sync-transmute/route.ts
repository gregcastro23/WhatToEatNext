import { NextResponse, type NextRequest } from "next/server";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { withObservability } from "@/lib/observability/withObservability";
import { SyncTransmuteRequestSchema } from "@/lib/validation/apiSchemas";
import {
  TRANSMUTATION_FAILURE_STATUS,
  transmutationService,
} from "@/services/transmutationService";
import type { TransmutationFailure } from "@/types/transmutation";
import { createLogger } from "@/utils/logger";

const logger = createLogger("economy:sync-transmute");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/economy/sync-transmute
 *
 * The Transmutation Circle's door for AGENTS (ADR-018): the planetary-agents
 * engine trades on an agent's behalf, naming the agent — and any counterparty —
 * by email. Humans trade through /api/economy/transmute with their own session.
 *
 * Auth: X-Sync-Secret matched against ALCHM_KITCHEN_SYNC_SECRET in constant
 * time. The acting account must be an agent: this secret is the engine's, and
 * it must never move a human's coins without that human's own session.
 *
 * Body (by `action`):
 *   board   { agentEmail }                         → the Circle as that agent sees it
 *   offer   { agentEmail, giveToken, giveAmount, wantToken, wantAmount,
 *             counterpartyEmail? | counterpartyId? | replyToOfferId?,
 *             message?, ttlHours?, idempotencyKey? }
 *   accept  { agentEmail, offerId }
 *   cancel  { agentEmail, offerId }
 *   decline { agentEmail, offerId }
 *
 * Responses: 200/201 { ok: true, … } · 400 invalid_request · 401 · 403 not_an_agent
 * · 404 agent_not_found · and the Circle's own refusals with their statuses
 * (402 insufficient_funds, 409 offer_closed, 422 off_market, 503 rates_unavailable…).
 */

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

function refused(failure: TransmutationFailure): NextResponse {
  return NextResponse.json(
    { ok: false, reason: failure.reason, message: failure.message },
    { status: TRANSMUTATION_FAILURE_STATUS[failure.reason] },
  );
}

async function handlePost(req: NextRequest): Promise<NextResponse> {
  if (!safeEqual(req.headers.get("X-Sync-Secret"), process.env.ALCHM_KITCHEN_SYNC_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_request", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = SyncTransmuteRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_request",
        message: parsed.error.issues[0]?.message ?? "Invalid sync-transmute request",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const body = parsed.data;

  try {
    const agent = await transmutationService.findParticipantIdByEmail(body.agentEmail);
    if (!agent) {
      return NextResponse.json({ ok: false, reason: "agent_not_found" }, { status: 404 });
    }
    if (!agent.isAgent && !body.agentEmail.endsWith(AGENTIC_EMAIL_DOMAIN)) {
      return NextResponse.json(
        {
          ok: false,
          reason: "not_an_agent",
          message: "Only agent accounts trade through this door; humans trade with their own session.",
        },
        { status: 403 },
      );
    }

    switch (body.action) {
      case "board": {
        const circle = await transmutationService.getCircle(agent.id);
        return NextResponse.json({ ok: true, agentId: agent.id, ...circle });
      }
      case "offer": {
        const counterparty = body.counterpartyEmail
          ? { email: body.counterpartyEmail }
          : body.counterpartyId
            ? { id: body.counterpartyId }
            : undefined;
        const result = await transmutationService.createOffer(agent.id, {
          giveToken: body.giveToken,
          giveAmount: body.giveAmount,
          wantToken: body.wantToken,
          wantAmount: body.wantAmount,
          counterparty,
          replyToOfferId: body.replyToOfferId,
          message: body.message,
          ttlHours: body.ttlHours,
          idempotencyKey: body.idempotencyKey,
        });
        if (!result.ok) return refused(result);
        return NextResponse.json(
          { ok: true, agentId: agent.id, offer: result.offer, replayed: result.replayed },
          { status: result.replayed ? 200 : 201 },
        );
      }
      case "accept": {
        const result = await transmutationService.acceptOffer(agent.id, body.offerId);
        if (!result.ok) return refused(result);
        return NextResponse.json({
          ok: true,
          agentId: agent.id,
          offer: result.offer,
          trade: result.trade,
          balances: result.balances,
        });
      }
      case "cancel":
      case "decline": {
        const result =
          body.action === "cancel"
            ? await transmutationService.cancelOffer(agent.id, body.offerId)
            : await transmutationService.declineOffer(agent.id, body.offerId);
        if (!result.ok) return refused(result);
        return NextResponse.json({ ok: true, agentId: agent.id, offer: result.offer });
      }
    }
  } catch (error) {
    logger.error("[sync-transmute] Internal Error:", error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: "The transmutation failed and nothing was exchanged." },
      { status: 500 },
    );
  }
}

/** Instrumented like sync-debit: S2S traffic leaves a durable request record. */
export const POST = withObservability(
  { routeName: "/api/economy/sync-transmute", skipUserResolution: true },
  handlePost,
);
