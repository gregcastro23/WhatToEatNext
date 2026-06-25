/**
 * @jest-environment node
 *
 * Tests for tokenEconomy.grantSignupBonus — the resilient welcome-grant path.
 *
 * Why this exists: creditMultipleTokens swallows DB errors and returns `null`
 * (it never throws), so the previous sign-in caller's try/catch was dead code
 * and a transient blip dropped a new user's grant silently. grantSignupBonus
 * treats `null` as failure, retries (the grant is idempotent, so a replay can
 * never double-credit), and reports a hard failure instead of staying silent.
 */

import { tokenEconomy } from "@/services/TokenEconomyService";
import type { TokenBalances } from "@/types/economy";

const FAKE_BALANCES = {} as TokenBalances; // truthy => "grant applied"
const USER = "11111111-2222-3333-4444-555555555555";

describe("tokenEconomy.grantSignupBonus", () => {
  let credit: jest.SpyInstance;

  beforeEach(() => {
    credit = jest.spyOn(tokenEconomy, "creditMultipleTokens");
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("grants 15 of each ESMS token under the per-user idempotency key and returns true", async () => {
    credit.mockResolvedValue(FAKE_BALANCES);

    const ok = await tokenEconomy.grantSignupBonus(USER);

    expect(ok).toBe(true);
    expect(credit).toHaveBeenCalledTimes(1);
    expect(credit).toHaveBeenCalledWith(
      USER,
      expect.arrayContaining([
        { tokenType: "Spirit", amount: 15 },
        { tokenType: "Essence", amount: 15 },
        { tokenType: "Matter", amount: 15 },
        { tokenType: "Substance", amount: 15 },
      ]),
      "signup_grant",
      expect.objectContaining({ idempotencyKey: `signup_grant:${USER}` }),
    );
  });

  it("retries when a credit attempt returns null, then succeeds", async () => {
    credit
      .mockResolvedValueOnce(null) // transient blip
      .mockResolvedValueOnce(FAKE_BALANCES); // retry succeeds

    const ok = await tokenEconomy.grantSignupBonus(USER);

    expect(ok).toBe(true);
    expect(credit).toHaveBeenCalledTimes(2);
  });

  it("returns false after exhausting retries when every attempt fails", async () => {
    credit.mockResolvedValue(null);

    const ok = await tokenEconomy.grantSignupBonus(USER);

    expect(ok).toBe(false);
    expect(credit).toHaveBeenCalledTimes(3); // bounded, not infinite
  });
});
