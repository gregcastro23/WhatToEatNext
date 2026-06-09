'use client';

import { SessionProvider } from "next-auth/react";
import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MasterQuestBroadcastListener } from "@/components/MasterQuestBroadcastListener";
import { ToastProvider } from "@/components/ToastProvider";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { AlchemicalDataProvider } from "@/contexts/AlchemicalDataContext";
import { GroceryCartProvider } from "@/contexts/GroceryCartContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";
import { SpacetimeProvider } from "@/contexts/SpacetimeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: PrivyProvider is intentionally NOT mounted here. It is scoped to the
  // /account page (src/app/(alchm)/account/page.tsx) so the heavy web3 SDK stays
  // out of every other route's bundle. Mirrors PA's components/account/PrivyConnect.tsx.
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ToastProvider>
          <ThemeProvider>
            <UserProvider>
              <PremiumProvider>
                <AlchemicalDataProvider>
                  <AlchemicalProvider>
                    <RecipeBuilderProvider>
                      <GroceryCartProvider>
                        <SpacetimeProvider>
                          <MasterQuestBroadcastListener />
                          {children}
                        </SpacetimeProvider>
                      </GroceryCartProvider>
                    </RecipeBuilderProvider>
                  </AlchemicalProvider>
                </AlchemicalDataProvider>
              </PremiumProvider>
            </UserProvider>
          </ThemeProvider>
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
