import { describe, expect, it } from "@jest/globals";
import {
  AdminPatchUserResponseSchema,
  AdminSessionRevokeResponseSchema,
  AdminUserTimelineResponseSchema,
} from "../adminUserResponseSchemas";
import {
  CommensalListResponseSchema,
  CommensalMemberResponseSchema,
  DiningGroupListResponseSchema,
  DiningGroupResponseSchema,
  GenericActionResponseSchema,
  LinkedCommensalsResponseSchema,
  UserSearchResponseSchema,
} from "../commensalResponseSchemas";
import {
  FoodLabListResponseSchema,
  FoodLabSingleResponseSchema,
  FoodLabUploadResponseSchema,
} from "../foodLabResponseSchemas";
import {
  CompletedQuestSchema,
  CommunityTipsResponseSchema,
  FeedShareResponseSchema,
  NanobananaGenerateResponseSchema,
  PersistResponseSchema,
  RecipeErrorResponseSchema,
  RecipeSocialResponseSchema,
  ShareResponseSchema,
} from "../socialResponseSchemas";
import { ServerProfileResponseSchema } from "../userProfileResponseSchemas";
import {
  ShopItemsResponseSchema,
  OnchainStatusSchema,
  ShopPurchaseResponseSchema,
  ShopPurchaseSettleResponseSchema,
} from "../shopResponseSchemas";
import {
  InstacartLinkResponseSchema,
  InstacartRetailersResponseSchema,
} from "../instacartResponseSchemas";
import {
  TableConversationEnsureResponseSchema,
  ConversationMessagesResponseSchema,
  SendMessageResponseSchema,
} from "../chatResponseSchemas";
import {
  NotificationListResponseSchema,
  MarkAllReadResponseSchema,
  NotificationActionResponseSchema,
} from "../notificationResponseSchemas";
import {
  FeedApiResponseSchema,
  FeedEventWireSchema,
  FeedReactionsResponseSchema,
  AgentsApiResponseSchema,
  TransactionsApiResponseSchema,
  SwapRatesApiResponseSchema,
  SwapActionResponseSchema,
} from "../feedResponseSchemas";

const validBirthData = {
  dateTime: "1990-05-15T14:30:00.000Z",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};

const validNatalChart = {
  dominantElement: "Fire" as const,
  dominantModality: "Cardinal" as const,
  ascendant: "aries",
  birthData: validBirthData,
  planets: [
    { name: "Sun", sign: "taurus", position: 54.2 },
    { name: "Moon", sign: "cancer", position: 102.5 },
  ],
  planetaryPositions: { Sun: "taurus", Moon: "cancer" },
};

const validGroupMember = {
  id: "m1",
  name: "Bob",
  relationship: "friend" as const,
  birthData: validBirthData,
  natalChart: validNatalChart,
  createdAt: "2026-09-18T12:00:00Z",
};

const validDiningGroup = {
  id: "g1",
  name: "Family",
  memberIds: ["m1"],
  linkedUserIds: ["u2"],
  createdAt: "2026-09-18T12:00:00Z",
  updatedAt: "2026-09-18T12:00:00Z",
};

const validLinkedCommensal = {
  userId: "u2",
  name: "Charlie",
  email: "charlie@example.com",
  birthData: validBirthData,
  natalChart: validNatalChart,
  commensalshipId: "cs_123",
  syncedAt: "2026-09-18T12:00:00Z",
};

