/**
 * @jest-environment node
 *
 * Tests for internal bearer authentication in PA recipe prewarm.
 *
 * - Outgoing fetch to PA attaches `Authorization: Bearer ${INTERNAL_API_SECRET}` when set.
 * - Outgoing fetch works without Authorization when unset, logging a single warning.
 * - Warning is deduplicated across multiple prewarm attempts.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  CacheService: { set: jest.fn() },
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));
jest.mock("@/services/RealAlchemizeService", () => ({
  alchemize: (): unknown => ({ thermodynamicProperties: {} }),
}));
jest.mock("@/utils/ingredient/ingredientIndex", () => ({
  findTopIngredientsForElement: (): unknown[] => [],
}));
jest.mock("@/utils/planetaryAlchemyMapping", () => ({
  calculateAlchemicalFromPlanets: (): unknown => ({}),
}));
jest.mock("@/lib/serviceUrls", () => ({
  getServiceUrl: (): string => "https://pa.test",
}));

import { _logger } from "@/lib/logger";
import {
  getPaAuthHeaders,
  prewarmAgentRecipes,
  resetPrewarmAuthWarning,
} from "@/services/agentRecipePrewarm";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getCapturedHeaders(mock: jest.Mock): Record<string, string> {
  const call = mock.mock.calls[0];
  if (!Array.isArray(call)) return {};
  const init = call[1];
  if (!isRecord(init)) return {};
  const headers = init.headers;
  if (!isRecord(headers)) return {};
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(headers)) {
    if (typeof val === "string") {
      result[key] = val;
    }
  }
  return result;
}

const agent = (id: string): Record<string, unknown> => ({
  id,
  email: `${id}@agentic.alchm.kitchen`,
  name: id,
  dominant_element: "Fire",
  natal_positions: [{ planet: "Sun", sign: "Aries", degree: 12 }],
});

describe("agentRecipePrewarm authentication", () => {
  const ORIGINAL_SECRET = process.env.INTERNAL_API_SECRET;
  let warnSpy: jest.SpyInstance;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    resetPrewarmAuthWarning();
    warnSpy = jest.spyOn(_logger, "warn").mockImplementation(() => {});
    fetchMock = jest.fn(async (): Promise<Response> => {
      return new Response("{}", { status: 503 });
    });
    global.fetch = fetchMock;
    mockExecuteQuery.mockReset().mockResolvedValue({ rows: [agent("agent-1")] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.INTERNAL_API_SECRET = ORIGINAL_SECRET;
  });

  it("attaches Authorization: Bearer header when INTERNAL_API_SECRET is set", async () => {
    process.env.INTERNAL_API_SECRET = "super-secret-token";
    const headers = getPaAuthHeaders();
    expect(headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer super-secret-token",
    });
    expect(warnSpy).not.toHaveBeenCalled();

    // Verify end-to-end via prewarmAgentRecipes
    await prewarmAgentRecipes(1, Date.now() + 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sentHeaders = getCapturedHeaders(fetchMock);
    expect(sentHeaders["Authorization"]).toBe("Bearer super-secret-token");
    expect(sentHeaders["Content-Type"]).toBe("application/json");
  });

  it("omits Authorization header and logs a single warning when INTERNAL_API_SECRET is unset", async () => {
    delete process.env.INTERNAL_API_SECRET;
    const headers1 = getPaAuthHeaders();
    expect(headers1).toEqual({
      "Content-Type": "application/json",
    });
    expect(headers1["Authorization"]).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("INTERNAL_API_SECRET is unset"),
    );

    // Second call should NOT log again
    const headers2 = getPaAuthHeaders();
    expect(headers2["Authorization"]).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Verify end-to-end prewarm does not fail or crash
    await prewarmAgentRecipes(1, Date.now() + 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sentHeaders = getCapturedHeaders(fetchMock);
    expect(sentHeaders["Authorization"]).toBeUndefined();
  });
});
