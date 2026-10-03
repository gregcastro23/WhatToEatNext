/**
 * @jest-environment node
 *
 * getUserInsights runs seven aggregates in parallel and degrades each one on
 * its own: a failed aggregate yields empty rows (logged) and flips `live` to
 * false, instead of rejecting the whole admin payload. Also pins the retired
 * premium tier's absence: the role breakdown carries admins only.
 */

const mockExecuteQuery = jest.fn();
const mockLoggerError = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...a: unknown[]) => mockExecuteQuery(...a),
}));

jest.mock("@/lib/logger", () => ({
  _logger: {
    error: (...a: unknown[]) => mockLoggerError(...a),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import { getUserInsights } from "@/services/userInsightsService";

describe("getUserInsights", () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockLoggerError.mockReset();
  });

  it("is live when every aggregate answers, and reports admins without a tier split", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) =>
      sql.includes("AS admins") ? { rows: [{ total: 9, humans: 7, admins: 3 }] } : { rows: [] },
    );

    const insights = await getUserInsights();

    expect(insights.live).toBe(true);
    expect(insights.tiers.admin).toBe(3);
    expect(insights.tiers).not.toHaveProperty("premium");
    expect(insights.tiers).not.toHaveProperty("free");
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it("degrades a failed aggregate to empty rows instead of rejecting the payload", async () => {
    mockExecuteQuery.mockImplementation(async (sql: string) => {
      if (sql.includes("device_sessions")) throw new Error("relation missing");
      return { rows: [] };
    });

    const insights = await getUserInsights();

    expect(insights.live).toBe(false);
    expect(insights.activity.activeSessions).toBe(0);
    expect(mockLoggerError).toHaveBeenCalledWith(
      "[userInsights] sub-query failed, degrading to empty rows:",
      expect.any(Error),
    );
  });
});
