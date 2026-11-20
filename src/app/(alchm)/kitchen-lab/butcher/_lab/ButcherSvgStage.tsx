"use client";

import { getCutsForSpecies, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import type { AnatomicalCut, ColorOverlayMode, Vec3Tuple } from "@/lib/butcher/types";
import type { ButcherStageProps } from "./stageTypes";
import type { JSX } from "react";

/**
 * Headless 2D SVG anatomical carcass diagram & accessible cut-selection surface.
 *
 * Used automatically in SSR, Jest/jsdom, headless environments without WebGL,
 * and as the instant loading shell before Three.js mounts.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButcherSvgStage.tsx
 */

function fillForCut(cut: AnatomicalCut, mode: ColorOverlayMode): string {
  if (mode === "anatomical") return cut.geometry3d.colorHex;
  if (mode === "marbling") {
    if (cut.proximate.fatG >= 20) return "#f59e0b";
    if (cut.proximate.fatG >= 12) return "#fb7185";
    if (cut.proximate.fatG >= 6) return "#be123c";
    return "#6b2135";
  }
  if (mode === "collagen") {
    if (cut.proximate.collagenG >= 2.2) return "#a855f7";
    if (cut.proximate.collagenG >= 1.3) return "#f59e0b";
    return "#10b981";
  }
  const [primary] = cut.optimalMethods;
  if (primary === "collagen-braise" || primary === "low-and-slow-smoke") return "#6366f1";
  if (primary === "sous-vide" || primary === "poach-confit") return "#06b6d4";
  return "#f97316";
}

function strokeForCutState(isSelected: boolean, isTarget: boolean, isHovered: boolean): string {
  if (isSelected) return "#fbbf24";
  if (isTarget) return "#34d399";
  if (isHovered) return "#38bdf8";
  return "rgba(255,255,255,0.38)";
}

interface SvgCutShapeProps {
  readonly cut: AnatomicalCut;
  readonly explodeVec: Vec3Tuple | null;
  readonly explodeFactor: number;
  readonly colorMode: ColorOverlayMode;
  readonly isSelected: boolean;
  readonly isHovered: boolean;
  readonly isTarget: boolean;
  readonly showSlicePlane: boolean;
  readonly sliceAngleDeg: number;
}

function SvgCutShape(p: SvgCutShapeProps): JSX.Element {
  const dx = p.explodeVec ? Number((p.explodeVec[0] * 34 * p.explodeFactor).toFixed(1)) : 0;
  const dy = p.explodeVec ? Number((-p.explodeVec[1] * 26 * p.explodeFactor).toFixed(1)) : 0;
  const grainRad = (p.cut.svg2d.grainAngleDeg * Math.PI) / 180;
  const gx = Math.cos(grainRad) * 14;
  const gy = Math.sin(grainRad) * 14;
  const knifeRad = ((p.cut.svg2d.grainAngleDeg + p.sliceAngleDeg) * Math.PI) / 180;
  const kx = Math.cos(knifeRad) * 26;
  const ky = Math.sin(knifeRad) * 26;
  const lx = p.cut.svg2d.labelX;
  const ly = p.cut.svg2d.labelY;

  return (
    <g className="bt-svg-primal" transform={`translate(${dx}, ${dy})`}>
      <path
        d={p.cut.svg2d.path}
        fill={fillForCut(p.cut, p.colorMode)}
        fillOpacity={p.isSelected ? 0.92 : p.isHovered ? 0.78 : 0.54}
        stroke={strokeForCutState(p.isSelected, p.isTarget, p.isHovered)}
        strokeWidth={p.isSelected ? 2.6 : p.isTarget ? 2 : 1.1}
      />
      <line x1={lx - gx} y1={ly - gy} x2={lx + gx} y2={ly + gy} stroke="rgba(254, 240, 138, 0.72)" strokeWidth={1.4} strokeDasharray="3 2" />
      {p.showSlicePlane && p.isSelected ? (
        <line x1={lx - kx} y1={ly - ky} x2={lx + kx} y2={ly + ky} stroke={p.sliceAngleDeg >= 75 ? "#34d399" : "#38bdf8"} strokeWidth={2.8} strokeLinecap="round" />
      ) : null}
    </g>
  );
}

function SvgSliceAngleBar({
  cutName,
  sliceAngleDeg,
  onSliceAngleChange,
}: {
  readonly cutName: string;
  readonly sliceAngleDeg: number;
  readonly onSliceAngleChange: (angleDeg: number) => void;
}): JSX.Element {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
      <label htmlFor="bt-svg-slice-angle" className="text-xs text-white/75">
        2D Knife Angle ({cutName}):
      </label>
      <input id="bt-svg-slice-angle" type="range" min={0} max={90} step={1} value={sliceAngleDeg} onChange={(e) => onSliceAngleChange(Number(e.target.value))} className="bt-range max-w-[180px]" />
      <span className="bt-num text-xs text-amber-200">{sliceAngleDeg}°</span>
    </div>
  );
}

