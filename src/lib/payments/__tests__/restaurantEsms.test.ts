import {
  canAffordEsmsBasket,
  esmsBasketTotal,
  esmsRestaurantAggregateDailyCap,
  esmsRestaurantCentsPerToken,
  esmsRestaurantPerUserDailyCap,
  quoteEsmsBasket,
} from "@/lib/payments/restaurantEsms";

describe("restaurant ESMS redemption", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN;
    delete process.env.ESMS_RESTAURANT_PER_USER_DAILY_CAP;
    delete process.env.ESMS_RESTAURANT_AGGREGATE_DAILY_CAP;
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

  it("sums a basket across all four axes", () => {
    expect(esmsBasketTotal({ spirit: 501, essence: 500, matter: 500, substance: 500 })).toBe(
      2001,
    );
  });

  describe("daily redemption caps", () => {
    it("falls back to defaults when unset", () => {
      expect(esmsRestaurantPerUserDailyCap()).toBe(5000);
      expect(esmsRestaurantAggregateDailyCap()).toBe(200000);
    });

    it("honors explicit overrides", () => {
      process.env.ESMS_RESTAURANT_PER_USER_DAILY_CAP = "1200";
      process.env.ESMS_RESTAURANT_AGGREGATE_DAILY_CAP = "50000";
      expect(esmsRestaurantPerUserDailyCap()).toBe(1200);
      expect(esmsRestaurantAggregateDailyCap()).toBe(50000);
    });

    it("treats explicit 0 as unlimited", () => {
      process.env.ESMS_RESTAURANT_PER_USER_DAILY_CAP = "0";
      expect(esmsRestaurantPerUserDailyCap()).toBe(0);
    });

    it("falls back to the default on an invalid value rather than disabling the cap", () => {
      process.env.ESMS_RESTAURANT_PER_USER_DAILY_CAP = "-5";
      expect(esmsRestaurantPerUserDailyCap()).toBe(5000);
      process.env.ESMS_RESTAURANT_PER_USER_DAILY_CAP = "abc";
      expect(esmsRestaurantPerUserDailyCap()).toBe(5000);
    });
  });
});

