import {
  InstacartPriceEstimateResponseSchema,
  RecipeExtractApiResponseSchema,
  CustomRecipesListResponseSchema,
  CustomRecipeSaveWireResponseSchema,
  MintQuoteResponseSchema,
  MintWireResponseSchema,
  ServerProfileResponseSchema,
  OnboardingApiResponseSchema,
  QuestReportResponseSchema,
  AlchemicalThermodynamicsResultSchema,
  AlchemicalTokenRatesResultSchema,
  AlchemicalRuneGuidanceResultSchema,
  AlchemicalPlanetaryHourResultSchema,
  AlchmRecipeRecommendationSchema,
  AlchmCuisinesRecordSchema,
  AlchmSaucesRecordSchema,
  AlchmIngredientsRecordSchema,
} from "../serviceResponseSchemas";
import { AlchemicalElementalPropertiesSchema } from "../alchemicalBackendSchemas";

describe("serviceResponseSchemas (Phase 29 Wire Schemas)", () => {
  describe("AlchemicalElementalPropertiesSchema (Backend Contract)", () => {
    it("accepts valid pre-normalized elemental values > 1 (Python backend contract)", () => {
      const payload = {
        Fire: 1.5,
        Water: 0.8,
        Air: 0.4,
        Earth: 0.2,
      };
      const result = AlchemicalElementalPropertiesSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.Fire).toBe(1.5);
      }
    });

    it("rejects negative elemental values", () => {
      const payload = {
        Fire: -0.1,
        Water: 0.5,
        Air: 0.5,
        Earth: 0.5,
      };
      const result = AlchemicalElementalPropertiesSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("InstacartPriceEstimateResponseSchema", () => {
    it("validates high and low confidence responses", () => {
      expect(
        InstacartPriceEstimateResponseSchema.safeParse({
          confidence: "high",
          validated_item_count: 5,
        }).success,
      ).toBe(true);

      expect(
        InstacartPriceEstimateResponseSchema.safeParse({
          confidence: "low",
          reason: "IDP rejected payload",
        }).success,
      ).toBe(true);
    });

    it("rejects missing or invalid confidence enum values", () => {
      expect(
        InstacartPriceEstimateResponseSchema.safeParse({
          message: "no confidence field",
        }).success,
      ).toBe(false);

      expect(
        InstacartPriceEstimateResponseSchema.safeParse({
          confidence: "medium", // Only "low" | "high" permitted
        }).success,
      ).toBe(false);
    });
  });

  describe("RecipeExtractApiResponseSchema", () => {
    it("validates successful recipe extraction with alchemical properties", () => {
      const payload = {
        success: true,
        recipes: [
          {
            name: "Sun Elixir Soup",
            categories: ["Soup", "Elixir"],
            ingredients: ["Ginger", "Turmeric"],
            instructions: ["Simmer gently."],
            elementalProperties: {
              Fire: 1.2,
              Water: 0.5,
              Air: 0.3,
              Earth: 0.1,
            },
            spirit: 10,
            essence: 15,
            matter: 5,
            substance: 8,
            aSharp: 38,
            alchemicalMatchRate: 0.85,
            source: "scan",
          },
        ],
      };
      const result = RecipeExtractApiResponseSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("validates structured failure and raw error responses", () => {
      expect(
        RecipeExtractApiResponseSchema.safeParse({
          success: false,
          error: "Extraction failed. Your Essence was refunded.",
        }).success,
      ).toBe(true);

      expect(
        RecipeExtractApiResponseSchema.safeParse({
          error: "Unauthorized",
        }).success,
      ).toBe(true);
    });

    it("rejects malformed recipe items missing required fields", () => {
      const payload = {
        success: true,
        recipes: [
          {
            name: "Broken Recipe",
            // missing ingredients, instructions, elementalProperties
          },
        ],
      };
      expect(RecipeExtractApiResponseSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("CustomRecipesListResponseSchema & CustomRecipeSaveWireResponseSchema", () => {
    it("validates custom recipes list responses", () => {
      const authenticatedList = {
        authenticated: true,
        recipes: [
          {
            id: "rec_1",
            name: "Solar Stew",
            createdAt: 1720000000000,
          },
        ],
      };
      expect(CustomRecipesListResponseSchema.safeParse(authenticatedList).success).toBe(true);

      const unauthenticatedList = {
        authenticated: false,
        recipes: [],
      };
      expect(CustomRecipesListResponseSchema.safeParse(unauthenticatedList).success).toBe(true);
    });

    it("validates custom recipe save wire response", () => {
      const saveResponse = {
        authenticated: true,
        recipe: {
          id: "rec_1",
          name: "Solar Stew",
          createdAt: 1720000000000,
        },
        wasExisting: false,
        completedQuests: [
          {
            questSlug: "ingest_first_recipe",
            tokensAwarded: 50,
            tokenType: "Essence",
          },
        ],
      };
      expect(CustomRecipeSaveWireResponseSchema.safeParse(saveResponse).success).toBe(true);
    });
  });

  describe("MintQuoteResponseSchema & MintWireResponseSchema", () => {
    it("validates mint quote response with four coins and planetary swap", () => {
      const quote = {
        enabled: true,
        fingerprint: {
          aSharp: 20,
          totals: { spirit: 5, essence: 5, matter: 5, substance: 5 },
        },
        quote: {
          liveCost: { spirit: 5, essence: 5, matter: 5, substance: 5 },
          swap: { rulingHourPlanet: "Mars" },
        },
      };
      expect(MintQuoteResponseSchema.safeParse(quote).success).toBe(true);
    });

    it("validates mint wire success and error responses", () => {
      const successPayload = {
        success: true,
        mintId: "mint_123",
        status: "pending_chain",
        pending: true,
        cost: { spirit: 5, essence: 5, matter: 5, substance: 5 },
        weightedToCoin: "Fire",
        contentHash: "0xabc",
      };
      expect(MintWireResponseSchema.safeParse(successPayload).success).toBe(true);

      const errorPayload = {
        error: "mint_unavailable",
        detail: "Recipe NFT minting is not enabled on this deployment.",
      };
      expect(MintWireResponseSchema.safeParse(errorPayload).success).toBe(true);
    });

    it("rejects invalid status enum on mint success", () => {
      const invalidStatus = {
        success: true,
        status: "invalid_status",
      };
      expect(MintWireResponseSchema.safeParse(invalidStatus).success).toBe(false);
    });
  });

  describe("ServerProfileResponseSchema, OnboardingApiResponseSchema & QuestReportResponseSchema", () => {
    it("validates ServerProfileResponseSchema", () => {
      expect(
        ServerProfileResponseSchema.safeParse({
          success: true,
          profile: { userId: "u1", name: "Alchemist" },
        }).success,
      ).toBe(true);

      expect(
        ServerProfileResponseSchema.safeParse({
          success: false,
          message: "Authentication required",
        }).success,
      ).toBe(true);
    });

    it("validates OnboardingApiResponseSchema", () => {
      expect(
        OnboardingApiResponseSchema.safeParse({
          success: true,
          natalChart: { dominantElement: "Fire" },
        }).success,
      ).toBe(true);

      expect(
        OnboardingApiResponseSchema.safeParse({
          success: false,
          message: "Service unavailable",
        }).success,
      ).toBe(true);
    });

    it("validates QuestReportResponseSchema", () => {
      expect(
        QuestReportResponseSchema.safeParse({
          success: true,
          completedQuests: [{ id: "q1" }],
          message: "Quest complete!",
        }).success,
      ).toBe(true);

      expect(
        QuestReportResponseSchema.safeParse({
          success: false,
          message: "Authentication required",
        }).success,
      ).toBe(true);
    });
  });

  describe("AlchmAPIClient Wire Schemas", () => {
    it("validates thermodynamics result with null monica", () => {
      const payload = {
        heat: 0.6,
        entropy: 0.4,
        reactivity: 0.5,
        gregsEnergy: 0.55,
        kalchm: 1.2,
        monica: null,
      };
      expect(AlchemicalThermodynamicsResultSchema.safeParse(payload).success).toBe(true);
    });

    it("validates token rates, rune guidance, and planetary hour", () => {
      expect(
        AlchemicalTokenRatesResultSchema.safeParse({
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25,
          kalchm: 1.0,
          monica: 0.95,
        }).success,
      ).toBe(true);

      expect(
        AlchemicalRuneGuidanceResultSchema.safeParse({
          symbol: "ᚠ",
          name: "Fehu",
          meaning: "Wealth & Transformation",
          influence: {
            elemental: { Fire: 0.4, Water: 0.2, Air: 0.2, Earth: 0.2 },
            energy: { Spirit: 10, Essence: 10, Matter: 5, Substance: 5 },
            guidance: "Ignite steady heat.",
          },
        }).success,
      ).toBe(true);

      expect(
        AlchemicalPlanetaryHourResultSchema.safeParse({
          planet: "Jupiter",
          hourNumber: 3,
          isDaytime: true,
        }).success,
      ).toBe(true);
    });

    it("validates recipe recommendations and data dictionaries with non-normalized elemental values", () => {
      expect(
        AlchmRecipeRecommendationSchema.safeParse({
          id: "rec_456",
          name: "Planetary Braised Duck",
        }).success,
      ).toBe(true);

      expect(
        AlchmCuisinesRecordSchema.safeParse({
          greek: {
            name: "Greek",
            elementalProperties: { Fire: 1.2, Water: 0.8, Air: 0.5, Earth: 0.3 },
          },
        }).success,
      ).toBe(true);

      expect(
        AlchmSaucesRecordSchema.safeParse({
          demi_glace: {
            name: "Demi-Glace",
            elementalProperties: { Fire: 0.5, Earth: 0.5, Water: 0.2, Air: 0.1 },
          },
        }).success,
      ).toBe(true);

      expect(
        AlchmIngredientsRecordSchema.safeParse({
          saffron: {
            name: "Saffron",
            elementalProperties: { Fire: 2.0, Air: 1.0, Water: 0, Earth: 0 },
          },
        }).success,
      ).toBe(true);
    });
  });
});
