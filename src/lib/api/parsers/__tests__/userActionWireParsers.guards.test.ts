import {
  parseClaimDailyResponse,
  parseCommensalSaveResponse,
  parseFavoriteRecipesResponse,
  parseSaveGroupResponse,
  parseVaultBalancesResponse,
} from "../userActionWireParsers";

describe("userActionWireParsers", () => {
  it("parses commensal save responses safely", () => {
    expect(parseCommensalSaveResponse(JSON.parse("null"))).toEqual({ success: false });
    expect(parseCommensalSaveResponse({ success: true, message: "Saved" })).toEqual({
      success: true,
      message: "Saved",
    });
  });

  it("parses save-group responses and optional diningGroup.id", () => {
    expect(parseSaveGroupResponse(JSON.parse("null"))).toEqual({ success: false });
    expect(
      parseSaveGroupResponse({
        success: true,
        diningGroup: { id: "grp-1", name: "Friday" },
      }),
    ).toEqual({ success: true, diningGroup: { id: "grp-1" } });
    expect(
      parseSaveGroupResponse({ success: false, message: "Give your group a name" }),
    ).toEqual({ success: false, message: "Give your group a name" });
  });

  it("rejects non-finite vault balances and null payloads", () => {
    expect(parseVaultBalancesResponse(JSON.parse("null"))).toEqual({});
    expect(
      parseVaultBalancesResponse({
        balances: { spirit: 1, essence: Number.NaN, matter: 3, substance: 4 },
      }),
    ).toEqual({});
    expect(
      parseVaultBalancesResponse({
        balances: { spirit: 1, essence: 2, matter: 3, substance: 4 },
      }),
    ).toEqual({
      balances: { spirit: 1, essence: 2, matter: 3, substance: 4 },
    });
  });

  it("parses claim-daily responses", () => {
    expect(parseClaimDailyResponse(JSON.parse("null"))).toEqual({ success: false });
    expect(parseClaimDailyResponse({ success: true, message: "Claimed!" })).toEqual({
      success: true,
      message: "Claimed!",
    });
  });

  it("parses favorite recipes responses and filters malformed tracked rows", () => {
    expect(parseFavoriteRecipesResponse(JSON.parse("null"))).toEqual({ success: false });
    expect(
      parseFavoriteRecipesResponse({
        success: true,
        favoriteIds: ["rec-1", 42],
        topTrackedIngredients: [
          { name: "Garlic", count: 3 },
          { name: "Bad", count: Number.POSITIVE_INFINITY },
        ],
        topLikedIngredients: [{ name: "Basil", count: 2 }],
      }),
    ).toEqual({
      success: true,
      favoriteIds: ["rec-1"],
      topTrackedIngredients: [{ name: "Garlic", count: 3 }],
      topLikedIngredients: [{ name: "Basil", count: 2 }],
    });
  });
});
