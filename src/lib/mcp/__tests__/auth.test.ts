/** @jest-environment node */

import { createHash } from "node:crypto";
import { Client, type PoolClient } from "pg";
import type { executeQuery, withTransaction } from "@/lib/database/connection";
import type { ResolvedCaller } from "@/lib/mcp/auth";
import type {
  agentEconomyActionService,
  DebitActionResult,
} from "@/services/agentEconomyActionService";
import type { ESMSAmounts } from "@/types/economy";

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
  withTransaction: jest.fn(),
}));

jest.mock("@/services/agentEconomyActionService", () => ({
  agentEconomyActionService: { debitActionInTx: jest.fn() },
}));

let mockQuery: jest.MockedFunction<typeof executeQuery>;
let mockTransaction: jest.MockedFunction<typeof withTransaction>;
let mockDebit: jest.MockedFunction<
  typeof agentEconomyActionService.debitActionInTx
>;
let resolveCaller: typeof import("@/lib/mcp/auth").resolveCaller;
let debitForTool: typeof import("@/lib/mcp/auth").debitForTool;
let idempotencyLedgerKey: typeof import("@/lib/mcp/auth").idempotencyLedgerKey;
let requestFingerprint: typeof import("@/lib/mcp/auth").requestFingerprint;
// Construct an unconnected client to exercise identity handoff without a DB.
const transactionClient: PoolClient = Object.assign(new Client(), {
  release: jest.fn(),
});
const transactionEvents: string[] = [];
let transactionError: unknown;

const environmentKeys = [
  "DATABASE_URL",
  "MCP_USER_API_KEY",
  "ALCHM_MCP_USER_API_KEY",
  "INTERNAL_API_SECRET",
  "SYNTHETIC_PROBE_USER_ID",
];
const originalEnvironment = new Map<string, string | undefined>();
for (const key of environmentKeys)
  originalEnvironment.set(key, process.env[key]);

const recipeCost: ESMSAmounts = {
  spirit: 2.5,
  essence: 2.5,
  matter: 2.5,
  substance: 2.5,
};
const reflectionCost: ESMSAmounts = {
  spirit: 0.1,
  essence: 0.1,
  matter: 0.1,
  substance: 0.1,
};
const remainingBalances: ESMSAmounts = {
  spirit: 10,
  essence: 10,
  matter: 10,
  substance: 10,
};
const authenticatedCaller: ResolvedCaller = {
  userId: "user-1",
  apiKeyId: "key-1",
  caller: "planetary-agents",
  isSynthetic: false,
  rateLimitTier: "alchemist",
};

function chargedResult(costBasket: ESMSAmounts): DebitActionResult {
  return {
    success: true,
    receipt: {
      charged: true,
      transactionGroupId: "transaction-1",
      costBasket,
      swapsExecuted: 0,
      remainingBalances,
    },
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  for (const key of environmentKeys) delete process.env[key];
  process.env.DATABASE_URL = "postgresql://test/test";
  transactionEvents.length = 0;
  transactionError = undefined;
  // Jest resets its module registry between tests. Import the callers and their
  // dynamically loaded dependencies together so every test uses the same mocks.
  const database = await import("@/lib/database/connection");
  const economy = await import("@/services/agentEconomyActionService");
  const auth = await import("@/lib/mcp/auth");
  mockQuery = jest.mocked(database.executeQuery);
  mockTransaction = jest.mocked(database.withTransaction);
  mockDebit = jest.mocked(economy.agentEconomyActionService.debitActionInTx);
  resolveCaller = auth.resolveCaller;
  debitForTool = auth.debitForTool;
  idempotencyLedgerKey = auth.idempotencyLedgerKey;
  requestFingerprint = auth.requestFingerprint;
  mockQuery.mockResolvedValue({
    rows: [{ id: "key-1", user_id: "user-1", rate_limit_tier: "alchemist" }],
    rowCount: 1,
    command: "UPDATE",
    oid: 0,
    fields: [],
  });
  mockTransaction.mockImplementation(
    async <T>(operation: (client: PoolClient) => Promise<T>): Promise<T> => {
      transactionEvents.push("BEGIN");
      try {
        const result = await operation(transactionClient);
        transactionEvents.push("COMMIT");
        return result;
      } catch (error) {
        transactionError = error;
        transactionEvents.push("ROLLBACK");
        throw error;
      }
    },
  );
  mockDebit.mockImplementation(async ({ costs }) => chargedResult(costs));
});

