"use client";

/**
 * Menu Planner Page
 * Main page for the Weekly Menu Planning system
 *
 * @file src/app/menu-planner/page.tsx
 * @created 2026-01-10
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/common/Toast";
import QuickActionsToolbar from "@/components/menu-builder/QuickActionsToolbar";
import WeeklyInsights from "@/components/menu-planner/redesign/WeeklyInsights";
import WeeklyCalendar from "@/components/menu-planner/WeeklyCalendar";
import {
    MenuPlannerProvider,
    type Participant,
    useMenuPlanner,
} from "@/contexts/MenuPlannerContext";
import {
    RecipeQueueProvider,
    useRecipeQueue,
} from "@/contexts/RecipeQueueContext";
import { useSpacetime } from "@/contexts/SpacetimeContext";
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
import { useRecipeRefResolver } from "@/hooks/useRecipeRefResolver";
import { useShareIdentityDefault } from "@/hooks/useShareIdentityDefault";
import { useSpacetimePlannerSync } from "@/hooks/useSpacetimePlannerSync";
import { shareIdentityForPost } from "@/lib/feed/identity";
import { isLiveFeedEnabled } from "@/lib/spacetime/config";
import { publishLiveFeedEvent } from "@/lib/spacetime/liveFeedPublish";
import type { SavedChart } from "@/types/natalChart";
import type { Recipe } from "@/types/recipe";

const GenerationPreferencesPanel = dynamic(
  () => import("@/components/menu-planner/GenerationPreferencesPanel"),
);
const GroceryListModal = dynamic(
  () => import("@/components/menu-planner/GroceryListModal"),
);
const NutritionalDashboard = dynamic(
  () => import("@/components/menu-planner/NutritionalDashboard"),
);
const PossoWidget = dynamic(() => import("@/components/menu-planner/PossoWidget"));
const RecipeBrowserPanel = dynamic(
  () => import("@/components/menu-planner/RecipeBrowserPanel"),
);
const RecipeDetailModal = dynamic(
  () => import("@/components/menu-planner/RecipeDetailModal"),
);
const TodaysMealsWidget = dynamic(
  () => import("@/components/menu-planner/TodaysMealsWidget"),
);
const RecipeQueue = dynamic(
  () => import("@/components/menu-planner/RecipeQueue"),
);
const SmartSuggestionsSidebarLazy = dynamic(
  () => import("@/components/menu-builder/SmartSuggestionsSidebar"),
);

/**
 * Convert a SavedChart into a Participant payload for the menu planner.
 * Returns null if the chart's birth date is invalid.
 */
function chartToParticipant(chart: SavedChart): Omit<Participant, "id"> | null {
  const dt = new Date(chart.birthData.dateTime);
  if (Number.isNaN(dt.getTime())) return null;
  const iso = dt.toISOString();
  return {
    name: chart.label,
    birthDate: iso.slice(0, 10),
    birthTime: iso.slice(11, 16),
    location: `${chart.birthData.latitude.toFixed(2)}, ${chart.birthData.longitude.toFixed(2)} (${chart.birthData.timezone ?? "UTC"})`,
  };
}

/**
 * Menu Planner Content (inner component with context access)
 */
