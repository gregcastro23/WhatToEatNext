import type { ElementType, HTMLAttributes, JSX } from "react";

export interface GradientTextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

/** Canonical 135° copper→violet gradient text (tables-design-spec.md §1). */
export function GradientText({
  as: Tag = "span",
  className = "",
  children,
  ...rest
}: GradientTextProps): JSX.Element {
  return (
    <Tag className={`text-gradient-alchm ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export default GradientText;
