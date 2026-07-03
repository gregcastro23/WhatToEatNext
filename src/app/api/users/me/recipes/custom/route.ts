/**
 * User Custom Recipes API
 * GET    /api/users/me/recipes/custom          → list of saved custom recipes
 * POST   /api/users/me/recipes/custom          → save a new custom recipe (full payload)
 * DELETE /api/users/me/recipes/custom?id=xxx   → remove a saved custom recipe
 *
 * Stores user-generated / riffed recipes with the full payload as JSONB so the
 * user keeps their versions even if a source catalog entry later disappears.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import { questService } from "@/services/QuestService";
import { recordInteraction } from "@/services/userInteractionsService";
import { buildRecipeLearningPayload } from "@/utils/recipes/learningPayload";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CustomRecipeBodySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(200),
  cuisine: z.string().trim().max(120).optional(),
  source: z.string().trim().max(60).optional(),
  sourceRecipeId: z.string().trim().max(200).optional(),
  payload: z.record(z.string(), z.unknown()),
  notes: z.string().max(2000).optional(),
  action: z.enum(["save", "like"]).optional(),
});

interface CustomRecipeRow {
  id: string;
  name: string;
  cuisine: string | null;
  source: string | null;
  source_recipe_id: string | null;
  payload: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomRecipeDTO {
  id: string;
  name: string;
  cuisine?: string;
  source?: string;
  sourceRecipeId?: string;
  payload: unknown;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

function rowToDTO(row: CustomRecipeRow): CustomRecipeDTO {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine ?? undefined,
    source: row.source ?? undefined,
    sourceRecipeId: row.source_recipe_id ?? undefined,
    payload: row.payload,
    notes: row.notes ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

async function recordRecipeSaveSignal(
  userId: string,
  row: CustomRecipeRow,
  action: "save" | "like",
): Promise<void> {
  const learningPayload = buildRecipeLearningPayload(row.payload, {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine ?? undefined,
    source: row.source ?? undefined,
    sourceRecipeId: row.source_recipe_id ?? undefined,
  });

  await recordInteraction({
    userId,
    type: "recipe_save",
    payload: { ...learningPayload },
    context: {
      action,
      source: row.source,
      sourceRecipeId: row.source_recipe_id,
      recipeBookEntryId: row.id,
    },
    weight: action === "like" ? 2.5 : 2,
  });
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ authenticated: false, recipes: [] });
  }

  try {
    const result = await executeQuery<CustomRecipeRow>(
      `SELECT id, name, cuisine, source, source_recipe_id, payload, notes,
              created_at, updated_at
       FROM user_custom_recipes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    return NextResponse.json({
      authenticated: true,
      recipes: result.rows.map(rowToDTO),
    });
  } catch (error) {
    console.error("[GET /api/users/me/recipes/custom]", error);
    return NextResponse.json(
      { error: "Failed to load custom recipes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CustomRecipeBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;

  try {
    let wasExisting = false;
    let row: CustomRecipeRow;

    if (body.sourceRecipeId) {
      const existing = await executeQuery<CustomRecipeRow>(
        `SELECT id, name, cuisine, source, source_recipe_id, payload, notes,
                created_at, updated_at
           FROM user_custom_recipes
          WHERE user_id = $1
            AND source_recipe_id = $2
            AND COALESCE(source, '') = COALESCE($3, '')
          ORDER BY created_at DESC
          LIMIT 1`,
        [userId, body.sourceRecipeId, body.source ?? null],
      );

      if (existing.rows[0]) {
        wasExisting = true;
        const updated = await executeQuery<CustomRecipeRow>(
          `UPDATE user_custom_recipes
              SET name = $3,
                  cuisine = $4,
                  payload = $5::jsonb,
                  notes = $6,
                  updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING id, name, cuisine, source, source_recipe_id, payload, notes,
                      created_at, updated_at`,
          [
            existing.rows[0].id,
            userId,
            body.name,
            body.cuisine ?? null,
            JSON.stringify(body.payload),
            body.notes ?? existing.rows[0].notes,
          ],
        );
        row = updated.rows[0];
      } else {
        const inserted = await executeQuery<CustomRecipeRow>(
          `INSERT INTO user_custom_recipes
             (user_id, name, cuisine, source, source_recipe_id, payload, notes)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
           RETURNING id, name, cuisine, source, source_recipe_id, payload, notes,
                     created_at, updated_at`,
          [
            userId,
            body.name,
            body.cuisine ?? null,
            body.source ?? null,
            body.sourceRecipeId,
            JSON.stringify(body.payload),
            body.notes ?? null,
          ],
        );
        row = inserted.rows[0];
      }
    } else {
      const inserted = await executeQuery<CustomRecipeRow>(
        `INSERT INTO user_custom_recipes
           (user_id, name, cuisine, source, source_recipe_id, payload, notes)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
         RETURNING id, name, cuisine, source, source_recipe_id, payload, notes,
                   created_at, updated_at`,
        [
          userId,
          body.name,
          body.cuisine ?? null,
          body.source ?? null,
          null,
          JSON.stringify(body.payload),
          body.notes ?? null,
        ],
      );
      row = inserted.rows[0];
    }

    try {
      await recordRecipeSaveSignal(userId, row, body.action ?? "save");
    } catch (learningErr) {
      console.error(
        "[POST /api/users/me/recipes/custom] learning signal failed",
        learningErr,
      );
    }

    // Best-effort: reward building the Lab Book. reportEvent increments every
    // quest listening on "ingest_recipe" (the tiered "add N recipes"
    // achievements + the weekly) and returns any that just completed.
    let completedQuests: Array<{
      questSlug: string;
      tokensAwarded: number;
      tokenType: string;
    }> = [];
    if (!wasExisting) {
      try {
        completedQuests = await questService.reportEvent(userId, "ingest_recipe");
      } catch (questErr) {
        console.error(
          "[POST /api/users/me/recipes/custom] quest report failed",
          questErr,
        );
      }
    }

    return NextResponse.json({
      authenticated: true,
      recipe: rowToDTO(row),
      wasExisting,
      completedQuests,
    });
  } catch (error) {
    console.error("[POST /api/users/me/recipes/custom]", error);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "id query param required" },
      { status: 400 },
    );
  }
  try {
    await executeQuery(
      `DELETE FROM user_custom_recipes WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return NextResponse.json({ authenticated: true, removed: id });
  } catch (error) {
    console.error("[DELETE /api/users/me/recipes/custom]", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 },
    );
  }
}
