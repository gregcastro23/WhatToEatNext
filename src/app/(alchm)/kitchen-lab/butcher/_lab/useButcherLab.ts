"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCutById, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import {
  defaultButcherProgress,
  getTicketForTier,
  readButcherProgress,
  recordButcherResult,
  scoreOrderFulfillment,
} from "@/lib/butcher/science/butcherGame";
import { recommendThermalStrategy } from "@/lib/butcher/science/meatPhysics";
import type {
  AnatomicalCut,
  ButcherOrderScore,
  ButcherOrderTicket,
  ButcherOrderTier,
  ButcherProgressStats,
  CameraFramingId,
  ColorOverlayMode,
  CookingStrategy,
  SpeciesId,
} from "@/lib/butcher/types";

/**
 * Stateful hook orchestrating anatomical exploration, meat thermal curves,
 * and the Butcher's Block order & carve game loop.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/useButcherLab.ts
 */

export interface ButcherLabState {
  readonly speciesId: SpeciesId;
  readonly cut: AnatomicalCut;
  readonly hoveredCutId: string | null;
  readonly explodeFactor: number;
  readonly colorMode: ColorOverlayMode;
  readonly framing: CameraFramingId;
  readonly coreTempC: number;
  readonly holdMinutes: number;
  readonly sliceAngleDeg: number;
  readonly gameTier: ButcherOrderTier;
  readonly ticketIndex: number;
  readonly activeTicket: ButcherOrderTicket;
  readonly portionMassG: number;
  readonly gameMethod: CookingStrategy;
  readonly gameCoreTempC: number;
  readonly lastScore: ButcherOrderScore | null;
  readonly progress: ButcherProgressStats;
  readonly setHoveredCutId: (id: string | null) => void;
  readonly setExplodeFactor: (factor: number) => void;
  readonly setColorMode: (mode: ColorOverlayMode) => void;
  readonly setFraming: (framing: CameraFramingId) => void;
  readonly setCoreTempC: (tempC: number) => void;
  readonly setHoldMinutes: (mins: number) => void;
  readonly setSliceAngleDeg: (angleDeg: number) => void;
  readonly setGameTier: (tier: ButcherOrderTier) => void;
  readonly setPortionMassG: (massG: number) => void;
  readonly setGameMethod: (method: CookingStrategy) => void;
  readonly setGameCoreTempC: (tempC: number) => void;
  readonly syncFromCut: (nextSpeciesId: SpeciesId, nextCutId: string) => void;
  readonly submitGameOrder: () => ButcherOrderScore;
  readonly nextGameOrder: () => void;
}

interface LabCoreState {
  readonly speciesId: SpeciesId;
  readonly cutId: string;
  readonly hoveredCutId: string | null;
  readonly explodeFactor: number;
  readonly colorMode: ColorOverlayMode;
  readonly framing: CameraFramingId;
  readonly coreTempC: number;
  readonly holdMinutes: number;
  readonly sliceAngleDeg: number;
  readonly portionMassG: number;
  readonly gameMethod: CookingStrategy;
  readonly gameCoreTempC: number;
}

interface LabGameState {
  readonly gameTier: ButcherOrderTier;
  readonly ticketIndex: number;
  readonly lastScore: ButcherOrderScore | null;
  readonly progress: ButcherProgressStats;
}

function initialLabCore(cut: AnatomicalCut): LabCoreState {
  return {
    speciesId: cut.speciesId,
    cutId: cut.id,
    hoveredCutId: null,
    explodeFactor: 0.25,
    colorMode: "anatomical",
    framing: "whole-carcass",
    coreTempC: cut.targetCoreTempC.ideal,
    holdMinutes: cut.braiseHoldMinutes > 0 ? cut.braiseHoldMinutes : 12,
    sliceAngleDeg: 45,
    portionMassG: cut.typicalPortionG,
    gameMethod: recommendThermalStrategy(cut),
    gameCoreTempC: cut.targetCoreTempC.ideal,
  };
}

interface LabCoreSetters {
  readonly setHoveredCutId: (id: string | null) => void;
  readonly setExplodeFactor: (factor: number) => void;
  readonly setColorMode: (mode: ColorOverlayMode) => void;
  readonly setFraming: (framing: CameraFramingId) => void;
  readonly setCoreTempC: (tempC: number) => void;
  readonly setHoldMinutes: (mins: number) => void;
  readonly setSliceAngleDeg: (angleDeg: number) => void;
  readonly setPortionMassG: (massG: number) => void;
  readonly setGameMethod: (method: CookingStrategy) => void;
  readonly setGameCoreTempC: (tempC: number) => void;
}

interface LabGameActions {
  readonly activeTicket: ButcherOrderTicket;
  readonly setGameTier: (tier: ButcherOrderTier) => void;
  readonly submitGameOrder: () => ButcherOrderScore;
  readonly nextGameOrder: () => void;
}

