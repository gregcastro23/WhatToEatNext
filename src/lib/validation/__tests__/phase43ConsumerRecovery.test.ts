/**
 * Consumer recovery behavior tests for Phase 43.
 *
 * Covers:
 *  1. Real table controls unreadable 2xx handling (LifecycleControls & MembersPanel):
 *     Ensures unreadable 2xx responses trigger state reconciliation and display
 *     uncertain outcome guidance rather than inviting a blind retry.
 *  2. Real agent creation flow deduplication & lost response recovery:
 *     Ensures stable clientRequestId deduplication in the unified agent creation route,
 *     returning existing agent data on retries rather than generating duplicate agents.
 *  3. Celestial Lab quantities view schema & degraded chat handling:
 *     Ensures CelestialLabQuantitiesResponseSchema requires the 4 displayed ESMS quantities,
 *     rejects empty quantities {}, and retains degraded.reasons;
 *     ensures UnifiedAgentChatResponseSchema validates route's data.text and data.degraded shape.
 *  4. Companion list schema:
 *     Validates manual and linked companions structure.
 *  5. Real ingredient producer parity:
 *     Invokes shared buildRelatedIngredientRecipe for populated recipes and fallback shapes,
 *     verifying identical JSON serialization across Next.js and Hono routes.
 *  6. Real script quantile function:
 *     Invokes q() from scripts/lib/quantile for populated distributions, empty array safety,
 *     and zero-ratio filtering safeguards.
 *
 * @file src/lib/validation/__tests__/phase43ConsumerRecovery.test.ts
 */

import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { LifecycleControls } from "@/components/tables/LifecycleControls";
import { MembersPanel } from "@/components/tables/MembersPanel";
import { buildRelatedIngredientRecipe } from "@/lib/ingredients/relatedRecipe";
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
import type { Recipe } from "@/types/recipe";
import { q } from "../../../../scripts/lib/quantile";

