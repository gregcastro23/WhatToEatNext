import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import { rateLimit } from "@/lib/rateLimit";

const ASIN_REGEX = /^[A-Z0-9]{10}$/;
const MAX_INGREDIENT_NAME_LENGTH = 200;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit(request, {
      window: 60_000,
      max: 20,
      bucket: "amazon-feedback",
      identifier: session.user.id,
    });
    if (!rl.allowed) return rl.response!;

    const { ingredientName, asin } = (await request.json()) as {
      ingredientName?: unknown;
      asin?: unknown;
    };

    if (typeof ingredientName !== "string" || typeof asin !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid ingredientName/asin" },
        { status: 400 },
      );
    }

    const trimmedName = ingredientName.trim();
    const normalizedAsin = asin.trim().toUpperCase();

    if (!trimmedName || trimmedName.length > MAX_INGREDIENT_NAME_LENGTH) {
      return NextResponse.json({ error: "Invalid ingredient name" }, { status: 400 });
    }

    if (!ASIN_REGEX.test(normalizedAsin)) {
      return NextResponse.json(
        { error: "Invalid ASIN format — must be 10 uppercase alphanumeric characters." },
        { status: 400 },
      );
    }

    const result = await executeQuery(
      `UPDATE ingredients SET amazon_asin = $1, updated_at = NOW() WHERE name ILIKE $2 RETURNING id, name`,
      [normalizedAsin, trimmedName],
    );

    if (result.rows.length === 0) {
      console.warn(
        `[Feedback] Could not update ASIN for "${trimmedName}" - not found in ingredients table.`,
      );
      return NextResponse.json(
        { success: false, message: "Ingredient not found in database" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, updated: result.rows[0] });
  } catch (error) {
    console.error("Error processing ASIN feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
