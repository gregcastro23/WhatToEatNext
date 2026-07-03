import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  computeTasteGraph,
  fetchUserInteractions,
  recordInteraction,
  type InteractionType,
} from "@/services/userInteractionsService";

const VALID_TYPES: InteractionType[] = [
  "recipe_view",
  "recipe_save",
  "recipe_cook",
  "ingredient_select",
  "cooking_method",
  "planetary_query",
  "food_diary_entry",
  "food_rating",
];

/**
 * GET /api/user/taste-graph
 *
 * Returns the signed-in user's persisted interaction history so the client
 * learning store can hydrate durably (cross-device, surviving reload). The
 * user is always the authenticated session user — the client never passes an
 * id, so one user can't read another's graph.
 */
export async function GET() {
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
    console.error("[GET /api/user/taste-graph] failed:", error);
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
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const type = body?.type as InteractionType;
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid interaction type" },
        { status: 400 },
      );
    }

    await recordInteraction({
      userId: session.user.id,
      type,
      payload:
        body.payload && typeof body.payload === "object"
          ? (body.payload as Record<string, unknown>)
          : {},
      context:
        body.context && typeof body.context === "object"
          ? (body.context as Record<string, unknown>)
          : {},
      weight: typeof body.weight === "number" ? body.weight : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/user/taste-graph] failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
