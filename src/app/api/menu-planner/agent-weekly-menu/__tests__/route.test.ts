jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    ensureAgent: jest.fn(),
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
import type { NextRequest } from "next/server";

const mockedEnsureAgent = userDatabase.ensureAgent as jest.MockedFunction<
  typeof userDatabase.ensureAgent
>;
const mockedUpsertMenu =
  menuPersistenceService.upsertMenu as jest.MockedFunction<
    typeof menuPersistenceService.upsertMenu
  >;
const mockedCreateEvent = feedDatabase.createEvent as jest.MockedFunction<
  typeof feedDatabase.createEvent
>;

function makeRequest(json: unknown, token = "secret"): NextRequest {
  return new Request("http://x/api/menu-planner/agent-weekly-menu", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(json),
  }) as unknown as NextRequest;
}

describe("POST /api/menu-planner/agent-weekly-menu", () => {
  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "secret";
    mockedEnsureAgent.mockResolvedValue({
      id: "agent-user-id",
      email: "saturn@agentic.alchm.kitchen",
      passwordHash: "AGENT_NO_LOGIN",
      roles: ["user"],
      isActive: true,
      isAgent: true,
      createdAt: new Date("2026-05-31T00:00:00.000Z"),
      profile: {
        userId: "agent-user-id",
        name: "Saturn",
        email: "saturn@agentic.alchm.kitchen",
        preferences: {},
        groupMembers: [],
        diningGroups: [],
      },
    } as any);
    mockedUpsertMenu.mockResolvedValue({
      id: "menu-id",
      weekStartDate: new Date("2026-06-01T00:00:00.000Z"),
      meals: [],
      nutritionalTotals: {} as any,
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
});
