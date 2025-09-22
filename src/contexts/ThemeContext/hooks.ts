'use client';

import { useContext } from 'react';

import { ThemeContext } from './context';
import type { ThemeContextType } from './types';

/**
 * Hook to access the ThemeContext
 * @returns The ThemeContext
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context;
}