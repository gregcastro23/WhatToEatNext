import {
  anyCryptoFoodPromoEnabled,
  cryptoFoodCheckoutEnabled,
  esmsFoodRedemptionEnabled,
  onchainEsmsEnabled,
} from "@/lib/payments/cryptoPromo";

// The homepage promo must never advertise a crypto/on-chain rail that isn't
// live. These gates default OFF and only flip on an exact "true" string, so an
// unset or typo'd flag can never accidentally promise a non-working flow.
describe("crypto food promo gating", () => {
  const FLAGS = [
    "NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED",
    "NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED",
    "NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED",
  ] as const;
  const original = new Map(FLAGS.map((f) => [f, process.env[f]] as const));

  afterEach(() => {
    for (const f of FLAGS) {
      const v = original.get(f);
      if (v === undefined) delete process.env[f];
      else process.env[f] = v;
    }
  });

  function clearAll() {
    for (const f of FLAGS) delete process.env[f];
  }

  it("defaults every rail OFF when no flags are set", () => {
    clearAll();
    expect(cryptoFoodCheckoutEnabled()).toBe(false);
    expect(esmsFoodRedemptionEnabled()).toBe(false);
    expect(onchainEsmsEnabled()).toBe(false);
    expect(anyCryptoFoodPromoEnabled()).toBe(false);
  });

  it("only enables a rail for the exact string 'true'", () => {
    clearAll();
    process.env.NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED = "TRUE";
    expect(onchainEsmsEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED = "1";
    expect(onchainEsmsEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ESMS_ONCHAIN_ENABLED = "true";
    expect(onchainEsmsEnabled()).toBe(true);
  });

  it("maps each gate to its own flag", () => {
    clearAll();
    process.env.NEXT_PUBLIC_STRIPE_RESTAURANT_CRYPTO_ENABLED = "true";
    expect(cryptoFoodCheckoutEnabled()).toBe(true);
    expect(esmsFoodRedemptionEnabled()).toBe(false);
    expect(onchainEsmsEnabled()).toBe(false);

    clearAll();
    process.env.NEXT_PUBLIC_ESMS_RESTAURANT_PAYMENTS_ENABLED = "true";
    expect(esmsFoodRedemptionEnabled()).toBe(true);
    expect(cryptoFoodCheckoutEnabled()).toBe(false);
  });

  it("anyCryptoFoodPromoEnabled is the OR of all three rails", () => {
    for (const flag of FLAGS) {
      clearAll();
      process.env[flag] = "true";
      expect(anyCryptoFoodPromoEnabled()).toBe(true);
    }
    clearAll();
    expect(anyCryptoFoodPromoEnabled()).toBe(false);
  });
});
