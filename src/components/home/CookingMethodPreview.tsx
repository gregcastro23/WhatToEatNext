"use client";

/**
 * Cooking Method Preview Component
 * Shows cooking methods from real data organized by category
 * Uses actual cooking method database with elemental, ESMS, thermodynamic, and kinetic properties
 */

import React, { useState, useMemo, useEffect } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";
import { getCookingMethodThermodynamics } from "@/constants/alchemicalPillars";
import { calculateGregsEnergy } from "@/calculations/gregsEnergy";
import {
  calculateKAlchm,
  calculateMonicaConstant,
} from "@/utils/monicaKalchmCalculations";

interface MethodData {
  name: string;
  description: string;
  elementalEffect: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  thermodynamicProperties?: {
    heat: number;
    entropy: number;
    reactivity: number;
    gregsEnergy?: number;
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

// Default planetary positions (fallback when context not available)
const DEFAULT_PLANETARY_POSITIONS = {
  Sun: "Leo",
  Moon: "Cancer",
  Mercury: "Gemini",
  Venus: "Taurus",
  Mars: "Aries",
  Jupiter: "Sagittarius",
  Saturn: "Capricorn",
  Uranus: "Aquarius",
  Neptune: "Pisces",
  Pluto: "Scorpio",
};

// Helper to extract zodiac sign from position data
function extractZodiacSign(position: unknown): string {
  if (!position) return "Aries";
  if (typeof position === "string") return position;
  if (typeof position === "object" && position !== null) {
    const posObj = position as Record<string, unknown>;
    if (typeof posObj.sign === "string") {
      return (
        posObj.sign.charAt(0).toUpperCase() + posObj.sign.slice(1).toLowerCase()
      );
    }
  }
  return "Aries";
}

// Convert context planetary positions to simple zodiac sign format
function normalizePlanetaryPositions(
  contextPositions: Record<string, unknown> | undefined,
): Record<string, string> {
  if (!contextPositions || Object.keys(contextPositions).length === 0) {
    return DEFAULT_PLANETARY_POSITIONS;
  }

  const normalized: Record<string, string> = {};
  const planets = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];

  for (const planet of planets) {
    const position =
      contextPositions[planet] || contextPositions[planet.toLowerCase()];
    normalized[planet] = extractZodiacSign(position);
  }

  return normalized;
}

// Classify Monica constant
function classifyMonica(monica: number | null): {
  label: string;
  color: string;
} {
  if (monica === null || isNaN(monica)) {
    return { label: "Undefined", color: "text-gray-600" };
  }
  if (monica > 10) {
    return { label: "Highly Volatile", color: "text-red-700" };
  }
  if (monica > 5) {
    return { label: "Volatile", color: "text-orange-700" };
  }
  if (monica > 2) {
    return { label: "Transformative", color: "text-yellow-700" };
  }
  if (monica > 1) {
    return { label: "Balanced", color: "text-green-700" };
  }
  if (monica > 0.5) {
    return { label: "Stable", color: "text-blue-700" };
  }
  return { label: "Very Stable", color: "text-indigo-700" };
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

// Calculate compatibility score based on current elemental state
function calculateCompatibilityScore(
  methodElementals: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  },
  currentElementals: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  },
): number {
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  let totalDiff = 0;

  elements.forEach((element) => {
    const diff = Math.abs(
      (methodElementals[element] || 0) - (currentElementals[element] || 0),
    );
    totalDiff += diff;
  });

  // Convert to 0-1 score (lower difference = higher score)
  return 1 - totalDiff / (2 * elements.length);
}

