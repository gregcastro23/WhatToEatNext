"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCutById, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import { defaultBoneInForCut } from "@/lib/butcher/science/boneAnatomy";
import { togglePinnedCut } from "@/lib/butcher/science/cutComparison";
import { recommendThermalStrategy } from "@/lib/butcher/science/meatPhysics";
import type { PrepId } from "@/lib/butcher/science/prepModifiers";
import type {
  AnatomicalCut,
  CameraFramingId,
  ColorOverlayMode,
  CookingStrategy,
  SpeciesId,
} from "@/lib/butcher/types";
import { useButcherGame, type ButcherGameState } from "./useButcherGame";

/**
 * Stateful hook orchestrating anatomical exploration, meat thermal curves,
 * prep & trim modifiers, cut comparison, and the Butcher's Block game loop.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/useButcherLab.ts
 */

interface LabCoreState {
  readonly speciesId: SpeciesId;
  readonly cutId: string;
  readonly hoveredCutId: string | null;
  readonly explodeFactor: number;
  readonly colorMode: ColorOverlayMode;
  readonly framing: CameraFramingId;
  readonly showBoneLandmarks: boolean;
  readonly coreTempC: number;
  readonly holdMinutes: number;
  readonly sliceAngleDeg: number;
  readonly portionMassG: number;
  readonly gameMethod: CookingStrategy;
  readonly gameCoreTempC: number;
  readonly prep: PrepId;
  readonly fatCapMm: number;
  readonly boneIn: boolean;
  readonly comparePins: readonly string[];
}

interface LabCoreSetters {
  readonly setHoveredCutId: (id: string | null) => void;
  readonly setExplodeFactor: (factor: number) => void;
  readonly setColorMode: (mode: ColorOverlayMode) => void;
  readonly setFraming: (framing: CameraFramingId) => void;
  readonly setShowBoneLandmarks: (show: boolean) => void;
  readonly setCoreTempC: (tempC: number) => void;
  readonly setHoldMinutes: (mins: number) => void;
  readonly setSliceAngleDeg: (angleDeg: number) => void;
  readonly setPortionMassG: (massG: number) => void;
  readonly setGameMethod: (method: CookingStrategy) => void;
  readonly setGameCoreTempC: (tempC: number) => void;
  readonly setPrep: (prep: PrepId) => void;
  readonly setFatCapMm: (mm: number) => void;
  readonly setBoneIn: (boneIn: boolean) => void;
  readonly togglePin: (cutId: string) => void;
}

export interface ButcherLabState extends LabCoreState, LabCoreSetters, ButcherGameState {
  readonly cut: AnatomicalCut;
  readonly syncFromCut: (nextSpeciesId: SpeciesId, nextCutId: string) => void;
}

/** Per-cut fields reset whenever the selected cut changes. */
function cutDefaults(cut: AnatomicalCut): Pick<LabCoreState, "speciesId" | "cutId" | "coreTempC" | "holdMinutes" | "portionMassG" | "gameMethod" | "gameCoreTempC" | "boneIn" | "fatCapMm"> {
  return {
    speciesId: cut.speciesId,
    cutId: cut.id,
    coreTempC: cut.targetCoreTempC.ideal,
    holdMinutes: cut.braiseHoldMinutes > 0 ? cut.braiseHoldMinutes : 12,
    portionMassG: cut.typicalPortionG,
    gameMethod: recommendThermalStrategy(cut),
    gameCoreTempC: cut.targetCoreTempC.ideal,
    boneIn: defaultBoneInForCut(cut),
    // A fat cap belongs to the cut it was set on (a 12 mm brisket cap must not follow you to a salmon fillet).
    fatCapMm: 0,
  };
}

function initialLabCore(cut: AnatomicalCut): LabCoreState {
  return {
    ...cutDefaults(cut),
    hoveredCutId: null,
    explodeFactor: 0,
    colorMode: "anatomical",
    framing: "whole-carcass",
    showBoneLandmarks: false,
    sliceAngleDeg: 45,
    prep: "none",
    comparePins: [],
  };
}

function framingForExplode(framing: CameraFramingId, explodeFactor: number): CameraFramingId {
  if (framing === "butcher-block-slice") return framing;
  return explodeFactor >= 0.5 ? "exploded-primal" : "whole-carcass";
}

function explodeForFraming(framing: CameraFramingId, current: number): number {
  if (framing === "whole-carcass") return 0;
  if (framing === "exploded-primal") return 1;
  return Math.max(current, 0.25);
}

function useLabCoreSetters(setCore: React.Dispatch<React.SetStateAction<LabCoreState>>): LabCoreSetters {
  return useMemo(() => {
    const patch = <K extends keyof LabCoreState>(key: K) => (value: LabCoreState[K]): void =>
      setCore((s) => ({ ...s, [key]: value }));
    return {
      setHoveredCutId: patch("hoveredCutId"),
      setExplodeFactor: (explodeFactor: number): void =>
        setCore((s) => ({ ...s, explodeFactor, framing: framingForExplode(s.framing, explodeFactor) })),
      setColorMode: patch("colorMode"),
      setFraming: (framing: CameraFramingId): void =>
        setCore((s) => ({ ...s, framing, explodeFactor: explodeForFraming(framing, s.explodeFactor) })),
      setShowBoneLandmarks: patch("showBoneLandmarks"),
      setCoreTempC: patch("coreTempC"),
      setHoldMinutes: patch("holdMinutes"),
      setSliceAngleDeg: patch("sliceAngleDeg"),
      setPortionMassG: patch("portionMassG"),
      setGameMethod: patch("gameMethod"),
      setGameCoreTempC: patch("gameCoreTempC"),
      setPrep: patch("prep"),
      setFatCapMm: (mm: number): void => setCore((s) => ({ ...s, fatCapMm: Math.min(15, Math.max(0, mm)) })),
      setBoneIn: patch("boneIn"),
      togglePin: (cutId: string): void => setCore((s) => ({ ...s, comparePins: togglePinnedCut(s.comparePins, cutId) })),
    };
  }, [setCore]);
}

export function useButcherLab(initialSpeciesId: SpeciesId, initialCutId: string): ButcherLabState {
  const resolvedInitialCut =
    getCutById(initialCutId) ?? getCutById(getSpeciesSpec(initialSpeciesId).defaultCutId);
  if (!resolvedInitialCut) throw new Error("Butcher Shop cut catalogue is empty");

  const [core, setCore] = useState<LabCoreState>(() => initialLabCore(resolvedInitialCut));

  const syncFromCut = useCallback((nextSpeciesId: SpeciesId, nextCutId: string): void => {
    const nextCut = getCutById(nextCutId) ?? getCutById(getSpeciesSpec(nextSpeciesId).defaultCutId);
    if (!nextCut) return;
    setCore((prev) => ({ ...prev, ...cutDefaults(nextCut) }));
  }, []);

  useEffect(() => {
    syncFromCut(initialSpeciesId, initialCutId);
  }, [initialSpeciesId, initialCutId, syncFromCut]);

  const cut = getCutById(core.cutId) ?? resolvedInitialCut;
  const setters = useLabCoreSetters(setCore);
  const game = useButcherGame({
    cut, sliceAngleDeg: core.sliceAngleDeg, portionMassG: core.portionMassG,
    gameMethod: core.gameMethod, gameCoreTempC: core.gameCoreTempC,
  });

  return { ...core, cut, ...setters, ...game, syncFromCut };
}
