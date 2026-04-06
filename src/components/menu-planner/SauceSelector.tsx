"use client";

/**
 * Sauce Selector Component
 * Modal for selecting and adding sauces to meal slots
 *
 * @file src/components/menu-planner/SauceSelector.tsx
 */

import React, { useState, useMemo } from "react";
import { allSauces } from "@/data/sauces";
import type { Sauce } from "@/data/sauces";
import type { ElementalProperties } from "@/types/recipe";
import { recommendSauces } from "@/utils/cuisine/intelligentSauceRecommender";
import type { Sauce as RecommenderSauce } from "@/utils/cuisine/intelligentSauceRecommender";
import { scaleSauceIngredients, parseYieldToServings } from "@/utils/sauceScaling";

interface SauceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSauce: (sauceId: string, servings?: number) => void;
  recipeElementalProperties?: ElementalProperties;
  recipeAlchemicalProperties?: { Spirit: number; Essence: number; Matter: number; Substance: number };
}

type TabMode = "recommended" | "all";
type CuisineFilter = "all" | "Italian" | "Mexican" | "Thai" | "French" | "Japanese";

function SauceCard({
  sauceId,
  sauce,
  compatibilityScore,
  onSelect,
}: {
  sauceId: string;
  sauce: Sauce;
  compatibilityScore?: number;
  onSelect: (sauceId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  const scaledIngredients = useMemo(() => {
    if (!sauce.ingredients) return [];
    return scaleSauceIngredients(sauce.ingredients, scaleMultiplier);
  }, [sauce.ingredients, scaleMultiplier]);

  const _baseServings = sauce.yield ? parseYieldToServings(sauce.yield) : 1;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-slate-800 truncate">{sauce.name}</h4>
          {sauce.cuisine && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {sauce.cuisine}
            </span>
          )}
        </div>
        {compatibilityScore !== undefined && (
          <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded ml-2 shrink-0">
            {Math.round(compatibilityScore * 100)}%
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{sauce.description}</p>

      {/* Key Ingredients */}
      <div className="flex flex-wrap gap-1 mb-2">
        {sauce.keyIngredients.slice(0, 4).map((ing, i) => (
          <span key={i} className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
            {ing}
          </span>
        ))}
      </div>

      {/* Nutritional Summary */}
      {sauce.nutritionalProfile && (
        <div className="flex gap-3 text-[10px] text-slate-500 mb-2">
          <span>{sauce.nutritionalProfile.calories} cal</span>
          <span>{sauce.nutritionalProfile.protein}g pro</span>
          <span>{sauce.nutritionalProfile.fat}g fat</span>
          <span>{sauce.nutritionalProfile.carbs}g carb</span>
          {sauce.nutritionalProfile.servingSize && (
            <span className="text-slate-400">per {sauce.nutritionalProfile.servingSize}</span>
          )}
        </div>
      )}

      {/* Difficulty & Timing */}
      <div className="flex gap-2 text-[10px] text-slate-400 mb-3">
        {sauce.difficulty && <span>{sauce.difficulty}</span>}
        {sauce.prepTime && <span>Prep: {sauce.prepTime}</span>}
        {sauce.cookTime && <span>Cook: {sauce.cookTime}</span>}
      </div>

      {/* Batch Scaling */}
      {sauce.ingredients && sauce.ingredients.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
            <span className="font-medium">Yield:</span>
            <span>{sauce.yield || "1 serving"}</span>
            <span className="text-slate-400">|</span>
            <span className="font-medium">Scale:</span>
            {[1, 2, 3].map((mult) => (
              <button
                key={mult}
                onClick={(e) => { e.stopPropagation(); setScaleMultiplier(mult); }}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  scaleMultiplier === mult
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      {expanded && sauce.ingredients && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-600 mb-1">
            Ingredients ({scaleMultiplier}x):
          </p>
          <ul className="text-[10px] text-slate-500 space-y-0.5 max-h-32 overflow-y-auto bg-slate-50 rounded p-2">
            {scaledIngredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-1">
                <span className="text-amber-500">-</span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
          {sauce.preparationSteps && sauce.preparationSteps.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-slate-600 mb-1">Quick Steps:</p>
              <ol className="text-[10px] text-slate-500 list-decimal list-inside space-y-0.5">
                {sauce.preparationSteps.slice(0, 3).map((step, i) => (
                  <li key={i} className="line-clamp-1">{step}</li>
                ))}
                {sauce.preparationSteps.length > 3 && (
                  <li className="text-amber-600 list-none">+{sauce.preparationSteps.length - 3} more steps...</li>
                )}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-slate-400 hover:text-slate-600"
        >
          {expanded ? "Less" : "More details"}
        </button>
        <button
          onClick={() => onSelect(sauceId)}
          className="px-3 py-1 text-xs font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          Add Sauce
        </button>
      </div>
    </div>
  );
}

export default function SauceSelector({
  isOpen,
  onClose,
  onSelectSauce,
  recipeElementalProperties,
  recipeAlchemicalProperties,
}: SauceSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>("all");

  // Convert sauces to recommender format
  const availableSauces = useMemo(() => {
    return Object.entries(allSauces).map(([id, s]) => ({
      id,
      name: s.name,
      description: s.description,
      keyIngredients: s.keyIngredients,
      elementalProperties: s.elementalProperties,
      alchemicalProperties: s.alchemicalProperties,
      thermodynamicProperties: s.thermodynamicProperties,
      flavorTags: s.astrologicalInfluences,
      cuisineAssociations: s.cuisine ? [s.cuisine] : undefined,
      nutritionalProfile: s.nutritionalProfile,
    })) as RecommenderSauce[];
  }, []);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!recipeElementalProperties) return [];
    return recommendSauces(
      {
        targetElementalProperties: recipeElementalProperties,
        targetAlchemicalProperties: recipeAlchemicalProperties,
        sauceRole: "complement",
        maxRecommendations: 12,
        minCompatibilityThreshold: 0.1,
      },
      availableSauces,
    );
  }, [recipeElementalProperties, recipeAlchemicalProperties, availableSauces]);

  // Build recommendation score map
  const scoreMap = useMemo(() => {
    const map = new Map<string, number>();
    recommendations.forEach((rec) => {
      map.set(rec.sauce.id, rec.compatibilityScore);
    });
    return map;
  }, [recommendations]);

  // Filter sauces for the "All" tab
  const filteredSauces = useMemo(() => {
    return Object.entries(allSauces).filter(([_id, sauce]) => {
      if (cuisineFilter !== "all" && sauce.cuisine !== cuisineFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          sauce.name.toLowerCase().includes(q) ||
          sauce.keyIngredients.some((ing) => ing.toLowerCase().includes(q)) ||
          (sauce.cuisine && sauce.cuisine.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [searchQuery, cuisineFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Select a Sauce</h2>
            <p className="text-xs text-slate-500">Add a sauce to enhance your meal</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            x
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 flex items-center gap-4">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "recommended"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            All Sauces ({Object.keys(allSauces).length})
          </button>

          {/* Search & Filter (All tab only) */}
          {activeTab === "all" && (
            <div className="flex-1 flex items-center gap-2 ml-4">
              <input
                type="text"
                placeholder="Search sauces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <select
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value as CuisineFilter)}
                className="px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Cuisines</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Thai">Thai</option>
                <option value="French">French</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "recommended" ? (
            recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec) => (
                  <SauceCard
                    key={rec.sauce.id}
                    sauceId={rec.sauce.id}
                    sauce={allSauces[rec.sauce.id]}
                    compatibilityScore={rec.compatibilityScore}
                    onSelect={onSelectSauce}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">No recipe selected for this meal slot.</p>
                <p className="text-xs mt-1">
                  Add a recipe first to get personalized sauce recommendations, or browse all sauces.
                </p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSauces.map(([id, sauce]) => (
                <SauceCard
                  key={id}
                  sauceId={id}
                  sauce={sauce}
                  compatibilityScore={scoreMap.get(id)}
                  onSelect={onSelectSauce}
                />
              ))}
              {filteredSauces.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-500 text-sm">
                  No sauces match your search criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
