"use client";

/**
 * Planetary Hour Indicator
 * Shows the current planetary hour ruler with tooltip details
 *
 * @file src/components/menu-builder/PlanetaryHourIndicator.tsx
 * @created 2026-01-28
 */

import React from "react";

/** Planetary hour metadata */
const PLANETARY_INFO: Record<
  string,
  { icon: string; color: string; description: string; foodSuggestion: string }
> = {
  Sun: {
    icon: "☉",
    color: "text-yellow-600",
    description: "Vitality, success, leadership",
    foodSuggestion: "Bold, energizing dishes",
  },
  Moon: {
    icon: "☽",
    color: "text-blue-400",
    description: "Emotions, intuition, comfort",
    foodSuggestion: "Soups, dairy, comfort foods",
  },
  Mars: {
    icon: "♂",
    color: "text-red-600",
    description: "Energy, action, spice",
    foodSuggestion: "Spicy, protein-rich meals",
  },
  Mercury: {
    icon: "☿",
    color: "text-gray-600",
    description: "Communication, variety",
    foodSuggestion: "Complex, multi-ingredient dishes",
  },
  Jupiter: {
    icon: "♃",
    color: "text-orange-500",
    description: "Abundance, growth, celebration",
    foodSuggestion: "Rich, generous portions",
  },
  Venus: {
    icon: "♀",
    color: "text-pink-500",
    description: "Pleasure, beauty, indulgence",
    foodSuggestion: "Beautiful, indulgent flavors",
  },
  Saturn: {
    icon: "♄",
    color: "text-gray-700",
    description: "Structure, discipline, simplicity",
    foodSuggestion: "Simple, traditional recipes",
  },
};

/** Day-of-week to planetary ruler */
const DAY_RULERS: Record<number, string> = {
  0: "Sun",
  1: "Moon",
  2: "Mars",
  3: "Mercury",
  4: "Jupiter",
  5: "Venus",
  6: "Saturn",
};

interface PlanetaryHourIndicatorProps {
  date: Date;
  position?: "inline" | "tooltip";
}

export default function PlanetaryHourIndicator({
  date,
  position = "inline",
}: PlanetaryHourIndicatorProps) {
  const dayOfWeek = new Date(date).getDay();
  const planet = DAY_RULERS[dayOfWeek] || "Sun";
  const info = PLANETARY_INFO[planet];

  if (!info) return null;

  if (position === "tooltip") {
    return (
      <div className="group relative">
        <span
          className={`text-lg ${info.color} cursor-help`}
          aria-label={`${planet} rules this day`}
        >
          {info.icon}
        </span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <div className="font-semibold">{planet} Day</div>
            <div className="text-gray-300 mt-1">{info.description}</div>
            <div className="text-amber-300 mt-1">{info.foodSuggestion}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`text-base ${info.color}`}>{info.icon}</span>
      <div>
        <div className="font-medium text-gray-700">{planet}</div>
        <div className="text-gray-500 text-[10px]">{info.foodSuggestion}</div>
      </div>
    </div>
  );
}
