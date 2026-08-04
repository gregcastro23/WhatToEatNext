"use client";

import { useSession } from "next-auth/react";
import React, { type ReactNode } from "react";

interface PremiumGateProps {
  /** The feature key from FEATURE_TOKEN_COSTS to check access for */
  feature: string;
  /** Content shown to users */
  children: ReactNode;
  /** Optional custom fallback for users without access. */
  fallback?: ReactNode;
  /** If true, show a preview of the content */
  showPreview?: boolean;
}

/**
 * ESMS Action & Feature Gate.
 *
 * In the ESMS Token Economy:
 * - Passersby (non-signed-in users) can view all main page components, tools, and UI previews.
 * - Registered users spend claimed ESMS tokens (Spirit, Essence, Matter, Substance) on feature execution.
 */
export function PremiumGate({
  feature: _feature,
  children,
  fallback: _fallback,
  showPreview: _showPreview = false,
}: PremiumGateProps) {
  const { data: session, status } = useSession();

  // Optimistic rendering while loading
  if (status === "loading") return <>{children}</>;

  // Signed-in users see features cleanly (ESMS is debited on feature execution)
  if (session?.user) return <>{children}</>;

  // Passersby (unauthenticated) can browse and view all main page components cleanly!
  return <>{children}</>;
}

export default PremiumGate;
