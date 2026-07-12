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
import { resolveVenueCoords } from "@/lib/tables/venueGeo";
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
  // Discovery geo (PR 6). Home venues MUST NOT carry coordinates.
  venueLat: z.number().min(-90).max(90).optional(),
  venueLng: z.number().min(-180).max(180).optional(),
  seatCap: z.number().int().min(2).max(24).optional(),
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
    // PR 6 detail-access amendment: an authed viewer may see CARD-LEVEL detail
    // of a public planned/live table so /tables/[id] can render its Ask-to-join
    // CTA — but never the full member list, and never the street address.
    const publicJoinable =
      !!userId &&
      detail.visibility === "public" &&
      (detail.status === "planned" || detail.status === "live");

    if (!isMember && !publicMemory && !publicJoinable) {
      return NextResponse.json(
        { success: false, message: "Not authorized to view this table" },
        { status: 403 },
      );
    }

    // Non-members (incl. anonymous viewers of a public memory) never see the
    // host's street address — parity with the invite preview and the frozen
    // memory artifact, both of which carry only venue {type, name}.
    let table: typeof detail =
      !isMember && detail.venue?.address
        ? { ...detail, venue: { ...detail.venue, address: undefined } }
        : detail;

    // Card-level only for a non-member viewer of a public PLANNED/LIVE table:
    // reduce members to the host row (identity for the card) and drop invites.
    // joinedCount surfaces the headcount without exposing the roster. The
    // existing public-memory path is untouched (it renders the frozen artifact).
    const joinedCount = detail.members.filter((m) => m.rsvpStatus === "joined").length;
    if (!isMember && publicJoinable) {
      const hostRow = table.members.filter((m) => m.role === "host");
      table = { ...table, members: hostRow, invites: undefined };
    }

    // viewerId: the caller's resolved DB id — clients must not derive this
    // from the session (OAuth-sub vs DB-UUID mismatches, see
    // getUserIdFromRequest); host/self checks key off this value.
    return NextResponse.json({ success: true, table, joinedCount, viewerId: userId });
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

    const { menu, venueLat, venueLng, ...corePatch } = parsed.data;
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

    // Coords are only re-resolved when the venue itself is being changed;
    // home venues never carry coordinates (privacy invariant).
    let resolvedLat: number | null | undefined;
    let resolvedLng: number | null | undefined;
    if (corePatch.venue !== undefined) {
      const coords = await resolveVenueCoords(corePatch.venue, venueLat, venueLng);
      if (!coords) {
        return NextResponse.json(
          { success: false, message: "Home tables cannot carry a location" },
          { status: 400 },
        );
      }
      resolvedLat = coords.venueLat;
      resolvedLng = coords.venueLng;
    }

    const hasCorePatch =
      Object.values(corePatch).some((v) => v !== undefined);
    let table: TableRecord | null = null;

    if (hasCorePatch) {
      table = await tableDatabase.updateTableCore(tableId, userId, {
        ...corePatch,
        scheduledAt: scheduledAtIso,
        venueLat: resolvedLat,
        venueLng: resolvedLng,
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
