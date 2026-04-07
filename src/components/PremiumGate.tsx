"use client";

import React, { type ReactNode } from "react";
import { usePremium } from "@/contexts/PremiumContext";

interface PremiumGateProps {
  /** The feature key from TIER_LIMITS to check access for */
  feature: string;
  /** Content shown to users with access */
  children: ReactNode;
  /** Optional custom fallback for users without access. Defaults to an upgrade prompt. */
  fallback?: ReactNode;
  /** If true, show a blurred preview of the content instead of hiding it */
  showPreview?: boolean;
}

/**
 * Wraps premium-only UI sections. Free users see a locked overlay
 * with an upgrade prompt; premium users see the children normally.
 */
export function PremiumGate({
  feature,
  children,
  fallback,
  showPreview = false,
}: PremiumGateProps) {
  const { hasFeature, isLoading, tier, openCheckout } = usePremium();

  // While loading, show children (optimistic) to avoid flash of locked content
  if (isLoading) return <>{children}</>;

  if (hasFeature(feature)) return <>{children}</>;

  // Custom fallback provided
  if (fallback) return <>{fallback}</>;

  // Default locked overlay
  return (
    <div style={{ position: "relative" }}>
      {showPreview && (
        <div
          style={{
            filter: "blur(4px)",
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.4,
          }}
          aria-hidden="true"
        >
          {children}
        </div>
      )}
      <div
        style={{
          position: showPreview ? "absolute" : "relative",
          inset: showPreview ? 0 : undefined,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          background: showPreview ? "rgba(0,0,0,0.6)" : "rgba(124,58,237,0.08)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(124,58,237,0.2)",
          minHeight: showPreview ? undefined : "120px",
        }}
      >
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          Premium Feature
        </div>
        <p style={{ opacity: 0.7, marginBottom: "1rem", maxWidth: 400 }}>
          This feature requires a Premium subscription. Upgrade to unlock
          unlimited recipe generations, dining companions, advanced charts,
          and more.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => { void openCheckout("premium"); }}
            style={{
              padding: "0.625rem 1.5rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Upgrade to Premium — $5/mo
          </button>
          <a
            href="/upgrade"
            style={{
              padding: "0.625rem 1.5rem",
              fontWeight: 500,
              background: "transparent",
              color: "inherit",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "0.5rem",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Compare Plans
          </a>
        </div>
        {tier === "free" && (
          <p style={{ fontSize: "0.8rem", opacity: 0.5, marginTop: "0.75rem" }}>
            Current plan: Free
          </p>
        )}
      </div>
    </div>
  );
}

export default PremiumGate;
