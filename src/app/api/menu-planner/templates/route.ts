import { NextResponse, type NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { menuTemplateSaveBodySchema } from "@/lib/menu-planner/schemas";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import type {
  DayOfWeek,
  DailyNutritionTotals,
} from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";

const logger = createLogger("api:menu-planner:templates");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const templates = await menuPersistenceService.getTemplates(userId);
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");

    if (templateId) {
      const template = templates.find((t) => t.id === templateId) ?? null;
      return NextResponse.json({ success: true, template });
    }

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    logger.error("Menu template GET error", { error });
    return NextResponse.json(
      { success: false, message: "Failed to load menu templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const parsed = menuTemplateSaveBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      const nameIssue = parsed.error.issues.find((i) => i.path[0] === "name");
      if (nameIssue) {
        return NextResponse.json(
          { success: false, message: "Template name is required" },
          { status: 400 },
        );
      }
      const dateIssue = parsed.error.issues.find((i) => i.path[0] === "weekStartDate");
      if (dateIssue) {
        return NextResponse.json(
          { success: false, message: "Invalid weekStartDate" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      name,
      weekStartDate,
      meals,
      nutritionalTotals,
      groceryList,
      inventory,
      weeklyBudget,
    } = parsed.data;

    const template = await menuPersistenceService.saveTemplate(userId, {
      name,
      menu: {
        weekStartDate,
        meals,
        nutritionalTotals: nutritionalTotals as Record<
          DayOfWeek,
          DailyNutritionTotals
        >,
        groceryList,
        inventory,
        weeklyBudget,
      },
    });

    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    logger.error("Menu template POST error", { error });
    return NextResponse.json(
      { success: false, message: "Failed to save menu template" },
      { status: 500 },
    );
  }
}

