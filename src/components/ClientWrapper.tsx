'use client';

import React from 'react';
import AstrologyWarning from '@/components/AstrologyWarning';
import CalculationErrors from '@/components/CalculationErrors';
import _Clock from '@/components/Clock';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import ClientProviders from '@/app/ClientProviders';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import { ChartProvider } from '@/contexts/ChartContext/provider';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
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