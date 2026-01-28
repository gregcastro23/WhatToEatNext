"use client";

/**
 * Enhanced Grocery List Modal
 * Phase 3: Advanced consolidation, categorization, and export functionality
 *
 * @file src/components/menu-planner/GroceryListModal.tsx
 * @created 2026-01-11 (Phase 3)
 */

import React, { useState, useMemo } from "react";
import type { GroceryItem, GroceryCategory } from "@/types/menuPlanner";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { getGroupedGroceryList } from "@/utils/groceryListGenerator";
import { PantryManager } from "@/utils/pantryManager";
import { createLogger } from "@/utils/logger";

const logger = createLogger("GroceryListModal");

/**
 * Category display names and icons
 */
const CATEGORY_INFO: Record<GroceryCategory, { name: string; icon: string; color: string }> = {
  produce: { name: "Produce", icon: "🥬", color: "bg-green-50 text-green-700" },
  proteins: { name: "Proteins", icon: "🥩", color: "bg-red-50 text-red-700" },
  dairy: { name: "Dairy", icon: "🥛", color: "bg-blue-50 text-blue-700" },
  grains: { name: "Grains & Breads", icon: "🌾", color: "bg-yellow-50 text-yellow-700" },
  spices: { name: "Spices & Herbs", icon: "🌿", color: "bg-purple-50 text-purple-700" },
  condiments: { name: "Condiments & Sauces", icon: "🍯", color: "bg-orange-50 text-orange-700" },
  canned: { name: "Canned & Packaged", icon: "🥫", color: "bg-gray-50 text-gray-700" },
  frozen: { name: "Frozen", icon: "❄️", color: "bg-cyan-50 text-cyan-700" },
  bakery: { name: "Bakery", icon: "🥐", color: "bg-pink-50 text-pink-700" },
  beverages: { name: "Beverages", icon: "☕", color: "bg-brown-50 text-brown-700" },
  other: { name: "Other", icon: "📦", color: "bg-gray-50 text-gray-700" },
};

/**
 * Export grocery list to various formats
 */
async function exportGroceryList(
  items: GroceryItem[],
  format: "clipboard" | "email" | "print",
): Promise<void> {
  try {
    // Filter out purchased and in-pantry items
    const activeItems = items.filter(item => !item.purchased && !item.inPantry);

    const text = formatGroceryListAsText(activeItems);

    switch (format) {
      case "clipboard":
        await navigator.clipboard.writeText(text);
        logger.info("Grocery list copied to clipboard");
        break;

      case "email":
        const subject = encodeURIComponent("Grocery List");
        const body = encodeURIComponent(text);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        logger.info("Opened email client with grocery list");
        break;

      case "print":
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(formatGroceryListAsHTML(activeItems));
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
        logger.info("Opened print dialog");
        break;
    }
  } catch (error) {
    logger.error("Failed to export grocery list:", error);
    throw error;
  }
}

/**
 * Format grocery list as plain text
 */
function formatGroceryListAsText(items: GroceryItem[]): string {
  const grouped = getGroupedGroceryList(items);

  let text = "🛒 Grocery List\n";
  text += "=" + "=".repeat(50) + "\n\n";

  Object.entries(grouped).forEach(([category, categoryItems]) => {
    if (categoryItems.length === 0) return;

    const info = CATEGORY_INFO[category as GroceryCategory];
    text += `${info.icon} ${info.name}\n`;
    text += "-".repeat(30) + "\n";

    categoryItems.forEach((item) => {
      text += `☐ ${item.quantity} ${item.unit} ${item.ingredient}\n`;
      if (item.usedInRecipes && item.usedInRecipes.length > 0) {
        text += `   (Used in: ${item.usedInRecipes.length} recipe${item.usedInRecipes.length > 1 ? "s" : ""})\n`;
      }
    });

    text += "\n";
  });

  text += `\nTotal Items: ${items.length}\n`;
  text += `Generated: ${new Date().toLocaleDateString()}\n`;

  return text;
}

/**
 * Format grocery list as HTML for printing
 */
