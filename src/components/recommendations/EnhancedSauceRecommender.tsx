"use client";

import React, { useState, useMemo, useCallback } from "react";
import { allSauces } from "@/data/sauces";
import type { Sauce as SauceData } from "@/data/sauces";
import type { ElementalProperties } from "@/types/recipe";
import type { Sauce } from "@/utils/cuisine/intelligentSauceRecommender";
import { recommendSauces } from "@/utils/cuisine/intelligentSauceRecommender";
import { scaleSauceIngredients, parseYieldToServings } from "@/utils/sauceScaling";

type InputMode = "manual" | "cuisine";
type CuisineFilter = "all" | "Italian" | "Mexican" | "Thai" | "French" | "Japanese";
type SauceRole = "complement" | "contrast" | "enhance" | "balance";

// Cuisine elemental profiles for quick selection
const CUISINE_ELEMENTAL_PROFILES: Record<string, { elemental: ElementalProperties; alchemical: { Spirit: number; Essence: number; Matter: number; Substance: number } }> = {
  Italian: { elemental: { Fire: 0.3, Water: 0.2, Earth: 0.35, Air: 0.15 }, alchemical: { Spirit: 3.5, Essence: 4.2, Matter: 4.5, Substance: 3.8 } },
  Mexican: { elemental: { Fire: 0.45, Water: 0.15, Earth: 0.3, Air: 0.1 }, alchemical: { Spirit: 4.0, Essence: 5.0, Matter: 3.8, Substance: 3.5 } },
  Thai: { elemental: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 }, alchemical: { Spirit: 4.5, Essence: 4.8, Matter: 3.5, Substance: 3.2 } },
  French: { elemental: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 }, alchemical: { Spirit: 3.0, Essence: 4.0, Matter: 5.0, Substance: 4.8 } },
  Japanese: { elemental: { Fire: 0.15, Water: 0.4, Earth: 0.3, Air: 0.15 }, alchemical: { Spirit: 3.8, Essence: 4.5, Matter: 4.0, Substance: 4.2 } },
  Indian: { elemental: { Fire: 0.45, Earth: 0.25, Water: 0.15, Air: 0.15 }, alchemical: { Spirit: 4.2, Essence: 5.5, Matter: 4.0, Substance: 3.5 } },
  Chinese: { elemental: { Fire: 0.3, Water: 0.3, Earth: 0.25, Air: 0.15 }, alchemical: { Spirit: 3.8, Essence: 4.5, Matter: 4.2, Substance: 4.0 } },
};

