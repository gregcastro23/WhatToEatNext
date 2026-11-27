import type { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: string;
}

export const Badge = ({ children, className = "", variant: _variant, ...p }: BadgeProps) => (
  <span className={`px-2 py-1 rounded-full text-xs ${className}`} {...p}>
    {children}
  </span>
);
