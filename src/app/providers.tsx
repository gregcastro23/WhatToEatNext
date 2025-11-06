"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider>
          <AlchemicalProvider>{children}</AlchemicalProvider>
        </ThemeProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}
