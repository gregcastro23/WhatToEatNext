"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getServerRecipes } from "@/actions/recipes";
import { useToast } from "@/components/common/Toast";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useFavoriteRecipes } from "@/lib/recipes/favoriteRecipes";
import type { DayOfWeek } from "@/types/menuPlanner";
import type { Recipe, RecipeIngredient } from "@/types/recipe";
import { calculateRecipeEstimatedCost } from "@/utils/instacart/priceEstimator";
import { createLogger } from "@/utils/logger";

const logger = createLogger("PossoWidget");

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
  compact = false,
  onSelectRecipe,
}: {
  onClose?: () => void;
  compact?: boolean;
  onSelectRecipe?: (recipe: Recipe) => void;
}): React.JSX.Element {
  const { inventory, setInventory, addMealToSlot, currentMenu } = useMenuPlanner();
  const { topTrackedIngredients, topLikedIngredients } = useFavoriteRecipes();
  const [newItem, setNewItem] = useState("");
  const [scoredRecipes, setScoredRecipes] = useState<ScoredRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showInfo: _showInfo } = useToast();

  const favoriteStaplesToStock = useMemo(() => {
    const pantryLower = new Set(inventory.map((i) => i.toLowerCase().trim()));
    const seen = new Set<string>();
    const candidates: Array<{ name: string; count: number; isLiked: boolean }> = [];

    for (const item of topLikedIngredients) {
      const lower = item.name.toLowerCase().trim();
      if (!pantryLower.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        candidates.push({ name: item.name, count: item.count, isLiked: true });
      }
    }
    for (const item of topTrackedIngredients) {
      const lower = item.name.toLowerCase().trim();
      if (!pantryLower.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        candidates.push({ name: item.name, count: item.count, isLiked: false });
      }
    }
    return candidates.slice(0, 8);
  }, [inventory, topLikedIngredients, topTrackedIngredients]);

  const isFavoriteStaple = useMemo(() => {
    const set = new Set<string>();
    topLikedIngredients.forEach((i) => set.add(i.name.toLowerCase().trim()));
    topTrackedIngredients.forEach((i) => set.add(i.name.toLowerCase().trim()));
    return (item: string): boolean => set.has(item.toLowerCase().trim());
  }, [topLikedIngredients, topTrackedIngredients]);

  const pantryItemsUsedInWeek = useMemo(() => {
    if (!currentMenu?.meals || inventory.length === 0) return [];
    const usageMap = new Map<string, number>();
    for (const meal of currentMenu.meals) {
      const rawList = meal.recipe?.ingredients;
      if (!rawList) continue;
      for (const raw of rawList) {
        const { name } = raw;
        const lower = name.toLowerCase().trim();
        for (const inv of inventory) {
          const invLower = inv.toLowerCase().trim();
          if (lower.includes(invLower) || invLower.includes(lower)) {
            usageMap.set(inv, (usageMap.get(inv) ?? 0) + 1);
            break;
          }
        }
      }
    }
    return Array.from(usageMap.entries()).map(([item, count]) => ({ item, count }));
  }, [currentMenu?.meals, inventory]);

  const handleAddItem = (e: React.FormEvent): void => {
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

  const handleRemoveItem = (itemToRemove: string): void => {
    setInventory(inventory.filter((item) => item !== itemToRemove));
  };

  useEffect(() => {
    async function loadAndScoreRecipes(): Promise<void> {
      if (inventory.length === 0) {
        setScoredRecipes([]);
        return;
      }

      setLoading(true);
      try {
        const allRecipes: Recipe[] = await getServerRecipes();

        const scored = allRecipes.map((recipe: Recipe): ScoredRecipe => {
          const { ingredients } = recipe;
          let matchCount = 0;

          ingredients.forEach((ing: RecipeIngredient | string) => {
            const name = (typeof ing === "string" ? ing : ing.name).toLowerCase();
            const isMatch = inventory.some((invItem) => name.includes(invItem) || invItem.includes(name));
            if (isMatch) matchCount++;
          });

          const normalizedIngs: RecipeIngredient[] = ingredients.map((ing: RecipeIngredient | string): RecipeIngredient => ({
            name: typeof ing === "string" ? ing : ing.name,
            amount: typeof ing === "string" ? 1 : ing.amount,
            unit: typeof ing === "string" ? "each" : ing.unit,
            optional: typeof ing === "string" ? false : Boolean(ing.optional),
          }));

          const originalEstimate = calculateRecipeEstimatedCost(normalizedIngs, 4, []);
          // Posso cost = only what the user still needs to buy (exclude inventory items)
          const possoIngs = normalizedIngs.filter(
            (ing: RecipeIngredient) => !inventory.some((invItem) => {
              const ingLower = ing.name.toLowerCase();
              const invLower = invItem.toLowerCase();
              return ingLower.includes(invLower) || invLower.includes(ingLower);
            })
          );
          const possoEstimate = calculateRecipeEstimatedCost(possoIngs, 4, []);

          return {
            ...recipe,
            matchCount,
            totalIngredients: ingredients.length,
            matchPercentage: ingredients.length > 0 ? matchCount / ingredients.length : 0,
            originalCost: originalEstimate.totalCost,
            possoCost: possoEstimate.totalCost,
            savings: originalEstimate.totalCost - possoEstimate.totalCost,
          };
        });

        // Filter for recipes that use at least 1 inventory item, sort by highest match percentage then savings
        const relevant = scored
          .filter((r) => r.matchCount > 0)
          .sort((a, b) => {
            if (b.matchPercentage !== a.matchPercentage) {
              return b.matchPercentage - a.matchPercentage;
            }
            return b.savings - a.savings;
          });

        setScoredRecipes(relevant.slice(0, 20)); // Top 20 best savings
      } catch (err) {
        logger.error("Failed to score Posso recipes", err);
      } finally {
        setLoading(false);
      }
    }

    loadAndScoreRecipes().catch(() => {});
  }, [inventory]);

  return (
    <div
      className={
        compact
          ? "flex flex-col h-full overflow-hidden bg-surface"
          : "bg-surface-container rounded-xl shadow-lg border border-muted overflow-hidden flex flex-col h-full max-h-[600px]"
      }
    >
      {/* Header */}
      {!compact && (
        <div className="bg-surface-container-high p-4 text-primary border-b border-muted flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
              <span>🍲</span> Pantry Meals (Posso)
            </h2>
            <p className="text-on-surface-variant text-xs mt-1">
              Add ingredients you have to find recipes that use what&apos;s on hand.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-primary rounded-full p-1.5 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className={`flex flex-col ${compact ? "space-y-4 p-4 overflow-y-auto" : "md:flex-row h-full overflow-hidden"}`}>
        {/* Left: Inventory Manager */}
        <div className={compact ? "w-full" : "w-full md:w-1/3 bg-surface-container-low border-r border-muted p-4 overflow-y-auto"}>
          <h3 className="font-semibold text-primary text-sm mb-3">My Pantry Ingredients</h3>

          <form onSubmit={handleAddItem} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. chicken, rice..."
                className="flex-1 px-3 py-2 text-sm border border-muted bg-surface-container-lowest text-primary rounded-lg focus:outline-none focus:border-active-violet"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-active-violet text-background rounded-lg hover:bg-white text-xs font-semibold uppercase font-mono transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Comma separate multiple items.</p>
          </form>

          {/* Favorite Staples to Stock Row */}
          {favoriteStaplesToStock.length > 0 && (
            <div className="mb-4 p-3 rounded-xl border border-gold-accent/30 bg-gold-accent/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gold-accent font-mono uppercase flex items-center gap-1">
                  <span>★</span> Favorite Staples to Stock
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">1-click add</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {favoriteStaplesToStock.map((staple) => (
                  <button
                    key={staple.name}
                    type="button"
                    onClick={() => {
                      const norm = staple.name.toLowerCase().trim();
                      if (!inventory.includes(norm)) {
                        setInventory([...inventory, norm]);
                        showSuccess(`Added ${staple.name} to pantry`);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-surface-container-high border border-gold-accent/30 text-primary hover:bg-gold-accent/20 hover:border-gold-accent transition-colors cursor-pointer"
                    title={`Add ${staple.name} to pantry (${staple.count} favorite recipes)`}
                  >
                    <span>{staple.isLiked ? "⭐" : "+"}</span>
                    <span className="capitalize">{staple.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {inventory.length === 0 ? (
              <div className="text-xs text-on-surface-variant italic text-center w-full py-4 rounded-lg bg-surface-container-lowest">
                Your inventory is empty. Add items to find matching recipes!
              </div>
            ) : (
              inventory.map((item) => {
                const isFav = isFavoriteStaple(item);
                return (
                  <span
                    key={item}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      isFav
                        ? "bg-gold-accent/15 border-gold-accent/40 text-gold-accent font-semibold shadow-sm"
                        : "bg-surface-container-high border-muted text-primary"
                    }`}
                  >
                    {isFav && <span title="Favorite recipe staple" aria-hidden>★</span>}
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item)}
                      className="text-on-surface-variant/60 hover:text-error font-bold ml-0.5 cursor-pointer"
                      aria-label={`Remove ${item} from pantry`}
                    >
                      ×
                    </button>
                  </span>
                );
              })
            )}
          </div>

          {/* Active in This Week's Plan */}
          {pantryItemsUsedInWeek.length > 0 && (
            <div className="mt-4 pt-3 border-t border-muted/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-earth-matter font-mono uppercase flex items-center gap-1">
                  <span>✓</span> Active in Week Plan
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {pantryItemsUsedInWeek.length} used
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pantryItemsUsedInWeek.map(({ item, count }) => (
                  <span
                    key={`used-${item}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-earth-matter/15 border border-earth-matter/30 text-earth-matter"
                    title={`Used in ${count} meal${count > 1 ? "s" : ""} on WeekBoard`}
                  >
                    <span>{item}</span>
                    <span className="text-[9px] opacity-75">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Recipe Matches */}
        <div className={compact ? "w-full border-t border-muted pt-4" : "w-full md:w-2/3 p-4 bg-surface-container-lowest/20 overflow-y-auto relative"}>
          <h3 className="font-semibold text-primary mb-3 flex items-center justify-between text-sm">
            <span>Budget-Saving Recipes</span>
            {scoredRecipes.length > 0 && (
              <span className="text-xs font-normal text-active-violet bg-active-violet/10 border border-active-violet/20 px-2 py-0.5 rounded-full font-mono">
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
              <p className="text-on-surface-variant">No recipes matched your inventory perfectly.</p>
              <p className="text-sm text-on-surface-variant/60 mt-1">Try adding more staples.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {scoredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex flex-col p-3 border border-muted bg-surface-container-low rounded-xl hover:border-active-violet transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-primary line-clamp-1 flex-1 pr-2 text-sm">
                      {recipe.name}
                    </h4>
                    <div className="flex flex-col items-end shrink-0 font-mono">
                      <span className="text-xs text-on-surface-variant/50 line-through">
                        ${recipe.originalCost.toFixed(2)}
                      </span>
                      <span className="font-bold text-active-violet text-sm">
                        ${recipe.possoCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      {/* Match Progress Bar */}
                      <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden" title={`${recipe.matchCount}/${recipe.totalIngredients} ingredients`}>
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${recipe.matchPercentage * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Save ${(recipe.savings).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectRecipe) {
                          onSelectRecipe(recipe);
                          return;
                        }
                        const days: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
                        const dayNames = [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ];
                        const targetDay = days.find((d) => {
                          const meal = currentMenu?.meals.find(
                            (m) => m.dayOfWeek === d && m.mealType === "dinner",
                          );
                          return !meal?.recipe;
                        });

                        if (targetDay === undefined) {
                          logger.warn("No available dinner slot found in the weekly menu");
                          return;
                        }

                        addMealToSlot(targetDay, "dinner", recipe)
                          .then(() => {
                            showSuccess(`Added to ${dayNames[targetDay]} Dinner`);
                          })
                          .catch((err: unknown) => {
                            logger.error("Failed to add meal to slot", err);
                          });
                      }}
                      className="px-3 py-1 bg-active-violet text-background hover:bg-white text-xs font-semibold rounded-lg font-mono uppercase transition-colors cursor-pointer"
                    >
                      {onSelectRecipe ? "Place" : "+ Auto Add"}
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
