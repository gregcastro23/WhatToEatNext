// src / (components || 1) / (GlobalPopup.js || 1)

import React from 'react';
import ../contexts  from 'PopupContext ';
import ../constants  from 'elementalConstants ';

const GlobalPopup = () => {
  // Add null check when getting popup context
  let popup = usePopup();
  
  // Early return if popup context is not available
  if (!popup || !popup.showPopup) {
    console.warn('Popup context not available');
    return null;
  }
  
  const { showPopup } = popup;

  // Helper function to get element-based classes
  const getElementalClasses = (sunSign, moonSign) => {
    if (!sunSign || !moonSign) return '';
    
    const sunElement = ZODIAC_ELEMENTS[sunSign?.toLowerCase()];
    const moonElement = ZODIAC_ELEMENTS[moonSign?.toLowerCase()];
    
    // Add null checks
    if (!sunElement || !moonElement) return '';
    
    // Check for elemental harmony
    const isHarmonious = ELEMENT_AFFINITIES[sunElement]?.includes(moonElement);
    
    return `popup-${sunElement.toLowerCase()} popup-${moonElement.toLowerCase()} ${
      isHarmonious ? 'popup-harmonious' : ''
    }`;
  };

  // Enhanced show methods with elemental and zodiac influences
  const showSuccess = (message, options = {}) => {
    showPopup(message, {
      ...options,
      type: 'success',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 3000
    });
  };

  const showError = (message, options = {}) => {
    showPopup(message, {
      ...options,
      type: 'error',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 5000 // Longer duration for errors
    });
  };

  const showWarning = (message, options = {}) => {
    showPopup(message, {
      ...options,
      type: 'warning',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 4000
    });
  };

  const showInfo = (message, options = {}) => {
    showPopup(message, {
      ...options,
      type: 'info',
      className: `${options.className || ''} ${getElementalClasses(options.sunSign, options.moonSign)}`,
      duration: options.duration || 3000
    });
  };

  // Show elemental popup
  const showElemental = (message, options = {}) => {
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

// Create a custom hook for global popups instead of a regular function
export const useGlobalPopups = () => {
  const popup = usePopup();
  
  // Safely assign to window object in development mode
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Check if popup is defined before accessing it
    if (popup && popup.showPopup) {
      window.showPopup = popup.showPopup;
    } else {
      // Provide a fallback function to prevent errors
      window.showPopup = (message, options) => {
        console.warn('Popup system not initialized yet, message:', message);
      };
    }
  }
  
  // Make sure popup exists before accessing its properties
  if (!popup) {
    // Return a fallback object with noop functions to prevent errors
    return {
      show: (message) => console.warn('Popup not available:', message),
      success: (message) => console.warn('Popup not available:', message),
      error: (message) => console.warn('Popup not available:', message),
      warning: (message) => console.warn('Popup not available:', message),
      info: (message) => console.warn('Popup not available:', message),
      elemental: (message) => console.warn('Popup not available:', message)
    };
  }
  
  return {
    show: popup.showPopup,
    success: (message, options) => popup.showPopup(message, { ...options, type: 'success' }),
    error: (message, options) => popup.showPopup(message, { ...options, type: 'error' }),
    warning: (message, options) => popup.showPopup(message, { ...options, type: 'warning' }),
    info: (message, options) => popup.showPopup(message, { ...options, type: 'info' }),
    elemental: (message, options) => popup.showPopup(message, { ...options, type: 'elemental' })
  };
};

export default GlobalPopup;