/**
 * GET/POST /api/tables/[tableId]/comments
 * Any table member (any RSVP status) may read and post. Body <= 1000 chars.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

const commentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

const COMMENT_LIMIT = { window: 60_000, max: 20, bucket: "tables-comments" } as const;

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const isMember = await tableDatabase.isAnyMember(tableId, userId);
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: "Not authorized to view this table's comments" },
        { status: 403 },
      );
    }

    const comments = await tableDatabase.listComments(tableId);
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("List table comments error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { ...COMMENT_LIMIT, identifier: userId });
    if (!rl.allowed) return rl.response!;

    const isMember = await tableDatabase.isAnyMember(tableId, userId);
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: "Only table members can comment" },
        { status: 403 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = commentSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "body is required (max 1000 characters)" },
        { status: 400 },
      );
    }

    const comment = await tableDatabase.addComment(tableId, userId, parsed.data.body);
    if (!comment) {
      return NextResponse.json(
        { success: false, message: "Failed to post comment" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("Add table comment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
