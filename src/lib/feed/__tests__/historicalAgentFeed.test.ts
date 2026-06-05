import {
  coerceFeedItems,
  filterHistoricalAgentFeed,
  isHistoricalAgentFeedItem,
  type HistoricalAgentFeedItem,
} from "../historicalAgentFeed";

describe("filterHistoricalAgentFeed", () => {
  it("keeps historical recipe_posts that have a birthchart", () => {
    const items: HistoricalAgentFeedItem[] = [
      {
        id: "1",
        type: "recipe_post",
        agent: { id: "a", name: "A", kind: "historical", hasBirthchart: true },
        recipe: { name: "R" },
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];
    expect(filterHistoricalAgentFeed(items)).toHaveLength(1);
  });

  it("drops planetary-agent recipe_posts", () => {
    const items: HistoricalAgentFeedItem[] = [
      {
        id: "2",
        type: "recipe_post",
        agent: { id: "p", name: "Moon", kind: "planetary", hasBirthchart: false },
        recipe: { name: "Stew" },
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];
    expect(filterHistoricalAgentFeed(items)).toHaveLength(0);
  });

  it("drops historical recipe_posts without a birthchart", () => {
    const items: HistoricalAgentFeedItem[] = [
      {
        id: "3",
        type: "recipe_post",
        agent: { id: "h", name: "Anon", kind: "historical", hasBirthchart: false },
        recipe: { name: "Pottage" },
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];
    expect(filterHistoricalAgentFeed(items)).toHaveLength(0);
  });

  it("keeps yield_claim items", () => {
    const items: HistoricalAgentFeedItem[] = [
      {
        id: "4",
        type: "yield_claim",
        historicalAgentId: "h",
        planetaryAgentId: "p",
        amount: 5,
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];
    expect(filterHistoricalAgentFeed(items)).toHaveLength(1);
  });
});

describe("isHistoricalAgentFeedItem / coerceFeedItems", () => {
  it("rejects non-records and malformed entries", () => {
    expect(isHistoricalAgentFeedItem(null)).toBe(false);
    expect(isHistoricalAgentFeedItem({ type: "recipe_post" })).toBe(false);
    expect(coerceFeedItems(null)).toEqual([]);
    expect(coerceFeedItems([{ type: "recipe_post" }, { nope: true }])).toEqual([]);
  });

  it("accepts well-formed contract items", () => {
    const ok = [
      {
        id: "1",
        type: "recipe_post",
        agent: { id: "a", name: "A", kind: "historical", hasBirthchart: true },
        recipe: { name: "R" },
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "2",
        type: "yield_claim",
        historicalAgentId: "h",
        planetaryAgentId: "p",
        amount: 3,
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];
    expect(coerceFeedItems(ok)).toHaveLength(2);
  });
});
