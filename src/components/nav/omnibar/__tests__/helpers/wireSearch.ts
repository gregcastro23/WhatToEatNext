/**
 * Real search responses for omnibar tests: the static recipe catalog through
 * the same core and serializer GET /api/search uses, so the UI is tested on
 * what the server actually sends.
 */
import { getServerRecipes } from "@/actions/recipes";
import { buildIndexForRecipes } from "@/lib/search/loader";
import { searchOmnibar } from "@/lib/search/omnibar";
import type { SearchIndex } from "@/lib/search/searchIndex";
import { toOmnibarResponse } from "@/lib/search/serialize";
import type { OmnibarResponse } from "@/lib/validation/searchSchemas";

export const SEPTEMBER = new Date("2026-09-24T12:00:00Z");

let cached: SearchIndex | null = null;

export async function loadIndex(): Promise<SearchIndex> {
  cached ??= buildIndexForRecipes(await getServerRecipes());
  return cached;
}

export function wire(index: SearchIndex, query: string): OmnibarResponse {
  return toOmnibarResponse(searchOmnibar(index, query, { now: SEPTEMBER }));
}
