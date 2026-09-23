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

import { prewarmAgentRecipes } from "@/services/agentRecipePrewarm";

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
});
