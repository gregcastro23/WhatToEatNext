'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

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