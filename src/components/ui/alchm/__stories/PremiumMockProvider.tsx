import PremiumContext from "@/contexts/PremiumContext";
import type { ReactNode } from "react";

export interface PremiumMockProviderProps {
  children: ReactNode;
  premium?: boolean;
}

/** Lightweight Storybook-only provider to drive the PremiumGlow gate. */
export function PremiumMockProvider({ children, premium = false }: PremiumMockProviderProps) {
  const value = {
    subscription: null,
    tier: premium ? ("premium" as const) : ("free" as const),
    isLoading: false,
    hasFeature: () => premium,
    openCheckout: async () => undefined,
    openPortal: async () => undefined,
    refresh: async () => undefined,
    isPremium: premium,
  };
  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}
