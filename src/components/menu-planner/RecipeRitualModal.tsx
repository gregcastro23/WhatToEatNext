"use client";

import React from "react";
import type { ElementalProperties } from "@/types/recipe";

interface RecipeRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  ritualInstruction: string;
  dominantTransit: string | null;
  totalPotencyScore: number | null;
  elementalProperties: ElementalProperties | null;
}

export default function RecipeRitualModal({
  isOpen,
  onClose,
  recipeId,
  ritualInstruction,
  dominantTransit,
  totalPotencyScore,
  elementalProperties,
}: RecipeRitualModalProps) {
  if (!isOpen) return null;

  const getTransitBackground = (transit: string | null) => {
    switch (transit) {
      case "Mars":
        return "bg-gradient-to-br from-red-900 to-black";
      case "Venus":
        return "bg-gradient-to-br from-pink-800 to-indigo-950";
      case "Saturn":
        return "bg-gradient-to-br from-slate-900 to-stone-950";
      default:
        return "bg-white";
    }
  };

  const backgroundClass = getTransitBackground(dominantTransit);
  const isDarkBg = dominantTransit !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div
        className={`rounded-lg p-6 max-w-sm w-full shadow-xl ${backgroundClass}`}
      >
        <h2
          className={`text-2xl font-bold mb-4 ${
            isDarkBg ? "text-white" : "text-purple-700"
          }`}
        >
          Your Cooking Ritual
        </h2>
        <div
          className={`text-sm mb-2 ${
            isDarkBg ? "text-gray-300" : "text-gray-500"
          }`}
        >
          For Recipe ID: {recipeId}
        </div>
        {dominantTransit && (
          <div
            className={`text-sm mb-4 ${
              isDarkBg ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Based on your dominant transit:{" "}
            <span className="font-semibold">{dominantTransit}</span>
          </div>
        )}
        <p className={`mb-6 ${isDarkBg ? "text-gray-100" : "text-gray-800"}`}>
          {ritualInstruction}
        </p>

        {/* Elemental Balance */}
        {elementalProperties && (
          <div className="mb-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDarkBg ? "text-white" : "text-gray-800"}`}>
              Elemental Balance
            </h3>
            <div className="flex gap-1">
              {Object.entries(elementalProperties).map(
                ([element, value]) => {
                  if (typeof value !== "number") return null;
                  const width = Math.round(value * 100);
                  const elementColors: Record<
                    string,
                    { bg: string; text: string }
                  > = {
                    Fire: { bg: "bg-orange-400", text: "text-orange-700" },
                    Water: { bg: "bg-blue-400", text: "text-blue-700" },
                    Earth: { bg: "bg-amber-400", text: "text-amber-700" },
                    Air: { bg: "bg-sky-400", text: "text-sky-700" },
                  };
                  const color = elementColors[element] || {
                    bg: "bg-gray-400",
                    text: "text-gray-700",
                  };
                  return (
                    <div
                      key={element}
                      className={`h-2 rounded-full ${color.bg}`}
                      style={{ width: `${width}%` }}
                      title={`${element}: ${Math.round(value * 100)}%`}
                    />
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* Potency Meter */}
        {totalPotencyScore !== null && (
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-2 ${isDarkBg ? "text-white" : "text-gray-800"}`}>
              Potency Score
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${totalPotencyScore * 100}%` }}
              ></div>
            </div>
            <div className={`text-right text-sm mt-1 ${isDarkBg ? "text-gray-300" : "text-gray-500"}`}>
              {Math.round(totalPotencyScore * 100)}%
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
