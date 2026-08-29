import { act, renderHook, waitFor } from "@testing-library/react";
import { useTokenEconomy } from "@/hooks/useTokenEconomy";
import type { TokenBalances, UserStreak } from "@/types";

const balances: TokenBalances = {
  spirit: 1,
  essence: 2,
  matter: 3,
  substance: 4,
  lastDailyClaimAt: null,
  lastDailyClaimAgentsAt: null,
  updatedAt: "2026-08-29T00:00:00.000Z",
};

const streak: UserStreak = {
  currentStreak: 2,
  longestStreak: 4,
  lastActivityDate: null,
  streakFrozenUntil: null,
  updatedAt: "2026-08-29T00:00:00.000Z",
};

function response(payload: unknown): Response {
  return {
    ok: true,
    json: async () => payload,
  } as Response;
}

describe("useTokenEconomy response boundaries", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("accepts a complete balance response", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      response({ success: true, balances, streak, canClaimDaily: true }),
    );

    const { result } = renderHook(() => useTokenEconomy());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.balances).toEqual(balances);
    expect(result.current.streak).toEqual(streak);
    expect(result.current.canClaimDaily).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("rejects malformed balances without placing them in state", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      response({
        success: true,
        balances: { ...balances, spirit: "many" },
        streak,
        canClaimDaily: true,
      }),
    );

    const { result } = renderHook(() => useTokenEconomy());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.balances).toBeNull();
    expect(result.current.error).toBe("Invalid economy response");
  });

  it("validates a daily claim before merging returned balances", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        response({
          success: true,
          balances: { ...balances, spirit: 2 },
          streak,
          canClaimDaily: false,
        }),
      )
      .mockResolvedValueOnce(
        response({ success: true, balances, streak, canClaimDaily: true }),
      )
      .mockResolvedValueOnce(
        response({
          success: true,
          message: "claimed",
          yield: {
            baseTokens: 1,
            streakMultiplier: 1,
            holdingsMultiplier: 1,
            totalTokens: 4,
            distribution: { spirit: 1, essence: 1, matter: 1, substance: 1 },
            transitBonus: { spirit: 0, essence: 0, matter: 0, substance: 0 },
            newBalances: { ...balances, spirit: 2 },
            streakCount: 3,
          },
        }),
      )
      .mockResolvedValueOnce(
        response({
          success: true,
          balances: { ...balances, spirit: 2 },
          streak,
          canClaimDaily: false,
        }),
      );

    const { result } = renderHook(() => useTokenEconomy());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      expect(await result.current.claimDaily()).not.toBeNull();
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(result.current.balances?.spirit).toBe(2);
    expect(result.current.canClaimDaily).toBe(false);
  });

  it("ignores a malformed vibration capability after a successful claim", async () => {
    const originalVibrate = navigator.vibrate;
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: undefined,
    });
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        response({ success: true, balances, streak, canClaimDaily: true }),
      )
      .mockResolvedValueOnce(
        response({
          success: true,
          message: "claimed",
          yield: {
            baseTokens: 1,
            streakMultiplier: 1,
            holdingsMultiplier: 1,
            totalTokens: 4,
            distribution: { spirit: 1, essence: 1, matter: 1, substance: 1 },
            transitBonus: { spirit: 0, essence: 0, matter: 0, substance: 0 },
            newBalances: { ...balances, spirit: 2 },
            streakCount: 3,
          },
        }),
      )
      .mockResolvedValueOnce(
        response({
          success: true,
          balances: { ...balances, spirit: 2 },
          streak,
          canClaimDaily: false,
        }),
      );

    const { result } = renderHook(() => useTokenEconomy());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      expect(await result.current.claimDaily()).not.toBeNull();
    });

    expect(result.current.error).toBeNull();
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: originalVibrate,
    });
  });
});
