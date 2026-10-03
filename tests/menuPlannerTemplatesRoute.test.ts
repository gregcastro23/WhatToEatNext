/**
 * A saved template stores no nutrition totals (owner ruling 2026-09-27): the
 * planner sent createInitialMenu's seven all-zero days, and nothing read them
 * back (loadTemplate starts from a fresh menu).
 */
jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/services/menuPersistenceService", () => ({
  menuPersistenceService: {
    getTemplates: jest.fn(),
    saveTemplate: jest.fn(),
  },
}));

import { POST } from "@/app/api/menu-planner/templates/route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import { NextRequest } from "next/server";

const zeroDay = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sodium: 0,
  sugar: 0,
  gregsEnergy: 0,
  monicaConstant: 0,
  kalchm: 0,
  elementalBalance: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
};

function postTemplate(body: unknown): Promise<Response> {
  return POST(
    new NextRequest("http://x/api/menu-planner/templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/menu-planner/templates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getUserIdFromRequest).mockResolvedValue("user-1");
    jest.mocked(menuPersistenceService.saveTemplate).mockResolvedValue({
      id: "template-1",
      weekStartDate: new Date("2026-08-23T00:00:00.000Z"),
      meals: [],
      groceryList: [],
      inventory: [],
      weeklyBudget: null,
      isTemplate: true,
      templateName: "Harvest week",
      createdAt: new Date("2026-08-23T00:00:00.000Z"),
      updatedAt: new Date("2026-08-23T00:00:00.000Z"),
    });
  });

  it("saves the template without the nutrition totals the client sends", async () => {
    const response = await postTemplate({
      name: "Harvest week",
      weekStartDate: "2026-08-23T00:00:00.000Z",
      nutritionalTotals: { 0: zeroDay, 1: zeroDay, 2: zeroDay, 3: zeroDay, 4: zeroDay, 5: zeroDay, 6: zeroDay },
    });

    expect(response.status).toBe(201);
    const saved = jest.mocked(menuPersistenceService.saveTemplate).mock.lastCall?.[1];
    expect(saved).toMatchObject({ name: "Harvest week" });
    expect(saved?.menu).toEqual({
      weekStartDate: new Date("2026-08-23T00:00:00.000Z"),
      meals: [],
      groceryList: [],
      inventory: [],
      weeklyBudget: null,
    });
  });

  it("still requires a name", async () => {
    const response = await postTemplate({ weekStartDate: "2026-08-23T00:00:00.000Z" });
    expect(response.status).toBe(400);
    expect(menuPersistenceService.saveTemplate).not.toHaveBeenCalled();
  });
});
