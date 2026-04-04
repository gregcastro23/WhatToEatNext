'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDiurnal: boolean; // True during daytime, false during nighttime
  toggleTheme: () => void;
  setThemeBase: (isDiurnal: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Automatically set theme based on user's current local hour (Diurnal vs Nocturnal)
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    setTheme(isDayTime ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeBase = (isDiurnal: boolean) => {
    setTheme(isDiurnal ? 'light' : 'dark');
  };

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const isDiurnal = theme === 'light';

  return <ThemeContext.Provider value={{ theme, isDiurnal, toggleTheme, setThemeBase }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
