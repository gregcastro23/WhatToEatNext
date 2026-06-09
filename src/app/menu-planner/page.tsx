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
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/common/Toast";
import QuickActionsToolbar from "@/components/menu-builder/QuickActionsToolbar";
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
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
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
const WeekProgress = dynamic(
  () => import("@/components/menu-builder/WeekProgress"),
);
const RecipeQueue = dynamic(
  () => import("@/components/menu-planner/RecipeQueue"),
);
const WeeklyNutritionDashboard = dynamic(
  () => import("@/components/nutrition").then((mod) => mod.WeeklyNutritionDashboard),
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
  const [shareNameOptIn, setShareNameOptIn] = useState(false);
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
          shareName: shareNameOptIn,
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
          questMessage = ` 🏆 Quest completed! Earned ${rewardQuest.tokenRewardAmount} ${rewardQuest.tokenRewardType}!`;
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

  const energyPct = useMemo(() => {
    return weeklyNutrition?.weeklyTotals?.calories && weeklyNutrition?.weeklyGoals?.calories
      ? Math.round((weeklyNutrition.weeklyTotals.calories / weeklyNutrition.weeklyGoals.calories) * 100)
      : 65;
  }, [weeklyNutrition]);

  const proteinPct = useMemo(() => {
    return weeklyNutrition?.weeklyTotals?.protein && weeklyNutrition?.weeklyGoals?.protein
      ? Math.round((weeklyNutrition.weeklyTotals.protein / weeklyNutrition.weeklyGoals.protein) * 100)
      : 82;
  }, [weeklyNutrition]);

  const elementalTotals = useMemo(() => {
    const totals = { fire: 0, water: 0, earth: 0, air: 0 };
    if (!currentMenu) return { fire: 25, water: 25, earth: 25, air: 25 };
    const mealsWithRecipe = currentMenu.meals.filter((m) => m.recipe);
    if (mealsWithRecipe.length === 0) return { fire: 25, water: 25, earth: 25, air: 25 };
    
    mealsWithRecipe.forEach((m) => {
      const props = m.recipe?.elementalProperties;
      if (props) {
        totals.fire += props.fire || 0;
        totals.water += props.water || 0;
        totals.earth += props.earth || 0;
        totals.air += props.air || 0;
      }
    });
    
    const sum = totals.fire + totals.water + totals.earth + totals.air || 1;
    return {
      fire: Math.round((totals.fire / sum) * 100),
      water: Math.round((totals.water / sum) * 100),
      earth: Math.round((totals.earth / sum) * 100),
      air: Math.round((totals.air / sum) * 100),
    };
  }, [currentMenu]);

  const qualities = useMemo(() => {
    const fire = elementalTotals.fire;
    const water = elementalTotals.water;
    const earth = elementalTotals.earth;
    const air = elementalTotals.air;
    
    const heat = (fire + air) - (water + earth); 
    const moisture = (air + water) - (fire + earth);
    
    const x = 50 + (moisture * 0.4); 
    const y = 50 - (heat * 0.4); 
    
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  }, [elementalTotals]);

  const getElementalLabel = (pct: number) => {
    if (pct === 0) return "Zero";
    if (pct > 30) return "High";
    if (pct < 15) return "Low";
    if (pct >= 22 && pct <= 28) return "Opt";
    return "Bal";
  };

  const natalResonance = useMemo(() => {
    if (selectedChartIds.size > 0) {
      return Math.min(100, 80 + (selectedChartIds.size * 4));
    }
    return 92;
  }, [selectedChartIds.size]);

  const [activeElementFilter, setActiveElementFilter] = useState<"fire" | "water" | "earth" | "air" | null>(null);

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
              Align your macro-nutritional intake with orbital cycles. Map out the week's alchemical transmutations for optimal systemic resonance.
            </p>
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
              <span className="material-symbols-outlined text-gold-accent">stars</span>
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

        {/* Quick Actions Toolbar - Generate, Balance, Variety, Clear */}
        <QuickActionsToolbar onTogglePreferences={() => setShowPreferencesPanel((p) => !p)} />

        {/* Generation Preferences Panel */}
        <GenerationPreferencesPanel
          isOpen={showPreferencesPanel}
          onToggle={() => setShowPreferencesPanel((p) => !p)}
        />

        {/* Tools Bar */}
        <div className="alchm-panel p-4 mt-3 rounded-xl">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowRecipeQueue(!showRecipeQueue)}
              className={`flex items-center gap-2 px-4 py-2 border transition-all font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95 ${
                showRecipeQueue
                  ? "border-active-violet text-active-violet bg-active-violet/10 shadow-[0_0_10px_rgba(184,90,240,0.1)]"
                  : "border-muted text-on-surface-variant hover:text-white hover:border-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">list_alt</span>
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
              <span className="material-symbols-outlined text-[18px]">search</span>
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
              <span className="material-symbols-outlined text-[18px]">soup_kitchen</span>
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
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
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
              <span className="material-symbols-outlined text-[18px]">monitoring</span>
              Nutrition Dashboard
            </button>

            <button
              onClick={() => setShowSaveTemplate(true)}
              className="flex items-center gap-2 px-4 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save as Template
            </button>

            <button
              onClick={() => {
                setShareTitle("");
                setShareNameOptIn(false);
                setShowShareModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-muted text-on-surface-variant hover:text-white hover:border-white transition-colors font-label-caps text-label-caps text-xs uppercase cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
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
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
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
              <span className="material-symbols-outlined text-[18px]">group</span>
              Add Participant
            </button>
          </div>
        </div>

        {/* Sticky Nutrition Dashboard */}
        <div className="sticky top-20 z-40 alchm-panel border-b border-muted bg-surface/90 backdrop-blur-md p-4 mb-8 flex flex-wrap gap-6 items-center rounded-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-active-violet">bolt</span>
            <span className="font-telemetry-md text-telemetry-md text-on-surface-variant">TGT: 2400 KCAL</span>
          </div>
          <div className="w-px h-6 bg-border-muted hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-fire-spirit">fitness_center</span>
            <span className="font-telemetry-md text-telemetry-md text-on-surface-variant">PRO: 180G</span>
          </div>
          <div className="w-px h-6 bg-border-muted hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-earth-matter">eco</span>
            <span className="font-telemetry-md text-telemetry-md text-on-surface-variant">FIB: 35G</span>
          </div>
          <div className="w-px h-6 bg-border-muted hidden md:block"></div>
          <div className="flex items-center gap-2">
            <span className="font-telemetry-md text-telemetry-md text-gold-accent">☉ 92%</span>
            <span className="font-telemetry-md text-telemetry-md text-on-surface-variant">ORBITAL SYNC</span>
          </div>
        </div>
        
        {/* Posso Widget Panel (collapsible) */}
        {showPosso && (
          <div className="mb-6 h-[500px]">
            <PossoWidget onClose={() => setShowPosso(false)} />
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 mt-6">
          {/* Week Progress (Left Column) */}
          <div className="lg:col-span-4 alchm-panel p-6 rounded-xl flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-muted pb-2">
              <h3 className="font-headline-md text-headline-md text-primary">Cycle Telemetry</h3>
              <span className="text-on-surface-variant font-telemetry-md text-telemetry-md">☽ 14°</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-telemetry-md text-telemetry-md mb-1">
                  <span className="text-on-surface-variant">Energy (KCAL)</span>
                  <span className="text-active-violet">{energyPct}%</span>
                </div>
                <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-active-violet" style={{ width: `${Math.min(100, energyPct)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-telemetry-md text-telemetry-md mb-1">
                  <span className="text-on-surface-variant">Protein</span>
                  <span className="text-fire-spirit">{proteinPct}%</span>
                </div>
                <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-fire-spirit" style={{ width: `${Math.min(100, proteinPct)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Dual Axis Gauge */}
            <div className="flex flex-col gap-2 mt-2 border-t border-muted pt-4">
              <div className="text-xs text-on-surface-variant font-label-caps text-center">Alchemical Qualities</div>
              <div className="relative w-full h-24 bg-surface-container-lowest border border-muted rounded gauge-crosshair flex items-center justify-center overflow-hidden">
                <span className="absolute top-1 text-[10px] text-on-surface-variant">HOT</span>
                <span className="absolute bottom-1 text-[10px] text-on-surface-variant">COLD</span>
                <span className="absolute left-1 text-[10px] text-on-surface-variant">DRY</span>
                <span className="absolute right-1 text-[10px] text-on-surface-variant">MOIST</span>
                {/* Indicator Dot */}
                <div 
                  className="w-3 h-3 rounded-full bg-gold-accent absolute shadow-[0_0_8px_rgba(201,162,39,0.8)] transition-all duration-500 ease-out" 
                  style={{ top: `${qualities.y}%`, left: `${qualities.x}%`, transform: "translate(-50%, -50%)" }}
                ></div>
              </div>
            </div>

            {/* Elemental breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-2 border-t border-muted pt-4">
              <div className="bg-surface-container-low p-3 rounded border border-muted text-center">
                <div className="text-[10px] text-on-surface-variant mb-1 font-label-caps">Fire 🜂 ({elementalTotals.fire}%)</div>
                <div className={`font-telemetry-lg text-telemetry-lg ${elementalTotals.fire > 25 ? 'text-fire-spirit' : 'text-on-surface-variant'}`}>{getElementalLabel(elementalTotals.fire)}</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded border border-muted text-center">
                <div className="text-[10px] text-on-surface-variant mb-1 font-label-caps">Water 🜄 ({elementalTotals.water}%)</div>
                <div className={`font-telemetry-lg text-telemetry-lg ${elementalTotals.water > 25 ? 'text-water-essence' : 'text-on-surface-variant'}`}>{getElementalLabel(elementalTotals.water)}</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded border border-muted text-center">
                <div className="text-[10px] text-on-surface-variant mb-1 font-label-caps">Earth 🜃 ({elementalTotals.earth}%)</div>
                <div className={`font-telemetry-lg text-telemetry-lg ${elementalTotals.earth > 25 ? 'text-earth-matter' : 'text-on-surface-variant'}`}>{getElementalLabel(elementalTotals.earth)}</div>
              </div>
              <div className="bg-surface-container-low p-3 rounded border border-muted text-center">
                <div className="text-[10px] text-on-surface-variant mb-1 font-label-caps">Air 🜁 ({elementalTotals.air}%)</div>
                <div className={`font-telemetry-lg text-telemetry-lg ${elementalTotals.air > 25 ? 'text-air-substance' : 'text-on-surface-variant'}`}>{getElementalLabel(elementalTotals.air)}</div>
              </div>
            </div>

            {/* Terminals */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="font-telemetry-md text-[10px] bg-surface-container-lowest p-2 border border-muted text-active-violet h-16 overflow-y-auto leading-relaxed font-mono">
                &gt; SYNCING DEGREE AFFINITIES...<br/>
                &gt; NATAL RESONANCE: {natalResonance}%<br/>
                &gt; OPTIMIZING MACROS...
              </div>
              <div className="font-telemetry-md text-[10px] bg-surface-container-lowest p-2 border border-error/30 text-error h-12 overflow-y-auto leading-relaxed font-mono">
                &gt; WARN: MERCURY RETROGRADE<br/>
                &gt; ADJUSTING COGNITIVE LOAD...
              </div>
            </div>
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

        {/* Recipe Browser Panel (collapsible) */}
        {showRecipeBrowser && (
          <div className="mb-6" style={{ maxHeight: "500px" }}>
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
          <WeeklyCalendar />
        </div>

        {/* Sidebars row - below calendar for better readability */}
        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          {/* Recipe Queue */}
          {showRecipeQueue && (
            <div className="w-full lg:w-96 flex-shrink-0">
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

        {/* Mobile: Suggestions Bottom Sheet */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-active-violet/30 shadow-xl z-40">
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
                    checked={shareNameOptIn}
                    onChange={(e) => setShareNameOptIn(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-active-violet rounded border-muted bg-surface-container-lowest focus:ring-active-violet focus:ring-offset-0"
                  />
                  <span className="text-xs font-label-caps text-primary">
                    Opt-in to share my name (defaults to Anonymous Alchemist)
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
