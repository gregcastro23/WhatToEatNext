import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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
      const template = templates.find((t) => t.id === templateId) || null;
      return NextResponse.json({ success: true, template });
    }

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Menu template GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load menu templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const weekStartDate = new Date(body?.weekStartDate);
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Template name is required" },
        { status: 400 },
      );
    }

    if (Number.isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid weekStartDate" },
        { status: 400 },
      );
    }

    const template = await menuPersistenceService.saveTemplate(userId, {
      name: body.name.trim(),
      menu: {
        weekStartDate,
        meals: Array.isArray(body.meals) ? body.meals : [],
        nutritionalTotals: body.nutritionalTotals || {},
        groceryList: Array.isArray(body.groceryList) ? body.groceryList : [],
        inventory: Array.isArray(body.inventory) ? body.inventory : [],
        weeklyBudget:
          typeof body.weeklyBudget === "number" || body.weeklyBudget === null
            ? body.weeklyBudget
            : null,
      },
    });

    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    console.error("Menu template POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save menu template" },
      { status: 500 },
    );
  }
}
