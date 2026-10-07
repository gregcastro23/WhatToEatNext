"use client";

/**
 * The suggestion carousel's frame: loading and empty states, the position
 * header, the desktop arrow buttons, and the pagination dots.
 *
 * @file src/components/recipe-builder/carousel/CarouselChrome.tsx
 */

import { ChevronLeft, ChevronRight, Flame, Sparkles } from "lucide-react";
import React from "react";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import { FOCUS_RING } from "../focusRing";

/** A chart boost above this multiplier earns the "Chart aligned" badge. */
const CHART_ALIGNED_BOOST = 1.05;

export function CarouselLoading(): React.JSX.Element {
  return (
    <div className="space-y-4" role="status" aria-label="Synthesizing recipes">
      <div className="flex items-center justify-center gap-2 text-purple-300 py-2">
        <svg className="animate-spin h-5 w-5 text-amber-400" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-mono tracking-wide">Consulting the celestial transits for your synthesis...</span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/60 p-6 mx-2 md:mx-6 animate-pulse backdrop-blur-xl" aria-hidden>
        <div className="h-7 bg-white/10 rounded w-3/4 mb-3" />
        <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
        <div className="h-4 bg-white/5 rounded w-full mb-2" />
        <div className="h-4 bg-white/5 rounded w-5/6 mb-6" />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 w-20 bg-white/10 rounded-full" />
          ))}
        </div>
        <div className="h-12 bg-white/10 rounded-xl w-full" />
      </div>
    </div>
  );
}

export function CarouselEmpty(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
      <span className="text-4xl mb-3" aria-hidden>✨</span>
      <p className="font-semibold text-white tracking-wide">No recipes synthesized yet</p>
      <p className="text-xs font-mono text-muted-foreground mt-1">
        Adjust ingredients or cosmic preferences above and click Generate Recipes
      </p>
    </div>
  );
}

const BADGE = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-mono";

export function CarouselHeader({
  current,
  position,
  total,
  isPersonalized,
}: {
  current: RecommendedMeal;
  position: number;
  total: number;
  isPersonalized: boolean;
}): React.JSX.Element {
  const chartAligned =
    current.isPersonalized === true && (current.personalizationBoost ?? 0) > CHART_ALIGNED_BOOST;
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground" aria-live="polite">
        Alchemical Synthesis {position} of {total}
      </span>
      {isPersonalized && (
        <span className={`${BADGE} border-purple-500/30 bg-purple-500/10 text-purple-300`}>
          <Sparkles className="h-2.5 w-2.5 text-amber-300" aria-hidden />
          Personalized
        </span>
      )}
      {chartAligned && (
        <span className={`${BADGE} border-indigo-500/30 bg-indigo-500/10 text-indigo-300`}>
          <Flame className="h-2.5 w-2.5 text-indigo-400" aria-hidden />
          Chart aligned
        </span>
      )}
    </div>
  );
}

export function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}): React.JSX.Element {
  const isPrev = direction === "prev";
  const Icon = isPrev ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Previous recipe" : "Next recipe"}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/80 backdrop-blur-md shadow-xl border border-white/15 items-center justify-center text-purple-300 hover:bg-purple-600 hover:text-white transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none hover:scale-105 active:scale-95 ${FOCUS_RING} ${
        isPrev ? "left-[-20px] lg:left-[-24px]" : "right-[-20px] lg:right-[-24px]"
      }`}
    >
      <Icon className="w-5 h-5" aria-hidden />
    </button>
  );
}

export function CarouselPagination({
  count,
  currentIndex,
  onSelect,
}: {
  count: number;
  currentIndex: number;
  onSelect: (index: number) => void;
}): React.JSX.Element {
  return (
    <div className="flex justify-center items-center gap-2 py-2" role="group" aria-label="Choose a recipe">
      {Array.from({ length: count }, (_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(idx)}
          aria-current={idx === currentIndex ? "true" : undefined}
          className={`rounded-full transition-all duration-300 ${FOCUS_RING} ${
            idx === currentIndex
              ? "w-7 h-2 bg-gradient-to-r from-purple-400 to-amber-400 shadow-[0_0_10px_rgba(168,85,247,0.7)]"
              : "w-2 h-2 bg-white/20 hover:bg-white/40"
          }`}
          aria-label={`Go to recipe ${idx + 1}`}
        />
      ))}
    </div>
  );
}
