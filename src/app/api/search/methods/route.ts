/**
 * GET /api/search/methods?q= — the homepage cooking-method search
 * ("baking bacon"): a cited food guide, or an honest general answer
 * (lib/cooking/methodSearch). Anonymous and query-keyed, so CDN-cacheable.
 */
import { NextResponse } from "next/server";
import { getFoodGuides } from "@/lib/cooking/foodGuides/registry";
import { answerMethodQuery } from "@/lib/cooking/methodSearch/answer";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";
import type { MethodSearchResponse } from "@/lib/validation/methodSearchSchemas";
import { SearchQuerySchema } from "@/lib/validation/searchSchemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_SECONDS = 300;
const STALE_SECONDS = 86_400;
const NO_STORE = { "Cache-Control": "no-store" };

async function handleGet(request: Request): Promise<Response> {
  const limited = await rateLimit(request, { window: 60_000, max: 60, bucket: "method-search" });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers: NO_STORE });
  }
  const parsed = SearchQuerySchema.safeParse({ q: new URL(request.url).searchParams.get("q") ?? "" });
  if (!parsed.success || parsed.data.q === "") {
    return NextResponse.json({ success: false, error: "Invalid query" }, { status: 400, headers: NO_STORE });
  }
  try {
    const context = { guides: getFoodGuides(), index: await getSearchIndex() };
    const body: MethodSearchResponse = { success: true, query: parsed.data.q, answer: answerMethodQuery(context, parsed.data.q) };
    return NextResponse.json(body, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}` },
    });
  } catch (error) {
    _logger.error("[api/search/methods] search failed:", error);
    return NextResponse.json({ success: false, error: "Search unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export const GET = withObservability({ routeName: "/api/search/methods", skipUserResolution: true }, handleGet);
