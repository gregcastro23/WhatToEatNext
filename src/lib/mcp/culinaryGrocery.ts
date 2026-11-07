/**
 * @file src/lib/mcp/culinaryGrocery.ts
 *
 * Consolidated grocery list generator for MCP.
 */
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { recipeService } from "@/services/RecipeService";
import type { MealSlot } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import { generateGroceryList } from "@/utils/groceryListGenerator";
import { toolFailure, toStringArray, type ToolResult } from "./culinaryCommon";

const AISLE_DISPLAY: Record<string, string> = {
  produce: "Produce",
  proteins: "Proteins",
  dairy: "Dairy",
  grains: "Grains",
  spices: "Spices & Seasonings",
  condiments: "Oils & Condiments",
  canned: "Canned Goods",
  frozen: "Frozen",
  bakery: "Bakery",
  beverages: "Beverages",
  other: "Pantry & Other",
};

export async function fetchAllCatalogRecipes(): Promise<Recipe[]> {
  try {
    const raw = await recipeService.searchRecipes({});
    if (raw.length > 0) return raw;
  } catch {
    // Fallback to local
  }
  try {
    return await LocalRecipeService.getAllRecipes();
  } catch {
    return [];
  }
}

async function resolveMatchedRecipes(
  recipeIds: string[],
  catalog: Recipe[],
): Promise<Recipe[]> {
  const matchedRecipes: Recipe[] = [];
  for (const query of recipeIds) {
    const norm = query.toLowerCase().trim();
    let found = catalog.find(
      (r) =>
        r.id === query ||
        r.id.toLowerCase() === norm ||
        r.name.toLowerCase() === norm,
    );
    if (!found) {
      try {
        const direct = await LocalRecipeService.getRecipeById(query);
        if (direct) found = direct;
      } catch {
        // Continue lookup
      }
    }
    if (found) {
      const matchId = found.id;
      if (!matchedRecipes.some((m) => m.id === matchId)) {
        matchedRecipes.push(found);
      }
    }
  }
  return matchedRecipes;
}

function buildMealSlots(matchedRecipes: Recipe[], multiplier: number): MealSlot[] {
  return matchedRecipes.map((r, idx) => ({
    id: `mcp-slot-${idx}`,
    dayOfWeek: 1,
    mealType: "dinner",
    servings: (r.numberOfServings ?? 4) * multiplier,
    recipe: {
      ...r,
      ingredients: r.ingredients.map((ing) => ({
        ...ing,
        amount: ing.amount * multiplier,
      })),
    },
    planetarySnapshot: {
      timestamp: new Date(),
      dominantPlanet: "Mars",
      zodiacSign: "aries",
      lunarPhase: "new moon",
      elementalState: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

interface AisleItem {
  name: string;
  amount: number;
  unit: string;
  formatted: string;
  searchQuery: string;
  sources: string[];
}

function categorizeAisles(
  items: ReturnType<typeof generateGroceryList>,
  rawPantry: string[],
): { itemsByAisle: Record<string, AisleItem[]>; pantryCovered: string[] } {
  const itemsByAisle: Record<string, AisleItem[]> = {};
  const pantryCoveredSet = new Set<string>();

  for (const item of items) {
    const aisle = AISLE_DISPLAY[item.category] ?? "Pantry & Other";
    const bucket = itemsByAisle[aisle] ?? (itemsByAisle[aisle] = []);
    const roundedAmt = Math.round(item.quantity * 100) / 100;
    const formatted = `${roundedAmt} ${item.unit} ${item.ingredient}`.replace(/\s+/g, " ").trim();

    bucket.push({
      name: item.ingredient,
      amount: roundedAmt,
      unit: item.unit,
      formatted,
      searchQuery: formatted,
      sources: item.usedInRecipes,
    });

    if (item.inPantry) {
      pantryCoveredSet.add(item.ingredient);
    }
  }

  for (const p of rawPantry) {
    const pNorm = p.toLowerCase().trim();
    for (const item of items) {
      if (
        item.ingredient.toLowerCase().includes(pNorm) ||
        pNorm.includes(item.ingredient.toLowerCase())
      ) {
        pantryCoveredSet.add(p);
      }
    }
  }

  return { itemsByAisle, pantryCovered: Array.from(pantryCoveredSet) };
}

function buildGroceryResult(
  recipeCount: number,
  servingsMultiplier: number,
  totalItems: number,
  categorized: { itemsByAisle: Record<string, AisleItem[]>; pantryCovered: string[] },
): ToolResult {
  const { itemsByAisle, pantryCovered } = categorized;
  return {
    ok: true,
    data: {
      recipeCount,
      servingsMultiplier,
      totalItems,
      itemsByAisle,
      pantryCovered,
    },
    summary: {
      recipeCount,
      servingsMultiplier,
      totalItems,
      aisleCount: Object.keys(itemsByAisle).length,
      pantryCoveredCount: pantryCovered.length,
    },
  };
}

export async function buildConsolidatedGroceryListHandler(
  args: Record<string, unknown>,
): Promise<ToolResult> {
  const recipeIds = toStringArray(args.recipeIds);
  if (recipeIds.length === 0) {
    return toolFailure("INVALID_ARGS", "recipeIds must be a non-empty array of strings");
  }

  const multiplier =
    typeof args.servingsMultiplier === "number" && args.servingsMultiplier > 0
      ? args.servingsMultiplier
      : 1;
  const rawPantry = toStringArray(args.pantryHave);
  const catalog = await fetchAllCatalogRecipes();
  const matchedRecipes = await resolveMatchedRecipes(recipeIds, catalog);

  if (matchedRecipes.length === 0) {
    return toolFailure(
      "NOT_FOUND",
      `None of the provided recipeIds (${recipeIds.join(", ")}) could be found in the catalog`,
      "Verify the recipe IDs using generate_cosmic_recipe or inspect alchm://recipes/{id}.",
    );
  }

  const mealSlots = buildMealSlots(matchedRecipes, multiplier);
  const items = generateGroceryList(mealSlots, {
    convertUnits: true,
    excludePantryItems: false,
    pantryItems: rawPantry,
  });

  const categorized = categorizeAisles(items, rawPantry);
  return buildGroceryResult(matchedRecipes.length, multiplier, items.length, categorized);
}
