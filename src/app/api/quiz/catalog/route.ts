import { NextResponse } from "next/server";
import { quizCatalogResponse } from "@/lib/quiz/serverCatalog";

export const runtime = "nodejs";
// Built from the static recipe catalog minus the recipes the operator
// unpublished, which can change between deploys: regenerated on the same
// window as the CDN's s-maxage below, not frozen at build time.
export const dynamic = "force-static";
export const revalidate = 86400;

/** The homepage quiz's dish catalog: computed features for every meal-worthy recipe. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await quizCatalogResponse(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
