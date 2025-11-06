"use client";

/**
 * Cooking Method Preview Component
 * Shows cooking methods from real data organized by category
 * Uses actual cooking method database with elemental properties
 */

import React, { useState, useMemo } from "react";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";

interface MethodData {
  name: string;
  description: string;
  elementalEffect: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  time_range?: { min: number; max: number };
  suitable_for?: string[];
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  methods: Record<string, MethodData>;
}

const categories: CategoryConfig[] = [
  {
    id: "dry",
    name: "Dry Heat",
    icon: "🔥",
    methods: dryCookingMethods as Record<string, MethodData>,
  },
  {
    id: "wet",
    name: "Wet Heat",
    icon: "💧",
    methods: wetCookingMethods as Record<string, MethodData>,
  },
  {
    id: "molecular",
    name: "Molecular",
    icon: "🧪",
    methods: molecularCookingMethods as Record<string, MethodData>,
  },
  {
    id: "traditional",
    name: "Traditional",
    icon: "🏺",
    methods: traditionalCookingMethods as Record<string, MethodData>,
  },
  {
    id: "transformation",
    name: "Transformation",
    icon: "⚗️",
    methods: transformationMethods as Record<string, MethodData>,
  },
];

// Calculate score based on elemental balance
function calculateScore(method: MethodData): number {
  const avg =
    (method.elementalEffect.Fire +
      method.elementalEffect.Water +
      method.elementalEffect.Earth +
      method.elementalEffect.Air) /
    4;
  return avg;
}

export default function CookingMethodPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>("dry");
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const currentMethods = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    return Object.entries(category.methods)
      .map(([id, method]) => ({
        id,
        ...method,
        score: calculateScore(method),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [selectedCategory]);

  const toggleMethod = (methodId: string) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  const formatDuration = (time_range?: { min: number; max: number }) => {
    if (!time_range) return "Variable";
    if (time_range.min >= 1440) {
      return `${Math.floor(time_range.min / 1440)}-${Math.floor(time_range.max / 1440)} days`;
    }
    if (time_range.min >= 60) {
      return `${Math.floor(time_range.min / 60)}-${Math.floor(time_range.max / 60)} hrs`;
    }
    return `${time_range.min}-${time_range.max} min`;
  };

  const category = categories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
              selectedCategory === cat.id
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white scale-105"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300"
            }`}
          >
            <span className="text-2xl mr-2">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Category Info Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-l-4 border-orange-500 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category?.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {category?.name} Techniques
              </h3>
              <p className="text-sm text-gray-600">
                {currentMethods.length} cooking methods available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentMethods.map((method) => (
          <div
            key={method.id}
            className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white"
          >
            <div
              className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 p-5 cursor-pointer hover:from-orange-100 hover:via-red-100 hover:to-pink-100 transition-all duration-300"
              onClick={() => toggleMethod(method.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xl font-bold text-gray-900">
                      {method.name}
                    </h4>
                    <div
                      className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                      title="Available"
                    />
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {method.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full font-medium border border-gray-200">
                      <span>⏱️</span>
                      <span>{formatDuration(method.time_range)}</span>
                    </span>
                    {method.suitable_for && method.suitable_for.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full font-medium border border-gray-200">
                        <span>👨‍🍳</span>
                        <span>
                          {method.suitable_for.slice(0, 2).join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-base font-bold shadow-lg">
                    {(method.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-3xl text-gray-400 font-light">
                    {expandedMethod === method.id ? "−" : "+"}
                  </div>
                </div>
              </div>
            </div>

            {expandedMethod === method.id && (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t-2 border-orange-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚗️</span>
                  <span>Elemental Effects</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(method.elementalEffect).map(
                    ([element, value]) => (
                      <div
                        key={element}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xl ${
                                element === "Fire"
                                  ? "🔥"
                                  : element === "Water"
                                    ? "💧"
                                    : element === "Earth"
                                      ? "🌍"
                                      : "💨"
                              }`}
                            >
                              {element === "Fire"
                                ? "🔥"
                                : element === "Water"
                                  ? "💧"
                                  : element === "Earth"
                                    ? "🌍"
                                    : "💨"}
                            </span>
                            <span className="text-sm font-bold text-gray-800">
                              {element}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-600">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              element === "Fire"
                                ? "bg-gradient-to-r from-red-400 to-orange-500"
                                : element === "Water"
                                  ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                                  : element === "Earth"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                    : "bg-gradient-to-r from-purple-400 to-indigo-500"
                            }`}
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Suitable For */}
                {method.suitable_for && method.suitable_for.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
                    <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span>👨‍🍳</span>
                      <span>Best Used With:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {method.suitable_for.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-white text-gray-800 px-3 py-1.5 rounded-full font-medium border border-orange-200 shadow-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentMethods.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-dashed border-orange-200">
          <div className="text-6xl mb-4">🍳</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No cooking methods available
          </p>
          <p className="text-sm text-gray-500">
            Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
}
