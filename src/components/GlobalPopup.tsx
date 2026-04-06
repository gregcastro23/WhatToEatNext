import { _ZODIAC_ELEMENTS as ZODIAC_ELEMENTS, _ELEMENT_AFFINITIES as ELEMENT_AFFINITIES } from '@/constants/elementalConstants';

import { usePopup } from '@/contexts/PopupContext/hooks';
import type { ZodiacSign, Element } from '@/types/alchemy';
import React from 'react';

interface PopupOptions {
  type?: string;
  duration?: number;
  position?: string;
  className?: string;
  sunSign?: string;
  moonSign?: string;
  season?: string;
  animation?: string;
}

const GlobalPopup: React.FC = () => {
  const { showPopup } = usePopup();

  // Helper function to get element-based classes
  const getElementalClasses = (sunSign?: string, moonSign?: string): string => {
    if (!sunSign || !moonSign) return '';
    
    const sunElement = ZODIAC_ELEMENTS[sunSign.toLowerCase() as ZodiacSign];
    const moonElement = ZODIAC_ELEMENTS[moonSign.toLowerCase() as ZodiacSign];
    
    // Check for elemental harmony
    const isHarmonious = sunElement && moonElement ? 
      ELEMENT_AFFINITIES[sunElement as Element]?.includes(moonElement as Element) : 
      false;
    
    return `popup-${sunElement?.toLowerCase()} popup-${moonElement?.toLowerCase()} ${
      isHarmonious ? 'popup-harmonious' : ''
    }`;
  };

  // Enhanced show methods with elemental and zodiac influences
  const _showSuccess = (message: string, options: PopupOptions = {}): void => {
    showPopup(message, {
      ...options,
      type: 'success',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 3000
    });
  };

  const _showError = (message: string, options: PopupOptions = {}): void => {
    showPopup(message, {
      ...options,
      type: 'error',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 5000 // Longer duration for errors
    });
  };

  const _showWarning = (message: string, options: PopupOptions = {}): void => {
    showPopup(message, {
      ...options,
      type: 'warning',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 4000
    });
  };

  const _showInfo = (message: string, options: PopupOptions = {}): void => {
    showPopup(message, {
      ...options,
      type: 'info',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 3000
    });
  };

  // Show elemental popup
  const _showElemental = (message: string, options: PopupOptions = {}): void => {
    const elementalClass = getElementalClasses(options.sunSign, options.moonSign);
    showPopup(message, {
      ...options,
      type: 'elemental',
      className: `${options.className || ''} ${elementalClass}`,
      duration: options.duration || 3000
    });
  };

  return null;
};

// Define window interface extension for TypeScript
declare global {
  interface Window {
    showPopup?: (message: string, options?: PopupOptions) => void;
  }
}

// Create a custom hook for global popups with proper TypeScript types
export const useGlobalPopups = () => {
  const popup = usePopup();
  
  // Development mode global access
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.showPopup = popup.showPopup;
  }
  
  return {
    show: popup.showPopup,
    success: (message: string, options?: PopupOptions) => popup.showPopup(message, { ...options, type: 'success' }),
    error: (message: string, options?: PopupOptions) => popup.showPopup(message, { ...options, type: 'error' }),
    warning: (message: string, options?: PopupOptions) => popup.showPopup(message, { ...options, type: 'warning' }),
    info: (message: string, options?: PopupOptions) => popup.showPopup(message, { ...options, type: 'info' }),
    elemental: (message: string, options?: PopupOptions) => popup.showPopup(message, { ...options, type: 'elemental' })
  };
};

export default GlobalPopup; 