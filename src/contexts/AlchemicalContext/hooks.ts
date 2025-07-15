'use client';

import { useContext } from 'react';
import { AlchemicalContext } from './context';
import type { AlchemicalContextType } from './types';

/**
 * Hook to access the AlchemicalContext
 * @returns The AlchemicalContext
 * @throws Error if used outside of AlchemicalProvider
 */
export const useAlchemical = (): AlchemicalContextType => {
  const context = useContext(AlchemicalContext);
  
  if (!context) {
    throw new Error('useAlchemical must be used within an AlchemicalProvider');
  }
  
  return context;
}; 