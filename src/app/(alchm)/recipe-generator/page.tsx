"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";
import { AddToMealPlannerModal } from "./components/AddToMealPlannerModal";
import { CosmicMomentBanner } from "./components/CosmicMomentBanner";
import { QuickGenerateBar } from "./components/QuickGenerateBar";
import { RecipeCarousel } from "./components/RecipeCarousel";
import { useRecipeGeneratorLogic } from "./components/useRecipeGeneratorLogic";
import type { RecipePayloadItem } from "./components/types";

const RecipeBuilderPanel = dynamic(
  () => import("@/components/recipe-builder/RecipeBuilderPanel"),
);

const PageHeader: React.FC<{ isPersonalized: boolean }> = ({ isPersonalized }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
        Recipe Generator
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">
        {isPersonalized
          ? "Recipes aligned with your birth chart & the current cosmic moment"
          : "Cosmically-aligned recipes based on real-time planetary positions"}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Link
        href="/menu-planner"
        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors text-sm text-amber-700 font-medium border border-amber-200"
      >
        Meal Planner
      </Link>
      <Link
        href="/"
        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-600"
      >
        Home
      </Link>
    </div>
  </div>
);

const BuilderSection: React.FC<{
  showBuilder: boolean;
  canBuilderGenerate: boolean;
  isGenerating: boolean;
  isPersonalized: boolean;
  onBuilderGenerate: () => void;
}> = ({ showBuilder, canBuilderGenerate, isGenerating, isPersonalized, onBuilderGenerate }) => {
  if (!showBuilder) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      <RecipeBuilderPanel />
      <button
        type="button"
        onClick={onBuilderGenerate}
        disabled={!canBuilderGenerate || isGenerating}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
          canBuilderGenerate && !isGenerating
            ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:from-purple-700 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isGenerating ? "Generating..." : `Generate with Preferences${isPersonalized ? " (personalized)" : ""}`}
      </button>
    </div>
  );
};

const PersonalizationNudge: React.FC = () => (
  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-4">
    <div className="flex items-start gap-3">
      <span className="text-2xl shrink-0">&#x1F52E;</span>
      <div>
        <p className="text-sm font-semibold text-purple-800">Unlock Personalized Recipes</p>
        <p className="text-xs text-purple-600 mt-0.5">
          Sign in and add your birth chart for recipes perfectly aligned with your cosmic constitution.
        </p>
        <Link
          href="/profile"
          className="inline-block mt-2 px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors"
        >
          Set up your chart
        </Link>
      </div>
    </div>
  </div>
);

const QuickBarCard: React.FC<{
  onGenerate: ReturnType<typeof useRecipeGeneratorLogic>["handleQuickGenerate"];
  onGenerateAll: ReturnType<typeof useRecipeGeneratorLogic>["handleGenerateAll"];
  isGenerating: boolean;
  showBuilder: boolean;
  onToggleBuilder: () => void;
}> = ({ onGenerate, onGenerateAll, isGenerating, showBuilder, onToggleBuilder }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <QuickGenerateBar onGenerate={onGenerate} onGenerateAll={onGenerateAll} isGenerating={isGenerating} />
      <button
        type="button"
        onClick={onToggleBuilder}
        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
          showBuilder ? "bg-purple-600 text-white border-purple-600" : "bg-white text-purple-600 border-purple-200 hover:bg-purple-50"
        }`}
      >
        {showBuilder ? "Hide Builder" : "Customize"}
      </button>
    </div>
  </div>
);

const ResultsSection: React.FC<{
  logic: ReturnType<typeof useRecipeGeneratorLogic>;
}> = ({ logic }) => {
  if (!logic.hasGenerated && !logic.isGenerating) return null;
  return (
    <>
      <RecipeCarousel
        suggestions={logic.suggestions}
        isLoading={logic.isGenerating}
        isPersonalized={logic.isPersonalized}
        onAddToPlanner={(recipe: RecipePayloadItem): void => { logic.setPlannerRecipe(recipe); }}
        onSave={logic.handleSave}
        likedRecipeIds={logic.likedRecipeIds}
        savingRecipeIds={logic.savingRecipeIds}
      />
      {logic.hasGenerated && !logic.isGenerating && logic.suggestions.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={logic.handleGenerateAll}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-purple-600 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
          >
            Regenerate All Meals
          </button>
        </div>
      )}
    </>
  );
};

export default function RecipeGeneratorPage(): React.ReactElement {
  const logic = useRecipeGeneratorLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/40 to-orange-50/40">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-5">
        <PageHeader isPersonalized={logic.isPersonalized} />
        <CosmicMomentBanner
          planetaryInfo={logic.planetaryDayInfo}
          lunarPhase={logic.astroState.lunarPhase}
          currentZodiac={String(logic.astroState.currentZodiac ?? "")}
          activePlanets={logic.astroState.activePlanets}
          domElements={logic.astroState.domElements}
          isPersonalized={logic.isPersonalized}
          planetaryHour={logic.astroState.currentPlanetaryHour ?? null}
        />
        <QuickBarCard
          onGenerate={logic.handleQuickGenerate}
          onGenerateAll={logic.handleGenerateAll}
          isGenerating={logic.isGenerating}
          showBuilder={logic.showBuilder}
          onToggleBuilder={(): void => { logic.setShowBuilder(!logic.showBuilder); }}
        />
        <BuilderSection
          showBuilder={logic.showBuilder}
          canBuilderGenerate={logic.canBuilderGenerate}
          isGenerating={logic.isGenerating}
          isPersonalized={logic.isPersonalized}
          onBuilderGenerate={logic.handleBuilderGenerate}
        />
        <ResultsSection logic={logic} />
        {!logic.isPersonalized && !logic.isGenerating && <PersonalizationNudge />}
      </div>
      {logic.plannerRecipe && (
        <AddToMealPlannerModal
          recipe={logic.plannerRecipe}
          onClose={(): void => { logic.setPlannerRecipe(null); }}
          onAdded={logic.handleAddedToPlanner}
        />
      )}
      {logic.toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-2xl text-sm font-medium animate-fade-in">
          {logic.toast}
        </div>
      )}
    </div>
  );
}
