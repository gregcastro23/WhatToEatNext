import { mealSlotSchema, savedMenuApiDataSchema } from "../schemas";

const at = "2026-09-25T12:00:00.000Z";

function slot(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "slot-1",
    dayOfWeek: 1,
    mealType: "dinner",
    servings: 2,
    planetarySnapshot: {
      dominantPlanet: "Sun",
      zodiacSign: "leo",
      lunarPhase: "full moon",
      elementalState: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
      timestamp: at,
    },
    createdAt: at,
    updatedAt: at,
    ...extra,
  };
}

// The menu-planner types declare these fields `?: T` (not `?: T | undefined`),
// so the schemas use `.exactOptional()`: a key is either present with a value
// or absent. Every parse site reads JSON (a request body, a fetch response or
// a JSONB column), and JSON cannot carry an explicit `undefined`.
describe("menu-planner schemas — exact optional fields", () => {
  it("parses a saved menu after a JSON round-trip", () => {
    const wire: unknown = JSON.parse(
      JSON.stringify({
        success: true,
        menu: {
          id: "menu-1",
          weekStartDate: at,
          meals: [slot({ notes: "leftovers", isLocked: true })],
          groceryList: [
            {
              id: "g-1",
              ingredient: "rice",
              quantity: 1,
              unit: "cup",
              category: "grains",
              inPantry: false,
              purchased: false,
              usedInRecipes: [],
            },
          ],
        },
      }),
    );

    const parsed = savedMenuApiDataSchema.parse(wire);

    expect(parsed.menu?.meals[0]?.notes).toBe("leftovers");
    expect(parsed.menu?.meals[0]?.isLocked).toBe(true);
    expect(parsed.menu?.groceryList[0] && "notes" in parsed.menu.groceryList[0]).toBe(false);
  });

  it("leaves an omitted optional key absent", () => {
    const parsed = mealSlotSchema.parse(slot());

    expect("notes" in parsed).toBe(false);
    expect("recipe" in parsed).toBe(false);
    expect("planetaryPositions" in parsed.planetarySnapshot).toBe(false);
  });

  it("rejects an explicit undefined, which no JSON payload can produce", () => {
    expect(mealSlotSchema.safeParse(slot({ notes: undefined })).success).toBe(false);
  });
});
