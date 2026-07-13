"use client";

import { Sparkles, type LucideIcon } from "lucide-react";
import { ELEMENT_COLORS, ELEMENT_ICONS, type Element } from "./elements";
import { LabelXS } from "./LabelXS";
import type { JSX } from "react";

export type ReactionKind = "spark" | Element;

/** Always the full set — Stitch rendered subsets, we never do (spec §4.4). */
export const REACTION_KINDS: ReactionKind[] = [
  "spark",
  "Fire",
  "Water",
  "Earth",
  "Air",
];

const REACTION_ICONS: Record<ReactionKind, LucideIcon> = {
  spark: Sparkles,
  ...ELEMENT_ICONS,
};

const REACTION_TINTS: Record<ReactionKind, { active: string; hover: string }> =
  {
    spark: {
      active: "text-alchm-violet-bright",
      hover: "hover:text-alchm-violet-bright",
    },
    Fire: {
      active: ELEMENT_COLORS.Fire.text,
      hover: ELEMENT_COLORS.Fire.hoverText,
    },
    Water: {
      active: ELEMENT_COLORS.Water.text,
      hover: ELEMENT_COLORS.Water.hoverText,
    },
    Earth: {
      active: ELEMENT_COLORS.Earth.text,
      hover: ELEMENT_COLORS.Earth.hoverText,
    },
    Air: {
      active: ELEMENT_COLORS.Air.text,
      hover: ELEMENT_COLORS.Air.hoverText,
    },
  };

export interface ReactionBarProps {
  counts?: Partial<Record<ReactionKind, number>>;
  /** Reactions the viewer has already given (rendered pressed + tinted). */
  active?: ReactionKind[];
  onReact?: (kind: ReactionKind) => void;
  /** "chip" = bordered rounded-full pills (Memory screen variant). */
  variant?: "inline" | "chip";
  className?: string;
}

/**
 * Elemental reaction row: spark + the four element icons, counts in LabelXS,
 * hover/active tints to the element color (tables-design-spec.md §2.10).
 */
export function ReactionBar({
  counts = {},
  active = [],
  onReact,
  variant = "inline",
  className = "",
}: ReactionBarProps): JSX.Element {
  const gap = variant === "chip" ? "gap-2" : "gap-4";
  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {REACTION_KINDS.map((kind) => {
        const Icon = REACTION_ICONS[kind];
        const tint = REACTION_TINTS[kind];
        const isActive = active.includes(kind);
        const count = counts[kind] ?? 0;
        const shape =
          variant === "chip"
            ? "rounded-full px-4 py-2 border border-white/10 bg-white/5"
            : "rounded-full p-1";
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onReact?.(kind)}
            aria-pressed={isActive}
            aria-label={`React with ${kind === "spark" ? "a spark" : kind}`}
            className={`flex items-center gap-1 ${shape} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alchm-violet ${
              isActive ? tint.active : `text-alchm-fg-mute ${tint.hover}`
            }`}
          >
            <Icon size={16} aria-hidden />
            <LabelXS>{count}</LabelXS>
          </button>
        );
      })}
    </div>
  );
}

export default ReactionBar;
