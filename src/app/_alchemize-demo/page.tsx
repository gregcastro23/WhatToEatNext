"use client";

/**
 * Alchemical Kinetics Demo
 * Interactive demonstration of the alchemical kinetics calculation theory
 * Shows ESMS, thermodynamic metrics, and P=IV circuit kinetics
 */

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  calculateAlchemicalFromPlanets,
  PLANETARY_ALCHEMY,
  ZODIAC_ELEMENTS,
  type ZodiacSignType as ZodiacSignType,
} from "@/utils/planetaryAlchemyMapping";
import { calculateKalchmResults } from "@/calculations/core/kalchmEngine";
import { calculateKinetics } from "@/calculations/kinetics";
import { DefaultPlanetaryPositions } from "@/constants/typeDefaults";

// Zodiac signs array for dropdowns
const ZODIAC_SIGNS: ZodiacSignType[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

// Planet names array
const PLANETS = [
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
] as const;
type PlanetName = (typeof PLANETS)[number];

// Example scenarios
const EXAMPLE_SCENARIOS = {
  default: {
    name: "Default (Mixed Signs)",
    positions: DefaultPlanetaryPositions,
    description: "Balanced distribution across elements",
  },
  highFire: {
    name: "High Fire Energy",
    positions: {
      Sun: "Leo",
      Moon: "Aries",
      Mercury: "Leo",
      Venus: "Leo",
      Mars: "Aries",
      Jupiter: "Sagittarius",
      Saturn: "Aries",
      Uranus: "Leo",
      Neptune: "Aries",
      Pluto: "Sagittarius",
    },
    description: "Maximum Fire element concentration",
  },
  balancedEarth: {
    name: "Balanced Earth",
    positions: {
      Sun: "Taurus",
      Moon: "Virgo",
      Mercury: "Capricorn",
      Venus: "Taurus",
      Mars: "Virgo",
      Jupiter: "Capricorn",
      Saturn: "Taurus",
      Uranus: "Virgo",
      Neptune: "Capricorn",
      Pluto: "Taurus",
    },
    description: "Grounded, stable Earth energy",
  },
  spiritualAlignment: {
    name: "Spiritual Alignment",
    positions: {
      Sun: "Gemini",
      Moon: "Pisces",
      Mercury: "Gemini",
      Venus: "Pisces",
      Mars: "Sagittarius",
      Jupiter: "Pisces",
      Saturn: "Capricorn",
      Uranus: "Aquarius",
      Neptune: "Pisces",
      Pluto: "Sagittarius",
    },
    description: "High Spirit and Essence combination",
  },
};

export default function AlchemicalKineticsDemo() {
  // State for planetary positions
  const [planetaryPositions, setPlanetaryPositions] = useState<
    Record<string, string>
  >(
    Object.fromEntries(
      Object.entries(DefaultPlanetaryPositions)
        .filter(([, value]) => typeof value === "object" && value !== null)
        .map(([key, value]) => [key, (value as any).sign]),
    ),
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [selectedScenario, setSelectedScenario] = useState<string>("default");

  // Calculate ESMS from planetary positions
  const esms = useMemo(() => {
    try {
      return calculateAlchemicalFromPlanets(planetaryPositions);
    } catch (error) {
      console.error("Error calculating ESMS:", error);
      return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
    }
  }, [planetaryPositions]);

  // Calculate elemental properties from zodiac signs
  const elementals = useMemo(() => {
    const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    Object.values(planetaryPositions).forEach((sign) => {
      const element = ZODIAC_ELEMENTS[sign as ZodiacSignType];
      if (element) {
        totals[element] = (totals[element] || 0) + 1;
      }
    });
    // Normalize to 1.0
    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(totals).forEach((key) => {
        totals[key as keyof typeof totals] =
          totals[key as keyof typeof totals] / total;
      });
    }
    return totals;
  }, [planetaryPositions]);

  // Calculate thermodynamic metrics
  const thermodynamics = useMemo(() => {
    try {
      const result = calculateKalchmResults(planetaryPositions as any);
      return result.thermodynamics;
    } catch (error) {
      console.error("Error calculating thermodynamics:", error);
      return {
        heat: 0,
        entropy: 0,
        reactivity: 0,
        gregsEnergy: 0,
        kalchm: 0,
        monicaConstant: 0,
      };
    }
  }, [planetaryPositions]);

  // Calculate kinetic properties
  const kinetics = useMemo(() => {
    try {
      return calculateKinetics({
        currentPlanetaryPositions: planetaryPositions,
        timeInterval: 1800, // 30 minutes
        currentPlanet: "Sun",
      });
    } catch (error) {
      console.error("Error calculating kinetics:", error);
      return null;
    }
  }, [planetaryPositions]);

  // Handle planetary position change
  const handlePositionChange = useCallback((planet: string, sign: string) => {
    setPlanetaryPositions((prev) => ({
      ...prev,
      [planet]: sign,
    }));
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Load example scenario
  const loadScenario = useCallback((scenarioKey: string) => {
    const scenario =
      EXAMPLE_SCENARIOS[scenarioKey as keyof typeof EXAMPLE_SCENARIOS];
    if (scenario) {
      setPlanetaryPositions(scenario.positions as Record<string, string>);
      setSelectedScenario(scenarioKey);
    }
  }, []);

  // Format number for display
  const formatNumber = (num: number, decimals: number = 3): string => {
    if (isNaN(num) || !isFinite(num)) return "N/A";
    return num.toFixed(decimals);
  };

  // Calculate percentage for progress bars
  const getPercentage = (value: number, max: number = 10): number => {
    if (isNaN(value) || !isFinite(value)) return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🧪 Alchemical Kinetics Demo
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl">
            Interactive demonstration of how planetary positions transform into
            alchemical properties (ESMS), thermodynamic metrics, and kinetic
            properties using the P=IV circuit model.
          </p>
        </div>

        {/* Example Scenarios */}
        <div className="alchm-card rounded-2xl shadow-lg p-6 mb-6 bg-white">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Example Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(EXAMPLE_SCENARIOS).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => loadScenario(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedScenario === key
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : "border-gray-200 hover:border-green-300 hover:shadow-md"
                }`}
              >
                <h3 className="font-bold text-gray-800 mb-2">
                  {scenario.name}
                </h3>
                <p className="text-sm text-gray-600">{scenario.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Planetary Position Selector */}
        <div className="alchm-card rounded-2xl shadow-lg p-6 mb-6 bg-white">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Planetary Positions
          </h2>
          <p className="text-gray-700 mb-4">
            Select zodiac signs for each planet. The system calculates ESMS
            properties from these positions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {PLANETS.map((planet) => (
              <div key={planet} className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  {planet}
                </label>
                <select
                  value={planetaryPositions[planet] || "Aries"}
                  onChange={(e) => handlePositionChange(planet, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {ZODIAC_SIGNS.map((sign) => (
                    <option key={sign} value={sign}>
                      {sign} ({ZODIAC_ELEMENTS[sign]})
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500">
                  {PLANETARY_ALCHEMY[planet as PlanetName] && (
                    <div>
                      {Object.entries(PLANETARY_ALCHEMY[planet as PlanetName])
                        .filter(([_, value]) => value > 0)
                        .map(([prop]) => prop)
                        .join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ESMS Calculation Display */}
        <div className="alchm-card rounded-2xl shadow-lg p-6 mb-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-600">
              ESMS Properties
            </h2>
            <button
              onClick={() => toggleSection("esms")}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              {expandedSections.has("esms") ? "Hide Details" : "Show Details"}
            </button>
          </div>
          <p className="text-gray-700 mb-4">
            Spirit, Essence, Matter, and Substance calculated from planetary
            alchemy values.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {(["Spirit", "Essence", "Matter", "Substance"] as const).map(
              (prop) => (
                <div
                  key={prop}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
                >
                  <div className="text-sm font-semibold text-gray-600 mb-2">
                    {prop}
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {esms[prop]}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(esms[prop])}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>

          {expandedSections.has("esms") && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">
                How ESMS is Calculated
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  Each planet contributes specific ESMS values based on its
                  inherent alchemical nature:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-gray-600">
                    <strong>Sun:</strong> Spirit (consciousness, vitality)
                  </li>
                  <li className="text-gray-600">
                    <strong>Moon:</strong> Essence + Matter (emotion, substance)
                  </li>
                  <li className="text-gray-600">
                    <strong>Mercury:</strong> Spirit + Substance (intellect,
                    communication)
                  </li>
                  <li className="text-gray-600">
                    <strong>Venus:</strong> Essence + Matter (beauty, harmony)
                  </li>
                  <li className="text-gray-600">
                    <strong>Mars:</strong> Essence + Matter (action, energy)
                  </li>
                  <li className="text-gray-600">
                    <strong>Jupiter:</strong> Spirit + Essence (expansion,
                    wisdom)
                  </li>
                  <li className="text-gray-600">
                    <strong>Saturn:</strong> Spirit + Matter (structure,
                    discipline)
                  </li>
                  <li className="text-gray-600">
                    <strong>Uranus:</strong> Essence + Matter (innovation,
                    change)
                  </li>
                  <li className="text-gray-600">
                    <strong>Neptune:</strong> Essence + Substance (intuition,
                    dissolution)
                  </li>
                  <li className="text-gray-600">
                    <strong>Pluto:</strong> Essence + Matter (transformation,
                    power)
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  The total for each ESMS property is the sum of contributions
                  from all 10 planets.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Elemental Properties */}
        <div className="alchm-card rounded-2xl shadow-lg p-6 mb-6 bg-white">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Elemental Properties
          </h2>
          <p className="text-gray-700 mb-4">
            Derived from zodiac signs of planetary positions. Each sign
            contributes its element.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["Fire", "Water", "Earth", "Air"] as const).map((element) => (
              <div
                key={element}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200"
              >
                <div className="text-sm font-semibold text-gray-600 mb-2">
                  {element}
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {formatNumber(elementals[element] * 10, 2)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${elementals[element] * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thermodynamic Metrics */}
        <div className="alchm-card rounded-2xl shadow-lg p-6 mb-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-600">
              Thermodynamic Metrics
            </h2>
            <button
              onClick={() => toggleSection("thermo")}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              {expandedSections.has("thermo")
                ? "Hide Formulas"
                : "Show Formulas"}
            </button>
          </div>
          <p className="text-gray-700 mb-6">
            Advanced thermodynamic properties derived from ESMS and elemental
            values.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Heat */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">Heat</h3>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-3xl font-bold text-red-600 mb-3">
                {formatNumber(thermodynamics.heat, 4)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(thermodynamics.heat, 1)}%` }}
                />
              </div>
              {expandedSections.has("thermo") && (
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded">
                  Heat = (Spirit² + Fire²) / (Substance + Essence + Matter +
                  Water + Air + Earth)²
                </div>
              )}
            </div>

            {/* Entropy */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">Entropy</h3>
                <span className="text-2xl">🌀</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-3">
                {formatNumber(thermodynamics.entropy, 4)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${getPercentage(thermodynamics.entropy, 1)}%`,
                  }}
                />
              </div>
              {expandedSections.has("thermo") && (
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded">
                  Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence +
                  Matter + Earth + Water)²
                </div>
              )}
            </div>

            {/* Reactivity */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">Reactivity</h3>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-3">
                {formatNumber(thermodynamics.reactivity, 4)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${getPercentage(thermodynamics.reactivity, 2)}%`,
                  }}
                />
              </div>
              {expandedSections.has("thermo") && (
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded">
                  Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² +
                  Water²) / (Matter + Earth)²
                </div>
              )}
            </div>

            {/* Greg's Energy */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">Greg&apos;s Energy</h3>
                <span className="text-2xl">⚗️</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-3">
                {formatNumber(thermodynamics.gregsEnergy, 4)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    thermodynamics.gregsEnergy >= 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${getPercentage(Math.abs(thermodynamics.gregsEnergy), 1)}%`,
                    marginLeft:
                      thermodynamics.gregsEnergy < 0 ? "0" : undefined,
                  }}
                />
              </div>
              {expandedSections.has("thermo") && (
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded">
                  Greg&apos;s Energy = Heat - (Entropy × Reactivity)
                </div>
              )}
            </div>

            {/* Kalchm */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">K_alchm</h3>
                <span className="text-2xl">🔮</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-3">
                {formatNumber(thermodynamics.kalchm, 4)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${getPercentage(thermodynamics.kalchm, 10)}%`,
                  }}
                />
              </div>
              {expandedSections.has("thermo") && (
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded">
                  K_alchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter ×
                  Substance^Substance)
                </div>
              )}
            </div>

            {/* Monica Constant */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5 border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">Monica (M)</h3>
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-3xl font-bold text-indigo-600 mb-3">
                {formatNumber(thermodynamics.monicaConstant, 4)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${getPercentage(Math.abs(thermodynamics.monicaConstant), 5)}%`,
                  }}
                />
              </div>
              {expandedSections.has("thermo") && (
                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded">
                  M = -Greg&apos;s Energy / (Reactivity × ln(K_alchm))
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kinetic Properties (P=IV Circuit) */}
        {kinetics && (
          <div className="alchm-card rounded-2xl shadow-lg p-6 mb-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-green-600">
                Kinetic Properties (P=IV Circuit Model)
              </h2>
              <button
                onClick={() => toggleSection("kinetics")}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                {expandedSections.has("kinetics")
                  ? "Hide Details"
                  : "Show Details"}
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              The alchemical system modeled as an electrical circuit using Power
              = Current × Voltage (P=IV).
            </p>

            {/* Circuit Diagram Visual */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-gray-300">
              <h3 className="font-bold text-gray-800 mb-4 text-center">
                Circuit Model
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-600">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-bold text-gray-800">Charge (Q)</div>
                    <div className="text-2xl text-yellow-600 font-bold">
                      {formatNumber(kinetics.charge, 2)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Matter + Substance
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-blue-400 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-600">
                    <span className="text-3xl">🔋</span>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-bold text-gray-800">Potential (V)</div>
                    <div className="text-2xl text-blue-600 font-bold">
                      {formatNumber(kinetics.potentialDifference, 4)}
                    </div>
                    <div className="text-xs text-gray-600">Energy / Charge</div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center shadow-lg border-4 border-green-600">
                    <span className="text-3xl">🌊</span>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-bold text-gray-800">Current (I)</div>
                    <div className="text-2xl text-green-600 font-bold">
                      {formatNumber(kinetics.currentFlow, 4)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Reactivity × dQ/dt
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-red-400 rounded-full flex items-center justify-center shadow-lg border-4 border-red-600">
                    <span className="text-3xl">💪</span>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-bold text-gray-800">Power (P)</div>
                    <div className="text-2xl text-red-600 font-bold">
                      {formatNumber(kinetics.power, 4)}
                    </div>
                    <div className="text-xs text-gray-600">I × V</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Kinetic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Inertia</h3>
                <div className="text-2xl font-bold text-gray-700">
                  {formatNumber(kinetics.inertia, 3)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Resistance to change
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">
                  Force Classification
                </h3>
                <div className="text-xl font-bold text-gray-700 capitalize">
                  {kinetics.forceClassification}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Magnitude: {formatNumber(kinetics.forceMagnitude, 4)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">
                  Thermal Direction
                </h3>
                <div className="text-xl font-bold text-gray-700 capitalize">
                  {kinetics.thermalDirection}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Energy flow direction
                </div>
              </div>
            </div>

            {expandedSections.has("kinetics") && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">
                  Per-Element Kinetic Properties
                </h3>

                {/* Velocity */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Velocity (d/dt)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["Fire", "Water", "Earth", "Air"] as const).map(
                      (element) => (
                        <div key={element} className="bg-white p-2 rounded">
                          <div className="text-xs text-gray-600">{element}</div>
                          <div className="font-bold text-gray-800">
                            {formatNumber(kinetics.velocity[element], 6)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Momentum */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Momentum</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["Fire", "Water", "Earth", "Air"] as const).map(
                      (element) => (
                        <div key={element} className="bg-white p-2 rounded">
                          <div className="text-xs text-gray-600">{element}</div>
                          <div className="font-bold text-gray-800">
                            {formatNumber(kinetics.momentum[element], 6)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Force */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Force</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["Fire", "Water", "Earth", "Air"] as const).map(
                      (element) => (
                        <div key={element} className="bg-white p-2 rounded">
                          <div className="text-xs text-gray-600">{element}</div>
                          <div className="font-bold text-gray-800">
                            {formatNumber(kinetics.force[element], 6)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Educational Info */}
        <div className="alchm-card rounded-2xl shadow-lg p-6 mb-6 bg-white">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            About the Calculation System
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">
                Three-Tier Architecture
              </h3>
              <ol className="list-decimal ml-5 space-y-1">
                <li>
                  <strong>Tier 1 - Ingredients:</strong> Store only elemental
                  properties (Fire, Water, Earth, Air)
                </li>
                <li>
                  <strong>Tier 2 - Recipes:</strong> Compute full alchemical
                  properties from planetary positions, combine with elemental
                  properties, calculate thermodynamics and kinetics
                </li>
                <li>
                  <strong>Tier 3 - Cuisines:</strong> Aggregate statistical
                  properties across recipes
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">Key Principles</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  ESMS values MUST be calculated from planetary positions, never
                  from elementals
                </li>
                <li>
                  Elements don&apos;t oppose each other - they reinforce
                  themselves
                </li>
                <li>
                  The P=IV circuit model treats recipes as electrical systems
                </li>
                <li>All formulas are deterministic and reproducible</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2">
                Real-World Application
              </h3>
              <p>
                This system is used throughout the WhatToEatNext application to
                recommend cuisines, ingredients, and cooking methods that align
                with current celestial energies. By understanding the alchemical
                and kinetic properties of food, we can create meals that are not
                just nutritious, but energetically harmonious with the present
                moment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 mt-8">
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
