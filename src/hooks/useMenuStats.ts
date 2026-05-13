"use client";

import { useMemo } from "react";
import type { WeeklyMenu, WeeklyMenuStats } from "@/types/menuPlanner";

export function useMenuStats(
  currentMenu: WeeklyMenu | null,
): WeeklyMenuStats | null {
  return useMemo(() => {
    if (!currentMenu) return null;

    const filledMeals = currentMenu.meals.filter((m) => m.recipe);
    const totalMeals = filledMeals.length;
    const totalRecipes = new Set(filledMeals.map((m) => m.recipe!.id)).size;

    // Elemental distribution: sum then normalize
    const rawElemental = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    for (const meal of filledMeals) {
      const ep = meal.recipe!.elementalProperties;
      rawElemental.Fire += ep.Fire ?? 0;
      rawElemental.Water += ep.Water ?? 0;
      rawElemental.Earth += ep.Earth ?? 0;
      rawElemental.Air += ep.Air ?? 0;
    }
    const elementalSum =
      rawElemental.Fire + rawElemental.Water + rawElemental.Earth + rawElemental.Air;
    const elementalDistribution =
      elementalSum > 0
        ? {
            Fire: rawElemental.Fire / elementalSum,
            Water: rawElemental.Water / elementalSum,
            Earth: rawElemental.Earth / elementalSum,
            Air: rawElemental.Air / elementalSum,
          }
        : { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    // averageGregsEnergy: mean of monicaScore across filled meals
    const monicaScores = filledMeals
      .map((m) => m.recipe!.monicaScore)
      .filter((s): s is number => s != null);
    const averageGregsEnergy =
      monicaScores.length > 0
        ? monicaScores.reduce((a, b) => a + b, 0) / monicaScores.length
        : 0;

    // averageMonica: mean of (spirit + essence + matter + substance) / 4
    const monicaValues: number[] = [];
    for (const meal of filledMeals) {
      const r = meal.recipe!;
      if (
        r.spirit != null &&
        r.essence != null &&
        r.matter != null &&
        r.substance != null
      ) {
        monicaValues.push((r.spirit + r.essence + r.matter + r.substance) / 4);
      }
    }
    const averageMonica =
      monicaValues.length > 0
        ? monicaValues.reduce((a, b) => a + b, 0) / monicaValues.length
        : 0;

    // Cuisine distribution: count by cuisine, sort descending
    const cuisineCounts: Record<string, number> = {};
    for (const meal of filledMeals) {
      const c = meal.recipe!.cuisine;
      if (c) {
        cuisineCounts[c] = (cuisineCounts[c] ?? 0) + 1;
      }
    }
    const cuisineDistribution = Object.fromEntries(
      Object.entries(cuisineCounts).sort(([, a], [, b]) => b - a),
    );

    // Dietary compliance: true only if ALL filled meals satisfy the constraint
    const dietaryCompliance = {
      vegetarian:
        totalMeals > 0 && filledMeals.every((m) => m.recipe!.isVegetarian === true),
      vegan:
        totalMeals > 0 && filledMeals.every((m) => m.recipe!.isVegan === true),
      glutenFree:
        totalMeals > 0 && filledMeals.every((m) => m.recipe!.isGlutenFree === true),
      dairyFree:
        totalMeals > 0 && filledMeals.every((m) => m.recipe!.isDairyFree === true),
    };

    // Missing meals: slots with no recipe
    const missingMeals = currentMenu.meals
      .filter((m) => !m.recipe)
      .map((m) => ({ dayOfWeek: m.dayOfWeek, mealType: m.mealType }));

    return {
      totalMeals,
      totalRecipes,
      averageGregsEnergy,
      averageMonica,
      elementalDistribution,
      cuisineDistribution,
      dietaryCompliance,
      missingMeals,
    };
  }, [currentMenu]);
}
