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
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { UpdateFoodDiaryEntryInput } from "@/types/foodDiary";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UpdateEntryBodySchema = z.object({
  quantity: z.number().nonnegative().optional(),
  serving: z
    .object({
      amount: z.number().nonnegative(),
      unit: z.string().max(40),
    })
    .optional(),
  rating: z.number().min(1).max(5).optional(),
  moodTags: z.array(z.string().max(40)).max(50).optional(),
  notes: z.string().max(2000).optional(),
  wouldEatAgain: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string().max(40)).max(50).optional(),
  price: z.number().nonnegative().optional(),
  store: z.string().max(200).optional(),
  quality: z.string().max(200).optional(),
});

interface RouteParams {
  params: Promise<{ entryId: string }>;
}

/**
 * GET /api/food-diary/[entryId]
 * Get a specific food diary entry
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { entryId } = await params;

    const entry = await foodDiaryService.getEntry(entryId);

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 },
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
      { status: 500 },
    );
  }
}

/**
 * PUT /api/food-diary/[entryId]
 * Update a food diary entry (rating, notes, quantity, etc.)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "food-diary-write", identifier: userId });
    if (!rl.allowed) return rl.response!;

    const { entryId } = await params;
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const parsed = UpdateEntryBodySchema.safeParse(rawBody);
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

    const input: UpdateFoodDiaryEntryInput = {
      id: entryId,
      ...(parsed.data as Omit<UpdateFoodDiaryEntryInput, "id">),
    };

    const entry = await foodDiaryService.updateEntry(userId, input);

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found or not authorized" },
        { status: 404 },
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
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/food-diary/[entryId]
 * Delete a food diary entry
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "food-diary-write", identifier: userId });
    if (!rl.allowed) return rl.response!;

    const { entryId } = await params;

    const success = await foodDiaryService.deleteEntry(userId, entryId);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Entry not found or not authorized" },
        { status: 404 },
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
      { status: 500 },
    );
  }
}
