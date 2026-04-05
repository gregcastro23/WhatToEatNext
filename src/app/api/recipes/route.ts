/**
 * GET/POST /api/recipes
 * Returns recipe catalog with optional filtering by element, cuisine, or search query.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const element = url.searchParams.get("element");
    const cuisine = url.searchParams.get("cuisine");
    const search = url.searchParams.get("q") || url.searchParams.get("search");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    // Use the database service to fetch recipes if available
    try {
      const { executeQuery } = await import("@/lib/database/connection");
      let query = "SELECT * FROM recipes WHERE 1=1";
      const params: any[] = [];
      let paramIdx = 1;

      if (element) {
        query += ` AND (elemental_properties->>'dominant_element' ILIKE $${paramIdx})`;
        params.push(`%${element}%`);
        paramIdx++;
      }
      if (cuisine) {
        query += ` AND cuisine_type ILIKE $${paramIdx}`;
        params.push(`%${cuisine}%`);
        paramIdx++;
      }
      if (search) {
        query += ` AND (name ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
      params.push(limit, offset);

      const result = await executeQuery(query, params);
      return NextResponse.json({
        success: true,
        recipes: result.rows,
        total: result.rowCount ?? result.rows.length,
        limit,
        offset,
      });
    } catch (dbError) {
      // DB unavailable — return empty set gracefully
      console.warn("[recipes] DB unavailable:", dbError);
      return NextResponse.json({
        success: true,
        recipes: [],
        total: 0,
        limit,
        offset,
        note: "Recipe database temporarily unavailable",
      });
    }
  } catch (error) {
    console.error("[recipes] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Allow POST with body params as an alternative to GET query params
  try {
    const body = await request.json().catch(() => ({}));
    const { element, cuisine, search, limit = 20, offset = 0 } = body;
    const params = new URLSearchParams();
    if (element) params.set("element", element);
    if (cuisine) params.set("cuisine", cuisine);
    if (search) params.set("q", search);
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    const syntheticReq = new Request(`${new URL(request.url).origin}/api/recipes?${params}`);
    return GET(syntheticReq);
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
