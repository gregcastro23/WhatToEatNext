"use client";

/**
 * Enhanced Cooking Method Recommender Component
 * Showcases the full power of the alchemical cooking system:
 * - 14 Alchemical Pillars
 * - Thermodynamic Properties (Heat, Entropy, Reactivity)
 * - Monica Constants and Classifications
 * - Kinetic Properties (Power, Force, Energy)
 */

import React, { useState, useMemo } from "react";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import { ALCHEMICAL_PILLARS, type AlchemicalPillar } from "@/constants/alchemicalPillars";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";

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
  expertTips?: string[];
  regionalVariations?: Record<string, string[]>;
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

// Calculate Monica constant for a method
function calculateMonica(alchemical: {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}): number | null {
  const { Spirit, Essence, Matter, Substance } = alchemical;

  // Prevent division by zero
  if (Matter === 0 || Substance === 0) return null;

  // Kalchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
  const numerator = Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence);
  const denominator = Math.pow(Matter, Matter) * Math.pow(Substance, Substance);

  if (denominator === 0 || numerator === 0) return null;

  const kalchm = numerator / denominator;

  if (kalchm <= 0) return null;

  return kalchm;
}

// Calculate Greg's Energy
function calculateGregsEnergy(thermo: {
  heat: number;
  entropy: number;
  reactivity: number;
}): number {
  return thermo.heat - thermo.entropy * thermo.reactivity;
}

// Classify Monica constant
function classifyMonica(monica: number | null): string {
  if (monica === null) return "Undefined";
  if (monica > 10) return "Highly Volatile";
  if (monica > 5) return "Volatile";
  if (monica > 2) return "Transformative";
  if (monica > 1) return "Balanced";
  if (monica > 0.5) return "Stable";
  return "Very Stable";
}

