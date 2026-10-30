/**
 * Tests for Phase 44 Target 4 response schemas and state recovery.
 *
 * Verifies that:
 * 1. Valid route payloads round-trip through JSON wire format cleanly.
 * 2. Nested complex structures (compositeSnapshot, tableMemory) validate correctly.
 * 3. Fallbacks for unstandardized units / legacy food sources succeed without failing.
 * 4. Malformed 2xx payloads are rejected by safeParse so callers can retain prior state.
 *
 * @file src/lib/validation/__tests__/phase44ResponseRecovery.test.ts
 */

import {
  FoodDiaryFoodSourceSchema,
  FoodDiaryListResponseSchema,
  FoodDiaryMutationResponseSchema,
  FoodDiaryServingUnitSchema,
} from "../foodDiaryResponseSchemas";
import {
  TableDetailApiResponseSchema,
  TablesApiResponseSchema,
} from "../tableResponseSchemas";
import type { FoodDiaryEntry } from "@/types/foodDiary";
import type { TableDetail, TableRecord } from "@/types/table";

const wire = (val: unknown): unknown => JSON.parse(JSON.stringify(val));

describe("Phase 44 Target 4 — Table Response Schemas", () => {
  const validTableRecord: TableRecord = {
    id: "table-123",
    hostId: "user-host-1",
    title: "Alchemical Equinox Dinner",
    description: "Gathering of minds",
    scheduledAt: "2026-10-15T19:00:00.000Z",
    venue: {
      type: "home",
      name: "The Hearth",
      address: "123 Crucible Way",
    },
    status: "planned",
    visibility: "commensals",
    menu: [
      { name: "Braised Fennel", course: "Starter", status: "upcoming" },
      { name: "Solar Saffron Risotto", course: "Main" },
    ],
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
  };

  const validTableDetail: TableDetail = {
    ...validTableRecord,
    members: [
      {
        id: "member-1",
        tableId: "table-123",
        userId: "user-host-1",
        role: "host",
        rsvpStatus: "joined",
        joinedVia: "host",
        name: "Head Chef",
        createdAt: "2026-10-01T12:00:00.000Z",
        updatedAt: "2026-10-01T12:00:00.000Z",
      },
    ],
    photos: [
      {
        id: "photo-1",
        tableId: "table-123",
        uploaderId: "user-host-1",
        url: "https://images.alchm.kitchen/table1.jpg",
        createdAt: "2026-10-01T12:00:00.000Z",
      },
    ],
    invites: [
      {
        id: "invite-1",
        tableId: "table-123",
        token: "tok-abc",
        url: "https://alchm.kitchen/t/tok-abc",
        createdBy: "user-host-1",
        maxUses: 5,
        useCount: 1,
        expiresAt: "2026-10-15T19:00:00.000Z",
        createdAt: "2026-10-01T12:00:00.000Z",
      },
    ],
  };

  describe("TablesApiResponseSchema (GET /api/tables)", () => {
    it("successfully parses a valid tables list response", () => {
      const response = {
        success: true,
        tables: [validTableRecord],
      };
      const parsed = TablesApiResponseSchema.safeParse(wire(response));
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.tables).toHaveLength(1);
        expect(parsed.data.tables?.[0]?.title).toBe("Alchemical Equinox Dinner");
      }
    });

    it("rejects malformed 2xx responses missing required table fields", () => {
      const malformedPayload = {
        success: true,
        tables: [
          {
            id: "bad-table",
            // missing hostId, title, scheduledAt, status, etc.
          },
        ],
      };
      const parsed = TablesApiResponseSchema.safeParse(wire(malformedPayload));
      expect(parsed.success).toBe(false);
    });

    it("rejects non-array tables property", () => {
      const malformedPayload = {
        success: true,
        tables: "not-an-array",
      };
      const parsed = TablesApiResponseSchema.safeParse(wire(malformedPayload));
      expect(parsed.success).toBe(false);
    });
  });

  describe("TableDetailApiResponseSchema (GET /api/tables/[tableId])", () => {
    it("successfully parses a full table detail response", () => {
      const response = {
        success: true,
        table: validTableDetail,
        viewerId: "user-host-1",
        joinedCount: 1,
      };
      const parsed = TableDetailApiResponseSchema.safeParse(wire(response));
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.table?.members).toHaveLength(1);
        expect(parsed.data.table?.photos).toHaveLength(1);
        expect(parsed.data.viewerId).toBe("user-host-1");
      }
    });

    it("rejects malformed 2xx table detail payload", () => {
      const malformedPayload = {
        success: true,
        table: {
          id: "table-123",
          status: "invalid-status",
        },
      };
      const parsed = TableDetailApiResponseSchema.safeParse(wire(malformedPayload));
      expect(parsed.success).toBe(false);
    });
  });
});

