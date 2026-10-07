"use client";

/**
 * A recipe's Fire/Water/Earth/Air profile as four labelled bars. Renders
 * nothing for a recipe that arrives without elemental values.
 *
 * @file src/components/recipe-builder/carousel/ElementalProfile.tsx
 */

import React from "react";
import type { ClassicalElement } from "@/utils/astrology/signElement";
import { CRUCIBLE_ELEMENTS } from "../crucible/elementalBalance";

const ELEMENT_ICONS: Record<ClassicalElement, string> = {
  Fire: "🔥",
  Water: "💧",
  Earth: "🌍",
  Air: "💨",
};

const ELEMENT_BAR_COLORS: Record<ClassicalElement, string> = {
  Fire: "bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  Water: "bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]",
  Earth: "bg-gradient-to-r from-emerald-600 to-amber-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  Air: "bg-gradient-to-r from-sky-400 to-indigo-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]",
};

type ElementalValues = Partial<Record<ClassicalElement, number>>;

/** 0–1 → whole percent, clamped; a missing or non-finite value reads 0. */
function percentOf(values: ElementalValues, element: ClassicalElement): number {
  const value = values[element];
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value * 100)));
}

export default function ElementalProfile({
  values,
}: {
  values: ElementalValues | undefined;
}): React.JSX.Element | null {
  if (!values) return null;
  return (
    <div className="px-5 pb-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
        Elemental Profile
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {CRUCIBLE_ELEMENTS.map((el) => {
          const pct = percentOf(values, el);
          return (
            <div key={el} className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-2 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-mono">
                <span aria-hidden>{ELEMENT_ICONS[el]}</span>
                <span className="text-gray-300">{pct}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden" aria-hidden>
                <div className={`h-full rounded-full ${ELEMENT_BAR_COLORS[el]}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground text-center">{el}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
