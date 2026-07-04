/**
 * POST /api/economy/practice — the invisible reward engine's single door.
 *
 * The client reports a natural action ({ type, targetId? }); the server
 * decides whether it's new (dedupe), whether it still pays today (cap), and
 * credits the coin. Responses are deliberately quiet: non-rewarding outcomes
 * are 200s with { rewarded: false } so the UI never surfaces an error for an
 * act that simply didn't pay — invisibility cuts both ways.
 *
 * GET /api/economy/practice — bootstrap payload for the client layer: which
 * surfaces this user has already discovered (so first-visit events aren't
 * re-fired every page load).
 *
 * Client-asserted events are the repo's accepted quest philosophy (tokens are
 * the throttle); exposure is bounded by per-act dedupe + daily caps
 * (~15 ESMS/day ceiling across all practices) + the rate limit here.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { SERVER_ONLY_PRACTICES, type PracticeType } from "@/lib/economy/practices";
import { rateLimit } from "@/lib/rateLimit";
import { practiceRewardService } from "@/services/practiceRewardService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
  const discovered = await practiceRewardService.discoveredSurfaces(user.id);
  return NextResponse.json({ success: true, discoveredSurfaces: discovered });
}

export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, {
    window: 60_000,
    max: 30,
    bucket: "economy-practice",
    identifier: user.id,
  });
  if (!rl.allowed) return rl.response!;

  let body: { type?: unknown; targetId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "";
  // Transition-gated practices (cooked-it, photos) are recognized by the
  // routes that observe the real data change — never by a bare client POST.
  if (SERVER_ONLY_PRACTICES.has(type as PracticeType)) {
    return NextResponse.json({ success: false, rewarded: false, reason: "invalid" }, { status: 400 });
  }
  const result = await practiceRewardService.recognize(user.id, type, body.targetId);

  if (result.reason === "invalid") {
    return NextResponse.json({ success: false, rewarded: false, reason: "invalid" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    rewarded: result.rewarded,
    reason: result.reason,
    tokenType: result.tokenType,
    amount: result.amount,
    hint: result.hint,
    balances: result.balances ?? undefined,
  });
}
