"use client";

import Link from "next/link";
import { useContext, type CSSProperties, type JSX, type ReactNode } from "react";
import PremiumContext from "@/contexts/PremiumContext";
import { premiumBtnStyle } from "./buttonStyles";
import { Glyph } from "./Glyph";
import { PremiumMark } from "./PremiumMark";

export interface PremiumGlowProps {
  children: ReactNode;
  label?: string;
  /** Fraction of content visible above the gradient gate (0–1). Default 0.40. */
  revealAmount?: number;
  height?: number | string;
  headline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  /** Force-display behavior, bypassing PremiumContext lookup. */
  force?: "locked" | "unlocked";
}

/**
 * Information-gap reveal with the violet-glow signature. Authenticated
 * premium users (PremiumContext.isPremium === true) render the children
 * unblurred without the overlay.
 */
export function PremiumGlow({
  children,
  label = "PREMIUM",
  revealAmount = 0.4,
  height,
  headline = "Unlock the full alchemical readout.",
  description = "Full sensory map, every recipe lineage, agent-tuned substitutions, and Spirit×Essence×Matter forecasting.",
  ctaLabel = "Go Premium",
  ctaHref = "/premium",
  onCtaClick,
  force,
}: PremiumGlowProps): JSX.Element {
  const ctx = useContext(PremiumContext);
  const unlocked = force === "unlocked" || (force !== "locked" && ctx.isPremium);

  if (unlocked) {
    return <>{children}</>;
  }

  const containerStyle: CSSProperties = {
    position: "relative",
    height,
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid color-mix(in oklch, var(--accent), transparent 60%)",
  };

  const blurStyle: CSSProperties = {
    filter: `blur(${(1 - revealAmount) * 6}px)`,
    opacity: revealAmount + 0.35,
    pointerEvents: "none",
  };

  const gradStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(180deg, transparent ${revealAmount * 100}%, color-mix(in oklch, var(--accent), transparent 78%) ${
      revealAmount * 100 + 5
    }%, color-mix(in oklch, var(--accent), transparent 70%) 70%, color-mix(in oklch, var(--bg), transparent 0%))`,
    pointerEvents: "none",
  };

  const ctaButton = (
    <button type="button" onClick={onCtaClick} style={premiumBtnStyle}>
      {ctaLabel} <Glyph name="arrow" size={14} />
    </button>
  );

  return (
    <div style={containerStyle}>
      <div style={blurStyle}>{children}</div>
      <div style={gradStyle} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "22px 22px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 14,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              background: "color-mix(in oklch, var(--accent), transparent 80%)",
              border: "1px solid color-mix(in oklch, var(--accent), transparent 50%)",
              borderRadius: 999,
              marginBottom: 10,
            }}
          >
            <PremiumMark size={12} />
            <span
              className="t-mono"
              style={{
                fontSize: 9,
                color: "var(--accent)",
                letterSpacing: "0.18em",
                fontWeight: 600,
              }}
            >
              {label}
            </span>
          </div>
          <div
            className="t-display"
            style={{ fontSize: 22, color: "var(--fg)", lineHeight: 1.1, maxWidth: 360 }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--fg-dim)",
              marginTop: 6,
              lineHeight: 1.55,
              maxWidth: 360,
            }}
          >
            {description}
          </div>
        </div>
        {onCtaClick ? (
          ctaButton
        ) : (
          <Link href={ctaHref} style={{ ...premiumBtnStyle, textDecoration: "none" }}>
            {ctaLabel} <Glyph name="arrow" size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default PremiumGlow;
