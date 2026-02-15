"use client";

/**
 * Enhanced Cooking Method Recommender Component - REVAMPED
 *
 * Showcases the FULL POWER of the alchemical cooking system with 6 major sections:
 * 1. 🔮 Transformation Overview Card - Top priority metrics
 * 2. ⚗️ Alchemical Transformation Matrix - ESMS display with comparisons
 * 3. 🌡️ Enhanced Thermodynamic Properties - Heat, Entropy, Reactivity, Energy, Kalchm, Monica
 * 4. ⚡ Kinetic Properties Dashboard - P=IV Circuit Model (Power, Force, Velocity, Momentum)
 * 5. 🎯 Optimal Cooking Conditions Calculator - Temperature, Timing, Planetary Hours, Lunar Phases
 * 6. 🌊 Elemental Flow Visualization - Per-element velocity, momentum, force
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import {
  ALCHEMICAL_PILLARS,
  type AlchemicalPillar,
} from "@/constants/alchemicalPillars";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";
import {
  calculateKAlchm,
  calculateMonicaConstant,
} from "@/utils/monicaKalchmCalculations";
import {
  calculateOptimalCookingConditions,
  calculatePillarMonicaModifiers,
  getCookingMethodThermodynamics,
} from "@/constants/alchemicalPillars";
import {
  calculateKinetics,
  type KineticMetrics,
} from "@/calculations/kinetics";
import { calculateGregsEnergy } from "@/calculations/gregsEnergy";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import type {
  AlchemicalProperties,
  ElementalProperties,
} from "@/types/celestial";

interface MethodData {
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
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

// Default planetary positions (fallback when context not available)
const DEFAULT_PLANETARY_POSITIONS = {
  Sun: "Leo" as const,
  Moon: "Cancer" as const,
  Mercury: "Gemini" as const,
  Venus: "Taurus" as const,
  Mars: "Aries" as const,
  Jupiter: "Sagittarius" as const,
  Saturn: "Capricorn" as const,
  Uranus: "Aquarius" as const,
  Neptune: "Pisces" as const,
  Pluto: "Scorpio" as const,
};

// Helper to extract zodiac sign from position data
function extractZodiacSignType(position: unknown): string {
  if (!position) return "Aries";
  if (typeof position === "string") return position;
  if (typeof position === "object" && position !== null) {
    const posObj = position as Record<string, unknown>;
    if (typeof posObj.sign === "string") {
      // Capitalize first letter for consistency
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
    normalized[planet] = extractZodiacSignType(position);
  }

  return normalized;
}

// Classify Monica constant
function classifyMonica(monica: number | null): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (monica === null || isNaN(monica)) {
    return {
      label: "Undefined",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    };
  }
  if (monica > 10) {
    return {
      label: "Highly Volatile",
      color: "text-red-800",
      bgColor: "bg-red-100",
    };
  }
  if (monica > 5) {
    return {
      label: "Volatile",
      color: "text-orange-800",
      bgColor: "bg-orange-100",
    };
  }
  if (monica > 2) {
    return {
      label: "Transformative",
      color: "text-yellow-800",
      bgColor: "bg-yellow-100",
    };
  }
  if (monica > 1) {
    return {
      label: "Balanced",
      color: "text-green-800",
      bgColor: "bg-green-100",
    };
  }
  if (monica > 0.5) {
    return { label: "Stable", color: "text-blue-800", bgColor: "bg-blue-100" };
  }
  return {
    label: "Very Stable",
    color: "text-indigo-800",
    bgColor: "bg-indigo-100",
  };
}

// Get pillar color scheme
function getPillarColors(pillarId: number): {
  bg: string;
  text: string;
  border: string;
} {
  const colorMap: Record<number, { bg: string; text: string; border: string }> =
    {
      1: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
      },
      2: {
        bg: "bg-cyan-100",
        text: "text-cyan-800",
        border: "border-cyan-300",
      },
      3: { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300" },
      4: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        border: "border-indigo-300",
      },
      5: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-300",
      },
      6: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
      },
      7: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
      8: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
      },
      9: {
        bg: "bg-teal-100",
        text: "text-teal-800",
        border: "border-teal-300",
      },
      10: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-300",
      },
      11: {
        bg: "bg-pink-100",
        text: "text-pink-800",
        border: "border-pink-300",
      },
      12: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-300",
      },
      13: {
        bg: "bg-violet-100",
        text: "text-violet-800",
        border: "border-violet-300",
      },
      14: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-300",
      },
    };
  return (
    colorMap[pillarId] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
    }
  );
}

export default function EnhancedCookingMethodRecommender() {
  const [selectedCategory, setSelectedCategory] = useState<string>("dry");
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [showPillarsGuide, setShowPillarsGuide] = useState(false);
  const [planetaryPositions, setPlanetaryPositions] = useState<
    Record<string, string>
  >(DEFAULT_PLANETARY_POSITIONS);
  const [positionsSource, setPositionsSource] = useState<"real" | "fallback">(
    "fallback",
  );

  // Get planetary positions from AlchemicalContext
  let alchemicalContext: ReturnType<typeof useAlchemical> | null = null;
  try {
    alchemicalContext = useAlchemical();
  } catch {
    // Context not available, will use fallback positions
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

  const currentMethods = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    // Calculate BASE alchemical properties from real planetary positions (ESMS)
    // This is calculated once and then transformed per-method by pillar effects
    const baseAlchemicalProperties =
      calculateAlchemicalFromPlanets(planetaryPositions);

    return Object.entries(category.methods)
      .map(([id, method]) => {
        const pillar = getCookingMethodPillar(id);

        // Base ESMS values from planetary positions
        const baseESMS = {
          Spirit: baseAlchemicalProperties?.Spirit ?? 4,
          Essence: baseAlchemicalProperties?.Essence ?? 4,
          Matter: baseAlchemicalProperties?.Matter ?? 4,
          Substance: baseAlchemicalProperties?.Substance ?? 2,
        };

        // Apply pillar transformation effects to get METHOD-SPECIFIC ESMS
        // Each pillar modifies ESMS differently (e.g., Calcination: Spirit -1, Essence +1, Matter +1, Substance -1)
        const transformedESMS = pillar
          ? {
              Spirit: baseESMS.Spirit + (pillar.effects.Spirit || 0),
              Essence: baseESMS.Essence + (pillar.effects.Essence || 0),
              Matter: baseESMS.Matter + (pillar.effects.Matter || 0),
              Substance: baseESMS.Substance + (pillar.effects.Substance || 0),
            }
          : baseESMS;

        // Use method's thermodynamic properties if available, otherwise calculate from pillar
        // This ensures each method gets unique thermodynamic values based on its pillar
        const methodThermo = method.thermodynamicProperties ||
          getCookingMethodThermodynamics(id) || {
            heat: 0.5,
            entropy: 0.5,
            reactivity: 0.5,
          };

        // Calculate Greg's Energy using TRANSFORMED ESMS and method elementals
        const gregsEnergy = calculateGregsEnergy({
          Spirit: transformedESMS.Spirit,
          Essence: transformedESMS.Essence,
          Matter: transformedESMS.Matter,
          Substance: transformedESMS.Substance,
          Fire: method.elementalEffect.Fire,
          Water: method.elementalEffect.Water,
          Air: method.elementalEffect.Air,
          Earth: method.elementalEffect.Earth,
        }).gregsEnergy;

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

        // Store both base and transformed ESMS for display
        const alchemicalProperties = transformedESMS;

        // Calculate pillar-specific Monica modifiers if monica constant is available
        const monicaModifiers =
          monica !== null
            ? calculatePillarMonicaModifiers(monica)
            : {
                temperatureAdjustment: 0,
                timingAdjustment: 0,
                intensityModifier: "neutral" as const,
              };

        // Calculate optimal cooking conditions
        const optimalConditions =
          method.thermodynamicProperties && monica !== null
            ? calculateOptimalCookingConditions(
                monica,
                method.thermodynamicProperties,
              )
            : null;

        // Calculate kinetic metrics using real planetary positions
        let kinetics: KineticMetrics | null = null;
        try {
          kinetics = calculateKinetics({
            currentPlanetaryPositions: planetaryPositions,
            timeInterval: 1,
          });
        } catch (error) {
          console.warn(`Failed to calculate kinetics for ${id}:`, error);
        }

        return {
          id,
          ...method,
          alchemicalProperties,
          pillar,
          kalchm,
          monica,
          monicaClass: classifyMonica(monica),
          monicaModifiers,
          gregsEnergy,
          optimalConditions,
          kinetics,
        };
      })
      .sort((a, b) => b.gregsEnergy - a.gregsEnergy);
      // .slice(0, 8); // TEMPORARY: Show everything
  }, [selectedCategory, planetaryPositions]);

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

  // ==================== SECTION 1: TRANSFORMATION OVERVIEW CARD ====================
  const renderTransformationOverview = (method: (typeof currentMethods)[0]) => {
    const { monicaClass, kalchm, gregsEnergy, pillar } = method;
    const pillarColors = pillar ? getPillarColors(pillar.id) : null;

    return (
      <div
        className={`rounded-xl border-2 p-4 ${pillarColors?.border || "border-indigo-300"} ${pillarColors?.bg || "bg-indigo-50"} shadow-lg`}
      >
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          🔮 Transformation Overview
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Monica Classification */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Monica Classification
            </div>
            <div
              className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${monicaClass.bgColor} ${monicaClass.color}`}
            >
              {monicaClass.label}
            </div>
          </div>

          {/* Kalchm Value */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Kalchm (Equilibrium)
            </div>
            <div className="text-xl font-bold text-purple-700">
              {kalchm !== null && !isNaN(kalchm) ? kalchm.toFixed(4) : "N/A"}
            </div>
          </div>

          {/* Greg's Energy */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Greg's Energy
            </div>
            <div
              className={`text-xl font-bold ${gregsEnergy >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              {gregsEnergy >= 0 ? "+" : ""}
              {gregsEnergy.toFixed(3)}
              <span className="ml-1 text-sm">⚙️</span>
            </div>
          </div>

          {/* Pillar Badge */}
          {pillar && (
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="mb-1 text-xs font-medium text-gray-600">
                Alchemical Pillar
              </div>
              <div
                className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${pillarColors?.bg} ${pillarColors?.text}`}
              >
                #{pillar.id} {pillar.name}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== SECTION 2: ALCHEMICAL TRANSFORMATION MATRIX ====================
  const renderAlchemicalMatrix = (method: (typeof currentMethods)[0]) => {
    if (!method.alchemicalProperties) {
      return (
        <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4 shadow-lg">
          <h3 className="mb-3 text-lg font-bold text-gray-700">
            ⚗️ Alchemical Transformation Matrix (ESMS)
          </h3>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              No alchemical properties available for this cooking method.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This method may not have planetary associations or ESMS
              calculations defined.
            </p>
          </div>
        </div>
      );
    }

    const { Spirit, Essence, Matter, Substance } = method.alchemicalProperties;
    const properties = [
      {
        name: "Spirit",
        value: Spirit,
        color: "bg-yellow-500",
        icon: "✨",
        textColor: "text-yellow-700",
      },
      {
        name: "Essence",
        value: Essence,
        color: "bg-blue-500",
        icon: "💫",
        textColor: "text-blue-700",
      },
      {
        name: "Matter",
        value: Matter,
        color: "bg-green-500",
        icon: "🌿",
        textColor: "text-green-700",
      },
      {
        name: "Substance",
        value: Substance,
        color: "bg-purple-500",
        icon: "🔮",
        textColor: "text-purple-700",
      },
    ];

    return (
      <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          ⚗️ Alchemical Transformation Matrix (ESMS)
        </h3>

        <div className="space-y-3">
          {properties.map(({ name, value, color, icon, textColor }) => {
            const normalizedValue = ((value + 5) / 10) * 100; // Normalize to 0-100% (assuming range -5 to +5)
            const displayValue = Math.max(0, Math.min(100, normalizedValue));

            return (
              <div key={name} className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="w-24">
                  <div className="text-sm font-bold text-gray-700">{name}</div>
                  <div className={`text-xs ${textColor}`}>
                    {value > 0 ? "+" : ""}
                    {value}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${displayValue}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                      {displayValue.toFixed(0)}%
                    </div>
                  </div>
                </div>
                {/* Transformation direction */}
                <div className="w-10 text-center text-lg">
                  {value > 2 ? "⬆️" : value < -2 ? "⬇️" : "↔️"}
                </div>
              </div>
            );
          })}
        </div>

        {method.pillar && (
          <div className="mt-3 rounded-lg bg-white p-2 text-center">
            <div className="text-xs font-medium text-gray-600">
              Pillar Effects:{" "}
              {Object.entries(method.pillar.effects)
                .map(([prop, val]) => `${prop} ${val > 0 ? "+" : ""}${val}`)
                .join(", ")}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== SECTION 3: ENHANCED THERMODYNAMIC PROPERTIES ====================
  const renderThermodynamicDashboard = (method: (typeof currentMethods)[0]) => {
    if (!method.thermodynamicProperties) {
      return (
        <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4 shadow-lg">
          <h3 className="mb-3 text-lg font-bold text-gray-700">
            🌡️ Thermodynamic Properties Dashboard
          </h3>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              No thermodynamic data available for this cooking method.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Heat, Entropy, and Reactivity calculations are not defined for
              this method.
            </p>
          </div>
        </div>
      );
    }

    const { heat, entropy, reactivity } = method.thermodynamicProperties;
    const { gregsEnergy, kalchm, monica } = method;

    const properties = [
      {
        name: "Heat",
        value: heat,
        icon: "🔥",
        color: "bg-red-500",
        desc: "Active energy potential",
      },
      {
        name: "Entropy",
        value: entropy,
        icon: "🌀",
        color: "bg-orange-500",
        desc: "System disorder",
      },
      {
        name: "Reactivity",
        value: reactivity,
        icon: "⚡",
        color: "bg-pink-500",
        desc: "Change potential",
      },
    ];

    return (
      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          🌡️ Thermodynamic Properties Dashboard
        </h3>

        {/* Main metrics */}
        <div className="mb-4 space-y-2">
          {properties.map(({ name, value, icon, color, desc }) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div className="w-24">
                <div className="text-sm font-bold text-gray-700">{name}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <div className="flex-1">
                <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${Math.round(value * 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                    {(value * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-sm font-semibold text-gray-700">
                {value.toFixed(3)}
              </div>
            </div>
          ))}
        </div>

        {/* Derived metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Greg's Energy ⚙️
            </div>
            <div
              className={`text-lg font-bold ${gregsEnergy >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              {gregsEnergy >= 0 ? "+" : ""}
              {gregsEnergy.toFixed(4)}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Heat - (Entropy × Reactivity)
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Kalchm (K_alchm)
            </div>
            <div className="text-lg font-bold text-purple-700">
              {kalchm !== null && !isNaN(kalchm) ? kalchm.toFixed(4) : "N/A"}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Alchemical equilibrium
            </div>
          </div>
        </div>

        {/* Monica breakdown */}
        {monica !== null && !isNaN(monica) && (
          <div className="mt-3 rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-2 text-xs font-medium text-gray-600">
              Monica Constant Calculation
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div>
                Monica Value:{" "}
                <span className="font-bold text-purple-700">
                  {monica.toFixed(4)}
                </span>
              </div>
              <div>
                Classification:{" "}
                <span className={`font-bold ${method.monicaClass.color}`}>
                  {method.monicaClass.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== SECTION 4: KINETIC PROPERTIES DASHBOARD ====================
  const renderKineticDashboard = (method: (typeof currentMethods)[0]) => {
    if (!method.kinetics) {
      return (
        <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4 shadow-lg">
          <h3 className="mb-3 text-lg font-bold text-gray-700">
            ⚡ Kinetic Properties (P=IV Circuit Model)
          </h3>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              No kinetic data available for this cooking method.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Power, Force, Velocity, and Momentum calculations require
              alchemical properties.
            </p>
          </div>
        </div>
      );
    }

    const {
      power,
      potential,
      currentFlow,
      charge,
      forceMagnitude,
      forceClassification,
      thermalDirection,
      aspectPhase,
    } = method.kinetics;

    return (
      <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          ⚡ Kinetic Properties (P=IV Circuit Model)
        </h3>

        {/* Primary metrics */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Power (P = I × V)
            </div>
            <div className="text-2xl font-bold text-indigo-700">
              {power.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500">
              Total transformation power
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Force Magnitude
            </div>
            <div className="text-2xl font-bold text-pink-700">
              {forceMagnitude.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500">Transformative force</div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Charge (Q)
            </div>
            <div className="text-xl font-bold text-green-700">
              {charge.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500">Matter + Substance</div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Potential (V)
            </div>
            <div className="text-xl font-bold text-blue-700">
              {potential?.toFixed(3) ?? "N/A"}
            </div>
            <div className="text-xs text-gray-500">Energy per unit charge</div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Current (I)
            </div>
            <div className="text-xl font-bold text-yellow-700">
              {currentFlow.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500">Rate of charge flow</div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Force Classification
            </div>
            <div
              className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                forceClassification === "accelerating"
                  ? "bg-green-100 text-green-800"
                  : forceClassification === "balanced"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-orange-100 text-orange-800"
              }`}
            >
              {forceClassification.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Thermal & Aspect Phase */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Thermal Direction 🌡️
            </div>
            <div
              className={`text-sm font-bold ${
                thermalDirection === "heating"
                  ? "text-red-700"
                  : thermalDirection === "cooling"
                    ? "text-blue-700"
                    : "text-gray-700"
              }`}
            >
              {thermalDirection.toUpperCase()}
              {thermalDirection === "heating" && " 🔥"}
              {thermalDirection === "cooling" && " ❄️"}
              {thermalDirection === "stable" && " ➖"}
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Aspect Phase ⭐
            </div>
            <div
              className={`text-sm font-bold ${
                aspectPhase?.type === "applying"
                  ? "text-green-700"
                  : aspectPhase?.type === "exact"
                    ? "text-purple-700"
                    : "text-orange-700"
              }`}
            >
              {aspectPhase?.type.toUpperCase() ?? "N/A"}
              {aspectPhase?.type === "exact" && " 🎯 +20% Energy!"}
              {aspectPhase?.type === "applying" && " ⬆️ +10% Energy"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== SECTION 5: OPTIMAL COOKING CONDITIONS ====================
  const renderOptimalConditions = (method: (typeof currentMethods)[0]) => {
    if (!method.optimalConditions) {
      return (
        <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4 shadow-lg">
          <h3 className="mb-3 text-lg font-bold text-gray-700">
            🎯 Optimal Cooking Conditions
          </h3>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              No optimal conditions calculated for this cooking method.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Temperature, timing, and planetary recommendations require
              thermodynamic and Monica constant data.
            </p>
          </div>
        </div>
      );
    }

    const { temperature, timing, planetaryHours, lunarPhases } =
      method.optimalConditions;
    const { monicaModifiers } = method;

    return (
      <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          🎯 Optimal Cooking Conditions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Temperature */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Recommended Temperature
            </div>
            <div className="text-2xl font-bold text-red-700">
              {temperature}°F
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(((temperature - 32) * 5) / 9)}°C
            </div>
          </div>

          {/* Timing */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Optimal Timing
            </div>
            <div
              className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${
                timing === "quick"
                  ? "bg-yellow-100 text-yellow-800"
                  : timing === "slow"
                    ? "bg-blue-100 text-blue-800"
                    : timing === "steady"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {timing.toUpperCase()}
            </div>
          </div>

          {/* Planetary Hours */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Best Planetary Hours ☀️
            </div>
            <div className="flex flex-wrap gap-1">
              {planetaryHours.map((planet) => (
                <span
                  key={planet}
                  className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                >
                  {planet}
                </span>
              ))}
            </div>
          </div>

          {/* Lunar Phases */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-600">
              Lunar Phase Recommendations 🌙
            </div>
            <div className="flex flex-wrap gap-1">
              {lunarPhases.map((phase) => (
                <span
                  key={phase}
                  className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800"
                >
                  {phase.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Monica Modifiers */}
        {monicaModifiers && (
          <div className="mt-3 rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-2 text-xs font-bold text-gray-700">
              Monica Modifiers Applied:
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Temp Adjust:</span>{" "}
                <span className="font-bold text-red-700">
                  {((monicaModifiers as any)?.temperatureAdjustment ?? 0) >= 0
                    ? "+"
                    : ""}
                  {(
                    (monicaModifiers as any)?.temperatureAdjustment ?? 0
                  ).toFixed(0)}
                  °F
                </span>
              </div>
              <div>
                <span className="text-gray-600">Time Adjust:</span>{" "}
                <span className="font-bold text-blue-700">
                  {((monicaModifiers as any)?.timingAdjustment ?? 0) >= 0
                    ? "+"
                    : ""}
                  {((monicaModifiers as any)?.timingAdjustment ?? 0).toFixed(0)}{" "}
                  min
                </span>
              </div>
              <div>
                <span className="text-gray-600">Intensity:</span>{" "}
                <span className="font-bold text-green-700">
                  {(monicaModifiers as any)?.intensityModifier ?? "neutral"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== SECTION 6: ELEMENTAL FLOW VISUALIZATION ====================
  const renderElementalFlow = (method: (typeof currentMethods)[0]) => {
    if (!method.kinetics) {
      return (
        <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-4 shadow-lg">
          <h3 className="mb-3 text-lg font-bold text-gray-700">
            🌊 Elemental Flow Visualization
          </h3>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              No elemental flow data available for this cooking method.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Velocity, Momentum, and Force calculations require kinetic
              properties.
            </p>
          </div>
        </div>
      );
    }

    const { velocity, momentum, force } = method.kinetics;
    const elements = ["Fire", "Water", "Earth", "Air"] as const;

    return (
      <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          🌊 Elemental Flow Visualization
        </h3>

        <div className="space-y-3">
          {elements.map((element) => {
            const vel = velocity[element];
            const mom = momentum[element];
            const forceValue = force[element];

            const elementIcons: Record<string, string> = {
              Fire: "🔥",
              Water: "💧",
              Earth: "🌍",
              Air: "💨",
            };

            return (
              <div key={element} className="rounded-lg bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">{elementIcons[element]}</span>
                  <span className="text-sm font-bold text-gray-800">
                    {element}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-600">Velocity (d/dt)</div>
                    <div className="font-bold text-blue-700">
                      {vel.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Momentum (m×v)</div>
                    <div className="font-bold text-purple-700">
                      {mom.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Force (F)</div>
                    <div className="font-bold text-pink-700">
                      {forceValue.toFixed(3)}
                    </div>
                  </div>
                </div>

                {/* Visual flow meter */}
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        element === "Fire"
                          ? "bg-red-500"
                          : element === "Water"
                            ? "bg-blue-500"
                            : element === "Earth"
                              ? "bg-green-500"
                              : "bg-sky-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.abs(forceValue) * 20)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 text-4xl font-bold text-gray-900">
          ⚗️ Alchemical Cooking Transformation System
        </h2>
        <p className="text-lg text-gray-600">
          Explore the Full Power of the 14 Pillars with Advanced Metrics
        </p>
        {/* Planetary Data Source Indicator */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              positionsSource === "real"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {positionsSource === "real" ? "🌟" : "⏳"}
            {positionsSource === "real"
              ? "Using Real-Time Planetary Positions"
              : "Using Default Planetary Positions"}
          </span>
        </div>
        <button
          onClick={() => setShowPillarsGuide(!showPillarsGuide)}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          {showPillarsGuide ? "▼ Hide" : "▶ Show"} 14 Pillars Guide
        </button>
      </div>

      {/* 14 Pillars Guide */}
      {showPillarsGuide && (
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 p-6 shadow-lg">
          <h3 className="mb-4 text-2xl font-bold text-indigo-900">
            The 14 Alchemical Pillars
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ALCHEMICAL_PILLARS.map((pillar) => {
              const colors = getPillarColors(pillar.id);
              return (
                <div
                  key={pillar.id}
                  className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 shadow-md`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`font-bold ${colors.text}`}>
                      {pillar.id}. {pillar.name}
                    </span>
                    {pillar.elementalAssociations && (
                      <span className="text-2xl">
                        {pillar.elementalAssociations.primary === "Fire" &&
                          "🔥"}
                        {pillar.elementalAssociations.primary === "Water" &&
                          "💧"}
                        {pillar.elementalAssociations.primary === "Earth" &&
                          "🌍"}
                        {pillar.elementalAssociations.primary === "Air" && "💨"}
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-xs text-gray-700">
                    {pillar.description}
                  </p>
                  <div className="text-xs text-gray-600">
                    <strong>Effects:</strong>{" "}
                    {Object.entries(pillar.effects)
                      .map(
                        ([prop, val]) => `${prop} ${val > 0 ? "+" : ""}${val}`,
                      )
                      .join(", ")}
                  </div>
                  {pillar.planetaryAssociations && (
                    <div className="mt-1 text-xs text-gray-600">
                      <strong>Planets:</strong>{" "}
                      {pillar.planetaryAssociations.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Selector */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`transform rounded-xl px-6 py-3 font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              selectedCategory === cat.id
                ? "scale-105 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white"
                : "border-2 border-purple-300 bg-white text-gray-800 hover:border-purple-500"
            }`}
          >
            <span className="mr-2 text-2xl">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Category Info */}
      <div className="rounded-xl border-l-4 border-purple-600 bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 p-5 shadow-md">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{category?.icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {category?.name} Methods
            </h3>
            <p className="text-sm text-gray-700">
              {currentMethods.length} transformation methods • Sorted by Energy
              Potential
            </p>
          </div>
        </div>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 gap-6">
        {currentMethods.map((method) => {
          if (!method) return null; // Defensive check
          const isExpanded = expandedMethod === method.id;

          return (
            <div
              key={method.id}
              className={`cursor-pointer rounded-xl border-2 p-6 shadow-lg transition-all duration-300 ${
                isExpanded
                  ? "border-purple-500 bg-gradient-to-br from-purple-50 via-pink-50 to-white shadow-2xl"
                  : "border-gray-300 bg-white hover:border-purple-400 hover:shadow-xl"
              }`}
              onClick={() => toggleMethod(method.id)}
            >
              {/* Method Header */}
              <div className="mb-4">
                <h4 className="text-2xl font-bold capitalize text-gray-900">
                  {method.name}
                </h4>
                <p className="mt-2 text-sm text-gray-600">
                  {method.description}
                </p>
              </div>

              {/* Quick Metrics Row */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  ⏱️ {formatDuration(method)}
                </span>
                <span
                  className={`rounded-lg px-3 py-1 text-sm font-medium ${
                    method.gregsEnergy >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  ⚡ Energy: {method.gregsEnergy.toFixed(2)}
                </span>
                {method.monica !== null && !isNaN(method.monica) && (
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${method.monicaClass.bgColor} ${method.monicaClass.color}`}
                  >
                    🔮 {method.monicaClass.label}
                  </span>
                )}
                {method.pillar && (
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-medium ${getPillarColors(method.pillar.id).bg} ${getPillarColors(method.pillar.id).text}`}
                  >
                    Pillar #{method.pillar.id}
                  </span>
                )}
              </div>

              {/* Expanded Sections */}
              {isExpanded && (
                <div className="space-y-4 border-t-2 border-purple-200 pt-4">
                  {/* Section 1: Transformation Overview */}
                  {renderTransformationOverview(method)}

                  {/* Section 2: Alchemical Matrix */}
                  {renderAlchemicalMatrix(method)}

                  {/* Section 3: Thermodynamic Dashboard */}
                  {renderThermodynamicDashboard(method)}

                  {/* Section 4: Kinetic Dashboard */}
                  {renderKineticDashboard(method)}

                  {/* Section 5: Optimal Conditions */}
                  {renderOptimalConditions(method)}

                  {/* Section 6: Elemental Flow */}
                  {renderElementalFlow(method)}

                  {/* Additional Info Sections */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Pillar Details */}
                    {method.pillar && (
                      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-2 text-sm font-bold text-gray-800">
                          📜 Pillar Details
                        </h4>
                        <p className="mb-2 text-xs text-gray-600">
                          {method.pillar.description}
                        </p>
                        {method.pillar.planetaryAssociations && (
                          <div className="mb-1 text-xs">
                            <strong>Planets:</strong>{" "}
                            {(method.pillar.planetaryAssociations || []).join(", ")}
                          </div>
                        )}
                        {method.pillar.tarotAssociations && (
                          <div className="text-xs">
                            <strong>Tarot:</strong>{" "}
                            {(method.pillar.tarotAssociations || []).join(", ")}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suitable For */}
                    {method.suitable_for && method.suitable_for.length > 0 && (
                      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                        <h4 className="mb-2 text-sm font-bold text-gray-800">
                          ✅ Suitable For
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {method.suitable_for.slice(0, 5).map((item, idx) => (
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
                      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 text-sm font-bold text-gray-800">
                          💎 Benefits
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-xs text-gray-700">
                          {method.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expert Tips */}
                    {method.expertTips && method.expertTips.length > 0 && (
                      <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                        <h4 className="mb-2 text-sm font-bold text-gray-800">
                          💡 Expert Tips
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-xs text-gray-700">
                          {method.expertTips.slice(0, 2).map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Expand/Collapse Indicator */}
              <div className="mt-4 text-center">
                <div className="inline-block rounded-full bg-purple-100 px-4 py-1 text-xs font-medium text-purple-700">
                  {isExpanded
                    ? "▲ Click to collapse"
                    : "▼ Click to expand and view full transformation analysis"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 rounded-xl border-2 border-purple-300 bg-purple-50 p-6 text-center shadow-lg">
        <h3 className="mb-2 text-xl font-bold text-purple-900">
          🌟 Alchemical Cooking System v2.0
        </h3>
        <p className="text-sm text-purple-700">
          Powered by: 14 Alchemical Pillars • ESMS Transformations •
          Thermodynamic Analysis • P=IV Kinetic Model • Monica Constants •
          Planetary Alignments • Elemental Harmony
        </p>
      </div>
    </div>
  );
}
