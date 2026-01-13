"use client";

/**
 * Menu Planner Page
 * Main page for the Weekly Menu Planning system
 *
 * @file src/app/menu-planner/page.tsx
 * @created 2026-01-10
 */

import React, { useState } from "react";
import Link from "next/link";
import WeeklyCalendar from "@/components/menu-planner/WeeklyCalendar";
import RecipeQueue from "@/components/menu-planner/RecipeQueue";
import GroceryListModal from "@/components/menu-planner/GroceryListModal";
import NutritionalDashboard from "@/components/menu-planner/NutritionalDashboard";
import { MenuPlannerProvider, useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { RecipeQueueProvider, useRecipeQueue } from "@/contexts/RecipeQueueContext";

/**
 * Menu Planner Content (inner component with context access)
 */
function MenuPlannerContent() {
  const {
    currentMenu,
    weeklyStats,
    groceryList,
    regenerateGroceryList,
    clearWeek,
    saveAsTemplate,
    refreshStats,
  } = useMenuPlanner();

  const { queueSize } = useRecipeQueue();

  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showNutritionDashboard, setShowNutritionDashboard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showRecipeQueue, setShowRecipeQueue] = useState(true);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    try {
      await saveAsTemplate(templateName);
      alert(`Template "${templateName}" saved successfully!`);
      setTemplateName("");
      setShowSaveTemplate(false);
    } catch (err) {
      alert("Failed to save template");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Weekly Menu Planner
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Plan your meals aligned with the cosmos
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowRecipeQueue(!showRecipeQueue)}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  showRecipeQueue
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📋 Recipe Queue {queueSize > 0 && `(${queueSize})`}
              </button>

              <button
                onClick={() => {
                  regenerateGroceryList();
                  setShowGroceryList(true);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all font-medium"
              >
                📝 Generate Grocery List
              </button>

              <button
                onClick={() => {
                  setShowNutritionDashboard(true);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg transition-all font-medium"
              >
                📊 Nutrition Dashboard
              </button>

              <button
                onClick={() => setShowSaveTemplate(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all font-medium"
              >
                💾 Save as Template
              </button>

              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to clear the entire week? This cannot be undone.",
                    )
                  ) {
                    clearWeek();
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium"
              >
                🗑️ Clear Week
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Calendar and Queue */}
        <div className="flex gap-6">
          {/* Calendar */}
          <div className={`${showRecipeQueue ? "flex-1" : "w-full"}`}>
            <WeeklyCalendar />
          </div>

          {/* Recipe Queue Sidebar */}
          {showRecipeQueue && (
            <div className="w-96">
              <RecipeQueue
                onSelectRecipe={(queuedRecipe) => {
                  // TODO: Show meal slot selector when clicking "Use Recipe"
                  console.log("Selected from queue:", queuedRecipe.recipe.name);
                  alert("Phase 2: Meal slot selector coming next!");
                }}
              />
            </div>
          )}
        </div>

        {/* Enhanced Grocery List Modal (Phase 3) */}
        <GroceryListModal
          isOpen={showGroceryList}
          onClose={() => setShowGroceryList(false)}
        />

        {/* Nutritional Dashboard (Phase 3) */}
        <NutritionalDashboard
          isOpen={showNutritionDashboard}
          onClose={() => setShowNutritionDashboard(false)}
        />

        {/* Statistics Modal */}
        {showStats && weeklyStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Weekly Statistics
                  </h2>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">
                      Total Meals
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {weeklyStats.totalMeals}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
                    <p className="text-sm text-purple-600 font-medium">
                      Unique Recipes
                    </p>
                    <p className="text-3xl font-bold text-purple-700">
                      {weeklyStats.totalRecipes}
                    </p>
                  </div>
                </div>

                {weeklyStats.missingMeals.length > 0 && (
                  <div className="mb-6 p-4 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                    <p className="font-medium text-yellow-800 mb-2">
                      Missing Meals ({weeklyStats.missingMeals.length})
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {weeklyStats.missingMeals.map((missing, idx) => (
                        <li key={idx}>
                          Day {missing.dayOfWeek} - {missing.mealType}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center text-gray-500 mt-6">
                  <p className="text-sm">
                    More detailed analytics coming in Phase 3!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Template Modal */}
        {showSaveTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Save as Template
                </h2>
              </div>

              <div className="p-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., My Balanced Week"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowSaveTemplate(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            ✨ Phase 2 In Progress - Recipe search, queue management, and enhanced grocery lists
          </p>
          <p>
            Coming next: Drag-and-drop, copy/move operations, and recipe recommendations
          </p>
        </div>
      </div>
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
