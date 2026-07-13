"use client";

import type { ButtonHTMLAttributes, JSX } from "react";

export type GradientButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Gradient CTA pill: 135° copper→violet fill; hover = violet glow
 * `0 0 20px rgba(181,126,224,0.4)` + slight lift (tables-design-spec.md §2.2).
 */
export function GradientButton({
  className = "",
  type = "button",
  children,
  ...rest
}: GradientButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 bg-gradient-alchm text-alchm-bg text-sm font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(181,126,224,0.4)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alchm-violet focus-visible:ring-offset-2 focus-visible:ring-offset-alchm-bg disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default GradientButton;
