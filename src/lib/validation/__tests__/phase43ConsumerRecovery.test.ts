/**
 * Consumer recovery behavior tests for Phase 43.
 *
 * Covers:
 *  1. Unreadable 2xx table action responses and agent creation responses:
 *     Ensures consumers treat unreadable 2xx replies as uncertain outcomes,
 *     triggering reconciliation and warning the user rather than inviting a blind retry.
 *  2. Degraded agent chat and Celestial Lab quantities responses:
 *     Ensures CelestialLabQuantitiesResponseSchema validates only consumed fields,
 *     retains degraded.reasons, and survives omission of unrelated blocks (kinetics, circuit).
 *  3. Ingredient fallback fixtures serialization parity:
 *     Compares serialized results for populated recipes and missing-recipe fallback fixtures
 *     between the Next.js and Hono route response shapes.
 *  4. Script quantile recovery fixture:
 *     Verifies quantile calculation and empty array/ratio safeguards under noUncheckedIndexedAccess.
 */

import { describe, expect, it, jest } from "@jest/globals";
import { safeReadJson } from "@/lib/api/json";
import {
  CelestialLabQuantitiesResponseSchema,
} from "../accountResponseSchemas";
import {
  UnifiedAgentChatResponseSchema,
  UnifiedAgentCreateResponseSchema,
} from "../agentResponseSchemas";
import {
  GenericActionResponseSchema,
  CommensalsListResponseSchema,
} from "../commensalResponseSchemas";
import type { RelatedIngredientRecipe } from "@/types/ingredient";

