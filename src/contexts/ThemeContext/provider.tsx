"use client";

import React, { useEffect, useState } from "react";
import { themeManager } from "@/utils/theme";
import { _ThemeContext } from "./context";
import type { Theme } from "./types";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme") as Theme;
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
    <_ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      ,{children}
    </_ThemeContext.Provider>
  );
}
