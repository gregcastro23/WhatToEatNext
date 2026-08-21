import React from "react";
import { PalateRadar } from "@/components/ui/alchm/UserVisuals";
import type { ProfileBlockProps } from "./types";

export const TasteGraphBlock: React.FC<ProfileBlockProps> = ({ data, isOwner }) => {
  const affinities = data.tasteGraph?.elementalAffinities;
  const palateValues = affinities
    ? {
        spicy: affinities.Fire ?? 0,
        sweet: affinities.Air ?? 0,
        umami: affinities.Earth ?? 0,
        acidic: affinities.Water ?? 0,
        bitter: (affinities.Earth ?? 0) * 0.9 || 0,
      }
    : {
        spicy: 0.72,
        sweet: 0.34,
        umami: 0.88,
        acidic: 0.66,
        bitter: 0.48,
      };

  const cuisines = data.tasteGraph?.cuisines ?? [];

  return (
    <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.01] mt-4 flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-1 w-full max-w-[260px]">
        <PalateRadar values={palateValues} size={240} />
      </div>
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-3">Palate DNA</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {cuisines.slice(0, 3).map((c) => (
            <span key={c.name} className="px-3 py-1.5 bg-purple-500/10 rounded-full text-xs border border-purple-500/20 text-purple-300 font-mono">
              {c.name}
            </span>
          ))}
          {cuisines.length === 0 && (
            <span className="text-sm text-white/40 font-mono">No palate data available.</span>
          )}
        </div>
        {isOwner && (
          <button type="button" className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider font-mono">
            Refine Preferences
          </button>
        )}
      </div>
    </div>
  );
};