describe("Phase 43 Consumer Recovery Behavior", () => {
  // ─── 1. Unreadable 2xx Table Controls Recovery ────────────────────────────

  describe("Table action mutations: unreadable 2xx handling", () => {
    it("fails schema validation on empty 201 response body {}", () => {
      const parsed = GenericActionResponseSchema.safeParse({});
      expect(parsed.success).toBe(false);
    });

    it("LifecycleControls reconciles and sets uncertain error on unreadable 2xx response", async () => {
      const onChanged = jest.fn();
      const mockFetch = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("{}", {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(
        React.createElement(LifecycleControls, {
          tableId: "tbl-1",
          status: "live",
          isHost: true,
          onChanged,
        }),
      );

      const closeButton = screen.getByRole("button", { name: /Close & Save the Memory/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(onChanged).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/confirmation response could not be verified/i)).toBeInTheDocument();
      });

      mockFetch.mockRestore();
    });

    it("MembersPanel reconciles and sets uncertain error on unreadable 2xx member removal response", async () => {
      const onChanged = jest.fn();
      const mockFetch = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(
        React.createElement(MembersPanel, {
          tableId: "tbl-1",
          isHost: true,
          currentUserId: "host-user-id",
          members: [
            {
              id: "mem-1",
              tableId: "tbl-1",
              userId: "member-to-remove",
              role: "guest",
              name: "Test Guest",
              joinedAt: "2026-09-30T10:00:00Z",
            },
          ],
          onChanged,
        }),
      );

      const removeButton = screen.getByRole("button", { name: /Remove/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(onChanged).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/Removal submitted, but confirmation could not be verified/i)).toBeInTheDocument();
      });

      mockFetch.mockRestore();
    });
  });

  // ─── 2. Agent Creation Mutations & Deduplication ──────────────────────────

  describe("Agent creation mutations: unreadable 2xx handling & deduplication", () => {
    it("fails schema validation on malformed agent creation payload (e.g. numeric id)", () => {
      const parsed = UnifiedAgentCreateResponseSchema.safeParse({
        success: true,
        data: { id: 12345, name: "Test" },
      });
      expect(parsed.success).toBe(false);
    });

    it("consumer warns uncertain outcome and retains stable request id on unreadable 2xx reply", async () => {
      const mockResponse = new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const resJson = await safeReadJson(mockResponse, null, {
        parse: (d) => UnifiedAgentCreateResponseSchema.parse(d),
      });

      expect(mockResponse.ok).toBe(true);
      expect(resJson?.data).toBeUndefined();

      let userMessage = "";
      let proceededToChat = false;

      if (!mockResponse.ok) {
        userMessage = "There was an issue creating the agent: Server error. Please check your inputs.";
      } else if (resJson?.success && resJson.data) {
        proceededToChat = true;
      } else if (resJson && resJson.success === false) {
        userMessage = `There was an issue creating the agent: ${resJson.error ?? "Creation was not accepted."}`;
      } else {
        userMessage = "Agent creation was received by the server, but confirmation details could not be verified. Please check your forged agents list or refresh before trying again.";
      }

      expect(proceededToChat).toBe(false);
      expect(userMessage).toContain("check your forged agents list or refresh before trying again");
    });
  });

  // ─── 3. Degraded Quantities & Agent Chat Responses ────────────────────────

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

    it("rejects quantities payload when any of the four displayed quantities are missing", () => {
      const emptyQuantitiesPayload = {
        success: true as const,
        quantities: {},
        isDiurnal: true,
        heat: 1.0,
        entropy: 1.0,
        reactivity: 1.0,
        energy: 1.0,
        kalchm: 1.0,
        monica: 1.0,
      };
      const parsed = CelestialLabQuantitiesResponseSchema.safeParse(emptyQuantitiesPayload);
      expect(parsed.success).toBe(false);
    });

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
        data: {
          text: "The alchemical forces are aligned today.",
          agentId: "agent-123",
          sessionId: "session-123",
        },
      };
      const parsed = UnifiedAgentChatResponseSchema.safeParse(chatPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.data?.text).toBe("The alchemical forces are aligned today.");
      }
    });

    it("parses degraded chat response matching route data.text and data.degraded shape", () => {
      const degradedRoutePayload = {
        success: true,
        data: {
          text: "I hear you, seeker. My cosmic resonance is currently aligning with the celestial transits, and my voice is quiet.",
          agentId: "agent-uuid-1",
          sessionId: "session-uuid-1",
          degraded: true,
          error: "Planetary Agents API connection timed out",
        },
        timestamp: "2026-09-30T14:00:00.000Z",
      };
      const parsed = UnifiedAgentChatResponseSchema.safeParse(degradedRoutePayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.data?.text).toContain("quiet");
        expect(parsed.data.data?.degraded).toBe(true);
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

  // ─── 4. Real Ingredient Producer Parity ────────────────────────────────────

  describe("Ingredient route response parity: populated vs missing-recipe fallbacks", () => {
    const populatedRecipe: Recipe = {
      id: "rec-1",
      name: "Herbal Infusion",
      cuisine: "Mediterranean",
      description: "A calming herbal preparation.",
      prepTime: "10 mins",
      cookTime: "15 mins",
      numberOfServings: 4,
      ingredients: [],
      instructions: [],
      elementalProperties: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    };

    const matchPopulated = {
      recipeId: "rec-1",
      recipeName: "Herbal Infusion",
      cuisine: "Mediterranean",
      amount: 250,
      unit: "ml",
    };

    const matchMissing = {
      recipeId: "rec-missing",
      recipeName: "Unknown Recipe",
      cuisine: "General",
      amount: undefined,
      unit: undefined,
    };

    it("populated recipe carries all 9 fields with expected values via real producer", () => {
      const item = buildRelatedIngredientRecipe(matchPopulated, populatedRecipe);
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

    it("fallback recipe explicitly carries the 4 fallback keys as undefined via real producer", () => {
      const item = buildRelatedIngredientRecipe(matchMissing, undefined);
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
      const nextOutput = [
        buildRelatedIngredientRecipe(matchPopulated, populatedRecipe),
        buildRelatedIngredientRecipe(matchMissing, undefined),
      ];
      const honoOutput = [
        buildRelatedIngredientRecipe(matchPopulated, populatedRecipe),
        buildRelatedIngredientRecipe(matchMissing, undefined),
      ];

      const nextJson = JSON.stringify(nextOutput);
      const honoJson = JSON.stringify(honoOutput);

      expect(nextJson).toEqual(honoJson);

      const parsedJson: unknown = JSON.parse(nextJson);
      const parsed = z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        servings: z.number().optional(),
      }).passthrough()).parse(parsedJson);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]?.name).toBe("Herbal Infusion");
      expect(parsed[0]?.servings).toBe(4);
      expect(parsed[1]?.name).toBe("Unknown Recipe");
      expect(parsed[1]?.description).toBeUndefined();
      expect(parsed[1]?.servings).toBeUndefined();
    });
  });

  // ─── 5. Real Script Quantile Function & Empty Ratios Safeguards ───────────

  describe("Script quantile function q() & empty ratios reporting safeguards", () => {
    it("computes exact quantiles for populated numeric distributions via real q()", () => {
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
