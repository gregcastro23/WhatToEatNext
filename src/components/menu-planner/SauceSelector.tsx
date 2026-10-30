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
import { roundedCalories } from "@/utils/roundedCalories";
import {
  scaleSauceIngredients,
  parseYieldToServings,
} from "@/utils/sauceScaling";
import { looseIncludes } from "@/utils/searchNormalize";
import Sheet from "./shell/Sheet";

interface SauceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSauce: (sauceId: string, servings?: number) => void;
  recipeElementalProperties?: ElementalProperties;
  recipeAlchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
}

type TabMode = "recommended" | "all";
type CuisineFilter =
  | "all"
  | "Italian"
  | "Mexican"
  | "Thai"
  | "French"
  | "Japanese";

const VALID_CUISINE_FILTERS: ReadonlySet<string> = new Set([
  "all",
  "Italian",
  "Mexican",
  "Thai",
  "French",
  "Japanese",
]);

function isCuisineFilter(val: string): val is CuisineFilter {
  return VALID_CUISINE_FILTERS.has(val);
}

function SauceCard({
  sauceId,
  sauce,
  compatibilityScore,
  onSelect,
}: {
  sauceId: string;
  sauce: Sauce;
  compatibilityScore?: number;
  onSelect: (sauceId: string, servings?: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  const scaledIngredients = useMemo(() => {
    if (!sauce.ingredients) return [];
    return scaleSauceIngredients(sauce.ingredients, scaleMultiplier);
  }, [sauce.ingredients, scaleMultiplier]);

  const _baseServings = sauce.yield ? parseYieldToServings(sauce.yield) : 1;

  return (
    <div className="bg-surface-container rounded-lg border border-muted p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-primary truncate">
            {sauce.name}
          </h4>
          {sauce.cuisine && (
            <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded">
              {sauce.cuisine}
            </span>
          )}
        </div>
        {compatibilityScore !== undefined && (
          <div className="bg-gold-accent/20 text-gold-accent text-xs font-bold px-2 py-0.5 rounded ml-2 shrink-0">
            {Math.round(compatibilityScore * 100)}%
          </div>
        )}
      </div>

      <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
        {sauce.description}
      </p>

      {/* Key Ingredients */}
      <div className="flex flex-wrap gap-1 mb-2">
        {sauce.keyIngredients.slice(0, 4).map((ing, i) => (
          <span
            key={i}
            className="text-[10px] bg-gold-accent/10 text-gold-accent px-1.5 py-0.5 rounded"
          >
            {ing}
          </span>
        ))}
      </div>

      {/* Nutritional Summary */}
      {sauce.nutritionalProfile && (
        <div className="flex gap-3 text-[10px] text-on-surface-variant mb-2">
          <span>
            {roundedCalories(sauce.nutritionalProfile.calories) ?? "—"} cal
          </span>
          <span>{sauce.nutritionalProfile.protein}g pro</span>
          <span>{sauce.nutritionalProfile.fat}g fat</span>
          <span>{sauce.nutritionalProfile.carbs}g carb</span>
          {sauce.nutritionalProfile.servingSize && (
            <span className="text-on-surface-variant">
              per {sauce.nutritionalProfile.servingSize}
            </span>
          )}
        </div>
      )}

      {/* Difficulty & Timing */}
      <div className="flex gap-2 text-[10px] text-on-surface-variant mb-3">
        {sauce.difficulty && <span>{sauce.difficulty}</span>}
        {sauce.prepTime && <span>Prep: {sauce.prepTime}</span>}
        {sauce.cookTime && <span>Cook: {sauce.cookTime}</span>}
      </div>

      {/* Batch Scaling */}
      {sauce.ingredients && sauce.ingredients.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-on-surface mb-1">
            <span className="font-medium">Yield:</span>
            <span>{sauce.yield ?? "1 serving"}</span>
            <span className="text-on-surface-variant">|</span>
            <span className="font-medium">Scale:</span>
            {[1, 2, 3].map((mult) => (
              <button
                key={mult}
                onClick={(e) => {
                  e.stopPropagation();
                  setScaleMultiplier(mult);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  scaleMultiplier === mult
                    ? "bg-active-violet text-white"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
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
        <div className="mt-2 pt-2 border-t border-muted">
          <p className="text-xs font-medium text-on-surface mb-1">
            Ingredients ({scaleMultiplier}x):
          </p>
          <ul className="text-[10px] text-on-surface-variant space-y-0.5 max-h-32 overflow-y-auto bg-surface-container-low rounded p-2">
            {scaledIngredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-1">
                <span className="text-gold-accent">-</span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
          {sauce.preparationSteps && sauce.preparationSteps.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-on-surface mb-1">
                Quick Steps:
              </p>
              <ol className="text-[10px] text-on-surface-variant list-decimal list-inside space-y-0.5">
                {sauce.preparationSteps.slice(0, 3).map((step, i) => (
                  <li key={i} className="line-clamp-1">
                    {step}
                  </li>
                ))}
                {sauce.preparationSteps.length > 3 && (
                  <li className="text-gold-accent list-none">
                    +{sauce.preparationSteps.length - 3} more steps...
                  </li>
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
          className="text-[10px] text-on-surface-variant hover:text-on-surface"
        >
          {expanded ? "Less" : "More details"}
        </button>
        <button
          onClick={() => onSelect(sauceId)}
          className="px-3 py-1 text-xs font-medium bg-active-violet text-white rounded-md hover:bg-active-violet/80 transition-colors"
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
  const availableSauces = useMemo(
    () =>
      Object.entries(allSauces).map(([id, s]) => ({
        id,
        name: s.name,
        description: s.description,
        keyIngredients: s.keyIngredients,
        elementalProperties: s.elementalProperties,
        ...(s.alchemicalProperties !== undefined
          ? { alchemicalProperties: s.alchemicalProperties }
          : {}),
        ...(s.thermodynamicProperties !== undefined
          ? { thermodynamicProperties: s.thermodynamicProperties }
          : {}),
        flavorTags: s.astrologicalInfluences,
        ...(s.cuisine ? { cuisineAssociations: [s.cuisine] } : {}),
        ...(s.nutritionalProfile !== undefined
          ? { nutritionalProfile: s.nutritionalProfile }
          : {}),
      })),
    [],
  );

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!recipeElementalProperties) return [];
    return recommendSauces(
      {
        targetElementalProperties: recipeElementalProperties,
        ...(recipeAlchemicalProperties !== undefined
          ? { targetAlchemicalProperties: recipeAlchemicalProperties }
          : {}),
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
  const filteredSauces = useMemo(
    () =>
      Object.entries(allSauces).filter(([_id, sauce]) => {
        if (cuisineFilter !== "all" && sauce.cuisine !== cuisineFilter)
          return false;
        if (searchQuery) {
          return (
            looseIncludes(sauce.name, searchQuery) ||
            sauce.keyIngredients.some((ing) =>
              looseIncludes(ing, searchQuery),
            ) ||
            looseIncludes(sauce.cuisine, searchQuery)
          );
        }
        return true;
      }),
    [searchQuery, cuisineFilter],
  );

  if (!isOpen) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Select a Sauce"
      description="Add a sauce to enhance your meal"
      width="max-w-3xl"
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      {/* Tabs */}
      <div className="px-4 pt-3 flex flex-wrap items-center gap-4">
        <button
          onClick={() => setActiveTab("recommended")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "recommended"
              ? "border-active-violet text-gold-accent"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          Recommended
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-active-violet text-gold-accent"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
        >
          All Sauces ({Object.keys(allSauces).length})
        </button>

        {/* Search & Filter (All tab only) */}
        {activeTab === "all" && (
          <div className="flex w-full flex-wrap items-center gap-2 pb-2">
            <input
              type="text"
              placeholder="Search sauces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search sauces"
              className="min-w-0 flex-1 px-3 py-1 text-sm border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-active-violet"
            />
            <select
              aria-label="Sauce cuisine"
              value={cuisineFilter}
              onChange={(e) => {
                const val = e.target.value;
                if (isCuisineFilter(val)) {
                  setCuisineFilter(val);
                }
              }}
              className="px-2 py-1 text-sm border border-muted rounded-md focus:outline-none focus:ring-1 focus:ring-active-violet"
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
              {recommendations.map((rec) => {
                const sauce = allSauces[rec.sauce.id];
                if (!sauce) return null;
                return (
                  <SauceCard
                    key={rec.sauce.id}
                    sauceId={rec.sauce.id}
                    sauce={sauce}
                    compatibilityScore={rec.compatibilityScore}
                    onSelect={onSelectSauce}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-on-surface-variant">
              <p className="text-sm">No recipe selected for this meal slot.</p>
              <p className="text-xs mt-1">
                Add a recipe first to get personalized sauce recommendations, or
                browse all sauces.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSauces.map(([id, sauce]) => {
              const score = scoreMap.get(id);
              return (
                <SauceCard
                  key={id}
                  sauceId={id}
                  sauce={sauce}
                  {...(typeof score === "number" ? { compatibilityScore: score } : {})}
                  onSelect={onSelectSauce}
                />
              );
            })}
            {filteredSauces.length === 0 && (
              <div className="col-span-2 text-center py-12 text-on-surface-variant text-sm">
                No sauces match your search criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}
