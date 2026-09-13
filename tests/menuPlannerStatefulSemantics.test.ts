import {
  EMPTY_FILTERS,
  toggleCuisineFilter,
  toggleDietaryFilter,
  toggleMaxCookTimeFilter,
  type RecipeFilters,
} from "@/components/menu-planner/RecipeBrowserPanel";
import {
  buildMealSlotSauce,
  moveMealBetweenSlots,
  removeRecipeFromMealSlot,
  swapMealsBetweenSlots,
} from "@/contexts/menu-planner/useMealSlots";
import type { MealSlot } from "@/types/menuPlanner";

describe("menuPlannerStatefulSemantics — production-backed state transitions", () => {
  const samplePlanetarySnapshot: MealSlot["planetarySnapshot"] = {
    dominantPlanet: "Sun",
    zodiacSign: "leo",
    lunarPhase: "first quarter",
    elementalState: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
    timestamp: new Date("2026-09-01T12:00:00Z"),
  };

  const sampleRecipeA = {
    id: "rec-solar",
    name: "Solar Broth",
    title: "Solar Broth",
    ingredients: [],
    instructions: [],
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
  };

  const sampleRecipeB = {
    id: "rec-lunar",
    name: "Lunar Infusion",
    title: "Lunar Infusion",
    ingredients: [],
    instructions: [],
    elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 },
  };

  const createSlot = (
    id: string,
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6,
    recipe?: typeof sampleRecipeA,
    servings = 2,
  ): MealSlot => ({
    id,
    dayOfWeek: day,
    mealType: "dinner",
    servings,
    ...(recipe !== undefined ? { recipe } : {}),
    planetarySnapshot: samplePlanetarySnapshot,
    isLocked: false,
    notes: `Notes for ${id}`,
    createdAt: new Date("2026-09-01T10:00:00Z"),
    updatedAt: new Date("2026-09-01T10:00:00Z"),
  });

  describe("1. RecipeBrowserPanel filter toggling (on, off, and variant)", () => {
    it("toggles maxCookTime on when absent and cleanly removes it when matching", () => {
      const initial: RecipeFilters = { ...EMPTY_FILTERS };
      expect(Object.prototype.hasOwnProperty.call(initial, "maxCookTime")).toBe(false);

      // 1a. Toggle ON (30 min)
      const toggledOn = toggleMaxCookTimeFilter(initial, 30);
      expect(toggledOn.maxCookTime).toBe(30);
      expect(Object.prototype.hasOwnProperty.call(toggledOn, "maxCookTime")).toBe(true);

      // 1b. Toggle to DIFFERENT value (45 min)
      const toggledDiff = toggleMaxCookTimeFilter(toggledOn, 45);
      expect(toggledDiff.maxCookTime).toBe(45);
      expect(Object.prototype.hasOwnProperty.call(toggledDiff, "maxCookTime")).toBe(true);

      // 1c. Toggle OFF (re-click 45 min) — must be omitted, NOT undefined
      const toggledOff = toggleMaxCookTimeFilter(toggledDiff, 45);
      expect(toggledOff.maxCookTime).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(toggledOff, "maxCookTime")).toBe(false);
      expect(Object.keys(toggledOff)).not.toContain("maxCookTime");
    });

    it("toggles dietary and cuisine multi-select filters on and off", () => {
      const initial: RecipeFilters = { ...EMPTY_FILTERS };

      const withDietary = toggleDietaryFilter(initial, "vegan");
      expect(withDietary.dietary).toEqual(["vegan"]);

      const withoutDietary = toggleDietaryFilter(withDietary, "vegan");
      expect(withoutDietary.dietary).toEqual([]);

      const withCuisine = toggleCuisineFilter(initial, "persian");
      expect(withCuisine.cuisines).toEqual(["persian"]);

      const withoutCuisine = toggleCuisineFilter(withCuisine, "persian");
      expect(withoutCuisine.cuisines).toEqual([]);
    });
  });

  describe("2. Recipe removal and preservation of unrelated slot fields", () => {
    it("removes recipe by omitting property while strictly preserving all other slot fields", () => {
      const occupied = createSlot("slot-1", 1, sampleRecipeA, 3);
      occupied.sauce = {
        id: "sauce-1",
        name: "Solar Vinaigrette",
        servings: 1,
        elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.1, Air: 0.2 },
      };

      const cleared = removeRecipeFromMealSlot(occupied);

      // Recipe is omitted, not undefined
      expect(cleared.recipe).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(cleared, "recipe")).toBe(false);

      // Unrelated slot fields are strictly preserved
      expect(cleared.id).toBe("slot-1");
      expect(cleared.dayOfWeek).toBe(1);
      expect(cleared.mealType).toBe("dinner");
      expect(cleared.servings).toBe(3);
      expect(cleared.planetarySnapshot).toEqual(samplePlanetarySnapshot);
      expect(cleared.isLocked).toBe(false);
      expect(cleared.notes).toBe("Notes for slot-1");
      expect(cleared.sauce).toEqual(occupied.sauce);
      expect(cleared.createdAt).toEqual(occupied.createdAt);
      expect(cleared.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("3. Move meal to an empty slot", () => {
    it("moves recipe to empty target, clearing source recipe without leaving undefined keys", () => {
      const sourceSlot = createSlot("source-slot", 1, sampleRecipeA, 4);
      const targetSlot = createSlot("target-slot", 2, undefined, 1);

      const { source, target } = moveMealBetweenSlots(sourceSlot, targetSlot);

      // Target receives recipe and source servings
      expect(target.recipe).toEqual(sampleRecipeA);
      expect(target.servings).toBe(4);
      expect(target.id).toBe("target-slot");
      expect(target.dayOfWeek).toBe(2);

      // Source has recipe omitted
      expect(source.recipe).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(source, "recipe")).toBe(false);
      expect(source.id).toBe("source-slot");
      expect(source.dayOfWeek).toBe(1);
    });

    it("rejects moving if source has no recipe or target is already occupied", () => {
      const emptySlot = createSlot("empty-1", 1);
      const occupiedSlot = createSlot("occupied-1", 2, sampleRecipeA);

      expect(() => moveMealBetweenSlots(emptySlot, occupiedSlot)).toThrow(
        "Source meal not found or has no recipe",
      );
      expect(() => moveMealBetweenSlots(occupiedSlot, occupiedSlot)).toThrow(
        "Target slot is already occupied",
      );
    });
  });

  describe("4. Occupied-to-empty and occupied-to-occupied swap", () => {
    it("swaps occupied-to-empty cleanly, omitting recipe from the emptied slot", () => {
      const occupied = createSlot("occ-slot", 1, sampleRecipeA, 3);
      const empty = createSlot("empty-slot", 3, undefined, 1);

      const { meal1, meal2 } = swapMealsBetweenSlots(occupied, empty);

      // meal1 is now empty — recipe must be omitted
      expect(meal1.recipe).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(meal1, "recipe")).toBe(false);
      expect(meal1.servings).toBe(1); // adopted empty's servings

      // meal2 is now occupied
      expect(meal2.recipe).toEqual(sampleRecipeA);
      expect(meal2.servings).toBe(3); // adopted occupied's servings
    });

    it("swaps occupied-to-occupied exchanging recipes and servings cleanly", () => {
      const mealA = createSlot("slot-a", 1, sampleRecipeA, 2);
      const mealB = createSlot("slot-b", 4, sampleRecipeB, 5);

      const { meal1, meal2 } = swapMealsBetweenSlots(mealA, mealB);

      expect(meal1.id).toBe("slot-a");
      expect(meal1.recipe).toEqual(sampleRecipeB);
      expect(meal1.servings).toBe(5);

      expect(meal2.id).toBe("slot-b");
      expect(meal2.recipe).toEqual(sampleRecipeA);
      expect(meal2.servings).toBe(2);
    });
  });

  describe("5. Sauce nutritional-profile omission semantics", () => {
    it("omits nutritionalProfile entirely when sauce data does not provide it", () => {
      const sauce = buildMealSlotSauce("sauce-simple", {
        name: "Lemon Tahini",
        elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
        ingredients: ["tahini", "lemon", "water"],
      });

      expect(sauce.id).toBe("sauce-simple");
      expect(sauce.name).toBe("Lemon Tahini");
      expect(sauce.nutritionalProfile).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(sauce, "nutritionalProfile")).toBe(false);
    });

    it("includes only defined nutritional fields, omitting undefined ones", () => {
      const sauce = buildMealSlotSauce("sauce-partial", {
        name: "Clarified Ghee",
        nutritionalProfile: {
          calories: 120,
          fat: 14,
        },
        elementalProperties: { Fire: 0.8, Water: 0.0, Earth: 0.2, Air: 0.0 },
      });

      expect(sauce.nutritionalProfile).toBeDefined();
      expect(sauce.nutritionalProfile?.calories).toBe(120);
      expect(sauce.nutritionalProfile?.fat).toBe(14);
      expect(sauce.nutritionalProfile?.protein).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(sauce.nutritionalProfile, "protein")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sauce.nutritionalProfile, "carbs")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sauce.nutritionalProfile, "fiber")).toBe(false);
    });
  });
});
