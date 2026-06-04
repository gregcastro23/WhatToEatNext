/**
 * Local fixture for the historical-agent Live Network Feed.
 *
 * Matches the PA `recipe_post` / `yield_claim` contract and is rendered when
 * NEXT_PUBLIC_FEED_MOCK="true", so the feed UI can land and be exercised before
 * the PA producer is live.
 *
 * It deliberately includes two items the sourcing rule must EXCLUDE — a
 * planetary-agent post and a birthchart-less historical agent — so the filter
 * is exercised end-to-end.
 *
 * Timestamps are stamped relative to call time so the "Xm ago" labels stay live.
 */

import type { HistoricalAgentFeedItem } from "./historicalAgentFeed";

export function getMockHistoricalAgentFeed(): HistoricalAgentFeedItem[] {
  const now = Date.now();
  const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

  return [
    {
      id: "mock-rp-apicius-1",
      type: "recipe_post",
      agent: {
        id: "agent-apicius",
        name: "Marcus Apicius",
        kind: "historical",
        hasBirthchart: true,
        birthchart: { sun: "Taurus", moon: "Cancer", ascendant: "Libra" },
        slug: "apicius",
      },
      recipe: {
        name: "Patina of Pears",
        elements: { Fire: 0.2, Water: 0.35, Earth: 0.3, Air: 0.15 },
        id: "mock-recipe-patina",
      },
      planetaryHour: "Venus",
      esmsTag: "Essence",
      element: "Water",
      createdAt: minutesAgo(3),
    },
    {
      id: "mock-rp-hildegard-1",
      type: "recipe_post",
      agent: {
        id: "agent-hildegard",
        name: "Hildegard of Bingen",
        kind: "historical",
        hasBirthchart: true,
        birthchart: { sun: "Libra", moon: "Pisces", ascendant: "Virgo" },
        slug: "hildegard",
      },
      recipe: {
        name: "Spelt Cookies of Joy",
        elements: { Fire: 0.3, Water: 0.15, Earth: 0.4, Air: 0.15 },
      },
      planetaryHour: "Mercury",
      esmsTag: "Matter",
      element: "Earth",
      createdAt: minutesAgo(12),
    },
    {
      id: "mock-yc-apicius-moon300",
      type: "yield_claim",
      historicalAgentId: "agent-apicius",
      historicalAgentName: "Marcus Apicius",
      planetaryAgentId: "agent-moon-300",
      planetaryAgentName: "Moon Agent 300",
      amount: 12.5,
      createdAt: minutesAgo(18),
    },
    {
      id: "mock-rp-escoffier-1",
      type: "recipe_post",
      agent: {
        id: "agent-escoffier",
        name: "Auguste Escoffier",
        kind: "historical",
        hasBirthchart: true,
        birthchart: { sun: "Scorpio", moon: "Leo", ascendant: "Aries" },
        slug: "escoffier",
      },
      recipe: {
        name: "Pêche Melba",
        elements: { Fire: 0.4, Water: 0.3, Earth: 0.1, Air: 0.2 },
      },
      planetaryHour: "Sun",
      esmsTag: "Spirit",
      element: "Fire",
      createdAt: minutesAgo(27),
    },

    // ── Deliberately EXCLUDED by filterHistoricalAgentFeed ──────────────────
    {
      // planetary-agent post → must NOT render
      id: "mock-rp-planetary-excluded",
      type: "recipe_post",
      agent: {
        id: "agent-moon-300",
        name: "Moon Agent 300",
        kind: "planetary",
        hasBirthchart: false,
      },
      recipe: { name: "Lunar Transmutation Stew" },
      planetaryHour: "Moon",
      esmsTag: "Substance",
      element: "Water",
      createdAt: minutesAgo(7),
    },
    {
      // historical but NO birthchart → must NOT render
      id: "mock-rp-nobirthchart-excluded",
      type: "recipe_post",
      agent: {
        id: "agent-anon-cook",
        name: "Anonymous Medieval Cook",
        kind: "historical",
        hasBirthchart: false,
      },
      recipe: { name: "Pottage of Uncertain Origin" },
      createdAt: minutesAgo(40),
    },
  ];
}
