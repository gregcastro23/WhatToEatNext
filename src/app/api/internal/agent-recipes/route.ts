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

import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

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

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  if (!INTERNAL_API_SECRET || authHeader !== `Bearer ${INTERNAL_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AgentRecipeBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;

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
    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      id: row.id,
      createdAt: new Date(row.created_at).getTime(),
    });
  } catch (error) {
    console.error("[POST /api/internal/agent-recipes]", error);
    return NextResponse.json(
      { error: "Failed to author recipe" },
      { status: 500 },
    );
  }
}
