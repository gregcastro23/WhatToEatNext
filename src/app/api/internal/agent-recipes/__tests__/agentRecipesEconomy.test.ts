/**
 * @jest-environment node
 *
 * Tests for POST /api/internal/agent-recipes economy charging:
 * - 200 OK when agent has sufficient ESMS funds.
 * - 402 Insufficient Funds with shortfall and prices when agent is underfunded.
 * - Auto-swap at live EEI parity when agent has surplus on another axis.
 * - Human / seed bypass with skipEconomyCharge: true.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

import { NextRequest } from "next/server";
import { agentEconomyActionService } from "@/services/agentEconomyActionService";
import { RECIPE_BRANCH_COST } from "@/types/economy";
import { POST } from "../route";

const TEST_SYNC_SECRET = "test-sync-secret-xyz";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeRequest(body: unknown, idempotencyKey = "test-key-1"): NextRequest {
  return new NextRequest("http://localhost/api/internal/agent-recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sync-Secret": TEST_SYNC_SECRET,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/internal/agent-recipes — ESMS Economy Integration", () => {
  const origEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...origEnv,
      ALCHM_KITCHEN_SYNC_SECRET: TEST_SYNC_SECRET,
      ASOL_WEBHOOK_SIGNATURES: "shadow",
    };
    mockExecuteQuery.mockReset();
    agentEconomyActionService.resetInMemory();

    // Default mock: webhook_events claim succeeds, recipe insert succeeds
    mockExecuteQuery.mockImplementation((sql: string) => {
      if (sql.includes("INSERT INTO webhook_events")) {
        return Promise.resolve({ rows: [{ id: 101, attempts: 1 }] });
      }
      if (sql.includes("INSERT INTO user_custom_recipes")) {
        return Promise.resolve({
          rows: [{ id: "custom-recipe-uuid-1", created_at: new Date().toISOString() }],
        });
      }
      if (sql.includes("UPDATE webhook_events")) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  afterAll(() => {
    process.env = origEnv;
  });

  it("debits RECIPE_BRANCH_COST and returns 200 with EconomyReceipt when agent has sufficient funds", async () => {
    const userId = "agent-rich-uuid";
    agentEconomyActionService.seedInMemoryBalance(userId, {
      spirit: 2.0,
      essence: 2.0,
      matter: 2.0,
      substance: 2.0,
    });

    const req = makeRequest({
      userId,
      name: "Truffle Risotto Branch",
      source: "agent",
      payload: { ingredients: ["truffle", "arborio rice"] },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data: unknown = await res.json();
    expect(isRecord(data)).toBe(true);
    if (!isRecord(data)) return;

    expect(data.success).toBe(true);
    expect(data.id).toBe("custom-recipe-uuid-1");

    expect(isRecord(data.economy)).toBe(true);
    if (!isRecord(data.economy)) return;

    expect(data.economy.charged).toBe(true);
    expect(data.economy.swapsExecuted).toBe(0);
    expect(data.economy.costBasket).toEqual(RECIPE_BRANCH_COST);

    const remaining = data.economy.remainingBalances;
    expect(isRecord(remaining)).toBe(true);
    if (isRecord(remaining)) {
      expect(remaining.spirit).toBe(1.5);
      expect(remaining.essence).toBe(1.5);
      expect(remaining.matter).toBe(1.5);
      expect(remaining.substance).toBe(1.5);
    }
  });

  it("returns 402 with shortfall and EEI prices when agent has insufficient total portfolio value", async () => {
    const userId = "agent-underfunded-uuid";
    agentEconomyActionService.seedInMemoryBalance(userId, {
      spirit: 0.1,
      essence: 0.1,
      matter: 0.1,
      substance: 0.1,
    }); // Total 0.4 < 2.0 cost

    const req = makeRequest({
      userId,
      name: "Saffron Pasta Branch",
      source: "agent",
      payload: { ingredients: ["saffron", "pasta"] },
    });

    const res = await POST(req);
    expect(res.status).toBe(402);

    const data: unknown = await res.json();
    expect(isRecord(data)).toBe(true);
    if (!isRecord(data)) return;

    expect(data.success).toBe(false);
    expect(data.error).toBe("insufficient_funds");
    expect(data.reason).toBe("insufficient_funds");
    expect(typeof data.shortfall).toBe("number");
    expect(data.costBasket).toEqual(RECIPE_BRANCH_COST);
    expect(isRecord(data.deficits)).toBe(true);
    expect(isRecord(data.prices)).toBe(true);
  });

  it("executes auto-swap at live EEI parity when agent has surplus on another axis", async () => {
    const userId = "agent-swap-branch-uuid";
    // Short on Spirit, Essence, Substance, but 20.0 Matter covers the 2.0 total cost
    agentEconomyActionService.seedInMemoryBalance(userId, {
      spirit: 0,
      essence: 0,
      matter: 20.0,
      substance: 0,
    });

    const req = makeRequest({
      userId,
      name: "Auto-swapped Adaptation",
      source: "agent",
      payload: { ingredients: ["lentils", "cumin"] },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data: unknown = await res.json();
    expect(isRecord(data)).toBe(true);
    if (!isRecord(data)) return;

    expect(data.success).toBe(true);
    expect(isRecord(data.economy)).toBe(true);
    if (!isRecord(data.economy)) return;

    expect(data.economy.charged).toBe(true);
    expect(data.economy.swapsExecuted).toBeGreaterThan(0);
  });

  it("bypasses charging when skipEconomyCharge is true", async () => {
    const userId = "agent-seed-bypass-uuid";
    // 0 balance
    agentEconomyActionService.seedInMemoryBalance(userId, {
      spirit: 0,
      essence: 0,
      matter: 0,
      substance: 0,
    });

    const req = makeRequest({
      userId,
      name: "Seed Script Branch",
      source: "agent",
      payload: { ingredients: ["barley"] },
      skipEconomyCharge: true,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data: unknown = await res.json();
    expect(isRecord(data)).toBe(true);
    if (!isRecord(data)) return;

    expect(data.success).toBe(true);
    expect(isRecord(data.economy)).toBe(true);
    if (isRecord(data.economy)) {
      expect(data.economy.charged).toBe(false);
    }
  });
});
