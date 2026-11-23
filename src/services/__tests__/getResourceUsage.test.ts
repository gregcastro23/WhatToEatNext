/**
 * @jest-environment node
 *
 * The dashboard wrapper around the Railway reader. Every outcome maps to its
 * own honest state: usage → live; no token → `token-unset`; token set but the
 * call failed → `call-failed` carrying the reason. No UPSTASH env in tests, so
 * redisCached fails open and calls the (mocked) reader directly.
 */

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
  checkDatabaseHealth: jest.fn(),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/services/railwayUsageService", () => ({
  readRailwayResourceUsage: jest.fn(),
}));

import { _logger } from "@/lib/logger";
import { readRailwayResourceUsage } from "@/services/railwayUsageService";
import { getResourceUsage } from "@/services/dashboardPanelsService";

const mockReader = jest.mocked(readRailwayResourceUsage);
const mockError = jest.mocked(_logger.error);

const NO_ITEMS = { items: [], provider: "Railway", periodLabel: "", live: false };

describe("getResourceUsage", () => {
  const savedToken = process.env.RAILWAY_API_TOKEN;

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => {
    if (savedToken === undefined) delete process.env.RAILWAY_API_TOKEN;
    else process.env.RAILWAY_API_TOKEN = savedToken;
  });

  it("no token → the `token-unset` no-source state", async () => {
    mockReader.mockResolvedValue({ status: "no-token" });
    expect(await getResourceUsage()).toEqual({ ...NO_ITEMS, status: "token-unset", failure: null });
  });

  it("token set but the call failed → `call-failed` with the reason, and no usage numbers", async () => {
    mockReader.mockResolvedValue({ status: "failed", reason: "HTTP 401 on usage" });
    expect(await getResourceUsage()).toEqual({ ...NO_ITEMS, status: "call-failed", failure: "HTTP 401 on usage" });
  });

  it("marks live + passes through real usage when the reader returns data", async () => {
    mockReader.mockResolvedValue({
      status: "ok",
      usage: {
        items: [
          {
            resource: "Memory",
            measurement: "MEMORY_USAGE_GB",
            unit: "GB·hr",
            mtdValue: 100,
            projectedValue: 200,
            pct: 0.5,
          },
        ],
        provider: "Railway",
        periodLabel: "Jun 2026 MTD",
      },
    });
    const r = await getResourceUsage();
    expect(r.live).toBe(true);
    expect(r.status).toBe("live");
    expect(r.failure).toBeNull();
    expect(r.provider).toBe("Railway");
    expect(r.periodLabel).toBe("Jun 2026 MTD");
    expect(r.items).toHaveLength(1);
  });

  describe("when the read itself throws (not a Railway answer)", () => {
    it("logs it with `_logger.error` and says `call-failed` if a token is set", async () => {
      process.env.RAILWAY_API_TOKEN = "rwy-FAKE-TOKEN-0123456789";
      mockReader.mockRejectedValue(new Error("cache layer exploded"));

      const r = await getResourceUsage();
      expect(r).toMatchObject({ live: false, status: "call-failed", items: [] });
      expect(r.failure).toEqual(expect.stringContaining("unexpectedly"));
      expect(mockError).toHaveBeenCalledTimes(1);
    });

    it("never claims a call failed when there is no token to call with", async () => {
      delete process.env.RAILWAY_API_TOKEN;
      mockReader.mockRejectedValue(new Error("cache layer exploded"));

      expect(await getResourceUsage()).toEqual({ ...NO_ITEMS, status: "token-unset", failure: null });
      expect(mockError).toHaveBeenCalledTimes(1);
    });
  });
});
