import { Glyph } from "@/components/ui/alchm/Glyph";
import { ELEMENT_COLORS, ELEMENT_GLYPHS, type Element } from "./elements";
import type { JSX } from "react";

/** A person rendered by the Tables avatar components. */
export interface AvatarPerson {
  name: string;
  /** Real photo when the roster member has one. */
  src?: string;
  /** Drives the sigil fallback color/glyph when there is no photo. */
  element?: Element;
}

export interface AvatarCircleProps extends AvatarPerson {
  /** Diameter in px. */
  size?: number;
  className?: string;
}

/**
 * Avatar primitive (exported from the kit barrel since PR 4). When no photo
 * exists it falls back to the member's alchemical element sigil — never an
 * invented face (tables-design-spec.md §4.8).
 */
export function AvatarCircle({
  name,
  src,
  element = "Air",
  size = 40,
  className = "",
}: AvatarCircleProps): JSX.Element {
  const colors = ELEMENT_COLORS[element];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={`inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 ${colors.text} ${className}`}
      style={{ width: size, height: size }}
    >
      <Glyph
        name={ELEMENT_GLYPHS[element]}
        size={Math.max(10, Math.round(size * 0.45))}
        stroke={1.4}
      />
    </span>
  );
}

export default AvatarCircle;