export default function CookingMethodPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>("dry");
  const [expandedMethods, setExpandedMethods] = useState<Set<string>>(
    new Set(),
  );
  const [planetaryPositions, setPlanetaryPositions] = useState<
    Record<string, string>
  >(DEFAULT_PLANETARY_POSITIONS);
  const [positionsSource, setPositionsSource] = useState<"real" | "fallback">(
    "fallback",
  );

  // Get current alchemical context
  let alchemicalContext: ReturnType<typeof useAlchemical> | null = null;
  try {
    alchemicalContext = useAlchemical();
  } catch {
    // Context not available
  }

  // Update planetary positions from context
  useEffect(() => {
    if (alchemicalContext?.planetaryPositions) {
      const normalized = normalizePlanetaryPositions(
        alchemicalContext.planetaryPositions,
      );
      setPlanetaryPositions(normalized);
      setPositionsSource("real");
    }

    // Also try to refresh positions from backend
    if (alchemicalContext?.refreshPlanetaryPositions) {
      alchemicalContext
        .refreshPlanetaryPositions()
        .then((positions) => {
          if (positions && Object.keys(positions).length > 0) {
            const normalized = normalizePlanetaryPositions(
              positions as Record<string, unknown>,
            );
            setPlanetaryPositions(normalized);
            setPositionsSource("real");
          }
        })
        .catch(() => {
          // Silently fail, use existing positions
        });
    }
  }, [alchemicalContext?.planetaryPositions]);

  // Get current elemental properties from alchemical context
  const currentElementals = useMemo(() => {
    if (alchemicalContext?.state?.elementalState) {
      return alchemicalContext.state.elementalState as {
        Fire: number;
        Water: number;
        Earth: number;
        Air: number;
      };
    }
    // Default balanced elementals
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }, [alchemicalContext?.state?.elementalState]);

  // Calculate BASE ESMS from real planetary positions (calculated once per planetary change)
  const baseESMS = useMemo(() => {
    return calculateAlchemicalFromPlanets(planetaryPositions);
  }, [planetaryPositions]);

  const currentMethods = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    return Object.entries(category.methods)
      .map(([id, method]) => {
        // Get the alchemical pillar for this cooking method
        const pillar = getCookingMethodPillar(id);

        // Base ESMS from planetary positions
        const safeBaseESMS = {
          Spirit: baseESMS?.Spirit ?? 4,
          Essence: baseESMS?.Essence ?? 4,
          Matter: baseESMS?.Matter ?? 4,
          Substance: baseESMS?.Substance ?? 2,
        };

        // Apply pillar transformation effects to get METHOD-SPECIFIC ESMS
        // Each pillar modifies ESMS differently based on the cooking method's alchemical nature
        const transformedESMS = pillar
          ? {
              Spirit: safeBaseESMS.Spirit + (pillar.effects.Spirit || 0),
              Essence: safeBaseESMS.Essence + (pillar.effects.Essence || 0),
              Matter: safeBaseESMS.Matter + (pillar.effects.Matter || 0),
              Substance:
                safeBaseESMS.Substance + (pillar.effects.Substance || 0),
            }
          : safeBaseESMS;

        // Use method's thermodynamic properties if available, otherwise calculate from pillar
        // This ensures each method gets unique thermodynamic values based on its pillar
        const methodThermo = method.thermodynamicProperties ||
          getCookingMethodThermodynamics(id) || {
            heat: 0.5,
            entropy: 0.5,
            reactivity: 0.5,
          };

        // Calculate Greg's Energy using TRANSFORMED ESMS and method elementals
        const result = calculateGregsEnergy({
          Spirit: transformedESMS.Spirit,
          Essence: transformedESMS.Essence,
          Matter: transformedESMS.Matter,
          Substance: transformedESMS.Substance,
          Fire: method.elementalEffect.Fire,
          Water: method.elementalEffect.Water,
          Air: method.elementalEffect.Air,
          Earth: method.elementalEffect.Earth,
        });
        const gregsEnergy = result.gregsEnergy;

        // Calculate Kalchm using TRANSFORMED ESMS (method-specific equilibrium constant)
        const kalchm = calculateKAlchm(
          transformedESMS.Spirit,
          transformedESMS.Essence,
          transformedESMS.Matter,
          transformedESMS.Substance,
        );

        // Use method-specific reactivity for Monica calculation
        const reactivity = methodThermo.reactivity;
        const monica =
          gregsEnergy !== null && kalchm
            ? calculateMonicaConstant(gregsEnergy, reactivity, kalchm)
            : null;

        const monicaClass = classifyMonica(monica);

        return {
          id,
          ...method,
          score: calculateCompatibilityScore(
            method.elementalEffect,
            currentElementals,
          ),
          pillar,
          gregsEnergy,
          kalchm,
          monica,
          monicaClass,
          esms: transformedESMS, // Store transformed ESMS for display
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [selectedCategory, currentElementals, baseESMS, planetaryPositions]);

  const toggleMethod = (methodId: string) => {
    setExpandedMethods((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(methodId)) {
        newSet.delete(methodId);
      } else {
        newSet.add(methodId);
      }
      return newSet;
    });
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
          {/* Planetary Data Source Indicator */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              positionsSource === "real"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {positionsSource === "real" ? "🌟" : "⏳"}
            {positionsSource === "real" ? "Live Data" : "Default Data"}
          </span>
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
                      <span>{formatDuration(method)}</span>
                    </span>
                    {/* Greg's Energy indicator */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium border ${
                        method.gregsEnergy >= 0
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      <span>⚡</span>
                      <span>
                        {method.gregsEnergy >= 0 ? "+" : ""}
                        {method.gregsEnergy.toFixed(2)}
                      </span>
                    </span>
                    {/* Monica Classification */}
                    {method.monica !== null && !isNaN(method.monica) && (
                      <span
                        className={`inline-flex items-center gap-1 bg-purple-50 border-purple-200 border px-2 py-1 rounded-full font-medium ${method.monicaClass.color}`}
                      >
                        <span>🔮</span>
                        <span>{method.monicaClass.label}</span>
                      </span>
                    )}
                    {/* Pillar indicator */}
                    {method.pillar && (
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium border border-indigo-200">
                        <span>⚗️</span>
                        <span>#{method.pillar.id}</span>
                      </span>
                    )}
                    {method.suitable_for && method.suitable_for.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full font-medium border border-gray-200">
                        <span>👨‍🍳</span>
                        <span>
                          {method.suitable_for.slice(0, 2).join(", ")}
                          {method.suitable_for.length > 2 &&
                            ` +${method.suitable_for.length - 2}`}
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
                    {expandedMethods.has(method.id) ? "−" : "+"}
                  </div>
                </div>
              </div>
            </div>

            {expandedMethods.has(method.id) && (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t-2 border-orange-100 space-y-5">
                {/* Alchemical & Thermodynamic Properties Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* ESMS Properties */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">⚗️</span>
                      <span>Alchemical Properties (ESMS)</span>
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">✨</span>
                        <span className="text-gray-700">Spirit:</span>
                        <span className="font-bold text-yellow-700">
                          {method.esms.Spirit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">💫</span>
                        <span className="text-gray-700">Essence:</span>
                        <span className="font-bold text-blue-700">
                          {method.esms.Essence}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">🌿</span>
                        <span className="text-gray-700">Matter:</span>
                        <span className="font-bold text-green-700">
                          {method.esms.Matter}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-500">🔮</span>
                        <span className="text-gray-700">Substance:</span>
                        <span className="font-bold text-purple-700">
                          {method.esms.Substance}
                        </span>
                      </div>
                    </div>
                    {method.pillar && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <span className="text-xs text-purple-700 font-medium">
                          Pillar #{method.pillar.id}: {method.pillar.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thermodynamic Properties */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">🌡️</span>
                      <span>Thermodynamic Properties</span>
                    </h5>
                    {method.thermodynamicProperties ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">🔥 Heat:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{
                                  width: `${method.thermodynamicProperties.heat * 100}%`,
                                }}
                              />
                            </div>
                            <span className="font-bold text-red-700">
                              {(
                                method.thermodynamicProperties.heat * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">🌀 Entropy:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 rounded-full"
                                style={{
                                  width: `${method.thermodynamicProperties.entropy * 100}%`,
                                }}
                              />
                            </div>
                            <span className="font-bold text-orange-700">
                              {(
                                method.thermodynamicProperties.entropy * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">⚡ Reactivity:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-pink-500 rounded-full"
                                style={{
                                  width: `${method.thermodynamicProperties.reactivity * 100}%`,
                                }}
                              />
                            </div>
                            <span className="font-bold text-pink-700">
                              {(
                                method.thermodynamicProperties.reactivity * 100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-red-200 flex justify-between">
                          <span className="text-gray-700">
                            ⚙️ Greg's Energy:
                          </span>
                          <span
                            className={`font-bold ${method.gregsEnergy >= 0 ? "text-green-700" : "text-red-700"}`}
                          >
                            {method.gregsEnergy >= 0 ? "+" : ""}
                            {method.gregsEnergy.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Thermodynamic data not available
                      </p>
                    )}
                  </div>
                </div>

                {/* Monica & Kalchm Summary */}
                <div className="flex flex-wrap gap-3">
                  {method.monica !== null && !isNaN(method.monica) && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 flex items-center gap-2">
                      <span className="text-lg">🔮</span>
                      <span className="text-sm text-gray-700">Monica:</span>
                      <span className={`font-bold ${method.monicaClass.color}`}>
                        {method.monicaClass.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({method.monica.toFixed(3)})
                      </span>
                    </div>
                  )}
                  {method.kalchm !== null && !isNaN(method.kalchm) && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 flex items-center gap-2">
                      <span className="text-lg">⚖️</span>
                      <span className="text-sm text-gray-700">
                        Kalchm (Equilibrium):
                      </span>
                      <span className="font-bold text-teal-700">
                        {method.kalchm.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                {method.benefits && method.benefits.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <span>Benefits & Effects</span>
                    </h5>
                    <div className="grid md:grid-cols-2 gap-2">
                      {method.benefits.slice(0, 6).map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
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
                      {method.expertTips.slice(0, 3).map((tip, idx) => (
                        <div
                          key={idx}
                          className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm text-gray-800"
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Mistakes */}
                {method.commonMistakes && method.commonMistakes.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <span>Common Mistakes to Avoid</span>
                    </h5>
                    <div className="space-y-2">
                      {method.commonMistakes.slice(0, 4).map((mistake, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-red-500 mt-0.5">✗</span>
                          <span>{mistake}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools Required */}
                {method.toolsRequired && method.toolsRequired.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">🔧</span>
                      <span>Essential Tools</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {method.toolsRequired.slice(0, 8).map((tool, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full border border-blue-200"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pairing Suggestions */}
                {method.pairingSuggestions &&
                  method.pairingSuggestions.length > 0 && (
                    <div>
                      <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">🤝</span>
                        <span>Perfect Pairings</span>
                      </h5>
                      <div className="space-y-2">
                        {method.pairingSuggestions
                          .slice(0, 4)
                          .map((pairing, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="text-purple-600">•</span>
                              <span>{pairing}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Regional Variations */}
                {method.regionalVariations &&
                  Object.keys(method.regionalVariations).length > 0 && (
                    <div>
                      <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">🌍</span>
                        <span>Regional Techniques</span>
                      </h5>
                      <div className="grid md:grid-cols-2 gap-3">
                        {Object.entries(method.regionalVariations)
                          .slice(0, 4)
                          .map(([region, variations]) => (
                            <div
                              key={region}
                              className="bg-white border border-gray-200 rounded-lg p-3"
                            >
                              <div className="font-semibold text-gray-900 mb-2 capitalize">
                                {region.replace(/_/g, " ")}
                              </div>
                              <ul className="space-y-1">
                                {variations
                                  .slice(0, 2)
                                  .map((variation, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-gray-600 flex items-start gap-1"
                                    >
                                      <span>•</span>
                                      <span>{variation}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Suitable For */}
                {method.suitable_for && method.suitable_for.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">👨‍🍳</span>
                      <span>Best Used With</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {method.suitable_for.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-sm bg-gradient-to-r from-orange-50 to-red-50 text-gray-800 px-3 py-1.5 rounded-full font-medium border border-orange-200 shadow-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elemental Effects - De-emphasized at bottom */}
                <div className="pt-4 border-t border-gray-200">
                  <details className="group">
                    <summary className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      <span className="text-lg">⚗️</span>
                      <span>Show Elemental Effects</span>
                      <span className="ml-auto group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {Object.entries(method.elementalEffect).map(
                        ([element, value]) => (
                          <div
                            key={element}
                            className="flex items-center gap-2"
                          >
                            <span className="text-sm">
                              {element === "Fire"
                                ? "🔥"
                                : element === "Water"
                                  ? "💧"
                                  : element === "Earth"
                                    ? "🌍"
                                    : "💨"}
                            </span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
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
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {(value * 100).toFixed(0)}%
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </details>
                </div>
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
