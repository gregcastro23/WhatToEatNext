"use client";

import React, { type ReactNode } from "react";
import { usePremium } from "@/contexts/PremiumContext";
import { CosmicVeilOverlay } from "./CosmicVeilOverlay";

interface TemporalFrictionGateProps {
  children: ReactNode;
  dailyLimitReached: boolean;
}

/**
 * TemporalFrictionGate
 * Wraps any layout that requires premium subscription gating or daily limits.
 * Free users see a beautifully styled glassmorphic veil blurred preview with CTAs.
 * Premium users see the fully rendered children.
 *
 * @file src/components/premium/TemporalFrictionGate.tsx
 */
export function TemporalFrictionGate({
  children,
  dailyLimitReached,
}: TemporalFrictionGateProps) {
  const { isPremium, isLoading } = usePremium();

  // Show children optimistically during auth/premium hydration to avoid visual shifts
  if (isLoading) {
    return <>{children}</>;
  }

  // Unlocked path
  if (isPremium || !dailyLimitReached) {
    return (
      <div className="transition-all duration-700 ease-out opacity-100 blur-none select-auto pointer-events-auto">
        {children}
      </div>
    );
  }

  // Locked path: traps children behind a gorgeous glassmorphic veil
  return (
    <div className="relative group overflow-hidden rounded-3xl w-full">
      {/* The Blurred Background Content */}
      <div 
        className="opacity-25 blur-md pointer-events-none select-none transition-all duration-700 ease-out scale-[0.99] select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* The Alchemical-Substance Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-black/10 backdrop-blur-[1px] transition-all duration-500 ease-out">
        <CosmicVeilOverlay />
      </div>
    </div>
  );
}
export default TemporalFrictionGate;