export default function EnhancedCookingMethodRecommender() {
  const [selectedCategory, setSelectedCategory] = useState<string>("dry");
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [showPillarsGuide, setShowPillarsGuide] = useState(false);

  const currentMethods = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    return Object.entries(category.methods)
      .map(([id, method]) => {
        const pillar = getCookingMethodPillar(id);
        const monica = method.alchemicalProperties
          ? calculateMonica(method.alchemicalProperties)
          : null;
        const gregsEnergy = method.thermodynamicProperties
          ? calculateGregsEnergy(method.thermodynamicProperties)
          : 0;

        return {
          id,
          ...method,
          pillar,
          monica,
          monicaClass: classifyMonica(monica),
          gregsEnergy,
        };
      })
      .sort((a, b) => {
        // Sort by Greg's Energy (most energetic first)
        return b.gregsEnergy - a.gregsEnergy;
      })
      .slice(0, 8);
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

  // Render alchemical property bars
  const renderAlchemicalProperties = (alchemical: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  }) => {
    const properties = [
      { name: "Spirit", value: alchemical.Spirit, color: "yellow", icon: "✨" },
      { name: "Essence", value: alchemical.Essence, color: "blue", icon: "💫" },
      { name: "Matter", value: alchemical.Matter, color: "green", icon: "🌿" },
      { name: "Substance", value: alchemical.Substance, color: "purple", icon: "🔮" },
    ];

    return (
      <div className="space-y-2">
        {properties.map(({ name, value, color, icon }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="w-20 text-sm font-medium text-gray-700">
              {name}
            </span>
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full bg-${color}-500`}
                  style={{
                    width: `${Math.max(0, Math.min(100, ((value + 5) / 10) * 100))}%`,
                  }}
                />
              </div>
            </div>
            <span className="w-8 text-right text-sm text-gray-600">
              {value > 0 ? `+${value}` : value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render thermodynamic properties
  const renderThermodynamicProperties = (thermo: {
    heat: number;
    entropy: number;
    reactivity: number;
    energy?: number;
  }) => {
    const properties = [
      {
        name: "Heat",
        value: thermo.heat,
        color: "red",
        icon: "🔥",
        unit: "",
      },
      {
        name: "Entropy",
        value: thermo.entropy,
        color: "orange",
        icon: "🌀",
        unit: "",
      },
      {
        name: "Reactivity",
        value: thermo.reactivity,
        color: "pink",
        icon: "⚡",
        unit: "",
      },
      {
        name: "Energy",
        value: thermo.energy || 0,
        color: "indigo",
        icon: "⚙️",
        unit: "",
      },
    ];

    return (
      <div className="space-y-2">
        {properties.map(({ name, value, color, icon }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="w-24 text-sm font-medium text-gray-700">
              {name}
            </span>
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full bg-${color}-500`}
                  style={{ width: `${Math.round(value * 100)}%` }}
                />
              </div>
            </div>
            <span className="w-12 text-right text-sm text-gray-600">
              {value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render elemental properties
  const renderElementalProperties = (elemental: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  }) => {
    const elements = [
      { name: "Fire", value: elemental.Fire, icon: "🔥", color: "red" },
      { name: "Water", value: elemental.Water, icon: "💧", color: "blue" },
      { name: "Earth", value: elemental.Earth, icon: "🌍", color: "green" },
      { name: "Air", value: elemental.Air, icon: "💨", color: "sky" },
    ];

    return (
      <div className="space-y-2">
        {elements.map(({ name, value, icon, color }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="w-16 text-sm font-medium text-gray-700">
              {name}
            </span>
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full bg-${color}-500`}
                  style={{ width: `${Math.round(value * 100)}%` }}
                />
              </div>
            </div>
            <span className="w-12 text-right text-sm text-gray-600">
              {Math.round(value * 100)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render pillar badge
  const renderPillarBadge = (pillar: AlchemicalPillar | undefined) => {
    if (!pillar) {
      return (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
          No Pillar
        </span>
      );
    }

    const pillarColors: Record<number, string> = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-cyan-100 text-cyan-800",
      3: "bg-sky-100 text-sky-800",
      4: "bg-indigo-100 text-indigo-800",
      5: "bg-purple-100 text-purple-800",
      6: "bg-yellow-100 text-yellow-800",
      7: "bg-red-100 text-red-800",
      8: "bg-green-100 text-green-800",
      9: "bg-teal-100 text-teal-800",
      10: "bg-orange-100 text-orange-800",
      11: "bg-pink-100 text-pink-800",
      12: "bg-emerald-100 text-emerald-800",
      13: "bg-violet-100 text-violet-800",
      14: "bg-amber-100 text-amber-800",
    };

    return (
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            pillarColors[pillar.id] || "bg-gray-100 text-gray-800"
          }`}
        >
          Pillar {pillar.id}: {pillar.name}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">
          Alchemical Cooking Method Recommender
        </h2>
        <p className="text-gray-600">
          Explore the 14 Pillars of Alchemical Transformation
        </p>
        <button
          onClick={() => setShowPillarsGuide(!showPillarsGuide)}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          {showPillarsGuide ? "Hide" : "Show"} 14 Pillars Guide
        </button>
      </div>

      {/* 14 Pillars Guide */}
      {showPillarsGuide && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
          <h3 className="mb-4 text-xl font-bold text-indigo-900">
            The 14 Alchemical Pillars
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ALCHEMICAL_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-lg bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-gray-900">
                    {pillar.id}. {pillar.name}
                  </span>
                  {pillar.elementalAssociations && (
                    <span className="text-lg">
                      {pillar.elementalAssociations.primary === "Fire" && "🔥"}
                      {pillar.elementalAssociations.primary === "Water" && "💧"}
                      {pillar.elementalAssociations.primary === "Earth" && "🌍"}
                      {pillar.elementalAssociations.primary === "Air" && "💨"}
                    </span>
                  )}
                </div>
                <p className="mb-2 text-xs text-gray-600">
                  {pillar.description}
                </p>
                <div className="text-xs text-gray-500">
                  Effects:{" "}
                  {Object.entries(pillar.effects)
                    .map(
                      ([prop, val]) =>
                        `${prop} ${val > 0 ? `+${val}` : val}`
                    )
                    .join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Selector */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`transform rounded-xl px-5 py-3 font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedCategory === cat.id
                ? "scale-105 bg-gradient-to-r from-orange-500 to-red-600 text-white"
                : "border-2 border-gray-200 bg-white text-gray-700 hover:border-orange-300"
            }`}
          >
            <span className="mr-2 text-2xl">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Category Info */}
      <div className="rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category?.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {category?.name} Methods
              </h3>
              <p className="text-sm text-gray-600">
                {currentMethods.length} methods available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {currentMethods.map((method) => {
          const isExpanded = expandedMethod === method.id;

          return (
            <div
              key={method.id}
              className={`cursor-pointer rounded-lg border-2 p-5 shadow-md transition-all ${
                isExpanded
                  ? "border-indigo-500 bg-indigo-50 shadow-xl"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg"
              }`}
              onClick={() => toggleMethod(method.id)}
            >
              {/* Method Header */}
              <div className="mb-3">
                <h4 className="text-xl font-bold capitalize text-gray-900">
                  {method.name}
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {method.description}
                </p>
              </div>

              {/* Key Metrics Row */}
              <div className="mb-3 flex flex-wrap gap-2">
                {/* Duration */}
                <span className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  ⏱️ {formatDuration(method)}
                </span>

                {/* Greg's Energy */}
                <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-800">
                  ⚡ Energy: {method.gregsEnergy.toFixed(2)}
                </span>

                {/* Monica Classification */}
                {method.monica !== null && (
                  <span className="rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-800">
                    🔮 {method.monicaClass}
                  </span>
                )}
              </div>

              {/* Pillar Badge */}
              {renderPillarBadge(method.pillar)}

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                  {/* Alchemical Properties */}
                  {method.alchemicalProperties && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-gray-800">
                        Alchemical Transformation (ESMS)
                      </div>
                      {renderAlchemicalProperties(method.alchemicalProperties)}
                      {method.monica !== null && (
                        <div className="mt-2 text-xs text-gray-600">
                          Monica Constant (Kalchm): {method.monica.toFixed(4)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thermodynamic Properties */}
                  {method.thermodynamicProperties && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-gray-800">
                        Thermodynamic Properties
                      </div>
                      {renderThermodynamicProperties(
                        method.thermodynamicProperties
                      )}
                      <div className="mt-2 text-xs text-gray-600">
                        Greg's Energy = Heat - (Entropy × Reactivity) ={" "}
                        {method.gregsEnergy.toFixed(4)}
                      </div>
                    </div>
                  )}

                  {/* Elemental Effects */}
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-800">
                      Elemental Effects
                    </div>
                    {renderElementalProperties(method.elementalEffect)}
                  </div>

                  {/* Pillar Details */}
                  {method.pillar && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 text-sm font-semibold text-gray-800">
                        Pillar: {method.pillar.name}
                      </div>
                      <p className="mb-2 text-xs text-gray-600">
                        {method.pillar.description}
                      </p>
                      {method.pillar.planetaryAssociations && (
                        <div className="text-xs text-gray-600">
                          Planets:{" "}
                          {method.pillar.planetaryAssociations.join(", ")}
                        </div>
                      )}
                      {method.pillar.tarotAssociations && (
                        <div className="text-xs text-gray-600">
                          Tarot: {method.pillar.tarotAssociations.join(", ")}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suitable For */}
                  {method.suitable_for && method.suitable_for.length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800">
                        Suitable For
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {method.suitable_for.map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {method.benefits && method.benefits.length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800">
                        Benefits
                      </div>
                      <ul className="list-inside list-disc text-sm text-gray-600">
                        {method.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expert Tips */}
                  {method.expertTips && method.expertTips.length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800">
                        💡 Expert Tips
                      </div>
                      <ul className="list-inside list-disc text-sm text-gray-600">
                        {method.expertTips.slice(0, 2).map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {method.commonMistakes &&
                    method.commonMistakes.length > 0 && (
                      <div>
                        <div className="mb-1 text-sm font-semibold text-red-800">
                          ⚠️ Common Mistakes
                        </div>
                        <ul className="list-inside list-disc text-sm text-red-600">
                          {method.commonMistakes.slice(0, 2).map((mistake, idx) => (
                            <li key={idx}>{mistake}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Tools Required */}
                  {method.toolsRequired && method.toolsRequired.length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800">
                        Required Tools
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {method.toolsRequired.map((tool, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regional Variations */}
                  {method.regionalVariations &&
                    Object.keys(method.regionalVariations).length > 0 && (
                      <div>
                        <div className="mb-1 text-sm font-semibold text-gray-800">
                          🌍 Regional Variations
                        </div>
                        <div className="text-sm text-gray-600">
                          {Object.keys(method.regionalVariations).slice(0, 3).join(", ")}
                          {Object.keys(method.regionalVariations).length > 3 &&
                            ` +${Object.keys(method.regionalVariations).length - 3} more`}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Expand/Collapse Indicator */}
              <div className="mt-3 text-center text-xs text-gray-500">
                {isExpanded ? "Click to collapse ▲" : "Click to expand ▼"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
