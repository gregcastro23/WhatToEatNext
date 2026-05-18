import type { JSX } from "react";

export interface ProcurementMarkProps {
  size?: number;
}

export function ProcurementMark({ size = 28 }: ProcurementMarkProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--accent-2)" strokeWidth="0.8" />
      <path
        d="M5 14h14M8 10l4-4 4 4M12 6v10"
        stroke="var(--accent-2)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="var(--accent-2)" />
    </svg>
  );
}

export default ProcurementMark;
