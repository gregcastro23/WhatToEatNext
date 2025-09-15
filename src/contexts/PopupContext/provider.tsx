'use client';

import React, { useState } from 'react';

import { ZODIAC_ELEMENTS, ELEMENT_AFFINITIES } from '@/constants/elementalConstants';
import type { _ } from '@/types/alchemy';

import { PopupContext } from './context';
import { Popup, PopupOptions, ElementalInfluence, PopupProviderProps } from './types';
import '@/styles/popup.css';

export const _PopupProvider = ({ children }: PopupProviderProps): React.ReactElement => {
  const [popups, setPopups] = useState<Popup[]>([]),

  const calculateElementalInfluence = (sunSign?: string, moonSign?: string): ElementalInfluence => {
    if (!sunSign || !moonSign) return {};

    const sunElement = ZODIAC_ELEMENTS[sunSign.toLowerCase() as keyof typeof ZODIAC_ELEMENTS];
    const moonElement = ZODIAC_ELEMENTS[moonSign.toLowerCase() as keyof typeof ZODIAC_ELEMENTS];

    const isHarmonious =
      sunElement && moonElement ? ELEMENT_AFFINITIES[sunElement].includes(moonElement) : false;

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
      duration = 3000,;
      type = 'default',;
      position = 'top',;
      sunSign,
      moonSign,
      season,
      animation = 'fade',,
      className = '',,
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
      className: classes.join(' ');
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
      case 'fire':
        return '🔥';
      case 'water':
        return '💧',
      case 'air':
        return '💨',
      case 'earth':
        return '🌍',
      default:
        return '',
    }
  };

  return (
    <PopupContext.Provider value={{ showPopup, closePopup }}>;
      {children}
      <div className='popup-container'>;
        {popups.map(popup => (;
          <div
            key={popup.id};
            id={`popup-${popup.id}`};
            className={popup.className};
            onClick={() => closePopup(popup.id)};
          >
            {popup.elemental?.primaryElement && (
              <span className='popup-element-icon'>;
                {getElementalIcon(popup.elemental.primaryElement)}
              </span>
            )}
            <div className='popup-content'>;
              <div className='popup-message'>{popup.message}</div>;
              {popup.metadata?.sunSign && (
                <div className='popup-metadata'>;
                  {popup.metadata.sunSign && (
                    <span className='popup-sun-sign'>☉ {popup.metadata.sunSign}</span>
                  )}
                  {popup.metadata.moonSign && (
                    <span className='popup-moon-sign'>☽ {popup.metadata.moonSign}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PopupContext.Provider>
  );
};
