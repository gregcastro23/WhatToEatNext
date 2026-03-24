/**
 * User Search API Route
 * GET /api/users/search?q=email - Search registered users by email
 * Returns basic info only (id, name, email) for friend request UI.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { socialDatabase } from "@/services/socialDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json(
      { success: false, message: "Query must be at least 3 characters" },
      { status: 400 },
    );
  }

  const users = await socialDatabase.searchUsersByEmail(query, userId, 10);

  return NextResponse.json({ success: true, users });
}
