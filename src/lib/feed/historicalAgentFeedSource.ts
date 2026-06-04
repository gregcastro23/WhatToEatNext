/**
 * Mock-first data source for the historical-agent Live Network Feed.
 *
 *   NEXT_PUBLIC_FEED_MOCK="true"  → render from the local contract fixture
 *                                   (lets this land before the PA producer
 *                                   is live).
 *   otherwise                     → fetch the real items from the WTEN-side
 *                                   route that fronts the PA producer
 *                                   (`/api/feed/historical-agents`). Until PA
 *                                   is wired that route returns an empty set,
 *                                   so the feed degrades to a graceful empty
 *                                   state rather than showing the retired
 *                                   planetary-agent posts.
 *
 * The sourcing rule (historical + hasBirthchart; drop planetary) is applied in
 * BOTH paths.
 */

import {
  coerceFeedItems,
  filterHistoricalAgentFeed,
  type HistoricalAgentFeedItem,
} from "./historicalAgentFeed";
import { getMockHistoricalAgentFeed } from "./historicalAgentFeedMock";

/** True when the feed should render from the local contract fixture. */
export function isFeedMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEED_MOCK === "true";
}

export async function fetchHistoricalAgentFeed(
  limit = 40,
): Promise<HistoricalAgentFeedItem[]> {
  if (isFeedMockEnabled()) {
    return filterHistoricalAgentFeed(getMockHistoricalAgentFeed()).slice(0, limit);
  }

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
