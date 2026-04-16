"use client";

/**
 * TodaysMealsWidget
 * Interactive widget showing today's meal plan with the current meal time highlighted.
 * Users can click meal rows to add recipes directly, similar to clicking on the calendar.
 *
 * @file src/components/menu-planner/TodaysMealsWidget.tsx
 */

import React, { useMemo, useState } from "react";
import { useToast } from "@/components/common/Toast";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import { useUser } from "@/contexts/UserContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { WeeklyMenu, MealType, DayOfWeek } from "@/types/menuPlanner";
import { PLANETARY_DAY_RULERS, getDayName } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import RecipeCollisionModal from "./RecipeCollisionModal";
import RecipeSelector from "./RecipeSelector";

interface TodaysMealsWidgetProps {
  weekPlan: WeeklyMenu | null;
  onScrollToDay?: (day: DayOfWeek) => void;
  onAddRecipe?: (dayOfWeek: DayOfWeek, mealType: MealType, recipe: MonicaOptimizedRecipe) => void;
  onGenerateMeal?: (dayOfWeek: DayOfWeek, mealType: MealType) => void;
}

interface MealWindow {
  type: MealType;
  label: string;
  icon: string;
  startHour: number; // 24h
  endHour: number;
  timeRange: string;
  color: string;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}

const MEAL_WINDOWS: MealWindow[] = [
  {
    type: "breakfast",
    label: "Breakfast",
    icon: "🌅",
    startHour: 5,
    endHour: 11,
    timeRange: "5 – 11 AM",
    color: "text-amber-600",
    activeColor: "text-amber-700",
    activeBg: "bg-amber-50",
    activeBorder: "border-amber-400",
  },
  {
    type: "lunch",
    label: "Lunch",
    icon: "☀️",
    startHour: 11,
    endHour: 15,
    timeRange: "11 AM – 3 PM",
    color: "text-orange-600",
    activeColor: "text-orange-700",
    activeBg: "bg-orange-50",
    activeBorder: "border-orange-400",
  },
  {
    type: "snack",
    label: "Snack",
    icon: "🍎",
    startHour: 15,
    endHour: 18,
    timeRange: "3 – 6 PM",
    color: "text-green-600",
    activeColor: "text-green-700",
    activeBg: "bg-green-50",
    activeBorder: "border-green-400",
  },
  {
    type: "dinner",
    label: "Dinner",
    icon: "🌙",
    startHour: 18,
    endHour: 22,
    timeRange: "6 – 10 PM",
    color: "text-purple-600",
    activeColor: "text-purple-700",
    activeBg: "bg-purple-50",
    activeBorder: "border-purple-400",
  },
];

/**
 * Returns the chronologically next meal target based on the current time.
 * If we're inside a meal window (e.g. 10am during breakfast), returns that
 * meal. After the last window or before the first, wraps to tomorrow's
 * breakfast. Pure time-based — does NOT consider slot occupancy.
 */
function getChronologicalNextMeal(now: Date): {
  mealType: MealType;
  isTomorrow: boolean;
} {
  const hour = now.getHours();
  const firstWindow = MEAL_WINDOWS[0];
  const lastWindow = MEAL_WINDOWS[MEAL_WINDOWS.length - 1];

  // Before breakfast or past dinner → roll to tomorrow's breakfast
  if (hour < firstWindow.startHour || hour >= lastWindow.endHour) {
    return { mealType: "breakfast", isTomorrow: true };
  }

  // Inside or before the end of some window
  const window = MEAL_WINDOWS.find((w) => hour < w.endHour);
  return { mealType: window?.type ?? "breakfast", isTomorrow: false };
}

/**
 * Walk through the week starting at (startDay, startMealIndex) and return
 * the slot ID of the first empty slot. Wraps across days; returns null if
 * every slot in the 7-day window is filled.
 */
function findNextEmptySlotId(
  menu: WeeklyMenu,
  startDay: DayOfWeek,
  startMealIndex: number,
): string | null {
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = ((startDay + dayOffset) % 7) as DayOfWeek;
    const beginIdx = dayOffset === 0 ? startMealIndex : 0;
    for (let mealIdx = beginIdx; mealIdx < MEAL_WINDOWS.length; mealIdx++) {
      const mealType = MEAL_WINDOWS[mealIdx].type;
      const slot = menu.meals.find(
        (m) => m.dayOfWeek === day && m.mealType === mealType,
      );
      if (slot && !slot.recipe) return slot.id;
    }
  }
  return null;
}

