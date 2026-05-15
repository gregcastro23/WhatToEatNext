import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false }, { status: 401 });

    const body = await request.json();
    
    await executeQuery(
      `UPDATE user_profiles SET dietary_preferences = $1::jsonb WHERE user_id = $2`,
      [JSON.stringify(body.preferences), user.id]
    );

    return NextResponse.json({ success: true, preferences: body.preferences });
  } catch (error) {
    _logger.error("Failed to update dietary preferences", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
