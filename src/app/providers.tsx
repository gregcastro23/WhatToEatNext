'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AlchemicalProvider>{children}</AlchemicalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}