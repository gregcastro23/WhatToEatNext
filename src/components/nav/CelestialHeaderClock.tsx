"use client";

import { useEffect, useState, type JSX } from "react";
import { useAlchemicalSafe } from "@/contexts/AlchemicalContext/hooks";

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

const FALLBACK_RULERS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

/**
 * Live planetary-hour pill rendered in the persistent LabHeader.
 * Prefers the authoritative `planetaryHour` from AlchemicalContext; falls
 * back to a clock-derived ruler when the provider is absent.
 */
export function CelestialHeaderClock(): JSX.Element {
  const alch = useAlchemicalSafe();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fallbackIdx = ((now.getHours() - 6) + 14 * 7) % 7;
  const ruler =
    (alch?.planetaryHour && PLANET_GLYPHS[alch.planetaryHour] ? alch.planetaryHour : null) ??
    FALLBACK_RULERS[fallbackIdx] ??
    "Sun";
  const glyph = PLANET_GLYPHS[ruler] ?? "☉";
  const time = now.toTimeString().slice(0, 5);
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "5px 12px 5px 8px",
        border: "1px solid var(--line)",
        borderRadius: 999,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: 24,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "color-mix(in oklch, var(--accent), transparent 75%)",
          border: "1px solid color-mix(in oklch, var(--accent), transparent 50%)",
          fontFamily: "JetBrains Mono",
          fontSize: 13,
          color: "var(--accent)",
        }}
      >
        {glyph}
      </span>
      <div className="t-mono" style={{ fontSize: 10, lineHeight: 1.15 }}>
        <div style={{ color: "var(--fg)", letterSpacing: "0.06em" }}>
          {ruler.toUpperCase()} HOUR
        </div>
        <div style={{ color: "var(--fg-mute)", letterSpacing: "0.12em" }}>
          {time}
          <span style={{ opacity: 0.5 }}>:{seconds}</span>
        </div>
      </div>
      <span
        data-motion
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 6px var(--accent)",
          animation: "alchm-blink 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default CelestialHeaderClock;
