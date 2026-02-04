"use client";

/**
 * FoodDiaryView Component
 * Main view component for displaying food diary entries with daily/weekly views
 *
 * @file src/components/food-diary/FoodDiaryView.tsx
 * @created 2026-02-02
 */

import React, { useState } from "react";
import type {
  FoodDiaryEntry,
  DailyFoodDiarySummary,
  FoodRating as FoodRatingType,
  MoodTag,
} from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";
import FoodRating, { StarDisplay } from "./FoodRating";
import { NutritionRing } from "../nutrition";

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
  { label: string; icon: string; timeRange: string }
> = {
  breakfast: { label: "Breakfast", icon: "sunrise", timeRange: "6am - 11am" },
  lunch: { label: "Lunch", icon: "sun", timeRange: "11am - 3pm" },
  dinner: { label: "Dinner", icon: "moon", timeRange: "5pm - 9pm" },
  snack: { label: "Snacks", icon: "cookie", timeRange: "Anytime" },
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header with Date Navigation */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous day"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
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
              className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </button>

            <button
              onClick={onNextDay}
              disabled={isFuture}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Next day"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={onGoToToday}
                className="px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                Today
              </button>
            )}

            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("meals")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "meals" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                By Meal
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "timeline"
                    ? "bg-white shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {dailySummary && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-around">
            <NutritionRing
              value={dailySummary.totalNutrition.calories.toString()}
              max={dailySummary.nutritionGoals?.calories || 2000}
              label="Calories"
              size={70}
              strokeWidth={6}
            />
            <NutritionRing
              value={dailySummary.totalNutrition.protein.toString()}
              max={dailySummary.nutritionGoals?.protein || 50}
              label="Protein"
              unit="g"
              size={70}
              strokeWidth={6}
            />
            <NutritionRing
              value={dailySummary.totalNutrition.carbs.toString()}
              max={dailySummary.nutritionGoals?.carbs || 275}
              label="Carbs"
              unit="g"
              size={70}
              strokeWidth={6}
            />
            <NutritionRing
              value={dailySummary.totalNutrition.fat.toString()}
              max={dailySummary.nutritionGoals?.fat || 78}
              label="Fat"
              unit="g"
              size={70}
              strokeWidth={6}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="px-4 py-12 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading entries...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No entries yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start tracking what you eat to see your nutrition summary
          </p>
        </div>
      )}

      {/* Meal View */}
      {!isLoading && viewMode === "meals" && entries.length > 0 && (
        <div className="divide-y divide-gray-100">
          {MEAL_TYPE_ORDER.map((mealType) => {
            const mealEntries = entriesByMeal[mealType];
            const mealInfo = MEAL_TYPE_LABELS[mealType];
            const mealCalories = mealEntries.reduce(
              (sum, e) => sum + (e.nutrition.calories || 0),
              0,
            );

            return (
              <div key={mealType} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {mealInfo.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {mealInfo.timeRange}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(mealCalories)} cal
                  </span>
                </div>

                {mealEntries.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No entries</p>
                ) : (
                  <div className="space-y-2">
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {!isLoading && viewMode === "timeline" && entries.length > 0 && (
        <div className="px-4 py-3">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-4">
              {entries
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((entry) => (
                  <div key={entry.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 top-2 w-3 h-3 bg-amber-500 rounded-full ring-4 ring-white" />

                    <div className="text-xs text-gray-400 mb-1">
                      {entry.time}
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
        </div>
      )}
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
    if (confirm("Delete this entry?")) {
      setIsDeleting(true);
      await onDelete();
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`bg-gray-50 rounded-lg overflow-hidden transition-all ${isExpanded ? "ring-2 ring-amber-200" : ""}`}
    >
      {/* Main row */}
      <button
        onClick={onToggleExpand}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-gray-900">{entry.foodName}</div>
            <div className="text-sm text-gray-500">
              {entry.quantity} x {entry.serving.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {entry.rating && <StarDisplay rating={entry.rating} size="sm" />}
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {Math.round(entry.nutrition.calories || 0)}
            </div>
            <div className="text-xs text-gray-500">cal</div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-200">
          {/* Nutrition Details */}
          <div className="grid grid-cols-4 gap-2 py-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(entry.nutrition.protein || 0)}g
              </div>
              <div className="text-xs text-gray-500">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(entry.nutrition.carbs || 0)}g
              </div>
              <div className="text-xs text-gray-500">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(entry.nutrition.fat || 0)}g
              </div>
              <div className="text-xs text-gray-500">Fat</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(entry.nutrition.fiber || 0)}g
              </div>
              <div className="text-xs text-gray-500">Fiber</div>
            </div>
          </div>

          {/* Rating */}
          <div className="py-3 border-t border-gray-200">
            <FoodRating
              rating={entry.rating}
              moodTags={entry.moodTags}
              onRate={onRate}
              compact={false}
            />
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="py-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">{entry.notes}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                entry.isFavorite
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={entry.isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm">
                {entry.isFavorite ? "Favorited" : "Favorite"}
              </span>
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="text-sm">
                {isDeleting ? "Deleting..." : "Delete"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
