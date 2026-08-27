"use client";

import React, { useState } from "react";
import { useFoodDiary } from "@/hooks/useFoodDiary";
import type { Ingredient, RecipeIngredient } from "@/types";
import type { ElementalProperties } from "@/types/alchemy";
import type { ServingUnit } from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

export interface RestaurantItem {
  name?: string;
  business: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  elementalProperties?: ElementalProperties;
  [key: string]: unknown;
}

export type AddToDiaryItem =
  | Ingredient
  | RecipeIngredient
  | Recipe
  | Partial<Ingredient>
  | Partial<RecipeIngredient>
  | Partial<Recipe>
  | RestaurantItem
  | Record<string, unknown>;

interface AddToDiaryModalProps {
  item: AddToDiaryItem;
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
  const [notes, setNotes] = useState("");

  const rawItemName =
    "name" in item && typeof item.name === "string" ? item.name : undefined;
  const restaurantBusinessName =
    itemType === "restaurant"
      ? (item as RestaurantItem).business?.name ?? rawItemName
      : undefined;

  const displayName: string = restaurantBusinessName ?? rawItemName ?? "Food Item";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    let foodSource: "recipe" | "manual" | "custom" | "restaurant" = "custom";
    if (itemType === "recipe") foodSource = "recipe";
    if (itemType === "restaurant") foodSource = "restaurant";

    // Infer serving info
    const itemObj = item as Record<string, unknown>;
    const defaultServing =
      itemObj.defaultServing && typeof itemObj.defaultServing === "object"
        ? (itemObj.defaultServing as Record<string, unknown>)
        : {};

    const rawUnit =
      typeof itemObj.unit === "string"
        ? itemObj.unit
        : typeof defaultServing.unit === "string"
          ? defaultServing.unit
          : "serving";
    const validUnits: Set<string> = new Set([
      "g",
      "oz",
      "cup",
      "tbsp",
      "tsp",
      "piece",
      "slice",
      "serving",
      "ml",
      "fl_oz",
    ]);
    const unit: ServingUnit = validUnits.has(rawUnit)
      ? (rawUnit as ServingUnit)
      : "serving";

    const serving = {
      amount:
        typeof itemObj.servingSize === "number"
          ? itemObj.servingSize
          : typeof defaultServing.amount === "number"
            ? defaultServing.amount
            : 1,
      unit,
      grams:
        typeof itemObj.grams === "number"
          ? itemObj.grams
          : typeof defaultServing.grams === "number"
            ? defaultServing.grams
            : 100,
      description:
        typeof itemObj.description === "string"
          ? itemObj.description
          : typeof defaultServing.description === "string"
            ? defaultServing.description
            : "1 serving",
    };

    const sourceId =
      itemType === "restaurant"
        ? (item as RestaurantItem).business?.id
        : "id" in item && typeof item.id === "string"
          ? item.id
          : undefined;

    const elementalProperties =
      "elementalProperties" in item &&
      item.elementalProperties &&
      typeof item.elementalProperties === "object"
        ? (item.elementalProperties as ElementalProperties)
        : undefined;

    await addEntry({
      foodName: displayName,
      foodSource,
      sourceId,
      date: new Date(),
      mealType,
      time,
      serving,
      quantity: Number(quantity) || 1,
      price: price === "" ? undefined : Number(price),
      store: store || restaurantBusinessName,
      quality: quality || undefined,
      notes: notes || undefined,
      elementalProperties,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 text-gray-900">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 overflow-y-auto max-h-[90vh]">
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

        <p className="text-sm text-gray-600 mb-4 font-medium italic">
          {displayName}
        </p>

        <form
          onSubmit={(e) => {
            handleSubmit(e).catch(() => {});
          }}
          className="space-y-4 text-left"
        >
          <div>
            <label htmlFor="mealType" className="block text-xs font-bold text-gray-500 uppercase mb-1">Meal Type</label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity (servings)</label>
            <input
              id="quantity"
              type="number"
              step="0.5"
              min="0.5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            />
          </div>

          {itemType !== "recipe" && (
            <>
              <div>
                <label htmlFor="price" className="block text-xs font-bold text-gray-500 uppercase mb-1">Price Paid ($)</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  placeholder={itemType === "restaurant" ? "Total meal cost" : "e.g. 4.99"}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="store" className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {itemType === "restaurant" ? "Restaurant" : "Store / Source"}
                </label>
                <input
                  id="store"
                  type="text"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  placeholder={restaurantBusinessName ?? "e.g. Whole Foods, Local Market"}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="quality" className="block text-xs font-bold text-gray-500 uppercase mb-1">Quality / Grade</label>
                <input
                  id="quality"
                  type="text"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  placeholder={itemType === "restaurant" ? "e.g. Excellent, Greasy, Fresh" : "e.g. Organic, Fresh, Blemished"}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-gray-500 uppercase mb-1">Observations / Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any specific cravings satisfied?"
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-bold text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 font-bold text-xs uppercase"
            >
              {isLoading ? "Logging..." : "Log to Diary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
