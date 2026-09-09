import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { QuestClaimRewardRequestSchema } from "@/lib/validation/apiSchemas";
import { questService } from "@/services/QuestService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RATE_LIMIT = { window: 60_000, max: 30, bucket: "quests-claim" };

async function parseClaimBody(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return { ok: false as const, message: "Invalid request body" };
  }

  const parsed = QuestClaimRewardRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "questSlug is required",
      details: parsed.error.flatten().fieldErrors,
    };
  }

  return { ok: true as const, data: parsed.data };
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const parsed = await parseClaimBody(request);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.message,
        details: parsed.details,
      },
      { status: 400 }
    );
  }

  const { questSlug, periodStart } = parsed.data;

  try {
    const result = await questService.claimQuestReward(userId, questSlug, periodStart);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    _logger.error("[api/quests/claim] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