function SvgCutButtonStrip({
  speciesName,
  cuts,
  selectedCutId,
  onHoverCut,
  onSelectCut,
}: {
  readonly speciesName: string;
  readonly cuts: readonly AnatomicalCut[];
  readonly selectedCutId: string;
  readonly onHoverCut: (cutId: string | null) => void;
  readonly onSelectCut: (cutId: string) => void;
}): JSX.Element {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={`${speciesName} anatomical cut buttons`}>
      {cuts.map((cut) => (
        <button key={cut.id} type="button" className="bt-cut-pill" aria-pressed={cut.id === selectedCutId} onMouseEnter={() => onHoverCut(cut.id)} onMouseLeave={() => onHoverCut(null)} onClick={() => onSelectCut(cut.id)}>
          {cut.name}
        </button>
      ))}
    </div>
  );
}

export function ButcherSvgStage(props: ButcherStageProps): JSX.Element {
  const species = getSpeciesSpec(props.speciesId);
  const cuts = getCutsForSpecies(props.speciesId);
  const selectedCut = cuts.find((c) => c.id === props.selectedCutId) ?? cuts[0];
  const primalById = new Map(species.primals.map((p) => [p.id, p]));

  return (
    <div className="bt-stage-frame p-3" data-stage-mode="svg-2d" data-species={props.speciesId}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
        <span>
          <strong className="text-white/90">{species.name}</strong>{" "}
          <em className="text-white/50">({species.latinName})</em> · 2D Anatomical Map
        </span>
        <span className="bt-num text-[11px] text-amber-200/80">
          Explode {Math.round(props.explodeFactor * 100)}% · {cuts.length} USDA cuts
        </span>
      </div>
      <div className="relative mx-auto w-full max-w-[640px]">
        <svg viewBox={species.svgViewBox} className="h-auto w-full select-none" role="img" aria-label={`${species.name} anatomical primal and sub-primal cut map`}>
          <path d={species.svgOutlinePath} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
          {cuts.map((cut) => (
            <SvgCutShape key={cut.id} cut={cut} explodeVec={primalById.get(cut.primalId)?.explodeVector ?? null} explodeFactor={props.explodeFactor} colorMode={props.colorMode} isSelected={cut.id === props.selectedCutId} isHovered={cut.id === props.hoveredCutId} isTarget={cut.id === props.targetCutId} showSlicePlane={props.showSlicePlane} sliceAngleDeg={props.sliceAngleDeg} />
          ))}
        </svg>
      </div>
      {props.showSlicePlane && selectedCut ? (
        <SvgSliceAngleBar cutName={selectedCut.name} sliceAngleDeg={props.sliceAngleDeg} onSliceAngleChange={props.onSliceAngleChange} />
      ) : null}
      <SvgCutButtonStrip speciesName={species.name} cuts={cuts} selectedCutId={props.selectedCutId} onHoverCut={props.onHoverCut} onSelectCut={props.onSelectCut} />
    </div>
  );
}
