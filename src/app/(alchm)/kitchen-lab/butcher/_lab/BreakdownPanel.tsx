"use client";

import dynamic from "next/dynamic";
import { useId, useState, type JSX, type KeyboardEvent } from "react";
import { SPECIES_LIST, getCutsForPrimal, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import { FAT_CLASS_COLOR, FAT_CLASS_LABEL } from "@/lib/butcher/science/fatClass";
import { BUTCHER_CAMERA_FRAMINGS } from "@/lib/butcher/stage/cameraFramings";
import { OVERLAY_COLOR_LEGEND } from "@/lib/butcher/stage/overlayLegend";
import type { AnatomicalCut, CameraFramingId, ColorOverlayMode, SpeciesId, SpeciesSpec } from "@/lib/butcher/types";
import { CutCompareDrawer } from "./CutCompareDrawer";
import { CutSummaryStrip } from "./CutSummaryStrip";
import { LazyButcherStage } from "./LazyButcherStage";
import type { ButcherLabState } from "./useButcherLab";

/**
 * Tab 1 — `Breakdown` (3D Anatomical Explorer).
 *
 * Stage first: one compact toolbar (species, camera) sits above the stage; the
 * view controls (explode, colour overlay, bone landmarks) sit below it and fold
 * away on narrow screens, where a summary strip under the stage carries the
 * active cut's key numbers.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/BreakdownPanel.tsx
 */

const OVERLAY_MODES: ReadonlyArray<{ readonly id: ColorOverlayMode; readonly label: string }> = [
  { id: "anatomical", label: "Anatomical Cut" },
  { id: "marbling", label: "Fat class" },
  { id: "collagen", label: "Collagen Load" },
  { id: "thermal", label: "Cooking Strategy" },
];

const FRAMING_IDS: readonly CameraFramingId[] = [
  "whole-carcass",
  "exploded-primal",
  "butcher-block-slice",
];

function BreakdownToolbar({
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
    <div className="bt-toolbar">
      <div className="bt-seg" role="group" aria-label="Species selector">
        {SPECIES_LIST.map((sp) => (
          <button key={sp.id} type="button" className="bt-btn" aria-pressed={speciesId === sp.id} onClick={() => onSelectSpecies(sp.id)}>
            {sp.name}
          </button>
        ))}
      </div>
      <div className="bt-seg" role="group" aria-label="Camera framing">
        {FRAMING_IDS.map((fid) => (
          <button key={fid} type="button" className="bt-btn" aria-pressed={framing === fid} onClick={() => onSetFraming(fid)}>
            {BUTCHER_CAMERA_FRAMINGS[fid].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OverlayControls({
  colorMode,
  onColorModeChange,
}: {
  readonly colorMode: ColorOverlayMode;
  readonly onColorModeChange: (mode: ColorOverlayMode) => void;
}): JSX.Element {
  return (
    <div>
      <span className="bt-label block">Color overlay</span>
      <div className="bt-seg mt-1" role="group" aria-label="Color overlay mode">
        {OVERLAY_MODES.map((m) => (
          <button key={m.id} type="button" className="bt-btn" aria-pressed={colorMode === m.id} onClick={() => onColorModeChange(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/65" aria-label="Color overlay legend">
        {OVERLAY_COLOR_LEGEND[colorMode].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-white/20" style={{ backgroundColor: item.colorHex }} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const BoneLandmarkNotes = dynamic(() => import("./BoneLandmarkNotes").then((m) => m.BoneLandmarkNotes));

function ExplodeSlider({ value, onChange }: { readonly value: number; readonly onChange: (v: number) => void }): JSX.Element {
  return (
    <div className="min-w-[12rem] flex-1">
      <label htmlFor="bt-explode-range" className="bt-label block">
        Explode primals <span className="bt-num">{Math.round(value * 100)}%</span>
      </label>
      <input id="bt-explode-range" type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(Number(e.target.value))} className="bt-range mt-1.5" />
    </div>
  );
}

/** Explode, colour overlay and bone landmarks; folded behind a toggle below 1100 px. */
function ViewControls({ lab }: { readonly lab: ButcherLabState }): JSX.Element {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="bt-card bt-view-controls">
      <button type="button" className="bt-btn bt-narrow-only w-full" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
        {open ? "Hide view controls" : "View controls: explode, overlay, bones"}
      </button>
      <div id={panelId} className="bt-collapsible space-y-3" data-open={open}>
        <div className="flex flex-wrap items-end gap-4">
          <ExplodeSlider value={lab.explodeFactor} onChange={lab.setExplodeFactor} />
          <button type="button" className="bt-btn" aria-pressed={lab.showBoneLandmarks} onClick={() => lab.setShowBoneLandmarks(!lab.showBoneLandmarks)}>
            Show Bone Landmarks
          </button>
        </div>
        <OverlayControls colorMode={lab.colorMode} onColorModeChange={lab.setColorMode} />
        {lab.showBoneLandmarks ? <BoneLandmarkNotes speciesId={lab.speciesId} /> : null}
      </div>
    </div>
  );
}

const NEXT_KEYS: Readonly<Record<string, number>> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/** Arrow keys move between cut buttons across the whole grid; Home / End jump to the ends. */
function moveCutFocus(e: KeyboardEvent<HTMLButtonElement>): void {
  const grid = e.currentTarget.closest("[data-cut-grid]");
  if (!grid) return;
  const pills = Array.from(grid.querySelectorAll<HTMLButtonElement>("button[data-cut-pill]"));
  const here = pills.indexOf(e.currentTarget);
  let next: number | null = null;
  if (e.key === "Home") next = 0;
  else if (e.key === "End") next = pills.length - 1;
  else if (e.key in NEXT_KEYS) next = (here + (NEXT_KEYS[e.key] ?? 0) + pills.length) % pills.length;
  const target = next === null ? undefined : pills[next];
  if (!target) return;
  e.preventDefault();
  target.focus();
}

function CutPill({
  cut,
  active,
  onHoverCut,
  onSelectCut,
}: {
  readonly cut: AnatomicalCut;
  readonly active: boolean;
  readonly onHoverCut: (id: string | null) => void;
  readonly onSelectCut: (speciesId: SpeciesId, cutId: string) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      data-cut-pill
      className="bt-cut-pill flex items-center justify-between gap-2"
      aria-pressed={active}
      onMouseEnter={() => onHoverCut(cut.id)}
      onMouseLeave={() => onHoverCut(null)}
      onFocus={() => onHoverCut(cut.id)}
      onBlur={() => onHoverCut(null)}
      onKeyDown={moveCutFocus}
      onClick={() => onSelectCut(cut.speciesId, cut.id)}
    >
      <span>{cut.name}</span>
      <span className="bt-num inline-flex shrink-0 items-center gap-1.5 text-[11px] text-white/55" title={`${FAT_CLASS_LABEL[cut.fatClass]} (USDA fat)`}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FAT_CLASS_COLOR[cut.fatClass] }} aria-hidden="true" />
        {cut.proximate.fatG.toFixed(1)} fat · {cut.proximate.collagenG.toFixed(1)} col
      </span>
    </button>
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
    <div className="bt-card" data-cut-grid>
      <h2 className="text-lg">{species.name} Primals &amp; Sub-Primals</h2>
      <p className="mb-3 text-xs text-white/55">{species.summary} Values are g per 100 g raw (USDA); arrow keys move between cuts.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {species.primals.map((primal) => (
          <div key={primal.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primal.colorHex }} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/85">{primal.name}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {getCutsForPrimal(species.id, primal.id).map((c) => (
                <CutPill key={c.id} cut={c} active={activeCutId === c.id} onHoverCut={onHoverCut} onSelectCut={onSelectCut} />
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
    <div className="space-y-3">
      <BreakdownToolbar speciesId={lab.speciesId} framing={lab.framing} onSelectSpecies={onSelectSpecies} onSetFraming={lab.setFraming} />
      <LazyButcherStage
        speciesId={lab.speciesId}
        selectedCutId={lab.cut.id}
        hoveredCutId={lab.hoveredCutId}
        targetCutId={null}
        explodeFactor={lab.explodeFactor}
        colorMode={lab.colorMode}
        framing={lab.framing}
        showSlicePlane={false}
        showBoneLandmarks={lab.showBoneLandmarks}
        sliceAngleDeg={lab.sliceAngleDeg}
        onSelectCut={(nextCutId) => onSelectCut(lab.speciesId, nextCutId)}
        onHoverCut={lab.setHoveredCutId}
        onSliceAngleChange={lab.setSliceAngleDeg}
      />
      <CutSummaryStrip cut={lab.cut} />
      <ViewControls lab={lab} />
      <CutCompareDrawer cut={lab.cut} comparePins={lab.comparePins} onTogglePin={lab.togglePin} />
      <PrimalSubCutGrid species={species} activeCutId={lab.cut.id} onHoverCut={lab.setHoveredCutId} onSelectCut={onSelectCut} />
    </div>
  );
}
