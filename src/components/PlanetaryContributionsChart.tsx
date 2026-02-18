"use client";

import React, { useState, useEffect } from "react";
import {
  formatTransitionTime,
  capitalizeFirstLetter,
} from "@/utils/planetaryTransitions";
import {
  Flame,
  Droplets,
  Mountain,
  Wind,
  ArrowRight,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";

type PlanetPosition = {
  sign: string;
  degree: number;
  minute: number;
  exactLongitude: number;
  isRetrograde: boolean;
};

type PlanetaryData = {
  name: string;
  position: PlanetPosition;
  esms: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  /** Element the planet expresses under the current sect */
  sectElement: string;
  /** Quality (modality) of the sign the planet currently occupies */
  signQuality: string;
  transition: {
    nextSign: string;
    estimatedDate: Date | string;
    daysUntil: number;
    direction: "forward" | "retrograde";
  };
};

type PlanetaryContributionsData = {
  planets: PlanetaryData[];
  isDiurnal: boolean;
  timestamp: string;
};

export default function PlanetaryContributionsChart() {
  const [data, setData] = useState<PlanetaryContributionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/alchm-quantities/planetary");
      if (!response.ok) throw new Error("Failed to fetch planetary data");
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-indigo-500/20 rounded w-1/3"></div>
          <div className="h-4 bg-indigo-500/20 rounded w-full"></div>
          <div className="h-4 bg-indigo-500/20 rounded w-full"></div>
          <div className="h-4 bg-indigo-500/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg border border-red-500/30">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!data || data.planets.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30">
        <p className="text-gray-400 italic">No planetary data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row: title + sect indicator + timestamp */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-indigo-300">
          Planetary Contributions
        </h3>
        <div className="flex items-center gap-3">
          {/* Day / Night sect badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
              data.isDiurnal
                ? "bg-amber-900/30 border-amber-500/40 text-amber-300"
                : "bg-indigo-900/40 border-indigo-500/40 text-indigo-300"
            }`}
          >
            {data.isDiurnal ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
            {data.isDiurnal ? "Day Sect" : "Night Sect"}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Legends */}
      <div className="flex gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-1">
          <Flame className="h-3 w-3 text-red-400" />
          <span className="text-gray-300">Spirit</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-blue-400" />
          <span className="text-gray-300">Essence</span>
        </div>
        <div className="flex items-center gap-1">
          <Mountain className="h-3 w-3 text-green-400" />
          <span className="text-gray-300">Matter</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3 text-purple-400" />
          <span className="text-gray-300">Substance</span>
        </div>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400 italic">
          Sect element drives the live elemental profile
        </span>
      </div>

      {/* Planetary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.planets.map((planet) => (
          <div
            key={planet.name}
            className="p-4 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 rounded-lg hover:border-indigo-400/40 transition-all duration-200"
          >
            {/* Planet Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-indigo-200">
                  {getPlanetEmoji(planet.name)} {planet.name}
                </span>
                {planet.position.isRetrograde && (
                  <span className="text-xs px-2 py-0.5 bg-orange-900/50 text-orange-300 rounded border border-orange-500/30 flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Rx
                  </span>
                )}
                {/* Sign quality badge */}
                <span className="text-xs px-2 py-0.5 bg-gray-800/60 text-gray-400 rounded border border-gray-700/50">
                  {planet.signQuality}
                </span>
              </div>
            </div>

            {/* Current Position + Sectarian Element */}
            <div className="mb-3 p-2 bg-black/20 rounded flex items-center justify-between">
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-indigo-300">
                  {capitalizeFirstLetter(planet.position.sign)}
                </span>{" "}
                {planet.position.degree}°&nbsp;{planet.position.minute}&apos;
              </div>
              {/* Sect element pill */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${getElementStyle(planet.sectElement)}`}
              >
                {getElementIcon(planet.sectElement)}
                <span>{planet.sectElement}</span>
              </div>
            </div>

            {/* ESMS Contributions */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {planet.esms.Spirit > 0 && (
                <div className="flex flex-col items-center p-2 bg-red-900/20 rounded border border-red-500/20">
                  <Flame className="h-4 w-4 text-red-400 mb-1" />
                  <span className="text-sm font-bold text-red-300">
                    {planet.esms.Spirit}
                  </span>
                </div>
              )}
              {planet.esms.Essence > 0 && (
                <div className="flex flex-col items-center p-2 bg-blue-900/20 rounded border border-blue-500/20">
                  <Droplets className="h-4 w-4 text-blue-400 mb-1" />
                  <span className="text-sm font-bold text-blue-300">
                    {planet.esms.Essence}
                  </span>
                </div>
              )}
              {planet.esms.Matter > 0 && (
                <div className="flex flex-col items-center p-2 bg-green-900/20 rounded border border-green-500/20">
                  <Mountain className="h-4 w-4 text-green-400 mb-1" />
                  <span className="text-sm font-bold text-green-300">
                    {planet.esms.Matter}
                  </span>
                </div>
              )}
              {planet.esms.Substance > 0 && (
                <div className="flex flex-col items-center p-2 bg-purple-900/20 rounded border border-purple-500/20">
                  <Wind className="h-4 w-4 text-purple-400 mb-1" />
                  <span className="text-sm font-bold text-purple-300">
                    {planet.esms.Substance}
                  </span>
                </div>
              )}
            </div>

            {/* Next Transition */}
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <ArrowRight className="h-3 w-3 text-indigo-400" />
              <span>
                Enters{" "}
                <span className="font-semibold text-indigo-300">
                  {capitalizeFirstLetter(planet.transition.nextSign)}
                </span>{" "}
                in{" "}
                <span className="font-semibold text-indigo-300">
                  {formatTransitionTime(planet.transition.daysUntil)}
                </span>
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1 ml-5">
              {new Date(planet.transition.estimatedDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Traditional glyphs for each planet */
function getPlanetEmoji(planetName: string): string {
  const emojis: Record<string, string> = {
    Sun: "☉",
    Moon: "☽",
    Mercury: "☿",
    Venus: "♀",
    Mars: "♂",
    Jupiter: "♃",
    Saturn: "♄",
    Uranus: "⛢",
    Neptune: "♆",
    Pluto: "♇",
  };
  return emojis[planetName] || "🪐";
}

/** Tailwind classes for sectarian element pill */
function getElementStyle(element: string): string {
  switch (element) {
    case "Fire":  return "bg-red-900/30 border-red-500/40 text-red-300";
    case "Water": return "bg-blue-900/30 border-blue-500/40 text-blue-300";
    case "Earth": return "bg-emerald-900/30 border-emerald-500/40 text-emerald-300";
    case "Air":   return "bg-yellow-900/30 border-yellow-500/40 text-yellow-300";
    default:      return "bg-gray-800/40 border-gray-600/40 text-gray-400";
  }
}

/** Lucide icon for sectarian element */
function getElementIcon(element: string): React.ReactNode {
  switch (element) {
    case "Fire":  return <Flame   className="h-3 w-3" />;
    case "Water": return <Droplets className="h-3 w-3" />;
    case "Earth": return <Mountain className="h-3 w-3" />;
    case "Air":   return <Wind    className="h-3 w-3" />;
    default:      return null;
  }
}