afterAll(() => {
  for (const [key, originalValue] of originalEnvironment) {
    if (originalValue === undefined) delete process.env[key];
    else process.env[key] = originalValue;
  }
});

describe("MCP caller authentication", () => {
  const credentialArguments: Array<{
    label: string;
    args: Record<string, unknown>;
  }> = [
    {
      label: "_meta.apiKey",
      args: { _meta: { apiKey: "caller-key", caller: "bridge" } },
    },
    {
      label: "_meta.authKey",
      args: { _meta: { authKey: "caller-key", caller: "bridge" } },
    },
    {
      label: "_apiKey",
      args: { _apiKey: "caller-key", _meta: { caller: "bridge" } },
    },
    {
      label: "_authKey",
      args: { _authKey: "caller-key", _meta: { caller: "bridge" } },
    },
  ];

  it.each(credentialArguments)(
    "resolves $label using a hash and active/expiry predicates",
    async ({ args }) => {
      process.env.MCP_USER_API_KEY = "lower-priority-env-key";

      await expect(resolveCaller(args)).resolves.toEqual({
        ...authenticatedCaller,
        caller: "bridge",
      });

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("AND is_active = true"),
        [createHash("sha256").update("caller-key").digest("hex")],
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("expires_at IS NULL OR expires_at > NOW()"),
        expect.any(Array),
      );
      expect(JSON.stringify(mockQuery.mock.calls)).not.toContain("caller-key");
    },
  );

  it.each(["MCP_USER_API_KEY", "ALCHM_MCP_USER_API_KEY"])(
    "resolves the %s environment credential",
    async (key) => {
      process.env[key] = "configured-key";

      await expect(resolveCaller({})).resolves.toEqual({
        ...authenticatedCaller,
        caller: "unknown",
      });
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
        createHash("sha256").update("configured-key").digest("hex"),
      ]);
    },
  );

  it("rejects an invalid explicit key instead of using a configured environment key", async () => {
    process.env.MCP_USER_API_KEY = "valid-env-key";
    mockQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
      command: "UPDATE",
      oid: 0,
      fields: [],
    });

    await expect(
      resolveCaller({ _meta: { apiKey: "invalid-key" } }),
    ).resolves.toMatchObject({
      userId: null,
      apiKeyId: null,
      isSynthetic: false,
      authError: "INVALID_KEY",
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
      createHash("sha256").update("invalid-key").digest("hex"),
    ]);
  });

  it("fails explicit credentials as unavailable when the DB is absent, even after a successful lookup", async () => {
    await resolveCaller({ _meta: { apiKey: "configured-key" } });
    mockQuery.mockClear();
    delete process.env.DATABASE_URL;

    await expect(
      resolveCaller({ _meta: { apiKey: "configured-key" } }),
    ).resolves.toMatchObject({
      userId: null,
      authError: "UNAVAILABLE",
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("keeps callers without credentials anonymous when the DB is absent", async () => {
    delete process.env.DATABASE_URL;

    await expect(
      resolveCaller({ _meta: { caller: "anonymous-client" } }),
    ).resolves.toEqual({
      userId: null,
      apiKeyId: null,
      caller: "anonymous-client",
      isSynthetic: false,
      rateLimitTier: null,
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("requires the configured internal secret to grant synthetic probe identity", async () => {
    delete process.env.DATABASE_URL;
    process.env.INTERNAL_API_SECRET = "probe-secret";
    process.env.SYNTHETIC_PROBE_USER_ID = "probe-user";

    await expect(
      resolveCaller({ _meta: { internalSecret: "probe-secret" } }),
    ).resolves.toEqual({
      userId: "probe-user",
      apiKeyId: null,
      caller: "synthetic-probe",
      isSynthetic: true,
      rateLimitTier: null,
    });
    await expect(
      resolveCaller({ _meta: { internalSecret: "wrong-secret" } }),
    ).resolves.toMatchObject({
      userId: null,
      isSynthetic: false,
    });
    delete process.env.INTERNAL_API_SECRET;
    await expect(
      resolveCaller({ _meta: { internalSecret: "" } }),
    ).resolves.toMatchObject({
      userId: null,
      isSynthetic: false,
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe("MCP transactional billing", () => {
  it.each([
    {
      toolName: "generate_cosmic_recipe",
      cost: recipeCost,
      sourceType: "purchase",
    },
    {
      toolName: "create_evidence_snapshot",
      cost: recipeCost,
      sourceType: "purchase",
    },
    {
      toolName: "submit_recipe_reflection",
      cost: reflectionCost,
      sourceType: "recipe_reflection",
    },
  ])(
    "settles $toolName once with the complete cost basket and auto-swap",
    async ({ toolName, cost, sourceType }) => {
      await expect(
        debitForTool(toolName, authenticatedCaller),
      ).resolves.toEqual({
        applied: true,
        reason: null,
        amounts: cost,
      });

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockDebit).toHaveBeenCalledTimes(1);
      expect(mockDebit).toHaveBeenCalledWith({
        userId: "user-1",
        costs: cost,
        sourceType,
        sourceId: toolName,
        description: `MCP ${toolName} via planetary-agents`,
        autoSwap: true,
        client: transactionClient,
      });
      expect(transactionEvents).toEqual(["BEGIN", "COMMIT"]);
    },
  );

  const refusedDebits: Array<{
    label: string;
    result: DebitActionResult;
    reason: string;
  }> = [
    {
      label: "insufficient balance",
      result: {
        success: false,
        reason: "insufficient_funds",
        details: {
          shortfall: 10,
          deficits: recipeCost,
          currentBalances: remainingBalances,
          prices: null,
        },
      },
      reason: "insufficient-funds",
    },
    {
      label: "service refusal",
      result: { success: false, reason: "error", error: "ledger failed" },
      reason: "debit-failed",
    },
    {
      label: "uncharged receipt",
      result: {
        success: true,
        receipt: {
          charged: false,
          transactionGroupId: null,
          costBasket: recipeCost,
          swapsExecuted: 0,
          remainingBalances,
        },
      },
      reason: "debit-failed",
    },
  ];

  it.each(refusedDebits)(
    "throws inside the transaction on $label so earlier legs cannot commit",
    async ({ result, reason }) => {
      mockDebit.mockResolvedValueOnce(result);

      await expect(
        debitForTool("generate_cosmic_recipe", authenticatedCaller),
      ).resolves.toEqual({
        applied: false,
        reason,
        amounts: null,
      });

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockDebit).toHaveBeenCalledTimes(1);
      expect(transactionError).toBeInstanceOf(Error);
      expect(transactionEvents).toEqual(["BEGIN", "ROLLBACK"]);
    },
  );

  it("rolls back a thrown billing outage and reports an unapplied debit", async () => {
    const outage = new Error("billing database disconnected");
    mockDebit.mockRejectedValueOnce(outage);

    await expect(
      debitForTool("create_evidence_snapshot", authenticatedCaller),
    ).resolves.toEqual({
      applied: false,
      reason: "debit-failed",
      amounts: null,
    });
    expect(transactionError).toBe(outage);
    expect(transactionEvents).toEqual(["BEGIN", "ROLLBACK"]);
  });

  it("does not begin billing without a DB or without an authenticated user", async () => {
    await expect(
      debitForTool("generate_cosmic_recipe", {
        ...authenticatedCaller,
        userId: null,
      }),
    ).resolves.toEqual({
      applied: false,
      reason: "anonymous-caller",
      amounts: null,
    });
    delete process.env.DATABASE_URL;
    await expect(
      debitForTool("generate_cosmic_recipe", authenticatedCaller),
    ).resolves.toEqual({
      applied: false,
      reason: "db-unavailable",
      amounts: null,
    });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockDebit).not.toHaveBeenCalled();
  });

  it("exempts synthetic probes and free tools without entering a transaction", async () => {
    await expect(
      debitForTool("create_evidence_snapshot", {
        ...authenticatedCaller,
        isSynthetic: true,
      }),
    ).resolves.toEqual({
      applied: false,
      reason: "synthetic-probe-exempt",
      amounts: null,
    });
    await expect(
      debitForTool("alchemize_ingredients", authenticatedCaller),
    ).resolves.toEqual({
      applied: false,
      reason: "free-tool",
      amounts: null,
    });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockDebit).not.toHaveBeenCalled();
  });
});

describe("MCP idempotent settlement", () => {
  const fingerprint = "f".repeat(32);
  const keyed = { idempotencyKey: "retry-1", fingerprint };
  const ledgerRows = (rows: Array<{ source_id: string | null }>) => ({
    rows,
    rowCount: rows.length,
    command: "SELECT",
    oid: 0,
    fields: [],
  });

  /** Script the lock and the ledger probe; `prior` is what the ledger holds. */
  function scriptLedger(prior: Array<{ source_id: string | null }>): void {
    mockQuery.mockImplementation(async (sql: string) =>
      sql.includes("FROM token_transactions")
        ? ledgerRows(prior)
        : ledgerRows([]),
    );
  }

  it("derives a fixed-length ledger key scoped to account, tool and key", () => {
    const key = idempotencyLedgerKey("user-1", "generate_cosmic_recipe", "k");
    expect(key).toMatch(/^mcp:[0-9a-f]{48}$/);
    expect(idempotencyLedgerKey("user-1", "generate_cosmic_recipe", "k")).toBe(key);
    expect(idempotencyLedgerKey("user-2", "generate_cosmic_recipe", "k")).not.toBe(key);
    expect(idempotencyLedgerKey("user-1", "create_evidence_snapshot", "k")).not.toBe(key);
    expect(idempotencyLedgerKey("user-1", "generate_cosmic_recipe", "k2")).not.toBe(key);
    // LIKE wildcards in a caller key never reach the ledger's prefix probe.
    expect(idempotencyLedgerKey("user-1", "generate_cosmic_recipe", "a_%")).toMatch(
      /^mcp:[0-9a-f]{48}$/,
    );
  });

  it("fingerprints semantic arguments independent of order and transport metadata", () => {
    const base = requestFingerprint("generate_cosmic_recipe", {
      prompt: "soup",
      dietary: ["vegan"],
    });
    expect(base).toMatch(/^[0-9a-f]{32}$/);
    expect(
      requestFingerprint("generate_cosmic_recipe", {
        dietary: ["vegan"],
        prompt: "soup",
        unset: undefined,
        _apiKey: "secret",
        _authKey: "secret",
        _meta: { apiKey: "other", correlationId: "c", idempotencyKey: "k" },
      }),
    ).toBe(base);
    expect(
      requestFingerprint("generate_cosmic_recipe", { prompt: "stew", dietary: ["vegan"] }),
    ).not.toBe(base);
    expect(
      requestFingerprint("create_evidence_snapshot", { prompt: "soup", dietary: ["vegan"] }),
    ).not.toBe(base);
  });

  it("serializes a keyed request, probes the ledger exactly, then charges under the scoped key", async () => {
    scriptLedger([]);
    const ledgerKey = idempotencyLedgerKey("user-1", "generate_cosmic_recipe", "retry-1");

    await expect(
      debitForTool("generate_cosmic_recipe", authenticatedCaller, keyed),
    ).resolves.toEqual({
      applied: true,
      reason: null,
      amounts: recipeCost,
      ledgerKey,
    });

    const [lock, probe] = mockQuery.mock.calls;
    expect(lock?.[0]).toContain("pg_advisory_xact_lock");
    expect(lock?.[1]).toEqual([ledgerKey]);
    expect(lock?.[2]).toEqual({ client: transactionClient });
    expect(probe?.[0]).toContain("idempotency_key = ANY");
    expect(probe?.[1]).toEqual([
      ["Spirit", "Essence", "Matter", "Substance"].map(
        (axis) => `${ledgerKey}:${axis}`,
      ),
    ]);
    expect(mockDebit).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: ledgerKey,
        sourceId: `generate_cosmic_recipe#${fingerprint}`,
        client: transactionClient,
      }),
    );
    expect(transactionEvents).toEqual(["BEGIN", "COMMIT"]);
  });

  it("replays a request the ledger already settled, without charging", async () => {
    scriptLedger([{ source_id: `generate_cosmic_recipe#${fingerprint}` }]);

    await expect(
      debitForTool("generate_cosmic_recipe", authenticatedCaller, keyed),
    ).resolves.toEqual({
      applied: true,
      reason: null,
      amounts: null,
      replayed: true,
      ledgerKey: idempotencyLedgerKey("user-1", "generate_cosmic_recipe", "retry-1"),
    });
    expect(mockDebit).not.toHaveBeenCalled();
    expect(transactionEvents).toEqual(["BEGIN", "COMMIT"]);
  });

  it("refuses a key already used for different arguments", async () => {
    scriptLedger([{ source_id: `generate_cosmic_recipe#${"0".repeat(32)}` }]);

    await expect(
      debitForTool("generate_cosmic_recipe", authenticatedCaller, keyed),
    ).resolves.toEqual({
      applied: false,
      reason: "idempotency-conflict",
      amounts: null,
    });
    expect(mockDebit).not.toHaveBeenCalled();
    expect(transactionEvents).toEqual(["BEGIN", "ROLLBACK"]);
  });

  it("treats a deduplicated service receipt as a replay", async () => {
    scriptLedger([]);
    mockDebit.mockResolvedValueOnce({
      success: true,
      receipt: {
        charged: false,
        deduplicated: true,
        transactionGroupId: "transaction-0",
        costBasket: recipeCost,
        swapsExecuted: 0,
        remainingBalances,
      },
    });

    await expect(
      debitForTool("generate_cosmic_recipe", authenticatedCaller, keyed),
    ).resolves.toMatchObject({ applied: true, replayed: true, amounts: null });
  });

  it("joins a caller's transaction instead of opening its own", async () => {
    await expect(
      debitForTool(
        "submit_recipe_reflection",
        authenticatedCaller,
        { idempotencyKey: null, fingerprint },
        transactionClient,
      ),
    ).resolves.toEqual({ applied: true, reason: null, amounts: reflectionCost });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockDebit).toHaveBeenCalledWith(
      expect.objectContaining({
        client: transactionClient,
        sourceId: "submit_recipe_reflection",
      }),
    );
    expect(mockDebit.mock.calls[0]?.[0]).not.toHaveProperty("idempotencyKey");
  });

  it("leaves a refused settlement in a caller's transaction for the caller to roll back", async () => {
    mockDebit.mockResolvedValueOnce({
      success: false,
      reason: "error",
      error: "ledger failed",
    });
    await expect(
      debitForTool(
        "submit_recipe_reflection",
        authenticatedCaller,
        { idempotencyKey: null, fingerprint },
        transactionClient,
      ),
    ).resolves.toEqual({ applied: false, reason: "debit-failed", amounts: null });
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
