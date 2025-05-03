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
                  <div className="flex flex-row justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        Alchm Kitchen
                      </h1>
                      <p className="mt-2 text-gray-600">
                        The Menu of the Moment in the Stars and Elements
                      </p>
                    </div>
                    
                    {/* PayPal Button */}
                    <div>
                      <form action="https://www.paypal.com/ncp/payment/SVN6Q368TKKLS" method="post" target="_blank">
                        <input 
                          type="submit" 
                          value="HELP" 
                          style={{
                            textAlign: 'center',
                            border: 'none',
                            borderRadius: '0.25rem',
                            minWidth: '11.625rem',
                            padding: '0 2rem',
                            height: '2.625rem',
                            fontWeight: 'bold',
                            backgroundColor: '#FFD140',
                            color: '#000000',
                            fontFamily: '"Helvetica Neue", Arial, sans-serif',
                            fontSize: '1rem',
                            lineHeight: '1.25rem',
                            cursor: 'pointer'
                          }}
                        />
                      </form>
                    </div>
                  </div>
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