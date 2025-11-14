"use client";

import React, { createContext } from "react";
import type { ChartContextType, CurrentChart } from "./types";

// Create default chart
const _: CurrentChart = {
  planetaryPositions: {},
  aspects: [],
  currentSeason: "",
  lastUpdated: new Date(),
  stelliums: {},
  houseEffects: {},
};

// Create the context with default values
export const _ChartContext = createContext<ChartContextType | null>(null);
