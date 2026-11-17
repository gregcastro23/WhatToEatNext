/**
 * @jest-environment node
 *
 * Verifies that PostgreSQL read failures during user ID resolution raise
 * `UserDatabaseUnavailableError` instead of silently returning `null`
 * (which downstream auth validation previously converted into HTTP 401).
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

describe("UserDatabaseService ID lookup failure propagation", () => {
  const ORIGINAL_DB_URL = process.env.DATABASE_URL;
  const VALID_UUID = "7c1e2a4b-3d5f-4a6b-8c7d-9e0f1a2b3c4d";

  beforeEach(() => {
    jest.resetModules();
    process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/test";
    mockExecuteQuery.mockReset();
  });

  afterEach(() => {
    if (ORIGINAL_DB_URL === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = ORIGINAL_DB_URL;
  });

  it("throws UserDatabaseUnavailableError from getUserById when Postgres errors", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("Query read timeout"));
    const {
      userDatabase,
      UserDatabaseUnavailableError,
    } = await import("@/services/userDatabaseService");

    await expect(userDatabase.getUserById(VALID_UUID)).rejects.toBeInstanceOf(
      UserDatabaseUnavailableError,
    );
  });

  it("throws UserDatabaseUnavailableError from isUserActiveById when Postgres errors", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("Connection terminated due to connection timeout"));
    const {
      userDatabase,
      UserDatabaseUnavailableError,
    } = await import("@/services/userDatabaseService");

    await expect(userDatabase.isUserActiveById(VALID_UUID)).rejects.toBeInstanceOf(
      UserDatabaseUnavailableError,
    );
  });

  it("returns null without querying Postgres when ID is a non-UUID OAuth sub", async () => {
    const { userDatabase } = await import("@/services/userDatabaseService");
    await expect(userDatabase.getUserById("oauth-sub-123")).resolves.toBeNull();
    await expect(userDatabase.isUserActiveById("oauth-sub-123")).resolves.toBeNull();
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });
});
