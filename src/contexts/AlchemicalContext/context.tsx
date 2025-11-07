/**
 * Alchemical Context - Minimal Recovery Version
 *
 * Core context for alchemical state management including seasons, zodiac,
 * planetary positions, and elemental properties.
 */

"use client";

import React, { createContext } from "react";
import type { AlchemicalState, AlchemicalContextType } from "./types";

// Define default state
export const defaultState: AlchemicalState = {
  currentSeason: "spring",
  timeOfDay: "morning",
  astrologicalState: {
    currentZodiac: "aries",
    planetaryInfluences: {
      Sun: 0.7,
      Moon: 0.5,
      Mercury: 0.3,
      Venus: 0.6,
      Mars: 0.4,
      Jupiter: 0.8,
      Saturn: 0.2,
    },
    elementalProperties: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.2,
    },
    alchemicalProperties: {
      Spirit: 0.3,
      Essence: 0.3,
      Matter: 0.2,
      Substance: 0.2,
    },
    thermodynamicProperties: {
      temperature: 20,
      pressure: 1,
      entropy: 0.5,
      enthalpy: 0.5,
    },
    timestamp: Date.now(),
  },
  lunarPhase: "new moon",
  currentTime: new Date(),
  lastUpdated: new Date(),
  planetaryPositions: {},
  normalizedPositions: {},
  dominantElement: "Fire",
  planetaryHour: "Sun",
  svgRepresentation: null,
};

// Create the context with default values
export const _AlchemicalContext = createContext<AlchemicalContextType>({
  state: defaultState,
  dispatch: () => {},
  planetaryPositions: {},
  normalizedPositions: {},
  getDominantElement: () => "Fire",
  getCurrentElementalBalance: () => ({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  }),
  getAlchemicalHarmony: () => 0.5,
  updateAstrologicalState: () => {},
  calculateSeasonalInfluence: () => 0.5,
  getThermodynamicState: () => ({
    temperature: 20,
    pressure: 1,
    entropy: 0.5,
    enthalpy: 0.5,
  }),
} as any);

// Export without underscore for compatibility
export const AlchemicalContext = _AlchemicalContext;

export default _AlchemicalContext;
