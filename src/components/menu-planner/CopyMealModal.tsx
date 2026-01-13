"use client";

/**
 * Copy/Move Meal Modal Component
 * Allows copying or moving a meal to multiple slots at once
 *
 * @file src/components/menu-planner/CopyMealModal.tsx
 * @created 2026-01-10 (Phase 2)
 */

import React, { useState, useMemo } from "react";
import type { MealSlot, DayOfWeek, MealType } from "@/types/menuPlanner";
import { getDayName, getShortDayName } from "@/types/menuPlanner";

interface CopyMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceMeal: MealSlot;
  allMeals: MealSlot[];
  onCopy: (targetSlotIds: string[], servings?: number) => void;
  onMove: (targetSlotIds: string[], servings?: number) => void;
}

/**
 * Get meal type colors
 */
function getMealTypeColors(mealType: MealType): { bg: string; border: string } {
  const colors: Record<MealType, { bg: string; border: string }> = {
    breakfast: { bg: "bg-orange-100", border: "border-orange-300" },
    lunch: { bg: "bg-blue-100", border: "border-blue-300" },
    dinner: { bg: "bg-purple-100", border: "border-purple-300" },
    snack: { bg: "bg-green-100", border: "border-green-300" },
  };
  return colors[mealType];
}

/**
 * Main Copy/Move Meal Modal Component
 */
