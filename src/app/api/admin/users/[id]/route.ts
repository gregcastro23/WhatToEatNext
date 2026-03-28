/**
 * Admin Individual User Management
 * PATCH /api/admin/users/[id] - Update user role or subscription tier
 * DELETE /api/admin/users/[id] - Deactivate user
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import { subscriptionService } from "@/services/subscriptionService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/admin/users/[id]
 * Allows admins to update a user's tier or deactivation status.
 *
 * Body: { tier?: "free" | "premium", isActive?: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { tier, isActive } = body as {
      tier?: "free" | "premium";
      isActive?: boolean;
    };

    const user = await userDatabase.getUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Update subscription tier
    if (tier === "free" || tier === "premium") {
      const now = new Date();
      const periodEnd = new Date(now);
      if (tier === "premium") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 10);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      await subscriptionService.getOrCreateSubscription(id);
      await subscriptionService.updateSubscription(id, {
        tier,
        status: "active",
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
      });
    }

    // Deactivate / reactivate
    if (typeof isActive === "boolean" && !isActive) {
      await userDatabase.deactivateUser(id);
    }

    return NextResponse.json({
      success: true,
      message: "User updated",
      userId: id,
      ...(tier ? { tier } : {}),
    });
  } catch (error) {
    console.error("[admin/users/[id]] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Soft-deletes (deactivates) a user.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const success = await userDatabase.deactivateUser(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "User deactivated" });
  } catch (error) {
    console.error("[admin/users/[id]] DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to deactivate user" },
      { status: 500 },
    );
  }
}
