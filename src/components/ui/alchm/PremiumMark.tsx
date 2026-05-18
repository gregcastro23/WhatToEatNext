import type { JSX } from "react";

export interface PremiumMarkProps {
  size?: number;
}

export function PremiumMark({ size = 16 }: PremiumMarkProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" fill="var(--accent)" />
      <circle cx="8" cy="8" r="6" stroke="var(--accent)" strokeWidth="0.8" />
    </svg>
  );
}

export default PremiumMark;
