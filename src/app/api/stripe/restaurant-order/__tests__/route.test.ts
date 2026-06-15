const createCheckoutSession = jest.fn();
const createTransfer = jest.fn();
const retrieveAccount = jest.fn();
const executeQuery = jest.fn();
const reserveEsmsForRestaurantOrder = jest.fn();
const triggerOrderFulfillment = jest.fn();

jest.mock("@/lib/auth/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/database/connection", () => ({ executeQuery }));
jest.mock("@/lib/stripe/stripe", () => ({
  getStripe: () => ({
    accounts: { retrieve: retrieveAccount },
    checkout: { sessions: { create: createCheckoutSession } },
    transfers: { create: createTransfer },
  }),
}));
jest.mock("@/lib/payments/esmsRestaurantLedger", () => ({
  reserveEsmsForRestaurantOrder,
}));
jest.mock("@/lib/orders/fulfillment", () => ({ triggerOrderFulfillment }));

import { POST } from "@/app/api/stripe/restaurant-order/route";
import { auth } from "@/lib/auth/auth";

const mockedAuth = auth as unknown as jest.MockedFunction<() => Promise<unknown>>;

function request(paymentMethod: "card" | "crypto" | "esms") {
  return new Request("http://localhost/api/stripe/restaurant-order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      cuisineType: "Restaurant",
      provider: "deliverect",
      restaurant: {
        id: "rest_123",
        name: "Test Kitchen",
        url: "https://example.com/menu",
      },
      order: {
        amountCents: 2000,
        currency: "usd",
        paymentMethod,
      },
    }),
  });
}

beforeEach(() => {
  mockedAuth.mockResolvedValue({
    user: { id: "user_123", name: "Test User", email: "test@example.com" },
  });
  createCheckoutSession.mockReset();
  createTransfer.mockReset();
  retrieveAccount.mockReset();
  executeQuery.mockReset();
  reserveEsmsForRestaurantOrder.mockReset();
  triggerOrderFulfillment.mockReset();
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  delete process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED;
  delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED;
  delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN;
  delete process.env.DATABASE_URL;

  executeQuery.mockImplementation(async (sql: string) => {
    if (sql.includes("SELECT id, stripe_connect_account_id")) return { rows: [] };
    return { rows: [] };
  });
  createCheckoutSession.mockResolvedValue({
    id: "cs_test_123",
    url: "https://checkout.stripe.test/session",
    payment_intent: "pi_test_123",
  });
});

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED;
  delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED;
  delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN;
  delete process.env.DATABASE_URL;
});

it("rejects crypto checkout while the rollout flag is off", async () => {
  const response = await POST(request("crypto"));
  expect(response.status).toBe(503);
  expect(createCheckoutSession).not.toHaveBeenCalled();
});

it("creates a crypto-only Stripe Checkout session", async () => {
  process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED = "true";

  const response = await POST(request("crypto"));
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.paymentPreference).toBe("crypto");

  const params = createCheckoutSession.mock.calls[0][0];
  expect(params.payment_method_types).toEqual(["crypto"]);
  expect(params.metadata.paymentPreference).toBe("crypto");
});

it("keeps explicit card checkout available", async () => {
  const response = await POST(request("card"));
  expect(response.status).toBe(200);
  expect(createCheckoutSession.mock.calls[0][0].payment_method_types).toEqual([
    "card",
  ]);
});

it("debits an ESMS basket and settles the connected restaurant", async () => {
  process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED = "true";
  process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN = "1";
  process.env.DATABASE_URL = "postgresql://test";
  executeQuery.mockImplementation(async (sql: string) => {
    if (sql.includes("SELECT id, stripe_connect_account_id")) {
      return {
        rows: [
          { id: "rest_123", stripe_connect_account_id: "acct_restaurant" },
        ],
      };
    }
    return { rows: [] };
  });
  reserveEsmsForRestaurantOrder.mockResolvedValue({
    reserved: true,
    alreadyReserved: false,
    balances: { spirit: 500, essence: 500, matter: 500, substance: 500 },
  });
  createTransfer.mockResolvedValue({ id: "tr_esms_123" });

  const response = await POST(request("esms"));
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.mode).toBe("esms");
  expect(body.esmsCost).toEqual({
    spirit: 500,
    essence: 500,
    matter: 500,
    substance: 500,
  });
  expect(createCheckoutSession).not.toHaveBeenCalled();
  expect(createTransfer).toHaveBeenCalledWith(
    expect.objectContaining({
      amount: 2000,
      currency: "usd",
      destination: "acct_restaurant",
    }),
    expect.objectContaining({
      idempotencyKey: expect.stringContaining("restaurant_order_esms_transfer_"),
    }),
  );
  expect(triggerOrderFulfillment).toHaveBeenCalledTimes(1);
});

it("returns 429 when a daily redemption cap is exceeded", async () => {
  process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED = "true";
  process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN = "1";
  process.env.DATABASE_URL = "postgresql://test";
  executeQuery.mockImplementation(async (sql: string) => {
    if (sql.includes("SELECT id, stripe_connect_account_id")) {
      return {
        rows: [
          { id: "rest_123", stripe_connect_account_id: "acct_restaurant" },
        ],
      };
    }
    return { rows: [] };
  });
  reserveEsmsForRestaurantOrder.mockResolvedValue({
    reserved: false,
    alreadyReserved: false,
    balances: null,
    capExceeded: {
      scope: "per_user",
      limit: 5000,
      used: 4800,
      requested: 2000,
    },
  });

  const response = await POST(request("esms"));
  expect(response.status).toBe(429);
  const body = await response.json();
  expect(body.code).toBe("redemption_cap_exceeded");
  expect(body.scope).toBe("per_user");
  expect(body.cap).toEqual({ limit: 5000, remaining: 200, requested: 2000 });
  expect(createTransfer).not.toHaveBeenCalled();
  expect(triggerOrderFulfillment).not.toHaveBeenCalled();
});

