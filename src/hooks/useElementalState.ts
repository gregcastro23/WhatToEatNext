import { useState, useEffect, useMemo } from "react";
import type { ElementalProperties } from "@/types/alchemy";
import { useAlchemical } from "./useAlchemical";

export interface ElementalState {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}
export function useElementalState() {
  const { planetaryPositions, isLoading: _isLoading } = useAlchemical();

  const elementalState = useMemo((): ElementalProperties => {
    if (
      !planetaryPositions ||
      Object.keys(planetaryPositions || {}).length === 0
    ) {
      return {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
        dominant: "Fire",
        balance: 1.0,
      } as unknown as ElementalProperties;
    }

    // Calculate elemental distribution from planetary positions
    const elementCounts = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const elementMap = {
      aries: "Fire",
      leo: "Fire",
      sagittarius: "Fire",
      taurus: "Earth",
      virgo: "Earth",
      capricorn: "Earth",
      gemini: "Air",
      libra: "Air",
      aquarius: "Air",
      cancer: "Water",
      scorpio: "Water",
      pisces: "Water",
    };

    Object.values(planetaryPositions || {}).forEach((position) => {
      const element =
        elementMap[(position as any)?.sign as keyof typeof elementMap];
      if (element) {
        elementCounts[element as keyof typeof elementCounts]++;
      }
    });

    const total = Object.values(elementCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    // Normalize to percentages
    const normalized = {
      Fire: total > 0 ? elementCounts.Fire / total : 0.25,
      Water: total > 0 ? elementCounts.Water / total : 0.25,
      Earth: total > 0 ? elementCounts.Earth / total : 0.25,
      Air: total > 0 ? elementCounts.Air / total : 0.25,
    };

    // Find dominant element
    const dominant = Object.entries(normalized).reduce((a, b) =>
      normalized[a[0] as keyof ElementalState] >
      normalized[b[0] as keyof ElementalState]
        ? a
        : b,
    )[0] as keyof ElementalState;

    // Calculate balance (how evenly distributed the elements are)
    const values = Object.values(normalized);
    const avg =
      values.reduce((sum, val) => sum + val, 0) / (values || []).length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      (values || []).length;
    const balance = Math.max(0, 1 - variance * 4); // Scale to 0-1

    return {
      ...normalized,
      dominant,
      balance,
    } as unknown as ElementalProperties;
  }, [planetaryPositions]);

  return {
    ...elementalState,
    isLoading,
  };
}
