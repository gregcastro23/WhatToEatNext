import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { _logger } from "@/lib/logger";
import { UserTasteGraphRecordRequestSchema } from "@/lib/validation/apiSchemas";
import {
  computeTasteGraph,
  fetchUserInteractions,
  recordInteraction,
} from "@/services/userInteractionsService";

/**
 * GET /api/user/taste-graph
 *
 * Returns the signed-in user's persisted interaction history so the client
 * learning store can hydrate durably (cross-device, surviving reload). The
 * user is always the authenticated session user — the client never passes an
 * id, so one user can't read another's graph.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [interactions, tasteGraph] = await Promise.all([
      fetchUserInteractions(session.user.id),
      computeTasteGraph(session.user.id),
    ]);
    return NextResponse.json({ interactions, tasteGraph });
  } catch (error) {
    _logger.error("[GET /api/user/taste-graph] failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/user/taste-graph
 *
 * Persists a single interaction event for the signed-in user, backing the
 * client learning store's writes (learnFromRecipe / trackInteraction) with the
 * canonical `user_interactions` event log.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UserTasteGraphRecordRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid interaction type" },
        { status: 400 },
      );
    }

    const { type, payload, context, weight } = parsed.data;

    await recordInteraction({
      userId: session.user.id,
      type,
      payload: payload ?? {},
      context: context ?? {},
      ...(weight !== undefined ? { weight } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    _logger.error("[POST /api/user/taste-graph] failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
