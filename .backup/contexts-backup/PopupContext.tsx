// src/contexts/PopupContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ZODIAC_ELEMENTS, ELEMENT_AFFINITIES } from '../constants/elementalConstants';
import '../styles/popup.css';
import type { Element } from '@/types/alchemy';

type ElementalInfluence = {
  sunElement?: string;
  moonElement?: string;
  isHarmonious?: boolean;
  primaryElement?: string;
  secondaryElement?: string;
};

type PopupMetadata = {
  sunSign?: string;
  moonSign?: string;
  season?: string;
};

type PopupOptions = {
  duration?: number;
  type?: string;
  position?: string;
  sunSign?: string;
  moonSign?: string;
  season?: string;
  animation?: string;
  className?: string;
  elemental?: ElementalInfluence;
};

type Popup = {
  id: number;
  message: string;
  type: string;
  position: string;
  className: string;
  elemental?: ElementalInfluence;
  season?: string;
  metadata?: PopupMetadata;
};

type PopupContextType = {
  showPopup: (message: string, options?: PopupOptions) => number;
  closePopup: (id: number) => void;
};

const PopupContext = createContext<PopupContextType | null>(null);

export const usePopup = (): PopupContextType => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

type PopupProviderProps = {
  children: ReactNode;
};

export const PopupProvider = ({ children }: PopupProviderProps): React.ReactElement => {
  const [popups, setPopups] = useState<Popup[]>([]);

  const calculateElementalInfluence = (sunSign?: string, moonSign?: string): ElementalInfluence => {
    if (!sunSign || !moonSign) return {};

    const sunElement = ZODIAC_ELEMENTS[sunSign.toLowerCase() as keyof typeof ZODIAC_ELEMENTS];
    const moonElement = ZODIAC_ELEMENTS[moonSign.toLowerCase() as keyof typeof ZODIAC_ELEMENTS];

    const isHarmonious = sunElement && moonElement ? 
      ELEMENT_AFFINITIES[sunElement as Element]?.includes(moonElement as Element) : 
      false;
    
    return {
      sunElement,
      moonElement,
      isHarmonious,
      primaryElement: sunElement,
      secondaryElement: moonElement
    };
  };

  const showPopup = (message: string, options: PopupOptions = {}): number => {
    const {
      duration = 3000,
      type = 'default',
      position = 'top',
      sunSign,
      moonSign,
      season,
      animation = 'fade',
      className = ''
    } = options;

    const id = Date.now();
    
    // Calculate elemental influences
    const elemental = calculateElementalInfluence(sunSign, moonSign);

    // Build class list
    const classes = [
      'popup',
      `popup-${type}`,
      `popup-${position}`,
      `popup-${animation}`,
      className
    ];

    // Add elemental classes if applicable
    if (elemental.sunElement) {
      classes.push(`popup-${elemental.sunElement.toLowerCase()}`);
    }
    if (elemental.moonElement) {
      classes.push(`popup-${elemental.moonElement.toLowerCase()}`);
    }
    if (elemental.isHarmonious) {
      classes.push('popup-harmonious');
    }
    if (season) {
      classes.push(`popup-${season.toLowerCase()}`);
    }

    const newPopup: Popup = {
      id,
      message,
      type,
      position,
      className: classes.join(' '),
      elemental,
      season,
      metadata: {
        sunSign,
        moonSign,
        season
      }
    };

    setPopups(current => [...current, newPopup]);

    // Handle animation timing
    const animationDuration = 300; // ms
    setTimeout(() => {
      const popupElement = document.getElementById(`popup-${id}`);
      if (popupElement) {
        popupElement.classList.add('popup-exit');
      }
    }, duration - animationDuration);

    // Remove popup after animation
    setTimeout(() => {
      setPopups(current => current.filter(popup => popup.id !== id));
    }, duration);

    return id;
  };

  const closePopup = (id: number): void => {
    const popupElement = document.getElementById(`popup-${id}`);
    if (popupElement) {
      popupElement.classList.add('popup-exit');
      setTimeout(() => {
        setPopups(current => current.filter(popup => popup.id !== id));
      }, 300);
    }
  };

  const getElementalIcon = (element?: string): string => {
    if (!element) return '';
    
    switch (element.toLowerCase()) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'air': return '💨';
      case 'earth': return '🌍';
      default: return '';
    }
  };

  return (
    <PopupContext.Provider value={{ showPopup, closePopup }}>
      {children}
      <div className="popup-container">
        {popups.map(popup => (
          <div
            key={popup.id}
            id={`popup-${popup.id}`}
            className={popup.className}
            onClick={() => closePopup(popup.id)}
          >
            {popup.elemental?.primaryElement && (
              <span className="popup-element-icon">
                {getElementalIcon(popup.elemental.primaryElement)}
              </span>
            )}
            <div className="popup-content">
              <div className="popup-message">{popup.message}</div>
              {popup.metadata?.sunSign && (
                <div className="popup-metadata">
                  <span className="popup-sign">
                    ☉ {popup.metadata.sunSign}
                  </span>
                  <span className="popup-sign">
                    ☽ {popup.metadata.moonSign}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PopupContext.Provider>
  );
};

export default PopupProvider; 