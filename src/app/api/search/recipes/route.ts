/**
 * GET /api/search/recipes?q= — the homepage cuisine search: dishes with every
 * version and the closest dishes from other cuisines (lib/search/recipeGroups).
 *
 * Anonymous and query-keyed, so it is CDN-cacheable like /api/search.
 * Failures and 429s are no-store.
 */
import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";
import { searchRecipeGroups } from "@/lib/search/recipeGroups";
import { getRecipeVariants } from "@/lib/search/recipeVariants";
import { SearchQuerySchema } from "@/lib/validation/searchSchemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_SECONDS = 300;
const STALE_SECONDS = 86_400;
const NO_STORE = { "Cache-Control": "no-store" };

async function handleGet(request: Request): Promise<Response> {
  const limited = await rateLimit(request, { window: 60_000, max: 60, bucket: "recipe-search" });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers: NO_STORE });
  }
  const parsed = SearchQuerySchema.safeParse({ q: new URL(request.url).searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid query" }, { status: 400, headers: NO_STORE });
  }
  try {
    const [index, variants] = await Promise.all([getSearchIndex(), getRecipeVariants()]);
    const body = searchRecipeGroups(index, parsed.data.q, { now: new Date(), variants });
    return NextResponse.json(body, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}` },
    });
  } catch (error) {
    _logger.error("[api/search/recipes] search failed:", error);
    return NextResponse.json({ success: false, error: "Search unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export const GET = withObservability({ routeName: "/api/search/recipes", skipUserResolution: true }, handleGet);
