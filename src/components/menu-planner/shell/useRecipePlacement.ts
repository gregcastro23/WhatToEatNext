"use client";

import { useRef } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { getDayName, type MealSlot } from "@/types/menuPlanner";
import { usePlannerUI } from "./PlannerUIContext";

/** Shared by the week board, focused day, and phone cards. */
export function useRecipePlacement() {
  const { addMealToSlot } = useMenuPlanner();
  const { state, notify, stopPlacing } = usePlannerUI();
  const pending = useRef(false);

  const placeRecipe = async (slot: MealSlot): Promise<void> => {
    const recipe = state.placingRecipe;
    if (!recipe || pending.current) return;
    pending.current = true;
    try {
      await addMealToSlot(slot.dayOfWeek, slot.mealType, recipe);
      stopPlacing();
      notify(`Placed "${recipe.name}" on ${getDayName(slot.dayOfWeek)} ${slot.mealType}`);
    } catch {
      notify("Could not place recipe. Try again.");
    } finally {
      pending.current = false;
    }
  };

  return { placingRecipe: state.placingRecipe, placeRecipe };
}
