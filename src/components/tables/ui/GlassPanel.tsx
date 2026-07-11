import type { ElementType, HTMLAttributes, JSX } from "react";

export interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  /** Hover lift: border white/25% + bg white/5% (spec §2.1). */
  interactive?: boolean;
  /** "2xl" for standard cards, "32" for feed artifact cards. */
  rounded?: "2xl" | "32";
  as?: ElementType;
}

/**
 * Lighter, denser sibling of .glass-card-premium for the Tables surface:
 * white/3% fill, 24px blur, white/12% hairline (tables-design-spec.md §1–2).
 */
export function GlassPanel({
  interactive = false,
  rounded = "2xl",
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: GlassPanelProps): JSX.Element {
  const radius = rounded === "32" ? "rounded-[32px]" : "rounded-2xl";
  const hover = interactive ? " glass-panel-interactive" : "";
  return (
    <Tag className={`glass-panel${hover} ${radius} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export default GlassPanel;
