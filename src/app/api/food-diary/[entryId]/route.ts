/**
 * Food Diary Entry API Route
 * GET /api/food-diary/[entryId] - Get specific entry
 * PUT /api/food-diary/[entryId] - Update entry
 * DELETE /api/food-diary/[entryId] - Delete entry
 *
 * @file src/app/api/food-diary/[entryId]/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { UpdateFoodDiaryEntryInput } from "@/types/foodDiary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: {
    entryId: string;
  };
}

/**
 * GET /api/food-diary/[entryId]
 * Get a specific food diary entry
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { entryId } = params;

    const entry = await foodDiaryService.getEntry(entryId);

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Get food diary entry error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get entry" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/food-diary/[entryId]
 * Update a food diary entry (rating, notes, quantity, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { entryId } = params;
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const input: UpdateFoodDiaryEntryInput = {
      id: entryId,
      ...updateData,
    };

    const entry = await foodDiaryService.updateEntry(userId, input);

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Update food diary entry error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update entry" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/food-diary/[entryId]
 * Delete a food diary entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { entryId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    const success = await foodDiaryService.deleteEntry(userId, entryId);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Entry not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Entry deleted",
    });
  } catch (error) {
    console.error("Delete food diary entry error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
