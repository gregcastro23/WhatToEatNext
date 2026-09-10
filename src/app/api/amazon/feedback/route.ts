import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { AmazonFeedbackRequestSchema } from "@/lib/validation/apiSchemas";

const ASIN_REGEX = /^[A-Z0-9]{10}$/;
const MAX_INGREDIENT_NAME_LENGTH = 200;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimit(request, {
      window: 60_000,
      max: 20,
      bucket: "amazon-feedback",
      identifier: session.user.id,
    });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = AmazonFeedbackRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Missing or invalid ingredientName/asin" },
        { status: 400 },
      );
    }

    const trimmedName = parseResult.data.ingredientName;
    const normalizedAsin = parseResult.data.asin;

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
    _logger.error("Error processing ASIN feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
