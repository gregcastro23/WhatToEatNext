'use client';

import { useContext } from 'react';
import { ChartContext } from './context';
import type { ChartContextType } from './types';

/**
 * Hook to access the ChartContext
 * @returns The ChartContext
 * @throws Error if used outside of ChartProvider
 */
export const useChart = (): ChartContextType => {
  const context = useContext(ChartContext);
  
  if (!context) {
    throw new Error('useChart must be used within a ChartProvider');
  }
  
  return context;
}; 