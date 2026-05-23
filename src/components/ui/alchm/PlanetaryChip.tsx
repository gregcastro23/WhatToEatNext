"use client";

import { useEffect, useState } from "react";
import { useAlchemicalSafe } from "@/contexts/AlchemicalContext/hooks";
import type { CSSProperties, JSX } from "react";

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

const PLANET_ELEMENT: Record<string, "fire" | "water" | "earth" | "air"> = {
  Sun: "fire",
  Mars: "fire",
  Jupiter: "fire",
  Moon: "water",
  Venus: "earth",
  Mercury: "air",
  Saturn: "earth",
};

const FALLBACK_ROTATION = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

export interface PlanetaryChipProps {
  planet?: string;
  symbol?: string;
  hour?: string;
  /** Set true to skip the live clock — used when the parent passes an explicit hour. */
  static?: boolean;
  style?: CSSProperties;
}

/**
 * Live planetary chip. Renders the current planetary-hour ruler with its
 * glyph in an elemental orb. Sits in the redesigned header (left of the
 * primary nav pill) and the mobile compact header.
 *
 * Pulls from AlchemicalContext when available; falls back to a clock-derived
 * ruler so the chip never renders blank.
 */
export function PlanetaryChip({
  planet,
  symbol,
  hour,
  static: isStatic = false,
  style,
}: PlanetaryChipProps): JSX.Element {
  const alch = useAlchemicalSafe();
  // `now` is null on the first render so SSR and the initial client render
  // produce identical markup — using `new Date()` in useState would diverge
  // (server local time vs. browser local time) and tear down the header
  // subtree via React error #418, dropping the inline <style> with it.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    if (isStatic) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isStatic]);

  const fallbackIdx = now ? ((now.getHours() - 6) + 14 * 7) % 7 : 0;
  const resolvedPlanet =
    planet ??
    (alch?.planetaryHour && PLANET_GLYPHS[alch.planetaryHour] ? alch.planetaryHour : null) ??
    FALLBACK_ROTATION[fallbackIdx] ??
    "Sun";
  const resolvedSymbol = symbol ?? PLANET_GLYPHS[resolvedPlanet] ?? "☉";
  const resolvedHour = hour ?? (now ? now.toTimeString().slice(0, 5) : "--:--");
  const elementVar = `var(--el-${PLANET_ELEMENT[resolvedPlanet] ?? "fire"})`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px 5px 6px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid var(--line)",
        borderRadius: 999,
        ...style,
      }}
      aria-label={`Current planetary hour: ${resolvedPlanet}`}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${elementVar}, color-mix(in oklch, ${elementVar}, black 50%))`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--f-mono)",
          fontSize: 10,
          color: "rgba(0,0,0,0.7)",
        }}
      >
        {resolvedSymbol}
      </span>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span
          className="t-mono"
          style={{ fontSize: 9, color: "var(--accent-2)", letterSpacing: "0.16em" }}
        >
          {resolvedPlanet.toUpperCase()} HOUR
        </span>
        <span
          className="t-mono"
          style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.12em" }}
        >
          {resolvedHour}
        </span>
      </div>
    </div>
  );
}

export default PlanetaryChip;
