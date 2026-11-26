/**
 * @jest-environment node
 */

jest.mock("@/lib/logger", () => ({
  _logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { parseStoredRecipeBuilderState } from "@/contexts/RecipeBuilderContext";
import { parseStoredGenerationPreferences } from "@/contexts/menu-planner/useGenerationPreferences";
import AdvancedCache from "@/lib/performance/advanced-cache";
import {
  parseActivationsResponse,
  parseDegreeActivationMap,
  parseDegreeAgentResponse,
  parseJsonRecord,
} from "@/lib/planetaryAgentsClient";
import { parseFavoriteRecipesData } from "@/lib/recipes/favoriteRecipes";
import { parseReverseGeocodeResponse } from "@/services/geocodingService";

describe("no-unsafe-return runtime parsers", () => {
  it("validates AdvancedCache entries with optional type predicates", () => {
    const cache = new AdvancedCache(10, 60_000);
    cache.set("k1", { kind: "summary", total: 42 });
    cache.set("k2", "not-an-object");

    const isSummary = (v: unknown): v is { kind: "summary"; total: number } =>
      typeof v === "object" && v !== null && "kind" in v && v.kind === "summary";

    expect(cache.get("k1", isSummary)).toEqual({ kind: "summary", total: 42 });
    expect(cache.get("k2", isSummary)).toBeNull();
    expect(cache.get("missing", isSummary)).toBeNull();
  });

  it("parses planetaryAgentsClient payloads safely", () => {
    expect(
      parseDegreeAgentResponse({
        active: true,
        degree: 45,
        agent: { id: "a1", name: "Sol", strength: 0.9 },
      }),
    ).toEqual({
      active: true,
      degree: 45,
      agent: { id: "a1", name: "Sol", strength: 0.9 },
    });
    expect(parseDegreeAgentResponse(null)).toBeNull();

    expect(
      parseDegreeActivationMap({
        "45": { id: "a1", name: "Sol" },
        "999": { id: "bad", name: "OutOfRange" },
      }),
    ).toEqual({ 45: { id: "a1", name: "Sol" } });

    expect(
      parseActivationsResponse({
        activations: [
          { id: "hermes", strength: 0.8, agent: { id: "h1", name: "Hermes" } },
          "invalid",
        ],
      }),
    ).toEqual([
      { id: "hermes", strength: 0.8, agent: { id: "h1", name: "Hermes" } },
    ]);

    expect(parseJsonRecord({ ok: true })).toEqual({ ok: true });
    expect(parseJsonRecord([1, 2])).toBeNull();
  });

  it("parses reverseGeocode display_name safely", () => {
    expect(parseReverseGeocodeResponse({ display_name: "Brooklyn, NY" })).toBe("Brooklyn, NY");
    expect(parseReverseGeocodeResponse({ display_name: 123 })).toBeNull();
    expect(parseReverseGeocodeResponse(null)).toBeNull();
  });

  it("parses localStorage preferences, recipe builder state, and favorite recipes safely", () => {
    const prefs = parseStoredGenerationPreferences({
      preferredCuisines: ["Italian", 42],
      flavorPreferences: ["umami", "invalid"],
      maxPrepTimeMinutes: 30,
      nutritionalTargets: { dailyCalories: 2200, prioritizeProtein: true },
    });
    expect(prefs.preferredCuisines).toEqual(["Italian"]);
    expect(prefs.flavorPreferences).toEqual(["umami"]);
    expect(prefs.maxPrepTimeMinutes).toBe(30);
    expect(prefs.nutritionalTargets.dailyCalories).toBe(2200);
    expect(prefs.nutritionalTargets.prioritizeProtein).toBe(true);

    const builder = parseStoredRecipeBuilderState({
      mealType: "Dinner",
      flavors: ["savory", "bogus"],
      selectedIngredients: [{ name: "garlic", elementalProperties: { Fire: 0.6 } }, { bad: true }],
      maxPrepTimeMinutes: null,
    });
    expect(builder.mealType).toBe("Dinner");
    expect(builder.flavors).toEqual(["savory"]);
    expect(builder.selectedIngredients).toEqual([
      { name: "garlic", elementalProperties: { Fire: 0.6 } },
    ]);
    expect(builder.maxPrepTimeMinutes).toBeNull();

    const favs = parseFavoriteRecipesData({
      r1: {
        id: "r1",
        name: "Risotto",
        ingredients: ["rice", 9],
        likedIngredients: ["rice"],
        favoritedAt: "2026-11-25T00:00:00Z",
        cuisine: "Italian",
      },
      bad: { id: 123 },
    });
    expect(favs).toEqual({
      r1: {
        id: "r1",
        name: "Risotto",
        ingredients: ["rice"],
        likedIngredients: ["rice"],
        favoritedAt: "2026-11-25T00:00:00Z",
        cuisine: "Italian",
      },
    });
  });
});
