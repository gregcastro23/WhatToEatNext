/**
 * POST /api/tables/[tableId]/photos
 * Joined members only, live or memory tables (memories accrete after close).
 * Cap: 12 photos/table. Stores via storeTablePhoto (R2), same 5MB/mime rules
 * as cook-photos.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { storeTablePhoto } from "@/lib/feed/cookPhotoStorage";
import { rateLimit } from "@/lib/rateLimit";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

const photoSchema = z.object({
  photoDataUrl: z.string().min(1),
});

const PHOTO_LIMIT = { window: 60_000, max: 12, bucket: "tables-photos" } as const;

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

    const rl = await rateLimit(request, { ...PHOTO_LIMIT, identifier: userId });
    if (!rl.allowed) return rl.response!;

    const info = await tableDatabase.getTableHostAndStatus(tableId);
    if (!info) {
      return NextResponse.json({ success: false, message: "Table not found" }, { status: 404 });
    }
    if (info.status !== "live" && info.status !== "memory") {
      return NextResponse.json(
        { success: false, message: "Photos can only be added while the table is live or afterward" },
        { status: 409 },
      );
    }

    const isJoined = await tableDatabase.isJoinedMember(tableId, userId);
    if (!isJoined) {
      return NextResponse.json(
        { success: false, message: "Only joined members can add photos" },
        { status: 403 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = photoSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "photoDataUrl is required" }, { status: 400 });
    }

    const url = await storeTablePhoto(tableId, parsed.data.photoDataUrl);
    if (!url) {
      return NextResponse.json(
        { success: false, message: "Could not process that photo" },
        { status: 400 },
      );
    }

    const photo = await tableDatabase.addPhoto(tableId, userId, url);
    if (!photo) {
      return NextResponse.json(
        { success: false, message: "This table has reached its 12-photo limit" },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true, photo }, { status: 201 });
  } catch (error) {
    console.error("Add table photo error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
