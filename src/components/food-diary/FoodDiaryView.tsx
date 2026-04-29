"use client";

/**
 * FoodDiaryView Component
 * Main view component for displaying food diary entries with daily/weekly views
 * Enhanced with Alchemical Dark Theme and new tracking fields
 */

import React, { useState } from "react";
import type {
  FoodDiaryEntry,
  DailyFoodDiarySummary,
  FoodRating as FoodRatingType,
  MoodTag,
} from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";
import { NutritionRing } from "../nutrition";
import FoodRating, { StarDisplay } from "./FoodRating";

interface FoodDiaryViewProps {
  entries: FoodDiaryEntry[];
  dailySummary: DailyFoodDiarySummary | null;
  selectedDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onGoToToday: () => void;
  onSetDate: (date: Date) => void;
  onRateEntry: (
    entryId: string,
    rating: FoodRatingType,
    moodTags?: MoodTag[],
  ) => Promise<boolean>;
  onDeleteEntry: (entryId: string) => Promise<boolean>;
  onToggleFavorite: (entryId: string) => Promise<boolean>;
  isLoading?: boolean;
}

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const MEAL_TYPE_LABELS: Record<
  MealType,
  { label: string; icon: string; color: string }
> = {
  breakfast: { label: "Dawn Ritual", icon: "🌅", color: "text-amber-400" },
  lunch: { label: "Solar Zenith", icon: "☀️", color: "text-orange-400" },
  dinner: { label: "Lunar Feast", icon: "🌙", color: "text-indigo-400" },
  snack: { label: "Minor Infusions", icon: "✨", color: "text-emerald-400" },
};

