"use client";

import React, { useState } from "react";
import { useFoodDiary } from "@/hooks/useFoodDiary";
import type { Ingredient, RecipeIngredient } from "@/types";
import type { MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

interface AddToDiaryModalProps {
  item: Ingredient | RecipeIngredient | Recipe | any;
  itemType: "ingredient" | "recipe" | "restaurant";
  onClose: () => void;
}

export function AddToDiaryModal({ item, itemType, onClose }: AddToDiaryModalProps) {
  const { addEntry, isLoading } = useFoodDiary();

  const [mealType, setMealType] = useState<MealType>("snack");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [store, setStore] = useState("");
  const [quality, setQuality] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    let foodSource: "recipe" | "manual" | "custom" | "restaurant" = "custom";
    if (itemType === "recipe") foodSource = "recipe";
    if (itemType === "restaurant") foodSource = "restaurant";

    await addEntry({
      foodName: itemType === "restaurant" ? item.business.name : item.name,
      foodSource,
      sourceId: itemType === "restaurant" ? item.business.id : (item.id || undefined),
      date: new Date(),
      mealType,
      time,
      serving: {
        amount: 1,
        unit: "serving",
        grams: 100,
        description: "1 serving",
      },
      quantity: Number(quantity) || 1,
      price: price === "" ? undefined : Number(price),
      store: store || (itemType === "restaurant" ? item.business.name : undefined),
      quality: quality || undefined,
      elementalProperties: item.elementalProperties,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 text-gray-900">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">
            Log {itemType === "restaurant" ? "Meal" : (itemType === "recipe" ? "Recipe" : "Ingredient")}
          </h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 font-medium">
          {itemType === "restaurant" ? item.business.name : item.name}
        </p>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div>
            <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity (servings)</label>
            <input
              id="quantity"
              type="number"
              step="0.5"
              min="0.5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {itemType === "ingredient" && (
            <>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price Paid ($)</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 4.99"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">Store / Source</label>
                <input
                  id="store"
                  type="text"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  placeholder="e.g. Whole Foods, Local Market"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-1">Quality / Grade</label>
                <input
                  id="quality"
                  type="text"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  placeholder="e.g. Organic, Fresh, Blemished"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Logging..." : "Log to Diary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
