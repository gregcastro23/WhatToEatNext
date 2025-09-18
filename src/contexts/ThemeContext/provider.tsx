'use client';

import React, { ReactNode, useState, useEffect } from 'react';

import { themeManager } from '@/utils/theme';

import { ThemeContext } from './context';
import { Theme } from './types';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      themeManager.updateTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    themeManager.updateTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      ;{children}
    </ThemeContext.Provider>
  );
}
