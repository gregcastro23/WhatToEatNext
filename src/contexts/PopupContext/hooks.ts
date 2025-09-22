'use client';

import { useContext } from 'react';

import { PopupContext } from './context';
import type { PopupContextType } from './types';

/**
 * Hook to access the PopupContext
 * @returns The PopupContext
 * @throws Error if used outside of PopupProvider
 */
export const usePopup = (): PopupContextType => {
  const context = useContext(PopupContext)

  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider')
  }

  return context;
};
