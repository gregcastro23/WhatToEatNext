'use client';

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { RecipeBuilderProvider } from "@/contexts/RecipeBuilderContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ChakraProvider value={defaultSystem}>
          <ThemeProvider>
            <UserProvider>
              <AlchemicalProvider>
                <RecipeBuilderProvider>{children}</RecipeBuilderProvider>
              </AlchemicalProvider>
            </UserProvider>
          </ThemeProvider>
        </ChakraProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
