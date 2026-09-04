jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/services/menuPersistenceService", () => ({
  menuPersistenceService: {
    getMenu: jest.fn(),
    upsertMenu: jest.fn(),
  },
}));

import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import { GET, PUT } from "@/app/api/menu-planner/menus/route";
import type { NextRequest } from "next/server";

function makeRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe("PUT /api/menu-planner/menus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue("user-1");
    (menuPersistenceService.upsertMenu as jest.Mock).mockResolvedValue({
      id: "menu-1",
    });
  });

  it("rejects a malformed nested meal before persistence", async () => {
    const response = await PUT(
      makeRequest({
        weekStartDate: "2026-08-23T00:00:00.000Z",
        meals: [{ id: "incomplete-meal" }],
      }),
    );

    expect(response.status).toBe(400);
    expect(menuPersistenceService.upsertMenu).not.toHaveBeenCalled();
  });

  it("rejects non-ISO dates instead of coercing them", async () => {
    const response = await PUT(makeRequest({ weekStartDate: null }));

    expect(response.status).toBe(400);
    expect(menuPersistenceService.upsertMenu).not.toHaveBeenCalled();
  });

  it("rejects malformed nested planetary positions", async () => {
    const response = await PUT(
      makeRequest({
        weekStartDate: "2026-08-23T00:00:00.000Z",
        meals: [
          {
            id: "slot-1",
            dayOfWeek: 0,
            mealType: "dinner",
            servings: 1,
            planetarySnapshot: {
              dominantPlanet: "Sun",
              zodiacSign: "aries",
              lunarPhase: "new moon",
              elementalState: {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25,
              },
              planetaryPositions: { Sun: 3 },
              timestamp: "2026-08-23T00:00:00.000Z",
            },
            createdAt: "2026-08-23T00:00:00.000Z",
            updatedAt: "2026-08-23T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(response.status).toBe(400);
    expect(menuPersistenceService.upsertMenu).not.toHaveBeenCalled();
  });

  it("normalizes the title omitted by unified menu recipes", async () => {
    const response = await PUT(
      makeRequest({
        weekStartDate: "2026-08-23T00:00:00.000Z",
        meals: [
          {
            id: "slot-1",
            dayOfWeek: 0,
            mealType: "dinner",
            servings: 1,
            recipe: {
              id: "recipe-1",
              name: "Sunset Stew",
              ingredients: [],
              instructions: [],
              elementalProperties: {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25,
              },
            },
            planetarySnapshot: {
              dominantPlanet: "Sun",
              zodiacSign: "aries",
              lunarPhase: "new moon",
              elementalState: {
                Fire: 0.25,
                Water: 0.25,
                Earth: 0.25,
                Air: 0.25,
              },
              timestamp: "2026-08-23T00:00:00.000Z",
            },
            createdAt: "2026-08-23T00:00:00.000Z",
            updatedAt: "2026-08-23T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(response.status).toBe(200);
    expect(menuPersistenceService.upsertMenu).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        meals: [
          expect.objectContaining({
            recipe: expect.objectContaining({
              name: "Sunset Stew",
              title: "Sunset Stew",
            }),
          }),
        ],
      }),
    );
  });

  it("normalizes a minimal valid payload to the persistence contract", async () => {
    const response = await PUT(
      makeRequest({ weekStartDate: "2026-08-23T00:00:00.000Z" }),
    );

    expect(response.status).toBe(200);
    expect(menuPersistenceService.upsertMenu).toHaveBeenCalledWith("user-1", {
      weekStartDate: new Date("2026-08-23T00:00:00.000Z"),
      meals: [],
      nutritionalTotals: {},
      groceryList: [],
      inventory: [],
      weeklyBudget: null,
    });
  });
});

describe("GET /api/menu-planner/menus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserIdFromRequest as jest.Mock).mockResolvedValue("user-1");
  });

  function makeGetRequest(url: string): NextRequest {
    return { url } as unknown as NextRequest;
  }

  it("requires authentication", async () => {
    (getUserIdFromRequest as jest.Mock).mockResolvedValue(null);
    const response = await GET(
      makeGetRequest("http://localhost/api/menu-planner/menus?weekStartDate=2026-08-23T00:00:00.000Z"),
    );
    expect(response.status).toBe(401);
  });

  it("requires weekStartDate parameter", async () => {
    const response = await GET(
      makeGetRequest("http://localhost/api/menu-planner/menus"),
    );
    expect(response.status).toBe(400);
  });

  it("rejects invalid weekStartDate", async () => {
    const response = await GET(
      makeGetRequest("http://localhost/api/menu-planner/menus?weekStartDate=invalid-date"),
    );
    expect(response.status).toBe(400);
  });

  it("returns null menu when no menu exists", async () => {
    (menuPersistenceService.getMenu as jest.Mock).mockResolvedValue(null);
    const response = await GET(
      makeGetRequest("http://localhost/api/menu-planner/menus?weekStartDate=2026-08-23T00:00:00.000Z"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true, menu: null });
  });

  it("returns validated and normalized menu when menu exists", async () => {
    const persisted = {
      id: "menu-123",
      weekStartDate: new Date("2026-08-23T00:00:00.000Z"),
      meals: [],
      nutritionalTotals: {},
      groceryList: [],
      inventory: ["salt", "pepper"],
      weeklyBudget: 150,
      isTemplate: false,
      templateName: null,
      createdAt: new Date("2026-08-23T00:00:00.000Z"),
      updatedAt: new Date("2026-08-23T00:00:00.000Z"),
    };
    (menuPersistenceService.getMenu as jest.Mock).mockResolvedValue(persisted);

    const response = await GET(
      makeGetRequest("http://localhost/api/menu-planner/menus?weekStartDate=2026-08-23T00:00:00.000Z"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.menu.id).toBe("menu-123");
    expect(body.menu.savedAsTemplate).toBe(false);
    expect(body.menu.inventory).toEqual(["salt", "pepper"]);
  });
});