/** Returns the MealType whose window contains the current hour */
function getCurrentMealWindow(hour: number): MealType | null {
  for (const w of MEAL_WINDOWS) {
    if (hour >= w.startHour && hour < w.endHour) return w.type;
  }
  return null;
}

/** Returns the next upcoming MealWindow from the current hour */
function getNextMealWindow(hour: number): MealWindow | null {
  return MEAL_WINDOWS.find((w) => w.startHour > hour) ?? null;
}

export default function TodaysMealsWidget({
  weekPlan,
  onScrollToDay,
  onAddRecipe,
  onGenerateMeal,
}: TodaysMealsWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recipeSelectorMealType, setRecipeSelectorMealType] = useState<MealType | null>(null);
  const [collisionState, setCollisionState] = useState<{
    isOpen: boolean;
    sourceSlotId: string | null;
    sourceRecipeName: string;
    targetDay: DayOfWeek;
    targetMealType: MealType;
  }>({
    isOpen: false,
    sourceSlotId: null,
    sourceRecipeName: "",
    targetDay: 0 as DayOfWeek,
    targetMealType: "breakfast",
  });
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);

  const {
    moveMeal,
    removeMealFromSlot,
    generateMealsForDay,
    currentMenu: contextMenu,
  } = useMenuPlanner();
  const { addToQueue } = useRecipeQueue();
  const { currentUser } = useUser();
  const { toast, showInfo, showError, showSuccess } = useToast();

  // Prefer the freshest menu from context if the prop is stale
  const liveMenu = contextMenu ?? weekPlan;

  const now = new Date();
  const todayDow = now.getDay() as DayOfWeek;
  const currentHour = now.getHours();
  const currentMealType = getCurrentMealWindow(currentHour);
  const nextMeal = !currentMealType ? getNextMealWindow(currentHour) : null;

  const planetaryRuler = PLANETARY_DAY_RULERS[todayDow];

  // Get the planetary snapshot for today's meals (for RecipeSelector filters)
  const todayMealSlots = useMemo(() => {
    if (!weekPlan) return [];
    return weekPlan.meals.filter((m) => m.dayOfWeek === todayDow);
  }, [weekPlan, todayDow]);

  // Today's assigned meals
  const todaysMeals = useMemo(() => {
    if (!weekPlan) return {} as Record<MealType, string | null>;
    const result: Record<MealType, string | null> = {
      breakfast: null,
      lunch: null,
      snack: null,
      dinner: null,
    };
    weekPlan.meals
      .filter((m) => m.dayOfWeek === todayDow)
      .forEach((m) => {
        if (m.recipe) {
          result[m.mealType] = m.recipe.name ?? null;
        }
      });
    return result;
  }, [weekPlan, todayDow]);

  const plannedCount = Object.values(todaysMeals).filter(Boolean).length;

  const dayLabel = getDayName(todayDow);
  const dateLabel = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const planetEmoji: Record<string, string> = {
    Sun: "☀️",
    Moon: "🌙",
    Mars: "🔴",
    Mercury: "🝉",
    Jupiter: "♃",
    Venus: "💜",
    Saturn: "♄",
  };

  // Handle clicking a meal row to open recipe selector
  const handleMealClick = (mealType: MealType) => {
    if (todaysMeals[mealType]) {
      // Already has a recipe - scroll to day on calendar for editing
      if (onScrollToDay) onScrollToDay(todayDow);
    } else {
      // No recipe - open recipe selector
      setRecipeSelectorMealType(mealType);
    }
  };

  // Handle recipe selection from the modal
  const handleRecipeSelect = (recipe: Recipe) => {
    if (recipeSelectorMealType && onAddRecipe) {
      onAddRecipe(todayDow, recipeSelectorMealType, recipe as MonicaOptimizedRecipe);
    }
    setRecipeSelectorMealType(null);
  };

  // Get planetary snapshot for the current meal type's selector
  const currentSlotSnapshot = useMemo(() => {
    if (!recipeSelectorMealType) return undefined;
    const slot = todayMealSlots.find((s) => s.mealType === recipeSelectorMealType);
    return slot?.planetarySnapshot;
  }, [recipeSelectorMealType, todayMealSlots]);

  // ── Generate Next Meal logic ───────────────────────────────────────────────

  /** Compute the chronologically-next target slot for the prominent CTA. */
  const nextMealTarget = useMemo(() => {
    if (!liveMenu) return null;
    const { mealType, isTomorrow } = getChronologicalNextMeal(now);
    const dayOfWeek = (isTomorrow ? (todayDow + 1) % 7 : todayDow) as DayOfWeek;
    const slot = liveMenu.meals.find(
      (m) => m.dayOfWeek === dayOfWeek && m.mealType === mealType,
    );
    return { dayOfWeek, mealType, isTomorrow, slot };
    // `now` is intentionally captured per render so the CTA reflects current time
  }, [liveMenu, todayDow, now]);

  /** Are all 28 weekly slots filled? Disables the CTA when true. */
  const isWeekFullyPlanned = useMemo(() => {
    if (!liveMenu) return false;
    return liveMenu.meals.every((m) => m.recipe);
  }, [liveMenu]);

  /** Run generation for the target slot, then notify the user. */
  const runGenerationFor = async (
    dayOfWeek: DayOfWeek,
    mealType: MealType,
  ): Promise<void> => {
    await generateMealsForDay(dayOfWeek, {
      mealTypes: [mealType],
      useCurrentPlanetary: true,
      usePersonalization: !!currentUser?.natalChart,
    });
    // Detect whether the slot was actually filled — generator silently
    // returns 0 results when filters are too tight.
    const refreshed = contextMenu?.meals.find(
      (m) => m.dayOfWeek === dayOfWeek && m.mealType === mealType,
    );
    if (refreshed?.recipe) {
      showSuccess(`Generated ${mealType} for ${getDayName(dayOfWeek)}`);
    } else {
      showInfo(
        `No matching ${mealType} found — try relaxing dietary filters or preferences.`,
      );
    }
  };

  const handleGenerateNext = async () => {
    if (!nextMealTarget || !liveMenu || isGeneratingNext) return;
    const { dayOfWeek, mealType, slot } = nextMealTarget;

    if (slot?.recipe) {
      // Collision — defer to user choice via modal
      setCollisionState({
        isOpen: true,
        sourceSlotId: slot.id,
        sourceRecipeName: slot.recipe.name ?? "Existing recipe",
        targetDay: dayOfWeek,
        targetMealType: mealType,
      });
      return;
    }

    setIsGeneratingNext(true);
    try {
      await runGenerationFor(dayOfWeek, mealType);
    } catch (err) {
      console.error("Generate Next Meal failed:", err);
      showError("Couldn't generate the next meal. Please try again.");
    } finally {
      setIsGeneratingNext(false);
    }
  };

  /** Push existing recipe into next empty slot, then generate replacement. */
  const handleCollisionPush = async () => {
    if (!liveMenu || !collisionState.sourceSlotId) return;
    const { sourceSlotId, targetDay, targetMealType } = collisionState;

    // Find the meal-window index of the target so we walk forward only
    const targetMealIdx = MEAL_WINDOWS.findIndex(
      (w) => w.type === targetMealType,
    );
    const startMealIdx = targetMealIdx >= 0 ? targetMealIdx + 1 : 0;
    const startDay =
      startMealIdx >= MEAL_WINDOWS.length
        ? (((targetDay + 1) % 7) as DayOfWeek)
        : targetDay;
    const wrappedStartIdx =
      startMealIdx >= MEAL_WINDOWS.length ? 0 : startMealIdx;

    const destSlotId = findNextEmptySlotId(liveMenu, startDay, wrappedStartIdx);
    if (!destSlotId) {
      showError("No empty slot available to push the existing recipe into.");
      setCollisionState((s) => ({ ...s, isOpen: false }));
      return;
    }

    setCollisionState((s) => ({ ...s, isOpen: false }));
    setIsGeneratingNext(true);
    try {
      await moveMeal(sourceSlotId, destSlotId);
      await runGenerationFor(targetDay, targetMealType);
    } catch (err) {
      console.error("Push existing recipe failed:", err);
      showError("Couldn't move the existing recipe.");
    } finally {
      setIsGeneratingNext(false);
    }
  };

  /** Stash existing recipe into Recipe Queue, then generate replacement. */
  const handleCollisionQueue = async () => {
    if (!liveMenu || !collisionState.sourceSlotId) return;
    const { sourceSlotId, targetDay, targetMealType } = collisionState;
    const sourceSlot = liveMenu.meals.find((m) => m.id === sourceSlotId);
    if (!sourceSlot?.recipe) {
      setCollisionState((s) => ({ ...s, isOpen: false }));
      return;
    }

    setCollisionState((s) => ({ ...s, isOpen: false }));
    setIsGeneratingNext(true);
    try {
      addToQueue(sourceSlot.recipe as unknown as Recipe, {
        suggestedMealTypes: [targetMealType],
        suggestedDays: [targetDay],
      });
      await removeMealFromSlot(sourceSlotId);
      await runGenerationFor(targetDay, targetMealType);
      showSuccess(
        `"${sourceSlot.recipe.name}" saved to Recipe Queue.`,
      );
    } catch (err) {
      console.error("Queue existing recipe failed:", err);
      showError("Couldn't move the existing recipe to the queue.");
    } finally {
      setIsGeneratingNext(false);
    }
  };

  /** Build the CTA label dynamically based on chronology + occupancy. */
  const ctaLabel = useMemo(() => {
    if (isWeekFullyPlanned) return "All 28 meals planned 🎉";
    if (!nextMealTarget) return "✨ Generate Next Meal";
    const { mealType, isTomorrow, slot } = nextMealTarget;
    const mealLabel =
      MEAL_WINDOWS.find((w) => w.type === mealType)?.label ?? mealType;
    if (slot?.recipe) {
      return `✨ Replace ${isTomorrow ? "Tomorrow's " : ""}${mealLabel}`;
    }
    if (isTomorrow) {
      return `✨ Generate Tomorrow's ${mealLabel}`;
    }
    if (currentMealType === mealType) {
      return `✨ Generate Now: ${mealLabel}`;
    }
    return `✨ Generate Next: ${mealLabel}`;
  }, [nextMealTarget, currentMealType, isWeekFullyPlanned]);

  return (
    <>
      <div
        className="relative rounded-2xl shadow-md border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 transition-all duration-300"
        role="region"
        aria-label="Today's Meals"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                Today&apos;s Meals
              </span>
              <span className="text-sm font-bold text-gray-800 leading-tight">
                {dayLabel}, {dateLabel}
              </span>
            </div>
            {/* Planetary ruler badge */}
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
              {planetEmoji[planetaryRuler] ?? "⭐"} {planetaryRuler} Day
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress pill */}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                plannedCount === 4
                  ? "bg-green-100 text-green-700"
                  : plannedCount >= 2
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {plannedCount}/4 planned
            </span>
            <span className="text-gray-400 text-xs">
              {isCollapsed ? "▼" : "▲"}
            </span>
          </div>
        </div>

        {/* Meal rows */}
        {!isCollapsed && (
          <div className="px-4 pb-4 space-y-2">
            {/* Prominent Generate Next Meal CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleGenerateNext();
              }}
              disabled={isWeekFullyPlanned || isGeneratingNext || !liveMenu}
              className={`
                w-full mb-3 px-4 py-3 rounded-xl font-bold text-white shadow-md transition-all
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400
                ${
                  isWeekFullyPlanned
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 cursor-default"
                    : isGeneratingNext
                      ? "bg-gradient-to-r from-indigo-400 to-purple-400 cursor-wait"
                      : currentUser?.natalChart
                        ? "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.99]"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-[0.99]"
                }
              `}
              aria-label={ctaLabel}
              title={
                currentUser?.natalChart
                  ? "Personalized to your natal chart, planetary alignment, and preferences"
                  : "Uses current planetary alignment and your preferences"
              }
            >
              <div className="flex items-center justify-center gap-2">
                {isGeneratingNext && (
                  <span
                    className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden
                  />
                )}
                <span className="text-sm sm:text-base">
                  {isGeneratingNext ? "Generating…" : ctaLabel}
                </span>
              </div>
              {!isWeekFullyPlanned && !isGeneratingNext && nextMealTarget && (
                <p className="text-[10px] font-medium text-white/80 mt-1">
                  {currentUser?.natalChart
                    ? "Personalized · planetary-aligned · honors preferences"
                    : "Planetary-aligned · honors preferences"}
                </p>
              )}
            </button>

            {MEAL_WINDOWS.map((meal) => {
              const isActive = currentMealType === meal.type;
              const isNext = !currentMealType && nextMeal?.type === meal.type;
              const isPast =
                !isActive && meal.endHour <= currentHour && currentHour < 22;
              const recipeName = todaysMeals[meal.type];
              const isEmpty = !recipeName;

              return (
                <div
                  key={meal.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMealClick(meal.type);
                  }}
                  className={`
                    flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? `${meal.activeBg} ${meal.activeBorder} border-2 shadow-sm`
                        : isNext
                          ? "bg-gray-50 border-dashed border-gray-300 border"
                          : isPast
                            ? "bg-gray-50 border-gray-100 border opacity-60"
                            : "bg-white border-gray-100 border"
                    }
                    ${isEmpty ? "hover:border-indigo-300 hover:shadow-sm" : "hover:shadow-sm"}
                  `}
                >
                  {/* Icon + label */}
                  <div className="flex items-center gap-2 w-24 flex-shrink-0">
                    <span
                      className={`text-lg ${isActive ? "" : "opacity-70"}`}
                      aria-hidden
                    >
                      {meal.icon}
                    </span>
                    <div>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isActive ? meal.activeColor : "text-gray-700"
                        }`}
                      >
                        {meal.label}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-none">
                        {meal.timeRange}
                      </p>
                    </div>
                  </div>

                  {/* Recipe name or CTA */}
                  <div className="flex-1 min-w-0">
                    {recipeName ? (
                      <p
                        className={`text-xs font-semibold truncate ${
                          isActive ? meal.activeColor : "text-gray-600"
                        }`}
                        title={recipeName}
                      >
                        {recipeName}
                      </p>
                    ) : (
                      <span
                        className={`text-xs font-medium transition-colors ${
                          isActive
                            ? `${meal.activeColor} underline underline-offset-2`
                            : "text-gray-400 hover:text-indigo-500"
                        }`}
                      >
                        {isActive ? "Plan now →" : "Not planned"}
                      </span>
                    )}
                  </div>

                  {/* Action buttons for empty slots */}
                  {isEmpty && onGenerateMeal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateMeal(todayDow, meal.type);
                      }}
                      className="flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                      title={`Auto-generate ${meal.label}`}
                    >
                      ✨ Generate
                    </button>
                  )}

                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {isActive && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-current text-[10px] font-bold animate-pulse">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${meal.activeBorder.replace("border-", "bg-")}`}
                        />
                        <span className={meal.activeColor}>Now</span>
                      </span>
                    )}
                    {isNext && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">
                        Up next
                      </span>
                    )}
                    {recipeName && !isActive && !isNext && (
                      <span className="text-green-500 text-sm">✓</span>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* Recipe Selector Modal - opens when clicking an empty meal slot */}
      <RecipeSelector
        isOpen={!!recipeSelectorMealType}
        onClose={() => setRecipeSelectorMealType(null)}
        onSelectRecipe={handleRecipeSelect}
        filters={{
          mealType: recipeSelectorMealType || undefined,
          dayOfWeek: todayDow,
          planetarySnapshot: currentSlotSnapshot,
        }}
      />

      {/* Collision modal — shown when the chronological target is already planned */}
      <RecipeCollisionModal
        isOpen={collisionState.isOpen}
        onClose={() => setCollisionState((s) => ({ ...s, isOpen: false }))}
        onPush={handleCollisionPush}
        onQueue={handleCollisionQueue}
        existingRecipeName={collisionState.sourceRecipeName}
        targetMealName={
          MEAL_WINDOWS.find((w) => w.type === collisionState.targetMealType)
            ?.label ?? collisionState.targetMealType
        }
      />

      {toast}
    </>
  );
}