function SauceResultCard({
  rec,
  sauceData,
}: {
  rec: { sauce: Sauce; compatibilityScore: number; reason: string; enhancement: { thermalEffect?: string; powerBoost?: number } };
  sauceData?: SauceData;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  const scaledIngredients = useMemo(() => {
    if (!sauceData?.ingredients) return [];
    return scaleSauceIngredients(sauceData.ingredients, scaleMultiplier);
  }, [sauceData?.ingredients, scaleMultiplier]);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-100 to-transparent -z-10" />

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-800 leading-tight">
            {rec.sauce.name}
          </h3>
          {sauceData?.cuisine && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-1 inline-block">
              {sauceData.cuisine}
            </span>
          )}
        </div>
        <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md ml-2">
          {(rec.compatibilityScore * 100).toFixed(0)}% Match
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
        {rec.sauce.description}
      </p>

      {/* Nutritional Summary */}
      {sauceData?.nutritionalProfile && (
        <div className="flex gap-3 text-[10px] text-slate-500 mb-3 bg-slate-50 rounded-lg px-3 py-1.5">
          <span className="font-medium">{sauceData.nutritionalProfile.calories} cal</span>
          <span>{sauceData.nutritionalProfile.protein}g protein</span>
          <span>{sauceData.nutritionalProfile.fat}g fat</span>
          <span>{sauceData.nutritionalProfile.carbs}g carbs</span>
          {sauceData.nutritionalProfile.servingSize && (
            <span className="text-slate-400 ml-auto">per {sauceData.nutritionalProfile.servingSize}</span>
          )}
        </div>
      )}

      {/* Key Ingredients */}
      <div className="flex flex-wrap gap-1 mb-3">
        {rec.sauce.keyIngredients?.slice(0, 4).map((ing, i) => (
          <span key={i} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded">
            {ing}
          </span>
        ))}
      </div>

      {/* Metadata badges */}
      {sauceData && (
        <div className="flex gap-2 text-[10px] text-slate-400 mb-3">
          {sauceData.difficulty && (
            <span className="bg-slate-50 px-1.5 py-0.5 rounded">{sauceData.difficulty}</span>
          )}
          {sauceData.prepTime && (
            <span className="bg-slate-50 px-1.5 py-0.5 rounded">Prep: {sauceData.prepTime}</span>
          )}
          {sauceData.cookTime && (
            <span className="bg-slate-50 px-1.5 py-0.5 rounded">Cook: {sauceData.cookTime}</span>
          )}
        </div>
      )}

      {/* Alchemical Reasoning */}
      <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100 mb-3">
        <div className="font-medium text-slate-700 mb-1">Alchemical Reasoning</div>
        <p className="text-slate-600 italic">&quot;{rec.reason}&quot;</p>

        {rec.enhancement.thermalEffect && (
          <div className="mt-2 flex items-center text-slate-500">
            <span className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
            Thermal Effect: <span className="font-medium ml-1 text-slate-700 capitalize">{rec.enhancement.thermalEffect}</span>
          </div>
        )}
      </div>

      {/* Batch Scaling */}
      {sauceData?.ingredients && sauceData.ingredients.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
          <span className="font-medium">Scale:</span>
          {[1, 2, 3].map((mult) => (
            <button
              key={mult}
              onClick={() => setScaleMultiplier(mult)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                scaleMultiplier === mult
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mult}x
            </button>
          ))}
          {sauceData.yield && (
            <span className="text-slate-400 text-[10px] ml-1">
              ({scaleMultiplier}x = ~{Math.round(parseYieldToServings(sauceData.yield) * scaleMultiplier)} servings)
            </span>
          )}
        </div>
      )}

      {/* Expandable Ingredients */}
      {expanded && sauceData?.ingredients && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-600 mb-1">
            Ingredients ({scaleMultiplier}x):
          </p>
          <ul className="text-[10px] text-slate-500 space-y-0.5 max-h-40 overflow-y-auto bg-slate-50 rounded p-2">
            {scaledIngredients.map((ing, i) => (
              <li key={i}>- {ing}</li>
            ))}
          </ul>
          {sauceData.storageInstructions && (
            <p className="text-[10px] text-slate-400 mt-2">
              Storage: {sauceData.storageInstructions}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[10px] text-slate-400 hover:text-slate-600 mt-1"
      >
        {expanded ? "Show less" : "Show ingredients & details"}
      </button>
    </div>
  );
}

export default function EnhancedSauceRecommender() {
  const [selectedRole, setSelectedRole] = useState<SauceRole>("complement");
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("Italian");
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>("all");

  // Manual elemental sliders
  const [manualElementals, setManualElementals] = useState<ElementalProperties>({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  });

  const updateManualElemental = useCallback((element: keyof ElementalProperties, value: number) => {
    setManualElementals((prev) => {
      const updated = { ...prev, [element]: value };
      // Normalize to sum to 1
      const total = Object.values(updated).reduce((s, v) => s + v, 0);
      if (total > 0) {
        return {
          Fire: updated.Fire / total,
          Water: updated.Water / total,
          Earth: updated.Earth / total,
          Air: updated.Air / total,
        };
      }
      return updated;
    });
  }, []);

  // Determine target properties based on input mode
  const targetProperties = useMemo(() => {
    if (inputMode === "cuisine" && CUISINE_ELEMENTAL_PROFILES[selectedCuisine]) {
      const profile = CUISINE_ELEMENTAL_PROFILES[selectedCuisine];
      return {
        elemental: profile.elemental,
        alchemical: profile.alchemical,
        thermodynamic: { heat: 0.05, entropy: 0.2, reactivity: 1.5, gregsEnergy: -0.6 },
      };
    }
    // Manual mode
    return {
      elemental: manualElementals,
      alchemical: { Spirit: 3.0, Essence: 4.5, Matter: 5.0, Substance: 4.5 },
      thermodynamic: { heat: 0.05, entropy: 0.2, reactivity: 1.5, gregsEnergy: -0.6 },
    };
  }, [inputMode, selectedCuisine, manualElementals]);

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
    })) as Sauce[];
  }, []);

  // Get recommendations
  const recommendations = useMemo(() => {
    let results = recommendSauces(
      {
        targetElementalProperties: targetProperties.elemental,
        targetAlchemicalProperties: targetProperties.alchemical,
        targetThermodynamicProperties: targetProperties.thermodynamic,
        sauceRole: selectedRole,
        maxRecommendations: 12,
        minCompatibilityThreshold: 0.1,
      },
      availableSauces,
    );

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.sauce.name.toLowerCase().includes(q) ||
          r.sauce.keyIngredients?.some((ing) => ing.toLowerCase().includes(q)),
      );
    }

    // Apply cuisine filter
    if (cuisineFilter !== "all") {
      results = results.filter((r) => {
        const sauceData = allSauces[r.sauce.id];
        return sauceData?.cuisine === cuisineFilter;
      });
    }

    return results;
  }, [availableSauces, selectedRole, targetProperties, searchQuery, cuisineFilter]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <h2 className="text-2xl font-bold text-slate-800">Intelligent Sauce Recommender</h2>
        <p className="text-slate-600 mt-1 text-sm">
          Find the perfect sauce using alchemical properties, elemental harmony, and nutritional analysis.
        </p>
      </div>

      <div className="p-6">
        {/* Input Mode Selector */}
        <div className="mb-6">
          <div className="text-sm font-medium text-slate-700 mb-2 block">Target Profile</div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode("cuisine")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputMode === "cuisine"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              By Cuisine
            </button>
            <button
              onClick={() => setInputMode("manual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputMode === "manual"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Manual Elements
            </button>
          </div>

          {/* Cuisine Selector */}
          {inputMode === "cuisine" && (
            <div className="flex flex-wrap gap-2">
              {Object.keys(CUISINE_ELEMENTAL_PROFILES).map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCuisine === cuisine
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          )}

          {/* Manual Elemental Sliders */}
          {inputMode === "manual" && (
            <div className="grid grid-cols-2 gap-3">
              {(["Fire", "Water", "Earth", "Air"] as const).map((element) => {
                const colors: Record<string, string> = {
                  Fire: "accent-orange-500",
                  Water: "accent-blue-500",
                  Earth: "accent-amber-600",
                  Air: "accent-sky-400",
                };
                return (
                  <div key={element} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 w-10">{element}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(manualElementals[element] * 100)}
                      onChange={(e) => updateManualElemental(element, parseInt(e.target.value, 10) / 100)}
                      className={`flex-1 h-1.5 ${colors[element]}`}
                    />
                    <span className="text-[10px] text-slate-400 w-8 text-right">
                      {Math.round(manualElementals[element] * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Role Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["complement", "contrast", "enhance", "balance"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedRole === role
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search sauces by name or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value as CuisineFilter)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Cuisines</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Thai">Thai</option>
            <option value="French">French</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-xs text-slate-500 mb-4">
          {recommendations.length} sauce{recommendations.length !== 1 ? "s" : ""} found
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <SauceResultCard
              key={rec.sauce.id}
              rec={rec}
              sauceData={allSauces[rec.sauce.id]}
            />
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No sauces found matching the current criteria.
          </div>
        )}
      </div>
    </div>
  );
}
