import { getServerRecipes } from "@/actions/recipes";
import { readJson } from "@/lib/api/json";
import { savedMenuApiDataSchema } from "@/lib/menu-planner/schemas";
import {
  parseOwnerWeekMenuResponse,
  parsePublicWeekResponse,
} from "../weekMenuParser";

const TS = "2026-11-12T18:30:00.000Z";

function buildWireSlot(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "slot-1",
    dayOfWeek: 2,
    mealType: "dinner",
    servings: 2,
    planetarySnapshot: {
      dominantPlanet: "Sun",
      zodiacSign: "scorpio",
      lunarPhase: "waxing crescent",
      elementalState: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      timestamp: TS,
    },
    createdAt: TS,
    updatedAt: TS,
    ...overrides,
  };
}

function jsonResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("weekMenuParser — happy paths and producer contracts", () => {
  it("parses an owner null menu without throwing", () => {
    const wire: unknown = JSON.parse(JSON.stringify({ success: true, menu: null }));
    expect(parseOwnerWeekMenuResponse(wire)).toEqual({ meals: [] });
  });

  it("parses an owner empty meals array", () => {
    const wire = savedMenuApiDataSchema.parse({
      success: true,
      menu: {
        id: "menu-empty",
        weekStartDate: TS,
        meals: [],
        groceryList: [],
      },
    });
    const roundTripped: unknown = JSON.parse(JSON.stringify(wire));
    expect(parseOwnerWeekMenuResponse(roundTripped)).toEqual({ meals: [] });
  });

  it("round-trips real recipe catalog entries through savedMenuApiDataSchema and owner parser", async () => {
    const [first, second] = await getServerRecipes();
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;

    const ownerWire = savedMenuApiDataSchema.parse({
      success: true,
      menu: {
        id: "menu-real-1",
        weekStartDate: TS,
        meals: [
          buildWireSlot({ dayOfWeek: 0, mealType: "breakfast", recipe: first }),
          buildWireSlot({ id: "slot-2", dayOfWeek: 6, mealType: "snack", recipe: second }),
        ],
        groceryList: [],
      },
    });

    const ownerJson: unknown = JSON.parse(JSON.stringify(ownerWire));
    const parsedOwner = parseOwnerWeekMenuResponse(ownerJson);
    expect(parsedOwner.meals).toHaveLength(2);
    expect(parsedOwner.meals[0]?.dayOfWeek).toBe(0);
    expect(parsedOwner.meals[0]?.mealType).toBe("breakfast");
    expect(parsedOwner.meals[0]?.recipe?.elementalProperties).toEqual(first.elementalProperties);
    expect(parsedOwner.meals[1]?.dayOfWeek).toBe(6);
    expect(parsedOwner.meals[1]?.mealType).toBe("snack");
  });

  it("round-trips real recipe catalog entries through public-week wire shape", async () => {
    const [first] = await getServerRecipes();
    expect(first).toBeDefined();
    if (!first) return;

    const publicJson: unknown = JSON.parse(
      JSON.stringify({
        success: true,
        userId: "user-1",
        displayName: null,
        weekStartDate: TS,
        updatedAt: TS,
        meals: [
          {
            dayOfWeek: 0,
            mealType: "lunch",
            servings: 1,
            isLocked: false,
            recipe: {
              id: first.id,
              name: first.name,
              elementalProperties: first.elementalProperties ?? null,
            },
          },
          { dayOfWeek: 4, mealType: "dinner", servings: 2, isLocked: true },
        ],
      }),
    );

    const parsedPublic = parsePublicWeekResponse(publicJson);
    expect(parsedPublic.updatedAt).toBe(TS);
    expect(parsedPublic.meals).toEqual([
      {
        dayOfWeek: 0,
        mealType: "lunch",
        recipe: { elementalProperties: first.elementalProperties },
      },
      { dayOfWeek: 4, mealType: "dinner" },
    ]);
  });

  it("accepts all DayOfWeek (0..6) and MealType values and null recipe/elementalProperties", () => {
    const publicJson: unknown = JSON.parse(
      JSON.stringify({
        success: true,
        userId: "user-2",
        displayName: "Cook",
        weekStartDate: TS,
        updatedAt: null,
        meals: [
          { dayOfWeek: 0, mealType: "breakfast", recipe: null },
          { dayOfWeek: 1, mealType: "lunch", recipe: { id: "r1", elementalProperties: null } },
          { dayOfWeek: 2, mealType: "dinner" },
          { dayOfWeek: 3, mealType: "snack", recipe: { elementalProperties: { Fire: 1 } } },
          { dayOfWeek: 4, mealType: "breakfast", recipe: { id: "r2" } },
          { dayOfWeek: 5, mealType: "lunch" },
          { dayOfWeek: 6, mealType: "dinner" },
        ],
      }),
    );

    const parsed = parsePublicWeekResponse(publicJson);
    expect(parsed.updatedAt).toBeNull();
    expect(parsed.meals).toHaveLength(7);
    expect(parsed.meals[0]).toEqual({ dayOfWeek: 0, mealType: "breakfast" });
    expect(parsed.meals[1]).toEqual({ dayOfWeek: 1, mealType: "lunch", recipe: {} });
    expect(parsed.meals[4]).toEqual({ dayOfWeek: 4, mealType: "breakfast", recipe: {} });
  });

  it("integrates with readJson and rejects real JSON null and API refusal bodies", async () => {
    const okRes = jsonResponse(
      JSON.stringify({
        success: true,
        menu: { meals: [{ dayOfWeek: 3, mealType: "lunch" }] },
      }),
    );
    await expect(readJson(okRes, parseOwnerWeekMenuResponse)).resolves.toEqual({
      meals: [{ dayOfWeek: 3, mealType: "lunch" }],
    });

    const nullRes = jsonResponse("null");
    await expect(readJson(nullRes, parseOwnerWeekMenuResponse)).rejects.toThrow();

    const okPublicRes = jsonResponse(
      JSON.stringify({
        success: true,
        updatedAt: TS,
        meals: [{ dayOfWeek: 5, mealType: "dinner" }],
      }),
    );
    await expect(readJson(okPublicRes, parsePublicWeekResponse)).resolves.toEqual({
      updatedAt: TS,
      meals: [{ dayOfWeek: 5, mealType: "dinner" }],
    });

    const refusalRes = jsonResponse(
      JSON.stringify({ success: false, error: "Profile not found" }),
    );
    await expect(readJson(refusalRes, parsePublicWeekResponse)).rejects.toThrow();
  });
});