function formatGroceryListAsHTML(items: GroceryItem[]): string {
  const grouped = getGroupedGroceryList(items);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Grocery List</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        h1 { color: #6b46c1; border-bottom: 3px solid #6b46c1; padding-bottom: 10px; }
        .category { margin: 20px 0; }
        .category-header { background: #f3f4f6; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
        .item { margin: 8px 0 8px 20px; }
        .item input { margin-right: 10px; }
        .item-details { color: #6b7280; font-size: 14px; margin-left: 30px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 2px solid #e5e7eb; color: #6b7280; }
        @media print {
          input[type="checkbox"] { -webkit-appearance: checkbox; appearance: checkbox; }
        }
      </style>
    </head>
    <body>
      <h1>🛒 Grocery List</h1>
  `;

  Object.entries(grouped).forEach(([category, categoryItems]) => {
    if (categoryItems.length === 0) return;

    const info = CATEGORY_INFO[category as GroceryCategory];
    html += `<div class="category">`;
    html += `<div class="category-header">${info.icon} ${info.name}</div>`;

    categoryItems.forEach((item) => {
      html += `<div class="item">`;
      html += `<input type="checkbox"> <strong>${item.quantity} ${item.unit}</strong> ${item.ingredient}`;
      if (item.usedInRecipes && item.usedInRecipes.length > 0) {
        html += `<div class="item-details">Used in ${item.usedInRecipes.length} recipe${item.usedInRecipes.length > 1 ? "s" : ""}</div>`;
      }
      html += `</div>`;
    });

    html += `</div>`;
  });

  html += `
      <div class="footer">
        <div><strong>Total Items:</strong> ${items.length}</div>
        <div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Grocery List Modal Component
 */
interface GroceryListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroceryListModal({ isOpen, onClose }: GroceryListModalProps) {
  const { groceryList, updateGroceryItem, regenerateGroceryList, currentMenu } = useMenuPlanner();

  const [groupBy, setGroupBy] = useState<"category" | "recipe">("category");
  const [expandedCategories, setExpandedCategories] = useState<Record<GroceryCategory, boolean>>({
    produce: true,
    proteins: true,
    dairy: true,
    grains: true,
    spices: true,
    condiments: true,
    canned: true,
    frozen: true,
    bakery: true,
    beverages: true,
    other: true,
  });

  const [showPantryModal, setShowPantryModal] = useState(false);

  // Group items by category
  const groupedItems = useMemo(() => getGroupedGroceryList(groceryList), [groceryList]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = groceryList.length;
    const purchased = groceryList.filter(item => item.purchased).length;
    const inPantry = groceryList.filter(item => item.inPantry).length;
    const remaining = total - purchased - inPantry;

    return { total, purchased, inPantry, remaining };
  }, [groceryList]);

  // Toggle category expansion
  const toggleCategory = (category: GroceryCategory) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Mark all in category as purchased
  const markCategoryPurchased = (category: GroceryCategory) => {
    groupedItems[category].forEach(item => {
      if (!item.inPantry) {
        updateGroceryItem(item.id, { purchased: true });
      }
    });
  };

  // Handle export
  const handleExport = async (format: "clipboard" | "email" | "print") => {
    try {
      await exportGroceryList(groceryList, format);

      if (format === "clipboard") {
        // Show temporary success message
        alert("Grocery list copied to clipboard!");
      }
    } catch (error) {
      alert("Failed to export grocery list. Please try again.");
    }
  };

  // Check if item is in pantry
  const checkPantryStatus = (itemName: string) => {
    return PantryManager.hasItem(itemName);
  };

  // Add item to pantry
  const addToPantry = (item: GroceryItem) => {
    PantryManager.addItem({
      name: item.ingredient,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      addedDate: new Date(),
    });
    updateGroceryItem(item.id, { inPantry: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">🛒 Grocery List</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
              <div className="font-bold text-lg">{stats.total}</div>
              <div className="text-xs">Total</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
              <div className="font-bold text-lg">{stats.remaining}</div>
              <div className="text-xs">To Buy</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
              <div className="font-bold text-lg">{stats.inPantry}</div>
              <div className="text-xs">In Pantry</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
              <div className="font-bold text-lg">{stats.purchased}</div>
              <div className="text-xs">Purchased</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b bg-gray-50 flex gap-2 flex-wrap">
          <button
            onClick={() => handleExport("clipboard")}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            📋 Copy
          </button>
          <button
            onClick={() => handleExport("email")}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            ✉️ Email
          </button>
          <button
            onClick={() => handleExport("print")}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            🖨️ Print
          </button>
          <button
            onClick={regenerateGroceryList}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            🔄 Regenerate
          </button>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as "category" | "recipe")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="category">Group by Aisle</option>
            <option value="recipe">Group by Recipe</option>
          </select>
          <button
            onClick={() => setShowPantryModal(true)}
            className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm ml-auto"
          >
            🏺 View Pantry
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {groupBy === "category" ? (
            // GROUP BY AISLE (default)
            <>
              {(Object.entries(groupedItems) as [GroceryCategory, GroceryItem[]][]).map(([category, items]) => {
                if (items.length === 0) return null;

                const categoryKey = category as GroceryCategory;
                const info = CATEGORY_INFO[categoryKey];
                const isExpanded = expandedCategories[categoryKey];

                return (
                  <div key={category} className="mb-4">
                    <div
                      className={`${info.color} rounded-lg p-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => toggleCategory(categoryKey)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{info.icon}</span>
                        <span className="font-bold">{info.name}</span>
                        <span className="text-sm">({items.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markCategoryPurchased(categoryKey);
                          }}
                          className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-70"
                        >
                          ✓ Mark All
                        </button>
                        <span className="text-xl">{isExpanded ? "▼" : "▶"}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 space-y-2">
                        {items.map((item) => {
                          const isInPantry = item.inPantry || checkPantryStatus(item.ingredient);

                          return (
                            <GroceryItemRow
                              key={item.id}
                              item={item}
                              isInPantry={isInPantry}
                              onTogglePurchased={(purchased) =>
                                updateGroceryItem(item.id, { purchased })
                              }
                              onAddToPantry={() => addToPantry(item)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            // GROUP BY RECIPE
            <RecipeGroupedView
              groceryList={groceryList}
              currentMenu={currentMenu}
              updateGroceryItem={updateGroceryItem}
              checkPantryStatus={checkPantryStatus}
              addToPantry={addToPantry}
            />
          )}

          {groceryList.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-2">🛒</div>
              <p>No items in grocery list yet.</p>
              <p className="text-sm mt-2">Add recipes to your weekly menu to generate a grocery list.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pantry Modal (Simple) */}
      {showPantryModal && (
        <PantryModalSimple onClose={() => setShowPantryModal(false)} />
      )}
    </div>
  );
}

/**
 * Reusable grocery item row
 */
function GroceryItemRow({
  item,
  isInPantry,
  onTogglePurchased,
  onAddToPantry,
}: {
  item: GroceryItem;
  isInPantry: boolean;
  onTogglePurchased: (purchased: boolean) => void;
  onAddToPantry: () => void;
}) {
  return (
    <div
      className={`bg-white border rounded-lg p-3 ${
        item.purchased
          ? "opacity-50 border-green-300 bg-green-50"
          : isInPantry
          ? "border-orange-300 bg-orange-50"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            checked={item.purchased}
            onChange={(e) => onTogglePurchased(e.target.checked)}
            className="w-5 h-5"
          />
          <div className={item.purchased ? "line-through" : ""}>
            <div className="font-medium">
              {item.quantity} {item.unit} {item.ingredient}
            </div>
            {item.usedInRecipes && item.usedInRecipes.length > 0 && (
              <div className="text-xs text-gray-600">
                Used in {item.usedInRecipes.length} recipe
                {item.usedInRecipes.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInPantry ? (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              In Pantry
            </span>
          ) : (
            <button
              onClick={onAddToPantry}
              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
            >
              + Pantry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Recipe-grouped view for grocery list
 * Shows ingredients organized by which recipe uses them
 */
function RecipeGroupedView({
  groceryList,
  currentMenu,
  updateGroceryItem,
  checkPantryStatus,
  addToPantry,
}: {
  groceryList: GroceryItem[];
  currentMenu: import("@/types/menuPlanner").WeeklyMenu | null;
  updateGroceryItem: (id: string, updates: Partial<GroceryItem>) => void;
  checkPantryStatus: (name: string) => boolean;
  addToPantry: (item: GroceryItem) => void;
}) {
  // Build a map from recipe ID -> recipe name
  const recipeNames = useMemo(() => {
    const map = new Map<string, string>();
    if (!currentMenu) return map;
    currentMenu.meals.forEach((meal) => {
      if (meal.recipe) {
        map.set(meal.recipe.id, meal.recipe.name);
      }
    });
    return map;
  }, [currentMenu]);

  // Group grocery items by recipe
  const groupedByRecipe = useMemo(() => {
    const groups = new Map<string, GroceryItem[]>();

    groceryList.forEach((item) => {
      if (item.usedInRecipes && item.usedInRecipes.length > 0) {
        item.usedInRecipes.forEach((recipeId) => {
          if (!groups.has(recipeId)) {
            groups.set(recipeId, []);
          }
          groups.get(recipeId)!.push(item);
        });
      } else {
        if (!groups.has("_uncategorized")) {
          groups.set("_uncategorized", []);
        }
        groups.get("_uncategorized")!.push(item);
      }
    });

    return groups;
  }, [groceryList]);

  return (
    <div className="space-y-4">
      {Array.from(groupedByRecipe.entries()).map(([recipeId, items]) => {
        const recipeName =
          recipeId === "_uncategorized"
            ? "Other Items"
            : recipeNames.get(recipeId) || recipeId;

        return (
          <div key={recipeId} className="mb-4">
            <div className="bg-purple-50 text-purple-700 rounded-lg p-3 flex items-center gap-2 font-bold">
              <span className="text-lg">🍽️</span>
              <span>{recipeName}</span>
              <span className="text-sm font-normal">({items.length} items)</span>
            </div>
            <div className="mt-2 space-y-2">
              {items.map((item) => {
                const isInPantry = item.inPantry || checkPantryStatus(item.ingredient);
                return (
                  <GroceryItemRow
                    key={`${recipeId}-${item.id}`}
                    item={item}
                    isInPantry={isInPantry}
                    onTogglePurchased={(purchased) =>
                      updateGroceryItem(item.id, { purchased })
                    }
                    onAddToPantry={() => addToPantry(item)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Simple Pantry View Modal
 */
function PantryModalSimple({ onClose }: { onClose: () => void }) {
  const pantryItems = PantryManager.getPantry();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🏺 Pantry Items</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {pantryItems.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-2">🏺</div>
              <p>Your pantry is empty.</p>
              <p className="text-sm mt-2">
                Add items from your grocery list to track your pantry.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pantryItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {item.quantity} {item.unit} {item.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Category: {item.category}
                    </div>
                  </div>
                  <button
                    onClick={() => PantryManager.removeItem(item.name)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
