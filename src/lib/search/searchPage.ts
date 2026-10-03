/**
 * Data for the full results page, /search?q= (omnibar Phase 3, #870). Same
 * core and wire shape as GET /api/search, with room for everything: every
 * recipe that uses the hero ingredient, and more hits per kind.
 */
import { _logger } from "@/lib/logger";
import { SEARCH_QUERY_MAX_LENGTH, type OmnibarResponse } from "@/lib/validation/searchSchemas";
import { getSearchIndex } from "./loader";
import { searchOmnibar } from "./omnibar";
import { toOmnibarResponse } from "./serialize";

const PAGE_PER_KIND = 24;
/**
 * [MEASURED 2026-09-24, static catalog of 1,082 recipes] The most-used card,
 * sea salt, is in 287 recipes (garlic 267, water 266); 10 of 755 used cards
 * are in more than 120. 300 lists every recipe for every card today.
 */
export const PAGE_CONTAINING = 300;

/** `?q=` as the page reads it: the first value, trimmed, single-spaced, capped like the API. */
export function pageQuery(raw: string | string[] | undefined): string {
  const first = Array.isArray(raw) ? raw[0] : raw;
  return (first ?? "").trim().replace(/\s+/g, " ").slice(0, SEARCH_QUERY_MAX_LENGTH);
}

/** null = search is unavailable (the page says so rather than showing zero results). */
export async function searchForPage(query: string, now: Date): Promise<OmnibarResponse | null> {
  try {
    const index = await getSearchIndex();
    const result = searchOmnibar(index, query, { now, perKindLimit: PAGE_PER_KIND, containingLimit: PAGE_CONTAINING });
    return toOmnibarResponse(result);
  } catch (error) {
    _logger.error("[search page] search failed:", error);
    return null;
  }
}
