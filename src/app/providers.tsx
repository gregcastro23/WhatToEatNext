"use client";

import React from "react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider>
          <UserProvider>
            <AlchemicalProvider>{children}</AlchemicalProvider>
          </UserProvider>
        </ThemeProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}
