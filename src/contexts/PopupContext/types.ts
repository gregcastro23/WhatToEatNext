"use client";

import type { _ } from "@/types/alchemy";
import type { ReactNode } from "react";

export interface ElementalInfluence {
  sunElement?: string;
  moonElement?: string;
  isHarmonious?: boolean;
  primaryElement?: string;
  secondaryElement?: string;
}

export interface PopupMetadata {
  sunSign?: string;
  moonSign?: string;
  season?: string;
}

export interface PopupOptions {
  duration?: number;
  type?: string;
  position?: string;
  sunSign?: string;
  moonSign?: string;
  season?: string;
  animation?: string;
  className?: string;
  elemental?: ElementalInfluence;
}

export interface Popup {
  id: number;
  message: string;
  type: string;
  position: string;
  className: string;
  elemental?: ElementalInfluence;
  season?: string;
  metadata?: PopupMetadata;
}

export interface PopupContextType {
  showPopup: (message: string, options?: PopupOptions) => number;
  closePopup: (id: number) => void;
}

export interface PopupProviderProps {
  children: ReactNode;
}
