'use client';

import { useContext } from 'react';
import { TarotContext } from './context';
import type { TarotContextType } from './types';

/**
 * Hook to access the TarotContext
 * @returns The TarotContext
 * @throws Error if used outside of TarotProvider
 */
export const useTarotContext = (): TarotContextType => {
  const context = useContext(TarotContext);
  
  if (!context) {
    throw new Error('useTarotContext must be used within a TarotProvider');
  }
  
  return context;
}; 