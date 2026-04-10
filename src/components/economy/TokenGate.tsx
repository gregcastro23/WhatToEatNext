"use client";

import React, { useState, useCallback, useEffect, type ReactNode } from "react";
import { usePremium } from "@/contexts/PremiumContext";

interface TokenGateProps {
  /** The shop item slug to check/purchase */
  shopItemSlug: string;
  /** Content shown when user has access */
  children: ReactNode;
  /** Human-readable feature name for the unlock prompt */
  featureName?: string;
  /** If true, show blurred preview of content when locked */
  showPreview?: boolean;
  /** Token costs displayed to the user */
  cost?: {
    spirit?: number;
    essence?: number;
    matter?: number;
    substance?: number;
  };
  /** Called after successful purchase */
  onUnlocked?: () => void;
}

/**
 * TokenGate — Wraps premium features with token-based access.
 *
 * Access is granted if:
 * 1. User is a Premium subscriber (instant pass-through)
 * 2. User has purchased the item with tokens
 *
 * Otherwise, shows an unlock prompt with token costs.
 */
export function TokenGate({
  shopItemSlug,
  children,
  featureName,
  showPreview = false,
  cost,
  onUnlocked,
}: TokenGateProps) {
  const { isPremium, isLoading } = usePremium();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isOneTimeItem, setIsOneTimeItem] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkAccess = async () => {
      // Premium users always pass; no need to check purchase history.
      if (isPremium) {
        if (mounted) setCheckingAccess(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/economy/purchase?shopItemSlug=${encodeURIComponent(shopItemSlug)}`,
          { credentials: "include" },
        );
        if (!res.ok) {
          if (mounted) setCheckingAccess(false);
          return;
        }
        const data = await res.json();
        if (!mounted || !data?.success) {
          if (mounted) setCheckingAccess(false);
          return;
        }
        setIsOneTimeItem(Boolean(data.item?.isOneTime));
        setIsUnlocked(Boolean(data.hasAccess));
      } catch {
        // Best-effort check; fallback to locked state.
      } finally {
        if (mounted) setCheckingAccess(false);
      }
    };
    void checkAccess();
    return () => {
      mounted = false;
    };
  }, [shopItemSlug, isPremium]);

  const handlePurchase = useCallback(async () => {
    setIsPurchasing(true);
    setError(null);
    try {
      const res = await fetch("/api/economy/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ shopItemSlug }),
      });
      const data = await res.json();
      if (data.success) {
        if (isOneTimeItem) {
          setIsUnlocked(true);
        }
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(20);
        }
        onUnlocked?.();
      } else {
        setError(data.message || "Purchase failed");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setIsPurchasing(false);
    }
  }, [shopItemSlug, onUnlocked, isOneTimeItem]);

  // Loading or already has access
  if (isLoading || checkingAccess) return null;
  if (isPremium || isUnlocked) return <>{children}</>;

  const hasCost = cost && (cost.spirit || cost.essence || cost.matter || cost.substance);
  const displayName = featureName || "this feature";

  // Token costs display
  const tokenIcons: Record<string, { symbol: string; color: string }> = {
    spirit: { symbol: "☉", color: "#f59e0b" },
    essence: { symbol: "☽", color: "#8b5cf6" },
    matter: { symbol: "⊕", color: "#10b981" },
    substance: { symbol: "☿", color: "#3b82f6" },
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {showPreview && (
        <div
          style={{
            filter: "blur(6px)",
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.35,
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
          padding: "clamp(1rem, 3vw, 2rem)",
          textAlign: "center",
          background: showPreview
            ? "rgba(0, 0, 0, 0.75)"
            : "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(245, 158, 11, 0.08))",
          borderRadius: "1.5rem",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          minHeight: showPreview ? undefined : "160px",
          backdropFilter: showPreview ? "blur(8px)" : undefined,
          width: "100%",
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            fontSize: "2.5rem",
            marginBottom: "0.75rem",
            filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))",
          }}
        >
          🔮
        </div>

        <div
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: showPreview ? "#e5e7eb" : "inherit",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Unlock {displayName}
        </div>

        <p
          style={{
            opacity: 0.6,
            marginBottom: "1rem",
            maxWidth: 400,
            fontSize: "0.85rem",
            lineHeight: 1.5,
            color: showPreview ? "#d1d5db" : "inherit",
          }}
        >
          Spend your alchemical tokens to access {displayName}, or upgrade to
          Premium for unlimited access.
        </p>

        {/* Token cost breakdown */}
        {hasCost && (
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            {Object.entries(cost).map(([type, amount]) => {
              if (!amount) return null;
              const icon = tokenIcons[type];
              return (
                <div
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "9999px",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${icon?.color || "#666"}33`,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: icon?.color }}>{icon?.symbol}</span>
                  <span style={{ color: showPreview ? "#e5e7eb" : "inherit" }}>
                    {amount}
                  </span>
                  <span
                    style={{
                      textTransform: "capitalize",
                      fontSize: "0.7rem",
                      opacity: 0.6,
                      color: showPreview ? "#d1d5db" : "inherit",
                    }}
                  >
                    {type}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              color: "#ef4444",
              fontSize: "0.8rem",
              marginBottom: "0.75rem",
              padding: "0.5rem 1rem",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "0.5rem",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => {
              void handlePurchase();
            }}
            disabled={isPurchasing}
            style={{
              padding: "0.625rem 1rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              background: isPurchasing
                ? "rgba(139, 92, 246, 0.5)"
                : "linear-gradient(135deg, #7c3aed, #f59e0b)",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              cursor: isPurchasing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
              minWidth: "180px",
            }}
          >
            {isPurchasing ? "Unlocking..." : "🔮 Unlock with Tokens"}
          </button>
          <a
            href="/upgrade"
            style={{
              padding: "0.625rem 1.5rem",
              fontWeight: 500,
              fontSize: "0.85rem",
              background: "transparent",
              color: showPreview ? "#d1d5db" : "inherit",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "0.75rem",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              minWidth: "180px",
            }}
          >
            ✨ Go Premium — $5/mo
          </a>
        </div>
      </div>
    </div>
  );
}

export default TokenGate;
