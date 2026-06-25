/**
 * @jest-environment node
 *
 * The dashboard wrapper around the Railway reader: real data → live:true;
 * null (no token / API error) → the honest no-source state. No UPSTASH env in
 * tests, so redisCached fails open and calls the (mocked) reader directly.
 */

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
  checkDatabaseHealth: jest.fn(),
}));
jest.mock("@/services/railwayUsageService", () => ({
  fetchRailwayResourceUsage: jest.fn(),
}));

import { fetchRailwayResourceUsage } from "@/services/railwayUsageService";
import { getResourceUsage } from "@/services/dashboardPanelsService";

const mockReader = fetchRailwayResourceUsage as jest.Mock;

describe("getResourceUsage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the honest no-source state when the reader returns null", async () => {
    mockReader.mockResolvedValue(null);
    const r = await getResourceUsage();
    expect(r.live).toBe(false);
    expect(r.items).toEqual([]);
  });

  it("marks live + passes through real usage when the reader returns data", async () => {
    mockReader.mockResolvedValue({
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
    });
    const r = await getResourceUsage();
    expect(r.live).toBe(true);
    expect(r.provider).toBe("Railway");
    expect(r.periodLabel).toBe("Jun 2026 MTD");
    expect(r.items).toHaveLength(1);
  });
});
