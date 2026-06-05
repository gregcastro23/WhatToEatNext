import {
  birthchartFromNatalChart,
  mapAgentRecipeEventToPost,
  type AgentRecipeEventRow,
} from "../historicalAgentFeedService";

const BASE_ROW: AgentRecipeEventRow = {
  id: "evt-1",
  actor_id: "agent-uuid-1",
  metadata_payload: {
    recipeName: "Patina of Pears",
    recipeId: "recipe-123",
    planetarySignature: {
      planetaryHour: "Venus",
      dominantElement: "Water",
      sacredStat: "Essence",
    },
  },
  created_at: "2026-06-01T12:00:00.000Z",
  email: "apicius@agentic.alchm.kitchen",
  name: "Marcus Apicius",
  dominant_element: "Fire",
  natal_chart: {
    planets: [
      { name: "Sun", sign: "Taurus" },
      { name: "Moon", sign: "Cancer" },
    ],
    ascendant: "Libra",
  },
};

describe("birthchartFromNatalChart", () => {
  it("extracts sun/moon/ascendant from the planets-array format", () => {
    expect(
      birthchartFromNatalChart({
        planets: [
          { name: "Sun", sign: "Taurus" },
          { name: "Moon", sign: "Cancer" },
        ],
        ascendant: "Libra",
      }),
    ).toEqual({ sun: "Taurus", moon: "Cancer", ascendant: "Libra" });
  });

  it("extracts from the planetaryPositions-object format", () => {
    expect(
      birthchartFromNatalChart({ planetaryPositions: { Sun: "Leo", Moon: "Aries" } }),
    ).toEqual({ sun: "Leo", moon: "Aries" });
  });

  it("returns undefined for an empty/missing chart", () => {
    expect(birthchartFromNatalChart({})).toBeUndefined();
    expect(birthchartFromNatalChart(null)).toBeUndefined();
    expect(birthchartFromNatalChart("{}")).toBeUndefined();
  });
});

describe("mapAgentRecipeEventToPost", () => {
  it("maps a full real row into a recipe_post", () => {
    const post = mapAgentRecipeEventToPost(BASE_ROW);
    expect(post).toMatchObject({
      id: "evt-1",
      type: "recipe_post",
      agent: {
        id: "agent-uuid-1",
        name: "Marcus Apicius",
        kind: "historical",
        hasBirthchart: true,
        birthchart: { sun: "Taurus", moon: "Cancer", ascendant: "Libra" },
        slug: "apicius",
      },
      recipe: { name: "Patina of Pears", id: "recipe-123" },
      planetaryHour: "Venus",
      esmsTag: "Essence",
      element: "Water",
    });
    expect(post.createdAt).toBe("2026-06-01T12:00:00.000Z");
  });

  it("parses a stringified metadata_payload", () => {
    const post = mapAgentRecipeEventToPost({
      ...BASE_ROW,
      metadata_payload: JSON.stringify(BASE_ROW.metadata_payload),
    });
    expect(post.recipe.name).toBe("Patina of Pears");
    expect(post.element).toBe("Water");
  });

  it("falls back to a generic recipe name and drops unknown tags", () => {
    const post = mapAgentRecipeEventToPost({
      ...BASE_ROW,
      metadata_payload: { planetarySignature: { sacredStat: "not-an-esms" } },
      dominant_element: null,
    });
    expect(post.recipe.name).toBe("a new recipe");
    expect(post.recipe.id).toBeUndefined();
    expect(post.esmsTag).toBeUndefined();
    expect(post.element).toBeUndefined();
    expect(post.planetaryHour).toBeUndefined();
  });

  it("derives the element from the profile dominant_element when the signature lacks one", () => {
    const post = mapAgentRecipeEventToPost({
      ...BASE_ROW,
      metadata_payload: { recipeName: "Stew" },
      dominant_element: "Earth",
    });
    expect(post.element).toBe("Earth");
  });

  it("uses the email local-part for name fallback and slug", () => {
    const post = mapAgentRecipeEventToPost({ ...BASE_ROW, name: null });
    expect(post.agent.name).toBe("apicius");
    expect(post.agent.slug).toBe("apicius");
  });

  it("normalizes a Date created_at to ISO", () => {
    const post = mapAgentRecipeEventToPost({
      ...BASE_ROW,
      created_at: new Date("2026-06-02T08:30:00.000Z"),
    });
    expect(post.createdAt).toBe("2026-06-02T08:30:00.000Z");
  });
});
