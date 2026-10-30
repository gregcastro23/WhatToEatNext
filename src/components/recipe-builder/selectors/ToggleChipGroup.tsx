"use client";

/**
 * A labelled group of toggle chips — the shape every preference selector in
 * the recipe builder shares. Each chip is a real button with `aria-pressed`,
 * so a screen reader announces its state and the keyboard reaches it.
 *
 * @file src/components/recipe-builder/selectors/ToggleChipGroup.tsx
 */

import React, { useId } from "react";
import { FOCUS_RING } from "../focusRing";

export type ChipTone = "purple" | "pink" | "teal" | "red" | "amber";

const SELECTED_TONE: Record<ChipTone, string> = {
  purple:
    "bg-purple-600/30 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
  pink: "bg-pink-600/30 text-pink-200 border-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.3)]",
  teal: "bg-teal-500/20 text-teal-200 border-teal-400/80 shadow-[0_0_12px_rgba(20,184,166,0.2)]",
  red: "bg-red-500/20 text-red-200 border-red-400/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
  amber:
    "bg-amber-600/30 text-amber-200 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
};

const IDLE_TONE =
  "bg-white/[0.04] text-white/70 border-white/10 hover:border-white/25 hover:bg-white/[0.08] hover:text-white";

interface ToggleChipGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  isSelected: (option: T) => boolean;
  onToggle: (option: T) => void;
  tone: ChipTone;
  /** Decorative glyph shown before an option's label. */
  iconFor?: (option: T) => string;
  chipClassName?: string;
  /** Rendered under the chips, inside the group (custom-entry inputs, notes). */
  children?: React.ReactNode;
}

export function ToggleChipGroup<T extends string>({
  label,
  options,
  isSelected,
  onToggle,
  tone,
  iconFor,
  chipClassName = "",
  children,
}: ToggleChipGroupProps<T>): React.JSX.Element {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId}>
      <span id={labelId} className="t-label text-[11px] text-white/60 mb-2 block">
        {label}
      </span>
      <div className={`flex flex-wrap gap-2 ${children ? "mb-2.5" : ""}`}>
        {options.map((option) => {
          const selected = isSelected(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(option)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer ${FOCUS_RING} ${
                selected ? SELECTED_TONE[tone] : IDLE_TONE
              } ${chipClassName}`}
            >
              {iconFor && <span aria-hidden>{iconFor(option)}</span>}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
