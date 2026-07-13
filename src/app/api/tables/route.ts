/**
 * Tables API Route
 * POST /api/tables - Create a table (host + host member row in one transaction)
 * GET  /api/tables?scope=upcoming|past|hosting|all - List the caller's tables
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { resolveVenueCoords } from "@/lib/tables/venueGeo";
import { tableDatabase, type TableListScope } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

const createTableSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(160),
  description: z.string().trim().max(2000).optional(),
  scheduledAt: z.string().min(1, "scheduledAt is required"),
  venue: venueSchema,
  visibility: z.enum(["public", "commensals", "private"]).optional(),
  menu: z.array(menuItemSchema).max(50).optional(),
  // Discovery geo (PR 6). Home venues MUST NOT carry coordinates.
  venueLat: z.number().min(-90).max(90).optional(),
  venueLng: z.number().min(-180).max(180).optional(),
  seatCap: z.number().int().min(2).max(24).optional(),
});

const CREATE_LIMIT = { window: 60_000, max: 10, bucket: "tables-create" } as const;

const SCOPES: TableListScope[] = ["upcoming", "past", "hosting", "all"];

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { ...CREATE_LIMIT, identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = createTableSchema.safeParse(rawBody);
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

    const scheduledDate = new Date(parsed.data.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "scheduledAt must be a valid date" },
        { status: 400 },
      );
    }

    const coords = await resolveVenueCoords(
      parsed.data.venue,
      parsed.data.venueLat,
      parsed.data.venueLng,
    );
    if (!coords) {
      return NextResponse.json(
        { success: false, message: "Home tables cannot carry a location" },
        { status: 400 },
      );
    }

    const table = await tableDatabase.createTable(userId, {
      title: parsed.data.title,
      description: parsed.data.description,
      scheduledAt: scheduledDate.toISOString(),
      venue: parsed.data.venue,
      visibility: parsed.data.visibility,
      menu: parsed.data.menu,
      venueLat: coords.venueLat,
      venueLng: coords.venueLng,
      seatCap: parsed.data.seatCap,
    });

    if (!table) {
      return NextResponse.json(
        { success: false, message: "Failed to create table" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error) {
    console.error("Create table error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const scopeParam = request.nextUrl.searchParams.get("scope");
    const scope: TableListScope = SCOPES.includes(scopeParam as TableListScope)
      ? (scopeParam as TableListScope)
      : "all";

    const tables = await tableDatabase.listTablesForUser(userId, scope);
    return NextResponse.json({ success: true, tables });
  } catch (error) {
    console.error("List tables error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
