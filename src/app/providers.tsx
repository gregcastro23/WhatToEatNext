'use client';

import { SessionProvider } from "next-auth/react";
import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ThemeProvider>
          <UserProvider>
            <PremiumProvider>
              <AlchemicalProvider>
                <RecipeBuilderProvider>{children}</RecipeBuilderProvider>
              </AlchemicalProvider>
            </PremiumProvider>
          </UserProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
