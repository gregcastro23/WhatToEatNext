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
import RecipeBrowserPanel from "@/components/menu-planner/RecipeBrowserPanel";
import RecipeDetailModal from "@/components/menu-planner/RecipeDetailModal";
import QuickActionsToolbar from "@/components/menu-builder/QuickActionsToolbar";
import SmartSuggestionsSidebar from "@/components/menu-builder/SmartSuggestionsSidebar";
import WeekProgress from "@/components/menu-builder/WeekProgress";
import { InlineNutritionDashboard } from "@/components/nutrition";
import { WeeklyNutritionDashboard } from "@/components/nutrition";
import { useNutritionTracking } from "@/hooks/useNutritionTracking";
import { useToast, Toast } from "@/components/common/Toast";
import {
  MenuPlannerProvider,
  useMenuPlanner,
} from "@/contexts/MenuPlannerContext";
import {
  RecipeQueueProvider,
  useRecipeQueue,
} from "@/contexts/RecipeQueueContext";
import type { Recipe } from "@/types/recipe";

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

  // Real-time nutrition tracking - recalculates whenever menu changes
  const weeklyNutrition = useNutritionTracking(currentMenu);

  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showNutritionDashboard, setShowNutritionDashboard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showRecipeQueue, setShowRecipeQueue] = useState(true);
  const [showRecipeBrowser, setShowRecipeBrowser] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [showDetailedNutrition, setShowDetailedNutrition] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [isWeeklyDashboardExpanded, setIsWeeklyDashboardExpanded] =
    useState(false); // New state for sticky dashboard

  const { toast, showSuccess, showError, showInfo } = useToast();

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
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

          {/* Quick Actions Toolbar - Generate, Balance, Variety, Clear */}
          <QuickActionsToolbar />

          {/* Tools Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mt-3">
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
                onClick={() => setShowRecipeBrowser(!showRecipeBrowser)}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  showRecipeBrowser
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🔍 Browse Recipes
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
                  setIsWeeklyDashboardExpanded(!isWeeklyDashboardExpanded);
                  // setShowNutritionDashboard(true); // Old modal behavior
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
            </div>
          </div>
        </div>
        {/* Weekly Nutrition Dashboard (Sticky Top) */}
        {weeklyNutrition && (
          <WeeklyNutritionDashboard
            weeklyData={weeklyNutrition}
            isExpanded={isWeeklyDashboardExpanded}
            onToggleExpand={() =>
              setIsWeeklyDashboardExpanded(!isWeeklyDashboardExpanded)
            }
          />
        )}
        {/* Week Progress + Inline Nutrition */}{" "}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <WeekProgress
              weekPlan={currentMenu}
              weeklyNutrition={weeklyNutrition}
            />
          </div>
          <div className="lg:col-span-2">
            {weeklyNutrition && (
              <InlineNutritionDashboard weeklyResult={weeklyNutrition} />
            )}
          </div>
        </div>
        {/* Recipe Browser Panel (collapsible) */}
        {showRecipeBrowser && (
          <div className="mb-6" style={{ maxHeight: "500px" }}>
            <RecipeBrowserPanel
              onSelectRecipe={(recipe) => {
                showInfo(
                  `Selected "${recipe.name}" - drag from queue or use Recipe Selector to add to a meal slot`,
                );
              }}
              onViewRecipeDetail={(recipe) => setDetailRecipe(recipe)}
            />
          </div>
        )}
        {/* Main Content - Calendar, Queue, and Smart Suggestions */}
        <div className="flex gap-6">
          {/* Calendar */}
          <div className={`min-w-0 ${showRecipeQueue ? "flex-1" : "flex-1"}`}>
            <WeeklyCalendar />
          </div>

          {/* Recipe Queue Sidebar */}
          {showRecipeQueue && (
            <div className="hidden md:block w-96 flex-shrink-0">
              <RecipeQueue
                onSelectRecipe={(queuedRecipe) => {
                  console.log("Selected from queue:", queuedRecipe.recipe.name);
                  showInfo(
                    "Drag recipes from the queue to meal slots on the calendar!",
                  );
                }}
              />
            </div>
          )}

          {/* Smart Suggestions Sidebar - desktop only */}
          <div className="hidden lg:block relative flex-shrink-0">
            <SmartSuggestionsSidebar
              weekPlan={currentMenu}
              weeklyNutrition={weeklyNutrition}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        </div>
        {/* Mobile: Suggestions Bottom Sheet */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <button
            onClick={() => setShowMobileSuggestions(!showMobileSuggestions)}
            className="w-full flex items-center justify-between px-4 py-3 focus:outline-none"
          >
            <span className="font-semibold text-gray-800 text-sm">
              Smart Suggestions
            </span>
            <span className="text-gray-500">
              {showMobileSuggestions ? "▼" : "▲"}
            </span>
          </button>
          {showMobileSuggestions && (
            <div className="px-4 pb-4 max-h-64 overflow-y-auto animate-fade-in">
              <SmartSuggestionsSidebar
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
            isOpen={true}
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
        {/* Detailed Weekly Nutrition Dashboard Modal (COMMENTED OUT FOR NOW) */}
        {/*
        {weeklyNutrition && (
          <WeeklyNutritionDashboardModal
            weeklyResult={weeklyNutrition}
            isOpen={showDetailedNutrition}
            onClose={() => setShowDetailedNutrition(false)}
          />
        )}
        */}
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
        <div className="mt-12 mb-16 lg:mb-0 text-center text-sm text-gray-500">
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
