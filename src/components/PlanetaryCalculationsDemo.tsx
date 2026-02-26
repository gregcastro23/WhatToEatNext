/**
 * Planetary Calculations Demo Component
 *
 * Displays all calculated quantities for the current planetary configuration:
 * - Live planetary positions
 * - ESMS alchemical properties (Spirit, Essence, Matter, Substance)
 * - Elemental properties (Fire, Water, Earth, Air)
 * - Thermodynamic metrics (Heat, Entropy, Reactivity, Greg's Energy, Kalchm, Monica)
 */

"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import type { ElementalProperties } from "@/types/alchemy";
import {
  calculateKineticProperties,
  type KineticMetrics,
} from "@/utils/kineticCalculations";
import {
  calculateThermodynamicMetrics,
  type ThermodynamicMetrics,
} from "@/utils/monicaKalchmCalculations";
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  type AlchemicalProperties,
  type ZodiacSignType,
} from "@/utils/planetaryAlchemyMapping";

// Planet symbols and colors
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};

const PLANET_COLORS: Record<string, string> = {
  Sun: "#FFD700",
  Moon: "#C0C0C0",
  Mercury: "#FFA500",
  Venus: "#FF69B4",
  Mars: "#FF0000",
  Jupiter: "#800080",
  Saturn: "#8B4513",
  Uranus: "#00CED1",
  Neptune: "#4169E1",
  Pluto: "#8B008B",
};

// Zodiac symbols
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

// Planetary dignities
const PLANETARY_RULERS: Record<string, string[]> = {
  Sun: ["leo"],
  Moon: ["cancer"],
  Mercury: ["gemini", "virgo"],
  Venus: ["taurus", "libra"],
  Mars: ["aries", "scorpio"],
  Jupiter: ["sagittarius", "pisces"],
  Saturn: ["capricorn", "aquarius"],
  Uranus: ["aquarius"],
  Neptune: ["pisces"],
  Pluto: ["scorpio"],
};

const PLANETARY_EXALTATIONS: Record<string, string> = {
  Sun: "aries",
  Moon: "taurus",
  Mercury: "virgo",
  Venus: "pisces",
  Mars: "capricorn",
  Jupiter: "cancer",
  Saturn: "libra",
};

interface PlanetaryPosition {
  sign: ZodiacSignType;
  degree: number;
  minute: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

interface PlanetaryData {
  positions: Record<string, PlanetaryPosition>;
  timestamp: Date;
}

interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: string;
  orb: number;
  exact: boolean;
}

// Helper function to calculate planetary aspects
function calculateAspects(
  positions: Record<string, PlanetaryPosition>,
): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  const planetNames = Object.keys(positions);
  const aspectTypes = [
    { name: "Conjunction", angle: 0, orb: 8 },
    { name: "Sextile", angle: 60, orb: 6 },
    { name: "Square", angle: 90, orb: 8 },
    { name: "Trine", angle: 120, orb: 8 },
    { name: "Opposition", angle: 180, orb: 8 },
  ];

  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i];
      const planet2 = planetNames[j];
      const long1 = positions[planet1].exactLongitude;
      const long2 = positions[planet2].exactLongitude;

      let diff = Math.abs(long1 - long2);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of aspectTypes) {
        const orbDiff = Math.abs(diff - aspectType.angle);
        if (orbDiff <= aspectType.orb) {
          aspects.push({
            planet1,
            planet2,
            aspectType: aspectType.name,
            orb: orbDiff,
            exact: orbDiff < 1,
          });
        }
      }
    }
  }

  return aspects;
}

// Helper function to get planetary dignity
function getPlanetaryDignity(planet: string, sign: string): string | null {
  const lowerSign = sign.toLowerCase();

  // Check rulership
  if (PLANETARY_RULERS[planet]?.includes(lowerSign)) {
    return "Ruler";
  }

  // Check exaltation
  if (PLANETARY_EXALTATIONS[planet] === lowerSign) {
    return "Exalted";
  }

  return null;
}

