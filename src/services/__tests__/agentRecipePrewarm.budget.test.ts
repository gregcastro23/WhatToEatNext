/**
 * @jest-environment node
 *
 * prewarmAgentRecipes must finish inside the cron's time budget. With PA
 * generations measured at 12-34s and a fixed 45s timeout per call, three
 * sequential calls could need 135s in a 60s function — Vercel killed the
 * cron mid-flight 15 times and took its heartbeat row with it.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  CacheService: { set: jest.fn() },
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));
jest.mock("@/services/RealAlchemizeService", () => ({ alchemize: (): unknown => ({ thermodynamicProperties: {} }) }));
jest.mock("@/utils/ingredient/ingredientIndex", () => ({ findTopIngredientsForElement: (): unknown[] => [] }));
jest.mock("@/utils/planetaryAlchemyMapping", () => ({ calculateAlchemicalFromPlanets: (): unknown => ({}) }));
jest.mock("@/lib/serviceUrls", () => ({ getServiceUrl: (): string => "https://pa.test" }));

import {
  prewarmAgentRecipes,
  rotateCandidatesByHour,
} from "@/services/agentRecipePrewarm";

const VALID_PA_RECIPE = {
  id: "cosmic-herb-broth",
  title: "Cosmic Herb Broth",
  short_description: "A restorative herbed broth.",
  category: "Soup",
  cuisine: "Mediterranean",
  difficulty: "beginner",
  yields: 2,
  total_time: 20,
  alignment_score: {
    overall: 92,
    ingredients_fit: 92,
    diet_fit: 95,
    time_fit: 90,
    astro_fit: 91,
  },
  alignment_notes: ["Balanced heat and hydration"],
  tags: {
    diet: ["omnivore"],
    cuisine: ["Mediterranean"],
    meal_type: "Dinner",
    flavor_profile: ["savory"],
    cooking_methods: ["simmer"],
    elements: ["Fire"],
    planets: ["Sun"],
  },
  ingredients: [
    {
      name: "Thyme",
      quantity: "1",
      unit: "tbsp",
      optional: false,
      substitutions: [],
    },
  ],
  steps: [
    {
      step_number: 1,
      instruction: "Simmer gently.",
      time_minutes: 20,
      cooking_method: "simmer",
      tips: ["Keep below a rolling boil."],
    },
  ],
  elementalBalance: { fire: 35, earth: 25, water: 25, air: 15 },
  nutrition: { calories: 180, protein: 6, carbohydrates: 18, fat: 8 },
  finishing_and_serving: {
    garnish_and_plating: "Serve warm",
    doneness_cues: "Aromatic herbs steep evenly",
    serving_suggestions: "Pair with rustic bread",
  },
  leftovers_and_storage: {
    can_store: true,
    storage_instructions: "Refrigerate airtight.",
    storage_lifespan_days: 3,
  },
  astro_explanation: {
    summary: "Attuned to solar warmth.",
    correspondences: ["Sun -> Thyme"],
  },
};

const agent = (id: string): Record<string, unknown> => ({
  id,
  email: `${id}@agentic.alchm.kitchen`,
  name: id,
  dominant_element: "Fire",
  natal_positions: [{ planet: "Sun", sign: "Aries", degree: 12 }],
});

let clock = 0;
const fetchMock = jest.fn(async (): Promise<Response> => {
  clock += 30_000; // every PA call takes 30s of fake time, then fails
  return new Response("{}", { status: 503 });
});

beforeEach(() => {
  clock = 1_000_000;
  jest.spyOn(Date, "now").mockImplementation(() => clock);
  fetchMock.mockClear();
  global.fetch = fetchMock;
  mockExecuteQuery.mockReset().mockResolvedValue({ rows: [agent("a1"), agent("a2"), agent("a3")] });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("prewarmAgentRecipes — deadline-aware", () => {
  it("gives each call only the time left, and stops starting calls it cannot finish", async () => {
    const timeoutSpy = jest.spyOn(AbortSignal, "timeout");
    const result = await prewarmAgentRecipes(3, clock + 48_000);

    // Call 1 gets the full 45s cap; call 2 only the 18s left; call 3 never starts.
    expect(timeoutSpy.mock.calls.map(([ms]) => ms)).toEqual([45_000, 18_000]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ selected: 3, attempted: 2, generated: 0, skippedForBudget: 1 });
  });

  it("starts nothing when less than the minimum attempt window remains", async () => {
    const result = await prewarmAgentRecipes(3, clock + 10_000);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ selected: 3, attempted: 0, generated: 0, skippedForBudget: 3 });
  });

  it("throws when the agent query fails, instead of reporting an empty success", async () => {
    mockExecuteQuery.mockReset().mockRejectedValue(new Error("Query read timeout"));
    await expect(prewarmAgentRecipes(3, clock + 48_000)).rejects.toThrow("Query read timeout");
  });

  it("reports concise upstream PA error details via onFailure without altering PrewarmResult", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [agent("a1")] });
    fetchMock.mockImplementationOnce(async () => {
      clock += 20_000;
      return new Response(
        JSON.stringify({
          detail: {
            error: "Recipe model returned malformed output after retry",
            message: "all configured recipe providers were unavailable",
          },
        }),
        { status: 502, headers: { "content-type": "application/json" } },
      );
    });
    const failures: string[] = [];
    const result = await prewarmAgentRecipes(1, clock + 48_000, (reason) => failures.push(reason));
    expect(result).toEqual({ selected: 1, attempted: 1, generated: 0, skippedForBudget: 0 });
    expect(failures).toEqual(["HTTP 502: all configured recipe providers were unavailable"]);
  });

  it("rotates candidates by hour bucket and advances to the next candidate on transient failure", async () => {
    const items = ["a1", "a2", "a3", "a4"];
    expect(rotateCandidatesByHour(items, 0)).toEqual(["a1", "a2", "a3", "a4"]);
    expect(rotateCandidatesByHour(items, 3_600_000)).toEqual(["a2", "a3", "a4", "a1"]);

    mockExecuteQuery.mockResolvedValueOnce({
      rows: [agent("a1"), agent("a2"), agent("a3")],
    });
    fetchMock
      .mockImplementationOnce(async () => {
        clock += 15_000;
        return new Response("{}", { status: 502 });
      })
      .mockImplementationOnce(async () => {
        clock += 12_000;
        return new Response(JSON.stringify(VALID_PA_RECIPE), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      });

    const result = await prewarmAgentRecipes(1, clock + 48_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ selected: 3, attempted: 2, generated: 1, skippedForBudget: 0 });
  });
});