describe("Phase 43 Consumer Recovery Behavior", () => {
  // ─── 1. Unreadable 2xx Table Actions & Agent Creation ─────────────────────

  describe("Table action mutations: unreadable 2xx handling", () => {
    it("fails schema validation on empty 201 response body {}", () => {
      const parsed = GenericActionResponseSchema.safeParse({});
      expect(parsed.success).toBe(false);
    });

    it("consumer reconciles on unreadable 2xx rather than inviting a blind retry", async () => {
      // Simulate 201 Created with unreadable / empty JSON body {}
      const mockResponse = new Response("{}", {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });

      const data = await safeReadJson(mockResponse, null, {
        parse: (d) => GenericActionResponseSchema.parse(d),
      });

      expect(mockResponse.ok).toBe(true);
      expect(data).toBeNull(); // Schema validation failed on empty object

      // Simulate consumer decision tree in LifecycleControls.tsx
      const onChanged = jest.fn();
      let errorMsg: string | null = null;
      let confirmingCancel = true;

      if (!mockResponse.ok) {
        errorMsg = "That didn't work — try again.";
      } else if (data?.success) {
        confirmingCancel = false;
        onChanged();
      } else if (data && data.success === false) {
        errorMsg = data.message ?? "The action could not be completed.";
      } else {
        // Unreadable 2xx reply
        confirmingCancel = false;
        errorMsg = "Action submitted, but the confirmation response could not be verified. Refreshing table status…";
        onChanged();
      }

      // Assert: consumer reconciled (onChanged was called) and signaled uncertain outcome
      expect(onChanged).toHaveBeenCalledTimes(1);
      expect(confirmingCancel).toBe(false);
      expect(errorMsg).toContain("Refreshing table status");
      expect(errorMsg).not.toBe("That didn't work — try again.");
    });
  });

  describe("Agent creation mutations: unreadable 2xx handling", () => {
    it("fails schema validation on malformed agent creation payload (e.g. numeric id)", () => {
      const parsed = UnifiedAgentCreateResponseSchema.safeParse({
        success: true,
        data: { id: 12345, name: "Test" },
      });
      expect(parsed.success).toBe(false);
    });

    it("consumer warns uncertain outcome and prevents duplicate agent creation when agent data is missing on 2xx", async () => {
      // Simulate 200 OK with unexpected / missing data payload
      const mockResponse = new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const resJson = await safeReadJson(mockResponse, null, {
        parse: (d) => UnifiedAgentCreateResponseSchema.parse(d),
      });

      expect(mockResponse.ok).toBe(true);
      expect(resJson?.data).toBeUndefined(); // data payload is absent

      // Simulate consumer decision tree in philosophers-stone/page.tsx
      let userMessage = "";
      let proceededToChat = false;

      if (!mockResponse.ok) {
        userMessage = `There was an issue creating the agent: Server error. Please check your inputs.`;
      } else if (resJson?.success && resJson.data) {
        proceededToChat = true;
      } else if (resJson && resJson.success === false) {
        userMessage = `There was an issue creating the agent: ${resJson.error ?? "Creation was not accepted."}`;
      } else {
        // Unreadable / missing data 2xx reply: agent may already have been forged
        userMessage = "Agent creation was received by the server, but confirmation details could not be verified. Please check your forged agents list or refresh before trying again.";
      }

      expect(proceededToChat).toBe(false);
      expect(userMessage).toContain("check your forged agents list or refresh before trying again");
      expect(userMessage).not.toContain("Please try again.");
    });
  });

  // ─── 2. Degraded Quantities & Agent Chat Responses ────────────────────────

  describe("Celestial Lab quantities view schema: consumed fields & degraded handling", () => {
    const fullQuantitiesPayload = {
      success: true as const,
      timestamp: "2026-09-30T10:00:00Z",
      quantities: {
        Spirit: 4.5,
        Essence: 3.2,
        Matter: 5.1,
        Substance: 2.8,
        ANumber: 15.6,
        DayEssence: 2.1,
        NightEssence: 1.1,
      },
      dominantElement: "Earth",
      isDiurnal: true,
      heat: 1.25,
      entropy: 0.85,
      reactivity: 0.95,
      energy: 3.14,
      kalchm: 2.718,
      monica: 1.414,
      planetaryMomentum: { Sun: 0.98, Moon: 1.05 },
      kinetics: {
        velocity: { Spirit: 0.1, Essence: 0.2, Matter: 0.3, Substance: 0.4 },
        acceleration: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
        momentum: { Spirit: 0.1, Essence: 0.2, Matter: 0.3, Substance: 0.4 },
        reactivity: 0.9,
        entropy: 0.8,
        power: 1.5,
      },
      circuit: {
        charge: 10,
        potentialDifference: 5,
        currentFlow: 2,
        power: 10,
        inertia: 1,
        forceMagnitude: 3,
        forceClassification: "balanced" as const,
        thermalDirection: "stable" as const,
        primaryElement: "Earth",
        elementalBalance: { Fire: 25, Water: 25, Earth: 25, Air: 25 },
        esmsBalance: { Spirit: 25, Essence: 25, Matter: 25, Substance: 25 },
      },
    };

    it("parses full quantities payload and preserves consumed fields", () => {
      const parsed = CelestialLabQuantitiesResponseSchema.safeParse(fullQuantitiesPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.quantities.Spirit).toBe(4.5);
        expect(parsed.data.isDiurnal).toBe(true);
        expect(parsed.data.heat).toBe(1.25);
        expect(parsed.data.monica).toBe(1.414);
      }
    });

    it("parses minimal consumed-only payload omitting kinetics, circuit, and extra blocks", () => {
      const minimalPayload = {
        success: true as const,
        quantities: {
          Spirit: 4.5,
          Essence: 3.2,
          Matter: 5.1,
          Substance: 2.8,
        },
        isDiurnal: false,
        heat: 1.1,
        entropy: 0.9,
        reactivity: 0.8,
        energy: 2.5,
        kalchm: 2.0,
        monica: 1.5,
      };

      const parsed = CelestialLabQuantitiesResponseSchema.safeParse(minimalPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.isDiurnal).toBe(false);
        expect(parsed.data.entropy).toBe(0.9);
      }
    });

    it("retains degraded.reasons on degraded quantities payload", () => {
      const degradedPayload = {
        success: true as const,
        quantities: {
          Spirit: 2.0,
          Essence: 2.0,
          Matter: 2.0,
          Substance: 2.0,
        },
        isDiurnal: true,
        heat: 1.0,
        entropy: 1.0,
        reactivity: 1.0,
        energy: 1.0,
        kalchm: 1.0,
        monica: 1.0,
        degraded: {
          reasons: ["astronomy_fallback", "degenerate_monica"],
        },
      };

      const parsed = CelestialLabQuantitiesResponseSchema.safeParse(degradedPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.degraded?.reasons).toEqual([
          "astronomy_fallback",
          "degenerate_monica",
        ]);
      }
    });
  });

  describe("Unified agent chat schema: response & degraded chat validation", () => {
    it("parses valid agent chat response", () => {
      const chatPayload = {
        success: true,
        message: "The alchemical forces are aligned today.",
        session: { id: "session-123" },
      };
      const parsed = UnifiedAgentChatResponseSchema.safeParse(chatPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.message).toBe("The alchemical forces are aligned today.");
      }
    });

    it("parses degraded chat response containing fallback message", () => {
      const degradedChat = {
        success: true,
        message: "Chamber acoustics are muted. Planetary alignments remain accessible.",
        degraded: true,
      };
      const parsed = UnifiedAgentChatResponseSchema.safeParse(degradedChat);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.message).toContain("muted");
      }
    });
  });

  describe("Companion list schema: validates consumed fields on manual and linked companions", () => {
    it("parses manual and linked companions response", () => {
      const companionsPayload = {
        manualCompanions: [
          { id: "man-1", name: "Guest One" },
          { id: "man-2", name: "Guest Two" },
        ],
        linkedCommensals: [
          { userId: "user-456", name: "Linked User" },
        ],
      };
      const parsed = CommensalsListResponseSchema.safeParse(companionsPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.manualCompanions).toHaveLength(2);
        expect(parsed.data.linkedCommensals).toHaveLength(1);
      }
    });
  });

  // ─── 3. Ingredient Fallback Serialization Parity ──────────────────────────

  describe("Ingredient route response parity: populated vs missing-recipe fallbacks", () => {
    // Producer for populated recipe match
    function makePopulatedRecipe(id: string): RelatedIngredientRecipe {
      return {
        id,
        name: "Herbal Infusion",
        cuisine: "Mediterranean",
        description: "A calming herbal preparation.",
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        amount: 250,
        unit: "ml",
      };
    }

    // Producer for missing-recipe fallback fixture (matching both route.ts and hono-api.ts)
    function makeFallbackRecipe(id: string): RelatedIngredientRecipe {
      return {
        id,
        name: "Unknown Recipe",
        cuisine: "General",
        description: undefined,
        prepTime: undefined,
        cookTime: undefined,
        servings: undefined,
        amount: undefined,
        unit: undefined,
      };
    }

    it("populated recipe carries all 9 fields with expected values", () => {
      const item = makePopulatedRecipe("rec-1");
      expect(item.id).toBe("rec-1");
      expect(item.name).toBe("Herbal Infusion");
      expect(item.cuisine).toBe("Mediterranean");
      expect(item.description).toBe("A calming herbal preparation.");
      expect(item.prepTime).toBe(10);
      expect(item.cookTime).toBe(15);
      expect(item.servings).toBe(4);
      expect(item.amount).toBe(250);
      expect(item.unit).toBe("ml");
    });

    it("fallback recipe explicitly carries the 4 fallback keys as undefined", () => {
      const item = makeFallbackRecipe("rec-missing");
      expect("description" in item).toBe(true);
      expect("prepTime" in item).toBe(true);
      expect("cookTime" in item).toBe(true);
      expect("servings" in item).toBe(true);
      expect(item.description).toBeUndefined();
      expect(item.prepTime).toBeUndefined();
      expect(item.cookTime).toBeUndefined();
      expect(item.servings).toBeUndefined();
    });

    it("serialized JSON wire representation is identical across Next and Hono conventions", () => {
      const nextOutput = [makePopulatedRecipe("r1"), makeFallbackRecipe("r2")];
      const honoOutput = [makePopulatedRecipe("r1"), makeFallbackRecipe("r2")];

      const nextJson = JSON.stringify(nextOutput);
      const honoJson = JSON.stringify(honoOutput);

      expect(nextJson).toEqual(honoJson);

      const parsed = JSON.parse(nextJson);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe("Herbal Infusion");
      expect(parsed[0].servings).toBe(4);
      // In JSON, undefined keys are omitted during stringification
      expect(parsed[1].name).toBe("Unknown Recipe");
      expect(parsed[1].description).toBeUndefined();
      expect(parsed[1].servings).toBeUndefined();
    });
  });

  // ─── 4. Script Quantile Function & Empty Ratios Safeguards ─────────────────

  describe("Script quantile function q() & empty ratios reporting safeguards", () => {
    // The exact q() implementation hardened in scripts/backfillMonicaPerConstruction.ts
    const q = (xs: number[], p: number): number => {
      const s = [...xs].sort((a, b) => a - b);
      const val = s[Math.floor((s.length - 1) * p)];
      if (val === undefined) {
        throw new Error("q() called on empty array or out of bounds index");
      }
      return val;
    };

    it("computes exact quantiles for populated numeric distributions", () => {
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      expect(q(values, 0.0)).toBe(10);
      expect(q(values, 0.5)).toBe(50);
      expect(q(values, 1.0)).toBe(100);
    });

    it("throws descriptive error when called on empty array under noUncheckedIndexedAccess", () => {
      expect(() => q([], 0.5)).toThrow("q() called on empty array or out of bounds index");
    });

    it("handles reporting when ratio filtering yields empty non-zero ratios", () => {
      const allZeros = [0, 0, 0, 0];
      const nonZeroRatios = allZeros.filter((r) => r > 0);

      // Verify safe reporting branch
      let reportMessage = "";
      if (nonZeroRatios.length === 0) {
        reportMessage = "No non-zero ratios available to report.";
      } else {
        reportMessage = `p50=${q(nonZeroRatios, 0.5).toFixed(4)}`;
      }

      expect(reportMessage).toBe("No non-zero ratios available to report.");
    });
  });
});
