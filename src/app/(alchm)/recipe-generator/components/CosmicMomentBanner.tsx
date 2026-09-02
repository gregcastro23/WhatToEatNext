import React from "react";
import { elementalSignature } from "@/utils/elemental/signature";
import { ELEMENT_ICONS, type CosmicMomentProps } from "./types";

const MomentPillCards: React.FC<{
  planetaryInfo: CosmicMomentProps["planetaryInfo"];
  lunarPhase: string;
  currentZodiac: string;
  sig: ReturnType<typeof elementalSignature>;
  planetaryHour: string | null;
}> = ({ planetaryInfo, lunarPhase, currentZodiac, sig, planetaryHour }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
      <div className="text-xs opacity-70 mb-1">Planetary Day</div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{ELEMENT_ICONS[planetaryInfo.element] ?? "⚡"}</span>
        <div>
          <div className="font-bold text-sm">{planetaryInfo.planet}</div>
          <div className="text-xs opacity-70">{planetaryInfo.element}</div>
        </div>
      </div>
    </div>
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
      <div className="text-xs opacity-70 mb-1">Sun Sign</div>
      <div className="font-bold text-sm capitalize">{currentZodiac}</div>
      <div className="text-xs opacity-70">{planetaryInfo.energy} energy</div>
    </div>
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
      <div className="text-xs opacity-70 mb-1">Moon Phase</div>
      <div className="font-bold text-sm capitalize">{lunarPhase ? lunarPhase.replace(/_/g, " ") : "Unknown"}</div>
      {planetaryHour && <div className="text-xs opacity-70">{planetaryHour} hour</div>}
    </div>
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
      <div className="text-xs opacity-70 mb-1">Elemental Lean</div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{ELEMENT_ICONS[sig.dominant] ?? "⚡"}</span>
        <div>
          <div className="font-bold text-sm">{sig.shortLabel}</div>
          <div className="text-xs opacity-70">{sig.tier === "balanced" ? "even" : `${Math.round(sig.values[sig.dominant] * 100)}%`}</div>
        </div>
      </div>
    </div>
  </div>
);

export const CosmicMomentBanner: React.FC<CosmicMomentProps> = ({
  planetaryInfo,
  lunarPhase,
  currentZodiac,
  activePlanets,
  domElements,
  isPersonalized,
  planetaryHour,
}) => {
  const sig = elementalSignature({
    Fire: domElements.Fire ?? 0,
    Water: domElements.Water ?? 0,
    Earth: domElements.Earth ?? 0,
    Air: domElements.Air ?? 0,
  });

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider opacity-80">
          Current Cosmic Moment
        </h2>
        {isPersonalized && (
          <span className="px-2.5 py-1 bg-white/15 rounded-full text-xs font-medium backdrop-blur-sm">
            Birth Chart Active
          </span>
        )}
      </div>

      <MomentPillCards
        planetaryInfo={planetaryInfo}
        lunarPhase={lunarPhase}
        currentZodiac={currentZodiac}
        sig={sig}
        planetaryHour={planetaryHour}
      />

      {activePlanets.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs opacity-70">Active:</span>
          {activePlanets.slice(0, 6).map((planet) => (
            <span key={planet} className="px-2 py-0.5 bg-white/15 rounded-full text-xs font-medium">
              {planet}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
