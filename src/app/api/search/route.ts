/**
 * GET /api/search?q= — the omnibar's server search (plan Phase 2, issue #870).
 *
 * Anonymous and query-keyed only, so it is CDN-cacheable (D2): repeated
 * keystrokes and popular queries never reach the function. Failures and 429s
 * are no-store so they can't be cached. Recipe links come from the live catalog
 * (D1), so every one resolves on /recipes/[recipeId].
 */
import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";
import { searchOmnibar } from "@/lib/search/omnibar";
import { toOmnibarResponse } from "@/lib/search/serialize";
import { SearchQuerySchema } from "@/lib/validation/searchSchemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** 5 minutes: the recipe catalog's own refresh interval (LocalRecipeService). */
const CACHE_SECONDS = 300;
/** Serve stale for a day while revalidating; search results change slowly. */
const STALE_SECONDS = 86_400;
const NO_STORE = { "Cache-Control": "no-store" };

async function handleGet(request: Request): Promise<Response> {
  const limited = await rateLimit(request, { window: 60_000, max: 120, bucket: "omnibar-search" });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers: NO_STORE });
  }
  const parsed = SearchQuerySchema.safeParse({ q: new URL(request.url).searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid query", details: parsed.error.flatten().fieldErrors },
      { status: 400, headers: NO_STORE },
    );
  }
  try {
    const index = await getSearchIndex();
    const result = searchOmnibar(index, parsed.data.q, { now: new Date() });
    return NextResponse.json(toOmnibarResponse(result), {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}` },
    });
  } catch (error) {
    _logger.error("[api/search] search failed:", error);
    return NextResponse.json({ success: false, error: "Search unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export const GET = withObservability({ routeName: "/api/search" }, handleGet);
