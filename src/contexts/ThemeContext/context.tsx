"use client";

import React, { createContext } from "react";
import type { ThemeContextType } from "./types";

export const _ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
