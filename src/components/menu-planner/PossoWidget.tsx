"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/common/Toast";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";
import { calculateRecipeEstimatedCost } from "@/utils/instacart/priceEstimator";

interface ScoredRecipe extends Recipe {
  matchCount: number;
  totalIngredients: number;
  matchPercentage: number;
  originalCost: number;
  possoCost: number;
  savings: number;
}

export default function PossoWidget({
  onClose,
}: {
  onClose: () => void;
}) {
  const { inventory, setInventory, addMealToSlot } = useMenuPlanner();
  const [newItem, setNewItem] = useState("");
  const [scoredRecipes, setScoredRecipes] = useState<ScoredRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showInfo: _showInfo } = useToast();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const items = newItem
      .split(",")
      .map((i) => i.trim().toLowerCase())
      .filter((i) => i && !inventory.includes(i));
    
    if (items.length > 0) {
      setInventory([...inventory, ...items]);
    }
    setNewItem("");
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setInventory(inventory.filter((item) => item !== itemToRemove));
  };

  useEffect(() => {
    async function loadAndScoreRecipes() {
      if (inventory.length === 0) {
        setScoredRecipes([]);
        return;
      }

      setLoading(true);
      try {
        const service = UnifiedRecipeService.getInstance();
        const allRecipes = await service.getAllRecipes();

        const scored = allRecipes.map((recipe: any) => {
          const ingredients = recipe.ingredients || [];
          let matchCount = 0;

          ingredients.forEach((ing: any) => {
            const name = (typeof ing === "string" ? ing : ing.name ?? "").toLowerCase();
            const isMatch = inventory.some((invItem) => name.includes(invItem) || invItem.includes(name));
            if (isMatch) matchCount++;
          });

          const normalizedIngs = ingredients.map((ing: any) => ({
            name: typeof ing === "string" ? ing : ing.name ?? "",
            amount: typeof ing === "string" ? 1 : ing.amount ?? 1,
            unit: typeof ing === "string" ? "each" : ing.unit ?? "each",
            optional: typeof ing === "string" ? false : ing.optional,
          }));

          const originalEstimate = calculateRecipeEstimatedCost(normalizedIngs, 4, []);
          const possoEstimate = calculateRecipeEstimatedCost(normalizedIngs, 4, inventory);

          return {
            ...recipe,
            matchCount,
            totalIngredients: ingredients.length,
            matchPercentage: ingredients.length > 0 ? matchCount / ingredients.length : 0,
            originalCost: originalEstimate.totalCost,
            possoCost: possoEstimate.totalCost,
            savings: originalEstimate.totalCost - possoEstimate.totalCost,
          } as ScoredRecipe;
        });

        // Filter for recipes that use at least 1 inventory item, sort by highest savings
        const relevant = scored
          .filter((r) => r.matchCount > 0)
          .sort((a, b) => b.savings - a.savings);

        setScoredRecipes(relevant.slice(0, 20)); // Top 20 best savings
      } catch (err) {
        console.error("Failed to score Posso recipes", err);
      } finally {
        setLoading(false);
      }
    }

    void loadAndScoreRecipes();
  }, [inventory]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-emerald-200 overflow-hidden flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🛒</span> Posso (What I Can Make)
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            Add ingredients you already have to see budget-saving recipes.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Left: Inventory Manager */}
        <div className="w-full md:w-1/3 bg-emerald-50 border-r border-emerald-100 p-4 overflow-y-auto">
          <h3 className="font-semibold text-emerald-900 mb-3">My Pantry & Cart</h3>
          
          <form onSubmit={handleAddItem} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. chicken, rice..."
                className="flex-1 px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-emerald-600 mt-1">Comma separate multiple items.</p>
          </form>

          <div className="flex flex-wrap gap-2">
            {inventory.length === 0 ? (
              <div className="text-sm text-emerald-700 italic text-center w-full mt-4 bg-white/50 py-4 rounded-lg">
                Your inventory is empty. Add items to find matching recipes!
              </div>
            ) : (
              inventory.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 text-sm rounded-full shadow-sm"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="text-emerald-400 hover:text-emerald-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Right: Recipe Matches */}
        <div className="w-full md:w-2/3 p-4 bg-white overflow-y-auto relative">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
            <span>Budget-Saving Recipes</span>
            {scoredRecipes.length > 0 && (
              <span className="text-xs font-normal text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                {scoredRecipes.length} Matches
              </span>
            )}
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl block mb-2">🍽️</span>
              <p className="text-gray-500">Add ingredients to unlock &quot;Posso&quot; meals.</p>
            </div>
          ) : scoredRecipes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No recipes matched your inventory perfectly.</p>
              <p className="text-sm text-gray-400 mt-1">Try adding more staples.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {scoredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex flex-col p-3 border border-gray-100 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 line-clamp-1 flex-1 pr-2">
                      {recipe.name}
                    </h4>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs text-gray-400 line-through decoration-red-400/50">
                        ${recipe.originalCost.toFixed(2)}
                      </span>
                      <span className="font-bold text-emerald-600">
                        ${recipe.possoCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      {/* Match Progress Bar */}
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden" title={`${recipe.matchCount}/${recipe.totalIngredients} ingredients`}>
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${recipe.matchPercentage * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Save ${(recipe.savings).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        // Very naive auto-placement (for demo). A better UX would be drag-and-drop.
                        // Try placing it on the next empty dinner slot
                        const days = [0, 1, 2, 3, 4, 5, 6] as any[];
                        for(const day of days) {
                          void addMealToSlot(day, "dinner", recipe as MonicaOptimizedRecipe);
                          showSuccess(`Added to ${day} Dinner`);
                          break;
                        }
                      }}
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      + Auto Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
