import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { UserProfileLayoutRequestSchema } from "@/lib/validation/apiSchemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false }, { status: 401 });

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UserProfileLayoutRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "layout array is required",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { layout } = parsed.data;

    await executeQuery(
      `UPDATE user_profiles SET profile_layout = $1::jsonb WHERE user_id = $2`,
      [JSON.stringify(layout), user.id]
    );

    return NextResponse.json({ success: true, layout });
  } catch (error) {
    _logger.error("Failed to update profile layout", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
