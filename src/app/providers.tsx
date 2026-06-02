'use client';

import { SessionProvider } from "next-auth/react";
import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
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

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clt1234567890123456789012";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ["email", "wallet", "google"],
          appearance: {
            theme: "dark",
            accentColor: "#805ad5", // Alchm purple accent
            logo: "/alchm-icon-192.png",
          },
        }}
      >
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
      </PrivyProvider>
    </ErrorBoundary>
  );
}
