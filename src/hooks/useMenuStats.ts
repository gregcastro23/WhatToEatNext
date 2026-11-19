"use client";

import { useMemo } from "react";
import { readRecipeEsms } from "@/components/menu-planner/redesign/elementUtils";
import { chartQuantities, esmsAffinity } from "@/lib/recipes/alchemicalMatch";
import type { WeeklyMenu, WeeklyMenuStats } from "@/types/menuPlanner";

export function useMenuStats(
  currentMenu: WeeklyMenu | null,
  natalAlchemical?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  } | null,
): WeeklyMenuStats | null {
  return useMemo(() => {
    if (!currentMenu) return null;

    const filledMeals = currentMenu.meals.flatMap((m) =>
      m.recipe ? [{ meal: m, recipe: m.recipe }] : [],
    );
    const totalMeals = filledMeals.length;
    const totalRecipes = new Set(filledMeals.map((m) => m.recipe.id)).size;

    // Elemental distribution: sum then normalize
    const rawElemental = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    for (const { recipe } of filledMeals) {
      const ep = recipe.elementalProperties;
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

    // Orthogonal Alchemical ESMS quantities (Spirit, Essence, Matter, Substance)
    const rawEsms = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0, mealsWithEsms: 0 };
    for (const { meal, recipe } of filledMeals) {
      const esms = readRecipeEsms(recipe, meal.servings || 1);
      if (esms) {
        rawEsms.Spirit += esms.Spirit;
        rawEsms.Essence += esms.Essence;
        rawEsms.Matter += esms.Matter;
        rawEsms.Substance += esms.Substance;
        rawEsms.mealsWithEsms += 1;
      }
    }
    const totalASharp =
      rawEsms.Spirit + rawEsms.Essence + rawEsms.Matter + rawEsms.Substance;
    const esmsTotals = {
      Spirit: rawEsms.Spirit,
      Essence: rawEsms.Essence,
      Matter: rawEsms.Matter,
      Substance: rawEsms.Substance,
      totalASharp,
      mealsWithEsms: rawEsms.mealsWithEsms,
    };
    const esmsDistribution =
      totalASharp > 0
        ? {
            Spirit: rawEsms.Spirit / totalASharp,
            Essence: rawEsms.Essence / totalASharp,
            Matter: rawEsms.Matter / totalASharp,
            Substance: rawEsms.Substance / totalASharp,
          }
        : { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    const natalTarget = natalAlchemical ? chartQuantities(natalAlchemical) : null;
    const natalEsmsAffinity =
      natalTarget && totalASharp > 0
        ? Math.round(
            esmsAffinity(natalTarget, {
              spirit: rawEsms.Spirit,
              essence: rawEsms.Essence,
              matter: rawEsms.Matter,
              substance: rawEsms.Substance,
            }),
          )
        : null;

    // averageGregsEnergy: mean of monicaScore across filled meals
    const monicaScores = filledMeals
      .map((m) => m.recipe.monicaScore)
      .filter((s): s is number => s != null);
    const averageGregsEnergy =
      monicaScores.length > 0
        ? monicaScores.reduce((a, b) => a + b, 0) / monicaScores.length
        : 0;

    // averageMonica: mean of (spirit + essence + matter + substance) / 4
    const monicaValues: number[] = [];
    for (const { recipe } of filledMeals) {
      const esms = readRecipeEsms(recipe, 1);
      if (esms) {
        monicaValues.push(esms.totalASharp / 4);
      }
    }
    const averageMonica =
      monicaValues.length > 0
        ? monicaValues.reduce((a, b) => a + b, 0) / monicaValues.length
        : 0;

    // Cuisine distribution: count by cuisine, sort descending
    const cuisineCounts: Record<string, number> = {};
    for (const { recipe } of filledMeals) {
      const c = recipe.cuisine;
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
        totalMeals > 0 && filledMeals.every((m) => m.recipe.isVegetarian === true),
      vegan:
        totalMeals > 0 && filledMeals.every((m) => m.recipe.isVegan === true),
      glutenFree:
        totalMeals > 0 && filledMeals.every((m) => m.recipe.isGlutenFree === true),
      dairyFree:
        totalMeals > 0 && filledMeals.every((m) => m.recipe.isDairyFree === true),
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
      esmsTotals,
      esmsDistribution,
      natalEsmsAffinity,
      cuisineDistribution,
      dietaryCompliance,
      missingMeals,
    };
  }, [currentMenu, natalAlchemical]);
}
