/**
 * Tests for `recordInvocation`: latency and credential-safe persisted telemetry.
 * The DB module is mocked so no Postgres is required.
 */

const mockExecuteQuery = jest.fn().mockResolvedValue({ rows: [] });

jest.mock("@/lib/database/connection", () => ({
  executeQuery: mockExecuteQuery,
}));

// Make sure the module sees DATABASE_URL so it doesn't no-op.
const originalDbUrl = process.env.DATABASE_URL;
beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test/test";
});
afterAll(() => {
  if (originalDbUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDbUrl;
});

import { drainMcpInvocations, recordInvocation } from "@/lib/mcp/invocationLog";

describe("recordInvocation latency_ms contract", () => {
  beforeEach(() => {
    mockExecuteQuery.mockClear();
  });

  it("writes a positive integer latency_ms even for sub-ms calls", async () => {
    // performance.now() reading taken "now" — latency is essentially zero.
    const startedAt = performance.now();
    await recordInvocation(
      {
        toolName: "test_tool",
        arguments: {},
        caller: "test",
        userId: null,
        apiKeyId: null,
      },
      { startedAt, calledAtIso: new Date().toISOString() },
      { success: true, errorMessage: null, resultSummary: {} },
    );
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const params = mockExecuteQuery.mock.calls[0][1] as unknown[];
    const latencyMs = params[3] as number;
    expect(Number.isInteger(latencyMs)).toBe(true);
    expect(latencyMs).toBeGreaterThanOrEqual(1);
  });

  it("rounds fractional perf-now deltas to integer ms", async () => {
    // Past perf-mark so the delta is comfortably > 1ms after rounding.
    const startedAt = performance.now() - 12.7;
    await recordInvocation(
      {
        toolName: "test_tool",
        arguments: {},
        caller: "test",
        userId: null,
        apiKeyId: null,
      },
      { startedAt, calledAtIso: new Date().toISOString() },
      { success: true, errorMessage: null, resultSummary: {} },
    );
    const params = mockExecuteQuery.mock.calls[0][1] as unknown[];
    const latencyMs = params[3] as number;
    expect(Number.isInteger(latencyMs)).toBe(true);
    expect(latencyMs).toBeGreaterThanOrEqual(12);
  });

  it("uses the provided calledAtIso for the called_at column", async () => {
    const calledAtIso = "2026-05-27T12:34:56.789Z";
    await recordInvocation(
      {
        toolName: "test_tool",
        arguments: {},
        caller: "test",
        userId: null,
        apiKeyId: null,
      },
      { startedAt: performance.now(), calledAtIso },
      { success: true, errorMessage: null, resultSummary: {} },
    );
    const params = mockExecuteQuery.mock.calls[0][1] as unknown[];
    expect(params[1]).toBe(calledAtIso);
  });
});

function persistedJson(columnIndex: number): string {
  const queryParams: unknown = mockExecuteQuery.mock.calls.at(-1)?.[1];
  if (!Array.isArray(queryParams))
    throw new Error("Missing invocation parameters");
  const serialized: unknown = queryParams[columnIndex];
  if (typeof serialized !== "string")
    throw new Error("Missing serialized invocation field");
  return serialized;
}

async function recordTelemetry(
  args: Record<string, unknown>,
  resultSummary: Record<string, unknown> = {},
): Promise<void> {
  await recordInvocation(
    {
      toolName: "test_tool",
      arguments: args,
      caller: "test",
      userId: null,
      apiKeyId: null,
    },
    { startedAt: performance.now(), calledAtIso: new Date().toISOString() },
    { success: true, errorMessage: null, resultSummary },
  );
}

describe("recordInvocation credential redaction", () => {
  beforeEach(() => {
    mockExecuteQuery.mockClear();
  });

  it("removes synthetic probe secrets and nested credentials without changing source arguments", async () => {
    const args = {
      _meta: {
        internalSecret: "probe-secret-value",
        caller: "synthetic-probe",
        API_KEY: "api-key-value",
        nested: [
          {
            AUTHKEY: "auth-key-value",
            _ApiKey: "legacy-api-value",
            _AuthKey: "legacy-auth-value",
          },
        ],
      },
      configuration: {
        databasePassword: "database-password-value",
        Authorization: "Bearer authorization-value",
        clientCredentials: { username: "credential-user-value" },
        nested: [{ connection_secret: "connection-secret-value" }],
      },
      ingredients: ["tomato", "basil"],
    };

    await recordTelemetry(args);

    const stored = persistedJson(8);
    expect(JSON.parse(stored)).toEqual({
      _meta: {
        internalSecret: "[redacted]",
        caller: "synthetic-probe",
        API_KEY: "[redacted]",
        nested: [
          {
            AUTHKEY: "[redacted]",
            _ApiKey: "[redacted]",
            _AuthKey: "[redacted]",
          },
        ],
      },
      configuration: {
        databasePassword: "[redacted]",
        Authorization: "[redacted]",
        clientCredentials: "[redacted]",
        nested: [{ connection_secret: "[redacted]" }],
      },
      ingredients: ["tomato", "basil"],
    });
    for (const credential of [
      "probe-secret-value",
      "api-key-value",
      "auth-key-value",
      "legacy-api-value",
      "legacy-auth-value",
      "database-password-value",
      "authorization-value",
      "credential-user-value",
      "connection-secret-value",
    ]) {
      expect(stored).not.toContain(credential);
    }
    expect(args._meta.internalSecret).toBe("probe-secret-value");
    expect(args.configuration.nested[0].connection_secret).toBe(
      "connection-secret-value",
    );
  });

  it("redacts authentication tokens while retaining trade asset names and counts", async () => {
    await recordTelemetry({
      token: "session-token-value",
      access_token: "access-token-value",
      RefreshToken: "refresh-token-value",
      nested: [
        {
          csrfToken: "csrf-token-value",
          giveToken: "Spirit",
          wantToken: "Matter",
        },
      ],
      giveToken: "Essence",
      wantToken: "Substance",
      tokenCount: 12,
      giveAmount: 2.5,
    });

    expect(JSON.parse(persistedJson(8))).toEqual({
      token: "[redacted]",
      access_token: "[redacted]",
      RefreshToken: "[redacted]",
      nested: [
        { csrfToken: "[redacted]", giveToken: "Spirit", wantToken: "Matter" },
      ],
      giveToken: "Essence",
      wantToken: "Substance",
      tokenCount: 12,
      giveAmount: 2.5,
    });
  });

  it("applies the same redaction to result summaries and preserves correlation IDs", async () => {
    await recordTelemetry(
      {},
      {
        correlationId: "request-123",
        component: [
          { INTERNAL_SECRET: "summary-secret-value", resultCount: 3 },
        ],
      },
    );

    const stored = persistedJson(9);
    expect(JSON.parse(stored)).toEqual({
      correlationId: "request-123",
      component: [{ INTERNAL_SECRET: "[redacted]", resultCount: 3 }],
    });
    expect(stored).not.toContain("summary-secret-value");
  });

  it("omits reflection and review bodies from persisted arguments", async () => {
    await recordTelemetry({
      recipeId: "recipe-1",
      reflection: "private-culinary-critique",
      nested: [{ REVIEW: "private-review-body" }],
    });

    const stored = persistedJson(8);
    expect(JSON.parse(stored)).toEqual({
      recipeId: "recipe-1",
      reflection: "[redacted]",
      nested: [{ REVIEW: "[redacted]" }],
    });
    expect(stored).not.toContain("private-culinary-critique");
    expect(stored).not.toContain("private-review-body");
  });

  it("bounds traversal of excessive nesting and cyclic arguments", async () => {
    const nested: Record<string, unknown> = { label: "root" };
    let cursor = nested;
    for (let depth = 0; depth < 100; depth++) {
      const child: Record<string, unknown> = {};
      cursor.child = child;
      cursor = child;
    }
    cursor.password = "deep-password-value";
    const cyclic: Record<string, unknown> = { label: "cycle" };
    cyclic.self = cyclic;

    await recordTelemetry({ nested, cyclic });

    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    const stored = persistedJson(8);
    expect(stored).toContain("[redacted: depth limit]");
    expect(stored).not.toContain("deep-password-value");
    expect(stored.length).toBeLessThan(1_000);
  });
});

describe("recordInvocation shutdown drain", () => {
  beforeEach(() => {
    mockExecuteQuery.mockClear();
  });

  it("waits for an in-flight database write to finish", async () => {
    let releaseWrite = () => {};
    const blocked = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    mockExecuteQuery.mockImplementationOnce(async () => {
      await blocked;
      return { rows: [] };
    });
    const write = recordTelemetry({});
    let drained = false;
    const drain = drainMcpInvocations().then(() => {
      drained = true;
    });

    try {
      await Promise.resolve();
      expect(drained).toBe(false);
      releaseWrite();
      await write;
      await drain;
      expect(drained).toBe(true);
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    } finally {
      releaseWrite();
      await write;
      await drain;
    }
  });

  it("ends the drain at its deadline even if a database write remains blocked", async () => {
    jest.useFakeTimers();
    let releaseWrite = () => {};
    const blocked = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    mockExecuteQuery.mockImplementationOnce(async () => {
      await blocked;
      return { rows: [] };
    });
    const write = recordTelemetry({});
    let drained = false;
    const drain = drainMcpInvocations(50).then(() => {
      drained = true;
    });

    try {
      await jest.advanceTimersByTimeAsync(49);
      expect(drained).toBe(false);
      await jest.advanceTimersByTimeAsync(1);
      await drain;
      expect(drained).toBe(true);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      releaseWrite();
      await write;
      jest.useRealTimers();
    }
  });

  it("respects DATABASE_URL changes after resolving the database module", async () => {
    const configuredUrl = process.env.DATABASE_URL;
    try {
      delete process.env.DATABASE_URL;
      await recordTelemetry({});
      expect(mockExecuteQuery).not.toHaveBeenCalled();
      process.env.DATABASE_URL = "postgresql://test/test";
      await recordTelemetry({});
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    } finally {
      if (configuredUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = configuredUrl;
    }
  });
});
