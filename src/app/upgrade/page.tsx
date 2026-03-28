"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePremium } from "@/contexts/PremiumContext";
import { FEATURE_LIST } from "@/types/subscription";

const ROUTE_FEATURE_MAP: Record<string, string> = {
  "/recipe-generator": "AI Cosmic Recipe Generator",
  "/planetary-chart": "Advanced Planetary Charts",
  "/cooking-methods": "Advanced Cooking Methods",
};

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { tier, openCheckout, isLoading } = usePremium();

  const fromRoute = searchParams.get("from") || "";
  const triggeredFeature = ROUTE_FEATURE_MAP[fromRoute] || null;

  if (tier === "premium") {
    return (
      <div style={{ padding: "2rem", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>You have Premium access!</h1>
        <p>You already have full access to all features.</p>
        <a
          href={fromRoute || "/profile"}
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            background: "#7c3aed",
            color: "white",
            borderRadius: "0.5rem",
            textDecoration: "none",
          }}
        >
          Continue
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      {triggeredFeature && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            background: "rgba(124, 58, 237, 0.1)",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            borderRadius: "0.75rem",
            textAlign: "center",
          }}
        >
          <strong>{triggeredFeature}</strong> is a Premium feature.
          Upgrade to unlock it and all other premium features.
        </div>
      )}

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "0.5rem",
        }}
      >
        Upgrade to Premium
      </h1>
      <p style={{ textAlign: "center", opacity: 0.7, marginBottom: "2rem" }}>
        Unlock the full power of Alchm.kitchen
      </p>

      {/* Feature comparison table */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: "0",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "0.75rem 1rem", fontWeight: 600, background: "rgba(255,255,255,0.05)" }}>
          Feature
        </div>
        <div style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "center", background: "rgba(255,255,255,0.05)" }}>
          Free
        </div>
        <div style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "center", background: "rgba(124,58,237,0.15)" }}>
          Premium — $5/mo
        </div>

        {/* Feature rows */}
        {FEATURE_LIST.map((feature) => (
          <React.Fragment key={feature.key}>
            <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {feature.label}
            </div>
            <div style={{ padding: "0.75rem 1rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {typeof feature.free === "boolean"
                ? feature.free ? "Yes" : "--"
                : feature.free}
            </div>
            <div
              style={{
                padding: "0.75rem 1rem",
                textAlign: "center",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(124,58,237,0.05)",
              }}
            >
              {typeof feature.premium === "boolean"
                ? feature.premium ? "Yes" : "--"
                : feature.premium}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        {session?.user ? (
          <button
            onClick={() => openCheckout("premium")}
            disabled={isLoading}
            style={{
              padding: "0.875rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              cursor: isLoading ? "wait" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Loading..." : "Upgrade Now"}
          </button>
        ) : (
          <a
            href="/login"
            style={{
              display: "inline-block",
              padding: "0.875rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "white",
              borderRadius: "0.75rem",
              textDecoration: "none",
            }}
          >
            Sign In to Upgrade
          </a>
        )}
      </div>

      {/* Back link */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="/" style={{ opacity: 0.6, textDecoration: "underline" }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}