export default function CopyMealModal({
  isOpen,
  onClose,
  sourceMeal,
  allMeals,
  onCopy,
  onMove,
}: CopyMealModalProps) {
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(
    new Set(),
  );
  const [operation, setOperation] = useState<"copy" | "move">("copy");
  const [servings, setServings] = useState<number>(sourceMeal.servings);
  const [sameMealTypeOnly, setSameMealTypeOnly] = useState(false);
  const [emptyOnly, setEmptyOnly] = useState(true);

  // Filter meals based on options
  const filteredMeals = useMemo(() => {
    return allMeals.filter((meal) => {
      // Exclude source meal
      if (meal.id === sourceMeal.id) return false;

      // Filter by meal type
      if (sameMealTypeOnly && meal.mealType !== sourceMeal.mealType) {
        return false;
      }

      // Filter by empty slots
      if (emptyOnly && meal.recipe) {
        return false;
      }

      return true;
    });
  }, [allMeals, sourceMeal, sameMealTypeOnly, emptyOnly]);

  // Organize meals by day and meal type
  const mealsByDayAndType = useMemo(() => {
    const organized: Record<DayOfWeek, Record<MealType, MealSlot>> = {} as any;

    for (let day = 0; day < 7; day++) {
      organized[day as DayOfWeek] = {} as any;
      ["breakfast", "lunch", "dinner", "snack"].forEach((mealType) => {
        const meal = allMeals.find(
          (m) => m.dayOfWeek === day && m.mealType === mealType,
        );
        if (meal) {
          organized[day as DayOfWeek][mealType as MealType] = meal;
        }
      });
    }

    return organized;
  }, [allMeals]);

  // Handle slot selection toggle
  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  // Handle apply
  const handleApply = () => {
    const targetSlotIds = Array.from(selectedSlotIds);
    if (targetSlotIds.length === 0) {
      alert("Please select at least one slot");
      return;
    }

    // Check if overwriting occupied slots
    const occupiedSlots = targetSlotIds.filter((slotId) => {
      const meal = allMeals.find((m) => m.id === slotId);
      return meal?.recipe;
    });

    if (occupiedSlots.length > 0) {
      if (
        !confirm(
          `This will overwrite ${occupiedSlots.length} occupied slot(s). Continue?`,
        )
      ) {
        return;
      }
    }

    if (operation === "copy") {
      onCopy(targetSlotIds, servings);
    } else {
      onMove(targetSlotIds, servings);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Copy/Move Meal
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Source Meal Info */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Source Meal:</p>
            <h3 className="text-lg font-bold text-purple-900">
              {sourceMeal.recipe?.name || "Empty Slot"}
            </h3>
            <p className="text-sm text-gray-600">
              {getDayName(sourceMeal.dayOfWeek)} • {sourceMeal.mealType}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Filters</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameMealTypeOnly}
                  onChange={(e) => {
                    setSameMealTypeOnly(e.target.checked);
                    setSelectedSlotIds(new Set());
                  }}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">
                  Show same meal type only ({sourceMeal.mealType})
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emptyOnly}
                  onChange={(e) => {
                    setEmptyOnly(e.target.checked);
                    setSelectedSlotIds(new Set());
                  }}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">
                  Show empty slots only
                </span>
              </label>
            </div>
          </div>

          {/* Operation Selection */}
          <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Operation</h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="copy"
                  checked={operation === "copy"}
                  onChange={(e) => setOperation(e.target.value as "copy")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Copy (keeps source meal)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="move"
                  checked={operation === "move"}
                  onChange={(e) => setOperation(e.target.value as "move")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Move (clears source meal)
                </span>
              </label>
            </div>

            {/* Servings Control */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-700">Servings:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  disabled={servings <= 1}
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{servings}</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Grid */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Select Target Slots ({selectedSlotIds.size} selected)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-semibold text-gray-600 border-b-2 border-gray-300">
                      Meal
                    </th>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <th
                        key={day}
                        className="p-2 text-center text-xs font-semibold text-gray-600 border-b-2 border-gray-300"
                      >
                        {getShortDayName(day as DayOfWeek)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
                    (mealType) => (
                      <tr key={mealType}>
                        <td className="p-2 text-xs font-medium text-gray-700 capitalize border-b border-gray-200">
                          {mealType}
                        </td>
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                          const meal = mealsByDayAndType[day as DayOfWeek]?.[mealType];
                          if (!meal) return <td key={day} className="p-1" />;

                          const isSource = meal.id === sourceMeal.id;
                          const isFiltered = filteredMeals.some(
                            (m) => m.id === meal.id,
                          );
                          const isSelected = selectedSlotIds.has(meal.id);
                          const hasRecipe = !!meal.recipe;
                          const colors = getMealTypeColors(mealType);

                          return (
                            <td key={day} className="p-1 border-b border-gray-200">
                              <button
                                onClick={() => toggleSlot(meal.id)}
                                disabled={isSource || !isFiltered}
                                className={`
                                  w-full h-16 rounded-lg border-2 text-xs transition-all
                                  ${isSource ? "bg-gray-300 border-gray-400 cursor-not-allowed opacity-50" : ""}
                                  ${!isFiltered && !isSource ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-30" : ""}
                                  ${isFiltered && !isSource ? `${colors.bg} ${colors.border} hover:shadow-lg cursor-pointer` : ""}
                                  ${isSelected ? "ring-4 ring-purple-500 scale-105" : ""}
                                `}
                                title={
                                  isSource
                                    ? "Source slot"
                                    : !isFiltered
                                      ? "Filtered out"
                                      : hasRecipe
                                        ? meal.recipe!.name
                                        : "Empty slot"
                                }
                              >
                                {isSource && (
                                  <div className="font-bold text-gray-600">SOURCE</div>
                                )}
                                {!isSource && isSelected && (
                                  <div className="font-bold text-purple-600">✓</div>
                                )}
                                {!isSource && !isSelected && hasRecipe && (
                                  <div className="truncate px-1 text-gray-600">
                                    {meal.recipe!.name}
                                  </div>
                                )}
                                {!isSource && !isSelected && !hasRecipe && (
                                  <div className="text-gray-400">Empty</div>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          {selectedSlotIds.size > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                {operation === "copy" ? "Copying" : "Moving"}{" "}
                <span className="font-semibold">{sourceMeal.recipe?.name}</span>{" "}
                to {selectedSlotIds.size} slot{selectedSlotIds.size > 1 ? "s" : ""}{" "}
                with {servings} serving{servings > 1 ? "s" : ""} each
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedSlotIds.size === 0}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-all
              ${selectedSlotIds.size === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg"}
            `}
          >
            {operation === "copy" ? "Copy" : "Move"} to {selectedSlotIds.size}{" "}
            slot{selectedSlotIds.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