export const PlanetaryCalculationsDemo: React.FC = () => {
  const [planetaryData, setPlanetaryData] = useState<PlanetaryData | null>(
    null,
  );
  const [alchemicalProps, setAlchemicalProps] =
    useState<AlchemicalProperties | null>(null);
  const [elementalProps, setElementalProps] =
    useState<ElementalProperties | null>(null);
  const [thermodynamicMetrics, setThermodynamicMetrics] =
    useState<ThermodynamicMetrics | null>(null);
  const [kineticMetrics, setKineticMetrics] = useState<KineticMetrics | null>(
    null,
  );
  const [aspects, setAspects] = useState<PlanetaryAspect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAspects, setShowAspects] = useState(false);
  const [showKinetics, setShowKinetics] = useState(false);

  // Fetch current planetary positions
  const fetchPlanetaryPositions = async () => {
    try {
      setError(null);
      const response = await fetch("/api/astrologize");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract planetary positions
      const positions: Record<string, PlanetaryPosition> = {};
      const planetaryPositionsMap: Record<string, string> = {};

      const planets = [
        "sun",
        "moon",
        "mercury",
        "venus",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
        "pluto",
      ];

      for (const planetKey of planets) {
        const planetData = data._celestialBodies?.[planetKey];
        if (planetData) {
          const planetName =
            planetKey.charAt(0).toUpperCase() + planetKey.slice(1);
          const signKey = planetData.Sign?.key || planetData.Sign?.zodiac;

          positions[planetName] = {
            sign: signKey as ZodiacSignType,
            degree:
              planetData.ChartPosition?.Ecliptic?.ArcDegrees?.degrees || 0,
            minute:
              planetData.ChartPosition?.Ecliptic?.ArcDegrees?.minutes || 0,
            exactLongitude:
              planetData.ChartPosition?.Ecliptic?.DecimalDegrees || 0,
            isRetrograde: planetData.isRetrograde || false,
          };

          // Capitalize the sign for the mapping (Aries, Taurus, etc.)
          const capitalizedSign =
            signKey.charAt(0).toUpperCase() + signKey.slice(1);
          planetaryPositionsMap[planetName] = capitalizedSign;
        }
      }

      setPlanetaryData({
        positions,
        timestamp: new Date(),
      });

      // Calculate alchemical properties (ESMS)
      const alchemical = calculateAlchemicalFromPlanets(planetaryPositionsMap);
      setAlchemicalProps(alchemical);

      // Calculate elemental properties
      const elemental = aggregateZodiacElementals(planetaryPositionsMap);
      setElementalProps(elemental);

      // Calculate thermodynamic metrics
      const thermo = calculateThermodynamicMetrics(alchemical, elemental);
      setThermodynamicMetrics(thermo);

      // Calculate kinetic metrics (P=IV circuit model)
      const kinetic = calculateKineticProperties(alchemical, elemental, thermo);
      setKineticMetrics(kinetic);

      // Calculate planetary aspects
      const calculatedAspects = calculateAspects(positions);
      setAspects(calculatedAspects);

      setIsLoading(false);
    } catch (err) {
      void logger.error("Error fetching planetary positions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlanetaryPositions();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(
      () => {
        void fetchPlanetaryPositions();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Export data function
  const exportData = () => {
    if (!planetaryData) return;

    const exportObj = {
      timestamp: planetaryData.timestamp.toISOString(),
      positions: planetaryData.positions,
      alchemical: alchemicalProps,
      elemental: elementalProps,
      thermodynamic: thermodynamicMetrics,
      kinetic: kineticMetrics,
      aspects,
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `planetary-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-red-600">
            <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
            <p>{error}</p>
            <button
              onClick={() => void fetchPlanetaryPositions()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🌟 Planetary Calculations Demo
            </h1>
            <p className="text-purple-100">
              Live calculations for current planetary configuration
            </p>
            {planetaryData && (
              <p className="text-sm text-purple-200 mt-2">
                Last updated: {planetaryData.timestamp.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void fetchPlanetaryPositions()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              title="Refresh planetary data"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh
                  ? "bg-green-500/30 hover:bg-green-500/40"
                  : "bg-white/20 hover:bg-white/30"
              }`}
              title={
                autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"
              }
            >
              {autoRefresh ? "⏸️ Auto" : "▶️ Manual"}
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              title="Export all data as JSON"
            >
              💾 Export
            </button>
          </div>
        </div>
      </div>

      {/* Planetary Positions */}
      {planetaryData && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🪐 Current Planetary Positions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(planetaryData.positions).map(([planet, pos]) => {
              const dignity = getPlanetaryDignity(planet, pos.sign);
              const planetColor = PLANET_COLORS[planet] || "#6B7280";

              return (
                <div
                  key={planet}
                  className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: planetColor, borderLeftWidth: 4 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-2xl"
                      style={{ color: planetColor }}
                      title={planet}
                    >
                      {PLANET_SYMBOLS[planet]}
                    </span>
                    <div className="font-bold text-purple-900">{planet}</div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">
                        {ZODIAC_SYMBOLS[pos.sign.toLowerCase()]}
                      </span>
                      <span>
                        {pos.sign.charAt(0).toUpperCase() + pos.sign.slice(1)}{" "}
                        {pos.degree}° {pos.minute}'
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {pos.exactLongitude.toFixed(2)}°
                    </div>
                    {pos.isRetrograde && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        ℞ Retrograde
                      </span>
                    )}
                    {dignity && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        {dignity}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alchemical Properties (ESMS) */}
      {alchemicalProps && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Alchemical Properties (ESMS)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Calculated from planetary positions using{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              calculateAlchemicalFromPlanets()
            </code>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(
              Object.entries(alchemicalProps) as Array<[
                keyof AlchemicalProperties,
                number,
              ]>
            ).map(([property, value]) => (
              <div
                key={property}
                className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
              >
                <div className="text-sm text-gray-600">{property}</div>
                <div className="text-3xl font-bold text-green-900 mt-1">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-900">
              <strong>Formula:</strong> Each planet contributes specific ESMS
              values based on its nature. Sum of all planetary contributions.
            </div>
          </div>
        </div>
      )}

      {/* Elemental Properties */}
      {elementalProps && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔥 Elemental Properties
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Calculated from zodiac signs using{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              aggregateZodiacElementals()
            </code>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(
              Object.entries(elementalProps) as Array<[
                keyof ElementalProperties,
                number,
              ]>
            ).map(([element, value]) => {
              const colors = {
                Fire: "from-red-50 to-orange-50 border-red-200 text-red-900",
                Water: "from-blue-50 to-cyan-50 border-blue-200 text-blue-900",
                Earth:
                  "from-amber-50 to-yellow-50 border-amber-200 text-amber-900",
                Air: "from-sky-50 to-indigo-50 border-sky-200 text-sky-900",
              };
              return (
                <div
                  key={element}
                  className={`p-4 bg-gradient-to-br rounded-xl border ${colors[element]}`}
                >
                  <div className="text-sm opacity-75">{element}</div>
                  <div className="text-3xl font-bold mt-1">
                    {(value * 100).toFixed(1)}%
                  </div>
                  <div className="mt-2 w-full bg-white/50 rounded-full h-2">
                    <div
                      className="bg-current h-2 rounded-full transition-all duration-500"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-900">
              <strong>Formula:</strong> Each planet in a zodiac sign contributes
              that sign&apos;s element. Normalized to sum = 1.0.
            </div>
          </div>
        </div>
      )}

      {/* Thermodynamic Metrics */}
      {thermodynamicMetrics && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ⚡ Thermodynamic Metrics
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Calculated using{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              calculateThermodynamicMetrics()
            </code>
          </p>

          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <div className="text-sm text-gray-600">Heat</div>
              <div className="text-3xl font-bold text-orange-900 mt-1">
                {thermodynamicMetrics.heat.toFixed(4)}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air
                + Earth)²
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="text-sm text-gray-600">Entropy</div>
              <div className="text-3xl font-bold text-purple-900 mt-1">
                {thermodynamicMetrics.entropy.toFixed(4)}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter +
                Earth + Water)²
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <div className="text-sm text-gray-600">Reactivity</div>
              <div className="text-3xl font-bold text-cyan-900 mt-1">
                {thermodynamicMetrics.reactivity.toFixed(4)}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) /
                (Matter + Earth)²
              </div>
            </div>
          </div>

          {/* Derived Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
              <div className="text-sm text-gray-600">Greg&apos;s Energy</div>
              <div className="text-3xl font-bold text-yellow-900 mt-1">
                {thermodynamicMetrics.gregsEnergy.toFixed(6)}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Heat - (Entropy × Reactivity)
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-200">
              <div className="text-sm text-gray-600">Kalchm (K_alchm)</div>
              <div className="text-3xl font-bold text-indigo-900 mt-1">
                {thermodynamicMetrics.kalchm.toFixed(6)}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                (Spirit^Spirit × Essence^Essence) / (Matter^Matter ×
                Substance^Substance)
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200">
              <div className="text-sm text-gray-600">Monica Constant</div>
              <div className="text-3xl font-bold text-rose-900 mt-1">
                {thermodynamicMetrics.monica.toFixed(6)}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                -Greg&apos;s Energy / (Reactivity × ln(K_alchm))
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-sm text-blue-900">
              <strong>Note:</strong> All thermodynamic calculations are based on
              the hierarchical culinary data system. ESMS properties MUST come
              from planetary positions, NOT from elemental approximations.
            </div>
          </div>
        </div>
      )}

      {/* Kinetic Metrics (P=IV Circuit Model) */}
      {kineticMetrics && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              ⚡ Kinetic Properties (P=IV Circuit Model)
            </h2>
            <button
              onClick={() => setShowKinetics(!showKinetics)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {showKinetics ? "Hide" : "Show"}
            </button>
          </div>

          {showKinetics && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Calculated using{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  calculateKineticProperties()
                </code>
              </p>

              {/* Circuit Model Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                  <div className="text-sm text-gray-600">Charge (Q)</div>
                  <div className="text-3xl font-bold text-yellow-900 mt-1">
                    {kineticMetrics.charge.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Matter + Substance
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="text-sm text-gray-600">
                    Potential Diff. (V)
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mt-1">
                    {kineticMetrics.potentialDifference.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Greg&apos;s Energy / Q
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-sm text-gray-600">Current Flow (I)</div>
                  <div className="text-3xl font-bold text-green-900 mt-1">
                    {kineticMetrics.currentFlow.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Reactivity × Q × 0.1
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="text-sm text-gray-600">Power (P)</div>
                  <div className="text-3xl font-bold text-purple-900 mt-1">
                    {kineticMetrics.power.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">I × V</div>
                </div>
              </div>

              {/* Velocity and Momentum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Elemental Velocity
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(kineticMetrics.velocity).map(
                      ([element, value]) => (
                        <div
                          key={element}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{element}</span>
                          <span className="text-gray-700">
                            {value.toFixed(3)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Elemental Momentum
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(kineticMetrics.momentum).map(
                      ([element, value]) => (
                        <div
                          key={element}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{element}</span>
                          <span className="text-gray-700">
                            {value.toFixed(3)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Force Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                  <div className="text-sm text-gray-600">Inertia</div>
                  <div className="text-2xl font-bold text-red-900 mt-1">
                    {kineticMetrics.inertia.toFixed(3)}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-200">
                  <div className="text-sm text-gray-600">Force Magnitude</div>
                  <div className="text-2xl font-bold text-indigo-900 mt-1">
                    {kineticMetrics.forceMagnitude.toFixed(3)}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                  <div className="text-sm text-gray-600">Classification</div>
                  <div className="text-lg font-bold text-teal-900 mt-1 capitalize">
                    {kineticMetrics.forceClassification}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-900">
                  <strong>P=IV Circuit Model:</strong> Treats alchemical
                  properties as electrical circuit components. Charge (Q) from
                  Matter + Substance, Voltage (V) from Greg&apos;s Energy,
                  Current (I) from Reactivity, Power (P) = I × V.
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Planetary Aspects */}
      {aspects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              ⭐ Planetary Aspects
            </h2>
            <button
              onClick={() => setShowAspects(!showAspects)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {showAspects ? "Hide" : "Show"} ({aspects.length})
            </button>
          </div>

          {showAspects && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Major aspects between planets (Conjunction, Sextile, Square,
                Trine, Opposition)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aspects.map((aspect, idx) => {
                  const aspectColors: Record<string, string> = {
                    Conjunction:
                      "from-purple-50 to-indigo-50 border-purple-200",
                    Sextile: "from-green-50 to-emerald-50 border-green-200",
                    Square: "from-red-50 to-orange-50 border-red-200",
                    Trine: "from-blue-50 to-cyan-50 border-blue-200",
                    Opposition: "from-pink-50 to-rose-50 border-pink-200",
                  };

                  const aspectSymbols: Record<string, string> = {
                    Conjunction: "☌",
                    Sextile: "⚹",
                    Square: "□",
                    Trine: "△",
                    Opposition: "☍",
                  };

                  return (
                    <div
                      key={idx}
                      className={`p-4 bg-gradient-to-br rounded-xl border ${aspectColors[aspect.aspectType] || "from-gray-50 to-gray-100 border-gray-200"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              color: PLANET_COLORS[aspect.planet1],
                            }}
                          >
                            {PLANET_SYMBOLS[aspect.planet1]}
                          </span>
                          <span className="text-xl">
                            {aspectSymbols[aspect.aspectType] || "•"}
                          </span>
                          <span
                            style={{
                              color: PLANET_COLORS[aspect.planet2],
                            }}
                          >
                            {PLANET_SYMBOLS[aspect.planet2]}
                          </span>
                        </div>
                        {aspect.exact && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Exact
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold">
                        {aspect.planet1} {aspect.aspectType} {aspect.planet2}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Orb: {aspect.orb.toFixed(2)}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Summary */}
      {planetaryData && alchemicalProps && thermodynamicMetrics && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 Quick Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                {Object.keys(planetaryData.positions).length}
              </div>
              <div className="text-sm text-gray-600">Planets Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">
                {aspects.length}
              </div>
              <div className="text-sm text-gray-600">Active Aspects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-900">
                {thermodynamicMetrics.gregsEnergy.toFixed(3)}
              </div>
              <div className="text-sm text-gray-600">Greg&apos;s Energy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                {kineticMetrics?.power.toFixed(3) || "0"}
              </div>
              <div className="text-sm text-gray-600">Kinetic Power</div>
            </div>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          ℹ️ System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-gray-700">Data Source</div>
            <div className="text-gray-600">
              Local astronomy-engine calculations via /api/astrologize
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">
              Calculation Method
            </div>
            <div className="text-gray-600">
              Planetary Alchemy Mapping (Authoritative)
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Auto-Refresh</div>
            <div className="text-gray-600">
              {autoRefresh ? "Every 5 minutes" : "Disabled"}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Zodiac System</div>
            <div className="text-gray-600">Tropical (default)</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Features</div>
            <div className="text-gray-600">
              ESMS, Elementals, Thermodynamics, Kinetics, Aspects
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Export Format</div>
            <div className="text-gray-600">JSON (complete data)</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="text-xs text-gray-600">
            <strong>Note:</strong> All calculations follow the hierarchical
            culinary data system. ESMS properties are derived from planetary
            positions using the authoritative planetary alchemy mapping. Kinetic
            properties use the P=IV circuit model.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryCalculationsDemo;
