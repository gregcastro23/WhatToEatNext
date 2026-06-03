import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const result = await executeQuery<{
      id: string;
      name: string;
      cuisine: string | null;
      payload: any;
      notes: string | null;
    }>(
      `SELECT id, name, cuisine, payload, notes
       FROM user_custom_recipes
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const row = result.rows[0];
    
    const recipe = {
      id: row.id,
      name: row.name,
      cuisine: row.cuisine ?? undefined,
      notes: row.notes ?? undefined,
      ...(typeof row.payload === "object" && row.payload !== null ? row.payload : {}),
    };

    return NextResponse.json({ success: true, recipe });
  } catch (error) {
    console.error("[GET /api/recipes/custom]", error);
    return NextResponse.json({ error: "Failed to fetch custom recipe" }, { status: 500 });
  }
}