describe("Phase 44 Target 4 — Food Diary Response Schemas", () => {
  const validEntry: FoodDiaryEntry = {
    id: "entry-1",
    userId: "user-1",
    foodName: "Wild Chanterelle Sauté",
    foodSource: "recipe",
    date: new Date("2026-10-01T12:00:00.000Z"),
    mealType: "dinner",
    time: "19:30",
    serving: {
      amount: 1,
      unit: "serving",
      grams: 200,
      description: "1 plate",
    },
    quantity: 1,
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 14,
      fat: 18,
      fiber: 6,
    },
    nutritionConfidence: "high",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.4,
      Air: 0.1,
    },
    rating: 4.5,
    moodTags: ["energized", "satisfied"],
    isFavorite: true,
    tags: ["foraged", "mushrooms"],
    createdAt: new Date("2026-10-01T19:35:00.000Z"),
    updatedAt: new Date("2026-10-01T19:35:00.000Z"),
  };

  describe("FoodDiaryListResponseSchema (GET /api/food-diary)", () => {
    it("successfully parses valid entries list with dates coerced to Date objects", () => {
      const response = {
        success: true,
        entries: [validEntry],
        count: 1,
        summary: {
          totalCalories: 280,
          totalProtein: 8,
          totalCarbs: 14,
          totalFat: 18,
        },
      };
      const parsed = FoodDiaryListResponseSchema.safeParse(wire(response));
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.entries).toHaveLength(1);
        const parsedEntry = parsed.data.entries?.[0];
        expect(parsedEntry?.foodName).toBe("Wild Chanterelle Sauté");
        expect(parsedEntry?.date).toBeInstanceOf(Date);
        expect(parsedEntry?.createdAt).toBeInstanceOf(Date);
        expect(parsedEntry?.nutrition.calories).toBe(280);
      }
    });

    it("rejects malformed 2xx entries list", () => {
      const malformedPayload = {
        success: true,
        entries: [
          {
            id: "bad-entry",
            // missing foodName, mealType, time, serving, etc.
          },
        ],
      };
      const parsed = FoodDiaryListResponseSchema.safeParse(wire(malformedPayload));
      expect(parsed.success).toBe(false);
    });
  });

  describe("FoodDiaryMutationResponseSchema (POST /api/food-diary)", () => {
    it("successfully parses valid single entry mutation response", () => {
      const response = {
        success: true,
        entry: validEntry,
      };
      const parsed = FoodDiaryMutationResponseSchema.safeParse(wire(response));
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.entry?.id).toBe("entry-1");
        expect(parsed.data.entry?.foodSource).toBe("recipe");
      }
    });

    it("falls back gracefully when serving unit is unstandardized", () => {
      expect(FoodDiaryServingUnitSchema.parse("bowl")).toBe("serving");
      expect(FoodDiaryServingUnitSchema.parse("cup")).toBe("cup");
      expect(FoodDiaryServingUnitSchema.parse("g")).toBe("g");
    });

    it("falls back gracefully when food source is an unknown value and preserves manual", () => {
      expect(FoodDiaryFoodSourceSchema.parse("manual")).toBe("manual");
      expect(FoodDiaryFoodSourceSchema.parse("unknown_legacy_val")).toBe("custom");
      expect(FoodDiaryFoodSourceSchema.parse("recipe")).toBe("recipe");
      expect(FoodDiaryFoodSourceSchema.parse("restaurant")).toBe("restaurant");
    });

    it("rejects malformed 2xx mutation response", () => {
      const malformedPayload = {
        success: true,
        entry: {
          id: "incomplete-entry",
        },
      };
      const parsed = FoodDiaryMutationResponseSchema.safeParse(wire(malformedPayload));
      expect(parsed.success).toBe(false);
    });
  });
});
