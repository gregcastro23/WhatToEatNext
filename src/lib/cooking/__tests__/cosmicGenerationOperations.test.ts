/** @jest-environment node */
import {
  COSMIC_GENERATION_STALE_LOCK_SECONDS,
  claimCosmicGenerationOperation,
  computeCosmicRequestFingerprint,
  generateCosmicRecipeEntry,
  refundSpirit,
} from "@/app/actions/generateCosmicRecipe";

const mockExecuteQuery = jest.fn();
const mockCreditMultipleTokensDetailed = jest.fn();

jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    creditMultipleTokensDetailed: (...args: unknown[]) =>
      mockCreditMultipleTokensDetailed(...args),
  },
}));

describe("Phase 45 Follow-Through — Durable Cosmic Generation Operations", () => {
  beforeEach(() => {
    mockExecuteQuery.mockReset();
    mockCreditMultipleTokensDetailed.mockReset();
  });

  it("computes deterministic request fingerprints insensitive to ingredient ordering and casing", () => {
    const fp1 = computeCosmicRequestFingerprint({
      prompt: " Lunar Saffron Risotto ",
      diet: "Vegetarian",
      preferredCuisine: "Italian",
      ingredientsMain: ["Saffron", "Arborio Rice"],
    });
    const fp2 = computeCosmicRequestFingerprint({
      prompt: "Lunar Saffron Risotto",
      diet: "vegetarian",
      preferredCuisine: "italian",
      ingredientsMain: ["arborio rice", "saffron"],
    });
    expect(fp1).toBe(fp2);
    expect(fp1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("claims a fresh operation with a 90s stale-lock window and completes it", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({ rows: [] }) // SELECT existing
      .mockResolvedValueOnce({
        rows: [
          {
            operation_key: "op-key-1",
            user_id: "user-1",
            status: "claimed",
            request_fingerprint: "abc",
            recipe_id: null,
            debit_tx_id: null,
            refund_tx_id: null,
            error_message: null,
            response_payload: null,
            created_at: "2026-11-10T12:00:00.000Z",
            updated_at: "2026-11-10T12:00:00.000Z",
            expires_at: "2026-11-10T12:01:30.000Z",
          },
        ],
      }) // INSERT
      .mockResolvedValueOnce({ rows: [] }) // recordCosmicOperationDebit
      .mockResolvedValueOnce({ rows: [] }); // completeCosmicGenerationOperation

    const outcome = await generateCosmicRecipeEntry(
      {
        userId: "user-1",
        operationKey: "op-key-1",
        prompt: "Solar citrus bowl",
        debitTxId: "debit-tx-1",
        debitCosts: { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 },
      },
      async () => ({ id: "recipe-solar-1", title: "Solar Citrus Bowl" }),
    );

    expect(outcome.status).toBe("completed");
    expect(outcome.recipe?.id).toBe("recipe-solar-1");
    expect(outcome.refunded).toBe(false);
    expect(mockExecuteQuery.mock.calls[1]?.[1]?.[3]).toBe(
      COSMIC_GENERATION_STALE_LOCK_SECONDS,
    );
  });

  it("recovers a stale lock (>90s expired) and automatically calls refundSpirit on generation failure", async () => {
    const fingerprint = computeCosmicRequestFingerprint({
      prompt: "Failed cosmic stew",
      diet: "vegan",
    });

    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            operation_key: "op-stale-1",
            user_id: "user-1",
            status: "generating",
            request_fingerprint: fingerprint,
            recipe_id: null,
            debit_tx_id: "debit-stale-99",
            refund_tx_id: null,
            error_message: null,
            response_payload: null,
            created_at: "2026-11-10T12:00:00.000Z",
            updated_at: "2026-11-10T12:00:00.000Z",
            expires_at: "2026-11-10T12:01:30.000Z",
            recovered_stale: true,
          },
        ],
      }) // SELECT existing (expired)
      .mockResolvedValueOnce({
        rows: [
          {
            operation_key: "op-stale-1",
            user_id: "user-1",
            status: "claimed",
            request_fingerprint: fingerprint,
            recipe_id: null,
            debit_tx_id: "debit-stale-99",
            refund_tx_id: null,
            error_message: null,
            response_payload: null,
            created_at: "2026-11-10T12:00:00.000Z",
            updated_at: "2026-11-10T12:02:00.000Z",
            expires_at: "2026-11-10T12:03:30.000Z",
          },
        ],
      }) // UPDATE reclaim
      .mockResolvedValueOnce({ rows: [] }) // recordCosmicOperationDebit
      .mockResolvedValueOnce({ rows: [] }); // failCosmicGenerationOperation

    mockCreditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "credited",
      written: 4,
      requested: 4,
      balances: null,
    });

    const outcome = await generateCosmicRecipeEntry(
      {
        userId: "user-1",
        operationKey: "op-stale-1",
        prompt: "Failed cosmic stew",
        diet: "vegan",
        debitCosts: { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 },
      },
      async () => {
        throw new Error("Upstream planetary agents timeout");
      },
    );

    expect(outcome.status).toBe("failed");
    expect(outcome.recoveredStaleLock).toBe(true);
    expect(outcome.refunded).toBe(true);
    expect(outcome.refundTxId).toBe("cosmic_recipe_refund:debit-stale-99");
    expect(mockCreditMultipleTokensDetailed).toHaveBeenCalledTimes(1);
  });

  it("rejects reused operation keys when the request fingerprint differs", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          operation_key: "op-conflict",
          user_id: "user-1",
          status: "completed",
          request_fingerprint: "0".repeat(64),
          recipe_id: "recipe-1",
          debit_tx_id: "tx-1",
          refund_tx_id: null,
          error_message: null,
          response_payload: null,
          created_at: "2026-11-10T12:00:00.000Z",
          updated_at: "2026-11-10T12:00:10.000Z",
          expires_at: "2026-11-10T12:01:30.000Z",
        },
      ],
    });

    const claim = await claimCosmicGenerationOperation({
      userId: "user-1",
      operationKey: "op-conflict",
      requestFingerprint: "f".repeat(64),
    });
    expect(claim.outcome).toBe("fingerprint_mismatch");
  });

  it("refundSpirit credits only positive axes with a deterministic idempotency key", async () => {
    mockCreditMultipleTokensDetailed.mockResolvedValueOnce({
      status: "replayed",
      written: 0,
      requested: 1,
      balances: null,
    });

    const res = await refundSpirit({
      userId: "user-2",
      operationKey: "op-2",
      debitTxId: "grp-99",
      amountSpirit: 5,
    });

    expect(res).toEqual({
      refunded: true,
      refundTxId: "cosmic_recipe_refund:grp-99",
    });
    expect(mockCreditMultipleTokensDetailed).toHaveBeenCalledWith(
      "user-2",
      [{ tokenType: "Spirit", amount: 5 }],
      "cosmic_recipe_refund",
      expect.objectContaining({
        sourceId: "grp-99",
        idempotencyKey: "cosmic_recipe_refund:grp-99",
      }),
    );
  });
});

