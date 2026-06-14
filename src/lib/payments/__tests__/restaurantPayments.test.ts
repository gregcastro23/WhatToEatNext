import {
  normalizeRestaurantPaymentPreference,
  restaurantCryptoPaymentsEnabled,
  stripePaymentMethodTypes,
} from "@/lib/payments/restaurantPayments";

describe("restaurant payment helpers", () => {
  const originalFlag = process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED;

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED;
    } else {
      process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED = originalFlag;
    }
  });

  it("keeps unknown payment preferences on dynamic Checkout methods", () => {
    expect(normalizeRestaurantPaymentPreference(undefined)).toBe("automatic");
    expect(normalizeRestaurantPaymentPreference("wallet")).toBe("automatic");
    expect(stripePaymentMethodTypes("automatic")).toBeUndefined();
  });

  it("maps explicit card and crypto preferences to Stripe methods", () => {
    expect(normalizeRestaurantPaymentPreference("card")).toBe("card");
    expect(normalizeRestaurantPaymentPreference("crypto")).toBe("crypto");
    expect(normalizeRestaurantPaymentPreference("esms")).toBe("esms");
    expect(stripePaymentMethodTypes("card")).toEqual(["card"]);
    expect(stripePaymentMethodTypes("crypto")).toEqual(["crypto"]);
  });

  it("only enables the crypto UI for an exact true flag", () => {
    process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED = "true";
    expect(restaurantCryptoPaymentsEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED = "false";
    expect(restaurantCryptoPaymentsEnabled()).toBe(false);
  });
});
