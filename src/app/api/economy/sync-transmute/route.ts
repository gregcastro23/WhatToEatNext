import { NextResponse, type NextRequest } from "next/server";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { withObservability } from "@/lib/observability/withObservability";
import { SyncTransmuteRequestSchema, type ParsedSyncTransmuteRequest } from "@/lib/validation/apiSchemas";
import {
  TRANSMUTATION_FAILURE_STATUS,
  transmutationService,
  type CounterpartyRef,
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

function badRequest(message: string, details?: unknown): NextResponse {
  return NextResponse.json(
    { ok: false, reason: "invalid_request", message, ...(details ? { details } : {}) },
    { status: 400 },
  );
}

/** Read and validate the body; a response means "stop here and send this". */
async function readAgentAct(
  req: NextRequest,
): Promise<{ ok: true; body: ParsedSyncTransmuteRequest } | { ok: false; response: NextResponse }> {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return { ok: false, response: badRequest("Invalid JSON body") };
  }
  const parsed = SyncTransmuteRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      ok: false,
      response: badRequest(
        parsed.error.issues[0]?.message ?? "Invalid sync-transmute request",
        parsed.error.flatten().fieldErrors,
      ),
    };
  }
  return { ok: true, body: parsed.data };
}

/** The acting account, which must be an agent. */
async function resolveAgent(email: string): Promise<{ ok: true; id: string } | { ok: false; response: NextResponse }> {
  const agent = await transmutationService.findParticipantIdByEmail(email);
  if (!agent) {
    return { ok: false, response: NextResponse.json({ ok: false, reason: "agent_not_found" }, { status: 404 }) };
  }
  if (!agent.isAgent && !email.endsWith(AGENTIC_EMAIL_DOMAIN)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          reason: "not_an_agent",
          message: "Only agent accounts trade through this door; humans trade with their own session.",
        },
        { status: 403 },
      ),
    };
  }
  return { ok: true, id: agent.id };
}

type AgentOfferAct = Extract<ParsedSyncTransmuteRequest, { action: "offer" }>;

function counterpartyOf(body: AgentOfferAct): CounterpartyRef | null {
  if (body.counterpartyEmail) return { email: body.counterpartyEmail };
  if (body.counterpartyId) return { id: body.counterpartyId };
  return null;
}

async function agentOffer(agentId: string, body: AgentOfferAct): Promise<NextResponse> {
  const result = await transmutationService.createOffer(agentId, {
    giveToken: body.giveToken,
    giveAmount: body.giveAmount,
    wantToken: body.wantToken,
    wantAmount: body.wantAmount,
    counterparty: counterpartyOf(body),
    replyToOfferId: body.replyToOfferId ?? null,
    message: body.message ?? null,
    ttlHours: body.ttlHours ?? null,
    idempotencyKey: body.idempotencyKey ?? null,
  });
  if (!result.ok) return refused(result);
  return NextResponse.json(
    { ok: true, agentId, offer: result.offer, replayed: result.replayed },
    { status: result.replayed ? 200 : 201 },
  );
}

async function agentAct(agentId: string, body: ParsedSyncTransmuteRequest): Promise<NextResponse> {
  switch (body.action) {
    case "board":
      return NextResponse.json({ ok: true, agentId, ...(await transmutationService.getCircle(agentId)) });
    case "offer":
      return agentOffer(agentId, body);
    case "accept": {
      const result = await transmutationService.acceptOffer(agentId, body.offerId);
      if (!result.ok) return refused(result);
      return NextResponse.json({
        ok: true,
        agentId,
        offer: result.offer,
        trade: result.trade,
        balances: result.balances,
      });
    }
    case "cancel":
    case "decline": {
      const result =
        body.action === "cancel"
          ? await transmutationService.cancelOffer(agentId, body.offerId)
          : await transmutationService.declineOffer(agentId, body.offerId);
      if (!result.ok) return refused(result);
      return NextResponse.json({ ok: true, agentId, offer: result.offer });
    }
  }
}

async function handlePost(req: NextRequest): Promise<NextResponse> {
  if (!safeEqual(req.headers.get("X-Sync-Secret"), process.env.ALCHM_KITCHEN_SYNC_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const read = await readAgentAct(req);
  if (!read.ok) return read.response;

  try {
    const agent = await resolveAgent(read.body.agentEmail);
    if (!agent.ok) return agent.response;
    return await agentAct(agent.id, read.body);
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
