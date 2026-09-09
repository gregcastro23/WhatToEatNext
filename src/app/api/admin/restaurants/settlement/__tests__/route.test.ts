/**
 * Route handler tests for /api/admin/restaurants/settlement.
 *
 * @file src/app/api/admin/restaurants/settlement/__tests__/route.test.ts
 */

const mockTransfersCreate = jest.fn();
const mockTransfersList = jest.fn();
const mockExecuteQuery = jest.fn();
const mockCreditMultipleTokens = jest.fn();
const mockTriggerOrderFulfillment = jest.fn();

jest.mock("@/lib/auth/validateRequest", () => ({
  validateAdminRequest: jest.fn(),
}));

jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({
    transfers: {
      create: (...a: unknown[]) => mockTransfersCreate(...a),
      list: (...a: unknown[]) => mockTransfersList(...a),
    },
  }),
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...a: unknown[]) => mockExecuteQuery(...a),
}));

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    creditMultipleTokens: (...a: unknown[]) => mockCreditMultipleTokens(...a),
  },
  TOKEN_TYPES: ["Spirit", "Essence", "Matter", "Substance"],
}));

jest.mock("@/lib/orders/fulfillment", () => ({
  triggerOrderFulfillment: (...a: unknown[]) => mockTriggerOrderFulfillment(...a),
}));

import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "../route";
import { validateAdminRequest } from "@/lib/auth/validateRequest";

const mockValidateAdminRequest = jest.mocked(validateAdminRequest);

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const ORDER_ID = "order-settlement-12345";

function makeGetRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/restaurants/settlement", {
    method: "GET",
  });
}

function makePostRequest(body?: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/restaurants/settlement", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  mockValidateAdminRequest.mockReset();
  mockTransfersCreate.mockReset();
  mockTransfersList.mockReset();
  mockExecuteQuery.mockReset();
  mockCreditMultipleTokens.mockReset();
  mockTriggerOrderFulfillment.mockReset();

  mockValidateAdminRequest.mockResolvedValue({
    user: {
      userId: ADMIN_ID,
      email: "admin@alchm.kitchen",
      roles: ["admin"],
    },
  });
});

describe("GET /api/admin/restaurants/settlement", () => {
  it("returns auth error if not admin", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Admin access required");
  });

  it("returns pending orders and lifetime stats", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: ORDER_ID,
            user_id: "user-1",
            restaurant_name: "Alchm Bistro",
            currency: "usd",
            transfer_amount_cents: 2500,
            stripe_connected_account_id: "acct_123",
            stripe_transfer_id: null,
            status: "settlement_pending",
            payment_status: "paid_with_esms",
            transfer_status: null,
            created_at: new Date().toISOString(),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ orders: "15", restaurants: "3" }],
      });

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.pending).toHaveLength(1);
    expect(data.lifetime).toEqual({ orders: 15, restaurants: 3 });
  });
});

describe("POST /api/admin/restaurants/settlement", () => {
  it("returns auth error if not admin", async () => {
    mockValidateAdminRequest.mockResolvedValueOnce({
      error: NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      ),
    });

    const res = await POST(makePostRequest({ orderId: ORDER_ID, action: "retry" }));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.message).toBe("Admin access required");
  });

  it("400s on invalid JSON body", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/admin/restaurants/settlement",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "invalid json",
      },
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid JSON");
  });

  it("400s on invalid action enum", async () => {
    const res = await POST(
      makePostRequest({ orderId: ORDER_ID, action: "cancel" }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("400s on missing orderId", async () => {
    const res = await POST(makePostRequest({ action: "retry" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("404s when order is not found", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const res = await POST(
      makePostRequest({ orderId: ORDER_ID, action: "retry" }),
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.message).toBe("Order not found.");
  });

  it("409s when order is not in pending/retry state", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          id: ORDER_ID,
          status: "paid",
          transfer_status: "created",
        },
      ],
    });

    const res = await POST(
      makePostRequest({ orderId: ORDER_ID, action: "retry" }),
    );
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.message).toContain("Order is not awaiting settlement");
  });

  it("200s on successful retry of Stripe transfer", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: ORDER_ID,
            status: "settlement_pending",
            transfer_status: null,
            stripe_connected_account_id: "acct_123",
            transfer_amount_cents: 3000,
            currency: "usd",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] }); // UPDATE restaurant_order_intents

    mockTransfersCreate.mockResolvedValueOnce({ id: "tr_stripe_999" });

    const res = await POST(
      makePostRequest({ orderId: ORDER_ID, action: "retry" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("paid");
    expect(data.transferId).toBe("tr_stripe_999");
    expect(mockTransfersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 3000,
        currency: "usd",
        destination: "acct_123",
      }),
      { idempotencyKey: `restaurant_order_esms_transfer_${ORDER_ID}` },
    );
  });

  it("409s on refund if a transfer already exists in Stripe", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [
        {
          id: ORDER_ID,
          status: "settlement_pending",
          transfer_status: null,
          user_id: "user-1",
        },
      ],
    });
    mockTransfersList.mockResolvedValueOnce({
      data: [{ id: "tr_existing_123" }],
    });

    const res = await POST(
      makePostRequest({ orderId: ORDER_ID, action: "refund" }),
    );
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.message).toContain("A Stripe transfer already exists");
  });

  it("200s on successful ESMS refund", async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: ORDER_ID,
            status: "settlement_pending",
            transfer_status: null,
            user_id: "user-1",
            restaurant_name: "Alchm Bistro",
          },
        ],
      }) // loadOrder
      .mockResolvedValueOnce({
        rows: [
          { token_type: "Spirit", total: "-15" },
          { token_type: "Essence", total: "-10" },
        ],
      }) // debitedBasket
      .mockResolvedValueOnce({ rows: [] }); // updateOrder

    mockTransfersList.mockResolvedValueOnce({ data: [] });
    mockCreditMultipleTokens.mockResolvedValueOnce({
      Spirit: 100,
      Essence: 50,
      Matter: 50,
      Substance: 50,
    });

    const res = await POST(
      makePostRequest({ orderId: ORDER_ID, action: "refund" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("refunded");
    expect(mockCreditMultipleTokens).toHaveBeenCalledWith(
      "user-1",
      [
        { tokenType: "Spirit", amount: 15 },
        { tokenType: "Essence", amount: 10 },
      ],
      "restaurant_refund",
      expect.objectContaining({
        sourceId: ORDER_ID,
        idempotencyKey: `restaurant_refund:${ORDER_ID}`,
      }),
    );
  });
});
