import { NextResponse } from "next/server";
import { quizCatalogResponse } from "@/lib/quiz/serverCatalog";

export const runtime = "nodejs";
// Built from the static recipe catalog, which only changes on deploy.
export const dynamic = "force-static";

/** The homepage quiz's dish catalog: computed features for every meal-worthy recipe. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await quizCatalogResponse(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
