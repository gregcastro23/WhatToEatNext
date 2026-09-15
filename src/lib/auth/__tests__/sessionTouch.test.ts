let mockRedisClient: { set: jest.Mock } | null = null;
const mockExecuteQuery = jest.fn();

jest.mock("@/lib/redis", () => ({
  getRedisClient: () => mockRedisClient,
}));

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

import { touchSession, scheduleSessionTouch } from "../sessionTouch";

describe("sessionTouch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient = null;
  });

  it("returns false and does not query when sessionId is invalid", async () => {
    const emptyResult = await touchSession("");
    const nullResult = await touchSession(null);
    const undefinedResult = await touchSession(undefined);

    expect(emptyResult).toBe(false);
    expect(nullResult).toBe(false);
    expect(undefinedResult).toBe(false);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("bypasses SQL update if Redis NX check returns false (already touched recently)", async () => {
    mockRedisClient = {
      set: jest.fn().mockResolvedValue(null),
    };

    const touched = await touchSession("session-123");
    expect(touched).toBe(false);
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      "session:touch:session-123",
      "1",
      { nx: true, ex: 600 },
    );
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("executes authoritative SQL update when Redis is unavailable or on cache miss", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: "session-123" }],
    });

    const headers = new Headers({
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "x-vercel-ip-city": "Miami",
      "x-vercel-ip-country-region": "FL",
      "x-vercel-ip-country": "US",
    });

    const touched = await touchSession("session-123", headers);
    expect(touched).toBe(true);

    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const queryCall = mockExecuteQuery.mock.calls[0];
    const sqlText: string = queryCall[0];
    const sqlParams: unknown[] = queryCall[1];

    expect(sqlText).toContain("WHERE id = $1");
    expect(sqlText).toContain("AND revoked_at IS NULL");
    expect(sqlText).toContain("AND last_seen_at < NOW() - interval '10 minutes'");

    expect(sqlParams[0]).toBe("session-123");
    expect(sqlParams[1]).toBe("Browser on macOS");
    expect(sqlParams[3]).toBe("Miami");
    expect(sqlParams[4]).toBe("FL");
    expect(sqlParams[5]).toBe("US");
  });

  it("returns false and never inserts when SQL update matches 0 rows", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    });

    const touched = await touchSession("session-already-revoked");
    expect(touched).toBe(false);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
  });

  it("scheduleSessionTouch executes without throwing outside request context", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: "session-bg" }],
    });

    scheduleSessionTouch("session-bg");
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(mockExecuteQuery).toHaveBeenCalled();
  });
});
