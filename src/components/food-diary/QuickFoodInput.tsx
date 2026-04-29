"use client";

/**
 * QuickFoodInput Component
 * Fast food entry with preset common foods and search functionality
 * Enhanced with Alchemical Dark Theme and new tracking fields
 */

import React, { useState, useMemo } from "react";
import type {
  QuickFoodPreset,
  QuickFoodCategory,
  FoodSearchResult,
} from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";

interface QuickFoodInputProps {
  presets: QuickFoodPreset[];
  onAddFood: (
    presetId: string,
    mealType: MealType,
    quantity?: number,
    time?: string,
    price?: number,
    store?: string,
    quality?: string,
  ) => Promise<any>;
  onSearch: (query: string) => Promise<FoodSearchResult[]>;
  selectedDate: Date;
  isLoading?: boolean;
}

const CATEGORY_LABELS: Record<QuickFoodCategory, string> = {
  fruits: "Fruits",
  vegetables: "Vegetables",
  proteins: "Proteins",
  dairy: "Dairy",
  grains: "Grains",
  snacks: "Snacks",
  beverages: "Beverages",
  sweets: "Sweets",
  nuts_seeds: "Nuts & Seeds",
  condiments: "Condiments",
  prepared_foods: "Prepared Foods",
};

const MEAL_TIMES: Array<{ type: MealType; label: string; icon: string }> = [
  { type: "breakfast", label: "Dawn", icon: "🌅" },
  { type: "lunch", label: "Solar", icon: "☀️" },
  { type: "dinner", label: "Lunar", icon: "🌙" },
  { type: "snack", label: "Minor", icon: "✨" },
];

export default function QuickFoodInput({
  presets,
  onAddFood,
  onSearch,
  selectedDate,
  isLoading = false,
}: QuickFoodInputProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    QuickFoodCategory | "all"
  >("all");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("snack");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<QuickFoodPreset | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<string>("");
  const [store, setStore] = useState("");
  const [quality, setQuality] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPresets = useMemo(() => {
    if (selectedCategory === "all") return presets;
    return presets.filter((p) => p.category === selectedCategory);
  }, [presets, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(presets.map((p) => p.category));
    return Array.from(cats);
  }, [presets]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsSearching(true);
      const results = await onSearch(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectFood = (preset: QuickFoodPreset) => {
    setSelectedFood(preset);
    setQuantity(1);
    setPrice("");
    setStore("");
    setQuality("");
    setShowAddModal(true);
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    await onAddFood(
      selectedFood.id, 
      selectedMealType, 
      quantity, 
      undefined, 
      price ? parseFloat(price) : undefined,
      store || undefined,
      quality || undefined
    );
    setShowAddModal(false);
    setSelectedFood(null);
  };

  return (
    <div className="bg-[#0a0a14]/60 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span className="text-amber-500">✦</span> Infuse Journal
        </h3>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
          {selectedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Meal Type Selector */}
      <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-2xl border border-white/5">
        {MEAL_TIMES.map((meal) => (
          <button
            key={meal.type}
            onClick={() => setSelectedMealType(meal.type)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              selectedMealType === meal.type
                ? "bg-amber-500 text-black shadow-lg"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            {meal.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { void handleSearch(e.target.value); }}
          placeholder="Search materials..."
          className="w-full px-5 py-3 pl-12 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none text-sm placeholder:text-gray-600 text-white transition-all"
        />
        <svg
          className="absolute left-4 top-3.5 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isSearching && (
          <div className="absolute right-4 top-3.5">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl max-h-60 overflow-y-auto shadow-2xl">
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => {
                const preset = presets.find((p) => p.id === result.id);
                if (preset) handleSelectFood(preset);
              }}
              className="w-full px-5 py-3 text-left hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0 transition-colors"
            >
              <div>
                <div className="font-bold text-gray-200 text-sm">{result.name}</div>
                {result.brandName && (
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                    {result.brandName}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-black text-amber-500/60 uppercase">
                {result.nutritionPer100g?.calories} KCAL
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
            selectedCategory === "all"
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
              : "bg-white/5 text-gray-500 border-white/5 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-white/5 text-gray-500 border-white/5 hover:text-gray-300"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredPresets.slice(0, 8).map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectFood(preset)}
            disabled={isLoading}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-left group active:scale-95 shadow-lg"
          >
            <div className="font-bold text-white text-xs truncate group-hover:text-amber-400 transition-colors">
              {preset.name}
            </div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mt-1">
              {preset.defaultServing.description}
            </div>
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && selectedFood && (
        <div className="fixed inset-0 bg-[#08080e]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0a0a14] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full p-8 overflow-hidden relative">
            {/* Decorative Background for Modal */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-black text-white uppercase tracking-wider">
                    Infuse Journal
                  </h4>
                  <p className="text-amber-500 text-xs font-bold mt-1 tracking-widest uppercase">{selectedFood.name}</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Quantity */}
                <div>
                  <label htmlFor="quick-quantity" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Serving Quantity</label>
                  <div className="flex items-center gap-6 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                      className="w-10 h-10 rounded-xl bg-black/40 hover:bg-white/10 flex items-center justify-center text-amber-500 font-bold transition-all border border-white/5"
                    >
                      —
                    </button>
                    <input
                      id="quick-quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                      step={0.5}
                      className="flex-1 bg-transparent text-center text-xl font-black text-white outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 0.5)}
                      className="w-10 h-10 rounded-xl bg-black/40 hover:bg-white/10 flex items-center justify-center text-amber-500 font-bold transition-all border border-white/5"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sourcing Details (The New Fields) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quick-price" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Cost ($)</label>
                    <input
                      id="quick-price"
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-amber-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="quick-store" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Source</label>
                    <input
                      id="quick-store"
                      type="text"
                      placeholder="Market"
                      value={store}
                      onChange={(e) => setStore(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-amber-500/50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="quick-quality" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Quality Grade</label>
                  <input
                    id="quick-quality"
                    type="text"
                    placeholder="e.g. Organic, Artisanal"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-amber-500/50 outline-none"
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    onClick={() => { void handleAddFood(); }}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:from-amber-500 hover:to-amber-400 transition-all shadow-xl active:scale-[0.98] disabled:opacity-40"
                  >
                    {isLoading ? "Transmuting..." : "Finalize Log"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
