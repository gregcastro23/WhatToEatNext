/**
 * What a daily-yield claim tells the caller when the credit does NOT land.
 *
 * `claimDailyYield` used to return `DailyYieldResult | null`, and that `null`
 * collapsed two opposite outcomes: "already claimed today" (nothing owed) and
 * "the transaction rolled back" (the day is STILL owed). Both callers read it
 * as the first, so a database fault told the user to return tomorrow and cost
 * them a yield, while the agents cron counted the same fault as
 * `alreadyClaimed` and reported a clean run.
 *
 * These tests pin the three outcomes apart at the service, and the two callers
 * are covered in their own suites.
 */

const hasClaimedToday = jest.fn();
const creditMultipleTokensDetailed = jest.fn();
const getBalances = jest.fn();
const updateDailyClaimTimestamp = jest.fn();
const getStreak = jest.fn();
const recordActivity = jest.fn();

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    hasClaimedToday,
    creditMultipleTokensDetailed,
    getBalances,
    updateDailyClaimTimestamp,
  },
}));

jest.mock("@/services/StreakService", () => ({
  streakService: { getStreak, recordActivity },
}));

jest.mock("@/services/questEventReporter", () => ({
  reportQuestEventBestEffort: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { dailyYieldService } from "@/services/DailyYieldService";

const USER_ID = "55555555-5555-5555-5555-555555555555";
const NATAL = { Sun: "Leo", Moon: "Cancer" };
const BALANCES = { spirit: 10, essence: 10, matter: 10, substance: 10 };
const STREAK = {
  currentStreak: 3,
  longestStreak: 5,
  lastActivityDate: null,
  streakFrozenUntil: null,
  updatedAt: "2026-08-18T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  hasClaimedToday.mockResolvedValue(false);
  getBalances.mockResolvedValue(BALANCES);
  updateDailyClaimTimestamp.mockResolvedValue(undefined);
  getStreak.mockResolvedValue(STREAK);
  recordActivity.mockResolvedValue(STREAK);

  // Upstream of the credit and irrelevant to it — stubbed so these tests
  // exercise the outcome branching rather than the ephemeris cache.
  jest.spyOn(dailyYieldService, "getTodayEphemeris").mockResolvedValue({
    positions: {} as never,
    transitESMS: { Spirit: 5, Essence: 5, Matter: 5, Substance: 5 },
  });
  jest.spyOn(dailyYieldService, "getYieldWeights").mockResolvedValue({
    spirit: 0.25,
    essence: 0.25,
    matter: 0.25,
    substance: 0.25,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("claimDailyYield — the three outcomes", () => {
  it("reports FAILED, not already_claimed, when the transaction rolls back", async () => {
    // The defect: this returned the same `null` as a genuine same-day claim,
    // so the user was told to come back tomorrow for a yield they never got.
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "failed",
      code: "40P01",
      constraint: null,
      message: "deadlock detected",
    });

    const claim = await dailyYieldService.claimDailyYield(USER_ID, NATAL);

    expect(claim.status).toBe("failed");
    if (claim.status !== "failed") throw new Error("unreachable");
    expect(claim.code).toBe("40P01");
    expect(claim.message).toMatch(/deadlock detected/);
    // The day is still owed, so nothing may mark it claimed.
    expect(updateDailyClaimTimestamp).not.toHaveBeenCalled();
    expect(recordActivity).not.toHaveBeenCalled();
  });

  it("reports already_claimed when the pre-check says the day is done", async () => {
    hasClaimedToday.mockResolvedValue(true);

    const claim = await dailyYieldService.claimDailyYield(USER_ID, NATAL);

    expect(claim.status).toBe("already_claimed");
    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();
  });

  it("reports already_claimed when the uniqueness index catches a race", async () => {
    // The application pre-check is a check-then-act SELECT, so two concurrent
    // requests can both pass it. The partial index is what makes the second lose.
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "already_applied",
      balances: null,
    });

    const claim = await dailyYieldService.claimDailyYield(USER_ID, NATAL);

    expect(claim.status).toBe("already_claimed");
  });

  it("re-stamps the claim timestamp on a replay, so the user is not wedged on 409", async () => {
    // A replay means today's key was already credited but the timestamp stamp
    // below it did not land. Without the repair, `hasClaimedToday` stays false,
    // the credit keeps replaying, and the user gets 409 all day with no tokens.
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "replayed",
      balances: BALANCES,
    });

    const claim = await dailyYieldService.claimDailyYield(USER_ID, NATAL);

    expect(claim.status).toBe("already_claimed");
    expect(updateDailyClaimTimestamp).toHaveBeenCalledWith(USER_ID, "main");
  });

  it("reports claimed, with the result, when the credit lands", async () => {
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "credited",
      balances: BALANCES,
      written: 4,
      requested: 4,
    });

    const claim = await dailyYieldService.claimDailyYield(USER_ID, NATAL);

    expect(claim.status).toBe("claimed");
    if (claim.status !== "claimed") throw new Error("unreachable");
    expect(claim.result.newBalances).toEqual(BALANCES);
    expect(claim.result.totalTokens).toBeGreaterThan(0);
    expect(updateDailyClaimTimestamp).toHaveBeenCalledWith(USER_ID, "main");
  });

  it("does not report a zero balance when the balance READ fails", async () => {
    // Preserves the old adapter's behaviour: `balances: null` on a successful
    // credit means the read failed, not that the user holds nothing.
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "credited",
      balances: null,
      written: 4,
      requested: 4,
    });

    const claim = await dailyYieldService.claimDailyYield(USER_ID, NATAL);

    expect(claim.status).toBe("claimed");
    if (claim.status !== "claimed") throw new Error("unreachable");
    expect(claim.result.newBalances).toEqual(BALANCES);
    expect(getBalances).toHaveBeenCalled();
  });

  it("routes the agents site to its own source type", async () => {
    creditMultipleTokensDetailed.mockResolvedValue({
      status: "credited",
      balances: BALANCES,
      written: 4,
      requested: 4,
    });

    await dailyYieldService.claimDailyYield(USER_ID, NATAL, false, "agents");

    expect(creditMultipleTokensDetailed).toHaveBeenCalledWith(
      USER_ID,
      expect.any(Array),
      "agents_yield",
      expect.objectContaining({
        idempotencyKey: expect.stringContaining("daily:agents:"),
      }),
    );
  });
});
