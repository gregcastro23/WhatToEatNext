/**
 * `creditMultipleTokens` is now a thin adapter over
 * `creditMultipleTokensDetailed`. Thirteen call sites and their existing suites
 * still depend on its old `TokenBalances | null` contract, so the mapping is
 * the safety property that lets the honest result be introduced without
 * touching any of them.
 *
 * The historical contract, restated:
 *   a write that landed        → balances
 *   an idempotency replay      → balances (NEVER null — this is the whole
 *                                misunderstanding the grant route inherited)
 *   the daily-yield 23505 race → null
 *   a rolled-back transaction  → null
 *
 * If any row of that table changes, callers such as DailyYieldService,
 * sync-credit, claim-onchain and the recipe-mint route change behaviour
 * silently. That is what this file exists to prevent.
 */
import { tokenEconomy, type CreditResult } from "@/services/TokenEconomyService";

const USER_ID = "0198f3c1-2f4a-7c11-9e33-abcdef012345";
const CREDITS = [{ tokenType: "Spirit" as const, amount: 5 }];
const BALANCES = { spirit: 5, essence: 0, matter: 0, substance: 0 };

let detailed: jest.SpyInstance;

beforeEach(() => {
  detailed = jest.spyOn(tokenEconomy, "creditMultipleTokensDetailed");
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function adapt(outcome: CreditResult) {
  detailed.mockResolvedValue(outcome);
  return tokenEconomy.creditMultipleTokens(USER_ID, CREDITS, "admin");
}

describe("creditMultipleTokens adapter — preserves the legacy contract", () => {
  it("returns balances when the credit was written", async () => {
    await expect(
      adapt({ status: "credited", balances: BALANCES, written: 1, requested: 1 }),
    ).resolves.toEqual(BALANCES);
  });

  it("returns balances — not null — for an idempotency replay", async () => {
    await expect(
      adapt({ status: "replayed", balances: BALANCES }),
    ).resolves.toEqual(BALANCES);
  });

  it("falls back to getBalances when a replay could not read the balance", async () => {
    // The old code called getBalances here, whose in-memory fallback is the
    // reason this method never returned null for a replay. Callers such as
    // sync-credit branch on `!result`, so a null leaking in would turn a
    // replay into a 409 that means something else.
    const fallback = { spirit: 1, essence: 2, matter: 3, substance: 4 };
    const getBalances = jest
      .spyOn(tokenEconomy, "getBalances")
      .mockResolvedValue(fallback);

    await expect(adapt({ status: "replayed", balances: null })).resolves.toEqual(
      fallback,
    );
    expect(getBalances).toHaveBeenCalledWith(USER_ID);
  });

  it("returns null for the daily-yield uniqueness race", async () => {
    await expect(
      adapt({ status: "already_applied", balances: null }),
    ).resolves.toBeNull();
  });

  it("returns null when the transaction rolled back", async () => {
    await expect(
      adapt({
        status: "failed",
        code: "40001",
        constraint: null,
        message: "serialization failure",
      }),
    ).resolves.toBeNull();
  });
});
