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
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
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
                        <MasterQuestBroadcastListener />
                        {children}
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
