"use client";

import { Plus } from "lucide-react";
import { AvatarCircle, type AvatarPerson } from "./AvatarCircle";
import { ELEMENT_COLORS, ELEMENT_ICONS, type Element } from "./elements";
import { LabelXS } from "./LabelXS";
import type { JSX } from "react";

export type AvatarClusterRingVariant = "live" | "upcoming" | "host";

export interface AvatarClusterRingProps {
  variant: AvatarClusterRingVariant;
  /** Rail caption under the tile: "LIVE", "8:00", "TOM", "HOST A TABLE"… */
  label?: string;
  /** Up to 3 members render as overlapping mini avatars. */
  avatars?: AvatarPerson[];
  /** Bottom-right element-glyph badge. */
  element?: Element;
  /** Outer diameter in px. */
  size?: number;
  onClick?: () => void;
  className?: string;
}

const RING: Record<AvatarClusterRingVariant, string> = {
  live: "bg-gradient-alchm glow-violet",
  upcoming: "bg-alchm-copper glow-amber",
  host: "border-2 border-dashed border-white/20",
};

const LABEL_TONE: Record<AvatarClusterRingVariant, string> = {
  live: "text-alchm-violet-bright",
  upcoming: "text-alchm-copper-bright",
  host: "text-alchm-fg-mute",
};

const VARIANT_NAMES: Record<AvatarClusterRingVariant, string> = {
  live: "Live table",
  upcoming: "Upcoming table",
  host: "Host a Table",
};

/**
 * Table-rail circular tile: gradient violet ring + glow when live, solid
 * copper ring for upcoming, dashed "Host a Table" affordance; inner circle
 * holds up to 3 overlapping mini avatars plus a bottom-right element-glyph
 * badge (tables-design-spec.md §2.4).
 */
export function AvatarClusterRing({
  variant,
  label,
  avatars = [],
  element,
  size = 72,
  onClick,
  className = "",
}: AvatarClusterRingProps): JSX.Element {
  const ElementIcon = element ? ELEMENT_ICONS[element] : null;
  const members = avatars.slice(0, 3);
  const miniSize = Math.round(size * 0.42);
  // Never an empty accessible name (axe button-name): announce the table
  // state, plus the member names when there are any. A just-created table
  // (no label, no avatars) still reads as "Live table" / "Upcoming table".
  const accessibleName =
    members.length > 0
      ? `${VARIANT_NAMES[variant]}: ${members
          .map((member) => member.name)
          .join(", ")}`
      : label || VARIANT_NAMES[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleName}
      className={`group flex flex-col items-center gap-2 focus-visible:outline-none ${className}`}
    >
      <span className="relative inline-block">
        <span
          className={`flex items-center justify-center rounded-full p-[2px] ${RING[variant]} group-focus-visible:ring-2 group-focus-visible:ring-alchm-violet group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-alchm-bg`}
          style={{ width: size, height: size }}
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-alchm-bg-elev">
            {variant === "host" ? (
              <Plus
                className="text-alchm-fg-dim transition-colors group-hover:text-alchm-fg"
                size={Math.round(size * 0.34)}
                aria-hidden
              />
            ) : (
              <span className="flex items-center -space-x-2">
                {members.map((member) => (
                  <AvatarCircle
                    key={member.name}
                    {...member}
                    size={miniSize}
                    className="border-2 border-alchm-bg-elev"
                  />
                ))}
              </span>
            )}
          </span>
        </span>
        {ElementIcon && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-alchm-bg-elev border border-white/10 ${element ? ELEMENT_COLORS[element].text : ""}`}
            aria-label={element}
            role="img"
          >
            <ElementIcon size={10} aria-hidden />
          </span>
        )}
      </span>
      {label && <LabelXS className={LABEL_TONE[variant]}>{label}</LabelXS>}
    </button>
  );
}

export default AvatarClusterRing;
