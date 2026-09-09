/**
 * @jest-environment node
 *
 * Regression test for shop purchase route isOneTime null-guard and nonce isolation.
 *
 * Pins:
 * 1. An item whose `isOneTime` is `null` or `undefined` defaults to `true` (one-time).
 * 2. An already-owned one-time item returns `{ ok: true, alreadyOwned: true }` even with null `isOneTime`.
 * 3. The `orderId` for one-time items (including null `isOneTime`) ignores client-supplied nonce.
 * 4. Repeatable items (`isOneTime: false`) incorporate client nonce and do not short-circuit on active purchase.
 */

import { NextRequest } from "next/server";
import { keccak256, toHex } from "viem";
import { POST } from "../route";

const getShopItemMock = jest.fn();
const hasActivePurchaseMock = jest.fn();
const getDatabaseUserFromRequestMock = jest.fn();
const esmsOnchainConfiguredMock = jest.fn();
const readEsmsRedeemedMock = jest.fn();

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getShopItem: (...args: unknown[]) => getShopItemMock(...args),
    hasActivePurchase: (...args: unknown[]) => hasActivePurchaseMock(...args),
  },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: (...args: unknown[]) =>
    getDatabaseUserFromRequestMock(...args),
}));

jest.mock("@/lib/esms-chain/contract", () => ({
  esmsOnchainConfigured: () => esmsOnchainConfiguredMock(),
  readEsmsRedeemed: (...args: unknown[]) => readEsmsRedeemedMock(...args),
  readEsmsBalances: jest.fn().mockResolvedValue({ spirit: 100n, essence: 100n, matter: 100n, substance: 100n }),
  buildRedeemAuthChallenge: jest.fn().mockReturnValue("0xchallenge"),
}));

jest.mock("@/lib/esms-chain/redeemer", () => ({
  redeemerConfigured: () => true,
  toOnchainAmounts: jest.fn().mockReturnValue([0n, 0n, 0n, 0n]),
  verifyRedeem: jest.fn(),
  redeemEsmsFor: jest.fn(),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
}));

describe("POST /api/economy/shop/purchase isOneTime null-guard regression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDatabaseUserFromRequestMock.mockResolvedValue({
      id: "user-uuid-123",
      walletAddress: "0x1234567890123456789012345678901234567890",
    });
    esmsOnchainConfiguredMock.mockReturnValue(true);
    readEsmsRedeemedMock.mockResolvedValue(false);
  });

  it("treats null isOneTime as true, triggering alreadyOwned check if active purchase exists", async () => {
    getShopItemMock.mockResolvedValue({
      id: "item-uuid-1",
      slug: "theme-celestial",
      title: "Celestial Theme",
      isOneTime: null, // Nullable DB column
      costSpirit: 10,
      costEssence: 0,
      costMatter: 0,
      costSubstance: 0,
      isActive: true,
    });
    hasActivePurchaseMock.mockResolvedValue(true);

    const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: "theme-celestial", nonce: "client-nonce-xyz" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = (await res.json()) as { ok?: boolean; alreadyOwned?: boolean; itemId?: string };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.alreadyOwned).toBe(true);
    expect(data.itemId).toBe("theme-celestial");
    expect(hasActivePurchaseMock).toHaveBeenCalledWith("user-uuid-123", "theme-celestial");
  });

  it("forces fixed empty nonce on null isOneTime when generating orderId", async () => {
    getShopItemMock.mockResolvedValue({
      id: "item-uuid-1",
      slug: "theme-celestial",
      title: "Celestial Theme",
      isOneTime: null,
      costSpirit: 10,
      costEssence: 0,
      costMatter: 0,
      costSubstance: 0,
      isActive: true,
    });
    hasActivePurchaseMock.mockResolvedValue(false);

    const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: "theme-celestial", nonce: "attacker-chosen-nonce" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = (await res.json()) as { mode?: string; orderId?: string };

    expect(res.status).toBe(200);
    expect(data.mode).toBe("sign");

    // Expected orderId uses '' instead of attacker-chosen-nonce
    const expectedOrderId = keccak256(toHex("shop:user-uuid-123:theme-celestial:"));
    expect(data.orderId).toBe(expectedOrderId);
  });

  it("allows repeatable item (isOneTime: false) to incorporate client nonce", async () => {
    getShopItemMock.mockResolvedValue({
      id: "item-uuid-2",
      slug: "consumable-boost",
      title: "Consumable Boost",
      isOneTime: false,
      costSpirit: 5,
      costEssence: 0,
      costMatter: 0,
      costSubstance: 0,
      isActive: true,
    });
    hasActivePurchaseMock.mockResolvedValue(true); // Should NOT block repeatable item

    const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: "consumable-boost", nonce: "valid-nonce-42" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = (await res.json()) as { mode?: string; orderId?: string };

    expect(res.status).toBe(200);
    expect(data.mode).toBe("sign");

    const expectedOrderId = keccak256(toHex("shop:user-uuid-123:consumable-boost:valid-nonce-42"));
    expect(data.orderId).toBe(expectedOrderId);
  });

  describe("Inbound body schema validation", () => {
    it("returns 400 on invalid JSON syntax", async () => {
      const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
        method: "POST",
        body: "invalid-json{",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Invalid JSON body");
    });

    it("returns 400 with details.fieldErrors when itemId is missing or empty", async () => {
      const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
        method: "POST",
        body: JSON.stringify({ nonce: "123" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Invalid request body");
      expect(data.message).toBe("itemId is required");
      expect(data.details?.itemId).toBeDefined();
    });

    it("returns 400 with details.fieldErrors when deadline format is invalid", async () => {
      const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
        method: "POST",
        body: JSON.stringify({ itemId: "theme-celestial", deadline: "not-a-number" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Invalid request body");
      expect(data.details?.deadline).toBeDefined();
    });

    it("falls through to mode: 'sign' on non-hex txHash and signature, preserving the recovery loop", async () => {
      getShopItemMock.mockResolvedValue({
        id: "item-uuid-1",
        slug: "theme-celestial",
        title: "Celestial Theme",
        isOneTime: true,
        costSpirit: 10,
        costEssence: 0,
        costMatter: 0,
        costSubstance: 0,
        isActive: true,
      });
      hasActivePurchaseMock.mockResolvedValue(false);

      const req = new NextRequest("http://localhost/api/economy/shop/purchase", {
        method: "POST",
        body: JSON.stringify({
          itemId: "theme-celestial",
          txHash: "not-a-hex-tx",
          signature: "not-a-hex-sig",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.mode).toBe("sign");
      expect(data.orderId).toBeDefined();
    });
  });
});
