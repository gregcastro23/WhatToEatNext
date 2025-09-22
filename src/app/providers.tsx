'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AlchemicalProvider>{children}</AlchemicalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}