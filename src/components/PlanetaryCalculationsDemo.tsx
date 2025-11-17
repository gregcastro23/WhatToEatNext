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
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  type AlchemicalProperties,
  type ZodiacSign,
} from "@/utils/planetaryAlchemyMapping";
import {
  calculateThermodynamicMetrics,
  type ThermodynamicMetrics,
} from "@/utils/monicaKalchmCalculations";
import type { ElementalProperties } from "@/types/alchemy";
import { logger } from "@/lib/logger";

interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

interface PlanetaryData {
  positions: Record<string, PlanetaryPosition>;
  timestamp: Date;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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
            sign: signKey as ZodiacSign,
            degree: planetData.ChartPosition?.Ecliptic?.ArcDegrees?.degrees || 0,
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
            >
              {autoRefresh ? "⏸️ Auto" : "▶️ Manual"}
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
            {Object.entries(planetaryData.positions).map(([planet, pos]) => (
              <div
                key={planet}
                className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
              >
                <div className="font-bold text-purple-900">{planet}</div>
                <div className="text-sm text-gray-700 mt-1">
                  <div>
                    {pos.sign.charAt(0).toUpperCase() + pos.sign.slice(1)}{" "}
                    {pos.degree}° {pos.minute}'
                  </div>
                  {pos.isRetrograde && (
                    <span className="text-red-600 text-xs">℞ Retrograde</span>
                  )}
                </div>
              </div>
            ))}
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
              Object.entries(alchemicalProps) as [
                keyof AlchemicalProperties,
                number,
              ][]
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
              Object.entries(elementalProps) as [
                keyof ElementalProperties,
                number,
              ][]
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

      {/* System Information */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          ℹ️ System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default PlanetaryCalculationsDemo;
