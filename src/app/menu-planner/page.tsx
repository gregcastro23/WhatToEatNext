"use client";

/**
 * Menu Planner Page
 * Main page for the Weekly Menu Planning system (v2)
 *
 * @file src/app/menu-planner/page.tsx
 */

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/common/Toast";
import PlannerHeader, { type PlannerSyncInfo } from "@/components/menu-planner/shell/PlannerHeader";
import {
  PlannerUIProvider,
  usePlannerUI,
} from "@/components/menu-planner/shell/PlannerUIContext";
import ResponsivePlannerRail from "@/components/menu-planner/shell/ResponsivePlannerRail";
import { ALL_MEAL_TYPES, MAIN_MEAL_TYPES, usePlanActions } from "@/components/menu-planner/shell/usePlanActions";
import {
  MenuPlannerProvider,
  useMenuPlanner,
} from "@/contexts/MenuPlannerContext";
import {
  RecipeQueueProvider,
} from "@/contexts/RecipeQueueContext";
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
import { useRecipeRefResolver } from "@/hooks/useRecipeRefResolver";
import { useSpacetimePlannerSync } from "@/hooks/useSpacetimePlannerSync";

// Lazy-loaded modals, drawers and calendar per master architecture
const WeeklyCalendar = dynamic(
  () => import("@/components/menu-planner/WeeklyCalendar"),
  {
    loading: () => <div className="h-96 rounded-xl bg-gray-100/50 animate-pulse my-4" />,
  },
);
const GroceryListModal = dynamic(
  () => import("@/components/menu-planner/GroceryListModal"),
);
const NutritionalDashboard = dynamic(
  () => import("@/components/menu-planner/NutritionalDashboard"),
);
const RecipeDetailModal = dynamic(
  () => import("@/components/menu-planner/RecipeDetailModal"),
);
const SaveTemplateModal = dynamic(
  () => import("@/components/menu-planner/modals/SaveTemplateModal"),
);
const ShareMenuModal = dynamic(
  () => import("@/components/menu-planner/modals/ShareMenuModal"),
);
const ElementalHarmonyModal = dynamic(
  () => import("@/components/menu-planner/modals/ElementalHarmonyModal"),
);
const PlanSettingsDrawer = dynamic(
  () => import("@/components/menu-planner/shell/PlanSettingsDrawer"),
);
const WeekSummaryStrip = dynamic(
  () => import("@/components/menu-planner/shell/WeekSummaryStrip"),
);
const PlannerUndoToast = dynamic(
  () => import("@/components/menu-planner/shell/PlannerUndoToast"),
);

/**
 * Menu Planner Content (inner component with context access)
 */
function MenuPlannerContent(): React.ReactElement {
  const menuPlannerActions = useMenuPlanner();
  const { currentMenu, regenerateGroceryList } = menuPlannerActions;
  const ui = usePlannerUI();
  const { state, openModal, closeModal, showDetail } = ui;
  const planActions = usePlanActions(state.showSnacks ? ALL_MEAL_TYPES : MAIN_MEAL_TYPES);
  const { toast, showSuccess, showError } = useToast();

  // Rehydration sources for remote-slot materialization
  const [rehydrationActive, setRehydrationActive] = useState(false);
  const resolveRecipeRef = useRecipeRefResolver(rehydrationActive);

  // Syncs the plan with SpacetimeDB when the live-planner flag is on
  const plannerSync = useSpacetimePlannerSync(
    currentMenu,
    menuPlannerActions,
    resolveRecipeRef,
  );
  useEffect(() => {
    if (plannerSync.unappliedRemoteSlots > 0) setRehydrationActive(true);
  }, [plannerSync.unappliedRemoteSlots]);

  const syncInfo = useMemo<PlannerSyncInfo>(
    () => ({
      live: plannerSync.live,
      liveSlotCount: plannerSync.liveSlotCount,
      unappliedRemoteSlots: plannerSync.unappliedRemoteSlots,
    }),
    [plannerSync.live, plannerSync.liveSlotCount, plannerSync.unappliedRemoteSlots],
  );

  // Real-time nutrition tracking - recalculates whenever menu or targets change
  const weeklyNutrition = useNutritionTracking(
    currentMenu,
    menuPlannerActions.generationPreferences.nutritionalTargets,
  );

  return (
    <div className="lab min-h-screen text-on-surface select-none pb-24">
      <div className="w-full px-4 xl:px-8 py-6 max-w-[1800px] mx-auto">
        {/* Top Header — compact navigation & CTA */}
        <PlannerHeader
          actions={planActions}
          sync={syncInfo}
          onShop={() => {
            regenerateGroceryList();
            openModal("grocery");
          }}
          onShare={() => openModal("share")}
        />

        {/* Main Board + Rail Layout */}
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <WeeklyCalendar
              onShopWeek={() => {
                regenerateGroceryList();
                openModal("grocery");
              }}
              onOpenNutrition={() => openModal("nutrition")}
            />

            {/* Bottom summary strip (Desktop/Tablet) */}
            <div className="hidden md:block">
              <WeekSummaryStrip />
            </div>
          </div>

          <ResponsivePlannerRail weeklyNutrition={weeklyNutrition} />
        </div>

        {/* Slide-over Plan Settings Drawer */}
        <PlanSettingsDrawer />

        {/* Grocery List Modal */}
        <GroceryListModal
          isOpen={state.modal === "grocery"}
          onClose={() => closeModal()}
        />

        {/* Nutrition Dashboard */}
        <NutritionalDashboard
          isOpen={state.modal === "nutrition"}
          onClose={() => closeModal()}
        />

        {/* Share to Feed Modal */}
        <ShareMenuModal
          isOpen={state.modal === "share"}
          onClose={() => closeModal()}
          currentMenu={currentMenu}
          onSuccess={(msg) => showSuccess(msg)}
          onError={(msg) => showError(msg)}
        />

        {/* Save Template Modal */}
        <SaveTemplateModal
          isOpen={state.modal === "template"}
          onClose={() => closeModal()}
          onSuccess={(msg) => showSuccess(msg)}
          onError={(msg) => showError(msg)}
        />

        {/* Elemental Harmony Modal */}
        <ElementalHarmonyModal
          isOpen={state.modal === "harmony"}
          onClose={() => closeModal()}
        />

        {/* Recipe Detail Modal */}
        {state.detailRecipe && (
          <RecipeDetailModal
            recipe={state.detailRecipe}
            isOpen
            onClose={() => showDetail(null)}
            onAddToMeal={ui.startPlacing}
          />
        )}

        {/* Non-blocking Undo Toast */}
        <PlannerUndoToast />


      </div>

      {/* Global Toast */}
      {toast}
    </div>
  );
}

/**
 * Main Page Export (wrapped in providers)
 */
export default function MenuPlannerPage(): React.ReactElement {
  return (
    <RecipeQueueProvider>
      <MenuPlannerProvider>
        <PlannerUIProvider>
          <MenuPlannerContent />
        </PlannerUIProvider>
      </MenuPlannerProvider>
    </RecipeQueueProvider>
  );
}
