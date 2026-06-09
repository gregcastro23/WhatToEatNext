"use client";

/**
 * Weekly Calendar Component
 * 7-day calendar grid displaying meal slots for each day
 *
 * @file src/components/menu-planner/WeeklyCalendar.tsx
 * @created 2026-01-10
 * @updated 2026-01-10 (Phase 2 - Drag-and-drop and Copy/Move)
 */

import React, { useMemo, useState } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
import type {
  DayOfWeek,
  MealType,
  MealSlot as MealSlotType,
} from "@/types/menuPlanner";
import {
  getDayName,
  getShortDayName as _getShortDayName,
  getPlanetaryDayCharacteristics,
  PLANETARY_DAY_RULERS as _PLANETARY_DAY_RULERS,
  formatDateForDisplay,
} from "@/types/menuPlanner";
import type { DailyNutritionResult } from "@/types/nutrition";
import CopyMealModal from "./CopyMealModal";
import FocusedDayView from "./FocusedDayView";
import MealSlot from "./MealSlot";
import StitchTransitRibbon, { PLANET_GLYPHS } from "./StitchTransitRibbon";

/**
 * Per-day nutrition mini-bar
 * Compact calorie/macro summary for each day card
 */
function DayNutritionStrip({
  daily,
}: {
  daily: DailyNutritionResult | undefined;
}) {
  if (!daily || daily.meals.length === 0) {
    return (
      <div className="px-3 py-2 border-t border-muted text-[10px] text-on-surface-variant/50 italic font-mono">
        No meals — unlogged
      </div>
    );
  }

  const { totals, goals, compliance } = daily;
  const calPct = goals.calories > 0
    ? Math.min(150, Math.round(((totals.calories ?? 0) / goals.calories) * 100))
    : 0;
  const barColor =
    calPct < 60
      ? "bg-earth-matter"
      : calPct > 120
        ? "bg-fire-spirit"
        : "bg-active-violet";

  return (
    <div className="px-3 py-2 border-t border-muted bg-surface-container-lowest/80 text-[11px] font-mono">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-primary">
          {Math.round(totals.calories ?? 0)}/{Math.round(goals.calories)} kcal
        </span>
        <span
          className={`font-medium ${
            compliance.overall >= 0.75
              ? "text-active-violet"
              : compliance.overall >= 0.5
                ? "text-gold-accent"
                : "text-error"
          }`}
        >
          {Math.round(compliance.overall * 100)}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${Math.min(100, calPct)}%` }}
        />
      </div>
      <div className="flex gap-2 mt-1 text-on-surface-variant">
        <span>P {Math.round(totals.protein ?? 0)}g</span>
        <span>C {Math.round(totals.carbs ?? 0)}g</span>
        <span>F {Math.round(totals.fat ?? 0)}g</span>
      </div>
    </div>
  );
}

interface WeeklyCalendarProps {
  onMealClick?: (mealSlot: MealSlotType) => void;
}

/**
 * Day Column Component
 */
function DayColumn({
  dayOfWeek,
  date,
  meals,
  onMealClick: _onMealClick,
  onCopyMealClick,
  onFocusDay,
  onToggleExpand,
  isExpanded,
  currentPlanetaryHour,
  dailyNutrition,
  isSelectedForHero = false,
}: {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  onMealClick?: (mealSlot: MealSlotType) => void;
  onCopyMealClick?: (mealSlot: MealSlotType) => void;
  onFocusDay?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  currentPlanetaryHour?: string | null;
  dailyNutrition?: DailyNutritionResult;
  isSelectedForHero?: boolean;
}) {
  const {
    addMealToSlot,
    removeMealFromSlot,
    updateMealServings,
    addSauceToMeal,
    removeSauceFromMeal,
    updateSauceServings,
    clearDay,
    moveMeal,
    swapMeals,
    generateMealsForDay,
  } = useMenuPlanner();

  const characteristics = getPlanetaryDayCharacteristics(dayOfWeek);
  const isToday = new Date().toDateString() === new Date(date).toDateString();

  // Get meals sorted by type
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const sortedMeals = mealTypes.map(
    (type) => meals.find((m) => m.mealType === type)!,
  );

  const highlight = isToday || isSelectedForHero;

  return (
    <div
      className={`
        flex flex-col rounded-xl overflow-hidden transition-all duration-300
        ${highlight 
          ? "border-2 border-active-violet bg-surface-container-high/90 shadow-[0_0_15px_rgba(184,90,240,0.15)]" 
          : "border border-muted bg-surface/40 hover:bg-surface/60"}
        ${isExpanded ? "ring-1 ring-active-violet" : ""}
      `}
    >
      {/* Day Header - clickable to expand */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={`
          text-left p-3 border-b border-muted w-full transition-all duration-200
          ${highlight ? "bg-active-violet/10 hover:bg-active-violet/15" : "bg-surface-container-low/30 hover:bg-surface-container-low/50"}
        `}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${getDayName(dayOfWeek)}`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-2xl ${highlight ? "text-gold-accent" : "text-active-violet/70"}`}>
              {PLANET_GLYPHS[characteristics.planet]}
            </span>
            <div className="min-w-0">
              <h3 className="font-headline-md text-headline-md font-bold text-primary truncate">
                {getDayName(dayOfWeek)}
              </h3>
              <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider truncate">
                {formatDateForDisplay(date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isToday && (
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono bg-active-violet text-background rounded uppercase">
                Today
              </span>
            )}
            <span className="text-on-surface-variant text-xs select-none" aria-hidden>
              {isExpanded ? "▼" : "▶"}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-on-surface-variant font-body-sm italic line-clamp-2 mt-1">
          {characteristics.mealGuidance}
        </p>

        {/* Planetary Hour Indicator (only for today) */}
        {isToday && currentPlanetaryHour && (
          <div className="mt-2 flex items-center gap-2 bg-active-violet/10 border border-active-violet/20 rounded-lg px-2 py-1">
            <span className="text-active-violet font-semibold text-[10px] font-mono uppercase">
              Hour:
            </span>
            <span className="text-primary font-bold text-xs truncate font-mono">
              {currentPlanetaryHour}
            </span>
          </div>
        )}
      </button>

      {/* Quick Actions - separate row, non-clickable header area */}
      <div className="flex gap-1 px-2 py-1.5 bg-surface-container-lowest/50 border-b border-muted">
        <button
          onClick={(e) => { e.stopPropagation(); onFocusDay?.(); }}
          className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-water-essence/10 text-water-essence hover:bg-water-essence/20 border border-water-essence/20 transition-all flex-1"
          title={`Focus on ${getDayName(dayOfWeek)} with suggestions`}
        >
          Focus
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void generateMealsForDay(dayOfWeek);
          }}
          className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-gold-accent/10 text-gold-accent hover:bg-gold-accent/20 border border-gold-accent/20 transition-all flex-1"
          title={`Recommend meals for ${getDayName(dayOfWeek)} using ${characteristics.planet} energy`}
        >
          Rec
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void clearDay(dayOfWeek);
          }}
          className="text-[10px] px-2 py-1 rounded bg-error/10 text-error hover:bg-error/20 border border-error/20 transition-colors"
          title="Clear all meals for this day"
        >
          Clear
        </button>
      </div>

      {/* Meal Slots — stitched together by a dashed gold connector */}
      <div className="flex-1 p-2 overflow-y-auto bg-surface-container-lowest/20">
        {sortedMeals.map((mealSlot, slotIdx) => (
          <React.Fragment key={mealSlot.id}>
            {slotIdx > 0 && (
              <div
                aria-hidden
                className="mx-auto h-3 w-0 border-l-2 border-dashed border-gold-accent/30"
              />
            )}
            <MealSlot
              mealSlot={mealSlot}
              onAddRecipe={(recipe: MonicaOptimizedRecipe) => {
                void addMealToSlot(dayOfWeek, mealSlot.mealType, recipe);
              }}
              onRemoveRecipe={() => {
                void removeMealFromSlot(mealSlot.id);
              }}
              onUpdateServings={(servings: number) => {
                void updateMealServings(mealSlot.id, servings);
              }}
              onMoveMeal={(sourceSlotId: string) => {
                void moveMeal(sourceSlotId, mealSlot.id);
              }}
              onSwapMeals={(sourceSlotId: string) => {
                void swapMeals(sourceSlotId, mealSlot.id);
              }}
              onCopyMeal={() => onCopyMealClick?.(mealSlot)}
              onGenerateMeal={() => {
                void generateMealsForDay(dayOfWeek, { mealTypes: [mealSlot.mealType] });
              }}
              onAddSauce={(sauceId: string, servings?: number) => {
                void addSauceToMeal(mealSlot.id, sauceId, servings);
              }}
              onRemoveSauce={() => {
                void removeSauceFromMeal(mealSlot.id);
              }}
              onUpdateSauceServings={(servings: number) => {
                void updateSauceServings(mealSlot.id, servings);
              }}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Per-day nutrition summary */}
      <DayNutritionStrip daily={dailyNutrition} />
    </div>
  );
}

/**
 * Today Hero Card
 * Prominent card highlighting today's meals — always visible at top of calendar.
 */
function TodayHeroCard({
  dayOfWeek,
  date,
  meals,
  onCopyMealClick,
  onFocusDay,
  currentPlanetaryHour,
  dailyNutrition,
}: {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  onCopyMealClick?: (mealSlot: MealSlotType) => void;
  onFocusDay?: () => void;
  currentPlanetaryHour?: string | null;
  dailyNutrition?: DailyNutritionResult;
}) {
  const {
    addMealToSlot,
    removeMealFromSlot,
    updateMealServings,
    addSauceToMeal,
    removeSauceFromMeal,
    updateSauceServings,
    clearDay,
    moveMeal,
    swapMeals,
    generateMealsForDay,
  } = useMenuPlanner();

  const characteristics = getPlanetaryDayCharacteristics(dayOfWeek);
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const sortedMeals = mealTypes.map(
    (type) => meals.find((m) => m.mealType === type)!,
  );
  const plannedCount = meals.filter((m) => m.recipe).length;

  return (
    <div className="alchm-panel alchm-panel-glow regmarks rounded-2xl overflow-hidden mb-6">
      {/* Hero Header */}
      <div className="p-5 bg-gradient-to-r from-active-violet/20 via-surface-container-high/40 to-gold-accent/10 border-b border-muted">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl text-gold-accent">{PLANET_GLYPHS[characteristics.planet]}</span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-active-violet">
                Today · {characteristics.planet} day
              </div>
              <h2 className="text-2xl font-headline-lg font-bold text-primary">{getDayName(dayOfWeek)}</h2>
              <p className="text-sm font-mono text-on-surface-variant">{formatDateForDisplay(date)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            {currentPlanetaryHour && (
              <div className="text-xs bg-active-violet/20 border border-active-violet/30 text-active-violet rounded-full px-3 py-1 font-mono">
                ⏰ {currentPlanetaryHour} hour
              </div>
            )}
            <div className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mt-1">
              {plannedCount}/4 planned
            </div>
          </div>
        </div>
        <p className="text-sm mt-3 italic text-on-surface font-body-md">
          {characteristics.mealGuidance}
        </p>
      </div>

      {/* Nutrition row */}
      {dailyNutrition && dailyNutrition.meals.length > 0 && (
        <div className="px-5 py-3 bg-surface-container-low/50 border-b border-muted grid grid-cols-2 md:grid-cols-5 gap-3 text-sm font-mono">
          <div>
            <div className="text-[10px] uppercase text-on-surface-variant tracking-wide">
              Calories
            </div>
            <div className="font-bold text-primary">
              {Math.round(dailyNutrition.totals.calories ?? 0)}
              <span className="text-xs font-normal text-on-surface-variant">
                {" "}/ {Math.round(dailyNutrition.goals.calories)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-on-surface-variant tracking-wide">
              Protein
            </div>
            <div className="font-bold text-fire-spirit">
              {Math.round(dailyNutrition.totals.protein ?? 0)}g
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-on-surface-variant tracking-wide">
              Carbs
            </div>
            <div className="font-bold text-air-substance">
              {Math.round(dailyNutrition.totals.carbs ?? 0)}g
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-on-surface-variant tracking-wide">
              Fat
            </div>
            <div className="font-bold text-earth-matter">
              {Math.round(dailyNutrition.totals.fat ?? 0)}g
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-on-surface-variant tracking-wide">
              Compliance
            </div>
            <div
              className={`font-bold ${
                dailyNutrition.compliance.overall >= 0.75
                  ? "text-active-violet"
                  : dailyNutrition.compliance.overall >= 0.5
                    ? "text-gold-accent"
                    : "text-error"
              }`}
            >
              {Math.round(dailyNutrition.compliance.overall * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 px-5 py-3 bg-surface-container-lowest/80 border-b border-muted flex-wrap">
        <button
          onClick={onFocusDay}
          className="text-xs px-3 py-1.5 rounded-lg bg-water-essence/10 text-water-essence hover:bg-water-essence/20 border border-water-essence/20 transition-all font-mono uppercase font-bold"
        >
          🔍 Focus mode
        </button>
        <button
          onClick={() => { void generateMealsForDay(dayOfWeek); }}
          className="text-xs px-3 py-1.5 rounded-lg bg-active-violet text-background hover:bg-white transition-all font-mono uppercase font-bold"
        >
          ✨ Auto-fill day
        </button>
        <button
          onClick={() => { void clearDay(dayOfWeek); }}
          className="text-xs px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 border border-error/20 transition-colors font-mono uppercase font-bold"
        >
          Clear
        </button>
      </div>

      {/* Meal slots — horizontal on desktop, stacked on mobile */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface-container-lowest/30">
        {sortedMeals.map((mealSlot) => (
          <MealSlot
            key={mealSlot.id}
            mealSlot={mealSlot}
            onAddRecipe={(recipe: MonicaOptimizedRecipe) => {
              void addMealToSlot(dayOfWeek, mealSlot.mealType, recipe);
            }}
            onRemoveRecipe={() => {
              void removeMealFromSlot(mealSlot.id);
            }}
            onUpdateServings={(servings: number) => {
              void updateMealServings(mealSlot.id, servings);
            }}
            onMoveMeal={(sourceSlotId: string) => {
              void moveMeal(sourceSlotId, mealSlot.id);
            }}
            onSwapMeals={(sourceSlotId: string) => {
              void swapMeals(sourceSlotId, mealSlot.id);
            }}
            onCopyMeal={() => onCopyMealClick?.(mealSlot)}
            onGenerateMeal={() => {
              void generateMealsForDay(dayOfWeek, { mealTypes: [mealSlot.mealType] });
            }}
            onAddSauce={(sauceId: string, servings?: number) => {
              void addSauceToMeal(mealSlot.id, sauceId, servings);
            }}
            onRemoveSauce={() => {
              void removeSauceFromMeal(mealSlot.id);
            }}
            onUpdateSauceServings={(servings: number) => {
              void updateSauceServings(mealSlot.id, servings);
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Main Weekly Calendar Component
 */
export default function WeeklyCalendar({ onMealClick }: WeeklyCalendarProps) {
  const {
    currentMenu,
    navigation,
    isLoading,
    copyMealToSlots,
    moveMealToSlots,
    generationPreferences,
  } = useMenuPlanner();
  const { currentPlanetaryHour } = useAstrologicalState();
  const weeklyNutrition = useNutritionTracking(
    currentMenu,
    generationPreferences?.nutritionalTargets ?? null,
  );
  const [copyMealModalState, setCopyMealModalState] = useState<{
    isOpen: boolean;
    sourceMeal: MealSlotType | null;
  }>({
    isOpen: false,
    sourceMeal: null,
  });

  // Inline expanded day (grows in place)
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  // Focused day view state (modal — kept for advanced users)
  const [focusedDayState, setFocusedDayState] = useState<{
    isOpen: boolean;
    dayOfWeek: DayOfWeek;
  }>({
    isOpen: false,
    dayOfWeek: 0 as DayOfWeek,
  });

  const toggleExpandDay = (day: DayOfWeek) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  };

  // Handle opening focused day view
  const handleOpenFocusedDay = (dayOfWeek: DayOfWeek) => {
    setFocusedDayState({
      isOpen: true,
      dayOfWeek,
    });
  };

  // Handle day change in focused view
  const handleFocusedDayChange = (direction: "prev" | "next") => {
    setFocusedDayState((prev) => ({
      ...prev,
      dayOfWeek: (direction === "prev"
        ? (prev.dayOfWeek - 1 + 7) % 7
        : (prev.dayOfWeek + 1) % 7) as DayOfWeek,
    }));
  };

  // Group meals by day
  const mealsByDay = useMemo(() => {
    if (!currentMenu) return {};

    const grouped: Record<DayOfWeek, MealSlotType[]> = {} as any;
    currentMenu.meals.forEach((meal) => {
      if (!grouped[meal.dayOfWeek]) {
        grouped[meal.dayOfWeek] = [];
      }
      grouped[meal.dayOfWeek].push(meal);
    });

    return grouped;
  }, [currentMenu]);

  // Calculate dates for each day
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(navigation.currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [navigation.currentWeekStart]);

  // Handle copy/move meal click
  const handleCopyMealClick = (mealSlot: MealSlotType) => {
    if (!mealSlot.recipe) return;
    setCopyMealModalState({
      isOpen: true,
      sourceMeal: mealSlot,
    });
  };

  // Handle copy operation
  const handleCopy = (targetSlotIds: string[], servings?: number) => {
    if (!copyMealModalState.sourceMeal) return;
    void copyMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings);
    setCopyMealModalState({ isOpen: false, sourceMeal: null });
  };

  // Handle move operation
  const handleMove = (targetSlotIds: string[], servings?: number) => {
    if (!copyMealModalState.sourceMeal) return;
    void moveMealToSlots(copyMealModalState.sourceMeal.id, targetSlotIds, servings);
    setCopyMealModalState({ isOpen: false, sourceMeal: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-on-surface-variant">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!currentMenu) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-on-surface-variant">No menu available</p>
        </div>
      </div>
    );
  }

  // Calculate total meal count for progressive messaging
  const totalMeals = currentMenu?.meals.filter((m) => m.recipe).length || 0;

  // Determine whether today falls within the currently-displayed week.
  // If yes, surface the Today hero card and highlight that column.
  const todayDateStr = new Date().toDateString();
  const todayIndex = weekDates.findIndex(
    (d) => d.toDateString() === todayDateStr,
  );
  const todayDayOfWeek: DayOfWeek | null =
    todayIndex >= 0 ? (todayIndex as DayOfWeek) : null;

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between alchm-panel rounded-xl p-4 border border-muted">
        <button
          onClick={navigation.goToPreviousWeek}
          className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface hover:text-primary transition-all border border-muted text-xs font-mono uppercase cursor-pointer"
        >
          ← Prev Week
        </button>

        <div className="text-center">
          <h2 className="text-lg font-headline-md font-bold text-primary">
            {formatDateForDisplay(weekDates[0])} - {formatDateForDisplay(weekDates[6])}
          </h2>
          <button
            onClick={navigation.goToCurrentWeek}
            className="text-xs text-active-violet hover:text-white underline mt-1 font-mono uppercase cursor-pointer"
          >
            Go to Current Week
          </button>
        </div>

        <button
          onClick={navigation.goToNextWeek}
          className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface hover:text-primary transition-all border border-muted text-xs font-mono uppercase cursor-pointer"
        >
          Next Week →
        </button>
      </div>

      {/* Stitch Transit Ribbon — the golden thread tying days, transits, and meals together */}
      <StitchTransitRibbon
        weekDates={weekDates}
        todayIndex={todayDayOfWeek}
        selectedDay={expandedDay}
        onSelectDay={toggleExpandDay}
        currentPlanetaryHour={currentPlanetaryHour}
      />

      {/* Progressive Empty State Banner */}
      {totalMeals === 0 && (
        <div className="alchm-panel alchm-panel-glow regmarks p-6 rounded-xl border border-muted bg-gradient-to-r from-active-violet/10 via-surface-container-low/20 to-gold-accent/5">
          <div className="text-center">
            <div className="text-4xl mb-3 text-gold-accent">🜔</div>
            <h3 className="text-xl font-headline-md font-bold text-primary mb-2">
              Your Weekly Menu Awaits
            </h3>
            <p className="text-on-surface-variant font-body-md text-sm mb-4">
              Plan your week with alchemical precision
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-xs text-on-surface-variant font-mono">
              <div className="flex items-center gap-2">
                <span className="text-gold-accent">☉</span>
                <span>
                  Click &quot;Generate&quot; on any day for planetary-aligned suggestions
                </span>
              </div>
              <div className="hidden sm:block text-on-surface-variant/40">•</div>
              <div className="flex items-center gap-2">
                <span className="text-active-violet">🜂</span>
                <span>Search recipes below and drag to calendar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalMeals > 0 && totalMeals < 6 && (
        <div className="alchm-panel p-4 rounded-xl border border-muted bg-surface-container-low/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl text-gold-accent">☉</div>
              <div>
                <h3 className="font-bold text-primary">
                  Great start! {totalMeals} meal{totalMeals === 1 ? "" : "s"}{" "}
                  planned
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Keep adding meals to build your ideal week
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-lg border border-muted font-mono">
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded ${
                      i < totalMeals ? "bg-active-violet shadow-[0_0_8px_rgba(184,90,240,0.6)]" : "bg-surface-container-high"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">
                {totalMeals}/6
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Today Hero Card — always on top when today is within the viewed week */}
      {todayDayOfWeek !== null && (
        <TodayHeroCard
          dayOfWeek={todayDayOfWeek}
          date={weekDates[todayDayOfWeek]}
          meals={mealsByDay[todayDayOfWeek] || []}
          onCopyMealClick={handleCopyMealClick}
          onFocusDay={() => handleOpenFocusedDay(todayDayOfWeek)}
          currentPlanetaryHour={currentPlanetaryHour}
          dailyNutrition={weeklyNutrition?.days?.[todayDayOfWeek]}
        />
      )}

      {/* Calendar Grid - Desktop (7 columns, clickable to expand) */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 gap-3">
          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              date={weekDates[day]}
              meals={mealsByDay[day] || []}
              onMealClick={onMealClick}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(day)}
              onToggleExpand={() => toggleExpandDay(day)}
              isExpanded={expandedDay === day}
              currentPlanetaryHour={currentPlanetaryHour}
              dailyNutrition={weeklyNutrition?.days?.[day]}
              isSelectedForHero={day === todayDayOfWeek}
            />
          ))}
        </div>
        {/* Inline expanded-day panel appears below the grid */}
        {expandedDay !== null && expandedDay !== todayDayOfWeek && (
          <div className="mt-4">
            <TodayHeroCard
              dayOfWeek={expandedDay}
              date={weekDates[expandedDay]}
              meals={mealsByDay[expandedDay] || []}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(expandedDay)}
              currentPlanetaryHour={null}
              dailyNutrition={weeklyNutrition?.days?.[expandedDay]}
            />
          </div>
        )}
      </div>

      {/* Calendar Grid - Tablet (4-3 split) */}
      <div className="hidden md:block lg:hidden space-y-3">
        <div className="grid grid-cols-4 gap-3">
          {([0, 1, 2, 3] as DayOfWeek[]).map((day) => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              date={weekDates[day]}
              meals={mealsByDay[day] || []}
              onMealClick={onMealClick}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(day)}
              onToggleExpand={() => toggleExpandDay(day)}
              isExpanded={expandedDay === day}
              currentPlanetaryHour={currentPlanetaryHour}
              dailyNutrition={weeklyNutrition?.days?.[day]}
              isSelectedForHero={day === todayDayOfWeek}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([4, 5, 6] as DayOfWeek[]).map((day) => (
            <DayColumn
              key={day}
              dayOfWeek={day}
              date={weekDates[day]}
              meals={mealsByDay[day] || []}
              onMealClick={onMealClick}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(day)}
              onToggleExpand={() => toggleExpandDay(day)}
              isExpanded={expandedDay === day}
              currentPlanetaryHour={currentPlanetaryHour}
              dailyNutrition={weeklyNutrition?.days?.[day]}
              isSelectedForHero={day === todayDayOfWeek}
            />
          ))}
        </div>
        {expandedDay !== null && expandedDay !== todayDayOfWeek && (
          <div className="mt-4">
            <TodayHeroCard
              dayOfWeek={expandedDay}
              date={weekDates[expandedDay]}
              meals={mealsByDay[expandedDay] || []}
              onCopyMealClick={handleCopyMealClick}
              onFocusDay={() => handleOpenFocusedDay(expandedDay)}
              currentPlanetaryHour={null}
              dailyNutrition={weeklyNutrition?.days?.[expandedDay]}
            />
          </div>
        )}
      </div>

      {/* Calendar Grid - Mobile (1 column) */}
      <div className="md:hidden space-y-3">
        {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
          <DayColumn
            key={day}
            dayOfWeek={day}
            date={weekDates[day]}
            meals={mealsByDay[day] || []}
            onMealClick={onMealClick}
            onCopyMealClick={handleCopyMealClick}
            onFocusDay={() => handleOpenFocusedDay(day)}
            onToggleExpand={() => toggleExpandDay(day)}
            isExpanded={expandedDay === day}
            currentPlanetaryHour={currentPlanetaryHour}
            dailyNutrition={weeklyNutrition?.days?.[day]}
            isSelectedForHero={day === todayDayOfWeek}
          />
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-center text-xs text-on-surface-variant font-mono uppercase tracking-wider mt-6">
        <p>
          Click a day header to expand it inline • Click &quot;+ Add Recipe&quot;
          to add meals • Click 📋 to copy/move to multiple slots.
        </p>
      </div>

      {/* Copy/Move Meal Modal */}
      {copyMealModalState.sourceMeal && (
        <CopyMealModal
          isOpen={copyMealModalState.isOpen}
          onClose={() =>
            setCopyMealModalState({ isOpen: false, sourceMeal: null })
          }
          sourceMeal={copyMealModalState.sourceMeal}
          allMeals={currentMenu?.meals || []}
          onCopy={handleCopy}
          onMove={handleMove}
        />
      )}

      {/* Focused Day View Modal */}
      {focusedDayState.isOpen && currentMenu && (
        <FocusedDayView
          dayOfWeek={focusedDayState.dayOfWeek}
          date={weekDates[focusedDayState.dayOfWeek]}
          meals={mealsByDay[focusedDayState.dayOfWeek] || []}
          onClose={() =>
            setFocusedDayState({ isOpen: false, dayOfWeek: 0 as DayOfWeek })
          }
          onDayChange={handleFocusedDayChange}
        />
      )}
    </div>
  );
}
