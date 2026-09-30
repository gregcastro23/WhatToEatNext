/**
 * The Transmutation Circle — peer-to-peer ESMS trades (ADR-018).
 *
 * Swapping is solitary: /api/economy/swap converts your coins against the
 * live index. Transmuting is social: two practitioners each send the other the
 * coin that one lacks. This door serves the human side; agents trade through
 * /api/economy/sync-transmute.
 *
 *   GET  → the Circle as you see it: offers you can fill (made to you first,
 *          then the ones that give what you lack), your own offers, your needs,
 *          a suggested trade, your trading record and the network's pulse.
 *   POST { action: "offer",   giveToken, giveAmount, wantToken, wantAmount,
 *          counterpartyId?, replyToOfferId?, message?, ttlHours?, idempotencyKey? }
 *   POST { action: "accept",  offerId }   — fill it: both wallets move at once
 *   POST { action: "cancel",  offerId }   — withdraw your own offer
 *   POST { action: "decline", offerId }   — turn down an offer made to you
 *
 * The old fixed 3:1 solo conversion is retired: a body in that shape gets 410
 * pointing at /api/economy/swap.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { TransmuteRequestSchema } from "@/lib/validation/apiSchemas";
import {
  TRANSMUTATION_FAILURE_STATUS,
  transmutationService,
} from "@/services/transmutationService";
import type { TransmutationFailure } from "@/types/transmutation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function refused(failure: TransmutationFailure): NextResponse {
  return NextResponse.json(
    { success: false, reason: failure.reason, message: failure.message },
    { status: TRANSMUTATION_FAILURE_STATUS[failure.reason] },
  );
}

const slowDown = (): NextResponse =>
  NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });

const authRequired = (): NextResponse =>
  NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return authRequired();

  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "economy-transmute-read", identifier: userId });
  if (!rl.allowed) return rl.response ?? slowDown();

  try {
    const circle = await transmutationService.getCircle(userId);
    return NextResponse.json({ success: true, ...circle });
  } catch (error) {
    _logger.error("[GET /api/economy/transmute]", error);
    return NextResponse.json(
      { success: false, message: "The Transmutation Circle could not be read. Try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return authRequired();

  const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "economy-transmute", identifier: userId });
  if (!rl.allowed) return rl.response ?? slowDown();

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  // The retired 3:1 solo conversion: say where it went instead of a bare 400.
  if (rawBody && typeof rawBody === "object" && "fromToken" in rawBody && !("action" in rawBody)) {
    return NextResponse.json(
      {
        success: false,
        reason: "retired",
        message:
          "Converting coins on your own is now a swap at live index rates — use /api/economy/swap. " +
          "Transmutation is a trade with another practitioner: post an offer with action \"offer\".",
      },
      { status: 410 },
    );
  }

  const parsed = TransmuteRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return NextResponse.json(
      {
        success: false,
        reason: "invalid_request",
        message: issue?.message ?? "Invalid transmutation request",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const body = parsed.data;
  try {
    switch (body.action) {
      case "offer": {
        const result = await transmutationService.createOffer(userId, {
          giveToken: body.giveToken,
          giveAmount: body.giveAmount,
          wantToken: body.wantToken,
          wantAmount: body.wantAmount,
          counterparty: body.counterpartyId ? { id: body.counterpartyId } : undefined,
          replyToOfferId: body.replyToOfferId,
          message: body.message,
          ttlHours: body.ttlHours,
          idempotencyKey: body.idempotencyKey,
        });
        if (!result.ok) return refused(result);
        return NextResponse.json(
          {
            success: true,
            offer: result.offer,
            replayed: result.replayed,
            message: result.offer.directed
              ? "⚗️ Offer sent."
              : "⚗️ Offer posted to the Transmutation Circle.",
          },
          { status: result.replayed ? 200 : 201 },
        );
      }
      case "accept": {
        const result = await transmutationService.acceptOffer(userId, body.offerId);
        if (!result.ok) return refused(result);
        const { gave, received } = result.trade;
        return NextResponse.json({
          success: true,
          offer: result.offer,
          trade: result.trade,
          balances: result.balances,
          bonus: result.bonus,
          message: `⚗️ Transmuted: you gave ${gave.amount} ${gave.tokenType} and received ${received.amount} ${received.tokenType}.`,
        });
      }
      case "cancel":
      case "decline": {
        const result =
          body.action === "cancel"
            ? await transmutationService.cancelOffer(userId, body.offerId)
            : await transmutationService.declineOffer(userId, body.offerId);
        if (!result.ok) return refused(result);
        return NextResponse.json({ success: true, offer: result.offer });
      }
    }
  } catch (error) {
    _logger.error("[POST /api/economy/transmute]", error);
    return NextResponse.json(
      { success: false, reason: "failed", message: "The transmutation failed and nothing was exchanged. Try again." },
      { status: 500 },
    );
  }
}
