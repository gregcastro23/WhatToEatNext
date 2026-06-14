import {
  canAffordEsmsBasket,
  esmsRestaurantCentsPerToken,
  quoteEsmsBasket,
} from "@/lib/payments/restaurantEsms";

describe("restaurant ESMS redemption", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN;
  });

  it("quotes an even four-axis basket", () => {
    expect(quoteEsmsBasket(2000, 1)).toEqual({
      spirit: 500,
      essence: 500,
      matter: 500,
      substance: 500,
    });
  });

  it("distributes indivisible token costs deterministically", () => {
    expect(quoteEsmsBasket(2001, 1)).toEqual({
      spirit: 501,
      essence: 500,
      matter: 500,
      substance: 500,
    });
  });

  it("rejects disabled or invalid redemption rates", () => {
    expect(quoteEsmsBasket(100, 0)).toBeNull();
    expect(esmsRestaurantCentsPerToken()).toBe(0);
  });

  it("checks every axis before allowing payment", () => {
    const cost = { spirit: 10, essence: 10, matter: 10, substance: 10 };
    expect(canAffordEsmsBasket(cost, cost)).toBe(true);
    expect(canAffordEsmsBasket({ ...cost, matter: 9 }, cost)).toBe(false);
  });
});

