'use client';

import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AlchemicalProvider } from '../contexts/AlchemicalContext/provider';
import { ChartProvider } from '../contexts/ChartContext/provider';
import { UserProvider } from '../contexts/UserContext';
import AstrologyWarning from './AstrologyWarning';
import CalculationErrors from './CalculationErrors';
import ClientProviders from './providers/ClientProviders';
import { ErrorBoundary } from './errors/ErrorBoundary';
import { ErrorFallback } from './errors/ErrorFallback';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <AlchemicalProvider>
          <CalculationErrors />
          <AstrologyWarning />
          <ChartProvider>
            <UserProvider>
              <ClientProviders>
                {children}
              </ClientProviders>
            </UserProvider>
          </ChartProvider>
        </AlchemicalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
} 