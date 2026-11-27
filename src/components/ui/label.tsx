import type { LabelHTMLAttributes } from "react";

export const Label = ({ children, className = "", ...p }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={className} {...p}>
    {children}
  </label>
);
