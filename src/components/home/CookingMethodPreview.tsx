"use client";

/**
 * Cooking Method Preview Component - Enhanced
 * Shows cooking methods with alchemical transformation metrics
 * Provides a preview of the comprehensive transformation dashboard
 */

import React, { useState, useMemo } from "react";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";
import { calculateGregsEnergy } from "@/calculations/gregsEnergy";

interface MethodData {
  name: string;
  description: string;
  elementalEffect: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  alchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  thermodynamicProperties?: {
    heat: number;
    entropy: number;
    reactivity: number;
    energy?: number;
  };
  duration?: { min: number; max: number };
  time_range?: { min: number; max: number };
  suitable_for?: string[];
  benefits?: string[];
  toolsRequired?: string[];
  commonMistakes?: string[];
  pairingSuggestions?: string[];
  regionalVariations?: Record<string, string[]>;
  expertTips?: string[];
  optimalTemperatures?: Record<string, number>;
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

// Calculate Monica constant
function calculateMonica(alchemical: {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}): number | null {
  const { Spirit, Essence, Matter, Substance } = alchemical;

  if (Matter === 0 || Substance === 0) return null;

  const numerator = Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence);
  const denominator = Math.pow(Matter, Matter) * Math.pow(Substance, Substance);

  if (denominator === 0 || numerator === 0) return null;

  const kalchm = numerator / denominator;

  if (kalchm <= 0) return null;

  return kalchm;
}

// Classify Monica constant
function classifyMonica(monica: number | null): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (monica === null || isNaN(monica)) {
    return { label: "Stable", color: "text-blue-700", bgColor: "bg-blue-100" };
  }
  if (monica > 10) {
    return { label: "Highly Volatile", color: "text-red-700", bgColor: "bg-red-100" };
  }
  if (monica > 5) {
    return { label: "Volatile", color: "text-orange-700", bgColor: "bg-orange-100" };
  }
  if (monica > 2) {
    return { label: "Transformative", color: "text-yellow-700", bgColor: "bg-yellow-100" };
  }
  if (monica > 1) {
    return { label: "Balanced", color: "text-green-700", bgColor: "bg-green-100" };
  }
  return { label: "Stable", color: "text-blue-700", bgColor: "bg-blue-100" };
}

export default function CookingMethodPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>("dry");
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const currentMethods = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    return Object.entries(category.methods)
      .map(([id, method]) => {
        const pillar = getCookingMethodPillar(id);

        // Calculate Greg's Energy
        const gregsEnergy = method.alchemicalProperties && method.elementalEffect
          ? calculateGregsEnergy(method.alchemicalProperties, method.elementalEffect)
          : 0;

        // Calculate Monica
        const monica = method.alchemicalProperties
          ? calculateMonica(method.alchemicalProperties)
          : null;

        const monicaClass = classifyMonica(monica);

        return {
          id,
          ...method,
          pillar,
          gregsEnergy,
          monica,
          monicaClass,
        };
      })
      .sort((a, b) => b.gregsEnergy - a.gregsEnergy)
      .slice(0, 6);
  }, [selectedCategory]);

  const toggleMethod = (methodId: string) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  const formatDuration = (method: MethodData) => {
    const time_range = method.duration || method.time_range;
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
                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white scale-105"
                : "bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400"
            }`}
          >
            <span className="text-2xl mr-2">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 border-l-4 border-purple-600 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category?.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {category?.name} Transformation Methods
              </h3>
              <p className="text-sm text-gray-600">
                {currentMethods.length} methods • Sorted by Energy Potential
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
            className="border-2 border-purple-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white hover:border-purple-400"
          >
            <div
              className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 p-5 cursor-pointer hover:from-purple-100 hover:via-pink-100 hover:to-red-100 transition-all duration-300"
              onClick={() => toggleMethod(method.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xl font-bold text-gray-900">
                      {method.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    {method.description}
                  </p>

                  {/* Alchemical Metrics Row */}
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${method.monicaClass.bgColor} ${method.monicaClass.color}`}>
                      <span>🔮</span>
                      <span>{method.monicaClass.label}</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${
                      method.gregsEnergy >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span>⚡</span>
                      <span>Energy: {method.gregsEnergy.toFixed(2)}</span>
                    </span>
                    {method.pillar && (
                      <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                        <span>⚗️</span>
                        <span>Pillar #{method.pillar.id}</span>
                      </span>
                    )}
                  </div>

                  {/* Traditional metadata */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full font-medium border border-gray-200">
                      <span>⏱️</span>
                      <span>{formatDuration(method)}</span>
                    </span>
                    {method.suitable_for && method.suitable_for.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full font-medium border border-gray-200">
                        <span>👨‍🍳</span>
                        <span>
                          {method.suitable_for.slice(0, 2).join(", ")}
                          {method.suitable_for.length > 2 && ` +${method.suitable_for.length - 2}`}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <div className="text-3xl text-gray-400 font-light">
                    {expandedMethod === method.id ? "−" : "+"}
                  </div>
                </div>
              </div>
            </div>

            {expandedMethod === method.id && (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t-2 border-purple-100 space-y-5">
                {/* Alchemical Properties Preview */}
                {method.alchemicalProperties && (
                  <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">⚗️</span>
                      <span>Alchemical Transformation (ESMS)</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(method.alchemicalProperties).map(([prop, val]) => (
                        <div key={prop} className="bg-white rounded-lg p-2 text-sm">
                          <div className="text-gray-600 text-xs">{prop}</div>
                          <div className={`font-bold ${val > 0 ? 'text-green-700' : val < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                            {val > 0 ? '+' : ''}{val}
                          </div>
                        </div>
                      ))}
                    </div>
                    {method.pillar && (
                      <div className="mt-3 text-xs text-gray-600 text-center">
                        Via Alchemical Pillar #{method.pillar.id}: {method.pillar.name}
                      </div>
                    )}
                  </div>
                )}

                {/* Thermodynamic Properties Preview */}
                {method.thermodynamicProperties && (
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">🌡️</span>
                      <span>Thermodynamic Properties</span>
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="text-2xl mb-1">🔥</div>
                        <div className="text-xs text-gray-600">Heat</div>
                        <div className="font-bold text-red-700">{(method.thermodynamicProperties.heat * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="text-2xl mb-1">🌀</div>
                        <div className="text-xs text-gray-600">Entropy</div>
                        <div className="font-bold text-orange-700">{(method.thermodynamicProperties.entropy * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-xs text-gray-600">Reactivity</div>
                        <div className="font-bold text-pink-700">{(method.thermodynamicProperties.reactivity * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA to Full Dashboard */}
                <div className="rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-4 text-center">
                  <div className="text-sm font-semibold text-purple-900 mb-2">
                    🚀 Want to see the full transformation analysis?
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    Explore Kinetic Properties, Optimal Cooking Conditions, Elemental Flow, and more!
                  </div>
                  <a
                    href="/cooking-methods"
                    className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    View Full Dashboard →
                  </a>
                </div>

                {/* Benefits */}
                {method.benefits && method.benefits.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <span>Key Benefits</span>
                    </h5>
                    <div className="space-y-1">
                      {method.benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expert Tips */}
                {method.expertTips && method.expertTips.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      <span>Expert Tips</span>
                    </h5>
                    <div className="space-y-2">
                      {method.expertTips.slice(0, 2).map((tip, idx) => (
                        <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm text-gray-800">
                          {tip}
                        </div>
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
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
          <div className="text-6xl mb-4">⚗️</div>
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
