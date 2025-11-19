"use client";
import React from "react";

interface NatalChart {
  planetaryPositions: Record<string, string>; // Planet name -> Zodiac sign
  elementalComposition: {
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
  calculatedAt: string;
}

interface BirthLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface BirthData {
  birthDate: string;
  birthTime: string;
  birthLocation: BirthLocation;
}

interface BirthChartDisplayProps {
  natalChart: NatalChart;
  birthData?: BirthData;
  onEdit?: () => void;
}

// Planet symbols and element colors
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

const ELEMENT_COLORS = {
  Fire: "from-red-500 to-orange-500",
  Water: "from-blue-500 to-cyan-500",
  Earth: "from-green-600 to-emerald-600",
  Air: "from-yellow-400 to-amber-400",
};

const ELEMENT_ICONS = {
  Fire: "🔥",
  Water: "💧",
  Earth: "🌍",
  Air: "💨",
};

export const BirthChartDisplay: React.FC<BirthChartDisplayProps> = ({
  natalChart,
  birthData,
  onEdit,
}) => {
  // Group planets by element
  const planetsByElement: Record<string, string[]> = {
    Fire: [],
    Water: [],
    Earth: [],
    Air: [],
  };

  // Zodiac to element mapping (lowercase)
  const zodiacToElement: Record<string, string> = {
    aries: "Fire",
    leo: "Fire",
    sagittarius: "Fire",
    cancer: "Water",
    scorpio: "Water",
    pisces: "Water",
    taurus: "Earth",
    virgo: "Earth",
    capricorn: "Earth",
    gemini: "Air",
    libra: "Air",
    aquarius: "Air",
  };

  Object.entries(natalChart.planetaryPositions).forEach(([planet, sign]) => {
    const element = zodiacToElement[sign.toLowerCase()];
    if (element) {
      planetsByElement[element].push(planet);
    }
  });

  // Get dominant element
  const dominantElement = (
    Object.entries(natalChart.elementalComposition) as [string, number][]
  ).reduce((max, [element, value]) =>
    value > (natalChart.elementalComposition[max as keyof typeof natalChart.elementalComposition] || 0) ? element : max,
  );

  return (
    <div className="alchm-card p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold alchm-gradient-text mb-2">
            Your Natal Chart
          </h3>
          {birthData && (
            <p className="text-sm text-gray-600">
              {new Date(birthData.birthDate).toLocaleDateString()} at{" "}
              {birthData.birthTime} • {birthData.birthLocation.city || "Unknown"}
            </p>
          )}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Edit
          </button>
        )}
      </div>

      {/* Elemental Composition */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Elemental Composition
        </h4>
        <div className="space-y-2">
          {(Object.entries(natalChart.elementalComposition) as [string, number][]).map(
            ([element, value]) => {
              const percentage = (value * 100).toFixed(1);
              return (
                <div key={element}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}{" "}
                      {element}
                      {element === dominantElement && (
                        <span className="ml-2 text-xs text-purple-600 font-semibold">
                          Dominant
                        </span>
                      )}
                    </span>
                    <span className="text-gray-600">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Planetary Placements */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Planetary Placements
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(natalChart.planetaryPositions).map(
            ([planet, sign]) => (
              <div
                key={planet}
                className="flex items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg"
              >
                <span className="text-2xl">
                  {PLANET_SYMBOLS[planet] || planet}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {planet}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">{sign}</div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Alchemical Properties (ESMS) */}
      {natalChart.alchemicalProperties && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            Alchemical Properties (ESMS)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(natalChart.alchemicalProperties).map(
              ([property, value]) => (
                <div
                  key={property}
                  className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg"
                >
                  <div className="text-sm font-medium text-indigo-800">
                    {property}
                  </div>
                  <div className="text-2xl font-bold text-indigo-900">
                    {value}
                  </div>
                </div>
              ),
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Spirit, Essence, Matter, Substance - Calculated from planetary
            positions
          </p>
        </div>
      )}

      {/* Planets by Element */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Planets by Element
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(planetsByElement) as [string, string[]][]).map(
            ([element, planets]) => (
              <div
                key={element}
                className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg"
              >
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS]}{" "}
                  {element}
                </div>
                <div className="flex flex-wrap gap-1">
                  {planets.map((planet) => (
                    <span
                      key={planet}
                      className="text-xs px-2 py-1 bg-white rounded-full text-gray-700"
                    >
                      {PLANET_SYMBOLS[planet] || planet}
                    </span>
                  ))}
                  {planets.length === 0 && (
                    <span className="text-xs text-gray-400">None</span>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Chart calculated: {new Date(natalChart.calculatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};
