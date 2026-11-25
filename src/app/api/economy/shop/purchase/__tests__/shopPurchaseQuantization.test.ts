/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

const getShopItemMock = jest.fn();
const hasActivePurchaseMock = jest.fn();
const getDatabaseUserFromRequestMock = jest.fn();
const readEsmsBalancesMock = jest.fn();
const toOnchainAmountsMock = jest.fn();
const redeemEsmsForMock = jest.fn();

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getShopItem: (...args: unknown[]) => getShopItemMock(...args),
    hasActivePurchase: (...args: unknown[]) => hasActivePurchaseMock(...args),
  },
}));
jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: (...args: unknown[]) => getDatabaseUserFromRequestMock(...args),
}));
jest.mock("@/lib/esms-chain/contract", () => ({
  esmsOnchainConfigured: () => true,
  readEsmsRedeemed: jest.fn().mockResolvedValue(false),
  readEsmsBalances: (...args: unknown[]) => readEsmsBalancesMock(...args),
  buildRedeemAuthChallenge: jest.fn().mockReturnValue("0xchallenge"),
}));
jest.mock("@/lib/esms-chain/redeemer", () => ({
  redeemerConfigured: () => true,
  toOnchainAmounts: (...args: unknown[]) => toOnchainAmountsMock(...args),
  verifyRedeem: jest.fn().mockResolvedValue(true),
  redeemEsmsFor: (...args: unknown[]) => redeemEsmsForMock(...args),
}));
jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { POST } from "../route";

describe("POST /api/economy/shop/purchase ESMS quantization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDatabaseUserFromRequestMock.mockResolvedValue({
      id: "user-uuid-123",
      walletAddress: "0x1234567890123456789012345678901234567890",
    });
    hasActivePurchaseMock.mockResolvedValue(false);
    readEsmsBalancesMock.mockResolvedValue({ spirit: 100n, essence: 100n, matter: 100n, substance: 100n });
    toOnchainAmountsMock.mockReturnValue([10n, 0n, 0n, 0n]);
    redeemEsmsForMock.mockResolvedValue("0xburntx");
  });

  it("formats item ESMS costs to exact 4-dp strings for challenge signing and sponsored burns", async () => {
    getShopItemMock.mockResolvedValue({
      id: "item-1",
      slug: "elixir",
      isOneTime: true,
      costSpirit: 0.0029,
      costEssence: 10,
      costMatter: 0.0003,
      costSubstance: 0,
    });

    const signReq = new NextRequest("http://localhost/api/economy/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: "elixir" }),
      headers: { "Content-Type": "application/json" },
    });
    const signRes = await POST(signReq);
    expect(signRes.status).toBe(200);
    expect(toOnchainAmountsMock).toHaveBeenCalledWith({
      spirit: "0.0029",
      essence: "10.0000",
      matter: "0.0003",
      substance: "0.0000",
    });

    const burnReq = new NextRequest("http://localhost/api/economy/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: "elixir", deadline: "1999999999", signature: "0xdeadbeef" }),
      headers: { "Content-Type": "application/json" },
    });
    const burnRes = await POST(burnReq);
    expect(burnRes.status).toBe(200);
    expect(redeemEsmsForMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amounts: {
          spirit: "0.0029",
          essence: "10.0000",
          matter: "0.0003",
          substance: "0.0000",
        },
      }),
    );
  });

  it("fails closed with 500 invalid_item_cost on negative or NaN item costs before chain RPC calls", async () => {
    getShopItemMock.mockResolvedValue({
      id: "item-bad",
      slug: "corrupt-item",
      isOneTime: true,
      costSpirit: -5,
      costEssence: Number.NaN,
      costMatter: 0,
      costSubstance: 0,
    });

    const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: "corrupt-item" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.code).toBe("invalid_item_cost");
    expect(readEsmsBalancesMock).not.toHaveBeenCalled();
    expect(redeemEsmsForMock).not.toHaveBeenCalled();
  });
});
