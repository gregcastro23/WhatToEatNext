"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultButcherProgress,
  getTicketForTier,
  readButcherProgress,
  recordButcherResult,
  scoreOrderFulfillment,
} from "@/lib/butcher/science/butcherGame";
import type {
  AnatomicalCut,
  ButcherOrderScore,
  ButcherOrderTicket,
  ButcherOrderTier,
  ButcherProgressStats,
  CookingStrategy,
  FabricationPick,
} from "@/lib/butcher/types";

/**
 * The Butcher's Block game loop: tier, active ticket, fabrication pulls,
 * scoring, and Species-Mastery progress persistence.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/useButcherGame.ts
 */

export interface ButcherGameSelection {
  readonly cut: AnatomicalCut;
  readonly sliceAngleDeg: number;
  readonly portionMassG: number;
  readonly gameMethod: CookingStrategy;
  readonly gameCoreTempC: number;
}

export interface ButcherGameState {
  readonly gameTier: ButcherOrderTier;
  readonly ticketIndex: number;
  readonly activeTicket: ButcherOrderTicket;
  readonly fabricationPicks: readonly FabricationPick[];
  readonly lastScore: ButcherOrderScore | null;
  readonly progress: ButcherProgressStats;
  readonly setGameTier: (tier: ButcherOrderTier) => void;
  /** Records the current cut / angle / mass as the next fabrication pull. */
  readonly pullFabricationStep: () => void;
  readonly undoFabricationStep: () => void;
  readonly submitGameOrder: () => ButcherOrderScore;
  readonly nextGameOrder: () => void;
}

interface GameCore {
  readonly gameTier: ButcherOrderTier;
  readonly ticketIndex: number;
  readonly fabricationPicks: readonly FabricationPick[];
  readonly lastScore: ButcherOrderScore | null;
  readonly progress: ButcherProgressStats;
}

export function useButcherGame(selection: ButcherGameSelection): ButcherGameState {
  const [game, setGame] = useState<GameCore>(() => ({
    gameTier: "apprentice", ticketIndex: 0, fabricationPicks: [], lastScore: null, progress: defaultButcherProgress(),
  }));
  useEffect(() => {
    setGame((prev) => ({ ...prev, progress: readButcherProgress() }));
  }, []);

  const activeTicket = getTicketForTier(game.gameTier, game.ticketIndex);
  const stepCount = activeTicket.fabricationSteps?.length ?? 0;
  const { cut, sliceAngleDeg, portionMassG, gameMethod, gameCoreTempC } = selection;

  const setGameTier = useCallback((gameTier: ButcherOrderTier): void => {
    setGame((prev) => ({ ...prev, gameTier, ticketIndex: 0, fabricationPicks: [], lastScore: null }));
  }, []);

  const pullFabricationStep = useCallback((): void => {
    setGame((prev) => (prev.fabricationPicks.length >= stepCount
      ? prev
      : { ...prev, fabricationPicks: [...prev.fabricationPicks, { selectedCutId: cut.id, sliceAngleDeg, portionMassG }] }));
  }, [cut.id, sliceAngleDeg, portionMassG, stepCount]);

  const undoFabricationStep = useCallback((): void => {
    setGame((prev) => ({ ...prev, fabricationPicks: prev.fabricationPicks.slice(0, -1), lastScore: null }));
  }, []);

  const submitGameOrder = useCallback((): ButcherOrderScore => {
    const result = scoreOrderFulfillment(activeTicket, {
      selectedCutId: cut.id, sliceAngleDeg, portionMassG, selectedMethod: gameMethod, selectedCoreTempC: gameCoreTempC,
      fabricationPicks: game.fabricationPicks,
    });
    setGame((prev) => ({
      ...prev,
      lastScore: result,
      progress: recordButcherResult(prev.progress, result, prev.gameTier, activeTicket.speciesId),
    }));
    return result;
  }, [activeTicket, cut.id, sliceAngleDeg, portionMassG, gameMethod, gameCoreTempC, game.fabricationPicks]);

  const nextGameOrder = useCallback((): void => {
    setGame((prev) => ({ ...prev, ticketIndex: prev.ticketIndex + 1, fabricationPicks: [], lastScore: null }));
  }, []);

  return {
    ...game, activeTicket, setGameTier, pullFabricationStep, undoFabricationStep, submitGameOrder, nextGameOrder,
  };
}
