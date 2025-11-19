"use client";

import React from "react";
import type { ElementalProperties } from "@/types/alchemy";

interface ElementalAffinitiesChartProps {
  affinities: ElementalProperties;
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

export const ElementalAffinitiesChart: React.FC<
  ElementalAffinitiesChartProps
> = ({ affinities }) => {
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  const maxValue = Math.max(...elements.map((e) => affinities[e]));

  return (
    <div className="alchm-card p-6">
      <h2 className="text-2xl font-bold alchm-gradient-text mb-6">
        Elemental Affinities
      </h2>
      <p className="text-gray-600 mb-6">
        Your preferences across the four elemental properties
      </p>

      {/* Bar Chart */}
      <div className="space-y-4">
        {elements.map((element) => {
          const value = affinities[element];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 25;
          const colors = elementColors[element];

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

      {/* Elemental Balance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Balance Analysis</h3>
        <div className="grid grid-cols-2 gap-3">
          {elements.map((element) => {
            const value = affinities[element];
            const colors = elementColors[element];
            return (
              <div
                key={element}
                className={`${colors.bg} rounded-lg p-3 text-center`}
              >
                <div className="text-2xl mb-1">{colors.icon}</div>
                <div className={`text-xs font-medium ${colors.text}`}>
                  {element}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {(value * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
