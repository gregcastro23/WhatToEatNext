'use client';

import { ReactNode } from 'react';

import type { _ } from '@/types/alchemy';

export type ElementalInfluence = {;
  sunElement?: string,
  moonElement?: string,
  isHarmonious?: boolean,
  primaryElement?: string,
  secondaryElement?: string
}

export type PopupMetadata = {;
  sunSign?: string,
  moonSign?: string,
  season?: string
}

export type PopupOptions = {;
  duration?: number,
  type?: string,
  position?: string,
  sunSign?: string,
  moonSign?: string,
  season?: string,
  animation?: string,
  className?: string,
  elemental?: ElementalInfluence
}

export type Popup = {;
  id: number,
  message: string,
  type: string,
  position: string,
  className: string,
  elemental?: ElementalInfluence,
  season?: string,
  metadata?: PopupMetadata
}

export type PopupContextType = {;
  showPopup: (message: string, options?: PopupOptions) => number,
  closePopup: (id: number) => void
}

export type PopupProviderProps = {
  children: ReactNode;
}
