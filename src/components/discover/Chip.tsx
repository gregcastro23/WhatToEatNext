"use client";

import { LabelXS } from "@/components/tables/ui";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import type { JSX, ReactNode } from "react";

export interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  icon?: GlyphName;
  children: ReactNode;
  ariaPressed?: boolean;
}

/**
 * Filter / segment chip (tables-design-spec.md §3.6). Inactive = white
 * hairline glass; active = copper border + tint. Used for the filter row and
 * the kind/element chips.
 */
export function Chip({ active = false, onClick, icon, children, ariaPressed }: ChipProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-md transition-colors ${
        active
          ? "border-[color-mix(in_oklch,var(--accent),transparent_40%)] bg-[color-mix(in_oklch,var(--accent),transparent_82%)] text-alchm-fg"
          : "border-white/10 bg-white/[0.03] text-alchm-fg-dim hover:border-white/20"
      }`}
    >
      {icon && <Glyph name={icon} size={12} stroke={1.5} style={active ? { color: "var(--accent)" } : undefined} />}
      <LabelXS className={active ? "text-alchm-fg" : "text-alchm-fg-dim"}>{children}</LabelXS>
    </button>
  );
}

export default Chip;
