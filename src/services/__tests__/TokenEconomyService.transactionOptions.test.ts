/**
 * @jest-environment node
 */

delete process.env.DATABASE_URL;

import { tokenEconomy } from "@/services/TokenEconomyService";
import { EMPTY_BALANCES } from "@/types/economy";

describe("TokenEconomyService creditMultipleTokens options passing", () => {
  let creditSpy: jest.SpyInstance;

  beforeEach(() => {
    creditSpy = jest.spyOn(tokenEconomy, "creditTokens").mockResolvedValue({
      ...EMPTY_BALANCES,
      spirit: 10,
      essence: 10,
      matter: 10,
      substance: 10,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("omits undefined fields when passing opts to creditTokens", async () => {
    await tokenEconomy.creditMultipleTokens(
      "user-123",
      [{ tokenType: "Spirit", amount: 5 }],
      "daily_yield",
      {
        idempotencyKey: "test-idem",
      },
    );

    expect(creditSpy).toHaveBeenCalledTimes(1);
    const passedOpts = creditSpy.mock.calls[0]?.[4];
    expect(passedOpts).toBeDefined();
    expect(passedOpts.idempotencyKey).toBe("test-idem:Spirit");
    expect("sourceId" in passedOpts).toBe(false);
    expect("description" in passedOpts).toBe(false);
    expect(typeof passedOpts.transactionGroupId).toBe("string");
  });

  it("passes defined sourceId and description when provided", async () => {
    await tokenEconomy.creditMultipleTokens(
      "user-123",
      [{ tokenType: "Spirit", amount: 5 }],
      "daily_yield",
      {
        sourceId: "source-abc",
        description: "daily bonus",
      },
    );

    expect(creditSpy).toHaveBeenCalledTimes(1);
    const passedOpts = creditSpy.mock.calls[0]?.[4];
    expect(passedOpts).toBeDefined();
    expect(passedOpts.sourceId).toBe("source-abc");
    expect(passedOpts.description).toBe("daily bonus");
    expect("idempotencyKey" in passedOpts).toBe(false);
  });
});
