"use client";

import { SPECIES_LIST, getCutsForPrimal, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import { BUTCHER_CAMERA_FRAMINGS } from "@/lib/butcher/stage/cameraFramings";
import type { CameraFramingId, ColorOverlayMode, SpeciesId, SpeciesSpec } from "@/lib/butcher/types";
import { LazyButcherStage } from "./LazyButcherStage";
import type { ButcherLabState } from "./useButcherLab";
import type { JSX } from "react";

/**
 * Tab 1 — `Breakdown` (3D Anatomical Explorer).
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/BreakdownPanel.tsx
 */

const OVERLAY_MODES: ReadonlyArray<{ readonly id: ColorOverlayMode; readonly label: string }> = [
  { id: "anatomical", label: "Anatomical Cut" },
  { id: "marbling", label: "Marbling / Fat %" },
  { id: "collagen", label: "Collagen Load" },
  { id: "thermal", label: "Cooking Strategy" },
];

const FRAMING_IDS: readonly CameraFramingId[] = [
  "whole-carcass",
  "exploded-primal",
  "butcher-block-slice",
];

function BreakdownTopRow({
  speciesId,
  framing,
  onSelectSpecies,
  onSetFraming,
}: {
  readonly speciesId: SpeciesId;
  readonly framing: CameraFramingId;
  readonly onSelectSpecies: (id: SpeciesId) => void;
  readonly onSetFraming: (fid: CameraFramingId) => void;
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Species selector">
        {SPECIES_LIST.map((sp) => (
          <button key={sp.id} type="button" className="bt-btn" aria-pressed={speciesId === sp.id} onClick={() => onSelectSpecies(sp.id)}>
            {sp.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Camera framing">
        {FRAMING_IDS.map((fid) => (
          <button key={fid} type="button" className="bt-btn" aria-pressed={framing === fid} onClick={() => onSetFraming(fid)}>
            {BUTCHER_CAMERA_FRAMINGS[fid].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BreakdownOverlayRow({
  explodeFactor,
  colorMode,
  onExplodeChange,
  onColorModeChange,
}: {
  readonly explodeFactor: number;
  readonly colorMode: ColorOverlayMode;
  readonly onExplodeChange: (val: number) => void;
  readonly onColorModeChange: (mode: ColorOverlayMode) => void;
}): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="bt-explode-range" className="bt-label block">
          Explode Primals ({Math.round(explodeFactor * 100)}%)
        </label>
        <input
          id="bt-explode-range"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={explodeFactor}
          onChange={(e) => onExplodeChange(Number(e.target.value))}
          className="bt-range mt-1.5"
        />
      </div>
      <div>
        <span className="bt-label block">Color Overlay</span>
        <div className="mt-1 flex flex-wrap gap-1.5" role="group" aria-label="Color overlay mode">
          {OVERLAY_MODES.map((m) => (
            <button key={m.id} type="button" className="bt-btn" aria-pressed={colorMode === m.id} onClick={() => onColorModeChange(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrimalSubCutGrid({
  species,
  activeCutId,
  onHoverCut,
  onSelectCut,
}: {
  readonly species: SpeciesSpec;
  readonly activeCutId: string;
  readonly onHoverCut: (id: string | null) => void;
  readonly onSelectCut: (speciesId: SpeciesId, cutId: string) => void;
}): JSX.Element {
  return (
    <div className="bt-card">
      <h2 className="text-lg">{species.name} Primals &amp; Sub-Primals</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {species.primals.map((primal) => (
          <div key={primal.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primal.colorHex }} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/85">{primal.name}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {getCutsForPrimal(species.id, primal.id).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="bt-cut-pill flex items-center justify-between gap-2"
                  aria-pressed={activeCutId === c.id}
                  onMouseEnter={() => onHoverCut(c.id)}
                  onMouseLeave={() => onHoverCut(null)}
                  onClick={() => onSelectCut(c.speciesId, c.id)}
                >
                  <span>{c.name}</span>
                  <span className="bt-num text-[11px] text-white/50">{c.proximate.collagenG.toFixed(1)}g col</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BreakdownPanel({
  lab,
  onSelectSpecies,
  onSelectCut,
}: {
  readonly lab: ButcherLabState;
  readonly onSelectSpecies: (speciesId: SpeciesId) => void;
  readonly onSelectCut: (speciesId: SpeciesId, cutId: string) => void;
}): JSX.Element {
  const species = getSpeciesSpec(lab.speciesId);

  return (
    <div className="space-y-4">
      <div className="bt-card space-y-3">
        <BreakdownTopRow speciesId={lab.speciesId} framing={lab.framing} onSelectSpecies={onSelectSpecies} onSetFraming={lab.setFraming} />
        <p className="text-xs text-white/60">{species.summary}</p>
        <BreakdownOverlayRow explodeFactor={lab.explodeFactor} colorMode={lab.colorMode} onExplodeChange={lab.setExplodeFactor} onColorModeChange={lab.setColorMode} />
      </div>

      <LazyButcherStage
        speciesId={lab.speciesId}
        selectedCutId={lab.cut.id}
        hoveredCutId={lab.hoveredCutId}
        targetCutId={null}
        explodeFactor={lab.explodeFactor}
        colorMode={lab.colorMode}
        framing={lab.framing}
        showSlicePlane={false}
        sliceAngleDeg={lab.sliceAngleDeg}
        onSelectCut={(nextCutId) => onSelectCut(lab.speciesId, nextCutId)}
        onHoverCut={lab.setHoveredCutId}
        onSliceAngleChange={lab.setSliceAngleDeg}
      />

      <PrimalSubCutGrid species={species} activeCutId={lab.cut.id} onHoverCut={lab.setHoveredCutId} onSelectCut={onSelectCut} />
    </div>
  );
}
