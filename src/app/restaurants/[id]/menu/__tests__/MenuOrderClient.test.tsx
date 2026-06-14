import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MenuOrderClient from "@/app/restaurants/[id]/menu/MenuOrderClient";

const originalFetch = global.fetch;

beforeEach(() => {
  process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED = "true";
  process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED = "true";
  process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN = "1";
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      balances: {
        spirit: 1000,
        essence: 1000,
        matter: 1000,
        substance: 1000,
      },
    }),
  }) as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED;
  delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED;
  delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN;
});

it("offers card, USDC, and affordable ESMS payment choices", async () => {
  render(
    <MenuOrderClient
      restaurant={{
        id: "rest_123",
        name: "Test Kitchen",
        url: "https://example.com/menu",
        stripeConnectAccountId: "acct_123",
      }}
      menu={{
        restaurantId: "rest_123",
        categories: [
          {
            id: "mains",
            name: "Mains",
            items: [
              {
                id: "item_1",
                plu: "PLU-1",
                name: "Aligned Bowl",
                priceCents: 1000,
                available: true,
              },
            ],
          },
        ],
      }}
    />,
  );

  expect(
    screen.getByRole("button", { name: "Card USD checkout" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "USDC Pay from a wallet" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "ESMS Four-axis balance" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
  fireEvent.click(
    screen.getByRole("button", { name: "ESMS Four-axis balance" }),
  );

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith("/api/economy/balance");
  });
  expect(
    screen.getByText(
      "250 Spirit / 250 Essence / 250 Matter / 250 Substance",
    ),
  ).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Pay with ESMS" })).toBeEnabled();
  });
});
