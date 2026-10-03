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
  },
}));

import { POST } from "@/app/api/menu-planner/agent-weekly-menu/route";
import { feedDatabase } from "@/services/feedDatabaseService";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import { userDatabase } from "@/services/userDatabaseService";
import { NextRequest } from "next/server";
import type { UserWithProfile } from "@/services/userDatabaseService";

const mockedEnsureAgent = userDatabase.ensurePlanetaryAgent as jest.MockedFunction<
  typeof userDatabase.ensurePlanetaryAgent
>;
const mockedUpsertMenu =
  menuPersistenceService.upsertMenu as jest.MockedFunction<
    typeof menuPersistenceService.upsertMenu
  >;
const mockedCreateEvent = feedDatabase.createEvent as jest.MockedFunction<
  typeof feedDatabase.createEvent
>;

function makeRequest(json: unknown, token = "secret"): NextRequest {
  return new NextRequest("http://x/api/menu-planner/agent-weekly-menu", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
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
      weekStartDate: new Date("2026-06-01T00:00:00.000Z"),
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
  });

  afterEach(() => {
    delete process.env.INTERNAL_API_SECRET;
  });

  it("rejects requests without the internal bearer token", async () => {
    const response = await POST(makeRequest({}, "wrong"));
    expect(response.status).toBe(401);
  });

  it("persists a completed agent menu and shares a weekly_menu feed event", async () => {
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        agentDisplayName: "Saturn",
        weekStartDate: "2026-06-01T00:00:00.000Z",
        status: "completed",
        shareToFeed: true,
        title: "Saturnine Hearth Week",
        summary: "Slow braises, grains, and mineral-rich greens.",
        meals: [
          {
            id: "1-breakfast",
            dayOfWeek: 1,
            mealType: "breakfast",
            servings: 1,
            recipe: { id: "oat-1", name: "Moonlit Oats" },
            planetarySnapshot: {},
            createdAt: "2026-05-31T00:00:00.000Z",
            updatedAt: "2026-05-31T00:00:00.000Z",
          },
        ],
        groceryList: [{ id: "g1", ingredient: "oats" }],
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.feedShared).toBe(true);
    expect(mockedEnsureAgent).toHaveBeenCalledWith(
      "saturn@agentic.alchm.kitchen",
      "Saturn",
    );
    expect(mockedUpsertMenu).toHaveBeenCalledWith(
      "agent-user-id",
      expect.objectContaining({
        weekStartDate: expect.any(Date),
        meals: expect.any(Array),
        groceryList: expect.any(Array),
      }),
    );
    expect(mockedCreateEvent).toHaveBeenCalledWith(
      "agent-user-id",
      "weekly_menu",
      expect.objectContaining({
        menuId: "menu-id",
        eventType: "weekly_menu",
        menuTitle: "Saturnine Hearth Week",
        mealCount: 1,
        featuredMeals: [
          {
            dayOfWeek: 1,
            mealType: "breakfast",
            recipeId: "oat-1",
            recipeName: "Moonlit Oats",
          },
        ],
      }),
      true,
    );
  });

  it("does not store an agent's flat nutritional totals (they became seven 0 kcal days)", async () => {
    // ASOL's generate route sends one flat, model-estimated object with no
    // stated basis (daily or weekly). The route used to turn it into seven
    // zero days; nothing reads the column, so nothing is stored (ruling 2026-09-27).
    const response = await POST(
      makeRequest({
        agentSlug: "saturn",
        weekStartDate: "2026-06-01T00:00:00.000Z",
        meals: [
          {
            id: "1-dinner",
            dayOfWeek: 1,
            mealType: "dinner",
            servings: 1,
            recipe: { id: "stew-1", name: "Saturnine Stew" },
            planetarySnapshot: {},
            createdAt: "2026-05-31T00:00:00.000Z",
            updatedAt: "2026-05-31T00:00:00.000Z",
          },
        ],
        nutritionalTotals: { calories: 2100, protein: 90, carbs: 250, fat: 70 },
      }),
    );

    expect(response.status).toBe(200);
    const stored = mockedUpsertMenu.mock.lastCall?.[1];
    expect(stored).toMatchObject({ weekStartDate: expect.any(Date) });
    expect(stored).not.toHaveProperty("nutritionalTotals");
  });
});
