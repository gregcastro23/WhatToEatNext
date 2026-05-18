import type { JSX } from "react";

export function ScanLine(): JSX.Element {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
    >
      <div
        data-motion
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklch, var(--accent), transparent 40%), transparent)",
          animation: "alchm-scanLine 6s linear infinite",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export default ScanLine;
