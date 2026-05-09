import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";

export async function POST(request: Request) {
  try {
    const session = await auth();
    // Allow users to submit feedback to improve mapping
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ingredientName, asin } = await request.json();

    if (!ingredientName || !asin) {
      return NextResponse.json({ error: "Missing ingredientName or asin" }, { status: 400 });
    }

    // Try to find the exact ingredient match
    const result = await executeQuery(
      `UPDATE ingredients SET amazon_asin = $1, updated_at = NOW() WHERE name ILIKE $2 RETURNING id, name`,
      [asin, ingredientName]
    );

    if (result.rows.length === 0) {
      // If exact match fails, maybe it's missing or named differently.
      // We could add it, but for now we'll just log it.
      console.warn(`[Feedback] Could not update ASIN for "${ingredientName}" - not found in ingredients table.`);
      return NextResponse.json({ success: false, message: "Ingredient not found in database" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: result.rows[0] });
  } catch (error) {
    console.error("Error processing ASIN feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
