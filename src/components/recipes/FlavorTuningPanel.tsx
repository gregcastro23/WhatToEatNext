"use client";

import React, { useState } from "react";
import { FLAVOR_DIRECTIONS, suggestTweak, type FlavorDirection, type FlavorTweak } from "@/utils/flavorTuning";

const DIRECTION_COLOR: Record<FlavorDirection, { chip: string; label: string }> = {
  sweeter: { chip: "bg-amber-500/10 border-amber-500/30 text-amber-200",  label: "text-amber-300" },
  umami:   { chip: "bg-rose-500/10 border-rose-500/30 text-rose-200",     label: "text-rose-300" },
  acidic:  { chip: "bg-yellow-500/10 border-yellow-500/30 text-yellow-200", label: "text-yellow-300" },
  spicier: { chip: "bg-red-500/10 border-red-500/30 text-red-200",        label: "text-red-300" },
  savory:  { chip: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200", label: "text-emerald-300" },
};

export function FlavorTuningPanel() {
  const [tweaks, setTweaks] = useState<FlavorTweak[]>([]);

  const addTweak = (direction: FlavorDirection) => {
    setTweaks((curr) => [...curr, suggestTweak(direction, curr)]);
  };

  const removeTweak = (id: string) => {
    setTweaks((curr) => curr.filter((t) => t.id !== id));
  };

  const clearAll = () => setTweaks([]);

  return (
    <div className="glass-card-premium rounded-2xl border border-white/8 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 flex items-center gap-2">
            <span className="not-italic text-xl">{"\u{1F9C2}"}</span>
            Flavor Tweaks
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Nudge the dish. Each click stages a micro-adjustment you can pick up at the stove.
          </p>
        </div>
        {tweaks.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-amber-300 hover:text-amber-200 underline decoration-dotted underline-offset-4"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FLAVOR_DIRECTIONS.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => addTweak(key)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/80 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-200 transition-colors flex items-center gap-1.5"
          >
            <span className="text-amber-400">+</span>
            <span className="not-italic">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {tweaks.length === 0 ? (
        <p className="text-xs text-white/40 italic">
          No tweaks staged. Click a direction to add a suggestion.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {tweaks.map((t) => {
            const cfg = DIRECTION_COLOR[t.direction];
            return (
              <li
                key={t.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${cfg.chip} capitalize`}>
                  {t.direction}
                </span>
                <div className="flex-1 min-w-0 text-sm">
                  <span className={`font-semibold ${cfg.label}`}>+ {t.amount}</span>
                  <span className="text-white/80"> {t.ingredient}</span>
                  <span className="text-white/50 italic"> &middot; {t.reason}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeTweak(t.id)}
                  className="shrink-0 text-white/30 hover:text-rose-300 text-xs px-1"
                  aria-label="Remove tweak"
                >
                  &#x2715;
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
