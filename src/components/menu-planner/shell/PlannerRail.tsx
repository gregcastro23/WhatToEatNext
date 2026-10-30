"use client";

/**
 * PlannerRail — the unified, tabbed right-hand side panel.
 *
 * Replaces the scattered, disparate panels:
 *  - RecipeBrowserPanel (was an awkward 500px dropdown)
 *  - RecipeQueue (was pushed below the calendar)
 *  - PossoWidget (was a floating 500px block)
 *  - SmartSuggestionsSidebar (was squeezed at bottom right)
 *
 * Offers 4 tabs:
 *  1. Recipes: browse, search, filter, and drag or click-to-place
 *  2. Queue: recipes queued/saved for later
 *  3. Pantry: Posso pantry ingredients & match scoring
 *  4. Ideas: contextual AI smart suggestions & variety tips
 *
 * @file src/components/menu-planner/shell/PlannerRail.tsx
 */

import { LoaderCircle, Lightbulb, ListTodo, PanelRightClose, Refrigerator, Search } from "lucide-react";
import dynamic from "next/dynamic";
import React from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";
import { usePlannerUI, type RailTab } from "./PlannerUIContext";

const RecipeBrowserPanel = dynamic(
  () => import("@/components/menu-planner/RecipeBrowserPanel"),
  { loading: () => <RailLoading /> },
);
const RecipeQueue = dynamic(
  () => import("@/components/menu-planner/RecipeQueue"),
  { loading: () => <RailLoading /> },
);
const PossoWidget = dynamic(
  () => import("@/components/menu-planner/PossoWidget"),
  { loading: () => <RailLoading /> },
);
const SmartSuggestionsSidebar = dynamic(
  () => import("@/components/menu-builder/SmartSuggestionsSidebar"),
  { loading: () => <RailLoading /> },
);

function RailLoading(): React.ReactElement {
  return (
    <div className="flex h-64 items-center justify-center p-6 text-on-surface-variant font-mono text-xs">
      <LoaderCircle className="mr-2 h-5 w-5 animate-spin" aria-hidden />
      Loading tab...
    </div>
  );
}

interface PlannerRailProps {
  weeklyNutrition?: WeeklyNutritionResult | null;
  className?: string;
}

export default function PlannerRail({
  weeklyNutrition,
  className = "",
}: PlannerRailProps): React.ReactElement | null {
  const { state, openRail, closeRail, startPlacing, showDetail } = usePlannerUI();
  const { queueSize } = useRecipeQueue();
  const { currentMenu } = useMenuPlanner();

  if (!state.railOpen) return null;

  const tabs: Array<{ id: RailTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: "recipes", label: "Recipes", icon: <Search className="h-4 w-4" /> },
    { id: "queue", label: "Queue", icon: <ListTodo className="h-4 w-4" />, badge: queueSize },
    { id: "pantry", label: "Pantry", icon: <Refrigerator className="h-4 w-4" /> },
    { id: "ideas", label: "Ideas", icon: <Lightbulb className="h-4 w-4" /> },
  ];

  const handleSelectRecipe = (recipe: Recipe): void => {
    startPlacing(recipe);
  };

  return (
    <aside
      aria-label="Planner Side Rail"
      className={`flex flex-col h-full rounded-2xl border border-muted bg-surface shadow-lg overflow-hidden ${className}`}
    >
      {/* Rail Tab Navigation */}
      <div className="flex items-center justify-between border-b border-muted bg-surface-container-low px-2 py-1.5">
        <div role="tablist" aria-label="Rail tabs" className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = state.railTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => openRail(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase tracking-wide transition-colors ${
                  active
                    ? "bg-active-violet text-background font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-background text-active-violet font-bold" : "bg-active-violet/20 text-active-violet"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={closeRail}
          aria-label="Close sidebar"
          title="Close sidebar"
          className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors ml-1"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Rail Active Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {state.railTab === "recipes" && (
          <RecipeBrowserPanel
            compact
            onSelectRecipe={handleSelectRecipe}
            onViewRecipeDetail={(r) => showDetail(r)}
          />
        )}

        {state.railTab === "queue" && (
          <RecipeQueue
            compact
            onSelectRecipe={(queued) => handleSelectRecipe(queued.recipe)}
          />
        )}

        {state.railTab === "pantry" && (
          <PossoWidget
            compact
            onSelectRecipe={handleSelectRecipe}
          />
        )}

        {state.railTab === "ideas" && (
          <div className="p-2">
            <SmartSuggestionsSidebar
              weekPlan={currentMenu}
              weeklyNutrition={weeklyNutrition ?? null}
              isCollapsed={false}
              onToggleCollapse={() => {}}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
