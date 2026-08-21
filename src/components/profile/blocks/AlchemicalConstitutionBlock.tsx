import React from "react";
import type { ProfileData } from "./types";

const EL_COLORS: Record<string, string> = {
  Fire: "bg-gradient-to-r from-orange-500 to-red-500",
  Water: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Air: "bg-gradient-to-r from-sky-400 to-purple-500",
  Earth: "bg-gradient-to-r from-emerald-500 to-lime-500",
};

export const AlchemicalConstitutionBlock: React.FC<{ data: ProfileData }> = ({ data }) => {
  const affinities = data.tasteGraph?.elementalAffinities ?? {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };
  const dominant = data.dominantElement ?? "Balanced";

  return (
    <div className="p-4 border border-white/10 rounded-lg bg-white/5 mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Alchemical Constitution</h3>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
            Dominant Element: <span className="text-white/80 font-bold">{dominant}</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(affinities).map(([el, val]) => {
          const pct = Math.round((val ?? 0) * 100);
          return (
            <div key={el} className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-white/70">
                <span>{el.toUpperCase()}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${EL_COLORS[el] ?? "bg-purple-600"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
