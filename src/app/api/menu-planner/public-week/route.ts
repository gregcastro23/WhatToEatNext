/**
 * Public weekly-menu read for AGENT profiles.
 *
 * Planetary Agents (@agentic.alchm.kitchen users) author weekly menus that are
 * published to the shared feed — public content. This read-only endpoint
 * surfaces an agent's current-week menu so it can appear as a living fixture on
 * the agent's alchm.kitchen profile page.
 *
 * Safety: resolves an EXISTING user by id (never creates one — unlike the
 * internal ensureAgent bridge) and serves ONLY agent-domain users. A
 * non-agent's plan is private and returns 403. No secrets or auth required —
 * this is public agent content, and only meals/servings/planetary data are
 * returned (never budgets, grocery lists, or owner identity beyond display
 * name).
 */

import { NextResponse } from "next/server";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import { userDatabase } from "@/services/userDatabaseService";
import { getWeekStartDate } from "@/types/menuPlanner";
import type { MealSlot } from "@/types/menuPlanner";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

/** Strip a persisted MealSlot down to the public, display-only fields. */
function toPublicMeal(meal: MealSlot) {
  return {
    dayOfWeek: meal.dayOfWeek,
    mealType: meal.mealType,
    servings: meal.servings,
    isLocked: meal.isLocked ?? false,
    recipe: meal.recipe
      ? {
          id: (meal.recipe as any).id,
          name: (meal.recipe as any).name,
          elementalProperties: (meal.recipe as any).elementalProperties ?? null,
        }
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId is required" },
      { status: 400 },
    );
  }

  const weekParam = searchParams.get("weekStartDate");
  const weekStartDate = weekParam
    ? new Date(weekParam)
    : getWeekStartDate(new Date());
  if (Number.isNaN(weekStartDate.getTime())) {
    return NextResponse.json(
      { success: false, message: "Invalid weekStartDate" },
      { status: 400 },
    );
  }

  try {
    const user = await userDatabase.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Only PLANETARY AGENTS' weekly menus are public, identified STRICTLY by the
    // @agentic.alchm.kitchen domain — the same rule the internal authoring
    // bridge enforces (normalizeAgentEmail), so only menus written by that
    // bridge can ever be served here.
    //
    // Deliberately NOT using the users.is_agent flag: it is far broader
    // (~4.7k rows, incl. accounts with non-agentic emails), and every weekly_menu
    // that exists today is owned by an is_agent=false human. Trusting that flag
    // would publicly expose a real person's meal plan the moment such an account
    // planned a week.
    const isPublishingAgent = (user.email ?? "")
      .toLowerCase()
      .endsWith(AGENTIC_EMAIL_DOMAIN);
    if (!isPublishingAgent) {
      return NextResponse.json(
        { success: false, message: "This user's plan is private" },
        { status: 403 },
      );
    }

    const menu = await menuPersistenceService.getMenu(user.id, weekStartDate);
    return NextResponse.json({
      success: true,
      userId: user.id,
      // NB: the display name lives on the nested profile, not top-level.
      displayName: user.profile?.name ?? null,
      weekStartDate: weekStartDate.toISOString(),
      updatedAt: menu?.updatedAt ?? null,
      meals: (menu?.meals ?? []).map(toPublicMeal),
    });
  } catch (error) {
    console.error("[public-week GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load agent week" },
      { status: 500 },
    );
  }
}
