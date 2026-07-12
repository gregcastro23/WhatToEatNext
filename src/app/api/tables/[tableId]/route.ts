/**
 * Table Detail API Route
 * GET   /api/tables/[tableId] - Full detail (any-status member, or anyone
 *       when the table is memory + public). Invites are only attached for
 *       the host (see tableDatabaseService.getTableDetail).
 * PATCH /api/tables/[tableId] - Host-only edit. Core fields (title,
 *       description, scheduledAt, venue, visibility) require status='planned';
 *       menu is editable in planned or live.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { TableRecord } from "@/types/table";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

const venueSchema = z.object({
  type: z.enum(["home", "restaurant", "other"]),
  restaurantId: z.string().trim().min(1).max(200).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  address: z.string().trim().min(1).max(500).optional(),
});

const menuItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  recipeRef: z.string().trim().min(1).max(200).optional(),
  course: z.string().trim().min(1).max(60).optional(),
});

const patchSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  scheduledAt: z.string().min(1).optional(),
  venue: venueSchema.optional(),
  visibility: z.enum(["public", "commensals", "private"]).optional(),
  menu: z.array(menuItemSchema).max(50).optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId } = await params;
    const userId = await getUserIdFromRequest(request);

    const detail = await tableDatabase.getTableDetail(tableId, userId);
    if (!detail) {
      return NextResponse.json({ success: false, message: "Table not found" }, { status: 404 });
    }

    const isMember =
      (!!userId && detail.hostId === userId) ||
      detail.members.some((m) => !!userId && m.userId === userId);
    const publicMemory = detail.status === "memory" && detail.visibility === "public";

    if (!isMember && !publicMemory) {
      return NextResponse.json(
        { success: false, message: "Not authorized to view this table" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, table: detail });
  } catch (error) {
    console.error("Get table detail error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const info = await tableDatabase.getTableHostAndStatus(tableId);
    if (!info) {
      return NextResponse.json({ success: false, message: "Table not found" }, { status: 404 });
    }
    if (info.hostId !== userId) {
      return NextResponse.json(
        { success: false, message: "Only the host can edit this table" },
        { status: 403 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { menu, ...corePatch } = parsed.data;
    let scheduledAtIso: string | undefined;
    if (corePatch.scheduledAt !== undefined) {
      const parsedDate = new Date(corePatch.scheduledAt);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "scheduledAt must be a valid date" },
          { status: 400 },
        );
      }
      scheduledAtIso = parsedDate.toISOString();
    }

    const hasCorePatch = Object.values(corePatch).some((v) => v !== undefined);
    let table: TableRecord | null = null;

    if (hasCorePatch) {
      table = await tableDatabase.updateTableCore(tableId, userId, {
        ...corePatch,
        scheduledAt: scheduledAtIso,
      });
      if (!table) {
        return NextResponse.json(
          { success: false, message: "Core fields can only be edited while the table is planned" },
          { status: 409 },
        );
      }
    }

    if (menu !== undefined) {
      table = await tableDatabase.updateTableMenu(tableId, userId, menu);
      if (!table) {
        return NextResponse.json(
          { success: false, message: "The menu can only be edited while the table is planned or live" },
          { status: 409 },
        );
      }
    }

    if (!table) {
      return NextResponse.json(
        { success: false, message: "No editable fields were provided" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error("Update table error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
