const mockExecuteQuery = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

import { revokeSessionsOnSignOut, handleSignOutSession } from "../signOutSession";

describe("revokeSessionsOnSignOut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns false and does not query when tokens are missing or null", async () => {
    const emptyResult = await revokeSessionsOnSignOut({});
    const nullResult = await revokeSessionsOnSignOut({ sessionToken: null, deviceSessionId: null });

    expect(emptyResult).toBe(false);
    expect(nullResult).toBe(false);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("deletes session from sessions table and marks device_sessions revoked", async () => {
    mockExecuteQuery.mockResolvedValue({ rowCount: 1, rows: [] });

    const result = await revokeSessionsOnSignOut({
      sessionToken: "session-abc-123",
      deviceSessionId: "device-xyz-789",
    });

    expect(result).toBe(true);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(2);

    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      1,
      `UPDATE device_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`,
      ["deviceSessionId-placeholder"].map(() => "device-xyz-789"),
    );

    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      2,
      `DELETE FROM sessions WHERE "sessionToken" = $1`,
      ["sessionToken-placeholder"].map(() => "session-abc-123"),
    );
  });

  it("updates device_sessions even if deleting from sessions table throws", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [] })
      .mockRejectedValueOnce(new Error("Sessions table error"));

    const result = await revokeSessionsOnSignOut({
      sessionToken: "session-fail-123",
      deviceSessionId: "device-success-789",
    });

    expect(result).toBe(true);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      1,
      `UPDATE device_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`,
      ["device-success-789"],
    );
    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      2,
      `DELETE FROM sessions WHERE "sessionToken" = $1`,
      ["session-fail-123"],
    );
  });

  it("revokes only sessions table when only sessionToken is provided", async () => {
    mockExecuteQuery.mockResolvedValue({ rowCount: 1, rows: [] });

    const result = await revokeSessionsOnSignOut({
      sessionToken: "session-only-123",
    });

    expect(result).toBe(true);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      `DELETE FROM sessions WHERE "sessionToken" = $1`,
      ["session-only-123"],
    );
  });

  it("revokes only device_sessions table when only deviceSessionId is provided", async () => {
    mockExecuteQuery.mockResolvedValue({ rowCount: 1, rows: [] });

    const result = await revokeSessionsOnSignOut({
      deviceSessionId: "device-only-456",
    });

    expect(result).toBe(true);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      `UPDATE device_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`,
      ["device-only-456"],
    );
  });

  it("handles repeated calls idempotently with WHERE revoked_at IS NULL", async () => {
    mockExecuteQuery.mockResolvedValue({ rowCount: 0, rows: [] });

    const firstRun = await revokeSessionsOnSignOut({
      deviceSessionId: "device-already-revoked",
    });
    const secondRun = await revokeSessionsOnSignOut({
      deviceSessionId: "device-already-revoked",
    });

    expect(firstRun).toBe(true);
    expect(secondRun).toBe(true);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    expect(mockExecuteQuery).toHaveBeenLastCalledWith(
      `UPDATE device_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`,
      ["device-already-revoked"],
    );
  });

  it("catches DB errors gracefully and returns false without throwing", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("DB connection timeout"));

    const result = await revokeSessionsOnSignOut({
      sessionToken: "session-err-123",
      deviceSessionId: "device-err-456",
    });

    expect(result).toBe(false);
  });
});

describe("handleSignOutSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("extracts sessionToken and deviceSessionId and triggers revocation", async () => {
    mockExecuteQuery.mockResolvedValue({ rowCount: 1, rows: [] });

    await handleSignOutSession({
      sessionId: "token-session-123",
      deviceSessionId: "token-device-456",
    });

    expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
  });

  it("falls back to sessionId when deviceSessionId is not present", async () => {
    mockExecuteQuery.mockResolvedValue({ rowCount: 1, rows: [] });

    await handleSignOutSession({
      sessionId: "fallback-session-789",
    });

    expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      1,
      `UPDATE device_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`,
      ["fallback-session-789"],
    );
    expect(mockExecuteQuery).toHaveBeenNthCalledWith(
      2,
      `DELETE FROM sessions WHERE "sessionToken" = $1`,
      ["fallback-session-789"],
    );
  });

  it("safely handles undefined token without calling database", async () => {
    await handleSignOutSession(undefined);
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });
});
