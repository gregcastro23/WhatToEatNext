/**
 * GET /api/ingredients/[name]/culinary — the full culinary card
 * (lib/ingredients/culinaryCard). Exact identities only (slug, key, name or
 * alias): a near match must not show another ingredient's card.
 */
import { NextResponse } from "next/server";
import { buildCulinaryCard } from "@/lib/ingredients/culinaryCard";
import { resolveCatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_SECONDS = 3600;
const STALE_SECONDS = 86_400;
const NO_STORE = { "Cache-Control": "no-store" };
const NAME_LIMIT = 100;

function decoded(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}

async function handleGet(request: Request, context: { params: Promise<{ name: string }> }): Promise<Response> {
  const limited = await rateLimit(request, { window: 60_000, max: 60, bucket: "culinary-card" });
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429, headers: NO_STORE });
  }
  const { name } = await context.params;
  const resolved = name.length <= NAME_LIMIT ? resolveCatalogIngredient(decoded(name)) : null;
  if (!resolved) {
    return NextResponse.json({ success: false, error: "No card for that ingredient" }, { status: 404, headers: NO_STORE });
  }
  try {
    const card = buildCulinaryCard(resolved.entry, await getSearchIndex());
    return NextResponse.json(
      { success: true, card },
      { headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}` } },
    );
  } catch (error) {
    _logger.error("[api/ingredients/culinary] failed:", error);
    return NextResponse.json({ success: false, error: "Card unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export const GET = withObservability({ routeName: "/api/ingredients/[name]/culinary", skipUserResolution: true }, handleGet);
