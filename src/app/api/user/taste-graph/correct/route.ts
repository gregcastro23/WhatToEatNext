import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { _logger } from "@/lib/logger";
import { UserTasteCorrectionsSchema } from "@/lib/validation/apiSchemas";
import { updateTasteCorrections } from "@/services/userInteractionsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UserTasteCorrectionsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid taste corrections" },
        { status: 400 },
      );
    }

    const { cuisines, ingredients, methods, planets } = parsed.data;
    const updated = await updateTasteCorrections(session.user.id, {
      ...(cuisines !== undefined ? { cuisines } : {}),
      ...(ingredients !== undefined ? { ingredients } : {}),
      ...(methods !== undefined ? { methods } : {}),
      ...(planets !== undefined ? { planets } : {}),
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    _logger.error("Taste correction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
