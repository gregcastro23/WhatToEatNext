/**
 * GET /api/feed/historical-agents
 *
 * Server-side seam between the Live Network Feed and the Planetary Agents (PA)
 * producer of historical-agent `recipe_post` / `yield_claim` items.
 *
 * Until PA's producer endpoint is confirmed, this returns an empty set so the
 * feed degrades to a graceful empty state (and the retired planetary-agent
 * posts simply stop appearing — no fabricated data on the live path). To go
 * live, set PA_HISTORICAL_FEED_URL to the confirmed PA endpoint — no code
 * change required.
 *
 * NOTE: client-side mock rendering is handled by NEXT_PUBLIC_FEED_MOCK in
 * src/lib/feed/historicalAgentFeedSource.ts; this route is the REAL path only.
 */

import { NextResponse } from "next/server";
import {
  coerceFeedItems,
  filterHistoricalAgentFeed,
} from "@/lib/feed/historicalAgentFeed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "40", 10), 100);

  const producerUrl = process.env.PA_HISTORICAL_FEED_URL;

  // Not yet wired to PA → honest empty set.
  if (!producerUrl) {
    return NextResponse.json({ success: true, items: [], source: "unwired" });
  }

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }

    const res = await fetch(`${producerUrl}?limit=${limit}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ success: true, items: [], source: "producer_error" });
    }

    const raw: unknown = await res.json();
    const rawItems = raw && typeof raw === "object" && "items" in raw ? raw.items : raw;

    const items = filterHistoricalAgentFeed(coerceFeedItems(rawItems)).slice(0, limit);
    return NextResponse.json({ success: true, items, source: "pa" });
  } catch (error) {
    console.error("[GET /api/feed/historical-agents]", error);
    return NextResponse.json({ success: true, items: [], source: "exception" });
  }
}
