import { ELEMENT_COLORS, type Element } from "./elements";
import { LabelXS } from "./LabelXS";
import type { JSX, ReactNode } from "react";

export interface ElementChipProps {
  element: Element;
  /** Chip copy, e.g. "WATER DOMINANT" or "FIRE · ARIES SUN". */
  children?: ReactNode;
  className?: string;
}

/**
 * Element pill: black/40 blurred capsule, element-tinted hairline, glowing
 * 2px dot + LabelXS copy (tables-design-spec.md §1 + §2.8).
 */
export function ElementChip({
  element,
  children,
  className = "",
}: ElementChipProps): JSX.Element {
  const colors = ELEMENT_COLORS[element];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 bg-black/40 backdrop-blur-md border ${colors.border} ${className}`}
    >
      <span
        className={`h-0.5 w-0.5 rounded-full ${colors.dot}`}
        aria-hidden
      />
      <LabelXS className={colors.text}>
        {children ?? element.toUpperCase()}
      </LabelXS>
    </span>
  );
}

export default ElementChip;
