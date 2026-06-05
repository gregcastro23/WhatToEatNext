import {
  formatNatalPlacements,
  mapAgentEventRow,
  type AgentEventRow,
} from "../historicalAgentFeedService";

const BASE_ROW: AgentEventRow = {
  id: "evt-1",
  actor_id: "agent-uuid-1",
  event_type: "insight",
  metadata_payload: {
    insightTitle: "On the Alchemy of Bread",
    planetarySignature: {
      planetaryHour: "Mars",
      dominantElement: "Earth",
      sacredStat: "Matter",
      natalPositions: [
        { planet: "Sun", sign: "Aquarius", degree: 7 },
        { planet: "Moon", sign: "Sagittarius", degree: 27 },
      ],
    },
  },
  created_at: "2026-06-01T12:00:00.000Z",
  email: "mozart@agentic.alchm.kitchen",
  name: "Wolfgang Amadeus Mozart",
  dominant_element: "Air",
  natal_positions: null,
};

describe("formatNatalPlacements", () => {
  it("formats planet/sign placements", () => {
    expect(
      formatNatalPlacements([
        { planet: "Sun", sign: "Aquarius" },
        { planet: "Moon", sign: "Sagittarius" },
      ]),
    ).toEqual(["Sun Aquarius", "Moon Sagittarius"]);
  });

  it("parses a JSON string and ignores malformed entries", () => {
    expect(
      formatNatalPlacements('[{"planet":"Mars","sign":"Scorpio"},{"x":1}]'),
    ).toEqual(["Mars Scorpio"]);
  });

  it("returns [] for non-arrays", () => {
    expect(formatNatalPlacements(null)).toEqual([]);
    expect(formatNatalPlacements({})).toEqual([]);
  });
});

describe("mapAgentEventRow", () => {
  it("maps a real insight row into a narrated agent_event", () => {
    const item = mapAgentEventRow(BASE_ROW);
    expect(item).toMatchObject({
      id: "evt-1",
      type: "agent_event",
      agent: {
        id: "agent-uuid-1",
        name: "Wolfgang Amadeus Mozart",
        kind: "historical",
        hasBirthchart: true,
        slug: "mozart",
      },
      element: "Earth",
      esmsTag: "Matter",
      planetaryHour: "Mars",
      natalSignature: ["Sun Aquarius", "Moon Sagittarius"],
    });
    expect(item.action.toLowerCase()).toContain("insight"); // narrated
    expect(item.icon).toBeTruthy();
    expect(item.createdAt).toBe("2026-06-01T12:00:00.000Z");
  });

  it("narrates recipe_generation with a permalink href", () => {
    const item = mapAgentEventRow({
      ...BASE_ROW,
      event_type: "recipe_generation",
      metadata_payload: { recipeName: "Spelt Loaf", recipeId: "r-9" },
    });
    expect(item.action.toLowerCase()).toContain("spelt loaf");
    expect(item.href).toBe("/generated-recipe/r-9");
  });

  it("falls back to email local-part for name + slug; element from profile", () => {
    const item = mapAgentEventRow({
      ...BASE_ROW,
      name: null,
      metadata_payload: { insightTitle: "X" }, // no signature
    });
    expect(item.agent.name).toBe("mozart");
    expect(item.agent.slug).toBe("mozart");
    expect(item.element).toBe("Air"); // dominant_element fallback
    expect(item.natalSignature).toBeUndefined();
  });

  it("uses profile natal_positions when the event signature has none", () => {
    const item = mapAgentEventRow({
      ...BASE_ROW,
      metadata_payload: { insightTitle: "X" },
      natal_positions: [{ planet: "Venus", sign: "Capricorn" }],
    });
    expect(item.natalSignature).toEqual(["Venus Capricorn"]);
  });

  it("normalizes a Date created_at to ISO", () => {
    const item = mapAgentEventRow({
      ...BASE_ROW,
      created_at: new Date("2026-06-02T08:30:00.000Z"),
    });
    expect(item.createdAt).toBe("2026-06-02T08:30:00.000Z");
  });
});
