import type { ElementType, HTMLAttributes, JSX } from "react";

export interface LabelXSProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

/**
 * The Tables system's signature metadata label: 10px/16px mono uppercase
 * +0.1em (tables-design-spec.md §2.3). Inherits color — set the tone via
 * className (text-alchm-fg-dim for standard metadata, text-alchm-fg-warm
 * for the warm variant, element tints inside chips).
 */
export function LabelXS({
  as: Tag = "span",
  className = "",
  children,
  ...rest
}: LabelXSProps): JSX.Element {
  return (
    <Tag
      className={`text-label-xs font-mono uppercase ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default LabelXS;
