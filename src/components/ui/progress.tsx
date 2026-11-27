import type { HTMLAttributes } from "react";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress = ({ value = 0, className = "", ...p }: ProgressProps) => (
  <div className={`bg-gray-800 rounded-full ${className}`} {...p}>
    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${value}%` }} />
  </div>
);
