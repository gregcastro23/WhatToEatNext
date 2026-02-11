"use client";

import React, { useState, useEffect } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import DynamicCuisineRecommender from "@/components/home/DynamicCuisineRecommender";
import { EnhancedIngredientRecommender } from "@/components/recommendations/EnhancedIngredientRecommender";
import EnhancedCookingMethodRecommender from "@/components/recommendations/EnhancedCookingMethodRecommender";
import type { Planet } from "@/types/celestial";

type TimeOfDay = "morning" | "afternoon" | "evening";

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getPlanetaryHour(): Planet {
  const planetaryHours: Planet[] = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
  ];
  const hour = new Date().getHours();
  return planetaryHours[hour % 7];
}

export default function Home() {
  const [planetaryHour, setPlanetaryHour] = useState<Planet | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");

  useEffect(() => {
    setPlanetaryHour(getPlanetaryHour());
    setTimeOfDay(getTimeOfDay());
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <HeroSection planetaryHour={planetaryHour} timeOfDay={timeOfDay} />

        {/* Cuisine Recommendations */}
        <section id="cuisines" className="mb-12">
          <DynamicCuisineRecommender />
        </section>

        {/* Ingredient Recommendations */}
        <section id="ingredients" className="mb-12">
          <EnhancedIngredientRecommender />
        </section>

        {/* Cooking Method Recommendations */}
        <section id="cooking-methods" className="mb-12">
          <EnhancedCookingMethodRecommender />
        </section>
      </div>
    </main>
  );
}
