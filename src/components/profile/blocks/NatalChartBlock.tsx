import React from "react";
import { NatalWheel } from "@/components/ui/alchm/UserVisuals";
import type { NatalPlacement, ProfileData } from "./types";

interface FormattedPlanet {
  planet: string;
  lon: number;
  sign: string;
  glyph: string;
  deg: number;
  el: string;
  mod: string;
}

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
];

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
};

function formatPlacements(positions: NatalPlacement[]): FormattedPlanet[] {
  return positions.map((p) => {
    const signLower = (p.sign ?? "").toLowerCase();
    const signIdx = ZODIAC_SIGNS.indexOf(signLower);
    const lon = ((signIdx >= 0 ? signIdx : 0) * 30 + (p.degree ?? 0)) % 360;
    const el = SIGN_TO_ELEMENT[signLower] ?? "fire";
    const mod = (signLower === "aries" || signLower === "cancer" || signLower === "libra" || signLower === "capricorn")
      ? "cardinal"
      : (signLower === "taurus" || signLower === "leo" || signLower === "scorpio" || signLower === "aquarius")
        ? "fixed"
        : "mutable";

    const planetName = p.planet ?? "";
    return {
      planet: planetName,
      lon,
      sign: p.sign ?? "aries",
      glyph: PLANET_GLYPH[planetName] ?? "✦",
      deg: Math.round(p.degree ?? 0),
      el,
      mod,
    };
  });
}

export const NatalChartBlock: React.FC<{ data: ProfileData }> = ({ data }) => {
  const positions = data.natalPositions ?? [];
  const planets = formatPlacements(positions);

  return (
    <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.01] mt-4 flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-1 w-full max-w-[360px]">
        <NatalWheel planets={planets} size={300} dominantEl={data.dominantElement ?? "air"} />
      </div>
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4 text-white/90">Natal Placement Ledger</h3>
        {planets.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {planets.map((p, i) => (
              <div key={p.planet + i} className="flex justify-between items-center text-xs p-2.5 bg-white/[0.01] rounded-xl border border-white/5 font-mono">
                <span className="capitalize text-white/50 flex items-center gap-1">
                  <span>{p.glyph}</span>
                  <span>{p.planet}</span>
                </span>
                <span className="font-medium text-white/80">{p.sign.slice(0, 3)} {p.deg}°</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40 font-mono">Chart data unavailable.</p>
        )}
      </div>
    </div>
  );
};
