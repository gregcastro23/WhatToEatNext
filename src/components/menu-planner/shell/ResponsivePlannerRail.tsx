"use client";

import { useEffect, useState } from "react";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import PlannerRail from "./PlannerRail";
import { usePlannerUI } from "./PlannerUIContext";
import Sheet from "./Sheet";

/** Mount one rail, with dialog behavior only when it overlays the board. */
export default function ResponsivePlannerRail({ weeklyNutrition }: { weeklyNutrition: WeeklyNutritionResult | null }) {
  const { state, closeRail } = usePlannerUI();
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!state.railOpen) return null;
  if (desktop) {
    return (
      <div className="sticky top-4 w-80 shrink-0 xl:w-96">
        <PlannerRail weeklyNutrition={weeklyNutrition} className="h-[calc(100dvh-2rem)]" />
      </div>
    );
  }
  return (
    <Sheet open onOpenChange={(open) => { if (!open) closeRail(); }} title="Recipes & ideas" contentClassName="min-h-0 p-0">
      <PlannerRail weeklyNutrition={weeklyNutrition} className="h-full rounded-none border-none" />
    </Sheet>
  );
}
