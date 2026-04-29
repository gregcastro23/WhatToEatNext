'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  /** User-selected preference: explicit light, explicit dark, or "system" (= follow time of day) */
  preference: ThemePreference;
  /** The actual resolved theme being applied to the DOM */
  theme: ResolvedTheme;
  /** True during local daytime (06:00–18:00). Drives diurnal/nocturnal alchemy quantity bias. */
  isDiurnal: boolean;
  /** Set the user's explicit preference. 'system' falls back to day/night auto-switching. */
  setPreference: (pref: ThemePreference) => void;
  /** Quick toggle: cycles light → dark → system → light. */
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'alchm-theme-preference';

function computeDiurnal(date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}

function resolveTheme(preference: ThemePreference, isDiurnal: boolean): ResolvedTheme {
  if (preference === 'system') return isDiurnal ? 'light' : 'dark';
  return preference;
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // SSR-safe defaults: assume dark + nighttime; client effect corrects on mount
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isDiurnal, setIsDiurnal] = useState<boolean>(false);
  const [theme, setTheme] = useState<ResolvedTheme>('dark');

  // Hydrate preference from localStorage + initial diurnal calc
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
      const initialPref: ThemePreference =
        stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
      const diurnal = computeDiurnal();
      setPreferenceState(initialPref);
      setIsDiurnal(diurnal);
      setTheme(resolveTheme(initialPref, diurnal));
    } catch {
      // localStorage may be unavailable (SSR fallback / private mode)
    }
  }, []);

  // Re-check time of day every 5 minutes so 'system' theme flips at sunrise/sunset
  useEffect(() => {
    const interval = setInterval(() => {
      const next = computeDiurnal();
      setIsDiurnal((prev) => (prev === next ? prev : next));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Recompute resolved theme whenever preference or isDiurnal changes
  useEffect(() => {
    setTheme(resolveTheme(preference, isDiurnal));
  }, [preference, isDiurnal]);

  // Apply resolved theme to DOM
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* ignore */
    }
  }, []);

  const cycleTheme = useCallback(() => {
    setPreferenceState((prev) => {
      const next: ThemePreference = prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, theme, isDiurnal, setPreference, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
