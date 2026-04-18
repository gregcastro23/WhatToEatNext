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
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  let body: {
    name?: string;
    cuisine?: string;
    source?: string;
    sourceRecipeId?: string;
    payload?: unknown;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 },
    );
  }
  if (body.payload == null || typeof body.payload !== "object") {
    return NextResponse.json(
      { error: "payload must be an object" },
      { status: 400 },
    );
  }

  const cuisine =
    typeof body.cuisine === "string" && body.cuisine.trim()
      ? body.cuisine.trim().slice(0, 120)
      : null;
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim().slice(0, 60)
      : null;
  const sourceRecipeId =
    typeof body.sourceRecipeId === "string" && body.sourceRecipeId.trim()
      ? body.sourceRecipeId.trim().slice(0, 200)
      : null;
  const notes =
    typeof body.notes === "string" ? body.notes.slice(0, 2000) : null;

  try {
    const result = await executeQuery<CustomRecipeRow>(
      `INSERT INTO user_custom_recipes
         (user_id, name, cuisine, source, source_recipe_id, payload, notes)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       RETURNING id, name, cuisine, source, source_recipe_id, payload, notes,
                 created_at, updated_at`,
      [
        userId,
        name.slice(0, 200),
        cuisine,
        source,
        sourceRecipeId,
        JSON.stringify(body.payload),
        notes,
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
