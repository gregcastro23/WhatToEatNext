"use client";

import React from "react";
import type { AlchemicalProfile } from '@/contexts/UserContext';
import {
  normalizeForDisplay,
  getTotalIntensity,
} from "@/utils/elemental/normalization";

interface AlchemicalProfileDisplayProps {
  stats: AlchemicalProfile;
}

const elementColors = {
  Fire: {
    gradient: "from-red-500 to-orange-500",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: "🔥",
  },
  Water: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: "💧",
  },
  Earth: {
    gradient: "from-green-600 to-emerald-600",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "🌍",
  },
  Air: {
    gradient: "from-purple-500 to-indigo-500",
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: "💨",
  },
};

const getConstitutionType = (stats: AlchemicalProfile): string => {
    const primaryElement = Object.keys(stats).reduce((a, b) => stats[a as keyof AlchemicalProfile] > stats[b as keyof AlchemicalProfile] ? a : b);
    const secondaryElement = Object.keys(stats).filter(k => k !== primaryElement).reduce((a, b) => stats[a as keyof AlchemicalProfile] > stats[b as keyof AlchemicalProfile] ? a : b);

    return `${primaryElement} / ${secondaryElement}`;
}

export const AlchemicalProfileDisplay: React.FC<
  AlchemicalProfileDisplayProps
> = ({ stats }) => {
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  const elementalAffinities = {
      Fire: stats.fire,
      Water: stats.water,
      Earth: stats.earth,
      Air: stats.air,
  };
  const maxValue = Math.max(...elements.map((e) => elementalAffinities[e]));

  // Normalize for display (converts raw values to percentages that sum to 1.0)
  const normalizedAffinities = normalizeForDisplay(elementalAffinities);
  const totalIntensity = getTotalIntensity(elementalAffinities);
  const constitutionType = getConstitutionType(stats);

  return (
    <div className="alchm-card p-6">
      <h2 className="text-2xl font-bold alchm-gradient-text mb-2">
        Your Alchemical Profile
      </h2>
      <p className="text-gray-600 mb-6">
        Your unique alchemical constitution based on your natal chart.
      </p>

      {/* Constitution Type */}
      <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-gray-700">Your Constitution Type:</p>
          <p className="text-2xl font-bold alchm-gradient-text">{constitutionType}</p>
      </div>

      {/* Elemental Balance */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Elemental Balance</h3>
        {elements.map((element) => {
          const value = elementalAffinities[element as keyof typeof elementalAffinities];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 25;
          const colors = elementColors[element as keyof typeof elementColors];

          return (
            <div key={element} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{colors.icon}</span>
                  <span className={`font-semibold ${colors.text}`}>
                    {element}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {value.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 20 && (
                    <span className="text-xs font-bold text-white">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thermodynamic State */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Thermodynamic State</h3>
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-100 rounded-lg p-3 text-center">
                <div className="text-xs font-medium text-red-700">Heat</div>
                <div className="text-lg font-bold text-gray-800">{stats.heat.toFixed(2)}</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3 text-center">
                <div className="text-xs font-medium text-blue-700">Entropy</div>
                <div className="text-lg font-bold text-gray-800">{stats.entropy.toFixed(2)}</div>
            </div>
            <div className="bg-green-100 rounded-lg p-3 text-center">
                <div className="text-xs font-medium text-green-700">KAlchm</div>
                <div className="text-lg font-bold text-gray-800">{stats.kAlchm.toFixed(2)}</div>
            </div>
        </div>
      </div>
    </div>
  );
};
