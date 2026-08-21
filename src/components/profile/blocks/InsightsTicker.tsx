import React, { useEffect, useMemo, useState } from "react";
import type { ProfileData } from "./types";

function generateInsights(data: ProfileData): string[] {
  const list: string[] = [];
  const placements = data.natalPositions ?? [];
  const affinities = data.tasteGraph?.elementalAffinities;

  const sun = placements.find((p) => p.planet === "Sun");
  const moon = placements.find((p) => p.planet === "Moon");

  if (sun?.sign) {
    list.push(`With Sun in ${sun.sign}, your alchemical constitution seeks corresponding solar coordinate flavors.`);
  }
  if (moon?.sign) {
    list.push(`The Moon in ${moon.sign} influences your nocturnal digestive patterns and hydration cycles.`);
  }

  if (affinities) {
    const sorted = Object.entries(affinities)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number")
      .sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const [domName, domVal] = sorted[0] ?? ["Fire", 0];
      list.push(`Your dominant element is ${domName} (${Math.round(domVal * 100)}%), driving your primary taste preferences.`);
    }
    if (sorted.length > 1) {
      const [weakName] = sorted[sorted.length - 1] ?? ["Earth", 0];
      list.push(`Introduce ingredients matching ${weakName} to harmonize and balance your weaker elemental current.`);
    }
  }

  const cuisines = data.tasteGraph?.cuisines ?? [];
  if (cuisines.length > 0 && cuisines[0]) {
    list.push(`Your taste graph displays a high implicit compatibility with ${cuisines[0].name} kitchen methods.`);
  }

  if (list.length < 3) {
    list.push("Consult the astronomical ephemeris daily to synchronize your plate with current transits.");
    list.push("Balance volatile Spirit and grounding Matter elements to maximize your alchemical yield.");
  }

  return list;
}

export const InsightsTicker: React.FC<{ data: ProfileData }> = ({ data }) => {
  const [index, setIndex] = useState(0);

  const insights = useMemo(() => generateInsights(data), [data]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % insights.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [insights.length]);

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4 overflow-hidden">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        Live Insights
      </h3>
      <div className="text-sm h-6 transition-all duration-300 text-white/80">
        {insights[index]}
      </div>
    </div>
  );
};
