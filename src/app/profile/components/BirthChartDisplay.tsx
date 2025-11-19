"use client";

import React from "react";
import type { NatalChart } from "@/services/natalChartService";
import type { ElementalCharacter } from "@/constants/planetaryElements";

interface BirthChartDisplayProps {
  natalChart: NatalChart;
  onEdit?: () => void;
}

// Zodiac sign symbols
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

// Zodiac sign names (capitalized)
const ZODIAC_NAMES: Record<string, string> = {
  aries: "Aries",
  taurus: "Taurus",
  gemini: "Gemini",
  cancer: "Cancer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Scorpio",
  sagittarius: "Sagittarius",
  capricorn: "Capricorn",
  aquarius: "Aquarius",
  pisces: "Pisces",
};

// Planet symbols
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
  Ascendant: "ASC",
};

// Element colors
const ELEMENT_COLORS: Record<ElementalCharacter, string> = {
  Fire: "bg-gradient-to-r from-red-500 to-orange-500",
  Water: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Earth: "bg-gradient-to-r from-green-600 to-emerald-600",
  Air: "bg-gradient-to-r from-yellow-400 to-amber-400",
};

/**
 * BirthChartDisplay Component
 * Displays a user's natal chart with planetary placements, elemental composition, and ESMS properties
 */
export function BirthChartDisplay({
  natalChart,
  onEdit,
}: BirthChartDisplayProps) {
  const { birthData, planetaryPositions, elementalComposition, alchemicalProperties } = natalChart;

  // Group planets by element
  const planetsByElement: Record<ElementalCharacter, string[]> = {
    Fire: [],
    Water: [],
    Earth: [],
    Air: [],
  };

  const signElements: Record<string, ElementalCharacter> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };

  // Group planets by their zodiac sign's element (exclude Ascendant)
  Object.entries(planetaryPositions).forEach(([planet, sign]) => {
    if (planet !== "Ascendant") {
      const element = signElements[sign];
      if (element) {
        planetsByElement[element].push(planet);
      }
    }
  });

  return (
    <div className="alchm-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold alchm-gradient-text mb-1">
            Your Natal Chart
          </h2>
          <p className="text-sm text-gray-600">
            Born: {birthData.date} at {birthData.time}
            {birthData.locationName && ` in ${birthData.locationName}`}
          </p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-300 hover:border-purple-400 rounded-lg transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Elemental Composition */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Elemental Composition
        </h3>
        <div className="space-y-3">
          {(Object.entries(elementalComposition) as [ElementalCharacter, number][]).map(
            ([element, value]) => (
              <div key={element}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {element}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(value * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${ELEMENT_COLORS[element]} transition-all duration-300`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Planetary Placements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Planetary Placements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(planetaryPositions).map(([planet, sign]) => (
            <div
              key={planet}
              className="p-3 bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg border border-purple-200"
            >
              <div className="text-2xl text-center mb-1">
                {PLANET_SYMBOLS[planet] || planet}
              </div>
              <div className="text-xs font-semibold text-center text-gray-700">
                {planet}
              </div>
              <div className="text-sm text-center text-gray-600 mt-1">
                {ZODIAC_SYMBOLS[sign]} {ZODIAC_NAMES[sign]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alchemical Properties (ESMS) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Alchemical Properties (ESMS)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
            <div className="text-sm font-medium text-purple-800 mb-1">
              Spirit
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {alchemicalProperties.Spirit}
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-1">
              Essence
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {alchemicalProperties.Essence}
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-1">
              Matter
            </div>
            <div className="text-2xl font-bold text-green-900">
              {alchemicalProperties.Matter}
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
            <div className="text-sm font-medium text-orange-800 mb-1">
              Substance
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {alchemicalProperties.Substance}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Calculated from planetary positions using authoritative planetary alchemy mapping
        </p>
      </div>

      {/* Planets by Element */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Planets by Element
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(planetsByElement) as [ElementalCharacter, string[]][]).map(
            ([element, planets]) => (
              <div
                key={element}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
              >
                <div className="font-semibold text-gray-800 mb-2">
                  {element} ({planets.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {planets.length > 0 ? (
                    planets.map((planet) => (
                      <span
                        key={planet}
                        className="px-2 py-1 text-xs font-medium bg-white rounded-md border border-gray-300"
                      >
                        {PLANET_SYMBOLS[planet]} {planet}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      No planets in {element}
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Your natal chart provides the foundation for personalized food and recipe recommendations.
          The more accurate your birth data, the better your recommendations will be.
        </p>
      </div>
    </div>
  );
}
