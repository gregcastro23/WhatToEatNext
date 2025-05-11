'use client';

import { useContext } from 'react';
import { PopupContext } from './context';
import type { PopupContextType } from './types';

/**
 * Hook to access the PopupContext
 * @returns The PopupContext or a fallback context if used outside PopupProvider
 */
export const usePopup = (): PopupContextType => {
  const context = useContext(PopupContext);
  
  if (!context) {
    console.warn('usePopup used outside of PopupProvider, returning a fallback');
    
    // Return a fallback context that does nothing
    return {
      showPopup: (message, options = {}) => {
        console.warn('Popup not available (outside provider):', message);
        return Date.now(); // Return a dummy ID
      },
      closePopup: (id) => {
        console.warn('Popup closing not available (outside provider) for ID:', id);
      }
    };
  }
  
  return context;
}; 