/**
 * Client data source for the historical-agent Live Network Feed.
 *
 * Fetches the real items from the WTEN-side route `/api/feed/historical-agents`,
 * which serves historical agents' recipe posts from WTEN's own DB (and the PA
 * producer's items + yield claims once PA_HISTORICAL_FEED_URL is wired). The
 * sourcing rule (historical + hasBirthchart; drop planetary) is re-applied here
 * as defense-in-depth. Degrades to an empty list on error.
 */

import {
  coerceFeedItems,
  filterHistoricalAgentFeed,
  type HistoricalAgentFeedItem,
} from "./historicalAgentFeed";

export async function fetchHistoricalAgentFeed(
  limit = 40,
): Promise<HistoricalAgentFeedItem[]> {
  try {
    const res = await fetch(`/api/feed/historical-agents?limit=${limit}`);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    const rawItems =
      data && typeof data === "object" && "items" in data ? data.items : data;
    return filterHistoricalAgentFeed(coerceFeedItems(rawItems)).slice(0, limit);
  } catch {
    return [];
  }
}
