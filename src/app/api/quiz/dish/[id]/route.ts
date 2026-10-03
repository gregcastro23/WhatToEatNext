import { NextResponse } from "next/server";
import { z } from "zod";
import { quizDishRecipe } from "@/lib/quiz/serverCatalog";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const idSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/);

/** The full static recipe behind one quiz dish, for the cart and queue actions. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const limited = await rateLimit(request, { window: 60_000, max: 120, bucket: "quiz-dish" });
  if (!limited.allowed) {
    return (
      limited.response ??
      NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 })
    );
  }
  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid dish id" }, { status: 400 });
  }
  const recipe = await quizDishRecipe(parsed.data);
  if (!recipe) {
    return NextResponse.json({ success: false, error: "Dish not found" }, { status: 404 });
  }
  return NextResponse.json(
    { success: true, recipe },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
