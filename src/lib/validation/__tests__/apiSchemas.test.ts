import {
  AddCommensalRequestSchema,
  UpdateCommensalRequestSchema,
  SyncCreditRequestSchema,
  SyncDebitRequestSchema,
  EconomySwapRequestSchema,
  RecipeMintRequestEnvelopeSchema,
  SkipOnboardingRequestSchema,
  CheckoutPreflightRequestSchema,
  StripeCheckoutTokensRequestSchema,
} from "../apiSchemas";

describe("Batch 1A API Validation Schemas", () => {
  describe("AddCommensalRequestSchema", () => {
    it("accepts valid commensal with birthData", () => {
      const res = AddCommensalRequestSchema.safeParse({
        name: "Plato",
        relationship: "friend",
        birthData: {
          dateTime: "1990-01-01T12:00:00Z",
          latitude: 37.7749,
          longitude: -122.4194,
        },
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe("Plato");
        expect(res.data.relationship).toBe("friend");
      }
    });

    it("rejects missing name or missing coordinates", () => {
      const res1 = AddCommensalRequestSchema.safeParse({
        birthData: { dateTime: "1990-01-01T12:00:00Z", latitude: 0, longitude: 0 },
      });
      expect(res1.success).toBe(false);

      const res2 = AddCommensalRequestSchema.safeParse({
        name: "Socrates",
        birthData: { dateTime: "1990-01-01T12:00:00Z" },
      });
      expect(res2.success).toBe(false);
    });
  });

  describe("UpdateCommensalRequestSchema", () => {
    it("accepts update with name only", () => {
      const res = UpdateCommensalRequestSchema.safeParse({ name: "Aristotle" });
      expect(res.success).toBe(true);
    });

    it("accepts update with relationship only", () => {
      const res = UpdateCommensalRequestSchema.safeParse({ relationship: "partner" });
      expect(res.success).toBe(true);
    });

    it("rejects update when neither name nor relationship is provided", () => {
      const res = UpdateCommensalRequestSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });

  describe("SyncCreditRequestSchema & SyncDebitRequestSchema", () => {
    it("accepts valid sync-credit request", () => {
      const res = SyncCreditRequestSchema.safeParse({
        userEmail: "agent@alchm.kitchen",
        amounts: { spirit: 10, matter: 5 },
        source: "agents_yield",
        idempotencyKey: "test-key-1",
      });
      expect(res.success).toBe(true);
    });

    it("rejects sync-credit missing required fields", () => {
      const res = SyncCreditRequestSchema.safeParse({
        amounts: { spirit: 10 },
      });
      expect(res.success).toBe(false);
    });

    it("accepts valid sync-debit request", () => {
      const res = SyncDebitRequestSchema.safeParse({
        userEmail: "agent@alchm.kitchen",
        amounts: { essence: 2 },
        operationType: "transmutation",
        idempotencyKey: "test-key-2",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("EconomySwapRequestSchema", () => {
    it("accepts valid swap between different tokens with positive amount", () => {
      const res = EconomySwapRequestSchema.safeParse({
        fromToken: "Spirit",
        toToken: "Matter",
        amount: 5,
      });
      expect(res.success).toBe(true);
    });

    it("rejects swapping a token for itself", () => {
      const res = EconomySwapRequestSchema.safeParse({
        fromToken: "Spirit",
        toToken: "Spirit",
        amount: 5,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Cannot swap a token for itself");
      }
    });

    it("rejects negative or zero amount", () => {
      const res1 = EconomySwapRequestSchema.safeParse({
        fromToken: "Spirit",
        toToken: "Matter",
        amount: 0,
      });
      expect(res1.success).toBe(false);

      const res2 = EconomySwapRequestSchema.safeParse({
        fromToken: "Spirit",
        toToken: "Matter",
        amount: -5,
      });
      expect(res2.success).toBe(false);
    });
  });

  describe("RecipeMintRequestEnvelopeSchema", () => {
    it("accepts an envelope with a recipe object", () => {
      const res = RecipeMintRequestEnvelopeSchema.safeParse({
        recipe: { title: "Golden Elixir", id: "recipe-1" },
      });
      expect(res.success).toBe(true);
    });

    it("rejects an envelope missing the recipe field", () => {
      const res = RecipeMintRequestEnvelopeSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });

  describe("SkipOnboardingRequestSchema", () => {
    it("accepts skipNatal: true", () => {
      const res = SkipOnboardingRequestSchema.safeParse({ skipNatal: true });
      expect(res.success).toBe(true);
    });

    it("rejects skipNatal: false or omitted", () => {
      expect(SkipOnboardingRequestSchema.safeParse({ skipNatal: false }).success).toBe(false);
      expect(SkipOnboardingRequestSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("Checkout & Stripe Schemas", () => {
    it("accepts valid checkout preflight request", () => {
      const res = CheckoutPreflightRequestSchema.safeParse({
        source: "grocery_drawer",
        items: [{ asin: "B000123456", qty: 2 }],
        cartType: "fresh",
      });
      expect(res.success).toBe(true);
    });

    it("accepts valid stripe checkout tokens request", () => {
      const res = StripeCheckoutTokensRequestSchema.safeParse({ sku: "vault-esms-50" });
      expect(res.success).toBe(true);
    });

    it("rejects missing sku in stripe checkout tokens request", () => {
      const res = StripeCheckoutTokensRequestSchema.safeParse({});
      expect(res.success).toBe(false);
    });
  });
});
