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
  FollowTargetRequestSchema,
  FeedReactionRequestSchema,
  FeedCommentRequestSchema,
  FeedCommentReportRequestSchema,
  FeedShareRequestSchema,
  CommensalAcceptRequestSchema,
  CommensalRejectRequestSchema,
  CommensalBlockRequestSchema,
  CreateDiningGroupRequestSchema,
  UpdateDiningGroupRequestSchema,
  PushPreferenceRequestSchema,
  PushSubscribeRequestSchema,
  PremiumTableRequestSchema,
  SynastryRequestSchema,
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

describe("Batch 1B API Validation Schemas (Social, Tables, Feed & Groups)", () => {
  describe("FollowTargetRequestSchema", () => {
    it("accepts valid UUID or undefined targetUserId", () => {
      expect(FollowTargetRequestSchema.safeParse({ targetUserId: "11111111-1111-1111-1111-111111111111" }).success).toBe(true);
      expect(FollowTargetRequestSchema.safeParse({}).success).toBe(true);
    });

    it("rejects non-UUID targetUserId", () => {
      expect(FollowTargetRequestSchema.safeParse({ targetUserId: "invalid-uuid" }).success).toBe(false);
    });
  });

  describe("FeedReactionRequestSchema", () => {
    it("accepts valid UUID and kind", () => {
      const res = FeedReactionRequestSchema.safeParse({
        eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        kind: "fire",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.kind).toBe("fire");
      }
    });

    it("defaults kind to spark when omitted or unknown", () => {
      const res1 = FeedReactionRequestSchema.safeParse({
        eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      });
      expect(res1.success).toBe(true);
      if (res1.success) {
        expect(res1.data.kind).toBe("spark");
      }

      const res2 = FeedReactionRequestSchema.safeParse({
        eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        kind: "unknown_reaction",
      });
      expect(res2.success).toBe(true);
      if (res2.success) {
        expect(res2.data.kind).toBe("spark");
      }
    });

    it("rejects invalid eventId", () => {
      expect(FeedReactionRequestSchema.safeParse({ eventId: "not-a-uuid" }).success).toBe(false);
    });
  });

  describe("FeedCommentRequestSchema", () => {
    it("accepts trimmed valid comment", () => {
      const res = FeedCommentRequestSchema.safeParse({
        eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        body: "  Great recipe!  ",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.body).toBe("Great recipe!");
      }
    });

    it("rejects empty or whitespace body", () => {
      expect(FeedCommentRequestSchema.safeParse({
        eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        body: "   ",
      }).success).toBe(false);
    });
  });

  describe("FeedCommentReportRequestSchema", () => {
    it("accepts valid report reasons", () => {
      expect(FeedCommentReportRequestSchema.safeParse({ reason: "spam" }).success).toBe(true);
      expect(FeedCommentReportRequestSchema.safeParse({ reason: "harassment", detail: "abusive content" }).success).toBe(true);
    });

    it("rejects invalid reason", () => {
      expect(FeedCommentReportRequestSchema.safeParse({ reason: "not_a_reason" }).success).toBe(false);
    });
  });

  describe("FeedShareRequestSchema", () => {
    it("accepts valid share types", () => {
      expect(FeedShareRequestSchema.safeParse({ shareType: "menu" }).success).toBe(true);
      expect(FeedShareRequestSchema.safeParse({ shareType: "cooked", payload: { recipeName: "Cake" } }).success).toBe(true);
    });

    it("rejects invalid share type", () => {
      expect(FeedShareRequestSchema.safeParse({ shareType: "invalid" }).success).toBe(false);
    });
  });

  describe("Commensal Schemas", () => {
    it("accepts valid accept and reject requests", () => {
      expect(CommensalAcceptRequestSchema.safeParse({ commensalshipId: "c-123" }).success).toBe(true);
      expect(CommensalAcceptRequestSchema.safeParse({}).success).toBe(false);

      expect(CommensalRejectRequestSchema.safeParse({ commensalshipId: "c-123" }).success).toBe(true);
      expect(CommensalRejectRequestSchema.safeParse({}).success).toBe(false);
    });

    it("accepts valid block and unblock requests with at least one target", () => {
      expect(CommensalBlockRequestSchema.safeParse({ targetUserId: "u-1" }).success).toBe(true);
      expect(CommensalBlockRequestSchema.safeParse({ commensalshipId: "c-1", action: "unblock" }).success).toBe(true);
      expect(CommensalBlockRequestSchema.safeParse({}).success).toBe(false);
      expect(CommensalBlockRequestSchema.safeParse({ targetUserId: "u-1", action: "invalid" }).success).toBe(false);
    });
  });

  describe("Dining Group Schemas", () => {
    it("validates create dining group payload", () => {
      expect(CreateDiningGroupRequestSchema.safeParse({ name: "Dinner Club", memberIds: ["m-1", "m-2"] }).success).toBe(true);
      expect(CreateDiningGroupRequestSchema.safeParse({ name: "", memberIds: [] }).success).toBe(false);
      expect(CreateDiningGroupRequestSchema.safeParse({ name: "Dinner Club" }).success).toBe(false);
    });

    it("validates update dining group payload requiring at least one field", () => {
      expect(UpdateDiningGroupRequestSchema.safeParse({ name: "New Name" }).success).toBe(true);
      expect(UpdateDiningGroupRequestSchema.safeParse({ memberIds: ["m-1"] }).success).toBe(true);
      expect(UpdateDiningGroupRequestSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("Push Schemas", () => {
    it("validates push preference payload", () => {
      expect(PushPreferenceRequestSchema.safeParse({ enabled: true }).success).toBe(true);
      expect(PushPreferenceRequestSchema.safeParse({ enabled: false }).success).toBe(true);
      expect(PushPreferenceRequestSchema.safeParse({}).success).toBe(true);
    });

    it("validates push subscription payload", () => {
      const valid = {
        subscription: {
          endpoint: "https://fcm.googleapis.com/fcm/send/token",
          keys: { p256dh: "key1", auth: "auth1" },
        },
      };
      expect(PushSubscribeRequestSchema.safeParse(valid).success).toBe(true);

      const insecure = {
        subscription: {
          endpoint: "http://insecure.endpoint.com",
          keys: { p256dh: "key1", auth: "auth1" },
        },
      };
      expect(PushSubscribeRequestSchema.safeParse(insecure).success).toBe(false);
    });
  });

  describe("PremiumTable & Synastry Schemas", () => {
    it("validates premium table with birthData on host and friend", () => {
      const valid = {
        hostData: { birthData: { dateTime: "1990-01-01T12:00:00Z", latitude: 10, longitude: 20 } },
        friendData: { birthData: { dateTime: "1992-02-02T12:00:00Z", latitude: -10, longitude: -20 } },
      };
      expect(PremiumTableRequestSchema.safeParse(valid).success).toBe(true);
      expect(PremiumTableRequestSchema.safeParse({ hostData: {} }).success).toBe(false);
    });

    it("validates synastry request with viewer natal chart planets", () => {
      const valid = {
        viewer: {
          id: "viewer-1",
          natalChart: { planets: { Sun: { sign: "Aries", degree: 10 } } },
        },
      };
      expect(SynastryRequestSchema.safeParse(valid).success).toBe(true);
      expect(SynastryRequestSchema.safeParse({ viewer: {} }).success).toBe(false);
    });
  });
});

