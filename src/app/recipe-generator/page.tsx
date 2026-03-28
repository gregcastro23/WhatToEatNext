"use client";

/**
 * Recipe Generator Page — Revolutionized
 * A comprehensive recipe generation experience powered by real-time planetary
 * positions, natal chart personalization, and the full alchemical scoring pipeline.
 *
 * Features:
 *  - Auto-generates recipes on load using the current cosmic moment
 *  - Swipeable/keyboard-navigable carousel with full recipe details
 *  - Complete recipe cards: ingredients, procedure, timing, servings, scores
 *  - Planetary moment snapshot showing current celestial state
 *  - Add-to-meal-planner integration with day/meal-type selection
 *  - Quick-generate by meal type
 *  - Builder panel for fine-tuned preferences
 *
 * @file src/app/recipe-generator/page.tsx
 */

import Link from "next/link";
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { PremiumGate } from "@/components/PremiumGate";
import RecipeBuilderPanel from "@/components/recipe-builder/RecipeBuilderPanel";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useUser } from "@/contexts/UserContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import { saveRecipeToStore } from "@/utils/generatedRecipeStore";
import { createLogger } from "@/utils/logger";
import {
  generateDayRecommendations,
  type RecommendedMeal,
  type AstrologicalState,
  type UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";

const logger = createLogger("RecipeGenerator");

// ===== Constants =====

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const ELEMENT_ICONS: Record<string, string> = {
  Fire: "🔥",
  Water: "💧",
  Earth: "🌍",
  Air: "💨",
};

const ELEMENT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Fire: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
  Water: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
  Earth: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-600" },
  Air: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-400" },
};

const ESMS_COLORS: Record<string, { bg: string; text: string }> = {
  Spirit: { bg: "bg-violet-100", text: "text-violet-700" },
  Essence: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Matter: { bg: "bg-amber-100", text: "text-amber-700" },
  Substance: { bg: "bg-rose-100", text: "text-rose-700" },
};

// ===== Helpers =====

