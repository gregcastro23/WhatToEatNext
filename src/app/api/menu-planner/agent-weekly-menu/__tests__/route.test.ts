jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    ensurePlanetaryAgent: jest.fn(),
  },
}));

jest.mock("@/services/menuPersistenceService", () => ({
  menuPersistenceService: {
    getMenu: jest.fn(),
    upsertMenu: jest.fn(),
  },
}));

jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: {
    createEvent: jest.fn(),
    publishFeedEvent: jest.fn(),
  },
}));

jest.mock("@/lib/recipes/recipeCatalogValidation", () => ({
  validateMenuRecipeReference: jest.fn(async (recipe: any) => {
    if (!recipe || !recipe.id) return { valid: false, error: "Missing recipe specification" };
    if (recipe.kind === "saved-adaptation" || recipe.source === "saved-adaptation") {
      return { valid: false, isForgedAdaptation: true, error: "Forged reserved adaptation provenance is prohibited" };
    }
    if (recipe.id === "unknown-recipe") {
      return { valid: false, isUnknownRecipe: true, error: "Unknown recipe reference" };
    }
    return { valid: true };
  }),
  isKnownAuthoritativeRecipe: jest.fn(async (id: string) => id !== "unknown-recipe"),
}));

import { POST, GET } from "@/app/api/menu-planner/agent-weekly-menu/route";
import { feedDatabase } from "@/services/feedDatabaseService";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import { userDatabase } from "@/services/userDatabaseService";
import { NextRequest } from "next/server";
import type { UserWithProfile } from "@/services/userDatabaseService";

const mockedEnsureAgent = userDatabase.ensurePlanetaryAgent as jest.MockedFunction<
  typeof userDatabase.ensurePlanetaryAgent
>;
const mockedUpsertMenu = jest.mocked(menuPersistenceService.upsertMenu);
const mockedCreateEvent = feedDatabase.createEvent as jest.MockedFunction<
  typeof feedDatabase.createEvent
>;

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

function build28ValidSlots(baseRecipeId = "valid-recipe-1") {
  const slots = [];
  for (let day = 0; day <= 6; day++) {
    for (const mealType of MEAL_TYPES) {
      slots.push({
        id: `${day}-${mealType}`,
        dayOfWeek: day,
        mealType,
        servings: 2,
        recipe: { id: `${baseRecipeId}-${day}-${mealType}`, name: `Recipe ${day} ${mealType}` },
        planetarySnapshot: {},
      });
    }
  }
  return slots;
}

function makeRequest(json: unknown, token = "secret", headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://x/api/menu-planner/agent-weekly-menu", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body: JSON.stringify(json),
  });
}

