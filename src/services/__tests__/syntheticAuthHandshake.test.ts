/**
 * @jest-environment node
 *
 * Verifies runAuthHandshakeProbe retries once on transient DB unavailability
 * (HTTP 503) so a brief pool hiccup does not page "Authentication incident",
 * while immediately failing without retry on genuine auth rejections (401/403).
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

jest.mock("@/lib/mcp/tools", () => ({
  invokeTool: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { runAuthHandshakeProbe } from "@/services/syntheticProbeService";

describe("runAuthHandshakeProbe resilience vs fail-fast", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockExecuteQuery.mockReset().mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("retries once on HTTP 503 (transient DB unavailability) and succeeds if retry returns 200", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, error: "Authentication service temporarily unavailable" }), {
          status: 503,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, sessions: [{ id: "s1" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    global.fetch = fetchMock;

    const result = await runAuthHandshakeProbe({
      baseUrl: "https://alchm.kitchen",
      bearerToken: "probe-token",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("success");
    expect(result.httpStatus).toBe(200);
    expect(result.errorMessage).toBeNull();
  });

  it("fails immediately without retry on genuine HTTP 401 auth rejection", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );
    global.fetch = fetchMock;

    const result = await runAuthHandshakeProbe({
      baseUrl: "https://alchm.kitchen",
      bearerToken: "bad-token",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(401);
    expect(result.errorMessage).toBe("Auth rejected (HTTP 401)");
  });

  it("reports Database unavailable (HTTP 503) if both attempts return 503", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(new Response("{}", { status: 503 }));
    global.fetch = fetchMock;

    const result = await runAuthHandshakeProbe({
      baseUrl: "https://alchm.kitchen",
      bearerToken: "probe-token",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("failure");
    expect(result.httpStatus).toBe(503);
    expect(result.errorMessage).toBe("Database unavailable (HTTP 503)");
  });
});
