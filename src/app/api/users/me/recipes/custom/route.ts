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
    const result = await executeQuery<CustomRecipeRow>(
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
        body.sourceRecipeId ?? null,
        JSON.stringify(body.payload),
        body.notes ?? null,
      ],
    );
    return NextResponse.json({
      authenticated: true,
      recipe: rowToDTO(result.rows[0]),
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