describe("POST /api/menu-planner/agent-weekly-menu", () => {
  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "secret";
    const mockAgent: UserWithProfile = {
      id: "agent-user-id",
      email: "saturn@agentic.alchm.kitchen",
      passwordHash: "AGENT_NO_LOGIN",
      roles: ["user"],
      isActive: true,
      isAgent: true,
      createdAt: new Date("2026-05-31T00:00:00.000Z"),
      updatedAt: new Date("2026-05-31T00:00:00.000Z"),
      profile: {
        userId: "agent-user-id",
        name: "Saturn",
        email: "saturn@agentic.alchm.kitchen",
        preferences: {
          theme: "system",
          cuisinePreferences: [],
          dietaryRestrictions: [],
          favoriteIngredients: [],
          dislikedIngredients: [],
          cookingSkillLevel: "intermediate",
          spiceTolerance: "medium",
          elementalPreferences: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          notifications: { email: false, browser: false, mealReminders: false },
        },
        groupMembers: [],
        diningGroups: [],
      },
    };
    mockedEnsureAgent.mockResolvedValue(mockAgent);
    mockedUpsertMenu.mockResolvedValue({
      id: "menu-id",
      weekStartDate: new Date("2026-05-31T00:00:00.000Z"),
      meals: [],
      groceryList: [],
      inventory: [],
      weeklyBudget: null,
      isTemplate: false,
      templateName: null,
      createdAt: new Date("2026-05-31T00:00:00.000Z"),
      updatedAt: new Date("2026-05-31T00:00:00.000Z"),
    });
    mockedCreateEvent.mockResolvedValue(true);
    jest.mocked(feedDatabase.publishFeedEvent).mockResolvedValue({
      feedPublished: true,
      eventId: "feed-id-1",
      success: true,
    });
  });

  afterEach(() => {
    delete process.env.INTERNAL_API_SECRET;
  });

  it("rejects requests without the internal bearer token", async () => {
    const response = await POST(makeRequest({}, "wrong"));
    expect(response.status).toBe(401);
  });

  it("persists a completed 28-slot menu and shares a weekly_menu feed event", async () => {
    const slots = build28ValidSlots();
    const response = await POST(
      makeRequest(
        {
          agentSlug: "saturn",
          agentDisplayName: "Saturn",
          // 2026-05-31 is Sunday
          weekStartDate: "2026-05-31T00:00:00.000Z",
          status: "completed",
          shareToFeed: true,
          title: "Saturnine Hearth Week",
          summary: "Slow braises, grains, and mineral-rich greens.",
          meals: slots,
          featuredMeals: [
            {
              dayOfWeek: 0,
              mealType: "breakfast",
              recipeId: "valid-recipe-1-0-breakfast",
              recipeName: "Recipe 0 breakfast",
            },
          ],
          groceryList: [{ id: "g1", ingredient: "oats" }],
        },
        "secret",
        { "Idempotency-Key": "menu-delivery-key-1" },
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.feedShared).toBe(true);
    expect(body.deliveryId).toBe("menu-delivery-key-1");
    expect(body.receipt).toMatchObject({
      success: true,
      feedPublished: true,
      operation: "weekly_menu_publish",
      outcomes: {
        feed: { status: "published" },
        menu: { status: "persisted", id: "menu-id" },
      },
    });
    expect(mockedEnsureAgent).toHaveBeenCalledWith(
      "saturn@agentic.alchm.kitchen",
      "Saturn",
    );
    expect(mockedUpsertMenu).toHaveBeenCalledWith(
      "agent-user-id",
      expect.objectContaining({
        weekStartDate: expect.any(Date),
        meals: expect.any(Array),
      }),
    );
  });

  it("normalizes weekStartDate to Sunday midnight UTC", async () => {
    const slots = build28ValidSlots();
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        // Sunday at 14:30 UTC
        weekStartDate: "2026-05-31T14:30:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
      }),
    );

    expect(response.status).toBe(200);
    const stored = mockedUpsertMenu.mock.lastCall?.[1];
    expect(stored?.weekStartDate.toISOString()).toBe("2026-05-31T00:00:00.000Z");
  });

  it("rejects non-Sunday weekStartDate for completed menu publication", async () => {
    const slots = build28ValidSlots();
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        // 2026-06-03 is Wednesday
        weekStartDate: "2026-06-03T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Sunday/);
  });

  it("rejects draft status combined with shareToFeed: true", async () => {
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "draft",
        shareToFeed: true,
        meals: [{ id: "1", dayOfWeek: 0, mealType: "breakfast", servings: 1 }],
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Draft menus cannot be published/);
  });

  it("accepts valid partial draft without imposing 28 slots and never shares to feed", async () => {
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "draft",
        shareToFeed: false,
        meals: [
          {
            id: "draft-1",
            dayOfWeek: 0,
            mealType: "breakfast",
            servings: 1,
            recipe: { id: "any-recipe", name: "Draft Dish" },
          },
        ],
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.feedShared).toBe(false);
    expect(mockedCreateEvent).not.toHaveBeenCalled();
  });

  it("rejects completed menu with fewer than 28 slots (e.g. 27)", async () => {
    const slots = build28ValidSlots().slice(0, 27);
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/exactly 28 slots/);
  });

  it("rejects fractional or invalid dayOfWeek in slots", async () => {
    const slots = build28ValidSlots();
    slots[0].dayOfWeek = 1.5;
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/integer between 0 and 6/);
  });

  it("rejects duplicate day/mealType slots", async () => {
    const slots = build28ValidSlots();
    // Replace slot 1 with duplicate of slot 0
    slots[1] = { ...slots[0] };
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Duplicate meal slot/);
  });

  it("rejects unknown recipe in slot", async () => {
    const slots = build28ValidSlots();
    slots[0].recipe = { id: "unknown-recipe", name: "Ghost Recipe" };
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Unknown recipe reference/);
  });

  it("rejects forged reserved adaptation provenance in slot recipe", async () => {
    const slots = build28ValidSlots();
    slots[0].recipe = {
      id: "valid-recipe-1-0-breakfast",
      name: "Forged Recipe",
      kind: "saved-adaptation",
    };
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Forged reserved adaptation/);
  });

  it("rejects featured meal that does not match assigned slot recipe", async () => {
    const slots = build28ValidSlots();
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        meals: slots,
        featuredMeals: [
          {
            dayOfWeek: 0,
            mealType: "breakfast",
            recipeId: "different-recipe-id",
            recipeName: "Different Recipe",
          },
        ],
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Featured meal.*references recipe.*but slot has/);
  });

  it("returns 400 when header and body delivery keys conflict", async () => {
    const slots = build28ValidSlots();
    const response = await POST(
      makeRequest(
        {
          agentSlug: "saturn",
          weekStartDate: "2026-05-31T00:00:00.000Z",
          status: "completed",
          shareToFeed: true,
          meals: slots,
          idempotencyKey: "body-key-a",
        },
        "secret",
        { "Idempotency-Key": "header-key-b" },
      ),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/Delivery key mismatch/);
  });

  it("returns deduplicated receipt on identical replay without duplicating feed writes", async () => {
    const slots = build28ValidSlots();
    const reqData = {
      agentSlug: "saturn",
      weekStartDate: "2026-05-31T00:00:00.000Z",
      status: "completed",
      shareToFeed: true,
      meals: slots,
    };

    const deliveryKey = "dedup-menu-key-100";
    const res1 = await POST(makeRequest(reqData, "secret", { "Idempotency-Key": deliveryKey }));
    expect(res1.status).toBe(200);

    const callCountBefore = mockedCreateEvent.mock.calls.length;

    // Replay exact same request
    const res2 = await POST(makeRequest(reqData, "secret", { "Idempotency-Key": deliveryKey }));
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.deduplicated).toBe(true);
    expect(mockedCreateEvent.mock.calls.length).toBe(callCountBefore);
  });

  it("returns 409 PAYLOAD_CONFLICT when same key is used with changed payload", async () => {
    const slots = build28ValidSlots();
    const deliveryKey = "conflict-menu-key-200";

    const res1 = await POST(
      makeRequest(
        {
          agentSlug: "saturn",
          weekStartDate: "2026-05-31T00:00:00.000Z",
          status: "completed",
          shareToFeed: true,
          title: "Version 1",
          meals: slots,
        },
        "secret",
        { "Idempotency-Key": deliveryKey },
      ),
    );
    expect(res1.status).toBe(200);

    // Replay with changed title
    const res2 = await POST(
      makeRequest(
        {
          agentSlug: "saturn",
          weekStartDate: "2026-05-31T00:00:00.000Z",
          status: "completed",
          shareToFeed: true,
          title: "Version 2 CHANGED",
          meals: slots,
        },
        "secret",
        { "Idempotency-Key": deliveryKey },
      ),
    );
    expect(res2.status).toBe(409);
    const body2 = await res2.json();
    expect(body2.code).toBe("PAYLOAD_CONFLICT");
  });

  it("returns success: false (502) when feed publication was requested but feed write fails", async () => {
    mockedCreateEvent.mockResolvedValueOnce(false);
    jest.mocked(feedDatabase.publishFeedEvent).mockResolvedValueOnce({
      feedPublished: false,
      error: "Feed persistence failed",
      success: false,
    });
    const slots = build28ValidSlots();
    const response = await POST(
      makeRequest(
        {
          agentSlug: "saturn",
          weekStartDate: "2026-05-31T00:00:00.000Z",
          status: "completed",
          shareToFeed: true,
          meals: slots,
        },
        "secret",
        { "Idempotency-Key": "fail-feed-key-300" },
      ),
    );

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.feedShared).toBe(false);
    expect(body.menu).toBeDefined(); // Menu was persisted
    expect(body.receipt.outcomes.feed.status).toBe("failed");
    expect(body.receipt.outcomes.menu.status).toBe("persisted");
  });

  it("does not store flat nutritionalTotals (strips them)", async () => {
    const slots = build28ValidSlots();
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-05-31T00:00:00.000Z",
        status: "completed",
        shareToFeed: false,
        meals: slots,
        nutritionalTotals: { calories: 2100, protein: 90, carbs: 250, fat: 70 },
      }),
    );

    expect(response.status).toBe(200);
    const stored = mockedUpsertMenu.mock.lastCall?.[1];
    expect(stored).not.toHaveProperty("nutritionalTotals");
  });
});
