"use client";

/**
 * One labelled row of removable chips in the crucible (meal target, flavors,
 * dietary regimens, exclusions, ingredients, cuisines, techniques).
 *
 * @file src/components/recipe-builder/crucible/QueueChipGroup.tsx
 */

import React from "react";
import { FOCUS_RING } from "../focusRing";

export type QueueTone = "purple" | "pink" | "teal" | "red" | "emerald" | "amber";

const CHIP_TONE: Record<QueueTone, string> = {
  purple:
    "bg-purple-500/15 text-purple-200 border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_8px_rgba(168,85,247,0.15)]",
  pink: "bg-pink-500/15 text-pink-200 border-pink-400/30",
  teal: "bg-teal-500/15 text-teal-200 border-teal-400/30",
  red: "bg-red-500/15 text-red-200 border-red-400/30",
  emerald:
    "bg-emerald-500/15 text-emerald-200 border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
  amber:
    "bg-amber-500/15 text-amber-200 border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
};

export interface QueueChip {
  key: string;
  label: string;
  /** Accessible name of the chip's remove button. */
  removeLabel: string;
  onRemove: () => void;
}

export interface QueueGroup {
  title: string;
  tone: QueueTone;
  /** Decorative glyph before each chip's label. */
  icon?: string;
  capitalize?: boolean;
  chips: QueueChip[];
}

export default function QueueChipGroup({ group }: { group: QueueGroup }): React.JSX.Element {
  return (
    <div className="mt-3.5" role="group" aria-label={group.title}>
      <div className="t-label text-[10px] text-white/50 mb-1.5" aria-hidden>
        {group.title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {group.chips.map((chip) => (
          <span
            key={chip.key}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${CHIP_TONE[group.tone]} ${
              group.capitalize ? "capitalize" : ""
            }`}
          >
            {group.icon && (
              <span className="text-[10px]" aria-hidden>
                {group.icon}
              </span>
            )}
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-white/50 hover:text-white transition-colors cursor-pointer ${FOCUS_RING}`}
              aria-label={chip.removeLabel}
            >
              <span aria-hidden>&times;</span>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