export default function FoodDiaryView({
  entries,
  dailySummary,
  selectedDate,
  onPreviousDay,
  onNextDay,
  onGoToToday,
  onSetDate,
  onRateEntry,
  onDeleteEntry,
  onToggleFavorite,
  isLoading = false,
}: FoodDiaryViewProps) {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "meals">("meals");

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date();

  // Group entries by meal type
  const entriesByMeal = MEAL_TYPE_ORDER.reduce(
    (acc, mealType) => {
      acc[mealType] = entries
        .filter((e) => e.mealType === mealType)
        .sort((a, b) => a.time.localeCompare(b.time));
      return acc;
    },
    {} as Record<MealType, FoodDiaryEntry[]>,
  );

  return (
    <div className="bg-[#0a0a14]/60 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
      {/* Header with Date Navigation */}
      <div className="px-6 py-5 border-b border-white/5 bg-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onPreviousDay}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 active:scale-95"
              aria-label="Previous day"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "date";
                input.value = selectedDate.toISOString().split("T")[0];
                input.onchange = () => onSetDate(new Date(input.value));
                input.click();
              }}
              className="text-center group"
            >
              <div className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </button>

            <button
              onClick={onNextDay}
              disabled={isFuture}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 active:scale-95 disabled:opacity-20"
              aria-label="Next day"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!isToday && (
              <button
                onClick={onGoToToday}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-xl transition-all border border-amber-400/20"
              >
                Return to Now
              </button>
            )}

            <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
              <button
                onClick={() => setViewMode("meals")}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  viewMode === "meals" ? "bg-amber-500 text-black shadow-lg" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Meals
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  viewMode === "timeline" ? "bg-amber-500 text-black shadow-lg" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      {dailySummary && (
        <div className="px-6 py-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "CALORIES", key: "calories", color: "#f59e0b", goal: dailySummary.nutritionGoals?.calories },
              { label: "PROTEIN", key: "protein", color: "#ef4444", goal: dailySummary.nutritionGoals?.protein },
              { label: "CARBS", key: "carbs", color: "#3b82f6", goal: dailySummary.nutritionGoals?.carbs },
              { label: "FAT", key: "fat", color: "#8b5cf6", goal: dailySummary.nutritionGoals?.fat },
            ].map((stat) => (
              <div key={stat.key} className="flex flex-col items-center">
                <NutritionRing
                  percentage={
                    stat.goal
                      ? ((dailySummary.totalNutrition?.[stat.key as keyof typeof dailySummary.totalNutrition] as number || 0) / stat.goal) * 100
                      : 0
                  }
                  label=""
                  size={60}
                  strokeWidth={5}
                  color={stat.color}
                />
                <span className="text-[10px] font-black text-gray-500 mt-2 tracking-tighter uppercase">{stat.label}</span>
                <span className="text-sm font-bold text-white">
                  {Math.round(dailySummary.totalNutrition?.[stat.key as keyof typeof dailySummary.totalNutrition] as number || 0)}
                  <span className="text-[10px] text-gray-500 ml-0.5">{stat.key === "calories" ? "" : "g"}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-6 py-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Scrying the scrolls...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Void Detected</h3>
            <p className="text-sm text-gray-500 max-w-xs">The alchemical journal remains empty for this solar period.</p>
          </div>
        ) : viewMode === "meals" ? (
          <div className="space-y-8">
            {MEAL_TYPE_ORDER.map((mealType) => {
              const mealEntries = entriesByMeal[mealType];
              const mealInfo = MEAL_TYPE_LABELS[mealType];
              const mealCalories = mealEntries.reduce(
                (sum, e) => sum + (e.nutrition.calories || 0),
                0,
              );

              if (mealEntries.length === 0) return null;

              return (
                <div key={mealType}>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mealInfo.icon}</span>
                      <span className={`font-black uppercase tracking-wider text-xs ${mealInfo.color}`}>
                        {mealInfo.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {Math.round(mealCalories)} CAL
                    </span>
                  </div>

                  <div className="space-y-3">
                    {mealEntries.map((entry) => (
                      <FoodEntryCard
                        key={entry.id}
                        entry={entry}
                        isExpanded={expandedEntry === entry.id}
                        onToggleExpand={() =>
                          setExpandedEntry(
                            expandedEntry === entry.id ? null : entry.id,
                          )
                        }
                        onRate={(rating, moods) =>
                          onRateEntry(entry.id, rating, moods)
                        }
                        onDelete={() => onDeleteEntry(entry.id)}
                        onToggleFavorite={() => onToggleFavorite(entry.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-indigo-500/50 to-transparent" />
            <div className="space-y-6">
              {entries
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[27px] top-4 w-3 h-3 bg-[#08080e] border-2 border-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <div className="text-[10px] font-black text-amber-500/60 mb-1 uppercase tracking-widest">
                      {entry.time} • {entry.mealType}
                    </div>
                    <FoodEntryCard
                      entry={entry}
                      isExpanded={expandedEntry === entry.id}
                      onToggleExpand={() =>
                        setExpandedEntry(
                          expandedEntry === entry.id ? null : entry.id,
                        )
                      }
                      onRate={(rating, moods) =>
                        onRateEntry(entry.id, rating, moods)
                      }
                      onDelete={() => onDeleteEntry(entry.id)}
                      onToggleFavorite={() => onToggleFavorite(entry.id)}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual food entry card component
 */
interface FoodEntryCardProps {
  entry: FoodDiaryEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRate: (rating: FoodRatingType, moodTags?: MoodTag[]) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onToggleFavorite: () => Promise<boolean>;
}

function FoodEntryCard({
  entry,
  isExpanded,
  onToggleExpand,
  onRate,
  onDelete,
  onToggleFavorite,
}: FoodEntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if (window.confirm("Banish this entry from the scrying mirror?")) {
      setIsDeleting(true);
      await onDelete();
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 ${
        isExpanded ? "ring-2 ring-amber-500/30 bg-white/10 shadow-2xl" : ""
      }`}
    >
      {/* Main row */}
      <button
        onClick={onToggleExpand}
        className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-lg shadow-inner">
             {entry.foodSource === "recipe" ? "📜" : "🌿"}
          </div>
          <div>
            <div className="font-bold text-white group-hover:text-amber-200 transition-colors">
              {entry.foodName}
            </div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
              {entry.quantity} x {entry.serving.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {entry.rating && (
            <div className="hidden sm:block">
              <StarDisplay rating={entry.rating} size="sm" />
            </div>
          )}
          <div className="text-right">
            <div className="text-lg font-black text-white leading-none">
              {Math.round(entry.nutrition.calories || 0)}
            </div>
            <div className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">KCAL</div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
          
          {/* New Tracking Fields Display */}
          {(entry.price || entry.store || entry.quality) && (
            <div className="flex flex-wrap gap-4 py-4 border-b border-white/5 mb-4">
              {entry.price !== undefined && (
                <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Cost</div>
                  <div className="text-sm font-bold text-emerald-400">${Number(entry.price).toFixed(2)}</div>
                </div>
              )}
              {entry.store && (
                <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Source</div>
                  <div className="text-sm font-bold text-blue-400">{entry.store}</div>
                </div>
              )}
              {entry.quality && (
                <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Grade</div>
                  <div className="text-sm font-bold text-amber-400">{entry.quality}</div>
                </div>
              )}
            </div>
          )}

          {/* Nutrition Details Grid */}
          <div className="grid grid-cols-4 gap-3 py-4 mb-4 bg-white/5 rounded-2xl border border-white/5">
            {[
              { label: "PROTEIN", val: entry.nutrition.protein, color: "text-red-400" },
              { label: "CARBS", val: entry.nutrition.carbs, color: "text-blue-400" },
              { label: "FAT", val: entry.nutrition.fat, color: "text-purple-400" },
              { label: "FIBER", val: entry.nutrition.fiber, color: "text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-tighter mb-1">{stat.label}</div>
                <div className={`text-md font-black ${stat.color}`}>
                  {Math.round(stat.val || 0)}<span className="text-[10px] ml-0.5 opacity-60">g</span>
                </div>
              </div>
            ))}
          </div>

          {/* Elemental Signature */}
          {entry.elementalProperties && (
            <div className="py-4 border-t border-white/5">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Elemental Yield</div>
              <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden bg-black/40">
                <div className="bg-orange-500" style={{ width: `${(entry.elementalProperties.Fire || 0) * 100}%` }} />
                <div className="bg-blue-500" style={{ width: `${(entry.elementalProperties.Water || 0) * 100}%` }} />
                <div className="bg-emerald-600" style={{ width: `${(entry.elementalProperties.Earth || 0) * 100}%` }} />
                <div className="bg-slate-300" style={{ width: `${(entry.elementalProperties.Air || 0) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Rating Section */}
          <div className="py-4 border-t border-white/5">
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Self-Observation</div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <FoodRating
                rating={entry.rating}
                moodTags={entry.moodTags}
                onRate={onRate}
                compact={false}
              />
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="py-4 border-t border-white/5">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Observations</div>
              <div className="text-sm text-gray-400 italic bg-white/5 p-4 rounded-xl border border-white/5 border-l-amber-500/50 border-l-4">
                &quot;{entry.notes}&quot;
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-2">
            <button
              onClick={() => { void onToggleFavorite(); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                entry.isFavorite
                  ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
              }`}
            >
              <svg className="w-4 h-4" fill={entry.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{entry.isFavorite ? "PRESERVED" : "PRESERVE"}</span>
            </button>

            <button
              onClick={() => { void handleDelete(); }}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold text-xs border border-red-500/20 transition-all active:scale-95 disabled:opacity-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{isDeleting ? "BANISHING..." : "BANISH"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
