/**
 * GET /api/search/pantry?i=eggplant&i=tahini&diet=vegan — recipes that use the
 * ingredients typed into the homepage recipe bar (lib/search/pantryMatches).
 * Free and anonymous; generating a new recipe is a separate, priced call.
 */
import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";
import { pantryMatches } from "@/lib/search/pantryMatches";
import { PantryQuerySchema } from "@/lib/validation/pantrySearchSchemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_SECONDS = 300;
const STALE_SECONDS = 86_400;
const NO_STORE = { "Cache-Control": "no-store" };

async function handleGet(request: Request): Promise<Response> {
  const limited = await rateLimit(request, { window: 60_000, max: 60, bucket: "pantry-search" });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers: NO_STORE });
  }
  const params = new URL(request.url).searchParams;
  const parsed = PantryQuerySchema.safeParse({ ingredients: params.getAll("i"), diet: params.get("diet") });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid query" }, { status: 400, headers: NO_STORE });
  }
  try {
    const body = pantryMatches(await getSearchIndex(), parsed.data);
    return NextResponse.json(body, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}` },
    });
  } catch (error) {
    _logger.error("[api/search/pantry] search failed:", error);
    return NextResponse.json({ success: false, error: "Search unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export const GET = withObservability({ routeName: "/api/search/pantry", skipUserResolution: true }, handleGet);
