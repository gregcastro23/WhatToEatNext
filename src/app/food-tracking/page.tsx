"use client";

/**
 * Food Tracking Page
 * Smart food diary with nutrition tracking, ratings, and personalized insights
 *
 * @file src/app/food-tracking/page.tsx
 * @created 2026-02-02
 */

import React, { useState } from "react";
import { useFoodDiary } from "@/hooks/useFoodDiary";
import { QuickFoodInput, FoodDiaryView, NutritionDashboard } from "@/components/food-diary";
import Link from "next/link";

export default function FoodTrackingPage() {
  const {
    entries,
    dailySummary,
    weeklySummary,
    stats,
    insights,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    addQuickFood,
    getQuickFoodPresets,
    searchFoods,
    rateEntry,
    deleteEntry,
    addToFavorites,
    refreshInsights,
  } = useFoodDiary();

  const [activePanel, setActivePanel] = useState<"add" | "view" | "stats">("view");

  const presets = getQuickFoodPresets();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Food Diary</h1>
                <p className="text-sm text-gray-500">Track what you eat and learn from your choices</p>
              </div>
            </div>

            {/* Stats Badge */}
            {stats && stats.trackingStreak > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                <span className="text-amber-600 text-sm font-medium">{stats.trackingStreak} day streak</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="flex">
          {[
            { id: "view", label: "Diary", icon: "book" },
            { id: "add", label: "Add Food", icon: "plus" },
            { id: "stats", label: "Insights", icon: "chart" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id as typeof activePanel)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activePanel === tab.id
                  ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Left Column - Quick Add */}
          <div className="space-y-6">
            <QuickFoodInput
              presets={presets}
              onAddFood={addQuickFood}
              onSearch={searchFoods}
              selectedDate={selectedDate}
              isLoading={isLoading}
            />
          </div>

          {/* Center Column - Diary View */}
          <div className="space-y-6">
            <FoodDiaryView
              entries={entries}
              dailySummary={dailySummary}
              selectedDate={selectedDate}
              onPreviousDay={goToPreviousDay}
              onNextDay={goToNextDay}
              onGoToToday={goToToday}
              onSetDate={setSelectedDate}
              onRateEntry={rateEntry}
              onDeleteEntry={deleteEntry}
              onToggleFavorite={addToFavorites}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Stats & Insights */}
          <div className="space-y-6">
            <NutritionDashboard
              dailySummary={dailySummary}
              weeklySummary={weeklySummary}
              stats={stats}
              insights={insights}
              onRefreshInsights={refreshInsights}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {activePanel === "view" && (
            <FoodDiaryView
              entries={entries}
              dailySummary={dailySummary}
              selectedDate={selectedDate}
              onPreviousDay={goToPreviousDay}
              onNextDay={goToNextDay}
              onGoToToday={goToToday}
              onSetDate={setSelectedDate}
              onRateEntry={rateEntry}
              onDeleteEntry={deleteEntry}
              onToggleFavorite={addToFavorites}
              isLoading={isLoading}
            />
          )}

          {activePanel === "add" && (
            <QuickFoodInput
              presets={presets}
              onAddFood={addQuickFood}
              onSearch={searchFoods}
              selectedDate={selectedDate}
              isLoading={isLoading}
            />
          )}

          {activePanel === "stats" && (
            <NutritionDashboard
              dailySummary={dailySummary}
              weeklySummary={weeklySummary}
              stats={stats}
              insights={insights}
              onRefreshInsights={refreshInsights}
            />
          )}
        </div>

        {/* Quick Add FAB (Mobile) */}
        <div className="lg:hidden fixed bottom-6 right-6">
          <button
            onClick={() => setActivePanel("add")}
            className="w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-amber-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </main>

      {/* Getting Started Guide (shown when no entries) */}
      {!isLoading && entries.length === 0 && !error && (
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to Your Food Diary</h2>
            <p className="text-gray-600 mb-6">
              Track what you eat, discover patterns in your nutrition, and get personalized insights
              to improve your eating habits.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add foods quickly</h3>
                  <p className="text-sm text-gray-500">Use our quick-add presets or search for any food</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Rate your meals</h3>
                  <p className="text-sm text-gray-500">Tell us how foods make you feel to get better recommendations</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Get insights</h3>
                  <p className="text-sm text-gray-500">After a few days, you&apos;ll see personalized nutrition insights</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActivePanel("add")}
              className="mt-6 w-full py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Add Your First Food
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
