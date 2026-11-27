import type { HTMLAttributes } from "react";

export const ScrollArea = ({ children, className = "", ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`overflow-auto ${className}`} {...p}>
    {children}
  </div>
);