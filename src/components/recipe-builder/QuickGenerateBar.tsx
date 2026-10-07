"use client";

/**
 * Quick Generate Bar
 * Live celestial telemetry (planetary day and hour, lunar phase, the day's
 * element, chart status) beside one-tap synthesis for each meal type.
 *
 * @file src/components/recipe-builder/QuickGenerateBar.tsx
 */

import React from "react";
import { GENERATION_COST_COPY } from "@/lib/recipe-builder/generateRecommendations";
import type { MealType } from "@/types/menuPlanner";
import { FOCUS_RING } from "./focusRing";

const QUICK_MEALS: readonly MealType[] = ["breakfast", "lunch", "dinner", "snack"];

interface ElementStyle {
  icon: string;
  badge: string;
  text: string;
  glow: string;
}

const DEFAULT_ELEMENT_STYLE: ElementStyle = {
  icon: "⚡",
  badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  text: "text-orange-400",
  glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
};

const ELEMENT_STYLES: Record<string, ElementStyle> = {
  Fire: { ...DEFAULT_ELEMENT_STYLE, icon: "🔥" },
  Water: {
    icon: "💧",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    text: "text-sky-400",
    glow: "shadow-[0_0_15px_rgba(56,189,248,0.15)]",
  },
  Earth: {
    icon: "🌍",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    text: "text-emerald-400",
    glow: "shadow-[0_0_15px_rgba(52,211,153,0.15)]",
  },
  Air: {
    icon: "💨",
    badge: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    text: "text-indigo-400",
    glow: "shadow-[0_0_15px_rgba(129,140,248,0.15)]",
  },
};

function StatusPill({ icon, label, className }: { icon: string; label: string; className: string }): React.JSX.Element {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg ${className}`}>
      <span className="text-xs" aria-hidden>{icon}</span>
      <span className="t-mono text-[11px] font-medium capitalize">{label}</span>
    </div>
  );
}

interface QuickGenerateBarProps {
  onGenerate: (mealType: MealType) => void;
  isGenerating: boolean;
  planetaryInfo: { planet: string; element: string };
  planetaryHour: string | null;
  lunarPhase: string;
  isPersonalized: boolean;
}

function CelestialTelemetry({
  planetaryInfo,
  planetaryHour,
  lunarPhase,
  isPersonalized,
}: Omit<QuickGenerateBarProps, "onGenerate" | "isGenerating">): React.JSX.Element {
  const style = ELEMENT_STYLES[planetaryInfo.element] ?? DEFAULT_ELEMENT_STYLE;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${style.badge}`} aria-hidden>
          {style.icon}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white tracking-wide">{planetaryInfo.planet} Day</p>
            {planetaryHour && (
              <span className="t-mono text-[10px] text-white/50 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10">
                {planetaryHour} Hour
              </span>
            )}
          </div>
          <p className={`text-xs font-medium ${style.text}`}>{planetaryInfo.element} Element Energy</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {lunarPhase && <StatusPill icon="🌙" label={lunarPhase} className="bg-purple-950/40 border-purple-500/25 text-purple-200" />}
        {isPersonalized ? (
          <StatusPill icon="✨" label="Chart Active" className="bg-amber-950/40 border-amber-500/25 text-amber-200" />
        ) : (
          <StatusPill icon="🔮" label="Sky Baseline" className="bg-white/[0.04] border-white/10 text-white/60" />
        )}
      </div>
    </div>
  );
}

export default function QuickGenerateBar(props: QuickGenerateBarProps): React.JSX.Element {
  const { onGenerate, isGenerating, planetaryInfo } = props;
  const style = ELEMENT_STYLES[planetaryInfo.element] ?? DEFAULT_ELEMENT_STYLE;

  return (
    <div className={`glass-card-premium rounded-2xl p-4 sm:p-5 border border-white/10 ${style.glow} transition-all`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <CelestialTelemetry {...props} />
        <div
          role="group"
          aria-label="Quick synthesis"
          className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5"
        >
          <span className="t-label text-[10px] text-white/50 tracking-wider hidden sm:inline mr-1" aria-hidden>
            Quick Synthesis:
          </span>
          {QUICK_MEALS.map((meal) => (
            <button
              key={meal}
              type="button"
              onClick={() => onGenerate(meal)}
              disabled={isGenerating}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all bg-white/[0.05] hover:bg-white/[0.12] active:scale-95 text-white/90 hover:text-white border border-white/15 hover:border-amber-400/40 hover:shadow-[0_0_12px_rgba(251,191,36,0.2)] disabled:opacity-40 disabled:cursor-not-allowed capitalize cursor-pointer flex items-center gap-1.5 ${FOCUS_RING}`}
              title={`Synthesize a ${meal} using live celestial alignments (${GENERATION_COST_COPY})`}
            >
              <span>{meal}</span>
              <span className="text-[10px] opacity-60" aria-hidden>✨</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
