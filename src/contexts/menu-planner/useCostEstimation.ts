"use client";

/**
 * Menu Planner — Cost estimation hook
 *
 * Derives an Instacart price estimate from the menu's recipes and current
 * pantry inventory. Re-runs whenever the menu or inventory changes and
 * fires a deferred network probe to upgrade confidence when matches land.
 *
 * @file src/contexts/menu-planner/useCostEstimation.ts
 */

import { useEffect, useState } from "react";
import type { WeeklyMenu } from "@/types/menuPlanner";
import { estimateWeeklyGroceryCost } from "@/utils/instacart/priceEstimator";
import { logger } from "@/utils/logger";

export interface CostBreakdownItem {
  ingredient: string;
  estimatedCost: number;
  confidence: string;
}

export interface CostEstimationState {
  total: number;
  confidence: "high" | "medium" | "low";
  breakdown: CostBreakdownItem[];
}

const EMPTY_STATE: CostEstimationState = {
  total: 0,
  confidence: "low",
  breakdown: [],
};

const PROBE_DELAY_MS = 2000;
const PROBE_LINE_ITEM_CAP = 50;

export interface UseCostEstimationParams {
  currentMenu: WeeklyMenu | null;
  inventory: string[];
}

export function useCostEstimation({
  currentMenu,
  inventory,
}: UseCostEstimationParams): CostEstimationState {
  const [state, setState] = useState<CostEstimationState>(EMPTY_STATE);

  useEffect(() => {
    if (!currentMenu) return;

    const recipesWithIngredients = currentMenu.meals
      .filter((m) => m.recipe)
      .map((m) => ({
        ingredients: (m.recipe!.ingredients || []).map((ing: any) => ({
          name: typeof ing === "string" ? ing : ing.name ?? "",
          amount: typeof ing === "string" ? 1 : ing.amount ?? 1,
          unit: typeof ing === "string" ? "each" : ing.unit ?? "each",
          category: typeof ing === "string" ? undefined : ing.category,
          optional: typeof ing === "string" ? false : ing.optional,
        })),
        servings: m.servings || 1,
        dietaryFlags: [
          m.recipe?.isVegetarian ? "vegetarian" : "",
          m.recipe?.isVegan ? "vegan" : "",
          m.recipe?.isGlutenFree ? "gluten-free" : "",
          m.recipe?.isDairyFree ? "dairy-free" : "",
        ].filter(Boolean),
      }));

    if (recipesWithIngredients.length === 0) {
      setState(EMPTY_STATE);
      return;
    }

    const { totalCost, recipeBreakdown } = estimateWeeklyGroceryCost(
      recipesWithIngredients,
      inventory,
    );
    const allIngredientsBreakdown = recipeBreakdown.flatMap((rb) => rb.breakdown);
    const avgMatchRatio =
      recipeBreakdown.reduce(
        (acc, rb) =>
          acc +
          (rb.confidence === "high" ? 1 : rb.confidence === "medium" ? 0.5 : 0),
        0,
      ) / recipeBreakdown.length;

    setState({
      total: totalCost,
      confidence:
        avgMatchRatio >= 0.7 ? "high" : avgMatchRatio >= 0.4 ? "medium" : "low",
      breakdown: allIngredientsBreakdown,
    });

    const probeTimeout = setTimeout(() => {
      void (async () => {
        try {
          const lineItems = allIngredientsBreakdown
            .slice(0, PROBE_LINE_ITEM_CAP)
            .map((b) => ({ name: b.ingredient, display_text: b.ingredient }));
          const response = await fetch("/api/instacart/price-estimate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ line_items: lineItems }),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.confidence === "high") {
              setState((prev) => ({ ...prev, confidence: "high" }));
            }
          }
        } catch (err) {
          logger.warn("Cost probe failed:", err);
        }
      })();
    }, PROBE_DELAY_MS);

    return () => clearTimeout(probeTimeout);
  }, [currentMenu, inventory]);

  return state;
}
