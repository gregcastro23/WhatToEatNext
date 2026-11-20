"use client";

import { getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import type { SpeciesId } from "@/lib/butcher/types";
import { ButcherSvgStage } from "./ButcherSvgStage";
import { useButcherStageRuntime } from "./useStageRuntime";
import type { ButcherStageProps } from "./stageTypes";
import type { JSX } from "react";

/**
 * Coaxial 3D WebGL Butcher Stage adapted from Pentacles `seeker-vessel-stage.js`.
 *
 * Delegates WebGL lifecycle & pointer picking to `useStageRuntime` + `stageLoop`
 * and falls back cleanly to `ButcherSvgStage` when WebGL is unavailable.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButcherStageCanvas.tsx
 */

function StageHeaderBar({
  speciesId,
  showSlicePlane,
  motionPaused,
  onToggleMotion,
  onSwitchSvg,
}: {
  readonly speciesId: SpeciesId;
  readonly showSlicePlane: boolean;
  readonly motionPaused: boolean;
  readonly onToggleMotion: () => void;
  readonly onSwitchSvg: () => void;
}): JSX.Element {
  const species = getSpeciesSpec(speciesId);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-xs">
      <span className="text-white/75">
        <strong className="text-white">{species.name}</strong>{" "}
        <span className="text-white/45">({species.latinName})</span> · Drag or Arrow keys to orbit · Click cut to inspect
        {showSlicePlane ? " · Shift+drag or Shift+Arrows to tilt knife" : ""}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" className="bt-btn" onClick={onToggleMotion}>
          {motionPaused ? "Resume motion" : "Pause motion"}
        </button>
        <button type="button" className="bt-btn" onClick={onSwitchSvg}>
          2D Diagram
        </button>
      </div>
    </div>
  );
}

export function ButcherStageCanvas(props: ButcherStageProps): JSX.Element {
  const runtime = useButcherStageRuntime(props);

  if (!runtime.webglSupported || runtime.forceSvg) {
    return (
      <div>
        <ButcherSvgStage {...props} />
        {runtime.webglSupported ? (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="bt-btn"
              onClick={() => runtime.setForceSvg(false)}
            >
              Switch to 3D WebGL Stage
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  const species = getSpeciesSpec(props.speciesId);

  return (
    <div className="bt-stage-frame" data-stage-mode="webgl-3d" data-species={props.speciesId}>
      <StageHeaderBar
        speciesId={props.speciesId}
        showSlicePlane={props.showSlicePlane}
        motionPaused={runtime.motionPaused}
        onToggleMotion={() => runtime.setMotionPaused((prev) => !prev)}
        onSwitchSvg={() => runtime.setForceSvg(true)}
      />
      <div ref={runtime.wrapRef} className="relative h-[280px] w-full sm:h-[360px]">
        <canvas
          ref={runtime.canvasRef}
          tabIndex={0}
          className="bt-stage-canvas"
          aria-label={`Interactive 3D ${species.name} carcass stage`}
          {...runtime.pointerHandlers}
        />
      </div>
    </div>
  );
}
