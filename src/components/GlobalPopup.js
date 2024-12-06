// src/components/GlobalPopup.js

import React from 'react';
import { usePopup } from '../contexts/PopupContext';
import { ZODIAC_ELEMENTS, ELEMENT_AFFINITIES } from '../constants/elementalConstants';

const GlobalPopup = () => {
  const { showPopup } = usePopup();

  // Helper function to get element-based classes
  const getElementalClasses = (sunSign, moonSign) => {
    if (!sunSign || !moonSign) return '';
    
    const sunElement = ZODIAC_ELEMENTS[sunSign.toLowerCase()];
    const moonElement = ZODIAC_ELEMENTS[moonSign.toLowerCase()];
    
    // Check for elemental harmony
    const isHarmonious = ELEMENT_AFFINITIES[sunElement]?.includes(moonElement);
    
    return `popup-${sunElement?.toLowerCase()} popup-${moonElement?.toLowerCase()} ${
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

// Global popup utility
export const initializeGlobalPopups = () => {
  const popup = usePopup();
  
  // Development mode global access
  if (process.env.NODE_ENV === 'development') {
    window.showPopup = popup.showPopup;
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