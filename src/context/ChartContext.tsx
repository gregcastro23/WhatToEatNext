'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AstrologicalState } from '@/types/alchemy';

interface ChartContextType {
  currentChart: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  updateChart: (data: Record<string, unknown>) => void;
}

const defaultContextValue: ChartContextType = {
  currentChart: null,
  isLoading: false,
  error: null,
  updateChart: () => {},
};

const ChartContext = createContext<ChartContextType>(defaultContextValue);

export function ChartProvider({ children }: { children: ReactNode }) {
  const [currentChart, setCurrentChart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateChart = (data: Record<string, unknown>) => {
    try {
      setCurrentChart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error updating chart');
    }
  };

  // Load initial chart data
  useEffect(() => {
    const loadInitialChart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Here you would load chart data from an API or calculate it
        // For now, setting a placeholder empty chart
        setCurrentChart({
          // Placeholder chart data
          planets: {},
          houses: {},
          aspects: [],
          timestamp: new Date(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error loading chart');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialChart();
  }, []);

  return (
    <ChartContext.Provider value={{ currentChart, isLoading, error, updateChart }}>
      {children}
    </ChartContext.Provider>
  );
}

export function useCurrentChart() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useCurrentChart must be used within a ChartProvider');
  }
  return context;
}

export default ChartContext; 