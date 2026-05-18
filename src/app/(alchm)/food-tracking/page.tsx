"use client";

/**
 * Food Tracking Page
 * Smart food diary with nutrition tracking, ratings, and personalized insights
 * Enhanced with Alchemical Dark Theme
 */

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  QuickFoodInput,
  FoodDiaryView,
  NutritionDashboard,
} from "@/components/food-diary";
import { useFoodDiary } from "@/hooks/useFoodDiary";
import type { QuickFoodPreset } from "@/types/foodDiary";

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

  const [activePanel, setActivePanel] = useState<"add" | "view" | "stats">(
    "view",
  );

  const [presets, setPresets] = useState<QuickFoodPreset[]>([]);

  useEffect(() => {
    let active = true;
    void getQuickFoodPresets().then((resolvedPresets) => {
      if (active && resolvedPresets) {
        setPresets(resolvedPresets);
      }
    });
    return () => {
      active = false;
    };
  }, [getQuickFoodPresets]);

  return (
    <div className="min-h-screen bg-[#08080e] text-gray-100 selection:bg-amber-500/30">
      {/* Background Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[15%] w-[20%] h-[20%] bg-emerald-600/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="group p-2 hover:bg-white/5 rounded-full transition-all">
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-amber-400"
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
              </Link>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Alchemical Journal
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                  Log your culinary transmutations
                </p>
              </div>
            </div>

            {/* Stats Badge */}
            {stats && stats.trackingStreak > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <span className="text-amber-400 text-xs font-bold tracking-tighter">
                  🔥 {stats.trackingStreak} DAY STREAK
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-[#0a0a14]/90 backdrop-blur-lg border-b border-white/5 sticky top-16 z-20">
        <div className="flex">
          {[
            { id: "view", label: "Journal", icon: "book" },
            { id: "add", label: "Infuse", icon: "plus" },
            { id: "stats", label: "Insights", icon: "chart" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id as typeof activePanel)}
              className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-all ${
                activePanel === tab.id
                  ? "text-amber-400 border-b-2 border-amber-500 bg-amber-500/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-200 flex items-center gap-3 backdrop-blur-md">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column - Quick Add */}
          <div className="lg:col-span-3 space-y-8">
            <div className="sticky top-28">
              <QuickFoodInput
                presets={presets}
                onAddFood={addQuickFood}
                onSearch={searchFoods}
                selectedDate={selectedDate}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Center Column - Diary View */}
          <div className="lg:col-span-5 space-y-8">
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
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-28">
              <NutritionDashboard
                dailySummary={dailySummary}
                weeklySummary={weeklySummary}
                stats={stats}
                insights={insights}
                onRefreshInsights={() => {
                  void refreshInsights();
                }}
              />
            </div>
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
              onRefreshInsights={() => {
                void refreshInsights();
              }}
            />
          )}
        </div>

        {/* Quick Add FAB (Mobile) */}
        <div className="lg:hidden fixed bottom-8 right-6 z-40">
          <button
            onClick={() => setActivePanel("add")}
            className="w-16 h-16 bg-amber-500 text-black rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center hover:bg-amber-400 transition-all active:scale-95 border-4 border-[#08080e]"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </main>

      {/* Getting Started Guide (shown when no entries) */}
      {!isLoading && entries.length === 0 && !error && (
        <div className="max-w-2xl mx-auto px-4 pb-20 relative z-10">
          <div className="bg-[#0a0a14]/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/5 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
              <span className="text-amber-500">✦</span>
              Begin Your Alchemy
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Track the essence of your meals to reveal cosmic patterns. Every log brings you closer to elemental harmony and awards precious tokens.
            </p>

            <div className="grid gap-6">
              {[
                { title: "Catalog Essence", desc: "Log ingredients or recipes to track your daily yield.", color: "text-amber-400" },
                { title: "Elemental Feedback", desc: "Rate your physical and spiritual response to foods.", color: "text-indigo-400" },
                { title: "Receive Insights", desc: "Discover how celestial transits influence your vitality.", color: "text-emerald-400" }
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className={`w-10 h-10 rounded-xl bg-black/40 ${step.color} flex items-center justify-center flex-shrink-0 font-black border border-white/10`}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">{step.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActivePanel("add")}
              className="mt-8 w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-black rounded-xl font-black uppercase tracking-widest hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg active:scale-95"
            >
              Initiate First Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
