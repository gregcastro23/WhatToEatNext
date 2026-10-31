/**
 * GET /api/search/suggest?q= — OpenSearch suggestion endpoint (plan Phase 6, issue #870).
 *
 * Implements the OpenSearch Suggestions 1.1 JSON extension:
 * [ query, [ completions ], [ descriptions ], [ urls ] ]
 *
 * Anonymous and query-keyed for CDN cacheability (D2).
 */
import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { getSearchIndex } from "@/lib/search/loader";
import { searchOmnibar } from "@/lib/search/omnibar";
import type { OmnibarResult } from "@/lib/search/types";
import { SearchQuerySchema } from "@/lib/validation/searchSchemas";

export const dynamic = "force-dynamic";
export const revalidate = 300;
export const runtime = "nodejs";

const CACHE_SECONDS = 300;
const STALE_SECONDS = 86_400;
const NO_STORE = { "Cache-Control": "no-store" };
const MAX_SUGGESTIONS = 8;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alchm.kitchen";

function toAbsoluteUrl(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  const cleanHref = href.startsWith("/") ? href : `/${href}`;
  return `${BASE_URL}${cleanHref}`;
}

interface SuggestionItem {
  completion: string;
  description: string;
  url: string;
}

type AddItemFn = (completion: string, description: string, href: string) => void;

function addEntitySuggestions(result: OmnibarResult, addItem: AddItemFn): void {
  for (const cuisine of result.cuisines) {
    addItem(cuisine.name, "Cuisine", cuisine.href);
  }
  for (const method of result.methods) {
    addItem(method.name, "Cooking Method", method.href);
  }
  for (const sauce of result.sauces) {
    addItem(sauce.name, "Sauce", sauce.href);
  }
}

function buildSuggestionItems(result: OmnibarResult): SuggestionItem[] {
  const items: SuggestionItem[] = [];
  const seenCompletions = new Set<string>();

  const addItem: AddItemFn = (completion, description, href) => {
    const cleanCompletion = completion.trim();
    const normKey = cleanCompletion.toLowerCase();
    if (!cleanCompletion || seenCompletions.has(normKey) || items.length >= MAX_SUGGESTIONS) {
      return;
    }
    seenCompletions.add(normKey);
    items.push({ completion: cleanCompletion, description, url: toAbsoluteUrl(href) });
  };

  if (result.corrected?.to) {
    addItem(
      result.corrected.to,
      `Did you mean ${result.corrected.to}?`,
      `/search?q=${encodeURIComponent(result.corrected.to)}`,
    );
  }
  if (result.hero) {
    addItem(result.hero.name, `Ingredient · ${result.hero.category}`, result.hero.href);
  }
  for (const recipe of result.recipes) {
    const desc = recipe.cuisine ? `Recipe · ${recipe.cuisine}` : "Recipe";
    addItem(recipe.name, desc, recipe.href);
  }
  for (const ing of result.ingredients) {
    if (ing.key === result.hero?.key) continue;
    addItem(ing.name, "Ingredient", ing.href);
  }
  addEntitySuggestions(result, addItem);

  return items;
}

function toSuggestionsResponse(query: string, items: SuggestionItem[]): NextResponse {
  const payload = [
    query,
    items.map((it) => it.completion),
    items.map((it) => it.description),
    items.map((it) => it.url),
  ];
  return new NextResponse(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/x-suggestions+json; charset=utf-8",
      "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
    },
  });
}

async function handleGet(request: Request): Promise<Response> {
  const limited = await rateLimit(request, { window: 60_000, max: 120, bucket: "opensearch-suggest" });
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

  const query = parsed.data.q.trim();
  if (!query) {
    return toSuggestionsResponse("", []);
  }

  try {
    const index = await getSearchIndex();
    const result = searchOmnibar(index, query, { now: new Date() });
    const items = buildSuggestionItems(result);
    return toSuggestionsResponse(query, items);
  } catch (error) {
    _logger.error("[api/search/suggest] suggestion generation failed:", error);
    return NextResponse.json({ success: false, error: "Suggestions unavailable" }, { status: 503, headers: NO_STORE });
  }
}

export const GET = withObservability(
  { routeName: "/api/search/suggest", skipUserResolution: true },
  handleGet,
);
