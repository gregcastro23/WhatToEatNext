"use client";

import React from "react";
import type { Planet } from "@/types/celestial";

const PLANET_ICONS: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
};

const PLANET_FLAVOR_NOTES: Record<string, string> = {
  Sun: "Bright, citrus-forward, vitality-boosting flavors",
  Moon: "Comfort foods, dairy, nourishing soups",
  Mercury: "Light, varied, quick-prep dishes",
  Venus: "Indulgent, sweet, rich and sensual flavors",
  Mars: "Bold spices, grilled meats, heat-driven dishes",
  Jupiter: "Abundant feasts, complex spice blends",
  Saturn: "Traditional, slow-cooked, grounding meals",
};

const MOON_PHASES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];

function getMoonPhase(): string {
  // Approximate moon phase from a known new moon date
  const knownNewMoon = new Date(2024, 0, 11).getTime(); // Jan 11 2024
  const synodicMonth = 29.53059;
  const daysSince = (Date.now() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % synodicMonth) / synodicMonth) * 8;
  return MOON_PHASES[Math.floor(phase) % 8];
}

interface PlanetaryStatusBarProps {
  currentPlanet: Planet | null;
  loading: boolean;
  hourStart?: Date;
  hourEnd?: Date;
}

export function PlanetaryStatusBar({
  currentPlanet,
  loading,
  hourStart,
  hourEnd,
}: PlanetaryStatusBarProps) {
  const planetName = currentPlanet || "Sun";
  const icon = PLANET_ICONS[planetName] || "\u2609";
  const flavorNote = PLANET_FLAVOR_NOTES[planetName] || "";
  const moonPhase = getMoonPhase();

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const timeRange =
    hourStart && hourEnd
      ? `${formatTime(hourStart)} \u2013 ${formatTime(hourEnd)}`
      : "";

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <div className="animate-pulse h-4 w-48 bg-indigo-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold">{planetName} Hour</span>
          {timeRange && (
            <span className="text-indigo-300 hidden sm:inline">
              ({timeRange})
            </span>
          )}
        </div>
        <div className="text-indigo-200 text-xs sm:text-sm text-center">
          {flavorNote}
        </div>
        <div className="text-indigo-300 text-xs hidden md:flex items-center gap-2">
          <span>{moonPhase}</span>
        </div>
      </div>
    </div>
  );
}

export default PlanetaryStatusBar;
