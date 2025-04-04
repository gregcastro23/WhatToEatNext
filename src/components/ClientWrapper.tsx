'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import { ChartProvider } from '@/contexts/ChartContext/provider';
import AstrologyWarning from '@/components/AstrologyWarning';
import CalculationErrors from '@/components/CalculationErrors';
import Clock from '@/components/Clock';
import ClientProviders from '@/components/providers/ClientProviders';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { ErrorFallback } from '@/components/errors/ErrorFallback';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <AlchemicalProvider>
          <CalculationErrors />
          <AstrologyWarning />
          <ChartProvider>
            <ClientProviders>
              <header className="bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Alchm Kitchen
                  </h1>
                  <p className="mt-2 text-gray-600">
                    The Menu of the Moment in the Stars and Elements
                  </p>
                </div>
              </header>
              <main>{children}</main>
            </ClientProviders>
          </ChartProvider>
        </AlchemicalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
} 