/**
 * @jest-environment node
 *
 * Tests for AgentEconomyActionService:
 * - Sufficient balance debit.
 * - Auto-swap execution via Swapping Bridge at live EEI parity.
 * - Rejection with detailed shortfall and prices when total portfolio is short.
 * - Idempotency deduplication without double-charging.
 * - Accurate EconomyReceipt generation.
 */

import {
  agentEconomyActionService,
} from "@/services/agentEconomyActionService";
import {
  RECIPE_BRANCH_COST,
  RECIPE_REFLECTION_COST,
  type ESMSAmounts,
} from "@/types/economy";

describe("AgentEconomyActionService", () => {
  beforeEach(() => {
    agentEconomyActionService.resetInMemory();
  });

  it("debits directly when balances are sufficient on all axes", async () => {
    const userId = "test-agent-sufficient-1";
    const initial: ESMSAmounts = { spirit: 2.0, essence: 2.0, matter: 2.0, substance: 2.0 };
    agentEconomyActionService.seedInMemoryBalance(userId, initial);

    const result = await agentEconomyActionService.debitActionInTx({
      userId,
      costs: RECIPE_BRANCH_COST, // 0.5 of each
      sourceType: "recipe_branch",
      description: "Test recipe branch",
      idempotencyKey: "test-key-1",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.receipt.charged).toBe(true);
    expect(result.receipt.swapsExecuted).toBe(0);
    expect(result.receipt.costBasket).toEqual(RECIPE_BRANCH_COST);
    expect(result.receipt.remainingBalances).toEqual({
      spirit: 1.5,
      essence: 1.5,
      matter: 1.5,
      substance: 1.5,
    });
  });

  it("auto-swaps surplus tokens at live EEI parity when short on some axes", async () => {
    const userId = "test-agent-swap-1";
    // Short on Spirit, Essence, Substance, but large surplus on Matter
    const initial: ESMSAmounts = { spirit: 0, essence: 0, matter: 10.0, substance: 0 };
    agentEconomyActionService.seedInMemoryBalance(userId, initial);

    const result = await agentEconomyActionService.debitActionInTx({
      userId,
      costs: RECIPE_REFLECTION_COST, // 0.1 of each = 0.4 total
      sourceType: "recipe_reflection",
      description: "Test reflection with auto-swap",
      autoSwap: true,
      idempotencyKey: "test-key-swap",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.receipt.charged).toBe(true);
    expect(result.receipt.swapsExecuted).toBeGreaterThan(0);
    expect(result.receipt.remainingBalances.matter).toBeLessThan(10.0);
  });

  it("returns insufficient_funds with shortfall and prices when total portfolio cannot cover cost", async () => {
    const userId = "test-agent-poor-1";
    // Total value 0.04 is less than 0.40 reflection cost
    const initial: ESMSAmounts = { spirit: 0.01, essence: 0.01, matter: 0.01, substance: 0.01 };
    agentEconomyActionService.seedInMemoryBalance(userId, initial);

    const result = await agentEconomyActionService.debitActionInTx({
      userId,
      costs: RECIPE_REFLECTION_COST,
      sourceType: "recipe_reflection",
      description: "Test underfunded reflection",
      autoSwap: true,
      idempotencyKey: "test-key-poor",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.reason).toBe("insufficient_funds");
    expect(result.details.shortfall).toBeGreaterThan(0);
    expect(result.details.deficits).toBeDefined();
    expect(result.details.prices).toBeDefined();
    expect(result.details.currentBalances).toEqual(initial);
  });

  it("returns deduplicated receipt without re-charging on identical idempotencyKey", async () => {
    const userId = "test-agent-idem-1";
    const initial: ESMSAmounts = { spirit: 5.0, essence: 5.0, matter: 5.0, substance: 5.0 };
    agentEconomyActionService.seedInMemoryBalance(userId, initial);

    const first = await agentEconomyActionService.debitActionInTx({
      userId,
      costs: RECIPE_BRANCH_COST,
      sourceType: "recipe_branch",
      description: "Branch idempotency run 1",
      idempotencyKey: "idem-branch-123",
    });

    expect(first.success).toBe(true);
    if (!first.success) return;
    expect(first.receipt.charged).toBe(true);
    expect(first.receipt.remainingBalances.spirit).toBe(4.5);

    // Replay with identical idempotencyKey
    const replay = await agentEconomyActionService.debitActionInTx({
      userId,
      costs: RECIPE_BRANCH_COST,
      sourceType: "recipe_branch",
      description: "Branch idempotency run 2",
      idempotencyKey: "idem-branch-123",
    });

    expect(replay.success).toBe(true);
    if (!replay.success) return;
    expect(replay.receipt.charged).toBe(false);
    expect(replay.receipt.deduplicated).toBe(true);
    // Balance must not have been deducted again
    expect(replay.receipt.remainingBalances.spirit).toBe(4.5);
  });

  it("refuses without auto-swap when autoSwap is explicitly false", async () => {
    const userId = "test-agent-no-swap-1";
    const initial: ESMSAmounts = { spirit: 0, essence: 10.0, matter: 10.0, substance: 10.0 };
    agentEconomyActionService.seedInMemoryBalance(userId, initial);

    const result = await agentEconomyActionService.debitActionInTx({
      userId,
      costs: RECIPE_REFLECTION_COST,
      sourceType: "recipe_reflection",
      description: "Test no-swap refusal",
      autoSwap: false,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.reason).toBe("insufficient_funds");
  });
});