function deduplicateRecipes(recipes: RecommendedMeal[]): RecommendedMeal[] {
  const seen = new Set<string>();
  return recipes.filter((r) => {
    const normalized = r.recipe.name
      .toLowerCase()
      .replace(/\s*\(monica enhanced\)\s*/gi, "")
      .replace(/\s*[-_]?\s*(copy|duplicate)\s*\d*\s*$/gi, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function getMealPlannerKey(): string {
  return "alchm-meal-planner-queue";
}

interface MealPlannerQueueItem {
  recipeId: string;
  recipeName: string;
  recipe: any;
  dayOfWeek: number;
  mealType: string;
  addedAt: string;
}

function addToMealPlannerQueue(
  recipe: any,
  dayOfWeek: number,
  mealType: string,
): void {
  try {
    const key = getMealPlannerKey();
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as MealPlannerQueueItem[];
    const item: MealPlannerQueueItem = {
      recipeId: recipe.id || `gen-${Date.now()}`,
      recipeName: recipe.name,
      recipe,
      dayOfWeek,
      mealType,
      addedAt: new Date().toISOString(),
    };
    // Remove duplicate if same recipe+day+meal
    const filtered = existing.filter(
      (e) =>
        !(e.recipeName === item.recipeName && e.dayOfWeek === item.dayOfWeek && e.mealType === item.mealType),
    );
    filtered.push(item);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // localStorage unavailable
  }
}

// ===== Cosmic Moment Banner =====

interface CosmicMomentProps {
  planetaryInfo: ReturnType<typeof getPlanetaryDayCharacteristics>;
  lunarPhase: string;
  currentZodiac: string;
  activePlanets: string[];
  domElements: Record<string, number>;
  isPersonalized: boolean;
  planetaryHour: string | null;
}

function CosmicMomentBanner({
  planetaryInfo,
  lunarPhase,
  currentZodiac,
  activePlanets,
  domElements,
  isPersonalized,
  planetaryHour,
}: CosmicMomentProps) {
  const dominantElement = Object.entries(domElements).sort(
    ([, a], [, b]) => b - a,
  )[0];

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider opacity-80">
          Current Cosmic Moment
        </h2>
        {isPersonalized && (
          <span className="px-2.5 py-1 bg-white/15 rounded-full text-xs font-medium backdrop-blur-sm">
            Birth Chart Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Planetary Day */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="text-xs opacity-70 mb-1">Planetary Day</div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{ELEMENT_ICONS[planetaryInfo.element] || "⚡"}</span>
            <div>
              <div className="font-bold text-sm">{planetaryInfo.planet}</div>
              <div className="text-xs opacity-70">{planetaryInfo.element}</div>
            </div>
          </div>
        </div>

        {/* Zodiac Season */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="text-xs opacity-70 mb-1">Sun Sign</div>
          <div className="font-bold text-sm capitalize">{currentZodiac}</div>
          <div className="text-xs opacity-70">{planetaryInfo.energy} energy</div>
        </div>

        {/* Lunar Phase */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="text-xs opacity-70 mb-1">Moon Phase</div>
          <div className="font-bold text-sm capitalize">
            {lunarPhase?.replace(/_/g, " ") || "Unknown"}
          </div>
          {planetaryHour && (
            <div className="text-xs opacity-70">{planetaryHour} hour</div>
          )}
        </div>

        {/* Dominant Element */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="text-xs opacity-70 mb-1">Dominant Element</div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{ELEMENT_ICONS[dominantElement?.[0]] || "⚡"}</span>
            <div>
              <div className="font-bold text-sm">{dominantElement?.[0] || "Balanced"}</div>
              <div className="text-xs opacity-70">
                {dominantElement ? `${Math.round(dominantElement[1] * 100)}%` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Planets */}
      {activePlanets.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs opacity-70">Active:</span>
          {activePlanets.slice(0, 6).map((planet) => (
            <span
              key={planet}
              className="px-2 py-0.5 bg-white/15 rounded-full text-xs font-medium"
            >
              {planet}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Add to Meal Planner Modal =====

interface AddToMealPlannerProps {
  recipe: any;
  onClose: () => void;
  onAdded: (day: string, meal: string) => void;
}

function AddToMealPlannerModal({ recipe, onClose, onAdded }: AddToMealPlannerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedMeal, setSelectedMeal] = useState<string>("dinner");

  const handleAdd = () => {
    addToMealPlannerQueue(recipe, selectedDay, selectedMeal);
    saveRecipeToStore(recipe);
    onAdded(DAYS_OF_WEEK[selectedDay], selectedMeal);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-1">Add to Meal Planner</h3>
        <p className="text-sm text-gray-500 mb-4 truncate">{recipe.name}</p>

        {/* Day Selection */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
            Day
          </label>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
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

        {/* Meal Type Selection */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
            Meal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TYPES.map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
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

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-700 hover:to-amber-600 shadow-md transition-all"
          >
            Add to {DAYS_OF_WEEK[selectedDay].slice(0, 3)} {selectedMeal}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Full Recipe Card =====

interface FullRecipeCardProps {
  recommendation: RecommendedMeal;
  index: number;
  total: number;
  isPersonalized: boolean;
  onAddToPlanner: (recipe: any) => void;
  onSave: (recipe: any) => void;
}

function FullRecipeCard({
  recommendation,
  index,
  total,
  isPersonalized,
  onAddToPlanner,
  onSave,
}: FullRecipeCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("ingredients");
  const recipe = recommendation.recipe;
  const displayScore = recommendation.personalizedScore ?? recommendation.score;
  const scorePercent = Math.round(displayScore * 100);

  const alchProps = (recipe as any).alchemicalProperties;
  const monicaOpt = (recipe as any).monicaOptimization;
  const seasonalAdapt = (recipe as any).seasonalAdaptation;
  const cuisineInteg = (recipe as any).cuisineIntegration;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 pb-4 bg-gradient-to-r from-gray-50 to-purple-50/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400 font-medium">
                {index + 1} / {total}
              </span>
              {recommendation.isPersonalized && recommendation.personalizationBoost && recommendation.personalizationBoost > 1.05 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                  Chart Aligned
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {recipe.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {recipe.cuisine && (
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold capitalize">
                  {recipe.cuisine}
                </span>
              )}
              {recommendation.mealType && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold capitalize">
                  {recommendation.mealType}
                </span>
              )}
              {(recipe.prepTime || recipe.timeToMake) && (
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  Prep: {recipe.prepTime || recipe.timeToMake}
                </span>
              )}
              {recipe.cookTime && (
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  Cook: {recipe.cookTime}
                </span>
              )}
              {recipe.numberOfServings && (
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {recipe.numberOfServings} servings
                </span>
              )}
            </div>
          </div>

          {/* Score Circle */}
          <div className="shrink-0">
            <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white shadow-lg ${
              scorePercent >= 80
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : scorePercent >= 60
                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                  : "bg-gradient-to-br from-amber-500 to-orange-500"
            }`}>
              <span className="text-xl font-black leading-none">{scorePercent}</span>
              <span className="text-[9px] opacity-80 font-medium">match</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {recipe.description}
          </p>
        )}
      </div>

      {/* Elemental & Alchemical Profile */}
      <div className="px-5 py-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          {/* Elemental Profile */}
          {recipe.elementalProperties && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Elemental Profile
              </div>
              <div className="space-y-1.5">
                {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
                  const val = recipe.elementalProperties?.[el] ?? 0;
                  const pct = Math.round(val * 100);
                  const colors = ELEMENT_COLORS[el];
                  return (
                    <div key={el} className="flex items-center gap-2">
                      <span className="text-xs w-4">{ELEMENT_ICONS[el]}</span>
                      <span className="text-[10px] text-gray-500 w-8">{el}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colors.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 w-7 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ESMS Profile */}
          {alchProps && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Alchemical (ESMS)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(["Spirit", "Essence", "Matter", "Substance"] as const).map((prop) => {
                  const val = alchProps[prop] ?? alchProps[prop.toLowerCase()] ?? 0;
                  const colors = ESMS_COLORS[prop];
                  return (
                    <div
                      key={prop}
                      className={`${colors.bg} ${colors.text} rounded-lg px-2 py-1.5 text-center`}
                    >
                      <div className="text-lg font-black leading-none">{typeof val === "number" ? val.toFixed(1) : val}</div>
                      <div className="text-[9px] font-semibold opacity-70">{prop}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="px-5 py-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-indigo-50 rounded-lg text-center">
            <div className="text-xs font-bold text-indigo-600">
              {Math.round(recommendation.dayAlignment * 100)}%
            </div>
            <div className="text-[9px] text-indigo-400">Day Alignment</div>
          </div>
          <div className="px-3 py-1.5 bg-purple-50 rounded-lg text-center">
            <div className="text-xs font-bold text-purple-600">
              {Math.round(recommendation.planetaryAlignment * 100)}%
            </div>
            <div className="text-[9px] text-purple-400">Planetary</div>
          </div>
          {recommendation.personalizationBoost != null && (
            <div className="px-3 py-1.5 bg-pink-50 rounded-lg text-center">
              <div className="text-xs font-bold text-pink-600">
                {recommendation.personalizationBoost > 1
                  ? `+${Math.round((recommendation.personalizationBoost - 1) * 100)}%`
                  : `${Math.round((recommendation.personalizationBoost - 1) * 100)}%`}
              </div>
              <div className="text-[9px] text-pink-400">Chart Boost</div>
            </div>
          )}
          {alchProps?.monicaConstant != null && (
            <div className="px-3 py-1.5 bg-amber-50 rounded-lg text-center">
              <div className="text-xs font-bold text-amber-600">
                {Number(alchProps.monicaConstant).toFixed(2)}
              </div>
              <div className="text-[9px] text-amber-400">Monica</div>
            </div>
          )}
          {alchProps?.kalchmConstant != null && (
            <div className="px-3 py-1.5 bg-teal-50 rounded-lg text-center">
              <div className="text-xs font-bold text-teal-600">
                {Number(alchProps.kalchmConstant).toFixed(3)}
              </div>
              <div className="text-[9px] text-teal-400">KAlchm</div>
            </div>
          )}
          {monicaOpt && (
            <div className="px-3 py-1.5 bg-green-50 rounded-lg text-center">
              <div className="text-xs font-bold text-green-600">
                {Math.round(monicaOpt.optimizationScore * 100)}%
              </div>
              <div className="text-[9px] text-green-400">Optimized</div>
            </div>
          )}
        </div>
      </div>

      {/* Why this recipe */}
      {recommendation.reasons.length > 0 && (
        <div className="mx-5 my-3 p-3 bg-purple-50/70 rounded-xl">
          <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1.5">
            Why This Recipe
          </div>
          <ul className="space-y-0.5">
            {recommendation.reasons.slice(0, 5).map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-purple-700">
                <span className="text-purple-400 mt-0.5 shrink-0">&#x2713;</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collapsible Sections */}
      <div className="border-t border-gray-100">
        {/* Ingredients Section */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("ingredients")}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-700">
                Ingredients ({recipe.ingredients.length})
              </span>
              <span className="text-gray-400 text-xs">
                {expandedSection === "ingredients" ? "\u25B2" : "\u25BC"}
              </span>
            </button>
            {expandedSection === "ingredients" && (
              <div className="px-5 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {recipe.ingredients.map((ing: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        ing.optional ? "bg-gray-50 text-gray-500" : "bg-green-50/50 text-gray-700"
                      }`}
                    >
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="font-medium">
                        {ing.amount} {ing.unit}
                      </span>
                      <span>{ing.name}</span>
                      {ing.optional && (
                        <span className="text-[10px] text-gray-400 italic ml-auto">(optional)</span>
                      )}
                      {ing.preparation && (
                        <span className="text-[10px] text-gray-400 ml-auto">{ing.preparation}</span>
                      )}
                    </div>
                  ))}
                </div>
                {recipe.ingredients.some((ing: any) => ing.substitutes?.length > 0) && (
                  <div className="mt-3 p-2.5 bg-amber-50 rounded-lg">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                      Substitutions
                    </div>
                    {recipe.ingredients
                      .filter((ing: any) => ing.substitutes?.length > 0)
                      .slice(0, 4)
                      .map((ing: any, idx: number) => (
                        <p key={idx} className="text-xs text-amber-700">
                          {ing.name} &rarr; {ing.substitutes.join(", ")}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions Section */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection("instructions")}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-700">
                Cooking Steps ({recipe.instructions.length})
              </span>
              <span className="text-gray-400 text-xs">
                {expandedSection === "instructions" ? "\u25B2" : "\u25BC"}
              </span>
            </button>
            {expandedSection === "instructions" && (
              <div className="px-5 pb-4">
                <ol className="space-y-3">
                  {recipe.instructions.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700 leading-relaxed pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Equipment & Cooking Methods */}
        {((recipe.equipmentNeeded && recipe.equipmentNeeded.length > 0) || (recipe.cookingMethod && recipe.cookingMethod.length > 0) || (recipe.cookingTechniques && recipe.cookingTechniques.length > 0)) && (
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection("equipment")}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-700">
                Equipment & Techniques
              </span>
              <span className="text-gray-400 text-xs">
                {expandedSection === "equipment" ? "\u25B2" : "\u25BC"}
              </span>
            </button>
            {expandedSection === "equipment" && (
              <div className="px-5 pb-4 space-y-2">
                {recipe.cookingMethod && recipe.cookingMethod.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Cooking Methods
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.cookingMethod.map((method: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-lg font-medium">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {recipe.cookingTechniques && recipe.cookingTechniques.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Techniques
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.cookingTechniques.map((tech: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {recipe.equipmentNeeded && recipe.equipmentNeeded.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Equipment Needed
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.equipmentNeeded.map((eq: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Seasonal Adaptation */}
        {seasonalAdapt?.seasonalIngredientSubstitutions?.length > 0 && (
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection("seasonal")}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-700">
                Seasonal Adaptation ({seasonalAdapt.currentSeason})
              </span>
              <span className="text-gray-400 text-xs">
                {expandedSection === "seasonal" ? "\u25B2" : "\u25BC"}
              </span>
            </button>
            {expandedSection === "seasonal" && (
              <div className="px-5 pb-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium capitalize">
                    {seasonalAdapt.currentSeason}
                  </span>
                  <span className="text-xs text-gray-500">
                    Seasonal Score: {Math.round(seasonalAdapt.seasonalScore * 100)}%
                  </span>
                </div>
                {seasonalAdapt.seasonalIngredientSubstitutions.map((sub: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <span className="font-medium">{sub.original}</span>
                    <span className="text-green-400">&rarr;</span>
                    <span className="font-medium">{sub.seasonal}</span>
                    <span className="text-green-500 ml-auto text-[10px]">{sub.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cultural Notes */}
        {cuisineInteg?.culturalNotes?.length > 0 && (
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection("cultural")}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-700">
                Cultural Notes & Variations
              </span>
              <span className="text-gray-400 text-xs">
                {expandedSection === "cultural" ? "\u25B2" : "\u25BC"}
              </span>
            </button>
            {expandedSection === "cultural" && (
              <div className="px-5 pb-4 space-y-2">
                {cuisineInteg.culturalNotes.map((note: string, i: number) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">{note}</p>
                ))}
                {cuisineInteg.traditionalVariations?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Traditional Variations
                    </div>
                    <ul className="space-y-0.5">
                      {cuisineInteg.traditionalVariations.map((v: string, i: number) => (
                        <li key={i} className="text-xs text-gray-600">&#x2022; {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Optimization Notes */}
        {monicaOpt?.planetaryTimingRecommendations?.length > 0 && (
          <div className="border-t border-gray-100">
            <button
              onClick={() => toggleSection("timing")}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-700">
                Planetary Timing Tips
              </span>
              <span className="text-gray-400 text-xs">
                {expandedSection === "timing" ? "\u25B2" : "\u25BC"}
              </span>
            </button>
            {expandedSection === "timing" && (
              <div className="px-5 pb-4">
                <ul className="space-y-1">
                  {monicaOpt.planetaryTimingRecommendations.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-purple-700">
                      <span className="text-purple-400 mt-0.5 shrink-0">&#x2605;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Dietary Info */}
        {(recipe.isVegetarian || recipe.isVegan || recipe.isGlutenFree || recipe.isDairyFree) && (
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {recipe.isVegan && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Vegan</span>
              )}
              {recipe.isVegetarian && !recipe.isVegan && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Vegetarian</span>
              )}
              {recipe.isGlutenFree && (
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Gluten-Free</span>
              )}
              {recipe.isDairyFree && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Dairy-Free</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
        <button
          onClick={() => onSave(recipe)}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          Save Recipe
        </button>
        <button
          onClick={() => onAddToPlanner(recipe)}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-all active:scale-[0.98]"
        >
          + Meal Planner
        </button>
      </div>
    </div>
  );
}

// ===== Recipe Carousel with Full Navigation =====

interface RecipeCarouselProps {
  suggestions: RecommendedMeal[];
  isLoading: boolean;
  isPersonalized: boolean;
  onAddToPlanner: (recipe: any) => void;
  onSave: (recipe: any) => void;
}

function RecipeCarousel({
  suggestions,
  isLoading,
  isPersonalized,
  onAddToPlanner,
  onSave,
}: RecipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset index when suggestions change
  useEffect(() => {
    setCurrentIndex(0);
  }, [suggestions]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(suggestions.length - 1, i + 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [suggestions.length]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const dist = touchStartX.current - touchEndX.current;
    if (dist > 50) setCurrentIndex((i) => Math.min(suggestions.length - 1, i + 1));
    else if (dist < -50) setCurrentIndex((i) => Math.max(0, i - 1));
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-lg">&#x2728;</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Consulting the cosmos...</p>
            <p className="text-xs text-gray-400">Aligning planetary energies with your palate</p>
          </div>
        </div>
        {/* Skeleton cards */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
          <div className="space-y-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full" />
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
        <span className="text-5xl block mb-4">&#x1F30C;</span>
        <p className="font-bold text-gray-700 text-lg">No recipes found</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your preferences or generate again</p>
      </div>
    );
  }

  const current = suggestions[currentIndex];
  if (!current) return null;

  return (
    <div
      ref={containerRef}
      className="space-y-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">
            {suggestions.length} Recipe{suggestions.length !== 1 ? "s" : ""} Generated
          </h3>
          {isPersonalized && (
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              Personalized
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="w-9 h-9 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-600 transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous recipe"
          >
            &#x2190;
          </button>
          <span className="text-sm font-semibold text-gray-500 min-w-[3rem] text-center">
            {currentIndex + 1} / {suggestions.length}
          </span>
          <button
            onClick={() => setCurrentIndex(Math.min(suggestions.length - 1, currentIndex + 1))}
            disabled={currentIndex === suggestions.length - 1}
            className="w-9 h-9 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-600 transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next recipe"
          >
            &#x2192;
          </button>
        </div>
      </div>

      {/* Recipe Card */}
      <FullRecipeCard
        recommendation={current}
        index={currentIndex}
        total={suggestions.length}
        isPersonalized={isPersonalized}
        onAddToPlanner={onAddToPlanner}
        onSave={onSave}
      />

      {/* Pagination dots */}
      {suggestions.length > 1 && (
        <div className="flex justify-center gap-1.5 py-1">
          {suggestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all ${
                idx === currentIndex
                  ? "w-7 h-2.5 bg-purple-500"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to recipe ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation hint */}
      <p className="text-center text-xs text-gray-400">
        Swipe, use arrow keys, or click arrows to browse {suggestions.length} recipes
      </p>
    </div>
  );
}

// ===== Quick Generate Bar =====

interface QuickGenerateBarProps {
  onGenerate: (mealType: MealType) => void;
  onGenerateAll: () => void;
  isGenerating: boolean;
}

function QuickGenerateBar({ onGenerate, onGenerateAll, isGenerating }: QuickGenerateBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-gray-500 mr-1">Quick:</span>
      {MEAL_TYPES.map((meal) => (
        <button
          key={meal}
          onClick={() => onGenerate(meal)}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed capitalize"
        >
          {meal}
        </button>
      ))}
      <button
        onClick={onGenerateAll}
        disabled={isGenerating}
        className="px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:from-purple-700 hover:to-amber-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        All Meals
      </button>
    </div>
  );
}

// ===== Main Page =====

export default function RecipeGeneratorPage() {
  const astroState = useAstrologicalState();
  const { currentUser } = useUser();
  const builder = useRecipeBuilder();

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<RecommendedMeal[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [plannerRecipe, setPlannerRecipe] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const hasAutoGenerated = useRef(false);

  // Current day
  const currentDay = useMemo(() => new Date().getDay() as DayOfWeek, []);
  const planetaryDayInfo = useMemo(() => getPlanetaryDayCharacteristics(currentDay), [currentDay]);
  const isPersonalized = !!currentUser?.natalChart;

  // Astrological state
  const convertedAstroState: AstrologicalState = useMemo(
    () => ({
      currentZodiac: astroState.currentZodiac || "aries",
      lunarPhase: astroState.lunarPhase || "full",
      activePlanets: astroState.activePlanets || [],
      domElements: astroState.domElements || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      currentPlanetaryHour: astroState.currentPlanetaryHour || undefined,
    }),
    [astroState],
  );

  // User personalization
  const userContext: UserPersonalizationContext | undefined = useMemo(() => {
    if (!currentUser?.natalChart) return undefined;
    return {
      natalChart: currentUser.natalChart,
      prioritizeHarmony: true,
      stats: currentUser.stats,
    };
  }, [currentUser]);

  // Save recipes to store
  useEffect(() => {
    suggestions.forEach((rec) => {
      if (rec.recipe?.id) saveRecipeToStore(rec.recipe);
    });
  }, [suggestions]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Generate recipes
  const generateRecipes = useCallback(
    async (mealTypes: MealType[]) => {
      setIsGenerating(true);
      try {
        const recommendations = await generateDayRecommendations(
          currentDay,
          convertedAstroState,
          {
            mealTypes,
            dietaryRestrictions: [
              ...builder.dietaryPreferences,
              ...builder.allergies,
            ],
            preferredCuisines: builder.selectedCuisines,
            excludeIngredients: [],
            requiredIngredients: builder.selectedIngredients.map((i) => i.name),
            preferredCookingMethods: builder.selectedCookingMethods,
            flavorPreferences: builder.flavors,
            useCurrentPlanetary: true,
            maxRecipesPerMeal: 8,
            userContext,
          },
        );
        const deduped = deduplicateRecipes(recommendations);
        setSuggestions(deduped);
        setHasGenerated(true);
        logger.info(`Generated ${deduped.length} unique recipes`);
      } catch (err) {
        logger.error("Recipe generation failed:", err as any);
        setSuggestions([]);
        setHasGenerated(true);
      } finally {
        setIsGenerating(false);
      }
    },
    [currentDay, convertedAstroState, builder, userContext],
  );

  // Auto-generate on mount (once astro state is ready)
  useEffect(() => {
    if (!hasAutoGenerated.current && astroState.isReady && !isGenerating && !hasGenerated) {
      hasAutoGenerated.current = true;
      // Determine smart meal type based on time of day
      const hour = new Date().getHours();
      let smartMealTypes: MealType[];
      if (hour < 10) smartMealTypes = ["breakfast", "snack"];
      else if (hour < 14) smartMealTypes = ["lunch", "snack"];
      else if (hour < 18) smartMealTypes = ["snack", "dinner"];
      else smartMealTypes = ["dinner", "snack"];

      generateRecipes(smartMealTypes);
    }
  }, [astroState.isReady, isGenerating, hasGenerated, generateRecipes]);

  const handleQuickGenerate = useCallback(
    (mealType: MealType) => {
      generateRecipes([mealType]);
    },
    [generateRecipes],
  );

  const handleGenerateAll = useCallback(() => {
    generateRecipes(["breakfast", "lunch", "dinner", "snack"]);
  }, [generateRecipes]);

  const handleBuilderGenerate = useCallback(() => {
    const mealTypes: MealType[] = builder.mealType
      ? [builder.mealType.toLowerCase() as MealType]
      : ["breakfast", "lunch", "dinner", "snack"];
    generateRecipes(mealTypes);
  }, [builder.mealType, generateRecipes]);

  const handleSave = useCallback(
    (recipe: any) => {
      saveRecipeToStore(recipe);
      setToast(`Saved: ${recipe.name}`);
    },
    [],
  );

  const handleAddedToPlanner = useCallback(
    (day: string, meal: string) => {
      setPlannerRecipe(null);
      setToast(`Added to ${day} ${meal}!`);
    },
    [],
  );

  const canBuilderGenerate = builder.totalItems > 0 || builder.mealType !== null;

  return (
    <PremiumGate feature="cosmicRecipeAccess">
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/40 to-orange-50/40">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-5">
        {/* Header */}
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

        {/* Cosmic Moment Banner */}
        <CosmicMomentBanner
          planetaryInfo={planetaryDayInfo}
          lunarPhase={astroState.lunarPhase || ""}
          currentZodiac={astroState.currentZodiac || ""}
          activePlanets={astroState.activePlanets || []}
          domElements={astroState.domElements || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }}
          isPersonalized={isPersonalized}
          planetaryHour={astroState.currentPlanetaryHour || null}
        />

        {/* Quick Generate + Builder Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <QuickGenerateBar
              onGenerate={handleQuickGenerate}
              onGenerateAll={handleGenerateAll}
              isGenerating={isGenerating}
            />
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                showBuilder
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-purple-600 border-purple-200 hover:bg-purple-50"
              }`}
            >
              {showBuilder ? "Hide Builder" : "Customize"}
            </button>
          </div>
        </div>

        {/* Builder Panel (collapsible) */}
        {showBuilder && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <RecipeBuilderPanel />
            <button
              onClick={handleBuilderGenerate}
              disabled={!canBuilderGenerate || isGenerating}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                canBuilderGenerate && !isGenerating
                  ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:from-purple-700 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Generate with Preferences
                  {isPersonalized && (
                    <span className="text-xs opacity-80 font-normal">(personalized)</span>
                  )}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Recipe Results Carousel */}
        {(hasGenerated || isGenerating) && (
          <RecipeCarousel
            suggestions={suggestions}
            isLoading={isGenerating}
            isPersonalized={isPersonalized}
            onAddToPlanner={(recipe) => setPlannerRecipe(recipe)}
            onSave={handleSave}
          />
        )}

        {/* Regenerate button */}
        {hasGenerated && !isGenerating && suggestions.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleGenerateAll}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-purple-600 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              Regenerate All Meals
            </button>
          </div>
        )}

        {/* Personalization nudge */}
        {!isPersonalized && !isGenerating && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">&#x1F52E;</span>
              <div>
                <p className="text-sm font-semibold text-purple-800">
                  Unlock Personalized Recipes
                </p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Sign in and add your birth chart for recipes perfectly aligned
                  with your cosmic constitution. Get chart-boosted scores and
                  transit-aware recommendations.
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
        )}
      </div>

      {/* Meal Planner Modal */}
      {plannerRecipe && (
        <AddToMealPlannerModal
          recipe={plannerRecipe}
          onClose={() => setPlannerRecipe(null)}
          onAdded={handleAddedToPlanner}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-2xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}
    </div>
    </PremiumGate>
  );
}