function MenuPlannerContent() {
  const menuPlannerActions = useMenuPlanner();
  const {
    currentMenu,
    weeklyStats,
    groceryList: _groceryList,
    regenerateGroceryList,
    clearWeek: _clearWeek,
    saveAsTemplate,
    refreshStats: _refreshStats,
    syncWithLunarCycle,
    toggleSyncWithLunarCycle,
    participants,
    addParticipant,
    removeParticipant,
  } = menuPlannerActions;

  const { queueSize } = useRecipeQueue();

  // Real-time nutrition tracking - recalculates whenever menu changes
  // Passes user's custom nutritional targets so compliance reflects their goals
  const weeklyNutrition = useNutritionTracking(
    currentMenu,
    menuPlannerActions.generationPreferences.nutritionalTargets,
  );

  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // Identity flip (PR 4): posts are NAMED by default; the checkbox is the
  // per-post anonymity opt-out. Pre-checked for users whose global
  // share_identity default is off.
  const [postAnonymously, setPostAnonymously] = useState(false);
  const { shareByDefault } = useShareIdentityDefault();
  useEffect(() => {
    setPostAnonymously(!shareByDefault);
  }, [shareByDefault]);
  const [shareTitle, setShareTitle] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [showNutritionDashboard, setShowNutritionDashboard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showRecipeQueue, setShowRecipeQueue] = useState(true);
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false);
  const [showRecipeBrowser, setShowRecipeBrowser] = useState(false);
  const [showPosso, setShowPosso] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [isWeeklyDashboardExpanded, setIsWeeklyDashboardExpanded] =
    useState(false); // New state for sticky dashboard

  const { toast, showSuccess, showError, showInfo } = useToast();

  const [showParticipantSelection, setShowParticipantSelection] =
    useState(false);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [loadingSavedCharts, setLoadingSavedCharts] = useState(true);
  const [errorSavedCharts, setErrorSavedCharts] = useState<string | null>(null);

  // Derive selected chart ids from the planner context so the modal stays in
  // sync across reopens. Chart-derived participants use id `chart-<chartId>`.
  const selectedChartIds = useMemo(
    () =>
      new Set(
        participants
          .filter((p) => p.id.startsWith("chart-"))
          .map((p) => p.id.slice("chart-".length)),
      ),
    [participants],
  );

  useEffect(() => {
    const fetchSavedCharts = async () => {
      try {
        setLoadingSavedCharts(true);
        setErrorSavedCharts(null);
        const response = await fetch("/api/user/charts");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = (await response.json()) as {
          success: boolean;
          charts?: SavedChart[];
          message?: string;
        };
        if (!json.success) {
          throw new Error(json.message ?? "Failed to load charts");
        }
        setSavedCharts(json.charts ?? []);
      } catch (error: any) {
        setErrorSavedCharts(error.message);
        console.error("Failed to fetch saved charts:", error);
      } finally {
        setLoadingSavedCharts(false);
      }
    };

    if (showParticipantSelection) {
      // Only fetch when the selection UI is active
      void fetchSavedCharts();
    }
  }, [showParticipantSelection]); // Re-fetch when UI visibility changes

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showError("Please enter a template name");
      return;
    }

    try {
      await saveAsTemplate(templateName);
      showSuccess(`Template "${templateName}" saved!`);
      setTemplateName("");
      setShowSaveTemplate(false);
    } catch (err) {
      showError("Failed to save template");
      console.error(err);
    }
  };

  const handleShareToFeed = async () => {
    if (!currentMenu) return;
    setIsSharing(true);
    try {
      const mealCount = currentMenu.meals.filter((m) => m.recipe).length;
      const res = await fetch("/api/feed/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareType: "menu",
          shareIdentity: shareIdentityForPost(postAnonymously, shareByDefault),
          payload: {
            menuTitle: shareTitle.trim() || "a weekly menu",
            weekStartDate: currentMenu.weekStartDate,
            mealCount,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        let questMessage = "";
        if (data.completedQuests && data.completedQuests.length > 0) {
          const rewardQuest = data.completedQuests[0];
          questMessage = ` ✨ +${rewardQuest.tokenRewardAmount} ${rewardQuest.tokenRewardType} — the Work notices.`;
        }
        // Dual-write to the live feed so connected clients see the share
        // instantly (Postgres via /api/feed/share stays the source of truth).
        if (isLiveFeedEnabled() && stdbConnection && stdbStatus === "connected") {
          publishLiveFeedEvent(stdbConnection, {
            actorName: postAnonymously ? "" : (authSession?.user?.name ?? ""),
            eventType: "shared_menu",
            payload: {
              menuTitle: shareTitle.trim() || "a weekly menu",
              weekStartDate: currentMenu.weekStartDate,
              mealCount,
            },
          });
        }
        showSuccess(`Successfully shared to community feed!${questMessage}`);
        setShowShareModal(false);
      } else {
        showError(data.message || "Failed to share to feed");
      }
    } catch (err) {
      showError("Error sharing menu to feed");
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  // The legacy "Cycle Telemetry" derived values (energyPct/proteinPct/
  // elementalTotals/qualities/natalResonance) were removed with that panel;
  // the desktop left column now renders the real <WeeklyInsights /> instead.

  const [activeElementFilter, setActiveElementFilter] = useState<"fire" | "water" | "earth" | "air" | null>(null);

  // Rehydration sources for remote-slot materialization, latched on the
  // first time the sync layer reports remote slots needing recipes — planner
  // visits with nothing to rehydrate never pay the static-catalog fetch or
  // the live recipe-table subscription.
  const [rehydrationActive, setRehydrationActive] = useState(false);
  const resolveRecipeRef = useRecipeRefResolver(rehydrationActive);

  // Syncs the plan with SpacetimeDB when the live-planner flag is on
  // (write-mirror + remote→local application + remote-slot
  // materialization); inert otherwise.
  const plannerSync = useSpacetimePlannerSync(
    currentMenu,
    menuPlannerActions,
    resolveRecipeRef,
  );
  useEffect(() => {
    if (plannerSync.unappliedRemoteSlots > 0) setRehydrationActive(true);
  }, [plannerSync.unappliedRemoteSlots]);
  const { connection: stdbConnection, status: stdbStatus } = useSpacetime();
  const { data: authSession } = useSession();

  return (
    <div className="lab min-h-screen text-on-surface select-none pb-24">
      <div className="w-full px-4 xl:px-8 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary mb-2">
              Weekly Menu Planner
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Align your macro-nutritional intake with orbital cycles. Map out the week&apos;s alchemical transmutations for optimal systemic resonance.
            </p>
            {plannerSync.live && (
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold-accent/30 bg-gold-accent/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold-accent"
                title={
                  plannerSync.unappliedRemoteSlots > 0
                    ? `Weekly plan syncs in real time. ${plannerSync.unappliedRemoteSlots} slot(s) planned elsewhere are still rehydrating — they'll appear once their recipes resolve.`
                    : "Weekly plan syncs with SpacetimeDB in real time — meals planned on other devices appear here as they sync"
                }
              >
                ⚡ plan sync live · {plannerSync.liveSlotCount} slots
                {plannerSync.unappliedRemoteSlots > 0 &&
                  ` · ${plannerSync.unappliedRemoteSlots} elsewhere`}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-6 py-2 border border-active-violet text-active-violet font-label-caps text-label-caps hover:bg-active-violet/10 transition-colors uppercase cursor-pointer active:scale-95 flex items-center justify-center"
            >
              Home
            </Link>
          </div>
        </header>

        {/* Collective Guest Banner (Active State) */}
        {selectedChartIds.size > 0 && (
          <div className="alchm-panel alchm-panel-glow regmarks p-4 mb-8 flex justify-between items-center rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-gold-accent">✦</span>
              <span className="font-telemetry-lg text-telemetry-lg text-primary">
                Collective Meal Active with [{selectedChartIds.size}] guest(s)!
              </span>
            </div>
            <button
              onClick={() => {
                participants
                  .filter((p) => p.id.startsWith("chart-"))
                  .forEach((p) => removeParticipant(p.id));
              }}
              className="px-4 py-1 text-xs border border-muted font-label-caps text-label-caps text-on-surface-variant hover:text-white hover:border-white transition-colors cursor-pointer active:scale-95"
            >
              Clear Guests
            </button>
          </div>
        )}

        {/* Quick Actions Toolbar + Generation Preferences — desktop/tablet only.
            On mobile the redesigned calendar leads; whole-week generation returns
            via the guided empty-state (next slice). */}
        <div className="hidden md:block">
          {/* Quick Actions Toolbar - Generate, Balance, Variety, Clear */}
          <QuickActionsToolbar onTogglePreferences={() => setShowPreferencesPanel((p) => !p)} />

          {/* Generation Preferences Panel */}
          <GenerationPreferencesPanel
            isOpen={showPreferencesPanel}
            onToggle={() => setShowPreferencesPanel((p) => !p)}
          />
        </div>

        {/* Tools Bar — desktop/tablet only (secondary tools; mobile uses the
            redesigned calendar's inline actions + Shop the week) */}
        <div className="hidden md:block alchm-panel p-4 mt-3 rounded-xl">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowRecipeQueue(!showRecipeQueue)}
              className={`flex items-center gap-2 px-4 py-2 border transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95 ${
                showRecipeQueue
                  ? "border-active-violet text-active-violet bg-active-violet/10 shadow-[0_0_10px_rgba(184,90,240,0.1)]"
                  : "border-muted text-on-surface-variant hover:text-white hover:border-white"
              }`}
            >
              <span className="text-[18px]">📋</span>
              Queue {queueSize > 0 && `(${queueSize})`}
            </button>

            <button
              onClick={() => setShowRecipeBrowser(!showRecipeBrowser)}
              className={`flex items-center gap-2 px-4 py-2 border transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95 ${
                showRecipeBrowser
                  ? "border-active-violet text-active-violet bg-active-violet/10 shadow-[0_0_10px_rgba(184,90,240,0.1)]"
                  : "border-muted text-on-surface-variant hover:text-white hover:border-white"
              }`}
            >
              <span className="text-[18px]">🔍</span>
              Browse Recipes
            </button>

            <button
              onClick={() => setShowPosso(!showPosso)}
              className={`flex items-center gap-2 px-4 py-2 border transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95 ${
                showPosso
                  ? "border-active-violet text-active-violet bg-active-violet/10 shadow-[0_0_10px_rgba(184,90,240,0.1)]"
                  : "border-muted text-on-surface-variant hover:text-white hover:border-white"
              }`}
            >
              <span className="text-[18px]">🍲</span>
              Pantry Meals (Posso)
            </button>

            <button
              onClick={() => {
                regenerateGroceryList();
                setShowGroceryList(true);
                setIsWeeklyDashboardExpanded(false);
                setShowPosso(false);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">🛒</span>
              Grocery List
            </button>

            <button
              onClick={() => {
                setIsWeeklyDashboardExpanded(!isWeeklyDashboardExpanded);
                setShowGroceryList(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 border transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95 ${
                isWeeklyDashboardExpanded
                  ? "border-active-violet text-active-violet bg-active-violet/10 shadow-[0_0_10px_rgba(184,90,240,0.1)]"
                  : "border-muted text-on-surface-variant hover:text-white hover:border-white"
              }`}
            >
              <span className="text-[18px]">📊</span>
              Nutrition Dashboard
            </button>

            <button
              onClick={() => setShowSaveTemplate(true)}
              className="flex items-center gap-2 px-4 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">💾</span>
              Save as Template
            </button>

            <button
              onClick={() => {
                setShareTitle("");
                // Reset to the user's global default (pre-checked for opt-outs).
                setPostAnonymously(!shareByDefault);
                setShowShareModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
            >
              <span className="text-[18px]">📢</span>
              Share to Feed
            </button>

            <button
              onClick={() => { void toggleSyncWithLunarCycle(); }}
              className={`flex items-center gap-2 px-4 py-2 border transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95 ${
                syncWithLunarCycle
                  ? "border-active-violet text-active-violet bg-active-violet/10 shadow-[0_0_10px_rgba(184,90,240,0.1)]"
                  : "border-muted text-on-surface-variant hover:text-white hover:border-white"
              }`}
            >
              <span className="text-[18px]">☽</span>
              Sync Lunar
            </button>

            {/* Elemental Quick Filters */}
            <div className="flex gap-1 bg-surface-container-lowest border border-muted rounded-xl p-1 items-center">
              <button 
                onClick={() => {
                  const val = activeElementFilter === "fire" ? null : "fire";
                  setActiveElementFilter(val);
                  showInfo(val ? "Filtering by Fire 🜂 recipes" : "Cleared elemental filter");
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm cursor-pointer active:scale-90 ${activeElementFilter === "fire" ? "bg-fire-spirit/20 text-fire-spirit border border-fire-spirit/30" : "text-fire-spirit hover:bg-fire-spirit/10"}`}
                title="Filter by Fire 🜂"
              >
                🜂
              </button>
              <button 
                onClick={() => {
                  const val = activeElementFilter === "water" ? null : "water";
                  setActiveElementFilter(val);
                  showInfo(val ? "Filtering by Water 🜄 recipes" : "Cleared elemental filter");
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm cursor-pointer active:scale-90 ${activeElementFilter === "water" ? "bg-water-essence/20 text-water-essence border border-water-essence/30" : "text-water-essence hover:bg-water-essence/10"}`}
                title="Filter by Water 🜄"
              >
                🜄
              </button>
              <button 
                onClick={() => {
                  const val = activeElementFilter === "earth" ? null : "earth";
                  setActiveElementFilter(val);
                  showInfo(val ? "Filtering by Earth 🜃 recipes" : "Cleared elemental filter");
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm cursor-pointer active:scale-90 ${activeElementFilter === "earth" ? "bg-earth-matter/20 text-earth-matter border border-earth-matter/30" : "text-earth-matter hover:bg-earth-matter/10"}`}
                title="Filter by Earth 🜃"
              >
                🜃
              </button>
              <button 
                onClick={() => {
                  const val = activeElementFilter === "air" ? null : "air";
                  setActiveElementFilter(val);
                  showInfo(val ? "Filtering by Air 🜁 recipes" : "Cleared elemental filter");
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm cursor-pointer active:scale-90 ${activeElementFilter === "air" ? "bg-air-substance/20 text-air-substance border border-air-substance/30" : "text-air-substance hover:bg-air-substance/10"}`}
                title="Filter by Air 🜁"
              >
                🜁
              </button>
            </div>

            <button
              onClick={() =>
                setShowParticipantSelection(!showParticipantSelection)
              }
              className={`flex items-center gap-2 px-4 py-2 border transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95 ${
                showParticipantSelection
                  ? "border-active-violet text-active-violet bg-active-violet/10 shadow-[0_0_10px_rgba(184,90,240,0.1)]"
                  : "border-muted text-on-surface-variant hover:text-white hover:border-white"
              }`}
            >
              <span className="text-[18px]">👥</span>
              Add Participant
            </button>
          </div>
        </div>

        {/* Sticky nutrition bar removed — TGT/PRO/FIB and "ORBITAL SYNC" were
            hardcoded placeholders, not computed from the planned meals. The real
            nutrition totals live in the Nutrition Dashboard panel below. */}
        
        {/* Posso Widget Panel (collapsible) — desktop/tablet only */}
        {showPosso && (
          <div className="hidden md:block mb-6 h-[500px]">
            <PossoWidget onClose={() => setShowPosso(false)} />
          </div>
        )}

        {/* Main Dashboard Grid — desktop/tablet only. The left "Cycle Telemetry"
            panel is legacy/placeholder; on mobile the redesigned Week Insights
            rail (real elemental balance + budget) replaces it, and the Today
            hero replaces TodaysMealsWidget. */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 mt-6">
          {/* Week Balance (Left Column) — real insights (elemental balance,
              budget, variety/suggestions). Replaces the legacy placeholder
              "Cycle Telemetry" (hardcoded ☽14°, 65/82 fallbacks, natal-resonance
              terminal) with values computed from the planned meals. */}
          <div className="lg:col-span-4">
            <WeeklyInsights />
          </div>

          {/* Today's Meals (Middle/Right) */}
          <div className="lg:col-span-8">
            <TodaysMealsWidget
              weekPlan={currentMenu}
              onAddRecipe={(dayOfWeek, mealType, recipe) => {
                const { addMealToSlot } = menuPlannerActions;
                void addMealToSlot(dayOfWeek, mealType, recipe);
              }}
              onRecommendMeal={(dayOfWeek, mealType) => {
                const { generateMealsForDay } = menuPlannerActions;
                void generateMealsForDay(dayOfWeek, { mealTypes: [mealType] });
              }}
            />
          </div>
        </div>

        {/* Recipe Browser Panel (collapsible) — desktop/tablet only */}
        {showRecipeBrowser && (
          <div className="hidden md:block mb-6" style={{ maxHeight: "500px" }}>
            <RecipeBrowserPanel
              activeElementFilter={activeElementFilter}
              onSelectRecipe={(recipe) => {
                showInfo(
                  `Selected "${recipe.name}" - drag from queue or use Recipe Selector to add to a meal slot`,
                );
              }}
              onViewRecipeDetail={(recipe) => setDetailRecipe(recipe)}
            />
          </div>
        )}

        {/* Main Content - Full-width Calendar */}
        <div className="w-full">
          <WeeklyCalendar
            onShopWeek={() => {
              regenerateGroceryList();
              setShowGroceryList(true);
              setIsWeeklyDashboardExpanded(false);
              setShowPosso(false);
            }}
          />
        </div>

        {/* Sidebars row - below calendar for better readability */}
        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          {/* Recipe Queue — desktop/tablet only (drag-oriented; mobile uses
              tap-to-add on the calendar) */}
          {showRecipeQueue && (
            <div className="hidden md:block w-full lg:w-96 flex-shrink-0">
              <RecipeQueue
                onSelectRecipe={() => {
                  showInfo(
                    "Drag recipes from the queue to meal slots on the calendar!",
                  );
                }}
              />
            </div>
          )}

          {/* Smart Suggestions - right side */}
          <div className="flex-1 hidden lg:block">
            <SmartSuggestionsSidebarLazy
              weekPlan={currentMenu}
              weeklyNutrition={weeklyNutrition}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        </div>

        {/* Tablet: Suggestions Bottom Sheet — hidden on mobile to avoid a second
            fixed bottom layer over the global tab bar (redesigned insights rail
            already surfaces suggestions on mobile) */}
        <div className="hidden md:block lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-active-violet/30 shadow-xl z-40">
          <button
            onClick={() => setShowMobileSuggestions(!showMobileSuggestions)}
            className="w-full flex items-center justify-between px-4 py-3 focus:outline-none bg-surface-container-low"
          >
            <div className="flex items-center gap-2">
              <span className="text-base text-active-violet">✨</span>
              <span className="font-bold text-primary text-sm font-label-caps">
                Smart Suggestions
              </span>
            </div>
            <span className="text-active-violet font-bold">
              {showMobileSuggestions ? "▼" : "▲"}
            </span>
          </button>
          {showMobileSuggestions && (
            <div className="max-h-72 overflow-y-auto bg-surface-container">
              <SmartSuggestionsSidebarLazy
                weekPlan={currentMenu}
                weeklyNutrition={weeklyNutrition}
                isCollapsed={false}
              />
            </div>
          )}
        </div>

        {/* Recipe Detail Modal */}
        {detailRecipe && (
          <RecipeDetailModal
            recipe={detailRecipe}
            isOpen
            onClose={() => setDetailRecipe(null)}
            onAddToMeal={(recipe) => {
              showInfo(
                `"${recipe.name}" ready to add - use the calendar meal slots`,
              );
              setDetailRecipe(null);
            }}
          />
        )}

        {/* Enhanced Grocery List Modal (Phase 3) */}
        <GroceryListModal
          isOpen={showGroceryList}
          onClose={() => setShowGroceryList(false)}
        />

        {/* Nutritional Dashboard - Alchemical Metrics (Phase 3) */}
        <NutritionalDashboard
          isOpen={showNutritionDashboard}
          onClose={() => setShowNutritionDashboard(false)}
        />

        {/* New: Participant Selection Modal */}
        {showParticipantSelection && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="alchm-panel alchm-panel-glow regmarks max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-muted">
                <div className="flex items-center justify-between">
                  <h2 className="font-display-lg text-headline-lg text-primary">
                    Add Guest Alchemists
                  </h2>
                  <button
                    onClick={() => setShowParticipantSelection(false)}
                    className="text-on-surface-variant hover:text-white text-2xl transition-colors cursor-pointer active:scale-95"
                  >
                    ×
                  </button>
                </div>
                <p className="text-on-surface-variant mt-1 text-sm font-body-sm">
                  Select saved charts to include in collective planning.
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh] flex-1">
                {loadingSavedCharts && <p className="text-on-surface-variant font-mono text-sm">Loading saved charts...</p>}
                {errorSavedCharts && (
                  <p className="text-red-400 font-mono text-sm">Error: {errorSavedCharts}</p>
                )}
                {!loadingSavedCharts &&
                  !errorSavedCharts &&
                  (savedCharts.length > 0 ? (
                    <div className="space-y-3">
                      {savedCharts.map((chart) => (
                        <label
                          key={chart.id}
                          className="flex items-center p-3 bg-surface-container-low border border-muted rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedChartIds.has(chart.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const payload = chartToParticipant(chart);
                                if (!payload) {
                                  showError(
                                    "Saved chart has invalid birth date",
                                  );
                                  return;
                                }
                                addParticipant(payload, `chart-${chart.id}`);
                              } else {
                                removeParticipant(`chart-${chart.id}`);
                              }
                            }}
                            className="form-checkbox h-5 w-5 text-active-violet rounded border-muted bg-surface-container-lowest focus:ring-active-violet focus:ring-offset-0"
                          />
                          <span className="ml-3 text-primary font-medium">
                            {chart.label} (Born:{" "}
                            {new Date(
                              chart.birthData.dateTime,
                            ).toLocaleDateString()}
                            )
                          </span>
                          <span className="ml-auto text-sm text-on-surface-variant">
                            {chart.isPrimary ? "Primary" : ""}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-on-surface-variant font-body-sm">
                      No saved charts found. Add charts from your profile.
                    </p>
                  ))}
              </div>

              <div className="p-6 border-t border-muted bg-surface-container-lowest/80 flex justify-end gap-3">
                <button
                  onClick={() => setShowParticipantSelection(false)}
                  className="px-6 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStats && weeklyStats && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="alchm-panel alchm-panel-glow regmarks max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-muted">
                <div className="flex items-center justify-between">
                  <h2 className="font-display-lg text-headline-lg text-primary">
                    Weekly Statistics
                  </h2>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-on-surface-variant hover:text-white text-2xl transition-colors cursor-pointer active:scale-95"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh] flex-1">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-muted">
                    <p className="text-xs text-on-surface-variant font-label-caps mb-1">
                      Total Meals
                    </p>
                    <p className="text-3xl font-bold font-mono text-primary">
                      {weeklyStats.totalMeals}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-muted">
                    <p className="text-xs text-on-surface-variant font-label-caps mb-1">
                      Unique Recipes
                    </p>
                    <p className="text-3xl font-bold font-mono text-active-violet">
                      {weeklyStats.totalRecipes}
                    </p>
                  </div>
                </div>

                {weeklyStats.missingMeals.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-orange-950/20 border border-orange-500/20">
                    <p className="font-medium text-orange-400 mb-2 font-body-md">
                      Missing Meals ({weeklyStats.missingMeals.length})
                    </p>
                    <ul className="text-sm text-on-surface-variant font-mono space-y-1">
                      {weeklyStats.missingMeals.map((missing, idx) => (
                        <li key={idx}>
                          Day {missing.dayOfWeek} - {missing.mealType}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center text-on-surface-variant/50 mt-6">
                  <p className="text-sm font-body-sm">
                    Fill in more meals to unlock richer elemental insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Template Modal */}
        {showSaveTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="alchm-panel alchm-panel-glow regmarks max-w-md w-full">
              <div className="p-6 border-b border-muted">
                <h2 className="font-display-lg text-headline-lg text-primary">
                  Save as Template
                </h2>
              </div>

              <div className="p-6">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="block mb-2 text-xs font-label-caps text-on-surface-variant">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., My Balanced Week"
                  className="w-full px-4 py-2 border border-muted bg-surface-container-low text-primary rounded-xl focus:border-active-violet focus:outline-none placeholder:text-on-surface-variant/40"
                />
              </div>

              <div className="p-6 border-t border-muted bg-surface-container-lowest/80 flex gap-3">
                <button
                  onClick={() => setShowSaveTemplate(false)}
                  className="flex-1 px-4 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { void handleSaveTemplate(); }}
                  className="flex-1 px-4 py-2 border border-active-violet text-active-violet bg-active-violet/10 hover:bg-active-violet/20 transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share to Feed Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="alchm-panel alchm-panel-glow regmarks max-w-md w-full">
              <div className="p-6 border-b border-muted">
                <h2 className="font-display-lg text-headline-lg text-primary">
                  Share Menu to Feed
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className="block mb-2 text-xs font-label-caps text-on-surface-variant">
                    Menu Description/Title
                  </label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="e.g., My Saturn-aligned Autumn Feast"
                    className="w-full px-4 py-2 border border-muted bg-surface-container-low text-primary rounded-xl focus:border-active-violet focus:outline-none placeholder:text-on-surface-variant/40"
                  />
                </div>

                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-surface-container-low rounded-xl border border-muted">
                  <input
                    type="checkbox"
                    checked={postAnonymously}
                    onChange={(e) => setPostAnonymously(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-active-violet rounded border-muted bg-surface-container-lowest focus:ring-active-violet focus:ring-offset-0"
                  />
                  <span className="text-xs font-label-caps text-primary">
                    Post anonymously (hide my name on this post)
                  </span>
                </label>
              </div>

              <div className="p-6 border-t border-muted bg-surface-container-lowest/80 flex gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  disabled={isSharing}
                  className="flex-1 px-4 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { void handleShareToFeed(); }}
                  disabled={isSharing}
                  className="flex-1 px-4 py-2 border border-active-violet text-active-violet bg-active-violet/10 hover:bg-active-violet/20 transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
                >
                  {isSharing ? "Sharing..." : "Share to Feed"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 mb-16 lg:mb-0 text-center text-on-surface-variant/60 font-mono uppercase tracking-widest text-[10px]">
          <p className="mb-2">
            Powered by alchemical harmony and real-time planetary calculations
          </p>
          <p>
            Drag recipes between slots • Copy/move meals • Generate
            planetary-aligned suggestions
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast}
    </div>
  );
}

/**
 * Main Page Export (wrapped in providers)
 */
export default function MenuPlannerPage() {
  return (
    <RecipeQueueProvider>
      <MenuPlannerProvider>
        <MenuPlannerContent />
      </MenuPlannerProvider>
    </RecipeQueueProvider>
  );
}