function useLabCoreSetters(
  setCore: React.Dispatch<React.SetStateAction<LabCoreState>>,
): LabCoreSetters {
  return useMemo(
    () => ({
      setHoveredCutId: (hoveredCutId: string | null): void => setCore((s) => ({ ...s, hoveredCutId })),
      setExplodeFactor: (explodeFactor: number): void => setCore((s) => ({ ...s, explodeFactor })),
      setColorMode: (colorMode: ColorOverlayMode): void => setCore((s) => ({ ...s, colorMode })),
      setFraming: (framing: CameraFramingId): void => setCore((s) => ({ ...s, framing })),
      setCoreTempC: (coreTempC: number): void => setCore((s) => ({ ...s, coreTempC })),
      setHoldMinutes: (holdMinutes: number): void => setCore((s) => ({ ...s, holdMinutes })),
      setSliceAngleDeg: (sliceAngleDeg: number): void => setCore((s) => ({ ...s, sliceAngleDeg })),
      setPortionMassG: (portionMassG: number): void => setCore((s) => ({ ...s, portionMassG })),
      setGameMethod: (gameMethod: CookingStrategy): void => setCore((s) => ({ ...s, gameMethod })),
      setGameCoreTempC: (gameCoreTempC: number): void => setCore((s) => ({ ...s, gameCoreTempC })),
    }),
    [setCore],
  );
}

function useButcherGameActions(
  cut: AnatomicalCut,
  core: LabCoreState,
  game: LabGameState,
  setGame: React.Dispatch<React.SetStateAction<LabGameState>>,
): LabGameActions {
  const activeTicket = getTicketForTier(game.gameTier, game.ticketIndex);

  const setGameTier = useCallback(
    (gameTier: ButcherOrderTier): void => {
      setGame((prev) => ({ ...prev, gameTier, ticketIndex: 0, lastScore: null }));
    },
    [setGame],
  );

  const submitGameOrder = useCallback((): ButcherOrderScore => {
    const result = scoreOrderFulfillment(activeTicket, {
      selectedCutId: cut.id,
      sliceAngleDeg: core.sliceAngleDeg,
      portionMassG: core.portionMassG,
      selectedMethod: core.gameMethod,
      selectedCoreTempC: core.gameCoreTempC,
    });
    setGame((prev) => ({
      ...prev,
      lastScore: result,
      progress: recordButcherResult(prev.progress, result, prev.gameTier),
    }));
    return result;
  }, [activeTicket, cut.id, core.sliceAngleDeg, core.portionMassG, core.gameMethod, core.gameCoreTempC, setGame]);

  const nextGameOrder = useCallback((): void => {
    setGame((prev) => ({ ...prev, ticketIndex: prev.ticketIndex + 1, lastScore: null }));
  }, [setGame]);

  return { activeTicket, setGameTier, submitGameOrder, nextGameOrder };
}

export function useButcherLab(
  initialSpeciesId: SpeciesId,
  initialCutId: string,
): ButcherLabState {
  const resolvedInitialCut =
    getCutById(initialCutId) ?? getCutById(getSpeciesSpec(initialSpeciesId).defaultCutId);
  if (!resolvedInitialCut) throw new Error("Butcher Shop cut catalogue is empty");

  const [core, setCore] = useState<LabCoreState>(() => initialLabCore(resolvedInitialCut));
  const [game, setGame] = useState<LabGameState>(() => ({
    gameTier: "apprentice",
    ticketIndex: 0,
    lastScore: null,
    progress: defaultButcherProgress(),
  }));

  useEffect(() => {
    setGame((prev) => ({ ...prev, progress: readButcherProgress() }));
  }, []);

  const syncFromCut = useCallback((nextSpeciesId: SpeciesId, nextCutId: string): void => {
    const nextCut = getCutById(nextCutId) ?? getCutById(getSpeciesSpec(nextSpeciesId).defaultCutId);
    if (!nextCut) return;
    setCore((prev) => ({
      ...prev,
      speciesId: nextCut.speciesId,
      cutId: nextCut.id,
      coreTempC: nextCut.targetCoreTempC.ideal,
      holdMinutes: nextCut.braiseHoldMinutes > 0 ? nextCut.braiseHoldMinutes : 12,
      portionMassG: nextCut.typicalPortionG,
      gameMethod: recommendThermalStrategy(nextCut),
      gameCoreTempC: nextCut.targetCoreTempC.ideal,
    }));
  }, []);

  useEffect(() => {
    syncFromCut(initialSpeciesId, initialCutId);
  }, [initialSpeciesId, initialCutId, syncFromCut]);

  const cut = getCutById(core.cutId) ?? resolvedInitialCut;
  const setters = useLabCoreSetters(setCore);
  const actions = useButcherGameActions(cut, core, game, setGame);

  return { ...core, cut, ...game, ...setters, ...actions, syncFromCut };
}
