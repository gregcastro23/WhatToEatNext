"use client";

import React from "react";
import type { Planet } from "@/types/celestial";

type TimeOfDay = "morning" | "afternoon" | "evening";

const PLANET_TAGLINES: Record<string, string> = {
  Sun: "Radiant energy fills the kitchen \u2014 time for bright, vibrant dishes",
  Moon: "Lunar flow guides your palate \u2014 embrace comfort and nourishment",
  Mercury: "Swift Mercury inspires \u2014 try something new and unexpected",
  Venus: "Venus blesses your table \u2014 indulge in rich, beautiful flavors",
  Mars: "Mars fuels your fire \u2014 bold spices and powerful heat await",
  Jupiter: "Jupiter expands your horizons \u2014 feast with abundance",
  Saturn: "Saturn grounds your craft \u2014 honor tradition and patience",
};

const TIME_CTA: Record<TimeOfDay, string> = {
  morning: "Plan your breakfast",
  afternoon: "Discover your lunch",
  evening: "Plan your dinner",
};

const SEASON_MESSAGES: Record<string, string> = {
  winter: "Warming, hearty dishes for the cold season",
  spring: "Fresh, light flavors as nature awakens",
  summer: "Cool, vibrant fare for long sunny days",
  fall: "Rich, harvest-inspired comfort",
};

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

interface HeroSectionProps {
  planetaryHour: Planet | null;
  timeOfDay: TimeOfDay;
}

export function HeroSection({ planetaryHour, timeOfDay }: HeroSectionProps) {
  const planet = planetaryHour || "Sun";
  const tagline = PLANET_TAGLINES[planet] || PLANET_TAGLINES.Sun;
  const cta = TIME_CTA[timeOfDay];
  const season = getCurrentSeason();
  const seasonMsg = SEASON_MESSAGES[season];

  return (
    <div className="text-center mb-12 animate-fade-in">
      {/* Brand Header */}
      <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
        Alchm.kitchen
      </h1>
      <p className="text-xl md:text-2xl text-gray-600 mb-2 italic">
        Where the elements meet the cosmos
      </p>

      {/* Dynamic tagline based on planetary hour */}
      <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-4">
        {tagline}
      </p>

      {/* Seasonal context */}
      <p className="text-sm text-gray-500 mb-8">{seasonMsg}</p>

      {/* Time-based CTA */}
      <a
        href="#cuisines"
        className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        {cta} &rarr;
      </a>
    </div>
  );
}

export default HeroSection;
