/**
 * GET /api/feed/historical-agents
 *
 * REAL data path for the Live Network Feed's historical-agent items.
 *
 * Source resolution:
 *   1. PA_HISTORICAL_FEED_URL set → fetch the Planetary Agents producer
 *      (the canonical cross-network source) and pass its items through.
 *   2. otherwise → serve real `agent_event` items from WTEN's own database
 *      (chart-bearing historical agents' real activity — insights, lab
 *      experiments, recipes — narrated) via historicalAgentFeedService.
 *
 * Either way the sourcing rule (historical + hasBirthchart; drop planetary) is
 * re-applied here. No fabricated data on this path — an empty DB yields an
 * empty feed.
 */

import { NextResponse } from "next/server";
import {
  coerceFeedItems,
  filterHistoricalAgentFeed,
} from "@/lib/feed/historicalAgentFeed";
import { getHistoricalAgentEvents } from "@/services/historicalAgentFeedService";
import { getPlanetaryResonanceFeed } from "@/services/planetaryResonanceService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "40", 10), 100);

  const producerUrl = process.env.PA_HISTORICAL_FEED_URL;

  // No PA producer wired → serve real WTEN-internal content: live planetary
  // resonance (degree agents, current sky) + historical agents' activity.
  if (!producerUrl) {
    try {
      const events = await getHistoricalAgentEvents(limit);
      const resonance = getPlanetaryResonanceFeed();
      const items = filterHistoricalAgentFeed([...resonance, ...events])
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, limit);
      return NextResponse.json({ success: true, items, source: "internal" });
    } catch (error) {
      console.error("[GET /api/feed/historical-agents] internal source error:", error);
      return NextResponse.json({ success: true, items: [], source: "internal_error" });
    }
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