describe("boundaryValidationSchemas", () => {
  describe("socialResponseSchemas", () => {
    it("parses valid ShareResponse", () => {
      const parsed = ShareResponseSchema.parse({ success: true });
      expect(parsed.success).toBe(true);
    });

    it("parses valid RecipeSocialResponse", () => {
      const parsed = RecipeSocialResponseSchema.parse({
        authenticated: true,
        madeIt: true,
        rating: 5,
        review: "Delicious!",
        madeCount: 12,
      });
      expect(parsed.madeCount).toBe(12);
    });

    it("parses valid CommunityTipsResponse", () => {
      const parsed = CommunityTipsResponseSchema.parse({
        tips: [
          {
            author: "Chef Alchm",
            rating: 4,
            tip: "Use low heat",
            postedAt: "2026-09-18T12:00:00Z",
          },
        ],
      });
      expect(parsed.tips?.[0]?.author).toBe("Chef Alchm");
    });

    it("parses valid PersistResponse with practice reward", () => {
      const parsed = PersistResponseSchema.parse({
        madeCount: 3,
        reward: {
          tokenType: "Spirit",
          amount: 5,
          hint: "Cooked meal",
        },
      });
      expect(parsed.reward?.amount).toBe(5);
    });

    it("parses valid PersistResponse with null reward (unrewarded save)", () => {
      const parsed = PersistResponseSchema.parse({
        madeCount: 3,
        reward: null,
      });
      expect(parsed.madeCount).toBe(3);
      expect(parsed.reward).toBeNull();
    });

    it("parses valid PersistResponse with omitted reward", () => {
      const parsed = PersistResponseSchema.parse({
        madeCount: 3,
      });
      expect(parsed.madeCount).toBe(3);
      expect(parsed.reward).toBeUndefined();
    });

    it("rejects PersistResponse with malformed reward", () => {
      expect(() =>
        PersistResponseSchema.parse({
          madeCount: 3,
          reward: "not-an-object",
        }),
      ).toThrow();

      expect(() =>
        PersistResponseSchema.parse({
          madeCount: 3,
          reward: { tokenType: "Spirit", amount: "five" },
        }),
      ).toThrow();
    });

    it("parses FeedShareResponse, Nanobanana, and RecipeError", () => {
      expect(
        FeedShareResponseSchema.parse({
          success: true,
          completedQuests: [{ tokenRewardAmount: 10, tokenRewardType: "Matter" }],
        }).completedQuests?.[0]?.tokenRewardAmount,
      ).toBe(10);

      expect(
        NanobananaGenerateResponseSchema.parse({ url: "https://example.com/img.png" }).url,
      ).toBe("https://example.com/img.png");

      expect(
        RecipeErrorResponseSchema.parse({ message: "Out of gas" }).message,
      ).toBe("Out of gas");
    });

    it("enforces required fields on CompletedQuestSchema", () => {
      expect(
        CompletedQuestSchema.parse({
          tokenRewardAmount: 25,
          tokenRewardType: "Substance",
        }),
      ).toEqual({
        tokenRewardAmount: 25,
        tokenRewardType: "Substance",
      });

      expect(() => CompletedQuestSchema.parse({})).toThrow();
      expect(() => CompletedQuestSchema.parse({ tokenRewardAmount: 10 })).toThrow();
      expect(() => CompletedQuestSchema.parse({ tokenRewardType: "Fire" })).toThrow();
    });
  });

  describe("commensalResponseSchemas", () => {
    it("parses UserSearchResponse", () => {
      const parsed = UserSearchResponseSchema.parse({
        success: true,
        users: [{ id: "u1", name: "Alice", email: "alice@example.com" }],
      });
      expect(parsed.users?.[0]?.id).toBe("u1");
    });

    it("parses GenericActionResponse", () => {
      const parsed = GenericActionResponseSchema.parse({
        success: true,
        message: "Invite sent",
      });
      expect(parsed.message).toBe("Invite sent");
    });

    it("parses CommensalListResponse, DiningGroupListResponse, and LinkedCommensalsResponse with full fixtures", () => {
      const cList = CommensalListResponseSchema.parse({
        success: true,
        commensals: [validGroupMember],
      });
      expect(cList.commensals?.length).toBe(1);
      expect(cList.commensals?.[0]?.natalChart.dominantElement).toBe("Fire");

      const gList = DiningGroupListResponseSchema.parse({
        success: true,
        diningGroups: [validDiningGroup],
      });
      expect(gList.diningGroups?.length).toBe(1);
      expect(gList.diningGroups?.[0]?.memberIds).toContain("m1");

      const lcList = LinkedCommensalsResponseSchema.parse({
        success: true,
        linkedCommensals: [validLinkedCommensal],
      });
      expect(lcList.linkedCommensals?.length).toBe(1);
      expect(lcList.linkedCommensals?.[0]?.userId).toBe("u2");
    });

    it("parses single CommensalMemberResponse and DiningGroupResponse with full fixtures", () => {
      expect(
        CommensalMemberResponseSchema.parse({
          success: true,
          commensal: validGroupMember,
        }).commensal?.name,
      ).toBe("Bob");

      expect(
        DiningGroupResponseSchema.parse({
          success: true,
          diningGroup: validDiningGroup,
        }).diningGroup?.name,
      ).toBe("Family");
    });

    it("parses error/unauthenticated responses without commensal payload", () => {
      const unauth = CommensalMemberResponseSchema.parse({
        success: false,
        message: "Authentication required",
      });
      expect(unauth.success).toBe(false);
      expect(unauth.commensal).toBeUndefined();
    });

    it("rejects non-object commensal payload (e.g. primitive 42)", () => {
      expect(() =>
        CommensalMemberResponseSchema.parse({ success: true, commensal: 42 }),
      ).toThrow();
    });

    it("rejects array with null in commensals list", () => {
      expect(() =>
        CommensalListResponseSchema.parse({ success: true, commensals: [null] }),
      ).toThrow();
    });

    it("rejects invalid diningGroup payload (e.g. string 'wrong')", () => {
      expect(() =>
        DiningGroupResponseSchema.parse({ success: true, diningGroup: "wrong" }),
      ).toThrow();
    });

    it("rejects empty object in diningGroups list", () => {
      expect(() =>
        DiningGroupListResponseSchema.parse({ success: true, diningGroups: [{}] }),
      ).toThrow();
    });

    it("rejects array with null in linkedCommensals list", () => {
      expect(() =>
        LinkedCommensalsResponseSchema.parse({
          success: true,
          linkedCommensals: [null],
        }),
      ).toThrow();
    });

    it("rejects commensal when natalChart is invalid", () => {
      expect(() =>
        CommensalMemberResponseSchema.parse({
          success: true,
          commensal: {
            id: "m1",
            name: "Bob",
            natalChart: "not-a-chart",
          },
        }),
      ).toThrow();
    });

    it("rejects linkedCommensal missing userId or natalChart", () => {
      expect(() =>
        LinkedCommensalsResponseSchema.parse({
          success: true,
          linkedCommensals: [{ id: "lc1", name: "Charlie" }],
        }),
      ).toThrow();
    });
  });

  describe("foodLabResponseSchemas", () => {
    it("parses FoodLabSingleResponse and FoodLabUploadResponse", () => {
      const single = FoodLabSingleResponseSchema.parse({
        success: true,
        entry: {
          id: "entry_1",
          dishName: "Braised Fennel",
          cookedAt: "2026-09-18T10:00:00Z",
          photos: [{ dataUrl: "data:image/png;base64,...", uploadedAt: "2026-09-18" }],
          elementalTags: { fire: 0.3, earth: 0.7 },
          alchemicalTags: { salt: 0.5 },
          tags: ["dinner"],
          isPublic: true,
          createdAt: "2026-09-18T10:00:00Z",
          updatedAt: "2026-09-18T10:00:00Z",
        },
      });
      expect(single.entry.dishName).toBe("Braised Fennel");

      const upload = FoodLabUploadResponseSchema.parse({
        success: true,
        dataUrl: "data:image/png;base64,abc",
        uploadedAt: "2026-09-18",
      });
      expect(upload.dataUrl).toBe("data:image/png;base64,abc");

      const list = FoodLabListResponseSchema.parse({
        success: true,
        entries: [single.entry],
      });
      expect(list.entries?.length).toBe(1);
    });

    it("rejects FoodLabSingleResponse with invalid entry", () => {
      expect(() =>
        FoodLabSingleResponseSchema.parse({
          success: true,
          entry: { id: "entry_1" }, // missing dishName, cookedAt, photos, tags, etc.
        }),
      ).toThrow();
    });
  });

  describe("adminUserResponseSchemas", () => {
    it("parses AdminUserTimelineResponse", () => {
      const parsed = AdminUserTimelineResponseSchema.parse({
        success: true,
        identity: {
          id: "usr_123",
          email: "admin@alchm.kitchen",
          name: "Admin",
          roles: ["ADMIN"],
          isActive: true,
          isAgent: false,
          isAdmin: true,
          createdAt: "2026-01-01T00:00:00Z",
          lastLoginAt: "2026-09-18T12:00:00Z",
          loginCount: 42,
          dominantElement: "Fire",
          bio: "Lead Alchemist",
          monicaConstant: 1.618,
          hasCompletedOnboarding: true,
          onboardingCompletedAt: "2026-01-02T00:00:00Z",
          activeSessions: 1,
        },
        balances: {
          spirit: 100,
          essence: 50,
          matter: 25,
          substance: 10,
          total: 185,
        },
        subscription: {
          tier: "grand_master",
          status: "active",
          currentPeriodEnd: null,
        },
        stats: {
          signIns: 42,
          signInFailures: 0,
          recipesViewed: 120,
          recipesCooked: 15,
          diaryEntries: 30,
          tokensEarned: 500,
          tokensSpent: 315,
          agentEvents: 5,
        },
        events: [
          {
            id: "evt_1",
            at: "2026-09-18T12:00:00Z",
            category: "auth",
            type: "login",
            description: "User logged in",
            status: "success",
          },
        ],
        live: true,
        generatedAt: "2026-09-18T12:00:00Z",
      });
      expect(parsed.identity.email).toBe("admin@alchm.kitchen");
      expect(parsed.events.length).toBe(1);
    });

    it("parses AdminSessionRevokeResponse and AdminPatchUserResponse", () => {
      const revoked = AdminSessionRevokeResponseSchema.parse({
        success: true,
        revoked: 3,
        revocationCheck: "on",
      });
      expect(revoked.revoked).toBe(3);

      const patch = AdminPatchUserResponseSchema.parse({
        success: true,
        message: "Role updated",
      });
      expect(patch.message).toBe("Role updated");
    });

    it("rejects AdminUserTimelineResponse with invalid timeline event", () => {
      expect(() =>
        AdminUserTimelineResponseSchema.parse({
          success: true,
          identity: { id: "1" },
        }),
      ).toThrow();
    });
  });

  describe("userProfileResponseSchemas", () => {
    it("parses valid ServerProfileResponse", () => {
      const parsed = ServerProfileResponseSchema.parse({
        success: true,
        profile: {
          id: "usr_1",
          userId: "usr_1",
          name: "Alchemist",
          email: "alchemist@alchm.kitchen",
          onboardingComplete: true,
          birthData: validBirthData,
          natalChart: validNatalChart,
        },
      });
      expect(parsed.success).toBe(true);
      expect(parsed.profile?.userId).toBe("usr_1");
      expect(parsed.profile?.name).toBe("Alchemist");
    });

    it("parses minimal error/empty ServerProfileResponse", () => {
      const parsed = ServerProfileResponseSchema.parse({
        success: false,
        message: "Not found",
      });
      expect(parsed.success).toBe(false);
      expect(parsed.profile).toBeUndefined();
    });
  });

  describe("shopResponseSchemas", () => {
    it("parses valid ShopItemsResponse and OnchainStatus", () => {
      const items = ShopItemsResponseSchema.parse({
        items: [
          {
            id: "shp_1",
            slug: "monica-spoon",
            title: "Monica's Wooden Spoon",
            description: "A consecrated stirring utensil",
            category: "tools",
            isOneTime: true,
            baseCost: { spirit: 10, essence: 5, matter: 0, substance: 0 },
            liveCost: { spirit: 10, essence: 5, matter: 0, substance: 0 },
            owned: false,
          },
        ],
      });
      expect(items.items?.length).toBe(1);

      const status = OnchainStatusSchema.parse({
        configured: true,
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        walletLinked: true,
        offchain: { spirit: 100, essence: 50, matter: 20, substance: 10 },
        onchain: null,
        chain: { chainName: "Base", testnet: false, explorerBaseUrl: "https://basescan.org" },
      });
      expect(status.configured).toBe(true);
    });

    it("parses ShopPurchaseResponse and ShopPurchaseSettleResponse", () => {
      const purchase = ShopPurchaseResponseSchema.parse({
        ok: true,
        txHash: "0xabc",
        alreadyOwned: false,
      });
      expect(purchase.ok).toBe(true);

      const settle = ShopPurchaseSettleResponseSchema.parse({
        ok: true,
        txHash: "0xdef",
      });
      expect(settle.txHash).toBe("0xdef");
    });

    it("rejects ShopItem when id or slug is missing", () => {
      expect(() =>
        ShopItemsResponseSchema.parse({
          items: [{ title: "Missing ID and slug" }],
        }),
      ).toThrow();
    });
  });

  describe("instacartResponseSchemas", () => {
    it("parses valid InstacartLinkResponse with url or products_link_url", () => {
      const link1 = InstacartLinkResponseSchema.parse({
        url: "https://instacart.com/store/partner_recipes/123",
      });
      expect(link1.url).toContain("instacart.com");

      const link2 = InstacartLinkResponseSchema.parse({
        products_link_url: "https://instacart.com/store/partner_recipes/456",
      });
      expect(link2.products_link_url).toContain("instacart.com");
    });

    it("rejects InstacartLinkResponse when both URLs are absent", () => {
      expect(() =>
        InstacartLinkResponseSchema.parse({}),
      ).toThrow();
    });

    it("parses valid InstacartRetailersResponse", () => {
      const retailers = InstacartRetailersResponseSchema.parse({
        retailers: [
          {
            retailer_key: "kroger",
            name: "Kroger",
            retailer_logo_url: "https://logos.instacart.com/kroger.png",
          },
        ],
      });
      expect(retailers.retailers.length).toBe(1);
    });
  });

  describe("chatResponseSchemas", () => {
    it("parses TableConversationEnsureResponse, ConversationMessagesResponse, and SendMessageResponse", () => {
      const conv = TableConversationEnsureResponseSchema.parse({
        conversation: { id: "conv_123" },
      });
      expect(conv.conversation?.id).toBe("conv_123");

      const messages = ConversationMessagesResponseSchema.parse({
        messages: [
          {
            id: "msg_1",
            conversationId: "conv_123",
            senderId: "usr_1",
            body: "Welcome to the table!",
            attachments: [],
            createdAt: "2026-09-19T12:00:00Z",
            editedAt: null,
            deletedAt: null,
          },
        ],
      });
      expect(messages.messages?.length).toBe(1);

      const send = SendMessageResponseSchema.parse({
        message: {
          id: "msg_2",
          conversationId: "conv_123",
          senderId: "usr_1",
          body: "Second message",
          attachments: [],
          createdAt: "2026-09-19T12:01:00Z",
          editedAt: null,
          deletedAt: null,
        },
        replay: false,
      });
      expect(send.message?.body).toBe("Second message");
    });

    it("rejects ChatMessage missing body or id", () => {
      expect(() =>
        ConversationMessagesResponseSchema.parse({
          messages: [{ senderId: "usr_1" }],
        }),
      ).toThrow();
    });
  });

  describe("notificationResponseSchemas", () => {
    it("parses NotificationListResponse and MarkAllReadResponse", () => {
      const list = NotificationListResponseSchema.parse({
        success: true,
        notifications: [
          {
            id: "notif_1",
            userId: "usr_1",
            type: "welcome",
            title: "Welcome to Alchm",
            message: "Your journey begins.",
            isRead: false,
            createdAt: "2026-09-19T12:00:00Z",
          },
        ],
        unreadCount: 1,
      });
      expect(list.notifications.length).toBe(1);

      const marked = MarkAllReadResponseSchema.parse({
        success: true,
        count: 5,
      });
      expect(marked.count).toBe(5);
    });

    it("parses NotificationActionResponse and rejects malformed notification", () => {
      const action = NotificationActionResponseSchema.parse({
        success: true,
        message: "Invite accepted",
      });
      expect(action.success).toBe(true);

      expect(() =>
        NotificationListResponseSchema.parse({
          notifications: [{ title: "Missing fields" }],
        }),
      ).toThrow();
    });
  });

  describe("feedResponseSchemas", () => {
    it("parses FeedApiResponse, FeedReactionsResponse, AgentsApiResponse, TransactionsApiResponse, and SwapRatesApiResponse", () => {
      const feed = FeedApiResponseSchema.parse({
        success: true,
        events: [
          {
            id: "evt_1",
            actorId: "usr_1",
            actorName: "Chef Alchm",
            eventType: "cooked_recipe",
            metadataPayload: { recipeName: "Golden Broth" },
            createdAt: "2026-09-19T12:00:00Z",
          },
        ],
      });
      expect(feed.events?.length).toBe(1);

      const reactions = FeedReactionsResponseSchema.parse({
        success: true,
        viewerKinds: { evt_1: ["spark", "fire"] },
      });
      expect(reactions.viewerKinds?.evt_1).toEqual(["spark", "fire"]);

      const agents = AgentsApiResponseSchema.parse({
        success: true,
        agents: [
          {
            userId: "agent_1",
            handle: "monica",
            name: "Agent Monica",
            actionCount: 42,
          },
        ],
      });
      expect(agents.agents?.length).toBe(1);

      const txns = TransactionsApiResponseSchema.parse({
        success: true,
        transactions: [
          {
            id: "tx_1",
            userId: "usr_1",
            tokenType: "spirit",
            amount: 5,
            sourceType: "daily_yield",
            createdAt: "2026-09-19T12:00:00Z",
            actorIsAgent: false,
            actorName: "User",
          },
        ],
      });
      expect(txns.transactions?.length).toBe(1);

      const rates = SwapRatesApiResponseSchema.parse({
        success: true,
        rulingHourPlanet: "Jupiter",
        rulingDayPlanet: "Sun",
        rates: [
          { fromToken: "Spirit", toToken: "Essence", rate: 1.25, modifier: 1.0 },
        ],
        generatedAt: "2026-09-19T12:00:00Z",
        validUntil: "2026-09-19T13:00:00Z",
      });
      expect(rates.rates.length).toBe(1);

      const swapAct = SwapActionResponseSchema.parse({
        success: true,
        message: "Swapped successfully",
      });
      expect(swapAct.success).toBe(true);
    });

    it("rejects SwapRatesApiResponse when ruling planets or rates missing", () => {
      expect(() =>
        SwapRatesApiResponseSchema.parse({
          success: true,
        }),
      ).toThrow();
    });

    it("preserves producer-shaped FeedEvent attributes including actorRevealed across round-trip parsing (D3 guard)", () => {
      const producerEvent = {
        id: "evt_prod_1",
        actorId: "usr_42",
        actorName: "Chef Auguste",
        actorImage: "https://example.com/avatar.jpg",
        actorIsAgent: false,
        eventType: "cooked_recipe",
        metadataPayload: { recipeId: "rec_123", recipeName: "Alchemical Consommé" },
        createdAt: "2026-09-20T12:00:00.000Z",
        reactionCounts: { spark: 3 },
        commentCount: 2,
        actorRevealed: true,
      };
      const parsed = FeedEventWireSchema.parse(producerEvent);
      expect(parsed.actorRevealed).toBe(true);
      expect(parsed.actorName).toBe("Chef Auguste");
      expect(parsed.actorImage).toBe("https://example.com/avatar.jpg");
      expect(parsed.eventType).toBe("cooked_recipe");
      expect(parsed.metadataPayload).toEqual({ recipeId: "rec_123", recipeName: "Alchemical Consommé" });

      const parsedEnvelope = FeedApiResponseSchema.parse({
        success: true,
        events: [producerEvent],
      });
      expect(parsedEnvelope.events?.[0]?.actorRevealed).toBe(true);

      const unrevealedEvent = {
        ...producerEvent,
        id: "evt_prod_2",
        actorName: "Anonymous Alchemist",
        actorImage: undefined,
        actorRevealed: false,
      };
      const parsedUnrevealed = FeedEventWireSchema.parse(unrevealedEvent);
      expect(parsedUnrevealed.actorRevealed).toBe(false);
      expect(parsedUnrevealed.actorName).toBe("Anonymous Alchemist");
    });
  });
});

