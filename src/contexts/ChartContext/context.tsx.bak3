'use client';

import { createContext } from 'react';

import { ChartContextType, CurrentChart } from './types';

// Create default chart
const defaultChart: CurrentChart = {
  planetaryPositions: {},
  aspects: [],
  currentSeason: '',
  lastUpdated: new Date(),
  stelliums: {},
  houseEffects: {}
};

// Create the context with default values
export const ChartContext = createContext<ChartContextType | null>(null); 