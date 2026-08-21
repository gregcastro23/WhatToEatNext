import React, { useState } from "react";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { saveRecipeToStore } from "@/utils/generatedRecipeStore";
import { addToMealPlannerQueue } from "./recipeHelpers";
import { DAYS_OF_WEEK, MEAL_TYPES, type AddToMealPlannerProps } from "./types";

const DayPicker: React.FC<{
  selectedDay: number;
  onSelectDay: (i: number) => void;
}> = ({ selectedDay, onSelectDay }) => (
  <div className="mb-4" role="group" aria-labelledby="meal-planner-day-label">
    <span
      id="meal-planner-day-label"
      className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block"
    >
      Day
    </span>
    <div className="grid grid-cols-7 gap-1">
      {DAYS_OF_WEEK.map((day, i) => (
        <button
          key={day}
          type="button"
          onClick={() => onSelectDay(i)}
          aria-pressed={selectedDay === i}
          className={`py-2 rounded-lg text-xs font-medium transition-all ${
            selectedDay === i
              ? "bg-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {day.slice(0, 3)}
        </button>
      ))}
    </div>
  </div>
);

const MealTypePicker: React.FC<{
  selectedMeal: string;
  onSelectMeal: (m: string) => void;
}> = ({ selectedMeal, onSelectMeal }) => (
  <div className="mb-6" role="group" aria-labelledby="meal-planner-meal-label">
    <span
      id="meal-planner-meal-label"
      className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block"
    >
      Meal
    </span>
    <div className="grid grid-cols-4 gap-2">
      {MEAL_TYPES.map((meal) => (
        <button
          key={meal}
          type="button"
          onClick={() => onSelectMeal(meal)}
          aria-pressed={selectedMeal === meal}
          className={`py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
            selectedMeal === meal
              ? "bg-amber-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {meal}
        </button>
      ))}
    </div>
  </div>
);

export const AddToMealPlannerModal: React.FC<AddToMealPlannerProps> = ({ recipe, onClose, onAdded }) => {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedMeal, setSelectedMeal] = useState<string>("dinner");

  const handleAdd = (): void => {
    addToMealPlannerQueue(recipe, selectedDay, selectedMeal);
    saveRecipeToStore(recipe as unknown as MonicaOptimizedRecipe);
    onAdded(DAYS_OF_WEEK[selectedDay], selectedMeal);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Add to Meal Planner</h3>
        <p className="text-sm text-gray-500 mb-4 truncate">{recipe.name}</p>

        <DayPicker selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        <MealTypePicker selectedMeal={selectedMeal} onSelectMeal={setSelectedMeal} />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-700 hover:to-amber-600 shadow-md transition-all"
          >
            Add to {DAYS_OF_WEEK[selectedDay].slice(0, 3)} {selectedMeal}
          </button>
        </div>
      </div>
    </div>
  );
};
